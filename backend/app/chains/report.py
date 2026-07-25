from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from app.agents.schemas import FranchiseAnalysisResult
from app.core.config import settings
from app.llm.factory import create_chat_model
from app.prompts.report import FRANCHISE_REPORT_SYSTEM_PROMPT


def build_local_report(result: FranchiseAnalysisResult) -> str:
    dimensions = "\n".join(
        f"| {item.name} | {item.score:.1f} | {item.weight:.0%} | {item.explanation} |"
        for item in result.dimensions
    )
    risks = "\n".join(f"- {item}" for item in result.major_risks)
    opportunities = "\n".join(f"- {item}" for item in result.opportunities)
    evidence = "\n".join(
        f"- [{item.evidence_id}] {item.title}：{item.excerpt[:160]}（{item.source_url or '无公开URL'}）"
        for item in result.evidence
    ) or "- 暂无可用 RAG 证据。"
    missing = "\n".join(f"- {item}" for item in result.missing_data) or "- 暂无已识别缺失项。"
    questions = "\n".join(f"{index}. {item}" for index, item in enumerate(result.due_diligence_questions, start=1))
    return f"""# {result.brand.brand_name}在{result.city}的加盟风险分析报告

## 执行摘要

{result.executive_summary}

- 风险总分：{result.overall_risk_score:.2f}
- 风险等级：{result.risk_level}
- 数据状态：{result.status}

## 五维风险

| 维度 | 风险分 | 权重 | 解释 |
| --- | ---: | ---: | --- |
{dimensions}

## 关键风险

{risks}

## 机会点

{opportunities}

## 证据

{evidence}

## 缺失数据

{missing}

## 加盟前尽调问题

{questions}

## 免责声明

{result.disclaimer}
"""


def run_report_chain(result: FranchiseAnalysisResult) -> str:
    fallback = build_local_report(result)
    if not settings.deepseek_api_key:
        return fallback
    prompt = ChatPromptTemplate.from_messages(
        [("system", FRANCHISE_REPORT_SYSTEM_PROMPT), ("human", "{analysis}")]
    )
    try:
        chain = prompt | create_chat_model(temperature=0.1) | StrOutputParser()
        return chain.invoke({"analysis": result.model_dump_json()})
    except Exception:
        return fallback
