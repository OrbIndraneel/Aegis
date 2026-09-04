"""
[EMERGENCY MEDICAL & CONSENT API ROUTES]
Provides:
1. Civilian Emergency Consent lifecycle (Create, View, Revoke)
2. Civilian Access Transparency History (Who accessed medical data, when, why, which fields)
3. Minimum Necessary Emergency Medical Summary (Authorized, field-filtered, audited)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from security.auth import get_current_authority
from security.scope import AuthorityContext
from security.rate_limiter import rate_limit, RateLimitTier
from services.health.medical_service import EmergencyMedicalService
from database.security_repositories import EmergencyConsentRepository, MedicalAuditRepository

router = APIRouter()

medical_service = EmergencyMedicalService()
consent_repo = EmergencyConsentRepository()
audit_repo = MedicalAuditRepository()


class ConsentCreateRequest(BaseModel):
    civilian_id: str = Field(..., json_schema_extra={"example": "demo-civilian-01"})
    apaar_id: Optional[str] = Field(None, json_schema_extra={"example": "APAAR-9821-4091"})
    abha_id: Optional[str] = Field(None, json_schema_extra={"example": "91-4820-1940-5819"})
    purpose: Optional[str] = Field("Emergency disaster response & life-saving medical triage")
    emergency_use_permitted: bool = Field(True)
    permitted_fields: Optional[List[str]] = Field(
        default=["blood_group", "critical_allergies", "critical_conditions", "current_medications", "emergency_contacts"]
    )
    valid_days: int = Field(365, ge=1, le=730)


class ConsentResponse(BaseModel):
    id: str
    civilian_id: str
    status: str
    emergency_use_permitted: bool
    permitted_fields: List[str]
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    revoked_at: Optional[str] = None


@router.post(
    "/consent",
    response_model=ConsentResponse,
    dependencies=[Depends(rate_limit(max_requests=RateLimitTier.STRICT[0], window_seconds=RateLimitTier.STRICT[1]))],
    summary="Create or renew emergency medical consent"
)
def create_emergency_consent(request: ConsentCreateRequest):
    """Allows civilian to grant or update emergency medical data sharing."""
    record = consent_repo.upsert_consent(
        civilian_id=request.civilian_id,
        apaar_id=request.apaar_id,
        abha_id=request.abha_id,
        purpose=request.purpose,
        emergency_use_permitted=request.emergency_use_permitted,
        permitted_fields=request.permitted_fields,
        valid_days=request.valid_days
    )
    return record


@router.get("/consent/{civilian_id}", response_model=Optional[ConsentResponse], summary="Get civilian consent status")
def get_emergency_consent(civilian_id: str):
    """Retrieves current emergency consent status for civilian."""
    consent = consent_repo.get_consent(civilian_id)
    if not consent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No consent record found for this civilian ID.")
    return consent


@router.post("/consent/{civilian_id}/revoke", summary="Revoke emergency medical consent immediately")
def revoke_emergency_consent(civilian_id: str):
    """Immediate civilian-controlled revocation of emergency health access."""
    revoked = consent_repo.revoke_consent(civilian_id)
    if not revoked:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active consent found to revoke.")
    return {"status": "REVOKED", "message": "Emergency medical access revoked successfully."}


@router.get("/consent/{civilian_id}/access-history", summary="Civilian transparency access history")
def get_medical_access_history(civilian_id: str):
    """
    Civilian Transparency Log:
    Lists which authority role accessed emergency health summary, timestamp, purpose, and fields disclosed.
    Never exposes internal sensitive secrets.
    """
    history = audit_repo.get_civilian_transparency_history(civilian_id)
    return {
        "civilian_id": civilian_id,
        "access_logs_count": len(history),
        "access_history": history
    }


@router.get(
    "/medical/summary/{civilian_id}",
    dependencies=[Depends(rate_limit(max_requests=RateLimitTier.STRICT[0], window_seconds=RateLimitTier.STRICT[1]))],
    summary="Fetch minimum necessary emergency medical summary"
)
def get_emergency_medical_summary(
    civilian_id: str,
    request: Request,
    reason: str = Query("Emergency Triage", description="Operational justification"),
    event_id: Optional[str] = Query(None, description="Active emergency/incident ID"),
    authority: AuthorityContext = Depends(get_current_authority)
):
    """
    Authority access endpoint for emergency medical summary.
    Enforces RBAC field boundaries, civilian consent, ephemeral caching, and audit logging.
    """
    req_id = getattr(request.state, "request_id", None)
    result = medical_service.get_emergency_medical_summary(
        civilian_id=civilian_id,
        authority=authority,
        access_reason=reason,
        emergency_event_id=event_id,
        request_id=req_id
    )

    if not result["access_granted"]:
        if result["medical_data_status"] == "access_denied":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=result["reason"])
        elif result["medical_data_status"] in ("no_consent", "consent_revoked", "consent_expired"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=result["reason"])

    return result
