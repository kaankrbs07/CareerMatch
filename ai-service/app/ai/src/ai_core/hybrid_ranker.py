# -*- coding: utf-8 -*-
"""
Hibrit skor: α·embedding + β·keyword + γ·tag_bonus
- CV ve ilan metinleri chunk'lanır.
- CV_chunk ↔ Job_chunk benzerlikleri alınır; iş için en iyi chunk skoru kullanılır.
"""
from __future__ import annotations
import numpy as np
from .bm25 import bm25_score
from .config import settings
from .embedder import encode_texts
from .chunker import chunk_text
from .keywords import tag_bonus
from typing import Optional

ALPHA = float(getattr(settings, "alpha", 0.7))
BETA  = float(getattr(settings, "beta", 0.25))
GAMMA = float(getattr(settings, "gamma", 0.05))

def max_sim_pool(q_embs: np.ndarray, d_embs: np.ndarray) -> float:
    """
    q_embs: (n,d) CV chunk embeddingleri
    d_embs: (m,d) Job chunk embeddingleri
    Dönüş: en iyi çiftin kosinüs skoru
    """
    sims = q_embs @ d_embs.T  # normalize edilmiş
    return float(np.max(sims)) if sims.size else 0.0

def score_cv_job(cv_text: str, cv_lang: str, job_text: str, job_lang: str,
                 cv_tags=None, job_tags=None, bm_s: Optional[float] = None):
    cv_chunks  = chunk_text(cv_text,  cv_lang)
    job_chunks = chunk_text(job_text, job_lang)
    q_embs = encode_texts(cv_chunks,  mode="query")
    d_embs = encode_texts(job_chunks, mode="passage")
    emb_s = max_sim_pool(q_embs, d_embs)

    if bm_s is None:
        bm_s = bm25_score(cv_text, job_text)

    tg_s = tag_bonus(cv_tags or [], job_tags or [])
    hybrid = ALPHA*emb_s + BETA*bm_s + GAMMA*tg_s
    return {"emb": round(emb_s,4), "kw": round(bm_s,4), "tag": round(tg_s,4), "hybrid": round(hybrid,4)}