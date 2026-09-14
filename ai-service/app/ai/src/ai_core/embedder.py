# -*- coding: utf-8 -*-
from sentence_transformers import SentenceTransformer
import numpy as np
from functools import lru_cache
from .config import settings

_model = SentenceTransformer(settings.embedding_model)

@lru_cache(maxsize=4096)
def _encode_one(text: str, mode: str) -> np.ndarray:
    t = f"{'query' if mode=='query' else 'passage'}: {text}" if "e5" in settings.embedding_model else text
    v = _model.encode([t], convert_to_numpy=True, normalize_embeddings=True)
    return v[0]

def encode_texts(texts: list[str], mode: str = "passage") -> np.ndarray:
    vecs = [_encode_one(x, mode) for x in texts]
    return np.stack(vecs, axis=0) if vecs else np.zeros((0, _model.get_sentence_embedding_dimension()))
