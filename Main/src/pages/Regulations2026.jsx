import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wind,
  Zap,
  Gauge,
  Layers,
  Fuel,
  Shield,
  Activity,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  RefreshCw,
  Info,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import './Regulations2026.css';

// 2026 Technical Regulation Pillars
const REGULATION_PILLARS = [
  {
    id: 'aero',
    title: 'Dual-Mode Active Aerodynamics',
    category: 'Aerodynamics',
    badge: 'Z-Mode & X-Mode',
    icon: <Wind size={22} color="#00d4ff" />,
    color: '#00d4ff',
    summary: 'Abolition of DRS in favor of active front and rear wings that morph between high-downforce cornering and low-drag straightline modes.',
    technicalSpecs: [
      { label: 'Z-Mode Cornering', value: 'High Downforce (CL ≈ 2.95, CD ≈ 1.15)', desc: 'Full flap deployment for maximum apex grip and braking stability' },
      { label: 'X-Mode Straightline', value: 'Low Drag (CL ≈ 1.20, CD ≈ 0.54)', desc: '-55% drag drop via opening active front and rear wing flaps' },
      { label: 'DRS Status', value: 'Permanently Eliminated', desc: 'Replaced by automatic active aero and MOM electrical boost' },
      { label: 'Floor Dimensions', value: '150mm Narrower (1,350mm)', desc: 'Simplified flat floor design to completely eradicate ground-effect porpoising' }
    ],
    mathFormula: 'F_drag(v) = 0.5 · ρ · v² · S · [C_D0(Mode) + C_L² / (π·AR·e) + C_D,tyres]',
    formulaDesc: 'In X-Mode, C_D drops from 1.15 to 0.54, eliminating over 400 kW (~540 HP) of aerodynamic drag power at 320 km/h.'
  },
  {
    id: 'powertrain',
    title: '50/50 Hybrid Power Unit Architecture',
    category: 'Powertrain',
    badge: '350kW MGU-K',
    icon: <Zap size={22} color="#8b5cf6" />,
    color: '#8b5cf6',
    summary: 'A massive 3x increase in electrical power output to 350kW (469 HP), matched to a 400kW (536 HP) 1.6L V6 turbocharged combustion engine.',
    technicalSpecs: [
      { label: 'Total Output', value: '750 kW (1,005+ HP)', desc: 'Near 50/50 balance between internal combustion and electric power' },
      { label: 'MGU-K Output', value: '350 kW (469 HP)', desc: 'Triple the 120kW electrical power limit of the 2025 regulations' },
      { label: 'ICE Power Output', value: '400 kW (536 HP)', desc: 'Reduced from ~560 kW to accommodate fuel flow energy caps' },
      { label: 'MGU-H Status', value: 'Completely Removed', desc: 'Eliminated to reduce development costs and invite new engine manufacturers' }
    ],
    mathFormula: 'P_total(v) = P_ICE(400kW) + P_MGUK(v, MOM) · η_elec',
    formulaDesc: 'Electrical energy harvesting is doubled to 8.5 MJ/lap through aggressive regenerative braking into a 4.0 MJ usable buffer.'
  },
  {
    id: 'mom',
    title: 'Manual Override Mode (MOM)',
    category: 'Powertrain',
    badge: 'Push-To-Pass Boost',
    icon: <Cpu size={22} color="#ec4899" />,
    color: '#ec4899',
    summary: 'A tactical push-to-pass electric deployment system replacing DRS for combat overtaking on straights.',
    technicalSpecs: [
      { label: 'Boost Window', value: 'Full 350kW up to 337 km/h', desc: 'Allows the chasing car to maintain full electric power past standard derate' },
      { label: 'Standard Derate', value: 'Starts at 290 km/h', desc: 'Standard engine mode progressively tapers MGU-K power down to zero at 345 km/h' },
      { label: 'MOM Taper Curve', value: '337 km/h to 355 km/h', desc: 'Linear taper providing up to 0.55s delta advantage into heavy braking zones' },
      { label: 'Activation Criteria', value: 'Within 1.0s of Lead Car', desc: 'Regulated via FIA timing loops at corner exits' }
    ],
    mathFormula: 'P_MOM(v) = 350kW  [v ≤ 337 km/h],  350kW · (1 - (v - 337)/18)  [337 < v ≤ 355 km/h]',
    formulaDesc: 'Gives the attacking driver an additional ~190 kW of electrical punch between 290 and 337 km/h.'
  },
  {
    id: 'chassis',
    title: 'Nimble Car Concept & Chassis Downsizing',
    category: 'Chassis & Mass',
    badge: '-30kg / -200mm',
    icon: <Gauge size={22} color="#10b981" />,
    color: '#10b981',
    summary: 'Reversing two decades of weight and size increases: 768kg minimum weight, shorter wheelbase, and narrower car profile for closer racing.',
    technicalSpecs: [
      { label: 'Minimum Car Mass', value: '768 kg (-30 kg vs 2025)', desc: '722 kg dry chassis mass + 46 kg narrower tyre sets' },
      { label: 'Maximum Wheelbase', value: '3,400 mm (-200 mm)', desc: 'Significantly improves mechanical rotation in medium and slow corners' },
      { label: 'Maximum Car Width', value: '1,900 mm (-100 mm)', desc: 'Creates more passing room across tight street and legacy circuits' },
      { label: 'Tyre Dimensions', value: 'Front: 280mm / Rear: 375mm', desc: '-25mm front, -30mm rear width reduction to cut aerodynamic wake turbulence' }
    ],
    mathFormula: 'I_yaw ≈ m · (l_front² + l_rear²) / 12  →  ΔI_yaw ≈ -14.2%',
    formulaDesc: 'The combined reduction in wheelbase and total mass produces a 14.2% reduction in yaw inertia, drastically improving turn-in sharpness.'
  },
  {
    id: 'fuel',
    title: '100% Sustainable Advanced E-Fuels',
    category: 'Sustainability',
    badge: 'Net-Zero Drop-In',
    icon: <Fuel size={22} color="#eab308" />,
    color: '#eab308',
    summary: 'The combustion engine will run exclusively on 100% advanced sustainable drop-in fuel synthesized from non-food bio-waste or direct carbon capture.',
    technicalSpecs: [
      { label: 'Fuel Flow Limit', value: '3,000 MJ/h Energy Cap', desc: 'Replaces previous 100 kg/h mass flow limit to incentivize chemical energy density' },
      { label: 'Carbon Origin', value: 'Non-Fossil Synthesized', desc: 'E-fuel synthesized using atmospheric CO2 or municipal agricultural waste' },
      { label: 'Thermal Efficiency', value: '> 52% Peak Efficiency', desc: 'Extremely lean burn pre-chamber ignition at ultra-high compression ratios' },
      { label: 'Combustion Sound', value: 'Authentic 1.6L V6 Turbo Scream', desc: 'Maintains iconic 15,000 RPM high-revving exhaust note without artificial synthesizers' }
    ],
    mathFormula: 'E_lap = ∫ (P_ICE / η_thermal) dt ≤ 3,000 MJ/h',
    formulaDesc: 'Teams are capped by energy flow rate (Joules per second) rather than raw fuel mass flow.'
  },
  {
    id: 'safety',
    title: 'Next-Gen Safety & Anti-Porpoising Floor',
    category: 'Safety',
    badge: 'Two-Stage Impact Cell',
    icon: <Shield size={22} color="#f43f5e" />,
    color: '#f43f5e',
    summary: 'Upgraded crash safety structures, stronger wheel tethering, brighter wet-weather LEDs, and simplified floor aerodynamics to eliminate porpoising.',
    technicalSpecs: [
      { label: 'Front Impact Structure', value: 'Two-Stage Crush Cell', desc: 'Reduces peak G-force deceleration transmitted to the driver in nose-first impacts' },
      { label: 'Intrusion Protection', value: '+100% Side Penetration Shield', desc: 'Enhanced carbon-kevlar monocoque flanks preventing T-bone penetration' },
      { label: 'Rear Wing Visibility', value: 'Ultra-Bright Endplate LEDs', desc: 'High-intensity strobe lights for zero-visibility rain conditions' },
      { label: 'Ground Effect Tuning', value: 'Flat Step-Plane Floor', desc: 'Eliminates floor stall phenomenon that caused violent porpoising bouncing in 2022-2025' }
    ],
    mathFormula: 'a_peak ≤ 40 G,  Δt_impact ≥ 45 ms',
    formulaDesc: 'Two-stage crumple zones distribute impact energy over longer duration, reducing organ trauma.'
  }
];

