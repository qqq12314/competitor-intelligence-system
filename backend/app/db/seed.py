import csv
from datetime import date
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import (
    BrandRecord,
    ContractRecord,
    MerchantRecord,
    PublicOpinionRecord,
    SpiderBrandStatRecord,
    SpiderCityStatRecord,
    SpiderNewsRecord,
)
from app.db.session import SessionLocal, engine

ROOT_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT_DIR / "data" / "sample"
SPIDER_DATA_DIR = ROOT_DIR / "data" / "spider"


def _rows(filename: str) -> list[dict[str, str]]:
    with (DATA_DIR / filename).open(encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def _spider_rows(filename: str) -> list[dict[str, str]]:
    path = SPIDER_DATA_DIR / filename
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def _tags(value: str) -> list[str]:
    return [item.strip() for item in value.split("|") if item.strip()]


def seed_database(session: Session, force: bool = False) -> dict[str, int]:
    if force:
        session.query(SpiderNewsRecord).delete()
        session.query(SpiderCityStatRecord).delete()
        session.query(SpiderBrandStatRecord).delete()
        session.query(PublicOpinionRecord).delete()
        session.query(ContractRecord).delete()
        session.query(MerchantRecord).delete()
        session.query(BrandRecord).delete()
        session.commit()

    if session.scalar(select(func.count()).select_from(BrandRecord)) == 0:
        session.add_all(
            [
                BrandRecord(
                    brand_id=row["brand_id"],
                    brand_name=row["brand_name"],
                    category=row["category"],
                    price_band=row["price_band"],
                    store_scale=row["store_scale"],
                    franchise_maturity=int(row["franchise_maturity"]),
                    public_sentiment=row["public_sentiment"],
                    risk_tags=_tags(row["risk_tags"]),
                )
                for row in _rows("brands.csv")
            ]
        )

    if session.scalar(select(func.count()).select_from(MerchantRecord)) == 0:
        session.add_all(
            [
                MerchantRecord(
                    merchant_id=row["merchant_id"],
                    merchant_name=row["merchant_name"],
                    brand_name=row["brand_name"],
                    city=row["city"],
                    district=row["district"],
                    business_area_type=row["business_area_type"],
                    opening_months=int(row["opening_months"]),
                    average_ticket=float(row["average_ticket"]),
                    takeaway_rating=float(row["takeaway_rating"]),
                    monthly_revenue=float(row["monthly_revenue"]),
                    rent_ratio=float(row["rent_ratio"]),
                    labor_cost_ratio=float(row["labor_cost_ratio"]),
                    purchase_cost_ratio=float(row["purchase_cost_ratio"]),
                    debt_ratio=float(row["debt_ratio"]),
                    competitor_density=int(row["competitor_density"]),
                    negative_review_keywords=_tags(row["negative_review_keywords"]),
                    franchise_type=row["franchise_type"],
                    has_contract_risk=row["has_contract_risk"].lower() == "true",
                    recent_public_opinion_risk=row["recent_public_opinion_risk"].lower() == "true",
                )
                for row in _rows("merchants.csv")
            ]
        )

    if session.scalar(select(func.count()).select_from(ContractRecord)) == 0:
        session.add_all(
            [
                ContractRecord(
                    contract_id=row["contract_id"],
                    merchant_id=row["merchant_id"],
                    contract_type=row["contract_type"],
                    title=row["title"],
                    risk_tags=_tags(row["risk_tags"]),
                    sample_text=row["sample_text"],
                )
                for row in _rows("contracts.csv")
            ]
        )

    if session.scalar(select(func.count()).select_from(PublicOpinionRecord)) == 0:
        session.add_all(
            [
                PublicOpinionRecord(
                    event_id=row["event_id"],
                    brand_name=row["brand_name"],
                    event_date=date.fromisoformat(row["event_date"]),
                    event_type=row["event_type"],
                    risk_level=row["risk_level"],
                    summary=row["summary"],
                )
                for row in _rows("public_opinion.csv")
            ]
        )

    if session.scalar(select(func.count()).select_from(SpiderBrandStatRecord)) == 0:
        session.add_all(
            [
                SpiderBrandStatRecord(
                    brand_name=row["brand_name"],
                    store_count=int(row["store_count"]),
                    news_count=int(row["news_count"]),
                    sample_risk_score=float(row["sample_risk_score"]),
                    risk_level=row["risk_level"],
                    primary_signal=row["primary_signal"],
                )
                for row in _spider_rows("brand_stats.csv")
            ]
        )

    if session.scalar(select(func.count()).select_from(SpiderCityStatRecord)) == 0:
        session.add_all(
            [
                SpiderCityStatRecord(
                    city=row["city"],
                    store_count=int(row["store_count"]),
                    market_heat=row["market_heat"],
                    competition_level=row["competition_level"],
                    top_brands=_tags(row["top_brands"]),
                )
                for row in _spider_rows("city_stats.csv")
            ]
        )

    if session.scalar(select(func.count()).select_from(SpiderNewsRecord)) == 0:
        session.add_all(
            [
                SpiderNewsRecord(
                    news_id=row["news_id"],
                    brand_name=row["brand_name"],
                    title=row["title"],
                    source=row["source"],
                    published_at=row["published_at"],
                    sentiment=row["sentiment"],
                    risk_signal=row["risk_signal"],
                )
                for row in _spider_rows("news_samples.csv")
            ]
        )

    session.commit()
    return {
        "brands": session.scalar(select(func.count()).select_from(BrandRecord)) or 0,
        "merchants": session.scalar(select(func.count()).select_from(MerchantRecord)) or 0,
        "contracts": session.scalar(select(func.count()).select_from(ContractRecord)) or 0,
        "public_opinions": session.scalar(select(func.count()).select_from(PublicOpinionRecord)) or 0,
        "spider_brand_stats": session.scalar(select(func.count()).select_from(SpiderBrandStatRecord)) or 0,
        "spider_city_stats": session.scalar(select(func.count()).select_from(SpiderCityStatRecord)) or 0,
        "spider_news_samples": session.scalar(select(func.count()).select_from(SpiderNewsRecord)) or 0,
    }


def initialize_database(force_seed: bool = False) -> dict[str, int]:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        return seed_database(session, force=force_seed)


if __name__ == "__main__":
    counts = initialize_database(force_seed=True)
    print("Database initialized:", counts)
