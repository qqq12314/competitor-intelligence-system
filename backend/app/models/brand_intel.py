from pydantic import BaseModel, Field


class BrandMetric(BaseModel):
    label: str
    value: str
    hint: str


class MarketQuote(BaseModel):
    stock_code: str | None = None
    market: str | None = None
    current_price: str | None = None
    change_percent: str | None = None
    volume: str | None = None
    market_cap: str | None = None
    pe_ratio: str | None = None
    currency: str | None = None
    trade_date: str | None = None
    source_url: str | None = None


class NewsSignal(BaseModel):
    title: str
    source_name: str
    publish_date: str
    sentiment: str
    news_type: str
    summary: str
    risk_signal: str
    news_url: str | None = None


class FranchisePolicy(BaseModel):
    is_franchise_available: bool | None = None
    franchise_fee: str | None = None
    deposit: str | None = None
    total_investment_range: str | None = None
    estimated_payback_period: str | None = None
    area_protection_policy: str | None = None
    franchise_conditions: str | None = None
    source_url: str | None = None
    note: str | None = None


class RegionCompetitionSignal(BaseModel):
    city: str
    target_brand: str
    same_category_store_count: int | None = None
    major_competitors: list[str] = Field(default_factory=list)
    competition_level: str | None = None
    market_heat: str | None = None
    opportunity_points: str | None = None
    risk_points: str | None = None


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
    quote: MarketQuote | None = None
    news: list[NewsSignal] = Field(default_factory=list)
    franchise_policy: FranchisePolicy | None = None
    region_competition: list[RegionCompetitionSignal] = Field(default_factory=list)
    follow_up_data: list[str] = Field(default_factory=list)


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
    cache_hit: bool = False


class DatasetStatus(BaseModel):
    dataset: str
    database_rows: int
    csv_rows: int
    ready_for_import: bool
    owner_role: str
    next_action: str


class BrandDataStatus(BaseModel):
    active_source: str
    database_engine: str
    mysql_ready: bool
    fallback_enabled: bool
    total_database_rows: int
    total_csv_rows: int
    datasets: list[DatasetStatus]
    message: str
