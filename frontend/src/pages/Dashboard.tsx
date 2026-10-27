import React from 'react';
import MissionHeader from '../components/Dashboard/MissionHeader';
import StatusCards from '../components/Dashboard/StatusCards';
import SimulationMap from '../components/Map/SimulationMap';
import AmbulanceTracker from '../components/Ambulance/AmbulanceTracker';
import ETADisplay from '../components/Ambulance/ETADisplay';
import CheckpointList from '../components/Ambulance/CheckpointList';
import CheckpointAlert from '../components/Alerts/CheckpointAlert';
import SirenControl from '../components/Alerts/SirenControl';
import AlertHistory from '../components/Alerts/AlertHistory';
import SimulationControls from '../components/Simulation/SimulationControls';
import { useMission, useSimulation, useCheckpoints, useAlerts, useETA, useIoT } from '../api/hooks';

const MISSION_ID = 'mission-alpha-7';

const Dashboard: React.FC = () => {
  const { mission, loading: missionLoading } = useMission(MISSION_ID);
  const { state: simState, start, stop, advance, reset } = useSimulation();
  const { checkpoints, loading: cpLoading } = useCheckpoints(MISSION_ID);
  const { alerts, config, updateConfig, recordAlert } = useAlerts();
  const { eta, error: etaError } = useETA(MISSION_ID);
  const { devices } = useIoT();

  const handleStage1 = (cpId: string) => recordAlert(cpId, 1);
  const handleStage2 = (cpId: string) => recordAlert(cpId, 2);

  return (
    <div className="flex flex-col gap-4 p-4 min-h-0">
      {/* Mission header */}
      <MissionHeader mission={mission} loading={missionLoading} />

      {/* Simulation controls bar */}
      <SimulationControls
        state={simState}
        onStart={start}
        onStop={stop}
        onAdvance={advance}
        onReset={reset}
      />

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Map + Tracker + ETA */}
        <div className="flex flex-col gap-4">
          <SimulationMap checkpoints={checkpoints} simulationState={simState} />
          <AmbulanceTracker state={simState} loading={false} />
          <ETADisplay eta={eta} error={etaError} />
        </div>

        {/* Middle: Checkpoints + Workflow */}
        <div className="flex flex-col gap-4">
          <CheckpointList checkpoints={checkpoints} loading={cpLoading} />
          <CheckpointAlert
            checkpoints={checkpoints}
            onStage1={handleStage1}
            onStage2={handleStage2}
            alerts={alerts}
          />
        </div>

        {/* Right: Siren + Alert history */}
        <div className="flex flex-col gap-4">
          <SirenControl
            config={config}
            onConfigChange={updateConfig}
            onAlertTriggered={(dur) => {
              const approaching = checkpoints.find(cp => cp.status === 'approaching');
              if (approaching) recordAlert(approaching.id, 1, dur);
            }}
          />
          <AlertHistory alerts={alerts} checkpoints={checkpoints} />
        </div>
      </div>

      {/* Bottom: Status cards */}
      <StatusCards
        missions={mission ? [mission] : []}
        devices={devices}
        alerts={alerts}
      />
    </div>
  );
};

export default Dashboard;
