import React from 'react';
import { HardwareDeviceState } from './types';
import { Cpu, Zap, Activity, Radio, Terminal } from 'lucide-react';

interface Props {
  device: HardwareDeviceState;
  onTogglePower: () => void;
  incomingMsg?: string;
  outgoingMsg?: string;
}

export const ESP32Controller: React.FC<Props> = ({
  device,
  onTogglePower,
  incomingMsg = 'MQTT /delhi/rsu/priority: PREEMPT_CORRIDOR_REQ',
  outgoingMsg = 'RELAY_K1: HIGH (GREEN WAVE) | VMS: FRAME_SENT',
}) => {
  const isOnline = device.powerOn && device.status !== 'offline';
  const isPriority = device.status === 'priority_active';

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Top Banner / Device Identification */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            !isOnline ? 'bg-slate-900 border-slate-800 text-slate-600'
            : isPriority ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <Cpu size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{device.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {device.hardwareModel.split(' ')[0]}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{device.role}</p>
          </div>
        </div>

        {/* Power Toggle & Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${
            !isOnline ? 'bg-slate-900 text-slate-500 border-slate-800'
            : isPriority ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 animate-pulse'
            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline ? 'bg-slate-600'
              : isPriority ? 'bg-cyan-400 animate-ping'
              : 'bg-emerald-400'
            }`} />
            {isPriority ? 'PRIORITY CONTROL' : isOnline ? 'ONLINE' : 'POWER OFF'}
          </span>

          <button
            onClick={onTogglePower}
            title={device.powerOn ? 'Turn Off ESP32' : 'Turn On ESP32'}
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

      {/* Realistic PCB Schematic Visualization */}
      <div className="my-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-lg relative font-mono text-[11px]">
        {/* PCB Board Outline */}
        <div className="border border-emerald-900/40 bg-emerald-950/10 rounded p-2.5 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-emerald-500/70 font-semibold uppercase tracking-wider">
              RSU Node Controller PCB v2.4 (Delhi Smart City)
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-red-500' : 'bg-slate-700'}`} /> PWR
              </span>
              <span className="flex items-center gap-1 text-[9px] text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${device.activeTxRx ? 'bg-blue-400 animate-pulse' : 'bg-slate-700'}`} /> TX/RX
              </span>
              <span className="flex items-center gap-1 text-[9px] text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${isPriority ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`} /> INT2
              </span>
            </div>
          </div>

          {/* Microcontroller Chip Drawing */}
          <div className="grid grid-cols-12 gap-2 items-center">
            {/* PCB Antenna */}
            <div className="col-span-3 h-16 border-2 border-amber-600/60 rounded bg-amber-950/20 p-1 flex flex-col justify-between items-center text-[8px] text-amber-500/80">
              <span className="font-bold">2.4GHz RF</span>
              <div className="w-full space-y-0.5">
                <div className="h-0.5 bg-amber-600/60 w-full" />
                <div className="h-0.5 bg-amber-600/60 w-3/4" />
                <div className="h-0.5 bg-amber-600/60 w-full" />
                <div className="h-0.5 bg-amber-600/60 w-1/2" />
              </div>
              <span>PCB MEANDER</span>
            </div>

            {/* ESP32 Metal Shielding Box */}
            <div className="col-span-9 bg-slate-800/90 border border-slate-600 rounded p-2 text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white tracking-widest">ESP-WROOM-32D</span>
                <span className="text-[9px] text-cyan-400 font-mono">240 MHz Dual-Core</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-1 flex justify-between">
                <span>FreeRTOS Core 0: Comm / MQTT</span>
                <span className="text-emerald-400">{isOnline ? 'ACTIVE' : 'IDLE'}</span>
              </div>
              <div className="text-[9px] text-slate-400 flex justify-between">
                <span>FreeRTOS Core 1: Actuator / Preempt</span>
                <span className={isPriority ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                  {isPriority ? 'PREEMPT RUNNING' : 'STANDBY'}
                </span>
              </div>
            </div>
          </div>

          {/* GPIO Pin Header Row */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex justify-between text-[9px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-sm ${isPriority ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-700'}`} />
              GPIO 21 [RELAY K1]
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-sm ${isOnline ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-700'}`} />
              GPIO 22 [I2C SDA]
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-sm ${isOnline ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-slate-700'}`} />
              GPIO 26 [I2S BCLK]
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-sm ${isPriority ? 'bg-red-400 shadow-sm shadow-red-400' : 'bg-slate-700'}`} />
              GPIO 4 [BUZZER]
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Processing Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono my-1">
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
            <span>CPU Compute Load</span>
            <span className="text-cyan-400 font-bold">{device.cpuLoadPercent}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                (device.cpuLoadPercent || 0) > 60 ? 'bg-cyan-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${device.cpuLoadPercent || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
            <span>Core Temperature</span>
            <span className="text-amber-400 font-bold">{device.temperatureC}°C</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${Math.min(100, ((device.temperatureC || 30) / 80) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Incoming / Outgoing Bus Payloads */}
      <div className="mt-2 space-y-1.5 text-[10px] font-mono">
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 flex items-start gap-1.5">
          <span className="text-cyan-400 font-bold shrink-0">RX [IN]:</span>
          <span className="text-slate-300 truncate">{incomingMsg}</span>
        </div>
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 flex items-start gap-1.5">
          <span className="text-emerald-400 font-bold shrink-0">TX [OUT]:</span>
          <span className="text-slate-300 truncate">{outgoingMsg}</span>
        </div>
      </div>

      {/* Footer simulated watermark */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="flex items-center gap-1 font-mono">
          <Terminal size={10} className="text-slate-400" />
          SIMULATED TELEMETRY [NON-PHYSICAL EMULATION]
        </span>
        <span className="font-mono text-slate-400">Heartbeat: {device.lastHeartbeat}</span>
      </div>
    </div>
  );
};
