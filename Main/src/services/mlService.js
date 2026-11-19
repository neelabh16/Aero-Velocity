/**
 * ML & Physics Service - 2026 Season API client
 * Handles communication with the 2026 F1 active aerodynamics and hybrid physics backend.
 */

const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

class MLService {
  /**
   * Generic API request handler
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${ML_API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`ML API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.request('/health');
  }

  /**
   * Get 2026 official technical regulations and physical constants
   */
  async getSeason2026Specs() {
    return this.request('/season-2026/specs');
  }

  /**
   * Get all available tracks
   */
  async getTracks() {
    return this.request('/tracks');
  }

  /**
   * Analyze a team at a specific track under 2026 regulations
   * @param {string} teamName - Name of the team
   * @param {string} trackName - Name of the track
   */
  async analyzeTeam(teamName, trackName) {
    return this.request('/analyze/team', {
      method: 'POST',
      body: JSON.stringify({
        team_name: teamName,
        track_name: trackName,
      }),
    });
  }

  /**
   * Analyze specific 2026 components
   */
  async analyzeComponents(teamName, aeroConfig = {}, trackName = null) {
    return this.request('/analyze/components', {
      method: 'POST',
      body: JSON.stringify({
        team_name: teamName,
        aero_config: aeroConfig,
        track_name: trackName,
      }),
    });
  }

  /**
   * Predict 2026 performance
   */
  async predictPerformance(aeroConfig, trackName = null) {
    return this.request('/predict/performance', {
      method: 'POST',
      body: JSON.stringify({
        aero_config: aeroConfig,
        track_name: trackName,
      }),
    });
  }

  /**
   * Simulate lap time with 2026 Active Aero & 50% Hybrid Powertrain
   */
  async simulateLap(aeroConfig, carParams = {}, trackName = 'Monaco', activeAeroMode = 'AUTO', momActive = true) {
    return this.request('/simulate/lap', {
      method: 'POST',
      body: JSON.stringify({
        aero_config: aeroConfig,
        car_params: carParams,
        track_name: trackName,
        active_aero_mode: activeAeroMode,
        mom_active: momActive
      }),
    });
  }

  /**
   * Simulate circuit-specific analysis
   */
  async simulateCircuit(trackName, aeroConfig, activeAeroMode = 'AUTO', momActive = true) {
    return this.request('/simulate/circuit', {
      method: 'POST',
      body: JSON.stringify({
        track_name: trackName,
        aero_config: aeroConfig,
        active_aero_mode: activeAeroMode,
        mom_active: momActive
      }),
    });
  }

  /**
   * Compare two teams under 2026 regulations
   */
  async compareTeams(team1, team2, trackName) {
    return this.request('/compare/teams', {
      method: 'POST',
      body: JSON.stringify({
        team1,
        team2,
        track_name: trackName,
      }),
    });
  }

  /**
   * Recommend 2026 regulation upgrades
   */
  async recommendUpgrades(aeroConfig, budget = 500, upcomingTracks = []) {
    return this.request('/upgrades/recommend', {
      method: 'POST',
      body: JSON.stringify({
        aero_config: aeroConfig,
        budget,
        upcoming_tracks: upcomingTracks,
      }),
    });
  }

  /**
   * Get 2026 corner performance matrix
   */
  async getCornerPerformance(trackName) {
    return this.request(`/corner-performance/${trackName}`, {
      method: 'GET',
    });
  }

  /**
   * Get 2026 Pirelli tyre compound technical specifications
   */
  async getPirelliCompounds() {
    return this.request('/pirelli/compounds');
  }

  /**
   * Get 2026 official driver roster with physics ratings
   */
  async getDriverRatings() {
    return this.request('/drivers/ratings');
  }

  /**
   * Get 2026 track environmental and asphalt micro-profiles
   */
  async getTrackProfiles() {
    return this.request('/tracks/profiles');
  }

