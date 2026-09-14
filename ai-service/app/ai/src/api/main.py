# -*- coding: utf-8 -*-
# FastAPI servis uçları: sağlık kontrolü ve basit eşleştirme

from fastapi import FastAPI, APIRouter
from ai.src.ai_core.schemas import MatchRequest, MatchResponse
from ai.src.ai_core.service import match_cv_to_jobs

app = FastAPI(title="CVMatch AI", version="1.0.0")
api = APIRouter(prefix="/v1")

@api.get("/health")
def health(): return {"status": "ok"}

@api.post("/match", response_model=MatchResponse)
def match(req: MatchRequest):
    return match_cv_to_jobs(req.cv_text, req.jobs, req.top_k, req.score_threshold)

app.include_router(api)

