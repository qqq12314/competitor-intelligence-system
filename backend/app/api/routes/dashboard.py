from collections import Counter

from fastapi import APIRouter

from app.services.risk_scoring import score_merchant
from app.services.sample_loader import load_brands, load_merchants

router = APIRouter()


@router.get("/summary")
def dashboard_summary() -> dict:
    merchants = load_merchants()
    brands = load_brands()
    assessments = [score_merchant(merchant) for merchant in merchants]
    risk_distribution = Counter(item.risk_level for item in assessments)
    contract_risk_count = sum(merchant.has_contract_risk for merchant in merchants)
    opinion_risk_count = sum(merchant.recent_public_opinion_risk for merchant in merchants)
    high_risk_merchants = sorted(assessments, key=lambda item: item.total_score)[:5]

    return {
        "brand_count": len(brands),
        "merchant_count": len(merchants),
        "risk_distribution": dict(risk_distribution),
        "contract_risk_count": contract_risk_count,
        "opinion_risk_count": opinion_risk_count,
        "high_risk_merchants": [
            {
                "merchant_id": item.merchant_id,
                "merchant_name": item.merchant_name,
                "score": item.total_score,
                "level": item.risk_level,
            }
            for item in high_risk_merchants
        ],
    }

