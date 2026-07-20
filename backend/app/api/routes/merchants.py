from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.merchant import MerchantProfile
from app.repositories.risk_repository import get_merchant as find_merchant
from app.repositories.risk_repository import list_brands as find_brands
from app.repositories.risk_repository import list_merchants as find_merchants
from app.services.risk_scoring import score_merchant

router = APIRouter()


@router.get("", response_model=list[MerchantProfile])
def list_merchants(session: Session = Depends(get_db)) -> list[MerchantProfile]:
    return find_merchants(session)


@router.get("/search", response_model=list[MerchantProfile])
def search_merchants(
    keyword: str | None = None,
    city: str | None = None,
    risk_level: str | None = None,
    category: str | None = None,
    session: Session = Depends(get_db),
) -> list[MerchantProfile]:
    merchants = find_merchants(session)
    brands_by_name = {brand.brand_name: brand for brand in find_brands(session)}
    normalized_keyword = keyword.strip().lower() if keyword else ""

    def matches(merchant: MerchantProfile) -> bool:
        if normalized_keyword:
            haystack = " ".join(
                [
                    merchant.merchant_name,
                    merchant.brand_name,
                    merchant.city,
                    merchant.district,
                    merchant.business_area_type,
                    merchant.franchise_type,
                ]
            ).lower()
            if normalized_keyword not in haystack:
                return False
        if city and merchant.city != city and f"{merchant.city}市" != city:
            return False
        if risk_level and score_merchant(merchant).risk_level != risk_level:
            return False
        if category:
            brand = brands_by_name.get(merchant.brand_name)
            brand_category = brand.category if brand else ""
            if category not in brand_category and category not in merchant.business_area_type:
                return False
        return True

    return [merchant for merchant in merchants if matches(merchant)]


@router.get("/{merchant_id}", response_model=MerchantProfile)
def get_merchant(merchant_id: str, session: Session = Depends(get_db)) -> MerchantProfile:
    merchant = find_merchant(session, merchant_id)
    if merchant:
        return merchant
    raise HTTPException(status_code=404, detail="Merchant not found")
