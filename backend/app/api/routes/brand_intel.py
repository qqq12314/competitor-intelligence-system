from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse

from app.models.brand_intel import BrandAnalysisRequest
from app.services.brand_intel import (
    build_ai_analysis,
    build_report_markdown,
    get_brand_intel,
    get_brand_summary,
    get_region_intel,
    list_brand_intel,
)

router = APIRouter()


@router.get("/summary")
def brand_intel_summary() -> dict:
    return get_brand_summary().model_dump()


@router.get("/brands")
def brand_intel_list(
    keyword: str | None = None,
    city: str | None = None,
    risk_level: str | None = None,
    category: str | None = None,
    scenario: str | None = Query(default=None, pattern="^(investment|franchise|mixed)?$"),
) -> list[dict]:
    return [
        item.model_dump()
        for item in list_brand_intel(
            keyword=keyword,
            city=city,
            risk_level=risk_level,
            category=category,
            scenario=scenario,
        )
    ]


@router.get("/brands/{brand_id}")
def brand_intel_detail(brand_id: str) -> dict:
    try:
        return get_brand_intel(brand_id).model_dump()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Brand not found") from exc


@router.get("/region")
def region_intel(city: str | None = None) -> dict:
    return get_region_intel(city).model_dump()


@router.post("/ai/analyze")
def ai_brand_analysis(payload: BrandAnalysisRequest) -> dict:
    try:
        return build_ai_analysis(payload).model_dump()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Brand not found") from exc


@router.get("/reports/{brand_id}.md", response_class=PlainTextResponse)
def brand_report(brand_id: str, city: str | None = None) -> str:
    try:
        return build_report_markdown(brand_id, city)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Brand not found") from exc
