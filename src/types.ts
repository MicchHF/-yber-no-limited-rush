// Speed classes for authentic speed gradations
export type SpeedClass = 'CRUISE' | 'FLOW' | 'APEX' | 'HYPER' | 'WARP' | 'OVERDRIVE';

export type GameMode =
  | 'sprint_30s'    // 30-second high-speed run (authentic Voxotron mode)
  | 'survival'      // Endless cosmic cylinder survival
  | 'speedrun_1'    // Испытание 1: Неоновый Метрополис
  | 'speedrun_2'    // Испытание 2: Магматический Разлом
  | 'speedrun_3'    // Испытание 3: Криогенная Бездна
  | 'speedrun_4'    // Испытание 4: Квантовый Горизонт
  | 'speedrun_5'    // Испытание 5: Арена Босса (6000м)
  | 'daily';        // Daily rotating seed

export type QualityProfile = 'low' | 'medium' | 'high';

export type LightingPresetId = 'nordic_dusk' | 'cyber_neon' | 'deep_obsidian' | 'cosmic_void' | 'solar_flare' | 'aurora_mist';

export interface LightingSettings {
  preset: LightingPresetId;
  ambientIntensity: number;     // 0.1 to 1.5
  sunIntensity: number;         // 0.2 to 2.5
  sunColor: string;             // hex color
  fogDensity: number;           // 0.001 to 0.05
  fogColor: string;             // hex color
  cylinderGlowIntensity: number;// 0.2 to 2.0
  trackColor: string;           // hex color
  shadowsEnabled: boolean;
  bloomEnabled: boolean;
  qualityProfile: QualityProfile;
}

export interface SkinDef {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  tier?: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  scrapPrice?: number;
  previewGradient: string;
  baseColor: string;
  accentColor?: string;
  glowColor: string;
  trailColor: string;
  lore?: string;
  roughness: number;
  metalness: number;
  pattern:
    | 'factory'
    | 'carbon_matrix'
    | 'hazard_tiger'
    | 'imperial_gold'
    | 'synthwave_sunset'
    | 'arctic_hex'
    | 'toxic_venom'
    | 'kaneda_racing'
    | 'sakura_cyber'
    | 'solar_flare'
    | 'electric_violet'
    | 'hyper_cobalt'
    | 'neon_cyberpunk'
    | 'gold_phoenix'
    | 'plasma_aurora'
    | 'hyper_redline';
}

export interface VehicleDef {
  id: string;
  name: string;
  manufacturer?: string;
  vesselClass?: string;
  subtitle: string;
  price: number;
  unlocked: boolean;
  baseColor: string;
  glowColor: string;
  trailColor: string;
  selectedSkinId?: string;
  unlockedSkins?: string[];
  stats: {
    maxSpeed: number;      // 1-5 (affects top speed)
    acceleration: number;  // 1-5 (time to reach hyper/overdrive)
    handling: number;      // 1-5 (cylinder rotation agility)
    grazeRadius: number;   // 1-5 (proximity margin for grazing)
    smoothnessBonus: number;// 1-5 (speed retained in curves)
  };
}

export interface PowerUpActive {
  type: 'boost' | 'shield' | 'magnet' | 'graze_doubler';
  remainingMs: number;
  totalMs: number;
}

export interface GhostFrame {
  z: number;
  angle: number;
  speed: number;
  timeMs: number;
}

export interface TouchControlSettings {
  layout: 'swipe_orbit' | 'buttons' | 'gyro';
  sensitivity: number;
  haptics: boolean;
  invertHorizontal: boolean;
  autoBoost: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardScrap: number;
  completed: boolean;
  claimed: boolean;
  type: 'distance' | 'graze_count' | 'reach_overdrive' | 'complete_30s' | 'smash_voxels';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  reward: number;
}

export interface UserProfile {
  playerName: string;
  syncKey: string;
  coins: number;
  scrapVoxels: number;
  selectedVehicleId: string;
  vehicles: Record<string, VehicleDef>;
  lighting: LightingSettings;
  touchControls: TouchControlSettings;
  bestDistanceSurvival: number;
  bestSprintScore: number;
  bestDailyScore: number;
  speedrunTimes: Record<string, number>;
  quests: DailyQuest[];
  questDate: string;
  achievements: Achievement[];
  stats: {
    totalDistance: number;
    totalGrazes: number;
    overdriveTimeSeconds: number;
    voxelsDestroyed: number;
    runsCompleted: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  displayValue: string;
  vehicleId: string;
  mode: string;
  date: string;
  speedClassReached: SpeedClass;
  maxSpeedKmh: number;
  grazeCount: number;
  ghostData?: GhostFrame[];
}

export type CyberObstacleType =
  | 'spoke_wheel_gate'
  | 'half_disc_barrier'
  | 'spiral_voxel_fan'
  | 'titan_monolith'
  | 'laser_quad_gate'
  | 'magma_grinder'
  | 'inferno_pillar'
  | 'plasma_firewall'
  | 'volcanic_arch_eruption'
  | 'cryo_pendulum'
  | 'glacier_spikes'
  | 'frost_shard_gate'
  | 'cryo_blizzard_vortex'
  | 'quantum_rotator'
  | 'void_singularity_rift'
  | 'tachyon_warp_gate'
  | 'phantom_mine'
  | 'magma_mine'
  | 'cryo_mine'
  | 'quantum_mine'
  | 'boost_pad'
  | 'energy_prism'
  | 'hyper_battery'
  | 'monolith_tower'
  | 'curved_sector_wall'
  | 'slit_gate'
  | 'laser_pylon_gate'
  | 'rotary_barrier'
  | 'shatter_barrier'
  | 'laser_gate'
  | 'magnetic_spire'
  | 'plasma_cross';

export interface BlockedSector {
  minAngle: number;
  maxAngle: number;
  centerAngle?: number;
  halfArc?: number;
}

export interface ObstacleMovement {
  type: 'rotate' | 'sweep' | 'oscillate';
  speed: number;
  baseAngle: number;
  amplitude?: number;
  currentAngle?: number;
}

export interface ObstacleData {
  id: number;
  type: CyberObstacleType;
  mesh: any;
  z: number;
  angle: number;
  depthZ: number;
  blockedSectors?: BlockedSector[];
  arcSpan?: number;
  isSlit?: boolean;
  slitOpeningArc?: number;
  isPickup?: boolean;
  grazed?: boolean;
  collected?: boolean;
  cleared?: boolean;
  safeCenter?: number;
  movement?: ObstacleMovement;
}

export interface BiomeInfo {
  id: string;
  nameRu: string;
  nameEn: string;
  subtitle: string;
  bannerColor: string;
  accentColor: string;
}

export interface PickupFeedback {
  id: number;
  text: string;
  subtext?: string;
  color: string;
  type: 'coin' | 'boost' | 'battery' | 'scrap';
  timestamp: number;
}
