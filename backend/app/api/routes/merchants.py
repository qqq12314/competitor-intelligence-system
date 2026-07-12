from fastapi import APIRouter, HTTPException

from app.models.merchant import MerchantProfile
from app.services.sample_loader import load_merchants

router = APIRouter()


@router.get("", response_model=list[MerchantProfile])
def list_merchants() -> list[MerchantProfile]:
    return load_merchants()


@router.get("/{merchant_id}", response_model=MerchantProfile)
def get_merchant(merchant_id: str) -> MerchantProfile:
    for merchant in load_merchants():
        if merchant.merchant_id == merchant_id:
            return merchant
    raise HTTPException(status_code=404, detail="Merchant not found")

