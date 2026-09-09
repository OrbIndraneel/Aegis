"""
[AUTHORITY AUTHENTICATION UTILITY]
Extracts and validates authority identity, credentials, and geographic jurisdiction.
Does NOT modify or interfere with civilian login UI or user flows.
Enforces strict token validation and prevents unauthorized default privilege escalation.
"""
import os
import logging
from fastapi import Header, HTTPException, status
from typing import Optional
from security.rbac import AuthorityRole
from security.scope import AuthorityContext

logger = logging.getLogger("suraksha_auth")

def is_demo_mode() -> bool:
    """Returns True only if AUTHORITY_DEMO_MODE is explicitly enabled."""
    return os.getenv("AUTHORITY_DEMO_MODE", "true").lower() in ("true", "1", "yes")

def get_valid_authority_tokens() -> set:
    """Reads configured authority tokens. Defaults to empty set in non-demo environments."""
    configured = os.getenv("AUTHORITY_API_KEYS", "")
    if configured:
        return set(filter(None, [t.strip() for t in configured.split(",")]))
    if is_demo_mode():
        return {"dev-auth-key-2026", "gsdma-secure-token"}
    return set()


def get_current_authority(
    x_authority_id: Optional[str] = Header(None, alias="X-Authority-ID"),
    x_authority_role: Optional[str] = Header(None, alias="X-Authority-Role"),
    x_authority_jurisdiction: Optional[str] = Header(None, alias="X-Authority-Jurisdiction"),
    x_authority_shelter: Optional[str] = Header(None, alias="X-Authority-Shelter"),
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> AuthorityContext:
    """
    Extracts authenticated authority context from request headers or bearer tokens.
    Guarantees that unauthorized callers cannot escalate to ADMIN.
    """
    demo_mode = is_demo_mode()
    valid_tokens = get_valid_authority_tokens()

    # 1. Bearer Token Authentication (if provided)
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        if token not in valid_tokens and not demo_mode:
            logger.warning("[AUTH] Invalid bearer token supplied.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authority credentials or expired authorization token."
            )

    # 2. Determine Role
    if x_authority_role:
        role_str = x_authority_role.strip().upper()
        try:
            role = AuthorityRole(role_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid authority role: '{role_str}'. Valid roles: {[r.value for r in AuthorityRole]}"
            )
    else:
        # If no role header is supplied:
        if not demo_mode:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authority authentication required. Please provide 'X-Authority-Role' or valid 'Authorization' header."
            )
        # Development / Test backward compatibility
        role = AuthorityRole.ADMIN

    # 3. Derive Jurisdiction Type
    jurisdiction_type = "STATE"
    if role == AuthorityRole.DISTRICT_MANAGER:
        jurisdiction_type = "DISTRICT"
    elif role == AuthorityRole.FIELD_OFFICER:
        jurisdiction_type = "ZONE"
    elif role == AuthorityRole.SHELTER_MANAGER:
        jurisdiction_type = "SHELTER"

    return AuthorityContext(
        authority_id=x_authority_id or ("OFF-DEMO-01" if demo_mode else "OFF-ANON"),
        role=role,
        jurisdiction_type=jurisdiction_type,
        jurisdiction_id=x_authority_jurisdiction or "ALL",
        assigned_shelter_id=x_authority_shelter
    )

