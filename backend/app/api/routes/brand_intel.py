from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.brand_intel import BrandAnalysisRequest
from app.services.brand_intel import (
    build_ai_analysis,
    build_report_markdown,
    get_data_pipeline_status,
    get_brand_intel,
    get_brand_summary,
    get_project_overview,
    get_region_intel,
    list_brand_intel,
)

router = APIRouter()


@router.get("/summary")
def brand_intel_summary(db: Session = Depends(get_db)) -> dict:
    return get_brand_summary(db).model_dump()


@router.get("/data-status")
def brand_data_status(db: Session = Depends(get_db)) -> dict:
    return get_data_pipeline_status(db).model_dump()


@router.get("/project-overview")
def brand_project_overview(db: Session = Depends(get_db)) -> dict:
    return get_project_overview(db)


@router.get("/brands")
def brand_intel_list(
    keyword: str | None = None,
    city: str | None = None,
    risk_level: str | None = None,
    category: str | None = None,
    scenario: str | None = Query(default=None, pattern="^(investment|franchise|mixed)?$"),
    db: Session = Depends(get_db),
) -> list[dict]:
    return [
        item.model_dump()
        for item in list_brand_intel(
            keyword=keyword,
            city=city,
            risk_level=risk_level,
            category=category,
            scenario=scenario,
            session=db,
        )
    ]


@router.get("/brands/{brand_id}")
def brand_intel_detail(brand_id: str, db: Session = Depends(get_db)) -> dict:
    try:
        return get_brand_intel(brand_id, db).model_dump()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Brand not found") from exc


@router.get("/region")
def region_intel(city: str | None = None, db: Session = Depends(get_db)) -> dict:
    return get_region_intel(city, db).model_dump()


@router.post("/ai/analyze")
def ai_brand_analysis(payload: BrandAnalysisRequest, db: Session = Depends(get_db)) -> dict:
    try:
        return build_ai_analysis(payload, db).model_dump()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Brand not found") from exc


@router.get("/reports/{brand_id}.md", response_class=PlainTextResponse)
def brand_report(brand_id: str, city: str | None = None, db: Session = Depends(get_db)) -> str:
    try:
        return build_report_markdown(brand_id, city, db)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Brand not found") from exc
