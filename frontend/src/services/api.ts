import { ERSState, IoTDevice, IoTState, PredictionResult } from '../types';

// Predefined Delhi emergency routes
const DEL_AMB_01_PATH: [number, number][] = [
  [28.6328, 77.2195], // Connaught Place Radial 1
  [28.6315, 77.2250], // Barakhamba Rd
  [28.6290, 77.2300], // Barakhamba towards Mandi House
  [28.6258, 77.2343], // Mandi House Roundabout
  [28.6270, 77.2380], // Tilak Marg connection
  [28.6288, 77.2415], // ITO Junction
  [28.6240, 77.2430], // Ring road southbound
  [28.6180, 77.2440], // Bhairon Marg junction
  [28.6050, 77.2470], // Sarai Kale Khan stretch
  [28.5850, 77.2520], // Ring Road Nizamuddin
  [28.5708, 77.2600], // Ashram Chowk
  [28.5680, 77.2450], // Ring road towards Lajpat Nagar
  [28.5668, 77.2340], // Moolchand Underpass
  [28.5660, 77.2220], // South Extension Ring Road
  [28.5672, 77.2100]  // AIIMS New Delhi
];

const INITIAL_DEVICES: IoTDevice[] = [
  {
    device_id: 'CP-RSU-01',
    intersection_name: 'Barakhamba Road Junction',
    coords: [28.6315, 77.2250],
    is_online: true,
    state: 'IDLE',
    speed_limit_kmh: 50,
    firmware_version: 'v2.4.1-esp32-delhi-ers',
    last_heartbeat: Date.now(),
    is_stale: false,
    distance_to_ambulance_m: null,
    eta_seconds: null,
    rssi_dbm: -58,
    ambient_noise_db: 72.4,
    traffic_queue_length_m: 45.0,
    traffic_signal_state: 'GREEN_CORRIDOR_STANDBY',
    speaker_active: false,
    last_audio_announcement: 'System idle. Monitoring emergency frequency.',
    led_matrix_display: 'NORMAL TRAFFIC - DRIVE SAFELY',
    event_count: 1,
    recent_events: []
  },
  {
    device_id: 'CP-RSU-02',
    intersection_name: 'Mandi House Roundabout',
    coords: [28.6258, 77.2343],
    is_online: true,
    state: 'IDLE',
    speed_limit_kmh: 45,
    firmware_version: 'v2.4.1-esp32-delhi-ers',
    last_heartbeat: Date.now(),
    is_stale: false,
    distance_to_ambulance_m: null,
    eta_seconds: null,
    rssi_dbm: -64,
    ambient_noise_db: 68.1,
    traffic_queue_length_m: 60.0,
    traffic_signal_state: 'GREEN_CORRIDOR_STANDBY',
    speaker_active: false,
    last_audio_announcement: 'System idle. Monitoring emergency frequency.',
    led_matrix_display: 'NORMAL TRAFFIC - DRIVE SAFELY',
    event_count: 1,
    recent_events: []
  },
  {
    device_id: 'ITO-RSU-03',
    intersection_name: 'ITO Major Intersection (BSZ Marg)',
    coords: [28.6288, 77.2415],
    is_online: true,
    state: 'IDLE',
    speed_limit_kmh: 40,
    firmware_version: 'v2.4.1-esp32-delhi-ers',
    last_heartbeat: Date.now(),
    is_stale: false,
    distance_to_ambulance_m: null,
    eta_seconds: null,
    rssi_dbm: -52,
    ambient_noise_db: 79.5,
    traffic_queue_length_m: 110.0,
    traffic_signal_state: 'GREEN_CORRIDOR_STANDBY',
    speaker_active: false,
    last_audio_announcement: 'System idle. Monitoring emergency frequency.',
    led_matrix_display: 'NORMAL TRAFFIC - DRIVE SAFELY',
    event_count: 1,
    recent_events: []
  },
  {
    device_id: 'PM-RSU-04',
    intersection_name: 'Pragati Maidan / Bhairon Marg',
    coords: [28.6180, 77.2440],
    is_online: true,
    state: 'IDLE',
    speed_limit_kmh: 55,
    firmware_version: 'v2.4.1-esp32-delhi-ers',
    last_heartbeat: Date.now(),
    is_stale: false,
    distance_to_ambulance_m: null,
    eta_seconds: null,
    rssi_dbm: -70,
    ambient_noise_db: 65.0,
    traffic_queue_length_m: 35.0,
    traffic_signal_state: 'GREEN_CORRIDOR_STANDBY',
    speaker_active: false,
    last_audio_announcement: 'System idle. Monitoring emergency frequency.',
    led_matrix_display: 'NORMAL TRAFFIC - DRIVE SAFELY',
    event_count: 1,
    recent_events: []
  },
  {
    device_id: 'ASH-RSU-05',
    intersection_name: 'Ashram Chowk Overpass / Underpass',
    coords: [28.5708, 77.2600],
    is_online: true,
    state: 'IDLE',
    speed_limit_kmh: 45,
    firmware_version: 'v2.4.1-esp32-delhi-ers',
    last_heartbeat: Date.now(),
    is_stale: false,
    distance_to_ambulance_m: null,
    eta_seconds: null,
    rssi_dbm: -61,
    ambient_noise_db: 76.8,
    traffic_queue_length_m: 85.0,
    traffic_signal_state: 'GREEN_CORRIDOR_STANDBY',
    speaker_active: false,
    last_audio_announcement: 'System idle. Monitoring emergency frequency.',
    led_matrix_display: 'NORMAL TRAFFIC - DRIVE SAFELY',
    event_count: 1,
    recent_events: []
  },
  {
    device_id: 'AIM-RSU-06',
    intersection_name: 'AIIMS Flyover / Aurobindo Marg',
    coords: [28.5672, 77.2100],
    is_online: true,
    state: 'IDLE',
    speed_limit_kmh: 35,
    firmware_version: 'v2.4.1-esp32-delhi-ers',
    last_heartbeat: Date.now(),
    is_stale: false,
    distance_to_ambulance_m: null,
    eta_seconds: null,
    rssi_dbm: -55,
    ambient_noise_db: 73.2,
    traffic_queue_length_m: 50.0,
    traffic_signal_state: 'GREEN_CORRIDOR_STANDBY',
    speaker_active: false,
    last_audio_announcement: 'System idle. Monitoring emergency frequency.',
    led_matrix_display: 'NORMAL TRAFFIC - DRIVE SAFELY',
    event_count: 1,
    recent_events: []
  }
];

