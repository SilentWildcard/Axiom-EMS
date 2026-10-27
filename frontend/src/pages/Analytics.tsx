import React from 'react';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import { useAnalytics } from '../api/hooks';
import { BarChart3, RefreshCw } from 'lucide-react';

const Analytics: React.FC = () => {
  const { data, loading, error, refetch } = useAnalytics();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <BarChart3 className="text-[#00d4ff]" size={22} />
          Analytics Dashboard
        </h2>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#94a3b8] border border-[#1e2a4a] rounded-lg hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition-all"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>
      <AnalyticsDashboard data={data} loading={loading} error={error} />
    </div>
  );
};

export default Analytics;
