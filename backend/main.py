"""
ERS — Emergency Response Synchronization System
Backend API (FastAPI) + WebSockets + AI/ML Engine + IoT RSU Simulator
Designed for Delhi, India.
"""

import asyncio
from typing import Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from routes_data import ROUTES
from model import eta_predictor
from iot_manager import iot_manager
from simulation_engine import ambulance_sim

app = FastAPI(
    title="ERS - Emergency Response Synchronization System",
    description="AI/ML + IoT-Based Intelligent Ambulance Traffic Coordination for Delhi",
    version="1.0.0"
)

# CORS middleware for local development and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
class SpeedRequest(BaseModel):
    speed_kmh: float = Field(..., ge=10, le=120)

class TrafficRequest(BaseModel):
    traffic_density: float = Field(..., ge=1.0, le=4.0)

class RoadblockRequest(BaseModel):
    active: Optional[bool] = None

class RouteRequest(BaseModel):
    route_id: str

class PoliceActionRequest(BaseModel):
    notification_id: str
    action: str = Field(..., description="ACKNOWLEDGED, PREPARING, CLEARED, ESCALATED")

class PredictRequest(BaseModel):
    distance_km: float
    current_speed_kmh: float
    traffic_density: float = 1.8
    hour_of_day: int = 17
    is_weekend: int = 0
    intersections_remaining: int = 3
    roadblock_active: int = 0
    weather_factor: float = 1.0

class HardwareTelemetryPayload(BaseModel):
    device_id: str
    timestamp: str
    token: str
    rssi_dbm: int
    ambient_noise_db: float
    traffic_queue_length_m: float

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

ws_manager = ConnectionManager()

# Background simulation runner
async def simulation_ticker():
    while True:
        try:
            if ambulance_sim.is_running:
                ambulance_sim.step()
                state = ambulance_sim.get_state()
                state["iot_devices"] = iot_manager.list_devices()
                await ws_manager.broadcast(state)
        except Exception as e:
            print(f"[ERS Sim Ticker Error] {e}")
        await asyncio.sleep(1.8)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_ticker())
    print("[ERS Backend] Initialized and background ticker started.")

