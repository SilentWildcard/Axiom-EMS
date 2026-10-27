import React from 'react';
import type { Mission } from '../../api/types';
import { formatTimestamp } from '../../utils/formatters';
import { Ambulance, Clock } from 'lucide-react';

interface MissionHeaderProps {
  mission: Mission | null;
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  en_route: 'bg-[#0066cc]/20 text-[#00d4ff] border-[#0066cc]/40',
  approaching: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40',
  arrived: 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40',
  complete: 'bg-[#94a3b8]/20 text-[#94a3b8] border-[#94a3b8]/40',
};

const MissionHeader: React.FC<MissionHeaderProps> = ({ mission, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4 animate-pulse">
        <div className="h-6 bg-[#1e2a4a] rounded w-48" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4 text-[#94a3b8]">
        No active mission
      </div>
    );
  }

  const statusClass = statusColors[mission.status] ?? statusColors.en_route;

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#00d4ff]/10 rounded-lg">
          <Ambulance className="text-[#00d4ff]" size={24} />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl tracking-wide">{mission.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[#94a3b8] text-sm">Unit: <span className="text-[#00d4ff] font-mono">{mission.ambulance_id}</span></span>
            <span className="text-[#1e2a4a]">|</span>
            <span className="text-[#94a3b8] text-sm flex items-center gap-1">
              <Clock size={12} />
              Started: {formatTimestamp(mission.created_at)}
            </span>
          </div>
        </div>
      </div>
      <div className={`px-4 py-2 rounded-full border text-sm font-bold tracking-wider uppercase ${statusClass}`}>
        {mission.status.replace('_', ' ')}
      </div>
    </div>
  );
};

export default MissionHeader;
