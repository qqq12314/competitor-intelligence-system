from pydantic import BaseModel, Field


class RiskDimensionScore(BaseModel):
    dimension: str
    score: float = Field(ge=0, le=100)
    explanation: str


class RiskAssessment(BaseModel):
    merchant_id: str
    merchant_name: str
    total_score: float = Field(ge=0, le=100)
    risk_level: str
    dimension_scores: list[RiskDimensionScore]
    main_risk_factors: list[str]
    business_strengths: list[str]
    credit_suggestion: str
    post_loan_watchlist: list[str]

