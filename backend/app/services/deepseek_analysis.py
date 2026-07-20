import json
import urllib.error
import urllib.request

from app.core.config import settings
from app.models.ai import AIRiskExplanation
from app.models.merchant import MerchantProfile
from app.models.risk import RiskAssessment
from app.models.spider import MerchantMarketContext


def _local_explanation(
    merchant: MerchantProfile,
    assessment: RiskAssessment,
    context: MerchantMarketContext,
) -> AIRiskExplanation:
    risk_points = list(assessment.main_risk_factors[:3])
    if context.city_competition_level and "高" in context.city_competition_level:
        risk_points.append(f"{merchant.city}茶饮咖啡样本竞争水平为{context.city_competition_level}，存在客流分流压力。")
    if context.brand_risk_level and "中" in context.brand_risk_level:
        risk_points.append(f"{merchant.brand_name}公开样例风险为{context.brand_risk_level}，需结合单店经营资料复核。")

    business_suggestions = [
        "优先补充近6个月流水、平台订单和租金证明，验证现金流稳定性。",
        "结合商圈竞品密度调整授信额度，避免短期偿债压力过高。",
        "将合同剩余期限、租金上涨条款和加盟费用纳入贷前复核。",
    ]
    if merchant.takeaway_rating < 4.5:
        business_suggestions.append("关注平台评分和差评关键词，必要时增加贷后经营回访频率。")

    return AIRiskExplanation(
        source="local_rules",
        summary=(
            f"{merchant.merchant_name}综合风险分为{assessment.total_score:.2f}，等级为{assessment.risk_level}。"
            f"结合 TS 公开经营环境数据，当前判断重点应放在现金流真实性、区域竞争压力和合同稳定性。"
        ),
        risk_points=risk_points[:5],
        credit_suggestion=assessment.credit_suggestion,
        business_suggestions=business_suggestions[:5],
        follow_up_data=[
            "近6个月收款流水",
            "平台订单与复购数据",
            "租赁合同及剩余租期",
            "现有负债和本次贷款用途",
            "门店成本结构明细",
        ],
        token_saving_note="本结果未发送原始 CSV，仅使用后端聚合后的商户画像、评分结果和市场环境摘要。",
    )


def _extract_json(content: str) -> dict:
    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json\n", "", 1).replace("JSON\n", "", 1)
    return json.loads(cleaned)


def explain_risk(
    merchant: MerchantProfile,
    assessment: RiskAssessment,
    context: MerchantMarketContext,
) -> AIRiskExplanation:
    fallback = _local_explanation(merchant, assessment, context)
    if not settings.deepseek_api_key:
        return fallback

    payload = {
        "merchant": {
            "name": merchant.merchant_name,
            "city": merchant.city,
            "brand": merchant.brand_name,
            "monthly_revenue": merchant.monthly_revenue,
            "opening_months": merchant.opening_months,
            "debt_ratio": merchant.debt_ratio,
            "rent_ratio": merchant.rent_ratio,
            "takeaway_rating": merchant.takeaway_rating,
        },
        "risk_score": assessment.model_dump(),
        "market_context": context.model_dump(),
    }
    prompt = (
        "你是茶饮咖啡小微商户信贷风控分析助手。"
        "请只根据输入 JSON 输出专业、简洁、可展示在系统页面中的 JSON，"
        "字段必须包含 summary、risk_points、credit_suggestion、business_suggestions、follow_up_data。"
        "不要编造输入中没有的数据。"
    )
    request_body = json.dumps(
        {
            "model": settings.deepseek_model,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
            ],
            "temperature": 0.2,
            "max_tokens": 700,
            "response_format": {"type": "json_object"},
        },
        ensure_ascii=False,
    ).encode("utf-8")

    request = urllib.request.Request(
        f"{settings.deepseek_base_url.rstrip('/')}/chat/completions",
        data=request_body,
        headers={
            "Authorization": f"Bearer {settings.deepseek_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=settings.deepseek_timeout_seconds) as response:
            result = json.loads(response.read().decode("utf-8"))
        content = result["choices"][0]["message"]["content"]
        parsed = _extract_json(content)
        return AIRiskExplanation(
            source="deepseek",
            summary=parsed.get("summary", fallback.summary),
            risk_points=parsed.get("risk_points", fallback.risk_points),
            credit_suggestion=parsed.get("credit_suggestion", fallback.credit_suggestion),
            business_suggestions=parsed.get("business_suggestions", fallback.business_suggestions),
            follow_up_data=parsed.get("follow_up_data", fallback.follow_up_data),
            token_saving_note="DeepSeek 仅接收聚合摘要 JSON，未接收原始爬虫大表。",
        )
    except (KeyError, json.JSONDecodeError, urllib.error.URLError, TimeoutError):
        return fallback
