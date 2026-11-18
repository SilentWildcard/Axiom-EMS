import React from 'react';
import { SimulationStage } from './types';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface Props {
  currentStage: SimulationStage;
  progressPercent: number;
  onSelectStage: (stage: SimulationStage) => void;
}

interface StageMeta {
  stage: SimulationStage;
  title: string;
  shortDesc: string;
  badge: string;
}

const STAGES: StageMeta[] = [
  {
    stage: 1,
    title: 'NORMAL TRAFFIC',
    shortDesc: 'Routine cycle, sensor baseline monitoring',
    badge: 'STANDBY',
  },
  {
    stage: 2,
    title: 'AMBULANCE DETECTED',
    shortDesc: 'GPS locked, AI/ML route optimizer active',
    badge: 'GNSS TRACK',
  },
  {
    stage: 3,
    title: 'IoT COMMAND TX',
    shortDesc: '4G LTE downlink, ESP32 receives priority',
    badge: 'MQTT 4G',
  },
  {
    stage: 4,
    title: 'JUNCTION PREPARE',
    shortDesc: 'Signal Green, VMS display alert, Siren sounds',
    badge: 'ACTUATION',
  },
  {
    stage: 5,
    title: 'AMBULANCE PASSAGE',
    shortDesc: 'Crossing intersection, ETA 00:00, YOLO locked',
    badge: 'TRANSIT',
  },
  {
    stage: 6,
    title: 'NORMALISATION',
    shortDesc: 'Clearance verified, normal cycles restored',
    badge: 'RESTORE',
  },
];

export const SimulationTimeline: React.FC<Props> = ({
  currentStage,
  progressPercent,
  onSelectStage,
}) => {
  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 shadow-xl font-mono text-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="font-bold text-white tracking-wide">
          END-TO-END IoT HARDWARE EXECUTION WORKFLOW
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Stage Progress:</span>
          <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-cyan-300 font-bold">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* 6-Stage Stepper Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
        {STAGES.map(s => {
          const isActive = s.stage === currentStage;
          const isPassed = s.stage < currentStage;

          return (
            <button
              key={s.stage}
              onClick={() => onSelectStage(s.stage)}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                  : isPassed
                  ? 'bg-slate-900/50 border-emerald-500/30 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Active stage top highlight bar */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400" />
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black ${
                    isActive ? 'text-cyan-300' : isPassed ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    STAGE {s.stage}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  ) : (
                    <Circle size={12} className="text-slate-600" />
                  )}
                </div>

                <div className={`text-[11px] font-extrabold tracking-tight ${
                  isActive ? 'text-white' : isPassed ? 'text-slate-300' : 'text-slate-400'
                }`}>
                  {s.title}
                </div>
              </div>

              <div className="mt-2 pt-1 border-t border-slate-800/60">
                <p className="text-[9px] text-slate-400 leading-tight line-clamp-2">
                  {s.shortDesc}
                </p>
                <span className={`inline-block mt-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded ${
                  isActive
                    ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-700'
                    : isPassed
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}>
                  {s.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
