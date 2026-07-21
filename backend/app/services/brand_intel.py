from __future__ import annotations

from collections import Counter

from app.models.brand_intel import (
    BrandAIAnalysis,
    BrandAnalysisRequest,
    BrandIntelItem,
    BrandIntelSummary,
    BrandMetric,
    RegionBrandCard,
    RegionIntel,
)


BRAND_SAMPLES: list[BrandIntelItem] = [
    BrandIntelItem(
        brand_id="luckin",
        brand_name="瑞幸咖啡",
        stock_name="Luckin Coffee",
        stock_code="LKNCY",
        category="咖啡",
        headquarters="厦门",
        listed_status="美股粉单市场",
        key_cities=["上海", "北京", "杭州", "广州", "成都"],
        store_count=20500,
        price_band="12-28 元",
        sentiment_level="偏正面",
        investment_risk_score=37.62,
        franchise_risk_score=41.8,
        risk_level="中低风险",
        growth_signal="门店规模领先，数字化运营能力强，适合持续跟踪行业景气度和单店效率。",
        market_signal="核心城市竞争激烈，但品牌认知度和价格带优势明显。",
        franchise_signal="联营与合作模式较成熟，加盟前仍需核实区域保护、选址和成本回收周期。",
        risk_tags=["高速扩张", "价格竞争", "咖啡刚需化"],
        metrics=[
            BrandMetric(label="近端热度", value="86", hint="NEWS + STORE"),
            BrandMetric(label="舆情倾向", value="偏正面", hint="PUBLIC SENTIMENT"),
            BrandMetric(label="加盟关注", value="较高", hint="FRANCHISE"),
        ],
    ),
    BrandIntelItem(
        brand_id="mixue",
        brand_name="蜜雪冰城",
        stock_name="蜜雪集团",
        stock_code="02097.HK",
        category="茶饮",
        headquarters="郑州",
        listed_status="港股上市",
        key_cities=["郑州", "广州", "成都", "武汉", "杭州"],
        store_count=36000,
        price_band="4-12 元",
        sentiment_level="中性偏正面",
        investment_risk_score=45.2,
        franchise_risk_score=52.6,
        risk_level="中风险",
        growth_signal="下沉市场覆盖强，供应链规模优势明显，需关注门店密度和同质化竞争。",
        market_signal="低价茶饮需求稳定，但区域饱和度上升。",
        franchise_signal="加盟体系成熟，风险主要来自商圈重叠、利润空间和门店密度。",
        risk_tags=["门店密度高", "低价竞争", "供应链优势"],
        metrics=[
            BrandMetric(label="近端热度", value="91", hint="NEWS + STORE"),
            BrandMetric(label="舆情倾向", value="中性", hint="PUBLIC SENTIMENT"),
            BrandMetric(label="加盟关注", value="高", hint="FRANCHISE"),
        ],
    ),
    BrandIntelItem(
        brand_id="starbucks",
        brand_name="星巴克",
        stock_name="Starbucks",
        stock_code="SBUX",
        category="咖啡",
        headquarters="西雅图",
        listed_status="美股上市",
        key_cities=["上海", "北京", "深圳", "广州", "杭州"],
        store_count=7300,
        price_band="28-45 元",
        sentiment_level="稳定",
        investment_risk_score=42.4,
        franchise_risk_score=39.5,
        risk_level="中低风险",
        growth_signal="品牌心智稳定，但中国市场增长承压，需关注同价位竞争和消费分层。",
        market_signal="高线城市品牌力强，低线城市价格敏感度较高。",
        franchise_signal="中国市场直营为主，普通加盟机会有限，更适合作为竞品参考。",
        risk_tags=["高端定位", "增长放缓", "强品牌"],
        metrics=[
            BrandMetric(label="近端热度", value="78", hint="NEWS + STORE"),
            BrandMetric(label="舆情倾向", value="稳定", hint="PUBLIC SENTIMENT"),
            BrandMetric(label="加盟关注", value="低", hint="FRANCHISE"),
        ],
    ),
    BrandIntelItem(
        brand_id="chagee",
        brand_name="霸王茶姬",
        stock_name="CHAGEE",
        stock_code="CHA",
        category="茶饮",
        headquarters="昆明",
        listed_status="美股上市",
        key_cities=["上海", "杭州", "成都", "深圳", "广州"],
        store_count=6400,
        price_band="15-28 元",
        sentiment_level="高热度",
        investment_risk_score=51.8,
        franchise_risk_score=48.7,
        risk_level="中风险",
        growth_signal="品牌增长快，东方茶饮定位清晰，需关注上市后业绩兑现和舆情波动。",
        market_signal="新中式茶饮热度高，核心商圈竞争同步加剧。",
        franchise_signal="扩张速度快，加盟前要重点核实城市容量、选址质量和品牌政策。",
        risk_tags=["高速增长", "舆情敏感", "新中式茶饮"],
        metrics=[
            BrandMetric(label="近端热度", value="94", hint="NEWS + STORE"),
            BrandMetric(label="舆情倾向", value="高热度", hint="PUBLIC SENTIMENT"),
            BrandMetric(label="加盟关注", value="较高", hint="FRANCHISE"),
        ],
    ),
    BrandIntelItem(
        brand_id="nayuki",
        brand_name="奈雪的茶",
        stock_name="奈雪的茶",
        stock_code="02150.HK",
        category="茶饮",
        headquarters="深圳",
        listed_status="港股上市",
        key_cities=["深圳", "广州", "上海", "北京", "杭州"],
        store_count=1800,
        price_band="18-35 元",
        sentiment_level="波动",
        investment_risk_score=63.5,
        franchise_risk_score=57.9,
        risk_level="较高风险",
        growth_signal="高端茶饮转型压力较大，需关注盈利改善、门店效率和品牌年轻化。",
        market_signal="高价格带受到平价品牌挤压，核心城市仍有品牌认知。",
        franchise_signal="加盟需要重点评估成本结构和商圈客群匹配度。",
        risk_tags=["盈利压力", "价格带承压", "转型观察"],
        metrics=[
            BrandMetric(label="近端热度", value="73", hint="NEWS + STORE"),
            BrandMetric(label="舆情倾向", value="波动", hint="PUBLIC SENTIMENT"),
            BrandMetric(label="加盟关注", value="中", hint="FRANCHISE"),
        ],
    ),
    BrandIntelItem(
        brand_id="cotti",
        brand_name="库迪咖啡",
        stock_name=None,
        stock_code=None,
        category="咖啡",
        headquarters="北京",
        listed_status="未上市",
        key_cities=["北京", "上海", "杭州", "成都", "武汉"],
        store_count=7000,
        price_band="9-22 元",
        sentiment_level="波动",
        investment_risk_score=58.6,
        franchise_risk_score=61.3,
        risk_level="较高风险",
        growth_signal="扩张速度快，价格竞争明显，适合作为行业竞争压力样本。",
        market_signal="与瑞幸等品牌重叠度高，区域选址需要更谨慎。",
        franchise_signal="加盟关注度高，但需重点核实补贴、回本周期和单店现金流。",
        risk_tags=["价格战", "快速扩张", "加盟回本不确定"],
        metrics=[
            BrandMetric(label="近端热度", value="82", hint="NEWS + STORE"),
            BrandMetric(label="舆情倾向", value="波动", hint="PUBLIC SENTIMENT"),
            BrandMetric(label="加盟关注", value="高", hint="FRANCHISE"),
        ],
    ),
]


