"""
Predefined realistic Delhi emergency corridors, intersections, and Roadside Unit (RSU) checkpoints.
All coordinates correspond to genuine arterial intersections in the National Capital Territory of Delhi.
"""

from typing import List, Dict, Any

ROUTES: Dict[str, Dict[str, Any]] = {
    "DEL-AMB-01": {
        "id": "DEL-AMB-01",
        "name": "Corridor 1: Connaught Place to AIIMS New Delhi (Cardiology Emergency)",
        "priority": "P1_CRITICAL",
        "origin_name": "Connaught Place (Inner/Outer Circle)",
        "destination_name": "AIIMS Trauma / Emergency Dept, Ring Road",
        "destination_coords": [28.5672, 77.2100],
        "total_distance_km": 11.2,
        "base_speed_kmh": 42.0,
        "default_traffic_density": 1.8, # 1.0 (Low) to 3.0 (Heavy Peak)
        "checkpoints": [
            {
                "id": "CP-RSU-01",
                "name": "Barakhamba Road Junction",
                "coords": [28.6315, 77.2250],
                "distance_from_start_km": 1.2,
                "recommended_action": "Halt cross-traffic from Tolstoy Marg, clear inner lane northbound to southbound",
                "trigger_radius_m": 600,
                "arrival_threshold_m": 50,
                "speed_limit_kmh": 50
            },
            {
                "id": "CP-RSU-02",
                "name": "Mandi House Roundabout",
                "coords": [28.6258, 77.2343],
                "distance_from_start_km": 2.8,
                "recommended_action": "Divert Sikandra Road merging traffic into left bypass; hold Bhagwan Das Road signals",
                "trigger_radius_m": 650,
                "arrival_threshold_m": 50,
                "speed_limit_kmh": 45
            },
            {
                "id": "ITO-RSU-03",
                "name": "ITO Major Intersection (BSZ Marg)",
                "coords": [28.6288, 77.2415],
                "distance_from_start_km": 4.6,
                "recommended_action": "Coordinate Green Wave on Bahadur Shah Zafar Marg; prioritize Ring Road turn",
                "trigger_radius_m": 800,
                "arrival_threshold_m": 60,
                "speed_limit_kmh": 40
            },
            {
                "id": "PM-RSU-04",
                "name": "Pragati Maidan / Bhairon Marg",
                "coords": [28.6180, 77.2440],
                "distance_from_start_km": 6.3,
                "recommended_action": "Keep Bhairon Marg underpass clear of commercial auto-rickshaws",
                "trigger_radius_m": 700,
                "arrival_threshold_m": 50,
                "speed_limit_kmh": 55
            },
            {
                "id": "ASH-RSU-05",
                "name": "Ashram Chowk Overpass / Underpass",
                "coords": [28.5708, 77.2600],
                "distance_from_start_km": 8.9,
                "recommended_action": "Hold Mathura Road flyover ramp traffic, give priority to Ring Road westbound lane",
                "trigger_radius_m": 750,
                "arrival_threshold_m": 50,
                "speed_limit_kmh": 45
            },
            {
                "id": "AIM-RSU-06",
                "name": "AIIMS Flyover Intersection / Aurobindo Marg",
                "coords": [28.5672, 77.2100],
                "distance_from_start_km": 11.2,
                "recommended_action": "Clear Emergency Bay entrance, coordinate hospital trauma gate security",
                "trigger_radius_m": 600,
                "arrival_threshold_m": 40,
                "speed_limit_kmh": 35
            }
        ],
        # Realistic dense polyline waypoints along Delhi roads
        "path": [
            [28.6328, 77.2195], # Connaught Place Radial 1
            [28.6315, 77.2250], # Barakhamba Rd
            [28.6290, 77.2300], # Barakhamba towards Mandi House
            [28.6258, 77.2343], # Mandi House Roundabout
            [28.6270, 77.2380], # Tilak Marg connection
            [28.6288, 77.2415], # ITO Junction
            [28.6240, 77.2430], # Ring road southbound
            [28.6180, 77.2440], # Bhairon Marg junction
            [28.6050, 77.2470], # Sarai Kale Khan stretch
            [28.5850, 77.2520], # Ring Road Nizamuddin
            [28.5708, 77.2600], # Ashram Chowk
            [28.5680, 77.2450], # Ring road towards Lajpat Nagar
            [28.5668, 77.2340], # Moolchand Underpass
            [28.5660, 77.2220], # South Extension Ring Road
            [28.5672, 77.2100]  # AIIMS New Delhi
        ]
    },
    "DEL-AMB-02": {
        "id": "DEL-AMB-02",
        "name": "Corridor 2: Dhaula Kuan to Safdarjung Hospital (Trauma Case)",
        "priority": "P1_CRITICAL",
        "origin_name": "Dhaula Kuan Interchange",
        "destination_name": "Safdarjung Hospital Emergency",
        "destination_coords": [28.5693, 77.2078],
        "total_distance_km": 7.8,
        "base_speed_kmh": 46.0,
        "default_traffic_density": 1.5,
        "checkpoints": [
            {
                "id": "DK-RSU-01",
                "name": "Dhaula Kuan Flyover Merging Zone",
                "coords": [28.5921, 77.1616],
                "distance_from_start_km": 0.8,
                "recommended_action": "Hold traffic from Gurgaon expressway merge; clear inner emergency corridor",
                "trigger_radius_m": 600,
                "arrival_threshold_m": 50,
                "speed_limit_kmh": 50
            },
            {
                "id": "MB-RSU-02",
                "name": "Moti Bagh Metro Chowk",
                "coords": [28.5772, 77.1720],
                "distance_from_start_km": 2.9,
                "recommended_action": "Switch Shanti Path crossover lights to manual green for Ring Road Eastbound",
                "trigger_radius_m": 650,
                "arrival_threshold_m": 50,
                "speed_limit_kmh": 45
            },
            {
                "id": "NA-RSU-03",
                "name": "Nauroji Nagar / Africa Avenue Junction",
                "coords": [28.5710, 77.1930],
                "distance_from_start_km": 5.4,
                "recommended_action": "Divert local buses to service lane; open rapid lane towards Safdarjung",
                "trigger_radius_m": 700,
                "arrival_threshold_m": 50,
                "speed_limit_kmh": 45
            },
            {
                "id": "SFJ-RSU-04",
                "name": "Safdarjung Hospital Main Gate",
                "coords": [28.5693, 77.2078],
                "distance_from_start_km": 7.8,
                "recommended_action": "Clear ring road service lane, open gate 2 ramp directly to resuscitation bay",
                "trigger_radius_m": 500,
                "arrival_threshold_m": 40,
                "speed_limit_kmh": 30
            }
        ],
        "path": [
            [28.5940, 77.1560], # Dhaula Kuan Army Cantonment
            [28.5921, 77.1616], # Dhaula Kuan interchange
            [28.5860, 77.1660], # Ring road towards Moti Bagh
            [28.5772, 77.1720], # Moti Bagh Chowk
            [28.5740, 77.1820], # Bikaji Cama Place stretch
            [28.5710, 77.1930], # Nauroji Nagar
            [28.5693, 77.2078]  # Safdarjung Hospital
        ]
    }
}
