from pydantic import BaseModel, Field


class AIRiskExplanation(BaseModel):
    source: str = Field(description="deepseek or local_rules")
    summary: str
    risk_points: list[str]
    credit_suggestion: str
    business_suggestions: list[str]
    follow_up_data: list[str]
    token_saving_note: str
