import React from 'react';
import { HardwareDeviceState } from './types';
import { Server, Zap, Cpu, Layers, HardDrive, Share2 } from 'lucide-react';

interface Props {
  device: HardwareDeviceState;
  onTogglePower: () => void;
  queueMeters: number;
  stage: number;
}

export const EdgeDeviceModule: React.FC<Props> = ({
  device,
  onTogglePower,
  queueMeters,
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
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <Server size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{device.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Raspberry Pi CM4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{device.role}</p>
          </div>
        </div>

        {/* Status & Power */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${
            !isOnline ? 'bg-slate-900 text-slate-500 border-slate-800'
            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline ? 'bg-slate-600' : 'bg-emerald-400'
            }`} />
            {isOnline ? 'EDGE RUNTIME ACTIVE' : 'OFFLINE'}
          </span>

          <button
            onClick={onTogglePower}
            title={device.powerOn ? 'Turn Off Edge Unit' : 'Turn On Edge Unit'}
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

      {/* Sensor Data Aggregation Pipeline Graphic */}
      <div className="my-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-lg font-mono text-[11px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            Multi-Modal Sensor Fusion Pipeline (Sub-15ms)
          </span>
          <span className="text-[9px] text-emerald-400 font-bold">Latency: 11.4 ms</span>
        </div>

        {/* Aggregation Diagram */}
        <div className="grid grid-cols-12 gap-2 bg-slate-950/60 p-2.5 rounded border border-slate-800/70 items-center">
          {/* Inputs: Ultrasonic + Radar + Vision */}
          <div className="col-span-4 space-y-1 text-[9px]">
            <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-blue-300 flex justify-between">
              <span>Ultrasonic:</span>
              <span className="font-bold">{queueMeters}m</span>
            </div>
            <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-cyan-300 flex justify-between">
              <span>Doppler Radar:</span>
              <span className="font-bold">42 km/h</span>
            </div>
            <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-purple-300 flex justify-between">
              <span>YOLO Vision:</span>
              <span className="font-bold">30 FPS</span>
            </div>
          </div>

          {/* Fusion Engine */}
          <div className="col-span-4 flex flex-col items-center justify-center p-2 bg-emerald-950/20 border border-emerald-500/30 rounded text-center">
            <Layers size={16} className="text-emerald-400 mb-1" />
            <span className="text-[9px] font-bold text-white">Kalman Filter</span>
            <span className="text-[7px] text-slate-400">Sensor Fusion Core</span>
          </div>

          {/* Local Action vs Cloud Relay */}
          <div className="col-span-4 space-y-1 text-[9px]">
            <div className="bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/40 text-emerald-300 text-center font-bold">
              → GPIO to ESP32
            </div>
            <div className="bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/40 text-cyan-300 text-center font-bold">
              → 4G to Cloud
            </div>
          </div>
        </div>
      </div>

      {/* Edge vs Cloud Architecture Distinction Callout */}
      <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2.5 font-mono text-[10px] space-y-1.5 my-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold border-b border-slate-800/80 pb-1 text-[9px] uppercase tracking-wider">
          <Share2 size={11} className="text-cyan-400" />
          <span>Architectural Boundary: Edge vs Central Cloud</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-0.5">LOCAL EDGE (RPi CM4)</span>
            <p className="text-slate-400 leading-tight">
              Processes raw high-frequency sensors at the junction. Sub-15ms deterministic fail-safe preemption. Zero internet dependency.
            </p>
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <span className="text-purple-400 font-bold block mb-0.5">CENTRAL CLOUD AI/ML</span>
            <p className="text-slate-400 leading-tight">
              City-scale macro traffic optimization across all 6 Delhi junctions, route ETA forecasting, and dynamic green wave corridor planning.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono mt-2">
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">RAM Usage</span>
          <span className="text-xs font-bold text-cyan-300">1.4 / 4.0 GB</span>
          <span className="text-[9px] text-slate-500 block">LPDDR4</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">CPU Load</span>
          <span className="text-xs font-bold text-emerald-400">{device.cpuLoadPercent}%</span>
          <span className="text-[9px] text-slate-500 block">Quad-A72 @ 1.5GHz</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Inference Speed</span>
          <span className="text-xs font-bold text-amber-400">8.2 ms</span>
          <span className="text-[9px] text-slate-500 block">TFLite Micro</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="font-mono">SIMULATED TELEMETRY [NON-PHYSICAL EMULATION]</span>
        <span className="font-mono text-slate-400">Edge Industrial CM4</span>
      </div>
    </div>
  );
};
