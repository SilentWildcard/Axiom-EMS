import React from 'react';
import { HardwareDeviceState } from './types';
import { Monitor, Zap, SunMedium, Sparkles } from 'lucide-react';

interface Props {
  device: HardwareDeviceState;
  onTogglePower: () => void;
  stage: number;
  etaSeconds: number;
}

export const LEDMatrixModule: React.FC<Props> = ({
  device,
  onTogglePower,
  stage,
  etaSeconds,
}) => {
  const isOnline = device.powerOn && device.status !== 'offline';
  const etaMins = Math.floor(etaSeconds / 60);
  const etaSecs = (etaSeconds % 60).toString().padStart(2, '0');

  // Dynamic message based on simulation stage
  let line1 = 'DELHI TRAFFIC POLICE';
  let line2 = 'ROUTE: NORMAL FLOW';
  let textColor = '#f59e0b'; // amber
  let isFlashing = false;

  switch (stage) {
    case 1:
      line1 = 'DELHI TRAFFIC POLICE';
      line2 = 'SPEED LIMIT: 50 KM/H';
      textColor = '#f59e0b';
      break;
    case 2:
      line1 = 'EMERGENCY DISPATCH';
      line2 = 'AMBULANCE INBOUND';
      textColor = '#f59e0b';
      isFlashing = true;
      break;
    case 3:
      line1 = 'PRIORITY CORRIDOR ACTIVE';
      line2 = `EMS ETA: ${etaMins}:${etaSecs}`;
      textColor = '#ef4444';
      isFlashing = true;
      break;
    case 4:
      line1 = '🚨 AMBULANCE APPROACHING 🚨';
      line2 = 'PULL OVER • KEEP ROUTE CLEAR';
      textColor = '#ef4444';
      isFlashing = true;
      break;
    case 5:
      line1 = '🚨 AMBULANCE PASSING 🚨';
      line2 = 'DO NOT BLOCK INTERSECTION';
      textColor = '#ef4444';
      isFlashing = true;
      break;
    case 6:
      line1 = 'AMBULANCE PASSED';
      line2 = 'RESUME NORMAL FLOW';
      textColor = '#10b981';
      break;
  }

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            !isOnline ? 'bg-slate-900 border-slate-800 text-slate-600'
            : isFlashing ? 'bg-red-500/10 border-red-500/40 text-red-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <Monitor size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{device.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                P10 64x32 VMS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{device.role}</p>
          </div>
        </div>

        {/* Status & Power */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${
            !isOnline ? 'bg-slate-900 text-slate-500 border-slate-800'
            : isFlashing ? 'bg-red-950/80 text-red-300 border-red-500/50 animate-pulse'
            : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline ? 'bg-slate-600' : isFlashing ? 'bg-red-400 animate-ping' : 'bg-amber-400'
            }`} />
            {isFlashing ? 'WARNING DISPLAY' : isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>

          <button
            onClick={onTogglePower}
            title={device.powerOn ? 'Turn Off Display' : 'Turn On Display'}
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

      {/* Realistic Outdoor Dot-Matrix Screen Enclosure */}
      <div className="my-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-lg font-mono text-[11px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            HUB75 Direct Outdoor Variable Message Sign
          </span>
          <span className="text-[9px] text-amber-400 flex items-center gap-1">
            <SunMedium size={11} /> 92% Sunlight Luminance
          </span>
        </div>

        {/* Realistic LED Dot-Matrix Bezel */}
        <div className="bg-black border-4 border-neutral-800 rounded-lg p-3 shadow-inner relative overflow-hidden">
          {/* Subtle LED dot grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '4px 4px',
            }}
          />

          {isOnline ? (
            <div className={`flex flex-col items-center justify-center py-2 text-center select-none ${
              isFlashing ? 'animate-pulse' : ''
            }`}>
              <div
                className="text-xs sm:text-sm font-black tracking-widest uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                style={{ color: textColor, textShadow: `0 0 10px ${textColor}` }}
              >
                {line1}
              </div>
              <div
                className="text-xs font-bold tracking-wider mt-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                style={{ color: textColor, textShadow: `0 0 8px ${textColor}` }}
              >
                {line2}
              </div>
            </div>
          ) : (
            <div className="py-5 text-center text-slate-700 text-xs font-mono">
              [VMS DISPLAY MATRIX POWERED OFF]
            </div>
          )}
        </div>
      </div>

      {/* Display Specifications */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono my-1">
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Resolution</span>
          <span className="text-xs font-bold text-amber-400">64 x 32 DIP LEDs</span>
          <span className="text-[9px] text-slate-500 block">P10 10mm Pitch</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Interface</span>
          <span className="text-xs font-bold text-cyan-300">HUB75 / RS-485</span>
          <span className="text-[9px] text-slate-500 block">From ESP32</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Legibility Dist</span>
          <span className="text-xs font-bold text-emerald-400">150 meters</span>
          <span className="text-[9px] text-slate-500 block">Day & Night Spec</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="font-mono">SIMULATED TELEMETRY [NON-PHYSICAL EMULATION]</span>
        <span className="font-mono text-slate-400">Outdoor VMS Panel</span>
      </div>
    </div>
  );
};
