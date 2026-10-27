// Delhi EMS corridor data — matches reference project exactly

export const MISSION = {
  id: 'mission-alpha-7',
  name: 'Emergency Cardiac Response',
  ambulance_id: 'DL-01-EMS-4402',
  patient: 'Critical Cardiac',
  destination: 'LNJP Hospital',
  priority: 'PRIORITY 1',
  status: 'en_route' as const,
  created_at: new Date().toISOString(),
};

export const STOPS = [
  {
    id: 1,
    name: 'Connaught Place (Inner Circle)',
    lat: 28.6328, lng: 77.2195,
    crowd: 'Normal',
    status: 'resolved' as const,
    light: 'green' as const,
    distFromStart: 0.0,
    iotDevice: 'IOT-CP-01',
    description: 'Pickup Checkpoint / Corridor Entrance',
    sequence_order: 0,
  },
  {
    id: 2,
    name: 'Barakhamba Road Crossing',
    lat: 28.6295, lng: 77.2268,
    crowd: 'Normal',
    status: 'resolved' as const,
    light: 'green' as const,
    distFromStart: 0.9,
    iotDevice: 'IOT-BK-02',
    description: 'Radial Road 4 Junction',
    sequence_order: 1,
  },
  {
    id: 3,
    name: 'Mandi House Roundabout',
    lat: 28.6258, lng: 77.2345,
    crowd: 'Heavy',
    status: 'pending' as const,
    light: 'yellow' as const,
    distFromStart: 1.8,
    iotDevice: 'IOT-MH-03',
    description: 'Major Cultural Hub Intersection',
    sequence_order: 2,
  },
  {
    id: 4,
    name: 'Tilak Marg / Supreme Court',
    lat: 28.6212, lng: 77.2398,
    crowd: 'Normal',
    status: 'resolved' as const,
    light: 'green' as const,
    distFromStart: 2.6,
    iotDevice: 'IOT-TM-04',
    description: 'Judicial Corridor Junction',
    sequence_order: 3,
  },
  {
    id: 5,
    name: 'ITO Chowk (Vikas Marg)',
    lat: 28.6288, lng: 77.2415,
    crowd: 'Critical',
    status: 'pending' as const,
    light: 'red' as const,
    distFromStart: 3.5,
    iotDevice: 'IOT-ITO-05',
    description: 'Highest Congestion Junction in Delhi',
    sequence_order: 4,
  },
  {
    id: 6,
    name: 'Delhi Gate / LNJP Emergency',
    lat: 28.6385, lng: 77.2410,
    crowd: 'Normal',
    status: 'resolved' as const,
    light: 'green' as const,
    distFromStart: 4.8,
    iotDevice: 'IOT-DG-06',
    description: 'Destination Hospital Red Light Gate',
    sequence_order: 5,
  },
];

export const ROUTE_COORDS: [number, number][] = [
  [28.6328, 77.2195],
  [28.6315, 77.2225],
  [28.6295, 77.2268],
  [28.6276, 77.2305],
  [28.6258, 77.2345],
  [28.6235, 77.2372],
  [28.6212, 77.2398],
  [28.6248, 77.2408],
  [28.6288, 77.2415],
  [28.6335, 77.2412],
  [28.6385, 77.2410],
];

export const TOTAL_KM = 4.8;

export const IOT_DEVICES = [
  { id: 'IOT-CP-01', name: 'Signal Controller — CP Inner Circle', type: 'traffic_light', stop_id: 1 },
  { id: 'IOT-BK-02', name: 'Signal Controller — Barakhamba Rd', type: 'traffic_light', stop_id: 2 },
  { id: 'IOT-MH-03', name: 'Speaker Unit — Mandi House', type: 'siren', stop_id: 3 },
  { id: 'IOT-TM-04', name: 'Signal Controller — Tilak Marg', type: 'traffic_light', stop_id: 4 },
  { id: 'IOT-ITO-05', name: 'CCTV + Siren — ITO Chowk', type: 'siren', stop_id: 5 },
  { id: 'IOT-DG-06', name: 'Gate Sensor — Delhi Gate / LNJP', type: 'gps', stop_id: 6 },
];

export type Stop = typeof STOPS[0];
export type StopStatus = 'resolved' | 'pending';
export type CrowdLevel = 'Normal' | 'Heavy' | 'Critical';
export type LightColor = 'green' | 'yellow' | 'red';
