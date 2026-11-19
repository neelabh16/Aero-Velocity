import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Gauge,
  Wind,
  Zap,
  Layers,
  ChevronRight,
  BarChart2,
  Shield,
  ArrowUpRight,
  Cpu,
  Flame,
  Sliders,
  Database,
  CheckCircle2,
  ArrowRight,
  Thermometer
} from 'lucide-react';
import './Home.css';

// 5 Key Circuit Archetypes with FastF1 real benchmarks & 2026 calibrated physics
const PREVIEW_CIRCUITS = {
  Silverstone: {
    officialName: 'Silverstone Circuit',
    country: 'Great Britain',
    type: 'High-Speed Flowing',
    length: '5.891 km',
    corners: 18,
    longestStraight: '1,030 m',
    altitude: '153 m',
    fastf1Pole: '1:25.819',
    mercedesSimLap: '1:25.991',
    mercedesTopSpeed: '347.3 km/h',
    peakLatG: '5.4 G Lat',
    activeXModeZones: '38.5%',
    challengerDriver: 'Max Verstappen',
    challengerTeam: 'Red Bull Ford',
    challengerColor: '#1E41FF',
    challengerLap: '1:26.168',
    challengerDelta: '+0.177s',
    challengeNote: 'Extreme aerodynamic loading through Maggotts, Becketts and Chapel testing high-downforce Z-Mode wing deflection.'
  },
  Monza: {
    officialName: 'Autodromo Nazionale Monza',
    country: 'Italy',
    type: 'Temple of Speed',
    length: '5.793 km',
    corners: 11,
    longestStraight: '1,120 m',
    altitude: '183 m',
    fastf1Pole: '1:19.327',
    mercedesSimLap: '1:19.933',
    mercedesTopSpeed: '365.1 km/h',
    peakLatG: '4.8 G Lat',
    activeXModeZones: '58.2%',
    challengerDriver: 'Max Verstappen',
    challengerTeam: 'Red Bull Ford',
    challengerColor: '#1E41FF',
    challengerLap: '1:20.158',
    challengerDelta: '+0.225s',
    challengeNote: 'Maximum straightline velocity in low-drag X-Mode (365 km/h). Ferrari severely penalized (+0.98s, 349 km/h) due to smaller turbo & 282 km/h clipping.'
  },
  Spa: {
    officialName: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    type: 'High Compression & Power',
    length: '7.004 km',
    corners: 19,
    longestStraight: '1,800 m',
    altitude: '410 m',
    fastf1Pole: '1:43.160',
    mercedesSimLap: '1:43.918',
    mercedesTopSpeed: '366.3 km/h',
    peakLatG: '5.4 G Lat',
    activeXModeZones: '54.0%',
    challengerDriver: 'Lando Norris',
    challengerTeam: 'McLaren',
    challengerColor: '#FF8000',
    challengerLap: '1:44.205',
    challengerDelta: '+0.287s',
    challengeNote: 'Massive vertical G compression through Eau Rouge and Raidillon climbing onto the flat-out Kemmel Straight.'
  },
  Mexico: {
    officialName: 'Autódromo Hermanos Rodríguez',
    country: 'Mexico',
    type: 'High Altitude Thin Air',
    length: '4.304 km',
    corners: 17,
    longestStraight: '1,200 m',
    altitude: '2,285 m',
    fastf1Pole: '1:15.946',
    mercedesSimLap: '1:15.759',
    mercedesTopSpeed: '350.3 km/h',
    peakLatG: '5.2 G Lat',
    activeXModeZones: '44.0%',
    challengerDriver: 'Max Verstappen',
    challengerTeam: 'Red Bull Ford',
    challengerColor: '#1E41FF',
    challengerLap: '1:16.083',
    challengerDelta: '+0.324s',
    challengeNote: 'Thin air (rho = 0.985 kg/m³) yields 350+ km/h top speeds while severely punishing power unit turbochargers and battery thermal headroom.'
  },
  Monaco: {
    officialName: 'Circuit de Monaco',
    country: 'Monaco',
    type: 'Maximum Downforce Street',
    length: '3.337 km',
    corners: 19,
    longestStraight: '580 m',
    altitude: '15 m',
    fastf1Pole: '1:10.270',
    mercedesSimLap: '1:09.669',
    mercedesTopSpeed: '287.2 km/h',
    peakLatG: '4.2 G Lat',
    activeXModeZones: '18.5%',
    challengerDriver: 'Charles Leclerc',
    challengerTeam: 'Ferrari',
    challengerColor: '#E80020',
    challengerLap: '1:09.568',
    challengerDelta: '-0.101s (Pole)',
    challengeNote: 'Ferrari SF-26 dominates with class-highest 3.25 CL cornering downforce and mechanical agility, taking Pole pace over Mercedes.'
  }
};

