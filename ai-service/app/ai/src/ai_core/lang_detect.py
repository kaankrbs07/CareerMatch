# -*- coding: utf-8 -*-
# Basit dil tespiti (tr/en). Yanıt: 'tr' veya 'en'.

from langdetect import detect

SUPPORTED = {"tr", "en"}

def detect_lang(text: str) -> str:
    """
    Metnin dilini tespit eder. Desteklenmiyorsa en yakın 'en' olarak döner.
    """
    try:
        code = detect(text)
        return code if code in SUPPORTED else "en"
    except Exception:
        return "en"
