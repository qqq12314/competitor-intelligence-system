from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.merchant import MerchantProfile
from app.repositories.risk_repository import get_merchant as find_merchant
from app.repositories.risk_repository import list_merchants as find_merchants

router = APIRouter()


@router.get("", response_model=list[MerchantProfile])
def list_merchants(session: Session = Depends(get_db)) -> list[MerchantProfile]:
    return find_merchants(session)


@router.get("/{merchant_id}", response_model=MerchantProfile)
def get_merchant(merchant_id: str, session: Session = Depends(get_db)) -> MerchantProfile:
    merchant = find_merchant(session, merchant_id)
    if merchant:
        return merchant
    raise HTTPException(status_code=404, detail="Merchant not found")
