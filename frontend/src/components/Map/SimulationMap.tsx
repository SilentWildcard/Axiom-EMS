import React from 'react';
import type { Checkpoint, SimulationState } from '../../api/types';

interface SimulationMapProps {
  checkpoints: Checkpoint[];
  simulationState: SimulationState | null;
}

const CP_COLORS: Record<string, string> = {
  pending: '#4b5563',
  approaching: '#f59e0b',
  passed: '#22c55e',
};

const SimulationMap: React.FC<SimulationMapProps> = ({ checkpoints, simulationState }) => {
  const sorted = [...checkpoints].sort((a, b) => a.sequence_order - b.sequence_order);
  const progress = simulationState?.progress_pct ?? 0;

  const SVG_WIDTH = 560;
  const SVG_HEIGHT = 160;
  const LINE_Y = 80;
  const LEFT_PAD = 40;
  const RIGHT_PAD = 40;
  const LINE_WIDTH = SVG_WIDTH - LEFT_PAD - RIGHT_PAD;

  const cpPositions = sorted.map((_, i) => ({
    x: LEFT_PAD + (i / Math.max(sorted.length - 1, 1)) * LINE_WIDTH,
    y: LINE_Y,
  }));

  // Ambulance X based on progress %
  const ambulanceX = LEFT_PAD + (progress / 100) * LINE_WIDTH;

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4 relative overflow-hidden">
      {/* SIMULATION MODE watermark */}
      <div className="absolute top-3 right-4 text-[#00d4ff]/20 text-xs font-bold tracking-widest select-none">
        SIMULATION MODE
      </div>
      <h3 className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider mb-2">Route Visualization</h3>
      <div className="overflow-x-auto">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="block"
          style={{ minWidth: SVG_WIDTH }}
        >
          {/* Background grid lines */}
          {[40, 80, 120].map(y => (
            <line key={y} x1={LEFT_PAD} y1={y} x2={SVG_WIDTH - RIGHT_PAD} y2={y}
              stroke="#1e2a4a" strokeWidth="1" strokeDasharray="4,4" />
          ))}

          {/* Route line (passed portion) */}
          <line
            x1={LEFT_PAD}
            y1={LINE_Y}
            x2={LEFT_PAD + (progress / 100) * LINE_WIDTH}
            y2={LINE_Y}
            stroke="#00d4ff"
            strokeWidth="3"
          />
          {/* Route line (remaining) */}
          <line
            x1={LEFT_PAD + (progress / 100) * LINE_WIDTH}
            y1={LINE_Y}
            x2={SVG_WIDTH - RIGHT_PAD}
            y2={LINE_Y}
            stroke="#1e2a4a"
            strokeWidth="3"
          />

          {/* Checkpoint nodes */}
          {sorted.map((cp, i) => {
            const { x, y } = cpPositions[i];
            const color = CP_COLORS[cp.status] ?? CP_COLORS.pending;
            return (
              <g key={cp.id}>
                {/* Outer ring for approaching */}
                {cp.status === 'approaching' && (
                  <circle cx={x} cy={y} r={14} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.4">
                    <animate attributeName="r" values="14;20;14" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={x} cy={y} r={9} fill={color} stroke="#0f1629" strokeWidth="2" />
                {cp.status === 'passed' && (
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="#0f1629" fontWeight="bold">✓</text>
                )}
                {/* Label */}
                <text
                  x={x}
                  y={y + 26}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#94a3b8"
                  fontFamily="monospace"
                >
                  {cp.name.length > 10 ? cp.name.slice(0, 9) + '…' : cp.name}
                </text>
                <text x={x} y={y + 38} textAnchor="middle" fontSize="8" fill={color} fontFamily="monospace">
                  {cp.status.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Ambulance indicator (triangle/chevron) */}
          <g className="ambulance-pulse">
            {/* Glow */}
            <circle cx={ambulanceX} cy={LINE_Y} r={14} fill="#00d4ff" opacity="0.15">
              <animate attributeName="r" values="14;20;14" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0;0.15" dur="1s" repeatCount="indefinite" />
            </circle>
            {/* Ambulance body */}
            <polygon
              points={`${ambulanceX},${LINE_Y - 10} ${ambulanceX - 7},${LINE_Y + 7} ${ambulanceX + 7},${LINE_Y + 7}`}
              fill="#00d4ff"
              stroke="white"
              strokeWidth="1.5"
            />
            {/* Cross symbol */}
            <text x={ambulanceX} y={LINE_Y + 4} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">+</text>
          </g>

          {/* Progress label */}
          <text x={ambulanceX} y={LINE_Y - 18} textAnchor="middle" fontSize="9" fill="#00d4ff" fontFamily="monospace">
            {Math.round(progress)}%
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-[#94a3b8]">
        {['pending', 'approaching', 'passed'].map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: CP_COLORS[s] }} />
            <span className="capitalize">{s}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#00d4ff]" />
          <span>Ambulance</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationMap;
