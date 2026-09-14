# -*- coding: utf-8 -*-
from __future__ import annotations
from .lang_detect import detect_lang
from .preprocess import normalize
from .hybrid_ranker import score_cv_job
from .schemas import JobItem, MatchResponse, MatchItem
from .config import settings
from .bm25 import BM25Scorer
from .keywords import extract_tags

def match_cv_to_jobs(cv_text: str, jobs: list[JobItem],
                     top_k: int | None = None,
                     score_threshold: float | None = None) -> MatchResponse:
    cv_lang = detect_lang(cv_text)
    cv_norm = normalize(cv_text)

    # CV tag çıkar
    cv_tags = extract_tags(cv_norm)
    
    # Job metinlerini bir kere normalize et
    job_norms = [normalize(j.text) for j in jobs]

    # BM25'yi tek sefer kur (korpus = tüm job'lar)
    bm25 = BM25Scorer(job_norms)

    # CV'yi query yapıp tüm job’lar için BM25 skor listesi al
    bm_scores = bm25.scores_01(cv_norm)   # uzunluk = len(jobs)
    
    scored: list[MatchItem] = []
    for idx, j in enumerate(jobs):
        job_lang = detect_lang(j.text)
        jt = job_norms[idx]

        # Hazır BM25 skorunu score_cv_job'a geçir
        s = score_cv_job(
            cv_norm, cv_lang, jt, job_lang,
            None, j.tags or [],
            bm_s=bm_scores[idx]
        )

        scored.append(MatchItem(
            id=j.id, text=j.text, meta=j.meta,
            score=s["hybrid"], emb=s["emb"], kw=s["kw"], tag=s["tag"]
        ))

    k = top_k or settings.top_k
    th = score_threshold if score_threshold is not None else settings.score_threshold
    ranked = [m for m in sorted(scored, key=lambda x: x.score, reverse=True) if m.score >= th][:k]
    return MatchResponse(lang=cv_lang, results=ranked)