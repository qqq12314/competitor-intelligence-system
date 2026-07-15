from datetime import date

from sqlalchemy import Boolean, Date, Float, Integer, JSON, String, Text
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
