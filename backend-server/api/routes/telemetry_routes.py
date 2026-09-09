import json
import logging
import asyncio
from typing import Dict, List, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

logger = logging.getLogger("aegis_telemetry")
router = APIRouter()

class TelemetryConnectionManager:
    """
    Manages active WebSocket telemetry connections between:
    1. Rescue vehicles (ambulances, NDRF units) publishing GPS telemetry.
    2. Civilians broadcasting active evacuation positions.
    3. Authority Tactical Command Dashboards subscribing to all fleet and SOS movements.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        # In-memory cache of latest unit states: unitId -> Telemetry dict
        self.latest_unit_telemetry: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"[TELEMETRY] Client connected. Total active connections: {len(self.active_connections)}")
        
        # Immediately hydrate newly connected client with current active fleet snapshot
        if self.latest_unit_telemetry:
            try:
                await websocket.send_json({
                    "type": "FLEET_SNAPSHOT",
                    "units": list(self.latest_unit_telemetry.values())
                })
            except Exception as e:
                logger.warning(f"[TELEMETRY] Failed to send initial snapshot: {e}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"[TELEMETRY] Client disconnected. Total active connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict, sender: Optional[WebSocket] = None):
        """Broadcasts telemetry packet to all connected clients (except optional sender)."""
        stale_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as exc:
                logger.warning(f"[TELEMETRY] Error transmitting to client: {exc}")
                stale_connections.append(connection)

        for stale in stale_connections:
            self.disconnect(stale)

    def record_telemetry(self, data: dict):
        """Updates internal fleet cache."""
        unit_id = data.get("unitId")
        if unit_id:
            self.latest_unit_telemetry[unit_id] = data

telemetry_hub = TelemetryConnectionManager()

@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    High-frequency real-time WebSocket connection for bidirectional GPS telemetry.
    Expected incoming payload format:
    {
        "type": "LOCATION_UPDATE",
        "unitId": "AMB-01",
        "name": "Ambulance 01 (Central Trauma)",
        "role": "AMBULANCE" | "RESCUE_BOAT" | "NDRF_TRUCK" | "CIVILIAN",
        "coordinate": { "latitude": 22.312, "longitude": 73.189 },
        "heading": 45,
        "speedKmH": 38.5,
        "status": "EN_ROUTE" | "ON_SCENE" | "EVACUATING" | "STANDBY",
        "targetCivilianId": "demo-civilian-01",
        "timestamp": 1726000000000
    }
    """
    await telemetry_hub.connect(websocket)
    try:
        while True:
            text_data = await websocket.receive_text()
            try:
                payload = json.loads(text_data)
            except json.JSONDecodeError:
                continue

            msg_type = payload.get("type", "LOCATION_UPDATE")
            
            if msg_type == "LOCATION_UPDATE":
                telemetry_hub.record_telemetry(payload)
                # Broadcast real-time location to all monitoring maps
                await telemetry_hub.broadcast(payload)
            elif msg_type == "PING":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        telemetry_hub.disconnect(websocket)
    except Exception as err:
        logger.error(f"[TELEMETRY] Unexpected error in socket stream: {err}")
        telemetry_hub.disconnect(websocket)

@router.get("/api/v1/telemetry/active")
def get_active_telemetry():
    """HTTP REST fallback to fetch current positions of all active units."""
    return {
        "count": len(telemetry_hub.latest_unit_telemetry),
        "units": list(telemetry_hub.latest_unit_telemetry.values())
    }
