import React, { useState, useEffect, useMemo } from 'react';
import {
  Gauge,
  Zap,
  Wind,
  Activity,
  TrendingUp,
  Sliders,
  Layers,
  RefreshCw,
  Flame,
  ChevronDown,
  ChevronUp,
  Flag,
  BarChart2,
  Thermometer,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import mlService, {
  TEAMS,
  PIRELLI_COMPOUNDS_LIST,
  DRIVERS_2026_LIST
} from '../services/mlService';
import './TelemetryWorkbench.css';

const CustomTelemetryTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="telemetry-tooltip">
      <div className="tooltip-dist">Distance: {label} m</div>
      <div className="tooltip-values">
        {payload.map((item, idx) => (
          <div key={idx} className="tooltip-item" style={{ color: item.color }}>
            <span className="tooltip-label">{item.name}:</span>
            <span className="tooltip-val">{item.value} {item.unit || ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TelemetryWorkbench() {
  // Mode: 'single' or 'compare'
  const [telemetryMode, setTelemetryMode] = useState('compare');

  // Circuit & Environment state
  const [trackName, setTrackName] = useState('Silverstone');
  const [trackTempC, setTrackTempC] = useState(38);
  const [airTempC, setAirTempC] = useState(24);
  const [trackCondition, setTrackCondition] = useState('dry');
  const [rubberLevel, setRubberLevel] = useState('rubbered');
  const [windSpeedKmh, setWindSpeedKmh] = useState(12);
  const [windDirection, setWindDirection] = useState('headwind');
  const [activeAeroMode, setActiveAeroMode] = useState('AUTO');
  const [momBoostEnabled, setMomBoostEnabled] = useState(true);
  const [stintLap, setStintLap] = useState(5);
  const [envOpen, setEnvOpen] = useState(false);

  // Driver 1 Setup
  const [driver1Name, setDriver1Name] = useState('George Russell');
  const [compound1Code, setCompound1Code] = useState('C3_MEDIUM');

  // Driver 2 Setup (for head-to-head comparison)
  const [driver2Name, setDriver2Name] = useState('Max Verstappen');
  const [compound2Code, setCompound2Code] = useState('C3_MEDIUM');

  // Loading & Telemetry Data
  const [loading, setLoading] = useState(false);
  const [telemetryData1, setTelemetryData1] = useState(null);
  const [telemetryData2, setTelemetryData2] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Resolve team from driver name
  const driver1Profile = useMemo(() => {
    return DRIVERS_2026_LIST.find((d) => d.name === driver1Name) || DRIVERS_2026_LIST[0];
  }, [driver1Name]);

  const driver2Profile = useMemo(() => {
    return DRIVERS_2026_LIST.find((d) => d.name === driver2Name) || DRIVERS_2026_LIST[4];
  }, [driver2Name]);

  const team1Name = driver1Profile.team;
  const team2Name = driver2Profile.team;

  // Selected Compound metadata
  const comp1 = useMemo(() => {
    return PIRELLI_COMPOUNDS_LIST.find((c) => c.code === compound1Code) || PIRELLI_COMPOUNDS_LIST[2];
  }, [compound1Code]);

  const comp2 = useMemo(() => {
    return PIRELLI_COMPOUNDS_LIST.find((c) => c.code === compound2Code) || PIRELLI_COMPOUNDS_LIST[2];
  }, [compound2Code]);

  // Fetch telemetry from physics engine
  const fetchTelemetry = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (telemetryMode === 'compare') {
        const res = await mlService.compareDriverTelemetry({
          trackName,
          driver1Name,
          team1Name,
          compound1Code,
          driver2Name,
          team2Name,
          compound2Code,
          trackTempC,
          airTempC,
          trackCondition,
          rubberLevel,
          windSpeedKmh,
          windDirection,
          activeAeroMode,
          momBoostEnabled,
        });
        setTelemetryData1(res.driver_1_trace);
        setTelemetryData2(res.driver_2_trace);
        setComparisonData(res.comparison);
      } else {
        const res = await mlService.simulateTelemetryLap({
          trackName,
          teamName: team1Name,
          driverName: driver1Name,
          compoundCode: compound1Code,
          trackTempC,
          airTempC,
          trackCondition,
          rubberLevel,
          windSpeedKmh,
          windDirection,
          activeAeroMode,
          momBoostEnabled,
          stintLap,
        });
        setTelemetryData1(res);
        setTelemetryData2(null);
        setComparisonData(null);
      }
    } catch (err) {
      console.error('Telemetry fetch error:', err);
      setErrorMsg(err.message || 'Simulation calculation error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [
    trackName,
    telemetryMode,
    driver1Name,
    compound1Code,
    driver2Name,
    compound2Code,
    trackTempC,
    airTempC,
    trackCondition,
    rubberLevel,
    windSpeedKmh,
    windDirection,
    activeAeroMode,
    momBoostEnabled,
    stintLap,
  ]);

  // Convert raw arrays into synchronized telemetry chart points
  const telemetryChartData = useMemo(() => {
    if (!telemetryData1?.telemetry_arrays) return [];
    const t1 = telemetryData1.telemetry_arrays;
    const t2 = telemetryData2?.telemetry_arrays;
    const deltaTrace = comparisonData?.time_delta_trace_s || [];
    const pts = [];

    const len = t1.distance_m.length;
    for (let i = 0; i < len; i++) {
      const dist = t1.distance_m[i];
      pts.push({
        distance: Math.round(dist),
        // Channel 1: Speeds
        speed1: t1.speed_kmh[i],
        speed2: t2 ? t2.speed_kmh[i] : null,
        delta_s: deltaTrace[i] !== undefined ? deltaTrace[i] : 0,
        // Channel 2: Pedals
        throttle1: t1.throttle_pct[i],
        brake1: t1.brake_pct[i],
        throttle2: t2 ? t2.throttle_pct[i] : null,
        brake2: t2 ? t2.brake_pct[i] : null,
        // Channel 3: Power & Hybrid
        mguk_kw1: t1.mguk_power_kw[i],
        soc1: t1.battery_soc_pct[i],
        mguk_kw2: t2 ? t2.mguk_power_kw[i] : null,
        // Channel 4: G-Forces
        g_lat1: t1.g_lat[i],
        g_long1: t1.g_long[i],
        // Channel 5: Tyre Temps
        tyre_fl: t1.tyre_temp_fl_c[i],
        tyre_fr: t1.tyre_temp_fr_c[i],
        tyre_rl: t1.tyre_temp_rl_c[i],
        tyre_rr: t1.tyre_temp_rr_c[i],
        // Channel 6: Active Aero
        flap_angle1: t1.active_flap_angle_deg[i],
        aero_mode1: t1.active_aero_mode[i],
        mom1: t1.mom_active[i] ? 1 : 0,
      });
    }
    return pts;
  }, [telemetryData1, telemetryData2, comparisonData]);

  const summary1 = telemetryData1?.summary || {};
  const summary2 = telemetryData2?.summary || {};

  return (
    <div className="telemetry-workbench">
      {/* Top Banner */}
      <div className="workbench-header">
        <div className="workbench-title-group">
          <div className="workbench-badge">
            <span className="live-dot" />
            2026 FIA FORMULA 1 MOTEC & ATLAS TELEMETRY WORKBENCH
          </div>
          <h2>Interactive Physics & Telemetry Trace Suite</h2>
          <p>
            Distance-synchronized telemetry channels, Pirelli thermal grip windows, active aero transitions, and 350kW MGU-K energy flow.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="workbench-mode-switch">
          <button
            className={`mode-btn ${telemetryMode === 'compare' ? 'active' : ''}`}
            onClick={() => setTelemetryMode('compare')}
          >
            <TrendingUp size={14} /> Delta Overlay (2 Cars)
          </button>
          <button
            className={`mode-btn ${telemetryMode === 'single' ? 'active' : ''}`}
            onClick={() => setTelemetryMode('single')}
          >
            <Activity size={14} /> Single Car Trace
          </button>
          <button
            className="refresh-btn"
            onClick={fetchTelemetry}
            title="Recalculate simulation"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="workbench-controls-grid">
        {/* Circuit */}
        <div className="control-item">
          <label>Circuit</label>
          <select value={trackName} onChange={(e) => setTrackName(e.target.value)}>
            <option value="Silverstone">Silverstone (UK)</option>
            <option value="Monaco">Monaco (Street)</option>
            <option value="Monza">Monza (Temple of Speed)</option>
            <option value="Spa">Spa-Francorchamps (Belgium)</option>
            <option value="Interlagos">Interlagos (São Paulo)</option>
            <option value="Mexico">Autódromo H. Rodríguez (2285m)</option>
            <option value="Bahrain">Bahrain International</option>
            <option value="Suzuka">Suzuka Circuit (Japan)</option>
            <option value="Las Vegas">Las Vegas Strip Circuit</option>
            <option value="Zandvoort">Zandvoort (Banked)</option>
            <option value="Austria">Red Bull Ring (Spielberg)</option>
            <option value="Singapore">Marina Bay Street Circuit</option>
            <option value="Canada">Circuit Gilles Villeneuve</option>
            <option value="Azerbaijan">Baku City Circuit</option>
            <option value="Australia">Albert Park (Melbourne)</option>
            <option value="Hungary">Hungaroring (Budapest)</option>
            <option value="Spain">Circuit de Barcelona-Catalunya</option>
            <option value="Saudi Arabia">Jeddah Corniche Circuit</option>
            <option value="Miami">Miami International Autodrome</option>
            <option value="Qatar">Lusail International Circuit</option>
            <option value="Abu Dhabi">Yas Marina Circuit</option>
          </select>
        </div>

        {/* Primary Driver */}
        <div className="control-item driver-card-control" style={{ borderLeft: '3px solid #00d4ff' }}>
          <label>Driver 1 (Reference)</label>
          <select value={driver1Name} onChange={(e) => setDriver1Name(e.target.value)}>
            {DRIVERS_2026_LIST.map((d) => (
              <option key={d.name} value={d.name}>
                #{d.number} {d.name} ({d.team})
              </option>
            ))}
          </select>
          <div className="sub-select-row">
            <span className="sub-tag">{team1Name}</span>
            <select
              value={compound1Code}
              onChange={(e) => setCompound1Code(e.target.value)}
              className="compound-selector"
              style={{ color: comp1.color }}
            >
              {PIRELLI_COMPOUNDS_LIST.map((c) => (
                <option key={c.code} value={c.code} style={{ color: '#000' }}>
                  {c.short} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Compare Driver (if comparing) */}
        {telemetryMode === 'compare' && (
          <div className="control-item driver-card-control" style={{ borderLeft: '3px solid #ff4060' }}>
            <label>Driver 2 (Delta Overlay)</label>
            <select value={driver2Name} onChange={(e) => setDriver2Name(e.target.value)}>
              {DRIVERS_2026_LIST.map((d) => (
                <option key={d.name} value={d.name}>
                  #{d.number} {d.name} ({d.team})
                </option>
              ))}
            </select>
            <div className="sub-select-row">
              <span className="sub-tag">{team2Name}</span>
              <select
                value={compound2Code}
                onChange={(e) => setCompound2Code(e.target.value)}
                className="compound-selector"
                style={{ color: comp2.color }}
              >
                {PIRELLI_COMPOUNDS_LIST.map((c) => (
                  <option key={c.code} value={c.code} style={{ color: '#000' }}>
                    {c.short} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Aero Mode */}
        <div className="control-item">
          <label>Active Aero Mode</label>
          <select value={activeAeroMode} onChange={(e) => setActiveAeroMode(e.target.value)}>
            <option value="AUTO">Dynamic Auto (Z-Mode Corner / X-Mode Straight)</option>
            <option value="Z_MODE_ONLY">Z-Mode Fixed (Max Downforce / Drag Penalty)</option>
            <option value="X_MODE_ONLY">X-Mode Fixed (Low Drag)</option>
          </select>
        </div>

        {/* MOM Push-to-Pass */}
        <div className="control-item toggle-item">
          <label>350kW MOM Boost</label>
          <button
            className={`toggle-btn ${momBoostEnabled ? 'on' : 'off'}`}
            onClick={() => setMomBoostEnabled(!momBoostEnabled)}
          >
            {momBoostEnabled ? '⚡ MOM ACTIVE (337 km/h)' : 'DERATED'}
          </button>
        </div>

        {/* Environmental Drawer Toggle */}
        <div className="control-item env-drawer-toggle">
          <label>Environment & Track State</label>
          <button className="env-btn" onClick={() => setEnvOpen(!envOpen)}>
            <Sliders size={14} />
            {trackTempC}°C Track | {trackCondition.toUpperCase()} | {rubberLevel.toUpperCase()}
            {envOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expandable Environmental Settings Drawer */}
      {envOpen && (
        <div className="env-drawer">
          <div className="env-grid">
            <div className="env-field">
              <span className="env-label">
                <Thermometer size={13} /> Track Temp: <strong>{trackTempC}°C</strong>
              </span>
              <input
                type="range"
                min="15"
                max="60"
                value={trackTempC}
                onChange={(e) => setTrackTempC(Number(e.target.value))}
              />
              <span className="env-hint">Optimal C3 Tyre Window: 100°C–130°C</span>
            </div>

            <div className="env-field">
              <span className="env-label">
                <Wind size={13} /> Air Temp: <strong>{airTempC}°C</strong>
              </span>
              <input
                type="range"
                min="10"
                max="45"
                value={airTempC}
                onChange={(e) => setAirTempC(Number(e.target.value))}
              />
              <span className="env-hint">Affects air density & downforce</span>
            </div>

            <div className="env-field">
              <span className="env-label">Track Surface Condition</span>
              <div className="btn-group">
                {['dry', 'damp', 'wet'].map((c) => (
                  <button
                    key={c}
                    className={`btn-sub ${trackCondition === c ? 'active' : ''}`}
                    onClick={() => setTrackCondition(c)}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="env-field">
              <span className="env-label">Rubbering-In Level</span>
              <div className="btn-group">
                {['green', 'normal', 'rubbered'].map((r) => (
                  <button
                    key={r}
                    className={`btn-sub ${rubberLevel === r ? 'active' : ''}`}
                    onClick={() => setRubberLevel(r)}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="env-field">
              <span className="env-label">Wind Vector</span>
              <div className="sub-row">
                <select value={windDirection} onChange={(e) => setWindDirection(e.target.value)}>
                  <option value="headwind">Headwind (Front Straight)</option>
                  <option value="tailwind">Tailwind (Front Straight)</option>
                  <option value="crosswind">Crosswind</option>
                </select>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={windSpeedKmh}
                  onChange={(e) => setWindSpeedKmh(Number(e.target.value))}
                  style={{ width: '80px' }}
                />
                <span className="unit-label">km/h</span>
              </div>
            </div>

            <div className="env-field">
              <span className="env-label">Tyre Stint Wear Lap: <strong>Lap {stintLap}</strong></span>
              <input
                type="range"
                min="1"
                max="35"
                value={stintLap}
                onChange={(e) => setStintLap(Number(e.target.value))}
              />
              <span className="env-hint">Calculates progressive friction degradation</span>
            </div>
          </div>
        </div>
      )}

      {/* Engineering KPI Summary Bar */}
      <div className="kpi-summary-strip">
        <div className="kpi-card highlight-kpi">
          <div className="kpi-header">
            <Flag size={14} color="#00d4ff" />
            <span>REFERENCE LAP TIME</span>
          </div>
          <div className="kpi-value cyan-val">{summary1.lap_time || '--:--.---'}</div>
          <div className="kpi-sub">
            {driver1Profile.name} • {team1Name}
          </div>
        </div>

        {telemetryMode === 'compare' && (
          <div className="kpi-card highlight-kpi">
            <div className="kpi-header">
              <Flag size={14} color="#ff4060" />
              <span>DELTA OVERLAY LAP</span>
            </div>
            <div className="kpi-value red-val">{summary2.lap_time || '--:--.---'}</div>
            <div className="kpi-sub">
              {driver2Profile.name} • {team2Name}
              {comparisonData && (
                <span className="delta-badge" style={{
                  color: comparisonData.lap_delta_seconds <= 0 ? '#00d4ff' : '#ff4060'
                }}>
                  {comparisonData.lap_delta_seconds > 0 ? `+${comparisonData.lap_delta_seconds}s` : `${comparisonData.lap_delta_seconds}s`}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="kpi-card">
          <div className="kpi-header">
            <Gauge size={14} color="#10b981" />
            <span>TOP SPEED (X-MODE)</span>
          </div>
          <div className="kpi-value">{summary1.top_speed_kmh || 0} km/h</div>
          <div className="kpi-sub">Avg: {summary1.avg_speed_kmh || 0} km/h</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <Activity size={14} color="#f59e0b" />
            <span>PEAK G-FORCES</span>
          </div>
          <div className="kpi-value">{summary1.max_lateral_g || 0} G Lat</div>
          <div className="kpi-sub">Braking: {summary1.max_braking_g || 0} G</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <Zap size={14} color="#8b5cf6" />
            <span>350kW MGU-K REGEN</span>
          </div>
          <div className="kpi-value">{summary1.energy_harvested_mj || 0} MJ</div>
          <div className="kpi-sub">Deployed: {summary1.energy_deployed_mj || 0} MJ</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <Wind size={14} color="#38bdf8" />
            <span>X-MODE STRAIGHTLINE</span>
          </div>
          <div className="kpi-value">{summary1.x_mode_straight_pct || 0}%</div>
          <div className="kpi-sub">-55% Drag Deployment</div>
        </div>
      </div>

      {/* Engineering Insights Banner */}
      {comparisonData && comparisonData.insights && (
        <div className="engineering-insights-box">
          <div className="insight-title">
            <BarChart2 size={16} color="#00d4ff" />
            <strong>RACE ENGINEERING TELEMETRY INSIGHTS</strong>
          </div>
          <div className="insight-list">
            <div className="insight-item">
              Faster car on current simulation: <strong>{comparisonData.faster_driver}</strong> by <strong>{Math.abs(comparisonData.lap_delta_seconds)}s</strong>
            </div>
            {comparisonData.insights.map((ins, idx) => (
              <div key={idx} className="insight-item">
                • {ins}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Multi-Channel Telemetry Plots */}
      <div className="telemetry-channels-container">
        {/* Channel 1: Speed & Time Delta Trace */}
        <div className="channel-box">
          <div className="channel-header">
            <span className="channel-title">
              CHANNEL 1: VEHICLE SPEED (km/h) & DELTA TIME TRACE (s)
            </span>
            <div className="channel-legend">
              <span className="legend-dot" style={{ background: '#00d4ff' }} /> {driver1Name} Speed
              {telemetryMode === 'compare' && (
                <>
                  <span className="legend-dot" style={{ background: '#ff4060' }} /> {driver2Name} Speed
                  <span className="legend-dot" style={{ background: '#eab308' }} /> Delta Trace (s)
                </>
              )}
            </div>
          </div>
          <div className="channel-chart-wrap" style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryChartData} syncId="motecSync" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="distance" stroke="#64748b" tickFormatter={(v) => `${v}m`} />
                <YAxis yAxisId="speed" stroke="#64748b" domain={[60, 360]} tickFormatter={(v) => `${v}`} />
                {telemetryMode === 'compare' && (
                  <YAxis yAxisId="delta" orientation="right" stroke="#eab308" domain={[-1.0, 1.0]} tickFormatter={(v) => `${v}s`} />
                )}
                <Tooltip content={<CustomTelemetryTooltip />} />
                <Line yAxisId="speed" type="monotone" dataKey="speed1" name={`${driver1Profile.code} Speed`} stroke="#00d4ff" strokeWidth={2} dot={false} unit="km/h" />
                {telemetryMode === 'compare' && (
                  <>
                    <Line yAxisId="speed" type="monotone" dataKey="speed2" name={`${driver2Profile.code} Speed`} stroke="#ff4060" strokeWidth={2} strokeDasharray="4 2" dot={false} unit="km/h" />
                    <Line yAxisId="delta" type="monotone" dataKey="delta_s" name="Time Delta" stroke="#eab308" strokeWidth={1.5} dot={false} unit="s" />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel 2: Throttle & Brake Pedals */}
        <div className="channel-box">
          <div className="channel-header">
            <span className="channel-title">
              CHANNEL 2: PEDAL TELEMETRY — THROTTLE (%) & BRAKE (%)
            </span>
            <div className="channel-legend">
              <span className="legend-dot" style={{ background: '#10b981' }} /> Throttle (%)
              <span className="legend-dot" style={{ background: '#ef4444' }} /> Brake (%)
            </div>
          </div>
          <div className="channel-chart-wrap" style={{ height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryChartData} syncId="motecSync" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="distance" stroke="#64748b" tickFormatter={(v) => `${v}m`} />
                <YAxis stroke="#64748b" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTelemetryTooltip />} />
                <Area type="monotone" dataKey="throttle1" name="Throttle" stroke="#10b981" fill="rgba(16, 185, 129, 0.25)" unit="%" />
                <Area type="monotone" dataKey="brake1" name="Brake" stroke="#ef4444" fill="rgba(239, 68, 68, 0.35)" unit="%" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel 3: 350kW MGU-K Power Flow & Battery State-of-Charge */}
        <div className="channel-box">
          <div className="channel-header">
            <span className="channel-title">
              CHANNEL 3: 50% HYBRID POWERTRAIN — 350kW MGU-K POWER (kW) & BATTERY SOC (%)
            </span>
            <div className="channel-legend">
              <span className="legend-dot" style={{ background: '#8b5cf6' }} /> MGU-K Power (kW)
              <span className="legend-dot" style={{ background: '#38bdf8' }} /> Battery SOC (%)
            </div>
          </div>
          <div className="channel-chart-wrap" style={{ height: '170px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryChartData} syncId="motecSync" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="distance" stroke="#64748b" tickFormatter={(v) => `${v}m`} />
                <YAxis yAxisId="power" stroke="#8b5cf6" domain={[-350, 360]} tickFormatter={(v) => `${v}kW`} />
                <YAxis yAxisId="soc" orientation="right" stroke="#38bdf8" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <ReferenceLine yAxisId="power" y={0} stroke="#475569" strokeDasharray="2 2" />
                <Tooltip content={<CustomTelemetryTooltip />} />
                <Line yAxisId="power" type="monotone" dataKey="mguk_kw1" name="MGU-K Power Flow" stroke="#8b5cf6" strokeWidth={2} dot={false} unit="kW" />
                <Line yAxisId="soc" type="monotone" dataKey="soc1" name="Battery SOC" stroke="#38bdf8" strokeWidth={1.5} dot={false} unit="%" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel 4: Lateral & Longitudinal Acceleration G-Forces */}
        <div className="channel-box">
          <div className="channel-header">
            <span className="channel-title">
              CHANNEL 4: CHASSIS G-FORCES — LATERAL ($G_y$) & LONGITUDINAL ($G_x$)
            </span>
            <div className="channel-legend">
              <span className="legend-dot" style={{ background: '#f59e0b' }} /> Lateral G
              <span className="legend-dot" style={{ background: '#06b6d4' }} /> Longitudinal G
            </div>
          </div>
          <div className="channel-chart-wrap" style={{ height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryChartData} syncId="motecSync" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="distance" stroke="#64748b" tickFormatter={(v) => `${v}m`} />
                <YAxis stroke="#64748b" domain={[-5.0, 6.0]} tickFormatter={(v) => `${v}G`} />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                <Tooltip content={<CustomTelemetryTooltip />} />
                <Line type="monotone" dataKey="g_lat1" name="Lateral G" stroke="#f59e0b" strokeWidth={2} dot={false} unit="G" />
                <Line type="monotone" dataKey="g_long1" name="Longitudinal G" stroke="#06b6d4" strokeWidth={1.5} dot={false} unit="G" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel 5: 4-Wheel Pirelli Tyre Surface Temperatures */}
        <div className="channel-box">
          <div className="channel-header">
            <span className="channel-title">
              CHANNEL 5: PIRELLI 4-WHEEL SURFACE TEMPERATURES (°C) & THERMAL WINDOW
            </span>
            <div className="channel-legend">
              <span className="legend-dot" style={{ background: '#f43f5e' }} /> Front Left (FL)
              <span className="legend-dot" style={{ background: '#fb7185' }} /> Front Right (FR)
              <span className="legend-dot" style={{ background: '#38bdf8' }} /> Rear Left (RL)
              <span className="legend-dot" style={{ background: '#818cf8' }} /> Rear Right (RR)
            </div>
          </div>
          <div className="channel-chart-wrap" style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryChartData} syncId="motecSync" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="distance" stroke="#64748b" tickFormatter={(v) => `${v}m`} />
                <YAxis stroke="#64748b" domain={[70, 150]} tickFormatter={(v) => `${v}°C`} />
                <ReferenceLine y={comp1.optimal} stroke="#eab308" strokeDasharray="3 3" label={{ value: `Optimal ${comp1.short} (${comp1.optimal}°C)`, fill: '#eab308', fontSize: 11 }} />
                <Tooltip content={<CustomTelemetryTooltip />} />
                <Line type="monotone" dataKey="tyre_fl" name="Tyre FL" stroke="#f43f5e" strokeWidth={1.8} dot={false} unit="°C" />
                <Line type="monotone" dataKey="tyre_fr" name="Tyre FR" stroke="#fb7185" strokeWidth={1.8} dot={false} unit="°C" />
                <Line type="monotone" dataKey="tyre_rl" name="Tyre RL" stroke="#38bdf8" strokeWidth={1.8} dot={false} unit="°C" />
                <Line type="monotone" dataKey="tyre_rr" name="Tyre RR" stroke="#818cf8" strokeWidth={1.8} dot={false} unit="°C" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel 6: Active Aero Wing Flap Angle & MOM State */}
        <div className="channel-box">
          <div className="channel-header">
            <span className="channel-title">
              CHANNEL 6: ACTIVE AERODYNAMICS DUAL-MODE FLAP ANGLE (°) & MOM OVERRIDE
            </span>
            <div className="channel-legend">
              <span className="legend-dot" style={{ background: '#22d3ee' }} /> Flap Angle (12° X-Mode vs 24°-30° Z-Mode)
              <span className="legend-dot" style={{ background: '#ec4899' }} /> MOM Boost Flag
            </div>
          </div>
          <div className="channel-chart-wrap" style={{ height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryChartData} syncId="motecSync" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="distance" stroke="#64748b" tickFormatter={(v) => `${v}m`} />
                <YAxis yAxisId="flap" stroke="#22d3ee" domain={[0, 35]} tickFormatter={(v) => `${v}°`} />
                <YAxis yAxisId="mom" orientation="right" stroke="#ec4899" domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => v ? 'MOM' : 'OFF'} />
                <Tooltip content={<CustomTelemetryTooltip />} />
                <Area yAxisId="flap" type="stepAfter" dataKey="flap_angle1" name="Aero Flap Angle" stroke="#22d3ee" fill="rgba(34, 211, 238, 0.2)" unit="°" />
                <Line yAxisId="mom" type="stepAfter" dataKey="mom1" name="MOM Active" stroke="#ec4899" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pirelli 35-Lap Stint Degradation & Pit Strategy Window */}
      {telemetryData1?.stint_projection && (
        <div className="stint-strategy-card">
          <div className="stint-header">
            <div>
              <h3>Pirelli 35-Lap Stint Degradation & Pit Strategy Window</h3>
              <p>
                Calculates thermal decay, mechanical abrasion ({comp1.name}), and optimal pit stop window factoring in fuel burn-off benefit (-0.055s/lap).
              </p>
            </div>
            <div className="compound-badge" style={{ borderColor: comp1.color, color: comp1.color }}>
              {comp1.name} (Optimal Window: {comp1.optimal}°C)
            </div>
          </div>

          <div style={{ width: '100%', height: '240px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData1.stint_projection} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="lap" stroke="#64748b" tickFormatter={(v) => `L${v}`} />
                <YAxis yAxisId="time" stroke="#00d4ff" domain={['dataMin - 0.5', 'dataMax + 0.5']} tickFormatter={(v) => `${v}s`} />
                <YAxis yAxisId="wear" orientation="right" stroke="#ef4444" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val, name) => [val, name]}
                  labelFormatter={(lap) => `Stint Lap ${lap}`}
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
                <Line yAxisId="time" type="monotone" dataKey="lap_time_s" name="Lap Time (s)" stroke="#00d4ff" strokeWidth={2} dot={false} />
                <Line yAxisId="wear" type="monotone" dataKey="tyre_wear_pct" name="Tyre Wear (%)" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Corner Apex Speed & Aerodynamics Engineering Breakdown Table */}
      {telemetryData1?.corner_markers && telemetryData1.corner_markers.length > 0 && (
        <div className="corners-table-card">
          <div className="card-heading">
            <Layers size={18} color="#00d4ff" />
            <h3>Circuit Corner Engineering & Apex Speed Telemetry</h3>
          </div>
          <div className="table-responsive">
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>Corner</th>
                  <th>Distance (m)</th>
                  <th>Apex Speed</th>
                  <th>Active Aero State</th>
                  <th>Downforce Level</th>
                  <th>Tyre Scrub Factor</th>
                </tr>
              </thead>
              <tbody>
                {telemetryData1.corner_markers.slice(0, 12).map((c, i) => (
                  <tr key={i}>
                    <td className="corner-name">{c.name}</td>
                    <td>{c.distance_m} m</td>
                    <td className="speed-val">{c.speed_kmh} km/h</td>
                    <td>
                      <span className="aero-badge z-mode">Z-MODE (28°)</span>
                    </td>
                    <td>Max Apex Grip (Pacejka)</td>
                    <td>High Scrub Heating</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
