"""
Aerodynamics Physics Engine - 2026 Formula 1 Season
Implements real, rigorous mathematical formulations for 2026 F1 aerodynamics:
- Dual-Mode Active Aerodynamics (Z-Mode vs X-Mode)
- Finite wing aspect ratio & induced drag: C_Di = C_L^2 / (π * AR * e)
- 2026 Narrowed Tyre Aerodynamic Drag (front 280mm, rear 375mm)
- 2026 Partially Flat Floor Ground Effect & Venturi Tunnels (anti-porpoising)
- Aerodynamic Center of Pressure (CP) and balance calculations
- Power required to overcome aerodynamic drag: P_aero = F_drag * v
"""
import numpy as np
from dataclasses import dataclass
from typing import Dict, Tuple, Optional
import math

from config.settings import (
    AIR_DENSITY, F1_CAR_MASS, F1_FRONTAL_AREA_TYPICAL,
    GRAVITY, Z_MODE_CD_BASELINE, Z_MODE_CL_FRONT, Z_MODE_CL_REAR,
    X_MODE_CD_BASELINE, X_MODE_CL_FRONT, X_MODE_CL_REAR,
    X_MODE_DRAG_REDUCTION, TYRE_WIDTH_FRONT, TYRE_WIDTH_REAR, TYRE_DIAMETER
)


@dataclass
class AeroState:
    """Represents the complete aerodynamic state of a 2026 F1 car"""
    velocity: float                  # m/s
    mode: str = "Z_MODE"             # "Z_MODE" (Cornering high-downforce) or "X_MODE" (Straightline low-drag)
    active_aero_deployed: bool = False  # True when X-mode is actively engaged
    front_wing_angle: float = 24.0   # degrees (Z-mode baseline: ~22-26, X-mode: ~10-12)
    rear_wing_angle: float = 32.0    # degrees (Z-mode baseline: ~30-36, X-mode: ~12-16)
    ride_height_front: float = 16.0  # mm (2026 regulations mandate slightly higher floor)
    ride_height_rear: float = 24.0   # mm
    yaw_angle: float = 0.0           # degrees
    steering_angle: float = 0.0      # degrees
    frontal_area: float = F1_FRONTAL_AREA_TYPICAL  # 1.30 m² in 2026
    ground_effect_active: bool = True