REGION_SAMPLES: dict[str, RegionIntel] = {
    "上海": RegionIntel(
        city="上海",
        market_heat="高活跃",
        competition_level="高竞争",
        consumer_profile="白领、商圈客群、咖啡高频消费人群集中，品牌选择丰富。",
        store_density_index=88.5,
        franchise_risk_score=58.4,
        key_competitors=["瑞幸咖啡", "星巴克", "Manner", "霸王茶姬", "茶百道"],
        brand_cards=[
            RegionBrandCard(brand_name="瑞幸咖啡", store_count=1250, competition_pressure="高", franchise_fit="谨慎关注"),
            RegionBrandCard(brand_name="星巴克", store_count=980, competition_pressure="高", franchise_fit="竞品参考"),
            RegionBrandCard(brand_name="霸王茶姬", store_count=420, competition_pressure="中高", franchise_fit="关注商圈容量"),
        ],
        opportunity_points=["咖啡消费频次高", "新品接受度强", "办公与交通商圈成熟"],
        risk_points=["核心商圈租金高", "同类品牌密度高", "新店获客成本上升"],
        follow_up_data=["目标商圈租金", "500 米竞品数量", "工作日与周末客流", "品牌区域保护政策"],
    ),
    "杭州": RegionIntel(
        city="杭州",
        market_heat="高活跃",
        competition_level="高竞争",
        consumer_profile="年轻客群和互联网办公场景集中，咖啡与新茶饮接受度高。",
        store_density_index=81.2,
        franchise_risk_score=52.7,
        key_competitors=["瑞幸咖啡", "库迪咖啡", "星巴克", "霸王茶姬"],
        brand_cards=[
            RegionBrandCard(brand_name="瑞幸咖啡", store_count=860, competition_pressure="高", franchise_fit="关注点位差异"),
            RegionBrandCard(brand_name="库迪咖啡", store_count=610, competition_pressure="中高", franchise_fit="谨慎测算回本"),
            RegionBrandCard(brand_name="霸王茶姬", store_count=330, competition_pressure="中", franchise_fit="可关注新兴商圈"),
        ],
        opportunity_points=["年轻消费力强", "办公楼与社区复合场景多", "数字化运营适配度高"],
        risk_points=["咖啡价格战明显", "热门商圈门店拥挤", "品牌重叠度高"],
        follow_up_data=["商圈客流分时段数据", "竞品活动频率", "外卖平台销量", "加盟费用明细"],
    ),
    "成都": RegionIntel(
        city="成都",
        market_heat="中高活跃",
        competition_level="中高竞争",
        consumer_profile="休闲消费氛围强，茶饮接受度高，咖啡消费增长快。",
        store_density_index=73.9,
        franchise_risk_score=47.6,
        key_competitors=["蜜雪冰城", "茶百道", "瑞幸咖啡", "霸王茶姬"],
        brand_cards=[
            RegionBrandCard(brand_name="蜜雪冰城", store_count=980, competition_pressure="高", franchise_fit="关注下沉商圈"),
            RegionBrandCard(brand_name="茶百道", store_count=520, competition_pressure="中高", franchise_fit="关注品牌政策"),
            RegionBrandCard(brand_name="瑞幸咖啡", store_count=460, competition_pressure="中", franchise_fit="可关注办公点位"),
        ],
        opportunity_points=["茶饮消费基础好", "休闲场景丰富", "部分新区仍有空间"],
        risk_points=["茶饮品牌密度较高", "低价品牌竞争强", "热门商圈租金上升"],
        follow_up_data=["新区客群结构", "商圈同品类数量", "品牌加盟回本周期", "门店人工与租金成本"],
    ),
}


