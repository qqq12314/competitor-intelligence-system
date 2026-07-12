from app.models.merchant import MerchantProfile
from app.models.risk import RiskAssessment


def generate_markdown_report(merchant: MerchantProfile, assessment: RiskAssessment) -> str:
    dimensions = "\n".join(
        f"| {item.dimension} | {item.score:.1f} | {item.explanation} |"
        for item in assessment.dimension_scores
    )
    risks = "\n".join(f"- {item}" for item in assessment.main_risk_factors)
    strengths = "\n".join(f"- {item}" for item in assessment.business_strengths)
    watchlist = "\n".join(f"- {item}" for item in assessment.post_loan_watchlist)

    return f"""# 小微商户信贷风控分析报告

## 一、商户基本信息

- 商户名称：{merchant.merchant_name}
- 所属品牌：{merchant.brand_name}
- 所在区域：{merchant.city}{merchant.district}
- 商圈类型：{merchant.business_area_type}
- 开店时长：{merchant.opening_months} 个月
- 加盟属性：{merchant.franchise_type}

## 二、经营数据摘要

- 月流水：{merchant.monthly_revenue:.0f} 元
- 客单价：{merchant.average_ticket:.1f} 元
- 外卖评分：{merchant.takeaway_rating:.1f}
- 租金占比：{merchant.rent_ratio:.1%}
- 人工成本占比：{merchant.labor_cost_ratio:.1%}
- 采购成本占比：{merchant.purchase_cost_ratio:.1%}
- 周边竞品数量：{merchant.competitor_density}

## 三、风控评分结果

- 综合风险分：{assessment.total_score}
- 风险等级：{assessment.risk_level}
- 授信建议：{assessment.credit_suggestion}

| 维度 | 得分 | 解释 |
| --- | ---: | --- |
{dimensions}

## 四、主要风险因子

{risks}

## 五、经营优势

{strengths}

## 六、贷后关注事项

{watchlist}

## 七、数据来源与局限说明

本报告基于样例经营数据、品牌信息、合同风险标签和规则评分模型生成，仅用于课程项目演示和辅助分析。正式金融业务中仍需结合征信、流水原件、纳税、工商、司法、现场尽调和人工审批结论。
"""

