import React from 'react';
import { HardwareDeviceState } from './types';
import { Navigation, Zap, Compass, Satellite, Terminal } from 'lucide-react';

interface Props {
  device: HardwareDeviceState;
  onTogglePower: () => void;
  lat: number;
  lng: number;
  speedKmH: number;
  stage: number;
}

export const GPSModule: React.FC<Props> = ({
  device,
  onTogglePower,
  lat,
  lng,
  speedKmH,
  stage,
}) => {
  const isOnline = device.powerOn && device.status !== 'offline';

  // Generate realistic simulated NMEA sentences
  const timeNow = new Date();
  const utcHours = timeNow.getUTCHours().toString().padStart(2, '0');
  const utcMins = timeNow.getUTCMinutes().toString().padStart(2, '0');
  const utcSecs = timeNow.getUTCSeconds().toString().padStart(2, '0');
  const timeString = `${utcHours}${utcMins}${utcSecs}.00`;

  // Degrees and decimal minutes
  const latDeg = Math.floor(lat);
  const latMin = ((lat - latDeg) * 60).toFixed(4);
  const lngDeg = Math.floor(lng);
  const lngMin = ((lng - lngDeg) * 60).toFixed(4);

  const knots = (speedKmH * 0.539957).toFixed(1);

  const gprmc = `$GPRMC,${timeString},A,${latDeg}${latMin},N,0${lngDeg}${lngMin},E,${knots},042.5,181126,,,A*7C`;
  const gpgga = `$GPGGA,${timeString},${latDeg}${latMin},N,0${lngDeg}${lngMin},E,1,11,0.85,216.4,M,-34.2,M,,*4F`;

  return (
    <div className="bg-[#0b1323] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            !isOnline ? 'bg-slate-900 border-slate-800 text-slate-600'
            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
          }`}>
            <Navigation size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">{device.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                u-blox NEO-6M
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{device.role}</p>
          </div>
        </div>

        {/* Status & Power */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border flex items-center gap-1.5 ${
            !isOnline ? 'bg-slate-900 text-slate-500 border-slate-800'
            : 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isOnline ? 'bg-slate-600' : 'bg-indigo-400 animate-ping'
            }`} />
            {isOnline ? '3D GNSS LOCK' : 'OFFLINE'}
          </span>

          <button
            onClick={onTogglePower}
            title={device.powerOn ? 'Turn Off GPS' : 'Turn On GPS'}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
              device.powerOn
                ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Zap size={14} />
          </button>
        </div>
      </div>

      {/* Realistic GNSS Ceramic Patch Antenna & Constellation Illustration */}
      <div className="my-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-lg font-mono text-[11px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            Ceramic Patch Antenna & Space Vehicle Radar
          </span>
          <span className="text-[9px] text-indigo-400 flex items-center gap-1">
            <Satellite size={11} /> 11 Satellites Locked
          </span>
        </div>

        <div className="grid grid-cols-12 gap-3 items-center bg-slate-950/60 p-2.5 rounded border border-slate-800/70">
          {/* Ceramic Patch Antenna Visual */}
          <div className="col-span-4 h-20 bg-amber-900/30 border-2 border-amber-600/70 rounded-md p-1.5 flex flex-col items-center justify-between shadow-inner">
            <span className="text-[8px] font-bold text-amber-300">25x25mm PATCH</span>
            <div className="w-8 h-8 rounded-full border border-amber-500/80 bg-amber-800/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-200 shadow-sm" />
            </div>
            <span className="text-[7px] text-amber-400/80">L1 1575.42 MHz</span>
          </div>

          {/* Receiver IC + Sky Polar Map */}
          <div className="col-span-8 flex flex-col justify-between h-20">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Position Fix:</span>
              <span className="text-emerald-400 font-bold">DGPS / SBAS Enabled</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Ambulance Vector:</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Compass size={12} /> 042° NE @ {speedKmH} km/h
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Accuracy (HDOP):</span>
              <span className="text-indigo-300 font-bold">0.85 (Sub-Meter)</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Update Rate:</span>
              <span className="text-slate-300 font-bold">10 Hz High-Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coordinate & Speed Telemetry Cards */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono my-1">
        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Latitude</span>
          <span className="text-xs font-bold text-cyan-400">
            {isOnline ? `${lat.toFixed(5)}°N` : '—'}
          </span>
          <span className="text-[9px] text-slate-500 block">Delhi Central</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Longitude</span>
          <span className="text-xs font-bold text-cyan-400">
            {isOnline ? `${lng.toFixed(5)}°E` : '—'}
          </span>
          <span className="text-[9px] text-slate-500 block">Delhi Central</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800/80 rounded p-2 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Ground Speed</span>
          <span className="text-xs font-bold text-emerald-400">
            {isOnline ? `${speedKmH} km/h` : '0 km/h'}
          </span>
          <span className="text-[9px] text-slate-500 block">OBU Telemetry</span>
        </div>
      </div>

      {/* Live Raw NMEA Data Stream Console */}
      <div className="mt-2 bg-[#080d1a] border border-slate-800/80 rounded p-2 font-mono text-[9px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-[8px] text-slate-500 border-b border-slate-800/80 pb-0.5">
          <span>UART RS-232 / 9600 BAUD STREAM</span>
          <span className="text-indigo-400">NMEA-0183</span>
        </div>
        <p className="text-indigo-300/90 truncate">{isOnline ? gprmc : '$GPRMC,SEARCHING_SATELLITES...'}</p>
        <p className="text-emerald-300/80 truncate">{isOnline ? gpgga : '$GPGGA,,,,,,0,00,,,M,,M,,*'}</p>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="font-mono">SIMULATED TELEMETRY [NON-PHYSICAL EMULATION]</span>
        <span className="font-mono text-slate-400">OBU Node DL-01-EMS</span>
      </div>
    </div>
  );
};