// 2025 vs 2026 Technical Regulations Comparison Table
const REGULATION_COMPARISON_TABLE = [
  { category: 'Aerodynamics', parameter: 'Active Flaps Mechanism', year2025: 'DRS Rear Wing Flap Only', year2026: 'Dual-Mode Active Wings (Front & Rear)', delta: 'Complete Morphing Aero' },
  { category: 'Aerodynamics', parameter: 'Cornering Downforce (Z-Mode)', year2025: 'CL ≈ 4.10 (High Ground Effect)', year2026: 'CL ≈ 2.95 (-28% Downforce)', delta: '-28.0% Floor Stall Risk Removed' },
  { category: 'Aerodynamics', parameter: 'Straightline Drag (X-Mode)', year2025: 'CD ≈ 0.85 (DRS Open)', year2026: 'CD ≈ 0.54 (X-Mode Active)', delta: '-55.0% Overall Drag Drop' },
  { category: 'Aerodynamics', parameter: 'Underbody Aerodynamics', year2025: 'Large Venturi Tunnels (Porpoising prone)', year2026: 'Narrower Floor (-150mm) Flat Step-Plane', delta: 'Zero Ground-Effect Bouncing' },
  { category: 'Powertrain', parameter: 'Electric MGU-K Power', year2025: '120 kW (160 HP)', year2026: '350 kW (469 HP)', delta: '+191.6% (Near 3x Electrical Output)' },
  { category: 'Powertrain', parameter: 'ICE Combustion Power', year2025: '~560 kW (750 HP)', year2026: '400 kW (536 HP)', delta: '-28.5% (Optimized for 50/50 split)' },
  { category: 'Powertrain', parameter: 'Total Combined Power', year2025: '~680 kW (910 HP)', year2026: '750 kW (1,005+ HP)', delta: '+10.4% Peak System Output' },
  { category: 'Powertrain', parameter: 'MGU-H (Heat Motor Generator)', year2025: 'Active on Turbocharger Shaft', year2026: 'Completely Removed from PU', delta: 'Simplified Cost & Architecture' },
  { category: 'Powertrain', parameter: 'Energy Recovery Limit per Lap', year2025: '2.0 MJ into Battery buffer', year2026: '8.5 MJ Regenerative Braking', delta: '+325% Regen Kinetic Harvesting' },
  { category: 'Overtaking', parameter: 'Straightline Overtaking Aid', year2025: 'DRS Wing Flap (+10-12 km/h)', year2026: 'Manual Override Mode (MOM) (+190 kW boost)', delta: 'Push-To-Pass Electrical Advantage' },
  { category: 'Chassis & Mass', parameter: 'Minimum Car Mass', year2025: '798 kg (with dry tyres)', year2026: '768 kg (Chassis + Tyres)', delta: '-30 kg Mass Reduction' },
  { category: 'Chassis & Mass', parameter: 'Wheelbase Maximum', year2025: '3,600 mm', year2026: '3,400 mm', delta: '-200 mm Shorter Chassis' },
  { category: 'Chassis & Mass', parameter: 'Car Total Width', year2025: '2,000 mm', year2026: '1,900 mm', delta: '-100 mm Narrower Bodywork' },
  { category: 'Chassis & Mass', parameter: 'Tyre Width (Front / Rear)', year2025: '305 mm / 405 mm', year2026: '280 mm / 375 mm', delta: '-25mm Front / -30mm Rear' },
  { category: 'Sustainability', parameter: 'Fuel Type & Composition', year2025: 'E10 (10% Ethanol / 90% Fossil)', year2026: '100% Advanced Sustainable E-Fuel', delta: '100% Net Zero Carbon' },
  { category: 'Sustainability', parameter: 'Fuel Rate Energy Limit', year2025: '100 kg/h Mass Limit', year2026: '3,000 MJ/h Energy Flow Cap', delta: 'Chemical Energy Density Capped' }
];