// 5 Pirelli 2026 Compounds with actual image assets
const PIRELLI_TYRE_SPECS = [
  {
    code: 'C4 / C5 SOFT',
    name: 'Pirelli P-Zero Red',
    role: 'Qualifying & Low-Fuel Sprint',
    image: '/tire-1.png',
    color: '#FF0040',
    glow: 'rgba(255, 0, 64, 0.22)',
    friction: 'µ = 1.98',
    tempWindow: '90°C – 120°C',
    stintLife: '12 – 16 Laps',
    paceDelta: '-0.45s / lap'
  },
  {
    code: 'C3 MEDIUM',
    name: 'Pirelli P-Zero Yellow',
    role: 'Optimal Race Stint Balance',
    image: '/tire-2.png',
    color: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.22)',
    friction: 'µ = 1.88',
    tempWindow: '100°C – 130°C',
    stintLife: '22 – 28 Laps',
    paceDelta: 'Baseline (0.00s)'
  },
  {
    code: 'C1 / C2 HARD',
    name: 'Pirelli P-Zero White',
    role: 'High Abrasion Endurance',
    image: '/tire-3.png',
    color: '#FFFFFF',
    glow: 'rgba(255, 255, 255, 0.18)',
    friction: 'µ = 1.76',
    tempWindow: '110°C – 140°C',
    stintLife: '34 – 42 Laps',
    paceDelta: '+0.55s / lap'
  },
  {
    code: 'INTERMEDIATE',
    name: 'Cinturato Green',
    role: 'Damp Surface & Clearing Water',
    image: '/tire-4.png',
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.22)',
    friction: 'µ = 1.58',
    tempWindow: '65°C – 92°C',
    stintLife: '30L/sec water clear',
    paceDelta: '+4.20s in wet'
  },
  {
    code: 'FULL WET',
    name: 'Cinturato Blue',
    role: 'Monsoon Standing Water',
    image: '/tire-5.png',
    color: '#0066FF',
    glow: 'rgba(0, 102, 255, 0.22)',
    friction: 'µ = 1.42',
    tempWindow: '50°C – 80°C',
    stintLife: '85L/sec water clear',
    paceDelta: '+8.50s in wet'
  }
];

