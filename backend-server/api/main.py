import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from api.routes import (
    predict_routes,
    evacuation_routes,
    shelter_routes,
    sos_routes,
    alert_routes,
    landslide_routes,
    authority_routes,
    medical_routes,
    telemetry_routes
)
from database.connection import get_engine
from security.middleware import SecurityHeadersMiddleware, RequestIDMiddleware

logger = logging.getLogger("aegis_main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions: warm up ML engine and database pool pre-ping
    try:
        get_engine()
    except Exception as e:
        print(f"[WARMUP WARNING] Database engine initialization skipped: {e}")
    yield
    # Shutdown actions
    print("[SHUTDOWN] Backend services shutting down gracefully.")

app = FastAPI(
    title="Aegis AI — Disaster Management Platform API",
    description="Backend API powering GNN Cascade Predictions, SIH 26001 Landslide Monitoring, Dynamic Evacuation Routing, Production RBAC & ABDM Medical Access",
    version="1.1.0",
    lifespan=lifespan
)

# Defensive Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
import os

cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
cors_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()] or [
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:3000",
    "http://localhost:19006",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.exceptions import HTTPException as StarletteHTTPException

# Sanitized Structured Error Responses (Feature 22: Error Handling)
@app.exception_handler(StarletteHTTPException)
async def sanitized_http_exception_handler(request: Request, exc: StarletteHTTPException):
    req_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "request_id": req_id
        },
        headers={"X-Request-ID": req_id} if req_id else None
    )

@app.exception_handler(Exception)
async def sanitized_unhandled_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", None)
    logger.error(f"[UNHANDLED EXCEPTION] Request ID: {req_id} Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "A secure internal error occurred. Disaster life-safety fallbacks remain operational.",
            "status_code": 500,
            "request_id": req_id
        },
        headers={"X-Request-ID": req_id} if req_id else None
    )

# Core Disaster Routes (100% Intact & Backward Compatible)
app.include_router(predict_routes.router, prefix="/api", tags=["Cascade Prediction"])
app.include_router(landslide_routes.router, prefix="/api/landslide", tags=["Landslide Intelligence (SIH 26001)"])
app.include_router(evacuation_routes.router, prefix="/api", tags=["Route Optimization"])
app.include_router(shelter_routes.router, prefix="/api", tags=["Safe Shelters"])
app.include_router(sos_routes.router, prefix="/api", tags=["Emergency SOS Alerts"])
app.include_router(alert_routes.router, prefix="/api", tags=["Broadcast Alerts"])

# Additive Security & Governance Routes
app.include_router(authority_routes.router, prefix="/api/authority", tags=["Authority Governance & RBAC"])
app.include_router(medical_routes.router, prefix="/api", tags=["Emergency Medical & Consent (ABDM)"])
app.include_router(telemetry_routes.router, tags=["Live Telemetry & GPS Tracking"])


@app.get("/")
def root():
    return {"message": "Disaster Management AI Backend Running", "status": "online"}


