# -*- coding: utf-8 -*-
# Temel normalize: boşluk, gereksiz kontrol karakterleri, basit lower.

import re

def normalize(text: str) -> str:
    """
    Metni hafifçe normalize eder. Aşırı işlem yok, gömme modeli anlamsal çalışır.
    """
    if not text:
        return ""
    t = text.replace("\u0000", " ").strip()
    t = re.sub(r"\s+", " ", t)
    return t
