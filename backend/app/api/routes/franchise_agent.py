import langchain
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents.franchise_agent import run_franchise_agent, tool_descriptions
from app.agents.schemas import FranchiseAgentRequest, FranchiseAgentResponse
from app.core.config import settings
from app.db.session import get_db
from app.llm.factory import model_status
from app.rag.ingest import knowledge_status

router = APIRouter()


@router.get("/framework")
def framework() -> dict:
    knowledge = knowledge_status()
    return {
        "architecture": "single-agent",
        "agent_count": 1,
        "agent_name": "Franchise Risk Agent",
        "multi_agent": False,
        "rag_role": "Agent 可调用的知识检索工具，不是独立 Agent",
        "tool_count": 6,
        "chains": ["franchise_analysis_chain", "report_chain"],
        "callbacks_enabled": True,
        "structured_output": "Pydantic FranchiseAnalysisResult",
        "langchain_version": getattr(langchain, "__version__", "unknown"),
        "llm": model_status(),
        "knowledge": knowledge,
        "embedding_model": settings.embedding_model,
    }


@router.get("/tools")
def tools() -> dict:
    items = tool_descriptions()
    return {"count": len(items), "tools": items}


@router.post("/analyze", response_model=FranchiseAgentResponse)
def analyze(payload: FranchiseAgentRequest, db: Session = Depends(get_db)) -> FranchiseAgentResponse:
    try:
        return run_franchise_agent(payload, db)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"加盟风险分析失败：{exc}") from exc
