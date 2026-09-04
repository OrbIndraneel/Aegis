"""
[MOCK HEALTH RECORD ADAPTER]
High-fidelity sandbox emergency health record adapter for local testing and offline simulation.
"""
from typing import Dict, Any, Optional
from services.health.provider_interface import HealthRecordProvider

# Standard mock emergency health database
SANDBOX_HEALTH_RECORDS: Dict[str, Dict[str, Any]] = {
    "demo-civilian-01": {
        "health_id": "91-4820-1940-5819",
        "abha_address": "rohan.verma@abdm",
        "blood_group": "O+",
        "critical_allergies": ["Penicillin", "Sulfonamides"],
        "critical_conditions": ["Type 1 Diabetes Mellitus", "Mild Asthma"],
        "current_medications": ["Insulin Glargine 10 units daily", "Albuterol Inhaler PRN"],
        "emergency_contacts": [
            {"name": "Ananya Verma", "relation": "Spouse", "phone": "+91-98765-11223"}
        ],
        "donor_status": "Organ Donor",
        "last_updated": "2026-08-15T10:30:00Z",
        "provider": "ABDM Mock Sandbox (AIIMS New Delhi Node)"
    },
    "default": {
        "health_id": "91-0000-0000-0001",
        "abha_address": "citizen@abdm",
        "blood_group": "B+",
        "critical_allergies": ["None Known"],
        "critical_conditions": ["Hypertension"],
        "current_medications": ["Amlodipine 5mg"],
        "emergency_contacts": [
            {"name": "Emergency Contact", "relation": "Family", "phone": "+91-98765-00000"}
        ],
        "donor_status": "Not Specified",
        "last_updated": "2026-07-20T08:00:00Z",
        "provider": "ABDM Mock Sandbox Node"
    }
}


class MockHealthRecordAdapter(HealthRecordProvider):
    def fetch_emergency_record(self, health_id: str) -> Optional[Dict[str, Any]]:
        record = SANDBOX_HEALTH_RECORDS.get(health_id) or SANDBOX_HEALTH_RECORDS.get("default")
        return dict(record)

    def verify_health_id(self, health_id: str) -> Dict[str, Any]:
        return {
            "health_id": health_id,
            "status": "ACTIVE",
            "is_valid": True,
            "provider": "ABDM Sandbox Mock Registry"
        }
