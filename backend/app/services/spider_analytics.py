from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.db.models import SpiderBrandStatRecord, SpiderCityStatRecord, SpiderNewsRecord
from app.models.merchant import MerchantProfile
from app.models.spider import (
    MerchantMarketContext,
    SpiderBrandStat,
    SpiderCityStat,
    SpiderNewsSample,
    SpiderOverview,
)

MISSING_CREDIT_FIELDS = [
    "近6个月营业流水",
    "月订单量与客单价明细",
    "会员复购率",
    "房租、人工、原料成本",
    "现有负债与贷款申请金额",
    "租赁/加盟/采购合同原文",
]


def _brand(record: SpiderBrandStatRecord) -> SpiderBrandStat:
    return SpiderBrandStat(
        brand_name=record.brand_name,
        store_count=record.store_count,
        news_count=record.news_count,
        sample_risk_score=record.sample_risk_score,
        risk_level=record.risk_level,
        primary_signal=record.primary_signal,
    )


def _city(record: SpiderCityStatRecord) -> SpiderCityStat:
    return SpiderCityStat(
        city=record.city,
        store_count=record.store_count,
        market_heat=record.market_heat,
        competition_level=record.competition_level,
        top_brands=record.top_brands or [],
    )


def _news(record: SpiderNewsRecord) -> SpiderNewsSample:
    return SpiderNewsSample(
        news_id=record.news_id,
        brand_name=record.brand_name,
        title=record.title,
        source=record.source,
        published_at=record.published_at,
        sentiment=record.sentiment,
        risk_signal=record.risk_signal,
    )


def list_spider_brands(session: Session, limit: int = 20) -> list[SpiderBrandStat]:
    records = session.scalars(
        select(SpiderBrandStatRecord)
        .order_by(desc(SpiderBrandStatRecord.store_count), SpiderBrandStatRecord.brand_name)
        .limit(limit)
    ).all()
    return [_brand(record) for record in records]


def list_spider_cities(session: Session, limit: int = 20) -> list[SpiderCityStat]:
    records = session.scalars(
        select(SpiderCityStatRecord)
        .order_by(desc(SpiderCityStatRecord.store_count), SpiderCityStatRecord.city)
        .limit(limit)
    ).all()
    return [_city(record) for record in records]


def list_spider_news(session: Session, brand_name: str | None = None, limit: int = 20) -> list[SpiderNewsSample]:
    statement = select(SpiderNewsRecord).order_by(desc(SpiderNewsRecord.published_at), SpiderNewsRecord.news_id)
    if brand_name:
        statement = statement.where(SpiderNewsRecord.brand_name == brand_name)
    records = session.scalars(statement.limit(limit)).all()
    return [_news(record) for record in records]


def spider_overview(session: Session) -> SpiderOverview:
    brands = list_spider_brands(session, limit=5)
    cities = list_spider_cities(session, limit=5)
    all_brand_rows = session.scalars(select(SpiderBrandStatRecord)).all()
    all_city_rows = session.scalars(select(SpiderCityStatRecord)).all()
    all_news_rows = session.scalars(select(SpiderNewsRecord)).all()
    return SpiderOverview(
        brand_count=len(all_brand_rows),
        city_count=len(all_city_rows),
        store_count=sum(row.store_count for row in all_brand_rows),
        news_count=sum(row.news_count for row in all_brand_rows) or len(all_news_rows),
        top_brands=brands,
        top_cities=cities,
        missing_credit_fields=MISSING_CREDIT_FIELDS,
        data_stage_note="当前 TS 数据用于外部经营环境评估；真实授信仍需补充商户流水、成本、负债和合同原文。",
    )


def _find_city_record(session: Session, city: str) -> SpiderCityStatRecord | None:
    candidates = [city]
    if city.endswith("市"):
        candidates.append(city[:-1])
    else:
        candidates.append(f"{city}市")

    for candidate in candidates:
        record = session.get(SpiderCityStatRecord, candidate)
        if record:
            return record
    return None


def merchant_market_context(session: Session, merchant: MerchantProfile) -> MerchantMarketContext:
    city_record = _find_city_record(session, merchant.city)
    brand_record = session.get(SpiderBrandStatRecord, merchant.brand_name)
    news_records = session.scalars(
        select(SpiderNewsRecord)
        .where(SpiderNewsRecord.brand_name == merchant.brand_name)
        .order_by(desc(SpiderNewsRecord.published_at))
        .limit(3)
    ).all()

    signals: list[str] = []
    if city_record:
        signals.append(f"{merchant.city}门店样本数约{city_record.store_count}，市场热度为{city_record.market_heat}。")
        signals.append(f"城市竞争水平：{city_record.competition_level}，主要品牌包括{'、'.join(city_record.top_brands or [])}。")
    else:
        signals.append("当前 TS 聚合数据暂未覆盖该城市，需要后续补充区域门店样本。")

    if brand_record:
        signals.append(
            f"{merchant.brand_name}公开门店样本约{brand_record.store_count}，品牌样例风险等级为{brand_record.risk_level}。"
        )
        signals.append(brand_record.primary_signal)
    else:
        signals.append("当前 TS 聚合数据暂未匹配该品牌，前期按独立/区域品牌审慎处理。")

    signals.extend(record.risk_signal for record in news_records)

    return MerchantMarketContext(
        merchant_id=merchant.merchant_id,
        merchant_name=merchant.merchant_name,
        city=merchant.city,
        brand_name=merchant.brand_name,
        city_store_count=city_record.store_count if city_record else None,
        city_market_heat=city_record.market_heat if city_record else None,
        city_competition_level=city_record.competition_level if city_record else None,
        city_top_brands=city_record.top_brands if city_record else [],
        brand_store_count=brand_record.store_count if brand_record else None,
        brand_news_count=brand_record.news_count if brand_record else None,
        brand_sample_risk_score=brand_record.sample_risk_score if brand_record else None,
        brand_risk_level=brand_record.risk_level if brand_record else None,
        external_risk_signals=signals,
        usage_note="该市场环境只作为外部辅助指标，不直接替代商户真实信贷资料和人工审批。",
    )