// Official 2026 Constructor Lineup & PU Grid (11 Teams)
const CONSTRUCTORS_2026_GRID = [
  {
    name: 'McLaren',
    engine: 'Mercedes-AMG HPP M17 E Performance',
    drivers: 'Lando Norris (#4) • Oscar Piastri (#81)',
    color: '#ff8000',
    aeroAdvantage: 'Pioneered low-latency active flap hydraulic servos (<140ms transition)',
    puStatus: 'Customer PU with optimized 350kW cooling integration',
    chassisFocus: 'Front-end mechanical bite with reduced 3,400mm wheelbase'
  },
  {
    name: 'Ferrari',
    engine: 'Ferrari 067/6 Works PU (Compact Turbo Architecture)',
    drivers: 'Charles Leclerc (#16) • Lewis Hamilton (#44)',
    color: '#e10600',
    aeroAdvantage: 'Best car in corners: Undisputed grid-leading 3.25 CL Z-Mode downforce & unmatched mechanical rotation',
    puStatus: 'Compact turbo architecture: Instant low-speed boost out of corners, but suffers early electrical derating (282 km/h) & straightline deficit',
    chassisFocus: 'Charles Leclerc & Lewis Hamilton apex rotation mastery maximizing minimum cornering speeds'
  },
  {
    name: 'Red Bull Ford',
    engine: 'Red Bull Ford Powertrains DM01',
    drivers: 'Max Verstappen (#1) • Isack Hadjar (#6)',
    color: '#0600ef',
    aeroAdvantage: 'Extreme X-Mode straightline efficiency (-56.2% drag reduction) with pull-rod rear suspension',
    puStatus: 'First Ford-partnered power unit with advanced dual-stage turbocharging (403kW ICE + 350kW MGU-K)',
    chassisFocus: 'Verstappen aggressive braking commitment paired with Hadjar qualifying pace'
  },
  {
    name: 'Mercedes-AMG',
    engine: 'Mercedes-AMG HPP M17 E Performance Works',
    drivers: 'George Russell (#63) • Kimi Antonelli (#12)',
    color: '#00d2be',
    aeroAdvantage: 'Season benchmark: Lowest X-Mode drag (Cd=0.522) with active front wing vortex cancellation',
    puStatus: 'Grid benchmark 406kW ICE + 350kW MGU-K with highest derating threshold (304 km/h) & 99.6% regen',
    chassisFocus: 'Russell championship benchmark consistency and Antonelli young generation energy deployment finesse'
  },
  {
    name: 'Aston Martin',
    engine: 'Honda HRC RA626H Factory Hybrid',
    drivers: 'Fernando Alonso (#14) • Lance Stroll (#18)',
    color: '#00665e',
    aeroAdvantage: 'Adrian Newey-designed aerodynamic surface morphing architecture',
    puStatus: 'Exclusive Honda Works partnership with bespoke battery architecture',
    chassisFocus: 'Alonso tyre thermal preservation on narrow 280/375mm Pirelli rubbers'
  },
  {
    name: 'Audi Revolut',
    engine: 'Audi F1 Factory Power Unit Neuburg',
    drivers: 'Nico Hülkenberg (#27) • Gabriel Bortoleto (#5)',
    color: '#f97316',
    aeroAdvantage: 'Clean sheet design taking over Sauber factory facilities',
    puStatus: 'German engineering powerhouse entering as 100% factory constructor',
    chassisFocus: 'Hülkenberg qualifying pace and Bortoleto young driver development'
  },
  {
    name: 'Williams Racing',
    engine: 'Mercedes-AMG HPP M17 E Performance',
    drivers: 'Alexander Albon (#23) • Carlos Sainz (#55)',
    color: '#00a0de',
    aeroAdvantage: 'Low-drag straightline efficiency carried into 2026 regulations',
    puStatus: 'Mercedes customer partnership with long-term engineering contract',
    chassisFocus: 'Sainz technical feedback and Albon wheel-to-wheel defense'
  },
  {
    name: 'Racing Bulls (RB)',
    engine: 'Red Bull Ford Powertrains DM01',
    drivers: 'Liam Lawson (#30) • Arvid Lindblad (#41)',
    color: '#6366f1',
    aeroAdvantage: 'Shared Red Bull Technology suspension and active aero actuators',
    puStatus: 'Identical Red Bull Ford power unit and energy management software',
    chassisFocus: 'Lawson racecraft with Lindblad Red Bull Junior rookie speed'
  },
  {
    name: 'Haas F1 Team',
    engine: 'Ferrari 067/1 Customer PU',
    drivers: 'Esteban Ocon (#31) • Oliver Bearman (#87)',
    color: '#b6babd',
    aeroAdvantage: 'Streamlined chassis developed in collaboration with Dallara',
    puStatus: 'Ferrari engine, transmission, and 350kW MGU-K customer components',
    chassisFocus: 'Ocon defensive prowess paired with Bearman raw overtaking pace'
  },
  {
    name: 'Alpine',
    engine: 'Renault / Mercedes Hybrid Partner',
    drivers: 'Pierre Gasly (#10) • Franco Colapinto (#43)',
    color: '#0090ff',
    aeroAdvantage: 'Optimized Enstone wind tunnel active flap aero mapping',
    puStatus: 'Transition to customer powertrain architecture for maximum reliability',
    chassisFocus: 'Colapinto aggressive braking style paired with Gasly race management'
  },
  {
    name: 'Cadillac Formula 1 Team',
    engine: 'TWG / Ferrari PU & GM Powertrain Partnership',
    drivers: 'Sergio Pérez (#11) • Valtteri Bottas (#77)',
    color: '#cbd5e1',
    aeroAdvantage: 'Brand-new 11th constructor entry with state-of-the-art US & UK facilities',
    puStatus: 'Ferrari technical power unit supply transitioning to GM factory engine',
    chassisFocus: 'Veteran lineup: Pérez tyre management + Bottas pole position speed'
  }
];

