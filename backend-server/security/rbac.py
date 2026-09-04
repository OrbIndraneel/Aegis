"""
[ROLE-BASED ACCESS CONTROL (RBAC)]
Strict Role & Permission Definitions for SIH 2026 Disaster Management AI Platform.
"""
from enum import Enum
from typing import Set, Dict, Tuple


class AuthorityRole(str, Enum):
    ADMIN = "ADMIN"
    DISTRICT_MANAGER = "DISTRICT_MANAGER"
    FIELD_OFFICER = "FIELD_OFFICER"
    ANALYST = "ANALYST"
    SHELTER_MANAGER = "SHELTER_MANAGER"
    VOLUNTEER = "VOLUNTEER"
    CIVILIAN = "CIVILIAN"


class Resource(str, Enum):
    HAZARD_ZONES = "hazard_zones"
    ALERTS = "alerts"
    SIMULATIONS = "simulations"
    SHELTERS = "shelters"
    EVACUATIONS = "evacuations"
    REPORTS = "reports"
    OFFICERS = "officers"
    AUDIT_LOGS = "audit_logs"
    MEDICAL_EMERGENCY_DATA = "medical_emergency_data"
    INCIDENT_REPORTS = "incident_reports"
    RESOURCES = "resources"


class Action(str, Enum):
    READ = "read"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    BROADCAST = "broadcast"
    EXECUTE = "execute"
    OVERRIDE = "override"
    VERIFY = "verify"
    EXPORT = "export"


