from __future__ import annotations

import csv
import json
import re
import shutil
import zipfile
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path, PurePosixPath
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import Base
from app.db.models import (
    BrandProfileRecord,
    CityStoreDistributionRecord,
    FranchisePolicyRecord,
    MarketQuoteRecord,
    NewsSentimentRecord,
    RegionCompetitionRecord,
    SourceRegistryRecord,
)
from app.db.session import engine

REPO_ROOT = Path(__file__).resolve().parents[3]

REQUIRED_FILES = {
    "brand_info.csv",
    "financial_data_raw.csv",
    "franchise_policy.csv",
    "news_sentiment.csv",
    "stock_info.csv",
    "投资风险评估表.csv",
}

BRAND_MAP: dict[str, tuple[str, str]] = {
    "mixue_bingcheng": ("mixue", "蜜雪冰城"),
    "蜜雪冰城": ("mixue", "蜜雪冰城"),
    "luckin_coffee": ("luckin", "瑞幸咖啡"),
    "瑞幸咖啡": ("luckin", "瑞幸咖啡"),
    "starbucks": ("starbucks", "星巴克"),
    "星巴克": ("starbucks", "星巴克"),
    "chagee": ("chagee", "霸王茶姬"),
    "霸王茶姬": ("chagee", "霸王茶姬"),
    "naixue_tea": ("nayuki", "奈雪的茶"),
    "奈雪的茶": ("nayuki", "奈雪的茶"),
    "cotti_coffee": ("cotti", "库迪咖啡"),
    "库迪咖啡": ("cotti", "库迪咖啡"),
    "chabaidao": ("chabaidao", "茶百道"),
    "茶百道": ("chabaidao", "茶百道"),
    "guming": ("guming", "古茗"),
    "古茗": ("guming", "古茗"),
    "heytea": ("heytea", "喜茶"),
    "喜茶": ("heytea", "喜茶"),
    "tims_china": ("tims", "Tims天好咖啡"),
    "Tims天好咖啡": ("tims", "Tims天好咖啡"),
    "chayan_yuese": ("chayan_yuese", "茶颜悦色"),
    "茶颜悦色": ("chayan_yuese", "茶颜悦色"),
    "lelecha": ("lelecha", "乐乐茶"),
    "乐乐茶": ("lelecha", "乐乐茶"),
    "auntea_jenny": ("auntea_jenny", "沪上阿姨"),
    "shanghai_auntie": ("auntea_jenny", "沪上阿姨"),
    "沪上阿姨": ("auntea_jenny", "沪上阿姨"),
    "幸运咖": ("lucky_cup", "幸运咖"),
}

SENTIMENT_MAP = {
    "正面": "positive",
    "positive": "positive",
    "中性": "neutral",
    "neutral": "neutral",
    "负面": "negative",
    "negative": "negative",
}

RISK_LEVEL_MAP = {
    "高": "high",
    "中高": "medium_high",
    "较高": "medium_high",
    "中": "medium",
    "中低": "medium_low",
    "低": "low",
}

OUTPUT_FIELDS = {
    "brand_profile.csv": [
        "brand_id", "brand_name", "main_company", "category", "headquarters",
        "listed_status", "stock_code", "store_count_estimate", "price_band",
        "main_cities", "brand_positioning", "source_name", "source_url", "query_date",
    ],
    "franchise_policy.csv": [
        "brand_name", "is_franchise_available", "franchise_fee", "deposit",
        "total_investment_range", "estimated_payback_period", "area_protection_policy",
        "franchise_conditions", "source_url", "note",
    ],
    "news_sentiment.csv": [
        "brand_name", "news_title", "source_name", "publish_date", "sentiment",
        "news_type", "news_summary", "risk_signal", "news_url",
    ],
    "market_quote.csv": [
        "brand_name", "stock_code", "market", "current_price", "change_percent",
        "volume", "market_cap", "pe_ratio", "currency", "trade_date", "source_url",
    ],
    "city_store_distribution.csv": [
        "city", "brand_name", "category", "store_count_estimate", "sample_date",
        "source_name", "source_url", "note",
    ],
    "region_competition.csv": [
        "city", "target_brand", "same_category_store_count", "major_competitors",
        "competition_level", "market_heat", "opportunity_points", "risk_points",
    ],
    "financial_data_normalized.csv": [
        "brand_id", "brand_name", "stock_code", "market", "report_date", "revenue",
        "revenue_yoy", "net_profit", "net_profit_yoy", "gross_margin", "net_margin",
        "pe_ratio", "pb_ratio", "roe", "analyst_rating", "query_date", "note",
    ],
    "source_registry.csv": [
        "dataset_name", "source_name", "source_url", "collect_method",
        "update_frequency", "owner_role", "note",
    ],
}


