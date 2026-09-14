import numpy as np
from ai.src.ai_core.matcher import top_k_similar
def test_topk():
    q = np.array([1.0,0.0])
    c = np.array([[1.0,0.0],[0.0,1.0]])
    items = [{"id":"a","text":"x"},{"id":"b","text":"y"}]
    out = top_k_similar(q, c, items, k=1, threshold=0.0)
    assert out[0]["id"] == "a"
