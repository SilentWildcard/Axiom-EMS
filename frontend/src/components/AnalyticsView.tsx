import React, { useState } from 'react';
import { ERSState } from '../types';
import { 
  BarChart3, 
  Download, 
  Clock, 
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface AnalyticsViewProps {
  state: ERSState;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state }) => {
  const { recent_events, iot_devices, police_notifications, prediction, environment } = state;
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = recent_events.filter(e => {
    if (filterType === 'ALL') return true;
    return e.event_type.includes(filterType);
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `axiom_ems_delhi_audit_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'EventType', 'AmbulanceID', 'Message'];
    const rows = recent_events.map(e => [
      e.id,
      e.time_str,
      e.event_type,
      e.ambulance_id,
      `"${e.message.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `axiom_ems_delhi_events_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onlineUnits = iot_devices.filter(d => d.is_online).length;
  const totalUnits = iot_devices.length;

  return (
    <div className="space-y-6">
      {/* Analytics Banner */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-[#7DD3FC]/15 text-[#7DD3FC] rounded-lg border border-[#7DD3FC]/40 shadow-[0_0_10px_rgba(66,230,164,0.25)]">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-hud text-[#F0F7FF] tracking-wider">
              CORRIDOR PERFORMANCE ANALYTICS & AUDIT LOGS
            </h1>
          </div>
          <p className="text-[#93B2D6] text-xs sm:text-sm mt-1">
            Simulated corridor synchronization metrics, alert latency distributions, and checkpoint verification logs.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 font-mono text-xs">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#101E36] hover:bg-[#1E355B] border border-[#1E355B] hover:border-[#7DD3FC]/50 text-[#F0F7FF] rounded-lg transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#7DD3FC]" />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#101E36] hover:bg-[#1E355B] border border-[#1E355B] hover:border-[#38BDF8]/50 text-[#38BDF8] rounded-lg transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>EXPORT JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1528] border border-[#1E355B] hover:border-[#7DD3FC]/40 rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] font-mono transition">
          <p className="text-[11px] uppercase text-[#93B2D6] font-medium tracking-wider">IoT Mesh Availability</p>
          <div className="text-2xl font-bold font-hud text-[#7DD3FC] mt-1 tracking-wider drop-shadow-[0_0_8px_rgba(66,230,164,0.3)]">
            {Math.round((onlineUnits / totalUnits) * 100)}%
          </div>
          <span className="text-[11px] text-[#7DD3FC]/80">{onlineUnits} of {totalUnits} Roadside Nodes Active</span>
        </div>

        <div className="bg-[#0B1528] border border-[#1E355B] hover:border-[#38BDF8]/40 rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] font-mono transition">
          <p className="text-[11px] uppercase text-[#93B2D6] font-medium tracking-wider">Avg Advance Lead</p>
          <div className="text-2xl font-bold font-hud text-[#38BDF8] mt-1 tracking-wider drop-shadow-[0_0_8px_rgba(53,217,255,0.3)]">
            {prediction.recommended_advance_alert_lead_seconds}s
          </div>
          <span className="text-[11px] text-[#93B2D6]">Target: 60s - 90s Lead Time</span>
        </div>

        <div className="bg-[#0B1528] border border-[#1E355B] hover:border-[#2563EB]/40 rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] font-mono transition">
          <p className="text-[11px] uppercase text-[#93B2D6] font-medium tracking-wider">Police SOP Compliance</p>
          <div className="text-2xl font-bold font-hud text-[#2563EB] mt-1 tracking-wider drop-shadow-[0_0_8px_rgba(82,123,255,0.3)]">
            {police_notifications.length > 0 
              ? `${Math.round((police_notifications.filter(p => p.acknowledged).length / police_notifications.length) * 100)}%` 
              : '100%'}
          </div>
          <span className="text-[11px] text-[#93B2D6]">Police SOP Acknowledgement</span>
        </div>

        <div className="bg-[#0B1528] border border-[#1E355B] hover:border-[#0EA5E9]/40 rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] font-mono transition">
          <p className="text-[11px] uppercase text-[#93B2D6] font-medium tracking-wider">Simulated Transit Saving</p>
          <div className="text-2xl font-bold font-hud text-[#0EA5E9] mt-1 tracking-wider drop-shadow-[0_0_8px_rgba(255,176,32,0.3)]">
            ~{(totalUnits * 1.8 * (environment.traffic_density / 2.0)).toFixed(1)} min
          </div>
          <span className="text-[11px] text-[#0EA5E9]/80">Simulated Clearance Differential</span>
        </div>
      </div>

      {/* Checkpoint Response Times Breakdown */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-4">
        <h2 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 border-b border-[#1E355B] pb-2 font-hud tracking-wider">
          <Clock className="w-4 h-4 text-[#38BDF8]" />
          <span>CHECKPOINT ALERT-TO-CLEARANCE TIMELINE (SIMULATED)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1E355B] text-[#93B2D6] text-[11px]">
                <th className="py-2.5 px-3 font-semibold">CHECKPOINT</th>
                <th className="py-2.5 px-3 font-semibold">STAGE 1 ADVANCE ALERT</th>
                <th className="py-2.5 px-3 font-semibold">POLICE ACK</th>
                <th className="py-2.5 px-3 font-semibold">ARRIVAL STAGE 2A</th>
                <th className="py-2.5 px-3 font-semibold">PASSAGE STAGE 2B</th>
                <th className="py-2.5 px-3 font-semibold">CLEARANCE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E355B]/60">
              {state.checkpoints.map((cp) => (
                <tr key={cp.id} className="hover:bg-[#101E36]/50 transition">
                  <td className="py-2.5 px-3 font-semibold text-[#F0F7FF]">{cp.name}</td>
                  <td className="py-2.5 px-3">
                    {cp.alert_stage1_sent ? (
                      <span className="text-[#0EA5E9] font-bold">DISPATCHED</span>
                    ) : (
                      <span className="text-[#93B2D6]/40">STANDBY</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {cp.police_acknowledged ? (
                      <span className="text-[#38BDF8] font-bold">{cp.police_action_status}</span>
                    ) : (
                      <span className="text-[#93B2D6]/40">PENDING</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {cp.arrived_timestamp ? (
                      <span className="text-[#2563EB] font-bold">REACHED</span>
                    ) : (
                      <span className="text-[#93B2D6]/40">EN ROUTE</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {cp.passed_timestamp ? (
                      <span className="text-[#7DD3FC] font-bold">CLEARED</span>
                    ) : (
                      <span className="text-[#93B2D6]/40">IN TRANSIT</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      cp.passed_timestamp ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/50' :
                      cp.arrived_timestamp ? 'bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/50' :
                      cp.alert_stage1_sent ? 'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/50' :
                      'bg-[#050B14] text-[#93B2D6] border border-[#1E355B]'
                    }`}>
                      {cp.passed_timestamp ? 'COMPLETED' : cp.arrived_timestamp ? 'ACTIVE' : cp.alert_stage1_sent ? 'APPROACHING' : 'IDLE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filterable Event History Log */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E355B] pb-3">
          <h2 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 font-hud tracking-wider">
            <FileText className="w-4 h-4 text-[#2563EB]" />
            <span>AUDIT TRAIL & EVENT LOG ({filteredEvents.length} RECORDS)</span>
          </h2>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {['ALL', 'ALERT', 'CHECKPOINT', 'POLICE', 'ROADBLOCK'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded-lg transition font-semibold tracking-wider text-[11px] ${
                  filterType === f
                    ? 'bg-[#38BDF8] text-[#050B14] shadow-[0_0_10px_rgba(53,217,255,0.3)] font-bold'
                    : 'bg-[#101E36] text-[#93B2D6] hover:text-[#F0F7FF] border border-[#1E355B]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Event Table */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="p-3 bg-[#101E36] border border-[#1E355B] hover:border-[#38BDF8]/30 rounded-xl text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition">
              <div className="flex items-center space-x-3">
                <span className="text-[#38BDF8] text-[11px] font-bold">{evt.time_str}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                  evt.event_type.includes('ARRIVED') || evt.event_type.includes('COMPLETED') ? 'bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/40' :
                  evt.event_type.includes('ALERT') ? 'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/40' :
                  evt.event_type.includes('PASSED') ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/40' :
                  'bg-[#050B14] text-[#93B2D6] border border-[#1E355B]'
                }`}>
                  {evt.event_type}
                </span>
                <span className="text-[#F0F7FF] font-sans text-xs">{evt.message}</span>
              </div>
              <span className="text-[#93B2D6]/60 text-[10px] self-end sm:self-center font-mono">
                {evt.ambulance_id}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimers & Ethics Statement */}
      <div className="bg-[#050B14] border border-[#1E355B] rounded-xl p-4 text-xs text-[#93B2D6] space-y-1">
        <p className="font-semibold text-[#F0F7FF]">Statistical Disclaimer & Evaluation Ethics:</p>
        <p className="leading-relaxed">
          All response times, baseline comparisons, and route clearance estimates presented in this dashboard are generated by the simulation model to demonstrate the coordination algorithm. The MVP does not fabricate unmeasured reductions in mortality or clinical outcomes.
        </p>
      </div>
    </div>
  );
};
