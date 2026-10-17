import React from 'react';
import { 
  Activity, 
  MapPin, 
  Cpu, 
  Radio, 
  ShieldAlert, 
  FlaskConical, 
  BarChart3, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  AlertTriangle 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  voiceAlertsEnabled: boolean;
  setVoiceAlertsEnabled: (val: boolean) => void;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  voiceAlertsEnabled,
  setVoiceAlertsEnabled,
  isBackendConnected
}) => {
  const navItems = [
    { id: 'command', label: 'Command Centre', icon: Activity },
    { id: 'tracking', label: 'Ambulance Tracking', icon: MapPin },
    { id: 'ml', label: 'AI/ML Engine', icon: Cpu },
    { id: 'iot', label: 'IoT Intersections', icon: Radio },
    { id: 'police', label: 'Traffic Police Console', icon: ShieldAlert },
    { id: 'lab', label: 'Simulation & Testing Lab', icon: FlaskConical },
    { id: 'analytics', label: 'Analytics & Logs', icon: BarChart3 },
    { id: 'hardware', label: 'Hardware & Architecture', icon: BookOpen },
  ];

  return (
    <header className="bg-[#0B1528]/95 border-b border-[#1E355B] sticky top-0 z-50 backdrop-blur-md shadow-2xl">
      {/* Top Urgent Alert Bar */}
      <div className="bg-gradient-to-r from-[#060B1A] via-[#050B14] to-[#060B1A] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs border-b border-[#1E355B]/70">
        <div className="flex items-center space-x-3">
          {/* DEMO MODE Badge */}
          <div className="flex items-center space-x-1.5 bg-[#0EA5E9]/15 border border-[#0EA5E9]/60 text-[#0EA5E9] px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold tracking-wider animate-pulse shadow-[0_0_10px_rgba(255,176,32,0.2)]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span>DEMO MODE ACTIVE</span>
          </div>

          <span className="hidden sm:inline text-[#93B2D6] text-xs font-hud tracking-wide">
            Delhi Traffic Police & Health Infrastructure Coordination Grid (NCT of Delhi)
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Telemetry Status */}
          <div className="flex items-center space-x-1.5 text-[#93B2D6] text-xs">
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-[#7DD3FC] shadow-[0_0_8px_#7DD3FC]' : 'bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]'}`} />
            <span className="font-mono text-[11px] tracking-wider text-[#F0F7FF]">
              {isBackendConnected ? 'FASTAPI BACKEND CONNECTED' : 'CLIENT DUAL-ENGINE SIMULATOR'}
            </span>
          </div>

          {/* Voice Announcement Toggle */}
          <button
            onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition border font-mono ${
              voiceAlertsEnabled 
                ? 'bg-[#38BDF8]/15 border-[#38BDF8]/70 text-[#38BDF8] shadow-[0_0_10px_rgba(53,217,255,0.25)]' 
                : 'bg-[#101E36] border-[#1E355B] text-[#93B2D6] hover:border-[#38BDF8]/40'
            }`}
            title="Toggle Text-to-Speech roadside announcement demo"
          >
            {voiceAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px]">TTS PA: {voiceAlertsEnabled ? 'ONLINE' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Main Branding & Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('command')}>
            <div className="w-10 h-10 rounded-lg bg-[#2563EB]/15 border border-[#2563EB]/50 flex items-center justify-center text-[#2563EB] shadow-[0_0_18px_rgba(255,64,87,0.3)] group-hover:border-[#2563EB] transition">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-widest text-[#F0F7FF] font-hud">
                  AXIOM <span className="text-[#38BDF8]">EMS</span>
                </span>
                <span className="text-[10px] bg-[#2563EB]/20 border border-[#2563EB]/60 text-[#2563EB] px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                  PRIORITY 1
                </span>
              </div>
              <p className="text-[11px] text-[#93B2D6] hidden sm:block tracking-wide">
                ERS — Emergency Response Synchronization (Delhi Grid)
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
                    isActive
                      ? 'bg-[#101E36] text-[#38BDF8] border border-[#38BDF8]/50 shadow-[0_0_15px_-3px_rgba(53,217,255,0.25)]'
                      : 'text-[#93B2D6] hover:text-[#F0F7FF] hover:bg-[#101E36]/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#38BDF8]' : 'text-[#93B2D6]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Scroll */}
      <div className="lg:hidden px-2 pb-2 overflow-x-auto flex space-x-1 border-t border-[#1E355B]/60 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition font-mono ${
                isActive
                  ? 'bg-[#101E36] text-[#38BDF8] border border-[#38BDF8]/50 shadow-[0_0_10px_rgba(53,217,255,0.2)] font-semibold'
                  : 'text-[#93B2D6] bg-[#050B14] border border-[#1E355B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
