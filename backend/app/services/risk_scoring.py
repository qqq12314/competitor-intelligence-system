from app.core.risk_config import RiskLevelRule, RiskScoringConfig, get_risk_scoring_config
from app.models.merchant import MerchantProfile
from app.models.risk import RiskAssessment, RiskDimensionScore


def _clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


def _risk_level_rule(score: float, config: RiskScoringConfig) -> RiskLevelRule:
    return next(rule for rule in config.risk_levels if score >= rule.minimum_score)


def score_merchant(
    merchant: MerchantProfile,
    config: RiskScoringConfig | None = None,
) -> RiskAssessment:
    config = config or get_risk_scoring_config()
    params = config.score_parameters

    operating_score = _clamp(
        params.operating_base
        + min(merchant.opening_months, params.opening_month_cap) * params.opening_month_factor
        + (merchant.takeaway_rating - params.rating_baseline) * params.rating_factor
        + min(merchant.monthly_revenue / params.revenue_unit, params.revenue_bonus_cap)
        - len(merchant.negative_review_keywords) * params.negative_keyword_penalty
    )
    financial_score = _clamp(
        100
        - merchant.rent_ratio * params.rent_penalty
        - merchant.labor_cost_ratio * params.labor_penalty
        - merchant.purchase_cost_ratio * params.purchase_penalty
        - merchant.debt_ratio * params.debt_penalty
    )
    brand_score = (
        params.mature_brand_score
        if merchant.franchise_type == "成熟加盟"
        else params.other_brand_score
    )
    competition_score = _clamp(
        params.competition_base - merchant.competitor_density * params.competitor_penalty
    )
    contract_score = (
        params.contract_risk_score if merchant.has_contract_risk else params.contract_normal_score
    )
    opinion_score = (
        params.opinion_risk_score
        if merchant.recent_public_opinion_risk
        else params.opinion_normal_score
    )
    fulfillment_score = _clamp(
        merchant.takeaway_rating * params.fulfillment_rating_factor + params.fulfillment_base
    )

    dimensions = [
        RiskDimensionScore(
            dimension="经营能力",
            score=round(operating_score, 2),
            explanation="结合开店时长、外卖评分、月流水和差评关键词计算。",
        ),
        RiskDimensionScore(
            dimension="财务压力",
            score=round(financial_score, 2),
            explanation="租金、人工、采购和负债占比越高，财务得分越低。",
        ),
        RiskDimensionScore(
            dimension="品牌稳定性",
            score=round(brand_score, 2),
            explanation="成熟加盟品牌样本具有更强的基础稳定性。",
        ),
        RiskDimensionScore(
            dimension="行业竞争",
            score=round(competition_score, 2),
            explanation="周边竞品密度越高，行业竞争得分越低。",
        ),
        RiskDimensionScore(
            dimension="合同风险",
            score=round(contract_score, 2),
            explanation="存在合同风险标记时降低合同维度得分。",
        ),
        RiskDimensionScore(
            dimension="舆情预警",
            score=round(opinion_score, 2),
            explanation="近期负面舆情会降低舆情维度得分并增加贷后关注。",
        ),
        RiskDimensionScore(
            dimension="渠道履约",
            score=round(fulfillment_score, 2),
            explanation="以外卖评分近似反映渠道履约和用户服务质量。",
        ),
    ]
    total_score = round(
        sum(item.score * config.dimensions[item.dimension] for item in dimensions),
        2,
    )
    level_rule = _risk_level_rule(total_score, config)

    risk_thresholds = config.risk_thresholds
    main_risks: list[str] = []
    if merchant.rent_ratio >= risk_thresholds.high_rent_ratio:
        main_risks.append("租金占比较高，现金流安全垫偏薄")
    if merchant.debt_ratio >= risk_thresholds.high_debt_ratio:
        main_risks.append("负债占比较高，偿债压力需复核")
    if merchant.competitor_density >= risk_thresholds.high_competitor_density:
        main_risks.append("周边竞品密度较高，价格竞争风险突出")
    if merchant.has_contract_risk:
        main_risks.append("合同条款存在潜在经营约束或违约风险")
    if merchant.recent_public_opinion_risk:
        main_risks.append("近期存在品牌或门店舆情预警")

    strength_thresholds = config.strength_thresholds
    strengths: list[str] = []
    if merchant.opening_months >= strength_thresholds.stable_opening_months:
        strengths.append("开店时间较长，经营连续性较好")
    if merchant.takeaway_rating >= strength_thresholds.strong_takeaway_rating:
        strengths.append("外卖评分较高，用户反馈较稳定")
    if merchant.monthly_revenue >= strength_thresholds.strong_monthly_revenue:
        strengths.append("月流水处于样本较高水平")

    watchlist = [
        "月流水连续下降",
        f"平台评分跌破 {config.watch_thresholds.takeaway_rating_floor:.1f}",
        "租金或人工成本显著上升",
    ]
    if merchant.recent_public_opinion_risk:
        watchlist.append("品牌负面舆情扩散")
    if merchant.has_contract_risk:
        watchlist.append("合同违约或提前解约触发")

    return RiskAssessment(
        merchant_id=merchant.merchant_id,
        merchant_name=merchant.merchant_name,
        total_score=total_score,
        risk_level=level_rule.level,
        dimension_scores=dimensions,
        main_risk_factors=main_risks or ["未发现明显单点风险，仍需人工复核原始材料"],
        business_strengths=strengths or ["样例数据中暂无突出经营优势"],
        credit_suggestion=level_rule.credit_suggestion,
        post_loan_watchlist=watchlist,
    )
