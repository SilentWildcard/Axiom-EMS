# ERS — Emergency Response Synchronization System
### AI/ML + IoT-Based Intelligent Ambulance Traffic Coordination for Delhi, India

> **Operational Emergency Response Command Platform**  
> *Designed to reduce avoidable emergency vehicle delays across Delhi's arterial corridors through predictive AI/ML ETA estimation, roadside IoT unit synchronization, and traffic police advance coordination.*

---

## 🚨 Persistent Demo Mode & Regulatory Notice
This project is an **interactive MVP prototype**. All ambulance positions, sensor readings, and traffic signal recommendations are simulated for testing and demonstration purposes. In compliance with public safety regulations, signal preemption triggers provide advisory advance notices; physical traffic signal changes remain subject to authorized Delhi Traffic Police standard operating procedures.

---

## 🌟 Key Capabilities & Features

### 1. 2-Stage Advance Alert Workflow
- **Stage 1: Ambulance Approaching**: When the ambulance enters the configured trigger radius (<650m or dynamic lead time), the relevant Roadside Unit (RSU) issues an advance notification, calculates predicted arrival time, triggers localized horn speaker announcements (Web Speech API TTS), and advises the traffic-control console.
- **Stage 2a: Checkpoint Arrival**: Confirms physical arrival at the junction threshold (<50m), holds conflicting cross-traffic, and records arrival timestamp.
- **Stage 2b: Passage Confirmation**: Detects when the ambulance has cleared the junction, restores standard cycle phasing, updates event logs, and recalculates the dynamic ETA for the next downstream intersection.

### 2. AI/ML ETA Prediction Engine
- Real **Scikit-Learn GradientBoostingRegressor + RandomForest Ensemble** trained on synthetic Delhi emergency transit data.
- **Features Used**: Distance to checkpoint, instantaneous speed, Delhi congestion multiplier (1.0x - 3.5x), time of day (24h rush hour), day of week, intersection count, roadblocks, winter smog factor.
- **Metrics**: Achieves **R² = 0.9891**, **RMSE = 145.7s**, outperforming naive distance/speed baseline models by **86.4%**.
- Computes empirical 90% confidence uncertainty ranges and evaluates delay risks (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).

### 3. Roadside IoT Units (RSU) Management
- Simulated roadside microcontrollers deployed at genuine Delhi intersections:
  - *Barakhamba Road Junction*
  - *Mandi House Roundabout*
  - *ITO Major Intersection (BSZ Marg)*
  - *Pragati Maidan / Bhairon Marg*
  - *Ashram Chowk Overpass / Underpass*
  - *AIIMS Flyover / Aurobindo Marg*
- Implements strict 6-state finite state machine:
  1. `IDLE`
  2. `ALERT_SENT`
  3. `AMBULANCE_APPROACHING`
  4. `ARRIVED_AT_CHECKPOINT`
  5. `AMBULANCE_PASSED`
  6. `RESET`
- Telemetry readout: Wi-Fi RSSI (dBm), ambient sound detector (dB), queue length estimation (m), P10 LED matrix display simulation, and PA audio voice announcements.
- Live hardware payload inspector showing ESP32 REST/MQTT JSON format.

### 4. Interactive Simulation & Testing Lab (Judges Suite)
- **1-Click Preset Scenarios**:
  - *Scenario 1: Connaught Place to AIIMS Golden Hour Emergency* (Standard priority green corridor).
  - *Scenario 2: Peak Rush Hour Congestion with Injected Roadblock* (Stress-test dynamic AI delay adjustments).
- Interactive speed, traffic density, and roadblock controls.
- Single-step advancement or continuous playback.

### 5. Traffic Police Operations Desk
- Dedicated high-contrast interface for traffic officers.
- 1-Click SOP clearance actions: *Acknowledge*, *Mark Corridor Preparing*, *Confirm Prepared*, *Escalate Obstacle*.

### 6. Analytics & Audit Log
- Alert-to-clearance response timelines, availability tracking, and 1-click export to **CSV** and **JSON**.

---

## 🏗️ Architecture & Technology Stack

```
                          [ Ambulance GPS / Simulated Telemetry ]
                                            │
                                            ▼
                           [ FastAPI / Client Dual Engine ]
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
   [ Scikit-Learn ML Model ]       [ IoT RSU State Machine ]     [ Traffic Police Console ]
     - Gradient Boosting              - 6 States: IDLE to RESET    - Advance Advisories
     - 90% Uncertainty Bounds         - PA Speaker TTS             - 1-Click SOP Actions
     - Dynamic Lead Calculation       - Simulated Queue Radar      - Passage Audit
               │                            │                            │
               └────────────────────────────┼────────────────────────────┘
                                            ▼
                           [ Leaflet OpenStreetMap Dashboard ]
                             (CartoDB Dark Matter / Tailwind)
```

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS + Lucide Icons + Leaflet (CartoDB Dark).
- **Backend**: Python 3.12 + FastAPI + Scikit-Learn + NumPy + WebSockets + Uvicorn.
- **Hardware Layer**: Arduino / ESP32 C++ firmware sketch (`hardware/esp32_rsu_node.ino`) + MQTT / HTTP API schemas.
- **Dual-Mode Fallback**: The frontend features an integrated client simulation engine so judges can test 100% of features seamlessly even if deployed statically on Vercel without local backend access!

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Start the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Backend will be live at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 2. Start the React Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🌐 Production Deployment Guide

### Deploying Frontend to Vercel
1. Push this repository to GitHub or run via Vercel CLI:
```bash
cd frontend
vercel --prod
```
2. The bundled `vercel.json` ensures client-side routing rewrites are handled cleanly.
3. The app will automatically run in full interactive mode with client-side dual simulation fallback.

### Deploying Backend to Render / Railway
1. Set the root directory to `backend`.
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set `CORS_ORIGINS` environment variable to your Vercel frontend URL.

---

## 📋 Implemented Features vs Simulated Features

| Feature | Implementation Status | Notes |
| :--- | :--- | :--- |
| **Delhi Corridor Waypoints & Checkpoints** | Real Geographic Coordinates | Exact latitude/longitude along CP, Ring Road, AIIMS |
| **AI/ML Regression Model** | Real Trained Scikit-Learn Model | GradientBoostingRegressor + RandomForest ensemble saved via Joblib |
| **Dual-Mode Simulator** | Fully Implemented | Works with WebSocket/REST or client-side fallback |
| **2-Stage Alert State Machine** | Fully Implemented | Strict 6-state progression (Approaching, Arrival, Passage) |
| **Traffic Police Console** | Fully Implemented | Interactive acknowledgement, preparedness, and escalation |
| **Text-to-Speech (TTS) PA** | Fully Implemented | Web Speech API real-time roadside announcements |
| **ESP32 Firmware Sketch** | Real C++ Code Provided | Compilable via Arduino IDE / PlatformIO |
| **Live Vehicle GPS Tracking** | Simulated Telemetry | High-fidelity simulated GPS progression with optional browser geolocation check |
| **Physical Signal Relay Operation** | Simulated / Advisory Only | Intentional safety design: physical relays require police SOP authorization |

---

## 🛡️ License & Safety Protocol
Developed for public demonstration and evaluation. All rights reserved. Emergency preemption logic is advisory and must never be coupled to high-voltage municipal relays without fail-safe hardware interlocks.
