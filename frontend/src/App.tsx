import React, { useState, useEffect, useRef, useCallback } from 'react';
import { STOPS, ROUTE_COORDS, TOTAL_KM, MISSION, IOT_DEVICES, type Stop } from './data/delhiData';

// ─── AUDIO (Web Audio API synthesized siren chime) ─────────────────────────
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function playPoliceSirenChime() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1100, now + 0.2);
    osc.frequency.linearRampToValueAtTime(800, now + 0.4);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.46);
  } catch { /* autoplay policy */ }
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
function interpolateRoute(fraction: number): [number, number] {
  if (fraction <= 0) return ROUTE_COORDS[0];
  if (fraction >= 1) return ROUTE_COORDS[ROUTE_COORDS.length - 1];
  const seg = ROUTE_COORDS.length - 1;
  const exact = fraction * seg;
  const idx = Math.floor(exact);
  const sub = exact - idx;
  const p1 = ROUTE_COORDS[idx];
  const p2 = ROUTE_COORDS[Math.min(idx + 1, ROUTE_COORDS.length - 1)];
  return [p1[0] + (p2[0] - p1[0]) * sub, p1[1] + (p2[1] - p1[1]) * sub];
}

function etaString(remainKm: number, speedKmh: number): string {
  const secs = Math.round((remainKm / (speedKmh || 40)) * 3600);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

// ─── TYPES ─────────────────────────────────────────────────────────────────
type Tab = 'live' | 'police' | 'stops' | 'controls';
type StopMutable = Stop & { status: 'resolved' | 'pending'; light: 'green' | 'yellow' | 'red'; crowd: string };

// ─── SVG MAP COMPONENT ─────────────────────────────────────────────────────
const DelhiRouteMap: React.FC<{ progress: number; stops: StopMutable[] }> = ({ progress, stops }) => {
  // Project lat/lng to SVG coords
  const minLat = 28.618, maxLat = 28.645, minLng = 77.216, maxLng = 77.248;
  const W = 520, H = 260;
  const project = (lat: number, lng: number): [number, number] => [
    ((lng - minLng) / (maxLng - minLng)) * W,
    H - ((lat - minLat) / (maxLat - minLat)) * H,
  ];

  const routePts = ROUTE_COORDS.map(([lat, lng]) => project(lat, lng));
  const polyline = routePts.map(([x, y]) => `${x},${y}`).join(' ');

  // Covered fraction
  const seg = ROUTE_COORDS.length - 1;
  const exactIdx = (progress / 100) * seg;
  const covIdx = Math.floor(exactIdx);
  const [ambX, ambY] = (() => {
    const [la, ln] = interpolateRoute(progress / 100);
    return project(la, ln);
  })();

  const coveredPts = routePts.slice(0, covIdx + 1).concat([[ambX, ambY]]);
  const coveredPoly = coveredPts.map(([x, y]) => `${x},${y}`).join(' ');

  const crowdColor = (s: StopMutable) => {
    if (s.status === 'pending' && s.crowd === 'Critical') return '#ef4444';
    if (s.status === 'pending') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="relative w-full" style={{ background: '#090e17', borderRadius: 8, overflow: 'hidden' }}>
      {/* SIMULATION MODE watermark */}
      <div className="absolute top-2 right-3 text-[10px] font-bold tracking-widest select-none"
        style={{ color: 'rgba(6,182,212,0.25)' }}>SIMULATION MODE</div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Glow route */}
        <polyline points={polyline} fill="none" stroke="#06b6d4" strokeWidth="10" strokeOpacity="0.12" strokeLinecap="round" />
        {/* Base route */}
        <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="3"
          strokeOpacity="0.7" strokeLinecap="round" strokeDasharray="7,5" />
        {/* Covered path */}
        {covIdx > 0 && (
          <polyline points={coveredPoly} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
        )}

        {/* Stop markers */}
        {stops.map((s) => {
          const [x, y] = project(s.lat, s.lng);
          const col = crowdColor(s);
          return (
            <g key={s.id}>
              {s.status === 'pending' && (
                <circle cx={x} cy={y} r={14} fill="none" stroke={col} strokeWidth="2" strokeOpacity="0.4">
                  <animate attributeName="r" values="12;18;12" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={10} fill={col} stroke="#090e17" strokeWidth="2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">{s.id}</text>
              <text x={x} y={y + 22} textAnchor="middle" fontSize="8" fill="#94a3b8">
                {s.name.split(' ')[0].slice(0, 9)}
              </text>
            </g>
          );
        })}

        {/* Ambulance marker */}
        <g>
          <circle cx={ambX} cy={ambY} r={16} fill="#ef4444" fillOpacity="0.2">
            <animate attributeName="r" values="14;22;14" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx={ambX} cy={ambY} r={10} fill="#ef4444" stroke="white" strokeWidth="2" />
          <text x={ambX} y={ambY + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">🚑</text>
        </g>
      </svg>

      {/* Map legend */}
      <div className="flex items-center gap-4 px-3 py-2 text-xs" style={{ color: '#94a3b8' }}>
        {[
          { color: '#ef4444', label: 'Ambulance' },
          { color: '#f59e0b', label: 'Pending Clearance' },
          { color: '#10b981', label: 'Corridor Cleared' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>('live');
  const [stops, setStops] = useState<StopMutable[]>(STOPS.map(s => ({ ...s })));
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [step, setStep] = useState(0);
  const [localSoundEnabled, setLocalSoundEnabled] = useState(true);
  const [criticalBanner, setCriticalBanner] = useState<{ show: boolean; stopName: string; distAhead: string }>({ show: false, stopName: '', distAhead: '' });
  const [policeFilter, setPoliceFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [iotEvents, setIotEvents] = useState<Array<{ id: string; device: string; event: string; time: string }>>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const TOTAL_STEPS = 240;

  const fraction = step / TOTAL_STEPS;
  const coveredKm = parseFloat((fraction * TOTAL_KM).toFixed(2));
  const remainingKm = Math.max(0, TOTAL_KM - coveredKm);
  const progress = Math.min(100, Math.round(fraction * 100));

  // Speed based on congestion
  const nextStop = stops.find(s => s.distFromStart >= coveredKm - 0.1);
  let currentSpeed = 64;
  if (nextStop?.status === 'pending' && nextStop?.crowd === 'Critical') {
    const dist = Math.max(0, nextStop.distFromStart - coveredKm);
    currentSpeed = dist < 0.4 ? 28 : 52;
  }

  const etaStr = etaString(remainingKm, currentSpeed);

  // Tick
  const tick = useCallback(() => {
    setStep(prev => {
      const next = prev + simSpeed;
      if (next > TOTAL_STEPS) return 0;
      return next;
    });
  }, [simSpeed]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isSimulating) {
      intervalRef.current = setInterval(tick, 200);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isSimulating, tick]);

  // Advance alert check
  useEffect(() => {
    const criticalStop = stops.find(s =>
      s.crowd === 'Critical' &&
      s.status === 'pending' &&
      (s.distFromStart - coveredKm) > 0 &&
      (s.distFromStart - coveredKm) <= 2.2
    );
    if (criticalStop) {
      const dist = (criticalStop.distFromStart - coveredKm).toFixed(1);
      setCriticalBanner({ show: true, stopName: criticalStop.name, distAhead: dist });
      playPoliceSirenChime();
    } else {
      setCriticalBanner(b => b.show ? { ...b, show: false } : b);
    }
  }, [coveredKm, stops]);

  const resolveStop = (id: number) => {
    setStops(prev => prev.map(s => s.id === id
      ? { ...s, status: 'resolved', light: 'green', crowd: s.crowd === 'Critical' ? 'Normal' : s.crowd }
      : s));
    setIotEvents(prev => [{
      id: Date.now().toString(),
      device: IOT_DEVICES.find(d => d.stop_id === id)?.id ?? 'IOT-???',
      event: 'CORRIDOR_CLEARED',
      time: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 50));
    playPoliceSirenChime();
  };

  const injectCrowd = (stopId: number) => {
    setStops(prev => prev.map(s => s.id === stopId
      ? { ...s, status: 'pending', light: stopId === 5 ? 'red' : 'yellow', crowd: stopId === 5 ? 'Critical' : 'Heavy' }
      : s));
  };

  const resolveAll = () => {
    setStops(prev => prev.map(s => ({ ...s, status: 'resolved', light: 'green' })));
  };

  const resetAll = () => {
    setStops(STOPS.map(s => ({ ...s })));
    setStep(0);
  };

  const pendingCount = stops.filter(s => s.status === 'pending').length;

  const navItems: Array<{ id: Tab; label: string; icon: string; badge?: string; badgeClass?: string }> = [
    { id: 'live', label: 'Live Route & Map', icon: '📍', badge: 'ACTIVE', badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    { id: 'police', label: 'Police Action Desk', icon: '🛡️',
      badge: pendingCount > 0 ? `${pendingCount} PENDING` : 'CLEAR',
      badgeClass: pendingCount > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400' },
    { id: 'stops', label: 'Red Light Stops', icon: '🚦', badge: '6 STOPS', badgeClass: 'bg-slate-800 text-slate-400' },
    { id: 'controls', label: 'Corridor Simulator', icon: '🎛️', badge: 'DEMO', badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
  ];

  const crowdColor = (s: StopMutable) => {
    if (s.status === 'pending' && s.crowd === 'Critical') return 'text-red-400';
    if (s.status === 'pending') return 'text-amber-300';
    return 'text-emerald-400';
  };

  const lightDot = (light: string) =>
    light === 'green' ? 'bg-emerald-500' : light === 'yellow' ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col select-none" style={{ background: '#070d18' }}>

      {/* ── CRITICAL BANNER ─────────────────────────────────────────── */}
      {criticalBanner.show && (
        <div className="banner-enter flex items-center justify-between px-4 py-2.5 text-white z-50 border-b-2 border-red-500"
          style={{ background: 'linear-gradient(to right, #450a0a, #7f1d1d, #451a03)' }}>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-600 rounded-full animate-ping">
              <span className="text-xs">⚠️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold bg-red-600 rounded text-white uppercase tracking-wider animate-pulse">
                  CRITICAL CROWD AHEAD
                </span>
                <span className="font-bold text-sm tracking-wide">
                  Advance Alert: Critical congestion at <strong className="underline">{criticalBanner.stopName}</strong> ({criticalBanner.distAhead} km ahead)!
                </span>
              </div>
              <p className="text-xs text-red-200 mt-0.5">Police action required immediately to clear cross-traffic before ambulance arrives.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setTab('police')}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs uppercase flex items-center gap-1.5 shadow-lg">
              🛡️ Take Police Action
            </button>
            <button onClick={() => setCriticalBanner(b => ({ ...b, show: false }))} className="text-red-300 hover:text-white p-1">✕</button>
          </div>
        </div>
      )}

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <aside className="w-64 flex flex-col border-r z-40 shrink-0"
          style={{ background: '#0b1323', borderColor: 'rgba(30,41,59,0.8)' }}>

          {/* Logo */}
          <div className="p-4 border-b" style={{ borderColor: '#1e293b', background: 'rgba(7,13,24,0.7)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg border"
                style={{ background: 'linear-gradient(135deg,#dc2626,#1d4ed8)', borderColor: '#334155' }}>
                <span className="text-lg animate-pulse">🚨</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base tracking-wider text-white">ERS POLICE</h1>
                  <span className="text-[10px] font-bold px-1.5 rounded" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.4)' }}>DELHI</span>
                </div>
                <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>Emergency Corridor Control</p>
              </div>
            </div>

            {/* Station badge */}
            <div className="mt-3 p-2 rounded-md flex items-center justify-between text-xs"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #1e293b' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium" style={{ color: '#cbd5e1' }}>Central Traffic Desk</span>
              </div>
              <span className="font-mono-num text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#1e293b', color: '#94a3b8' }}>NET-ON</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="p-3 space-y-1.5">
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Navigation</p>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === item.id
                    ? 'text-white shadow-lg'
                    : 'hover:text-white transition-all'
                }`}
                style={tab === item.id
                  ? { background: '#2563eb', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }
                  : { color: '#cbd5e1', background: 'transparent' }}
                onMouseEnter={e => { if (tab !== item.id) (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.6)'; }}
                onMouseLeave={e => { if (tab !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono-num ${item.badgeClass}`}>{item.badge}</span>
              </button>
            ))}
          </nav>

          {/* Active mission card */}
          <div className="mx-3 mt-2 p-3 rounded-lg" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid #1e293b' }}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]" style={{ color: '#94a3b8' }}>Active Emergency</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse"
                style={{ background: 'rgba(220,38,38,0.3)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>PRIORITY 1</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span style={{ color: '#64748b' }}>Ambulance:</span>
                <span className="font-bold text-white font-mono-num">DL-01-EMS-4402</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748b' }}>Patient:</span>
                <span className="font-medium" style={{ color: '#f87171' }}>Critical Cardiac</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748b' }}>Destination:</span>
                <span className="font-medium" style={{ color: '#93c5fd' }}>LNJP Hospital</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span style={{ color: '#94a3b8' }}>Route Progress</span>
                <span className="font-bold font-mono-num" style={{ color: '#34d399' }}>{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(to right, #3b82f6, #06b6d4, #10b981)' }} />
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="mt-auto p-3 border-t space-y-2" style={{ borderColor: '#1e293b', background: 'rgba(7,13,24,0.6)' }}>
            <div className="flex items-center justify-between px-2 py-1 text-xs" style={{ color: '#94a3b8' }}>
              <span className="flex items-center gap-1.5">🔊 Police Siren Sound</span>
              <button onClick={() => { soundEnabled = !soundEnabled; setLocalSoundEnabled(p => !p); playPoliceSirenChime(); }}
                className="px-2 py-0.5 text-[11px] font-semibold rounded hover:opacity-80"
                style={{ background: '#1e293b', border: '1px solid #334155', color: localSoundEnabled ? '#34d399' : '#94a3b8' }}>
                {localSoundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <button onClick={() => setIsSimulating(p => !p)}
              className="w-full py-2 px-3 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              style={{ background: isSimulating ? '#059669' : '#2563eb' }}>
              {isSimulating ? '⏸ Pause Simulation' : '▶ Resume Simulation'}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#070d18' }}>

          {/* ── TAB 1: LIVE ROUTE & MAP ───────────────────────────── */}
          {tab === 'live' && (
            <div className="flex-1 flex flex-col p-4 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '⚡', label: 'Current Speed', value: currentSpeed.toString(), unit: 'km/h', col: '#3b82f6' },
                  { icon: '🧭', label: 'Distance Left', value: remainingKm.toFixed(1), unit: 'km', col: '#06b6d4' },
                  { icon: '⏱️', label: 'Estimated Time (ETA)', value: etaStr, unit: '', col: '#10b981' },
                  { icon: '🚦', label: 'Next Red Light', value: nextStop?.name.split('(')[0].trim() ?? '—', unit: nextStop ? (nextStop.status === 'pending' ? (nextStop.crowd === 'Critical' ? '⚠️ CRITICAL JAM' : '🟡 Pending') : '🟢 Corridor Open') : '', col: nextStop?.status === 'pending' && nextStop.crowd === 'Critical' ? '#ef4444' : '#f59e0b' },
                ].map(stat => (
                  <div key={stat.label} className="p-3 rounded-lg flex items-center gap-3"
                    style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                    <div className="p-2.5 rounded-lg" style={{ background: `${stat.col}18`, border: `1px solid ${stat.col}30` }}>
                      <span className="text-lg">{stat.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{stat.label}</p>
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-lg font-bold text-white font-mono-num truncate">{stat.value}</span>
                        {stat.unit && <span className="text-xs" style={{ color: '#94a3b8' }}>{stat.unit}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map + Timeline */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[400px]">
                {/* Map col-2 */}
                <div className="lg:col-span-2 rounded-xl overflow-hidden flex flex-col shadow-xl"
                  style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                  {/* Map header */}
                  <div className="p-3 flex items-center justify-between border-b" style={{ borderColor: '#1e293b' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Route: Connaught Place → ITO → LNJP Hospital
                      </span>
                    </div>
                    <span className="text-[11px]" style={{ color: '#94a3b8' }}>Corridor: 6 Checkpoints</span>
                  </div>
                  <div className="flex-1 p-3">
                    <DelhiRouteMap progress={progress} stops={stops} />
                  </div>
                </div>

                {/* Stops timeline */}
                <div className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                  <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: '#1e293b' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">🔗</span>
                      <h3 className="text-sm font-bold text-white">Route Stops (Red Lights)</h3>
                    </div>
                    <span className="text-[11px] font-mono-num" style={{ color: '#94a3b8' }}>
                      Stop {Math.max(1, (stops.findIndex(s => s.distFromStart >= coveredKm - 0.1) + 1) || 6)} of 6
                    </span>
                  </div>

                  <div className="space-y-2 overflow-y-auto flex-1">
                    {stops.map(stop => {
                      const passed = stop.distFromStart < coveredKm - 0.15;
                      const isCurr = Math.abs(stop.distFromStart - coveredKm) <= 0.25;
                      let dotCls = 'bg-slate-700';
                      if (passed) dotCls = 'bg-slate-600';
                      else if (stop.status === 'pending') dotCls = stop.crowd === 'Critical' ? 'bg-red-500 animate-ping' : 'bg-amber-400 animate-pulse';
                      else dotCls = 'bg-emerald-500';

                      return (
                        <div key={stop.id} className="p-2 rounded-lg flex items-center justify-between text-xs transition-all"
                          style={{
                            background: isCurr ? 'rgba(30,41,59,0.9)' : 'rgba(15,23,42,0.6)',
                            border: `1px solid ${isCurr ? 'rgba(59,130,246,0.6)' : 'rgba(30,41,59,0.8)'}`,
                          }}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotCls}`} />
                            <div className="min-w-0">
                              <p className={`font-bold text-white truncate ${isCurr ? 'text-blue-300' : ''}`}>
                                {stop.id}. {stop.name}
                              </p>
                              <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                                {stop.distFromStart} km • Signal: <strong className={
                                  stop.light === 'green' ? 'text-emerald-400' : stop.light === 'yellow' ? 'text-amber-400' : 'text-red-400'
                                }>{stop.light.toUpperCase()}</strong>
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 ml-2">
                            {passed
                              ? <span className="text-[10px]" style={{ color: '#94a3b8' }}>Passed</span>
                              : stop.status === 'pending'
                              ? stop.crowd === 'Critical'
                                ? <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(220,38,38,0.3)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>CRITICAL</span>
                                : <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}>PENDING</span>
                              : <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>CLEARED</span>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick clear box */}
                  {stops.some(s => s.status === 'pending') && (
                    <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(to right, rgba(127,29,29,0.6), rgba(15,23,42,1))', border: '1px solid rgba(239,68,68,0.4)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Police Action Required</p>
                          <p className="text-xs text-white font-medium mt-0.5">Clear upcoming jam before ambulance arrives</p>
                        </div>
                        <button onClick={() => { const s = stops.find(x => x.status === 'pending'); if (s) resolveStop(s.id); }}
                          className="px-3 py-1.5 text-white rounded font-bold text-xs flex items-center gap-1 shadow-md hover:opacity-90 transition-all"
                          style={{ background: '#059669' }}>
                          ✓ Clear Stop
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: POLICE ACTION DESK ─────────────────────────── */}
          {tab === 'police' && (
            <div className="flex-1 flex flex-col p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2" style={{ borderColor: '#1e293b' }}>
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    🛡️ Traffic Police Clearance Desk
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                    Direct police intervention portal — turn signals green and disperse crowd queues ahead of approaching emergency vehicle.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => injectCrowd(5)}
                    className="px-3 py-1.5 text-white text-xs font-bold rounded flex items-center gap-1.5 hover:opacity-90"
                    style={{ background: '#d97706' }}>
                    ⚡ Simulate Critical Crowd
                  </button>
                  <button onClick={resolveAll}
                    className="px-3 py-1.5 text-white text-xs font-bold rounded flex items-center gap-1.5 hover:opacity-90"
                    style={{ background: '#059669' }}>
                    ✓✓ Clear All Stops
                  </button>
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-3 text-xs">
                {(['all', 'pending', 'resolved'] as const).map(f => (
                  <button key={f} onClick={() => setPoliceFilter(f)}
                    className="px-3 py-1 rounded font-bold transition-all"
                    style={policeFilter === f
                      ? { background: '#2563eb', color: 'white' }
                      : f === 'pending'
                      ? { background: '#1e293b', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
                      : f === 'resolved'
                      ? { background: '#1e293b', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                      : { background: '#1e293b', color: '#94a3b8' }
                    }>
                    {f === 'all' ? `All Corridor Stops (${stops.length})` : f === 'pending' ? 'Needs Action (Pending)' : 'Cleared (Resolved)'}
                  </button>
                ))}
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stops.filter(s => policeFilter === 'all' ? true : s.status === policeFilter).map(stop => (
                  <div key={stop.id} className="rounded-xl p-4 flex flex-col gap-3 transition-all"
                    style={{
                      background: '#0b1323',
                      border: `1px solid ${stop.status === 'pending' ? (stop.crowd === 'Critical' ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.4)') : 'rgba(16,185,129,0.3)'}`,
                    }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Stop #{stop.id}</span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{stop.name}</h4>
                        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{stop.description}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${lightDot(stop.light)} ${stop.status === 'pending' ? 'animate-pulse' : ''}`} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded" style={{ background: 'rgba(15,23,42,0.8)' }}>
                        <p style={{ color: '#64748b' }}>Crowd</p>
                        <p className={`font-bold ${crowdColor(stop)}`}>{stop.crowd}</p>
                      </div>
                      <div className="p-2 rounded" style={{ background: 'rgba(15,23,42,0.8)' }}>
                        <p style={{ color: '#64748b' }}>Signal</p>
                        <p className={`font-bold ${stop.light === 'green' ? 'text-emerald-400' : stop.light === 'yellow' ? 'text-amber-400' : 'text-red-400'}`}>
                          {stop.light.toUpperCase()}
                        </p>
                      </div>
                      <div className="p-2 rounded" style={{ background: 'rgba(15,23,42,0.8)' }}>
                        <p style={{ color: '#64748b' }}>Distance</p>
                        <p className="font-bold text-white font-mono-num">{stop.distFromStart} km</p>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono-num" style={{ color: '#64748b' }}>📡 {stop.iotDevice}</div>

                    {stop.status === 'pending' ? (
                      <button onClick={() => resolveStop(stop.id)}
                        className="w-full py-2 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                        style={{ background: '#059669' }}>
                        ✓ Clear Corridor (Police Action)
                      </button>
                    ) : (
                      <div className="w-full py-2 rounded text-xs font-bold text-center"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                        🟢 Corridor CLEARED
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* SOP guide */}
              <div className="p-4 rounded-xl" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#cbd5e1' }}>
                  📖 Delhi Traffic Police Standard Operating Procedure (SOP)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs" style={{ color: '#94a3b8' }}>
                  {[
                    { title: '1. Advance Notice (2 km out)', body: 'When the ambulance is approaching, the system warns the red light intersection. Alert status switches to PENDING.' },
                    { title: '2. Traffic Clearance Action', body: 'Duty officer presses "Clear Corridor". Traffic signals turn Green on the ambulance lane and hold cross-traffic.' },
                    { title: '3. Status: RESOLVED', body: 'Crowd disperses before ambulance arrives. Zero stops, non-stop safe transit for the patient.' },
                  ].map(item => (
                    <div key={item.title} className="p-2.5 rounded" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b' }}>
                      <p className="font-bold text-white mb-1">{item.title}</p>
                      <p>{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: RED LIGHT STOPS ─────────────────────────────── */}
          {tab === 'stops' && (
            <div className="flex-1 flex flex-col p-5 space-y-4">
              <div className="pb-3 border-b" style={{ borderColor: '#1e293b' }}>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  🚦 Delhi Red Light Stops & IoT Checkpoint Units
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  Live monitoring of roadside IoT controllers, speaker units, and signal states along the corridor.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden shadow-lg" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" style={{ color: '#cbd5e1' }}>
                    <thead className="text-[10px] font-bold uppercase border-b" style={{ background: 'rgba(7,13,24,0.9)', borderColor: '#1e293b', color: '#94a3b8' }}>
                      <tr>
                        {['Stop #', 'Intersection Name', 'Crowd Density', 'Traffic Light', 'Police Action Status', 'Distance Ahead', 'Actions'].map(h => (
                          <th key={h} className="p-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#1e293b' }}>
                      {stops.map(stop => (
                        <tr key={stop.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 font-mono-num font-bold text-white">{stop.id}</td>
                          <td className="p-3">
                            <p className="font-semibold text-white">{stop.name}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>{stop.description}</p>
                          </td>
                          <td className="p-3">
                            <span className={`font-bold ${crowdColor(stop)}`}>{stop.crowd}</span>
                          </td>
                          <td className="p-3">
                            <span className={`font-bold font-mono-num ${stop.light === 'green' ? 'text-emerald-400' : stop.light === 'yellow' ? 'text-amber-400' : 'text-red-400'}`}>
                              {stop.light === 'green' ? '🟢' : stop.light === 'yellow' ? '🟡' : '🔴'} {stop.light.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            {stop.status === 'pending'
                              ? <span className="px-2 py-0.5 rounded font-bold text-[10px]" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>⚠ PENDING</span>
                              : <span className="px-2 py-0.5 rounded font-bold text-[10px]" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)' }}>✓ RESOLVED</span>
                            }
                          </td>
                          <td className="p-3 font-mono-num" style={{ color: '#94a3b8' }}>{stop.distFromStart} km</td>
                          <td className="p-3">
                            {stop.status === 'pending'
                              ? <button onClick={() => resolveStop(stop.id)}
                                  className="px-2.5 py-1.5 text-white rounded font-bold text-[11px] hover:opacity-90 transition-all"
                                  style={{ background: '#059669' }}>
                                  Clear →
                                </button>
                              : <span className="text-[11px]" style={{ color: '#64748b' }}>—</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* IoT Event Log */}
              <div className="rounded-xl p-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  📡 IoT Event Log <span className="text-[11px] font-normal ml-auto" style={{ color: '#64748b' }}>{iotEvents.length} events</span>
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono-num text-xs">
                  {iotEvents.length === 0
                    ? <p className="text-center py-4" style={{ color: '#475569' }}>No events yet — clear a stop to log an IoT event</p>
                    : iotEvents.map(e => (
                      <div key={e.id} className="flex items-center gap-3 py-1 px-2 rounded" style={{ background: 'rgba(15,23,42,0.6)' }}>
                        <span style={{ color: '#475569' }}>[{e.time}]</span>
                        <span style={{ color: '#06b6d4' }}>{e.event}</span>
                        <span style={{ color: '#94a3b8' }}>{e.device}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: CORRIDOR SIMULATOR ──────────────────────────── */}
          {tab === 'controls' && (
            <div className="flex-1 flex flex-col p-5 space-y-4">
              <div className="pb-3 border-b" style={{ borderColor: '#1e293b' }}>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  🎛️ Emergency Corridor Simulation Controls
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  Test how advance alerts work when traffic jams occur at specific stops.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Playback */}
                <div className="rounded-xl p-5 space-y-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">▶ Playback & Speed</h3>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsSimulating(p => !p)}
                      className="px-4 py-2 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg hover:opacity-90"
                      style={{ background: '#2563eb' }}>
                      {isSimulating ? '⏸ Pause' : '▶ Resume'}
                    </button>
                    <button onClick={resetAll}
                      className="px-4 py-2 font-bold text-xs rounded-lg flex items-center gap-2 border hover:opacity-90"
                      style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }}>
                      ↺ Restart Route
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-2 block" style={{ color: '#94a3b8' }}>Simulation Speed Multiplier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ v: 1, label: '1x Normal' }, { v: 2, label: '2x Fast' }, { v: 4, label: '4x Rapid' }].map(({ v, label }) => (
                        <button key={v} onClick={() => setSimSpeed(v)}
                          className="py-2 text-xs font-bold rounded border transition-all hover:opacity-90"
                          style={simSpeed === v
                            ? { background: '#2563eb', color: 'white', border: '1px solid #3b82f6' }
                            : { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Live telemetry */}
                  <div className="p-3 rounded-lg space-y-2 text-xs font-mono-num" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #1e293b' }}>
                    <div className="flex justify-between"><span style={{ color: '#64748b' }}>Progress</span><span className="text-white">{progress}% ({coveredKm} km / {TOTAL_KM} km)</span></div>
                    <div className="flex justify-between"><span style={{ color: '#64748b' }}>Current Speed</span><span style={{ color: '#06b6d4' }}>{currentSpeed} km/h</span></div>
                    <div className="flex justify-between"><span style={{ color: '#64748b' }}>ETA</span><span style={{ color: '#10b981' }}>{etaStr}</span></div>
                    <div className="flex justify-between"><span style={{ color: '#64748b' }}>Sim Speed</span><span style={{ color: '#f59e0b' }}>{simSpeed}x</span></div>
                  </div>
                </div>

                {/* Crowd injection */}
                <div className="rounded-xl p-5 space-y-4" style={{ background: '#0b1323', border: '1px solid #1e293b' }}>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span style={{ color: '#ef4444' }}>⚠</span> Traffic Jam Injection Scenarios
                  </h3>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    Simulate real-world Delhi congestion at upcoming stops to verify advance police dispatching.
                  </p>
                  <div className="space-y-2">
                    {[
                      { stopId: 3, title: 'Inject Critical Crowd at Mandi House', desc: 'Triggers advance alert when ambulance is 1.5 km away', color: '#f59e0b' },
                      { stopId: 5, title: 'Inject Massive Jam at ITO Chowk', desc: 'Major junction test: turns light red with critical crowd warning', color: '#ef4444' },
                    ].map(item => (
                      <button key={item.stopId} onClick={() => injectCrowd(item.stopId)}
                        className="w-full text-left p-2.5 rounded-lg flex items-center justify-between group hover:opacity-90 transition-all"
                        style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #1e293b' }}>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:opacity-80" style={{ transition: 'color 0.15s' }}>{item.title}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>{item.desc}</p>
                        </div>
                        <span style={{ color: '#64748b' }}>→</span>
                      </button>
                    ))}
                    <button onClick={resolveAll}
                      className="w-full text-center p-2.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all"
                      style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)' }}>
                      Clear All Traffic Jams (Normal Flow)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
