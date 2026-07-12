from pydantic import BaseModel, Field


class MerchantProfile(BaseModel):
    merchant_id: str
    merchant_name: str
    brand_name: str
    city: str
    district: str
    business_area_type: str
    opening_months: int = Field(ge=0)
    average_ticket: float = Field(ge=0)
    takeaway_rating: float = Field(ge=0, le=5)
    monthly_revenue: float = Field(ge=0)
    rent_ratio: float = Field(ge=0, le=1)
    labor_cost_ratio: float = Field(ge=0, le=1)
    purchase_cost_ratio: float = Field(ge=0, le=1)
    debt_ratio: float = Field(ge=0, le=1)
    competitor_density: int = Field(ge=0)
    negative_review_keywords: list[str] = []
    franchise_type: str
    has_contract_risk: bool = False
    recent_public_opinion_risk: bool = False

