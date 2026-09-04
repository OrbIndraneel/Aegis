"""
[GEOGRAPHIC ACCESS SCOPING TESTS]
Tests backend-enforced geographic access boundaries for authorities.
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_district_manager_cross_district_prevention():
    dm_vadodara = {
        "X-Authority-ID": "DM-VADODARA",
        "X-Authority-Role": "DISTRICT_MANAGER",
        "X-Authority-Jurisdiction": "Vadodara"
    }

    # Simulation inside own district: Allowed
    payload_own = {
        "simulation_name": "Vadodara Monsoon Surge Sim",
        "district_id": "Vadodara",
        "simulated_rainfall_mm": 130.0
    }
    res_own = client.post("/api/authority/simulate", json=payload_own, headers=dm_vadodara)
    assert res_own.status_code == 200
    assert res_own.json()["simulation_mode"] is True

    # Simulation outside own district (Chamoli): Denied (HTTP 403)
    payload_other = {
        "simulation_name": "Chamoli Landslide Sim",
        "district_id": "Chamoli",
        "simulated_rainfall_mm": 180.0
    }
    res_other = client.post("/api/authority/simulate", json=payload_other, headers=dm_vadodara)
    assert res_other.status_code == 403
    assert "cannot run simulation outside assigned district" in res_other.json()["error"]


def test_admin_universal_scope():
    admin_headers = {
        "X-Authority-ID": "STATE-ADMIN",
        "X-Authority-Role": "ADMIN",
        "X-Authority-Jurisdiction": "ALL"
    }
    # Admin can run simulation on any district
    payload = {
        "simulation_name": "State-wide Stress Test",
        "district_id": "Chamoli",
        "simulated_rainfall_mm": 200.0
    }
    res = client.post("/api/authority/simulate", json=payload, headers=admin_headers)
    assert res.status_code == 200
