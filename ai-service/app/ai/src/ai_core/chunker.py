# -*- coding: utf-8 -*-
"""
Uzun metinleri parçalara böler.
Strateji: cümle bazlı böl, sonra hedef uzunlukta (karakter) bloklar halinde birleştir.
Kaydırmalı overlap ile içerik kaybını azalt.
"""
from __future__ import annotations
from typing import List
import re, nltk

def _ensure_nltk():
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        nltk.download("punkt")
    try:
        nltk.data.find("tokenizers/punkt_tab/english")
        nltk.data.find("tokenizers/punkt_tab/turkish")
    except LookupError:
        nltk.download("punkt_tab")

_ensure_nltk()

def _sent_tokenize(text: str, lang: str) -> List[str]:
    lang_code = "turkish" if lang == "tr" else "english"
    try:
        return nltk.sent_tokenize(text, language=lang_code)
    except Exception:
        # Basit regex fallback
        return [s.strip() for s in re.split(r'(?<=[\.\?\!])\s+', text) if s.strip()]

def chunk_text(
    text: str,
    lang: str,
    target_chars: int = 800,
    overlap_chars: int = 150,
    hard_max_chars: int = 1400,
) -> List[str]:
    sents = _sent_tokenize(text, lang)
    blocks: List[str] = []
    buf = ""
    for s in sents:
        if not buf:
            buf = s
            continue
        if len(buf) + 1 + len(s) <= target_chars:
            buf = f"{buf} {s}"
        else:
            blocks.append(buf[:hard_max_chars])
            tail = buf[-overlap_chars:] if overlap_chars > 0 else ""
            buf = f"{tail} {s}".strip()
    if buf:
        blocks.append(buf[:hard_max_chars])
    return [b.strip() for b in blocks if b.strip()]
