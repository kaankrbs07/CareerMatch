# -*- coding: utf-8 -*-
# CV/ilan metin çıkarımı: PDF ve DOCX destekli.

from pathlib import Path
import pdfplumber
import docx

def read_text(path: str) -> str:
    """
    Dosya uzantısına göre metni çıkarır.
    .pdf -> pdfplumber, .docx -> python-docx, diğer -> düz metin denemesi.
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Dosya bulunamadı: {path}")

    if p.suffix.lower() == ".pdf":
        chunks = []
        with pdfplumber.open(p) as pdf:
            for page in pdf.pages:
                chunks.append(page.extract_text() or "")
        return "\n".join(chunks)

    if p.suffix.lower() == ".docx":
        doc = docx.Document(p)
        return "\n".join([para.text for para in doc.paragraphs])

    # Fallback: txt benzeri
    return p.read_text(encoding="utf-8", errors="ignore")
