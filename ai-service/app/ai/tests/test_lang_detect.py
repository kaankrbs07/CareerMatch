from ai.src.ai_core.lang_detect import detect_lang
def test_detect_basic():
    assert detect_lang("Merhaba dünya") in {"tr","en"}
