"""
Circuit Analyzer - 2026 F1 Regulations Edition
Provides comprehensive setup recommendations and critical corner identification
tailored to the 2026 Active Aerodynamics and 50% Electric Powertrain regulations.
"""
from dataclasses import dataclass
from typing import Dict, Optional, List
import math

from config.track_configs import get_track_by_name, TrackConfig
from physics.lap_time_simulator import LapTimeSimulator, CarParameters
from physics.aerodynamics import AerodynamicPhysics, AeroState


def generate_ml_setup_recommendations(track_config: TrackConfig, current_config: Dict, optimal_params: CarParameters) -> Dict:
    """
    Generate physics-derived 2026 setup recommendations for active aero,
    MGU-K 350kW deployment, and tyre wear management.
    """
    current_cd = current_config.get('drag_coefficient', 1.15)
    current_cl = current_config.get('cl_front', 1.30) + current_config.get('cl_rear', 1.65)
    
    # 2026 Z-Mode optimal baseline
    optimal_cd = 1.12 if track_config.downforce_level.value == 'high' else (0.98 if track_config.downforce_level.value == 'low' else 1.05)
    optimal_cl = 3.10 if track_config.downforce_level.value == 'high' else (2.40 if track_config.downforce_level.value == 'low' else 2.75)
    
    cd_diff = current_cd - optimal_cd
    cl_diff = current_cl - optimal_cl
    
    # Calculate X-Mode straightline benefits
    x_mode_straight_pct = min(68.0, (track_config.longest_straight * 1.8 / (track_config.circuit_length * 1000.0)) * 100.0)
    
    return {
        'season': 2026,
        'active_aero_mode': {
            'z_mode_flap_optimal': f"{optimal_params.front_wing_angle:.0f}° / {optimal_params.rear_wing_angle:.0f}°",
            'x_mode_drag_drop': "55.0% drag reduction on straights",
            'x_mode_active_zones_pct': f"{x_mode_straight_pct:.1f}% of lap",
            'status': "Dynamic Active Control Ready"
        },
        'powertrain_350kw': {
            'mguk_strategy': get_mguk_strategy(track_config),
            'mom_activation_priority': "High" if track_config.longest_straight > 900 else "Medium",
            'energy_harvest_target': f"{min(8.5, 3.8 + track_config.corner_count * 0.28):.1f} MJ/lap"
        },
        'wing_angles': {
            'front_optimal': f"{optimal_params.front_wing_angle:.0f}°",
            'rear_optimal': f"{optimal_params.rear_wing_angle:.0f}°",
            'front_current': f"{current_config.get('front_wing_angle', 24):.0f}°",
            'rear_current': f"{current_config.get('rear_wing_angle', 32):.0f}°",
            'adjustment_needed': abs(cd_diff) > 0.05 or abs(cl_diff) > 0.25
        },
        'ride_heights': {
            'front_optimal': f"{optimal_params.ride_height_front:.1f}mm",
            'rear_optimal': f"{optimal_params.ride_height_rear:.1f}mm",
            'ground_effect_note': '2026 narrow floor tunnels reduce porpoising risk while maintaining floor suction'
        },
        'drag_analysis': {
            'z_mode_cd': f"{optimal_cd:.3f}",
            'x_mode_cd': f"{optimal_cd * 0.46:.3f}",
            'status': 'Optimal Active Aero Balance',
            'impact': f"{track_config.longest_straight * 0.018:.1f} km/h straightline gain in X-Mode"
        },
        'downforce_analysis': {
            'corner_cl': f"{optimal_cl:.2f}",
            'downforce_distribution': "43% Front / 57% Rear",
            'status': 'Optimal for 2026 narrower tyres'
        },
        'track_specific': {
            'downforce_level': track_config.downforce_level.value.upper(),
            'priority': get_setup_priority(track_config),
            'key_focus': get_key_focus(track_config)
        }
    }


def get_mguk_strategy(track_config: TrackConfig) -> str:
    """Determine 350kW MGU-K energy harvesting vs deployment profile"""
    if track_config.longest_straight > 1000:
        return "Heavy Straightline Deployment (MOM Boost on Main Straight + Aggressive T1 Regen)"
    elif track_config.corner_count > 18:
        return "High Energy Cycling (Continuous Corner-Exit Torque Vectoring & Frequent Braking Regen)"
    else:
        return "Balanced 50/50 Harvest & Boost Profile (350kW MGU-K + 400kW ICE)"


def get_setup_priority(track_config: TrackConfig) -> str:
    """Determine setup priority based on 2026 track requirements"""
    if track_config.downforce_level.value in ['high', 'very_high']:
        return "Z-MODE DOWNFORCE & AGILITY - Maximize wing angle & slow-corner mechanical grip"
    elif track_config.downforce_level.value == 'low':
        return "X-MODE LOW DRAG & TOP SPEED - Maximize active flap opening & MOM duration"
    else:
        return "HYBRID BALANCE - Seamless Z-to-X transitions & high regenerative braking"


def get_key_focus(track_config: TrackConfig) -> str:
    """Get 2026 key focus area for track"""
    if track_config.corner_count > 18:
        return f"High corner density ({track_config.corner_count} corners) - 768kg lightweight agility advantage"
    elif track_config.circuit_length > 6.0:
        return "Long circuit - 350kW MGU-K battery state-of-charge management essential"
    else:
        return "Standard 2026 layout - Active Aero flap transition speed critical"


def identify_critical_corners(track_config: TrackConfig, optimal_params: CarParameters) -> List[Dict]:
    """Identify key corners where 2026 active aero & reduced downforce impact performance"""
    return [
        {
            "corner_number": 1,
            "type": "Heavy Braking Zone",
            "desc": "Primary MGU-K 350kW energy harvesting zone, snaps active aero to Z-Mode for aero braking",
            "speed_kmh": "75 - 110",
            "active_mode": "Z-Mode (Aero Braking)"
        },
        {
            "corner_number": int(track_config.corner_count * 0.4),
            "type": "Medium-Speed Direction Change",
            "desc": "Tests 768kg chassis agility and 3.4m shorter wheelbase transient responsiveness",
            "speed_kmh": "135 - 175",
            "active_mode": "Z-Mode (Apex Grip)"
        },
        {
            "corner_number": track_config.corner_count,
            "type": "Final Corner / Straight Launch",
            "desc": "Critical traction zone deploying full 350kW MGU-K torque before snapping into X-Mode on straight",
            "speed_kmh": "115 - 165",
            "active_mode": "Z-Mode Exit -> X-Mode Straight"
        }
    ]
