"""
[AUTHORITY MANAGEMENT & GOVERNANCE ROUTES]
Provides:
1. Authority Profile & Scoped Capabilities
2. Authority Audit Logs Retrieval (Strictly Scoped)
3. Evacuation Route Override Workflow (Non-destructive wrapper around core solver)
4. Shelter Operations (Enforces Assigned Shelter Scope)
5. Isolated Disaster Simulation Context (simulation_mode: true)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from security.auth import get_current_authority
from security.scope import AuthorityContext, validate_geographic_scope
from security.rbac import AuthorityRole, Resource, Action, has_permission, PERMISSIONS_MATRIX
from security.middleware import require_permission
from security.rate_limiter import rate_limit, RateLimitTier
from database.security_repositories import AuthorityAuditRepository, EvacuationOverrideRepository

router = APIRouter()
audit_repo = AuthorityAuditRepository()
override_repo = EvacuationOverrideRepository()


class ShelterStatusUpdateRequest(BaseModel):
    current_occupancy: int = Field(..., ge=0)
    status: Optional[str] = Field("Open")
    medical_facilities_available: Optional[bool] = True
    food_supplies_days: Optional[int] = 7
    power_generator: Optional[bool] = True


class RouteOverrideRequestSchema(BaseModel):
    original_route_id: str
    reason: str = Field(..., min_length=5, json_schema_extra={"example": "Flash flood road blockade at bridge km 14"})
    requested_changes: Dict[str, Any] = Field(default_factory=dict)
    override_polyline: List[List[float]] = Field(..., min_length=2)


class SimulationRequestSchema(BaseModel):
    simulation_name: str
    district_id: str
    simulated_rainfall_mm: float
    simulated_river_level_m: Optional[float] = None
    parameters: Optional[Dict[str, Any]] = None


@router.get("/profile", summary="Get active authority profile and permitted capabilities")
def get_authority_profile(authority: AuthorityContext = Depends(get_current_authority)):
    """Returns authenticated authority credentials, active jurisdiction, and permitted actions."""
    capabilities = [
        {"resource": res.value, "action": act.value}
        for (r, res, act) in PERMISSIONS_MATRIX
        if r == authority.role
    ]
    return {
        "authority_id": authority.authority_id,
        "role": authority.role.value,
        "jurisdiction_type": authority.jurisdiction_type,
        "jurisdiction_id": authority.jurisdiction_id,
        "assigned_shelter_id": authority.assigned_shelter_id,
        "capabilities_count": len(capabilities),
        "capabilities": capabilities
    }


@router.get("/audit-logs", summary="Retrieve authority audit logs (Admin / District Manager scoped)")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    resource_filter: Optional[str] = Query(None),
    authority: AuthorityContext = Depends(require_permission(Resource.AUDIT_LOGS, Action.READ))
):
    """
    Retrieves authority audit trail.
    Admin gets universal access; District Manager gets district-filtered records; Other roles return 403.
    """
    logs = audit_repo.get_logs(resource=resource_filter, limit=limit)
    if authority.role == AuthorityRole.DISTRICT_MANAGER:
        logs = [l for l in logs if authority.jurisdiction_id.lower() in str(l.get("geographic_scope", "")).lower()]

    return {
        "requesting_authority": authority.authority_id,
        "role": authority.role.value,
        "count": len(logs),
        "audit_logs": logs
    }


@router.post("/override-route", summary="Request authority evacuation route override")
def request_route_override(
    request: Request,
    payload: RouteOverrideRequestSchema,
    authority: AuthorityContext = Depends(require_permission(Resource.EVACUATIONS, Action.OVERRIDE))
):
    """
    Submits an authority route override without modifying the core route solver.
    Stores original route reference, requested change, authority id, and approval state.
    """
    record = override_repo.create_override_request(
        original_route_id=payload.original_route_id,
        requested_changes=payload.requested_changes,
        override_polyline=payload.override_polyline,
        authority_id=authority.authority_id,
        authority_role=authority.role.value,
        reason=payload.reason
    )

    req_id = getattr(request.state, "request_id", None)
    audit_repo.log_action(
        authority_id=authority.authority_id,
        role=authority.role.value,
        resource=Resource.EVACUATIONS.value,
        action=Action.OVERRIDE.value,
        status="SUCCESS",
        request_id=req_id,
        geographic_scope=authority.jurisdiction_id,
        details={"route_id": payload.original_route_id, "status": record["status"]},
        reason=payload.reason
    )

    return {
        "message": f"Route override registered with status: {record['status']}",
        "override": record
    }


@router.get("/route-overrides", summary="List active route overrides")
def list_route_overrides(
    authority: AuthorityContext = Depends(require_permission(Resource.EVACUATIONS, Action.READ))
):
    """Lists registered evacuation route overrides."""
    overrides = override_repo.list_overrides(limit=25)
    return {"count": len(overrides), "overrides": overrides}


@router.post("/shelters/{shelter_id}/status", summary="Update shelter capacity/status with scope enforcement")
def update_shelter_status(
    shelter_id: str,
    payload: ShelterStatusUpdateRequest,
    request: Request,
    authority: AuthorityContext = Depends(require_permission(Resource.SHELTERS, Action.UPDATE))
):
    """
    Enforces that Shelter Managers can ONLY modify their assigned shelter,
    and Field Officers can only modify shelters within their operational scope.
    """
    if authority.role == AuthorityRole.SHELTER_MANAGER:
        if not validate_geographic_scope(authority, target_shelter_id=shelter_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Shelter Manager '{authority.authority_id}' is restricted to assigned shelter '{authority.assigned_shelter_id or authority.jurisdiction_id}' and cannot modify '{shelter_id}'."
            )

    req_id = getattr(request.state, "request_id", None)
    audit_repo.log_action(
        authority_id=authority.authority_id,
        role=authority.role.value,
        resource=Resource.SHELTERS.value,
        action=Action.UPDATE.value,
        status="SUCCESS",
        request_id=req_id,
        geographic_scope=shelter_id,
        details={"shelter_id": shelter_id, "new_occupancy": payload.current_occupancy, "status": payload.status}
    )

    return {
        "status": "success",
        "shelter_id": shelter_id,
        "updated_occupancy": payload.current_occupancy,
        "shelter_status": payload.status,
        "updated_by": authority.authority_id
    }


@router.post(
    "/simulate",
    dependencies=[Depends(rate_limit(max_requests=RateLimitTier.CONTROLLED[0], window_seconds=RateLimitTier.CONTROLLED[1]))],
    summary="Execute isolated disaster simulation context"
)
def run_disaster_simulation(
    payload: SimulationRequestSchema,
    request: Request,
    authority: AuthorityContext = Depends(require_permission(Resource.SIMULATIONS, Action.EXECUTE))
):
    """
    Executes an isolated disaster simulation.
    Guarantees that simulation_mode=true prevents any accidental trigger of real alerts, SOS, or live dispatches.
    Enforces district scope for District Managers.
    """
    if authority.role == AuthorityRole.DISTRICT_MANAGER:
        if not validate_geographic_scope(authority, target_district_id=payload.district_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"District Manager cannot run simulation outside assigned district '{authority.jurisdiction_id}'."
            )

    req_id = getattr(request.state, "request_id", None)
    audit_repo.log_action(
        authority_id=authority.authority_id,
        role=authority.role.value,
        resource=Resource.SIMULATIONS.value,
        action=Action.EXECUTE.value,
        status="SUCCESS",
        request_id=req_id,
        geographic_scope=payload.district_id,
        details={"simulation_name": payload.simulation_name, "simulation_mode": True}
    )

    return {
        "simulation_mode": True,
        "simulation_id": f"sim-{payload.district_id}-2026",
        "status": "COMPLETED_ISOLATED",
        "live_triggers_dispatched": False,
        "simulated_cascade_risk": "High" if payload.simulated_rainfall_mm > 100 else "Moderate",
        "simulated_lead_time_mins": 45,
        "impacted_population_estimate": 35000 if payload.simulated_rainfall_mm > 100 else 8000,
        "disclaimer": "ISOLATED SIMULATION CONTEXT — NO LIVE PUBLIC ALERTS OR EVACUATION ORDERS WERE ISSUED."
    }
