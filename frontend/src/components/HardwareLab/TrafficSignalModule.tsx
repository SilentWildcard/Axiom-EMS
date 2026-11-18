import React from 'react';
import { HardwareDeviceState } from './types';
import { ShieldAlert, Zap, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  device: HardwareDeviceState;
  onTogglePower: () => void;
  currentColor: 'red' | 'amber' | 'green';
  countdown: number;
  stage: number;
  junctionName: string;
}

export const TrafficSignalModule: React.FC<Props> = ({
  device,
  onTogglePower,
  currentColor,
  countdown,
  stage,
  junctionName,
}) => {
  const isOnline = device.powerOn && device.status !== 'offline';
  const isPriorityActive = stage >= 4 && stage <= 5;

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            !isOnline ? 'bg-slate-900 border-slate-800 text-slate-600'
            : isPriorityActive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{device.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                ITC-300 Solid-State
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{device.role}</p>
          </div>
        </div>

        {/* Status & Power */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${
            !isOnline ? 'bg-slate-900 text-slate-500 border-slate-800'
            : isPriorityActive ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 animate-pulse'
            : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline ? 'bg-slate-600' : isPriorityActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            {isPriorityActive ? 'GREEN WAVE LOCKED' : isOnline ? 'CYCLE RUNNING' : 'OFFLINE'}
          </span>

          <button
            onClick={onTogglePower}
            title={device.powerOn ? 'Turn Off Signal' : 'Turn On Signal'}
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

      {/* Realistic 3-Aspect Traffic Signal Head Graphic */}
      <div className="my-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-lg font-mono text-[11px]">
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Traffic Signal Chassis Illustration */}
          <div className="col-span-4 flex justify-center">
            <div className="w-16 bg-gradient-to-b from-slate-900 via-neutral-900 to-black p-2 rounded-2xl border-2 border-neutral-700 shadow-2xl flex flex-col items-center gap-2.5">
              {/* Hood visor on top */}
              <div className="w-10 h-1 bg-neutral-600 rounded-full" />

              {/* RED LIGHT */}
              <div className="relative group">
                <div className="w-10 h-10 rounded-full border-2 border-neutral-700 bg-neutral-950 flex items-center justify-center p-0.5">
                  <div
                    className={`w-full h-full rounded-full transition-all duration-300 ${
                      isOnline && currentColor === 'red'
                        ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] border border-red-300'
                        : 'bg-red-950/40 border border-neutral-800'
                    }`}
                  />
                </div>
              </div>

              {/* AMBER LIGHT */}
              <div className="relative group">
                <div className="w-10 h-10 rounded-full border-2 border-neutral-700 bg-neutral-950 flex items-center justify-center p-0.5">
                  <div
                    className={`w-full h-full rounded-full transition-all duration-300 ${
                      isOnline && currentColor === 'amber'
                        ? 'bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] border border-amber-200'
                        : 'bg-amber-950/40 border border-neutral-800'
                    }`}
                  />
                </div>
              </div>

              {/* GREEN LIGHT */}
              <div className="relative group">
                <div className="w-10 h-10 rounded-full border-2 border-neutral-700 bg-neutral-950 flex items-center justify-center p-0.5">
                  <div
                    className={`w-full h-full rounded-full transition-all duration-300 ${
                      isOnline && currentColor === 'green'
                        ? 'bg-emerald-400 shadow-[0_0_24px_rgba(52,211,153,1)] border border-emerald-200 animate-pulse'
                        : 'bg-emerald-950/40 border border-neutral-800'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Phase Controller Status & Priority Reason */}
          <div className="col-span-8 flex flex-col justify-between h-36">
            <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>ACTIVE ASPECT:</span>
                <span className={`font-black text-xs ${
                  currentColor === 'green' ? 'text-emerald-400' : currentColor === 'amber' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {currentColor.toUpperCase()} ({countdown}s)
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400">
                <span>Phase Mode:</span>
                <span className={isPriorityActive ? 'text-emerald-300 font-bold' : 'text-slate-300'}>
                  {isPriorityActive ? 'AMBULANCE PREEMPTION' : 'FIXED-TIME ACTUATED'}
                </span>
              </div>
            </div>

            {/* Why priority was given */}
            <div className={`p-2 rounded border text-[10px] ${
              isPriorityActive
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-1 font-bold mb-0.5 text-[9px] uppercase tracking-wider text-slate-300">
                <CheckCircle2 size={11} className={isPriorityActive ? 'text-emerald-400' : 'text-slate-500'} />
                <span>Priority Decision Matrix</span>
              </div>
              <p className="text-[10px] leading-tight">
                {isPriorityActive
                  ? `Junction [${junctionName}] preemption granted: Emergency Cardiac Unit DL-01-EMS inbound on Vikas Marg corridor.`
                  : 'Operating in standard cyclic phase. Conflicting pedestrian and cross traffic flow scheduled normally.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Relays & Actuation Telemetry */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono my-1">
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Relay K1 (Green)</span>
          <span className={`text-xs font-bold ${currentColor === 'green' ? 'text-emerald-400' : 'text-slate-500'}`}>
            {currentColor === 'green' ? 'ENERGIZED (3.3V)' : 'DE-ENERGIZED'}
          </span>
          <span className="text-[9px] text-slate-500 block">Solid State</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Cross-Traffic</span>
          <span className={`text-xs font-bold ${isPriorityActive ? 'text-red-400' : 'text-amber-400'}`}>
            {isPriorityActive ? 'LOCKED RED' : 'ACTIVE CYCLE'}
          </span>
          <span className="text-[9px] text-slate-500 block">Safety Interlock</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Post-Passage</span>
          <span className="text-xs font-bold text-cyan-300">
            {stage === 6 ? 'CLEARANCE (4s)' : 'AUTO-RESTORE'}
          </span>
          <span className="text-[9px] text-slate-500 block">Fail-Safe IRC:93</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="font-mono">SIMULATED TELEMETRY [NON-PHYSICAL EMULATION]</span>
        <span className="font-mono text-slate-400">IRC NEMA TS-2 Spec</span>
      </div>
    </div>
  );
};
