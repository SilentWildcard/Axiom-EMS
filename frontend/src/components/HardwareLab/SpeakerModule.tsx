import React from 'react';
import { HardwareDeviceState } from './types';
import { Volume2, VolumeX, Zap, Play, Square, Sliders, BellRing } from 'lucide-react';

interface Props {
  device: HardwareDeviceState;
  onTogglePower: () => void;
  isPlaying: boolean;
  onTestSound: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  durationSec: number;
  onDurationChange: (dur: number) => void;
  soundEnabled: boolean;
  onToggleSoundEnabled: () => void;
  stage: number;
}

export const SpeakerModule: React.FC<Props> = ({
  device,
  onTogglePower,
  isPlaying,
  onTestSound,
  volume,
  onVolumeChange,
  durationSec,
  onDurationChange,
  soundEnabled,
  onToggleSoundEnabled,
  stage,
}) => {
  const isOnline = device.powerOn && device.status !== 'offline';

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            !isOnline ? 'bg-slate-900 border-slate-800 text-slate-600'
            : isPlaying ? 'bg-red-500/10 border-red-500/40 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {isPlaying ? <BellRing size={18} className="animate-bounce" /> : <Volume2 size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{device.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                MAX98357A I2S + Horn
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{device.role}</p>
          </div>
        </div>

        {/* Status & Power */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${
            !isOnline ? 'bg-slate-900 text-slate-500 border-slate-800'
            : isPlaying ? 'bg-red-950/80 text-red-300 border-red-500/50 animate-pulse'
            : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline ? 'bg-slate-600' : isPlaying ? 'bg-red-400 animate-ping' : 'bg-emerald-400'
            }`} />
            {isPlaying ? 'ACTIVE SIREN 108 dB' : isOnline ? 'ARMED / STANDBY' : 'OFFLINE'}
          </span>

          <button
            onClick={onTogglePower}
            title={device.powerOn ? 'Turn Off Speaker' : 'Turn On Speaker'}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
              device.powerOn
                ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Zap size={14} />
          </button>
        </div>
      </div>

      {/* Realistic Horn Speaker & Sound Waves Graphic */}
      <div className="my-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-lg font-mono text-[11px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            Acoustic Horn Transducer & I2S DAC Waveform
          </span>
          <span className="text-[9px] text-slate-400">
            Freq: 680 Hz / 1020 Hz Dual Tone
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/70">
          {/* Horn Speaker Icon Graphic */}
          <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 flex flex-col items-center justify-center relative shadow-inner">
            <Volume2 size={24} className={isPlaying ? 'text-red-400 animate-pulse' : 'text-slate-500'} />
            <span className="text-[8px] text-slate-400 mt-1">100W HORN</span>
          </div>

          {/* Sound Waves & SPL Decibel Meter */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Sound Pressure Level:</span>
              <span className={`font-bold ${isPlaying ? 'text-red-400' : 'text-slate-500'}`}>
                {isPlaying ? '108 dB @ 1m (Active Siren)' : '0 dB (Muted)'}
              </span>
            </div>

            {/* SPL Level meter bar */}
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  isPlaying ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500' : 'bg-slate-800'
                }`}
                style={{ width: isPlaying ? `${Math.min(100, volume * 100)}%` : '0%' }}
              />
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span>Auto-Shutoff Timer:</span>
              <span className="text-cyan-300">{durationSec}s timeout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls: Play/Stop Alert, Volume Slider, Duration Selector */}
      <div className="space-y-2 text-xs font-mono my-1">
        <div className="flex items-center gap-2">
          {/* Play/Stop Button (Web Audio API) */}
          <button
            onClick={onTestSound}
            disabled={!isOnline}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              !isOnline
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                : isPlaying
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Square size={13} /> Stop Alert Sound
              </>
            ) : (
              <>
                <Play size={13} /> Test Emergency Siren Tone
              </>
            )}
          </button>

          {/* Auto Sound Toggle */}
          <button
            onClick={onToggleSoundEnabled}
            className={`py-2 px-3 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all ${
              soundEnabled
                ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
            title="When enabled, siren plays automatically during Stage 4"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>Auto: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Volume & Duration Sliders */}
        <div className="grid grid-cols-2 gap-2 bg-[#080d1a] border border-slate-800/80 rounded p-2 text-[10px]">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Tone Volume</span>
              <span className="text-cyan-300">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => onVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Duration</span>
              <span className="text-amber-300">{durationSec}s</span>
            </div>
            <select
              value={durationSec}
              onChange={e => onDurationChange(parseInt(e.target.value, 10))}
              className="w-full bg-slate-900 border border-slate-800 rounded text-slate-200 px-1.5 py-0.5 text-[10px]"
            >
              <option value={3}>3 Seconds</option>
              <option value={6}>6 Seconds</option>
              <option value={10}>10 Seconds</option>
              <option value={15}>15 Seconds</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="font-mono">WEB AUDIO SYNTHESIS [BROWSER-SAFE]</span>
        <span className="font-mono text-slate-400">MAX98357A I2S Node</span>
      </div>
    </div>
  );
};
