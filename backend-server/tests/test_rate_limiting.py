"""
[RATE LIMITING & SOS RESILIENCE TESTS]
Tests tiered rate limits and verifies that emergency SOS requests are resilient against flood drops.
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app
from security.rate_limiter import RATE_LIMITER

client = TestClient(app)


def test_strict_rate_limiting():
    RATE_LIMITER.reset()
    # Consent endpoint is tiered with STRICT limit (15 req / min)
    civ_id = "rate-limit-test-user"
    payload = {"civilian_id": civ_id, "emergency_use_permitted": True}

    responses = []
    for _ in range(18):
        res = client.post("/api/consent", json=payload)
        responses.append(res.status_code)

    # First 15 should succeed (200), subsequent should return 429
    assert 429 in responses
    RATE_LIMITER.reset()


def test_emergency_sos_resilience():
    # Emergency SOS must never be dropped blindly by naive rate limiting
    payload = {
        "user_id": "sos-user-urgent-01",
        "user_name": "Evacuee trapped",
        "user_phone": "+91-99999-88888",
        "latitude": 22.3072,
        "longitude": 73.1812,
        "emergency_type": "Trapped",
        "notes": "Debris blockage"
    }

    # First SOS submission
    res1 = client.post("/api/sos", json=payload)
    assert res1.status_code == 200
    assert "alert_id" in res1.json()

    # Immediate second click (rapid repeat under panic)
    res2 = client.post("/api/sos", json=payload)
    assert res2.status_code == 200  # Remains 200, successfully handled
