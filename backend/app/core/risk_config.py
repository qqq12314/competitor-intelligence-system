import json
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel, Field, model_validator

CONFIG_PATH = Path(__file__).resolve().parents[2] / "config" / "risk_scoring.json"


class ScoreParameters(BaseModel):
    operating_base: float
    opening_month_cap: int = Field(gt=0)
    opening_month_factor: float = Field(ge=0)
    rating_baseline: float = Field(ge=0, le=5)
    rating_factor: float = Field(ge=0)
    revenue_unit: float = Field(gt=0)
    revenue_bonus_cap: float = Field(ge=0)
    negative_keyword_penalty: float = Field(ge=0)
    rent_penalty: float = Field(ge=0)
    labor_penalty: float = Field(ge=0)
    purchase_penalty: float = Field(ge=0)
    debt_penalty: float = Field(ge=0)
    mature_brand_score: float = Field(ge=0, le=100)
    other_brand_score: float = Field(ge=0, le=100)
    competition_base: float
    competitor_penalty: float = Field(ge=0)
    contract_risk_score: float = Field(ge=0, le=100)
    contract_normal_score: float = Field(ge=0, le=100)
    opinion_risk_score: float = Field(ge=0, le=100)
    opinion_normal_score: float = Field(ge=0, le=100)
    fulfillment_rating_factor: float = Field(ge=0)
    fulfillment_base: float


class RiskLevelRule(BaseModel):
    minimum_score: float = Field(ge=0, le=100)
    level: str
    credit_suggestion: str


class RiskThresholds(BaseModel):
    high_rent_ratio: float = Field(ge=0, le=1)
    high_debt_ratio: float = Field(ge=0, le=1)
    high_competitor_density: int = Field(ge=0)


class StrengthThresholds(BaseModel):
    stable_opening_months: int = Field(ge=0)
    strong_takeaway_rating: float = Field(ge=0, le=5)
    strong_monthly_revenue: float = Field(ge=0)


class WatchThresholds(BaseModel):
    takeaway_rating_floor: float = Field(ge=0, le=5)


class RiskScoringConfig(BaseModel):
    version: str
    dimensions: dict[str, float]
    score_parameters: ScoreParameters
    risk_levels: list[RiskLevelRule]
    risk_thresholds: RiskThresholds
    strength_thresholds: StrengthThresholds
    watch_thresholds: WatchThresholds

    @model_validator(mode="after")
    def validate_scoring_config(self) -> "RiskScoringConfig":
        expected_dimensions = {
            "经营能力",
            "财务压力",
            "品牌稳定性",
            "行业竞争",
            "合同风险",
            "舆情预警",
            "渠道履约",
        }
        if set(self.dimensions) != expected_dimensions:
            raise ValueError("评分配置必须包含完整七维指标")
        if abs(sum(self.dimensions.values()) - 1.0) > 1e-9:
            raise ValueError("七维评分权重合计必须等于 1.0")
        if any(weight <= 0 for weight in self.dimensions.values()):
            raise ValueError("所有评分权重必须大于 0")
        minimum_scores = [rule.minimum_score for rule in self.risk_levels]
        if minimum_scores != sorted(minimum_scores, reverse=True):
            raise ValueError("风险等级必须按最低分从高到低排列")
        if not minimum_scores or minimum_scores[-1] != 0:
            raise ValueError("风险等级配置必须包含最低分 0")
        return self


@lru_cache
def get_risk_scoring_config() -> RiskScoringConfig:
    with CONFIG_PATH.open(encoding="utf-8") as file:
        return RiskScoringConfig.model_validate(json.load(file))
