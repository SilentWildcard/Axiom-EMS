import React, { useState, useEffect, useRef, useCallback } from 'react';
import { STOPS, ROUTE_COORDS, TOTAL_KM, IOT_DEVICES, type Stop } from './data/delhiData';

// ─── AUDIO ─────────────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function playChime(freq1 = 800, freq2 = 1100) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq1, now);
    osc.frequency.linearRampToValueAtTime(freq2, now + 0.2);
    osc.frequency.linearRampToValueAtTime(freq1, now + 0.4);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.46);
  } catch { /* autoplay policy */ }
}

// ─── TYPES ─────────────────────────────────────────────────────────────────
type Tab = 'live' | 'police' | 'stops' | 'command' | 'controls';
type StopMut = Stop & { status: 'resolved' | 'pending'; light: 'green' | 'yellow' | 'red'; crowd: string };

interface Vitals { hr: number; spo2: number; sbp: number; dbp: number; rr: number; }
interface RadioMsg { id: string; time: string; from: string; msg: string; type: 'info' | 'warn' | 'alert' | 'ok'; }
interface Prediction { stopId: number; name: string; confidence: number; predictedCrowd: string; eta_s: number; }
interface PoliceUnit { id: string; name: string; location: string; status: 'available' | 'dispatched' | 'on-scene'; assignedStop?: number; }

// ─── HELPERS ───────────────────────────────────────────────────────────────
function interpolateRoute(frac: number): [number, number] {
  if (frac <= 0) return ROUTE_COORDS[0];
  if (frac >= 1) return ROUTE_COORDS[ROUTE_COORDS.length - 1];
  const seg = ROUTE_COORDS.length - 1;
  const exact = frac * seg;
  const idx = Math.floor(exact);
  const sub = exact - idx;
  const p1 = ROUTE_COORDS[idx], p2 = ROUTE_COORDS[Math.min(idx + 1, ROUTE_COORDS.length - 1)];
  return [p1[0] + (p2[0] - p1[0]) * sub, p1[1] + (p2[1] - p1[1]) * sub];
}

function etaStr(remainKm: number, spd: number) {
  const s = Math.round((remainKm / (spd || 40)) * 3600);
  return `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, '0')}s`;
}

function etaSec(remainKm: number, spd: number) {
  return Math.round((remainKm / (spd || 40)) * 3600);
}

function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

// ─── SECOND AMBULANCE DATA ─────────────────────────────────────────────────
const UNIT2_STOPS = [
  { id: 'u2-1', name: 'Lajpat Nagar Market', dist: 0.0, status: 'resolved' as const },
  { id: 'u2-2', name: 'Ring Road / Bhogal', dist: 1.2, status: 'resolved' as const },
  { id: 'u2-3', name: 'AIIMS Flyover', dist: 2.4, status: 'pending' as const },
  { id: 'u2-4', name: 'Safdarjung T-Point', dist: 3.6, status: 'pending' as const },
  { id: 'u2-5', name: 'Safdarjung Hospital Gate', dist: 4.5, status: 'resolved' as const },
];
const UNIT2_TOTAL = 4.5;

