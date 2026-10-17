"""
ERS IoT Intersection Roadside Unit (RSU) Manager
Manages roadside microcontrollers (ESP32/Arduino compatible), telemetry,
2-stage alerts, state transitions, audio announcements, and hardware adapters.
"""

import time
from typing import Dict, Any, List, Optional
from datetime import datetime

VALID_STATES = [
    "IDLE",
    "ALERT_SENT",
    "AMBULANCE_APPROACHING",
    "ARRIVED_AT_CHECKPOINT",
    "AMBULANCE_PASSED",
    "RESET"
]

class IoTDevice:
    def __init__(
        self,
        device_id: str,
        intersection_name: str,
        coords: List[float],
        speed_limit_kmh: int = 50,
        firmware_version: str = "v2.4.1-esp32-delhi-ers"
    ):
        self.device_id = device_id
        self.intersection_name = intersection_name
        self.coords = coords
        self.is_online = True
        self.state = "IDLE"
        self.speed_limit_kmh = speed_limit_kmh
        self.firmware_version = firmware_version
        self.last_heartbeat = time.time()
        
        # Telemetry & Sensor Readings
        self.distance_to_ambulance_m: Optional[float] = None
        self.eta_seconds: Optional[float] = None
        self.rssi_dbm: int = -58
        self.ambient_noise_db: float = 68.4
        self.traffic_queue_length_m: float = 45.0
        self.traffic_signal_state: str = "GREEN_CORRIDOR_STANDBY"
        
        # Audio & Display Subsystems
        self.speaker_active: bool = False
        self.last_audio_announcement: str = "System idle. Monitoring emergency frequency."
        self.led_matrix_display: str = "NORMAL TRAFFIC - DRIVE SAFELY"
        
        # Event History
        self.event_log: List[Dict[str, Any]] = []
        self._record_event("DEVICE_BOOT", f"RSU {self.device_id} initialized at {intersection_name}")

    def _record_event(self, event_type: str, details: str, payload: Optional[Dict[str, Any]] = None):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "epoch": time.time(),
            "device_id": self.device_id,
            "intersection": self.intersection_name,
            "event_type": event_type,
            "details": details,
            "state": self.state,
            "payload": payload or {}
        }
        self.event_log.append(entry)
        if len(self.event_log) > 100:
            self.event_log.pop(0)
        return entry

    def update_heartbeat(self):
        self.last_heartbeat = time.time()
        self.is_online = True

    def set_online(self, online: bool):
        prev = self.is_online
        self.is_online = online
        status_str = "ONLINE" if online else "OFFLINE"
        if prev != online:
            self._record_event("CONNECTIVITY_CHANGE", f"Device marked {status_str}")

    def transition_state(
        self,
        new_state: str,
        ambulance_id: Optional[str] = None,
        distance_m: Optional[float] = None,
        eta_sec: Optional[float] = None,
        action_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes strict 6-state transition as specified in requirements:
        IDLE -> ALERT_SENT -> AMBULANCE_APPROACHING -> ARRIVED_AT_CHECKPOINT -> AMBULANCE_PASSED -> RESET
        """
        if new_state not in VALID_STATES:
            raise ValueError(f"Invalid IoT state: {new_state}. Must be one of {VALID_STATES}")

        self.state = new_state
        self.distance_to_ambulance_m = distance_m
        self.eta_seconds = eta_sec

        announcement = ""
        display_text = ""

        if new_state == "ALERT_SENT":
            self.speaker_active = True
            eta_rounded = int(eta_sec) if eta_sec is not None else 60
            announcement = (
                f"Emergency alert. Ambulance approaching {self.intersection_name}. "
                f"Estimated arrival: {eta_rounded} seconds. Please follow authorised "
                f"traffic-control instructions and keep the designated route clear."
            )
            display_text = f"EMERGENCY VEHICLE APPROACHING - ETA {eta_rounded}s"
            self.traffic_signal_state = "GREEN_CORRIDOR_REQUESTED"

        elif new_state == "AMBULANCE_APPROACHING":
            self.speaker_active = True
            dist_rounded = int(distance_m) if distance_m is not None else 250
            announcement = (
                f"Attention motorists. High priority ambulance {dist_rounded} metres away. "
                f"Clear center lane immediately."
            )
            display_text = f"HALT CROSS TRAFFIC - CLEAR CENTER LANE ({dist_rounded}m)"
            self.traffic_signal_state = "PREEMPTION_ACTIVE"

        elif new_state == "ARRIVED_AT_CHECKPOINT":
            self.speaker_active = True
            announcement = f"Emergency vehicle at checkpoint {self.intersection_name}. Hold all intersecting traffic."
            display_text = "EMERGENCY VEHICLE PASSING NOW - ALL SIDES STOP"
            self.traffic_signal_state = "INTERSECTION_LOCKED_FOR_EMS"

        elif new_state == "AMBULANCE_PASSED":
            self.speaker_active = False
            announcement = f"Ambulance has cleared {self.intersection_name}. Resuming normal signal timing."
            display_text = "EMS VEHICLE CLEARED - RESUMING NORMAL PHASING"
            self.traffic_signal_state = "RESTORE_NORMAL_CYCLE"

        elif new_state == "RESET" or new_state == "IDLE":
            self.speaker_active = False
            self.state = "IDLE"
            self.distance_to_ambulance_m = None
            self.eta_seconds = None
            announcement = "System normal. Corridors clear."
            display_text = "NORMAL TRAFFIC - DRIVE SAFELY"
            self.traffic_signal_state = "NORMAL_CYCLING"

        self.last_audio_announcement = announcement
        self.led_matrix_display = display_text

        event = self._record_event(
            f"STATE_{new_state}",
            f"Transitioned to {new_state} for {ambulance_id or 'GENERAL'}",
            {
                "ambulance_id": ambulance_id,
                "distance_m": distance_m,
                "eta_sec": eta_sec,
                "action": action_text,
                "audio": announcement,
                "display": display_text
            }
        )
        return event

    def to_dict(self) -> Dict[str, Any]:
        return {
            "device_id": self.device_id,
            "intersection_name": self.intersection_name,
            "coords": self.coords,
            "is_online": self.is_online,
            "state": self.state,
            "speed_limit_kmh": self.speed_limit_kmh,
            "firmware_version": self.firmware_version,
            "last_heartbeat": self.last_heartbeat,
            "is_stale": (time.time() - self.last_heartbeat) > 30,
            "distance_to_ambulance_m": round(self.distance_to_ambulance_m, 1) if self.distance_to_ambulance_m is not None else None,
            "eta_seconds": round(self.eta_seconds, 1) if self.eta_seconds is not None else None,
            "rssi_dbm": self.rssi_dbm,
            "ambient_noise_db": self.ambient_noise_db,
            "traffic_queue_length_m": self.traffic_queue_length_m,
            "traffic_signal_state": self.traffic_signal_state,
            "speaker_active": self.speaker_active,
            "last_audio_announcement": self.last_audio_announcement,
            "led_matrix_display": self.led_matrix_display,
            "event_count": len(self.event_log),
            "recent_events": self.event_log[-5:]
        }


class IoTManager:
    def __init__(self):
        self.devices: Dict[str, IoTDevice] = {}
        self._seed_devices()

    def _seed_devices(self):
        """Initializes Delhi intersection roadside units."""
        from routes_data import ROUTES
        for route_id, route in ROUTES.items():
            for cp in route["checkpoints"]:
                dev_id = cp["id"]
                if dev_id not in self.devices:
                    self.devices[dev_id] = IoTDevice(
                        device_id=dev_id,
                        intersection_name=cp["name"],
                        coords=cp["coords"],
                        speed_limit_kmh=cp.get("speed_limit_kmh", 45)
                    )

    def get_device(self, device_id: str) -> Optional[IoTDevice]:
        return self.devices.get(device_id)

    def list_devices(self) -> List[Dict[str, Any]]:
        return [dev.to_dict() for dev in self.devices.values()]

    def set_device_online(self, device_id: str, online: bool) -> bool:
        dev = self.get_device(device_id)
        if dev:
            dev.set_online(online)
            return True
        return False

    def trigger_test_alert(self, device_id: str) -> Optional[Dict[str, Any]]:
        dev = self.get_device(device_id)
        if not dev:
            return None
        return dev.transition_state(
            new_state="ALERT_SENT",
            ambulance_id="TEST-AMB-99",
            distance_m=550.0,
            eta_sec=55.0,
            action_text="Manual operator diagnostic test alert"
        )

    def reset_all(self):
        for dev in self.devices.values():
            dev.transition_state("RESET")

# Global singleton
iot_manager = IoTManager()
