from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.risk_repository import get_merchant
from app.services.report_generator import generate_markdown_report
from app.services.risk_scoring import score_merchant

router = APIRouter()


@router.get("/{merchant_id}.md", response_class=PlainTextResponse)
def merchant_report(merchant_id: str, session: Session = Depends(get_db)) -> str:
    merchant = get_merchant(session, merchant_id)
    if merchant:
        return generate_markdown_report(merchant, score_merchant(merchant))
    raise HTTPException(status_code=404, detail="Merchant not found")
