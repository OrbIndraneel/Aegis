"""
[GEOGRAPHIC ACCESS SCOPING ENGINE]
Backend-enforced geographic and jurisdiction verification for sensitive operations.
Prevents cross-district, cross-zone, and cross-shelter privilege escalations.
"""
from typing import Optional, Dict, Any
from security.rbac import AuthorityRole


class AuthorityContext:
    def __init__(
        self,
        authority_id: str = "OFF-ADMIN-01",
        role: AuthorityRole = AuthorityRole.ADMIN,
        jurisdiction_type: str = "STATE",  # 'STATE', 'DISTRICT', 'ZONE', 'SHELTER'
        jurisdiction_id: str = "ALL",      # e.g., 'DIST_VADODARA', 'ZONE_01', 'sh_01'
        assigned_shelter_id: Optional[str] = None
    ):
        self.authority_id = authority_id
        self.role = role
        self.jurisdiction_type = jurisdiction_type
        self.jurisdiction_id = jurisdiction_id
        self.assigned_shelter_id = assigned_shelter_id

    def __repr__(self):
        return f"<AuthorityContext {self.authority_id} ({self.role}) Scope:{self.jurisdiction_type}:{self.jurisdiction_id}>"


def validate_geographic_scope(
    authority: AuthorityContext,
    target_region: Optional[str] = None,
    target_district_id: Optional[str] = None,
    target_shelter_id: Optional[str] = None,
    target_zone_id: Optional[str] = None
) -> bool:
    """
    Validates whether the authority is permitted to execute operations on the target geographic entity.
    Returns True if allowed, False otherwise.
    """
    # 1. State / Admin Level has universal jurisdiction
    if authority.role == AuthorityRole.ADMIN or authority.jurisdiction_id in ("ALL", "*"):
        return True

    # 2. District Disaster Manager: Restricted strictly to own district
    if authority.role == AuthorityRole.DISTRICT_MANAGER:
        if target_district_id:
            return target_district_id.strip().lower() == authority.jurisdiction_id.strip().lower()
        if target_region:
            # Check substring match or exact match (case-insensitive)
            auth_j = authority.jurisdiction_id.strip().lower()
            t_reg = target_region.strip().lower()
            return auth_j in t_reg or t_reg in auth_j
        return False

    # 3. Field Officer: Restricted to assigned zone/block
    if authority.role == AuthorityRole.FIELD_OFFICER:
        if target_zone_id:
            return target_zone_id.strip().lower() == authority.jurisdiction_id.strip().lower()
        if target_district_id:
            auth_j = authority.jurisdiction_id.strip().lower()
            t_dist = target_district_id.strip().lower()
            return auth_j in t_dist or t_dist in auth_j
        if target_region:
            auth_j = authority.jurisdiction_id.strip().lower()
            t_reg = target_region.strip().lower()
            return auth_j in t_reg or t_reg in auth_j
        return True

    # 4. Shelter Manager: Restricted strictly to assigned shelter
    if authority.role == AuthorityRole.SHELTER_MANAGER:
        if target_shelter_id:
            assigned = authority.assigned_shelter_id or authority.jurisdiction_id
            return target_shelter_id.strip().lower() == assigned.strip().lower()
        return False

    # 5. Volunteer / NGO: Public operations or assigned area
    if authority.role == AuthorityRole.VOLUNTEER:
        if target_region:
            auth_j = authority.jurisdiction_id.strip().lower()
            t_reg = target_region.strip().lower()
            return auth_j in t_reg or t_reg in auth_j or auth_j == "all"
        return True

    # 6. Analyst: Read operations permitted across historical datasets
    if authority.role == AuthorityRole.ANALYST:
        return True

    return False
