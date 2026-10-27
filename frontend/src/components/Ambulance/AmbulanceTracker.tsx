import React from 'react';
import type { SimulationState } from '../../api/types';
import { Ambulance, Gauge } from 'lucide-react';

interface AmbulanceTrackerProps {
  state: SimulationState | null;
  loading?: boolean;
}

const AmbulanceTracker: React.FC<AmbulanceTrackerProps> = ({ state, loading }) => {
  if (loading || !state) {
    return (
      <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4 animate-pulse">
        <div className="h-4 bg-[#1e2a4a] rounded w-32 mb-3" />
        <div className="h-8 bg-[#1e2a4a] rounded" />
      </div>
    );
  }

  const progressArc = (state.progress_pct / 100) * 283; // circumference of r=45

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4">
      <div className="flex items-center gap-2 mb-4">
        <Ambulance className="text-[#00d4ff]" size={18} />
        <h3 className="text-white font-semibold text-sm">Ambulance AMB-042</h3>
        <div className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
          state.active ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#94a3b8]/20 text-[#94a3b8]'
        }`}>
          {state.active ? 'IN MOTION' : 'STANDBY'}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1e2a4a" strokeWidth="8" />
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progressArc} ${283 - progressArc}`}
              strokeDashoffset="70.75"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            <text x="50" y="54" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold" fontFamily="monospace">
              {Math.round(state.progress_pct)}%
            </text>
          </svg>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[#94a3b8] text-sm flex items-center gap-1">
              <Gauge size={13} /> Speed
            </span>
            <span className="text-[#00d4ff] font-mono font-bold">{state.speed_kmh} km/h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#94a3b8] text-sm">Progress</span>
            <span className="text-white font-mono">{state.progress_pct.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#94a3b8] text-sm">Next CP</span>
            <span className="text-[#f59e0b] font-mono">#{state.current_checkpoint_idx + 1}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-[#1e2a4a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00d4ff] rounded-full transition-all duration-500"
              style={{ width: `${state.progress_pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceTracker;
