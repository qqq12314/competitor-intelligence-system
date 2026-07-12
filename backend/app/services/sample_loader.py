import csv
from pathlib import Path
from typing import TypeVar

from app.models.brand import BrandProfile
from app.models.merchant import MerchantProfile

ROOT_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT_DIR / "data" / "sample"

T = TypeVar("T")


def _split_tags(value: str) -> list[str]:
    return [item.strip() for item in value.split("|") if item.strip()]


def load_brands() -> list[BrandProfile]:
    path = DATA_DIR / "brands.csv"
    with path.open(encoding="utf-8-sig", newline="") as file:
        rows = csv.DictReader(file)
        return [
            BrandProfile(
                brand_id=row["brand_id"],
                brand_name=row["brand_name"],
                category=row["category"],
                price_band=row["price_band"],
                store_scale=row["store_scale"],
                franchise_maturity=int(row["franchise_maturity"]),
                public_sentiment=row["public_sentiment"],
                risk_tags=_split_tags(row["risk_tags"]),
            )
            for row in rows
        ]


def load_merchants() -> list[MerchantProfile]:
    path = DATA_DIR / "merchants.csv"
    with path.open(encoding="utf-8-sig", newline="") as file:
        rows = csv.DictReader(file)
        return [
            MerchantProfile(
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
                negative_review_keywords=_split_tags(row["negative_review_keywords"]),
                franchise_type=row["franchise_type"],
                has_contract_risk=row["has_contract_risk"].lower() == "true",
                recent_public_opinion_risk=row["recent_public_opinion_risk"].lower() == "true",
            )
            for row in rows
        ]