def list_brand_intel(
    keyword: str | None = None,
    city: str | None = None,
    risk_level: str | None = None,
    category: str | None = None,
    scenario: str | None = None,
) -> list[BrandIntelItem]:
    keyword_normalized = (keyword or "").strip().lower()
    results = BRAND_SAMPLES
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
    for item in BRAND_SAMPLES:
        if item.brand_id == brand_id:
            return item
    raise KeyError(brand_id)


def get_brand_summary() -> BrandIntelSummary:
    risk_distribution = Counter(item.risk_level for item in BRAND_SAMPLES)
    city_count = len({city for item in BRAND_SAMPLES for city in item.key_cities})
    listed_count = sum("上市" in item.listed_status for item in BRAND_SAMPLES)
    return BrandIntelSummary(
        brand_count=len(BRAND_SAMPLES),
        listed_brand_count=listed_count,
        city_count=city_count,
        news_count=186,
        average_investment_risk=round(sum(item.investment_risk_score for item in BRAND_SAMPLES) / len(BRAND_SAMPLES), 2),
        average_franchise_risk=round(sum(item.franchise_risk_score for item in BRAND_SAMPLES) / len(BRAND_SAMPLES), 2),
        risk_distribution=dict(risk_distribution),
        top_attention_brands=sorted(
            BRAND_SAMPLES,
            key=lambda item: max(item.investment_risk_score, item.franchise_risk_score),
            reverse=True,
        )[:4],
    )


