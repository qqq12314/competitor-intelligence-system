from pathlib import Path

import chromadb

from app.core.config import settings
from app.rag.embeddings import LocalChineseHashEmbeddings

COLLECTION_NAME = "franchise_knowledge"


def persist_directory() -> Path:
    path = Path(settings.chroma_persist_directory)
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_client() -> chromadb.PersistentClient:
    return chromadb.PersistentClient(path=str(persist_directory()))


def get_collection():
    return get_client().get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine", "embedding_model": settings.embedding_model},
    )


def reset_collection():
    client = get_client()
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine", "embedding_model": settings.embedding_model},
    )


embeddings = LocalChineseHashEmbeddings()
