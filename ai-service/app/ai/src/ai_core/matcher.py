# -*- coding: utf-8 -*-
# Basit vektör benzerlik eşlemesi (cosine).

import numpy as np
from typing import Sequence
from .config import settings

def cosine_sim(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    a: (n, d), b: (m, d)
    return: (n, m) benzerlik matrisi
    """
    return (a @ b.T)  # normalize_embeddings=True olduğundan doğrudan kosinüs

def top_k_similar(query_emb: np.ndarray,
                  corpus_emb: np.ndarray,
                  items: Sequence[dict],
                  k: int | None = None,
                  threshold: float | None = None) -> list[dict]:
    """
    Tek sorguya göre en benzer k öğe.
    items: corpus ile aynı sırada dict listesi, örn: {"id": "...", "text": "...", "meta": {...}}
    """
    k = k or settings.top_k
    threshold = threshold if threshold is not None else settings.score_threshold
    sims = cosine_sim(query_emb[np.newaxis, :], corpus_emb)[0]  # (m,)
    idx = np.argpartition(-sims, kth=min(k, len(sims)-1))[:k]
    idx = idx[np.argsort(-sims[idx])]
    results = []
    for i in idx:
        score = float(sims[i])
        if score < threshold:
            continue
        r = dict(items[i])
        r["score"] = round(score, 4)
        results.append(r)
    return results
