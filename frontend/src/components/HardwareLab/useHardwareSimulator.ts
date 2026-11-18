import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HardwareId,
  SimulationStage,
  TrafficDensityLevel,
  HardwareSimConfig,
  TelemetryLog,
  DelhiJunctionInfo,
  HardwareDeviceState
} from './types';
import { junctionAudio } from './audioEngine';
import { STOPS, ROUTE_COORDS } from '../../data/delhiData';

export const DELHI_JUNCTIONS: DelhiJunctionInfo[] = [
  {
    id: 1,
    name: 'Connaught Place (Inner Circle)',
    code: 'CP-01',
    lat: 28.6328,
    lng: 77.2195,
    rsuId: 'RSU-DELHI-CP-01',
    description: 'Corridor Entrance & Radial Road 1 Hub',
    defaultQueueMeters: 45,
    normalCycleSeconds: 90,
  },
  {
    id: 2,
    name: 'Barakhamba Road Crossing',
    code: 'BK-02',
    lat: 28.6295,
    lng: 77.2268,
    rsuId: 'RSU-DELHI-BK-02',
    description: 'Radial Road 4 Junction (Commercial Zone)',
    defaultQueueMeters: 80,
    normalCycleSeconds: 100,
  },
  {
    id: 3,
    name: 'Mandi House Roundabout',
    code: 'MH-03',
    lat: 28.6258,
    lng: 77.2345,
    rsuId: 'RSU-DELHI-MH-03',
    description: 'Cultural Hub & 6-Way Intersection',
    defaultQueueMeters: 140,
    normalCycleSeconds: 120,
  },
  {
    id: 4,
    name: 'Tilak Marg / Supreme Court',
    code: 'TM-04',
    lat: 28.6212,
    lng: 77.2398,
    rsuId: 'RSU-DELHI-TM-04',
    description: 'Judicial Corridor High-Security Checkpoint',
    defaultQueueMeters: 65,
    normalCycleSeconds: 80,
  },
  {
    id: 5,
    name: 'ITO Chowk (Vikas Marg)',
    code: 'ITO-05',
    lat: 28.6288,
    lng: 77.2415,
    rsuId: 'RSU-DELHI-ITO-05',
    description: 'Busiest Traffic Hub in Delhi (Trans-Yamuna Link)',
    defaultQueueMeters: 230,
    normalCycleSeconds: 150,
  },
  {
    id: 6,
    name: 'Delhi Gate / LNJP Emergency',
    code: 'DG-06',
    lat: 28.6385,
    lng: 77.2410,
    rsuId: 'RSU-DELHI-DG-06',
    description: 'LNJP Trauma Centre Dedicated Access Gate',
    defaultQueueMeters: 30,
    normalCycleSeconds: 75,
  },
];

const INITIAL_CONFIG: HardwareSimConfig = {
  speedMultiplier: 1,
  trafficDensity: 'congested',
  ambulanceSpeedKmH: 60,
  networkLatencyMs: 45,
  sensorFaultInjected: false,
  commsFaultInjected: false,
  soundEnabled: false, // Default off until user toggles or starts alert
  soundVolume: 0.35,
  alertToneDurationSec: 6,
  autoPlayStage: true,
};

function formatSimTimestamp(date: Date = new Date()): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  const ms = Math.floor(date.getMilliseconds() / 10).toString().padStart(2, '0');
  return `${h}:${m}:${s}.${ms}`;
}

