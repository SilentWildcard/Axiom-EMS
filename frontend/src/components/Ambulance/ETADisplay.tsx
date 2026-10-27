import React from 'react';
import type { ETAResponse } from '../../api/types';
import { Clock, AlertCircle } from 'lucide-react';
import { formatETA, formatDistance } from '../../utils/eta';

interface ETADisplayProps {
  eta: ETAResponse | null;
  error?: string | null;
}

const ETADisplay: React.FC<ETADisplayProps> = ({ eta, error }) => {
  if (error) {
    return (
      <div className="bg-[#0f1629] rounded-xl border border-[#ef4444]/30 p-4">
        <div className="flex items-center gap-2 text-[#ef4444] text-sm">
          <AlertCircle size={14} />
          <span>ETA unavailable — backend offline</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="text-[#00d4ff]" size={16} />
        <h3 className="text-white font-semibold text-sm">ETA to Destination</h3>
      </div>

      {eta ? (
        <div>
          <div className="text-4xl font-mono font-bold text-[#00d4ff] mb-2">
            {formatETA(eta.eta_s)}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-[#0a0e1a] rounded-lg p-2.5">
              <div className="text-[#94a3b8] text-xs">Remaining Distance</div>
              <div className="text-white font-mono text-sm mt-0.5">
                {formatDistance(eta.remaining_distance_m)}
              </div>
            </div>
            <div className="bg-[#0a0e1a] rounded-lg p-2.5">
              <div className="text-[#94a3b8] text-xs">Speed</div>
              <div className="text-white font-mono text-sm mt-0.5">{eta.speed_kmh} km/h</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-[#4b5563] font-mono">
            Formula: {eta.formula}
          </div>
        </div>
      ) : (
        <div className="animate-pulse">
          <div className="h-10 bg-[#1e2a4a] rounded w-24" />
        </div>
      )}
    </div>
  );
};

export default ETADisplay;