export default function Regulations2026() {
  const [activeTab, setActiveTab] = useState('pillars'); // 'pillars', 'simulator', 'comparison', 'grid'
  const [selectedPillarId, setSelectedPillarId] = useState('aero');
  const [tableCategory, setTableCategory] = useState('All');

  // Interactive Physics Aero Calculator State
  const [calcSpeedKmh, setCalcSpeedKmh] = useState(280);
  const [calcAeroMode, setCalcAeroMode] = useState('Z_MODE'); // 'Z_MODE' or 'X_MODE'
  const [calcAirDensity, setCalcAirDensity] = useState(1.205); // kg/m^3

  // Active Aero dynamic calculations
  const aeroCalc = useMemo(() => {
    const v_ms = calcSpeedKmh / 3.6;
    const cl = calcAeroMode === 'Z_MODE' ? 2.95 : 1.20;
    const cd = calcAeroMode === 'Z_MODE' ? 1.15 : 0.54;
    const s_ref = 1.30; // Frontal area (m^2)
    const q = 0.5 * calcAirDensity * (v_ms ** 2);

    const downforce_n = q * s_ref * cl;
    const drag_n = q * s_ref * cd;
    const ld_ratio = cl / cd;
    const drag_power_kw = (drag_n * v_ms) / 1000.0;

    // Savings if compared to Z-Mode at the same speed
    const z_drag_n = q * s_ref * 1.15;
    const z_power_kw = (z_drag_n * v_ms) / 1000.0;
    const power_saved_kw = Math.max(0, z_power_kw - drag_power_kw);
    const drag_drop_pct = calcAeroMode === 'X_MODE' ? 53.0 : 0.0;

    return {
      downforce_n: Math.round(downforce_n),
      drag_n: Math.round(drag_n),
      ld_ratio: ld_ratio.toFixed(2),
      drag_power_kw: drag_power_kw.toFixed(1),
      power_saved_kw: power_saved_kw.toFixed(1),
      drag_drop_pct: drag_drop_pct.toFixed(1)
    };
  }, [calcSpeedKmh, calcAeroMode, calcAirDensity]);

  const activePillar = useMemo(() => {
    return REGULATION_PILLARS.find((p) => p.id === selectedPillarId) || REGULATION_PILLARS[0];
  }, [selectedPillarId]);

  const filteredComparisonTable = useMemo(() => {
    if (tableCategory === 'All') return REGULATION_COMPARISON_TABLE;
    return REGULATION_COMPARISON_TABLE.filter((r) => r.category === tableCategory);
  }, [tableCategory]);

  return (
    <div className="reg2026-page">
      {/* Background Ambience */}
      <div className="reg2026-bg-elements">
        <div className="reg2026-speed-line reg2026-speed-line-1" />
        <div className="reg2026-speed-line reg2026-speed-line-2" />
        <div className="reg2026-speed-line reg2026-speed-line-3" />
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px 60px', position: 'relative', zIndex: 2 }}>
        {/* Header Hero */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', background: 'rgba(0, 212, 255, 0.12)', border: '1px solid rgba(0, 212, 255, 0.4)', borderRadius: '24px', marginBottom: '14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 10px #00d4ff' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00d4ff', letterSpacing: '0.08em' }}>
              OFFICIAL FIA TECHNICAL & SPORTING CODE
            </span>
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 40%, #00d4ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            2026 Formula 1 Technical Regulations
          </h1>
          <p style={{ maxWidth: '780px', margin: '0 auto', fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
            Explore the most radical overhaul in Formula 1 history: Dual-mode active wings, a 50/50 350kW hybrid split, 100% sustainable drop-in fuels, and lighter 768kg chassis architecture.
          </p>

          {/* Main Navigation Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
            {[
              { id: 'pillars', label: 'Core Technical Pillars', icon: <Layers size={15} /> },
              { id: 'simulator', label: 'Active Aero Calculator', icon: <Sliders size={15} /> },
              { id: 'comparison', label: '2025 vs 2026 Tech Matrix', icon: <Activity size={15} /> },
              { id: 'grid', label: '11 Constructors & PU Grid', icon: <Gauge size={15} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: activeTab === tab.id ? '1px solid #00d4ff' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: activeTab === tab.id ? 'rgba(0, 212, 255, 0.18)' : 'rgba(15, 23, 42, 0.8)',
                  color: activeTab === tab.id ? '#00d4ff' : '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === tab.id ? '0 0 15px rgba(0, 212, 255, 0.2)' : 'none'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: Core Technical Pillars */}
        {activeTab === 'pillars' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Pillar Selector List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Select Regulation Area
              </span>
              {REGULATION_PILLARS.map((pillar) => (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillarId(pillar.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: selectedPillarId === pillar.id ? `1px solid ${pillar.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                    background: selectedPillarId === pillar.id ? `linear-gradient(135deg, rgba(15, 23, 42, 0.95), ${pillar.color}22)` : 'rgba(15, 23, 42, 0.7)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '6px', background: `${pillar.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {pillar.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{pillar.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{pillar.badge}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color={selectedPillarId === pillar.id ? pillar.color : '#64748b'} />
                </button>
              ))}
            </div>

            {/* Active Pillar Full Details */}
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${activePillar.color}44`, borderRadius: '16px', padding: '28px', boxShadow: `0 8px 30px rgba(0, 0, 0, 0.5)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: activePillar.color, background: `${activePillar.color}20`, padding: '3px 9px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {activePillar.category}
                  </span>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '8px 0 4px' }}>
                    {activePillar.title}
                  </h2>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: activePillar.color, background: 'rgba(0, 0, 0, 0.4)', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${activePillar.color}44` }}>
                  {activePillar.badge}
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 24px' }}>
                {activePillar.summary}
              </p>

              {/* Technical Specifications Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {activePillar.technicalSpecs.map((spec, i) => (
                  <div key={i} style={{ background: 'rgba(10, 15, 26, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      {spec.label}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                      {spec.value}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                      {spec.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Physics & Mathematical Derivation Box */}
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Info size={15} color={activePillar.color} />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: activePillar.color, letterSpacing: '0.05em' }}>
                    MATHEMATICAL & PHYSICS FORMULATION
                  </span>
                </div>
                <div style={{ background: '#070a12', padding: '10px 14px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px', color: '#00d4ff', border: '1px solid rgba(0, 212, 255, 0.2)', marginBottom: '8px', overflowX: 'auto' }}>
                  {activePillar.mathFormula}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {activePillar.formulaDesc}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive Active Aero Calculator */}
        {activeTab === 'simulator' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Interactive Inputs */}
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} color="#00d4ff" /> Active Aero Kinematics
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Simulate live dynamic pressure, downforce, drag, and electrical savings across Z-Mode and X-Mode.
                </p>
              </div>

              {/* Mode Toggle */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Active Aero Wing State
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setCalcAeroMode('Z_MODE')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: calcAeroMode === 'Z_MODE' ? '1px solid #ff4060' : '1px solid rgba(255,255,255,0.1)',
                      background: calcAeroMode === 'Z_MODE' ? 'rgba(255, 64, 96, 0.25)' : 'rgba(0, 0, 0, 0.3)',
                      color: calcAeroMode === 'Z_MODE' ? '#ff4060' : '#94a3b8',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Z-MODE (Cornering)
                    <div style={{ fontSize: '10px', fontWeight: 600, opacity: 0.8, marginTop: '2px' }}>Flaps Closed (CL=2.95)</div>
                  </button>

                  <button
                    onClick={() => setCalcAeroMode('X_MODE')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: calcAeroMode === 'X_MODE' ? '1px solid #00d4ff' : '1px solid rgba(255,255,255,0.1)',
                      background: calcAeroMode === 'X_MODE' ? 'rgba(0, 212, 255, 0.25)' : 'rgba(0, 0, 0, 0.3)',
                      color: calcAeroMode === 'X_MODE' ? '#00d4ff' : '#94a3b8',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    X-MODE (Straightline)
                    <div style={{ fontSize: '10px', fontWeight: 600, opacity: 0.8, marginTop: '2px' }}>Flaps Open (CD=0.54)</div>
                  </button>
                </div>
              </div>

              {/* Speed Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Vehicle Airspeed
                  </label>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#00d4ff' }}>
                    {calcSpeedKmh} km/h ({(calcSpeedKmh / 3.6).toFixed(1)} m/s)
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="355"
                  step="5"
                  value={calcSpeedKmh}
                  onChange={(e) => setCalcSpeedKmh(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#00d4ff' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  <span>100 km/h (Apex)</span>
                  <span>250 km/h</span>
                  <span>355 km/h (Top Speed)</span>
                </div>
              </div>

              {/* Air Density Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Air Density (ρ)
                  </label>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                    {calcAirDensity} kg/m³
                  </span>
                </div>
                <input
                  type="range"
                  min="0.95"
                  max="1.25"
                  step="0.01"
                  value={calcAirDensity}
                  onChange={(e) => setCalcAirDensity(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#8b5cf6' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  <span>0.95 (Mexico City 2285m)</span>
                  <span>1.225 (Sea Level)</span>
                </div>
              </div>
            </div>

            {/* Live Outputs & Visual Analysis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Total Downforce (F_z)</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#00d4ff', marginTop: '4px' }}>
                    {aeroCalc.downforce_n.toLocaleString()} N
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Apex Tyre Vertical Loading
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Aerodynamic Drag Force (F_x)</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: calcAeroMode === 'X_MODE' ? '#10b981' : '#ff4060', marginTop: '4px' }}>
                    {aeroCalc.drag_n.toLocaleString()} N
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {calcAeroMode === 'X_MODE' ? 'Low Drag Activated' : 'High Drag Penalty'}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Lift-to-Drag Ratio (L/D)</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                    {aeroCalc.ld_ratio}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Aerodynamic Efficiency Index
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Drag Power Loss (P_drag)</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                    {aeroCalc.drag_power_kw} kW
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {(Number(aeroCalc.drag_power_kw) * 1.341).toFixed(0)} Horsepower Consumed
                  </div>
                </div>
              </div>

              {/* X-Mode Efficiency Advantage Highlight */}
              <div style={{ background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(16, 185, 129, 0.12))', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '14px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#00d4ff" /> 2026 Active Flap Energy Savings Analysis
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Drag Reduction in X-Mode:</span>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981' }}>-53.0% Drag Drop</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Power Saved vs Z-Mode at {calcSpeedKmh} km/h:</span>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#00d4ff' }}>+{aeroCalc.power_saved_kw} kW (~{(Number(aeroCalc.power_saved_kw) * 1.341).toFixed(0)} HP)</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Powertrain Impact:</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                      Enables full 350kW MGU-K energy to accelerate vehicle rather than battling aerodynamic drag.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 2025 vs 2026 Technical Regulations Matrix */}
        {activeTab === 'comparison' && (
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                  2025 (Ground Effect) vs 2026 (Active Hybrid) Regulations Matrix
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  Side-by-side comparison across aerodynamics, hybrid powertrain, chassis mass, and sustainable fuels.
                </p>
              </div>

              {/* Category Filter */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', 'Aerodynamics', 'Powertrain', 'Chassis & Mass', 'Sustainability'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTableCategory(cat)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: tableCategory === cat ? '1px solid #00d4ff' : '1px solid rgba(255,255,255,0.1)',
                      background: tableCategory === cat ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0,0,0,0.3)',
                      color: tableCategory === cat ? '#00d4ff' : '#94a3b8',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>Technical Parameter</th>
                    <th style={{ padding: '12px 14px', color: '#f43f5e', fontSize: '11px', textTransform: 'uppercase' }}>2025 Regulations (Previous)</th>
                    <th style={{ padding: '12px 14px', color: '#00d4ff', fontSize: '11px', textTransform: 'uppercase' }}>2026 Regulations (New Era)</th>
                    <th style={{ padding: '12px 14px', color: '#10b981', fontSize: '11px', textTransform: 'uppercase' }}>Regulatory Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComparisonTable.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#fff' }}>
                        {row.parameter}
                        <span style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{row.category}</span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{row.year2025}</td>
                      <td style={{ padding: '12px 14px', color: '#00d4ff', fontWeight: 700 }}>{row.year2026}</td>
                      <td style={{ padding: '12px 14px', color: '#10b981', fontWeight: 600 }}>{row.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: 11 Official Constructors & Power Unit Grid */}
        {activeTab === 'grid' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                Official 2026 Formula 1 Grid & Constructor Profiles (11 Teams)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                Full team lineup featuring Audi Revolut factory debut, Cadillac Formula 1 Team entry, and Aston Martin Honda works partnership.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
              {CONSTRUCTORS_2026_GRID.map((team) => (
                <div
                  key={team.name}
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderLeft: `4px solid ${team.color}`,
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>{team.name}</h4>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: team.color, background: `${team.color}15`, padding: '2px 8px', borderRadius: '4px' }}>
                      2026 Grid
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    <strong style={{ color: '#cbd5e1' }}>Drivers: </strong>{team.drivers}
                  </div>

                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    <strong style={{ color: '#00d4ff' }}>Power Unit: </strong>{team.engine}
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px', borderRadius: '6px', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                    <div style={{ fontWeight: 700, color: '#fff', marginBottom: '2px' }}>Aero & Hybrid Innovation:</div>
                    {team.aeroAdvantage}
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {team.chassisFocus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
