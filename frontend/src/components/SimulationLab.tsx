import React, { useState } from 'react';
import { ERSState } from '../types';
import { ERSApi } from '../services/api';
import { 
  FlaskConical, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Sliders, 
  Zap, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';

interface SimulationLabProps {
  state: ERSState;
  onPlayToggle: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeak: (text: string) => void;
  voiceAlertsEnabled: boolean;
  setVoiceAlertsEnabled: (val: boolean) => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({
  state,
  onPlayToggle,
  onStep,
  onReset,
  onSpeak,
  voiceAlertsEnabled,
  setVoiceAlertsEnabled
}) => {
  const { simulation, ambulance, environment, prediction } = state;
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const handleSpeedChange = async (speed: number) => {
    await ERSApi.setSpeed(speed);
  };

  const handleTrafficChange = async (density: number) => {
    await ERSApi.setTraffic(density);
  };

  const handleRoadblockToggle = async () => {
    await ERSApi.toggleRoadblock();
  };

  const loadScenario1 = async () => {
    setActiveScenario('SCENARIO_1');
    await ERSApi.resetSimulation();
    await ERSApi.setSpeed(50);
    await ERSApi.setTraffic(1.8);
    await ERSApi.toggleRoadblock(false);
    onSpeak("Scenario 1 Loaded. Critical Cardiac Patient from Connaught Place to AIIMS New Delhi. Commencing priority green corridor simulation.");
    if (!simulation.is_running) {
      await ERSApi.togglePlay();
    }
  };

  const loadScenario2 = async () => {
    setActiveScenario('SCENARIO_2');
    await ERSApi.resetSimulation();
    await ERSApi.setSpeed(35);
    await ERSApi.setTraffic(2.6);
    await ERSApi.toggleRoadblock(true);
    onSpeak("Scenario 2 Loaded. Peak Rush Hour Trauma with reported roadblock near Mandi House. AI re-routing and dynamic queue lead calculation activated.");
    if (!simulation.is_running) {
      await ERSApi.togglePlay();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 bg-[#38BDF8]/15 text-[#38BDF8] rounded-lg border border-[#38BDF8]/40 shadow-[0_0_10px_rgba(53,217,255,0.25)]">
                <FlaskConical className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-hud text-[#F0F7FF] tracking-wider">
                SIMULATION & EVALUATION TESTING LAB
              </h1>
              <span className="text-xs bg-[#0EA5E9]/20 border border-[#0EA5E9]/60 text-[#0EA5E9] px-2.5 py-0.5 rounded font-mono font-bold tracking-wider">
                JUDGES SUITE
              </span>
            </div>
            <p className="text-[#93B2D6] text-xs sm:text-sm mt-1">
              End-to-end sandbox to stress-test 2-stage alerts, dynamic AI ETA recalculations, and roadside hardware disruptions.
            </p>
          </div>

          {/* Master Transport Controls */}
          <div className="flex items-center space-x-2 bg-[#050B14] border border-[#1E355B] p-1.5 rounded-xl shadow-inner">
            <button
              onClick={onPlayToggle}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition shadow-lg ${
                simulation.is_running
                  ? 'bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-[#050B14] shadow-[0_0_12px_rgba(255,176,32,0.3)]'
                  : 'bg-[#7DD3FC] hover:bg-[#7DD3FC]/90 text-[#050B14] shadow-[0_0_12px_rgba(66,230,164,0.3)]'
              }`}
            >
              {simulation.is_running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{simulation.is_running ? 'PAUSE' : 'RUN CONTINUOUS'}</span>
            </button>

            <button
              onClick={onStep}
              disabled={simulation.is_running}
              className="px-3 py-2 bg-[#101E36] hover:bg-[#1E355B] disabled:opacity-40 text-[#F0F7FF] border border-[#1E355B] rounded-lg text-xs font-mono font-semibold transition flex items-center space-x-1"
              title="Advance 1 step"
            >
              <SkipForward className="w-4 h-4 text-[#38BDF8]" />
              <span>STEP (1X)</span>
            </button>

            <button
              onClick={onReset}
              className="px-3 py-2 bg-[#101E36] hover:bg-[#1E355B] text-[#93B2D6] hover:text-[#F0F7FF] border border-[#1E355B] rounded-lg text-xs font-mono transition"
              title="Reset simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Preconfigured Scenarios */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-4">
        <h2 className="text-sm font-bold text-[#F0F7FF] uppercase tracking-wider font-hud flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#0EA5E9]" />
          <span>1-CLICK PRECONFIGURED DEMO SCENARIOS FOR EVALUATION</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scenario 1 */}
          <div className={`border rounded-xl p-4 transition flex flex-col justify-between space-y-3.5 ${
            activeScenario === 'SCENARIO_1' ? 'bg-[#38BDF8]/10 border-[#38BDF8] ring-1 ring-[#38BDF8]/40 shadow-[0_0_20px_rgba(53,217,255,0.2)]' : 'bg-[#101E36]/60 border-[#1E355B] hover:border-[#38BDF8]/40'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#38BDF8] font-mono tracking-wider">SCENARIO 1 (STANDARD EMERGENCY)</span>
                <span className="text-[10px] font-mono bg-[#38BDF8]/15 text-[#38BDF8] px-2 py-0.5 rounded border border-[#38BDF8]/40">
                  RECOMMENDED
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F0F7FF] mt-1 font-hud tracking-wide">
                Connaught Place to AIIMS Golden Hour Corridor
              </h3>
              <p className="text-xs text-[#93B2D6] mt-1 leading-relaxed">
                Clear weather, normal corridor speed (50 km/h), moderate Delhi traffic (1.8x). Demonstrates sequential Stage 1 advance warning (60s lead) and Stage 2 arrival/passage through Barakhamba, Mandi House, ITO, and Ring Road.
              </p>
            </div>
            <button
              onClick={loadScenario1}
              className="w-full py-2 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#050B14] rounded-lg text-xs font-mono font-black tracking-wider transition flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(53,217,255,0.3)]"
            >
              <Play className="w-3.5 h-3.5" />
              <span>LAUNCH SCENARIO 1 (1-CLICK)</span>
            </button>
          </div>

          {/* Scenario 2 */}
          <div className={`border rounded-xl p-4 transition flex flex-col justify-between space-y-3.5 ${
            activeScenario === 'SCENARIO_2' ? 'bg-[#2563EB]/15 border-[#2563EB] ring-1 ring-[#2563EB]/40 shadow-[0_0_20px_rgba(255,64,87,0.2)]' : 'bg-[#101E36]/60 border-[#1E355B] hover:border-[#2563EB]/40'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2563EB] font-mono tracking-wider">SCENARIO 2 (STRESS TEST)</span>
                <span className="text-[10px] font-mono bg-[#2563EB]/20 text-[#2563EB] px-2 py-0.5 rounded border border-[#2563EB]/40">
                  HEAVY CONGESTION + ROADBLOCK
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F0F7FF] mt-1 font-hud tracking-wide">
                Peak Rush Hour Congestion with Injected Roadblock
              </h3>
              <p className="text-xs text-[#93B2D6] mt-1 leading-relaxed">
                High peak traffic (2.6x), speed reduced to 35 km/h, active VIP roadblock near Mandi House. Watch the AI model dynamically spike ETA and widen the recommended advance alert lead to 95s to clear long queues.
              </p>
            </div>
            <button
              onClick={loadScenario2}
              className="w-full py-2 bg-[#2563EB] hover:bg-[#2563EB]/90 text-[#050B14] rounded-lg text-xs font-mono font-black tracking-wider transition flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(255,64,87,0.3)]"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>LAUNCH SCENARIO 2 (1-CLICK)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Speed & Traffic Sliders (2 cols) */}
        <div className="lg:col-span-2 bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-5">
          <h2 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 border-b border-[#1E355B] pb-2 font-hud tracking-wider">
            <Sliders className="w-4 h-4 text-[#38BDF8]" />
            <span>LIVE CORRIDOR TELEMETRY ADJUSTMENTS</span>
          </h2>

          {/* Speed slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#93B2D6]">Ambulance Cruising Speed:</span>
              <span className="text-[#38BDF8] font-bold font-hud text-sm">{ambulance.current_speed_kmh} km/h</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="1"
              value={ambulance.current_speed_kmh}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#101E36] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
          </div>

          {/* Traffic Congestion slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#93B2D6]">Delhi Traffic Multiplier:</span>
              <span className="text-[#0EA5E9] font-bold font-hud text-sm">{environment.traffic_density}x ({environment.traffic_label})</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.1"
              value={environment.traffic_density}
              onChange={(e) => handleTrafficChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#101E36] rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
            />
          </div>

          {/* Roadblock Injection & Voice Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleRoadblockToggle}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                environment.roadblock_active
                  ? 'bg-[#2563EB]/15 border-[#2563EB] text-[#2563EB] shadow-[0_0_12px_rgba(255,64,87,0.25)]'
                  : 'bg-[#101E36] border-[#1E355B] text-[#93B2D6] hover:border-[#38BDF8]/40'
              }`}
            >
              <div>
                <div className="text-xs font-mono font-bold text-[#F0F7FF]">Inject / Remove Roadblock</div>
                <div className="text-[11px] text-[#93B2D6] mt-0.5">Simulate vehicle breakdown or diversion</div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                environment.roadblock_active ? 'bg-[#2563EB] text-[#050B14]' : 'bg-[#050B14] text-[#93B2D6]'
              }`}>
                {environment.roadblock_active ? 'ROADBLOCK ACTIVE' : 'NO ROADBLOCK'}
              </span>
            </button>

            <button
              onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                voiceAlertsEnabled
                  ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-[#38BDF8] shadow-[0_0_12px_rgba(53,217,255,0.25)]'
                  : 'bg-[#101E36] border-[#1E355B] text-[#93B2D6] hover:border-[#38BDF8]/40'
              }`}
            >
              <div>
                <div className="text-xs font-mono font-bold text-[#F0F7FF]">Roadside Speaker TTS (Audio)</div>
                <div className="text-[11px] text-[#93B2D6] mt-0.5">Browser speech synthesis announcer</div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                voiceAlertsEnabled ? 'bg-[#38BDF8] text-[#050B14]' : 'bg-[#050B14] text-[#93B2D6]'
              }`}>
                {voiceAlertsEnabled ? 'AUDIO ENABLED' : 'MUTED'}
              </span>
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Verification Gauge (1 col) */}
        <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-3 font-mono text-xs">
          <h3 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 border-b border-[#1E355B] pb-2 font-hud tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-[#7DD3FC]" />
            <span>STATE MACHINE VERIFICATION</span>
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-[#1E355B]">
              <span className="text-[#93B2D6]">Step Index:</span>
              <span className="text-[#38BDF8] font-bold font-hud text-sm">{simulation.current_step} / {simulation.total_steps}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E355B]">
              <span className="text-[#93B2D6]">Remaining Dist:</span>
              <span className="text-[#F0F7FF] font-bold font-hud text-sm">{ambulance.remaining_distance_km} km</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E355B]">
              <span className="text-[#93B2D6]">Predicted ETA:</span>
              <span className="text-[#38BDF8] font-bold font-hud text-sm drop-shadow-[0_0_8px_rgba(53,217,255,0.4)]">{prediction.predicted_eta_formatted}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E355B]">
              <span className="text-[#93B2D6]">Delay Risk:</span>
              <span className="text-[#0EA5E9] font-bold">{prediction.delay_risk}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E355B]">
              <span className="text-[#93B2D6]">Active RSU Lead:</span>
              <span className="text-[#2563EB] font-bold font-hud text-sm">{prediction.recommended_advance_alert_lead_seconds}s</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#93B2D6] leading-relaxed">
            Advancing the simulation will trigger alerts when the distance to the next checkpoint enters its radius threshold (&lt;650m).
          </div>
        </div>
      </div>
    </div>
  );
};
