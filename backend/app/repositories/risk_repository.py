from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import BrandRecord, MerchantRecord
from app.models.brand import BrandProfile
from app.models.merchant import MerchantProfile


def _brand_profile(record: BrandRecord) -> BrandProfile:
    return BrandProfile(
        brand_id=record.brand_id,
        brand_name=record.brand_name,
        category=record.category,
        price_band=record.price_band,
        store_scale=record.store_scale,
        franchise_maturity=record.franchise_maturity,
        public_sentiment=record.public_sentiment,
        risk_tags=record.risk_tags or [],
    )


def _merchant_profile(record: MerchantRecord) -> MerchantProfile:
    return MerchantProfile(
        merchant_id=record.merchant_id,
        merchant_name=record.merchant_name,
        brand_name=record.brand_name,
        city=record.city,
        district=record.district,
        business_area_type=record.business_area_type,
        opening_months=record.opening_months,
        average_ticket=record.average_ticket,
        takeaway_rating=record.takeaway_rating,
        monthly_revenue=record.monthly_revenue,
        rent_ratio=record.rent_ratio,
        labor_cost_ratio=record.labor_cost_ratio,
        purchase_cost_ratio=record.purchase_cost_ratio,
        debt_ratio=record.debt_ratio,
        competitor_density=record.competitor_density,
        negative_review_keywords=record.negative_review_keywords or [],
        franchise_type=record.franchise_type,
        has_contract_risk=record.has_contract_risk,
        recent_public_opinion_risk=record.recent_public_opinion_risk,
    )


def list_brands(session: Session) -> list[BrandProfile]:
    records = session.scalars(select(BrandRecord).order_by(BrandRecord.brand_id)).all()
    return [_brand_profile(record) for record in records]


def get_brand(session: Session, brand_id: str) -> BrandProfile | None:
    record = session.get(BrandRecord, brand_id)
    return _brand_profile(record) if record else None


def list_merchants(session: Session) -> list[MerchantProfile]:
    records = session.scalars(select(MerchantRecord).order_by(MerchantRecord.merchant_id)).all()
    return [_merchant_profile(record) for record in records]


def get_merchant(session: Session, merchant_id: str) -> MerchantProfile | None:
    record = session.get(MerchantRecord, merchant_id)
    return _merchant_profile(record) if record else None
