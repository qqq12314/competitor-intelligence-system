from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.spider import MerchantMarketContext, RegionRiskOverview, SpiderBrandStat, SpiderCityStat, SpiderNewsSample, SpiderOverview
from app.repositories.risk_repository import get_merchant, list_merchants
from app.services.spider_analytics import (
    list_spider_brands,
    list_spider_cities,
    list_spider_news,
    merchant_market_context,
    region_risk_overview,
    spider_overview,
)

router = APIRouter()


@router.get("/overview", response_model=SpiderOverview)
def overview(session: Session = Depends(get_db)) -> SpiderOverview:
    return spider_overview(session)


@router.get("/brands", response_model=list[SpiderBrandStat])
def brands(limit: int = 20, session: Session = Depends(get_db)) -> list[SpiderBrandStat]:
    return list_spider_brands(session, limit=limit)


@router.get("/cities", response_model=list[SpiderCityStat])
def cities(limit: int = 20, session: Session = Depends(get_db)) -> list[SpiderCityStat]:
    return list_spider_cities(session, limit=limit)


@router.get("/news", response_model=list[SpiderNewsSample])
def news(brand_name: str | None = None, limit: int = 20, session: Session = Depends(get_db)) -> list[SpiderNewsSample]:
    return list_spider_news(session, brand_name=brand_name, limit=limit)


@router.get("/market-context/{merchant_id}", response_model=MerchantMarketContext)
def market_context(merchant_id: str, session: Session = Depends(get_db)) -> MerchantMarketContext:
    merchant = get_merchant(session, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return merchant_market_context(session, merchant)


@router.get("/region-risk/{city}", response_model=RegionRiskOverview)
def region_risk(city: str, session: Session = Depends(get_db)) -> RegionRiskOverview:
    return region_risk_overview(session, city, list_merchants(session))