@dataclass
class ImportReport:
    batch_id: str
    source_path: str
    dry_run: bool
    raw_directory: str | None = None
    processed_directory: str | None = None
    database_backup: str | None = None
    input_rows: dict[str, int] = field(default_factory=dict)
    output_rows: dict[str, int] = field(default_factory=dict)
    database_changes: dict[str, dict[str, int]] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _clean(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text in {"—", "-", "None", "null", "nan"} else text


def portable_path(path: Path) -> str:
    try:
        return path.resolve().relative_to(REPO_ROOT).as_posix()
    except ValueError:
        return path.name


def normalize_brand(value: str) -> tuple[str, str]:
    cleaned = _clean(value)
    if cleaned in BRAND_MAP:
        return BRAND_MAP[cleaned]
    slug = re.sub(r"[^a-z0-9]+", "_", cleaned.lower()).strip("_")
    if not slug:
        slug = f"unknown_{abs(hash(cleaned)) % 100000}"
    return slug, cleaned or "未命名品牌"


def normalize_city(value: str) -> str:
    city = _clean(value)
    for suffix in ("特别行政区", "自治州", "地区", "盟", "市"):
        if city.endswith(suffix) and len(city) > len(suffix):
            return city[: -len(suffix)]
    return city


def parse_store_count(value: str) -> tuple[int, str]:
    original = _clean(value)
    match = re.search(r"\d[\d,]*", original)
    if not match:
        return 0, original
    return int(match.group(0).replace(",", "")), original


def _bool_text(value: str) -> str:
    cleaned = _clean(value).lower()
    if cleaned.startswith("是") or cleaned in {"true", "1", "yes"}:
        return "true"
    if cleaned.startswith("否") or cleaned in {"false", "0", "no"}:
        return "false"
    return ""


def _safe_member_name(name: str) -> str:
    path = PurePosixPath(name.replace("\\", "/"))
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"ZIP 包含不安全路径：{name}")
    return path.name


def read_zip_csvs(zip_path: Path, report: ImportReport) -> dict[str, list[dict[str, str]]]:
    if not zip_path.exists():
        raise FileNotFoundError(f"找不到 ZIP：{zip_path}")
    result: dict[str, list[dict[str, str]]] = {}
    with zipfile.ZipFile(zip_path) as archive:
        entries: dict[str, zipfile.ZipInfo] = {}
        for info in archive.infolist():
            if info.is_dir():
                continue
            basename = _safe_member_name(info.filename)
            if basename in REQUIRED_FILES:
                entries[basename] = info
        missing = sorted(REQUIRED_FILES - set(entries))
        if missing:
            raise ValueError(f"ZIP 缺少必要文件：{', '.join(missing)}")
        for filename, info in entries.items():
            raw = archive.read(info)
            text = raw.decode("utf-8-sig")
            rows = list(csv.DictReader(text.splitlines()))
            result[filename] = rows
            report.input_rows[filename] = len(rows)
    return result


