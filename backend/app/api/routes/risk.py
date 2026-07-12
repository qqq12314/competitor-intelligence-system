from fastapi import APIRouter, HTTPException

from app.models.risk import RiskAssessment
from app.services.risk_scoring import score_merchant
from app.services.sample_loader import load_merchants

router = APIRouter()


@router.get("/{merchant_id}", response_model=RiskAssessment)
def assess_merchant(merchant_id: str) -> RiskAssessment:
    for merchant in load_merchants():
        if merchant.merchant_id == merchant_id:
            return score_merchant(merchant)
    raise HTTPException(status_code=404, detail="Merchant not found")


@router.get("", response_model=list[RiskAssessment])
def list_assessments() -> list[RiskAssessment]:
    return [score_merchant(merchant) for merchant in load_merchants()]

