# AXIOM EMS — Smart City & Mobility Emergency Ambulance Coordination System

> **SIMULATION MODE** — No live GPS or traffic APIs required. All data is synthesized.

Demo Link : https://SilentWildcard.github.io/Axiom-EMS/

## Overview

AXIOM EMS is an AI/ML-powered full-stack ambulance coordination platform with:
- Real-time mission tracking and checkpoint management
- Synthesized electronic siren control (Web Audio API)
- IoT device monitoring (Traffic Light, Siren Unit, GPS Tracker)
- SVG-based route visualization (no external map API)
- Two-stage checkpoint alert workflow
- Police acknowledgement system
- Analytics dashboard

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| Backend | FastAPI + Python + Pydantic |
| Audio | Web Audio API (synthesized tones only) |
| Storage | In-memory (demo data seeded on startup) |

---

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

Or on PowerShell:
```powershell
cd backend
.\start.ps1
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## Environment Variables

### Frontend (`.env` in `frontend/`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend base URL | `http://localhost:8000` |

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `TINYFISH_API_KEY` | TinyFish AI integration | No |

---

## Project Structure

```
Axxiiom EMS/
├── frontend/               # React 18 + TypeScript + Tailwind
│   ├── src/
│   │   ├── api/            # API client, types, custom hooks
│   │   ├── components/     # UI components
│   │   │   ├── Alerts/     # SirenControl ← priority component
│   │   │   ├── Ambulance/  # Tracker, ETA, Checkpoints
│   │   │   ├── Analytics/  # SVG charts dashboard
│   │   │   ├── Dashboard/  # Mission header, status cards
│   │   │   ├── IoT/        # Device panel, event log
│   │   │   ├── Layout/     # Navbar, Sidebar
│   │   │   ├── Map/        # SVG simulation map
│   │   │   ├── Police/     # Acknowledgement panel
│   │   │   └── Simulation/ # Controls
│   │   ├── hooks/          # useAudio (Web Audio API siren)
│   │   ├── pages/          # Dashboard, Alerts, IoT, Analytics, Settings
│   │   └── utils/          # ETA, audio, formatters
│   └── vercel.json
└── backend/
    ├── main.py             # FastAPI app, all endpoints
    ├── requirements.txt
    ├── start.ps1
    ├── start.sh
    └── render.yaml
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/missions` | List missions |
| GET | `/api/missions/{id}` | Get mission |
| POST | `/api/missions` | Create mission |
| GET | `/api/missions/{id}/checkpoints` | List checkpoints |
| GET | `/api/missions/{id}/eta` | Calculate ETA (`d / (v/3.6)`) |
| GET | `/api/alert-config` | Get alert config |
| PUT | `/api/alert-config` | Update alert config |
| GET | `/api/alerts` | List alerts |
| POST | `/api/alerts` | Record alert event |
| GET | `/api/iot/devices` | List IoT devices |
| GET | `/api/iot/events` | IoT event log (last 50) |
| POST | `/api/iot/events` | Log IoT event |
| GET | `/api/simulation/state` | Simulation state |
| POST | `/api/simulation/start` | Start simulation |
| POST | `/api/simulation/stop` | Stop simulation |
| POST | `/api/simulation/advance` | Advance checkpoint |
| POST | `/api/simulation/reset` | Reset simulation |
| GET | `/api/analytics` | Analytics data |

---

## Deployment

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set `VITE_API_URL` env var to your backend URL
3. Deploy — `vercel.json` handles SPA routing

### Backend → Render

1. Connect GitHub repo to Render
2. Use `backend/render.yaml` for service config
3. Add `TINYFISH_API_KEY` secret if using TinyFish integration
4. Deploy — backend auto-starts on port `$PORT`

---

## Manual Steps Required

1. **GitHub**: `git push -u origin main` (authenticate with your GitHub credentials)

---

## Audio Note

The siren uses Web Audio API oscillators (sawtooth wave, 700–900 Hz sweep, 2.5 Hz rate). No recordings, no copyrighted audio. Browser autoplay policy may block audio until user interaction.

---

## License

MIT
