"""
AXIOM EMS - Backend API
FastAPI-powered ambulance coordination system with in-memory storage.
All data is seeded with realistic demo data on startup.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import math

app = FastAPI(title="AXIOM EMS API", version="1.0.0")

# ---------------------------------------------------------------------------
# CORS — development mode, allow all origins
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class Mission(BaseModel):
    id: str
    name: str
    ambulance_id: str
    status: str  # en_route | approaching | arrived | complete
    created_at: str


class Checkpoint(BaseModel):
    id: str
    mission_id: str
    name: str
    lat: float
    lon: float
    distance_m: float
    sequence_order: int
    status: str  # pending | approaching | passed


class AlertConfig(BaseModel):
    siren_enabled: bool = True
    siren_duration_s: int = 10  # 5 | 10 | 15 | 30
    lead_time_s: int = 30       # 15 | 30 | 60 | 120
    volume: float = Field(default=0.6, ge=0.0, le=1.0)


class AlertEvent(BaseModel):
    id: str
    checkpoint_id: str
    stage: int  # 1=approaching, 2=arrival
    triggered_at: str
    completed_at: Optional[str] = None
    duration_s: Optional[float] = None


class IoTDevice(BaseModel):
    id: str
    name: str
    type: str
    status: str  # active | standby | offline
    last_seen: str


class IoTEvent(BaseModel):
    id: str
    device_id: str
    device_name: str
    event_type: str
    payload: str
    timestamp: str


class SimulationState(BaseModel):
    active: bool
    speed_kmh: float
    progress_pct: float
    current_checkpoint_idx: int


class MissionCreate(BaseModel):
    name: str
    ambulance_id: str


class AlertEventCreate(BaseModel):
    checkpoint_id: str
    stage: int
    duration_s: Optional[float] = None


class IoTEventCreate(BaseModel):
    device_id: str
    event_type: str
    payload: str


# ---------------------------------------------------------------------------
# In-Memory Storage — seeded with demo data
# ---------------------------------------------------------------------------

MISSION_ID = "mission-alpha-7"
_now = datetime.now(timezone.utc).isoformat()

missions: dict[str, dict] = {
    MISSION_ID: {
        "id": MISSION_ID,
        "name": "Mission Alpha-7",
        "ambulance_id": "AMB-042",
        "status": "en_route",
        "created_at": _now,
    }
}

checkpoints: list[dict] = [
    {
        "id": "cp-001", "mission_id": MISSION_ID, "name": "Dispatch",
        "lat": 40.7128, "lon": -74.0060, "distance_m": 0, "sequence_order": 0, "status": "passed",
    },
    {
        "id": "cp-002", "mission_id": MISSION_ID, "name": "Main St Junction",
        "lat": 40.7148, "lon": -74.0040, "distance_m": 450, "sequence_order": 1, "status": "passed",
    },
    {
        "id": "cp-003", "mission_id": MISSION_ID, "name": "Hospital Road Entry",
        "lat": 40.7168, "lon": -74.0020, "distance_m": 900, "sequence_order": 2, "status": "approaching",
    },
    {
        "id": "cp-004", "mission_id": MISSION_ID, "name": "ER Gate",
        "lat": 40.7185, "lon": -74.0005, "distance_m": 1350, "sequence_order": 3, "status": "pending",
    },
    {
        "id": "cp-005", "mission_id": MISSION_ID, "name": "ICU Corridor",
        "lat": 40.7200, "lon": -73.9990, "distance_m": 1700, "sequence_order": 4, "status": "pending",
    },
    {
        "id": "cp-006", "mission_id": MISSION_ID, "name": "Destination",
        "lat": 40.7215, "lon": -73.9975, "distance_m": 2100, "sequence_order": 5, "status": "pending",
    },
]

alert_config: dict = {
    "siren_enabled": True,
    "siren_duration_s": 10,
    "lead_time_s": 30,
    "volume": 0.6,
}

alert_events: list[dict] = []

iot_devices: list[dict] = [
    {
        "id": "dev-tl-001", "name": "Traffic Light Controller TL-001",
        "type": "traffic_light", "status": "active", "last_seen": _now,
    },
    {
        "id": "dev-su-002", "name": "Siren Unit SU-002",
        "type": "siren", "status": "standby", "last_seen": _now,
    },
    {
        "id": "dev-gps-003", "name": "GPS Tracker GPS-003",
        "type": "gps", "status": "active", "last_seen": _now,
    },
]

iot_events: list[dict] = []

simulation_state: dict = {
    "active": False,
    "speed_kmh": 40.0,
    "progress_pct": 33.0,  # starts between cp-002 and cp-003
    "current_checkpoint_idx": 2,  # next to reach
}

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _get_checkpoint_by_id(cp_id: str) -> Optional[dict]:
    for cp in checkpoints:
        if cp["id"] == cp_id:
            return cp
    return None


def _mission_checkpoints(mission_id: str) -> list[dict]:
    return [cp for cp in checkpoints if cp["mission_id"] == mission_id]


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AXIOM EMS API", "version": "1.0.0", "timestamp": _now_iso()}


# ---------------------------------------------------------------------------
# Missions
# ---------------------------------------------------------------------------

@app.get("/api/missions", response_model=List[Mission])
def list_missions():
    return list(missions.values())


@app.get("/api/missions/{mission_id}", response_model=Mission)
def get_mission(mission_id: str):
    m = missions.get(mission_id)
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    return m


@app.post("/api/missions", response_model=Mission)
def create_mission(body: MissionCreate):
    mid = f"mission-{uuid.uuid4().hex[:8]}"
    m = {
        "id": mid,
        "name": body.name,
        "ambulance_id": body.ambulance_id,
        "status": "en_route",
        "created_at": _now_iso(),
    }
    missions[mid] = m
    return m


# ---------------------------------------------------------------------------
# Checkpoints
# ---------------------------------------------------------------------------

@app.get("/api/missions/{mission_id}/checkpoints", response_model=List[Checkpoint])
def list_checkpoints(mission_id: str):
    if mission_id not in missions:
        raise HTTPException(status_code=404, detail="Mission not found")
    cps = _mission_checkpoints(mission_id)
    return sorted(cps, key=lambda x: x["sequence_order"])


@app.get("/api/missions/{mission_id}/eta")
def calculate_eta(mission_id: str):
    """
    ETA formula (transparent):
        remaining_distance_m = sum of distances of pending/approaching checkpoints
        speed_ms = speed_kmh / 3.6
        eta_s = remaining_distance_m / speed_ms
    """
    if mission_id not in missions:
        raise HTTPException(status_code=404, detail="Mission not found")
    speed_ms = simulation_state["speed_kmh"] / 3.6
    remaining = [
        cp for cp in _mission_checkpoints(mission_id)
        if cp["status"] in ("pending", "approaching")
    ]
    if not remaining:
        return {"eta_s": 0, "remaining_distance_m": 0, "speed_kmh": simulation_state["speed_kmh"], "formula": "distance_m / (speed_kmh / 3.6)"}
    total_distance_m = max(cp["distance_m"] for cp in remaining) - (
        max((cp["distance_m"] for cp in checkpoints if cp["status"] == "passed"), default=0) *
        (simulation_state["progress_pct"] / 100.0)
    )
    total_distance_m = max(total_distance_m, 0)
    destination = max(remaining, key=lambda x: x["sequence_order"])
    passed_max = max((cp["distance_m"] for cp in checkpoints if cp["status"] == "passed"), default=0)
    # Simple approach: total route is destination distance
    route_total_m = destination["distance_m"]
    covered_m = route_total_m * (simulation_state["progress_pct"] / 100.0)
    remaining_m = max(route_total_m - covered_m, 0)
    eta_s = remaining_m / speed_ms if speed_ms > 0 else 9999
    return {
        "eta_s": round(eta_s, 1),
        "eta_minutes": round(eta_s / 60, 2),
        "remaining_distance_m": round(remaining_m, 1),
        "speed_kmh": simulation_state["speed_kmh"],
        "formula": "remaining_distance_m / (speed_kmh / 3.6)",
    }


# ---------------------------------------------------------------------------
# Alert Config
# ---------------------------------------------------------------------------

@app.get("/api/alert-config", response_model=AlertConfig)
def get_alert_config():
    return alert_config


@app.put("/api/alert-config", response_model=AlertConfig)
def update_alert_config(body: AlertConfig):
    alert_config.update(body.model_dump())
    return alert_config


# ---------------------------------------------------------------------------
# Alert Events
# ---------------------------------------------------------------------------

@app.get("/api/alerts", response_model=List[AlertEvent])
def list_alerts():
    return alert_events


@app.post("/api/alerts", response_model=AlertEvent)
def record_alert(body: AlertEventCreate):
    cp = _get_checkpoint_by_id(body.checkpoint_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Checkpoint not found")
    evt = {
        "id": f"alert-{uuid.uuid4().hex[:8]}",
        "checkpoint_id": body.checkpoint_id,
        "stage": body.stage,
        "triggered_at": _now_iso(),
        "completed_at": _now_iso() if body.duration_s else None,
        "duration_s": body.duration_s,
    }
    alert_events.append(evt)
    # Update device last_seen for siren unit
    for dev in iot_devices:
        if dev["type"] == "siren":
            dev["last_seen"] = _now_iso()
            dev["status"] = "active"
    return evt


# ---------------------------------------------------------------------------
# IoT
# ---------------------------------------------------------------------------

@app.get("/api/iot/devices", response_model=List[IoTDevice])
def list_iot_devices():
    return iot_devices


@app.get("/api/iot/events", response_model=List[IoTEvent])
def list_iot_events():
    return iot_events[-50:]


@app.post("/api/iot/events", response_model=IoTEvent)
def log_iot_event(body: IoTEventCreate):
    dev = next((d for d in iot_devices if d["id"] == body.device_id), None)
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")
    dev["last_seen"] = _now_iso()
    evt = {
        "id": f"iot-{uuid.uuid4().hex[:8]}",
        "device_id": body.device_id,
        "device_name": dev["name"],
        "event_type": body.event_type,
        "payload": body.payload,
        "timestamp": _now_iso(),
    }
    iot_events.append(evt)
    return evt


# ---------------------------------------------------------------------------
# Simulation
# ---------------------------------------------------------------------------

@app.get("/api/simulation/state", response_model=SimulationState)
def get_simulation_state():
    return simulation_state


@app.post("/api/simulation/start")
def start_simulation():
    simulation_state["active"] = True
    return {"status": "started", "state": simulation_state}


@app.post("/api/simulation/stop")
def stop_simulation():
    simulation_state["active"] = False
    return {"status": "stopped", "state": simulation_state}


@app.post("/api/simulation/advance")
def advance_simulation():
    """Advance ambulance to the next checkpoint."""
    idx = simulation_state["current_checkpoint_idx"]
    ordered = sorted(_mission_checkpoints(MISSION_ID), key=lambda x: x["sequence_order"])

    if idx >= len(ordered):
        missions[MISSION_ID]["status"] = "arrived"
        simulation_state["progress_pct"] = 100.0
        return {"status": "complete", "message": "All checkpoints passed"}

    # Mark current as approaching then passed
    current = ordered[idx]
    current["status"] = "passed"
    missions[MISSION_ID]["status"] = "en_route"

    next_idx = idx + 1
    simulation_state["current_checkpoint_idx"] = next_idx
    simulation_state["progress_pct"] = min(
        (next_idx / len(ordered)) * 100.0, 100.0
    )

    if next_idx < len(ordered):
        ordered[next_idx]["status"] = "approaching"
        missions[MISSION_ID]["status"] = "approaching"
    else:
        missions[MISSION_ID]["status"] = "arrived"

    # Log IoT event for GPS tracker
    for dev in iot_devices:
        if dev["type"] == "gps":
            dev["last_seen"] = _now_iso()

    return {
        "status": "advanced",
        "passed_checkpoint": current["name"],
        "next_checkpoint_idx": next_idx,
        "progress_pct": simulation_state["progress_pct"],
    }


@app.post("/api/simulation/reset")
def reset_simulation():
    simulation_state["active"] = False
    simulation_state["progress_pct"] = 0.0
    simulation_state["current_checkpoint_idx"] = 0
    missions[MISSION_ID]["status"] = "en_route"
    ordered = sorted(_mission_checkpoints(MISSION_ID), key=lambda x: x["sequence_order"])
    for i, cp in enumerate(ordered):
        cp["status"] = "passed" if i == 0 else "approaching" if i == 1 else "pending"
    simulation_state["current_checkpoint_idx"] = 1
    simulation_state["progress_pct"] = 16.0
    return {"status": "reset", "state": simulation_state}


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

@app.get("/api/analytics")
def get_analytics():
    total_alerts = len(alert_events)
    completed = [a for a in alert_events if a.get("duration_s") is not None]
    avg_latency = (
        sum(a["duration_s"] for a in completed) / len(completed) if completed else 0
    )
    # Simulated ETA errors (realistic demo data)
    eta_errors = [
        {"checkpoint": "Main St Junction", "predicted_s": 65, "actual_s": 72, "error_s": 7},
        {"checkpoint": "Hospital Road Entry", "predicted_s": 120, "actual_s": 115, "error_s": -5},
        {"checkpoint": "ER Gate", "predicted_s": 180, "actual_s": 188, "error_s": 8},
    ]
    avg_eta_error = sum(abs(e["error_s"]) for e in eta_errors) / len(eta_errors) if eta_errors else 0

    return {
        "total_alerts": total_alerts,
        "completed_alerts": len(completed),
        "avg_alert_latency_s": round(avg_latency, 2),
        "eta_errors": eta_errors,
        "avg_eta_error_s": round(avg_eta_error, 2),
        "iot_event_count": len(iot_events),
        "active_missions": len([m for m in missions.values() if m["status"] not in ("complete",)]),
    }
