from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

from app.models.brand_intel import (
    BrandAIAnalysis,
    BrandAnalysisRequest,
    BrandIntelItem,
    BrandIntelSummary,
    BrandMetric,
    FranchisePolicy,
    MarketQuote,
    NewsSignal,
    RegionBrandCard,
    RegionCompetitionSignal,
    RegionIntel,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = REPO_ROOT / "data" / "collected"
CACHE_DIR = REPO_ROOT / "backend" / ".runtime_cache"
CACHE_PATH = CACHE_DIR / "ai_analysis_cache.json"


def _read_csv(name: str) -> list[dict[str, str]]:
    path = DATA_DIR / name
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        return [dict(row) for row in csv.DictReader(file)]


def _blank_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned or cleaned.lower() in {"null", "none", "nan"} or cleaned == "未知":
        return None
    return cleaned


def _to_float(value: str | None, default: float = 0.0) -> float:
    cleaned = _blank_to_none(value)
    if not cleaned:
        return default
    try:
        return float(cleaned.replace("%", "").replace(",", ""))
    except ValueError:
        return default


def _to_int(value: str | None, default: int = 0) -> int:
    return int(round(_to_float(value, float(default))))


def _split(value: str | None) -> list[str]:
    cleaned = _blank_to_none(value)
    if not cleaned:
        return []
    return [item.strip() for item in cleaned.replace(",", ";").split(";") if item.strip()]


def _level_score(level: str | None) -> float:
    mapping = {
        "low": 10,
        "medium": 22,
        "medium_high": 34,
        "high": 44,
        "低": 10,
        "中": 22,
        "中高": 34,
        "高": 44,
    }
    return mapping.get((level or "").strip(), 18)


def _risk_level(score: float) -> str:
    if score >= 58:
        return "较高风险"
    if score >= 45:
        return "中风险"
    return "中低风险"


def _sentiment_label(news_rows: list[dict[str, str]]) -> str:
    counts = Counter((row.get("sentiment") or "neutral").strip() for row in news_rows)
    if counts["negative"] >= 2:
        return "波动"
    if counts["positive"] > counts["negative"]:
        return "偏正面"
    return "中性"


def _investment_score(brand_row: dict[str, str], quote_row: dict[str, str] | None, news_rows: list[dict[str, str]]) -> float:
    score = 32.0
    listed_status = brand_row.get("listed_status") or ""
    if "未上市" in listed_status:
        score += 16
    change = _to_float((quote_row or {}).get("change_percent"))
    if change < 0:
        score += min(abs(change) * 4, 18)
    else:
        score += min(abs(change) * 1.4, 8)
    score += sum(1 for item in news_rows if item.get("sentiment") == "negative") * 7
    if _to_int(brand_row.get("store_count_estimate")) > 15000:
        score += 5
    return round(min(score, 92), 2)


def _franchise_score(
    brand_row: dict[str, str],
    policy_row: dict[str, str] | None,
    competition_rows: list[dict[str, str]],
) -> float:
    score = 34.0
    if (policy_row or {}).get("is_franchise_available") == "false":
        score += 22
    if "第三方" in ((policy_row or {}).get("note") or ""):
        score += 6
    score += max([_level_score(row.get("competition_level")) for row in competition_rows] or [18])
    store_count = _to_int(brand_row.get("store_count_estimate"))
    if store_count > 25000:
        score += 10
    elif store_count > 10000:
        score += 6
    return round(min(score, 95), 2)


def _quote_model(row: dict[str, str] | None) -> MarketQuote | None:
    if not row:
        return None
    return MarketQuote(
        stock_code=_blank_to_none(row.get("stock_code")),
        market=_blank_to_none(row.get("market")),
        current_price=_blank_to_none(row.get("current_price")),
        change_percent=_blank_to_none(row.get("change_percent")),
        volume=_blank_to_none(row.get("volume")),
        market_cap=_blank_to_none(row.get("market_cap")),
        pe_ratio=_blank_to_none(row.get("pe_ratio")),
        currency=_blank_to_none(row.get("currency")),
        trade_date=_blank_to_none(row.get("trade_date")),
        source_url=_blank_to_none(row.get("source_url")),
    )


def _news_models(rows: list[dict[str, str]]) -> list[NewsSignal]:
    return [
        NewsSignal(
            title=row.get("news_title") or "未命名新闻",
            source_name=row.get("source_name") or "未知来源",
            publish_date=row.get("publish_date") or "",
            sentiment=row.get("sentiment") or "neutral",
            news_type=row.get("news_type") or "other",
            summary=row.get("news_summary") or "",
            risk_signal=row.get("risk_signal") or "",
            news_url=_blank_to_none(row.get("news_url")),
        )
        for row in rows
    ]


def _policy_model(row: dict[str, str] | None) -> FranchisePolicy | None:
    if not row:
        return None
    available = row.get("is_franchise_available")
    return FranchisePolicy(
        is_franchise_available=None if available is None else available.lower() == "true",
        franchise_fee=_blank_to_none(row.get("franchise_fee")),
        deposit=_blank_to_none(row.get("deposit")),
        total_investment_range=_blank_to_none(row.get("total_investment_range")),
        estimated_payback_period=_blank_to_none(row.get("estimated_payback_period")),
        area_protection_policy=_blank_to_none(row.get("area_protection_policy")),
        franchise_conditions=_blank_to_none(row.get("franchise_conditions")),
        source_url=_blank_to_none(row.get("source_url")),
        note=_blank_to_none(row.get("note")),
    )


def _competition_models(rows: list[dict[str, str]]) -> list[RegionCompetitionSignal]:
    return [
        RegionCompetitionSignal(
            city=row.get("city") or "",
            target_brand=row.get("target_brand") or "",
            same_category_store_count=_to_int(row.get("same_category_store_count")) or None,
            major_competitors=_split(row.get("major_competitors")),
            competition_level=_blank_to_none(row.get("competition_level")),
            market_heat=_blank_to_none(row.get("market_heat")),
            opportunity_points=_blank_to_none(row.get("opportunity_points")),
            risk_points=_blank_to_none(row.get("risk_points")),
        )
        for row in rows
    ]


def _risk_tags(brand_row: dict[str, str], news_rows: list[dict[str, str]], competition_rows: list[dict[str, str]]) -> list[str]:
    tags: list[str] = []
    if _to_int(brand_row.get("store_count_estimate")) > 10000:
        tags.append("门店规模大")
    if any(row.get("news_type") == "price_war" for row in news_rows):
        tags.append("价格竞争")
    if any(row.get("sentiment") == "negative" for row in news_rows):
        tags.append("舆情波动")
    if any((row.get("competition_level") or "").lower() in {"high", "中高", "高"} for row in competition_rows):
        tags.append("地区竞争强")
    if not tags:
        tags.append("样本待补充")
    return tags[:4]


def _build_brand_item(
    row: dict[str, str],
    quote: dict[str, str] | None,
    news_rows: list[dict[str, str]],
    policy: dict[str, str] | None,
    competition_rows: list[dict[str, str]],
) -> BrandIntelItem:
    investment_score = _investment_score(row, quote, news_rows)
    franchise_score = _franchise_score(row, policy, competition_rows)
    risk_level = _risk_level(max(investment_score, franchise_score))
    sentiment = _sentiment_label(news_rows)
    brand_name = row.get("brand_name") or "未知品牌"
    category = row.get("category") or "未知品类"
    key_cities = _split(row.get("main_cities"))
    store_count = _to_int(row.get("store_count_estimate"))

    return BrandIntelItem(
        brand_id=row.get("brand_id") or brand_name,
        brand_name=brand_name,
        stock_name=_blank_to_none(row.get("main_company")),
        stock_code=_blank_to_none(row.get("stock_code")),
        category=category,
        headquarters=row.get("headquarters") or "未知",
        listed_status=row.get("listed_status") or "未知",
        key_cities=key_cities,
        store_count=store_count,
        price_band=row.get("price_band") or "未知",
        sentiment_level=sentiment,
        investment_risk_score=investment_score,
        franchise_risk_score=franchise_score,
        risk_level=risk_level,
        growth_signal=f"{brand_name}当前门店规模约 {store_count} 家，定位为{row.get('brand_positioning') or category}，后续需结合真实门店增长和财报数据持续跟踪。",
        market_signal=f"投资侧重点关注 {brand_name} 的行情波动、新闻舆情、门店扩张和行业价格竞争。",
        franchise_signal=f"加盟侧重点核实 {brand_name} 在目标城市的门店密度、竞品数量、加盟费用和区域保护政策。",
        risk_tags=_risk_tags(row, news_rows, competition_rows),
        metrics=[
            BrandMetric(label="新闻样本", value=str(len(news_rows)), hint="SENTIMENT"),
            BrandMetric(label="覆盖城市", value=str(len(key_cities)), hint="REGION"),
            BrandMetric(label="门店规模", value=f"{store_count // 10000}万+" if store_count >= 10000 else str(store_count), hint="STORE"),
        ],
        quote=_quote_model(quote),
        news=_news_models(news_rows[:5]),
        franchise_policy=_policy_model(policy),
        region_competition=_competition_models(competition_rows),
        follow_up_data=[
            "补充近 30-90 天真实行情数据",
            "补充品牌近 6 个月新闻舆情",
            "核实目标城市门店与竞品数量",
            "核实加盟费用、保证金、装修费和回本周期",
        ],
    )


def _load_brand_items() -> list[BrandIntelItem]:
    brand_rows = _read_csv("brand_profile.csv")
    quote_rows = {row.get("brand_name"): row for row in _read_csv("market_quote.csv")}
    news_by_brand: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in _read_csv("news_sentiment.csv"):
        news_by_brand[row.get("brand_name")].append(row)
    policy_rows = {row.get("brand_name"): row for row in _read_csv("franchise_policy.csv")}
    competition_by_brand: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in _read_csv("region_competition.csv"):
        competition_by_brand[row.get("target_brand")].append(row)

    return [
        _build_brand_item(
            row,
            quote_rows.get(row.get("brand_name")),
            news_by_brand.get(row.get("brand_name"), []),
            policy_rows.get(row.get("brand_name")),
            competition_by_brand.get(row.get("brand_name"), []),
        )
        for row in brand_rows
    ]


def list_brand_intel(
    keyword: str | None = None,
    city: str | None = None,
    risk_level: str | None = None,
    category: str | None = None,
    scenario: str | None = None,
) -> list[BrandIntelItem]:
    keyword_normalized = (keyword or "").strip().lower()
    results = _load_brand_items()
    if keyword_normalized:
        results = [
            item
            for item in results
            if keyword_normalized
            in " ".join(
                [
                    item.brand_name,
                    item.category,
                    item.headquarters,
                    item.stock_name or "",
                    item.stock_code or "",
                    item.listed_status,
                    *item.key_cities,
                    *item.risk_tags,
                ]
            ).lower()
        ]
    if city:
        results = [item for item in results if city in item.key_cities]
    if risk_level:
        results = [item for item in results if item.risk_level == risk_level]
    if category:
        results = [item for item in results if item.category == category]
    if scenario == "investment":
        return sorted(results, key=lambda item: item.investment_risk_score, reverse=True)
    if scenario == "franchise":
        return sorted(results, key=lambda item: item.franchise_risk_score, reverse=True)
    return sorted(results, key=lambda item: max(item.investment_risk_score, item.franchise_risk_score), reverse=True)


def get_brand_intel(brand_id: str) -> BrandIntelItem:
    for item in _load_brand_items():
        if item.brand_id == brand_id:
            return item
    raise KeyError(brand_id)


def get_brand_summary() -> BrandIntelSummary:
    brands = _load_brand_items()
    risk_distribution = Counter(item.risk_level for item in brands)
    city_count = len({city for item in brands for city in item.key_cities})
    listed_count = sum(
        "未上市" not in item.listed_status and ("上市" in item.listed_status or "市场" in item.listed_status)
        for item in brands
    )
    news_count = sum(len(item.news) for item in brands)
    return BrandIntelSummary(
        brand_count=len(brands),
        listed_brand_count=listed_count,
        city_count=city_count,
        news_count=news_count,
        average_investment_risk=round(sum(item.investment_risk_score for item in brands) / max(len(brands), 1), 2),
        average_franchise_risk=round(sum(item.franchise_risk_score for item in brands) / max(len(brands), 1), 2),
        risk_distribution=dict(risk_distribution),
        top_attention_brands=sorted(brands, key=lambda item: max(item.investment_risk_score, item.franchise_risk_score), reverse=True)[:4],
    )


def get_region_intel(city: str | None = None) -> RegionIntel:
    store_rows = [row for row in _read_csv("city_store_distribution.csv") if not city or row.get("city") == city]
    competition_rows = [row for row in _read_csv("region_competition.csv") if not city or row.get("city") == city]
    if not store_rows and city:
        return get_region_intel(None)

    selected_city = city or (store_rows[0].get("city") if store_rows else "杭州")
    total_stores = sum(_to_int(row.get("store_count_estimate")) for row in store_rows)
    competition_level = "high" if any((row.get("competition_level") or "").lower() == "high" for row in competition_rows) else "medium_high"
    market_heat = "high" if total_stores >= 2000 else "medium_high"
    competitors = sorted({name for row in competition_rows for name in _split(row.get("major_competitors"))})
    brand_cards = [
        RegionBrandCard(
            brand_name=row.get("brand_name") or "",
            store_count=_to_int(row.get("store_count_estimate")),
            competition_pressure="高" if total_stores >= 2000 else "中高",
            franchise_fit="谨慎评估门店密度" if total_stores >= 2000 else "可关注差异化点位",
        )
        for row in sorted(store_rows, key=lambda item: _to_int(item.get("store_count_estimate")), reverse=True)[:3]
    ]
    risk_score = min(35 + total_stores / 80 + _level_score(competition_level), 92)

    return RegionIntel(
        city=selected_city,
        market_heat="高活跃" if market_heat == "high" else "中高活跃",
        competition_level="高竞争" if competition_level == "high" else "中高竞争",
        consumer_profile=f"{selected_city}茶饮咖啡样本门店密度较高，适合结合办公区、社区和商圈客流进一步评估。",
        store_density_index=round(min(total_stores / 35, 100), 2),
        franchise_risk_score=round(risk_score, 2),
        key_competitors=competitors[:6],
        brand_cards=brand_cards,
        opportunity_points=list({row.get("opportunity_points") for row in competition_rows if row.get("opportunity_points")})[:4],
        risk_points=list({row.get("risk_points") for row in competition_rows if row.get("risk_points")})[:4],
        follow_up_data=["目标商圈租金", "竞品门店距离", "外卖平台销量", "加盟费用明细", "工作日与周末客流"],
    )


def _cache_key(payload: BrandAnalysisRequest) -> str:
    raw = f"{payload.brand_id}|{payload.city or ''}|{payload.scenario}|{date.today().isoformat()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:20]


def _read_cache() -> dict[str, dict]:
    if not CACHE_PATH.exists():
        return {}
    try:
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _write_cache(cache: dict[str, dict]) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def _build_ai_analysis_uncached(payload: BrandAnalysisRequest) -> BrandAIAnalysis:
    brand = get_brand_intel(payload.brand_id)
    region = get_region_intel(payload.city or (brand.key_cities[0] if brand.key_cities else None))
    quote_hint = f"当前行情涨跌幅为 {brand.quote.change_percent}%" if brand.quote and brand.quote.change_percent else "当前缺少可用行情数据"
    policy_hint = (
        f"公开资料显示总投资区间为 {brand.franchise_policy.total_investment_range or '未知'}"
        if brand.franchise_policy
        else "加盟政策数据仍需补充"
    )
    return BrandAIAnalysis(
        source="local_rules",
        summary=f"{brand.brand_name}当前为{brand.risk_level}，适合从投资风险和加盟风险两个角度综合观察。",
        investment_view=(
            f"{brand.brand_name}投资风险指数为 {brand.investment_risk_score:.2f}。{quote_hint}，"
            "建议结合财报、成交量、新闻舆情和行业价格竞争继续跟踪，不输出确定性买卖结论。"
        ),
        franchise_view=(
            f"{region.city}地区加盟风险指数为 {region.franchise_risk_score:.2f}，"
            f"市场热度为{region.market_heat}、竞争水平为{region.competition_level}。{policy_hint}，加盟前需核实商圈点位和区域保护。"
        ),
        risk_points=[*brand.risk_tags, *region.risk_points][:5],
        action_suggestions=[
            "股民侧优先查看行情波动、财报表现和负面新闻。",
            "加盟侧优先比较目标城市门店密度、竞品数量、租金和回本周期。",
            "TS 后续补充真实数据后，应重新计算评分并更新报告。",
            "系统输出用于风险提示，不作为确定性投资或加盟承诺。",
        ],
        follow_up_data=brand.follow_up_data,
        token_saving_note="该接口采用手动触发与缓存机制，同一品牌、城市、场景和日期优先读取缓存，减少 DeepSeek 重复调用。",
    )


def build_ai_analysis(payload: BrandAnalysisRequest) -> BrandAIAnalysis:
    key = _cache_key(payload)
    cache = _read_cache()
    if key in cache:
        return BrandAIAnalysis(**cache[key], cache_hit=True)
    result = _build_ai_analysis_uncached(payload)
    cache[key] = result.model_dump(exclude={"cache_hit"})
    _write_cache(cache)
    return result


def build_report_markdown(brand_id: str, city: str | None = None) -> str:
    brand = get_brand_intel(brand_id)
    region = get_region_intel(city or (brand.key_cities[0] if brand.key_cities else None))
    analysis = build_ai_analysis(BrandAnalysisRequest(brand_id=brand_id, city=region.city))
    news = "\n".join(f"- {item.publish_date}｜{item.title}｜{item.risk_signal}" for item in brand.news[:5]) or "- 暂无新闻样本"
    risk_points = "\n".join(f"- {item}" for item in analysis.risk_points)
    suggestions = "\n".join(f"- {item}" for item in analysis.action_suggestions)
    follow_up = "\n".join(f"- {item}" for item in analysis.follow_up_data)
    return f"""# {brand.brand_name}品牌投资与加盟风险分析报告

## 一、品牌概况

- 品类：{brand.category}
- 上市状态：{brand.listed_status}
- 关联标的：{brand.stock_name or "暂无"} {brand.stock_code or ""}
- 门店规模：约 {brand.store_count} 家
- 价格带：{brand.price_band}
- 风险等级：{brand.risk_level}

## 二、投资风险

投资风险指数：{brand.investment_risk_score:.2f}

{analysis.investment_view}

## 三、地区加盟风险

目标城市：{region.city}

加盟风险指数：{region.franchise_risk_score:.2f}

{analysis.franchise_view}

## 四、新闻舆情样本

{news}

## 五、主要风险点

{risk_points}

## 六、行动建议

{suggestions}

## 七、后续需要补充的数据

{follow_up}

> 说明：本报告用于课程项目演示和辅助分析，不构成确定性投资建议或加盟承诺。
"""
