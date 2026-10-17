import React, { useState } from 'react';
import { ERSState, IoTDevice, IoTState } from '../types';
import { ERSApi } from '../services/api';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  BellRing, 
  RotateCcw, 
  Terminal, 
  FileCode
} from 'lucide-react';

interface IoTManagementProps {
  state: ERSState;
  onSpeak: (text: string) => void;
}

export const IoTManagement: React.FC<IoTManagementProps> = ({ state, onSpeak }) => {
  const { iot_devices } = state;
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(iot_devices[0] || null);
  const [showPayloadModal, setShowPayloadModal] = useState<boolean>(false);

  const handleToggleOnline = async (dev: IoTDevice) => {
    await ERSApi.toggleDeviceOnline(dev.device_id, !dev.is_online);
  };

  const handleTriggerTestAlert = async (dev: IoTDevice) => {
    await ERSApi.triggerTestAlert(dev.device_id);
    onSpeak(`Emergency alert. Diagnostic test on roadside unit ${dev.device_id} at ${dev.intersection_name}. Please clear the emergency corridor.`);
  };

  const handleSimulateState = (dev: IoTDevice, newState: IoTState) => {
    dev.state = newState;
    if (newState === 'ALERT_SENT') {
      dev.speaker_active = true;
      dev.last_audio_announcement = `Emergency alert. Ambulance approaching ${dev.intersection_name}. Estimated arrival 60 seconds.`;
      dev.led_matrix_display = 'EMERGENCY VEHICLE APPROACHING - ETA 60s';
      onSpeak(dev.last_audio_announcement);
    } else if (newState === 'ARRIVED_AT_CHECKPOINT') {
      dev.speaker_active = true;
      dev.last_audio_announcement = `Ambulance arrived at ${dev.intersection_name}. Intersection held for transit.`;
      dev.led_matrix_display = 'EMS PASSING - HOLD CROSS TRAFFIC';
      onSpeak(dev.last_audio_announcement);
    } else if (newState === 'AMBULANCE_PASSED') {
      dev.speaker_active = false;
      dev.last_audio_announcement = `Ambulance cleared ${dev.intersection_name}. Normal traffic resumed.`;
      dev.led_matrix_display = 'EMS CLEARED - RESUMING NORMAL PHASING';
      onSpeak(dev.last_audio_announcement);
    } else {
      dev.speaker_active = false;
      dev.last_audio_announcement = 'System idle. Monitoring emergency frequencies.';
      dev.led_matrix_display = 'NORMAL TRAFFIC - DRIVE SAFELY';
    }
  };

  const getStateColor = (s: IoTState) => {
    switch (s) {
      case 'ALERT_SENT': return 'bg-[#0EA5E9]/15 text-[#0EA5E9] border-[#0EA5E9]/70 shadow-[0_0_10px_rgba(14,165,233,0.25)]';
      case 'AMBULANCE_APPROACHING': return 'bg-[#1D4ED8]/20 text-[#1D4ED8] border-[#1D4ED8]/70 shadow-[0_0_12px_rgba(29,78,216,0.3)]';
      case 'ARRIVED_AT_CHECKPOINT': return 'bg-[#2563EB]/25 text-[#2563EB] border-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-pulse font-black';
      case 'AMBULANCE_PASSED': return 'bg-[#7DD3FC]/15 text-[#7DD3FC] border-[#7DD3FC]/60 shadow-[0_0_10px_rgba(125,211,252,0.25)]';
      default: return 'bg-[#101E36] text-[#93B2D6] border-[#1E355B]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-[#2563EB]/15 text-[#2563EB] rounded-lg border border-[#2563EB]/40 shadow-[0_0_10px_rgba(37,99,235,0.25)]">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-hud text-[#F0F7FF] tracking-wider">
              IOT INTERSECTION ROADSIDE UNIT (RSU) MANAGEMENT
            </h1>
          </div>
          <p className="text-[#93B2D6] text-xs sm:text-sm mt-1">
            Simulated ESP32 microcontroller nodes deployed at key Delhi junctions. 6-state emergency synchronization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPayloadModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#101E36] hover:bg-[#1E355B] border border-[#1E355B] hover:border-[#38BDF8]/50 rounded-lg text-xs font-mono text-[#38BDF8] transition shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>INSPECT HARDWARE PAYLOAD</span>
          </button>
        </div>
      </div>

      {/* RSU Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {iot_devices.map((device) => {
          const isSelected = selectedDevice?.device_id === device.device_id;

          return (
            <div
              key={device.device_id}
              onClick={() => setSelectedDevice(device)}
              className={`bg-[#0B1528] border rounded-xl p-4 transition cursor-pointer shadow-[0_10px_25px_-5px_rgba(0,0,0,0.7)] relative flex flex-col justify-between space-y-4 ${
                isSelected ? 'border-[#38BDF8] ring-1 ring-[#38BDF8]/40 shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)]' : 'border-[#1E355B] hover:border-[#38BDF8]/30'
              } ${!device.is_online ? 'opacity-60 bg-[#050B14]' : ''}`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#38BDF8] bg-[#050B14] px-2 py-0.5 rounded border border-[#1E355B]">
                      {device.device_id}
                    </span>
                    <h3 className="text-sm font-bold text-[#F0F7FF] mt-1.5 leading-snug font-hud tracking-wide">
                      {device.intersection_name}
                    </h3>
                  </div>

                  {/* Online/Offline status badge */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleOnline(device);
                    }}
                    className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition border ${
                      device.is_online
                        ? 'bg-[#7DD3FC]/15 border-[#7DD3FC]/60 text-[#7DD3FC] hover:bg-[#7DD3FC]/25 shadow-[0_0_8px_rgba(66,230,164,0.2)]'
                        : 'bg-[#2563EB]/15 border-[#2563EB]/60 text-[#2563EB] hover:bg-[#2563EB]/25'
                    }`}
                    title="Click to toggle connection failure"
                  >
                    {device.is_online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    <span>{device.is_online ? 'ONLINE' : 'DISCONNECTED'}</span>
                  </button>
                </div>

                {/* State Pill */}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-[11px] font-mono px-3 py-1 rounded border font-bold tracking-wider ${getStateColor(device.state)}`}>
                    {device.state}
                  </span>
                  
                  {/* Speaker indicator */}
                  <div className="flex items-center space-x-1 text-xs">
                    {device.speaker_active ? (
                      <span className="flex items-center space-x-1 text-[#38BDF8] font-mono animate-pulse">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">PA BROADCASTING</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[#93B2D6]/60 font-mono">
                        <VolumeX className="w-3.5 h-3.5" />
                        <span className="text-[10px]">PA MUTED</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Telemetry & LED Display */}
              <div className="space-y-2 bg-[#101E36] border border-[#1E355B] p-3 rounded-xl text-xs font-mono">
                {/* Simulated P10 LED Matrix */}
                <div className="bg-[#050B14] border border-[#0EA5E9]/40 p-2 rounded-lg text-center overflow-hidden shadow-inner">
                  <span className="text-[10px] text-[#0EA5E9] tracking-widest font-mono uppercase truncate block font-bold drop-shadow-[0_0_6px_rgba(255,176,32,0.4)]">
                    LED: {device.led_matrix_display}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-[#93B2D6]">
                  <div>
                    <span>Dist to EMS: </span>
                    <strong className="text-[#F0F7FF] font-hud text-sm">{device.distance_to_ambulance_m !== null ? `${device.distance_to_ambulance_m}m` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span>ETA: </span>
                    <strong className="text-[#38BDF8] font-hud text-sm">{device.eta_seconds !== null ? `${device.eta_seconds}s` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span>Wi-Fi RSSI: </span>
                    <strong className="text-[#F0F7FF]">{device.rssi_dbm} dBm</strong>
                  </div>
                  <div>
                    <span>Queue Est: </span>
                    <strong className="text-[#F0F7FF]">{device.traffic_queue_length_m}m</strong>
                  </div>
                </div>
              </div>

              {/* Interactive RSU Control Buttons */}
              <div className="pt-2 border-t border-[#1E355B] flex flex-wrap gap-1.5 text-[11px] font-mono">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerTestAlert(device);
                  }}
                  className="px-2.5 py-1 bg-[#0EA5E9]/15 hover:bg-[#0EA5E9]/25 border border-[#0EA5E9]/50 text-[#0EA5E9] rounded-lg transition flex items-center space-x-1"
                >
                  <BellRing className="w-3 h-3" />
                  <span>TEST ALERT</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulateState(device, 'ARRIVED_AT_CHECKPOINT');
                  }}
                  className="px-2.5 py-1 bg-[#2563EB]/15 hover:bg-[#2563EB]/25 border border-[#2563EB]/50 text-[#2563EB] rounded-lg transition font-semibold"
                >
                  SIM ARRIVAL
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulateState(device, 'AMBULANCE_PASSED');
                  }}
                  className="px-2.5 py-1 bg-[#7DD3FC]/15 hover:bg-[#7DD3FC]/25 border border-[#7DD3FC]/50 text-[#7DD3FC] rounded-lg transition font-semibold"
                >
                  SIM PASSAGE
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulateState(device, 'RESET');
                  }}
                  className="px-2.5 py-1 bg-[#101E36] hover:bg-[#1E355B] text-[#93B2D6] hover:text-[#F0F7FF] border border-[#1E355B] rounded-lg transition"
                  title="Reset device to IDLE"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Device Event Log Inspector */}
      {selectedDevice && (
        <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E355B] pb-2">
            <h3 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 font-hud tracking-wide">
              <Terminal className="w-4 h-4 text-[#38BDF8]" />
              <span>RSU TELEMETRY INSPECTOR: {selectedDevice.intersection_name} ({selectedDevice.device_id})</span>
            </h3>
            <button
              onClick={() => onSpeak(selectedDevice.last_audio_announcement)}
              className="flex items-center space-x-1.5 text-xs text-[#38BDF8] hover:text-[#38BDF8]/80 font-mono underline"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>TRIGGER PA AUDIO (TTS)</span>
            </button>
          </div>

          <div className="bg-[#050B14] border border-[#1E355B] p-3 rounded-xl text-xs font-mono space-y-1.5 max-h-48 overflow-y-auto">
            <div className="text-[#93B2D6] mb-1">
              <span className="text-[#7DD3FC] font-bold">Current PA Audio: </span>
              <span className="text-[#F0F7FF]">"{selectedDevice.last_audio_announcement}"</span>
            </div>
            <div className="text-[#93B2D6]/70 border-t border-[#1E355B] pt-2 text-[11px]">
              Firmware: {selectedDevice.firmware_version} | MAC: 24:6F:28:B4:9C:{selectedDevice.device_id.slice(-2)} | Subnet: 10.24.180.0/24 (Delhi Traffic Police VPN)
            </div>
          </div>
        </div>
      )}

      {/* Hardware Payload Modal */}
      {showPayloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0B1528] border border-[#1E355B] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9),0_0_25px_rgba(53,217,255,0.1)]">
            <div className="flex justify-between items-center border-b border-[#1E355B] pb-3">
              <h3 className="text-sm font-bold text-[#F0F7FF] font-hud tracking-wider flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-[#38BDF8]" />
                <span>ESP32 / ARDUINO MICROCONTROLLER JSON PAYLOAD FORMAT</span>
              </h3>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="text-[#93B2D6] hover:text-[#F0F7FF] font-mono text-sm px-2 py-0.5"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#93B2D6]">
              This telemetry format is received by <code className="text-[#38BDF8] font-mono">/api/iot/hardware/telemetry</code> from on-ground roadside nodes:
            </p>

            <pre className="bg-[#050B14] p-4 rounded-xl text-xs font-mono text-[#38BDF8] overflow-x-auto border border-[#1E355B] leading-relaxed shadow-inner">
{`{
  "device_id": "CP-RSU-01",
  "timestamp": "${Date.now()}",
  "token": "ers_rsu_token_delhi_sec_8f93a1",
  "rssi_dbm": -58,
  "ambient_noise_db": 74.2,
  "traffic_queue_length_m": 45.0
}

/* SERVER RESPONSE COMMAND PACKET */
{
  "status": "ACCEPTED",
  "device_state": "ALERT_SENT",
  "speaker_active": true,
  "display_command": "EMERGENCY VEHICLE APPROACHING - ETA 55s",
  "audio_command": "Emergency alert. Ambulance approaching Barakhamba Road..."
}`}
            </pre>

            <div className="text-right">
              <button
                onClick={() => setShowPayloadModal(false)}
                className="px-4 py-1.5 bg-[#101E36] hover:bg-[#1E355B] text-[#F0F7FF] border border-[#1E355B] hover:border-[#38BDF8]/50 rounded-lg text-xs font-mono font-semibold transition"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
