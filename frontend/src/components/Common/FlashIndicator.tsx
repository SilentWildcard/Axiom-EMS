import React from 'react';

interface FlashIndicatorProps {
  active: boolean;
  color?: string;
  size?: number;
  label?: string;
}

const FlashIndicator: React.FC<FlashIndicatorProps> = ({
  active, color = '#ef4444', size = 16, label,
}) => (
  <div className="flex items-center gap-2">
    <div
      className="rounded-full flex-shrink-0"
      style={{
        width: size, height: size,
        background: active ? color : '#1e2a4a',
        boxShadow: active ? `0 0 8px ${color}` : 'none',
        animation: active ? 'sirenFlash 0.5s ease-in-out infinite' : 'none',
        transition: 'all 0.2s ease',
      }}
    />
    {label && <span className="text-xs text-[#94a3b8]">{label}</span>}
  </div>
);

export default FlashIndicator;
