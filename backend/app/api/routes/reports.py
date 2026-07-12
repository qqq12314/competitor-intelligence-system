from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from app.services.report_generator import generate_markdown_report
from app.services.risk_scoring import score_merchant
from app.services.sample_loader import load_merchants

router = APIRouter()


@router.get("/{merchant_id}.md", response_class=PlainTextResponse)
def merchant_report(merchant_id: str) -> str:
    for merchant in load_merchants():
        if merchant.merchant_id == merchant_id:
            return generate_markdown_report(merchant, score_merchant(merchant))
    raise HTTPException(status_code=404, detail="Merchant not found")

