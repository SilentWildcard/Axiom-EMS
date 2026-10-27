import React from 'react';
import type { AnalyticsData } from '../../api/types';
import { BarChart3, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface AnalyticsDashboardProps {
  data: AnalyticsData | null;
  loading?: boolean;
  error?: string | null;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-[#0f1629] rounded-xl border border-[#1e2a4a]" />
        <div className="h-36 bg-[#0f1629] rounded-xl border border-[#1e2a4a]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#0f1629] rounded-xl border border-[#ef4444]/30 p-6 flex items-center gap-3 text-[#ef4444]">
        <AlertCircle size={20} />
        <span>{error ?? 'Analytics unavailable'}</span>
      </div>
    );
  }

  const maxError = Math.max(...data.eta_errors.map(e => Math.abs(e.error_s)), 1);
  const BAR_MAX_WIDTH = 200;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: data.total_alerts, color: 'text-[#ef4444]', icon: AlertCircle },
          { label: 'Completed Alerts', value: data.completed_alerts, color: 'text-[#22c55e]', icon: AlertCircle },
          { label: 'Avg ETA Error', value: `${data.avg_eta_error_s}s`, color: 'text-[#f59e0b]', icon: TrendingUp },
          { label: 'IoT Events', value: data.iot_event_count, color: 'text-[#00d4ff]', icon: Clock },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-4">
              <Icon className={stat.color} size={18} />
              <div className={`text-2xl font-bold mt-2 font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[#94a3b8] text-xs mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* ETA accuracy bar chart (SVG, no external lib) */}
      <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-[#00d4ff]" size={18} />
          <h3 className="text-white font-semibold">ETA Accuracy by Checkpoint</h3>
        </div>
        <svg width="100%" height={data.eta_errors.length * 56 + 20} viewBox={`0 0 500 ${data.eta_errors.length * 56 + 20}`}>
          {data.eta_errors.map((e, i) => {
            const y = i * 56 + 10;
            const barW = (Math.abs(e.error_s) / maxError) * BAR_MAX_WIDTH;
            const barColor = e.error_s > 0 ? '#f59e0b' : '#22c55e';
            const errLabel = e.error_s > 0 ? `+${e.error_s}s late` : `${e.error_s}s early`;
            return (
              <g key={e.checkpoint}>
                <text x={0} y={y + 12} fontSize="11" fill="#94a3b8">{e.checkpoint}</text>
                <text x={0} y={y + 26} fontSize="10" fill="#4b5563">
                  Pred: {e.predicted_s}s | Act: {e.actual_s}s
                </text>
                {/* Bar */}
                <rect x={0} y={y + 32} width={barW} height={16} rx="4" fill={barColor} opacity="0.7" />
                <text x={barW + 6} y={y + 44} fontSize="10" fill={barColor} fontWeight="bold">{errLabel}</text>
              </g>
            );
          })}
        </svg>
        <div className="text-xs text-[#94a3b8] mt-2">
          Avg ETA error: <span className="text-[#f59e0b] font-mono">{data.avg_eta_error_s}s</span>
        </div>
      </div>

      {/* Alert latency table */}
      <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-[#00d4ff]" size={18} />
          <h3 className="text-white font-semibold">Alert Latency Summary</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#94a3b8] text-xs uppercase border-b border-[#1e2a4a]">
              <th className="text-left pb-2">Metric</th>
              <th className="text-right pb-2">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#1e2a4a]/50">
              <td className="py-2 text-[#94a3b8]">Avg Alert Latency</td>
              <td className="py-2 text-right text-[#00d4ff] font-mono">{data.avg_alert_latency_s}s</td>
            </tr>
            <tr className="border-b border-[#1e2a4a]/50">
              <td className="py-2 text-[#94a3b8]">Total Alerts Triggered</td>
              <td className="py-2 text-right text-white font-mono">{data.total_alerts}</td>
            </tr>
            <tr className="border-b border-[#1e2a4a]/50">
              <td className="py-2 text-[#94a3b8]">Alerts Completed</td>
              <td className="py-2 text-right text-[#22c55e] font-mono">{data.completed_alerts}</td>
            </tr>
            <tr>
              <td className="py-2 text-[#94a3b8]">Active Missions</td>
              <td className="py-2 text-right text-white font-mono">{data.active_missions}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
