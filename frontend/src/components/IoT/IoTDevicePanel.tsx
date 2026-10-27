import React from 'react';
import type { IoTDevice } from '../../api/types';
import { Cpu, Radio, Navigation, Wifi, Send } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface IoTDevicePanelProps {
  devices: IoTDevice[];
  loading?: boolean;
  onSendCommand?: (deviceId: string, eventType: string, payload: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  traffic_light: <Radio size={20} />,
  siren: <Wifi size={20} />,
  gps: <Navigation size={20} />,
};

const statusConfig = {
  active:  { color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/30', dot: '#22c55e' },
  standby: { color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/30', dot: '#f59e0b' },
  offline: { color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30', dot: '#ef4444' },
};

const IoTDevicePanel: React.FC<IoTDevicePanelProps> = ({ devices, loading, onSendCommand }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-36 bg-[#0f1629] rounded-xl border border-[#1e2a4a]" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {devices.map(dev => {
        const cfg = statusConfig[dev.status] ?? statusConfig.offline;
        const icon = typeIcons[dev.type] ?? <Cpu size={20} />;
        return (
          <div key={dev.id} className={`bg-[#0f1629] rounded-xl border ${cfg.border} p-4 transition-all`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.color}`}>{icon}</div>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot, animation: dev.status === 'active' ? 'pulse 1s infinite' : undefined }} />
                {dev.status.toUpperCase()}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-white font-semibold text-sm leading-tight">{dev.name}</div>
              <div className="text-[#94a3b8] text-xs mt-1 capitalize">{dev.type.replace('_', ' ')}</div>
              <div className="text-[#4b5563] text-xs mt-1">
                Last seen: {formatRelativeTime(dev.last_seen)}
              </div>
            </div>

            <button
              onClick={() => onSendCommand?.(dev.id, 'command', `{"action":"ping","device":"${dev.id}"}`)}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium text-[#94a3b8] border border-[#1e2a4a] hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition-all"
            >
              <Send size={11} />
              Send Command
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default IoTDevicePanel;
