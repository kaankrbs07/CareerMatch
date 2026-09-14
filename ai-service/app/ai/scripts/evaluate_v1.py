# -*- coding: utf-8 -*-

import argparse, json
from pathlib import Path
from typing import List, Dict, Tuple, Set

from ai.src.ai_core.lang_detect import detect_lang
from ai.src.ai_core.preprocess import normalize
from ai.src.ai_core.hybrid_ranker import score_cv_job


def load_jsonl(p: Path) -> List[Dict]:
    with p.open("r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def rank_for_cv(cv_txt: str, jobs: List[Dict], k: int, threshold: float) -> List[Tuple[str, float]]:
    cv_lang = detect_lang(cv_txt)
    cv_norm = normalize(cv_txt)
    cv_tags = jobs[0].get("cv_tags", []) if jobs else []

    scored: List[Tuple[str, float]] = []
    for j in jobs:
        job_txt = j["job"]
        job_lang = detect_lang(job_txt)  # ilan dili her ilan için ayrı
        job_norm = normalize(job_txt)
        s = score_cv_job(cv_norm, cv_lang, job_norm, job_lang, cv_tags, j.get("job_tags"))
        scored.append((j["job_id"], float(s["hybrid"])))

    # sırala, eşik uygula, top-k al, id bazında de-dupe
    scored.sort(key=lambda x: x[1], reverse=True)
    if threshold is not None and threshold > 0:
        scored = [x for x in scored if x[1] >= threshold]

    seen: Set[str] = set()
    uniq: List[Tuple[str, float]] = []
    for jid, sc in scored:
        if jid in seen:
            continue
        seen.add(jid)
        uniq.append((jid, sc))
    return uniq[:k]


def metrics(ranked_ids: List[str], positives: Set[str], k: int) -> Tuple[float, float, float]:
    pos = set(positives)
    topk = ranked_ids[:k]

    # Hit@K
    hit = 1.0 if any(r in pos for r in topk) else 0.0

    # MRR@K
    mrr = 0.0
    for i, rid in enumerate(topk, start=1):
        if rid in pos:
            mrr = 1.0 / i
            break

    # nDCG@K (binary relevance)
    import math
    def gain(idx: int) -> float:
        return 1.0 / math.log2(idx + 2)  # idx 0 tabanlı

    dcg = 0.0
    for idx, rid in enumerate(topk):
        if rid in pos:
            dcg += gain(idx)

    ideal_hits = min(k, len(pos))
    ndcg = 0.0
    if ideal_hits > 0:
        idcg = sum(gain(i) for i in range(ideal_hits))
        ndcg = dcg / idcg if idcg > 0 else 0.0

    return hit, mrr, ndcg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--k", type=int, default=5)
    ap.add_argument("--threshold", type=float, default=0.0)
    args = ap.parse_args()

    rows = load_jsonl(Path(args.data))

    # cv bazlı gruplama
    by_cv: Dict[str, List[Dict]] = {}
    for r in rows:
        by_cv.setdefault(r["cv_id"], []).append(r)

    hits = mrrs = ndcgs = 0.0
    n = 0
    for cv_id, items in by_cv.items():
        cv_txt = items[0]["cv"]
        ranked = rank_for_cv(cv_txt, items, args.k, args.threshold)
        ranked_ids = [jid for jid, _ in ranked]
        positives = {x["job_id"] for x in items if int(x.get("label", 0)) == 1}

        h, m, nd = metrics(ranked_ids, positives, args.k)
        hits += h; mrrs += m; ndcgs += nd; n += 1

    n = max(n, 1)
    print(f"Queries: {n}")
    print(f"Hit@{args.k}: {hits/n:.4f}")
    print(f"MRR@{args.k}: {mrrs/n:.4f}")
    print(f"nDCG@{args.k}: {ndcgs/n:.4f}")


if __name__ == "__main__":
    main()
