import React from 'react';
import {
  HardwareId,
  SimulationStage,
  TrafficDensityLevel,
  HardwareSimConfig,
  HardwareDeviceState
} from './types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Gauge,
  Wifi,
  Sliders,
  AlertTriangle,
  Siren,
  Power
} from 'lucide-react';

interface Props {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  currentStage: SimulationStage;
  onStepNext: () => void;
  onStepPrev: () => void;
  config: HardwareSimConfig;
  onConfigChange: (newConfig: Partial<HardwareSimConfig>) => void;
  devices: Record<HardwareId, HardwareDeviceState>;
  onToggleDevicePower: (id: HardwareId) => void;
  onEmergencyPriority: () => void;
}

export const InteractiveControlPanel: React.FC<Props> = ({
  isRunning,
  onTogglePlay,
  onReset,
  currentStage,
  onStepNext,
  onStepPrev,
  config,
  onConfigChange,
  devices,
  onToggleDevicePower,
  onEmergencyPriority,
}) => {
  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 shadow-xl space-y-4 font-mono text-xs">
      {/* Top Bar: Playback Controls & Stage Stepping */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        {/* Play / Pause / Reset / Steppers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={14} /> Pause Simulation
              </>
            ) : (
              <>
                <Play size={14} /> Start Simulation
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 transition-all"
            title="Reset Simulation to Stage 1"
          >
            <RotateCcw size={13} /> Reset
          </button>

          <div className="h-5 w-[1px] bg-slate-800 mx-1" />

          {/* Manual Stage Steppers */}
          <button
            onClick={onStepPrev}
            className="px-2.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg flex items-center gap-1 text-[11px]"
            title="Step to Previous Stage"
          >
            <SkipBack size={13} /> Prev Stage
          </button>

          <div className="px-3 py-1.5 bg-[#080d1a] border border-slate-700 rounded-lg text-cyan-300 font-bold">
            STAGE {currentStage} OF 6
          </div>

          <button
            onClick={onStepNext}
            className="px-2.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg flex items-center gap-1 text-[11px]"
            title="Step to Next Stage"
          >
            Next Stage <SkipForward size={13} />
          </button>
        </div>

        {/* Speed Multipliers & Emergency Priority Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#080d1a] border border-slate-800 rounded-lg p-1">
            <span className="text-[10px] text-slate-400 px-2">Speed:</span>
            {([1, 2, 4] as const).map(spd => (
              <button
                key={spd}
                onClick={() => onConfigChange({ speedMultiplier: spd })}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  config.speedMultiplier === spd
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Emergency Priority Manual Override */}
          <button
            onClick={onEmergencyPriority}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-lg flex items-center gap-1.5 shadow-lg shadow-red-600/30 animate-pulse transition-all"
            title="Dispatch immediate green wave preemption to active junction"
          >
            <Siren size={14} /> EMERGENCY OVERRIDE
          </button>
        </div>
      </div>

      {/* Second Row: Sliders & Simulation Environmental Adjustments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Traffic Density Level */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Gauge size={14} className="text-amber-400" /> Traffic Density
            </span>
            <span className="text-amber-400 font-bold uppercase">{config.trafficDensity}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-[10px]">
            {(['low', 'normal', 'congested', 'gridlock'] as TrafficDensityLevel[]).map(d => (
              <button
                key={d}
                onClick={() => onConfigChange({ trafficDensity: d })}
                className={`py-1 rounded border capitalize transition-all ${
                  config.trafficDensity === d
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Ambulance Speed Slider */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold">Ambulance Speed:</span>
            <span className="text-cyan-300 font-bold">{config.ambulanceSpeedKmH} km/h</span>
          </div>
          <input
            type="range"
            min="30"
            max="90"
            step="5"
            value={config.ambulanceSpeedKmH}
            onChange={e => onConfigChange({ ambulanceSpeedKmH: parseInt(e.target.value, 10) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>30 km/h (Dense Jam)</span>
            <span>60 km/h</span>
            <span>90 km/h (Green Wave)</span>
          </div>
        </div>

        {/* 4G Network Latency Slider */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Wifi size={14} className="text-cyan-400" /> Network Latency
            </span>
            <span className="text-cyan-300 font-bold">{config.networkLatencyMs} ms</span>
          </div>
          <input
            type="range"
            min="20"
            max="850"
            step="10"
            value={config.networkLatencyMs}
            onChange={e => onConfigChange({ networkLatencyMs: parseInt(e.target.value, 10) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>20 ms (5G Ultra)</span>
            <span>150 ms (4G)</span>
            <span>850 ms (Fringe)</span>
          </div>
        </div>
      </div>

      {/* Third Row: Fault Injection Toggles & Individual Hardware Power Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Fault Injections */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-2">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-red-400" /> Fault Injection Controls
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Sensor Fault Toggle */}
            <button
              onClick={() => onConfigChange({ sensorFaultInjected: !config.sensorFaultInjected })}
              className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                config.sensorFaultInjected
                  ? 'bg-red-950/70 border-red-500/70 text-red-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>Density Sensor Fault</span>
              <span className={`w-2 h-2 rounded-full ${config.sensorFaultInjected ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`} />
            </button>

            {/* Comms Fault Toggle */}
            <button
              onClick={() => onConfigChange({ commsFaultInjected: !config.commsFaultInjected })}
              className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                config.commsFaultInjected
                  ? 'bg-red-950/70 border-red-500/70 text-red-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>4G Network Dropout</span>
              <span className={`w-2 h-2 rounded-full ${config.commsFaultInjected ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`} />
            </button>
          </div>
        </div>

        {/* Individual Hardware Devices ON/OFF Power Matrix */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Power size={14} className="text-emerald-400" /> Device Power Matrix (9 Units)
            </span>
            <span className="text-[10px] text-slate-500">Toggle individual hardware</span>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {Object.values(devices).map(dev => (
              <button
                key={dev.id}
                onClick={() => onToggleDevicePower(dev.id)}
                className={`px-2 py-1 rounded border flex items-center gap-1 transition-all ${
                  dev.powerOn
                    ? 'bg-slate-900 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-600 line-through'
                }`}
                title={`Click to power ${dev.powerOn ? 'OFF' : 'ON'} ${dev.name}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dev.powerOn ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                {dev.id.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
