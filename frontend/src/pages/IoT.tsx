import React from 'react';
import IoTDevicePanel from '../components/IoT/IoTDevicePanel';
import EventLog from '../components/IoT/EventLog';
import { useIoT } from '../api/hooks';
import { Cpu } from 'lucide-react';

const IoT: React.FC = () => {
  const { devices, events, loading, sendCommand } = useIoT();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white text-xl font-bold flex items-center gap-2">
        <Cpu className="text-[#00d4ff]" size={22} />
        IoT Devices
      </h2>
      <IoTDevicePanel
        devices={devices}
        loading={loading}
        onSendCommand={sendCommand}
      />
      <EventLog events={events} />
    </div>
  );
};

export default IoT;
