import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Zap, 
  Wind, 
  Gauge, 
  TrendingUp, 
  Clock, 
  Target, 
  Layers, 
  Battery, 
  Flame, 
  Sliders, 
  Sparkles,
  Info,
  RefreshCw,
  Compass,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import mlService, { TEAMS } from '../services/mlService';
import TelemetryWorkbench from '../components/TelemetryWorkbench';
import './Simulate.css';

const MetricCard = ({ icon, label, value, unit = '', subtitle = '', borderColor = '#00d4ff', delta = null }) => (
  <div style={{
    background: 'rgba(15, 23, 42, 0.75)',
    border: `1px solid ${borderColor}44`,
    borderRadius: '12px',
    padding: '16px',
    position: 'relative',
    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.4)`
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</span>
      <div style={{ color: borderColor }}>{icon}</div>
    </div>
    <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
      {value}{unit}
    </div>
    {delta && (
      <div style={{ fontSize: '12px', color: delta.startsWith('-') ? '#10b981' : '#ff4060', fontWeight: 600, marginTop: '2px' }}>
        {delta}
      </div>
    )}
    {subtitle && (
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
        {subtitle}
      </div>
    )}
  </div>
);

const Simulate = () => {
  const [simView, setSimView] = useState('telemetry'); // 'telemetry' or 'physics_lab'
  const [selectedTrack, setSelectedTrack] = useState('Monaco');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);

  // 2026 Physics Parameters
  const [activeAeroMode, setActiveAeroMode] = useState('AUTO'); // 'AUTO', 'Z_MODE_ONLY', 'X_MODE_ONLY'
  const [momActive, setMomActive] = useState(true);
  const [frontWingAngle, setFrontWingAngle] = useState(24.0);
  const [rearWingAngle, setRearWingAngle] = useState(32.0);
  const [carMass, setCarMass] = useState(768); // 2026 FIA min mass: 768 kg
  const [mgukPowerKw, setMgukPowerKw] = useState(350); // 350 kW MGU-K
  const [icePowerKw, setIcePowerKw] = useState(400); // 400 kW ICE
  const [rideHeightFront, setRideHeightFront] = useState(16.0); // mm
  const [rideHeightRear, setRideHeightRear] = useState(24.0); // mm
  const [tireGrip, setTireGrip] = useState(1.85);

  // Load tracks on mount
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const response = await mlService.getTracks();
        setTracks(response.tracks || []);
        if (response.tracks && response.tracks.length > 0) {
          setSelectedTrack(response.tracks[0].name);
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
      }
    };
    loadTracks();
  }, []);

  // Run simulation whenever parameters change
  useEffect(() => {
    const runSimulation = async () => {
      if (!selectedTrack) return;
      setLoading(true);
      try {
        const aeroConfig = {
          front_wing_angle: frontWingAngle,
          rear_wing_angle: rearWingAngle,
          ride_height_front: rideHeightFront,
          ride_height_rear: rideHeightRear
        };
        const carParams = {
          mass: carMass,
          ice_power: icePowerKw * 1000,
          mguk_power: mgukPowerKw * 1000,
          power: (icePowerKw + mgukPowerKw) * 1000,
          tire_grip: tireGrip
        };

        const result = await mlService.simulateLap(
          aeroConfig,
          carParams,
          selectedTrack,
          activeAeroMode,
          momActive
        );
        setSimulationData(result);
      } catch (error) {
        console.error('Error running 2026 lap simulation:', error);
      } finally {
        setLoading(false);
      }
    };

    runSimulation();
  }, [
    selectedTrack,
    activeAeroMode,
    momActive,
    frontWingAngle,
    rearWingAngle,
    carMass,
    mgukPowerKw,
    icePowerKw,
    rideHeightFront,
    rideHeightRear,
    tireGrip
  ]);

  const snap = simulationData?.physics_snapshot || {};
  const cornerSpeeds = simulationData?.corner_speeds_kmh || {};

  // Velocity profile chart data along a simulated 1000m straight
  const straightDistanceData = [
    { dist: '0m', speed: cornerSpeeds.slow_corners || 85, downforceZ: 1450, downforceX: 810 },
    { dist: '150m', speed: 175, downforceZ: 6150, downforceX: 3430 },
    { dist: '300m', speed: 235, downforceZ: 11100, downforceX: 6200 },
    { dist: '450m', speed: 280, downforceZ: 16043, downforceX: 8961 },
    { dist: '600m', speed: 312, downforceZ: 19900, downforceX: 11120 },
    { dist: '750m', speed: momActive ? 338 : 322, downforceZ: 23400, downforceX: 13080 },
    { dist: '900m (Braking)', speed: 120, downforceZ: 3100, downforceX: 1730 }
  ];

  return (
    <div className="simulate-page" style={{ padding: '24px 20px', minHeight: '100vh', background: 'radial-gradient(circle at 10% 20%, rgba(0, 212, 255, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 0, 64, 0.08) 0%, transparent 40%), #0a0a0f' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', color: '#000', fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '4px' }}>
                  2026 FIA PHYSICS & TELEMETRY LAB
                </span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>MoTeC / ATLAS Synchronized Traces & Active Aero Kinematics</span>
              </div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#fff' }}>
                2026 Telemetry Suite & Physics Simulator
              </h1>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>
                F1 team-grade telemetry analysis, Pirelli tyre thermal windows, delta traces, and dual-mode active wing simulation.
              </p>
            </div>

            {/* View Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setSimView('telemetry')}
                style={{
                  padding: '9px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  background: simView === 'telemetry' ? 'linear-gradient(135deg, #00d4ff, #0284c7)' : 'transparent',
                  color: simView === 'telemetry' ? '#000' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Activity size={15} /> MoTeC / ATLAS Telemetry Trace
              </button>
              <button
                onClick={() => setSimView('physics_lab')}
                style={{
                  padding: '9px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  background: simView === 'physics_lab' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                  color: simView === 'physics_lab' ? '#fff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sliders size={15} /> Active Aero & Chassis Setup Lab
              </button>
            </div>
          </div>
        </div>

        {/* View 1: MoTeC / ATLAS Comprehensive Telemetry Suite */}
        {simView === 'telemetry' && (
          <TelemetryWorkbench />
        )}

        {/* View 2: Active Aero & Chassis Setup Lab */}
        {simView === 'physics_lab' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Controls Panel */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#00d4ff" /> 2026 Setup Controls
              </span>
              <button
                onClick={() => {
                  setFrontWingAngle(24.0);
                  setRearWingAngle(32.0);
                  setCarMass(768);
                  setMgukPowerKw(350);
                  setIcePowerKw(400);
                  setActiveAeroMode('AUTO');
                  setMomActive(true);
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>

            {/* Circuit Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Circuit</label>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(0,212,255,0.4)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '14px' }}
              >
                {tracks.map((t) => (
                  <option key={t.name} value={t.name}>{t.name} ({t.downforce_level})</option>
                ))}
              </select>
            </div>

            {/* Active Aero Mode Switcher */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Active Aerodynamics Control</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { id: 'AUTO', label: 'Dynamic Auto' },
                  { id: 'Z_MODE_ONLY', label: 'Z-Mode (Apex)' },
                  { id: 'X_MODE_ONLY', label: 'X-Mode (Drag)' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveAeroMode(m.id)}
                    style={{
                      padding: '8px 4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: activeAeroMode === m.id ? '1px solid #00d4ff' : '1px solid rgba(255,255,255,0.08)',
                      background: activeAeroMode === m.id ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255,255,255,0.04)',
                      color: activeAeroMode === m.id ? '#00d4ff' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Override Mode (MOM) Toggle */}
            <div style={{ background: 'rgba(255,0,64,0.08)', border: '1px solid rgba(255,0,64,0.3)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Manual Override Mode (MOM)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Holds full 350kW electrical boost up to 337 km/h</div>
              </div>
              <button
                onClick={() => setMomActive(!momActive)}
                style={{
                  background: momActive ? '#ff0040' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {momActive ? 'ENGAGED' : 'OFF'}
              </button>
            </div>

            {/* Front & Rear Wing Sliders */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Front Wing Active Flap Angle</span>
                <span style={{ color: '#00d4ff', fontWeight: 700 }}>{frontWingAngle}°</span>
              </div>
              <input
                type="range"
                min="14"
                max="32"
                step="0.5"
                value={frontWingAngle}
                onChange={(e) => setFrontWingAngle(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#00d4ff' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Rear Wing Upper Element Angle</span>
                <span style={{ color: '#ff0040', fontWeight: 700 }}>{rearWingAngle}°</span>
              </div>
              <input
                type="range"
                min="20"
                max="40"
                step="0.5"
                value={rearWingAngle}
                onChange={(e) => setRearWingAngle(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ff0040' }}
              />
            </div>

            {/* Car Mass Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Minimum Car Mass (2026 FIA: 768kg)</span>
                <span style={{ color: '#ffb800', fontWeight: 700 }}>{carMass} kg</span>
              </div>
              <input
                type="range"
                min="740"
                max="820"
                step="1"
                value={carMass}
                onChange={(e) => setCarMass(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#ffb800' }}
              />
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                2025 Mass: 798kg | Delta: {carMass - 798}kg
              </div>
            </div>

            {/* Powertrain Split Sliders */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>350kW MGU-K Electrical Output</span>
                <span style={{ color: '#8b5cf6', fontWeight: 700 }}>{mgukPowerKw} kW</span>
              </div>
              <input
                type="range"
                min="250"
                max="350"
                step="5"
                value={mgukPowerKw}
                onChange={(e) => setMgukPowerKw(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>1.6L V6 Turbo ICE Output</span>
                <span style={{ color: '#ff0040', fontWeight: 700 }}>{icePowerKw} kW</span>
              </div>
              <input
                type="range"
                min="350"
                max="430"
                step="5"
                value={icePowerKw}
                onChange={(e) => setIcePowerKw(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#ff0040' }}
              />
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Total Power: {icePowerKw + mgukPowerKw} kW (~{Math.round((icePowerKw + mgukPowerKw) * 1.341)} HP)
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <MetricCard
                icon={<Clock size={18} />}
                label="2026 Lap Time"
                value={simulationData?.lap_time || '1:18.420'}
                delta={simulationData?.delta_vs_2025_seconds ? `${simulationData.delta_vs_2025_seconds > 0 ? '+' : ''}${simulationData.delta_vs_2025_seconds}s vs 2025` : '+0.45s vs 2025'}
                borderColor="#00d4ff"
              />
              <MetricCard
                icon={<Flame size={18} />}
                label="X-Mode Top Speed"
                value={simulationData?.top_speed_kmh || 338.5}
                unit=" km/h"
                subtitle={`MOM Boost: ${simulationData?.top_speed_mom_kmh || 348} km/h`}
                borderColor="#ff0040"
              />
              <MetricCard
                icon={<Wind size={18} />}
                label="Power Saved in X-Mode"
                value={Math.round(snap?.power_saved_x_mode_kw || 405)}
                unit=" kW"
                subtitle="-55.0% aerodynamic drag drop"
                borderColor="#10b981"
              />
              <MetricCard
                icon={<Battery size={18} />}
                label="Braking Energy Regen"
                value={simulationData?.energy_harvested_mj || 8.5}
                unit=" MJ"
                subtitle={`Deployed: ${simulationData?.energy_deployed_mj || 21.2} MJ`}
                borderColor="#8b5cf6"
              />
            </div>

            {/* Corner-by-Corner Speed Analysis */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gauge color="#00d4ff" size={18} />
                2026 Corner Apex Velocities (Load-Sensitive Tyre Formulation)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'rgba(10, 15, 26, 0.6)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Slow Corners (R &lt; 35m)</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                    {cornerSpeeds.slow_corners || 85.0} <span style={{ fontSize: '13px', color: '#94a3b8' }}>km/h</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981' }}>+3 km/h vs 2025 (-30kg agile chassis)</div>
                </div>

                <div style={{ background: 'rgba(10, 15, 26, 0.6)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid #ffb800' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Medium Corners (R 40-80m)</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                    {cornerSpeeds.medium_corners || 147.2} <span style={{ fontSize: '13px', color: '#94a3b8' }}>km/h</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Balanced aero-mechanical transfer</div>
                </div>

                <div style={{ background: 'rgba(10, 15, 26, 0.6)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid #ff0040' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>High-Speed Corners (R &gt; 90m)</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                    {cornerSpeeds.fast_corners || 270.8} <span style={{ fontSize: '13px', color: '#94a3b8' }}>km/h</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#f87171' }}>-12 km/h vs 2025 (-30% downforce)</div>
                </div>
              </div>
            </div>

            {/* Straightline Velocity & Downforce Profile Chart */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp color="#10b981" size={18} />
                    Straightline Acceleration & Active Downforce Transition
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Simulation of a 1000m straight showing speed build-up and the active aero downforce shedding (-59%) in X-Mode.
                  </p>
                </div>
              </div>

              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={straightDistanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="dist" stroke="#94a3b8" fontSize={11} />
                    <YAxis yAxisId="left" stroke="#00d4ff" fontSize={11} unit=" km/h" />
                    <YAxis yAxisId="right" orientation="right" stroke="#ff0040" fontSize={11} unit=" N" />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '8px' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="speed" name="Vehicle Speed (km/h)" stroke="#00d4ff" strokeWidth={3} dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="downforceZ" name="Z-Mode Downforce (N)" stroke="#ff0040" strokeWidth={2} strokeDasharray="5 5" />
                    <Line yAxisId="right" type="monotone" dataKey="downforceX" name="X-Mode Downforce (N)" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mathematical Derivations & Physics Summary */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '14px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info color="#00d4ff" size={16} /> 2026 Mathematical Formulations Applied in this Simulation
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '12px', color: '#cbd5e1' }}>
                <div style={{ background: 'rgba(10, 15, 26, 0.5)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, color: '#00d4ff', marginBottom: '4px' }}>Active Aero Equation</div>
                  <code>F_drag = 0.5 · ρ · v² · S · [C_D0(Mode) + C_L² / (π·AR·e) + C_D,tyres]</code>
                  <p style={{ margin: '6px 0 0', color: '#94a3b8' }}>X-Mode drops C_D from 1.15 to 0.54 via dual active morphing surfaces.</p>
                </div>

                <div style={{ background: 'rgba(10, 15, 26, 0.5)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: '4px' }}>50/50 Power Unit Equation</div>
                  <code>P_total(v) = P_ICE (400kW) + P_MGUK(v, MOM) (350kW)</code>
                  <p style={{ margin: '6px 0 0', color: '#94a3b8' }}>MOM maintains full 350kW electric boost up to 337 km/h before tapering to 355 km/h.</p>
                </div>

                <div style={{ background: 'rgba(10, 15, 26, 0.5)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, color: '#ffb800', marginBottom: '4px' }}>Corner Apex Equilibrium</div>
                  <code>m · v_apex² / R = μ(F_z) · [m·g + 0.5 · ρ · v² · S · C_L(Z-Mode)]</code>
                  <p style={{ margin: '6px 0 0', color: '#94a3b8' }}>Pacejka load sensitivity accounts for tyre grip reduction under high aerodynamic loading.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Simulate;
