"""
[EMERGENCY MEDICAL SERVICE & FIELD-LEVEL ACCESS CONTROL]
Orchestrates:
1. Civilian Consent Enforcement (Active, Expired, Revoked verification)
2. Field-Level Role-Based Authorization
3. Encrypted Ephemeral Caching (AES-256 Fernet + Configurable TTL + Auto-purge)
4. Audit Trail Recording (Zero raw medical values in audit logs)
5. Fail-Safe Degradation (medical_data_status: 'unavailable' on error)
"""
import os
import time
import json
import base64
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from cryptography.fernet import Fernet

from security.rbac import AuthorityRole
from security.scope import AuthorityContext
from database.security_repositories import EmergencyConsentRepository, MedicalAuditRepository
from services.health.provider_interface import HealthRecordProvider
from services.health.abdm_adapter import ABDMHealthRecordAdapter

logger = logging.getLogger("suraksha_medical")

# Generate or load encryption key for ephemeral in-memory cache
_ENCRYPTION_KEY = os.getenv("MEDICAL_CACHE_SECRET")
if not _ENCRYPTION_KEY:
    _ENCRYPTION_KEY = Fernet.generate_key().decode()
_cipher = Fernet(_ENCRYPTION_KEY.encode() if isinstance(_ENCRYPTION_KEY, str) else _ENCRYPTION_KEY)

# Ephemeral encrypted cache store: civilian_id -> { "cipher_text": bytes, "expires_at": float }
_EPHEMERAL_CACHE: Dict[str, Dict[str, Any]] = {}
MEDICAL_DATA_TTL_SECONDS = int(os.getenv("MEDICAL_DATA_TTL_SECONDS", "900"))  # Default 15 mins


# Field-level permission boundaries by Authority Role
ROLE_FIELD_PERMISSIONS: Dict[AuthorityRole, List[str]] = {
    AuthorityRole.FIELD_OFFICER: [
        "blood_group",
        "critical_allergies",
        "critical_conditions",
        "emergency_contacts"
    ],
    AuthorityRole.DISTRICT_MANAGER: [
        "blood_group",
        "critical_allergies",
        "critical_conditions",
        "current_medications",
        "emergency_contacts",
        "donor_status"
    ],
    AuthorityRole.ADMIN: [
        "blood_group",
        "critical_allergies",
        "critical_conditions",
        "current_medications",
        "emergency_contacts",
        "donor_status"
    ],
    AuthorityRole.SHELTER_MANAGER: [
        "blood_group",
        "critical_allergies",
        "emergency_contacts"
    ],
    # Analyst and Volunteer get NO personal medical fields
    AuthorityRole.ANALYST: [],
    AuthorityRole.VOLUNTEER: []
}


