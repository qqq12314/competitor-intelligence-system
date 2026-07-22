import csv
from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session

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
from app.db.session import SessionLocal, engine

ROOT_DIR = Path(__file__).resolve().parents[3]
COLLECTED_DIR = ROOT_DIR / "data" / "collected"


def _rows(filename: str) -> list[dict[str, str]]:
    path = COLLECTED_DIR / filename
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def _text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned or cleaned.lower() in {"none", "null", "nan"} or cleaned == "未知":
        return None
    return cleaned


def _int(value: str | None) -> int:
    cleaned = _text(value)
    if not cleaned:
        return 0
    return int(float(cleaned.replace(",", "")))


def _bool(value: str | None) -> bool | None:
    cleaned = _text(value)
    if cleaned is None:
        return None
    return cleaned.lower() in {"true", "1", "yes", "是"}


def _list(value: str | None) -> list[str]:
    cleaned = _text(value)
    if not cleaned:
        return []
    return [item.strip() for item in cleaned.replace(",", ";").split(";") if item.strip()]


def _date(value: str | None) -> date | None:
    cleaned = _text(value)
    if not cleaned:
        return None
    try:
        return date.fromisoformat(cleaned)
    except ValueError:
        return None


def import_brand_intel_data(session: Session, force: bool = True) -> dict[str, int]:
    if force:
        for model in (
            SourceRegistryRecord,
            RegionCompetitionRecord,
            FranchisePolicyRecord,
            CityStoreDistributionRecord,
            NewsSentimentRecord,
            MarketQuoteRecord,
            BrandProfileRecord,
        ):
            session.query(model).delete()
        session.commit()

    brand_profiles = [
        BrandProfileRecord(
            brand_id=row["brand_id"],
            brand_name=row["brand_name"],
            main_company=_text(row.get("main_company")),
            category=row.get("category") or "未知",
            headquarters=_text(row.get("headquarters")),
            listed_status=row.get("listed_status") or "未知",
            stock_code=_text(row.get("stock_code")),
            store_count_estimate=_int(row.get("store_count_estimate")),
            price_band=_text(row.get("price_band")),
            main_cities=_list(row.get("main_cities")),
            brand_positioning=_text(row.get("brand_positioning")),
            source_name=_text(row.get("source_name")),
            source_url=_text(row.get("source_url")),
            query_date=_text(row.get("query_date")),
            updated_at=_date(row.get("query_date")),
        )
        for row in _rows("brand_profile.csv")
        if row.get("brand_id") and row.get("brand_name")
    ]
    session.add_all(brand_profiles)

    session.add_all(
        [
            MarketQuoteRecord(
                brand_name=row["brand_name"],
                stock_code=_text(row.get("stock_code")),
                market=_text(row.get("market")),
                current_price=_text(row.get("current_price")),
                change_percent=_text(row.get("change_percent")),
                volume=_text(row.get("volume")),
                market_cap=_text(row.get("market_cap")),
                pe_ratio=_text(row.get("pe_ratio")),
                currency=_text(row.get("currency")),
                trade_date=_text(row.get("trade_date")),
                source_url=_text(row.get("source_url")),
            )
            for row in _rows("market_quote.csv")
            if row.get("brand_name")
        ]
    )

    session.add_all(
        [
            NewsSentimentRecord(
                brand_name=row["brand_name"],
                news_title=row.get("news_title") or "未命名新闻",
                source_name=_text(row.get("source_name")),
                publish_date=_text(row.get("publish_date")),
                sentiment=row.get("sentiment") or "neutral",
                news_type=_text(row.get("news_type")),
                news_summary=_text(row.get("news_summary")),
                risk_signal=_text(row.get("risk_signal")),
                news_url=_text(row.get("news_url")),
            )
            for row in _rows("news_sentiment.csv")
            if row.get("brand_name")
        ]
    )

    session.add_all(
        [
            CityStoreDistributionRecord(
                city=row["city"],
                brand_name=row["brand_name"],
                category=_text(row.get("category")),
                store_count_estimate=_int(row.get("store_count_estimate")),
                sample_date=_text(row.get("sample_date")),
                source_name=_text(row.get("source_name")),
                source_url=_text(row.get("source_url")),
                note=_text(row.get("note")),
            )
            for row in _rows("city_store_distribution.csv")
            if row.get("city") and row.get("brand_name")
        ]
    )

    session.add_all(
        [
            FranchisePolicyRecord(
                brand_name=row["brand_name"],
                is_franchise_available=_bool(row.get("is_franchise_available")),
                franchise_fee=_text(row.get("franchise_fee")),
                deposit=_text(row.get("deposit")),
                total_investment_range=_text(row.get("total_investment_range")),
                estimated_payback_period=_text(row.get("estimated_payback_period")),
                area_protection_policy=_text(row.get("area_protection_policy")),
                franchise_conditions=_text(row.get("franchise_conditions")),
                source_url=_text(row.get("source_url")),
                note=_text(row.get("note")),
            )
            for row in _rows("franchise_policy.csv")
            if row.get("brand_name")
        ]
    )

    session.add_all(
        [
            RegionCompetitionRecord(
                city=row["city"],
                target_brand=row["target_brand"],
                same_category_store_count=_int(row.get("same_category_store_count")) or None,
                major_competitors=_list(row.get("major_competitors")),
                competition_level=_text(row.get("competition_level")),
                market_heat=_text(row.get("market_heat")),
                opportunity_points=_text(row.get("opportunity_points")),
                risk_points=_text(row.get("risk_points")),
            )
            for row in _rows("region_competition.csv")
            if row.get("city") and row.get("target_brand")
        ]
    )

    session.add_all(
        [
            SourceRegistryRecord(
                dataset_name=row.get("dataset_name") or "unknown",
                source_name=_text(row.get("source_name")),
                source_url=_text(row.get("source_url")),
                collect_method=_text(row.get("collect_method")),
                update_frequency=_text(row.get("update_frequency")),
                owner_role=_text(row.get("owner_role")),
                note=_text(row.get("note")),
            )
            for row in _rows("source_registry.csv")
        ]
    )

    session.commit()
    return {
        "brand_profiles": len(brand_profiles),
        "market_quotes": session.query(MarketQuoteRecord).count(),
        "news_sentiments": session.query(NewsSentimentRecord).count(),
        "city_store_distributions": session.query(CityStoreDistributionRecord).count(),
        "franchise_policies": session.query(FranchisePolicyRecord).count(),
        "region_competitions": session.query(RegionCompetitionRecord).count(),
        "source_registry": session.query(SourceRegistryRecord).count(),
    }


def initialize_brand_intel_tables(force_import: bool = True) -> dict[str, int]:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        return import_brand_intel_data(session, force=force_import)


if __name__ == "__main__":
    counts = initialize_brand_intel_tables(force_import=True)
    print("Brand intelligence data imported:", counts)
