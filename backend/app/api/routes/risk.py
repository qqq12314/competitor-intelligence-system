from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.risk import RiskAssessment
from app.repositories.risk_repository import get_merchant, list_merchants
from app.services.risk_scoring import score_merchant

router = APIRouter()


@router.get("/{merchant_id}", response_model=RiskAssessment)
def assess_merchant(merchant_id: str, session: Session = Depends(get_db)) -> RiskAssessment:
    merchant = get_merchant(session, merchant_id)
    if merchant:
        return score_merchant(merchant)
    raise HTTPException(status_code=404, detail="Merchant not found")


@router.get("", response_model=list[RiskAssessment])
def list_assessments(session: Session = Depends(get_db)) -> list[RiskAssessment]:
    return [score_merchant(merchant) for merchant in list_merchants(session)]
