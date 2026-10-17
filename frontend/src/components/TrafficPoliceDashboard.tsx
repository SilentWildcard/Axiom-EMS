import React, { useState } from 'react';
import { ERSState } from '../types';
import { ERSApi } from '../services/api';
import { 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Check, 
  FileCheck,
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';

interface TrafficPoliceDashboardProps {
  state: ERSState;
  onNavigateTab: (tab: string) => void;
}

export const TrafficPoliceDashboard: React.FC<TrafficPoliceDashboardProps> = ({ state }) => {
  const { police_notifications, checkpoints, ambulance } = state;
  const [escalationNotice, setEscalationNotice] = useState<string | null>(null);

  const handleAction = async (notifId: string, action: 'ACKNOWLEDGED' | 'PREPARING' | 'CLEARED' | 'ESCALATED') => {
    await ERSApi.acknowledgePoliceAlert(notifId, action);
    if (action === 'ESCALATED') {
      setEscalationNotice(`Corridor alert escalated to Delhi Traffic Police Central Command for manual priority override.`);
      setTimeout(() => setEscalationNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Police Control Header */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 bg-[#2563EB]/15 text-[#2563EB] rounded-lg border border-[#2563EB]/40 shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-hud text-[#F0F7FF] tracking-wider">
                DELHI TRAFFIC POLICE — EMERGENCY CORRIDOR DISPATCH DESK
              </h1>
            </div>
            <p className="text-[#93B2D6] text-xs sm:text-sm mt-1">
              Authorized Traffic Control Officers Console. Advance signal advisories & green wave coordination.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="px-3 py-1.5 bg-[#101E36] border border-[#1E355B] rounded-lg text-[#93B2D6]">
              Active Unit: <strong className="text-[#2563EB] font-hud text-sm">{ambulance.id}</strong>
            </span>
            <span className="px-3 py-1.5 bg-[#101E36] border border-[#1E355B] rounded-lg text-[#93B2D6]">
              Status: <strong className="text-[#38BDF8]">{ambulance.route_name.split(':')[0]}</strong>
            </span>
          </div>
        </div>
      </div>

      {escalationNotice && (
        <div className="bg-[#2563EB]/20 border border-[#2563EB] rounded-xl p-4 text-xs font-mono text-[#F0F7FF] flex items-center space-x-2.5 shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-bounce">
          <AlertOctagon className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
          <span className="font-semibold">{escalationNotice}</span>
        </div>
      )}

      {/* Safety Notice Warning */}
      <div className="bg-[#101E36] border border-[#0EA5E9]/40 rounded-xl p-3.5 text-xs text-[#0EA5E9] flex items-start space-x-2.5 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#F0F7FF]">Mandatory Protocol:</strong> ERS AI coordinates advance alerts and recommended lane-clearance SOPs. Signal changes and lane closures remain strictly subject to on-ground traffic police officer judgment and Delhi Traffic Police standard operating procedures.
        </div>
      </div>

      {/* Active Alerts Awaiting Police Action */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#F0F7FF] flex items-center space-x-2 font-hud tracking-wide">
          <Clock className="w-4 h-4 text-[#38BDF8]" />
          <span>PRIORITY CHECKPOINT ALERTS REQUIRING ACTION ({police_notifications.length})</span>
        </h2>

        {police_notifications.length === 0 ? (
          <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-8 text-center space-y-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)]">
            <ShieldCheck className="w-10 h-10 text-[#93B2D6]/40 mx-auto" />
            <p className="text-[#93B2D6] text-sm font-medium">No pending Stage 1 approach alerts at this moment.</p>
            <p className="text-xs text-[#93B2D6]/70">
              When the simulated ambulance nears within 650m of an intersection, an advance alert card will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {police_notifications.map((notif) => {
              const isAcknowledged = notif.acknowledged;
              const status = notif.action_status || (isAcknowledged ? 'ACKNOWLEDGED' : 'PENDING');

              return (
                <div
                  key={notif.id}
                  className={`border rounded-xl p-4 transition shadow-lg space-y-3 ${
                    status === 'CLEARED' ? 'bg-[#7DD3FC]/10 border-[#7DD3FC]/60 shadow-[0_0_15px_-3px_rgba(125,211,252,0.2)]' :
                    status === 'PREPARING' ? 'bg-[#38BDF8]/10 border-[#38BDF8]/60 shadow-[0_0_15px_-3px_rgba(56,189,248,0.2)]' :
                    status === 'ESCALATED' ? 'bg-[#2563EB]/20 border-[#2563EB] shadow-[0_0_20px_-3px_rgba(37,99,235,0.35)]' :
                    'bg-[#0EA5E9]/15 border-[#0EA5E9]/70 shadow-[0_0_15px_-3px_rgba(14,165,233,0.2)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E355B] pb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs bg-[#050B14] border border-[#1E355B] text-[#38BDF8] px-2.5 py-0.5 rounded font-semibold">
                        {notif.time_str}
                      </span>
                      <h3 className="text-sm font-bold text-[#F0F7FF] font-hud tracking-wide">
                        {notif.intersection_name} <span className="text-xs font-mono text-[#93B2D6]">({notif.checkpoint_id})</span>
                      </h3>
                    </div>

                    <div className="flex items-center space-x-3 font-mono text-xs">
                      <span className="text-[#93B2D6]">Distance: <strong className="text-[#F0F7FF] font-hud text-sm">{notif.distance_meters}m</strong></span>
                      <span className="text-[#93B2D6]">Est Arrival: <strong className="text-[#38BDF8] font-hud text-sm">{notif.eta_seconds}s</strong></span>
                      <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] tracking-wider ${
                        status === 'CLEARED' ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/50' :
                        status === 'PREPARING' ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/50' :
                        status === 'ESCALATED' ? 'bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/50' :
                        'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/50 animate-pulse'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Recommended SOP Action */}
                  <div className="bg-[#101E36] border border-[#1E355B] p-3 rounded-lg text-xs space-y-1">
                    <span className="uppercase font-mono text-[10px] font-bold text-[#38BDF8]">
                      RECOMMENDED TRAFFIC SOP ACTION:
                    </span>
                    <p className="text-[#F0F7FF] font-medium leading-relaxed">
                      {notif.recommended_action}
                    </p>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                    <button
                      onClick={() => handleAction(notif.id, 'ACKNOWLEDGED')}
                      disabled={isAcknowledged && status === 'ACKNOWLEDGED'}
                      className="px-3 py-1.5 bg-[#101E36] hover:bg-[#1E355B] disabled:opacity-50 border border-[#1E355B] text-[#F0F7FF] rounded-lg transition flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>1. ACKNOWLEDGE ALERT</span>
                    </button>

                    <button
                      onClick={() => handleAction(notif.id, 'PREPARING')}
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white rounded-lg font-bold transition flex items-center space-x-1.5 shadow-[0_0_12px_rgba(82,123,255,0.3)]"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>2. MARK CORRIDOR PREPARING</span>
                    </button>

                    <button
                      onClick={() => handleAction(notif.id, 'CLEARED')}
                      className="px-3 py-1.5 bg-[#7DD3FC] hover:bg-[#7DD3FC]/90 text-[#050B14] rounded-lg font-black transition flex items-center space-x-1.5 shadow-[0_0_12px_rgba(66,230,164,0.35)]"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>3. CONFIRM INTERSECTION PREPARED</span>
                    </button>

                    <button
                      onClick={() => handleAction(notif.id, 'ESCALATED')}
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-[#050B14] rounded-lg font-bold transition flex items-center space-x-1.5 ml-auto shadow-[0_0_12px_rgba(255,64,87,0.3)]"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>ESCALATE OBSTACLE</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Checkpoint Clearance History Summary */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-4">
        <h2 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 border-b border-[#1E355B] pb-2 font-hud tracking-wider">
          <FileCheck className="w-4 h-4 text-[#7DD3FC]" />
          <span>CHECKPOINT PREPAREDNESS & CLEARANCE STATUS</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {checkpoints.map((cp) => (
            <div key={cp.id} className="bg-[#101E36] border border-[#1E355B] rounded-xl p-3.5 text-xs space-y-1.5 hover:border-[#38BDF8]/30 transition">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-[#F0F7FF] text-xs font-hud tracking-wide">{cp.name}</h4>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold tracking-wider ${
                  cp.passed_timestamp ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/50' :
                  cp.arrived_timestamp ? 'bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/50 animate-pulse' :
                  cp.police_acknowledged ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/50' :
                  'bg-[#050B14] text-[#93B2D6] border border-[#1E355B]'
                }`}>
                  {cp.passed_timestamp ? 'CLEARED' :
                   cp.arrived_timestamp ? 'EMS IN TRANSIT' :
                   cp.police_action_status}
                </span>
              </div>
              <p className="text-[11px] text-[#93B2D6] truncate">SOP: {cp.recommended_action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
