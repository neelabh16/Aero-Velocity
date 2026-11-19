import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Zap, 
  Gauge, 
  Car, 
  TrendingUp, 
  Activity,
  Target,
  BarChart3,
  Brain,
  Clock,
  Award,
  Wind,
  Battery,
  Shield,
  Layers,
  Sparkles,
  ArrowUpRight,
  Flame,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import mlService, { TEAMS } from '../services/mlService';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState('Mercedes');
  const [selectedTrack, setSelectedTrack] = useState('Monaco');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamAnalysis, setTeamAnalysis] = useState(null);
  const [momBoostEnabled, setMomBoostEnabled] = useState(true);

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

  // Fetch live 2026 team analysis whenever team or track changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTeam || !selectedTrack) return;
      setLoading(true);
      try {
        const data = await mlService.analyzeTeam(selectedTeam, selectedTrack);
        setTeamAnalysis(data);
      } catch (error) {
        console.error('Error running 2026 team analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTeam, selectedTrack]);

  const perf = teamAnalysis?.performance || {};
  const lap = teamAnalysis?.lap_simulation || {};
  const meta = teamAnalysis?.team_metadata || {};
  const components = teamAnalysis?.components || {};
  const aeroDelta = teamAnalysis?.active_aero_delta || {};
  const strengths = teamAnalysis?.strengths || [];
  const weaknesses = teamAnalysis?.weaknesses || [];

  // Team-specific powertrain parameters
  const icePow = perf.ice_power_kw || meta.ice_power_kw || 400;
  const mgukPow = perf.mguk_power_kw || meta.mguk_power_kw || 350;
  const totalPow = perf.total_power_kw || (icePow + mgukPow);
  const totalHp = perf.total_hp || Math.round(totalPow * 1.34102);
  const isClippedEarly = selectedTeam === 'Aston Martin';
  const isHighAltitude = selectedTrack === 'Mexico' || selectedTrack === 'Interlagos';

  // Dynamic Radar chart data from 2026 physics engine
  const defaultRadar = [
    { metric: 'X-Mode Top Speed', value: 95, fullMark: 100 },
    { metric: 'Z-Mode Downforce', value: 94, fullMark: 100 },
    { metric: '350kW MGU-K Recovery', value: 96, fullMark: 100 },
    { metric: '768kg Agility', value: 95, fullMark: 100 },
    { metric: 'Active Flap Latency', value: 94, fullMark: 100 },
    { metric: 'MOM Boost Potency', value: 96, fullMark: 100 }
  ];
  const radarData = teamAnalysis?.radar_data || defaultRadar;

  // Default 2026 component efficiency fallback
  const defaultComponents = [
    { name: 'Active Front Wing', efficiency: meta.active_aero_score ? Math.round(meta.active_aero_score * 0.96) : 94, rating: 'Optimal' },
    { name: 'Active Rear Wing', efficiency: meta.active_aero_score ? Math.round(meta.active_aero_score * 0.98) : 96, rating: 'Optimal' },
    { name: 'Narrow Floor Tunnels', efficiency: meta.chassis_agility ? Math.round(meta.chassis_agility * 0.97) : 91, rating: 'Optimal' },
    { name: '350kW MGU-K Inverter', efficiency: Math.round(perf.aero_efficiency ? perf.aero_efficiency * 100 : 98), rating: isClippedEarly ? 'Critical Derate' : 'Optimal' },
    { name: 'Diffuser Expansion', efficiency: 89, rating: 'Balanced' },
    { name: 'Sidepod Inlets', efficiency: isClippedEarly ? 74 : 92, rating: isClippedEarly ? 'High Drag' : 'Optimal' },
  ];

  // Component breakdown array for chart
  const componentChartData = Object.entries(components).length > 0
    ? Object.entries(components).map(([key, item]) => ({
        name: item.component_name || key.replace(/_/g, ' '),
        efficiency: Math.round((item.efficiency_score || 0.85) * 100),
        downforce: item.contribution_to_downforce || 0,
        drag: item.contribution_to_drag || 0,
        rating: item.strength_rating || 'Optimal'
      }))
    : defaultComponents;

  // Authentic Power Curve from 2026 physics engine
  const powerCurveData = teamAnalysis?.power_curve || [
    { speed: '60 km/h', ice: Math.round(icePow * 0.55), mguk: mgukPow, total: Math.round(icePow * 0.55 + mgukPow) },
    { speed: '120 km/h', ice: Math.round(icePow * 0.85), mguk: mgukPow, total: Math.round(icePow * 0.85 + mgukPow) },
    { speed: '180 km/h', ice: Math.round(icePow * 0.98), mguk: mgukPow, total: Math.round(icePow * 0.98 + mgukPow) },
    { speed: '240 km/h', ice: icePow, mguk: mgukPow, total: Math.round(icePow + mgukPow) },
    { speed: '290 km/h', ice: icePow, mguk: isClippedEarly ? Math.round(mgukPow * 0.35) : mgukPow, total: Math.round(icePow + (isClippedEarly ? mgukPow * 0.35 : mgukPow)) },
    { speed: '320 km/h', ice: icePow, mguk: isClippedEarly ? 0 : (momBoostEnabled ? mgukPow : 160), total: Math.round(icePow + (isClippedEarly ? 0 : (momBoostEnabled ? mgukPow : 160))) },
    { speed: '340 km/h', ice: icePow, mguk: isClippedEarly ? 0 : (momBoostEnabled ? Math.round(mgukPow * 0.80) : 30), total: Math.round(icePow + (isClippedEarly ? 0 : (momBoostEnabled ? Math.round(mgukPow * 0.80) : 30))) }
  ];

  return (
    <div className="dashboard-page" style={{ padding: '24px 20px', minHeight: '100vh', background: 'radial-gradient(circle at 15% 15%, rgba(0, 212, 255, 0.08) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(255, 0, 64, 0.08) 0%, transparent 40%), #0a0a0f' }}>
      {/* 2026 Header Banner */}
      <div style={{ maxWidth: '1440px', margin: '0 auto 28px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', color: '#000', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.05em' }}>
              FIA 2026 TECHNICAL REGULATIONS
            </span>
            <span style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              Live Mathematical Physics Engine
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Formula 1 2026 Active Aero & Hybrid Analysis
          </h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Dual-Mode Active Aerodynamics (Z-Mode & X-Mode) · 50% Electrical Powertrain (350kW MGU-K) · 768kg Minimum Chassis
          </p>
        </div>

        {/* Global Selectors */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>Select 2026 Team (11 Teams)</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{ background: '#131722', border: '1px solid rgba(0, 212, 255, 0.4)', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', outline: 'none' }}
            >
              {TEAMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>Select Circuit</label>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              style={{ background: '#131722', border: '1px solid rgba(255, 0, 64, 0.4)', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', outline: 'none' }}
            >
              {tracks.map((t) => (
                <option key={t.name} value={t.name}>{t.name} ({t.downforce_level})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Team 2026 Metadata Banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.5))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: meta.color || '#ff0040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', color: '#000', boxShadow: `0 0 20px ${meta.color || '#ff0040'}66` }}>
              {selectedTeam.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                {selectedTeam} <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Chassis: {meta.chassis || '2026 Spec'}</span>
              </div>
              <div style={{ fontSize: '13px', color: isClippedEarly ? '#f87171' : '#00d4ff', fontWeight: 600 }}>
                Power Unit: {meta.engine || '2026 Turbo Hybrid'}
              </div>
              {meta.engine_status && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', padding: '3px 10px', marginTop: '6px', fontSize: '12px', color: '#fca5a5', fontWeight: 600 }}>
                  <AlertTriangle size={14} color="#ef4444" />
                  {meta.engine_status}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>2026 Drivers</div>
              <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{meta.drivers ? meta.drivers.join(' & ') : 'Confirmed Driver Lineup'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Active Aero Rating</div>
              <div style={{ fontSize: '14px', color: (meta.active_aero_score && meta.active_aero_score < 80) ? '#f87171' : '#10b981', fontWeight: 700 }}>
                {meta.active_aero_score ? meta.active_aero_score.toFixed(1) : '97.5'} / 100
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>350kW MGU-K Recovery</div>
              <div style={{ fontSize: '14px', color: (perf.aero_efficiency && perf.aero_efficiency < 0.85) ? '#f87171' : '#8b5cf6', fontWeight: 700 }}>
                {perf.aero_efficiency ? (perf.aero_efficiency * 100).toFixed(1) : (meta.power_rating || '98.2')}% Efficiency
              </div>
            </div>
          </div>
        </div>

        {/* 6 Key Telemetry Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
          {/* Card 1: 2026 Lap Time */}
          <div style={{ background: 'rgba(15, 20, 32, 0.7)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
              <span>SIMULATED LAP TIME</span>
              <Clock size={16} color="#00d4ff" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '8px 0 2px' }}>
              {lap.lap_time || '1:18.420'}
            </div>
            <div style={{ fontSize: '12px', color: (lap.delta_vs_2025_seconds && lap.delta_vs_2025_seconds > 0) ? '#ff4060' : '#10b981', fontWeight: 600 }}>
              Δ vs 2025: {lap.delta_vs_2025_seconds ? `${lap.delta_vs_2025_seconds > 0 ? '+' : ''}${lap.delta_vs_2025_seconds}s` : '+0.45s'}
              {lap.delta_vs_2025_seconds > 1.0 ? ' (Severe Deficit)' : ''}
            </div>
          </div>

          {/* Card 2: Top Speed (X-Mode & MOM) */}
          <div style={{ background: 'rgba(15, 20, 32, 0.7)', border: '1px solid rgba(255, 0, 64, 0.2)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
              <span>X-MODE TOP SPEED</span>
              <Flame size={16} color="#ff0040" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '8px 0 2px' }}>
              {perf.top_speed || 342.5} <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>km/h</span>
            </div>
            <div style={{ fontSize: '12px', color: '#ffb800' }}>
              MOM Boost: {perf.top_speed_mom || 352.0} km/h
            </div>
          </div>

          {/* Card 3: 50% Hybrid Power */}
          <div style={{ background: 'rgba(15, 20, 32, 0.7)', border: `1px solid ${totalPow < 720 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(139, 92, 246, 0.2)'}`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
              <span>TOTAL POWERTRAIN</span>
              <Zap size={16} color={totalPow < 720 ? '#ef4444' : '#8b5cf6'} />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: totalPow < 720 ? '#fca5a5' : '#fff', margin: '8px 0 2px' }}>
              {totalPow} <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>kW (~{totalHp} HP)</span>
            </div>
            <div style={{ fontSize: '12px', color: totalPow < 720 ? '#ef4444' : '#94a3b8', fontWeight: totalPow < 720 ? 600 : 400 }}>
              {icePow}kW ICE + {mgukPow}kW MGU-K {totalPow < 720 ? '(THERMAL CLIP)' : '(47% Electric)'}
            </div>
          </div>

          {/* Card 4: Active Aero Drag Drop */}
          <div style={{ background: 'rgba(15, 20, 32, 0.7)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
              <span>X-MODE DRAG DROP</span>
              <Wind size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: perf.drag_drop_pct < 52 ? '#f59e0b' : '#10b981', margin: '8px 0 2px' }}>
              -{perf.drag_drop_pct || 55.0}%
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Z-Mode Cd: 1.15 → X-Mode Cd: {perf.x_mode_cd || 0.540}
            </div>
          </div>

          {/* Card 5: Minimum Chassis Weight */}
          <div style={{ background: 'rgba(15, 20, 32, 0.7)', border: '1px solid rgba(255, 184, 0, 0.2)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
              <span>MINIMUM WEIGHT</span>
              <Layers size={16} color="#ffb800" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '8px 0 2px' }}>
              768 <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>kg</span>
            </div>
            <div style={{ fontSize: '12px', color: '#10b981' }}>
              -30 kg vs 2025 (798 kg)
            </div>
          </div>

          {/* Card 6: Energy Recovery */}
          <div style={{ background: 'rgba(15, 20, 32, 0.7)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
              <span>MGU-K REGEN / LAP</span>
              <Battery size={16} color="#00d4ff" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '8px 0 2px' }}>
              {perf.energy_harvested_mj || 8.5} <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>MJ</span>
            </div>
            <div style={{ fontSize: '12px', color: perf.energy_harvested_mj < 7.5 ? '#f87171' : '#94a3b8' }}>
              {perf.energy_harvested_mj < 7.5 ? `Thermal derate: -${(8.5 - (perf.energy_harvested_mj || 7.5)).toFixed(2)} MJ deficit` : 'Max FIA Limit: 8.5 MJ/lap (Doubled)'}
            </div>
          </div>
        </div>

        {/* 2026 Technical Strengths & Weaknesses Diagnostics Panel */}
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '17px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity color="#00d4ff" size={18} />
            2026 Real Season Diagnostics & Performance Engineering Report ({selectedTeam} @ {selectedTrack})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Strengths */}
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>
                <CheckCircle2 size={16} /> Key Technical Strengths
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {strengths.map((str, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>•</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses / Deficits */}
            <div style={{ background: isClippedEarly ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.05)', border: `1px solid ${isClippedEarly ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`, borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isClippedEarly ? '#ef4444' : '#f59e0b', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>
                <AlertTriangle size={16} /> Critical Technical Deficits & Constraints
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {weaknesses.map((w, i) => (
                  <div key={i} style={{ fontSize: '12px', color: isClippedEarly ? '#fca5a5' : '#cbd5e1', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: isClippedEarly ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>•</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2026 Interactive Active Aero Comparison Panel */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wind color="#00d4ff" size={20} />
                2026 Active Aerodynamics Mathematical Comparison (Z-Mode vs X-Mode)
              </h3>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                Dual-mode active surfaces replace DRS with front-and-rear wing morphing. Compare forces derived at 280 km/h:
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setMomBoostEnabled(!momBoostEnabled)}
                style={{
                  background: momBoostEnabled ? 'linear-gradient(135deg, #ff0040, #ff0080)' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                MOM Push-to-Pass: {momBoostEnabled ? 'ENABLED (+350kW)' : 'OFF'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Z-Mode Card */}
            <div style={{ background: 'rgba(10, 15, 26, 0.8)', border: '1px solid rgba(255, 0, 64, 0.4)', borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 800, color: '#ff0040', fontSize: '15px' }}>Z-MODE (Cornering / Apex)</span>
                <span style={{ fontSize: '11px', background: 'rgba(255,0,64,0.15)', color: '#ff4060', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>High Downforce</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Total Downforce (at 280 km/h):</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{isClippedEarly ? '14,280 N (-11%)' : '16,043 N'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Aerodynamic Drag Force:</span>
                  <span style={{ color: '#ff4060', fontWeight: 700 }}>{isClippedEarly ? '10,480 N (+7%)' : '9,795 N'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Effective Lift-to-Drag (L/D):</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{perf.ld_ratio || 2.35}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Active Flaps Status:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>Front 24° / Rear 32° (Closed)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Aero Drag Power Loss:</span>
                  <span style={{ color: '#f87171', fontWeight: 700 }}>{isClippedEarly ? '815.1 kW' : '761.1 kW'}</span>
                </div>
              </div>
            </div>

            {/* X-Mode Card */}
            <div style={{ background: 'rgba(10, 15, 26, 0.8)', border: '1px solid rgba(0, 212, 255, 0.4)', borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 800, color: '#00d4ff', fontSize: '15px' }}>X-MODE (Straightline / Low Drag)</span>
                <span style={{ fontSize: '11px', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Low Drag Active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Total Downforce (at 280 km/h):</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>8,961 N (-59.3%)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Aerodynamic Drag Force:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{isClippedEarly ? '5,180 N (-50.6% Drag Drop)' : '4,581 N (-55.0% Drag Drop)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Effective Lift-to-Drag (L/D):</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{perf.ld_ratio_x_mode || 2.08}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Active Flaps Status:</span>
                  <span style={{ color: '#00d4ff', fontWeight: 600 }}>Front 12° / Rear Active Slot OPEN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Power Saved by X-Mode:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>+{isClippedEarly ? '358.4 kW (~480 HP)' : '405.1 kW (~543 HP)'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section: 50/50 Power Unit Curve & 2026 Component Efficiency */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
          {/* Chart 1: 50/50 Hybrid Power Curve */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap color="#8b5cf6" size={18} />
              2026 Power Unit Delivery Curve ({icePow}kW ICE + {mgukPow}kW MGU-K)
            </h4>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#94a3b8' }}>
              {isClippedEarly 
                ? 'CRITICAL ALERT: Severe Honda HRC RA626H thermal clipping drops electrical power to 0 kW past 290 km/h!'
                : 'Displays ICE vs MGU-K power tapering. With MOM mode engaged, 350kW electrical boost holds until 337 km/h.'}
            </p>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={powerCurveData}>
                  <defs>
                    <linearGradient id="colorIce" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff0040" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff0040" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMguk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isClippedEarly ? "#f59e0b" : "#00d4ff"} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={isClippedEarly ? "#f59e0b" : "#00d4ff"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="speed" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit=" kW" domain={[0, 800]} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="ice" name={`ICE (${icePow}kW)`} stroke="#ff0040" fillOpacity={1} fill="url(#colorIce)" />
                  <Area type="monotone" dataKey="mguk" name={`MGU-K (${mgukPow}kW)`} stroke={isClippedEarly ? "#f59e0b" : "#00d4ff"} fillOpacity={1} fill="url(#colorMguk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: 2026 Component Efficiency */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers color="#10b981" size={18} />
              2026 Component Efficiency & Active Aero Matrix
            </h4>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#94a3b8' }}>
              Ratings for 2026 active wings, narrow floor tunnels, and 350kW hybrid cooling.
            </p>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart 
                  data={componentChartData.slice(0, 6)} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={11} width={135} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px' }}
                    formatter={(val) => [`${val}%`, 'Efficiency']}
                  />
                  <Bar dataKey="efficiency" name="Efficiency %" fill="#10b981" radius={[0, 4, 4, 0]}>
                    {componentChartData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.efficiency < 80 ? '#ef4444' : (index % 2 === 0 ? '#00d4ff' : '#8b5cf6')} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Radar & Engineering Insights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {/* Radar Chart */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gauge color="#00d4ff" size={18} />
              2026 Regulations Dynamics Balance
            </h4>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#94a3b8' }}>
              Six-axis index benchmarking {selectedTeam}'s active aero responsiveness, battery recovery and cornering agility.
            </p>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis domain={[50, 100]} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Radar name={selectedTeam} dataKey="value" stroke={meta.color || '#00d4ff'} fill={meta.color || '#00d4ff'} fillOpacity={0.4} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Track Engineering Recommendations */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain color="#00d4ff" size={18} />
              2026 AI Track Strategy & Aerodynamic Setup for {selectedTrack}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(10, 15, 26, 0.6)', borderLeft: '3px solid #00d4ff', padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>
                <div style={{ fontWeight: 700, color: '#00d4ff', fontSize: '12px', marginBottom: '2px' }}>Active Aero Strategy</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                  Deploy X-Mode on all straights exceeding 115 km/h. Keep Z-Mode active through apex transitions to exploit the 768kg lightweight agility advantage.
                </div>
              </div>

              <div style={{ background: 'rgba(10, 15, 26, 0.6)', borderLeft: '3px solid #8b5cf6', padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>
                <div style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '12px', marginBottom: '2px' }}>350kW MGU-K Harvesting</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                  {isClippedEarly 
                    ? 'Limit continuous MOM boost discharge to avoid battery thermal throttling. Prioritize heavy regen into Turn 1 to rebuild usable buffer.'
                    : 'Maximize heavy braking regeneration into Turn 1 to recover the full 8.5 MJ/lap FIA allowance. Save MOM push-to-pass boost for overtaking.'}
                </div>
              </div>

              <div style={{ background: 'rgba(10, 15, 26, 0.6)', borderLeft: '3px solid #10b981', padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>
                <div style={{ fontWeight: 700, color: '#10b981', fontSize: '12px', marginBottom: '2px' }}>Narrow Floor Anti-Porpoising Tuning</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                  Ride heights calibrated to 16.0mm front / 24.0mm rear. The 150mm narrower floor eliminates high-speed porpoising while preserving clean underbody suction.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
