import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Bell, Cpu, BarChart3, Settings, Radio,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/iot', label: 'IoT Devices', icon: Cpu },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0f1629] border-r border-[#1e2a4a] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#1e2a4a]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="text-[#00d4ff]" size={28} />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#22c55e] rounded-full animate-pulse" />
          </div>
          <div>
            <div className="text-[#00d4ff] font-bold text-lg tracking-widest">AXIOM</div>
            <div className="text-[#94a3b8] text-xs tracking-wider">EMS CONTROL</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20'
                  : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e2a4a]">
        <div className="text-xs text-[#94a3b8] text-center">
          <div>AXIOM EMS v1.0</div>
          <div className="text-[#22c55e] mt-1">● SIMULATION MODE</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
