import React from 'react';
import { ROUTE_COORDS } from '../../data/delhiData';
import { DELHI_JUNCTIONS } from './useHardwareSimulator';
import { DelhiJunctionInfo } from './types';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  selectedJunctionId: number;
  onSelectJunction: (id: number) => void;
  ambulanceDistKm: number;
  stage: number;
}

export const DelhiCorridorMiniMap: React.FC<Props> = ({
  selectedJunctionId,
  onSelectJunction,
  ambulanceDistKm,
  stage,
}) => {
  const minLat = 28.618, maxLat = 28.645, minLng = 77.216, maxLng = 77.248;
  const W = 620, H = 220;

  const proj = (lat: number, lng: number): [number, number] => [
    ((lng - minLng) / (maxLng - minLng)) * W,
    H - ((lat - minLat) / (maxLat - minLat)) * H,
  ];

  const routePts = ROUTE_COORDS.map(([la, ln]) => proj(la, ln));
  const poly = routePts.map(([x, y]) => `${x},${y}`).join(' ');

  // Compute ambulance position based on stage and distance
  // Total km ~ 4.8 km
  const totalKm = 4.8;
  // In stage 1: 0% progress; stage 5: ~75% (at ITO); stage 6: 100% (at LNJP)
  const frac =
    stage === 1 ? 0.05
    : stage === 2 ? 0.25
    : stage === 3 ? 0.45
    : stage === 4 ? 0.65
    : stage === 5 ? 0.73 // Right at ITO Chowk
    : 0.98; // Arrived at LNJP

  const seg = ROUTE_COORDS.length - 1;
  const exact = frac * seg;
  const idx = Math.floor(exact);
  const sub = exact - idx;
  const p1 = ROUTE_COORDS[idx], p2 = ROUTE_COORDS[Math.min(idx + 1, ROUTE_COORDS.length - 1)];
  const [ambLa, ambLn] = [p1[0] + (p2[0] - p1[0]) * sub, p1[1] + (p2[1] - p1[1]) * sub];
  const [ambX, ambY] = proj(ambLa, ambLn);

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 shadow-xl font-mono text-xs space-y-2">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-cyan-400" />
          <span className="font-bold text-white tracking-wide">
            DELHI EMERGENCY CORRIDOR & JUNCTION HARDWARE TOPOLOGY
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Click any junction icon to inspect hardware digital twin
        </span>
      </div>

      <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg overflow-hidden relative">
        <div className="absolute top-2 right-3 text-[9px] text-cyan-400/40 font-bold uppercase tracking-widest select-none">
          GEOSPATIAL DIGITAL TWIN
        </div>

        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
          {/* Background grid */}
          {[40, 80, 120, 160, 200].map(y => (
            <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3,6" />
          ))}

          {/* Route corridor glow */}
          <polyline
            points={poly}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="12"
            strokeOpacity="0.1"
            strokeLinecap="round"
          />

          {/* Base route line */}
          <polyline
            points={poly}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3.5"
            strokeOpacity="0.7"
            strokeLinecap="round"
            strokeDasharray="6,4"
          />

          {/* Active Preempted Green Wave Segment */}
          {stage >= 4 && (
            <polyline
              points={poly}
              fill="none"
              stroke="#10b981"
              strokeWidth="5"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />
          )}

          {/* Junction RSU Markers */}
          {DELHI_JUNCTIONS.map(j => {
            const [x, y] = proj(j.lat, j.lng);
            const isSelected = j.id === selectedJunctionId;
            const isPreempted = isSelected && stage >= 4 && stage <= 5;

            return (
              <g
                key={j.id}
                onClick={() => onSelectJunction(j.id)}
                className="cursor-pointer group"
              >
                {/* Selection / Preemption Pulse Halo */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isPreempted ? 18 : 14}
                    fill="none"
                    stroke={isPreempted ? '#10b981' : '#38bdf8'}
                    strokeWidth="2"
                    strokeOpacity="0.7"
                  >
                    <animate attributeName="r" values="12;20;12" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Junction Node Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 10 : 8}
                  fill={isPreempted ? '#10b981' : isSelected ? '#0284c7' : '#1e293b'}
                  stroke={isSelected ? '#ffffff' : '#475569'}
                  strokeWidth="2"
                />

                {/* Junction ID Number */}
                <text
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#ffffff"
                  fontWeight="bold"
                >
                  {j.id}
                </text>

                {/* Junction Name Label */}
                <text
                  x={x}
                  y={y + 20}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill={isSelected ? '#38bdf8' : '#94a3b8'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {j.name.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Ambulance Icon Marker */}
          <g>
            <circle cx={ambX} cy={ambY} r={16} fill="#ef4444" fillOpacity="0.2">
              <animate attributeName="r" values="14;22;14" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx={ambX} cy={ambY} r={10} fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <text x={ambX} y={ambY + 3.5} textAnchor="middle" fontSize="9" fill="white">
              🚑
            </text>
            <text
              x={ambX}
              y={ambY - 14}
              textAnchor="middle"
              fontSize="8"
              fill="#ef4444"
              fontWeight="bold"
            >
              DL-01-EMS
            </text>
          </g>
        </svg>

        {/* Map Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Ambulance DL-01-EMS-4402</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Preempted Green Wave</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Active Digital Twin Node</span>
            </span>
          </div>
          <span className="text-slate-500">Total Route: 4.8 km (Connaught Place → LNJP Trauma)</span>
        </div>
      </div>
    </div>
  );
};
