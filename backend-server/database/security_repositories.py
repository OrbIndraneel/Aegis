"""
[SECURITY REPOSITORIES]
Data access layer for Authority Audit Logs, Emergency Medical Consent,
Medical Access Audit, and Evacuation Route Overrides.
Includes graceful in-memory fallbacks when PostgreSQL connection is unavailable.
"""
import uuid
import datetime
import json
from typing import List, Dict, Any, Optional

# In-Memory Fallback Stores
MOCK_AUDIT_LOGS: List[Dict[str, Any]] = []
MOCK_CONSENTS: Dict[str, Dict[str, Any]] = {
    "demo-civilian-01": {
        "id": "consent-demo-01",
        "civilian_id": "demo-civilian-01",
        "apaar_id": "APAAR-9821-4091",
        "abha_id": "91-4820-1940-5819",
        "purpose": "Emergency disaster response & life-saving medical triage",
        "status": "ACTIVE",
        "emergency_use_permitted": True,
        "permitted_fields": [
            "blood_group",
            "critical_allergies",
            "critical_conditions",
            "current_medications",
            "emergency_contacts"
        ],
        "valid_from": "2026-01-01T00:00:00Z",
        "valid_until": "2027-01-01T00:00:00Z",
        "revoked_at": None,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    }
}
MOCK_MEDICAL_AUDIT: List[Dict[str, Any]] = []
MOCK_ROUTE_OVERRIDES: List[Dict[str, Any]] = []


