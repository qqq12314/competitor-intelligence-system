from app.models.contract import ContractReviewRequest, ContractReviewResult, ContractRiskClause


KEYWORD_RULES = [
    ("违约责任", ["违约金", "赔偿", "逾期"], "中风险", "复核违约金比例和触发条件，避免责任过重。"),
    ("保证金", ["保证金", "押金", "不予退还"], "中风险", "明确退还时间、扣除条件和举证责任。"),
    ("加盟费用", ["加盟费", "管理费", "品牌使用费"], "中风险", "确认费用构成、续约规则和退费安排。"),
    ("单方解除", ["单方解除", "提前解除", "无条件解除"], "高风险", "限制单方解除适用范围，增加整改和通知期限。"),
    ("采购付款", ["预付款", "先款后货", "账期"], "中风险", "结合现金流压力设置合理账期和验收条件。"),
    ("争议解决", ["仲裁", "诉讼", "管辖"], "低风险", "确认争议解决地点和成本是否可承受。"),
]


def review_contract(payload: ContractReviewRequest) -> ContractReviewResult:
    text = payload.contract_text
    clauses: list[ContractRiskClause] = []

    for clause_type, keywords, risk_level, suggestion in KEYWORD_RULES:
        hit = next((keyword for keyword in keywords if keyword in text), None)
        if not hit:
            continue
        clauses.append(
            ContractRiskClause(
                clause_type=clause_type,
                risk_level=risk_level,
                evidence=f"命中关键词：{hit}",
                explanation=f"合同文本包含{clause_type}相关内容，需要结合金额、期限和触发条件判断对商户现金流的影响。",
                suggestion=suggestion,
            )
        )

    if any(item.risk_level == "高风险" for item in clauses):
        overall = "高风险"
    elif len(clauses) >= 3:
        overall = "中风险"
    elif clauses:
        overall = "低风险"
    else:
        overall = "未识别明显风险"

    return ContractReviewResult(
        contract_type=payload.contract_type,
        overall_risk_level=overall,
        clauses=clauses,
        summary="本结果为合同风险提示样例，不替代专业法律意见；正式授信前应由人工复核原文。",
    )