# Explicit Permissions Mapping: (Role, Resource, Action)
PERMISSIONS_MATRIX: Set[Tuple[AuthorityRole, Resource, Action]] = {
    # -------------------------------------------------------------
    # 1. ADMIN / STATE-LEVEL AUTHORITY
    # -------------------------------------------------------------
    (AuthorityRole.ADMIN, Resource.HAZARD_ZONES, Action.READ),
    (AuthorityRole.ADMIN, Resource.HAZARD_ZONES, Action.EXECUTE),
    (AuthorityRole.ADMIN, Resource.ALERTS, Action.READ),
    (AuthorityRole.ADMIN, Resource.ALERTS, Action.BROADCAST),
    (AuthorityRole.ADMIN, Resource.SIMULATIONS, Action.EXECUTE),
    (AuthorityRole.ADMIN, Resource.SHELTERS, Action.READ),
    (AuthorityRole.ADMIN, Resource.SHELTERS, Action.UPDATE),
    (AuthorityRole.ADMIN, Resource.EVACUATIONS, Action.READ),
    (AuthorityRole.ADMIN, Resource.EVACUATIONS, Action.OVERRIDE),
    (AuthorityRole.ADMIN, Resource.REPORTS, Action.READ),
    (AuthorityRole.ADMIN, Resource.REPORTS, Action.EXPORT),
    (AuthorityRole.ADMIN, Resource.OFFICERS, Action.READ),
    (AuthorityRole.ADMIN, Resource.OFFICERS, Action.UPDATE),
    (AuthorityRole.ADMIN, Resource.AUDIT_LOGS, Action.READ),
    (AuthorityRole.ADMIN, Resource.MEDICAL_EMERGENCY_DATA, Action.READ),  # Audited oversight only
    (AuthorityRole.ADMIN, Resource.INCIDENT_REPORTS, Action.READ),
    (AuthorityRole.ADMIN, Resource.INCIDENT_REPORTS, Action.VERIFY),
    (AuthorityRole.ADMIN, Resource.RESOURCES, Action.READ),
    (AuthorityRole.ADMIN, Resource.RESOURCES, Action.UPDATE),

    # -------------------------------------------------------------
    # 2. DISTRICT DISASTER MANAGER
    # -------------------------------------------------------------
    (AuthorityRole.DISTRICT_MANAGER, Resource.HAZARD_ZONES, Action.READ),
    (AuthorityRole.DISTRICT_MANAGER, Resource.HAZARD_ZONES, Action.EXECUTE),
    (AuthorityRole.DISTRICT_MANAGER, Resource.ALERTS, Action.READ),
    (AuthorityRole.DISTRICT_MANAGER, Resource.ALERTS, Action.BROADCAST),  # District only
    (AuthorityRole.DISTRICT_MANAGER, Resource.SIMULATIONS, Action.EXECUTE),  # District only
    (AuthorityRole.DISTRICT_MANAGER, Resource.SHELTERS, Action.READ),
    (AuthorityRole.DISTRICT_MANAGER, Resource.SHELTERS, Action.UPDATE),  # District shelters only
    (AuthorityRole.DISTRICT_MANAGER, Resource.EVACUATIONS, Action.READ),
    (AuthorityRole.DISTRICT_MANAGER, Resource.EVACUATIONS, Action.OVERRIDE),  # Request override
    (AuthorityRole.DISTRICT_MANAGER, Resource.REPORTS, Action.READ),
    (AuthorityRole.DISTRICT_MANAGER, Resource.REPORTS, Action.EXPORT),
    (AuthorityRole.DISTRICT_MANAGER, Resource.OFFICERS, Action.READ),
    (AuthorityRole.DISTRICT_MANAGER, Resource.AUDIT_LOGS, Action.READ),  # Own district only
    (AuthorityRole.DISTRICT_MANAGER, Resource.MEDICAL_EMERGENCY_DATA, Action.READ),  # Coordination summary
    (AuthorityRole.DISTRICT_MANAGER, Resource.INCIDENT_REPORTS, Action.READ),
    (AuthorityRole.DISTRICT_MANAGER, Resource.INCIDENT_REPORTS, Action.VERIFY),
    (AuthorityRole.DISTRICT_MANAGER, Resource.RESOURCES, Action.READ),
    (AuthorityRole.DISTRICT_MANAGER, Resource.RESOURCES, Action.UPDATE),

    # -------------------------------------------------------------
    # 3. FIELD OFFICER
    # -------------------------------------------------------------
    (AuthorityRole.FIELD_OFFICER, Resource.HAZARD_ZONES, Action.READ),
    (AuthorityRole.FIELD_OFFICER, Resource.ALERTS, Action.READ),
    (AuthorityRole.FIELD_OFFICER, Resource.ALERTS, Action.BROADCAST),  # Local area only
    (AuthorityRole.FIELD_OFFICER, Resource.SHELTERS, Action.READ),
    (AuthorityRole.FIELD_OFFICER, Resource.SHELTERS, Action.UPDATE),  # Local shelter capacity
    (AuthorityRole.FIELD_OFFICER, Resource.EVACUATIONS, Action.READ),
    (AuthorityRole.FIELD_OFFICER, Resource.EVACUATIONS, Action.OVERRIDE),  # Request local detour
    (AuthorityRole.FIELD_OFFICER, Resource.REPORTS, Action.READ),
    (AuthorityRole.FIELD_OFFICER, Resource.MEDICAL_EMERGENCY_DATA, Action.READ),  # Critical triage summary only
    (AuthorityRole.FIELD_OFFICER, Resource.INCIDENT_REPORTS, Action.READ),
    (AuthorityRole.FIELD_OFFICER, Resource.INCIDENT_REPORTS, Action.CREATE),
    (AuthorityRole.FIELD_OFFICER, Resource.INCIDENT_REPORTS, Action.VERIFY),
    (AuthorityRole.FIELD_OFFICER, Resource.RESOURCES, Action.READ),
    (AuthorityRole.FIELD_OFFICER, Resource.RESOURCES, Action.CREATE),

    # -------------------------------------------------------------
    # 4. ANALYST (Strictly read-only & non-operational simulations)
    # -------------------------------------------------------------
    (AuthorityRole.ANALYST, Resource.HAZARD_ZONES, Action.READ),
    (AuthorityRole.ANALYST, Resource.ALERTS, Action.READ),
    (AuthorityRole.ANALYST, Resource.SIMULATIONS, Action.EXECUTE),  # Non-live / training only
    (AuthorityRole.ANALYST, Resource.SHELTERS, Action.READ),
    (AuthorityRole.ANALYST, Resource.EVACUATIONS, Action.READ),
    (AuthorityRole.ANALYST, Resource.REPORTS, Action.READ),
    (AuthorityRole.ANALYST, Resource.REPORTS, Action.EXPORT),
    (AuthorityRole.ANALYST, Resource.INCIDENT_REPORTS, Action.READ),
    # Explicitly CANNOT: Broadcast alerts, modify shelters, override routes, view medical data

    # -------------------------------------------------------------
    # 5. SHELTER MANAGER (Assigned shelter only)
    # -------------------------------------------------------------
    (AuthorityRole.SHELTER_MANAGER, Resource.HAZARD_ZONES, Action.READ),
    (AuthorityRole.SHELTER_MANAGER, Resource.ALERTS, Action.READ),
    (AuthorityRole.SHELTER_MANAGER, Resource.SHELTERS, Action.READ),
    (AuthorityRole.SHELTER_MANAGER, Resource.SHELTERS, Action.UPDATE),  # Assigned shelter only
    (AuthorityRole.SHELTER_MANAGER, Resource.RESOURCES, Action.READ),
    (AuthorityRole.SHELTER_MANAGER, Resource.RESOURCES, Action.UPDATE),
    (AuthorityRole.SHELTER_MANAGER, Resource.MEDICAL_EMERGENCY_DATA, Action.READ),  # Care summary only
    (AuthorityRole.SHELTER_MANAGER, Resource.REPORTS, Action.CREATE),

    # -------------------------------------------------------------
    # 6. VOLUNTEER / NGO
    # -------------------------------------------------------------
    (AuthorityRole.VOLUNTEER, Resource.HAZARD_ZONES, Action.READ),
    (AuthorityRole.VOLUNTEER, Resource.ALERTS, Action.READ),
    (AuthorityRole.VOLUNTEER, Resource.SHELTERS, Action.READ),
    (AuthorityRole.VOLUNTEER, Resource.RESOURCES, Action.CREATE),
    (AuthorityRole.VOLUNTEER, Resource.INCIDENT_REPORTS, Action.CREATE),
    (AuthorityRole.VOLUNTEER, Resource.INCIDENT_REPORTS, Action.READ),
}


def has_permission(role: AuthorityRole, resource: Resource, action: Action) -> bool:
    """Evaluates if the specified role has permission for resource action."""
    return (role, resource, action) in PERMISSIONS_MATRIX
