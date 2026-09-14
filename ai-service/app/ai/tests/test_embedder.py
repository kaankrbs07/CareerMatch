from ai.src.ai_core.embedder import encode_texts
def test_encode_shapes():
    v = encode_texts(["deneme"], mode="passage")
    assert v.shape[0] == 1
