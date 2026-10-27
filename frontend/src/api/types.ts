// TypeScript interfaces matching backend schemas

export interface Mission {
  id: string;
  name: string;
  ambulance_id: string;
  status: 'en_route' | 'approaching' | 'arrived' | 'complete';
  created_at: string;
}

export interface Checkpoint {
  id: string;
  mission_id: string;
  name: string;
  lat: number;
  lon: number;
  distance_m: number;
  sequence_order: number;
  status: 'pending' | 'approaching' | 'passed';
}

export interface AlertConfig {
  siren_enabled: boolean;
  siren_duration_s: number;
  lead_time_s: number;
  volume: number;
}

export interface AlertEvent {
  id: string;
  checkpoint_id: string;
  stage: number;
  triggered_at: string;
  completed_at: string | null;
  duration_s: number | null;
}

export interface IoTDevice {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'standby' | 'offline';
  last_seen: string;
}

export interface IoTEvent {
  id: string;
  device_id: string;
  device_name: string;
  event_type: string;
  payload: string;
  timestamp: string;
}

export interface SimulationState {
  active: boolean;
  speed_kmh: number;
  progress_pct: number;
  current_checkpoint_idx: number;
}

export interface ETAResponse {
  eta_s: number;
  eta_minutes: number;
  remaining_distance_m: number;
  speed_kmh: number;
  formula: string;
}

export interface AnalyticsData {
  total_alerts: number;
  completed_alerts: number;
  avg_alert_latency_s: number;
  eta_errors: Array<{
    checkpoint: string;
    predicted_s: number;
    actual_s: number;
    error_s: number;
  }>;
  avg_eta_error_s: number;
  iot_event_count: number;
  active_missions: number;
}
