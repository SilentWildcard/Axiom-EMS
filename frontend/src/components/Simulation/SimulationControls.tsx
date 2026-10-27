import React from 'react';
import type { SimulationState } from '../../api/types';
import { Play, Square, FastForward, RefreshCw, Gauge } from 'lucide-react';

interface SimulationControlsProps {
  state: SimulationState | null;
  onStart: () => void;
  onStop: () => void;
  onAdvance: () => void;
  onReset: () => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  state, onStart, onStop, onAdvance, onReset,
}) => {
  const active = state?.active ?? false;

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="text-[#00d4ff]" size={16} />
        <h3 className="text-white font-semibold text-sm">Simulation Controls</h3>
        <div className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#94a3b8]/10 text-[#94a3b8]'
        }`}>
          {active ? '● ACTIVE' : '○ IDLE'}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={active ? onStop : onStart}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            active
              ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/40 hover:bg-[#ef4444]/20'
              : 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/40 hover:bg-[#22c55e]/20'
          }`}
        >
          {active ? <Square size={13} /> : <Play size={13} />}
          {active ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={onAdvance}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/40 hover:bg-[#00d4ff]/20 transition-all"
        >
          <FastForward size={13} />
          Advance
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/40 hover:bg-[#f59e0b]/20 transition-all"
        >
          <RefreshCw size={13} />
          Reset
        </button>
      </div>

      {state && (
        <div className="mt-3 text-xs text-[#94a3b8] font-mono">
          Speed: {state.speed_kmh} km/h | Progress: {state.progress_pct.toFixed(1)}% | Next CP: #{state.current_checkpoint_idx + 1}
        </div>
      )}
    </div>
  );
};

export default SimulationControls;
