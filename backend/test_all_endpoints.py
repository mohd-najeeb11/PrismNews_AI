import sys
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    client = TestClient(app)
    print("=== Running PrismNews AI System Verification Tests ===")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[OK] Health Check Passed:", res.json()["status"])

    # 2. Quota status & mode toggle
    res = client.get("/api/quota")
    assert res.status_code == 200, f"Quota status failed: {res.text}"
    print("[OK] Quota Status Passed:", res.json()["api_mode"])

    res = client.post("/api/quota/mode", json={"mode": "seed"})
    assert res.status_code == 200, f"Mode toggle failed: {res.text}"
    assert res.json()["api_mode"] == "seed"
    print("[OK] API Mode Dropdown Endpoint (POST /api/quota/mode) Passed: switched to 'seed'")

    res = client.post("/api/quota/mode", json={"mode": "live"})
    assert res.status_code == 200, f"Mode toggle failed: {res.text}"
    assert res.json()["api_mode"] == "live"
    print("[OK] API Mode Switch Back Passed: restored to 'live'")

    # 3. Browse stories
    res = client.get("/api/stories")
    assert res.status_code == 200, f"Get stories failed: {res.text}"
    stories = res.json()
    assert len(stories) > 0, "No stories returned"
    first_story_id = stories[0]["id"]
    print(f"[OK] Get Stories Passed: Retrieved {len(stories)} story clusters (First ID: {first_story_id})")

    # 4. Search stories with query
    res = client.get("/api/stories?q=tech")
    assert res.status_code == 200, f"Search stories failed: {res.text}"
    print(f"[OK] Search Stories Passed: Retrieved {len(res.json())} matches for 'tech'")

    # 5. Story detail & full AI analysis
    res = client.get(f"/api/stories/{first_story_id}")
    assert res.status_code == 200, f"Get story detail failed: {res.text}"
    story_detail = res.json()
    assert "analysis" in story_detail, "Analysis missing from detail response"
    print("[OK] Story Detail & AI Analysis Passed:", story_detail["headline"])

    # 6. Story comparison matrix
    res = client.get(f"/api/stories/{first_story_id}/compare")
    assert res.status_code == 200, f"Compare failed: {res.text}"
    print(f"[OK] Comparison Matrix Passed: {len(res.json())} outlet comparison cards")

    # 7. Story timeline
    res = client.get(f"/api/stories/{first_story_id}/timeline")
    assert res.status_code == 200, f"Timeline failed: {res.text}"
    print(f"[OK] Framing Shift Timeline Passed: {len(res.json())} timeline entries")

    # 8. User profile
    res = client.get("/api/me")
    assert res.status_code == 200, f"User profile failed: {res.text}"
    print("[OK] User Profile (/api/me) Passed:", res.json()["display_name"])

    # 9. Saved stories GET/POST/DELETE
    res = client.get("/api/saved-stories")
    assert res.status_code == 200, f"Get saved stories failed: {res.text}"
    print(f"[OK] Get Saved Stories Passed: {len(res.json())} bookmarked stories")

    res = client.post("/api/saved-stories", json={"story_id": first_story_id})
    assert res.status_code == 200, f"Save story failed: {res.text}"
    print("[OK] Bookmark Story (POST) Passed")

    res = client.delete(f"/api/saved-stories/{first_story_id}")
    assert res.status_code == 200, f"Delete saved story failed: {res.text}"
    print("[OK] Delete Bookmark (DELETE) Passed")

    # 10. Manual Ingest trigger
    res = client.post("/api/ingest/trigger")
    assert res.status_code == 200, f"Ingest trigger failed: {res.text}"
    print("[OK] Ingest Trigger Passed:", res.json()["mode"])

    # 11. Root UI serve
    res = client.get("/")
    assert res.status_code == 200, f"Root UI failed: {res.text}"
    assert "PrismNews" in res.text, "Root UI HTML missing title"
    print("[OK] Web UI Serve at Root (/) Passed")

    # 12. Edge Case: Non-existent story detail -> 404
    res = client.get("/api/stories/nonexistent_story_id_9999")
    assert res.status_code == 404, f"Expected 404 for invalid story ID, got {res.status_code}"
    print("[OK] Invalid Story ID Handled (404 Passed)")

    # 13. Edge Case: Non-existent compare & timeline -> 404
    res = client.get("/api/stories/nonexistent_story_id_9999/compare")
    assert res.status_code == 404, f"Expected 404 for invalid compare ID, got {res.status_code}"
    print("[OK] Invalid Compare Request Handled (404 Passed)")

    res = client.get("/api/stories/nonexistent_story_id_9999/timeline")
    assert res.status_code == 404, f"Expected 404 for invalid timeline ID, got {res.status_code}"
    print("[OK] Invalid Timeline Request Handled (404 Passed)")

    print("\nALL 14 API & FRONTEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
