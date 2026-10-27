import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Square, Play, AlertTriangle, Info } from 'lucide-react';
import { useAudio, type SirenStatus } from '../../hooks/useAudio';
import type { AlertConfig } from '../../api/types';

interface SirenControlProps {
  config: AlertConfig | null;
  onConfigChange?: (cfg: AlertConfig) => void;
  onAlertTriggered?: (durationS: number) => void;
}

const DURATION_OPTIONS = [5, 10, 15, 30];
const LEAD_TIME_OPTIONS = [15, 30, 60, 120];

const statusLabels: Record<SirenStatus, { label: string; color: string; bg: string }> = {
  idle:      { label: 'IDLE',      color: 'text-[#94a3b8]', bg: 'bg-[#94a3b8]/10' },
  armed:     { label: 'ARMED',     color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10' },
  playing:   { label: 'PLAYING',   color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10' },
  completed: { label: 'COMPLETED', color: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10' },
  cancelled: { label: 'CANCELLED', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10' },
};

const SirenControl: React.FC<SirenControlProps> = ({ config, onConfigChange, onAlertTriggered }) => {
  const [enabled, setEnabled] = useState(config?.siren_enabled ?? true);
  const [durationS, setDurationS] = useState(config?.siren_duration_s ?? 10);
  const [leadTimeS, setLeadTimeS] = useState(config?.lead_time_s ?? 30);
  const [volume, setVolume] = useState(config?.volume ?? 0.6);

  const { status, remainingS, blocked, play, stop } = useAudio(volume, durationS);

  // Sync config from props when it changes
  useEffect(() => {
    if (config) {
      setEnabled(config.siren_enabled);
      setDurationS(config.siren_duration_s);
      setLeadTimeS(config.lead_time_s);
      setVolume(config.volume);
    }
  }, [config]);

  const handleConfigUpdate = (partial: Partial<AlertConfig>) => {
    const updated: AlertConfig = {
      siren_enabled: enabled,
      siren_duration_s: durationS,
      lead_time_s: leadTimeS,
      volume,
      ...partial,
    };
    onConfigChange?.(updated);
  };

  const handleTest = () => {
    if (!enabled || status === 'playing') return;
    play();
    onAlertTriggered?.(durationS);
  };

  const isPlaying = status === 'playing';
  const statusMeta = statusLabels[status];

  return (
    <div className={`bg-[#0f1629] rounded-xl border p-5 transition-all duration-300 ${
      isPlaying
        ? 'border-[#ef4444]/60 siren-active'
        : 'border-[#1e2a4a]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className={isPlaying ? 'text-[#ef4444] animate-bounce' : 'text-[#00d4ff]'} size={20} />
          <h3 className="text-white font-bold text-base">Siren Control</h3>
        </div>
        {/* Enable/disable toggle */}
        <button
          onClick={() => {
            const newVal = !enabled;
            setEnabled(newVal);
            handleConfigUpdate({ siren_enabled: newVal });
          }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border font-bold text-sm transition-all ${
            enabled
              ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/40'
              : 'bg-[#94a3b8]/10 text-[#94a3b8] border-[#94a3b8]/30'
          }`}
        >
          {enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {enabled ? 'ARMED' : 'DISABLED'}
        </button>
      </div>

      {/* Status badge + countdown */}
      <div className={`flex items-center justify-between mb-5 p-3 rounded-lg ${statusMeta.bg}`}>
        <div className={`font-bold text-sm ${statusMeta.color}`}>
          STATUS: {statusMeta.label}
        </div>
        {isPlaying && (
          <div className="text-[#ef4444] font-mono text-2xl font-bold">
            {remainingS}s
          </div>
        )}
      </div>

      {/* Visual flash ring when playing */}
      {isPlaying && (
        <div className="flex justify-center mb-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full bg-[#ef4444]/20 animate-ping" />
            <div className="absolute w-14 h-14 rounded-full bg-[#ef4444]/30 animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-[#ef4444] flex items-center justify-center z-10">
              <Volume2 className="text-white" size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Duration selector */}
      <div className="mb-4">
        <label className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider mb-2 block">
          Siren Duration
        </label>
        <div className="flex gap-2 flex-wrap">
          {DURATION_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => {
                setDurationS(d);
                handleConfigUpdate({ siren_duration_s: d });
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                durationS === d
                  ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/50'
                  : 'text-[#94a3b8] border-[#1e2a4a] hover:border-[#94a3b8]/40'
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Lead time selector */}
      <div className="mb-4">
        <label className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider mb-2 block">
          Lead Time Before Checkpoint
        </label>
        <div className="flex gap-2 flex-wrap">
          {LEAD_TIME_OPTIONS.map(lt => (
            <button
              key={lt}
              onClick={() => {
                setLeadTimeS(lt);
                handleConfigUpdate({ lead_time_s: lt });
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                leadTimeS === lt
                  ? 'bg-[#0066cc]/20 text-[#00d4ff] border-[#0066cc]/50'
                  : 'text-[#94a3b8] border-[#1e2a4a] hover:border-[#94a3b8]/40'
              }`}
            >
              {lt >= 60 ? `${lt / 60}m` : `${lt}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Volume slider */}
      <div className="mb-5">
        <label className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Volume</span>
          <span className="text-[#00d4ff] font-mono">{Math.round(volume * 100)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={80}
          value={Math.round(volume * 100)}
          onChange={e => {
            const v = parseInt(e.target.value) / 100;
            setVolume(v);
            handleConfigUpdate({ volume: v });
          }}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00d4ff ${Math.round(volume * 100)}%, #1e2a4a ${Math.round(volume * 100)}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#4b5563] mt-1">
          <span>0%</span>
          <span className="text-[#94a3b8] text-xs">(max 80% — browser-safe)</span>
          <span>80%</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleTest}
          disabled={!enabled || isPlaying}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
            !enabled || isPlaying
              ? 'bg-[#1e2a4a] text-[#4b5563] cursor-not-allowed'
              : 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/40 hover:bg-[#00d4ff]/20'
          }`}
        >
          <Play size={14} />
          Test Siren
        </button>
        <button
          onClick={stop}
          disabled={!isPlaying}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
            isPlaying
              ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/40 hover:bg-[#ef4444]/20'
              : 'bg-[#1e2a4a] text-[#4b5563] cursor-not-allowed'
          }`}
        >
          <Square size={14} />
          Stop
        </button>
      </div>

      {/* Browser permission note */}
      {blocked && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
          <Info className="text-[#f59e0b] mt-0.5 flex-shrink-0" size={14} />
          <p className="text-[#f59e0b] text-xs">
            Audio blocked by browser autoplay policy. Click anywhere on the page first, then try again.
          </p>
        </div>
      )}
    </div>
  );
};

export default SirenControl;
