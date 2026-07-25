import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from app.core.config import settings
from app.rag.vector_store import embeddings, get_collection, persist_directory, reset_collection

REPO_ROOT = Path(__file__).resolve().parents[3]
KNOWLEDGE_DIR = REPO_ROOT / "data" / "knowledge"


def _parse_document(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    metadata: dict = {}
    if lines and lines[0].startswith("<!--meta:") and lines[0].endswith("-->"):
        metadata = json.loads(lines[0][len("<!--meta:") : -3].strip())
        text = "\n".join(lines[1:]).strip()
    metadata.setdefault("title", path.stem)
    metadata.setdefault("brand_id", "general")
    metadata.setdefault("city", "general")
    metadata.setdefault("document_type", "industry")
    metadata.setdefault("published_at", "2026-07-25")
    metadata.setdefault("source_url", "")
    metadata.setdefault("credibility_level", "medium")
    metadata["source_file"] = path.name
    return metadata, text


def _split_text(text: str, chunk_size: int = 750, overlap: int = 100) -> list[str]:
    paragraphs = [item.strip() for item in text.split("\n\n") if item.strip()]
    chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        candidate = f"{current}\n\n{paragraph}".strip()
        if len(candidate) <= chunk_size:
            current = candidate
            continue
        if current:
            chunks.append(current)
        if len(paragraph) <= chunk_size:
            current = paragraph
        else:
            start = 0
            while start < len(paragraph):
                chunks.append(paragraph[start : start + chunk_size])
                start += max(chunk_size - overlap, 1)
            current = ""
    if current:
        chunks.append(current)
    return chunks


def ingest_knowledge(force: bool = False) -> dict:
    paths = sorted(KNOWLEDGE_DIR.glob("*.md"))
    collection = reset_collection() if force else get_collection()
    if collection.count() and not force:
        return knowledge_status()

    ids: list[str] = []
    documents: list[str] = []
    metadatas: list[dict] = []
    for path in paths:
        metadata, text = _parse_document(path)
        for index, chunk in enumerate(_split_text(text), start=1):
            evidence_id = f"{path.stem.upper()}-C{index:03d}"
            ids.append(evidence_id)
            documents.append(chunk)
            metadatas.append(
                {
                    **{key: str(value) for key, value in metadata.items()},
                    "evidence_id": evidence_id,
                    "chunk_index": index,
                    "indexed_at": datetime.now(timezone.utc).isoformat(),
                }
            )
    if ids:
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=embeddings.embed_documents(documents),
        )
    return knowledge_status()


def ensure_knowledge_index() -> dict:
    expected_documents = len(list(KNOWLEDGE_DIR.glob("*.md")))
    collection = get_collection()
    if expected_documents and collection.count() == 0:
        return ingest_knowledge(force=True)
    return knowledge_status()


def knowledge_status() -> dict:
    collection = get_collection()
    result = collection.get(include=["metadatas"])
    metadatas = result.get("metadatas") or []
    brands = Counter(item.get("brand_id", "general") for item in metadatas)
    document_types = Counter(item.get("document_type", "industry") for item in metadatas)
    updated_values = [item.get("indexed_at") for item in metadatas if item.get("indexed_at")]
    source_files = {item.get("source_file") for item in metadatas if item.get("source_file")}
    return {
        "ready": collection.count() > 0,
        "document_count": len(source_files),
        "chunk_count": collection.count(),
        "brands": dict(brands),
        "document_types": dict(document_types),
        "persist_directory": str(persist_directory()),
        "embedding_model": settings.embedding_model,
        "updated_at": max(updated_values) if updated_values else None,
    }
