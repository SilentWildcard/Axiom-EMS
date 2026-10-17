# ERS — Hardware Integration Architecture

This directory details the physical and simulated IoT Roadside Unit (RSU) architecture for the **Emergency Response Synchronization System (ERS)** in Delhi.

## 1. Physical Roadside Unit (RSU) Hardware Stack

Each roadside unit deployed at arterial intersections (e.g. Barakhamba Road, Mandi House, ITO Junction, Ashram Chowk, AIIMS Flyover) consists of:
- **MCU**: ESP32-WROOM-32D with dual-core 240MHz Xtensa CPU.
- **Connectivity**: 4G/LTE Cat-M1 (SIM7600EI module) or 2.4GHz secure municipal Wi-Fi mesh.
- **Audio Notification**: MAX98357A 3W I2S Class-D amplifier driving a weatherproof horn speaker for clear voice alerts to nearby traffic.
- **Visual Alert**: P10 32x16 Outdoor LED Matrix panel or high-intensity RGB beacon for emergency corridor guidance.
- **Sensors**: Ultrasonic distance sensor (HC-SR04) or 24GHz mmWave radar for traffic queue length estimation; sound level detector for siren resonance validation.

## 2. Communication Protocols

RSUs support two primary communication channels:

### A. HTTP REST Polling / Telemetry (Default MVP Adapter)
- **Endpoint**: `POST /api/iot/hardware/telemetry`
- **Request Body**:
```json
{
  "device_id": "CP-RSU-01",
  "timestamp": "1729158300000",
  "token": "ers_rsu_token_delhi_sec_8f93a1",
  "rssi_dbm": -62,
  "ambient_noise_db": 74.2,
  "traffic_queue_length_m": 48.5
}
```
- **Response**:
```json
{
  "status": "ACCEPTED",
  "device_state": "ALERT_SENT",
  "speaker_active": true,
  "display_command": "EMERGENCY VEHICLE APPROACHING - ETA 55s",
  "audio_command": "Emergency alert. Ambulance approaching Barakhamba Road Junction..."
}
```

### B. MQTT Messaging Schema (Production Ready)
- **Broker**: `mqtt.delhitrafficpolice.gov.in:8883` (TLS 1.3)
- **Topics**:
  - `ers/delhi/rsu/{device_id}/telemetry` (Device -> Server)
  - `ers/delhi/rsu/{device_id}/command` (Server -> Device)
  - `ers/delhi/rsu/{device_id}/ack` (Device -> Server)
  - `ers/delhi/ambulance/{ambulance_id}/gps` (Ambulance AVL -> Server)

## 3. Strict Safety Protocol
RSUs **do not directly switch high-voltage traffic light relays** autonomously. All signal preemption triggers send advance advisories to the Traffic Police Command Dashboard and road users. Physical signal override requires authorized traffic control room clearance.