class EmergencyMedicalService:
    def __init__(
        self,
        health_provider: Optional[HealthRecordProvider] = None,
        consent_repo: Optional[EmergencyConsentRepository] = None,
        audit_repo: Optional[MedicalAuditRepository] = None
    ):
        self.provider = health_provider or ABDMHealthRecordAdapter()
        self.consent_repo = consent_repo or EmergencyConsentRepository()
        self.audit_repo = audit_repo or MedicalAuditRepository()

    def _purge_expired_cache(self):
        """Removes expired ephemeral records from memory."""
        now = time.time()
        expired_keys = [k for k, v in _EPHEMERAL_CACHE.items() if v["expires_at"] <= now]
        for k in expired_keys:
            del _EPHEMERAL_CACHE[k]

    def _get_from_cache(self, civilian_id: str) -> Optional[Dict[str, Any]]:
        self._purge_expired_cache()
        entry = _EPHEMERAL_CACHE.get(civilian_id)
        if not entry:
            return None
        try:
            decrypted = _cipher.decrypt(entry["cipher_text"])
            return json.loads(decrypted.decode("utf-8"))
        except Exception as e:
            logger.warning(f"[CACHE DECRYPT ERROR] Failed to decrypt cache: {e}")
            return None

    def _set_in_cache(self, civilian_id: str, data: Dict[str, Any]):
        self._purge_expired_cache()
        # Bound cache size to prevent memory bloat
        if len(_EPHEMERAL_CACHE) >= 3000:
            oldest_keys = sorted(_EPHEMERAL_CACHE.keys(), key=lambda k: _EPHEMERAL_CACHE[k]["expires_at"])[:500]
            for k in oldest_keys:
                del _EPHEMERAL_CACHE[k]

        try:
            raw_bytes = json.dumps(data).encode("utf-8")
            encrypted = _cipher.encrypt(raw_bytes)
            _EPHEMERAL_CACHE[civilian_id] = {
                "cipher_text": encrypted,
                "expires_at": time.time() + MEDICAL_DATA_TTL_SECONDS
            }
        except Exception as e:
            logger.warning(f"[CACHE ENCRYPT ERROR] Failed to encrypt ephemeral cache: {e}")

    def get_emergency_medical_summary(
        self,
        civilian_id: str,
        authority: AuthorityContext,
        access_reason: str = "Emergency Search & Rescue Triage",
        emergency_event_id: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Securely retrieves minimum necessary emergency medical summary for authorized authority.
        Applies:
        - Strict consent verification (blocks if missing, expired, or revoked)
        - Role-based field filtering (blocks Analyst/Volunteer, limits Field/Shelter)
        - Zero-leak audit trail
        - Fail-safe fallback
        """
        requested_fields = [
            "blood_group",
            "critical_allergies",
            "critical_conditions",
            "current_medications",
            "emergency_contacts"
        ]

        # 1. Block unauthorized roles immediately
        allowed_fields_for_role = ROLE_FIELD_PERMISSIONS.get(authority.role, [])
        if not allowed_fields_for_role:
            self.audit_repo.log_access(
                civilian_id=civilian_id,
                requesting_authority_id=authority.authority_id,
                requesting_role=authority.role.value,
                access_reason=access_reason,
                fields_requested=requested_fields,
                fields_returned=[],
                decision="DENIED",
                emergency_event_id=emergency_event_id,
                request_id=request_id,
                denial_reason=f"Role '{authority.role.value}' is strictly barred from accessing civilian medical data."
            )
            return {
                "access_granted": False,
                "medical_data_status": "access_denied",
                "reason": f"Role '{authority.role.value}' is not authorized to access medical data.",
                "summary": None
            }

        # 2. Check Civilian Emergency Consent
        consent = self.consent_repo.get_consent(civilian_id)
        if not consent:
            self.audit_repo.log_access(
                civilian_id=civilian_id,
                requesting_authority_id=authority.authority_id,
                requesting_role=authority.role.value,
                access_reason=access_reason,
                fields_requested=requested_fields,
                fields_returned=[],
                decision="DENIED",
                emergency_event_id=emergency_event_id,
                request_id=request_id,
                denial_reason="No emergency consent record found on file."
            )
            return {
                "access_granted": False,
                "medical_data_status": "no_consent",
                "reason": "Civilian has not granted emergency medical access.",
                "summary": None
            }

        # Verify consent status
        if consent.get("status") == "REVOKED":
            self.audit_repo.log_access(
                civilian_id=civilian_id,
                requesting_authority_id=authority.authority_id,
                requesting_role=authority.role.value,
                access_reason=access_reason,
                fields_requested=requested_fields,
                fields_returned=[],
                decision="DENIED",
                emergency_event_id=emergency_event_id,
                request_id=request_id,
                denial_reason="Emergency consent was revoked by civilian."
            )
            return {
                "access_granted": False,
                "medical_data_status": "consent_revoked",
                "reason": "Emergency consent was revoked by the civilian.",
                "summary": None
            }

        # Verify consent expiration
        valid_until_str = consent.get("valid_until")
        if valid_until_str:
            try:
                valid_until_dt = datetime.fromisoformat(valid_until_str.replace("Z", "+00:00"))
                if datetime.now(timezone.utc) > valid_until_dt:
                    self.audit_repo.log_access(
                        civilian_id=civilian_id,
                        requesting_authority_id=authority.authority_id,
                        requesting_role=authority.role.value,
                        access_reason=access_reason,
                        fields_requested=requested_fields,
                        fields_returned=[],
                        decision="DENIED",
                        emergency_event_id=emergency_event_id,
                        request_id=request_id,
                        denial_reason="Emergency consent has expired."
                    )
                    return {
                        "access_granted": False,
                        "medical_data_status": "consent_expired",
                        "reason": "Emergency medical consent has expired.",
                        "summary": None
                    }
            except Exception:
                pass

        # 3. Retrieve Record (from Encrypted Ephemeral Cache or Provider)
        cached_record = self._get_from_cache(civilian_id)
        raw_record = cached_record
        if not raw_record:
            try:
                raw_record = self.provider.fetch_emergency_record(consent.get("abha_id") or civilian_id)
                if raw_record:
                    self._set_in_cache(civilian_id, raw_record)
            except Exception as e:
                logger.error(f"[MEDICAL PROVIDER ERROR] Provider retrieval failed: {e}")
                raw_record = None

        if not raw_record:
            # Life-Safety Fail-Safe: Graceful response without crashing caller
            self.audit_repo.log_access(
                civilian_id=civilian_id,
                requesting_authority_id=authority.authority_id,
                requesting_role=authority.role.value,
                access_reason=access_reason,
                fields_requested=requested_fields,
                fields_returned=[],
                decision="DENIED",
                emergency_event_id=emergency_event_id,
                request_id=request_id,
                denial_reason="ABDM Provider health record unavailable."
            )
            return {
                "access_granted": False,
                "medical_data_status": "unavailable",
                "reason": "Health provider record temporarily unavailable.",
                "summary": None
            }

        # 4. Filter to Minimum Necessary Fields (Intersect role permissions & civilian permitted fields)
        civilian_permitted = consent.get("permitted_fields") or []
        effective_fields = [f for f in allowed_fields_for_role if f in civilian_permitted]

        filtered_summary = {
            "civilian_id": civilian_id,
            "disclaimer": "EMERGENCY USE ONLY — ACCESS LOGGED AND MONITORED",
            "last_retrieved": datetime.now(timezone.utc).isoformat(),
            "consent_status": "ACTIVE"
        }
        for field in effective_fields:
            if field in raw_record:
                filtered_summary[field] = raw_record[field]

        # 5. Record Audit Trail (Zero sensitive values recorded)
        self.audit_repo.log_access(
            civilian_id=civilian_id,
            requesting_authority_id=authority.authority_id,
            requesting_role=authority.role.value,
            access_reason=access_reason,
            fields_requested=requested_fields,
            fields_returned=effective_fields,
            decision="GRANTED",
            emergency_event_id=emergency_event_id,
            request_id=request_id
        )

        return {
            "access_granted": True,
            "medical_data_status": "verified",
            "authority_role": authority.role.value,
            "fields_disclosed": effective_fields,
            "summary": filtered_summary
        }
