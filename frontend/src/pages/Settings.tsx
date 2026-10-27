import React, { useState, useEffect } from 'react';
import { useAlerts } from '../api/hooks';
import type { AlertConfig } from '../api/types';
import { Settings as SettingsIcon, Save, CheckCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { config, updateConfig } = useAlerts();
  const [form, setForm] = useState<AlertConfig>({
    siren_enabled: true,
    siren_duration_s: 10,
    lead_time_s: 30,
    volume: 0.6,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const handleSave = async () => {
    await updateConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 max-w-2xl space-y-6">
      <h2 className="text-white text-xl font-bold flex items-center gap-2">
        <SettingsIcon className="text-[#00d4ff]" size={22} />
        Settings
      </h2>

      {/* Alert config */}
      <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-5 space-y-4">
        <h3 className="text-white font-semibold">Alert Configuration</h3>

        {/* Siren enabled */}
        <div className="flex items-center justify-between">
          <label className="text-[#94a3b8] text-sm">Siren Enabled</label>
          <button
            onClick={() => setForm(f => ({ ...f, siren_enabled: !f.siren_enabled }))}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
              form.siren_enabled
                ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/40'
                : 'bg-[#94a3b8]/10 text-[#94a3b8] border-[#94a3b8]/30'
            }`}
          >
            {form.siren_enabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Siren duration */}
        <div>
          <label className="text-[#94a3b8] text-sm block mb-2">Siren Duration (seconds)</label>
          <div className="flex gap-2">
            {[5, 10, 15, 30].map(d => (
              <button key={d}
                onClick={() => setForm(f => ({ ...f, siren_duration_s: d }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  form.siren_duration_s === d
                    ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/50'
                    : 'text-[#94a3b8] border-[#1e2a4a] hover:border-[#94a3b8]/40'
                }`}
              >{d}s</button>
            ))}
          </div>
        </div>

        {/* Lead time */}
        <div>
          <label className="text-[#94a3b8] text-sm block mb-2">Lead Time Before Checkpoint</label>
          <div className="flex gap-2">
            {[15, 30, 60, 120].map(lt => (
              <button key={lt}
                onClick={() => setForm(f => ({ ...f, lead_time_s: lt }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  form.lead_time_s === lt
                    ? 'bg-[#0066cc]/20 text-[#00d4ff] border-[#0066cc]/50'
                    : 'text-[#94a3b8] border-[#1e2a4a] hover:border-[#94a3b8]/40'
                }`}
              >{lt >= 60 ? `${lt/60}m` : `${lt}s`}</button>
            ))}
          </div>
        </div>

        {/* Volume */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="text-[#94a3b8]">Volume</label>
            <span className="text-[#00d4ff] font-mono">{Math.round(form.volume * 100)}%</span>
          </div>
          <input type="range" min={0} max={80} value={Math.round(form.volume * 100)}
            onChange={e => setForm(f => ({ ...f, volume: parseInt(e.target.value) / 100 }))}
            className="w-full"
            style={{ background: `linear-gradient(to right, #00d4ff ${Math.round(form.volume * 100)}%, #1e2a4a ${Math.round(form.volume * 100)}%)` }}
          />
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/40 rounded-lg text-sm font-medium hover:bg-[#00d4ff]/20 transition-all"
        >
          {saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>

      {/* TinyFish section */}
      <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-5">
        <h3 className="text-white font-semibold mb-2">TinyFish Integration</h3>
        <div className="flex items-center gap-3 p-3 bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <p className="text-[#f59e0b] text-sm">
            Not configured — add <code className="bg-[#0a0e1a] px-1.5 py-0.5 rounded font-mono text-xs">TINYFISH_API_KEY</code> env var to enable
          </p>
        </div>
      </div>

      {/* Simulation speed */}
      <div className="bg-[#0f1629] rounded-xl border border-[#1e2a4a] p-5">
        <h3 className="text-white font-semibold mb-2">Simulation Speed</h3>
        <p className="text-[#94a3b8] text-sm">
          Default speed: <span className="text-[#00d4ff] font-mono">40 km/h</span>. 
          Modify via backend API (<code className="bg-[#0a0e1a] px-1.5 py-0.5 rounded font-mono text-xs">POST /api/simulation/start</code>).
        </p>
      </div>
    </div>
  );
};

export default Settings;
