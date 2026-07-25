import re
from time import perf_counter
from typing import Any

from langchain.agents import create_agent
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.tools import BaseTool
from sqlalchemy.orm import Session

from app.agents.schemas import FranchiseAgentRequest, FranchiseAgentResponse, UnifiedToolResult
from app.chains.franchise_analysis import build_local_analysis, run_analysis_chain
from app.chains.report import run_report_chain
from app.core.config import settings
from app.llm.factory import create_chat_model
from app.prompts.franchise_agent import FRANCHISE_AGENT_SYSTEM_PROMPT
from app.services.brand_intel import get_brand_intel, list_brand_intel
from app.tools.franchise_tools import ToolExecutionCollector, build_franchise_tools


class AgentCallbackHandler(BaseCallbackHandler):
    """Runtime evidence that LangChain callbacks are active for tool execution."""

    def __init__(self):
        self.events: list[dict[str, Any]] = []
        self._started: dict[str, float] = {}

    def on_tool_start(self, serialized: dict[str, Any], input_str: str, *, run_id, **kwargs):
        name = serialized.get("name", "unknown_tool")
        self._started[str(run_id)] = perf_counter()
        self.events.append({"event": "tool_start", "tool": name, "input": input_str[:240]})

    def on_tool_end(self, output: Any, *, run_id, **kwargs):
        started = self._started.pop(str(run_id), perf_counter())
        self.events.append(
            {
                "event": "tool_end",
                "duration_ms": int((perf_counter() - started) * 1000),
                "output": str(output)[:240],
            }
        )

    def on_tool_error(self, error: BaseException, *, run_id, **kwargs):
        self.events.append({"event": "tool_error", "error": str(error)[:240]})


def _tool_map(tools: list[BaseTool]) -> dict[str, BaseTool]:
    return {tool.name: tool for tool in tools}


def _invoke_if_missing(
    tools: dict[str, BaseTool],
    collector: ToolExecutionCollector,
    name: str,
    payload: dict[str, Any],
) -> UnifiedToolResult:
    if collector.results.get(name):
        return collector.results[name][-1]
    tools[name].invoke(payload)
    return collector.results[name][-1]


def _resolve_brand(request: FranchiseAgentRequest, session: Session) -> tuple[str, str]:
    if request.brand_id:
        try:
            brand = get_brand_intel(request.brand_id, session)
            return brand.brand_id, brand.brand_name
        except KeyError:
            pass
    all_brands = list_brand_intel(scenario="franchise", session=session)
    for brand in all_brands:
        if brand.brand_name in request.question or brand.brand_id.lower() in request.question.lower():
            return brand.brand_id, brand.brand_name
    return request.brand_id or "unknown", "未识别品牌"


def _resolve_city(request: FranchiseAgentRequest) -> str:
    if request.city:
        return request.city
    for city in ("杭州", "上海", "成都", "北京", "深圳", "广州", "武汉", "郑州"):
        if city in request.question:
            return city
    match = re.search(r"在([^，。；\s]{2,8})的?加盟", request.question)
    return match.group(1) if match else "未指定城市"


def run_franchise_agent(request: FranchiseAgentRequest, session: Session) -> FranchiseAgentResponse:
    collector = ToolExecutionCollector()
    tools = build_franchise_tools(session, collector)
    tools_by_name = _tool_map(tools)
    callback = AgentCallbackHandler()
    brand_id, brand_name = _resolve_brand(request, session)
    city = _resolve_city(request)
    agent_failed = False

    if settings.deepseek_api_key:
        try:
            agent = create_agent(
                model=create_chat_model(temperature=0),
                tools=tools,
                system_prompt=FRANCHISE_AGENT_SYSTEM_PROMPT,
            )
            agent.invoke(
                {
                    "messages": [
                        {
                            "role": "user",
                            "content": (
                                f"用户问题：{request.question}\n"
                                f"已知品牌ID：{brand_id}\n已知城市：{city}\n"
                                "请选择必要工具；必须调用 calculate_franchise_risk。"
                            ),
                        }
                    ]
                },
                config={"callbacks": [callback], "recursion_limit": 18},
            )
        except Exception:
            agent_failed = True
    else:
        agent_failed = True

    model_invoked_tools = set(collector.results)
    search_result = _invoke_if_missing(tools_by_name, collector, "search_brand", {"query": brand_name if brand_name != "未识别品牌" else request.question})
    if brand_id == "unknown" and search_result.data.get("matches"):
        match = search_result.data["matches"][0]
        brand_id, brand_name = match["brand_id"], match["brand_name"]
    _invoke_if_missing(tools_by_name, collector, "get_franchise_policy", {"brand_id": brand_id})
    _invoke_if_missing(tools_by_name, collector, "analyze_region", {"brand_id": brand_id, "city": city})
    _invoke_if_missing(tools_by_name, collector, "get_franchise_sentiment", {"brand_id": brand_id})
    knowledge_result = _invoke_if_missing(
        tools_by_name,
        collector,
        "search_franchise_knowledge",
        {"query": request.question, "brand_id": brand_id, "city": city, "document_type": None},
    )
    evidence_ids = [item.evidence_id for item in knowledge_result.evidence]
    _invoke_if_missing(
        tools_by_name,
        collector,
        "calculate_franchise_risk",
        {"brand_id": brand_id, "city": city, "evidence_ids": evidence_ids},
    )

    local_result = build_local_analysis(
        brand_id=brand_id,
        brand_name=brand_name,
        city=city,
        results=collector.results,
        trace=collector.trace,
        degraded=agent_failed,
    )
    analysis = run_analysis_chain(
        question=request.question,
        local_result=local_result,
        tool_results=collector.results,
    )
    report = run_report_chain(analysis) if request.generate_report else None
    live_tool_calling_succeeded = bool(model_invoked_tools) and any(
        event.get("event") == "tool_start" for event in callback.events
    )
    if agent_failed:
        execution_mode = "deterministic_fallback"
    elif live_tool_calling_succeeded and model_invoked_tools == set(tools_by_name):
        execution_mode = "live_agent"
    elif live_tool_calling_succeeded:
        execution_mode = "hybrid"
    else:
        execution_mode = "deterministic_fallback"
    return FranchiseAgentResponse(
        model_provider=settings.llm_provider,
        model_name=settings.deepseek_model,
        execution_mode=execution_mode,
        live_tool_calling_succeeded=live_tool_calling_succeeded,
        callback_event_count=len(callback.events),
        analysis=analysis,
        markdown_report=report,
    )


def tool_descriptions() -> list[dict[str, Any]]:
    from app.db.session import SessionLocal

    with SessionLocal() as session:
        tools = build_franchise_tools(session, ToolExecutionCollector())
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.args_schema.model_json_schema() if tool.args_schema else {},
            }
            for tool in tools
        ]
