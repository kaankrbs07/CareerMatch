from ai.src.ai_core.hybrid_ranker import score_cv_job
def test_scores_shape():
    s = score_cv_job("Python ve FastAPI", "tr", "We need FastAPI and Python", "en")
    assert set(s.keys()) == {"emb","kw","tag","hybrid"}
