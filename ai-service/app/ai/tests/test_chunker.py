from ai.src.ai_core.chunker import chunk_text
def test_chunk_basic():
    t = "Merhaba. Bu bir deneme cümlesidir. Üç cümle olsun."
    ch = chunk_text(t, "tr", target_chars=30, overlap_chars=5)
    assert len(ch) >= 1
