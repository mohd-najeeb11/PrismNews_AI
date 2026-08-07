import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.main import app

def test_multilingual_endpoints():
    client = TestClient(app)
    print("=== Running Multilingual Feature Verification Tests ===")

    # 1. Test GET /api/languages
    res = client.get("/api/languages")
    assert res.status_code == 200, f"GET /api/languages failed: {res.text}"
    languages = res.json()
    assert len(languages) >= 3, "Expected at least 3 supported languages (en, hi, te)"
    codes = [l["code"] for l in languages]
    assert "en" in codes and "hi" in codes and "te" in codes, "Missing required language codes"
    print(f"[OK] Supported Languages Endpoint Passed: {codes}")

    # 2. Test GET /api/stories to get a story ID
    res = client.get("/api/stories")
    assert res.status_code == 200, f"GET /api/stories failed: {res.text}"
    stories = res.json()
    assert len(stories) > 0, "No stories available for translation test"
    story_id = stories[0]["id"]

    # 3. Test POST /api/stories/{id}/translate for Hindi ('hi')
    print(f"Requesting Hindi translation for story '{story_id}'...")
    res = client.post(f"/api/stories/{story_id}/translate", json={"language": "hi"})
    assert res.status_code == 200, f"POST /api/stories/{story_id}/translate (hi) failed: {res.text}"
    hi_trans = res.json()
    assert hi_trans["language"] == "hi", f"Expected language 'hi', got {hi_trans['language']}"
    assert "translated_content" in hi_trans, "Missing translated_content in response"
    print(f"[OK] Hindi Translation Endpoint Passed: Status '{hi_trans.get('cache_status')}'")

    # 4. Test GET /api/stories/{id}/translations/hi (Cache Hit)
    res = client.get(f"/api/stories/{story_id}/translations/hi")
    assert res.status_code == 200, f"GET /api/stories/{story_id}/translations/hi failed: {res.text}"
    cached_res = res.json()
    assert cached_res["cache_status"] == "Cached", f"Expected 'Cached', got '{cached_res['cache_status']}'"
    print(f"[OK] Translation Cache Hit Endpoint Passed: '{cached_res['cache_status']}'")

    # 5. Test POST /api/stories/{id}/translate for Telugu ('te')
    print(f"Requesting Telugu translation for story '{story_id}'...")
    res = client.post(f"/api/stories/{story_id}/translate", json={"language": "te"})
    assert res.status_code == 200, f"POST /api/stories/{story_id}/translate (te) failed: {res.text}"
    te_trans = res.json()
    assert te_trans["language"] == "te"
    print(f"[OK] Telugu Translation Endpoint Passed: Status '{te_trans.get('cache_status')}'")

    # 6. Test Edge Case: Unsupported language -> 400
    res = client.post(f"/api/stories/{story_id}/translate", json={"language": "fr"})
    assert res.status_code == 400, f"Expected 400 for unsupported language, got {res.status_code}"
    print("[OK] Unsupported Language Handling Passed (400 Returned)")

    print("\nALL MULTILINGUAL VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_multilingual_endpoints()
