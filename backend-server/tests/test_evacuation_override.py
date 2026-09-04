"""
[EVACUATION ROUTE OVERRIDE & CORE SOLVER INTEGRITY TESTS]
Verifies that the OR-Tools / NetworkX solver is preserved and wrapped non-destructively.
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_core_evacuation_route_solver_intact():
    # Verify core solver continues functioning exactly as before
    payload = {
        "user_lat": 31.1048,
        "user_lng": 77.1734
    }
    response = client.post("/api/evacuation-route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "route_id" in data
    assert data["hazard_avoided"] is True
    assert len(data["route_coordinates"]) >= 2
    assert data["distance_km"] > 0


def test_authority_route_override_registration():
    admin_headers = {
        "X-Authority-ID": "ADMIN-OR-01",
        "X-Authority-Role": "ADMIN",
        "X-Authority-Jurisdiction": "ALL"
    }
    payload = {
        "original_route_id": "route_sh_01",
        "reason": "Bridge underpass flooded at Sector 4; rerouting along high-elevation ridge.",
        "requested_changes": {"detour_via": "Ridge Road Corridor"},
        "override_polyline": [
            [31.1048, 77.1734],
            [31.1090, 77.1790],
            [31.1148, 77.1854]
        ]
    }
    response = client.post("/api/authority/override-route", json=payload, headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["override"]["original_route_id"] == "route_sh_01"
    assert data["override"]["status"] == "APPROVED"

    # List overrides
    res_list = client.get("/api/authority/route-overrides", headers=admin_headers)
    assert res_list.status_code == 200
    assert res_list.json()["count"] > 0
