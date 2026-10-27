import React from 'react';
import type { AlertEvent, Checkpoint } from '../../api/types';
import { Bell, Clock } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

interface AlertHistoryProps {
  alerts: AlertEvent[];
  checkpoints: Checkpoint[];
  limit?: number;
}

const AlertHistory: React.FC<AlertHistoryProps> = ({ alerts, checkpoints, limit = 10 }) => {
  const cpMap = Object.fromEntries(checkpoints.map(c => [c.id, c.name]));
  const sorted = [...alerts].sort((a, b) =>
    new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
  ).slice(0, limit);

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="text-[#f59e0b]" size={16} />
        <h3 className="text-white font-semibold text-sm">Alert History</h3>
        <span className="ml-auto bg-[#1e2a4a] text-[#94a3b8] text-xs px-2 py-0.5 rounded-full">
          {alerts.length} total
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-[#94a3b8] text-sm text-center py-6">No alerts yet</div>
      ) : (
        <div className="space-y-2">
          {sorted.map(alert => (
            <div key={alert.id} className="flex items-center gap-3 p-2.5 bg-[#0a0e1a] rounded-lg border border-[#1e2a4a]">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                alert.stage === 1 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">
                  {cpMap[alert.checkpoint_id] ?? alert.checkpoint_id}
                </div>
                <div className="text-[#94a3b8] text-xs">
                  Stage {alert.stage} — {alert.stage === 1 ? 'Approaching' : 'Arrival'}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#4b5563] text-xs flex-shrink-0">
                <Clock size={10} />
                {formatTimestamp(alert.triggered_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertHistory;