export function useHardwareSimulator() {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [currentStage, setCurrentStage] = useState<SimulationStage>(1);
  const [stageProgressPercent, setStageProgressPercent] = useState<number>(0);
  const [selectedJunctionId, setSelectedJunctionId] = useState<number>(5); // Default ITO Chowk (high excitement)
  const [config, setConfig] = useState<HardwareSimConfig>(INITIAL_CONFIG);

  // Power state for all 9 devices
  const [devicePower, setDevicePower] = useState<Record<HardwareId, boolean>>({
    esp32: true,
    density_sensor: true,
    gps: true,
    gsm_4g: true,
    traffic_signal: true,
    led_matrix: true,
    speaker: true,
    edge_device: true,
    cctv_vision: true,
  });

  // Telemetry logs
  const [logs, setLogs] = useState<TelemetryLog[]>([]);

  // Simulation metrics
  const [activeAmbulanceDistToJunctionKm, setActiveAmbulanceDistToJunctionKm] = useState<number>(1.8);
  const [ambulancePassedTime, setAmbulancePassedTime] = useState<number>(0);
  const [policeAcknowledged, setPoliceAcknowledged] = useState<boolean>(false);
  const [isAlertAudioPlaying, setIsAlertAudioPlaying] = useState<boolean>(false);
  const [trafficSignalColor, setTrafficSignalColor] = useState<'red' | 'amber' | 'green'>('red');
  const [signalCountdown, setSignalCountdown] = useState<number>(45);

  const activeJunction = DELHI_JUNCTIONS.find(j => j.id === selectedJunctionId) || DELHI_JUNCTIONS[4];

  // Helper to add deterministic telemetry logs
  const addLog = useCallback((
    source: TelemetryLog['sourceModule'],
    protocol: TelemetryLog['protocol'],
    level: TelemetryLog['level'],
    payload: string
  ) => {
    const entry: TelemetryLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: formatSimTimestamp(),
      sourceModule: source,
      protocol,
      level,
      payload,
    };
    setLogs(prev => [entry, ...prev.slice(0, 79)]); // Keep last 80 logs
  }, []);

  // Compute live vehicle density & queue length based on settings & stage
  const densityMultiplier =
    config.trafficDensity === 'low' ? 0.4
    : config.trafficDensity === 'normal' ? 0.75
    : config.trafficDensity === 'congested' ? 1.25
    : 1.85;

  const baseQueue = activeJunction.defaultQueueMeters * densityMultiplier;
  const currentQueueMeters = config.sensorFaultInjected
    ? 0
    : Math.max(10, Math.round(
        currentStage === 5 ? baseQueue * 0.2
        : currentStage === 4 ? baseQueue * 0.55
        : baseQueue
      ));

  const detectedVehiclesCount = config.sensorFaultInjected
    ? 0
    : Math.max(2, Math.round(currentQueueMeters / 6.5));

  const roadOccupancyPercent = config.sensorFaultInjected
    ? 0
    : Math.min(98, Math.max(15, Math.round((currentQueueMeters / 250) * 100)));

  // ETA Calculation
  const ambulanceEtaSeconds = Math.max(0, Math.round((activeAmbulanceDistToJunctionKm / (config.ambulanceSpeedKmH || 60)) * 3600));

  // Stage advancement & transition logic
  const advanceToStage = useCallback((nextStage: SimulationStage) => {
    setCurrentStage(nextStage);
    setStageProgressPercent(0);

    const jName = activeJunction.name;
    const rsu = activeJunction.rsuId;

    switch (nextStage) {
      case 1: // Normal
        setTrafficSignalColor('red');
        setSignalCountdown(42);
        if (junctionAudio.getIsPlaying()) {
          junctionAudio.stopAlert();
          setIsAlertAudioPlaying(false);
        }
        addLog('SERVER', 'SYSTEM', 'info', `[STAGE 1] Normal traffic sequence initialized at ${jName} (${rsu}). Sensor baseline established.`);
        break;

      case 2: // Ambulance Detected
        addLog('GPS_OBU', 'NMEA', 'info', `[STAGE 2] Ambulance DL-01-EMS-4402 GNSS fix locked. Speed: ${config.ambulanceSpeedKmH} km/h. Heading: LNJP Hospital.`);
        addLog('ALGORITHM', 'SYSTEM', 'alert', `[STAGE 2] AI/ML Route Optimizer: Priority corridor active on Radial Road 4 → ${jName}. ETA: ${Math.floor(ambulanceEtaSeconds / 60)}m ${ambulanceEtaSeconds % 60}s.`);
        break;

      case 3: // IoT Command Transmission
        if (config.commsFaultInjected) {
          addLog('gsm_4g', '4G/LTE', 'warn', `[STAGE 3] SIM7600: AT+CIPSEND timeout! 4G mesh packet loss simulated. Retrying on LTE Cat-4 backup channel...`);
        } else {
          addLog('gsm_4g', '4G/LTE', 'info', `[STAGE 3] SIM7600: MQTT packet received from Cloud Central Broker (Latency: ${config.networkLatencyMs}ms). Topic: /delhi/rsu/${rsu}/priority`);
          addLog('esp32', 'UART', 'success', `[STAGE 3] ESP32 RSU: Received priority command payload: {"cmd":"PREEMPT_SIGNAL","amb_id":"DL-01-EMS-4402","eta_sec":${ambulanceEtaSeconds},"corridor_id":"LNJP-C5"}`);
        }
        break;

      case 4: // Junction Preparation
        setTrafficSignalColor('green');
        setSignalCountdown(ambulanceEtaSeconds + 10);
        addLog('density_sensor', 'GPIO', 'info', `[STAGE 4] Ultrasonic HC-SR04 & mmWave radar: Road queue ${currentQueueMeters}m detected. Edge device initiating preemptive clearance.`);
        addLog('edge_device', 'SYSTEM', 'info', `[STAGE 4] Raspberry Pi CM4 Edge: Aggregated 3 sensor streams. Latency: 12ms. Local preemption rule satisfied.`);
        addLog('traffic_signal', 'GPIO', 'success', `[STAGE 4] ESP32 Signal Controller: Preempting normal phase. Relay K1 triggered. Green wave corridor activated on Vikas Marg.`);
        addLog('led_matrix', 'UART', 'info', `[STAGE 4] LED Matrix VMS: Display updated to "AMBULANCE APPROACHING — KEEP ROUTE CLEAR".`);
        if (config.soundEnabled && devicePower.speaker) {
          junctionAudio.playAlert(config.soundVolume, config.alertToneDurationSec, () => {
            setIsAlertAudioPlaying(false);
          });
          setIsAlertAudioPlaying(true);
          addLog('speaker', 'I2S', 'alert', `[STAGE 4] I2S MAX98357A: PA Horn siren activated (680Hz / 1020Hz dual-frequency warble).`);
        }
        break;

      case 5: // Ambulance Passage
        addLog('cctv_vision', 'SYSTEM', 'alert', `[STAGE 5] AI Vision Module: Ambulance DL-01-EMS-4402 detected in Lane 2 (Confidence: 98.7%). Speed: ${config.ambulanceSpeedKmH} km/h.`);
        addLog('traffic_signal', 'GPIO', 'success', `[STAGE 5] Traffic Signal: Holding GREEN wave. Conflicting pedestrian & cross traffic phases locked RED.`);
        break;

      case 6: // Normalisation
        setTrafficSignalColor('amber');
        setSignalCountdown(5);
        if (junctionAudio.getIsPlaying()) {
          junctionAudio.stopAlert();
          setIsAlertAudioPlaying(false);
        }
        addLog('density_sensor', 'GPIO', 'info', `[STAGE 6] Optical & Radar: Ambulance passage verified past stop line. Clearance interval 4.0s initiated.`);
        addLog('led_matrix', 'UART', 'info', `[STAGE 6] LED Matrix VMS: Display updated to "AMBULANCE PASSED — NORMAL FLOW RESUMING".`);
        addLog('esp32', 'SYSTEM', 'success', `[STAGE 6] ESP32 RSU: Restoring standard NEMA/IRC fixed-time traffic light cycle. Priority log committed.`);
        setTimeout(() => {
          setTrafficSignalColor('red');
          setSignalCountdown(45);
        }, 3000);
        break;
    }
  }, [
    activeJunction,
    config.ambulanceSpeedKmH,
    config.networkLatencyMs,
    config.commsFaultInjected,
    config.soundEnabled,
    config.soundVolume,
    config.alertToneDurationSec,
    devicePower.speaker,
    ambulanceEtaSeconds,
    currentQueueMeters,
    addLog
  ]);

  // Master simulation clock (coordinated loop)
  useEffect(() => {
    if (!isRunning) return;

    const intervalTime = Math.max(50, Math.floor(1000 / (10 * config.speedMultiplier)));
    const timer = setInterval(() => {
      setStageProgressPercent(prev => {
        const next = prev + 1.25 * config.speedMultiplier;
        if (next >= 100) {
          if (config.autoPlayStage) {
            // Cycle to next stage
            setCurrentStage(curr => {
              const nextStage = curr === 6 ? 1 : ((curr + 1) as SimulationStage);
              advanceToStage(nextStage);
              return nextStage;
            });
          }
          return 0;
        }
        return next;
      });

      // Update distance to junction
      setActiveAmbulanceDistToJunctionKm(prev => {
        if (currentStage === 1) return 2.4;
        if (currentStage === 2) return Math.max(1.8, prev - 0.015 * config.speedMultiplier);
        if (currentStage === 3) return Math.max(1.2, prev - 0.02 * config.speedMultiplier);
        if (currentStage === 4) return Math.max(0.4, prev - 0.03 * config.speedMultiplier);
        if (currentStage === 5) return Math.max(0.0, prev - 0.04 * config.speedMultiplier);
        return 0;
      });

      // Update signal countdown
      setSignalCountdown(prev => (prev > 1 ? prev - 1 : 45));
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isRunning, config.speedMultiplier, config.autoPlayStage, currentStage, advanceToStage]);

  // Switch Junction
  const selectJunction = (id: number) => {
    setSelectedJunctionId(id);
    const j = DELHI_JUNCTIONS.find(item => item.id === id);
    if (j) {
      addLog('POLICE_DESK', 'SYSTEM', 'info', `Operator focused inspection on Junction #${j.id}: ${j.name} (${j.rsuId}).`);
    }
  };

  // Toggle single device power
  const toggleDevicePower = (id: HardwareId) => {
    setDevicePower(prev => {
      const nextState = !prev[id];
      addLog('esp32', 'SYSTEM', nextState ? 'info' : 'warn', `Device [${id.toUpperCase()}] powered ${nextState ? 'ON' : 'OFF'}.`);
      return { ...prev, [id]: nextState };
    });
  };

  // Emergency Priority Activation button
  const triggerEmergencyPriority = () => {
    advanceToStage(4);
    setPoliceAcknowledged(true);
    addLog('POLICE_DESK', 'SYSTEM', 'alert', `EMERGENCY GREEN WAVE OVERRIDE: Delhi Police operator manually dispatched priority preemption command.`);
  };

  // Reset simulation
  const resetSimulation = () => {
    if (junctionAudio.getIsPlaying()) {
      junctionAudio.stopAlert();
    }
    setIsAlertAudioPlaying(false);
    setCurrentStage(1);
    setStageProgressPercent(0);
    setActiveAmbulanceDistToJunctionKm(2.4);
    setPoliceAcknowledged(false);
    setTrafficSignalColor('red');
    setSignalCountdown(45);
    addLog('SERVER', 'SYSTEM', 'info', 'Simulation reset to Stage 1 (Normal Traffic Flow). All hardware nodes refreshed.');
  };

  // Manual Stage Steppers
  const stepNextStage = () => {
    const nextStage = currentStage === 6 ? 1 : ((currentStage + 1) as SimulationStage);
    advanceToStage(nextStage);
  };

  const stepPrevStage = () => {
    const prevStage = currentStage === 1 ? 6 : ((currentStage - 1) as SimulationStage);
    advanceToStage(prevStage);
  };

  // Sound play toggle for speaker module manual test
  const testSpeakerAudio = () => {
    if (isAlertAudioPlaying) {
      junctionAudio.stopAlert();
      setIsAlertAudioPlaying(false);
      addLog('speaker', 'I2S', 'info', 'Speaker alert manually stopped by operator.');
    } else {
      junctionAudio.playAlert(config.soundVolume, config.alertToneDurationSec, () => {
        setIsAlertAudioPlaying(false);
      });
      setIsAlertAudioPlaying(true);
      addLog('speaker', 'I2S', 'alert', `Manual Siren Tone Test triggered (${config.alertToneDurationSec}s, volume: ${Math.round(config.soundVolume * 100)}%).`);
    }
  };

  // Compile detailed hardware device states
  const devices: Record<HardwareId, HardwareDeviceState> = {
    esp32: {
      id: 'esp32',
      name: 'Junction IoT Microcontroller',
      hardwareModel: 'ESP32-WROOM-32D (Dual Xtensa LX6 @ 240MHz)',
      role: 'Master Roadside Unit (RSU) Node Controller',
      status: !devicePower.esp32 ? 'offline' : currentStage === 3 || currentStage === 4 ? 'priority_active' : 'online',
      powerOn: devicePower.esp32,
      cpuLoadPercent: !devicePower.esp32 ? 0 : currentStage === 3 || currentStage === 4 ? 68 : 24,
      temperatureC: !devicePower.esp32 ? 26 : 41.2,
      inputDescription: '4G LTE MQTT Priority Payload, Ultrasonic Echo Interrupts, Radar Serial, Police Override',
      outputDescription: 'Solid State Relay Trigger (Signal Tri-Color), I2S Audio Stream, UART VMS Frame, Cloud Telemetry',
      activeTxRx: isRunning && devicePower.esp32 && (currentStage === 3 || currentStage === 4),
      metrics: {
        'FreeRTOS Ticks': '1000 Hz',
        'Heap Available': '184.2 KB / 320 KB',
        'GPIO 2 (Status LED)': currentStage >= 3 ? 'HIGH (1)' : 'BLINK (1Hz)',
        'GPIO 21 (Relay K1)': trafficSignalColor === 'green' ? 'ACTIVE (3.3V)' : 'INACTIVE (0V)',
        'Wi-Fi/Mesh RSSI': '-58 dBm (DTP_IOT_NET)',
        'Flash Memory': '4MB SPI Quad-Flash',
      },
      lastHeartbeat: formatSimTimestamp(),
    },

    density_sensor: {
      id: 'density_sensor',
      name: 'Vehicle Density Sensor Array',
      hardwareModel: 'HC-SR04 Ultrasonic + 24GHz mmWave Radar Hybrid',
      role: 'Queue Length & Lane Occupancy Measurement',
      status: !devicePower.density_sensor ? 'offline' : config.sensorFaultInjected ? 'fault' : 'online',
      powerOn: devicePower.density_sensor,
      cpuLoadPercent: !devicePower.density_sensor ? 0 : 15,
      temperatureC: 32.5,
      inputDescription: '40kHz Acoustic Pulse Reflection & Doppler Radar Shift',
      outputDescription: 'PWM Echo Pulse Duration (150us - 25ms) & UART Distance Packets',
      activeTxRx: isRunning && devicePower.density_sensor && !config.sensorFaultInjected,
      metrics: {
        'Detected Queue': `${currentQueueMeters} meters`,
        'Vehicle Count': `${detectedVehiclesCount} vehicles`,
        'Road Occupancy': `${roadOccupancyPercent}%`,
        'Pulse Time-of-Flight': `${(currentQueueMeters * 58.8).toFixed(0)} µs`,
        'Sensor Health': config.sensorFaultInjected ? 'FAULT (TIMEOUT)' : 'CALIBRATED & NORMAL',
      },
      lastHeartbeat: formatSimTimestamp(),
    },

    gps: {
      id: 'gps',
      name: 'High-Precision GNSS Module',
      hardwareModel: 'u-blox NEO-6M GNSS + Active Ceramic Patch Antenna',
      role: 'On-Board Ambulance Telemetry & Vector Tracking',
      status: !devicePower.gps ? 'offline' : currentStage >= 2 ? 'processing' : 'standby',
      powerOn: devicePower.gps,
      cpuLoadPercent: !devicePower.gps ? 0 : 22,
      temperatureC: 36.8,
      inputDescription: 'L1 C/A 1575.42MHz Satellite Radio Frequency Signals (GPS + GLONASS)',
      outputDescription: '9600 Baud NMEA-0183 Sentences ($GPRMC, $GPGGA) via UART',
      activeTxRx: isRunning && devicePower.gps,
      metrics: {
        'Latitude': (28.6288 + (activeAmbulanceDistToJunctionKm * 0.003)).toFixed(5) + '° N',
        'Longitude': (77.2415 - (activeAmbulanceDistToJunctionKm * 0.002)).toFixed(5) + '° E',
        'Speed': `${config.ambulanceSpeedKmH} km/h`,
        'Heading': '042° NE (LNJP Corridor)',
        'Satellites Locked': '11 Satellites (3D Fix)',
        'HDOP': '0.85 (High Precision)',
      },
      lastHeartbeat: formatSimTimestamp(),
    },

    gsm_4g: {
      id: 'gsm_4g',
      name: 'GSM / 4G LTE Communication Modem',
      hardwareModel: 'SIMCom SIM7600G-H Multi-Band LTE Cat-4 Modem',
      role: 'Cloud Uplink, Downlink & Police Dispatch Comms',
      status: !devicePower.gsm_4g ? 'offline' : config.commsFaultInjected ? 'fault' : currentStage === 3 ? 'priority_active' : 'online',
      powerOn: devicePower.gsm_4g,
      cpuLoadPercent: !devicePower.gsm_4g ? 0 : 45,
      temperatureC: 44.1,
      inputDescription: 'Cellular 4G LTE B1/B3/B5/B40 Radio Waves & AT Commands via UART',
      outputDescription: 'TCP/IP Socket Buffers, MQTT / HTTPS JSON Payloads, SMS Alerts',
      activeTxRx: isRunning && devicePower.gsm_4g && !config.commsFaultInjected,
      metrics: {
        'Carrier': 'Delhi Police Dedicated APN (AirTel / Jio IoT)',
        'Signal Strength (RSSI)': config.commsFaultInjected ? '-112 dBm (DROPPED)' : '-64 dBm (4 of 5 bars)',
        'Latency': `${config.networkLatencyMs} ms`,
        'Packet Success': config.commsFaultInjected ? '24% (HIGH RETRY)' : '99.8%',
        'MQTT Topic': `/delhi/traffic/${activeJunction.code}/control`,
      },
      lastHeartbeat: formatSimTimestamp(),
    },

    traffic_signal: {
      id: 'traffic_signal',
      name: 'Intelligent Traffic Signal Controller',
      hardwareModel: 'Axiom ITC-300 Solid-State Tri-Color NEMA Actuator',
      role: 'Phase Transition & Emergency Green Wave Preemption',
      status: !devicePower.traffic_signal ? 'offline' : currentStage >= 4 && currentStage <= 5 ? 'priority_active' : 'online',
      powerOn: devicePower.traffic_signal,
      cpuLoadPercent: !devicePower.traffic_signal ? 0 : 18,
      temperatureC: 38.0,
      inputDescription: 'ESP32 GPIO 21/22/23 Opto-isolated Triggers & Emergency Priority Line',
      outputDescription: '230V AC / 24V DC Solid State Relays driving Red, Amber, Green LED heads',
      activeTxRx: isRunning && devicePower.traffic_signal,
      metrics: {
        'Current Aspect': trafficSignalColor.toUpperCase(),
        'Time in Phase': `${signalCountdown}s remaining`,
        'Phase Type': currentStage >= 4 && currentStage <= 5 ? 'EMERGENCY PREEMPTION (PRIORITY 1)' : 'FIXED-TIME ACTUATED CYCLE',
        'Conflicting Phases': currentStage >= 4 && currentStage <= 5 ? 'LOCKED RED (ALL CROSSINGS)' : 'CYCLICAL CLEARANCE',
        'Relay Duty Cycle': '100% Solid-State',
      },
      lastHeartbeat: formatSimTimestamp(),
    },

    led_matrix: {
      id: 'led_matrix',
      name: 'Outdoor Variable Message Sign (VMS)',
      hardwareModel: 'P10 Ultra-Bright Dual-Color LED Dot Matrix (64x32)',
      role: 'Advance Driver Notification & Lane Clearance Warnings',
      status: !devicePower.led_matrix ? 'offline' : currentStage >= 3 ? 'priority_active' : 'online',
      powerOn: devicePower.led_matrix,
      cpuLoadPercent: !devicePower.led_matrix ? 0 : 35,
      temperatureC: 39.5,
      inputDescription: 'SPI / RS-485 Bitmap Buffer from ESP32 Controller',
      outputDescription: 'High-Luminance Amber/Red Optical Warning Text to Oncoming Motorists',
      activeTxRx: isRunning && devicePower.led_matrix,
      metrics: {
        'Current Display': currentStage === 1 ? 'TRAFFIC FLOW: NORMAL'
          : currentStage === 2 ? 'ALERT: EMS DISPATCHED'
          : currentStage === 3 ? 'PRIORITY CORRIDOR ACTIVE'
          : currentStage === 4 ? `AMBULANCE APPROACHING — ETA ${Math.floor(ambulanceEtaSeconds / 60)}m ${ambulanceEtaSeconds % 60}s`
          : currentStage === 5 ? 'KEEP ROUTE CLEAR — AMBULANCE CROSSING'
          : 'AMBULANCE PASSED — RESUME NORMAL',
        'Matrix Resolution': '64 x 32 Pixels (HUB75 Protocol)',
        'Brightness Level': '92% (Auto Daylight Compensated)',
        'Refresh Rate': '120 Hz Flicker-Free',
      },
      lastHeartbeat: formatSimTimestamp(),
    },

    speaker: {
      id: 'speaker',
      name: 'Junction Public Acoustic Alert System',
      hardwareModel: 'MAX98357A I2S 3.2W Class-D Amp + 100W Horn Speaker',
      role: 'Audible Emergency Siren & Voice Announcement at Intersection',
      status: !devicePower.speaker ? 'offline' : isAlertAudioPlaying ? 'priority_active' : 'standby',
      powerOn: devicePower.speaker,
      cpuLoadPercent: !devicePower.speaker ? 0 : isAlertAudioPlaying ? 54 : 5,
      temperatureC: 34.0,
      inputDescription: 'I2S Digital Audio Stream (BCLK, LRC, DOUT) from ESP32 / Local Synth',
      outputDescription: '110 dB SPL Multi-Frequency Emergency Warble across Intersection',
      activeTxRx: isRunning && isAlertAudioPlaying && devicePower.speaker,
      metrics: {
        'Siren State': isAlertAudioPlaying ? 'ACTIVELY SOUNDING' : 'STANDBY / ARMED',
        'Sound Pressure Level': isAlertAudioPlaying ? '108 dB @ 1 meter' : '0 dB (Muted)',
        'Tone Frequencies': '680 Hz + 1020 Hz Interrupted Warble',
        'Volume Setting': `${Math.round(config.soundVolume * 100)}%`,
        'Audio Safety': 'Web Audio Context Guarded',
      },
      lastHeartbeat: formatSimTimestamp(),
    },

    edge_device: {
      id: 'edge_device',
      name: 'Edge AI & Sensor Fusion Computer',
      hardwareModel: 'Industrial Raspberry Pi Compute Module 4 (CM4 4GB/32GB eMMC)',
      role: 'Multi-Sensor Data Aggregation & Sub-15ms Local Decisioning',
      status: !devicePower.edge_device ? 'offline' : 'online',
      powerOn: devicePower.edge_device,
      cpuLoadPercent: !devicePower.edge_device ? 0 : 38,
      temperatureC: 46.5,
      inputDescription: 'RTSP CCTV Video Stream, HC-SR04 Raw Pulses, 24GHz Radar Serial, GPS NMEA',
      outputDescription: 'Filtered Queue Statistics, Density Matrix, Emergency Preemption Trigger to ESP32',
      activeTxRx: isRunning && devicePower.edge_device,
      metrics: {
        'Edge Pipeline Latency': '11.4 ms (Zero-Cloud Dependency)',
        'Local Filter Type': 'Extended Kalman Filter (EKF)',
        'Queue Classification': currentQueueMeters > 150 ? 'HEAVY GRIDLOCK' : currentQueueMeters > 70 ? 'CONGESTED' : 'CLEAR',
        'Architecture': 'Edge = Local Safety / Cloud = Global Corridor AI',
        'OS Runtime': 'Debian Linux 12 (Real-Time Preempt-RT Kernel)',
      },
      lastHeartbeat: formatSimTimestamp(),
    },

    cctv_vision: {
      id: 'cctv_vision',
      name: 'AI Optical Traffic Vision Module',
      hardwareModel: 'Sony IMX385 Full-HD 1080p Optical Sensor + Hailo-8 AI Accelerator',
      role: 'Visual Vehicle Tracking, Ambulance Recognition & Lane Cleared Verification',
      status: !devicePower.cctv_vision ? 'offline' : 'online',
      powerOn: devicePower.cctv_vision,
      cpuLoadPercent: !devicePower.cctv_vision ? 0 : 42,
      temperatureC: 43.8,
      inputDescription: '30 FPS 1080p Optical Video Feed of Delhi Junction Approaches',
      outputDescription: 'Object Bounding Boxes (YOLOv8 Edge Model), Class Labels & Optical Flow Velocity',
      activeTxRx: isRunning && devicePower.cctv_vision,
      metrics: {
        'Inference Engine': 'YOLOv8-Nano INT8 Quantized on Hailo-8',
        'Frame Rate': '30.0 FPS',
        'Detected Classes': currentStage === 5 ? 'Ambulance (0.99), Bus (0.91), Cars (4)' : 'Cars (8), Buses (2), Auto-Rickshaws (5)',
        'Ambulance Verification': currentStage >= 4 ? 'TARGET IN FIELD OF VIEW' : 'NONE IN APPROACH',
        'Feed Nature': 'SIMULATED AI VISION FEED — SYNTHETIC BENCHMARK',
      },
      lastHeartbeat: formatSimTimestamp(),
    },
  };

  return {
    isRunning,
    setIsRunning,
    currentStage,
    stageProgressPercent,
    selectedJunctionId,
    selectJunction,
    activeJunction,
    config,
    setConfig,
    devicePower,
    toggleDevicePower,
    devices,
    logs,
    addLog,
    advanceToStage,
    stepNextStage,
    stepPrevStage,
    resetSimulation,
    triggerEmergencyPriority,
    activeAmbulanceDistToJunctionKm,
    ambulanceEtaSeconds,
    currentQueueMeters,
    detectedVehiclesCount,
    roadOccupancyPercent,
    policeAcknowledged,
    setPoliceAcknowledged,
    trafficSignalColor,
    signalCountdown,
    isAlertAudioPlaying,
    testSpeakerAudio,
  };
}