def get_region_intel(city: str | None = None) -> RegionIntel:
    if city and city in REGION_SAMPLES:
        return REGION_SAMPLES[city]
    return REGION_SAMPLES["杭州"]


def build_ai_analysis(payload: BrandAnalysisRequest) -> BrandAIAnalysis:
    brand = get_brand_intel(payload.brand_id)
    region = get_region_intel(payload.city or brand.key_cities[0])
    investment_view = (
        f"{brand.brand_name}当前投资风险指数为 {brand.investment_risk_score:.2f}，"
        f"主要受{brand.growth_signal}影响。系统建议将其作为观察型标的，结合行情、财报和新闻舆情继续跟踪。"
    )
    franchise_view = (
        f"在{region.city}场景下，地区加盟风险指数为 {region.franchise_risk_score:.2f}，"
        f"市场热度为{region.market_heat}，竞争水平为{region.competition_level}。加盟前应重点核实选址、租金和竞品密度。"
    )
    return BrandAIAnalysis(
        source="local_rules",
        summary=(
            f"{brand.brand_name}适合从投资风险和加盟风险两个角度综合观察。"
            f"该品牌属于{brand.category}，当前风险等级为{brand.risk_level}，"
            f"系统本次仅基于后端聚合摘要生成解释，未直接传入大规模原始数据。"
        ),
        investment_view=investment_view,
        franchise_view=franchise_view,
        risk_points=[
            *brand.risk_tags[:3],
            *region.risk_points[:2],
        ][:5],
        action_suggestions=[
            "股民侧：重点跟踪股价波动、成交量、财报表现和负面新闻。",
            "加盟侧：先比较目标城市门店密度、租金成本、竞品数量和品牌区域政策。",
            "不要把系统输出当作确定性买卖建议，应作为风险提示和资料整理工具。",
            "TS 后续补充真实数据后，优先更新行情、新闻和门店分布字段。",
        ],
        follow_up_data=[
            "近 30 至 90 天行情数据",
            "近 10 条品牌相关新闻及情感倾向",
            "目标城市门店与竞品门店数量",
            "加盟费、保证金、装修费和回本周期",
            "目标商圈租金与客流数据",
        ],
        token_saving_note="本接口采用手动触发，只向模型传递品牌摘要、地区摘要和评分结果；列表切换不会自动调用 DeepSeek。",
    )


def build_report_markdown(brand_id: str, city: str | None = None) -> str:
    brand = get_brand_intel(brand_id)
    region = get_region_intel(city or brand.key_cities[0])
    analysis = build_ai_analysis(BrandAnalysisRequest(brand_id=brand_id, city=region.city))
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

## 四、主要风险点

{risk_points}

## 五、行动建议

{suggestions}

## 六、后续需要补充的数据

{follow_up}

> 说明：本报告用于课程项目演示和辅助分析，不构成确定性投资建议或加盟承诺。
"""
