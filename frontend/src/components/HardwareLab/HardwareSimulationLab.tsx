import React from 'react';
import { useHardwareSimulator } from './useHardwareSimulator';
import { SimulationTimeline } from './SimulationTimeline';
import { InteractiveControlPanel } from './InteractiveControlPanel';
import { PoliceDeskPanel } from './PoliceDeskPanel';
import { DelhiCorridorMiniMap } from './DelhiCorridorMiniMap';
import { TelemetryConsole } from './TelemetryConsole';

// 9 Hardware Modules
import { ESP32Controller } from './ESP32Controller';
import { VehicleSensorModule } from './VehicleSensorModule';
import { GPSModule } from './GPSModule';
import { CommunicationModule } from './CommunicationModule';
import { TrafficSignalModule } from './TrafficSignalModule';
import { LEDMatrixModule } from './LEDMatrixModule';
import { SpeakerModule } from './SpeakerModule';
import { EdgeDeviceModule } from './EdgeDeviceModule';
import { VisionModule } from './VisionModule';

import { Cpu, Activity, AlertCircle, Info, Sparkles } from 'lucide-react';

export const HardwareSimulationLab: React.FC = () => {
  const {
    isRunning,
    setIsRunning,
    currentStage,
    stageProgressPercent,
    selectedJunctionId,
    selectJunction,
    activeJunction,
    config,
    setConfig,
    devicePower,
    toggleDevicePower,
    devices,
    logs,
    addLog,
    advanceToStage,
    stepNextStage,
    stepPrevStage,
    resetSimulation,
    triggerEmergencyPriority,
    activeAmbulanceDistToJunctionKm,
    ambulanceEtaSeconds,
    currentQueueMeters,
    detectedVehiclesCount,
    roadOccupancyPercent,
    policeAcknowledged,
    setPoliceAcknowledged,
    trafficSignalColor,
    signalCountdown,
    isAlertAudioPlaying,
    testSpeakerAudio,
  } = useHardwareSimulator();

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 gap-5 overflow-y-auto bg-[#070d18] text-slate-200 font-mono">
      {/* ── SECTION HEADER & ARCHITECTURAL OVERVIEW ──────────────── */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  HARDWARE SIMULATION LAB
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  DIGITAL TWIN ARCHITECTURE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical IoT Infrastructure Emulation & Real-Time Junction Preemption for Delhi Smart Corridor
              </p>
            </div>
          </div>
        </div>

        {/* Global simulated status badge */}
        <div className="flex items-center gap-2 bg-[#0b1323] border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">System Telemetry:</span>
          <span className="text-emerald-300 font-bold">9 NODES SYNCHRONIZED</span>
        </div>
      </div>

      {/* ── ENGINEERING NOTICE CALLOUT ───────────────────────────── */}
      <div className="bg-[#0b1323] border border-slate-800/90 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-400">
        <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Engineering Demonstration Notice: </strong>
          This lab presents an interactive software-based digital twin of the physical roadside units (RSUs), on-board units (OBUs), and traffic controllers proposed for Delhi.
          All voltages, NMEA satellite sentences, echo pulse waveforms, and MQTT payloads are dynamically simulated by a unified state machine.
        </div>
      </div>

      {/* ── WORKFLOW TIMELINE (STAGE 1 TO 6) ──────────────────────── */}
      <SimulationTimeline
        currentStage={currentStage}
        progressPercent={stageProgressPercent}
        onSelectStage={advanceToStage}
      />

      {/* ── INTERACTIVE PLAYBACK & FAULT INJECTION CONTROLS ───────── */}
      <InteractiveControlPanel
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onReset={resetSimulation}
        currentStage={currentStage}
        onStepNext={stepNextStage}
        onStepPrev={stepPrevStage}
        config={config}
        onConfigChange={changes => setConfig(prev => ({ ...prev, ...changes }))}
        devices={devices}
        onToggleDevicePower={toggleDevicePower}
        onEmergencyPriority={triggerEmergencyPriority}
      />

      {/* ── DELHI POLICE CONTROL DESK ────────────────────────────── */}
      <PoliceDeskPanel
        activeJunction={activeJunction}
        onSelectJunction={selectJunction}
        ambulanceDistKm={activeAmbulanceDistToJunctionKm}
        etaSeconds={ambulanceEtaSeconds}
        stage={currentStage}
        isAcknowledged={policeAcknowledged}
        onAcknowledge={() => {
          setPoliceAcknowledged(true);
          addLog('POLICE_DESK', 'SYSTEM', 'info', `Delhi Police Officer acknowledged & authorized priority corridor.`);
        }}
        trafficDensity={config.trafficDensity}
        queueMeters={currentQueueMeters}
        onSendRadioDispatch={msg => {
          addLog('POLICE_DESK', 'SYSTEM', 'info', `Tactical Broadcast: ${msg}`);
        }}
      />

      {/* ── 9 HARDWARE MODULES GRID ──────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              PHYSICAL HARDWARE MODULES AT JUNCTION #{selectedJunctionId} ({activeJunction.name.split('(')[0]})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {activeJunction.rsuId}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Interactive individual hardware units with realistic pinouts & circuits
          </span>
        </div>

        {/* 3x3 Grid of Hardware Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module A: ESP32 IoT Controller */}
          <ESP32Controller
            device={devices.esp32}
            onTogglePower={() => toggleDevicePower('esp32')}
            incomingMsg={
              currentStage >= 3
                ? `MQTT /priority: {"corridor":"LNJP-C5","eta_sec":${ambulanceEtaSeconds}}`
                : 'MQTT /telemetry: PING HEARTBEAT OK'
            }
            outgoingMsg={
              trafficSignalColor === 'green'
                ? 'GPIO 21: HIGH (RELAY GREEN) | I2S AUDIO: ACTIVE'
                : 'GPIO 21: LOW (NORMAL CYCLE) | VMS: OK'
            }
          />

          {/* Module B: Vehicle Density Sensor */}
          <VehicleSensorModule
            device={devices.density_sensor}
            onTogglePower={() => toggleDevicePower('density_sensor')}
            queueMeters={currentQueueMeters}
            vehicleCount={detectedVehiclesCount}
            occupancyPercent={roadOccupancyPercent}
            faultInjected={config.sensorFaultInjected}
          />

          {/* Module C: GPS Module */}
          <GPSModule
            device={devices.gps}
            onTogglePower={() => toggleDevicePower('gps')}
            lat={28.6288 + activeAmbulanceDistToJunctionKm * 0.003}
            lng={77.2415 - activeAmbulanceDistToJunctionKm * 0.002}
            speedKmH={config.ambulanceSpeedKmH}
            stage={currentStage}
          />

          {/* Module D: GSM / 4G Communication Module */}
          <CommunicationModule
            device={devices.gsm_4g}
            onTogglePower={() => toggleDevicePower('gsm_4g')}
            latencyMs={config.networkLatencyMs}
            commsFaultInjected={config.commsFaultInjected}
            stage={currentStage}
          />

          {/* Module E: Intelligent Traffic Signal Controller */}
          <TrafficSignalModule
            device={devices.traffic_signal}
            onTogglePower={() => toggleDevicePower('traffic_signal')}
            currentColor={trafficSignalColor}
            countdown={signalCountdown}
            stage={currentStage}
            junctionName={activeJunction.name.split('(')[0]}
          />

          {/* Module F: LED Matrix VMS Display */}
          <LEDMatrixModule
            device={devices.led_matrix}
            onTogglePower={() => toggleDevicePower('led_matrix')}
            stage={currentStage}
            etaSeconds={ambulanceEtaSeconds}
          />

          {/* Module G: Speaker / Public Alert System */}
          <SpeakerModule
            device={devices.speaker}
            onTogglePower={() => toggleDevicePower('speaker')}
            isPlaying={isAlertAudioPlaying}
            onTestSound={testSpeakerAudio}
            volume={config.soundVolume}
            onVolumeChange={vol => setConfig(prev => ({ ...prev, soundVolume: vol }))}
            durationSec={config.alertToneDurationSec}
            onDurationChange={dur => setConfig(prev => ({ ...prev, alertToneDurationSec: dur }))}
            soundEnabled={config.soundEnabled}
            onToggleSoundEnabled={() => setConfig(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            stage={currentStage}
          />

          {/* Module H: Edge Computing Device */}
          <EdgeDeviceModule
            device={devices.edge_device}
            onTogglePower={() => toggleDevicePower('edge_device')}
            queueMeters={currentQueueMeters}
            stage={currentStage}
          />

          {/* Module I: CCTV / AI Vision Module */}
          <VisionModule
            device={devices.cctv_vision}
            onTogglePower={() => toggleDevicePower('cctv_vision')}
            stage={currentStage}
            vehicleCount={detectedVehiclesCount}
          />
        </div>
      </div>

      {/* ── CORRIDOR MAP & COMMAND TELEMETRY CONSOLE ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Delhi Corridor Map with Junction Markers */}
        <DelhiCorridorMiniMap
          selectedJunctionId={selectedJunctionId}
          onSelectJunction={selectJunction}
          ambulanceDistKm={activeAmbulanceDistToJunctionKm}
          stage={currentStage}
        />

        {/* Live Telemetry Console */}
        <TelemetryConsole
          logs={logs}
          onClearLogs={() => addLog('SERVER', 'SYSTEM', 'info', 'Console logs cleared.')}
        />
      </div>

      {/* ── FOOTER BAR ───────────────────────────────────────────── */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
        <span>Axiom EMS — Intelligent Ambulance Traffic Coordination System (Delhi)</span>
        <span>Hardware Digital Twin Lab v1.0 • All Telemetry Simulated Locally</span>
      </div>
    </div>
  );
};
