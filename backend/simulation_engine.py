"""
ERS End-to-End Ambulance Emergency Simulation Engine
Coordinates ambulance GPS telemetry along Delhi corridors, executes the 2-stage
IoT alert workflow, evaluates checkpoint distance thresholds, and recalculates ETAs.
"""

import math
import time
from typing import Dict, Any, List, Optional
from datetime import datetime
from routes_data import ROUTES
from model import eta_predictor
from iot_manager import iot_manager

def haversine_distance_km(coord1: List[float], coord2: List[float]) -> float:
    """Computes great-circle distance between two [lat, lng] points in km."""
    lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
    lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return 6371.0 * c

class AmbulanceSimulation:
    def __init__(self, route_id: str = "DEL-AMB-01"):
        self.route_id = route_id
        self.route_data = ROUTES[route_id]
        self.ambulance_id = self.route_data["id"]
        self.priority = self.route_data["priority"]
        
        # State variables
        self.is_running = False
        self.current_step = 0
        self.path_points = self.route_data["path"]
        self.total_steps = len(self.path_points) - 1
        
        # Current physical status
        self.current_coords = list(self.path_points[0])
        self.current_speed_kmh = self.route_data["base_speed_kmh"]
        self.traffic_density = self.route_data["default_traffic_density"]
        self.roadblock_active = False
        self.roadblock_location = "Mandi House Junction"
        
        # Checkpoint Tracking
        self.checkpoints = [dict(cp) for cp in self.route_data["checkpoints"]]
        self.current_checkpoint_idx = 0
        self.checkpoint_states: Dict[str, Dict[str, Any]] = {}
        for cp in self.checkpoints:
            self.checkpoint_states[cp["id"]] = {
                "id": cp["id"],
                "name": cp["name"],
                "coords": cp["coords"],
                "alert_stage1_sent": False,
                "approaching_sent": False,
                "arrived_timestamp": None,
                "passed_timestamp": None,
                "police_acknowledged": False,
                "police_action_status": "PENDING", # PENDING, PREPARING, CLEARED, ESCALATED
                "recommended_action": cp["recommended_action"]
            }

        # System Event Logs & Notifications
        self.event_log: List[Dict[str, Any]] = []
        self.police_notifications: List[Dict[str, Any]] = []
        self.last_prediction: Dict[str, Any] = {}
        
        # Initial recalculation
        self._recompute_eta()
        self._log_event("JOURNEY_INITIALIZED", f"ERS Initialized for {self.ambulance_id} along {self.route_data['name']}")

    def _log_event(self, event_type: str, message: str, meta: Optional[Dict[str, Any]] = None):
        entry = {
            "id": f"EVT-{int(time.time()*1000)%1000000}",
            "timestamp": datetime.now().isoformat(),
            "time_str": datetime.now().strftime("%H:%M:%S"),
            "event_type": event_type,
            "message": message,
            "ambulance_id": self.ambulance_id,
            "meta": meta or {}
        }
        self.event_log.append(entry)
        if len(self.event_log) > 150:
            self.event_log.pop(0)
        return entry

    def _recompute_eta(self):
        """Invokes the AI/ML model for destination and remaining checkpoints."""
        # Calculate remaining distance along path
        dest = self.route_data["destination_coords"]
        rem_dist_km = haversine_distance_km(self.current_coords, dest)
        rem_intersections = max(0, len(self.checkpoints) - self.current_checkpoint_idx)

        # AI/ML Prediction
        self.last_prediction = eta_predictor.predict(
            distance_km=rem_dist_km,
            current_speed_kmh=self.current_speed_kmh,
            traffic_density=self.traffic_density,
            hour_of_day=17, # Simulated evening rush in Delhi
            is_weekend=0,
            intersections_remaining=rem_intersections,
            roadblock_active=1 if self.roadblock_active else 0,
            weather_factor=1.0
        )

    def select_route(self, route_id: str):
        if route_id not in ROUTES:
            return False
        self.__init__(route_id=route_id)
        iot_manager.reset_all()
        return True

    def set_speed(self, speed_kmh: float):
        self.current_speed_kmh = max(10.0, min(100.0, float(speed_kmh)))
        self._recompute_eta()

    def set_traffic_density(self, density: float):
        self.traffic_density = max(1.0, min(3.5, float(density)))
        self._recompute_eta()

    def toggle_roadblock(self, active: Optional[bool] = None):
        if active is None:
            self.roadblock_active = not self.roadblock_active
        else:
            self.roadblock_active = bool(active)
        
        status_str = "REPORTED" if self.roadblock_active else "CLEARED"
        self._log_event(
            "ROADBLOCK_UPDATE",
            f"Obstruction {status_str} near {self.roadblock_location}. ML dynamic route delay adjusted.",
            {"roadblock": self.roadblock_active}
        )
        self._recompute_eta()

    def toggle_play(self):
        self.is_running = not self.is_running

    def reset(self):
        self.__init__(route_id=self.route_id)
        iot_manager.reset_all()

    def step(self):
        """Advances simulation by one geographic step along corridor."""
        if self.current_step >= len(self.path_points) - 1:
            self.is_running = False
            self._log_event("JOURNEY_COMPLETED", f"Ambulance arrived at destination {self.route_data['destination_name']}")
            return

        self.current_step += 1
        self.current_coords = list(self.path_points[self.current_step])
        
        # Checkpoint evaluation & 2-Stage alert state machine
        self._evaluate_checkpoints()
        self._recompute_eta()

    def _evaluate_checkpoints(self):
        """
        Evaluates distance to all upcoming checkpoints:
        - Stage 1: Advance alert issued (ALERT_SENT) when distance < trigger_radius_m
        - Stage 1b: Immediate proximity alert (AMBULANCE_APPROACHING) when distance < 250m
        - Stage 2a: Checkpoint arrival (ARRIVED_AT_CHECKPOINT) when distance < arrival_threshold_m
        - Stage 2b: Passage confirmation (AMBULANCE_PASSED) when distance begins increasing past threshold
        """
        for i, cp in enumerate(self.checkpoints):
            cp_id = cp["id"]
            cp_state = self.checkpoint_states[cp_id]
            cp_coords = cp["coords"]
            
            # Distance in meters
            dist_m = haversine_distance_km(self.current_coords, cp_coords) * 1000.0
            trigger_radius = cp.get("trigger_radius_m", 600)
            arrival_threshold = cp.get("arrival_threshold_m", 50)

            # Checkpoint ETA in seconds
            cp_dist_km = max(0.05, dist_m / 1000.0)
            cp_pred = eta_predictor.predict(
                distance_km=cp_dist_km,
                current_speed_kmh=self.current_speed_kmh,
                traffic_density=self.traffic_density,
                hour_of_day=17,
                intersections_remaining=1,
                roadblock_active=1 if (self.roadblock_active and i <= 2) else 0
            )
            cp_eta_sec = cp_pred["predicted_eta_seconds"]

            # STAGE 1: AMBULANCE APPROACHING (Advance Notification Issued)
            if dist_m <= trigger_radius and not cp_state["alert_stage1_sent"] and cp_state["arrived_timestamp"] is None:
                cp_state["alert_stage1_sent"] = True
                self.current_checkpoint_idx = i
                
                # Signal IoT Device
                iot_dev = iot_manager.get_device(cp_id)
                if iot_dev and iot_dev.is_online:
                    iot_dev.transition_state(
                        new_state="ALERT_SENT",
                        ambulance_id=self.ambulance_id,
                        distance_m=dist_m,
                        eta_sec=cp_eta_sec,
                        action_text=cp["recommended_action"]
                    )

                # Send Notice to Traffic Police Dashboard
                police_notice = {
                    "id": f"POL-ALERT-{int(time.time()*1000)%100000}",
                    "checkpoint_id": cp_id,
                    "intersection_name": cp["name"],
                    "stage": "STAGE_1_APPROACHING",
                    "eta_seconds": cp_eta_sec,
                    "distance_meters": dist_m,
                    "recommended_action": cp["recommended_action"],
                    "timestamp": datetime.now().isoformat(),
                    "time_str": datetime.now().strftime("%H:%M:%S"),
                    "acknowledged": False
                }
                self.police_notifications.insert(0, police_notice)

                self._log_event(
                    "ALERT_STAGE_1_APPROACHING",
                    f"Stage 1 Advance Alert issued to RSU [{cp['name']}]. ETA: {int(cp_eta_sec)}s, Dist: {int(dist_m)}m.",
                    {"checkpoint": cp_id, "eta_sec": cp_eta_sec, "dist_m": dist_m}
                )

            # Sub-state: AMBULANCE_APPROACHING (Close range < 250m)
            if dist_m <= 250 and dist_m > arrival_threshold and not cp_state["approaching_sent"] and cp_state["arrived_timestamp"] is None:
                cp_state["approaching_sent"] = True
                iot_dev = iot_manager.get_device(cp_id)
                if iot_dev and iot_dev.is_online:
                    iot_dev.transition_state(
                        new_state="AMBULANCE_APPROACHING",
                        ambulance_id=self.ambulance_id,
                        distance_m=dist_m,
                        eta_sec=cp_eta_sec,
                        action_text=cp["recommended_action"]
                    )

            # STAGE 2A: ARRIVED AT CHECKPOINT
            if dist_m <= arrival_threshold and cp_state["arrived_timestamp"] is None:
                cp_state["arrived_timestamp"] = datetime.now().isoformat()
                iot_dev = iot_manager.get_device(cp_id)
                if iot_dev and iot_dev.is_online:
                    iot_dev.transition_state(
                        new_state="ARRIVED_AT_CHECKPOINT",
                        ambulance_id=self.ambulance_id,
                        distance_m=dist_m,
                        eta_sec=0,
                        action_text="Emergency vehicle currently in intersection. Hold cross-traffic."
                    )
                self._log_event(
                    "CHECKPOINT_ARRIVED",
                    f"Ambulance REACHED checkpoint [{cp['name']}]. Intersection locked for priority passage.",
                    {"checkpoint": cp_id}
                )

            # STAGE 2B: AMBULANCE PASSED (Ambulance has cleared and is past threshold)
            # When step has progressed past the checkpoint point
            if cp_state["arrived_timestamp"] is not None and cp_state["passed_timestamp"] is None and dist_m > arrival_threshold:
                cp_state["passed_timestamp"] = datetime.now().isoformat()
                iot_dev = iot_manager.get_device(cp_id)
                if iot_dev and iot_dev.is_online:
                    iot_dev.transition_state(
                        new_state="AMBULANCE_PASSED",
                        ambulance_id=self.ambulance_id,
                        distance_m=dist_m,
                        eta_sec=0,
                        action_text="Corridor cleared. Restoring standard traffic cycles."
                    )
                self._log_event(
                    "CHECKPOINT_PASSED",
                    f"Ambulance PASSED checkpoint [{cp['name']}]. Recalculating ETA for next intersection.",
                    {"checkpoint": cp_id}
                )
                # Advance active checkpoint counter
                self.current_checkpoint_idx = min(len(self.checkpoints) - 1, self.current_checkpoint_idx + 1)

    def acknowledge_police_alert(self, notification_id: str, action: str = "ACKNOWLEDGED") -> bool:
        """Processes Traffic Police acknowledgement and SOP coordination."""
        for notice in self.police_notifications:
            if notice["id"] == notification_id:
                notice["acknowledged"] = True
                notice["action_status"] = action
                cp_id = notice["checkpoint_id"]
                if cp_id in self.checkpoint_states:
                    self.checkpoint_states[cp_id]["police_acknowledged"] = True
                    self.checkpoint_states[cp_id]["police_action_status"] = action
                self._log_event(
                    "POLICE_ACTION",
                    f"Traffic Control Room: Action [{action}] confirmed for {notice['intersection_name']}",
                    {"notification_id": notification_id, "action": action}
                )
                return True
        return False

    def get_state(self) -> Dict[str, Any]:
        """Serializes complete live state for frontend synchronization."""
        # Calculate remaining distance in km
        dest = self.route_data["destination_coords"]
        rem_distance_km = haversine_distance_km(self.current_coords, dest)
        
        # Check current and next checkpoint names
        curr_cp_name = "En Route (Origin)"
        next_cp_name = "Destination"
        if self.current_checkpoint_idx < len(self.checkpoints):
            curr_cp = self.checkpoints[self.current_checkpoint_idx]
            curr_cp_name = curr_cp["name"]
            if self.current_checkpoint_idx + 1 < len(self.checkpoints):
                next_cp_name = self.checkpoints[self.current_checkpoint_idx + 1]["name"]
            else:
                next_cp_name = self.route_data["destination_name"]

        return {
            "demo_mode": True,
            "ambulance": {
                "id": self.ambulance_id,
                "priority": self.priority,
                "current_coords": self.current_coords,
                "current_speed_kmh": round(self.current_speed_kmh, 1),
                "heading_deg": 185.0,
                "destination_name": self.route_data["destination_name"],
                "destination_coords": dest,
                "origin_name": self.route_data["origin_name"],
                "remaining_distance_km": round(rem_distance_km, 2),
                "current_checkpoint": curr_cp_name,
                "next_checkpoint": next_cp_name,
                "route_progress_pct": round((self.current_step / max(1, self.total_steps)) * 100, 1),
                "route_id": self.route_id,
                "route_name": self.route_data["name"]
            },
            "environment": {
                "traffic_density": self.traffic_density,
                "traffic_label": "High Peak" if self.traffic_density > 2.2 else "Moderate" if self.traffic_density > 1.4 else "Normal",
                "roadblock_active": self.roadblock_active,
                "roadblock_location": self.roadblock_location,
                "weather": "Dense Winter Smog / Air Quality Index 340 (Standard Delhi Conditions)",
                "city": "New Delhi, India"
            },
            "simulation": {
                "is_running": self.is_running,
                "current_step": self.current_step,
                "total_steps": self.total_steps
            },
            "prediction": self.last_prediction,
            "checkpoints": list(self.checkpoint_states.values()),
            "police_notifications": self.police_notifications[:10],
            "recent_events": self.event_log[-12:],
            "active_routes": [
                {"id": r["id"], "name": r["name"], "priority": r["priority"], "total_km": r["total_distance_km"]}
                for r in ROUTES.values()
            ]
        }

# Global simulation instance
ambulance_sim = AmbulanceSimulation("DEL-AMB-01")
