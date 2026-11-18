import React from 'react';
import { DelhiJunctionInfo } from './types';
import { DELHI_JUNCTIONS } from './useHardwareSimulator';
import { Shield, Radio, CheckCircle2, AlertTriangle, Send, MapPin, Activity, Bell } from 'lucide-react';

interface Props {
  activeJunction: DelhiJunctionInfo;
  onSelectJunction: (id: number) => void;
  ambulanceDistKm: number;
  etaSeconds: number;
  stage: number;
  isAcknowledged: boolean;
  onAcknowledge: () => void;
  trafficDensity: string;
  queueMeters: number;
  onSendRadioDispatch: (msg: string) => void;
}

export const PoliceDeskPanel: React.FC<Props> = ({
  activeJunction,
  onSelectJunction,
  ambulanceDistKm,
  etaSeconds,
  stage,
  isAcknowledged,
  onAcknowledge,
  trafficDensity,
  queueMeters,
  onSendRadioDispatch,
}) => {
  const etaMins = Math.floor(etaSeconds / 60);
  const etaSecs = (etaSeconds % 60).toString().padStart(2, '0');

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 shadow-xl space-y-4 font-mono text-xs">
      {/* Desk Title & Status */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400">
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white tracking-wide">
                DELHI POLICE TRAFFIC HQ — CORRIDOR OPERATIONS DESK
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                TOC-DELHI-CENTRAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live IoT Infrastructure Telemetry & Emergency Preemption Authorization
            </p>
          </div>
        </div>

        {/* Officer Authorization Button */}
        <div className="flex items-center gap-2">
          {isAcknowledged ? (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1.5 text-xs">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>OFFICER AUTHORIZATION ACTIVE</span>
            </div>
          ) : (
            <button
              onClick={onAcknowledge}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <CheckCircle2 size={14} />
              <span>Acknowledge & Authorize Green Wave</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Mission HUD Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Active Emergency Vehicle */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Unit</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-red-400">DL-01-EMS-4402</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 animate-pulse">
              P1 CARDIAC
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Origin: Connaught Place → LNJP Trauma</p>
        </div>

        {/* Active Junction Target */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Priority Junction</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-cyan-300 truncate" style={{ maxWidth: '140px' }}>
              {activeJunction.name.split('(')[0]}
            </span>
            <span className="text-[9px] font-bold text-slate-400">{activeJunction.rsuId.split('-')[2]}</span>
          </div>
          <p className="text-[10px] text-slate-400">Preemption Corridor: Radial Road 4</p>
        </div>

        {/* Proximity & ETA */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Distance & ETA</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-300">{ambulanceDistKm.toFixed(2)} km</span>
            <span className="text-sm font-bold text-emerald-400">{etaMins}m {etaSecs}s</span>
          </div>
          <p className="text-[10px] text-slate-400">Speed: 60 km/h Average</p>
        </div>

        {/* Traffic Density & Bottleneck */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Queue Telemetry</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">{queueMeters} meters</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
              trafficDensity === 'gridlock' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              {trafficDensity}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Sensors: HC-SR04 + Doppler</p>
        </div>
      </div>

      {/* Junction RSU Network Communication Status Grid */}
      <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Radio size={14} className="text-cyan-400" /> Delhi Corridor RSU Hardware Nodes
          </span>
          <span className="text-[10px] text-slate-500">Click any junction to switch hardware digital twin</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {DELHI_JUNCTIONS.map(junc => {
            const isSelected = junc.id === activeJunction.id;
            const isPreempted = isSelected && stage >= 4 && stage <= 5;

            return (
              <button
                key={junc.id}
                onClick={() => onSelectJunction(junc.id)}
                className={`p-2 rounded-lg border text-left transition-all relative ${
                  isSelected
                    ? isPreempted
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-blue-950/40 border-blue-500/80 text-blue-300 shadow-md shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-slate-500">#{junc.id}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    isPreempted ? 'bg-emerald-400 animate-ping' : isSelected ? 'bg-cyan-400' : 'bg-slate-600'
                  }`} />
                </div>
                <div className="text-[10px] font-bold truncate text-white">{junc.name.split(' ')[0]}</div>
                <div className="text-[8px] text-slate-500 truncate">{junc.rsuId}</div>
                <div className="mt-1 text-[8px] font-bold" style={{
                  color: isPreempted ? '#34d399' : isSelected ? '#38bdf8' : '#64748b'
                }}>
                  {isPreempted ? '🟢 PREEMPTED' : isSelected ? '● INSPECTING' : 'STANDBY'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Police Quick Dispatch Broadcast Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
          <Bell size={12} className="text-amber-400" /> Tactical Dispatch Commands:
        </span>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <button
            onClick={() => onSendRadioDispatch('TOC to all traffic posts on Vikas Marg: Enforce strict clearance. Ambulance approaching.')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            📢 Broadcast Clearance Order
          </button>
          <button
            onClick={() => onSendRadioDispatch('TOC to PCR-ITO: Assist motorcycle outriders at ITO Chowk junction immediately.')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            🚔 Dispatch PCR Outriders
          </button>
          <button
            onClick={() => onSendRadioDispatch('LNJP Emergency Trauma Room notified: Patient vitals transmitted via secure mesh.')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            🏥 Notify LNJP ER Gate
          </button>
        </div>
      </div>
    </div>
  );
};
