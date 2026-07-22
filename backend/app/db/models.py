from datetime import date

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class BrandRecord(Base):
    __tablename__ = "brands"

    brand_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    brand_name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    price_band: Mapped[str] = mapped_column(String(50))
    store_scale: Mapped[str] = mapped_column(String(50))
    franchise_maturity: Mapped[int] = mapped_column(Integer)
    public_sentiment: Mapped[str] = mapped_column(Text)
    risk_tags: Mapped[list[str]] = mapped_column(JSON, default=list)


class MerchantRecord(Base):
    __tablename__ = "merchants"

    merchant_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    merchant_name: Mapped[str] = mapped_column(String(120), index=True)
    brand_name: Mapped[str] = mapped_column(String(100), index=True)
    city: Mapped[str] = mapped_column(String(50), index=True)
    district: Mapped[str] = mapped_column(String(50))
    business_area_type: Mapped[str] = mapped_column(String(50))
    opening_months: Mapped[int] = mapped_column(Integer)
    average_ticket: Mapped[float] = mapped_column(Float)
    takeaway_rating: Mapped[float] = mapped_column(Float)
    monthly_revenue: Mapped[float] = mapped_column(Float)
    rent_ratio: Mapped[float] = mapped_column(Float)
    labor_cost_ratio: Mapped[float] = mapped_column(Float)
    purchase_cost_ratio: Mapped[float] = mapped_column(Float)
    debt_ratio: Mapped[float] = mapped_column(Float)
    competitor_density: Mapped[int] = mapped_column(Integer)
    negative_review_keywords: Mapped[list[str]] = mapped_column(JSON, default=list)
    franchise_type: Mapped[str] = mapped_column(String(50))
    has_contract_risk: Mapped[bool] = mapped_column(Boolean, default=False)
    recent_public_opinion_risk: Mapped[bool] = mapped_column(Boolean, default=False)


class ContractRecord(Base):
    __tablename__ = "contracts"

    contract_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    merchant_id: Mapped[str] = mapped_column(String(20), index=True)
    contract_type: Mapped[str] = mapped_column(String(30), index=True)
    title: Mapped[str] = mapped_column(String(150))
    risk_tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    sample_text: Mapped[str] = mapped_column(Text)


class PublicOpinionRecord(Base):
    __tablename__ = "public_opinions"

    event_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    brand_name: Mapped[str] = mapped_column(String(100), index=True)
    event_date: Mapped[date] = mapped_column(Date, index=True)
    event_type: Mapped[str] = mapped_column(String(50))
    risk_level: Mapped[str] = mapped_column(String(30), index=True)
    summary: Mapped[str] = mapped_column(Text)


class SpiderBrandStatRecord(Base):
    __tablename__ = "spider_brand_stats"

    brand_name: Mapped[str] = mapped_column(String(100), primary_key=True)
    store_count: Mapped[int] = mapped_column(Integer)
    news_count: Mapped[int] = mapped_column(Integer, default=0)
    sample_risk_score: Mapped[float] = mapped_column(Float, default=0)
    risk_level: Mapped[str] = mapped_column(String(30), index=True)
    primary_signal: Mapped[str] = mapped_column(Text)


class SpiderCityStatRecord(Base):
    __tablename__ = "spider_city_stats"

    city: Mapped[str] = mapped_column(String(50), primary_key=True)
    store_count: Mapped[int] = mapped_column(Integer)
    market_heat: Mapped[str] = mapped_column(String(30), index=True)
    competition_level: Mapped[str] = mapped_column(String(30), index=True)
    top_brands: Mapped[list[str]] = mapped_column(JSON, default=list)


class SpiderNewsRecord(Base):
    __tablename__ = "spider_news_samples"

    news_id: Mapped[str] = mapped_column(String(30), primary_key=True)
    brand_name: Mapped[str] = mapped_column(String(100), index=True)
    title: Mapped[str] = mapped_column(String(240))
    source: Mapped[str] = mapped_column(String(80))
    published_at: Mapped[str] = mapped_column(String(30), index=True)
    sentiment: Mapped[str] = mapped_column(String(30), index=True)
    risk_signal: Mapped[str] = mapped_column(Text)


