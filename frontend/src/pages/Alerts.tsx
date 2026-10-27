import React, { useState } from 'react';
import SirenControl from '../components/Alerts/SirenControl';
import AlertHistory from '../components/Alerts/AlertHistory';
import AcknowledgementPanel from '../components/Police/AcknowledgementPanel';
import { useAlerts, useCheckpoints } from '../api/hooks';
import { Bell, Search } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';

const MISSION_ID = 'mission-alpha-7';

const Alerts: React.FC = () => {
  const { alerts, config, updateConfig, recordAlert } = useAlerts();
  const { checkpoints } = useCheckpoints(MISSION_ID);
  const [search, setSearch] = useState('');

  const cpMap = Object.fromEntries(checkpoints.map(c => [c.id, c.name]));

  const filtered = alerts.filter(a => {
    const cpName = cpMap[a.checkpoint_id] ?? '';
    return cpName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.includes(search);
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white text-xl font-bold flex items-center gap-2">
        <Bell className="text-[#f59e0b]" size={22} />
        Alerts & Siren Control
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Full siren control */}
        <div>
          <SirenControl
            config={config}
            onConfigChange={updateConfig}
            onAlertTriggered={(dur) => {
              const approaching = checkpoints.find(cp => cp.status === 'approaching');
              if (approaching) recordAlert(approaching.id, 1, dur);
            }}
          />
        </div>

        {/* Middle: Alert table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0f1629] border border-[#1e2a4a] rounded-lg text-white text-sm placeholder-[#4b5563] focus:outline-none focus:border-[#00d4ff]/50"
            />
          </div>

          {/* Table */}
          <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-[#1e2a4a]">
                <tr className="text-[#94a3b8] text-xs uppercase">
                  <th className="text-left p-3">Checkpoint</th>
                  <th className="text-left p-3">Stage</th>
                  <th className="text-left p-3">Triggered</th>
                  <th className="text-left p-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#4b5563]">No alerts found</td>
                  </tr>
                ) : (
                  filtered.map(a => (
                    <tr key={a.id} className="border-b border-[#1e2a4a]/50 hover:bg-[#0a0e1a] transition-colors">
                      <td className="p-3 text-white">{cpMap[a.checkpoint_id] ?? a.checkpoint_id}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          a.stage === 1 ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#ef4444]/10 text-[#ef4444]'
                        }`}>
                          Stage {a.stage} — {a.stage === 1 ? 'Approaching' : 'Arrival'}
                        </span>
                      </td>
                      <td className="p-3 text-[#94a3b8] font-mono text-xs">{formatTimestamp(a.triggered_at)}</td>
                      <td className="p-3 text-[#94a3b8] font-mono text-xs">{a.duration_s ? `${a.duration_s}s` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Acknowledgement panel */}
          <AcknowledgementPanel alerts={alerts} checkpoints={checkpoints} />
        </div>
      </div>
    </div>
  );
};

export default Alerts;
