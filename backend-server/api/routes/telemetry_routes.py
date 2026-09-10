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
        # In-memory cache of active civilian rescue beacons: beaconId -> Beacon dict
        self.active_beacons: Dict[str, dict] = {
            "BCN-VAD-01": {
                "beaconId": "BCN-VAD-01",
                "userId": "usr_patel_88",
                "fullName": "Kiran Patel",
                "bloodGroup": "O+",
                "triagePriority": "CRITICAL_RED",
                "sosReason": "Submerged Ground Floor / Trapped",
                "medicalNotes": "Diabetic, Mobility Impaired",
                "coordinate": {"latitude": 22.3142, "longitude": 73.1824},
                "batteryLevel": 42,
                "signalStrengthDbm": -52,
                "estimatedDistanceMeters": 3.8,
                "proximityZone": "NEAR",
                "isActive": True,
                "isTorchActive": True,
                "isSirenActive": True,
                "lastBroadcastTimestamp": 1726001000000,
            },
            "BCN-VAD-02": {
                "beaconId": "BCN-VAD-02",
                "userId": "usr_sharma_12",
                "fullName": "Meera Sharma",
                "bloodGroup": "B+",
                "triagePriority": "URGENT_YELLOW",
                "sosReason": "Roof Stranded / Water Rising",
                "medicalNotes": "Asthma, Needs Inhaler",
                "coordinate": {"latitude": 22.3190, "longitude": 73.1780},
                "batteryLevel": 78,
                "signalStrengthDbm": -74,
                "estimatedDistanceMeters": 14.2,
                "proximityZone": "FAR",
                "isActive": True,
                "isTorchActive": True,
                "isSirenActive": False,
                "lastBroadcastTimestamp": 1726001050000,
            }
        }

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"[TELEMETRY] Client connected. Total active connections: {len(self.active_connections)}")
        
        # Immediately hydrate newly connected client with current active fleet and beacon snapshot
        try:
            if self.latest_unit_telemetry:
                await websocket.send_json({
                    "type": "FLEET_SNAPSHOT",
                    "units": list(self.latest_unit_telemetry.values())
                })
            if self.active_beacons:
                await websocket.send_json({
                    "type": "BEACON_SNAPSHOT",
                    "beacons": list(self.active_beacons.values())
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

    def record_beacon(self, data: dict):
        """Updates internal active rescue beacons cache."""
        beacon_id = data.get("beaconId")
        if beacon_id:
            self.active_beacons[beacon_id] = data

telemetry_hub = TelemetryConnectionManager()

@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    High-frequency real-time WebSocket connection for bidirectional GPS telemetry
    and Tri-Vector civilian rescue beacons.
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
                await telemetry_hub.broadcast(payload)
            elif msg_type == "BEACON_BROADCAST":
                beacon_data = payload.get("beacon", payload)
                telemetry_hub.record_beacon(beacon_data)
                await telemetry_hub.broadcast({
                    "type": "BEACON_UPDATE",
                    "beacon": beacon_data
                })
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

@router.get("/api/v1/telemetry/beacons")
def get_active_beacons():
    """HTTP REST endpoint to fetch all active civilian rescue beacons."""
    return {
        "count": len(telemetry_hub.active_beacons),
        "beacons": list(telemetry_hub.active_beacons.values())
    }