class AerodynamicPhysics:
    """
    Core aerodynamics physics engine using exact fluid dynamics equations
    tailored to the official 2026 FIA F1 Technical Regulations.
    """

    def __init__(self, air_density: float = AIR_DENSITY):
        self.air_density = air_density
        self.g = GRAVITY
        
        # 2026 Wing geometric parameters
        self.front_wing_span = 1.80  # m
        self.front_wing_chord = 0.35 # m
        self.rear_wing_span = 0.95   # m
        self.rear_wing_chord = 0.40  # m
        
        # Oswald efficiency factors and aspect ratios
        self.ar_front = (self.front_wing_span ** 2) / (self.front_wing_span * self.front_wing_chord)
        self.ar_rear = (self.rear_wing_span ** 2) / (self.rear_wing_span * self.rear_wing_chord)
        self.oswald_eff = 0.82

    def calculate_dynamic_pressure(self, velocity: float) -> float:
        """
        Calculates dynamic pressure: q = 0.5 * ρ * v² (Pascals)
        """
        return 0.5 * self.air_density * (velocity ** 2)

    def calculate_active_aero_coefficients(self, state: AeroState) -> Tuple[float, float, float]:
        """
        Calculates 2026 dynamic Cl_front, Cl_rear, and Cd depending on whether the car
        is operating in Z-Mode (Cornering High Downforce) or X-Mode (Straightline Low Drag).

        Returns:
            Tuple of (cl_front, cl_rear, cd_total)
        """
        is_x_mode = (state.mode == "X_MODE" or state.active_aero_deployed)

        if is_x_mode:
            # X-MODE: Active front flap flattens, rear wing active flap opens.
            # Drag drops by ~55%, downforce drops by ~60%
            cl_front_base = X_MODE_CL_FRONT * (state.front_wing_angle / 15.0) ** 0.6
            cl_rear_base = X_MODE_CL_REAR * (state.rear_wing_angle / 18.0) ** 0.6
            cd_base = X_MODE_CD_BASELINE
        else:
            # Z-MODE: Full active surface deployment for maximum apex downforce
            cl_front_base = Z_MODE_CL_FRONT * (state.front_wing_angle / 24.0) ** 0.75
            cl_rear_base = Z_MODE_CL_REAR * (state.rear_wing_angle / 32.0) ** 0.75
            cd_base = Z_MODE_CD_BASELINE

        # Ground effect contribution from 2026 narrow venturi tunnels
        ground_factor_front = self._ground_effect_factor_2026(state.ride_height_front)
        ground_factor_rear = self._ground_effect_factor_2026(state.ride_height_rear)

        cl_front = cl_front_base * ground_factor_front
        cl_rear = cl_rear_base * ground_factor_rear

        # Induced drag calculation: C_Di = C_L^2 / (π * AR * e)
        cd_induced_front = (cl_front ** 2) / (math.pi * self.ar_front * self.oswald_eff)
        cd_induced_rear = (cl_rear ** 2) / (math.pi * self.ar_rear * self.oswald_eff)

        # 2026 Narrow Tyre Aerodynamic Drag contribution:
        # Exposed tyre frontal area is reduced in 2026 (-25mm front, -30mm rear)
        tyre_area = 2 * (TYRE_WIDTH_FRONT * TYRE_DIAMETER) + 2 * (TYRE_WIDTH_REAR * TYRE_DIAMETER)
        cd_tyres = 0.28 * (tyre_area / state.frontal_area)

        # Yaw angle adjustment (crosswind increases parasitic drag)
        yaw_multiplier = 1.0 + 0.018 * abs(state.yaw_angle)

        cd_total = (cd_base + cd_induced_front + cd_induced_rear + cd_tyres) * yaw_multiplier

        return cl_front, cl_rear, cd_total

    def _ground_effect_factor_2026(self, ride_height_mm: float) -> float:
        """
        2026 FIA floor ground effect formulation.
        In 2026, floor tunnels are narrower (-150mm) with a partially flat center floor.
        This provides steady downforce without the violent porpoising/choking below 12mm.
        """
        # Linear + exponential decay curve modeling ground effect
        if ride_height_mm <= 8.0:
            # Flow stall threshold
            return 1.15
        elif ride_height_mm <= 18.0:
            # Optimal sweet spot in 2026
            return 1.25 - 0.012 * (ride_height_mm - 14.0)
        else:
            # Gradual drop-off at higher ride heights
            return max(0.80, 1.25 * math.exp(-0.028 * (ride_height_mm - 18.0)))

    def calculate_forces(self, state: AeroState) -> Dict:
        """
        Calculate full 3D aerodynamic forces, moments, and efficiency metrics.

        Returns:
            Dictionary containing downforce (N), drag (N), L/D, front balance %,
            aero power loss (kW), and active aero status.
        """
        q = self.calculate_dynamic_pressure(state.velocity)
        cl_front, cl_rear, cd = self.calculate_active_aero_coefficients(state)

        # Downforce calculation: F_down = q * S * C_L
        downforce_front = q * state.frontal_area * cl_front
        downforce_rear = q * state.frontal_area * cl_rear
        total_downforce = downforce_front + downforce_rear

        # Drag calculation: F_drag = q * S * C_D
        drag_force = q * state.frontal_area * cd

        # Lift-to-drag ratio
        ld_ratio = total_downforce / max(drag_force, 1.0)

        # Aerodynamic balance (% front downforce distribution)
        aero_balance_front = (downforce_front / max(total_downforce, 1.0)) * 100.0

        # Center of Pressure location from front axle (meters, wheelbase 3.4m)
        center_of_pressure_m = 3.40 * (1.0 - (aero_balance_front / 100.0))

        # Power required to overcome aerodynamic drag: P = F * v (Watts -> kW)
        aero_power_kw = (drag_force * state.velocity) / 1000.0

        return {
            "mode": state.mode,
            "active_aero_deployed": (state.mode == "X_MODE" or state.active_aero_deployed),
            "velocity_ms": state.velocity,
            "velocity_kmh": state.velocity * 3.6,
            "dynamic_pressure_pa": q,
            "downforce_front_n": downforce_front,
            "downforce_rear_n": downforce_rear,
            "total_downforce_n": total_downforce,
            "drag_force_n": drag_force,
            "cl_front": cl_front,
            "cl_rear": cl_rear,
            "cl_total": cl_front + cl_rear,
            "cd_total": cd,
            "ld_ratio": ld_ratio,
            "aero_balance_front_pct": aero_balance_front,
            "center_of_pressure_m": center_of_pressure_m,
            "aero_power_loss_kw": aero_power_kw
        }

    def calculate_active_aero_delta(self, velocity_kmh: float) -> Dict:
        """
        Direct mathematical comparison between Z-Mode (Cornering) and X-Mode (Straightline)
        at a given speed to show the exact aerodynamic gain under 2026 rules.
        """
        v_ms = velocity_kmh / 3.6
        z_state = AeroState(velocity=v_ms, mode="Z_MODE", active_aero_deployed=False)
        x_state = AeroState(velocity=v_ms, mode="X_MODE", active_aero_deployed=True)

        z_forces = self.calculate_forces(z_state)
        x_forces = self.calculate_forces(x_state)

        drag_delta_n = x_forces["drag_force_n"] - z_forces["drag_force_n"]
        drag_reduction_pct = (abs(drag_delta_n) / z_forces["drag_force_n"]) * 100.0
        power_saved_kw = z_forces["aero_power_loss_kw"] - x_forces["aero_power_loss_kw"]

        return {
            "velocity_kmh": velocity_kmh,
            "z_mode": z_forces,
            "x_mode": x_forces,
            "drag_reduction_n": abs(drag_delta_n),
            "drag_reduction_pct": drag_reduction_pct,
            "power_saved_kw": power_saved_kw,
            "downforce_shed_n": z_forces["total_downforce_n"] - x_forces["total_downforce_n"]
        }
