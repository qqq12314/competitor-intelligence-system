from pydantic import BaseModel


class BrandMetric(BaseModel):
    label: str
    value: str
    hint: str


class BrandIntelItem(BaseModel):
    brand_id: str
    brand_name: str
    stock_name: str | None = None
    stock_code: str | None = None
    category: str
    headquarters: str
    listed_status: str
    key_cities: list[str]
    store_count: int
    price_band: str
    sentiment_level: str
    investment_risk_score: float
    franchise_risk_score: float
    risk_level: str
    growth_signal: str
    market_signal: str
    franchise_signal: str
    risk_tags: list[str]
    metrics: list[BrandMetric]


class BrandIntelSummary(BaseModel):
    brand_count: int
    listed_brand_count: int
    city_count: int
    news_count: int
    average_investment_risk: float
    average_franchise_risk: float
    risk_distribution: dict[str, int]
    top_attention_brands: list[BrandIntelItem]


class RegionBrandCard(BaseModel):
    brand_name: str
    store_count: int
    competition_pressure: str
    franchise_fit: str


class RegionIntel(BaseModel):
    city: str
    market_heat: str
    competition_level: str
    consumer_profile: str
    store_density_index: float
    franchise_risk_score: float
    key_competitors: list[str]
    brand_cards: list[RegionBrandCard]
    opportunity_points: list[str]
    risk_points: list[str]
    follow_up_data: list[str]


class BrandAnalysisRequest(BaseModel):
    brand_id: str
    city: str | None = None
    scenario: str = "mixed"


class BrandAIAnalysis(BaseModel):
    source: str
    summary: str
    investment_view: str
    franchise_view: str
    risk_points: list[str]
    action_suggestions: list[str]
    follow_up_data: list[str]
    token_saving_note: str
