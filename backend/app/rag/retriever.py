from app.agents.schemas import Evidence
from app.core.config import settings
from app.rag.ingest import ensure_knowledge_index
from app.rag.vector_store import embeddings, get_collection


def _where_filter(brand_id: str | None, city: str | None, document_type: str | None):
    clauses = []
    if brand_id:
        clauses.append({"brand_id": {"$in": [brand_id, "general"]}})
    if city:
        clauses.append({"city": {"$in": [city, "general"]}})
    if document_type:
        clauses.append({"document_type": document_type})
    if not clauses:
        return None
    if len(clauses) == 1:
        return clauses[0]
    return {"$and": clauses}


def search_knowledge(
    query: str,
    *,
    brand_id: str | None = None,
    city: str | None = None,
    document_type: str | None = None,
    top_k: int | None = None,
) -> list[Evidence]:
    ensure_knowledge_index()
    collection = get_collection()
    if collection.count() == 0:
        return []
    result = collection.query(
        query_embeddings=[embeddings.embed_query(query)],
        n_results=min(top_k or settings.rag_top_k, collection.count()),
        where=_where_filter(brand_id, city, document_type),
        include=["documents", "metadatas", "distances"],
    )
    documents = (result.get("documents") or [[]])[0]
    metadatas = (result.get("metadatas") or [[]])[0]
    return [
        Evidence(
            evidence_id=metadata.get("evidence_id", "unknown"),
            title=metadata.get("title", "未命名资料"),
            excerpt=document[:700],
            source_url=metadata.get("source_url") or None,
            published_at=metadata.get("published_at") or None,
            document_type=metadata.get("document_type", "industry"),
            credibility_level=metadata.get("credibility_level", "unknown"),
            brand_id=metadata.get("brand_id") or None,
            city=metadata.get("city") or None,
        )
        for document, metadata in zip(documents, metadatas)
    ]
