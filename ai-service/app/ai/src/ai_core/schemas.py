# -*- coding: utf-8 -*-
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, Any, List

class CVItem(BaseModel):
    id: str
    text: str
    meta: Optional[dict[str, Any]] = Field(default_factory=dict)

class JobItem(BaseModel):
    id: str
    text: str
    tags: Optional[List[str]] = None
    meta: Optional[dict[str, Any]] = Field(default_factory=dict)

class MatchItem(BaseModel):
    id: str
    score: float
    emb: float
    kw: float
    tag: float
    text: str
    meta: Optional[dict[str, Any]] = None

class MatchResponse(BaseModel):
    lang: str
    results: list[MatchItem]

class MatchRequest(BaseModel):
    cv_text: str
    jobs: list[JobItem]
    top_k: int | None = None
    score_threshold: float | None = None
