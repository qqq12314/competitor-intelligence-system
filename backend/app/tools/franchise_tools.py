import json
import re
import time
from collections.abc import Callable
from typing import Any

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.agents.schemas import Evidence, SourceReference, ToolTrace, UnifiedToolResult
from app.rag.retriever import search_knowledge
from app.services.brand_intel import get_brand_intel, get_region_intel, list_brand_intel


class BrandSearchInput(BaseModel):
    query: str = Field(description="品牌名称、别名或品牌关键词")


class BrandIdInput(BaseModel):
    brand_id: str


class RegionInput(BaseModel):
    brand_id: str
    city: str


class KnowledgeInput(BaseModel):
    query: str
    brand_id: str | None = None
    city: str | None = None
    document_type: str | None = None


class RiskInput(BaseModel):
    brand_id: str
    city: str
    evidence_ids: list[str] = Field(default_factory=list)


def _source(name: str, url: str | None, credibility: str = "medium") -> SourceReference:
    return SourceReference(source_name=name, source_url=url, credibility_level=credibility)


def _json(result: UnifiedToolResult) -> str:
    return result.model_dump_json(exclude_none=True)


def _extract_number(value: str | None) -> list[float]:
    if not value:
        return []
    return [float(item) for item in re.findall(r"\d+(?:\.\d+)?", value)]


class ToolExecutionCollector:
    def __init__(self):
        self.results: dict[str, list[UnifiedToolResult]] = {}
        self.trace: list[ToolTrace] = []

    def run(self, tool_name: str, inputs: dict[str, Any], fn: Callable[[], UnifiedToolResult]) -> str:
        started = time.perf_counter()
        try:
            result = fn()
        except Exception as exc:
            result = UnifiedToolResult(status="error", error=str(exc), missing_fields=["tool_execution"])
        duration = int((time.perf_counter() - started) * 1000)
        self.results.setdefault(tool_name, []).append(result)
        summary = (
            f"data={len(result.data)} evidence={len(result.evidence)} missing={len(result.missing_fields)}"
            if result.status != "error"
            else result.error or "tool error"
        )
        self.trace.append(
            ToolTrace(
                tool_name=tool_name,
                input_summary=json.dumps(inputs, ensure_ascii=False)[:240],
                status=result.status,
                duration_ms=duration,
                output_summary=summary,
            )
        )
        return _json(result)