const Home = () => {
  const [selectedCircuitKey, setSelectedCircuitKey] = useState('Silverstone');
  const activeCircuit = PREVIEW_CIRCUITS[selectedCircuitKey];

  return (
    <div className="home-container">
      {/* Background Ambience */}
      <div className="home-bg-canvas">
        <div className="home-bg-grid" />
      </div>

      <div className="home-content-wrap">
        {/* ====================================================================
           HERO SECTION WITH INTEGRATED 2026 F1 CAR
           ==================================================================== */}
        <section className="home-hero-split">
          {/* Left Column: Technical Narrative & Controls */}
          <div>
            {/* Header Badges */}
            <div className="hero-badge-row">
              <span className="hero-pill-primary">
                <span className="pulse-dot" /> FIA 2026 TECHNICAL REGULATIONS
              </span>
              <span className="hero-pill-secondary">
                <Database size={13} color="#00d4ff" /> FastF1 Telemetry Engine
              </span>
              <span className="hero-pill-secondary">
                <Cpu size={13} color="#10b981" /> 750kW Hybrid · Z &amp; X Mode
              </span>
            </div>

            {/* Headline */}
            <h1 className="home-hero-title">
              Formula 1 2026 <br />
              <span className="highlight-cyan">Technical &amp; Telemetry Suite</span>
            </h1>

            {/* Description */}
            <p className="home-hero-desc">
              High-fidelity aerodynamics, 50% electrical MGU-K powertrain dynamics, and distance-synchronized MoTeC / ATLAS telemetry calibrated across all 24 Grand Prix circuits.
            </p>

            {/* Action Buttons */}
            <div className="hero-cta-group">
              <Link to="/simulate" className="btn-primary-f1">
                <Activity size={16} /> Launch Telemetry &amp; Sim <ArrowRight size={15} />
              </Link>
              <Link to="/dashboard" className="btn-secondary-f1">
                <Gauge size={16} color="#00d4ff" /> 2026 Team Dynamics
              </Link>
              <Link to="/regulations-2026" className="btn-tertiary-f1">
                Regulations Spec <ChevronRight size={15} />
              </Link>
            </div>

            {/* Key 2026 Metrics Grid */}
            <div className="hero-metrics-grid">
              <div className="hero-metric-cell">
                <div className="label"><Zap size={12} color="#00d4ff" /> Powertrain</div>
                <div className="val">750 kW</div>
                <div className="sub">400kW ICE + 350kW MGU-K</div>
              </div>

              <div className="hero-metric-cell">
                <div className="label"><Wind size={12} color="#38bdf8" /> X-Mode Drag</div>
                <div className="val">-55.0%</div>
                <div className="sub">Active Wing Straight Morph</div>
              </div>

              <div className="hero-metric-cell">
                <div className="label"><Layers size={12} color="#10b981" /> Min Mass</div>
                <div className="val">768 kg</div>
                <div className="sub">-30 kg from 2025 chassis</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visually Stunning Integrated 2026 F1 Car */}
          <div className="hero-car-stage">
            <div className="car-glow-backdrop" />
            
            <div className="car-image-wrapper">
              <img
                src="/car.png"
                alt="2026 Formula 1 Active Aero Car"
                className="hero-f1-car-img"
              />
              <div className="car-ground-shadow" />
            </div>

            {/* Interactive Callout Badges on the Car */}
            <div className="car-callouts-strip">
              <div className="car-callout-item">
                <div className="callout-indicator-dot" />
                <div>
                  <div className="callout-title">Active Front Wing</div>
                  <div className="callout-detail">24° Z-Mode → 11° X-Mode (160ms)</div>
                </div>
              </div>

              <div className="car-callout-item">
                <div className="callout-indicator-dot" />
                <div>
                  <div className="callout-title">Narrow Floor Venturi</div>
                  <div className="callout-detail">150mm narrower floor (-30% ground effect)</div>
                </div>
              </div>

              <div className="car-callout-item">
                <div className="callout-indicator-dot" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <div>
                  <div className="callout-title">350kW MGU-K Core</div>
                  <div className="callout-detail">8.5 MJ/lap regen &amp; MOM boost</div>
                </div>
              </div>

              <div className="car-callout-item">
                <div className="callout-indicator-dot" style={{ background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                <div>
                  <div className="callout-title">Active Rear Flap</div>
                  <div className="callout-detail">Dual-mode low drag wing shedding</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
           PIRELLI 2026 TYRE DYNAMICS & THERMAL SUITE (5 REAL TYRE IMAGES)
           ==================================================================== */}
        <section className="home-section-spacing">
          <div className="section-headline-group">
            <span className="section-tag">Pirelli 2026 Tyre Dynamics</span>
            <h2 className="section-main-title">Official Compounds &amp; Thermal Grip Windows</h2>
            <p className="section-lead-text">
              Each compound is calibrated with realistic friction coefficients (µ), thermal operating windows, 
              and asphalt abrasion wear curves used throughout the MoTeC and ATLAS telemetry engine.
            </p>
          </div>

          {/* 5-Column Tyre Showcase */}
          <div className="tyre-showcase-grid">
            {PIRELLI_TYRE_SPECS.map((tyre) => (
              <div
                key={tyre.code}
                className="tyre-card-f1"
                style={{
                  '--compound-color': tyre.color,
                  '--compound-glow': tyre.glow
                }}
              >
                {/* Tyre Image with Ambient Rim Glow */}
                <div className="tyre-image-holder">
                  <div className="tyre-ambient-ring" />
                  <img
                    src={tyre.image}
                    alt={tyre.name}
                    className="tyre-render-img"
                  />
                </div>

                {/* Badge & Info */}
                <span className="tyre-code-pill">{tyre.code}</span>
                <h4 className="tyre-compound-name">{tyre.name}</h4>
                <div className="tyre-compound-role">{tyre.role}</div>

                {/* Technical Specs Rows */}
                <div className="tyre-specs-table">
                  <div className="tyre-spec-row">
                    <span className="k">Friction Coeff:</span>
                    <span className="v" style={{ color: tyre.color }}>{tyre.friction}</span>
                  </div>
                  <div className="tyre-spec-row">
                    <span className="k">Operating Window:</span>
                    <span className="v">{tyre.tempWindow}</span>
                  </div>
                  <div className="tyre-spec-row">
                    <span className="k">Stint Life:</span>
                    <span className="v">{tyre.stintLife}</span>
                  </div>
                  <div className="tyre-spec-row">
                    <span className="k">Pace Delta:</span>
                    <span className="v" style={{ color: '#00d4ff' }}>{tyre.paceDelta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================
           INTERACTIVE CIRCUIT TELEMETRY SHOWCASE
           ==================================================================== */}
        <section className="home-section-spacing">
          <div className="section-headline-group">
            <span className="section-tag">Interactive Circuit Telemetry Inspector</span>
            <h2 className="section-main-title">FastF1 Track Geometry &amp; 2026 Lap Simulation</h2>
            <p className="section-lead-text">
              Toggle across key circuits to observe how 2026 active wings, thin air altitude, and power sensitivities 
              determine terminal velocity and lap time deltas.
            </p>
          </div>

          <div className="interactive-track-wrapper">
            {/* Track Selector Tabs */}
            <div className="track-tabs-row">
              {Object.keys(PREVIEW_CIRCUITS).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedCircuitKey(key)}
                  className={`track-tab-btn ${selectedCircuitKey === key ? 'active' : ''}`}
                >
                  {key} ({PREVIEW_CIRCUITS[key].country})
                </button>
              ))}
            </div>

            {/* Track Data Display */}
            <div className="track-data-display">
              {/* Left Column: Track Specs */}
              <div className="track-summary-panel">
                <div className="track-title-row">
                  <div>
                    <div className="track-name-big">{activeCircuit.officialName}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{activeCircuit.country}</div>
                  </div>
                  <span className="track-type-tag">{activeCircuit.type}</span>
                </div>

                <div className="track-stats-grid">
                  <div className="stat-box-mini">
                    <div className="stat-box-label">Track Length</div>
                    <div className="stat-box-val">{activeCircuit.length}</div>
                  </div>
                  <div className="stat-box-mini">
                    <div className="stat-box-label">FastF1 Pole Benchmark</div>
                    <div className="stat-box-val" style={{ color: '#38bdf8' }}>{activeCircuit.fastf1Pole}</div>
                  </div>
                  <div className="stat-box-mini">
                    <div className="stat-box-label">Longest Straight</div>
                    <div className="stat-box-val">{activeCircuit.longestStraight}</div>
                  </div>
                  <div className="stat-box-mini">
                    <div className="stat-box-label">Peak Lateral G Load</div>
                    <div className="stat-box-val" style={{ color: '#10b981' }}>{activeCircuit.peakLatG}</div>
                  </div>
                </div>

                <div className="track-challenge-note">
                  <strong>Aerodynamic Challenge:</strong> {activeCircuit.challengeNote}
                </div>
              </div>

              {/* Right Column: 2026 Head-to-Head Comparison Preview */}
              <div className="comparison-live-card">
                <div>
                  <div className="comp-header-label">
                    <span>2026 Head-to-Head Simulation</span>
                    <span style={{ color: '#00d4ff' }}>X-Mode: {activeCircuit.activeXModeZones} of lap</span>
                  </div>

                  {/* P1 Leader (Mercedes) */}
                  <div className="driver-lap-row p1-leader">
                    <div className="driver-badge-info">
                      <div className="team-color-bar" style={{ background: '#00D2BE' }} />
                      <div>
                        <div className="driver-name-text">George Russell <span style={{ fontSize: '11px', color: '#00D2BE', fontWeight: 800 }}>P1 BENCHMARK</span></div>
                        <div className="driver-team-text">Mercedes W17 · Mercedes-AMG Works M17</div>
                      </div>
                    </div>
                    <div className="lap-time-badge">
                      <div className="lap-time-digits">{activeCircuit.mercedesSimLap}</div>
                      <div className="lap-delta-tag delta-green">{activeCircuit.mercedesTopSpeed} Top Speed</div>
                    </div>
                  </div>

                  {/* P2 Challenger */}
                  <div className="driver-lap-row p2-challenger">
                    <div className="driver-badge-info">
                      <div className="team-color-bar" style={{ background: activeCircuit.challengerColor }} />
                      <div>
                        <div className="driver-name-text">{activeCircuit.challengerDriver}</div>
                        <div className="driver-team-text">{activeCircuit.challengerTeam}</div>
                      </div>
                    </div>
                    <div className="lap-time-badge">
                      <div className="lap-time-digits">{activeCircuit.challengerLap}</div>
                      <div className="lap-delta-tag delta-red">{activeCircuit.challengerDelta}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Link
                    to="/simulate"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#00d4ff',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Open Full Multi-Channel MoTeC Trace <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
           CORE TECHNICAL MODULES
           ==================================================================== */}
        <section className="home-section-spacing">
          <div className="section-headline-group">
            <span className="section-tag">Engineering Modules</span>
            <h2 className="section-main-title">Rigorous Mathematical Physics Engines</h2>
            <p className="section-lead-text">
              Every telemetry channel is governed by authentic aerodynamic formulas, boundary-layer thermodynamics, and powertrain power curves.
            </p>
          </div>

          <div className="tech-modules-grid">
            {/* Module 1 */}
            <div className="tech-module-card">
              <div className="tech-module-top">
                <div className="module-icon-wrap" style={{ background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff' }}>
                  <Wind size={20} />
                </div>
                <h3 className="module-card-title">Dual-Mode Active Aerodynamics</h3>
                <p className="module-card-desc">
                  Replaces DRS with front and rear wing morphing surfaces. Calculates dynamic transitions between high-downforce Z-Mode (Cl=3.16) and low-drag X-Mode (Cd=0.522).
                </p>
                <ul className="module-specs-list">
                  <li><CheckCircle2 size={13} color="#10b981" /> Sub-160ms active flap actuation latency</li>
                  <li><CheckCircle2 size={13} color="#10b981" /> Narrow floor ground effect boundary model</li>
                  <li><CheckCircle2 size={13} color="#10b981" /> 55% parasitic drag shedding on straights</li>
                </ul>
              </div>
              <Link to="/simulate" className="module-card-link">
                Simulate Active Flap Physics <ChevronRight size={14} />
              </Link>
            </div>

            {/* Module 2 */}
            <div className="tech-module-card">
              <div className="tech-module-top">
                <div className="module-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                  <Zap size={20} />
                </div>
                <h3 className="module-card-title">50/50 Hybrid &amp; MOM Boost</h3>
                <p className="module-card-desc">
                  Models the 350kW MGU-K motor generator and 400kW internal combustion engine, including Manual Override Mode (MOM) push-to-pass delivery up to 337 km/h.
                </p>
                <ul className="module-specs-list">
                  <li><CheckCircle2 size={13} color="#10b981" /> 4.0MJ Energy Storage cell state-of-charge</li>
                  <li><CheckCircle2 size={13} color="#10b981" /> 8.5MJ/lap maximum regenerative braking</li>
                  <li><CheckCircle2 size={13} color="#10b981" /> High-speed electrical power derate curves</li>
                </ul>
              </div>
              <Link to="/dashboard" className="module-card-link">
                Inspect Powertrain Dynamics <ChevronRight size={14} />
              </Link>
            </div>

            {/* Module 3 */}
            <div className="tech-module-card">
              <div className="tech-module-top">
                <div className="module-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <Flame size={20} />
                </div>
                <h3 className="module-card-title">Pirelli Thermal Windows</h3>
                <p className="module-card-desc">
                  Simulates grip multipliers across Pirelli C1–C5 slick, intermediate, and wet compounds based on asphalt abrasion, track temperature, and scrub heat buildup.
                </p>
                <ul className="module-specs-list">
                  <li><CheckCircle2 size={13} color="#10b981" /> 35-lap non-linear stint tyre degradation</li>
                  <li><CheckCircle2 size={13} color="#10b981" /> 4-wheel independent corner temperature traces</li>
                  <li><CheckCircle2 size={13} color="#10b981" /> Graining and blistering window calculation</li>
                </ul>
              </div>
              <Link to="/simulate" className="module-card-link">
                View Tyre Thermal Curves <ChevronRight size={14} />
              </Link>
            </div>

            {/* Module 4 */}
            <div className="tech-module-card">
              <div className="tech-module-top">
                <div className="module-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <BarChart2 size={20} />
                </div>
                <h3 className="module-card-title">FastF1 Telemetry Synchronization</h3>
                <p className="module-card-desc">
                  Calibrated against official FastF1 timing and GPS data. Synchronizes distance-based telemetry channels to enable professional MoTeC and ATLAS delta traces.
                </p>
                <ul className="module-specs-list">
                  <li><CheckCircle2 size={13} color="#10b981" /> 10Hz spatial distance synchronization</li>
                  <li><CheckCircle2 size={13} color="#10b981" /> Head-to-head continuous delta time trace</li>
                  <li><CheckCircle2 size={13} color="#10b981" /> Micro-sector speed trap comparisons</li>
                </ul>
              </div>
              <Link to="/simulate" className="module-card-link">
                Compare Drivers Head-to-Head <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ====================================================================
           CLEAN ENGINEERING FOOTER
           ==================================================================== */}
        <footer className="home-footer-clean">
          <div>
            <div className="footer-brand-text">AERO VELOCITY · FIA 2026 COMPUTATIONAL SUITE</div>
            <div className="footer-brand-sub">
              Engineering intelligence, active aerodynamics simulation, and FastF1 telemetry modeling.
            </div>
          </div>

          <div className="footer-nav-clean">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/simulate">Telemetry &amp; Sim</Link>
            <Link to="/regulations-2026">2026 Regulations</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
