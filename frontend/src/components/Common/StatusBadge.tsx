import React from 'react';

type StatusVariant = 'active' | 'standby' | 'offline' | 'en_route' | 'approaching' | 'arrived' | 'complete' | 'pending' | 'passed';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const variantMap: Record<string, { color: string; bg: string; label: string }> = {
  active:     { color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10', label: 'ACTIVE' },
  standby:    { color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', label: 'STANDBY' },
  offline:    { color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10', label: 'OFFLINE' },
  en_route:   { color: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10', label: 'EN ROUTE' },
  approaching:{ color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', label: 'APPROACHING' },
  arrived:    { color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10', label: 'ARRIVED' },
  complete:   { color: 'text-[#94a3b8]', bg: 'bg-[#94a3b8]/10', label: 'COMPLETE' },
  pending:    { color: 'text-[#4b5563]', bg: 'bg-[#4b5563]/10', label: 'PENDING' },
  passed:     { color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10', label: 'PASSED' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const cfg = variantMap[status] ?? { color: 'text-[#94a3b8]', bg: 'bg-[#94a3b8]/10', label: status.toUpperCase() };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${cfg.bg} ${cfg.color} ${size === 'md' ? 'text-sm' : 'text-xs'}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
