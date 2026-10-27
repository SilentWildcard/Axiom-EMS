import React from 'react';

interface CountdownTimerProps {
  remainingMs: number;
  totalMs: number;
  active: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ remainingMs, totalMs, active }) => {
  const pct = totalMs > 0 ? (remainingMs / totalMs) * 100 : 0;
  const secs = Math.ceil(remainingMs / 1000);
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="30" fill="none" stroke="#1e2a4a" strokeWidth="6" />
        {active && (
          <circle
            cx="40" cy="40" r="30"
            fill="none"
            stroke="#ef4444"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        )}
        <text x="40" y="46" textAnchor="middle" fontSize="16" fontWeight="bold" fill={active ? '#ef4444' : '#4b5563'} fontFamily="monospace">
          {secs}s
        </text>
      </svg>
    </div>
  );
};

export default CountdownTimer;