  /**
   * Simulate complete 120-point multi-channel telemetry trace and 35-lap stint wear
   */
  async simulateTelemetryLap(params = {}) {
    return this.request('/telemetry/simulate-lap', {
      method: 'POST',
      body: JSON.stringify({
        track_name: params.trackName || 'Silverstone',
        team_name: params.teamName || 'McLaren',
        driver_name: params.driverName || 'Lando Norris',
        compound_code: params.compoundCode || 'C3_MEDIUM',
        track_temp_c: params.trackTempC !== undefined ? params.trackTempC : 38.0,
        air_temp_c: params.airTempC !== undefined ? params.airTempC : 24.0,
        track_condition: params.trackCondition || 'dry',
        rubber_level: params.rubberLevel || 'rubbered',
        wind_speed_kmh: params.windSpeedKmh !== undefined ? params.windSpeedKmh : 12.0,
        wind_direction: params.windDirection || 'headwind',
        active_aero_mode: params.activeAeroMode || 'AUTO',
        mom_boost_enabled: params.momBoostEnabled !== undefined ? params.momBoostEnabled : true,
        stint_lap: params.stintLap || 1,
      }),
    });
  }

  /**
   * Compare two drivers/teams with distance-synchronized telemetry and delta time trace
   */
  async compareDriverTelemetry(params = {}) {
    return this.request('/telemetry/compare-drivers', {
      method: 'POST',
      body: JSON.stringify({
        track_name: params.trackName || 'Silverstone',
        driver1_name: params.driver1Name || 'Lando Norris',
        team1_name: params.team1Name || 'McLaren',
        compound1_code: params.compound1Code || 'C3_MEDIUM',
        driver2_name: params.driver2Name || 'Max Verstappen',
        team2_name: params.team2Name || 'Red Bull Ford',
        compound2_code: params.compound2Code || 'C3_MEDIUM',
        track_temp_c: params.trackTempC !== undefined ? params.trackTempC : 38.0,
        air_temp_c: params.airTempC !== undefined ? params.airTempC : 24.0,
        track_condition: params.trackCondition || 'dry',
        rubber_level: params.rubberLevel || 'rubbered',
        wind_speed_kmh: params.windSpeedKmh !== undefined ? params.windSpeedKmh : 12.0,
        wind_direction: params.windDirection || 'headwind',
        active_aero_mode: params.activeAeroMode || 'AUTO',
        mom_boost_enabled: params.momBoostEnabled !== undefined ? params.momBoostEnabled : true,
      }),
    });
  }

  /**
   * Build 2026 aero config from UI inputs
   */
  buildAeroConfig(params = {}) {
    return {
      drag_coefficient: params.dragCoefficient || 1.15,
      x_mode_drag: params.xModeDrag || 0.54,
      cl_front: params.clFront || 1.30,
      cl_rear: params.clRear || 1.65,
      front_wing_angle: params.frontWingAngle || 24,
      rear_wing_angle: params.rearWingAngle || 32,
      ride_height_front: params.rideHeightFront || 16.0,
      ride_height_rear: params.rideHeightRear || 24.0,
    };
  }

  /**
   * Build 2026 car params from UI inputs
   */
  buildCarParams(params = {}) {
    return {
      mass: params.mass || 768, // 2026 FIA min mass: 768 kg (-30 kg)
      ice_power: params.icePower || 400000, // 400 kW
      mguk_power: params.mgukPower || 350000, // 350 kW (3x 2025)
      power: params.power || 750000, // 750 kW total (~1005 HP)
      tire_grip: params.tireGrip || 1.85,
    };
  }
}

// Create singleton instance
const mlService = new MLService();

export default mlService;

// Official 2026 Teams Grid (11 Teams)
export const TEAMS = [
  'McLaren',
  'Ferrari',
  'Red Bull Ford',
  'Mercedes',
  'Aston Martin',
  'Audi Revolut',
  'Williams',
  'Racing Bulls',
  'Haas F1 Team',
  'Alpine',
  'Cadillac Formula 1 Team',
];

