import React, { useState } from 'react';
import type { Checkpoint, AlertEvent } from '../../api/types';
import { Navigation, CheckCircle2, Clock } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

interface CheckpointAlertProps {
  checkpoints: Checkpoint[];
  onStage1: (checkpointId: string) => void;
  onStage2: (checkpointId: string) => void;
  alerts: AlertEvent[];
}

const CheckpointAlert: React.FC<CheckpointAlertProps> = ({
  checkpoints, onStage1, onStage2, alerts,
}) => {
  const [stageTimestamps, setStageTimestamps] = useState<Record<string, { s1?: string; s2?: string }>>({});

  const approaching = checkpoints.find(cp => cp.status === 'approaching');
  const pending = checkpoints.filter(cp => cp.status === 'pending');

  const markStage1 = (cp: Checkpoint) => {
    const ts = new Date().toISOString();
    setStageTimestamps(prev => ({ ...prev, [cp.id]: { ...prev[cp.id], s1: ts } }));
    onStage1(cp.id);
  };

  const markStage2 = (cp: Checkpoint) => {
    const ts = new Date().toISOString();
    setStageTimestamps(prev => ({ ...prev, [cp.id]: { ...prev[cp.id], s2: ts } }));
    onStage2(cp.id);
  };

  const ts = approaching ? stageTimestamps[approaching.id] : null;

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="text-[#00d4ff]" size={16} />
        <h3 className="text-white font-semibold text-sm">Checkpoint Workflow</h3>
      </div>

      {approaching ? (
        <div className="border border-[#f59e0b]/40 bg-[#f59e0b]/5 rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[#f59e0b] font-bold text-sm">CURRENT: {approaching.name}</div>
              <div className="text-[#94a3b8] text-xs mt-0.5">{approaching.distance_m}m from dispatch</div>
            </div>
            <div className="text-[#f59e0b] text-xs font-mono">APPROACHING</div>
          </div>

          {/* Stage 1 */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => markStage1(approaching)}
                disabled={!!ts?.s1}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  ts?.s1
                    ? 'bg-[#22c55e]/10 text-[#22c55e] cursor-default'
                    : 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/40 hover:bg-[#f59e0b]/20'
                }`}
              >
                {ts?.s1 ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                {ts?.s1 ? 'Approaching Marked' : 'Mark Approaching'}
              </button>
              {ts?.s1 && (
                <span className="text-[#22c55e] text-xs flex items-center gap-1">
                  <Clock size={10} /> {formatTimestamp(ts.s1)}
                </span>
              )}
            </div>
          </div>

          {/* Stage 2 */}
          <div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => markStage2(approaching)}
                disabled={!ts?.s1 || !!ts?.s2}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  ts?.s2
                    ? 'bg-[#22c55e]/10 text-[#22c55e] cursor-default'
                    : !ts?.s1
                    ? 'bg-[#1e2a4a] text-[#4b5563] cursor-not-allowed'
                    : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/40 hover:bg-[#ef4444]/20'
                }`}
              >
                {ts?.s2 ? <CheckCircle2 size={14} /> : <Navigation size={14} />}
                {ts?.s2 ? 'Passage Confirmed' : 'Confirm Passage'}
              </button>
              {ts?.s2 && (
                <span className="text-[#22c55e] text-xs flex items-center gap-1">
                  <Clock size={10} /> {formatTimestamp(ts.s2)}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[#94a3b8] text-sm text-center py-4 border border-[#1e2a4a] rounded-lg">
          No checkpoint approaching — advance simulation
        </div>
      )}

      {/* Upcoming */}
      {pending.length > 0 && (
        <div>
          <div className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider mb-2">Upcoming</div>
          {pending.slice(0, 3).map(cp => (
            <div key={cp.id} className="flex items-center gap-2 text-xs text-[#4b5563] py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4b5563]" />
              {cp.name}
              <span className="ml-auto text-[#4b5563]">{cp.distance_m}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckpointAlert;
