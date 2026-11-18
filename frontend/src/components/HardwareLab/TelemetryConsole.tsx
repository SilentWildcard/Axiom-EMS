import React, { useState } from 'react';
import { TelemetryLog } from './types';
import { Terminal, Copy, Check, Trash2, Filter } from 'lucide-react';

interface Props {
  logs: TelemetryLog[];
  onClearLogs?: () => void;
}

export const TelemetryConsole: React.FC<Props> = ({ logs, onClearLogs }) => {
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredLogs = filterSource === 'ALL'
    ? logs
    : logs.filter(l => l.sourceModule.toUpperCase() === filterSource || l.protocol === filterSource);

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map(l => `[${l.timestamp}] [${l.sourceModule.toUpperCase()}] [${l.protocol}] ${l.payload}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono text-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-cyan-400" />
          <span className="font-bold text-white tracking-wide">
            LIVE IOT TELEMETRY & COMMAND LOG STREAM
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            {filteredLogs.length} EVENTS
          </span>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] bg-[#080d1a] border border-slate-800 rounded px-2 py-1">
            <Filter size={11} className="text-slate-400" />
            <select
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">All Protocols & Nodes</option>
              <option value="ESP32">ESP32 RSU</option>
              <option value="4G/LTE">4G / LTE Comms</option>
              <option value="MQTT">MQTT Broker</option>
              <option value="GPIO">GPIO Actuation</option>
              <option value="NMEA">GPS NMEA</option>
              <option value="I2S">I2S Audio</option>
              <option value="POLICE_DESK">Police Desk</option>
            </select>
          </div>

          <button
            onClick={handleCopyLogs}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1 text-[10px] transition-all"
            title="Copy logs to clipboard"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="h-60 bg-[#050912] border border-slate-800/90 rounded-lg p-2.5 overflow-y-auto space-y-1.5 font-mono text-[11px] select-text">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600">
            Waiting for telemetry packets...
          </div>
        ) : (
          filteredLogs.map(log => {
            const levelColor =
              log.level === 'alert'
                ? 'text-red-400 border-red-500/30 bg-red-950/20'
                : log.level === 'warn'
                ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                : log.level === 'success'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
                : 'text-slate-300 border-slate-800/80 bg-slate-900/30';

            return (
              <div
                key={log.id}
                className={`p-1.5 rounded border flex items-start gap-2 leading-relaxed transition-all ${levelColor}`}
              >
                {/* Timestamp */}
                <span className="text-[10px] text-slate-500 shrink-0 font-bold">
                  [{log.timestamp}]
                </span>

                {/* Source & Protocol Badge */}
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300 shrink-0 uppercase">
                  {log.sourceModule}
                </span>

                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-purple-300 shrink-0 uppercase">
                  {log.protocol}
                </span>

                {/* Log Payload Text */}
                <span className="flex-1 break-words">{log.payload}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-800/60 pt-1.5">
        <span>Deterministic event bus driven by state machine</span>
        <span>RS-485 / MQTT QoS-1 Logging Active</span>
      </div>
    </div>
  );
};
