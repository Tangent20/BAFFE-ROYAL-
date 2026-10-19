import os
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://addictive-games-13.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


def test_stats_endpoint():
    r = requests.get(f"{API}/stats")
    assert r.status_code == 200
    data = r.json()
    assert "total_games" in data and "total_slaps" in data and "top_score" in data


def test_submit_score_and_persistence():
    payload = {"pseudo": "TEST_USER", "score": 12345, "combo_max": 5, "kos": 3, "duration_sec": 42.5}
    r = requests.post(f"{API}/scores", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["pseudo"] == "TEST_USER"
    assert data["score"] == 12345
    assert data["combo_max"] == 5
    assert data["kos"] == 3
    assert "id" in data

    # Verify in top
    r2 = requests.get(f"{API}/scores/top?limit=100")
    assert r2.status_code == 200
    ids = [s["id"] for s in r2.json()]
    assert data["id"] in ids


def test_daily_scores():
    requests.post(f"{API}/scores", json={"pseudo": "TEST_DAILY", "score": 999, "combo_max": 1, "kos": 1, "duration_sec": 5})
    r = requests.get(f"{API}/scores/daily")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_rank_endpoint():
    r = requests.get(f"{API}/scores/rank/0")
    assert r.status_code == 200
    data = r.json()
    assert "rank" in data and "total" in data
    assert data["rank"] >= 1


def test_validation_invalid_score():
    r = requests.post(f"{API}/scores", json={"pseudo": "X", "score": -10})
    assert r.status_code == 422


def test_validation_empty_pseudo():
    r = requests.post(f"{API}/scores", json={"pseudo": "", "score": 100})
    assert r.status_code == 422
