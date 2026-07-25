from fastapi import APIRouter, HTTPException

from app.agents.schemas import KnowledgeSearchRequest, KnowledgeStatus
from app.rag.ingest import ingest_knowledge, knowledge_status
from app.rag.retriever import search_knowledge

router = APIRouter()


@router.get("/status", response_model=KnowledgeStatus)
def get_knowledge_status() -> KnowledgeStatus:
    return KnowledgeStatus(**knowledge_status())


@router.post("/search")
def search(payload: KnowledgeSearchRequest) -> dict:
    evidence = search_knowledge(
        payload.query,
        brand_id=payload.brand_id,
        city=payload.city,
        document_type=payload.document_type,
        top_k=payload.top_k,
    )
    return {
        "query": payload.query,
        "count": len(evidence),
        "evidence": [item.model_dump() for item in evidence],
    }


@router.post("/reindex", response_model=KnowledgeStatus)
def reindex_knowledge() -> KnowledgeStatus:
    try:
        return KnowledgeStatus(**ingest_knowledge(force=True))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"知识库重建失败：{exc}") from exc
