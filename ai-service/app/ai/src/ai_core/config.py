# -*- coding: utf-8 -*-
from dataclasses import dataclass
import os
from dotenv import load_dotenv
load_dotenv()

@dataclass
class Settings:
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-base")
    top_k: int = int(os.getenv("TOP_K", "10"))
    score_threshold: float = float(os.getenv("SCORE_THRESHOLD", "0.35"))
    alpha: float = float(os.getenv("ALPHA","0.7"))
    beta:  float = float(os.getenv("BETA","0.25"))
    gamma: float = float(os.getenv("GAMMA","0.05"))

settings = Settings()
