import React from 'react';
import { HardwareDeviceState } from './types';
import { Wifi, Radio, Zap, AlertTriangle, ArrowRightLeft, RefreshCw } from 'lucide-react';

interface Props {
  device: HardwareDeviceState;
  onTogglePower: () => void;
  latencyMs: number;
  commsFaultInjected: boolean;
  stage: number;
}

export const CommunicationModule: React.FC<Props> = ({
  device,
  onTogglePower,
  latencyMs,
  commsFaultInjected,
  stage,
}) => {
  const isOnline = device.powerOn && !commsFaultInjected;

  // Signal strength bars (0 to 5)
  const signalBars = commsFaultInjected ? 1 : 4;
  const rssiDbm = commsFaultInjected ? -112 : -64;

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            !isOnline && !commsFaultInjected ? 'bg-slate-900 border-slate-800 text-slate-600'
            : commsFaultInjected ? 'bg-red-500/10 border-red-500/40 text-red-400'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
          }`}>
            <Wifi size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{device.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                SIMCom SIM7600G-H
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{device.role}</p>
          </div>
        </div>

        {/* Status & Power */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${
            !isOnline && !commsFaultInjected ? 'bg-slate-900 text-slate-500 border-slate-800'
            : commsFaultInjected ? 'bg-red-950/80 text-red-300 border-red-500/50 animate-pulse'
            : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline && !commsFaultInjected ? 'bg-slate-600'
              : commsFaultInjected ? 'bg-red-500 animate-ping'
              : 'bg-cyan-400'
            }`} />
            {commsFaultInjected ? 'LINK DROPPED' : isOnline ? 'LTE CAT-4 CONNECTED' : 'OFFLINE'}
          </span>

          <button
            onClick={onTogglePower}
            title={device.powerOn ? 'Turn Off 4G Modem' : 'Turn On 4G Modem'}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
              device.powerOn
                ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Zap size={14} />
          </button>
        </div>
      </div>

      {/* Visual Hardware Architecture & Antenna Graphic */}
      <div className="my-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-lg font-mono text-[11px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            Cellular Mesh & MQTT Broker Uplink
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-400">Signal:</span>
            {/* 5 signal strength bars */}
            <div className="flex items-end gap-0.5 h-3">
              {[1, 2, 3, 4, 5].map(bar => (
                <div
                  key={bar}
                  className={`w-1 rounded-sm transition-all ${
                    bar <= signalBars
                      ? commsFaultInjected
                        ? 'bg-red-500'
                        : 'bg-cyan-400'
                      : 'bg-slate-700'
                  }`}
                  style={{ height: `${bar * 20}%` }}
                />
              ))}
            </div>
            <span className="text-[9px] text-cyan-300 font-bold ml-1">{rssiDbm} dBm</span>
          </div>
        </div>

        {/* Transmission Topology Flow: Ambulance OBU -> Cloud -> Junction RSU */}
        <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/70 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Ambulance OBU</span>
            </div>
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              {stage >= 2 && isOnline ? (
                <>
                  <span>4G LTE Uplink</span>
                  <ArrowRightLeft size={10} className="animate-pulse" />
                </>
              ) : (
                <span className="text-slate-600">IDLE</span>
              )}
            </span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Axiom Cloud Server</span>
            </div>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              {stage >= 3 && isOnline ? (
                <>
                  <ArrowRightLeft size={10} className="animate-pulse" />
                  <span>RSU Downlink</span>
                </>
              ) : (
                <span className="text-slate-600">IDLE</span>
              )}
            </span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Junction ESP32</span>
            </div>
          </div>

          {/* Network Metrics Bar */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
            <span className="text-slate-400">Round-Trip Latency:</span>
            <span className={`font-bold ${latencyMs > 300 ? 'text-red-400' : 'text-cyan-300'}`}>
              {commsFaultInjected ? 'TIMEOUT (1250 ms)' : `${latencyMs} ms`}
            </span>
            <span className="text-slate-400">Carrier APN:</span>
            <span className="text-slate-300">DTP.IOT.DELHI.AIRTEL</span>
            <span className="text-slate-400">Packet Loss:</span>
            <span className={`font-bold ${commsFaultInjected ? 'text-red-400' : 'text-emerald-400'}`}>
              {commsFaultInjected ? '76.4%' : '0.0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Modem Status Cards */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono my-1">
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Protocol</span>
          <span className="text-xs font-bold text-cyan-400">MQTT over TLS</span>
          <span className="text-[9px] text-slate-500 block">Port 8883 (SSL)</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">ACK Handshake</span>
          <span className={`text-xs font-bold ${
            commsFaultInjected ? 'text-red-400' : stage >= 3 ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {commsFaultInjected ? 'RETRY #4' : stage >= 3 ? 'ACK RECEIVED' : 'STANDBY'}
          </span>
          <span className="text-[9px] text-slate-500 block">QoS Level 1</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Modem Band</span>
          <span className="text-xs font-bold text-slate-300">LTE Band 3/5/40</span>
          <span className="text-[9px] text-slate-500 block">FDD-LTE (Delhi)</span>
        </div>
      </div>

      {/* AT Command Terminal Log */}
      <div className="mt-2 bg-[#080d1a] border border-slate-800/80 rounded p-2 font-mono text-[9px] text-slate-400 space-y-0.5">
        <div className="flex items-center justify-between text-[8px] text-slate-500 border-b border-slate-800/80 pb-0.5">
          <span>UART AT-COMMAND CONSOLE</span>
          <span className="text-cyan-400">115200 BAUD</span>
        </div>
        <p className="text-slate-300 truncate">
          {commsFaultInjected
            ? 'AT+CIPSEND=1,128 → ERROR: NO CARRIER / RETRYING...'
            : stage >= 3
            ? 'AT+QMTPUB=0,1,1,0,"/delhi/rsu/priority" → +QMTPUB: 0,1,0 OK'
            : 'AT+CSQ → +CSQ: 26,99 (OK)'}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="font-mono">SIMULATED TELEMETRY [NON-PHYSICAL EMULATION]</span>
        <span className="font-mono text-slate-400">Cat-4 SIM7600 Node</span>
      </div>
    </div>
  );
};
