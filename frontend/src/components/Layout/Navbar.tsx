import React from 'react';
import { Activity, Wifi } from 'lucide-react';

interface NavbarProps {
  simulationActive?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ simulationActive = false }) => {
  return (
    <header className="h-16 bg-[#0f1629] border-b border-[#1e2a4a] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-white font-semibold tracking-wide">
          Mission Control Center
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Simulation status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
          simulationActive
            ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30'
            : 'bg-[#94a3b8]/10 text-[#94a3b8] border-[#94a3b8]/20'
        }`}>
          <Activity size={12} className={simulationActive ? 'animate-pulse' : ''} />
          {simulationActive ? 'SIMULATION ACTIVE' : 'SIMULATION IDLE'}
        </div>
        {/* Connection indicator */}
        <div className="flex items-center gap-2 text-xs text-[#22c55e]">
          <Wifi size={14} />
          <span>CONNECTED</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
