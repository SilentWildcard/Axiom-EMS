import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import IoT from './pages/IoT';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useSimulation } from './api/hooks';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useSimulation();
  return (
    <div className="flex min-h-screen" style={{ background: '#0a0e1a' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar simulationActive={state?.active ?? false} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/iot" element={<IoT />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
