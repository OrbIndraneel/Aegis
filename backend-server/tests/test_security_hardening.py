"""
[SECURITY HARDENING & DEFENSIVE HEADERS TESTS]
Verifies security headers, request ID propagation, and safe sanitized error responses.
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_defensive_security_headers_present():
    res = client.get("/")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert "Strict-Transport-Security" in res.headers
    assert "Content-Security-Policy" in res.headers
    assert "X-Request-ID" in res.headers


def test_sanitized_error_responses_no_stack_traces():
    # Trigger 404
    res = client.get("/api/non-existent-endpoint")
    assert res.status_code == 404
    body = res.json()
    assert "error" in body
    assert "status_code" in body
    # Verify no stack trace or internal path leakage
    assert "Traceback" not in str(body)
    assert "d:\\" not in str(body).lower()
    assert "password" not in str(body).lower()
