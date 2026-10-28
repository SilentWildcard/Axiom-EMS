# AXIOM EMS — Smart City & Mobility Emergency Ambulance Coordination System

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=githubpages&logoColor=white)](https://silentwildcard.github.io/Axiom-EMS/)
[![GitHub Pages CI/CD](https://img.shields.io/github/actions/workflow/status/SilentWildcard/Axiom-EMS/deploy.yml?branch=main&label=Deploy%20Status&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/SilentWildcard/Axiom-EMS/actions/workflows/deploy.yml)
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](backend/)
[![React Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](frontend/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

### 🚨 **Operational Emergency Response & Traffic Synchronization Grid**
**AI/ML + IoT Roadside Infrastructure Coordination for Delhi Arterial Corridors**

</div>

---

## 🌐 Live Deployments & Links

| Target | Deployment Link | Platform | Description |
| :--- | :--- | :--- | :--- |
| **Production Web App** | [**https://silentwildcard.github.io/Axiom-EMS/**](https://silentwildcard.github.io/Axiom-EMS/) | GitHub Pages | Live interactive mission simulator & command desk (Zero installation needed) |
| **Frontend CI/CD** | [**GitHub Actions Workflow**](https://github.com/SilentWildcard/Axiom-EMS/actions/workflows/deploy.yml) | GitHub Actions | Automated build & deploy pipeline on push to `main` |
| **Backend API** | Ready for [Render](https://render.com) via `backend/render.yaml` | Render / Local | FastAPI microservice with telemetry WebSocket & simulation engine |

> 💡 **Instant Evaluation:** Click [**https://silentwildcard.github.io/Axiom-EMS/**](https://silentwildcard.github.io/Axiom-EMS/) to run the live simulation right in your browser. All route coords, siren audio, crowd prediction models, and IoT device states are fully synthesized client-side.

---

## 🌟 Key Capabilities & Innovative Features

- **🗺️ Delhi Arterial Corridor Simulation (Connaught Place to LNJP Hospital):**
  - Dynamic route tracing across Barakhamba, Mandi House, Tilak Marg, and ITO Chowk.
  - Interactive SVG map tracking ambulance telemetry, distance covered, speed, and real-time ETA.
- **🔊 Synthesized Electronic Siren Control:**
  - Browser-native Web Audio API dual-tone siren oscillator (700Hz–1100Hz sweep).
  - No external audio files or copyright dependencies.
- **📊 Real-Time Patient Vitals Monitor:**
  - Live telemetry dashboard tracking Heart Rate (HR), SpO2, Blood Pressure (SBP/DBP), and Respiratory Rate (RR) inside Ambulance AMB-042.
- **🧠 Predictive AI Crowd & Congestion Forecaster:**
  - Dynamic congestion prediction scoring for high-density junctions.
  - Advance alert trigger when ambulance is within preemption distance (<650m).
- **🚦 Green Wave Optimizer & Corridor Efficiency Score:**
  - Automated traffic signal preemption recommendations for Delhi Police traffic posts.
  - Real-time scoring out of 100 assessing clearance rate and response speed.
- **🚔 Traffic Police Desk & Radio Dispatch Log:**
  - Instant traffic police acknowledgement unit for emergency clearance.
  - Live police radio event log and field officer dispatch status.
- **📡 IoT Roadside Unit (RSU) Coordination:**
  - Real-time status for Traffic Signal Controllers, Roadside Sirens, and Vehicle GPS nodes.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | High-performance mission command UI & interactive SVG maps |
| **Audio Engine** | Web Audio API (Sawtooth oscillators) | Browser-synthesized emergency sirens and chimes |
| **Backend** | FastAPI, Python 3.11+, Pydantic, Uvicorn | Telemetry processing, mission endpoints & analytics |
| **Storage** | In-memory with seed fixtures | Rapid testing, isolated simulation states |
| **DevOps & CI/CD** | GitHub Actions, GitHub Pages, Vercel config | Continuous integration & static edge deployment |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ / 20+
- Python 3.10+

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Vite dev server
npm run dev
# -> Local app accessible at http://localhost:5173
```

### 3. Backend Setup (Optional for Full API Mode)
```bash
# Navigate to backend directory
cd backend

# Install python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
# -> API running at http://localhost:8000
# -> Interactive OpenAPI docs at http://localhost:8000/docs
```

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/missions` | Retrieve active emergency missions |
| `GET` | `/api/missions/{id}/checkpoints` | List ordered mission route checkpoints |
| `GET` | `/api/missions/{id}/eta` | Real-time distance and ETA calculations |
| `GET` | `/api/iot/devices` | Query connected IoT devices (RSUs, signals, beacons) |
| `GET` | `/api/iot/events` | Stream recent IoT roadside events |
| `GET` | `/api/simulation/state` | Current simulation status and progress |
| `POST`| `/api/simulation/start` | Start or resume simulation engine |
| `POST`| `/api/simulation/stop` | Pause active simulation |
| `POST`| `/api/simulation/advance` | Step ambulance forward to next checkpoint |
| `POST`| `/api/simulation/reset` | Reset corridor state to Connaught Place origin |
| `GET` | `/api/analytics` | Clearance efficiency & alert latency metrics |

---

## ☁️ Deployment Guide

### Option 1: GitHub Pages (Currently Active)
Deployment is fully automated using GitHub Actions (`.github/workflows/deploy.yml`):
- Whenever code is pushed to `main`, GitHub Actions installs dependencies, builds the Vite production bundle, copies `index.html` to `404.html` for SPA routing, and deploys directly to GitHub Pages.
- **Active URL:** `https://silentwildcard.github.io/Axiom-EMS/`

### Option 2: Vercel Deployment (One-Click)
The repository includes a ready-to-deploy root `vercel.json` configuration:
1. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select repository `SilentWildcard/Axiom-EMS`.
3. Click **Deploy**. Vercel will automatically build the frontend with SPA routing rewrites.

### Option 3: Backend Deployment (Render)
The repository includes `backend/render.yaml` for Render Web Service deployment:
1. Go to [Render](https://render.com) and select **New > Web Service**.
2. Connect `SilentWildcard/Axiom-EMS` and specify Root Directory `backend`.
3. Set build command `pip install -r requirements.txt` and start command `uvicorn main:app --host 0.0.0.0 --port $PORT`.

---

## 🔊 Audio & Autoplay Notice

The ambulance siren and notification chimes use the browser's native **Web Audio API** (custom frequency oscillators). No recorded media is fetched. Modern web browsers require a user interaction (such as clicking **"Resume / Start"** or activating the siren button) before web audio starts playing.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