def build_franchise_tools(session: Session, collector: ToolExecutionCollector) -> list[StructuredTool]:
    def search_brand_impl(query: str) -> str:
        def execute() -> UnifiedToolResult:
            brands = list_brand_intel(keyword=query, scenario="franchise", session=session)
            if not brands:
                return UnifiedToolResult(status="insufficient_data", missing_fields=["brand"])
            data = {
                "matches": [
                    {
                        "brand_id": item.brand_id,
                        "brand_name": item.brand_name,
                        "category": item.category,
                        "price_band": item.price_band,
                    }
                    for item in brands[:5]
                ]
            }
            return UnifiedToolResult(status="success", data=data)

        return collector.run("search_brand", {"query": query}, execute)

    def get_policy_impl(brand_id: str) -> str:
        def execute() -> UnifiedToolResult:
            try:
                brand = get_brand_intel(brand_id, session)
            except KeyError:
                return UnifiedToolResult(status="insufficient_data", missing_fields=["brand"])
            policy = brand.franchise_policy
            if not policy:
                return UnifiedToolResult(status="insufficient_data", missing_fields=["franchise_policy"])
            missing = [
                field
                for field in ("franchise_fee", "deposit", "total_investment_range", "estimated_payback_period", "area_protection_policy")
                if not getattr(policy, field)
            ]
            source = _source("加盟政策数据", policy.source_url, "low" if policy.note and "第三方" in policy.note else "medium")
            return UnifiedToolResult(
                status="insufficient_data" if missing else "success",
                data={"brand_id": brand.brand_id, "brand_name": brand.brand_name, "policy": policy.model_dump()},
                sources=[source],
                missing_fields=missing,
            )

        return collector.run("get_franchise_policy", {"brand_id": brand_id}, execute)

    def analyze_region_impl(brand_id: str, city: str) -> str:
        def execute() -> UnifiedToolResult:
            try:
                target = get_brand_intel(brand_id, session)
                target_name = target.brand_name
            except KeyError:
                target = None
                target_name = brand_id
            try:
                region = get_region_intel(city, session)
            except LookupError:
                return UnifiedToolResult(
                    status="insufficient_data",
                    data={"brand_id": brand_id, "city": city},
                    missing_fields=[
                        f"{city}城市门店分布",
                        f"{city}地区竞争数据",
                        f"{target_name}在{city}的门店与竞争数据",
                    ],
                )
            if target:
                target_has_city_data = any(
                    item.city == city and item.target_brand == target_name
                    for item in target.region_competition
                )
            else:
                target_has_city_data = False
            missing = [] if target_has_city_data else [f"{target_name}在{city}的门店数"]
            return UnifiedToolResult(
                status="insufficient_data" if missing else "success",
                data={"brand_id": brand_id, "city": city, "region": region.model_dump()},
                sources=[_source("城市门店与竞争样例", None, "medium")],
                missing_fields=missing,
            )

        return collector.run("analyze_region", {"brand_id": brand_id, "city": city}, execute)

    def sentiment_impl(brand_id: str) -> str:
        def execute() -> UnifiedToolResult:
            try:
                brand = get_brand_intel(brand_id, session)
            except KeyError:
                return UnifiedToolResult(status="insufficient_data", missing_fields=["brand"])
            news = [item.model_dump() for item in brand.news]
            sources = [_source(item.source_name, item.news_url, "medium") for item in brand.news]
            if not news:
                return UnifiedToolResult(status="insufficient_data", missing_fields=["franchise_sentiment"])
            return UnifiedToolResult(
                status="success",
                data={"brand_id": brand_id, "brand_name": brand.brand_name, "news": news},
                sources=sources,
            )

        return collector.run("get_franchise_sentiment", {"brand_id": brand_id}, execute)

    def knowledge_impl(query: str, brand_id: str | None = None, city: str | None = None, document_type: str | None = None) -> str:
        def execute() -> UnifiedToolResult:
            evidence = search_knowledge(
                query,
                brand_id=brand_id,
                city=city,
                document_type=document_type,
            )
            if not evidence:
                return UnifiedToolResult(status="insufficient_data", missing_fields=["rag_evidence"])
            return UnifiedToolResult(
                status="success",
                data={"query": query, "result_count": len(evidence)},
                evidence=evidence,
                sources=[
                    _source(item.title, item.source_url, item.credibility_level) for item in evidence
                ],
            )

        inputs = {"query": query, "brand_id": brand_id, "city": city, "document_type": document_type}
        return collector.run("search_franchise_knowledge", inputs, execute)

    def risk_impl(brand_id: str, city: str, evidence_ids: list[str] | None = None) -> str:
        def execute() -> UnifiedToolResult:
            try:
                brand = get_brand_intel(brand_id, session)
            except KeyError:
                return UnifiedToolResult(status="insufficient_data", missing_fields=["brand"])
            policy = brand.franchise_policy
            missing: list[str] = []
            if not policy:
                missing.append("franchise_policy")
            else:
                for field in ("franchise_fee", "deposit", "total_investment_range", "estimated_payback_period", "area_protection_policy"):
                    if not getattr(policy, field):
                        missing.append(field)

            policy_risk = 35.0 if policy and policy.is_franchise_available else 85.0
            if policy and policy.note and ("第三方" in policy.note or "演示" in policy.note):
                policy_risk += 12

            costs = _extract_number(policy.total_investment_range if policy else None)
            cost_risk = 48.0 if costs else 75.0
            if costs and max(costs) >= 60:
                cost_risk += 8

            try:
                region = get_region_intel(city, session)
                region_risk = region.franchise_risk_score
                target_has_city_data = any(item.city == city for item in brand.region_competition)
                if not target_has_city_data:
                    missing.append(f"{brand.brand_name}在{city}的门店与竞争数据")
            except LookupError:
                region = None
                region_risk = 88.0
                missing.extend(
                    [
                        f"{city}城市门店分布",
                        f"{city}地区竞争数据",
                        f"{brand.brand_name}在{city}的门店与竞争数据",
                    ]
                )

            negative_news = sum(1 for item in brand.news if item.sentiment == "negative")
            sentiment_risk = min(35 + negative_news * 18, 90)
            required_fields = 8
            data_completeness_risk = min(20 + len(set(missing)) / required_fields * 80, 100)

            dimensions = [
                {"name": "品牌与政策风险", "score": round(min(policy_risk, 100), 2), "weight": 0.25, "explanation": "依据加盟开放状态、政策来源和区域保护完整性计算。"},
                {"name": "地区竞争风险", "score": round(min(region_risk, 100), 2), "weight": 0.25, "explanation": "依据目标城市门店密度和竞品竞争数据计算；缺失时提高风险。"},
                {"name": "成本与回本风险", "score": round(min(cost_risk, 100), 2), "weight": 0.20, "explanation": "依据总投资和回本周期是否可核验计算。"},
                {"name": "舆情与经营风险", "score": round(min(sentiment_risk, 100), 2), "weight": 0.15, "explanation": "依据加盟相关新闻和负面经营信号计算。"},
                {"name": "数据完整性风险", "score": round(data_completeness_risk, 2), "weight": 0.15, "explanation": "依据政策、费用、周期和目标城市数据缺口计算。"},
            ]
            overall = round(sum(item["score"] * item["weight"] for item in dimensions), 2)
            level = "高风险" if overall >= 70 else "中风险" if overall >= 50 else "中低风险"
            return UnifiedToolResult(
                status="insufficient_data" if missing else "success",
                data={
                    "brand_id": brand_id,
                    "brand_name": brand.brand_name,
                    "city": city,
                    "overall_risk_score": overall,
                    "risk_level": level,
                    "dimensions": dimensions,
                    "evidence_ids": evidence_ids or [],
                },
                sources=[_source("加盟风险规则引擎", None, "high")],
                missing_fields=sorted(set(missing)),
            )

        inputs = {"brand_id": brand_id, "city": city, "evidence_ids": evidence_ids or []}
        return collector.run("calculate_franchise_risk", inputs, execute)

    return [
        StructuredTool.from_function(search_brand_impl, name="search_brand", description="识别品牌名称或别名，返回品牌ID、品牌名和品类。", args_schema=BrandSearchInput),
        StructuredTool.from_function(get_policy_impl, name="get_franchise_policy", description="查询品牌加盟开放状态、费用、投入、回本周期、区域保护和来源。", args_schema=BrandIdInput),
        StructuredTool.from_function(analyze_region_impl, name="analyze_region", description="分析指定城市的门店密度、竞品、市场热度、机会和风险；没有城市数据时明确返回不足。", args_schema=RegionInput),
        StructuredTool.from_function(sentiment_impl, name="get_franchise_sentiment", description="查询品牌加盟纠纷、食品安全、闭店、投诉和经营舆情样例及来源。", args_schema=BrandIdInput),
        StructuredTool.from_function(knowledge_impl, name="search_franchise_knowledge", description="从Chroma知识库检索政策、新闻、合同、法规和行业原文证据。", args_schema=KnowledgeInput),
        StructuredTool.from_function(risk_impl, name="calculate_franchise_risk", description="使用固定五维规则计算加盟风险总分和维度分；大模型不得修改。", args_schema=RiskInput),
    ]
