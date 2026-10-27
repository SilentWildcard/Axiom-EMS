import React from 'react';
import type { Checkpoint } from '../../api/types';
import { MapPin, CheckCircle, Clock } from 'lucide-react';

interface CheckpointListProps {
  checkpoints: Checkpoint[];
  loading?: boolean;
}

const statusConfig = {
  passed: { color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/20', icon: CheckCircle, label: 'PASSED' },
  approaching: { color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/40', icon: Clock, label: 'APPROACHING' },
  pending: { color: 'text-[#4b5563]', bg: 'bg-transparent', border: 'border-[#1e2a4a]', icon: MapPin, label: 'PENDING' },
};

const CheckpointList: React.FC<CheckpointListProps> = ({ checkpoints, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4 space-y-2 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-12 bg-[#1e2a4a] rounded" />)}
      </div>
    );
  }

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4">
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <MapPin className="text-[#00d4ff]" size={16} />
        Checkpoints ({checkpoints.length})
      </h3>
      <div className="space-y-2">
        {checkpoints.map((cp, i) => {
          const cfg = statusConfig[cp.status] ?? statusConfig.pending;
          const Icon = cfg.icon;
          return (
            <div
              key={cp.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${cfg.bg} ${cfg.border} transition-all`}
            >
              <div className="text-[#4b5563] font-mono text-xs w-5 text-center">{i + 1}</div>
              <Icon size={14} className={cfg.color} />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{cp.name}</div>
                <div className="text-[#94a3b8] text-xs">{cp.distance_m}m from dispatch</div>
              </div>
              <div className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckpointList;
