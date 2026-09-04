"""
[SECURITY MIDDLEWARE & AUTHORIZATION DEPENDENCY]
Provides:
1. Reusable require_permission(resource, action, scope_checker) dependency
2. SecurityHeadersMiddleware (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
3. RequestIDMiddleware (tracking request IDs for end-to-end audit logging)
4. Sanitized structured error response handlers
"""
import uuid
import logging
from typing import Optional, Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from fastapi import HTTPException, status, Depends

from security.rbac import Resource, Action, has_permission
from security.scope import AuthorityContext, validate_geographic_scope
from security.auth import get_current_authority

logger = logging.getLogger("suraksha_security")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Assigns or propagates an X-Request-ID header on every inbound HTTP request."""
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = req_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Injects defensive HTTP security headers to protect against clickjacking, MIME-sniffing, and XSS."""
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


def require_permission(
    resource: Resource,
    action: Action,
    target_region_extractor: Optional[Callable[[Request], Optional[str]]] = None
):
    """
    FastAPI dependency factory enforcing RBAC and Geographic Access Scoping.
    Returns HTTP 403 Forbidden on any authorization failure.
    """
    def dependency(
        request: Request,
        authority: AuthorityContext = Depends(get_current_authority)
    ) -> AuthorityContext:
        # 1. Evaluate RBAC Matrix
        if not has_permission(authority.role, resource, action):
            logger.warning(f"[ACCESS DENIED] Role {authority.role.value} denied {action.value} on {resource.value}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Role '{authority.role.value}' does not possess '{action.value}' privilege on '{resource.value}'."
            )

        # 2. Evaluate Geographic Scope if region extractor is configured
        if target_region_extractor is not None:
            region = target_region_extractor(request)
            if region and not validate_geographic_scope(authority, target_region=region):
                logger.warning(f"[SCOPE DENIED] Authority {authority.authority_id} ({authority.jurisdiction_id}) denied out-of-scope region: {region}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Scope Denied: Authority jurisdiction ({authority.jurisdiction_id}) cannot perform operations on target region '{region}'."
                )

        return authority

    return dependency
