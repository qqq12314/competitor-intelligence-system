from app.models.merchant import MerchantProfile
from app.models.risk import RiskAssessment, RiskDimensionScore


def _clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


def _level(score: float) -> str:
    if score >= 80:
        return "低风险"
    if score >= 65:
        return "中低风险"
    if score >= 50:
        return "中风险"
    return "高风险"


def score_merchant(merchant: MerchantProfile) -> RiskAssessment:
    operating_score = _clamp(
        45
        + min(merchant.opening_months, 36) * 0.8
        + (merchant.takeaway_rating - 3.5) * 18
        + min(merchant.monthly_revenue / 10000, 20)
        - len(merchant.negative_review_keywords) * 3
    )
    financial_score = _clamp(
        100
        - merchant.rent_ratio * 120
        - merchant.labor_cost_ratio * 60
        - merchant.purchase_cost_ratio * 40
        - merchant.debt_ratio * 80
    )
    brand_score = _clamp(78 if merchant.franchise_type == "成熟加盟" else 66)
    competition_score = _clamp(100 - merchant.competitor_density * 5)
    contract_score = 52 if merchant.has_contract_risk else 86
    opinion_score = 58 if merchant.recent_public_opinion_risk else 84
    fulfillment_score = _clamp(merchant.takeaway_rating * 18 + 8)

    dimensions = [
        RiskDimensionScore(dimension="经营能力", score=operating_score, explanation="结合开店时长、评分、流水和差评关键词计算。"),
        RiskDimensionScore(dimension="财务压力", score=financial_score, explanation="租金、人工、采购和负债占比越高，财务得分越低。"),
        RiskDimensionScore(dimension="品牌稳定性", score=brand_score, explanation="成熟加盟品牌样本具有更强的基础稳定性。"),
        RiskDimensionScore(dimension="行业竞争", score=competition_score, explanation="周边竞品密度越高，竞争压力越大。"),
        RiskDimensionScore(dimension="合同风险", score=contract_score, explanation="存在合同风险样例时降低合同维度得分。"),
        RiskDimensionScore(dimension="舆情预警", score=opinion_score, explanation="近期负面舆情会影响贷后关注等级。"),
        RiskDimensionScore(dimension="渠道履约", score=fulfillment_score, explanation="以外卖评分近似反映履约质量。"),
    ]
    weights = {
        "经营能力": 0.22,
        "财务压力": 0.22,
        "品牌稳定性": 0.14,
        "行业竞争": 0.12,
        "合同风险": 0.12,
        "舆情预警": 0.10,
        "渠道履约": 0.08,
    }
    total_score = round(sum(item.score * weights[item.dimension] for item in dimensions), 2)

    main_risks: list[str] = []
    if merchant.rent_ratio >= 0.18:
        main_risks.append("租金占比较高，现金流安全垫偏薄")
    if merchant.debt_ratio >= 0.35:
        main_risks.append("负债占比较高，偿债压力需复核")
    if merchant.competitor_density >= 8:
        main_risks.append("周边竞品密度较高，价格战风险突出")
    if merchant.has_contract_risk:
        main_risks.append("合同条款存在潜在经营约束或违约风险")
    if merchant.recent_public_opinion_risk:
        main_risks.append("近期存在品牌或门店舆情预警")

    strengths: list[str] = []
    if merchant.opening_months >= 18:
        strengths.append("开店时间较长，经营连续性较好")
    if merchant.takeaway_rating >= 4.6:
        strengths.append("外卖评分较高，用户反馈较稳定")
    if merchant.monthly_revenue >= 180000:
        strengths.append("月流水处于样本较高水平")

    if total_score >= 80:
        suggestion = "建议进入简化授信流程，可结合流水原件和征信信息复核额度。"
    elif total_score >= 65:
        suggestion = "建议审慎授信，控制额度并设置月度经营数据回访。"
    elif total_score >= 50:
        suggestion = "建议补充材料后再审，重点核验现金流、租约和负债情况。"
    else:
        suggestion = "暂不建议直接授信，应先完成人工尽调和风险缓释安排。"

    watchlist = [
        "月流水连续下降",
        "平台评分跌破 4.3",
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
        risk_level=_level(total_score),
        dimension_scores=dimensions,
        main_risk_factors=main_risks or ["未发现明显单点风险，仍需人工复核原始材料"],
        business_strengths=strengths or ["样例数据中暂无突出经营优势"],
        credit_suggestion=suggestion,
        post_loan_watchlist=watchlist,
    )