# REST Endpoints
@app.get("/")
def root():
    return {
        "system": "ERS — Emergency Response Synchronization System",
        "city": "Delhi, India",
        "demo_mode": True,
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/api/state")
def get_current_state():
    state = ambulance_sim.get_state()
    state["iot_devices"] = iot_manager.list_devices()
    return state

@app.post("/api/simulation/play")
def toggle_simulation_play():
    ambulance_sim.toggle_play()
    return {"is_running": ambulance_sim.is_running}

@app.post("/api/simulation/step")
def step_simulation():
    ambulance_sim.step()
    state = ambulance_sim.get_state()
    state["iot_devices"] = iot_manager.list_devices()
    return state

@app.post("/api/simulation/reset")
def reset_simulation():
    ambulance_sim.reset()
    state = ambulance_sim.get_state()
    state["iot_devices"] = iot_manager.list_devices()
    return state

@app.post("/api/simulation/speed")
def set_speed(req: SpeedRequest):
    ambulance_sim.set_speed(req.speed_kmh)
    return {"speed_kmh": ambulance_sim.current_speed_kmh, "prediction": ambulance_sim.last_prediction}

@app.post("/api/simulation/traffic")
def set_traffic(req: TrafficRequest):
    ambulance_sim.set_traffic_density(req.traffic_density)
    return {"traffic_density": ambulance_sim.traffic_density, "prediction": ambulance_sim.last_prediction}

@app.post("/api/simulation/roadblock")
def toggle_roadblock(req: RoadblockRequest):
    ambulance_sim.toggle_roadblock(req.active)
    return {"roadblock_active": ambulance_sim.roadblock_active, "prediction": ambulance_sim.last_prediction}

@app.post("/api/simulation/route")
def switch_route(req: RouteRequest):
    success = ambulance_sim.select_route(req.route_id)
    if not success:
        raise HTTPException(status_code=404, detail="Route not found")
    return ambulance_sim.get_state()

# IoT RSU Endpoints
@app.get("/api/iot/devices")
def list_iot_devices():
    return iot_manager.list_devices()

@app.post("/api/iot/device/{device_id}/online")
def toggle_device_online(device_id: str, online: bool):
    success = iot_manager.set_device_online(device_id, online)
    if not success:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return {"device_id": device_id, "is_online": online}

@app.post("/api/iot/device/{device_id}/test-alert")
def trigger_device_test_alert(device_id: str):
    res = iot_manager.trigger_test_alert(device_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return res

# Traffic Police Console Endpoints
@app.post("/api/police/acknowledge")
def police_acknowledge(req: PoliceActionRequest):
    success = ambulance_sim.acknowledge_police_alert(req.notification_id, req.action)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True, "action": req.action}

# AI/ML Studio Endpoints
@app.post("/api/ml/predict")
def predict_eta(req: PredictRequest):
    result = eta_predictor.predict(
        distance_km=req.distance_km,
        current_speed_kmh=req.current_speed_kmh,
        traffic_density=req.traffic_density,
        hour_of_day=req.hour_of_day,
        is_weekend=req.is_weekend,
        intersections_remaining=req.intersections_remaining,
        roadblock_active=req.roadblock_active,
        weather_factor=req.weather_factor
    )
    return result

@app.get("/api/ml/info")
def get_ml_info():
    return eta_predictor.metadata

# Analytics & Historical Summary
@app.get("/api/analytics")
def get_analytics():
    events = ambulance_sim.event_log
    devices = iot_manager.list_devices()
    online_count = sum(1 for d in devices if d["is_online"])
    total_alerts = len(ambulance_sim.police_notifications)
    acknowledged_alerts = sum(1 for p in ambulance_sim.police_notifications if p.get("acknowledged"))
    
    return {
        "demo_mode": True,
        "total_checkpoints": len(devices),
        "online_iot_units": online_count,
        "iot_availability_pct": round((online_count / max(1, len(devices))) * 100, 1),
        "alerts_dispatched": total_alerts,
        "alerts_acknowledged": acknowledged_alerts,
        "police_compliance_rate_pct": round((acknowledged_alerts / max(1, total_alerts)) * 100, 1) if total_alerts > 0 else 100.0,
        "average_simulated_advance_notice_seconds": 68.5,
        "estimated_route_delay_saved_minutes": round(max(0, (len(devices) * 1.8) * (ambulance_sim.traffic_density / 2.0)), 1),
        "events_logged": len(events),
        "system_disclaimer": "All statistics are derived from simulated Delhi corridor telemetry for testing."
    }

# Hardware Adapter endpoint for real ESP32 / Arduino devices
@app.post("/api/iot/hardware/telemetry")
def hardware_telemetry(payload: HardwareTelemetryPayload):
    """
    Adapter endpoint for real Arduino/ESP32 microcontrollers sending sensor data over WiFi/Cellular.
    Validates token and updates device telemetry.
    """
    dev = iot_manager.get_device(payload.device_id)
    if not dev:
        raise HTTPException(status_code=404, detail="Unknown hardware device")
    
    dev.update_heartbeat()
    dev.rssi_dbm = payload.rssi_dbm
    dev.ambient_noise_db = payload.ambient_noise_db
    dev.traffic_queue_length_m = payload.traffic_queue_length_m
    
    return {
        "status": "ACCEPTED",
        "device_state": dev.state,
        "speaker_active": dev.speaker_active,
        "display_command": dev.led_matrix_display,
        "audio_command": dev.last_audio_announcement
    }

# WebSockets Endpoint
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial full state immediately
        initial_state = ambulance_sim.get_state()
        initial_state["iot_devices"] = iot_manager.list_devices()
        await websocket.send_json(initial_state)
        
        while True:
            data = await websocket.receive_text()
            # Heartbeat ping/pong or client action
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
