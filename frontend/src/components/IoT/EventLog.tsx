import React from 'react';
import type { IoTEvent } from '../../api/types';
import { Terminal } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

interface EventLogProps {
  events: IoTEvent[];
}

const eventTypeColor: Record<string, string> = {
  command: 'text-[#00d4ff]',
  alert:   'text-[#ef4444]',
  status:  'text-[#22c55e]',
  default: 'text-[#94a3b8]',
};

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const sorted = [...events].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="text-[#00d4ff]" size={16} />
        <h3 className="text-white font-semibold text-sm">IoT Event Log</h3>
        <span className="ml-auto text-xs text-[#94a3b8]">Auto-refresh 5s</span>
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto font-mono text-xs">
        {sorted.length === 0 ? (
          <div className="text-[#4b5563] text-center py-6">No events logged</div>
        ) : (
          sorted.map(evt => (
            <div key={evt.id} className="flex items-start gap-2 py-1 px-2 rounded hover:bg-[#0a0e1a]">
              <span className="text-[#4b5563] flex-shrink-0">[{formatTimestamp(evt.timestamp)}]</span>
              <span className={eventTypeColor[evt.event_type] ?? eventTypeColor.default}>
                {evt.event_type.toUpperCase()}
              </span>
              <span className="text-[#94a3b8] truncate">{evt.device_name}</span>
              <span className="text-[#4b5563] truncate">{evt.payload}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventLog;
