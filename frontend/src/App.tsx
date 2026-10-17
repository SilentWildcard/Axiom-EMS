import React, { useState, useEffect, useCallback } from 'react';
import { ERSState } from './types';
import { ERSApi, clientSim } from './services/api';
import { Navbar } from './components/Navbar';
import { CommandCenter } from './components/CommandCenter';
import { AmbulanceTracking } from './components/AmbulanceTracking';
import { MLPredictionStudio } from './components/MLPredictionStudio';
import { IoTManagement } from './components/IoTManagement';
import { TrafficPoliceDashboard } from './components/TrafficPoliceDashboard';
import { SimulationLab } from './components/SimulationLab';
import { AnalyticsView } from './components/AnalyticsView';
import { HardwareDocs } from './components/HardwareDocs';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('command');
  const [state, setState] = useState<ERSState>(clientSim.state);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState<boolean>(false);

  // Web Speech API Voice Synthesizer
  const speakAnnouncement = useCallback((text: string) => {
    if (!voiceAlertsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }, [voiceAlertsEnabled]);

  // Subscribe to client simulator state updates
  useEffect(() => {
    const unsubscribe = (newState: ERSState) => {
      setState({ ...newState });
    };
    clientSim.listeners.push(unsubscribe);

    return () => {
      const idx = clientSim.listeners.indexOf(unsubscribe);
      if (idx !== -1) clientSim.listeners.splice(idx, 1);
    };
  }, []);

  // Check backend availability and establish WebSocket if available
  useEffect(() => {
    let ws: WebSocket | null = null;
    let pollTimer: any = null;

    const checkAndConnect = async () => {
      const connected = await ERSApi.checkBackend();
      setIsBackendConnected(connected);

      if (connected) {
        try {
          ws = new WebSocket('ws://localhost:8000/ws/telemetry');
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              setState(data);
            } catch (err) {
              console.error('WS parse error:', err);
            }
          };
          ws.onclose = () => {
            setIsBackendConnected(false);
          };
        } catch {
          setIsBackendConnected(false);
        }
      }
    };

    checkAndConnect();
    pollTimer = setInterval(checkAndConnect, 10000);

    return () => {
      if (ws) ws.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  // Simulation transport callbacks
  const handlePlayToggle = async () => {
    const isRunning = await ERSApi.togglePlay();
    if (isRunning) {
      speakAnnouncement("Emergency Response Synchronization System started. Monitoring Delhi arterial corridors.");
    }
  };

  const handleStep = async () => {
    const newState = await ERSApi.stepSimulation();
    setState({ ...newState });
  };

  const handleReset = async () => {
    const newState = await ERSApi.resetSimulation();
    setState({ ...newState });
    speakAnnouncement("Simulation reset to initial Connaught Place origin.");
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-[#F0F7FF] flex flex-col font-sans selection:bg-[#38BDF8] selection:text-[#050B14]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        voiceAlertsEnabled={voiceAlertsEnabled}
        setVoiceAlertsEnabled={setVoiceAlertsEnabled}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'command' && (
          <CommandCenter
            state={state}
            onPlayToggle={handlePlayToggle}
            onStep={handleStep}
            onReset={handleReset}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'tracking' && (
          <AmbulanceTracking
            state={state}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'ml' && (
          <MLPredictionStudio
            state={state}
          />
        )}

        {activeTab === 'iot' && (
          <IoTManagement
            state={state}
            onSpeak={speakAnnouncement}
          />
        )}

        {activeTab === 'police' && (
          <TrafficPoliceDashboard
            state={state}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'lab' && (
          <SimulationLab
            state={state}
            onPlayToggle={handlePlayToggle}
            onStep={handleStep}
            onReset={handleReset}
            onSpeak={speakAnnouncement}
            voiceAlertsEnabled={voiceAlertsEnabled}
            setVoiceAlertsEnabled={setVoiceAlertsEnabled}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            state={state}
          />
        )}

        {activeTab === 'hardware' && (
          <HardwareDocs />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0B1528] border-t border-[#1E355B] py-4 text-center text-xs font-mono text-[#93B2D6]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AXIOM EMS &bull; Emergency Response Synchronization System &bull; NCT of Delhi, India</span>
          <span className="text-[#93B2D6]/80">
            DEMO MODE &bull; AI/ML + IoT Roadside Infrastructure Prototype
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