// Official 2026 Aerodynamic & Powertrain Components
export const AERODYNAMIC_COMPONENTS = [
  'Active Front Wing',
  'Active Rear Wing',
  'Narrow Floor Tunnels',
  '350kW MGU-K Powertrain',
  'Diffuser Expansion',
  'Sidepod Cooling Intakes',
  'Battery Cooling Pack',
  'Sustainable Fuel Injector',
  'Wheel Wake Deflectors',
  'Halo Fairing',
];

// Official 2026 Pirelli Compounds List
export const PIRELLI_COMPOUNDS_LIST = [
  { code: 'C1_HARD', name: 'C1 Hardest (White)', short: 'C1', color: '#e2e8f0', optimal: 125 },
  { code: 'C2_HARD', name: 'C2 Hard (White)', short: 'C2', color: '#cbd5e1', optimal: 120 },
  { code: 'C3_MEDIUM', name: 'C3 Medium (Yellow)', short: 'C3', color: '#eab308', optimal: 115 },
  { code: 'C4_SOFT', name: 'C4 Soft (Red)', short: 'C4', color: '#ef4444', optimal: 105 },
  { code: 'C5_SUPERSOFT', name: 'C5 SuperSoft (Red)', short: 'C5', color: '#dc2626', optimal: 98 },
  { code: 'INTERMEDIATE', name: 'Cinturato Intermediate (Green)', short: 'INT', color: '#10b981', optimal: 78 },
  { code: 'WET', name: 'Cinturato Full Wet (Blue)', short: 'WET', color: '#3b82f6', optimal: 65 },
];

// Official 2026 22-Driver Roster
export const DRIVERS_2026_LIST = [
  { name: 'Lando Norris', code: 'NOR', team: 'McLaren', number: 4 },
  { name: 'Oscar Piastri', code: 'PIA', team: 'McLaren', number: 81 },
  { name: 'Charles Leclerc', code: 'LEC', team: 'Ferrari', number: 16 },
  { name: 'Lewis Hamilton', code: 'HAM', team: 'Ferrari', number: 44 },
  { name: 'Max Verstappen', code: 'VER', team: 'Red Bull Ford', number: 1 },
  { name: 'Isack Hadjar', code: 'HAD', team: 'Red Bull Ford', number: 6 },
  { name: 'George Russell', code: 'RUS', team: 'Mercedes', number: 63 },
  { name: 'Kimi Antonelli', code: 'ANT', team: 'Mercedes', number: 12 },
  { name: 'Fernando Alonso', code: 'ALO', team: 'Aston Martin', number: 14 },
  { name: 'Lance Stroll', code: 'STR', team: 'Aston Martin', number: 18 },
  { name: 'Nico Hülkenberg', code: 'HUL', team: 'Audi Revolut', number: 27 },
  { name: 'Gabriel Bortoleto', code: 'BOR', team: 'Audi Revolut', number: 5 },
  { name: 'Carlos Sainz', code: 'SAI', team: 'Williams', number: 55 },
  { name: 'Alexander Albon', code: 'ALB', team: 'Williams', number: 23 },
  { name: 'Liam Lawson', code: 'LAW', team: 'Racing Bulls', number: 30 },
  { name: 'Arvid Lindblad', code: 'LIN', team: 'Racing Bulls', number: 41 },
  { name: 'Esteban Ocon', code: 'OCO', team: 'Haas F1 Team', number: 31 },
  { name: 'Oliver Bearman', code: 'BEA', team: 'Haas F1 Team', number: 87 },
  { name: 'Pierre Gasly', code: 'GAS', team: 'Alpine', number: 10 },
  { name: 'Franco Colapinto', code: 'COL', team: 'Alpine', number: 43 },
  { name: 'Sergio Pérez', code: 'PER', team: 'Cadillac Formula 1 Team', number: 11 },
  { name: 'Valtteri Bottas', code: 'BOT', team: 'Cadillac Formula 1 Team', number: 77 },
];
