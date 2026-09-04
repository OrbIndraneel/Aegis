"""
[RBAC AUTOMATED TESTS]
Validates permitted and denied actions for all 6 authority roles against the permissions matrix.
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_admin_full_privileges():
    headers = {
        "X-Authority-ID": "ADMIN-01",
        "X-Authority-Role": "ADMIN",
        "X-Authority-Jurisdiction": "ALL"
    }
    # 1. Admin can view profile
    res = client.get("/api/authority/profile", headers=headers)
    assert res.status_code == 200
    assert res.json()["role"] == "ADMIN"

    # 2. Admin can view audit logs
    res_logs = client.get("/api/authority/audit-logs", headers=headers)
    assert res_logs.status_code == 200
    assert "audit_logs" in res_logs.json()

    # 3. Admin can broadcast alerts
    payload = {
        "title": "State-wide Cyclone Warning",
        "body": "Category 4 Cyclone approaching coastal sector.",
        "severity": "CRITICAL",
        "disaster_type": "CYCLONE",
        "target_region": "Gujarat State",
        "action_required": "EVACUATE_IMMEDIATELY"
    }
    res_alert = client.post("/api/alerts/broadcast", json=payload, headers=headers)
    assert res_alert.status_code == 200


def test_district_manager_privileges_and_boundaries():
    headers = {
        "X-Authority-ID": "DM-VADODARA-01",
        "X-Authority-Role": "DISTRICT_MANAGER",
        "X-Authority-Jurisdiction": "Vadodara"
    }
    # 1. District Manager can broadcast alert within own district
    payload_valid = {
        "title": "Vadodara Flood Alert",
        "body": "Water level rising in Vishwamitri River.",
        "severity": "HIGH",
        "disaster_type": "FLOOD",
        "target_region": "Vadodara District",
        "action_required": "SEEK_HIGH_GROUND"
    }
    res_valid = client.post("/api/alerts/broadcast", json=payload_valid, headers=headers)
    assert res_valid.status_code == 200

    # 2. District Manager CANNOT broadcast alert to unrelated district (HTTP 403)
    payload_invalid = {
        "title": "Shimla Debris Flow",
        "body": "Landslide reported near Shimla bypass.",
        "severity": "HIGH",
        "disaster_type": "LANDSLIDE",
        "target_region": "Shimla",
        "action_required": "AVOID_ROUTE"
    }
    res_invalid = client.post("/api/alerts/broadcast", json=payload_invalid, headers=headers)
    assert res_invalid.status_code == 403


def test_analyst_denied_operational_privileges():
    headers = {
        "X-Authority-ID": "ANALYST-99",
        "X-Authority-Role": "ANALYST",
        "X-Authority-Jurisdiction": "ALL"
    }
    # 1. Analyst cannot broadcast alerts (HTTP 403)
    payload = {
        "title": "Unauthorized Alert",
        "body": "Test alert by analyst",
        "severity": "LOW",
        "disaster_type": "FLOOD",
        "target_region": "Vadodara",
        "action_required": "NONE"
    }
    res = client.post("/api/alerts/broadcast", json=payload, headers=headers)
    assert res.status_code == 403
    assert "does not have authority" in res.json()["error"]

    # 2. Analyst cannot access civilian emergency medical data (HTTP 403)
    res_med = client.get("/api/medical/summary/demo-civilian-01", headers=headers)
    assert res_med.status_code == 403

    # 3. Analyst cannot update shelter status (HTTP 403)
    shelter_update = {"current_occupancy": 200, "status": "Open"}
    res_sh = client.post("/api/authority/shelters/sh_01/status", json=shelter_update, headers=headers)
    assert res_sh.status_code == 403


def test_volunteer_denied_medical_and_alert_privileges():
    headers = {
        "X-Authority-ID": "VOL-NGO-04",
        "X-Authority-Role": "VOLUNTEER",
        "X-Authority-Jurisdiction": "Vadodara"
    }
    # 1. Volunteer cannot access medical data (HTTP 403)
    res_med = client.get("/api/medical/summary/demo-civilian-01", headers=headers)
    assert res_med.status_code == 403

    # 2. Volunteer cannot broadcast emergency alerts (HTTP 403)
    payload = {
        "title": "Volunteer Warning",
        "body": "Unauthorized alert from volunteer",
        "severity": "HIGH",
        "disaster_type": "FLOOD",
        "target_region": "Vadodara",
        "action_required": "NONE"
    }
    res_alert = client.post("/api/alerts/broadcast", json=payload, headers=headers)
    assert res_alert.status_code == 403


def test_shelter_manager_restricted_to_assigned_shelter():
    headers = {
        "X-Authority-ID": "SM-SH01-LEAD",
        "X-Authority-Role": "SHELTER_MANAGER",
        "X-Authority-Jurisdiction": "sh_01",
        "X-Authority-Shelter": "sh_01"
    }
    # 1. Shelter manager CAN update assigned shelter (sh_01)
    payload = {"current_occupancy": 150, "status": "Open"}
    res_ok = client.post("/api/authority/shelters/sh_01/status", json=payload, headers=headers)
    assert res_ok.status_code == 200
    assert res_ok.json()["updated_occupancy"] == 150

    # 2. Shelter manager CANNOT update another shelter (sh_02) (HTTP 403)
    res_denied = client.post("/api/authority/shelters/sh_02/status", json=payload, headers=headers)
    assert res_denied.status_code == 403
    assert "restricted to assigned shelter" in res_denied.json()["error"]
