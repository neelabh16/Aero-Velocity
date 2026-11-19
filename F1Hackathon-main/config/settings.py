"""
Configuration settings for F1 Aerodynamic & Hybrid Physics Analysis System - 2026 Season
Fully compliant with official FIA 2026 Technical Regulations:
- Minimum mass: 768 kg (-30 kg reduction)
- Dimensions: Wheelbase 3400 mm (-200 mm), Width 1900 mm (-100 mm)
- Power Unit: 50% Electric (350 kW MGU-K, 400 kW ICE, ~1000+ HP total, MGU-H removed)
- Active Aerodynamics: Dual-mode Z-Mode (Cornering downforce) & X-Mode (Straightline low-drag, -55% drag)
- Manual Override Mode (MOM): Push-to-pass electrical boost up to 337 km/h - 355 km/h
- 100% Advanced Sustainable Fuels (3,000 MJ/h energy flow limit)
- 11 Teams Grid (including Cadillac Formula 1 Team & Audi Works Team)
"""
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
CAR_IMAGES_DIR = DATA_DIR / 'car_images'
OUTPUT_DIR = BASE_DIR / 'output'
MODELS_DIR = BASE_DIR / 'saved_models'
CACHE_DIR = BASE_DIR / 'cache'

# Create directories if they don't exist
for dir_path in [DATA_DIR, CAR_IMAGES_DIR, OUTPUT_DIR, MODELS_DIR, CACHE_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Season
CURRENT_SEASON = 2026
BASELINE_SEASON = 2025

# ---------------------------------------------------------------------------
# F1 2026 Physical Constants (FIA 2026 Technical Regulations)
# ---------------------------------------------------------------------------
AIR_DENSITY = 1.225         # kg/m³ at sea level, 15°C
GRAVITY = 9.80665           # m/s²

# Mass & Dimensions
F1_CAR_MASS = 768           # kg (FIA 2026 min mass: 722 kg dry + 46 kg tyres, -30 kg vs 2025's 798 kg)
F1_CAR_MASS_2025 = 798      # kg (for historical comparison)
F1_WHEELBASE = 3.40         # m (reduced from 3.60 m, -200 mm)
F1_TRACK_WIDTH = 1.90       # m (reduced from 2.00 m, -100 mm)
F1_FRONTAL_AREA_TYPICAL = 1.30  # m² (narrower car & tyres, reduced from 1.40 m²)
F1_FLOOR_WIDTH = 1.45       # m (reduced by 150 mm vs 2025)

# Tyre Specifications (18-inch wheels, narrower profile)
TYRE_WIDTH_FRONT = 0.280    # m (was 0.305 m, -25 mm)
TYRE_WIDTH_REAR = 0.375     # m (was 0.405 m, -30 mm)
TYRE_DIAMETER = 0.705       # m (was 0.720 m, -15 mm)
TYRE_FRICTION_COEFF = 1.85  # Dry compound peak grip coefficient

# ---------------------------------------------------------------------------
# 2026 Power Unit (PU-2026) Specifications
# ---------------------------------------------------------------------------
# 1.6L V6 Turbo ICE (reduced power output, 100% sustainable drop-in fuel)
ICE_MAX_POWER = 400000.0    # 400 kW (~536 bhp)
ICE_ENERGY_FLOW_LIMIT = 3000.0  # MJ/h max energy flow rate (replaces 100 kg/h fuel mass flow)

# MGU-K (Tripled power vs 2025's 120 kW!)
MGUK_MAX_POWER = 350000.0   # 350 kW (~469 bhp)
MGUH_ACTIVE = False         # MGU-H completely eliminated in 2026

# Combined Total Powertrain
TOTAL_SYSTEM_POWER = ICE_MAX_POWER + MGUK_MAX_POWER  # 750 kW (~1005 bhp)
POWER_SPLIT_ELECTRICAL = 0.467  # ~47% electrical, ~53% thermal

# Energy Storage & Regeneration
BATTERY_USABLE_ENERGY = 4.0     # MJ usable capacity per lap
MAX_REGEN_PER_LAP = 8.5         # MJ maximum energy recovered per lap (doubled vs 2025)
MAX_REGEN_POWER = 350000.0      # 350 kW regenerative braking power

# Manual Override Mode (MOM) - Replaces simple DRS push
MOM_STANDARD_DERATE_SPEED = 290.0  # km/h (standard MGU-K power tapering begins)
MOM_BOOST_MAX_SPEED = 337.0        # km/h (MOM holds full 350 kW up to 337 km/h, then tapers to 355 km/h)
MOM_CUTOFF_SPEED = 355.0           # km/h

# ---------------------------------------------------------------------------
# 2026 Active Aerodynamics (Dual-Mode: Z-Mode & X-Mode)
# ---------------------------------------------------------------------------
# Z-Mode (Cornering / High Downforce Mode)
Z_MODE_CD_BASELINE = 1.15       # Drag coefficient in cornering mode
Z_MODE_CL_FRONT = 1.30          # Front downforce coefficient
Z_MODE_CL_REAR = 1.65           # Rear downforce coefficient
Z_MODE_CL_TOTAL = Z_MODE_CL_FRONT + Z_MODE_CL_REAR  # ~2.95 (down ~30% from 2025 ground-effect levels)
Z_MODE_LD_TARGET = 2.65         # Lift-to-drag in Z-mode

# X-Mode (Straightline / Low Drag Active Mode - Flaps open front & rear)
X_MODE_CD_BASELINE = 0.54       # Drag coefficient in low-drag mode (~55% reduction!)
X_MODE_CL_FRONT = 0.55          # Minimal front downforce
X_MODE_CL_REAR = 0.65           # Minimal rear downforce
X_MODE_CL_TOTAL = X_MODE_CL_FRONT + X_MODE_CL_REAR  # ~1.20
X_MODE_DRAG_REDUCTION = 0.55    # 55% drag drop (massive vs 2025 DRS ~12%)

# Active aero transition latency
ACTIVE_AERO_ACTUATION_TIME = 0.20  # seconds

# ---------------------------------------------------------------------------
# F1 2026 Teams Grid (11 Teams confirmed for 2026)
# ---------------------------------------------------------------------------
F1_TEAMS = [
    "McLaren",
    "Ferrari",
    "Red Bull Ford",
    "Mercedes",
    "Aston Martin",
    "Audi Revolut",
    "Williams",
    "Racing Bulls",
    "Haas F1 Team",
    "Alpine",
    "Cadillac Formula 1 Team"
]

# Team metadata for 2026 season
TEAM_METADATA_2026 = {
    "McLaren": {
        "engine": "Mercedes-AMG M17 E Performance Works",
        "power_rating": 99.4,
        "aero_efficiency": 99.2,
        "active_aero_score": 98.8,
        "ice_power_kw": 402,
        "mguk_power_kw": 350,
        "chassis_agility": 99.0,
        "mom_potency": 99.2,
        "color": "#FF8000",
        "secondary_color": "#000000",
        "chassis": "MCL40",
        "drivers": ["Lando Norris", "Oscar Piastri"]
    },
    "Ferrari": {
        "engine": "Ferrari 067/6 Works PU",
        "power_rating": 99.1,
        "aero_efficiency": 98.2,
        "active_aero_score": 98.0,
        "ice_power_kw": 404,
        "mguk_power_kw": 350,
        "chassis_agility": 98.5,
        "mom_potency": 98.6,
        "color": "#E80020",
        "secondary_color": "#FFF",
        "chassis": "SF-26",
        "drivers": ["Charles Leclerc", "Lewis Hamilton"]
    },
    "Red Bull Ford": {
        "engine": "Red Bull Ford Powertrains DM-01",
        "power_rating": 98.0,
        "aero_efficiency": 98.6,
        "active_aero_score": 98.2,
        "ice_power_kw": 398,
        "mguk_power_kw": 348,
        "chassis_agility": 98.2,
        "mom_potency": 98.0,
        "color": "#1E41FF",
        "secondary_color": "#FF1801",
        "chassis": "RB22",
        "drivers": ["Max Verstappen", "Isack Hadjar"]
    },
    "Mercedes": {
        "engine": "Mercedes-AMG M17 E Performance Works",
        "power_rating": 99.2,
        "aero_efficiency": 97.8,
        "active_aero_score": 98.4,
        "ice_power_kw": 401,
        "mguk_power_kw": 350,
        "chassis_agility": 98.0,
        "mom_potency": 98.5,
        "color": "#00D2BE",
        "secondary_color": "#000000",
        "chassis": "W17",
        "drivers": ["George Russell", "Kimi Antonelli"]
    },
    "Aston Martin": {
        "engine": "Honda HRC RA626H (Severe Thermal Derate and Clipping)",
        "power_rating": 71.8,
        "aero_efficiency": 74.2,
        "active_aero_score": 73.0,
        "ice_power_kw": 378,
        "mguk_power_kw": 315,
        "chassis_agility": 74.0,
        "mom_potency": 71.5,
        "color": "#006F62",
        "secondary_color": "#CEDC00",
        "chassis": "AMR26",
        "drivers": ["Fernando Alonso", "Lance Stroll"],
        "engine_status": "Critical Honda PU thermal clipping, early electrical derate at 266 km/h, excessive cooling drag louvres"
    },
    "Audi Revolut": {
        "engine": "Audi Neuburg F1 Works PU",
        "power_rating": 92.5,
        "aero_efficiency": 92.0,
        "active_aero_score": 91.8,
        "ice_power_kw": 390,
        "mguk_power_kw": 338,
        "chassis_agility": 92.0,
        "mom_potency": 92.5,
        "color": "#E50000",
        "secondary_color": "#1A1A1A",
        "chassis": "R26",
        "drivers": ["Nico Hülkenberg", "Gabriel Bortoleto"]
    },
    "Williams": {
        "engine": "Mercedes-AMG M17 E Performance",
        "power_rating": 96.5,
        "aero_efficiency": 94.8,
        "active_aero_score": 95.2,
        "ice_power_kw": 401,
        "mguk_power_kw": 348,
        "chassis_agility": 95.0,
        "mom_potency": 95.5,
        "color": "#00A0DE",
        "secondary_color": "#041E42",
        "chassis": "FW48",
        "drivers": ["Alexander Albon", "Carlos Sainz"]
    },
    "Racing Bulls": {
        "engine": "Red Bull Ford Powertrains DM-01",
        "power_rating": 95.2,
        "aero_efficiency": 94.0,
        "active_aero_score": 94.2,
        "ice_power_kw": 397,
        "mguk_power_kw": 345,
        "chassis_agility": 94.5,
        "mom_potency": 94.0,
        "color": "#6692FF",
        "secondary_color": "#FFFFFF",
        "chassis": "VCARB 03",
        "drivers": ["Liam Lawson", "Arvid Lindblad"]
    },
    "Haas F1 Team": {
        "engine": "Ferrari 067/6 (Toyota GR Technical Alliance)",
        "power_rating": 94.8,
        "aero_efficiency": 93.5,
        "active_aero_score": 93.2,
        "ice_power_kw": 399,
        "mguk_power_kw": 346,
        "chassis_agility": 93.8,
        "mom_potency": 93.5,
        "color": "#B6BABD",
        "secondary_color": "#E10600",
        "chassis": "VF-26",
        "drivers": ["Esteban Ocon", "Oliver Bearman"]
    },
    "Alpine": {
        "engine": "Mercedes-AMG Customer PU",
        "power_rating": 94.0,
        "aero_efficiency": 93.0,
        "active_aero_score": 92.8,
        "ice_power_kw": 396,
        "mguk_power_kw": 344,
        "chassis_agility": 93.0,
        "mom_potency": 93.0,
        "color": "#0090FF",
        "secondary_color": "#FF87BC",
        "chassis": "A526",
        "drivers": ["Pierre Gasly", "Franco Colapinto"]
    },
    "Cadillac Formula 1 Team": {
        "engine": "TWG / Ferrari Transition PU",
        "power_rating": 93.2,
        "aero_efficiency": 92.5,
        "active_aero_score": 92.0,
        "ice_power_kw": 391,
        "mguk_power_kw": 340,
        "chassis_agility": 92.5,
        "mom_potency": 92.0,
        "color": "#FFD700",
        "secondary_color": "#101010",
        "chassis": "C-01",
        "drivers": ["Sergio Pérez", "Valtteri Bottas"]
    }
}

TEAM_ABBREV = {
    "McLaren": "MCL",
    "Ferrari": "FER",
    "Red Bull Ford": "RBF",
    "Mercedes": "MER",
    "Aston Martin": "AMR",
    "Audi Revolut": "AUD",
    "Williams": "WIL",
    "Racing Bulls": "RBS",
    "Haas F1 Team": "HAA",
    "Alpine": "ALP",
    "Cadillac Formula 1 Team": "CAD"
}

# ---------------------------------------------------------------------------
# 2026 Aerodynamic & Powertrain Components to Analyze
# ---------------------------------------------------------------------------
AERODYNAMIC_COMPONENTS = [
    "active_front_wing",
    "active_rear_wing",
    "narrow_floor_tunnels",
    "sidepod_cooling_intakes",
    "diffuser_expansion",
    "mguk_350kw_powertrain",
    "battery_cooling_pack",
    "sustainable_fuel_injector",
    "wheel_wake_deflectors",
    "halo_fairing"
]

COMPONENT_WEIGHTS = {
    "active_front_wing": 0.22,
    "active_rear_wing": 0.20,
    "narrow_floor_tunnels": 0.18,
    "mguk_350kw_powertrain": 0.16,
    "diffuser_expansion": 0.10,
    "sidepod_cooling_intakes": 0.05,
    "battery_cooling_pack": 0.04,
    "sustainable_fuel_injector": 0.02,
    "wheel_wake_deflectors": 0.02,
    "halo_fairing": 0.01
}

COMPONENT_COST = {
    "active_front_wing": 220,
    "active_rear_wing": 190,
    "narrow_floor_tunnels": 260,
    "mguk_350kw_powertrain": 450,
    "diffuser_expansion": 170,
    "sidepod_cooling_intakes": 140,
    "battery_cooling_pack": 180,
    "sustainable_fuel_injector": 95,
    "wheel_wake_deflectors": 60,
    "halo_fairing": 35
}

# ---------------------------------------------------------------------------
# ML, Computer Vision & Visualization Constants
# ---------------------------------------------------------------------------
CV_IMAGE_SIZE = (800, 600)
CV_EDGE_DETECTION_THRESHOLD = (50, 150)
FASTF1_CACHE_DIR = CACHE_DIR

ML_RANDOM_STATE = 42
ML_N_ESTIMATORS = 100
ML_LEARNING_RATE = 0.1
ML_MAX_DEPTH = 5

OUTPUT_DIR = BASE_DIR / 'output'
VIZ_DPI = 300
VIZ_FIGSIZE = (12, 8)
VIZ_COLOR_PALETTE = 'viridis'

TEAMS = F1_TEAMS
AERODYNAMIC_EFFICIENCY_WEIGHT = 0.40
DRS_DRAG_REDUCTION = X_MODE_DRAG_REDUCTION
SLIPSTREAM_EFFECT = 0.08
TIRE_DEGRADATION_FACTOR = 0.002

CD_BASELINE = Z_MODE_CD_BASELINE
CL_FRONT_BASELINE = Z_MODE_CL_FRONT
CL_REAR_BASELINE = Z_MODE_CL_REAR
L_D_RATIO_TARGET = Z_MODE_LD_TARGET
