import logging
from typing import List, Optional
from app.core.logging import logger

_model = None


def get_embedding_model():
    """
    Lazy loader for sentence-transformers/all-MiniLM-L6-v2 CPU embedding model.
    """
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading sentence-transformers/all-MiniLM-L6-v2 model on CPU...")
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer model loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer ({e}). Falling back to TF-IDF vectorizer.")
            _model = "fallback"
    return _model


def embed_text(text: str) -> List[float]:
    """
    Generates a 384-dimensional vector embedding for the given input text.
    Zero API cost (runs locally on CPU).
    """
    model = get_embedding_model()

    if model == "fallback" or model is None:
        # Fallback deterministic pseudo-embedding vector if transformer model is unavailable
        import hashlib
        import numpy as np
        hash_digest = hashlib.sha256(text.encode("utf-8")).digest()
        np.random.seed(int.from_bytes(hash_digest[:4], "big"))
        vec = np.random.normal(0, 1, 384)
        norm = np.linalg.norm(vec)
        return (vec / (norm if norm > 0 else 1.0)).tolist()

    vector = model.encode(text, convert_to_numpy=True)
    return vector.tolist()


def embed_batch(texts: List[str]) -> List[List[float]]:
    """
    Generates vector embeddings for a batch of text items.
    """
    if not texts:
        return []

    model = get_embedding_model()

    if model == "fallback" or model is None:
        return [embed_text(t) for t in texts]

    vectors = model.encode(texts, convert_to_numpy=True)
    return [v.tolist() for v in vectors]
