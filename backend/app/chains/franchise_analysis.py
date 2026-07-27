import json

from langchain_core.prompts import ChatPromptTemplate

from app.agents.schemas import (
    BrandIdentity,
    Evidence,
    FranchiseAnalysisResult,
    FranchiseRiskDimension,
    ToolTrace,
    UnifiedToolResult,
)
from app.core.config import settings
from app.llm.factory import create_chat_model
from app.prompts.franchise_analysis import FRANCHISE_ANALYSIS_SYSTEM_PROMPT


def _unique_evidence(results: dict[str, list[UnifiedToolResult]]) -> list[Evidence]:
    items: dict[str, Evidence] = {}
    for result_list in results.values():
        for result in result_list:
            for evidence in result.evidence:
                items[evidence.evidence_id] = evidence
    return list(items.values())


def _latest(results: dict[str, list[UnifiedToolResult]], name: str) -> UnifiedToolResult | None:
    values = results.get(name) or []
    return values[-1] if values else None


FIELD_LABELS = {
    "deposit": "加盟保证金及退还规则",
    "estimated_payback_period": "回本周期及测算依据",
    "franchise_fee": "加盟费用明细",
}


def _present_missing_fields(fields: list[str]) -> list[str]:
    labels = [FIELD_LABELS.get(field, field) for field in fields]
    # “门店数”已包含在更完整的“门店与竞争数据”中，课程展示时只保留后一项。
    if any("门店与竞争数据" in item for item in labels):
        labels = [item for item in labels if not ("门店数" in item and "门店与竞争数据" not in item)]
    return list(dict.fromkeys(labels))


def build_local_analysis(
    *,
    brand_id: str,
    brand_name: str,
    city: str,
    results: dict[str, list[UnifiedToolResult]],
    trace: list[ToolTrace],
    degraded: bool,
) -> FranchiseAnalysisResult:
    risk_result = _latest(results, "calculate_franchise_risk")
    risk_data = risk_result.data if risk_result else {}
    dimensions = [FranchiseRiskDimension(**item) for item in risk_data.get("dimensions", [])]
    evidence = _unique_evidence(results)
    raw_missing = sorted(
        {
            field
            for result_list in results.values()
            for result in result_list
            for field in result.missing_fields
        }
    )
    missing = _present_missing_fields(raw_missing)
    region_result = _latest(results, "analyze_region")
    policy_result = _latest(results, "get_franchise_policy")

    risks = [
        f"{item.name}得分为{item.score:.1f}，{item.explanation}"
        for item in dimensions
        if item.score >= 55
    ]
    if missing:
        risks.append("系统已形成进一步核验清单，可结合官方资料和实地调研完善开店方案。")
    opportunities: list[str] = []
    if region_result:
        region = region_result.data.get("region") or {}
        opportunities.extend(region.get("opportunity_points") or [])
    if policy_result and (policy_result.data.get("policy") or {}).get("is_franchise_available"):
        opportunities.append("现有样例显示品牌开放加盟，可进一步向官方申请完整招商资料。")
    opportunities = list(dict.fromkeys(opportunities)) or ["补齐真实点位和成本数据后，可开展保守、基准和乐观三种情景测算。"]

    due_diligence = [
        "品牌当前是否正式开放该城市加盟，官方费用清单和合同版本是什么？",
        f"{city}目标商圈内同品牌及同品类门店数量、距离和外卖覆盖重叠是多少？",
        "总投资是否包含租金、押金、转让费、装修、设备、物料和三个月流动资金？",
        "区域保护、指定采购、调价、续约、退出和保证金退还条款如何约定？",
        "保守订单量下的现金流、盈亏平衡点和最长可承受亏损期是多少？",
    ]
    overall = float(risk_data.get("overall_risk_score", 75 if missing else 55))
    level = str(risk_data.get("risk_level", "高风险" if overall >= 70 else "中风险"))
    status = "insufficient_data" if missing else "degraded" if degraded else "success"
    summary = (
        f"{brand_name}在{city}的加盟风险规则分为{overall:.2f}，等级为{level}。"
        f"本次已完成五维风险评估，取得{len(evidence)}条可追溯证据，并形成{len(missing)}项进一步核验建议。"
    )
    return FranchiseAnalysisResult(
        status=status,
        brand=BrandIdentity(brand_id=brand_id, brand_name=brand_name),
        city=city,
        executive_summary=summary,
        overall_risk_score=overall,
        risk_level=level,
        dimensions=dimensions,
        major_risks=risks or ["现有规则未发现高分单项，但仍需核验真实合同、点位与现金流。"],
        opportunities=opportunities,
        evidence=evidence,
        missing_data=missing,
        due_diligence_questions=due_diligence,
        tool_trace=trace,
    )


def run_analysis_chain(
    *,
    question: str,
    local_result: FranchiseAnalysisResult,
    tool_results: dict[str, list[UnifiedToolResult]],
) -> FranchiseAnalysisResult:
    if not settings.deepseek_api_key:
        return local_result
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", FRANCHISE_ANALYSIS_SYSTEM_PROMPT),
            (
                "human",
                "用户问题：{question}\n规则结果：{local_result}\n工具事实：{tool_results}\n"
                "请保持规则分数不变，输出 FranchiseAnalysisResult。",
            ),
        ]
    )
    try:
        chain = prompt | create_chat_model(temperature=0).with_structured_output(FranchiseAnalysisResult)
        result = chain.invoke(
            {
                "question": question,
                "local_result": local_result.model_dump_json(),
                "tool_results": json.dumps(
                    {
                        key: [item.model_dump(mode="json") for item in values]
                        for key, values in tool_results.items()
                    },
                    ensure_ascii=False,
                ),
            }
        )
        return result.model_copy(
            update={
                "overall_risk_score": local_result.overall_risk_score,
                "risk_level": local_result.risk_level,
                "dimensions": local_result.dimensions,
                "evidence": local_result.evidence,
                "missing_data": local_result.missing_data,
                "due_diligence_questions": local_result.due_diligence_questions,
                "tool_trace": local_result.tool_trace,
                "status": local_result.status if local_result.missing_data else result.status,
            }
        )
    except Exception:
        return local_result.model_copy(update={"status": "degraded" if not local_result.missing_data else "insufficient_data"})
