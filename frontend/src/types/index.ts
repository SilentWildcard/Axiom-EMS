export type IoTState = 
  | 'IDLE' 
  | 'ALERT_SENT' 
  | 'AMBULANCE_APPROACHING' 
  | 'ARRIVED_AT_CHECKPOINT' 
  | 'AMBULANCE_PASSED' 
  | 'RESET';

export type DelayRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface Checkpoint {
  id: string;
  name: string;
  coords: [number, number];
  distance_from_start_km: number;
  recommended_action: string;
  trigger_radius_m: number;
  arrival_threshold_m: number;
  speed_limit_kmh: number;
}

export interface CheckpointState {
  id: string;
  name: string;
  coords: [number, number];
  alert_stage1_sent: boolean;
  approaching_sent: boolean;
  arrived_timestamp: string | null;
  passed_timestamp: string | null;
  police_acknowledged: boolean;
  police_action_status: 'PENDING' | 'ACKNOWLEDGED' | 'PREPARING' | 'CLEARED' | 'ESCALATED';
  recommended_action: string;
}

export interface IoTDevice {
  device_id: string;
  intersection_name: string;
  coords: [number, number];
  is_online: boolean;
  state: IoTState;
  speed_limit_kmh: number;
  firmware_version: string;
  last_heartbeat: number;
  is_stale: boolean;
  distance_to_ambulance_m: number | null;
  eta_seconds: number | null;
  rssi_dbm: number;
  ambient_noise_db: number;
  traffic_queue_length_m: number;
  traffic_signal_state: string;
  speaker_active: boolean;
  last_audio_announcement: string;
  led_matrix_display: string;
  event_count: number;
  recent_events: any[];
}

export interface Ambulance {
  id: string;
  priority: string;
  current_coords: [number, number];
  current_speed_kmh: number;
  heading_deg: number;
  destination_name: string;
  destination_coords: [number, number];
  origin_name: string;
  remaining_distance_km: number;
  current_checkpoint: string;
  next_checkpoint: string;
  route_progress_pct: number;
  route_id: string;
  route_name: string;
}

export interface PredictionResult {
  predicted_eta_seconds: number;
  predicted_eta_formatted: string;
  baseline_eta_seconds: number;
  baseline_eta_formatted: string;
  uncertainty_range_seconds: [number, number];
  uncertainty_margin_seconds: number;
  delay_risk: DelayRisk;
  delay_ratio: number;
  recommended_advance_alert_lead_seconds: number;
  features_used: {
    distance_km: number;
    current_speed_kmh: number;
    traffic_density: number;
    hour_of_day: number;
    is_weekend: number;
    intersections_remaining: number;
    roadblock_active: number;
    weather_factor: number;
  };
  model_metadata?: {
    model_type: string;
    framework: string;
    rmse_seconds: number;
    r2_score: number;
    baseline_rmse_seconds: number;
    accuracy_improvement_pct: number;
    feature_importances: Record<string, number>;
    disclaimer: string;
  };
}

export interface PoliceNotification {
  id: string;
  checkpoint_id: string;
  intersection_name: string;
  stage: string;
  eta_seconds: number;
  distance_meters: number;
  recommended_action: string;
  timestamp: string;
  time_str: string;
  acknowledged: boolean;
  action_status?: 'ACKNOWLEDGED' | 'PREPARING' | 'CLEARED' | 'ESCALATED';
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  time_str: string;
  event_type: string;
  message: string;
  ambulance_id: string;
  meta?: any;
}

export interface ERSState {
  demo_mode: boolean;
  ambulance: Ambulance;
  environment: {
    traffic_density: number;
    traffic_label: string;
    roadblock_active: boolean;
    roadblock_location: string;
    weather: string;
    city: string;
  };
  simulation: {
    is_running: boolean;
    current_step: number;
    total_steps: number;
  };
  prediction: PredictionResult;
  checkpoints: CheckpointState[];
  police_notifications: PoliceNotification[];
  recent_events: SystemEvent[];
  active_routes: Array<{
    id: string;
    name: string;
    priority: string;
    total_km: number;
  }>;
  iot_devices: IoTDevice[];
}
