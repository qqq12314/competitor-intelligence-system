import hashlib
import math
import re


class LocalChineseHashEmbeddings:
    """Deterministic local Chinese character n-gram embeddings for the course demo.

    This avoids external embedding API calls while still producing real vectors
    stored and queried by Chroma. It can later be replaced by BGE without changing
    the vector-store or retriever interfaces.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def _tokens(self, text: str) -> list[str]:
        normalized = re.sub(r"\s+", "", text.lower())
        chars = list(normalized)
        tokens = chars + ["".join(chars[index : index + 2]) for index in range(max(len(chars) - 1, 0))]
        return tokens or ["empty"]

    def embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimension
        for token in self._tokens(text):
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % self.dimension
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[index] += sign
        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self.embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self.embed(text)
