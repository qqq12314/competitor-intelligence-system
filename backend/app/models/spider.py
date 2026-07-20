from pydantic import BaseModel, Field


class SpiderBrandStat(BaseModel):
    brand_name: str
    store_count: int = Field(ge=0)
    news_count: int = Field(ge=0)
    sample_risk_score: float = Field(ge=0, le=100)
    risk_level: str
    primary_signal: str


class SpiderCityStat(BaseModel):
    city: str
    store_count: int = Field(ge=0)
    market_heat: str
    competition_level: str
    top_brands: list[str] = Field(default_factory=list)


class SpiderNewsSample(BaseModel):
    news_id: str
    brand_name: str
    title: str
    source: str
    published_at: str
    sentiment: str
    risk_signal: str


class SpiderOverview(BaseModel):
    brand_count: int
    city_count: int
    store_count: int
    news_count: int
    top_brands: list[SpiderBrandStat]
    top_cities: list[SpiderCityStat]
    missing_credit_fields: list[str]
    data_stage_note: str


class MerchantMarketContext(BaseModel):
    merchant_id: str
    merchant_name: str
    city: str
    brand_name: str
    city_store_count: int | None = None
    city_market_heat: str | None = None
    city_competition_level: str | None = None
    city_top_brands: list[str] = Field(default_factory=list)
    brand_store_count: int | None = None
    brand_news_count: int | None = None
    brand_sample_risk_score: float | None = None
    brand_risk_level: str | None = None
    external_risk_signals: list[str] = Field(default_factory=list)
    usage_note: str
