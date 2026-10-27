import { useState, useEffect, useCallback } from 'react';
import api from './client';
import type {
  Mission, Checkpoint, AlertConfig, AlertEvent,
  IoTDevice, IoTEvent, SimulationState, ETAResponse, AnalyticsData,
} from './types';

// -------------------------------------------------------------------------
// useMission — polls every 2s
// -------------------------------------------------------------------------
export function useMission(id: string) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    api.get<Mission>(`/api/missions/${id}`)
      .then(m => { setMission(m); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetch();
    const timer = setInterval(fetch, 2000);
    return () => clearInterval(timer);
  }, [fetch]);

  return { mission, loading, error, refetch: fetch };
}

// -------------------------------------------------------------------------
// useSimulation — polls every 1s
// -------------------------------------------------------------------------
export function useSimulation() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(() => {
    api.get<SimulationState>('/api/simulation/state')
      .then(s => { setState(s); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchState();
    const timer = setInterval(fetchState, 1000);
    return () => clearInterval(timer);
  }, [fetchState]);

  const start = () => api.post('/api/simulation/start').then(fetchState);
  const stop = () => api.post('/api/simulation/stop').then(fetchState);
  const advance = () => api.post('/api/simulation/advance').then(fetchState);
  const reset = () => api.post('/api/simulation/reset').then(fetchState);

  return { state, loading, error, start, stop, advance, reset, refetch: fetchState };
}

// -------------------------------------------------------------------------
// useCheckpoints — polls every 2s
// -------------------------------------------------------------------------
export function useCheckpoints(missionId: string) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    api.get<Checkpoint[]>(`/api/missions/${missionId}/checkpoints`)
      .then(cps => { setCheckpoints(cps); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [missionId]);

  useEffect(() => {
    fetch();
    const timer = setInterval(fetch, 2000);
    return () => clearInterval(timer);
  }, [fetch]);

  return { checkpoints, loading, error, refetch: fetch };
}

// -------------------------------------------------------------------------
// useETA — polls every 2s
// -------------------------------------------------------------------------
export function useETA(missionId: string) {
  const [eta, setEta] = useState<ETAResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    api.get<ETAResponse>(`/api/missions/${missionId}/eta`)
      .then(e => { setEta(e); setError(null); })
      .catch(e => setError(e.message));
  }, [missionId]);

  useEffect(() => {
    fetch();
    const timer = setInterval(fetch, 2000);
    return () => clearInterval(timer);
  }, [fetch]);

  return { eta, error };
}

// -------------------------------------------------------------------------
// useAlerts — polls every 2s
// -------------------------------------------------------------------------
export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(() => {
    api.get<AlertEvent[]>('/api/alerts')
      .then(a => { setAlerts(a); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fetchConfig = useCallback(() => {
    api.get<AlertConfig>('/api/alert-config')
      .then(c => setConfig(c))
      .catch(() => {/* non-critical */});
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchConfig();
    const t1 = setInterval(fetchAlerts, 2000);
    const t2 = setInterval(fetchConfig, 5000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [fetchAlerts, fetchConfig]);

  const updateConfig = async (cfg: AlertConfig) => {
    const updated = await api.put<AlertConfig>('/api/alert-config', cfg);
    setConfig(updated);
    return updated;
  };

  const recordAlert = async (checkpoint_id: string, stage: number, duration_s?: number) => {
    const evt = await api.post<AlertEvent>('/api/alerts', { checkpoint_id, stage, duration_s });
    setAlerts(prev => [...prev, evt]);
    return evt;
  };

  return { alerts, config, loading, error, updateConfig, recordAlert, refetch: fetchAlerts };
}

// -------------------------------------------------------------------------
// useIoT — polls every 5s
// -------------------------------------------------------------------------
export function useIoT() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [events, setEvents] = useState<IoTEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(() => {
    api.get<IoTDevice[]>('/api/iot/devices')
      .then(d => { setDevices(d); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fetchEvents = useCallback(() => {
    api.get<IoTEvent[]>('/api/iot/events')
      .then(e => setEvents(e))
      .catch(() => {/* non-critical */});
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchEvents();
    const t1 = setInterval(fetchDevices, 5000);
    const t2 = setInterval(fetchEvents, 5000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [fetchDevices, fetchEvents]);

  const sendCommand = async (deviceId: string, eventType: string, payload: string) => {
    const evt = await api.post<IoTEvent>('/api/iot/events', {
      device_id: deviceId,
      event_type: eventType,
      payload,
    });
    setEvents(prev => [...prev, evt]);
    return evt;
  };

  return { devices, events, loading, error, sendCommand, refetch: fetchDevices };
}

// -------------------------------------------------------------------------
// useAnalytics — fetches once on mount
// -------------------------------------------------------------------------
export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    api.get<AnalyticsData>('/api/analytics')
      .then(d => { setData(d); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
