import React from 'react';
import { ERSState } from '../types';
import { 
  Ambulance as AmbulanceIcon, 
  Clock, 
  Radio, 
  TrendingUp, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw,
  Navigation
} from 'lucide-react';

interface CommandCenterProps {
  state: ERSState;
  onPlayToggle: () => void;
  onStep: () => void;
  onReset: () => void;
  onNavigateTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  state,
  onPlayToggle,
  onStep,
  onReset,
  onNavigateTab
}) => {
  const { ambulance, environment, prediction, simulation, iot_devices, checkpoints, recent_events } = state;
  const onlineDevices = iot_devices.filter(d => d.is_online).length;
  const totalDevices = iot_devices.length;

  return (
    <div className="space-y-6">
      {/* Hero Operational Banner */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#101E36] to-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Subtle cyan ambient glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-[#38BDF8]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-32 bg-[#2563EB]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB] animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#F0F7FF] tracking-wider font-hud">
                CENTRAL EMERGENCY DISPATCH CONSOLE
              </h1>
              <span className="text-[10px] bg-[#101E36] text-[#38BDF8] px-2 py-0.5 rounded border border-[#38BDF8]/30 font-mono tracking-wider">
                NCT OF DELHI
              </span>
            </div>
            <p className="text-[#93B2D6] text-xs sm:text-sm mt-1 tracking-wide font-sans">
              Live AI-assisted corridor coordination between <span className="text-[#38BDF8] font-medium">{ambulance.origin_name}</span> and <span className="text-[#2563EB] font-medium">{ambulance.destination_name}</span>.
            </p>
          </div>

          {/* Quick Simulation Action Bar */}
          <div className="flex items-center space-x-2 bg-[#050B14]/90 border border-[#1E355B] p-1.5 rounded-lg shadow-inner">
            <button
              onClick={onPlayToggle}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition shadow-md ${
                simulation.is_running
                  ? 'bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-[#050B14] shadow-[0_0_12px_rgba(14,165,233,0.3)]'
                  : 'bg-[#7DD3FC] hover:bg-[#7DD3FC]/90 text-[#050B14] shadow-[0_0_12px_rgba(125,211,252,0.3)]'
              }`}
            >
              {simulation.is_running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{simulation.is_running ? 'PAUSE CORRIDOR' : 'DISPATCH SIMULATION'}</span>
            </button>

            <button
              onClick={onStep}
              disabled={simulation.is_running}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#101E36] hover:bg-[#1E355B] disabled:opacity-40 text-[#F0F7FF] rounded-md text-xs font-mono transition border border-[#1E355B]"
              title="Advance ambulance 1 waypoint"
            >
              <SkipForward className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>STEP</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#101E36] hover:bg-[#1E355B] text-[#93B2D6] hover:text-[#F0F7FF] rounded-md text-xs font-mono transition border border-[#1E355B]"
              title="Reset simulation to Connaught Place"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Ambulance Card */}
        <div className="bg-[#0B1528] border border-[#1E355B] hover:border-[#2563EB]/40 rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] transition relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#93B2D6] font-mono font-medium">Active Ambulance</p>
              <h3 className="text-2xl font-bold font-hud text-[#F0F7FF] mt-1 tracking-wider">{ambulance.id}</h3>
              <p className="text-xs text-[#2563EB] font-medium mt-0.5 flex items-center space-x-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shadow-[0_0_6px_#2563EB] animate-ping inline-block" />
                <span>{ambulance.priority} (Critical)</span>
              </p>
            </div>
            <div className="p-2.5 bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-lg text-[#2563EB] shadow-[0_0_12px_rgba(37,99,235,0.25)] group-hover:scale-105 transition">
              <AmbulanceIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1E355B]/80 flex justify-between text-xs text-[#93B2D6] font-mono">
            <span>Speed: <strong className="text-[#F0F7FF] font-hud text-sm">{ambulance.current_speed_kmh} km/h</strong></span>
            <span>Progress: <strong className="text-[#38BDF8] font-hud text-sm">{ambulance.route_progress_pct}%</strong></span>
          </div>
        </div>

        {/* Predicted ETA Card */}
        <div className="bg-[#0B1528] border border-[#1E355B] hover:border-[#38BDF8]/40 rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] transition relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#93B2D6] font-mono font-medium">Predicted Arrival (ETA)</p>
              <h3 className="text-2xl font-bold font-hud text-[#38BDF8] mt-1 tracking-wider drop-shadow-[0_0_10px_rgba(53,217,255,0.4)]">
                {prediction.predicted_eta_formatted}
              </h3>
              <p className="text-xs text-[#93B2D6] mt-0.5 font-mono">
                Baseline (No-ML): <span className="line-through text-[#93B2D6]/60">{prediction.baseline_eta_formatted}</span>
              </p>
            </div>
            <div className="p-2.5 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-lg text-[#38BDF8] shadow-[0_0_12px_rgba(53,217,255,0.25)] group-hover:scale-105 transition">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1E355B]/80 flex justify-between text-xs font-mono">
            <span className="text-[#93B2D6]">Dist: <strong className="text-[#F0F7FF] font-hud text-sm">{ambulance.remaining_distance_km} km</strong></span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
              prediction.delay_risk === 'CRITICAL' ? 'bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/50 shadow-[0_0_8px_rgba(255,64,87,0.3)]' :
              prediction.delay_risk === 'HIGH' ? 'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/50' :
              'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/50'
            }`}>
              {prediction.delay_risk} RISK
            </span>
          </div>
        </div>

        {/* IoT Roadside Units */}
        <div className="bg-[#0B1528] border border-[#1E355B] hover:border-[#2563EB]/40 rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] transition relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#93B2D6] font-mono font-medium">IoT Roadside Units</p>
              <h3 className="text-2xl font-bold font-hud text-[#F0F7FF] mt-1 tracking-wider">
                {onlineDevices} / {totalDevices}
              </h3>
              <p className="text-xs text-[#7DD3FC] font-medium mt-0.5 font-mono">
                {Math.round((onlineDevices / totalDevices) * 100)}% Hardware Mesh Online
              </p>
            </div>
            <div className="p-2.5 bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-lg text-[#2563EB] shadow-[0_0_12px_rgba(82,123,255,0.25)] group-hover:scale-105 transition">
              <Radio className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1E355B]/80 flex justify-between text-xs text-[#93B2D6] font-mono">
            <span>Next RSU: <strong className="text-[#38BDF8] truncate block max-w-[150px]">{ambulance.next_checkpoint}</strong></span>
          </div>
        </div>

        {/* Delhi Traffic Congestion */}
        <div className="bg-[#0B1528] border border-[#1E355B] hover:border-[#0EA5E9]/40 rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] transition relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#93B2D6] font-mono font-medium">Delhi Traffic Density</p>
              <h3 className="text-2xl font-bold font-hud text-[#0EA5E9] mt-1 tracking-wider drop-shadow-[0_0_10px_rgba(255,176,32,0.3)]">
                {environment.traffic_density}x
              </h3>
              <p className="text-xs text-[#93B2D6] mt-0.5 font-mono">
                Status: <strong className="text-[#F0F7FF]">{environment.traffic_label}</strong>
              </p>
            </div>
            <div className="p-2.5 bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 rounded-lg text-[#0EA5E9] shadow-[0_0_12px_rgba(255,176,32,0.25)] group-hover:scale-105 transition">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1E355B]/80 flex justify-between text-xs text-[#93B2D6] font-mono">
            <span>Roadblock: {environment.roadblock_active ? <strong className="text-[#2563EB]">ACTIVE</strong> : <strong className="text-[#7DD3FC]">NONE</strong>}</span>
            <span>Lead: <strong className="text-[#F0F7FF]">{prediction.recommended_advance_alert_lead_seconds}s</strong></span>
          </div>
        </div>
      </div>

      {/* Corridor Progress & Checkpoint Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Intersections & 2-Stage Alert Matrix */}
        <div className="lg:col-span-2 bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E355B] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#F0F7FF] flex items-center space-x-2 font-hud tracking-wide">
                <Navigation className="w-4 h-4 text-[#38BDF8]" />
                <span>CORRIDOR CHECKPOINTS & 2-STAGE ALERT PROGRESSION</span>
              </h2>
              <p className="text-xs text-[#93B2D6] mt-0.5">
                Stage 1 (Approaching Advisory) &rarr; Stage 2 (Intersection Arrival & Clearance)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('iot')}
              className="text-xs text-[#38BDF8] hover:text-[#38BDF8]/80 font-mono tracking-wider underline flex items-center space-x-1"
            >
              <span>RSU Mesh View &rarr;</span>
            </button>
          </div>

          {/* Interactive Checkpoint Stepper */}
          <div className="space-y-3">
            {checkpoints.map((cp, idx) => {
              const iot = iot_devices.find(d => d.device_id === cp.id);
              const isPassed = !!cp.passed_timestamp;
              const isArrived = !!cp.arrived_timestamp && !cp.passed_timestamp;
              const isApproaching = cp.alert_stage1_sent && !cp.arrived_timestamp;

              return (
                <div 
                  key={cp.id}
                  className={`p-3.5 rounded-xl border transition duration-200 ${
                    isArrived 
                      ? 'bg-[#2563EB]/10 border-[#2563EB] shadow-[0_0_20px_-3px_rgba(255,64,87,0.3)]' 
                      : isApproaching 
                      ? 'bg-[#0EA5E9]/10 border-[#0EA5E9]/80 shadow-[0_0_15px_-3px_rgba(255,176,32,0.2)]' 
                      : isPassed 
                      ? 'bg-[#7DD3FC]/5 border-[#7DD3FC]/40 opacity-90' 
                      : 'bg-[#101E36]/50 border-[#1E355B]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        isPassed ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/60 shadow-[0_0_8px_rgba(66,230,164,0.3)]' :
                        isArrived ? 'bg-[#2563EB] text-[#050B14] shadow-[0_0_12px_#2563EB] animate-pulse' :
                        isApproaching ? 'bg-[#0EA5E9]/30 text-[#0EA5E9] border border-[#0EA5E9]/80 shadow-[0_0_10px_rgba(255,176,32,0.3)]' :
                        'bg-[#1E355B] text-[#93B2D6] border border-[#1E355B]'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-[#F0F7FF] tracking-wide">{cp.name}</h4>
                          <span className="text-[10px] font-mono bg-[#050B14] text-[#38BDF8] px-2 py-0.5 rounded border border-[#1E355B]">
                            {cp.id}
                          </span>
                        </div>
                        <p className="text-xs text-[#93B2D6] mt-0.5">
                          SOP: <span className="text-[#F0F7FF]/90">{cp.recommended_action}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      {/* State Badge */}
                      <span className={`text-[11px] font-mono px-3 py-1 rounded-full font-bold tracking-wider ${
                        isPassed ? 'bg-[#7DD3FC]/15 text-[#7DD3FC] border border-[#7DD3FC]/50 shadow-[0_0_10px_rgba(66,230,164,0.2)]' :
                        isArrived ? 'bg-[#2563EB] text-[#050B14] shadow-[0_0_15px_#2563EB] animate-pulse font-black' :
                        isApproaching ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/60 shadow-[0_0_10px_rgba(255,176,32,0.2)]' :
                        'bg-[#050B14] text-[#93B2D6] border border-[#1E355B]'
                      }`}>
                        {isPassed ? 'AMBULANCE PASSED' :
                         isArrived ? 'ARRIVED AT CHECKPOINT' :
                         isApproaching ? 'STAGE 1: APPROACHING' :
                         'IDLE / STANDBY'}
                      </span>

                      {/* Distance readout */}
                      {iot?.distance_to_ambulance_m !== null && iot?.distance_to_ambulance_m !== undefined && (
                        <div className="text-right font-mono text-xs text-[#93B2D6]">
                          <span className="text-[#38BDF8] font-bold font-hud text-sm">{iot.distance_to_ambulance_m}m</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Live Operational Feed */}
        <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#1E355B] pb-3">
              <h2 className="text-base font-bold text-[#F0F7FF] flex items-center space-x-2 font-hud tracking-wide">
                <Radio className="w-4 h-4 text-[#38BDF8]" />
                <span>LIVE TELEMETRY STREAM</span>
              </h2>
              <span className="text-[10px] font-mono bg-[#38BDF8]/15 text-[#38BDF8] px-2 py-0.5 rounded border border-[#38BDF8]/40 tracking-wider">
                REAL-TIME
              </span>
            </div>

            {/* Event list */}
            <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {recent_events.length === 0 ? (
                <p className="text-xs text-[#93B2D6] text-center py-8">No recent events logged yet.</p>
              ) : (
                recent_events.map((evt) => (
                  <div key={evt.id} className="p-2.5 rounded-lg bg-[#101E36] border border-[#1E355B] text-xs space-y-1 hover:border-[#38BDF8]/30 transition">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] text-[#38BDF8]">{evt.time_str}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold tracking-wider ${
                        evt.event_type.includes('ARRIVED') || evt.event_type.includes('COMPLETED') ? 'bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/40' :
                        evt.event_type.includes('ALERT') ? 'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/40' :
                        evt.event_type.includes('PASSED') ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/40' :
                        'bg-[#050B14] text-[#93B2D6] border border-[#1E355B]'
                      }`}>
                        {evt.event_type}
                      </span>
                    </div>
                    <p className="text-[#F0F7FF]/90 text-xs leading-relaxed">{evt.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Nav Footer */}
          <div className="pt-3 border-t border-[#1E355B] flex justify-between items-center text-xs">
            <span className="text-[#93B2D6] font-mono text-[11px]">Delhi Emergency Control</span>
            <button
              onClick={() => onNavigateTab('police')}
              className="text-[#38BDF8] hover:text-[#38BDF8]/80 font-mono text-xs underline tracking-wide"
            >
              Open Traffic Police Console &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
