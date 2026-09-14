# ai_core/bm25.py
from rank_bm25 import BM25Okapi
import numpy as np
import re
from typing import List

_word_re = re.compile(r"[A-Za-zÇĞİÖŞÜâîûçğıöşü0-9]+")

def _tokenize(text: str) -> List[str]:
    return [w.lower() for w in _word_re.findall(text or "")]

class BM25Scorer:
    def __init__(self, corpus_texts: List[str]):
        self.corpus_tokens = [_tokenize(t) for t in corpus_texts]
        self.bm25 = BM25Okapi(self.corpus_tokens)

    def scores_01(self, query_text: str) -> List[float]:
        q = _tokenize(query_text)
        if not q or not self.corpus_tokens:
            return [0.0] * len(self.corpus_tokens)

        raw = np.array(self.bm25.get_scores(q), dtype=float)

        # Negatifleri sıfıra kırpabilirsiniz (opsiyonel)
        raw = np.maximum(raw, 0.0)

        mx = float(raw.max()) if raw.size else 0.0
        if mx <= 0:
            return [0.0] * len(self.corpus_tokens)

        return (raw / mx).tolist()

def bm25_score(query: str, doc: str) -> float:
    """
    Tek bir query ve tek bir belge (doc) için BM25 skoru (0..1 normalize edilmiş).
    """
    if not query or not doc:
        return 0.0
    scorer = BM25Scorer([doc])
    scores = scorer.scores_01(query)
    return scores[0] if scores else 0.0
