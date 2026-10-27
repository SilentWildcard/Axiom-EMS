import React, { useState } from 'react';
import type { AlertEvent, Checkpoint } from '../../api/types';
import { ShieldCheck, Bell, CheckCircle2 } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

interface AcknowledgementPanelProps {
  alerts: AlertEvent[];
  checkpoints: Checkpoint[];
}

interface AckEntry {
  alertId: string;
  cpName: string;
  triggeredAt: string;
  acked: boolean;
  ackedAt?: string;
}

const AcknowledgementPanel: React.FC<AcknowledgementPanelProps> = ({ alerts, checkpoints }) => {
  const cpMap = Object.fromEntries(checkpoints.map(c => [c.id, c.name]));
  const [acked, setAcked] = useState<Record<string, string>>({});

  // Only show stage 1 (approaching) alerts as pending acknowledgements
  const pending: AckEntry[] = alerts
    .filter(a => a.stage === 1)
    .map(a => ({
      alertId: a.id,
      cpName: cpMap[a.checkpoint_id] ?? a.checkpoint_id,
      triggeredAt: a.triggered_at,
      acked: !!acked[a.id],
      ackedAt: acked[a.id],
    }));

  const allAcked = pending.every(e => e.acked);

  const acknowledge = (alertId: string) => {
    setAcked(prev => ({ ...prev, [alertId]: new Date().toISOString() }));
  };

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="text-[#00d4ff]" size={18} />
        <h3 className="text-white font-semibold text-sm">Police Acknowledgements</h3>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
          allAcked ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'
        }`}>
          {allAcked ? 'ALL CLEAR' : `${pending.filter(p => !p.acked).length} PENDING`}
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-[#22c55e]">
          <CheckCircle2 size={32} className="mb-2" />
          <div className="font-semibold text-sm">All Clear</div>
          <div className="text-xs text-[#94a3b8] mt-1">No pending acknowledgements</div>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map(entry => (
            <div
              key={entry.alertId}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                entry.acked
                  ? 'bg-[#22c55e]/5 border-[#22c55e]/20'
                  : 'bg-[#f59e0b]/5 border-[#f59e0b]/30'
              }`}
            >
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{entry.cpName}</div>
                <div className="text-[#94a3b8] text-xs flex items-center gap-1 mt-0.5">
                  <Bell size={10} />
                  Alert: {formatTimestamp(entry.triggeredAt)}
                </div>
                {entry.acked && entry.ackedAt && (
                  <div className="text-[#22c55e] text-xs mt-0.5">
                    ✓ Acked: {formatTimestamp(entry.ackedAt)}
                  </div>
                )}
              </div>
              {entry.acked ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22c55e]/10 text-[#22c55e] rounded-lg text-xs font-bold">
                  <CheckCircle2 size={12} />
                  ACKNOWLEDGED
                </div>
              ) : (
                <button
                  onClick={() => acknowledge(entry.alertId)}
                  className="px-3 py-1.5 bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/40 rounded-lg text-xs font-bold hover:bg-[#f59e0b]/20 transition-all"
                >
                  ACKNOWLEDGE
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcknowledgementPanel;