// ─── SVG ROUTE MAP ─────────────────────────────────────────────────────────
const DelhiRouteMap: React.FC<{ progress: number; stops: StopMut[]; greenWave: number[] }> = ({ progress, stops, greenWave }) => {
  const minLat = 28.618, maxLat = 28.645, minLng = 77.216, maxLng = 77.248;
  const W = 540, H = 240;
  const proj = (lat: number, lng: number): [number, number] => [
    ((lng - minLng) / (maxLng - minLng)) * W,
    H - ((lat - minLat) / (maxLat - minLat)) * H,
  ];
  const routePts = ROUTE_COORDS.map(([la, ln]) => proj(la, ln));
  const poly = routePts.map(([x, y]) => `${x},${y}`).join(' ');
  const seg = ROUTE_COORDS.length - 1;
  const exact = (progress / 100) * seg;
  const covIdx = Math.floor(exact);
  const [ambLa, ambLn] = interpolateRoute(progress / 100);
  const [ambX, ambY] = proj(ambLa, ambLn);
  const covPts = [...routePts.slice(0, covIdx + 1), [ambX, ambY]];
  const covPoly = covPts.map(([x, y]) => `${x},${y}`).join(' ');

  const col = (s: StopMut) =>
    s.status === 'pending' && s.crowd === 'Critical' ? '#ef4444'
    : s.status === 'pending' ? '#f59e0b' : '#10b981';

  return (
    <div style={{ background: '#090e17', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 6, right: 10, color: 'rgba(6,182,212,0.18)', fontSize: 9, fontWeight: 700, letterSpacing: 3, userSelect: 'none' }}>SIMULATION MODE</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Grid */}
        {[60, 120, 180].map(y => <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,6" />)}
        {/* Glow */}
        <polyline points={poly} fill="none" stroke="#06b6d4" strokeWidth="12" strokeOpacity="0.08" strokeLinecap="round" />
        {/* Base route */}
        <polyline points={poly} fill="none" stroke="#3b82f6" strokeWidth="3" strokeOpacity="0.6" strokeLinecap="round" strokeDasharray="7,5" />
        {/* Covered */}
        {covIdx > 0 && <polyline points={covPoly} fill="none" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />}

        {/* Green wave highlight */}
        {stops.map((s, i) => {
          if (!greenWave.includes(s.id)) return null;
          const [x, y] = proj(s.lat, s.lng);
          return (
            <circle key={`gw-${s.id}`} cx={x} cy={y} r={18} fill="none" stroke="#10b981" strokeWidth="2" strokeOpacity="0.5">
              <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* Stop markers */}
        {stops.map((s) => {
          const [x, y] = proj(s.lat, s.lng);
          const c = col(s);
          return (
            <g key={s.id}>
              {s.status === 'pending' && (
                <circle cx={x} cy={y} r={13} fill="none" stroke={c} strokeWidth="1.5" strokeOpacity="0.35">
                  <animate attributeName="r" values="11;18;11" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0;0.35" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={10} fill={c} stroke="#090e17" strokeWidth="2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">{s.id}</text>
              <text x={x} y={y + 22} textAnchor="middle" fontSize="8" fill="#64748b">{s.name.split(' ')[0].slice(0, 8)}</text>
            </g>
          );
        })}

        {/* Ambulance */}
        <g>
          <circle cx={ambX} cy={ambY} r={16} fill="#ef4444" fillOpacity="0.15">
            <animate attributeName="r" values="14;22;14" dur="0.9s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0;0.15" dur="0.9s" repeatCount="indefinite" />
          </circle>
          <circle cx={ambX} cy={ambY} r={10} fill="#ef4444" stroke="white" strokeWidth="2" />
          <text x={ambX} y={ambY + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">🚑</text>
          <text x={ambX} y={ambY - 15} textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="700">AMB-4402</text>
        </g>
      </svg>
      <div className="flex items-center gap-4 px-3 py-1.5 text-xs" style={{ color: '#64748b' }}>
        {[{ c: '#ef4444', l: 'Ambulance' }, { c: '#f59e0b', l: 'Pending' }, { c: '#10b981', l: 'Cleared' }, { c: '#10b981', l: '🟢 Green Wave' }].map(({ c, l }) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} /><span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── VITALS SPARKLINE ──────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string; min: number; max: number }> = ({ data, color, min, max }) => {
  const W = 80, H = 28;
  if (data.length < 2) return null;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * H;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>('live');
  const [stops, setStops] = useState<StopMut[]>(STOPS.map(s => ({ ...s })));
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [step, setStep] = useState(0);
  const [localSound, setLocalSound] = useState(true);
  const [policeFilter, setPoliceFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [critBanner, setCritBanner] = useState<{ show: boolean; name: string; dist: string }>({ show: false, name: '', dist: '' });
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: 'info' | 'warn' | 'ok' }>>([]);

  // ── INNOVATIVE STATE ────────────────────────────────────────────────────
  // 1. Patient Vitals
  const [vitals, setVitals] = useState<Vitals>({ hr: 104, spo2: 96, sbp: 158, dbp: 94, rr: 20 });
  const [hrHistory, setHrHistory] = useState<number[]>([104, 106, 103, 108, 105]);
  const [spo2History, setSpo2History] = useState<number[]>([96, 95, 96, 97, 96]);
  const [vitalsAlert, setVitalsAlert] = useState(false);

  // 2. AI Crowd Predictions
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  // 3. Green Wave Optimizer
  const [greenWave, setGreenWave] = useState<number[]>([1, 2]); // stop IDs pre-cleared
  const [greenWaveCountdowns, setGreenWaveCountdowns] = useState<Record<number, number>>({});

  // 4. Efficiency Score
  const [efficiency, setEfficiency] = useState({ total: 82, stopsCleared: 28, timeSaved: 22, vitalStability: 18, alertEffectiveness: 9, routeAdherence: 5 });

  // 5. Police Units
  const [policeUnits, setPoliceUnits] = useState<PoliceUnit[]>([
    { id: 'DTP-01', name: 'PCR Van — Connaught Place', location: 'CP Inner Circle', status: 'available' },
    { id: 'DTP-02', name: 'Traffic Unit — Mandi House', location: 'Mandi House Chowk', status: 'dispatched', assignedStop: 3 },
    { id: 'DTP-03', name: 'Rapid Response — ITO', location: 'ITO Vikas Marg', status: 'on-scene', assignedStop: 5 },
    { id: 'DTP-04', name: 'PCR Van — Delhi Gate', location: 'Delhi Gate', status: 'available' },
  ]);

  // 6. Radio Log
  const [radioLog, setRadioLog] = useState<RadioMsg[]>([
    { id: '1', time: now(), from: 'DISPATCH', msg: 'Unit DL-01-EMS-4402 en route — Critical Cardiac, LNJP Hospital. All units on alert.', type: 'alert' },
    { id: '2', time: now(), from: 'DTP-02', msg: 'Mandi House Roundabout — heavy crowd observed. Requesting clearance protocol.', type: 'warn' },
    { id: '3', time: now(), from: 'IOT-ITO-05', msg: 'ITO Chowk sensor: 94 vehicles queued. Crowd density CRITICAL.', type: 'alert' },
  ]);

  // 7. Unit 2 (second ambulance)
  const [unit2Step, setUnit2Step] = useState(30);
  const [unit2Simulating, setUnit2Simulating] = useState(true);

  // ── REFS ────────────────────────────────────────────────────────────────
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vitalsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unit2Ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const critAlertFired = useRef(false);

  const TOTAL_STEPS = 240;

  // ── DERIVED ─────────────────────────────────────────────────────────────
  const fraction = step / TOTAL_STEPS;
  const coveredKm = parseFloat((fraction * TOTAL_KM).toFixed(2));
  const remainingKm = Math.max(0, TOTAL_KM - coveredKm);
  const progress = Math.min(100, Math.round(fraction * 100));
  const nextStop = stops.find(s => s.distFromStart >= coveredKm - 0.1);
  const isCriticalAhead = nextStop?.status === 'pending' && nextStop?.crowd === 'Critical';
  const currentSpeed = isCriticalAhead
    ? (Math.max(0, nextStop!.distFromStart - coveredKm) < 0.4 ? 28 : 52) : 64;

  const unit2Frac = unit2Step / TOTAL_STEPS;
  const unit2CovKm = parseFloat((unit2Frac * UNIT2_TOTAL).toFixed(2));
  const unit2Remain = Math.max(0, UNIT2_TOTAL - unit2CovKm);
  const unit2Progress = Math.min(100, Math.round(unit2Frac * 100));

  // ── TOAST ───────────────────────────────────────────────────────────────
  const addToast = useCallback((msg: string, type: 'info' | 'warn' | 'ok' = 'info') => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, msg, type }].slice(-4));
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const addRadio = useCallback((from: string, msg: string, type: RadioMsg['type'] = 'info') => {
    setRadioLog(p => [{ id: Date.now().toString(), time: now(), from, msg, type }, ...p].slice(0, 30));
  }, []);

  // ── SIMULATION TICK ─────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setStep(prev => {
      const next = prev + simSpeed;
      return next > TOTAL_STEPS ? 0 : next;
    });
  }, [simSpeed]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isSimulating) intervalRef.current = setInterval(tick, 200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isSimulating, tick]);

  // Unit 2 tick
  useEffect(() => {
    if (unit2Ref.current) clearInterval(unit2Ref.current);
    if (unit2Simulating) unit2Ref.current = setInterval(() => {
      setUnit2Step(p => Math.min(p + 0.5, TOTAL_STEPS));
    }, 200);
    return () => { if (unit2Ref.current) clearInterval(unit2Ref.current); };
  }, [unit2Simulating]);

  // ── PATIENT VITALS SIMULATION ───────────────────────────────────────────
  useEffect(() => {
    vitalsRef.current = setInterval(() => {
      setVitals(prev => {
        const stress = isCriticalAhead ? 1.15 : 1.0;
        const hr = Math.round(Math.max(72, Math.min(148, prev.hr + (Math.random() - 0.48) * 4 * stress)));
        const spo2 = Math.round(Math.max(89, Math.min(99, prev.spo2 + (Math.random() - 0.5) * 1.2)));
        const sbp = Math.round(Math.max(130, Math.min(185, prev.sbp + (Math.random() - 0.5) * 3)));
        const dbp = Math.round(Math.max(78, Math.min(115, prev.dbp + (Math.random() - 0.5) * 2)));
        const rr = Math.round(Math.max(14, Math.min(30, prev.rr + (Math.random() - 0.5) * 1.5)));
        const critical = hr > 138 || spo2 < 92;
        setVitalsAlert(critical);
        if (critical) { playChime(600, 900); addToast('⚠️ Patient vitals critical — HR or SpO2 threshold breached', 'warn'); }
        setHrHistory(h => [...h.slice(-19), hr]);
        setSpo2History(h => [...h.slice(-19), spo2]);
        return { hr, spo2, sbp, dbp, rr };
      });
    }, 1800);
    return () => { if (vitalsRef.current) clearInterval(vitalsRef.current); };
  }, [isCriticalAhead, addToast]);

  // ── CRITICAL BANNER + RADIO ─────────────────────────────────────────────
  useEffect(() => {
    const crit = stops.find(s =>
      s.crowd === 'Critical' && s.status === 'pending' &&
      (s.distFromStart - coveredKm) > 0 && (s.distFromStart - coveredKm) <= 2.2
    );
    if (crit) {
      const dist = (crit.distFromStart - coveredKm).toFixed(1);
      setCritBanner({ show: true, name: crit.name, dist });
      if (!critAlertFired.current) {
        critAlertFired.current = true;
        playChime();
        addRadio('AI-ENGINE', `ADVANCE ALERT: Critical crowd predicted at ${crit.name} — ${dist} km ahead. Auto-dispatching DTP units.`, 'alert');
      }
    } else {
      setCritBanner(b => ({ ...b, show: false }));
      critAlertFired.current = false;
    }
  }, [coveredKm, stops, addRadio]);

  // ── AI CROWD PREDICTIONS ────────────────────────────────────────────────
  useEffect(() => {
    const upcoming = stops.filter(s => s.distFromStart > coveredKm + 0.2 && s.status !== 'resolved');
    const preds: Prediction[] = upcoming.map(s => {
      const distAhead = s.distFromStart - coveredKm;
      const eta = etaSec(distAhead, currentSpeed);
      // AI logic: time-of-day weight (rush hour 8–10am, 5–8pm) + crowd history
      const timeHour = new Date().getHours();
      const rushHour = (timeHour >= 8 && timeHour <= 10) || (timeHour >= 17 && timeHour <= 20);
      const baseConf = s.crowd === 'Critical' ? 88 : s.crowd === 'Heavy' ? 67 : 34;
      const conf = Math.min(97, baseConf + (rushHour ? 8 : 0) + Math.round(Math.random() * 6));
      return { stopId: s.id, name: s.name, confidence: conf, predictedCrowd: s.crowd === 'Normal' && conf > 50 ? 'Heavy' : s.crowd, eta_s: eta };
    });
    setPredictions(preds);
  }, [coveredKm, stops, currentSpeed]);

  // ── GREEN WAVE OPTIMIZER ────────────────────────────────────────────────
  useEffect(() => {
    // Pre-clear all stops the ambulance has passed, plus next resolved ones
    const cleared = stops.filter(s => s.status === 'resolved' || s.distFromStart < coveredKm).map(s => s.id);
    setGreenWave(cleared);
    // Countdown for upcoming stops
    const upcoming = stops.filter(s => s.distFromStart > coveredKm);
    const cds: Record<number, number> = {};
    upcoming.forEach(s => {
      const dist = s.distFromStart - coveredKm;
      const secs = etaSec(dist, currentSpeed);
      cds[s.id] = Math.max(0, secs - 15); // pre-clear 15s before arrival
    });
    setGreenWaveCountdowns(cds);
  }, [coveredKm, stops, currentSpeed]);

  // ── EFFICIENCY SCORE ────────────────────────────────────────────────────
  useEffect(() => {
    const totalStops = stops.length;
    const cleared = stops.filter(s => s.status === 'resolved').length;
    const stopsScore = Math.round((cleared / totalStops) * 30);
    const timeSavedKm = coveredKm;
    const timeSavedScore = Math.min(25, Math.round(timeSavedKm * 5));
    const vitalScore = vitalsAlert ? 12 : 20;
    const alertScore = predictions.filter(p => p.confidence > 70).length > 0 ? 14 : 9;
    const routeScore = isSimulating ? 10 : 7;
    const total = stopsScore + timeSavedScore + vitalScore + alertScore + routeScore;
    setEfficiency({ total, stopsCleared: stopsScore, timeSaved: timeSavedScore, vitalStability: vitalScore, alertEffectiveness: alertScore, routeAdherence: routeScore });
  }, [stops, coveredKm, vitalsAlert, predictions, isSimulating]);

  // ── ACTIONS ─────────────────────────────────────────────────────────────
  const resolveStop = useCallback((id: number) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, status: 'resolved', light: 'green', crowd: s.crowd === 'Critical' ? 'Normal' : s.crowd } : s));
    const stopName = stops.find(s => s.id === id)?.name ?? '';
    addToast(`✅ Corridor cleared: ${stopName}`, 'ok');
    addRadio('DISPATCH', `Corridor cleared at ${stopName}. Green signal activated. EMS proceeding.`, 'ok');
    playChime(600, 900);
  }, [stops, addToast, addRadio]);

  const injectCrowd = (stopId: number) => {
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, status: 'pending', light: stopId === 5 ? 'red' : 'yellow', crowd: stopId === 5 ? 'Critical' : 'Heavy' } : s));
    addRadio('IOT-SENSOR', `Critical crowd injected at stop #${stopId}. Police intervention required!`, 'alert');
    playChime();
    addToast(`⚠️ Traffic jam injected at stop #${stopId}`, 'warn');
  };

  const resolveAll = () => {
    setStops(prev => prev.map(s => ({ ...s, status: 'resolved', light: 'green', crowd: 'Normal' })));
    addToast('🟢 Full green wave active — all corridors cleared!', 'ok');
    addRadio('DISPATCH', 'All corridor checkpoints resolved. GREEN WAVE active across full Delhi route!', 'ok');
    playChime(700, 1000);
  };

  const resetAll = () => { setStops(STOPS.map(s => ({ ...s }))); setStep(0); addToast('Simulation restarted from Connaught Place.', 'info'); };

  const dispatchUnit = (unitId: string, stopId: number) => {
    setPoliceUnits(prev => prev.map(u => u.id === unitId ? { ...u, status: 'dispatched', assignedStop: stopId } : u));
    const stopName = stops.find(s => s.id === stopId)?.name ?? '';
    addRadio(unitId, `Dispatched to ${stopName}. ETA 90 seconds. Activating sirens.`, 'info');
    addToast(`🚔 ${unitId} dispatched to ${stopName}`, 'info');
    playChime(500, 700);
  };

  const pendingCount = stops.filter(s => s.status === 'pending').length;

  // ── NAV ITEMS ────────────────────────────────────────────────────────────
  const navItems: Array<{ id: Tab; icon: string; label: string; badge: string; badgeCls: string }> = [
    { id: 'live',     icon: '📍', label: 'Live Route & Map',       badge: 'ACTIVE',                       badgeCls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    { id: 'police',   icon: '🛡️', label: 'Police Action Desk',     badge: pendingCount > 0 ? `${pendingCount} PENDING` : 'ALL CLEAR', badgeCls: pendingCount > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400' },
    { id: 'stops',    icon: '🚦', label: 'Red Light Stops',        badge: '6 STOPS',                      badgeCls: 'bg-slate-800 text-slate-400' },
    { id: 'command',  icon: '🧠', label: 'AI Command Centre',      badge: 'NEW',                          badgeCls: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
    { id: 'controls', icon: '🎛️', label: 'Corridor Simulator',     badge: 'DEMO',                        badgeCls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
  ];

  const scoreColor = efficiency.total >= 80 ? '#10b981' : efficiency.total >= 55 ? '#f59e0b' : '#ef4444';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col select-none font-mono-num" style={{ background: '#070d18', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── CRITICAL BANNER ──────────────────────────────────────── */}
      {critBanner.show && (
        <div className="banner-enter flex items-center justify-between px-4 py-2.5 text-white z-50 border-b-2 border-red-500 shrink-0"
          style={{ background: 'linear-gradient(to right, #450a0a, #7f1d1d, #451a03)' }}>
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-red-600 rounded-full animate-ping text-xs">⚠️</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-black bg-red-600 rounded text-white uppercase tracking-widest animate-pulse">AI ALERT — CRITICAL CROWD</span>
                <span className="font-bold text-sm">Advance congestion at <strong className="underline">{critBanner.name}</strong> ({critBanner.dist} km ahead)</span>
              </div>
              <p className="text-xs text-red-200 mt-0.5">AI Prediction Engine triggered — police dispatch recommended immediately.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setTab('police')} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs flex items-center gap-1.5">🛡️ Dispatch Police</button>
            <button onClick={() => setCritBanner(b => ({ ...b, show: false }))} className="text-red-300 hover:text-white px-2">✕</button>
          </div>
        </div>
      )}

      {/* ── VITALS CRITICAL BANNER ───────────────────────────────── */}
      {vitalsAlert && (
        <div className="flex items-center justify-between px-4 py-1.5 shrink-0 border-b border-red-900"
          style={{ background: 'rgba(127,0,0,0.4)' }}>
          <span className="text-xs font-bold text-red-400 animate-pulse">❤️ PATIENT VITALS CRITICAL — HR: {vitals.hr} bpm | SpO₂: {vitals.spo2}%</span>
          <span className="text-[10px] text-red-300">Notify LNJP ER team immediately</span>
        </div>
      )}

      {/* ── MAIN LAYOUT ─────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── SIDEBAR ──────────────────────────────────────────── */}
        <aside className="w-64 flex flex-col border-r shrink-0" style={{ background: '#0b1323', borderColor: 'rgba(30,41,59,0.8)' }}>

          {/* Logo */}
          <div className="p-4 border-b shrink-0" style={{ borderColor: '#1e293b', background: 'rgba(7,13,24,0.7)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg border"
                style={{ background: 'linear-gradient(135deg,#dc2626,#1d4ed8)', borderColor: '#334155' }}>
                <span className="text-lg animate-pulse">🚨</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm tracking-widest text-white">AXIOM EMS</h1>
                  <span className="text-[10px] font-bold px-1.5 rounded" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.4)' }}>DELHI</span>
                </div>
                <p className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>AI Emergency Corridor Control</p>
              </div>
            </div>
            {/* Station badge */}
            <div className="mt-3 p-2 rounded-md flex items-center justify-between text-xs" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #1e293b' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-slate-300">Central Traffic Desk</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-num" style={{ background: '#1e293b', color: '#94a3b8' }}>NET-ON</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="p-3 space-y-1 shrink-0">
            <p className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>Navigation</p>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={tab === item.id
                  ? { background: '#2563eb', color: 'white', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }
                  : { color: '#cbd5e1', background: 'transparent' }}
                onMouseEnter={e => { if (tab !== item.id) (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.6)'; }}
                onMouseLeave={e => { if (tab !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <div className="flex items-center gap-2"><span>{item.icon}</span><span>{item.label}</span></div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeCls}`}>{item.badge}</span>
              </button>
            ))}
          </nav>

          {/* Mission card */}
          <div className="mx-3 mt-1 p-3 rounded-lg shrink-0" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid #1e293b' }}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">Active Emergency</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black animate-pulse" style={{ background: 'rgba(220,38,38,0.3)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>PRIORITY 1</span>
            </div>
            <div className="space-y-1 text-[11px]">
              {[['Ambulance', 'DL-01-EMS-4402', '#e2e8f0'], ['Patient', 'Critical Cardiac', '#f87171'], ['Dest.', 'LNJP Hospital', '#93c5fd']].map(([k, v, c]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500">{k}:</span>
                  <span className="font-bold font-mono-num" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
            {/* Progress */}
            <div className="mt-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-400">Route Progress</span>
                <span className="font-bold font-mono-num" style={{ color: '#34d399' }}>{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(to right,#3b82f6,#06b6d4,#10b981)' }} />
              </div>
            </div>
          </div>

          {/* Green Wave mini strip */}
          <div className="mx-3 mt-2 p-2 rounded-lg shrink-0" style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid #1e293b' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#10b981' }}>🟢 Green Wave Status</p>
            <div className="space-y-1">
              {stops.slice(0, 4).map(s => {
                const cd = greenWaveCountdowns[s.id];
                const isGreen = greenWave.includes(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between text-[10px]">
                    <span className="truncate" style={{ color: isGreen ? '#34d399' : '#94a3b8', maxWidth: 110 }}>{s.name.split(' ')[0]}</span>
                    <span className="font-mono-num font-bold" style={{ color: isGreen ? '#34d399' : cd !== undefined && cd < 30 ? '#f59e0b' : '#64748b' }}>
                      {isGreen ? '🟢' : cd !== undefined ? `${cd}s` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-auto p-3 border-t space-y-2 shrink-0" style={{ borderColor: '#1e293b', background: 'rgba(7,13,24,0.6)' }}>
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span>🔊 Police Siren</span>
              <button onClick={() => { soundEnabled = !soundEnabled; setLocalSound(p => !p); }}
                className="px-2 py-0.5 text-[11px] font-semibold rounded"
                style={{ background: '#1e293b', border: '1px solid #334155', color: localSound ? '#34d399' : '#64748b' }}>
                {localSound ? 'ON' : 'OFF'}
              </button>
            </div>
            <button onClick={() => setIsSimulating(p => !p)}
              className="w-full py-2 px-3 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all"
              style={{ background: isSimulating ? '#059669' : '#2563eb' }}>
              {isSimulating ? '⏸ Pause Simulation' : '▶ Resume Simulation'}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#070d18' }}>

          {/* ── TAB 1: LIVE ROUTE & MAP ──────────────────────── */}
          {tab === 'live' && (
            <div className="flex-1 flex flex-col p-4 gap-4">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '⚡', label: 'Current Speed', value: `${currentSpeed}`, unit: 'km/h', col: '#3b82f6' },
                  { icon: '🧭', label: 'Distance Left', value: remainingKm.toFixed(1), unit: 'km', col: '#06b6d4' },
                  { icon: '⏱️', label: 'ETA to LNJP', value: etaStr(remainingKm, currentSpeed), unit: '', col: '#10b981' },
                  { icon: '🧠', label: 'AI Efficiency Score', value: `${efficiency.total}`, unit: '/100', col: scoreColor },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-lg flex items-center gap-3" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                    <div className="p-2.5 rounded-lg shrink-0" style={{ background: `${s.col}18`, border: `1px solid ${s.col}30` }}>
                      <span className="text-base">{s.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-white font-mono-num">{s.value}</span>
                        {s.unit && <span className="text-xs text-slate-400">{s.unit}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map + Panels */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[420px]">
                {/* Map */}
                <div className="lg:col-span-2 rounded-xl overflow-hidden flex flex-col" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                  <div className="p-3 flex items-center justify-between border-b shrink-0" style={{ borderColor: '#1e293b' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">CP → Barakhamba → Mandi House → ITO → LNJP</span>
                    </div>
                    <span className="text-[10px] text-slate-400">6 IoT Checkpoints</span>
                  </div>
                  <div className="flex-1 p-3">
                    <DelhiRouteMap progress={progress} stops={stops} greenWave={greenWave} />
                  </div>
                </div>

                {/* Right panel: stops + patient vitals */}
                <div className="flex flex-col gap-3">
                  {/* Patient Vitals — INNOVATIVE FEATURE */}
                  <div className="rounded-xl p-3" style={{ background: '#0b1323', border: `1px solid ${vitalsAlert ? 'rgba(239,68,68,0.6)' : '#1e293b'}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">❤️ Patient Vitals Monitor</span>
                      {vitalsAlert
                        ? <span className="text-[10px] font-black px-1.5 py-0.5 rounded animate-pulse" style={{ background: 'rgba(239,68,68,0.3)', color: '#f87171', border: '1px solid rgba(239,68,68,0.5)' }}>CRITICAL</span>
                        : <span className="text-[10px] font-bold" style={{ color: '#10b981' }}>STABLE</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {[
                        { label: 'Heart Rate', value: `${vitals.hr}`, unit: 'bpm', alert: vitals.hr > 138, data: hrHistory, min: 60, max: 160, color: '#ef4444' },
                        { label: 'SpO₂', value: `${vitals.spo2}`, unit: '%', alert: vitals.spo2 < 92, data: spo2History, min: 85, max: 100, color: '#06b6d4' },
                        { label: 'BP Systolic', value: `${vitals.sbp}`, unit: 'mmHg', alert: vitals.sbp > 175, data: [], min: 0, max: 0, color: '#f59e0b' },
                        { label: 'Resp. Rate', value: `${vitals.rr}`, unit: '/min', alert: vitals.rr > 26, data: [], min: 0, max: 0, color: '#a78bfa' },
                      ].map(v => (
                        <div key={v.label} className="p-2 rounded" style={{ background: 'rgba(15,23,42,0.8)', border: `1px solid ${v.alert ? 'rgba(239,68,68,0.4)' : '#1e293b'}` }}>
                          <p className="text-[10px] text-slate-500 uppercase">{v.label}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-black font-mono-num" style={{ color: v.alert ? '#ef4444' : v.color, fontSize: 15 }}>{v.value}</span>
                            <span className="text-[9px] text-slate-500">{v.unit}</span>
                          </div>
                          {v.data.length > 2 && <Sparkline data={v.data} color={v.color} min={v.min} max={v.max} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stops timeline */}
                  <div className="flex-1 rounded-xl p-3 overflow-y-auto" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                    <div className="flex items-center justify-between pb-2 border-b mb-2" style={{ borderColor: '#1e293b' }}>
                      <span className="text-xs font-bold text-white">Route Stops</span>
                      <span className="text-[10px] text-slate-400 font-mono-num">{stops.filter(s => s.status === 'resolved').length}/{stops.length} cleared</span>
                    </div>
                    <div className="space-y-1.5">
                      {stops.map(s => {
                        const passed = s.distFromStart < coveredKm - 0.15;
                        const isCurr = Math.abs(s.distFromStart - coveredKm) <= 0.25;
                        const dotCls = passed ? 'bg-slate-600' : s.status === 'pending' ? (s.crowd === 'Critical' ? 'bg-red-500 animate-ping' : 'bg-amber-400 animate-pulse') : 'bg-emerald-500';
                        return (
                          <div key={s.id} className="flex items-center justify-between p-2 rounded-lg text-[11px]"
                            style={{ background: isCurr ? 'rgba(30,41,59,0.9)' : 'rgba(15,23,42,0.6)', border: `1px solid ${isCurr ? 'rgba(59,130,246,0.5)' : 'rgba(30,41,59,0.7)'}` }}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${dotCls}`} />
                              <span className="truncate font-medium" style={{ color: isCurr ? '#93c5fd' : '#e2e8f0' }}>{s.id}. {s.name}</span>
                            </div>
                            <span className="shrink-0 ml-1 font-mono-num" style={{ color: s.status === 'resolved' ? '#34d399' : s.crowd === 'Critical' ? '#f87171' : '#fcd34d', fontSize: 10 }}>
                              {passed ? 'Passed' : s.status === 'resolved' ? 'Clear' : s.crowd === 'Critical' ? 'CRIT' : 'PEND'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {stops.some(s => s.status === 'pending') && (
                      <button onClick={() => { const s = stops.find(x => x.status === 'pending'); if (s) resolveStop(s.id); }}
                        className="w-full mt-2 py-1.5 text-white rounded text-xs font-bold hover:opacity-90 transition-all"
                        style={{ background: '#059669' }}>✓ Clear Next Stop</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: POLICE ACTION DESK ─────────────────────── */}
          {tab === 'police' && (
            <div className="flex-1 flex flex-col p-5 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2" style={{ borderColor: '#1e293b' }}>
                <div>
                  <h2 className="text-xl font-extrabold text-white">🛡️ Traffic Police Clearance Desk</h2>
                  <p className="text-xs mt-0.5 text-slate-400">Direct police intervention — turn signals green, disperse crowds ahead of emergency vehicle.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => injectCrowd(5)} className="px-3 py-1.5 text-white text-xs font-bold rounded hover:opacity-90" style={{ background: '#d97706' }}>⚡ Simulate Crowd</button>
                  <button onClick={resolveAll} className="px-3 py-1.5 text-white text-xs font-bold rounded hover:opacity-90" style={{ background: '#059669' }}>🟢 Clear All</button>
                </div>
              </div>

              {/* Police Units — INNOVATIVE FEATURE */}
              <div className="rounded-xl p-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                <h3 className="text-sm font-bold text-white mb-3">🚔 Police Unit Deployment</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {policeUnits.map(u => {
                    const pendingStop = stops.find(s => s.status === 'pending');
                    return (
                      <div key={u.id} className="p-3 rounded-lg text-xs" style={{ background: 'rgba(15,23,42,0.8)', border: `1px solid ${u.status === 'on-scene' ? 'rgba(16,185,129,0.4)' : u.status === 'dispatched' ? 'rgba(245,158,11,0.4)' : '#1e293b'}` }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono-num font-black text-white">{u.id}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: u.status === 'on-scene' ? 'rgba(16,185,129,0.2)' : u.status === 'dispatched' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)', color: u.status === 'on-scene' ? '#34d399' : u.status === 'dispatched' ? '#fcd34d' : '#a78bfa' }}>
                            {u.status === 'on-scene' ? '● ON SCENE' : u.status === 'dispatched' ? '→ DISPATCHED' : '○ AVAILABLE'}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-tight">{u.name}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{u.location}</p>
                        {u.status === 'available' && pendingStop && (
                          <button onClick={() => dispatchUnit(u.id, pendingStop.id)}
                            className="w-full mt-2 py-1 text-white rounded text-[10px] font-bold hover:opacity-90"
                            style={{ background: '#2563eb' }}>Dispatch →</button>
                        )}
                        {u.status === 'dispatched' && u.assignedStop && (
                          <button onClick={() => { resolveStop(u.assignedStop!); setPoliceUnits(prev => prev.map(x => x.id === u.id ? { ...x, status: 'on-scene' } : x)); }}
                            className="w-full mt-2 py-1 text-white rounded text-[10px] font-bold hover:opacity-90"
                            style={{ background: '#059669' }}>✓ Confirm Cleared</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex gap-3 text-xs">
                {(['all', 'pending', 'resolved'] as const).map(f => (
                  <button key={f} onClick={() => setPoliceFilter(f)} className="px-3 py-1 rounded font-bold"
                    style={policeFilter === f ? { background: '#2563eb', color: 'white' } : { background: '#1e293b', color: '#94a3b8' }}>
                    {f === 'all' ? `All (${stops.length})` : f === 'pending' ? `Pending (${stops.filter(s => s.status === 'pending').length})` : `Cleared (${stops.filter(s => s.status === 'resolved').length})`}
                  </button>
                ))}
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stops.filter(s => policeFilter === 'all' ? true : s.status === policeFilter).map(stop => (
                  <div key={stop.id} className="rounded-xl p-4 flex flex-col gap-3"
                    style={{ background: '#0b1323', border: `1px solid ${stop.status === 'pending' ? (stop.crowd === 'Critical' ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.4)') : 'rgba(16,185,129,0.25)'}` }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ background: stop.status === 'pending' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: stop.status === 'pending' ? '#f87171' : '#34d399' }}>
                          {stop.status === 'pending' ? 'ACTION: PENDING' : 'ACTION: RESOLVED'}
                        </span>
                        <h4 className="font-extrabold text-white mt-1.5">{stop.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{stop.description}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${stop.light === 'green' ? 'bg-emerald-500' : stop.light === 'yellow' ? 'bg-amber-400' : 'bg-red-500'} ${stop.status === 'pending' ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg text-xs" style={{ background: 'rgba(15,23,42,0.8)' }}>
                      {[['Crowd', stop.crowd, stop.crowd === 'Critical' ? '#f87171' : stop.crowd === 'Heavy' ? '#fcd34d' : '#34d399'],
                        ['Signal', stop.light.toUpperCase(), stop.light === 'green' ? '#34d399' : stop.light === 'yellow' ? '#fcd34d' : '#f87171'],
                        ['Distance', `${stop.distFromStart} km`, '#e2e8f0'],
                        ['IoT Unit', stop.iotDevice, '#94a3b8']
                      ].map(([k, v, c]) => (
                        <div key={k}>
                          <span className="text-[10px] text-slate-500 uppercase block">{k}</span>
                          <span className="font-bold text-[11px] font-mono-num" style={{ color: c as string }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    {stop.status === 'pending'
                      ? <button onClick={() => resolveStop(stop.id)} className="w-full py-2.5 text-white rounded-lg font-bold text-xs hover:opacity-90 transition-all" style={{ background: '#059669' }}>✓ CLEAR CORRIDOR & TURN SIGNAL GREEN</button>
                      : <div className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-between px-3" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                          <span>🛡️ Corridor Cleared by Police</span>
                          <button onClick={() => setStops(prev => prev.map(s => s.id === stop.id ? { ...s, status: 'pending', light: 'red', crowd: 'Critical' } : s))} className="text-[10px] text-slate-400 hover:text-red-400 underline">Re-open</button>
                        </div>
                    }
                  </div>
                ))}
              </div>

              {/* SOP */}
              <div className="p-4 rounded-xl" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-300">📖 Delhi Traffic Police SOP</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
                  {[['1. Advance Notice (2 km out)', 'AI Prediction Engine flags critical stops 90s before ambulance arrival. Alert fires automatically.'],
                    ['2. Traffic Clearance', 'Duty officer presses "Clear Corridor". Signals turn Green, cross-traffic held by police unit.'],
                    ['3. Status: RESOLVED', 'Crowd disperses before arrival. Zero stops — full non-stop transit for patient.']
                  ].map(([t, b]) => (
                    <div key={t} className="p-2.5 rounded" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b' }}>
                      <p className="font-bold text-white mb-1">{t}</p><p>{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: RED LIGHT STOPS ────────────────────────── */}
          {tab === 'stops' && (
            <div className="flex-1 flex flex-col p-5 gap-4">
              <div className="pb-3 border-b" style={{ borderColor: '#1e293b' }}>
                <h2 className="text-xl font-extrabold text-white">🚦 Delhi Red Light Stops & IoT Checkpoint Units</h2>
                <p className="text-xs mt-0.5 text-slate-400">Live monitoring of roadside IoT controllers, speaker units, and signal states along the corridor.</p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[10px] font-bold uppercase border-b text-slate-400" style={{ background: 'rgba(7,13,24,0.9)', borderColor: '#1e293b' }}>
                      <tr>{['Stop#', 'Intersection', 'Crowd', 'Signal', 'Status', 'Distance', 'IoT Unit', 'Action'].map(h => <th key={h} className="p-3">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {stops.map(s => (
                        <tr key={s.id} className="border-b hover:bg-slate-900/30 transition-colors" style={{ borderColor: 'rgba(30,41,59,0.5)' }}>
                          <td className="p-3 font-mono-num font-black text-white">#{s.id}</td>
                          <td className="p-3"><p className="font-semibold text-white">{s.name}</p><p className="text-[10px] text-slate-500 mt-0.5">{s.description}</p></td>
                          <td className="p-3"><span className="font-bold px-2 py-0.5 rounded text-[10px]" style={{ background: s.crowd === 'Critical' ? 'rgba(239,68,68,0.2)' : s.crowd === 'Heavy' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: s.crowd === 'Critical' ? '#f87171' : s.crowd === 'Heavy' ? '#fcd34d' : '#34d399' }}>{s.crowd}</span></td>
                          <td className="p-3 font-bold font-mono-num" style={{ color: s.light === 'green' ? '#34d399' : s.light === 'yellow' ? '#fcd34d' : '#f87171' }}>{s.light === 'green' ? '🟢' : s.light === 'yellow' ? '🟡' : '🔴'} {s.light.toUpperCase()}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: s.status === 'pending' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: s.status === 'pending' ? '#f87171' : '#34d399' }}>{s.status === 'pending' ? '⚠ PENDING' : '✓ RESOLVED'}</span></td>
                          <td className="p-3 font-mono-num text-slate-300">{s.distFromStart} km</td>
                          <td className="p-3 font-mono-num text-slate-400 text-[10px]">{s.iotDevice}</td>
                          <td className="p-3">{s.status === 'pending' ? <button onClick={() => resolveStop(s.id)} className="px-2.5 py-1.5 text-white rounded font-bold text-[10px] hover:opacity-90" style={{ background: '#059669' }}>Clear →</button> : <span className="text-[11px] text-emerald-400">Cleared</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: AI COMMAND CENTRE — INNOVATIVE ────────── */}
          {tab === 'command' && (
            <div className="flex-1 flex flex-col p-5 gap-4">
              <div className="pb-3 border-b" style={{ borderColor: '#1e293b' }}>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">🧠 AI Command Centre <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>EXPERIMENTAL</span></h2>
                <p className="text-xs mt-0.5 text-slate-400">AI Crowd Prediction • Corridor Efficiency Score • Multi-Unit Tracking • Emergency Radio Log</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Column 1: Efficiency Score + AI Predictions */}
                <div className="flex flex-col gap-4">
                  {/* Efficiency Score */}
                  <div className="rounded-xl p-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                    <h3 className="text-sm font-bold text-white mb-3">📊 Corridor Efficiency Score</h3>
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${(efficiency.total / 100) * 264} ${264 - (efficiency.total / 100) * 264}`} strokeDashoffset="66"
                            style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                          <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="900" fill="white" fontFamily="monospace">{efficiency.total}</text>
                          <text x="50" y="60" textAnchor="middle" fontSize="9" fill={scoreColor}>/ 100</text>
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Stops Cleared', score: efficiency.stopsCleared, max: 30, col: '#10b981' },
                        { label: 'Time Saved', score: efficiency.timeSaved, max: 25, col: '#3b82f6' },
                        { label: 'Vital Stability', score: efficiency.vitalStability, max: 20, col: '#ef4444' },
                        { label: 'Alert Effectiveness', score: efficiency.alertEffectiveness, max: 15, col: '#f59e0b' },
                        { label: 'Route Adherence', score: efficiency.routeAdherence, max: 10, col: '#a78bfa' },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-slate-400">{m.label}</span>
                            <span className="font-mono-num font-bold" style={{ color: m.col }}>{m.score}/{m.max}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(m.score / m.max) * 100}%`, background: m.col }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Crowd Prediction */}
                  <div className="rounded-xl p-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                    <h3 className="text-sm font-bold text-white mb-1">🤖 AI Crowd Prediction Engine</h3>
                    <p className="text-[10px] text-slate-400 mb-3">ML model predicting congestion at upcoming stops based on time-of-day + vehicle density patterns.</p>
                    {predictions.length === 0
                      ? <p className="text-xs text-slate-500 text-center py-3">All upcoming stops cleared — no congestion predicted.</p>
                      : predictions.map(p => (
                        <div key={p.stopId} className="p-2.5 rounded-lg mb-2 text-xs" style={{ background: 'rgba(15,23,42,0.8)', border: `1px solid ${p.confidence > 75 ? 'rgba(239,68,68,0.3)' : 'rgba(30,41,59,0.8)'}` }}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-white truncate" style={{ maxWidth: 120 }}>Stop #{p.stopId} — {p.name.split(' ')[0]}</span>
                            <span className="font-mono-num font-black shrink-0" style={{ color: p.confidence > 75 ? '#ef4444' : p.confidence > 50 ? '#f59e0b' : '#34d399' }}>{p.confidence}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="h-1.5 rounded-full flex-1 mr-2 overflow-hidden" style={{ background: '#1e293b' }}>
                              <div className="h-full rounded-full" style={{ width: `${p.confidence}%`, background: p.confidence > 75 ? '#ef4444' : p.confidence > 50 ? '#f59e0b' : '#10b981', transition: 'width 0.5s' }} />
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0">ETA {Math.floor(p.eta_s / 60)}m {p.eta_s % 60}s</span>
                          </div>
                          <div className="flex justify-between mt-1 text-[10px]">
                            <span style={{ color: '#94a3b8' }}>Predicted crowd: <strong style={{ color: p.predictedCrowd === 'Critical' ? '#f87171' : p.predictedCrowd === 'Heavy' ? '#fcd34d' : '#34d399' }}>{p.predictedCrowd}</strong></span>
                            {p.confidence > 65 && <span style={{ color: '#a78bfa' }}>→ Pre-dispatch advised</span>}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Column 2: Multi-Ambulance + Green Wave */}
                <div className="flex flex-col gap-4">
                  {/* Multi-Ambulance Tracker */}
                  <div className="rounded-xl p-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                    <h3 className="text-sm font-bold text-white mb-3">🚑 Multi-Unit Tracker</h3>

                    {/* Unit 1 */}
                    <div className="p-3 rounded-lg mb-2" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-white font-mono-num">DL-01-EMS-4402</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>● ACTIVE</span>
                      </div>
                      <div className="text-[11px] space-y-1 text-slate-400">
                        <div className="flex justify-between"><span>Route</span><span className="text-white">CP → LNJP Hospital</span></div>
                        <div className="flex justify-between"><span>Progress</span><span className="font-mono-num text-emerald-400">{progress}% ({coveredKm.toFixed(1)}/{TOTAL_KM} km)</span></div>
                        <div className="flex justify-between"><span>Speed</span><span className="text-blue-300 font-mono-num">{currentSpeed} km/h</span></div>
                        <div className="flex justify-between"><span>ETA</span><span className="text-emerald-300 font-mono-num">{etaStr(remainingKm, currentSpeed)}</span></div>
                      </div>
                      <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: '#1e293b' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(to right, #ef4444, #f59e0b)' }} />
                      </div>
                    </div>

                    {/* Unit 2 */}
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.3)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-white font-mono-num">DL-02-EMS-3317</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(99,102,241,0.2)', color: '#a78bfa' }}>● PARALLEL</span>
                          <button onClick={() => setUnit2Simulating(p => !p)} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#1e293b', color: '#94a3b8' }}>{unit2Simulating ? '⏸' : '▶'}</button>
                        </div>
                      </div>
                      <div className="text-[11px] space-y-1 text-slate-400">
                        <div className="flex justify-between"><span>Route</span><span className="text-white">Lajpat Nagar → Safdarjung</span></div>
                        <div className="flex justify-between"><span>Progress</span><span className="font-mono-num text-indigo-400">{unit2Progress}% ({unit2CovKm.toFixed(1)}/{UNIT2_TOTAL} km)</span></div>
                        <div className="flex justify-between"><span>ETA</span><span className="text-indigo-300 font-mono-num">{etaStr(unit2Remain, 55)}</span></div>
                      </div>
                      <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: '#1e293b' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${unit2Progress}%`, background: 'linear-gradient(to right, #6366f1, #a78bfa)' }} />
                      </div>
                      <div className="mt-2 space-y-1">
                        {UNIT2_STOPS.map(s => (
                          <div key={s.id} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${s.dist < unit2CovKm ? 'bg-slate-600' : s.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                              <span style={{ color: s.dist < unit2CovKm ? '#475569' : '#94a3b8' }}>{s.name}</span>
                            </div>
                            <span style={{ color: s.dist < unit2CovKm ? '#475569' : s.status === 'resolved' ? '#34d399' : '#fcd34d', fontSize: 9 }}>{s.dist < unit2CovKm ? 'Passed' : s.status === 'resolved' ? 'Clear' : 'Pending'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Green Wave Optimizer */}
                  <div className="rounded-xl p-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                    <h3 className="text-sm font-bold text-white mb-1">🟢 Green Wave Signal Optimizer</h3>
                    <p className="text-[10px] text-slate-400 mb-3">Signals pre-cleared 15s before ambulance arrival — cascades down route automatically.</p>
                    <div className="space-y-2">
                      {stops.map(s => {
                        const isCleared = greenWave.includes(s.id);
                        const cd = greenWaveCountdowns[s.id];
                        const isPassed = s.distFromStart < coveredKm - 0.15;
                        let status = '', col = '#475569', bg = 'transparent';
                        if (isPassed) { status = 'Passed'; col = '#475569'; }
                        else if (isCleared) { status = '🟢 GREEN'; col = '#10b981'; bg = 'rgba(16,185,129,0.08)'; }
                        else if (cd !== undefined && cd < 15) { status = `🔄 Switching in ${cd}s`; col = '#06b6d4'; bg = 'rgba(6,182,212,0.08)'; }
                        else if (cd !== undefined && cd < 45) { status = `⏳ Pre-clear in ${cd}s`; col = '#f59e0b'; bg = 'rgba(245,158,11,0.06)'; }
                        else { status = `🔴 ${cd !== undefined ? `${Math.floor(cd / 60)}m ${cd % 60}s` : '—'}`; col = '#64748b'; }
                        return (
                          <div key={s.id} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: bg, border: '1px solid rgba(30,41,59,0.6)' }}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono-num text-slate-500 text-[10px] w-4">#{s.id}</span>
                              <span className="text-slate-300 truncate" style={{ maxWidth: 130 }}>{s.name}</span>
                            </div>
                            <span className="font-bold text-[10px] font-mono-num shrink-0" style={{ color: col }}>{status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Column 3: Radio Log */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl p-4 flex flex-col flex-1" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">📡 Emergency Radio Log
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      </h3>
                      <button onClick={() => addRadio('DISPATCH', 'Manual broadcast: All units maintain corridor clearance protocol.', 'info')}
                        className="px-2 py-1 text-[10px] rounded font-bold hover:opacity-80" style={{ background: '#1e293b', color: '#94a3b8' }}>+ Broadcast</button>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto max-h-[520px] font-mono-num text-[11px]">
                      {radioLog.map(r => (
                        <div key={r.id} className="p-2.5 rounded-lg" style={{ background: 'rgba(15,23,42,0.8)', border: `1px solid ${r.type === 'alert' ? 'rgba(239,68,68,0.25)' : r.type === 'warn' ? 'rgba(245,158,11,0.2)' : r.type === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(30,41,59,0.6)'}` }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-[10px]" style={{ color: r.type === 'alert' ? '#f87171' : r.type === 'warn' ? '#fcd34d' : r.type === 'ok' ? '#34d399' : '#06b6d4' }}>{r.from}</span>
                            <span className="text-[10px] text-slate-500">{r.time}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{r.msg}</p>
                        </div>
                      ))}
                    </div>
                    {/* Quick radio actions */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {[
                        { label: '🚨 Request Backup', msg: 'Requesting additional traffic units at ITO corridor immediately.', type: 'alert' as const },
                        { label: '✅ Corridor Clear', msg: 'Reporting full corridor clearance. Green wave confirmed.', type: 'ok' as const },
                      ].map(a => (
                        <button key={a.label} onClick={() => addRadio('OFFICER', a.msg, a.type)}
                          className="py-1.5 text-[10px] font-bold rounded hover:opacity-80 transition-all"
                          style={{ background: a.type === 'alert' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: a.type === 'alert' ? '#f87171' : '#34d399', border: `1px solid ${a.type === 'alert' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: CORRIDOR SIMULATOR ─────────────────────── */}
          {tab === 'controls' && (
            <div className="flex-1 flex flex-col p-5 gap-4">
              <div className="pb-3 border-b" style={{ borderColor: '#1e293b' }}>
                <h2 className="text-xl font-extrabold text-white">🎛️ Emergency Corridor Simulation Controls</h2>
                <p className="text-xs mt-0.5 text-slate-400">Test how advance alerts work when traffic jams occur at specific stops.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Playback */}
                <div className="rounded-xl p-5 space-y-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                  <h3 className="text-sm font-bold text-white">▶ Playback & Speed</h3>
                  <div className="flex gap-3">
                    <button onClick={() => setIsSimulating(p => !p)} className="px-4 py-2 text-white font-bold text-xs rounded-lg hover:opacity-90" style={{ background: '#2563eb' }}>{isSimulating ? '⏸ Pause' : '▶ Resume'}</button>
                    <button onClick={resetAll} className="px-4 py-2 font-bold text-xs rounded-lg hover:opacity-90" style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }}>↺ Restart</button>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-2 block text-slate-400">Speed Multiplier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ v: 1, l: '1x Normal' }, { v: 2, l: '2x Fast' }, { v: 4, l: '4x Rapid' }].map(({ v, l }) => (
                        <button key={v} onClick={() => setSimSpeed(v)} className="py-2 text-xs font-bold rounded border transition-all hover:opacity-90"
                          style={simSpeed === v ? { background: '#2563eb', color: 'white', border: '1px solid #3b82f6' } : { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg space-y-2 text-xs font-mono-num" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #1e293b' }}>
                    {[['Progress', `${progress}% (${coveredKm}/${TOTAL_KM} km)`, '#e2e8f0'], ['Speed', `${currentSpeed} km/h`, '#06b6d4'], ['ETA', etaStr(remainingKm, currentSpeed), '#10b981'], ['Efficiency', `${efficiency.total}/100`, scoreColor], ['Sim Speed', `${simSpeed}x`, '#f59e0b']].map(([k, v, c]) => (
                      <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span style={{ color: c as string }}>{v}</span></div>
                    ))}
                  </div>
                </div>
                {/* Crowd injection */}
                <div className="rounded-xl p-5 space-y-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                  <h3 className="text-sm font-bold text-white">⚠️ Traffic Jam Injection Scenarios</h3>
                  <p className="text-xs text-slate-400">Simulate real-world Delhi congestion to test advance police dispatch + AI prediction trigger.</p>
                  <div className="space-y-2">
                    {[{ id: 3, t: 'Inject Crowd at Mandi House', d: 'Triggers advance alert when ambulance is 1.5 km away' },
                      { id: 5, t: 'Inject Massive Jam at ITO Chowk', d: 'Critical junction test — turns signal red, fires AI prediction alert' }].map(x => (
                      <button key={x.id} onClick={() => injectCrowd(x.id)} className="w-full text-left p-2.5 rounded-lg flex items-center justify-between group hover:opacity-90 transition-all" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #1e293b' }}>
                        <div><p className="text-xs font-bold text-white">{x.t}</p><p className="text-[11px] text-slate-500 mt-0.5">{x.d}</p></div>
                        <span className="text-slate-500">→</span>
                      </button>
                    ))}
                    <button onClick={resolveAll} className="w-full text-center p-2.5 rounded-lg text-xs font-bold hover:opacity-90" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>🟢 Clear All Traffic Jams (Normal Flow)</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── TOAST NOTIFICATIONS ───────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-semibold text-white pointer-events-auto"
            style={{ background: '#0f172a', border: `1px solid ${t.type === 'ok' ? 'rgba(16,185,129,0.5)' : t.type === 'warn' ? 'rgba(245,158,11,0.5)' : 'rgba(59,130,246,0.5)'}` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: t.type === 'ok' ? '#10b981' : t.type === 'warn' ? '#f59e0b' : '#3b82f6' }} />
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
