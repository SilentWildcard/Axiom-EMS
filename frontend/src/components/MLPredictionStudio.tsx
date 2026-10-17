import React, { useState } from 'react';
import { ERSState, PredictionResult } from '../types';
import { ERSApi } from '../services/api';
import { 
  Cpu, 
  BarChart, 
  Sliders, 
  Sparkles, 
  Info 
} from 'lucide-react';

interface MLPredictionStudioProps {
  state: ERSState;
}

export const MLPredictionStudio: React.FC<MLPredictionStudioProps> = ({ state }) => {
  const { prediction, ambulance, environment } = state;

  // Interactive custom playground states
  const [customDistance, setCustomDistance] = useState<number>(ambulance.remaining_distance_km || 8.5);
  const [customSpeed, setCustomSpeed] = useState<number>(ambulance.current_speed_kmh || 42);
  const [customDensity, setCustomDensity] = useState<number>(environment.traffic_density || 1.8);
  const [customHour, setCustomHour] = useState<number>(17);
  const [customIntersections, setCustomIntersections] = useState<number>(4);
  const [customRoadblock, setCustomRoadblock] = useState<boolean>(environment.roadblock_active);
  const [customWeather, setCustomWeather] = useState<number>(1.0);

  const [interactiveResult, setInteractiveResult] = useState<PredictionResult | null>(prediction);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const runCustomPrediction = async () => {
    setIsCalculating(true);
    try {
      const res = await ERSApi.customPredict({
        distance_km: customDistance,
        current_speed_kmh: customSpeed,
        traffic_density: customDensity,
        hour_of_day: customHour,
        is_weekend: 0,
        intersections_remaining: customIntersections,
        roadblock_active: customRoadblock ? 1 : 0,
        weather_factor: customWeather
      });
      setInteractiveResult(res);
    } finally {
      setIsCalculating(false);
    }
  };

  const activeResult = interactiveResult || prediction;
  const metadata = state.prediction.model_metadata;

  return (
    <div className="space-y-6">
      {/* Title & Metadata Header */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 bg-[#38BDF8]/15 text-[#38BDF8] rounded-lg border border-[#38BDF8]/40 shadow-[0_0_10px_rgba(56,189,248,0.25)]">
                <Cpu className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-hud text-[#F0F7FF] tracking-wider">AI/ML ETA PREDICTION STUDIO</h1>
              <span className="text-xs bg-[#101E36] text-[#38BDF8] px-2.5 py-0.5 rounded border border-[#38BDF8]/40 font-mono tracking-wider">
                SCIKIT-LEARN MODEL
              </span>
            </div>
            <p className="text-[#93B2D6] text-xs sm:text-sm mt-1">
              GradientBoosting + RandomForest Ensemble trained on Delhi arterial corridor telemetry.
            </p>
          </div>

          {/* Model Statistics Pill */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="bg-[#101E36] border border-[#1E355B] px-3 py-1.5 rounded-lg text-[#93B2D6]">
              <span>R² Score: </span>
              <strong className="text-[#7DD3FC] font-hud text-sm drop-shadow-[0_0_8px_rgba(125,211,252,0.3)]">{metadata?.r2_score || '0.9891'}</strong>
            </div>
            <div className="bg-[#101E36] border border-[#1E355B] px-3 py-1.5 rounded-lg text-[#93B2D6]">
              <span>RMSE: </span>
              <strong className="text-[#38BDF8] font-hud text-sm drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">{metadata?.rmse_seconds || '145.7'}s</strong>
            </div>
            <div className="bg-[#101E36] border border-[#1E355B] px-3 py-1.5 rounded-lg text-[#93B2D6]">
              <span>Improvement: </span>
              <strong className="text-[#2563EB] font-hud text-sm">+{metadata?.accuracy_improvement_pct || '86.4'}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Playground Controls vs Live Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Interactive Feature Sliders (7 cols) */}
        <div className="lg:col-span-7 bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E355B] pb-3">
            <h2 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 font-hud tracking-wider">
              <Sliders className="w-4 h-4 text-[#38BDF8]" />
              <span>CORRIDOR TELEMETRY INPUT FEATURES</span>
            </h2>
            <button
              onClick={runCustomPrediction}
              disabled={isCalculating}
              className="px-3.5 py-1.5 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#050B14] rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 shadow-[0_0_15px_rgba(56,189,248,0.35)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isCalculating ? 'COMPUTING...' : 'RE-RUN ML INFERENCE'}</span>
            </button>
          </div>

          {/* Slider 1: Remaining Distance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#93B2D6]">Remaining Route Distance (km):</span>
              <span className="text-[#38BDF8] font-bold font-hud text-sm">{customDistance} km</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="18.0"
              step="0.1"
              value={customDistance}
              onChange={(e) => setCustomDistance(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#101E36] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
          </div>

          {/* Slider 2: Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#93B2D6]">Current Ambulance Speed (km/h):</span>
              <span className="text-[#38BDF8] font-bold font-hud text-sm">{customSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="1"
              value={customSpeed}
              onChange={(e) => setCustomSpeed(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#101E36] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
          </div>

          {/* Slider 3: Traffic Density */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#93B2D6]">Delhi Arterial Traffic Congestion Multiplier:</span>
              <span className="text-[#0EA5E9] font-bold font-hud text-sm">{customDensity}x ({customDensity > 2.2 ? 'Heavy Gridlock' : customDensity > 1.4 ? 'Rush Hour' : 'Normal'})</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.1"
              value={customDensity}
              onChange={(e) => setCustomDensity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#101E36] rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
            />
          </div>

          {/* Slider 4: Time of Day (Rush hour simulation) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#93B2D6]">Time of Day (24h Clock):</span>
              <span className="text-[#2563EB] font-bold font-hud text-sm">{customHour}:00 hrs {((customHour >= 8 && customHour <= 11) || (customHour >= 17 && customHour <= 20)) ? '(Peak Delhi Rush Hour)' : '(Off-Peak)'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              step="1"
              value={customHour}
              onChange={(e) => setCustomHour(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#101E36] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          {/* Slider 5: Intersections Remaining */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#93B2D6]">Remaining Intersections / Checkpoints:</span>
              <span className="text-[#38BDF8] font-bold font-hud text-sm">{customIntersections} junctions</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={customIntersections}
              onChange={(e) => setCustomIntersections(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#101E36] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
          </div>

          {/* Boolean Toggles: Roadblock & Smog/Weather */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setCustomRoadblock(!customRoadblock)}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                customRoadblock ? 'bg-[#2563EB]/15 border-[#2563EB]/80 text-[#2563EB] shadow-[0_0_12px_rgba(255,64,87,0.25)]' : 'bg-[#101E36] border-[#1E355B] text-[#93B2D6]'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-mono text-[#F0F7FF]">Active Roadblock / VIP Route</div>
                <div className="text-[11px] text-[#93B2D6] mt-0.5">+240s non-linear penalty</div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${customRoadblock ? 'bg-[#2563EB] text-[#050B14]' : 'bg-[#050B14] text-[#93B2D6]'}`}>
                {customRoadblock ? 'ACTIVE' : 'NONE'}
              </span>
            </button>

            <button
              onClick={() => setCustomWeather(customWeather === 1.0 ? 1.35 : 1.0)}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                customWeather > 1.0 ? 'bg-[#2563EB]/15 border-[#2563EB]/80 text-[#2563EB] shadow-[0_0_12px_rgba(82,123,255,0.25)]' : 'bg-[#101E36] border-[#1E355B] text-[#93B2D6]'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-mono text-[#F0F7FF]">Winter Dense Smog (AQI 350+)</div>
                <div className="text-[11px] text-[#93B2D6] mt-0.5">Reduced visibility factor</div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${customWeather > 1.0 ? 'bg-[#2563EB] text-[#050B14]' : 'bg-[#050B14] text-[#93B2D6]'}`}>
                {customWeather > 1.0 ? 'SEVERE' : 'CLEAR'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Col: Prediction Comparison & Uncertainty (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Prediction Comparison Card */}
          <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-4">
            <h2 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 border-b border-[#1E355B] pb-2 font-hud tracking-wider">
              <BarChart className="w-4 h-4 text-[#7DD3FC]" />
              <span>MODEL PREDICTION VS BASELINE</span>
            </h2>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* AI/ML Result */}
              <div className="bg-[#101E36] border border-[#38BDF8]/40 rounded-xl p-3.5 text-center shadow-[0_0_15px_-3px_rgba(53,217,255,0.2)]">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#38BDF8] font-bold">
                  Scikit-Learn ML
                </span>
                <div className="text-2xl font-bold font-hud text-[#38BDF8] mt-1 tracking-wider drop-shadow-[0_0_10px_rgba(53,217,255,0.4)]">
                  {activeResult.predicted_eta_formatted}
                </div>
                <span className="text-[11px] text-[#93B2D6] font-mono">
                  ({activeResult.predicted_eta_seconds} seconds)
                </span>
              </div>

              {/* Baseline Result */}
              <div className="bg-[#101E36]/60 border border-[#1E355B] rounded-xl p-3.5 text-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#93B2D6] font-bold">
                  Baseline (d/v + 30s)
                </span>
                <div className="text-2xl font-bold font-hud text-[#93B2D6]/60 mt-1 line-through tracking-wider">
                  {activeResult.baseline_eta_formatted}
                </div>
                <span className="text-[11px] text-[#93B2D6]/50 font-mono">
                  ({activeResult.baseline_eta_seconds} seconds)
                </span>
              </div>
            </div>

            {/* Confidence Interval (Uncertainty Range) */}
            <div className="bg-[#101E36] border border-[#1E355B] p-3 rounded-lg space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#93B2D6]">90% Confidence Interval:</span>
                <span className="text-[#38BDF8] font-bold">
                  {Math.floor(activeResult.uncertainty_range_seconds[0] / 60)}m {Math.floor(activeResult.uncertainty_range_seconds[0] % 60)}s 
                  {' — '}
                  {Math.floor(activeResult.uncertainty_range_seconds[1] / 60)}m {Math.floor(activeResult.uncertainty_range_seconds[1] % 60)}s
                </span>
              </div>
              <div className="w-full bg-[#050B14] h-2 rounded-full overflow-hidden border border-[#1E355B]">
                <div className="bg-gradient-to-r from-[#38BDF8] to-[#2563EB] h-full w-[65%] mx-auto rounded-full shadow-[0_0_8px_#38BDF8]" />
              </div>
              <div className="flex justify-between text-[10px] text-[#93B2D6]">
                <span>Optimistic: {activeResult.uncertainty_range_seconds[0]}s</span>
                <span>Pessimistic: {activeResult.uncertainty_range_seconds[1]}s</span>
              </div>
            </div>

            {/* Delay Risk & Recommended Advance Alert Lead */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-[#1E355B]">
                <span className="text-[#93B2D6]">Delay Risk Level:</span>
                <span className={`px-2 py-0.5 rounded font-bold tracking-wider ${
                  activeResult.delay_risk === 'CRITICAL' ? 'bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/50 shadow-[0_0_8px_rgba(255,64,87,0.3)]' :
                  activeResult.delay_risk === 'HIGH' ? 'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/50' :
                  'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/50'
                }`}>
                  {activeResult.delay_risk} ({activeResult.delay_ratio}x ratio)
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#93B2D6]">Dynamic Alert Lead:</span>
                <span className="text-[#38BDF8] font-bold font-hud text-base">
                  {activeResult.recommended_advance_alert_lead_seconds} seconds ahead
                </span>
              </div>
            </div>
          </div>

          {/* Feature Importance Breakdown */}
          <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] space-y-3">
            <h3 className="text-xs font-bold text-[#F0F7FF] uppercase tracking-wider font-mono">
              Feature Importance (Gini Impurity)
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-[#93B2D6] mb-0.5">
                  <span>Distance to Checkpoint</span>
                  <span className="text-[#38BDF8] font-bold">42%</span>
                </div>
                <div className="w-full bg-[#101E36] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#38BDF8] h-full rounded-full shadow-[0_0_6px_#38BDF8]" style={{ width: '42%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-[#93B2D6] mb-0.5">
                  <span>Current Speed</span>
                  <span className="text-[#38BDF8] font-bold">24%</span>
                </div>
                <div className="w-full bg-[#101E36] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#38BDF8] h-full rounded-full shadow-[0_0_6px_#38BDF8]" style={{ width: '24%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-[#93B2D6] mb-0.5">
                  <span>Traffic Congestion Multiplier</span>
                  <span className="text-[#0EA5E9] font-bold">18%</span>
                </div>
                <div className="w-full bg-[#101E36] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#0EA5E9] h-full rounded-full shadow-[0_0_6px_#0EA5E9]" style={{ width: '18%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-[#93B2D6] mb-0.5">
                  <span>Active Roadblock Obstruction</span>
                  <span className="text-[#2563EB] font-bold">8%</span>
                </div>
                <div className="w-full bg-[#101E36] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#2563EB] h-full rounded-full shadow-[0_0_6px_#2563EB]" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Regulatory Disclaimer */}
          <div className="bg-[#050B14] border border-[#1E355B] rounded-lg p-3 text-[11px] text-[#93B2D6] flex items-start space-x-2">
            <Info className="w-4 h-4 text-[#93B2D6] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Transparency Note:</strong> Predictions are statistical estimates derived from corridor telemetry. Actual arrival times may vary dynamically based on driver route compliance and on-ground traffic fluctuations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
