// Types for Axiom EMS Hardware Digital Twin Simulator

export type HardwareId =
  | 'esp32'
  | 'density_sensor'
  | 'gps'
  | 'gsm_4g'
  | 'traffic_signal'
  | 'led_matrix'
  | 'speaker'
  | 'edge_device'
  | 'cctv_vision';

export type HardwareStatus = 'online' | 'processing' | 'priority_active' | 'standby' | 'fault' | 'offline';

export type SimulationStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface HardwareDeviceState {
  id: HardwareId;
  name: string;
  hardwareModel: string;
  role: string;
  status: HardwareStatus;
  powerOn: boolean;
  cpuLoadPercent?: number;
  temperatureC?: number;
  inputDescription: string;
  outputDescription: string;
  activeTxRx: boolean;
  metrics: Record<string, string | number>;
  lastHeartbeat: string;
}

export type TrafficDensityLevel = 'low' | 'normal' | 'congested' | 'gridlock';

export interface HardwareSimConfig {
  speedMultiplier: 1 | 2 | 4;
  trafficDensity: TrafficDensityLevel;
  ambulanceSpeedKmH: number;
  networkLatencyMs: number;
  sensorFaultInjected: boolean;
  commsFaultInjected: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  alertToneDurationSec: number;
  autoPlayStage: boolean;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  sourceModule: HardwareId | 'SERVER' | 'POLICE_DESK' | 'GPS_OBU' | 'ALGORITHM';
  protocol: 'MQTT' | 'UART' | 'NMEA' | '4G/LTE' | 'GPIO' | 'I2S' | 'HTTP' | 'SYSTEM';
  level: 'info' | 'warn' | 'alert' | 'success';
  payload: string;
}

export interface DelhiJunctionInfo {
  id: number;
  name: string;
  code: string;
  lat: number;
  lng: number;
  rsuId: string;
  description: string;
  defaultQueueMeters: number;
  normalCycleSeconds: number;
}
