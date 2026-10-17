import React, { useEffect, useRef, useState } from 'react';
import { ERSState } from '../types';
import L from 'leaflet';
import { 
  Ambulance as AmbulanceIcon, 
  Compass, 
  LocateFixed, 
  AlertCircle,
  Layers,
  ShieldAlert
} from 'lucide-react';

interface AmbulanceTrackingProps {
  state: ERSState;
  onNavigateTab: (tab: string) => void;
}

export const AmbulanceTracking: React.FC<AmbulanceTrackingProps> = ({ state, onNavigateTab }) => {
  const { ambulance, checkpoints, iot_devices, prediction, environment } = state;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const checkpointMarkersRef = useRef<L.Marker[]>([]);

  const [, setUserLocation] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6050, 77.2280],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Dark Theme OpenStreetMap Tiles via CartoDB Dark Matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Update Route Polyline & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Draw Route Polyline
    const routeCoords = [
      [28.6328, 77.2195],
      [28.6315, 77.2250],
      [28.6290, 77.2300],
      [28.6258, 77.2343],
      [28.6270, 77.2380],
      [28.6288, 77.2415],
      [28.6240, 77.2430],
      [28.6180, 77.2440],
      [28.6050, 77.2470],
      [28.5850, 77.2520],
      [28.5708, 77.2600],
      [28.5680, 77.2450],
      [28.5668, 77.2340],
      [28.5660, 77.2220],
      [28.5672, 77.2100]
    ] as [number, number][];

    const activeRouteColor = showTrafficLayer && environment.traffic_density > 2.0 ? '#2563EB' : '#38BDF8';

    if (!routeLineRef.current) {
      routeLineRef.current = L.polyline(routeCoords, {
        color: activeRouteColor,
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);
    } else {
      routeLineRef.current.setStyle({
        color: activeRouteColor
      });
    }

    // Clear old checkpoint markers
    checkpointMarkersRef.current.forEach(m => m.remove());
    checkpointMarkersRef.current = [];

    // Render Checkpoints with IoT RSU halos using Obsidian Command palette
    checkpoints.forEach((cp) => {
      const iot = iot_devices.find(d => d.device_id === cp.id);
      const isArrived = !!cp.arrived_timestamp && !cp.passed_timestamp;
      const isApproaching = cp.alert_stage1_sent && !cp.arrived_timestamp;
      const isPassed = !!cp.passed_timestamp;

      // Obsidian Command state tokens
      const haloColor = isArrived ? '#2563EB' : isApproaching ? '#0EA5E9' : isPassed ? '#7DD3FC' : '#2563EB';
      
      const customIcon = L.divIcon({
        className: 'custom-rsu-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${haloColor}25; border: 2px solid ${haloColor}; ${isApproaching || isArrived ? 'animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;' : ''}"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: ${haloColor}; border: 2px solid #050B14; box-shadow: 0 0 12px ${haloColor};"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker(cp.coords, { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #F0F7FF; background: #101E36; padding: 4px;">
          <div style="font-weight: bold; color: #38BDF8; margin-bottom: 4px; font-size: 13px;">${cp.name}</div>
          <div style="color: #93B2D6;">Device: <span style="color: #F0F7FF;">${cp.id}</span></div>
          <div style="color: #93B2D6;">Status: <span style="color: ${haloColor}; font-weight: bold;">${iot?.state || 'IDLE'}</span></div>
          <div style="color: #93B2D6;">Distance: <strong style="color: #F0F7FF;">${iot?.distance_to_ambulance_m !== null ? iot?.distance_to_ambulance_m + 'm' : 'N/A'}</strong></div>
          <div style="margin-top: 6px; font-size: 11px; color: #93B2D6; border-top: 1px solid #1E355B; padding-top: 4px;">SOP: ${cp.recommended_action}</div>
        </div>
      `);
      checkpointMarkersRef.current.push(marker);
    });

    // Destination Hospital Marker
    const destIcon = L.divIcon({
      className: 'dest-hospital-marker',
      html: `
        <div style="background: #2563EB; color: #050B14; width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-family: monospace; border: 2px solid #F0F7FF; box-shadow: 0 0 20px rgba(37, 99, 235, 0.75);">
          H+
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker(ambulance.destination_coords, { icon: destIcon }).addTo(map).bindPopup(`
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #F0F7FF; background: #101E36; padding: 4px;">
        <strong style="color: #2563EB; font-size: 13px;">DESTINATION HOSPITAL</strong><br/>
        <span style="color: #F0F7FF; font-weight: 600;">${ambulance.destination_name}</span><br/>
        <span style="color: #93B2D6; font-size: 11px;">Emergency Trauma Bay 1</span>
      </div>
    `);

    // Ambulance Dynamic Live Marker
    const ambIcon = L.divIcon({
      className: 'ambulance-live-marker',
      html: `
        <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background: rgba(37, 99, 235, 0.35); animation: ping 1.2s infinite;"></div>
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: #2563EB; border: 2px solid #F0F7FF; box-shadow: 0 0 20px #2563EB, 0 0 35px rgba(56, 189, 248, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
            🚑
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    if (!ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current = L.marker(ambulance.current_coords, { icon: ambIcon }).addTo(map);
    } else {
      ambulanceMarkerRef.current.setLatLng(ambulance.current_coords);
    }

  }, [ambulance.current_coords, checkpoints, iot_devices, environment.traffic_density, showTrafficLayer]);

  // Handle User Geolocation with Explicit Permission
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 14);
          L.circleMarker(coords, {
            radius: 8,
            color: '#7DD3FC',
            fillColor: '#7DD3FC',
            fillOpacity: 0.85
          }).addTo(mapInstanceRef.current).bindPopup('Your Current Location (Browser Verified)').openPopup();
        }
      },
      (err) => {
        setGeoError(`Location permission denied (${err.message}). Viewing simulated Delhi emergency route.`);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Strip */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)]">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-[#2563EB]/15 border border-[#2563EB]/50 rounded-lg text-[#2563EB] shadow-[0_0_12px_rgba(37,99,235,0.3)]">
            <AmbulanceIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-hud text-base font-bold text-[#F0F7FF] tracking-wider">{ambulance.id}</span>
              <span className="text-[10px] bg-[#2563EB]/20 border border-[#2563EB]/60 text-[#2563EB] px-2 py-0.2 rounded font-mono font-bold tracking-wider">
                {ambulance.priority}
              </span>
            </div>
            <p className="text-xs text-[#93B2D6] mt-0.5">
              Corridor: <span className="text-[#F0F7FF]">{ambulance.route_name}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Geolocation Button */}
          <button
            onClick={requestUserLocation}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#101E36] hover:bg-[#1E355B] border border-[#1E355B] hover:border-[#38BDF8]/50 text-[#93B2D6] hover:text-[#F0F7FF] rounded-lg text-xs font-mono transition"
            title="Request browser geolocation"
          >
            <LocateFixed className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>LOCATE POSITION</span>
          </button>

          {/* Traffic Toggle */}
          <button
            onClick={() => setShowTrafficLayer(!showTrafficLayer)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
              showTrafficLayer 
                ? 'bg-[#38BDF8]/15 border-[#38BDF8]/60 text-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.2)] font-semibold' 
                : 'bg-[#101E36] border-[#1E355B] text-[#93B2D6]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CONGESTION OVERLAY: {showTrafficLayer ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {geoError && (
        <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/50 rounded-lg p-3 text-xs text-[#0EA5E9] flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Map (3 cols) */}
        <div className="lg:col-span-3 bg-[#0B1528] border border-[#1E355B] rounded-xl overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9),0_0_20px_rgba(53,217,255,0.06)] relative">
          <div ref={mapContainerRef} className="w-full h-[580px] z-10" />

          {/* Floating Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-[#050B14]/95 border border-[#1E355B] p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1.5 backdrop-blur-md">
            <div className="text-[10px] font-bold text-[#93B2D6] uppercase tracking-wider mb-1">Tactical Grid Legend</div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shadow-[0_0_6px_#2563EB] animate-ping inline-block" />
              <span className="text-[#F0F7FF]">Active Ambulance GPS</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9] inline-block shadow-[0_0_6px_#0EA5E9]" />
              <span className="text-[#93B2D6]">Stage 1 RSU: Approaching Alert</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] inline-block shadow-[0_0_6px_#2563EB]" />
              <span className="text-[#93B2D6]">Stage 2a RSU: Arrived at Checkpoint</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7DD3FC] inline-block shadow-[0_0_6px_#7DD3FC]" />
              <span className="text-[#93B2D6]">Stage 2b RSU: Ambulance Cleared</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-[#2563EB] inline-block text-[8px] text-[#050B14] text-center leading-3 font-black">H+</span>
              <span className="text-[#F0F7FF]">AIIMS Trauma Centre Destination</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry Sidebar (1 col) */}
        <div className="space-y-4">
          {/* Trip Summary Card */}
          <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] space-y-3">
            <h3 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 border-b border-[#1E355B] pb-2 font-hud tracking-wider">
              <Compass className="w-4 h-4 text-[#38BDF8]" />
              <span>TELEMETRY READOUT</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#1E355B]/60">
                <span className="text-[#93B2D6]">GPS Coords:</span>
                <span className="text-[#38BDF8] font-semibold">{ambulance.current_coords[0].toFixed(4)}, {ambulance.current_coords[1].toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E355B]/60">
                <span className="text-[#93B2D6]">Instant Speed:</span>
                <span className="text-[#F0F7FF] font-bold font-hud text-sm">{ambulance.current_speed_kmh} km/h</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E355B]/60">
                <span className="text-[#93B2D6]">Remaining Dist:</span>
                <span className="text-[#F0F7FF] font-bold font-hud text-sm">{ambulance.remaining_distance_km} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E355B]/60">
                <span className="text-[#93B2D6]">Predicted ETA:</span>
                <span className="text-[#38BDF8] font-bold font-hud text-sm drop-shadow-[0_0_8px_rgba(53,217,255,0.4)]">{prediction.predicted_eta_formatted}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E355B]/60">
                <span className="text-[#93B2D6]">Baseline (No AI):</span>
                <span className="text-[#93B2D6]/60 line-through">{prediction.baseline_eta_formatted}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E355B]/60">
                <span className="text-[#93B2D6]">Current RSU:</span>
                <span className="text-[#0EA5E9] text-right truncate block max-w-[140px] font-semibold">{ambulance.current_checkpoint}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#93B2D6]">Next Target:</span>
                <span className="text-[#7DD3FC] text-right truncate block max-w-[140px] font-semibold">{ambulance.next_checkpoint}</span>
              </div>
            </div>
          </div>

          {/* AI Risk & Corridor Action */}
          <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-4 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.7)] space-y-3">
            <h3 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 border-b border-[#1E355B] pb-2 font-hud tracking-wider">
              <ShieldAlert className="w-4 h-4 text-[#0EA5E9]" />
              <span>CORRIDOR PROTECTION</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#93B2D6] font-mono">Traffic Risk:</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] tracking-wider ${
                  prediction.delay_risk === 'CRITICAL' ? 'bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/50 shadow-[0_0_8px_rgba(255,64,87,0.3)]' :
                  prediction.delay_risk === 'HIGH' ? 'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/50' :
                  'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/50'
                }`}>
                  {prediction.delay_risk}
                </span>
              </div>
              <p className="text-[#93B2D6] text-xs leading-relaxed">
                Advance alert timing is dynamically calculated based on current speed and queue dissipation capacity.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('police')}
                  className="w-full py-2 bg-[#101E36] hover:bg-[#1E355B] text-[#38BDF8] border border-[#38BDF8]/30 hover:border-[#38BDF8]/70 rounded-lg font-mono text-xs font-semibold transition text-center shadow-sm"
                >
                  Manage Police Clearances &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