def read_directory_csvs(directory: Path, report: ImportReport) -> dict[str, list[dict[str, str]]]:
    if not directory.is_dir():
        raise FileNotFoundError(f"找不到原始数据目录：{directory}")
    missing = sorted(filename for filename in REQUIRED_FILES if not (directory / filename).exists())
    if missing:
        raise ValueError(f"原始数据目录缺少必要文件：{', '.join(missing)}")
    result: dict[str, list[dict[str, str]]] = {}
    for filename in REQUIRED_FILES:
        with (directory / filename).open(encoding="utf-8-sig", newline="") as file:
            rows = list(csv.DictReader(file))
        result[filename] = rows
        report.input_rows[filename] = len(rows)
    return result


def read_source_csvs(source_path: Path, report: ImportReport) -> dict[str, list[dict[str, str]]]:
    if source_path.is_dir():
        return read_directory_csvs(source_path, report)
    if source_path.suffix.lower() == ".zip":
        return read_zip_csvs(source_path, report)
    raise ValueError("数据源必须是 data.zip 或包含六张 CSV 的目录")


def archive_raw(source_path: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    if source_path.is_dir():
        for filename in REQUIRED_FILES:
            source_file = (source_path / filename).resolve()
            target_file = (destination / filename).resolve()
            if source_file != target_file:
                shutil.copy2(source_file, target_file)
        return
    with zipfile.ZipFile(source_path) as archive:
        for info in archive.infolist():
            if not info.is_dir():
                basename = _safe_member_name(info.filename)
                if basename in REQUIRED_FILES:
                    (destination / basename).write_bytes(archive.read(info))


def transform(rows: dict[str, list[dict[str, str]]], report: ImportReport) -> dict[str, list[dict[str, Any]]]:
    output: dict[str, list[dict[str, Any]]] = defaultdict(list)
    categories: dict[str, str] = {}
    brand_seen: set[str] = set()

    for row in rows["brand_info.csv"]:
        brand_id, brand_name = normalize_brand(row.get("brand_name", ""))
        if brand_id in brand_seen:
            report.warnings.append(f"品牌标识重复并已合并：{row.get('brand_name')} -> {brand_name} ({brand_id})")
            continue
        brand_seen.add(brand_id)
        categories[brand_name] = _clean(row.get("category")) or "未知"
        main_cities = _clean(row.get("main_cities"))
        if main_cities == "全国":
            main_cities = ""
        positioning_parts = []
        if _clean(row.get("founded_year")):
            positioning_parts.append(f"成立年份：{_clean(row.get('founded_year'))}")
        if _clean(row.get("official_website")):
            positioning_parts.append(f"官网：{_clean(row.get('official_website'))}")
        output["brand_profile.csv"].append({
            "brand_id": brand_id,
            "brand_name": brand_name,
            "main_company": "",
            "category": categories[brand_name],
            "headquarters": _clean(row.get("headquarters")),
            "listed_status": _clean(row.get("listed_status")) or "未知",
            "stock_code": _clean(row.get("stock_code")),
            "store_count_estimate": parse_store_count(row.get("store_count", ""))[0],
            "price_band": _clean(row.get("price_range")),
            "main_cities": main_cities,
            "brand_positioning": "；".join(positioning_parts),
            "source_name": "队友采集数据",
            "source_url": _clean(row.get("source_url")),
            "query_date": _clean(row.get("query_date")),
        })

    for row in rows["franchise_policy.csv"]:
        _, brand_name = normalize_brand(row.get("brand_name", ""))
        detail_parts = []
        for label, field_name in (("装修费", "renovation_fee"), ("设备费", "equipment_fee")):
            if _clean(row.get(field_name)):
                detail_parts.append(f"{label}：{_clean(row.get(field_name))}")
        note = "；".join(filter(None, [
            f"数据来源：{_clean(row.get('data_source'))}" if _clean(row.get("data_source")) else "",
            f"查询日期：{_clean(row.get('query_date'))}" if _clean(row.get("query_date")) else "",
            "第三方采集数据，关键费用和政策须向品牌官方核验",
        ]))
        output["franchise_policy.csv"].append({
            "brand_name": brand_name,
            "is_franchise_available": _bool_text(row.get("franchise_available", "")),
            "franchise_fee": _clean(row.get("franchise_fee")),
            "deposit": _clean(row.get("deposit")),
            "total_investment_range": _clean(row.get("total_investment_range")),
            "estimated_payback_period": _clean(row.get("payback_period")),
            "area_protection_policy": _clean(row.get("territorial_protection")),
            "franchise_conditions": "；".join(detail_parts),
            "source_url": _clean(row.get("source_url")),
            "note": note,
        })

    for row in rows["news_sentiment.csv"]:
        _, brand_name = normalize_brand(row.get("brand_name", ""))
        keywords = _clean(row.get("keywords"))
        summary = _clean(row.get("summary"))
        if keywords:
            summary = f"{summary}；关键词：{keywords}" if summary else f"关键词：{keywords}"
        output["news_sentiment.csv"].append({
            "brand_name": brand_name,
            "news_title": _clean(row.get("news_title")) or "未命名新闻",
            "source_name": _clean(row.get("source")),
            "publish_date": _clean(row.get("publish_time")),
            "sentiment": SENTIMENT_MAP.get(_clean(row.get("sentiment")), "neutral"),
            "news_type": _clean(row.get("news_type")),
            "news_summary": summary,
            "risk_signal": _clean(row.get("risk_hint")),
            "news_url": _clean(row.get("news_url")),
        })

    for row in rows["stock_info.csv"]:
        _, brand_name = normalize_brand(row.get("brand_name", ""))
        market = _clean(row.get("market"))
        output["market_quote.csv"].append({
            "brand_name": brand_name,
            "stock_code": _clean(row.get("stock_code")),
            "market": market,
            "current_price": _clean(row.get("current_price")),
            "change_percent": _clean(row.get("price_change_pct")),
            "volume": _clean(row.get("volume")),
            "market_cap": _clean(row.get("market_cap")),
            "pe_ratio": _clean(row.get("pe_ratio")),
            "currency": "HKD" if market == "HK" else "USD" if market == "US" else "",
            "trade_date": _clean(row.get("trade_date")),
            "source_url": _clean(row.get("source_url")),
        })

    for row in rows["financial_data_raw.csv"]:
        brand_id, brand_name = normalize_brand(row.get("brand_name", ""))
        normalized = {key: _clean(value) for key, value in row.items()}
        normalized.update({
            "brand_id": brand_id,
            "brand_name": brand_name,
            "note": "仅作为品牌经营能力辅助资料；原始数据未统一币种和金额单位，不参与加盟风险规则评分",
        })
        output["financial_data_normalized.csv"].append(normalized)

    city_rows: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows["投资风险评估表.csv"]:
        city_rows[normalize_city(row.get("城市", ""))].append(row)

    for city, items in city_rows.items():
        parsed: list[dict[str, Any]] = []
        for row in items:
            _, brand_name = normalize_brand(row.get("品牌", ""))
            count, original_count = parse_store_count(row.get("门店数量", ""))
            category = categories.get(brand_name, "未知")
            parsed.append({"row": row, "brand_name": brand_name, "count": count, "original": original_count, "category": category})
            note = (
                f"原始门店数量：{original_count or '未知'}；平均评分：{_clean(row.get('平均评分')) or '未知'}；"
                f"第三方综合风险评级：{_clean(row.get('综合风险评级')) or '未知'}；"
                f"第三方建议：{_clean(row.get('投资建议')) or '无'}。门店数按区间下限导入，须通过地图或官方数据核验。"
            )
            output["city_store_distribution.csv"].append({
                "city": city,
                "brand_name": brand_name,
                "category": category,
                "store_count_estimate": count,
                "sample_date": report.batch_id,
                "source_name": "队友城市品牌风险样本",
                "source_url": "",
                "note": note,
            })

        for item in parsed:
            competitors = [candidate for candidate in parsed if candidate["brand_name"] != item["brand_name"]]
            same_category = [candidate for candidate in competitors if candidate["category"] == item["category"]]
            if not same_category:
                same_category = competitors
            risk_label = _clean(item["row"].get("综合风险评级"))
            competition = RISK_LEVEL_MAP.get(risk_label, "unknown")
            output["region_competition.csv"].append({
                "city": city,
                "target_brand": item["brand_name"],
                "same_category_store_count": sum(candidate["count"] for candidate in same_category),
                "major_competitors": ";".join(candidate["brand_name"] for candidate in sorted(same_category, key=lambda x: x["count"], reverse=True)[:5]),
                "competition_level": competition,
                "market_heat": "high" if competition in {"high", "medium_high"} else "medium",
                "opportunity_points": "第三方城市样本可用于初步比较，仍需补充商圈租金、客流和外卖销量。",
                "risk_points": (
                    f"第三方样本评级：{risk_label or '未知'}；原始建议：{_clean(item['row'].get('投资建议')) or '无'}。"
                    "该内容是辅助信号，不直接作为最终规则分数。"
                ),
            })

    source_rows = [
        ("brand_profile", "队友品牌基础信息", "brand_info.csv"),
        ("franchise_policy", "队友加盟政策", "franchise_policy.csv"),
        ("news_sentiment", "队友新闻舆情", "news_sentiment.csv"),
        ("market_quote", "队友股票行情", "stock_info.csv"),
        ("financial_data", "队友财务数据", "financial_data_raw.csv"),
        ("city_risk_sample", "队友城市品牌风险样本", "投资风险评估表.csv"),
    ]
    for dataset, source_name, filename in source_rows:
        output["source_registry.csv"].append({
            "dataset_name": dataset,
            "source_name": source_name,
            "source_url": "",
            "collect_method": "队友采集 CSV，经标准化脚本转换",
            "update_frequency": "按批次",
            "owner_role": "数据采集组 / 后端组",
            "note": f"原始文件：{filename}；批次：{report.batch_id}；关键数据须核验来源。",
        })

    for filename, transformed_rows in output.items():
        report.output_rows[filename] = len(transformed_rows)
    return dict(output)


def write_outputs(output: dict[str, list[dict[str, Any]]], destination: Path, report: ImportReport) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    for filename, fields in OUTPUT_FIELDS.items():
        path = destination / filename
        with path.open("w", encoding="utf-8-sig", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fields, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(output.get(filename, []))
    report.processed_directory = portable_path(destination)


def _backup_sqlite(batch_id: str) -> Path | None:
    if not settings.database_url.startswith("sqlite:///"):
        return None
    raw_path = settings.database_url.removeprefix("sqlite:///")
    db_path = Path(raw_path)
    if not db_path.is_absolute():
        db_path = (Path.cwd() / db_path).resolve()
    if not db_path.exists():
        return None
    backup_dir = REPO_ROOT / "data" / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    target = backup_dir / f"{db_path.stem}_before_team_import_{batch_id}_{timestamp}{db_path.suffix}"
    shutil.copy2(db_path, target)
    return target


def _set_fields(record: Any, values: dict[str, Any], fields: list[str]) -> None:
    for name in fields:
        value = values.get(name)
        if value not in (None, ""):
            setattr(record, name, value)


def apply_to_database(output: dict[str, list[dict[str, Any]]], session: Session, report: ImportReport) -> None:
    Base.metadata.create_all(bind=engine)
    backup = _backup_sqlite(report.batch_id)
    report.database_backup = portable_path(backup) if backup else None
    changes: dict[str, dict[str, int]] = defaultdict(lambda: {"inserted": 0, "updated": 0, "skipped": 0})

    try:
        for row in output["brand_profile.csv"]:
            record = session.get(BrandProfileRecord, row["brand_id"])
            created = record is None
            if record is None:
                record = BrandProfileRecord(brand_id=row["brand_id"], brand_name=row["brand_name"], category=row["category"], listed_status=row["listed_status"])
                session.add(record)
            _set_fields(record, row, [
                "brand_name", "main_company", "category", "headquarters", "listed_status",
                "stock_code", "store_count_estimate", "price_band", "brand_positioning",
                "source_name", "source_url", "query_date",
            ])
            cities = [item.strip() for item in _clean(row.get("main_cities")).replace(",", ";").split(";") if item.strip()]
            if cities:
                record.main_cities = cities
            changes["brand_profiles"]["inserted" if created else "updated"] += 1

        for row in output["franchise_policy.csv"]:
            record = session.query(FranchisePolicyRecord).filter_by(brand_name=row["brand_name"]).one_or_none()
            created = record is None
            if record is None:
                record = FranchisePolicyRecord(brand_name=row["brand_name"])
                session.add(record)
            bool_value = row.get("is_franchise_available")
            if bool_value:
                record.is_franchise_available = bool_value == "true"
            _set_fields(record, row, [
                "franchise_fee", "deposit", "total_investment_range", "estimated_payback_period",
                "area_protection_policy", "franchise_conditions", "source_url", "note",
            ])
            changes["franchise_policies"]["inserted" if created else "updated"] += 1

        for row in output["news_sentiment.csv"]:
            record = session.query(NewsSentimentRecord).filter_by(
                brand_name=row["brand_name"], news_title=row["news_title"], publish_date=row["publish_date"]
            ).one_or_none()
            if record:
                changes["news_sentiments"]["skipped"] += 1
                continue
            session.add(NewsSentimentRecord(**row))
            changes["news_sentiments"]["inserted"] += 1

        for row in output["market_quote.csv"]:
            record = session.query(MarketQuoteRecord).filter_by(
                brand_name=row["brand_name"], stock_code=row["stock_code"], trade_date=row["trade_date"]
            ).one_or_none()
            if record:
                _set_fields(record, row, list(row))
                changes["market_quotes"]["updated"] += 1
            else:
                session.add(MarketQuoteRecord(**row))
                changes["market_quotes"]["inserted"] += 1

        for row in output["city_store_distribution.csv"]:
            record = session.query(CityStoreDistributionRecord).filter_by(
                city=row["city"], brand_name=row["brand_name"], sample_date=row["sample_date"]
            ).one_or_none()
            if record:
                _set_fields(record, row, list(row))
                changes["city_store_distributions"]["updated"] += 1
            else:
                session.add(CityStoreDistributionRecord(**row))
                changes["city_store_distributions"]["inserted"] += 1

        for row in output["region_competition.csv"]:
            record = session.query(RegionCompetitionRecord).filter_by(
                city=row["city"], target_brand=row["target_brand"]
            ).one_or_none()
            competitors = [item for item in row["major_competitors"].split(";") if item]
            values = {**row, "major_competitors": competitors}
            if record:
                _set_fields(record, values, list(values))
                changes["region_competitions"]["updated"] += 1
            else:
                session.add(RegionCompetitionRecord(**values))
                changes["region_competitions"]["inserted"] += 1

        for row in output["source_registry.csv"]:
            record = session.query(SourceRegistryRecord).filter_by(
                dataset_name=row["dataset_name"], source_name=row["source_name"]
            ).one_or_none()
            if record:
                _set_fields(record, row, list(row))
                changes["source_registry"]["updated"] += 1
            else:
                session.add(SourceRegistryRecord(**row))
                changes["source_registry"]["inserted"] += 1

        session.commit()
    except Exception:
        session.rollback()
        raise
    report.database_changes = dict(changes)


def write_report(report: ImportReport, destination: Path) -> Path:
    destination.mkdir(parents=True, exist_ok=True)
    filename = "import_report_dry_run.json" if report.dry_run else "import_report_apply.json"
    path = destination / filename
    path.write_text(json.dumps(report.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8")
    return path
