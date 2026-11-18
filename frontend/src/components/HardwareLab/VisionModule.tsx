import React from 'react';
import { HardwareDeviceState } from './types';
import { Camera, Zap, Eye, Crosshair, ShieldCheck } from 'lucide-react';

interface Props {
  device: HardwareDeviceState;
  onTogglePower: () => void;
  stage: number;
  vehicleCount: number;
}

export const VisionModule: React.FC<Props> = ({
  device,
  onTogglePower,
  stage,
  vehicleCount,
}) => {
  const isOnline = device.powerOn && device.status !== 'offline';
  const isAmbulancePassing = stage >= 4 && stage <= 5;

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            !isOnline ? 'bg-slate-900 border-slate-800 text-slate-600'
            : isAmbulancePassing ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
          }`}>
            <Camera size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{device.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                IMX385 + Hailo-8
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{device.role}</p>
          </div>
        </div>

        {/* Status & Power */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${
            !isOnline ? 'bg-slate-900 text-slate-500 border-slate-800'
            : isAmbulancePassing ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 animate-pulse'
            : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline ? 'bg-slate-600' : isAmbulancePassing ? 'bg-purple-400 animate-ping' : 'bg-cyan-400'
            }`} />
            {isAmbulancePassing ? 'TARGET LOCKED' : isOnline ? 'AI INFERENCE (30 FPS)' : 'OFFLINE'}
          </span>

          <button
            onClick={onTogglePower}
            title={device.powerOn ? 'Turn Off Camera' : 'Turn On Camera'}
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

      {/* Simulated Road-Scene CCTV Feed with Real-Time YOLO Bounding Boxes */}
      <div className="my-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-lg font-mono text-[11px]">
        {/* Synthetic Feed Watermark banner */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] text-purple-400 font-bold tracking-wider flex items-center gap-1">
            <Eye size={11} /> SYNTHETIC ROAD SCENE • YOLOv8 INFERENCE
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            CAM_04_DELHI_CORRIDOR
          </span>
        </div>

        {/* Camera Feed Viewport */}
        <div className="h-44 w-full bg-[#030712] rounded border border-slate-800 relative overflow-hidden flex flex-col justify-between p-2 select-none">
          {isOnline ? (
            <>
              {/* Synthetic 3D Road Scene in SVG */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 170" preserveAspectRatio="none">
                {/* Asphalt road perspective */}
                <polygon points="140,0 260,0 380,170 20,170" fill="#0f172a" />
                {/* Lane divider dashed lines */}
                <line x1="200" y1="0" x2="200" y2="170" stroke="#facc15" strokeWidth="2" strokeDasharray="10,12" />
                <line x1="170" y1="0" x2="110" y2="170" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8,10" strokeOpacity="0.4" />
                <line x1="230" y1="0" x2="290" y2="170" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8,10" strokeOpacity="0.4" />
                {/* Horizon sky / buildings background */}
                <rect x="0" y="0" width="400" height="30" fill="#020617" />
                {/* Delhi Gate / LNJP outline in background */}
                <path d="M 180 30 L 180 15 L 220 15 L 220 30 Z" fill="#1e293b" />
              </svg>

              {/* Simulated YOLO Detection Bounding Boxes */}
              <div className="relative w-full h-full pointer-events-none">
                {/* Regular Traffic Boxes */}
                {/* Car 1 */}
                <div className="absolute left-[15%] top-[45%] w-16 h-12 border border-blue-400/80 bg-blue-500/10 rounded-sm flex flex-col justify-between p-0.5">
                  <span className="text-[7px] bg-blue-500/90 text-white font-bold px-1 rounded-xs inline-block self-start">
                    Car: 0.94
                  </span>
                  <span className="text-[7px] text-blue-300 self-end">42 km/h</span>
                </div>

                {/* Auto Rickshaw */}
                <div className="absolute right-[22%] top-[35%] w-14 h-10 border border-amber-400/80 bg-amber-500/10 rounded-sm flex flex-col justify-between p-0.5">
                  <span className="text-[7px] bg-amber-500/90 text-black font-bold px-1 rounded-xs inline-block self-start">
                    Auto: 0.91
                  </span>
                  <span className="text-[7px] text-amber-300 self-end">28 km/h</span>
                </div>

                {/* Bus / Heavy Vehicle */}
                <div className="absolute right-[8%] top-[55%] w-20 h-16 border border-emerald-400/80 bg-emerald-500/10 rounded-sm flex flex-col justify-between p-0.5">
                  <span className="text-[7px] bg-emerald-500/90 text-white font-bold px-1 rounded-xs inline-block self-start">
                    DTC Bus: 0.89
                  </span>
                  <span className="text-[7px] text-emerald-300 self-end">35 km/h</span>
                </div>

                {/* AMBULANCE BOUNDING BOX (appears during stage 4 & 5) */}
                {isAmbulancePassing ? (
                  <div className="absolute left-[34%] top-[25%] w-28 h-24 border-2 border-red-500 bg-red-500/20 rounded-md flex flex-col justify-between p-1 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <Crosshair size={9} /> AMBULANCE: 0.99
                      </span>
                      <span className="text-[8px] text-red-200 font-bold">LANE 2 PRIORITY</span>
                    </div>
                    <div className="text-[8px] text-white bg-black/70 px-1 py-0.5 rounded self-start font-mono">
                      PLATE: DL-01-EMS-4402
                    </div>
                  </div>
                ) : (
                  /* Far distance indicator */
                  <div className="absolute left-[45%] top-[12%] w-10 h-7 border border-cyan-400/50 bg-cyan-500/10 rounded-xs flex items-center justify-center text-[7px] text-cyan-300">
                    Approach Clr
                  </div>
                )}
              </div>

              {/* Live Overlay HUD info */}
              <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  ● REC [SIMULATED]
                </span>
                <span>FPS: 30.0 • INT8 QUANTIZED</span>
                <span className="text-cyan-300 font-bold">
                  {isAmbulancePassing ? 'CLEARANCE STATUS: PRIORITY CONFIRMED' : 'FLOW: ROUTINE'}
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 text-xs font-mono">
              <Camera size={24} className="mb-2 opacity-40" />
              <span>[OPTICAL SENSOR HARDWARE OFFLINE]</span>
            </div>
          )}
        </div>

        {/* Clear Notice: Simulated CCTV Feed */}
        <div className="mt-1.5 text-[8px] text-center text-slate-500 uppercase tracking-widest font-mono">
          ⚠️ SIMULATED AI VISION FEED — SYNTHETIC BENCHMARK FOR RESEARCH TESTING
        </div>
      </div>

      {/* Vision Telemetry Specs */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono my-1">
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Detected Targets</span>
          <span className="text-xs font-bold text-cyan-300">
            {isOnline ? `${vehicleCount + 3} objects` : '—'}
          </span>
          <span className="text-[9px] text-slate-500 block">Class Confidence &gt; 85%</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Ambulance Lock</span>
          <span className={`text-xs font-bold ${isAmbulancePassing ? 'text-red-400' : 'text-slate-500'}`}>
            {isAmbulancePassing ? 'VERIFIED (99%)' : 'OUT OF FRAME'}
          </span>
          <span className="text-[9px] text-slate-500 block">Visual Optical Handshake</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">NPU Accelerator</span>
          <span className="text-xs font-bold text-purple-400">Hailo-8 (26 TOPS)</span>
          <span className="text-[9px] text-slate-500 block">Edge Neural Core</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="font-mono">SIMULATED TELEMETRY [NON-PHYSICAL EMULATION]</span>
        <span className="font-mono text-slate-400">Sony IMX385 Lens</span>
      </div>
    </div>
  );
};