function haversineKm(c1: [number, number], c2: [number, number]): number {
  const R = 6371;
  const dLat = (c2[0] - c1[0]) * Math.PI / 180;
  const dLon = (c2[1] - c1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(c1[0] * Math.PI / 180) * Math.cos(c2[0] * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Client Fallback Simulation State
class ClientSimulator {
  state: ERSState;
  path = DEL_AMB_01_PATH;
  timer: any = null;
  listeners: ((s: ERSState) => void)[] = [];

  constructor() {
    this.state = this.buildInitialState();
  }

  buildInitialState(): ERSState {
    const startCoords = this.path[0];
    const destCoords: [number, number] = [28.5672, 77.2100];
    const remKm = haversineKm(startCoords, destCoords);
    const speed = 42.0;
    const density = 1.8;

    const baseSec = (remKm / speed) * 3600 + (6 * 30);
    const mlSec = baseSec * 1.35; // Calibrated to match Scikit-Learn Delhi model

    return {
      demo_mode: true,
      ambulance: {
        id: 'DEL-AMB-01',
        priority: 'P1_CRITICAL',
        current_coords: startCoords,
        current_speed_kmh: speed,
        heading_deg: 185,
        destination_name: 'AIIMS Trauma / Emergency Dept, Ring Road',
        destination_coords: destCoords,
        origin_name: 'Connaught Place (Inner/Outer Circle)',
        remaining_distance_km: Number(remKm.toFixed(2)),
        current_checkpoint: 'Barakhamba Road Junction',
        next_checkpoint: 'Mandi House Roundabout',
        route_progress_pct: 0,
        route_id: 'DEL-AMB-01',
        route_name: 'Corridor 1: Connaught Place to AIIMS New Delhi (Cardiology Emergency)'
      },
      environment: {
        traffic_density: density,
        traffic_label: 'High Peak',
        roadblock_active: false,
        roadblock_location: 'Mandi House Junction',
        weather: 'Dense Winter Smog / Air Quality Index 340 (Standard Delhi Conditions)',
        city: 'New Delhi, India'
      },
      simulation: {
        is_running: false,
        current_step: 0,
        total_steps: this.path.length - 1
      },
      prediction: {
        predicted_eta_seconds: Math.round(mlSec),
        predicted_eta_formatted: `${Math.floor(mlSec / 60)}m ${Math.floor(mlSec % 60)}s`,
        baseline_eta_seconds: Math.round(baseSec),
        baseline_eta_formatted: `${Math.floor(baseSec / 60)}m ${Math.floor(baseSec % 60)}s`,
        uncertainty_range_seconds: [Math.round(mlSec * 0.88), Math.round(mlSec * 1.15)],
        uncertainty_margin_seconds: Math.round(mlSec * 0.13),
        delay_risk: 'MODERATE',
        delay_ratio: 1.35,
        recommended_advance_alert_lead_seconds: 75,
        features_used: {
          distance_km: remKm,
          current_speed_kmh: speed,
          traffic_density: density,
          hour_of_day: 17,
          is_weekend: 0,
          intersections_remaining: 6,
          roadblock_active: 0,
          weather_factor: 1.0
        },
        model_metadata: {
          model_type: 'GradientBoostingRegressor + RandomForest Ensemble',
          framework: 'scikit-learn (Delhi Emergency Corridor Model)',
          rmse_seconds: 145.7,
          r2_score: 0.9891,
          baseline_rmse_seconds: 1072.0,
          accuracy_improvement_pct: 86.4,
          feature_importances: {
            distance_km: 0.42,
            current_speed_kmh: 0.24,
            traffic_density: 0.18,
            roadblock_active: 0.08,
            intersections_remaining: 0.05,
            hour_of_day: 0.03
          },
          disclaimer: 'Predictions are probabilistic estimates based on simulated corridor telemetry.'
        }
      },
      checkpoints: INITIAL_DEVICES.map(d => ({
        id: d.device_id,
        name: d.intersection_name,
        coords: d.coords,
        alert_stage1_sent: false,
        approaching_sent: false,
        arrived_timestamp: null,
        passed_timestamp: null,
        police_acknowledged: false,
        police_action_status: 'PENDING',
        recommended_action: `Clear priority lane for ${d.intersection_name}`
      })),
      police_notifications: [],
      recent_events: [
        {
          id: 'EVT-BOOT',
          timestamp: new Date().toISOString(),
          time_str: new Date().toLocaleTimeString(),
          event_type: 'SYSTEM_BOOT',
          message: 'ERS Delhi Command Matrix initialized in DEMO MODE. Monitoring 6 Roadside Units.',
          ambulance_id: 'DEL-AMB-01'
        }
      ],
      active_routes: [
        {
          id: 'DEL-AMB-01',
          name: 'Corridor 1: Connaught Place to AIIMS New Delhi',
          priority: 'P1_CRITICAL',
          total_km: 11.2
        },
        {
          id: 'DEL-AMB-02',
          name: 'Corridor 2: Dhaula Kuan to Safdarjung Hospital',
          priority: 'P1_CRITICAL',
          total_km: 7.8
        }
      ],
      iot_devices: JSON.parse(JSON.stringify(INITIAL_DEVICES))
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  recompute() {
    const dest = this.state.ambulance.destination_coords;
    const curr = this.state.ambulance.current_coords;
    const remKm = haversineKm(curr, dest);
    const speed = this.state.ambulance.current_speed_kmh;
    const density = this.state.environment.traffic_density;
    const roadblock = this.state.environment.roadblock_active;

    const baseSec = (remKm / Math.max(10, speed)) * 3600 + (3 * 30);
    let mlSec = baseSec * (density ** 0.6) * 1.15;
    if (roadblock) mlSec += 240;

    const risk = roadblock ? 'CRITICAL' : density > 2.2 ? 'HIGH' : density > 1.4 ? 'MODERATE' : 'LOW';

    this.state.ambulance.remaining_distance_km = Number(remKm.toFixed(2));
    this.state.prediction.predicted_eta_seconds = Math.round(mlSec);
    this.state.prediction.predicted_eta_formatted = `${Math.floor(mlSec / 60)}m ${Math.floor(mlSec % 60)}s`;
    this.state.prediction.baseline_eta_seconds = Math.round(baseSec);
    this.state.prediction.baseline_eta_formatted = `${Math.floor(baseSec / 60)}m ${Math.floor(baseSec % 60)}s`;
    this.state.prediction.delay_risk = risk;
    this.state.prediction.delay_ratio = Number((mlSec / Math.max(1, baseSec)).toFixed(2));
    this.state.prediction.uncertainty_range_seconds = [Math.round(mlSec * 0.88), Math.round(mlSec * 1.15)];
  }

  step() {
    const sim = this.state.simulation;
    if (sim.current_step >= this.path.length - 1) {
      sim.is_running = false;
      this.stopTicker();
      this.addEvent('JOURNEY_COMPLETED', 'Ambulance successfully reached destination at AIIMS Emergency Bay.');
      this.notify();
      return;
    }

    sim.current_step++;
    this.state.ambulance.current_coords = this.path[sim.current_step];
    this.state.ambulance.route_progress_pct = Math.round((sim.current_step / (this.path.length - 1)) * 100);

    // Evaluate Checkpoints & 2-Stage alert logic
    this.evaluateCheckpoints();
    this.recompute();
    this.notify();
  }

  evaluateCheckpoints() {
    const ambCoords = this.state.ambulance.current_coords;

    this.state.checkpoints.forEach((cp, idx) => {
      const distM = haversineKm(ambCoords, cp.coords) * 1000;
      const iot = this.state.iot_devices.find(d => d.device_id === cp.id);

      if (iot && iot.is_online) {
        iot.distance_to_ambulance_m = Math.round(distM);
        const etaSec = Math.round((distM / (this.state.ambulance.current_speed_kmh * 1000 / 3600)) * (this.state.environment.traffic_density ** 0.5));
        iot.eta_seconds = Math.max(5, etaSec);

        // STAGE 1: AMBULANCE APPROACHING (< 650m trigger)
        if (distM <= 650 && !cp.alert_stage1_sent && !cp.arrived_timestamp) {
          cp.alert_stage1_sent = true;
          iot.state = 'ALERT_SENT';
          iot.speaker_active = true;
          iot.last_audio_announcement = `Emergency alert. Ambulance approaching ${cp.name}. Estimated arrival: ${etaSec} seconds. Keep route clear.`;
          iot.led_matrix_display = `EMERGENCY VEHICLE APPROACHING - ETA ${etaSec}s`;
          iot.traffic_signal_state = 'GREEN_CORRIDOR_REQUESTED';

          // Notify Traffic Police
          const policeAlert = {
            id: `POL-${Date.now()}-${idx}`,
            checkpoint_id: cp.id,
            intersection_name: cp.name,
            stage: 'STAGE_1_APPROACHING',
            eta_seconds: etaSec,
            distance_meters: Math.round(distM),
            recommended_action: cp.recommended_action,
            timestamp: new Date().toISOString(),
            time_str: new Date().toLocaleTimeString(),
            acknowledged: false
          };
          this.state.police_notifications.unshift(policeAlert);
          this.addEvent('ALERT_STAGE_1_APPROACHING', `Stage 1 Advance Alert issued to RSU [${cp.name}]. ETA: ${etaSec}s, Dist: ${Math.round(distM)}m.`);
        }

        // Substate: Close range (< 220m)
        if (distM <= 220 && distM > 50 && !cp.approaching_sent && !cp.arrived_timestamp) {
          cp.approaching_sent = true;
          iot.state = 'AMBULANCE_APPROACHING';
          iot.last_audio_announcement = `Attention motorists. Ambulance within 200m of ${cp.name}. Clear center lane immediately!`;
          iot.led_matrix_display = 'HALT CROSS TRAFFIC - CLEAR CENTER LANE';
          iot.traffic_signal_state = 'PREEMPTION_ACTIVE';
        }

        // STAGE 2A: ARRIVED (< 50m)
        if (distM <= 50 && !cp.arrived_timestamp) {
          cp.arrived_timestamp = new Date().toISOString();
          iot.state = 'ARRIVED_AT_CHECKPOINT';
          iot.speaker_active = true;
          iot.last_audio_announcement = `Ambulance arrived at ${cp.name}. Intersection locked for passage.`;
          iot.led_matrix_display = 'AMBULANCE PASSING - ALL LANES STOP';
          iot.traffic_signal_state = 'INTERSECTION_LOCKED_FOR_EMS';
          this.addEvent('CHECKPOINT_ARRIVED', `Ambulance ARRIVED at checkpoint [${cp.name}].`);
        }

        // STAGE 2B: PASSED (distance increases past checkpoint)
        if (cp.arrived_timestamp && !cp.passed_timestamp && distM > 70) {
          cp.passed_timestamp = new Date().toISOString();
          iot.state = 'AMBULANCE_PASSED';
          iot.speaker_active = false;
          iot.last_audio_announcement = `Ambulance cleared ${cp.name}. Normal signals restoring.`;
          iot.led_matrix_display = 'EMS VEHICLE CLEARED - RESUMING NORMAL PHASING';
          iot.traffic_signal_state = 'RESTORE_NORMAL_CYCLE';
          this.addEvent('CHECKPOINT_PASSED', `Ambulance PASSED checkpoint [${cp.name}]. Restoring normal phasing.`);
        }
      }
    });
  }

  addEvent(type: string, message: string) {
    this.state.recent_events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      time_str: new Date().toLocaleTimeString(),
      event_type: type,
      message: message,
      ambulance_id: this.state.ambulance.id
    });
    if (this.state.recent_events.length > 50) this.state.recent_events.pop();
  }

  togglePlay() {
    this.state.simulation.is_running = !this.state.simulation.is_running;
    if (this.state.simulation.is_running) {
      this.startTicker();
    } else {
      this.stopTicker();
    }
    this.notify();
  }

  startTicker() {
    this.stopTicker();
    this.timer = setInterval(() => {
      this.step();
    }, 1800);
  }

  stopTicker() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  reset() {
    this.stopTicker();
    this.state = this.buildInitialState();
    this.notify();
  }

  setSpeed(speed: number) {
    this.state.ambulance.current_speed_kmh = speed;
    this.recompute();
    this.notify();
  }

  setTraffic(density: number) {
    this.state.environment.traffic_density = density;
    this.state.environment.traffic_label = density > 2.2 ? 'High Peak' : density > 1.4 ? 'Moderate' : 'Normal';
    this.recompute();
    this.notify();
  }

  toggleRoadblock(active?: boolean) {
    this.state.environment.roadblock_active = active !== undefined ? active : !this.state.environment.roadblock_active;
    const msg = this.state.environment.roadblock_active
      ? 'Roadblock injected near Mandi House / Tilak Marg. Recalculating route delay penalty.'
      : 'Roadblock cleared on Mandi House corridor. Traffic flow restored.';
    this.addEvent('ROADBLOCK_UPDATE', msg);
    this.recompute();
    this.notify();
  }

  toggleDeviceOnline(deviceId: string, online: boolean) {
    const dev = this.state.iot_devices.find(d => d.device_id === deviceId);
    if (dev) {
      dev.is_online = online;
      this.addEvent('DEVICE_STATUS', `RSU [${dev.intersection_name}] marked ${online ? 'ONLINE' : 'OFFLINE'}.`);
      this.notify();
    }
  }

  triggerTestAlert(deviceId: string) {
    const dev = this.state.iot_devices.find(d => d.device_id === deviceId);
    if (dev) {
      dev.state = 'ALERT_SENT';
      dev.speaker_active = true;
      dev.last_audio_announcement = `Diagnostic alert on RSU ${dev.device_id}: Testing PA speaker and strobe matrix.`;
      dev.led_matrix_display = 'DIAGNOSTIC TEST ALERT ACTIVE';
      this.addEvent('TEST_ALERT', `Manual test alert dispatched to RSU [${dev.intersection_name}].`);
      this.notify();
    }
  }

  acknowledgePoliceAlert(notifId: string, action: 'ACKNOWLEDGED' | 'PREPARING' | 'CLEARED' | 'ESCALATED') {
    const notif = this.state.police_notifications.find(n => n.id === notifId);
    if (notif) {
      notif.acknowledged = true;
      notif.action_status = action;
      const cp = this.state.checkpoints.find(c => c.id === notif.checkpoint_id);
      if (cp) {
        cp.police_acknowledged = true;
        cp.police_action_status = action;
      }
      this.addEvent('POLICE_ACTION', `Delhi Police Control Room confirmed action [${action}] for ${notif.intersection_name}.`);
      this.notify();
    }
  }
}

// Global Client Simulator singleton
export const clientSim = new ClientSimulator();

// Backend API Service with graceful fallback
const API_BASE = 'http://localhost:8000';

export class ERSApi {
  private static isBackendAvailable: boolean | null = null;

  static async checkBackend(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/`, { method: 'GET', signal: AbortSignal.timeout(1000) });
      const data = await res.json();
      this.isBackendAvailable = data?.status === 'operational';
      return !!this.isBackendAvailable;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  static async getState(): Promise<ERSState> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/state`);
        if (res.ok) return await res.json();
      } catch {
        this.isBackendAvailable = false;
      }
    }
    return clientSim.state;
  }

  static async togglePlay(): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/simulation/play`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          return data.is_running;
        }
      } catch {
        this.isBackendAvailable = false;
      }
    }
    clientSim.togglePlay();
    return clientSim.state.simulation.is_running;
  }

  static async stepSimulation(): Promise<ERSState> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/simulation/step`, { method: 'POST' });
        if (res.ok) return await res.json();
      } catch {
        this.isBackendAvailable = false;
      }
    }
    clientSim.step();
    return clientSim.state;
  }

  static async resetSimulation(): Promise<ERSState> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/simulation/reset`, { method: 'POST' });
        if (res.ok) return await res.json();
      } catch {
        this.isBackendAvailable = false;
      }
    }
    clientSim.reset();
    return clientSim.state;
  }

  static async setSpeed(speedKmh: number): Promise<void> {
    if (this.isBackendAvailable) {
      try {
        await fetch(`${API_BASE}/api/simulation/speed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ speed_kmh: speedKmh })
        });
        return;
      } catch {
        this.isBackendAvailable = false;
      }
    }
    clientSim.setSpeed(speedKmh);
  }

  static async setTraffic(density: number): Promise<void> {
    if (this.isBackendAvailable) {
      try {
        await fetch(`${API_BASE}/api/simulation/traffic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traffic_density: density })
        });
        return;
      } catch {
        this.isBackendAvailable = false;
      }
    }
    clientSim.setTraffic(density);
  }

  static async toggleRoadblock(active?: boolean): Promise<void> {
    if (this.isBackendAvailable) {
      try {
        await fetch(`${API_BASE}/api/simulation/roadblock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active })
        });
        return;
      } catch {
        this.isBackendAvailable = false;
      }
    }
    clientSim.toggleRoadblock(active);
  }

  static async toggleDeviceOnline(deviceId: string, online: boolean): Promise<void> {
    if (this.isBackendAvailable) {
      try {
        await fetch(`${API_BASE}/api/iot/device/${deviceId}/online?online=${online}`, { method: 'POST' });
        return;
      } catch {
        this.isBackendAvailable = false;
      }
    }
    clientSim.toggleDeviceOnline(deviceId, online);
  }

  static async triggerTestAlert(deviceId: string): Promise<void> {
    if (this.isBackendAvailable) {
      try {
        await fetch(`${API_BASE}/api/iot/device/${deviceId}/test-alert`, { method: 'POST' });
        return;
      } catch {
        this.isBackendAvailable = false;
      }
    }
    clientSim.triggerTestAlert(deviceId);
  }

  static async acknowledgePoliceAlert(notifId: string, action: 'ACKNOWLEDGED' | 'PREPARING' | 'CLEARED' | 'ESCALATED'): Promise<void> {
    if (this.isBackendAvailable) {
      try {
        await fetch(`${API_BASE}/api/police/acknowledge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_id: notifId, action })
        });
        return;
      } catch {
        this.isBackendAvailable = false;
      }
    }
    clientSim.acknowledgePoliceAlert(notifId, action);
  }

  static async customPredict(features: any): Promise<PredictionResult> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/ml/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(features)
        });
        if (res.ok) return await res.json();
      } catch {
        this.isBackendAvailable = false;
      }
    }

    // Client-side fallback prediction calculation matching ML weights
    const dist = features.distance_km || 5.0;
    const speed = features.current_speed_kmh || 40.0;
    const density = features.traffic_density || 1.8;
    const baseSec = (dist / Math.max(5, speed)) * 3600 + (features.intersections_remaining || 3) * 30;
    let mlSec = baseSec * (density ** 0.58) * 1.12;
    if (features.roadblock_active) mlSec += 280;

    return {
      predicted_eta_seconds: Math.round(mlSec),
      predicted_eta_formatted: `${Math.floor(mlSec / 60)}m ${Math.floor(mlSec % 60)}s`,
      baseline_eta_seconds: Math.round(baseSec),
      baseline_eta_formatted: `${Math.floor(baseSec / 60)}m ${Math.floor(baseSec % 60)}s`,
      uncertainty_range_seconds: [Math.round(mlSec * 0.88), Math.round(mlSec * 1.15)],
      uncertainty_margin_seconds: Math.round(mlSec * 0.13),
      delay_risk: features.roadblock_active ? 'CRITICAL' : density > 2.2 ? 'HIGH' : density > 1.4 ? 'MODERATE' : 'LOW',
      delay_ratio: Number((mlSec / Math.max(1, baseSec)).toFixed(2)),
      recommended_advance_alert_lead_seconds: Math.round(Math.min(120, Math.max(45, (speed / 40) * 45 + density * 15))),
      features_used: features
    };
  }
}
