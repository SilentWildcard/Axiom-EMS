import React from 'react';
import { HardwareDeviceState } from './types';
import { Gauge, Radio, Zap, AlertTriangle, Activity } from 'lucide-react';

interface Props {
  device: HardwareDeviceState;
  onTogglePower: () => void;
  queueMeters: number;
  vehicleCount: number;
  occupancyPercent: number;
  faultInjected: boolean;
}

export const VehicleSensorModule: React.FC<Props> = ({
  device,
  onTogglePower,
  queueMeters,
  vehicleCount,
  occupancyPercent,
  faultInjected,
}) => {
  const isOnline = device.powerOn && !faultInjected;

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            !isOnline ? 'bg-slate-900 border-slate-800 text-slate-600'
            : faultInjected ? 'bg-red-500/10 border-red-500/40 text-red-400'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}>
            <Radio size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{device.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                HC-SR04 + mmWave
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{device.role}</p>
          </div>
        </div>

        {/* Status & Power */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${
            !isOnline && !faultInjected ? 'bg-slate-900 text-slate-500 border-slate-800'
            : faultInjected ? 'bg-red-950/80 text-red-300 border-red-500/50 animate-pulse'
            : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline ? 'bg-slate-600'
              : faultInjected ? 'bg-red-500 animate-ping'
              : 'bg-blue-400'
            }`} />
            {faultInjected ? 'FAULT (TIMEOUT)' : isOnline ? 'ACTIVE SENSING' : 'OFFLINE'}
          </span>

          <button
            onClick={onTogglePower}
            title={device.powerOn ? 'Turn Off Sensor' : 'Turn On Sensor'}
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

      {/* Visual Hardware Schematic: HC-SR04 Transducer Cylinders + Radar Field */}
      <div className="my-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-lg font-mono text-[11px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            Acoustic & Doppler Detection Field
          </span>
          <span className="text-[9px] text-slate-400">
            Carrier: 40 kHz Sound + 24.125 GHz Radar
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/70">
          {/* HC-SR04 Transducers */}
          <div className="flex items-center gap-2">
            {/* T (Transmitter) */}
            <div className="w-10 h-10 rounded-full border-2 border-slate-500 bg-slate-800 flex flex-col items-center justify-center relative shadow-inner">
              <div className="w-6 h-6 rounded-full border border-slate-600 bg-slate-900 flex items-center justify-center text-[9px] font-black text-blue-400">
                T
              </div>
              <span className="text-[7px] text-slate-400 mt-0.5">EMIT</span>
            </div>
            {/* R (Receiver) */}
            <div className="w-10 h-10 rounded-full border-2 border-slate-500 bg-slate-800 flex flex-col items-center justify-center relative shadow-inner">
              <div className="w-6 h-6 rounded-full border border-slate-600 bg-slate-900 flex items-center justify-center text-[9px] font-black text-emerald-400">
                R
              </div>
              <span className="text-[7px] text-slate-400 mt-0.5">ECHO</span>
            </div>
          </div>

          {/* Animated Sonic / Radar Wave Pulses */}
          <div className="flex-1 flex flex-col justify-center px-2">
            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
              <span>Time-of-Flight To Queue:</span>
              <span className="text-cyan-300 font-bold">
                {isOnline ? `${(queueMeters * 58.8).toFixed(0)} µs` : '—'}
              </span>
            </div>

            {/* Simulated Oscilloscope Waveform */}
            <div className="h-7 w-full bg-slate-900/90 rounded border border-slate-800 flex items-center justify-center overflow-hidden px-1 relative">
              {faultInjected ? (
                <div className="flex items-center gap-1 text-[10px] text-red-400">
                  <AlertTriangle size={12} />
                  <span>SIGNAL BLOCKED / TRANSDUCER OPEN</span>
                </div>
              ) : isOnline ? (
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="12" x2="100" y2="12" stroke="#1e293b" strokeWidth="0.8" />
                  {/* Pulse waveform */}
                  <path
                    d="M 0 12 L 15 12 L 20 4 L 25 20 L 30 12 L 60 12 L 65 6 L 70 18 L 75 12 L 100 12"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <animate attributeName="stroke-dashoffset" values="0;100" dur="2s" repeatCount="indefinite" />
                  </path>
                </svg>
              ) : (
                <span className="text-[9px] text-slate-600">SENSOR POWERED OFF</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Sensor Readings Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono my-1">
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Queue Length</span>
          <span className="text-sm font-bold text-cyan-400">
            {isOnline ? `${queueMeters} m` : 'ERR'}
          </span>
          <span className="text-[9px] text-slate-500 block">Approach Queue</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Vehicles</span>
          <span className="text-sm font-bold text-amber-400">
            {isOnline ? `${vehicleCount} units` : 'ERR'}
          </span>
          <span className="text-[9px] text-slate-500 block">Counted in Zone</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Road Occupancy</span>
          <span className={`text-sm font-bold ${
            occupancyPercent > 75 ? 'text-red-400' : occupancyPercent > 45 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {isOnline ? `${occupancyPercent}%` : 'ERR'}
          </span>
          <span className="text-[9px] text-slate-500 block">Lane Density</span>
        </div>
      </div>

      {/* Occupancy Density Meter Bar */}
      <div className="mt-2 bg-[#080d1a] border border-slate-800/80 rounded p-2 font-mono text-[10px]">
        <div className="flex justify-between items-center mb-1 text-slate-400">
          <span>Congestion Saturation Threshold</span>
          <span className={occupancyPercent > 75 ? 'text-red-400 font-bold' : 'text-slate-300'}>
            {occupancyPercent > 75 ? 'CRITICAL BOTTLENECK' : occupancyPercent > 45 ? 'MODERATE QUEUE' : 'FREE FLOW'}
          </span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 ${
              occupancyPercent > 75 ? 'bg-red-500' : occupancyPercent > 45 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${isOnline ? occupancyPercent : 0}%` }}
          />
        </div>
      </div>

      {/* Output destination */}
      <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between bg-[#080d1a] p-2 rounded border border-slate-800/80">
        <span className="text-blue-400 font-bold">Relayed To:</span>
        <span className="text-slate-300">ESP32 RSU via GPIO 18 (Echo Interrupt) & Edge Hub</span>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="font-mono">SIMULATED TELEMETRY [NON-PHYSICAL EMULATION]</span>
        <span className="font-mono text-slate-400">ToF 40kHz Ultrasound</span>
      </div>
    </div>
  );
};
