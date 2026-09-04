from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from datetime import datetime
from api.schemas.disaster import AlertBroadcastRequest, AlertBroadcastResponse
from security.auth import get_current_authority
from security.scope import AuthorityContext, validate_geographic_scope
from security.rbac import AuthorityRole, Resource, Action, has_permission
from database.security_repositories import AuthorityAuditRepository

router = APIRouter()
audit_repo = AuthorityAuditRepository()

ACTIVE_BROADCAST_ALERTS: List[AlertBroadcastResponse] = [
    AlertBroadcastResponse(
        alert_id="alt-001",
        title="EVACUATION WARNING: Vishwamitri River Overflow",
        body="River water level has breached danger mark 2.6m. Sayajigunj & Sector 3 residents must evacuate immediately to Akota Stadium Shelter.",
        severity="CRITICAL",
        disaster_type="FLOOD",
        target_region="Vadodara",
        issued_by="District Disaster Management Authority (DDMA)",
        issued_at="10 mins ago",
        action_required="EVACUATE_IMMEDIATELY",
        affected_population_estimate=48000,
        acknowledgment_required=True
    ),
    AlertBroadcastResponse(
        alert_id="alt-002",
        title="FLASH FLOOD WATCH: Badrinath Highway Route",
        body="Heavy precipitation (>120mm/hr) detected. High risk of debris flow near Joshimath bypass.",
        severity="HIGH",
        disaster_type="LANDSLIDE",
        target_region="Uttarakhand",
        issued_by="State Emergency Operation Center (SEOC)",
        issued_at="35 mins ago",
        action_required="SEEK_HIGH_GROUND",
        affected_population_estimate=12500,
        acknowledgment_required=False
    )
]

@router.post("/alerts/broadcast", response_model=AlertBroadcastResponse)
def broadcast_emergency_alert(
    request: AlertBroadcastRequest,
    http_request: Request,
    authority: AuthorityContext = Depends(get_current_authority)
):
    # 1. RBAC Permission Check
    if not has_permission(authority.role, Resource.ALERTS, Action.BROADCAST):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{authority.role.value}' does not have authority to broadcast emergency alerts."
        )

    # 2. Geographic Scoping Check
    if not validate_geographic_scope(authority, target_region=request.target_region):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Authority '{authority.authority_id}' with jurisdiction '{authority.jurisdiction_id}' cannot broadcast alerts to out-of-scope region '{request.target_region}'."
        )

    new_alert = AlertBroadcastResponse(
        alert_id=f"alt-{int(datetime.now().timestamp())}",
        title=request.title,
        body=request.body,
        severity=request.severity,
        disaster_type=request.disaster_type,
        target_region=request.target_region,
        issued_by=f"{authority.role.value} ({authority.authority_id})",
        issued_at="Just now",
        action_required=request.action_required,
        affected_population_estimate=42500,
        acknowledgment_required=(request.severity == "CRITICAL")
    )
    ACTIVE_BROADCAST_ALERTS.insert(0, new_alert)

    # 3. Audit Logging
    req_id = getattr(http_request.state, "request_id", None)
    audit_repo.log_action(
        authority_id=authority.authority_id,
        role=authority.role.value,
        resource=Resource.ALERTS.value,
        action=Action.BROADCAST.value,
        status="SUCCESS",
        request_id=req_id,
        geographic_scope=request.target_region,
        details={"alert_id": new_alert.alert_id, "severity": request.severity, "disaster_type": request.disaster_type}
    )

    return new_alert

@router.get("/alerts/active", response_model=List[AlertBroadcastResponse])
def get_active_emergency_alerts():
    return ACTIVE_BROADCAST_ALERTS

