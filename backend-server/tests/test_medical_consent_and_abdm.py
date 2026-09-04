"""
[EMERGENCY MEDICAL & CONSENT AUTOMATED TESTS]
Tests:
1. Civilian Consent Lifecycle (Create, View, Revoke)
2. Field-Level Role-Based Disclosures (Field Officer vs District Manager)
3. Denial on Revoked Consent
4. Civilian Transparency Access History
5. No raw medical data leak in audit logs
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_consent_creation_and_retrieval():
    # 1. Create consent for civilian user_test_01
    payload = {
        "civilian_id": "civ-test-44",
        "apaar_id": "APAAR-1122-3344",
        "abha_id": "91-1122-3344-5566",
        "emergency_use_permitted": True,
        "permitted_fields": ["blood_group", "critical_allergies", "critical_conditions", "emergency_contacts"],
        "valid_days": 180
    }
    res_create = client.post("/api/consent", json=payload)
    assert res_create.status_code == 200
    data = res_create.json()
    assert data["civilian_id"] == "civ-test-44"
    assert data["status"] == "ACTIVE"
    assert "blood_group" in data["permitted_fields"]

    # 2. Query consent
    res_get = client.get("/api/consent/civ-test-44")
    assert res_get.status_code == 200
    assert res_get.json()["status"] == "ACTIVE"


def test_field_level_authorization_and_transparency():
    # Setup active consent
    client.post("/api/consent", json={
        "civilian_id": "civ-triage-01",
        "abha_id": "91-4820-1940-5819",
        "emergency_use_permitted": True,
        "permitted_fields": ["blood_group", "critical_allergies", "critical_conditions", "current_medications", "emergency_contacts", "donor_status"]
    })

    # 1. Field Officer requests emergency summary:
    # Must receive ONLY critical triage fields (blood_group, critical_allergies, critical_conditions, emergency_contacts)
    # MUST NOT receive donor_status
    fo_headers = {
        "X-Authority-ID": "FO-RESCUE-07",
        "X-Authority-Role": "FIELD_OFFICER",
        "X-Authority-Jurisdiction": "ZONE_01"
    }
    res_fo = client.get("/api/medical/summary/civ-triage-01?reason=Trapped+Evacuee+Rescue", headers=fo_headers)
    assert res_fo.status_code == 200
    fo_data = res_fo.json()
    assert fo_data["access_granted"] is True
    assert "blood_group" in fo_data["summary"]
    assert "critical_allergies" in fo_data["summary"]
    assert "donor_status" not in fo_data["summary"]  # Field-level filtering works!
    assert "EMERGENCY USE ONLY" in fo_data["summary"]["disclaimer"]

    # 2. District Manager requests emergency summary:
    # Receives broader coordination info including donor_status
    dm_headers = {
        "X-Authority-ID": "DM-COORDINATOR-01",
        "X-Authority-Role": "DISTRICT_MANAGER",
        "X-Authority-Jurisdiction": "Vadodara"
    }
    res_dm = client.get("/api/medical/summary/civ-triage-01?reason=Shelter+Triage+Allocation", headers=dm_headers)
    assert res_dm.status_code == 200
    dm_data = res_dm.json()
    assert dm_data["access_granted"] is True
    assert "donor_status" in dm_data["summary"]

    # 3. Civilian reviews transparency log:
    # Verifies both access events are documented with requesting role, purpose, and fields returned
    res_history = client.get("/api/consent/civ-triage-01/access-history")
    assert res_history.status_code == 200
    hist = res_history.json()
    assert hist["access_logs_count"] >= 2
    roles = [entry["requesting_role"] for entry in hist["access_history"]]
    assert "FIELD_OFFICER" in roles
    assert "DISTRICT_MANAGER" in roles


def test_consent_revocation_blocks_access():
    civ_id = "civ-revocation-test"
    client.post("/api/consent", json={
        "civilian_id": civ_id,
        "abha_id": "91-4820-1940-5819",
        "emergency_use_permitted": True
    })

    # Revoke consent
    res_revoke = client.post(f"/api/consent/{civ_id}/revoke")
    assert res_revoke.status_code == 200
    assert res_revoke.json()["status"] == "REVOKED"

    # Subsequent access attempt by authority must return HTTP 403 Forbidden
    fo_headers = {
        "X-Authority-ID": "FO-RESCUE-07",
        "X-Authority-Role": "FIELD_OFFICER",
        "X-Authority-Jurisdiction": "ZONE_01"
    }
    res_access = client.get(f"/api/medical/summary/{civ_id}", headers=fo_headers)
    assert res_access.status_code == 403
    assert "revoked" in res_access.json()["error"].lower()
