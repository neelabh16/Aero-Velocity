"""
Component Analyzer - 2026 Formula 1 Technical Regulations
Analyzes individual 2026 aerodynamic, active aero, and hybrid powertrain components.
"""
from dataclasses import dataclass
from typing import Dict, List
import numpy as np
from config.settings import AERODYNAMIC_COMPONENTS, COMPONENT_WEIGHTS, COMPONENT_COST


@dataclass
class ComponentAnalysis:
    component_name: str
    efficiency_score: float
    strength_rating: str
    improvement_potential: float
    contribution_to_downforce: float
    contribution_to_drag: float
    recommendations: List[str]


class ComponentAnalyzer:
    """Analyzes 2026 F1 car components based on active aero and 50% electric regulations"""

    def analyze_all_components(self, team_name: str, aero_config: Dict, track_config: Dict) -> Dict[str, ComponentAnalysis]:
        analyses = {}
        for component in AERODYNAMIC_COMPONENTS:
            analyses[component] = self._analyze_2026_component(component, team_name, aero_config, track_config)
        return analyses

    def _analyze_2026_component(self, component: str, team_name: str, aero_config: Dict, track_config: Dict) -> ComponentAnalysis:
        # 2026 realistic component baseline contributions (% downforce, % drag)
        contributions_2026 = {
            'active_front_wing': (28, 22),
            'active_rear_wing': (32, 28),
            'narrow_floor_tunnels': (30, 14),
            'diffuser_expansion': (18, 9),
            'mguk_350kw_powertrain': (0, 6),
            'sidepod_cooling_intakes': (2, 14),
            'battery_cooling_pack': (0, 5),
            'sustainable_fuel_injector': (0, 0),
            'wheel_wake_deflectors': (3, 8),
            'halo_fairing': (1, 5)
        }

        # Deterministic variation based on component and team name
        seed_val = abs(hash(f"{team_name}_{component}")) % 100
        base_efficiency = 0.84 + (seed_val / 100.0) * 0.14
        
        rating = "World-Class" if base_efficiency > 0.94 else "Optimal" if base_efficiency > 0.88 else "Competitive"
        df_contrib, drag_contrib = contributions_2026.get(component, (5, 5))

        # Specialized recommendations for 2026 regulations
        recs = {
            'active_front_wing': [
                "Calibrate active flap transition speed for sub-180ms X-Mode opening",
                "Fine-tune leading edge vortex generator to seal 2026 narrower front tyres"
            ],
            'active_rear_wing': [
                "Maximize slot-gap clearance in X-Mode to achieve 55% drag drop on straights",
                "Reinforce 3-element endplate stiffeners to pass FIA active aero deflection tests"
            ],
            'narrow_floor_tunnels': [
                "Optimize tunnel expansion angle to maintain 30% floor downforce without porpoising",
                "Sculpt floor edge winglets to manage 150mm narrower floor boundary layer"
            ],
            'mguk_350kw_powertrain': [
                "Configure aggressive 350kW regenerative braking curve into Turn 1",
                "Optimize MOM push-to-pass power delivery up to 337 km/h threshold"
            ],
            'diffuser_expansion': [
                "Align kick-up line with revised 2026 crash structure guidelines"
            ],
            'sidepod_cooling_intakes': [
                "Minimise frontal inlet aperture to reduce parasitic drag on the 1900mm chassis"
            ],
            'battery_cooling_pack': [
                "Maintain 4.0MJ battery cell operating window between 38°C - 48°C during heavy cycling"
            ],
            'sustainable_fuel_injector': [
                "Tune high-pressure fuel rail for 100% advanced sustainable e-fuel combustion velocity"
            ],
            'wheel_wake_deflectors': [
                "Direct tyre wake outwash away from the narrow floor leading edge"
            ],
            'halo_fairing': [
                "Channel cockpit spillage air cleanly into the airbox and rear wing upper element"
            ]
        }

        component_rec = recs.get(component, [f"Optimize {component.replace('_', ' ')} for 2026 track requirements"])

        return ComponentAnalysis(
            component_name=component.replace('_', ' ').title(),
            efficiency_score=round(base_efficiency, 3),
            strength_rating=rating,
            improvement_potential=round(1.0 - base_efficiency, 3),
            contribution_to_downforce=df_contrib,
            contribution_to_drag=drag_contrib,
            recommendations=component_rec
        )