class BrandProfileRecord(Base):
    __tablename__ = "brand_profiles"

    brand_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    brand_name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    main_company: Mapped[str | None] = mapped_column(String(160), nullable=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    headquarters: Mapped[str | None] = mapped_column(String(80), nullable=True)
    listed_status: Mapped[str] = mapped_column(String(80), index=True)
    stock_code: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    store_count_estimate: Mapped[int] = mapped_column(Integer, default=0)
    price_band: Mapped[str | None] = mapped_column(String(80), nullable=True)
    main_cities: Mapped[list[str]] = mapped_column(JSON, default=list)
    brand_positioning: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    query_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    updated_at: Mapped[date | None] = mapped_column(Date, nullable=True)


class MarketQuoteRecord(Base):
    __tablename__ = "market_quotes"

    quote_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brand_name: Mapped[str] = mapped_column(String(100), index=True)
    stock_code: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    market: Mapped[str | None] = mapped_column(String(50), nullable=True)
    current_price: Mapped[str | None] = mapped_column(String(80), nullable=True)
    change_percent: Mapped[str | None] = mapped_column(String(80), nullable=True)
    volume: Mapped[str | None] = mapped_column(String(80), nullable=True)
    market_cap: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pe_ratio: Mapped[str | None] = mapped_column(String(80), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(20), nullable=True)
    trade_date: Mapped[str | None] = mapped_column(String(30), index=True, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)


class NewsSentimentRecord(Base):
    __tablename__ = "news_sentiments"

    news_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brand_name: Mapped[str] = mapped_column(String(100), index=True)
    news_title: Mapped[str] = mapped_column(String(260))
    source_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    publish_date: Mapped[str | None] = mapped_column(String(30), index=True, nullable=True)
    sentiment: Mapped[str] = mapped_column(String(30), index=True, default="neutral")
    news_type: Mapped[str | None] = mapped_column(String(60), nullable=True)
    news_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_signal: Mapped[str | None] = mapped_column(Text, nullable=True)
    news_url: Mapped[str | None] = mapped_column(String(500), nullable=True)


class CityStoreDistributionRecord(Base):
    __tablename__ = "city_store_distributions"

    distribution_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    city: Mapped[str] = mapped_column(String(80), index=True)
    brand_name: Mapped[str] = mapped_column(String(100), index=True)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    store_count_estimate: Mapped[int] = mapped_column(Integer, default=0)
    sample_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    source_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)


class FranchisePolicyRecord(Base):
    __tablename__ = "franchise_policies"

    policy_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brand_name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    is_franchise_available: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    franchise_fee: Mapped[str | None] = mapped_column(String(100), nullable=True)
    deposit: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_investment_range: Mapped[str | None] = mapped_column(String(160), nullable=True)
    estimated_payback_period: Mapped[str | None] = mapped_column(String(120), nullable=True)
    area_protection_policy: Mapped[str | None] = mapped_column(String(180), nullable=True)
    franchise_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)


class RegionCompetitionRecord(Base):
    __tablename__ = "region_competitions"

    competition_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    city: Mapped[str] = mapped_column(String(80), index=True)
    target_brand: Mapped[str] = mapped_column(String(100), index=True)
    same_category_store_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    major_competitors: Mapped[list[str]] = mapped_column(JSON, default=list)
    competition_level: Mapped[str | None] = mapped_column(String(50), index=True, nullable=True)
    market_heat: Mapped[str | None] = mapped_column(String(50), nullable=True)
    opportunity_points: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_points: Mapped[str | None] = mapped_column(Text, nullable=True)


class SourceRegistryRecord(Base):
    __tablename__ = "source_registry"

    source_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dataset_name: Mapped[str] = mapped_column(String(100), index=True)
    source_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    collect_method: Mapped[str | None] = mapped_column(String(120), nullable=True)
    update_frequency: Mapped[str | None] = mapped_column(String(80), nullable=True)
    owner_role: Mapped[str | None] = mapped_column(String(80), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
