import React from 'react';
import { Target, Ambulance, Bell, Cpu } from 'lucide-react';
import type { Mission, IoTDevice, AlertEvent } from '../../api/types';

interface StatusCardsProps {
  missions: Mission[];
  devices: IoTDevice[];
  alerts: AlertEvent[];
}

interface CardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
  trend?: string;
}

const Card: React.FC<CardProps> = ({ icon, value, label, color, trend }) => (
  <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-5 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-[#94a3b8] text-sm mt-0.5">{label}</div>
    </div>
    {trend && (
      <div className="text-xs text-[#22c55e] font-medium">{trend}</div>
    )}
  </div>
);

const StatusCards: React.FC<StatusCardsProps> = ({ missions, devices, alerts }) => {
  const activeMissions = missions.filter(m => m.status !== 'complete').length;
  const enRoute = missions.filter(m => m.status === 'en_route' || m.status === 'approaching').length;
  const onlineDevices = devices.filter(d => d.status === 'active').length;
  const todayAlerts = alerts.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        icon={<Target className="text-[#00d4ff]" size={22} />}
        value={activeMissions}
        label="Active Missions"
        color="bg-[#00d4ff]/10"
        trend="● LIVE"
      />
      <Card
        icon={<Ambulance className="text-[#f59e0b]" size={22} />}
        value={enRoute}
        label="Ambulances En Route"
        color="bg-[#f59e0b]/10"
      />
      <Card
        icon={<Bell className="text-[#ef4444]" size={22} />}
        value={todayAlerts}
        label="Alerts Today"
        color="bg-[#ef4444]/10"
      />
      <Card
        icon={<Cpu className="text-[#22c55e]" size={22} />}
        value={`${onlineDevices}/${devices.length}`}
        label="IoT Devices Online"
        color="bg-[#22c55e]/10"
        trend={onlineDevices === devices.length ? '● ALL OK' : undefined}
      />
    </div>
  );
};

export default StatusCards;