class AuthorityAuditRepository:
    def __init__(self, db_session=None):
        self.db = db_session

    def log_action(
        self,
        authority_id: str,
        role: str,
        resource: str,
        action: str,
        status: str = "SUCCESS",
        request_id: Optional[str] = None,
        geographic_scope: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Logs an authority action into the audit trail."""
        log_id = str(uuid.uuid4())
        created_at_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        details_json = details or {}

        if self.db is not None:
            try:
                from sqlalchemy import text
                query = text("""
                    INSERT INTO authority_audit_logs 
                    (id, authority_id, role, resource, action, request_id, geographic_scope, status, details, reason, ip_address, created_at)
                    VALUES 
                    (:id, :auth_id, :role, :res, :act, :req_id, :geo_scope, :status, :details, :reason, :ip, :created_at)
                    RETURNING id, authority_id, role, resource, action, request_id, geographic_scope, status, details, reason, ip_address, created_at;
                """)
                res = self.db.execute(query, {
                    "id": log_id,
                    "auth_id": authority_id,
                    "role": role,
                    "res": resource,
                    "act": action,
                    "req_id": request_id,
                    "geo_scope": geographic_scope,
                    "status": status,
                    "details": json.dumps(details_json),
                    "reason": reason,
                    "ip": ip_address,
                    "created_at": created_at_str
                }).fetchone()
                self.db.commit()
                if res:
                    row = dict(res._mapping)
                    row["details"] = details_json
                    return row
            except Exception as e:
                print(f"[AUDIT DB ERROR] Failed to write audit log to database: {e}")
                pass

        # In-memory fallback
        record = {
            "id": log_id,
            "authority_id": authority_id,
            "role": role,
            "resource": resource,
            "action": action,
            "status": status,
            "request_id": request_id,
            "geographic_scope": geographic_scope,
            "details": details_json,
            "reason": reason,
            "ip_address": ip_address,
            "created_at": created_at_str
        }
        MOCK_AUDIT_LOGS.insert(0, record)
        return record

    def get_logs(
        self,
        authority_id: Optional[str] = None,
        role: Optional[str] = None,
        resource: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Retrieves paginated audit logs."""
        if self.db is not None:
            try:
                from sqlalchemy import text
                query = text("""
                    SELECT id, authority_id, role, resource, action, request_id, geographic_scope, status, details, reason, ip_address, created_at
                    FROM authority_audit_logs
                    ORDER BY created_at DESC
                    LIMIT :limit;
                """)
                result = self.db.execute(query, {"limit": limit}).fetchall()
                if result:
                    return [dict(r._mapping) for r in result]
            except Exception as e:
                print(f"[AUDIT DB ERROR] Failed to query audit logs: {e}")
                pass

        filtered = MOCK_AUDIT_LOGS
        if authority_id:
            filtered = [l for l in filtered if l["authority_id"] == authority_id]
        if role:
            filtered = [l for l in filtered if l["role"] == role]
        if resource:
            filtered = [l for l in filtered if l["resource"] == resource]
        return filtered[:limit]


class EmergencyConsentRepository:
    def __init__(self, db_session=None):
        self.db = db_session

    def get_consent(self, civilian_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves civilian's active emergency medical consent."""
        if self.db is not None:
            try:
                from sqlalchemy import text
                query = text("""
                    SELECT id, civilian_id, apaar_id, abha_id, purpose, status, 
                           emergency_use_permitted, permitted_fields, valid_from, valid_until, revoked_at, created_at, updated_at
                    FROM emergency_consents
                    WHERE civilian_id = :civ_id
                    ORDER BY created_at DESC
                    LIMIT 1;
                """)
                res = self.db.execute(query, {"civ_id": civilian_id}).fetchone()
                if res:
                    row = dict(res._mapping)
                    if isinstance(row.get("permitted_fields"), str):
                        row["permitted_fields"] = json.loads(row["permitted_fields"])
                    return row
            except Exception as e:
                print(f"[CONSENT DB ERROR] Error fetching consent: {e}")
                pass

        return MOCK_CONSENTS.get(civilian_id)

    def upsert_consent(
        self,
        civilian_id: str,
        apaar_id: Optional[str] = None,
        abha_id: Optional[str] = None,
        purpose: Optional[str] = None,
        emergency_use_permitted: bool = True,
        permitted_fields: Optional[List[str]] = None,
        valid_days: int = 365
    ) -> Dict[str, Any]:
        """Creates or renews an emergency medical consent."""
        now = datetime.datetime.now(datetime.timezone.utc)
        valid_from_str = now.isoformat()
        valid_until_str = (now + datetime.timedelta(days=valid_days)).isoformat()
        fields = permitted_fields or [
            "blood_group",
            "critical_allergies",
            "critical_conditions",
            "current_medications",
            "emergency_contacts"
        ]
        consent_id = str(uuid.uuid4())
        default_purpose = purpose or "Emergency disaster response & life-saving medical triage"

        if self.db is not None:
            try:
                from sqlalchemy import text
                query = text("""
                    INSERT INTO emergency_consents 
                    (id, civilian_id, apaar_id, abha_id, purpose, status, emergency_use_permitted, permitted_fields, valid_from, valid_until, created_at, updated_at)
                    VALUES 
                    (:id, :civ_id, :apaar_id, :abha_id, :purpose, 'ACTIVE', :perm, :fields, :from_dt, :until_dt, :now, :now)
                    RETURNING id, civilian_id, apaar_id, abha_id, purpose, status, emergency_use_permitted, permitted_fields, valid_from, valid_until, created_at;
                """)
                res = self.db.execute(query, {
                    "id": consent_id,
                    "civ_id": civilian_id,
                    "apaar_id": apaar_id,
                    "abha_id": abha_id,
                    "purpose": default_purpose,
                    "perm": emergency_use_permitted,
                    "fields": json.dumps(fields),
                    "from_dt": valid_from_str,
                    "until_dt": valid_until_str,
                    "now": valid_from_str
                }).fetchone()
                self.db.commit()
                if res:
                    row = dict(res._mapping)
                    row["permitted_fields"] = fields
                    return row
            except Exception as e:
                print(f"[CONSENT DB ERROR] Error upserting consent: {e}")
                pass

        record = {
            "id": consent_id,
            "civilian_id": civilian_id,
            "apaar_id": apaar_id or "APAAR-DEMO-001",
            "abha_id": abha_id or "91-0000-0000-0001",
            "purpose": default_purpose,
            "status": "ACTIVE",
            "emergency_use_permitted": emergency_use_permitted,
            "permitted_fields": fields,
            "valid_from": valid_from_str,
            "valid_until": valid_until_str,
            "revoked_at": None,
            "created_at": valid_from_str,
            "updated_at": valid_from_str
        }
        MOCK_CONSENTS[civilian_id] = record
        return record

    def revoke_consent(self, civilian_id: str) -> bool:
        """Revokes an emergency medical consent immediately."""
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if self.db is not None:
            try:
                from sqlalchemy import text
                query = text("""
                    UPDATE emergency_consents
                    SET status = 'REVOKED', revoked_at = :revoked_at, updated_at = :revoked_at
                    WHERE civilian_id = :civ_id AND status = 'ACTIVE';
                """)
                self.db.execute(query, {"revoked_at": now_str, "civ_id": civilian_id})
                self.db.commit()
            except Exception as e:
                print(f"[CONSENT DB ERROR] Error revoking consent: {e}")
                pass

        if civilian_id in MOCK_CONSENTS:
            MOCK_CONSENTS[civilian_id]["status"] = "REVOKED"
            MOCK_CONSENTS[civilian_id]["revoked_at"] = now_str
            return True
        return False


class MedicalAuditRepository:
    def __init__(self, db_session=None):
        self.db = db_session

    def log_access(
        self,
        civilian_id: str,
        requesting_authority_id: str,
        requesting_role: str,
        access_reason: str,
        fields_requested: List[str],
        fields_returned: List[str],
        decision: str,
        emergency_event_id: Optional[str] = None,
        request_id: Optional[str] = None,
        denial_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Logs medical data access metadata. NEVER stores raw medical values."""
        log_id = str(uuid.uuid4())
        created_at_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

        if self.db is not None:
            try:
                from sqlalchemy import text
                query = text("""
                    INSERT INTO medical_access_audit 
                    (id, civilian_id, requesting_authority_id, requesting_role, access_reason, 
                     fields_requested, fields_returned, emergency_event_id, request_id, decision, denial_reason, created_at)
                    VALUES 
                    (:id, :civ_id, :auth_id, :role, :reason, :freq, :fret, :event_id, :req_id, :decision, :denial, :now)
                    RETURNING id, civilian_id, requesting_authority_id, requesting_role, access_reason, fields_requested, fields_returned, decision, created_at;
                """)
                res = self.db.execute(query, {
                    "id": log_id,
                    "civ_id": civilian_id,
                    "auth_id": requesting_authority_id,
                    "role": requesting_role,
                    "reason": access_reason,
                    "freq": json.dumps(fields_requested),
                    "fret": json.dumps(fields_returned),
                    "event_id": emergency_event_id,
                    "req_id": request_id,
                    "decision": decision,
                    "denial": denial_reason,
                    "now": created_at_str
                }).fetchone()
                self.db.commit()
                if res:
                    row = dict(res._mapping)
                    row["fields_requested"] = fields_requested
                    row["fields_returned"] = fields_returned
                    return row
            except Exception as e:
                print(f"[MEDICAL AUDIT DB ERROR] Failed to record medical audit: {e}")
                pass

        record = {
            "id": log_id,
            "civilian_id": civilian_id,
            "requesting_authority_id": requesting_authority_id,
            "requesting_role": requesting_role,
            "access_reason": access_reason,
            "fields_requested": fields_requested,
            "fields_returned": fields_returned,
            "emergency_event_id": emergency_event_id,
            "request_id": request_id,
            "decision": decision,
            "denial_reason": denial_reason,
            "created_at": created_at_str
        }
        MOCK_MEDICAL_AUDIT.insert(0, record)
        return record

    def get_civilian_transparency_history(self, civilian_id: str) -> List[Dict[str, Any]]:
        """Returns civilian user transparency history: who accessed data, role, when, why, and fields accessed."""
        if self.db is not None:
            try:
                from sqlalchemy import text
                query = text("""
                    SELECT id, requesting_role, access_reason, fields_returned, decision, created_at
                    FROM medical_access_audit
                    WHERE civilian_id = :civ_id
                    ORDER BY created_at DESC;
                """)
                rows = self.db.execute(query, {"civ_id": civilian_id}).fetchall()
                if rows:
                    results = []
                    for r in rows:
                        item = dict(r._mapping)
                        if isinstance(item.get("fields_returned"), str):
                            item["fields_returned"] = json.loads(item["fields_returned"])
                        results.append(item)
                    return results
            except Exception as e:
                print(f"[MEDICAL AUDIT DB ERROR] Failed to query civilian transparency history: {e}")
                pass

        results = []
        for a in MOCK_MEDICAL_AUDIT:
            if a["civilian_id"] == civilian_id:
                results.append({
                    "id": a["id"],
                    "requesting_role": a["requesting_role"],
                    "access_reason": a["access_reason"],
                    "fields_returned": a["fields_returned"],
                    "decision": a["decision"],
                    "created_at": a["created_at"]
                })
        return results


class EvacuationOverrideRepository:
    def __init__(self, db_session=None):
        self.db = db_session

    def create_override_request(
        self,
        original_route_id: str,
        requested_changes: Dict[str, Any],
        override_polyline: List[List[float]],
        authority_id: str,
        authority_role: str,
        reason: str
    ) -> Dict[str, Any]:
        """Stores route override request without modifying the core route solver output."""
        override_id = str(uuid.uuid4())
        created_at_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        initial_status = "APPROVED" if authority_role in ("ADMIN", "DISTRICT_MANAGER") else "PENDING"

        if self.db is not None:
            try:
                from sqlalchemy import text
                query = text("""
                    INSERT INTO evacuation_override_requests
                    (id, original_route_id, requested_changes, override_polyline, authority_id, authority_role, reason, status, created_at)
                    VALUES
                    (:id, :route_id, :changes, :poly, :auth_id, :role, :reason, :status, :now)
                    RETURNING id, original_route_id, status, authority_id, authority_role, reason, created_at;
                """)
                res = self.db.execute(query, {
                    "id": override_id,
                    "route_id": original_route_id,
                    "changes": json.dumps(requested_changes),
                    "poly": json.dumps(override_polyline),
                    "auth_id": authority_id,
                    "role": authority_role,
                    "reason": reason,
                    "status": initial_status,
                    "now": created_at_str
                }).fetchone()
                self.db.commit()
                if res:
                    return dict(res._mapping)
            except Exception as e:
                print(f"[OVERRIDE DB ERROR] Failed to record route override: {e}")
                pass

        record = {
            "id": override_id,
            "original_route_id": original_route_id,
            "requested_changes": requested_changes,
            "override_polyline": override_polyline,
            "authority_id": authority_id,
            "authority_role": authority_role,
            "reason": reason,
            "status": initial_status,
            "created_at": created_at_str
        }
        MOCK_ROUTE_OVERRIDES.insert(0, record)
        return record

    def list_overrides(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Lists recent evacuation route overrides."""
        if self.db is not None:
            try:
                from sqlalchemy import text
                query = text("""
                    SELECT id, original_route_id, status, authority_id, authority_role, reason, created_at
                    FROM evacuation_override_requests
                    ORDER BY created_at DESC
                    LIMIT :limit;
                """)
                rows = self.db.execute(query, {"limit": limit}).fetchall()
                if rows:
                    return [dict(r._mapping) for r in rows]
            except Exception as e:
                print(f"[OVERRIDE DB ERROR] Failed to query overrides: {e}")
                pass

        return MOCK_ROUTE_OVERRIDES[:limit]
