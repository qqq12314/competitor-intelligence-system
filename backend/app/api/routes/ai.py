from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.ai import AIRiskExplanation
from app.repositories.risk_repository import get_merchant
from app.services.deepseek_analysis import explain_risk
from app.services.risk_scoring import score_merchant
from app.services.spider_analytics import merchant_market_context

router = APIRouter()


@router.get("/risk-explanation/{merchant_id}", response_model=AIRiskExplanation)
def risk_explanation(merchant_id: str, session: Session = Depends(get_db)) -> AIRiskExplanation:
    merchant = get_merchant(session, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    assessment = score_merchant(merchant)
    context = merchant_market_context(session, merchant)
    return explain_risk(merchant, assessment, context)
