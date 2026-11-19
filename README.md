<div align="center">

# 🏎️ AeroVelocity

### Formula 1 2026 Technical & Telemetry Suite

> **High-fidelity aerodynamics simulation, 50% hybrid powertrain physics, and distance-synchronized telemetry across all 24 Grand Prix circuits under the 2026 FIA Technical Regulations.**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red)](#license)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [2026 Regulations Modeled](#2026-regulations-modeled)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Physics Engine](#physics-engine)
- [License](#license)

---

## 🎯 Overview

**AeroVelocity** is a comprehensive Formula 1 simulation and analysis platform built around the **2026 FIA Technical Regulations**. It combines real-world calibrated physics, FastF1 telemetry data, and interactive visualization to model the performance of all 11 constructor teams across all 24 circuits on the 2026 calendar.

The platform models the fundamental regulation changes — active dual-mode aerodynamics (Z-Mode cornering / X-Mode low-drag straights), 350 kW MGU-K electric motors (nearly 3× the current output), removal of MGU-H, 100% sustainable e-fuels, and 768 kg minimum mass — with team-specific car profiles that reflect realistic performance characteristics:

- **Mercedes W17** — Season benchmark: Lowest drag (Cd = 0.522), highest derating threshold (304 km/h), 99.6% MGU-K efficiency
- **Ferrari SF-26** — Best cornering car on the grid (CL = 3.25, agility 100/100), but handicapped on straights by a compact turbocharger and early electrical clipping at 282 km/h
- **Red Bull RB22** — Straightline missile with low-drag packaging and Verstappen's braking aggression
- **McLaren MCL40** — Sub-170 ms active aero flap transitions, balanced aero platform
- Plus 7 more constructors, each with unique powertrain, aero, and chassis profiles

---

## ✨ Key Features

### 🏠 Home Page
- **Hero section** with integrated 2026 F1 car visualization and interactive aerodynamic callout badges (Front Active Wing, Floor Venturi Inlets, 350 kW MGU-K Core, Rear Active Flap)
- **5 official Pirelli 2026 tyre compound cards** with thermal operating windows, friction coefficients (μ), and stint longevity
- **Interactive track telemetry inspector** — browse Silverstone, Monza, Spa, Mexico, and Monaco with live-calibrated lap times and top speeds

### 📊 Dashboard
- **Full team × circuit analysis** — select any of the 11 constructors and 24 circuits
- **Performance radar charts** — Top Speed, Downforce, MGU-K Efficiency, Chassis Agility, Active Aero Response, MOM Potency
- **Component efficiency bar charts** — Front Wing, Rear Wing, Floor, Sidepods, Diffuser, Halo
- **Dynamic power curve visualization** — ICE vs MGU-K power delivery across 7 speed points, showing electrical derating behavior
- **AI-powered engineering diagnostics** — team-specific strengths and weaknesses at each circuit

### 🔬 Telemetry & Simulation
- **120-point distance-synchronized telemetry traces** — Speed, Lateral G, Longitudinal G, Brake Pressure, Throttle %, DRS/Active Aero state, Energy Harvesting
- **Delta overlay mode** — Compare any two driver/team combinations head-to-head with cumulative time delta trace
- **Full environment controls** — Track temp, air temp, surface condition (dry/damp/wet), rubbering-in level, wind vector, stint lap wear progression
- **All 5 Pirelli compounds** modeled with non-linear thermal grip windows, wear degradation curves, and graining tendency
- **Real circuit layouts** — Authentic corner positions, apex speeds, lateral G profiles, and straight sections for all 24 tracks

### 📜 2026 Regulations Reference
- **5 regulation deep-dives** — Active Aerodynamics, Power Unit Evolution, Lighter & Agile Chassis, 100% Sustainable Fuels, Next-Gen Safety
- **2025 vs 2026 comparison table** — 15 parameters side-by-side with delta calculations
- **Full 11-team constructor grid** with power unit partnerships, aero philosophy, and chassis focus

### 🔐 Authentication
- Google Sign-In via Firebase Authentication

---

## ⚙️ 2026 Regulations Modeled

| Regulation Area | 2025 Spec | 2026 Spec | Change |
|:---|:---|:---|:---|
| **MGU-K Electric Power** | 120 kW (160 HP) | 350 kW (469 HP) | +191.6% |
| **ICE Combustion Power** | ~560 kW (750 HP) | 400 kW (536 HP) | -28.5% |
| **Total Combined Power** | ~680 kW (910 HP) | 750 kW (1,005+ HP) | +10.4% |
| **Active Aero** | DRS rear flap only | Dual-Mode Z/X front & rear wings | Full morphing aero |
| **MGU-H** | Active on turbo shaft | Removed | Simplified architecture |
| **Minimum Car Mass** | 798 kg | 768 kg | -30 kg |
| **Fuel** | E10 (10% ethanol) | 100% sustainable e-fuel | Net-zero carbon |
| **Energy Recovery / Lap** | 2.0 MJ | 8.5 MJ | +325% |
| **Overtaking Aid** | DRS (+10-12 km/h) | MOM push-to-pass (+190 kW boost) | Electrical advantage |

---

## 💻 Tech Stack

### Frontend
| Technology | Purpose |
|:---|:---|
| React 18.2 | UI framework |
| Vite 4.5 | Build tool & dev server |
| React Router DOM 6.8 | Client-side routing |
| Recharts 2.15 | Data visualization (telemetry traces, bar charts, radar) |
| Framer Motion 10.16 | Animations |
| Lucide React | Icon library |
| Firebase 10.7 | Authentication (Google Sign-In) |

### Backend
| Technology | Purpose |
|:---|:---|
| FastAPI 0.104 | REST API framework |
| Uvicorn 0.24 | ASGI server |
| Pydantic 2.4 | Data validation |
| NumPy / SciPy | Numerical physics computations |
| FastF1 3.0+ | Official F1 telemetry data |

### Physics & Simulation
| Module | Purpose |
|:---|:---|
| `season_2026_physics.py` | Team profiles, circuit profiles, lap time simulation, power curves |
| `comprehensive_telemetry_engine.py` | 120-point telemetry trace generation, tyre grip model, driver profiles |
| `aerodynamics.py` | Drag/lift coefficient calculations, active aero transitions |
| `circuit_analyzer_improved.py` | Corner-by-corner performance analysis |
| `lap_time_simulator.py` | Sector-based lap time prediction |

---

## 📁 Project Structure

```
Aero-Velocity/
├── Main/                                   # Frontend (React + Vite)
│   ├── public/
│   │   ├── car.png                         # 2026 F1 car hero image
│   │   ├── tire-1.png ... tire-5.png       # Pirelli compound images
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx / .css           # Navigation bar (AERO VELOCITY 2026 FIA)
│   │   │   ├── TelemetryWorkbench.jsx/.css # Full telemetry trace suite
│   │   │   ├── AuthButton.jsx / .css       # Firebase auth button
│   │   │   └── ...                         # Other UI components
│   │   ├── pages/
│   │   │   ├── Home.jsx / .css             # Hero + car + tyres + circuit inspector
│   │   │   ├── Dashboard.jsx / .css        # Team × circuit analysis dashboard
│   │   │   ├── Simulate.jsx / .css         # Telemetry & simulation page
│   │   │   ├── Regulations2026.jsx / .css  # 2026 regulations reference
│   │   │   └── Auth/                       # Authentication pages
│   │   ├── services/
│   │   │   └── mlService.js                # Backend API client
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # Auth state management
│   │   ├── config/
│   │   │   └── firebase.js                 # Firebase configuration
│   │   ├── App.jsx                         # Root component & routes
│   │   └── main.jsx                        # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── F1Hackathon-main/                       # Backend (FastAPI + Physics Engine)
│   ├── api/
│   │   └── server.py                       # FastAPI server (all endpoints)
│   ├── physics/
│   │   ├── season_2026_physics.py          # 11 team profiles, 24 circuit profiles,
│   │   │                                   # lap time sim, power curves, diagnostics
│   │   ├── comprehensive_telemetry_engine.py # Telemetry trace generator, tyre model,
│   │   │                                   # driver profiles, 24 circuit layouts
│   │   ├── aerodynamics.py                 # Aero coefficient calculations
│   │   ├── lap_time_simulator.py           # Sector-based lap time model
│   │   ├── circuit_analyzer.py             # Base circuit analysis
│   │   └── circuit_analyzer_improved.py    # Enhanced corner analysis
│   ├── analysis/
│   │   ├── component_analyzer.py           # Aero component efficiency analysis
│   │   ├── corner_performance_analyzer.py  # Corner-by-corner breakdown
│   │   └── team_comparison_analyzer.py     # Head-to-head team comparison
│   ├── ml_models/
│   │   ├── performance_estimator.py        # ML performance prediction
│   │   ├── aero_predictor.py               # Aerodynamic prediction model
│   │   └── upgrade_recommender.py          # Upgrade recommendation engine
│   ├── data/
│   │   └── fastf1_telemetry_loader.py      # FastF1 API integration
│   ├── computer_vision/
│   │   └── car_analyzer.py                 # Car image analysis
│   ├── config/
│   │   ├── settings.py                     # General settings
│   │   └── track_configs.py                # 24 track configurations
│   └── requirements.txt                    # Python dependencies
│
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** ≥ 16.0
- **Python** ≥ 3.10
- **npm** package manager
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/neelabh16/Aero-Velocity.git
cd Aero-Velocity
```

### 2. Frontend Setup

```bash
cd Main
npm install
```

### 3. Backend Setup

```bash
cd ../F1Hackathon-main

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file inside the `Main/` directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

> Get these values from [Firebase Console](https://console.firebase.google.com/) → Project Settings → Your Apps → Web.

---

## 🎮 Usage

### Start Both Servers

**Terminal 1 — Backend API (port 5000):**
```bash
cd F1Hackathon-main/api
python server.py
```

**Terminal 2 — Frontend Dev Server (port 5173):**
```bash
cd Main
npm run dev
```

### Access the Application

| Service | URL |
|:---|:---|
| **Frontend** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:5000](http://localhost:5000) |
| **API Docs (Swagger)** | [http://localhost:5000/docs](http://localhost:5000/docs) |

---

## 📡 API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Health check & system status |
| `GET` | `/api/season-2026/specs` | Full 2026 regulation specs for all 11 teams |
| `GET` | `/api/tracks` | All 24 circuit profiles |
| `GET` | `/api/tracks/profiles` | Detailed track physics profiles |
| `GET` | `/api/drivers/ratings` | All 22 driver ratings & telemetry tendencies |
| `GET` | `/api/pirelli/compounds` | 5 Pirelli compound specifications |
| `POST` | `/api/analyze/team` | Team × circuit physics analysis |
| `POST` | `/api/analyze/components` | Component efficiency breakdown |
| `POST` | `/api/simulate/lap` | Full lap simulation |
| `POST` | `/api/simulate/circuit` | Circuit-specific analysis |
| `POST` | `/api/compare/teams` | Head-to-head team comparison |
| `POST` | `/api/predict/performance` | ML performance prediction |
| `POST` | `/api/upgrades/recommend` | Upgrade recommendations |
| `POST` | `/api/telemetry/simulate-lap` | 120-point telemetry trace |
| `POST` | `/api/telemetry/compare-drivers` | Driver vs driver telemetry overlay |
| `GET` | `/api/corner-performance/{track}` | Corner-by-corner analysis |
| `GET` | `/api/fastf1/track-info/{track}` | FastF1 reference data |

---

## 🔧 Physics Engine

The simulation is powered by two core physics modules:

### `season_2026_physics.py`
- **11 team profiles** with individual ICE power (kW), MGU-K power, derate speed, Cd (X-Mode drag), CL (Z-Mode downforce), chassis agility score, MGU-K harvesting efficiency, active aero response time, and tyre degradation multiplier
- **24 circuit profiles** with real pole reference times, altitude, air density, corner count, longest straight, full-throttle %, power sensitivity, aero drag sensitivity, and chassis agility sensitivity
- **Lap time calculation** using deficit/surplus formulation against the season benchmark (Mercedes W17), accounting for power deficit, drag penalty, derating penalty, cornering downforce advantage/deficit, and chassis agility
- **Top speed simulation** with thin-air boost, power modulation, drag modulation, and electrical clipping penalties
- **Dynamic power curves** (ICE vs MGU-K across 7 speed points) showing realistic derating behavior

### `comprehensive_telemetry_engine.py`
- **22 driver profiles** with braking aggression, apex commitment, throttle modulation, tyre management, wet weather skill, and qualifying pace delta
- **5 Pirelli compound models** with non-linear thermal grip (parabolic optimum + cold/hot penalties), progressive wear degradation, and graining tendency
- **Barometric air density** calculation at altitude (ISA atmosphere model)
- **Authentic circuit geometry** for all 24 tracks — real corner positions, apex speeds, lateral G values, and straight sections
- **120-point telemetry generation** with corner approach braking zones, apex zones, corner exit traction, and straight acceleration with realistic turbo/electrical clipping on long straights

---

## 📄 License

This project is part of a hackathon submission. All rights reserved.

---

<div align="center">

**Built with ❤️ for the future of Formula 1**

*AeroVelocity — Where Physics Meets the Fast Lane*

</div>
