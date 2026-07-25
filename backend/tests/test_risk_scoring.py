from copy import deepcopy

import pytest
from pydantic import ValidationError

from app.core.risk_config import RiskScoringConfig, get_risk_scoring_config
from app.models.merchant import MerchantProfile
from app.services.risk_scoring import score_merchant


def merchant(**overrides) -> MerchantProfile:
    data = {
        "merchant_id": "TEST001",
        "merchant_name": "测试门店",
        "brand_name": "测试品牌",
        "city": "天津",
        "district": "南开区",
        "business_area_type": "社区商业",
        "opening_months": 18,
        "average_ticket": 16,
        "takeaway_rating": 4.5,
        "monthly_revenue": 160000,
        "rent_ratio": 0.15,
        "labor_cost_ratio": 0.18,
        "purchase_cost_ratio": 0.3,
        "debt_ratio": 0.25,
        "competitor_density": 7,
        "negative_review_keywords": [],
        "franchise_type": "成熟加盟",
        "has_contract_risk": False,
        "recent_public_opinion_risk": False,
    }
    data.update(overrides)
    return MerchantProfile(**data)


def test_weights_sum_to_one_and_have_seven_dimensions() -> None:
    config = get_risk_scoring_config()
    assert len(config.dimensions) == 7
    assert sum(config.dimensions.values()) == pytest.approx(1.0)


def test_invalid_weight_total_is_rejected() -> None:
    payload = deepcopy(get_risk_scoring_config().model_dump())
    payload["dimensions"]["经营能力"] = 0.5
    with pytest.raises(ValidationError, match="权重合计"):
        RiskScoringConfig.model_validate(payload)


def test_scores_are_clamped_to_zero_and_one_hundred() -> None:
    result = score_merchant(
        merchant(
            opening_months=999,
            takeaway_rating=5,
            monthly_revenue=9999999,
            rent_ratio=1,
            labor_cost_ratio=1,
            purchase_cost_ratio=1,
            debt_ratio=1,
            competitor_density=999,
        )
    )
    assert 0 <= result.total_score <= 100
    assert all(0 <= item.score <= 100 for item in result.dimension_scores)


def test_low_risk_profile() -> None:
    result = score_merchant(
        merchant(
            opening_months=48,
            takeaway_rating=5,
            monthly_revenue=400000,
            rent_ratio=0.05,
            labor_cost_ratio=0.08,
            purchase_cost_ratio=0.15,
            debt_ratio=0.02,
            competitor_density=0,
        )
    )
    assert result.risk_level == "低风险"
    assert result.total_score >= 80


def test_high_risk_profile() -> None:
    result = score_merchant(
        merchant(
            opening_months=1,
            takeaway_rating=1,
            monthly_revenue=10000,
            rent_ratio=0.6,
            labor_cost_ratio=0.5,
            purchase_cost_ratio=0.6,
            debt_ratio=0.9,
            competitor_density=20,
            negative_review_keywords=["服务差", "配送慢", "食品安全"],
            franchise_type="自营单店",
            has_contract_risk=True,
            recent_public_opinion_risk=True,
        )
    )
    assert result.risk_level == "高风险"
    assert result.total_score < 50
    assert len(result.main_risk_factors) >= 5


def test_threshold_values_trigger_risk_factors() -> None:
    config = get_risk_scoring_config()
    result = score_merchant(
        merchant(
            rent_ratio=config.risk_thresholds.high_rent_ratio,
            debt_ratio=config.risk_thresholds.high_debt_ratio,
            competitor_density=config.risk_thresholds.high_competitor_density,
        )
    )
    joined = "；".join(result.main_risk_factors)
    assert "租金占比较高" in joined
    assert "负债占比较高" in joined
    assert "竞品密度较高" in joined


def test_dimension_order_and_chinese_text_are_stable() -> None:
    result = score_merchant(merchant())
    assert [item.dimension for item in result.dimension_scores] == [
        "经营能力",
        "财务压力",
        "品牌稳定性",
        "行业竞争",
        "合同风险",
        "舆情预警",
        "渠道履约",
    ]
    assert all("�" not in item.explanation for item in result.dimension_scores)
