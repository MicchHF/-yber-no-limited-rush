import * as THREE from 'three';
import { CyberObstacleType, BiomeInfo } from '../types';

export interface BiomeConfig extends BiomeInfo {
  startDistance: number;
  endDistance: number;
  tubeRadius: number; // Fixed base cylinder radius for this biome
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  ambientColor: number;
  ambientIntensity: number;
  sunColor: number;
  sunIntensity: number;
  tubeBaseColor: number;
  tubeEmissive: number;
  tubeEmissiveIntensity: number;
  railColor1: number;
  railColor2: number;
  ringColor: number;
  obstaclePool: { type: CyberObstacleType; weight: number }[];
}

export const BIOMES: BiomeConfig[] = [
  {
    id: 'neo_metropolis',
    nameRu: 'НЕОНОВЫЙ МЕТРОПОЛИС',
    nameEn: 'NEO METROPOLIS',
    subtitle: 'Кибернетический мегаполис // Скоростная магистраль',
    bannerColor: '#00f0ff',
    accentColor: '#00f0ff',
    startDistance: 0,
    endDistance: 2500,
    tubeRadius: 14.0, // Standard speedway highway
    skyColor: 0x040612,
    fogColor: 0x040718,
    fogDensity: 0.0012,
    ambientColor: 0x38bdf8,
    ambientIntensity: 1.4,
    sunColor: 0xd8b4fe,
    sunIntensity: 2.0,
    tubeBaseColor: 0x060919,
    tubeEmissive: 0x00c8ff,
    tubeEmissiveIntensity: 0.9,
    railColor1: 0x00f0ff,
    railColor2: 0xff007f,
    ringColor: 0x00f0ff,
    obstaclePool: [
      { type: 'vox_pinwheel_cross', weight: 14 },
      { type: 'vox_piston_press', weight: 13 },
      { type: 'vox_stepped_cascade', weight: 13 },
      { type: 'vox_spiral_pillar_tunnel', weight: 14 },
      { type: 'vox_helix_corkscrew', weight: 14 },
      { type: 'vox_aperture_iris', weight: 13 },
      { type: 'vox_dual_counter_rotator', weight: 13 },
      { type: 'colossal_rotating_spokes', weight: 13 },
      { type: 'colossal_voxel_fan', weight: 12 },
      { type: 'vox_slalom_pair', weight: 12 },
      { type: 'vox_slit_cascade', weight: 12 },
      { type: 'vox_archway_tunnel', weight: 11 },
      { type: 'spoke_wheel_gate', weight: 10 },
      { type: 'half_disc_barrier', weight: 9 },
      { type: 'slalom_chicane', weight: 9 },
      { type: 'titan_monolith', weight: 8 },
      { type: 'laser_quad_gate', weight: 7 },
      { type: 'boost_pad', weight: 6 },
      { type: 'energy_prism', weight: 6 },
    ],
  },
  {
    id: 'inferno_core',
    nameRu: 'МАГМАТИЧЕСКИЙ РАЗЛОМ',
    nameEn: 'INFERNO CORE',
    subtitle: 'Вулканический каньон // Вращающиеся лавовые пилы',
    bannerColor: '#ff4500',
    accentColor: '#ff6600',
    startDistance: 2500,
    endDistance: 5000,
    tubeRadius: 10.0, // Narrow, claustrophobic high-intensity magma chasm
    skyColor: 0x220502,
    fogColor: 0x280602,
    fogDensity: 0.0016,
    ambientColor: 0xff5500,
    ambientIntensity: 1.9,
    sunColor: 0xff8800,
    sunIntensity: 2.6,
    tubeBaseColor: 0x2b0803,
    tubeEmissive: 0xff3300,
    tubeEmissiveIntensity: 1.35,
    railColor1: 0xff4500,
    railColor2: 0xffcc00,
    ringColor: 0xff2200,
    obstaclePool: [
      { type: 'vox_piston_press', weight: 14 },
      { type: 'vox_pinwheel_cross', weight: 13 },
      { type: 'vox_stepped_cascade', weight: 12 },
      { type: 'lava_puddle_trap', weight: 13 },
      { type: 'vox_helix_corkscrew', weight: 13 },
      { type: 'vox_aperture_iris', weight: 13 },
      { type: 'vox_dual_counter_rotator', weight: 13 },
      { type: 'colossal_rotating_spokes', weight: 13 },
      { type: 'vox_slalom_pair', weight: 12 },
      { type: 'vox_slit_cascade', weight: 12 },
      { type: 'vox_spiral_pillar_tunnel', weight: 12 },
      { type: 'colossal_voxel_fan', weight: 11 },
      { type: 'magma_grinder', weight: 11 },
      { type: 'slalom_chicane', weight: 10 },
      { type: 'plasma_firewall', weight: 10 },
      { type: 'volcanic_arch_eruption', weight: 10 },
      { type: 'inferno_pillar', weight: 9 },
      { type: 'vox_archway_tunnel', weight: 9 },
      { type: 'half_disc_barrier', weight: 8 },
      { type: 'boost_pad', weight: 6 },
      { type: 'energy_prism', weight: 6 },
    ],
  },
  {
    id: 'cryo_void',
    nameRu: 'КРИОГЕННАЯ БЕЗДНА',
    nameEn: 'CRYO VOID',
    subtitle: 'Полярная туманность // Качающиеся крио-маятники',
    bannerColor: '#00f0ff',
    accentColor: '#67e8f9',
    startDistance: 5000,
    endDistance: 7500,
    tubeRadius: 18.0, // Vast, colossal glacial expanse
    skyColor: 0x01081e,
    fogColor: 0x020a1c,
    fogDensity: 0.0011,
    ambientColor: 0x22d3ee,
    ambientIntensity: 1.5,
    sunColor: 0x67e8f9,
    sunIntensity: 2.1,
    tubeBaseColor: 0x030c22,
    tubeEmissive: 0x0284c7,
    tubeEmissiveIntensity: 0.75,
    railColor1: 0x00f0ff,
    railColor2: 0xff3b00,
    ringColor: 0x00f0ff,
    obstaclePool: [
      { type: 'vox_stepped_cascade', weight: 14 },
      { type: 'vox_pinwheel_cross', weight: 13 },
      { type: 'vox_piston_press', weight: 12 },
      { type: 'ice_slick_patch', weight: 14 },
      { type: 'vox_helix_corkscrew', weight: 14 },
      { type: 'vox_aperture_iris', weight: 13 },
      { type: 'vox_dual_counter_rotator', weight: 13 },
      { type: 'vox_archway_tunnel', weight: 12 },
      { type: 'vox_slalom_pair', weight: 12 },
      { type: 'vox_slit_cascade', weight: 12 },
      { type: 'colossal_voxel_fan', weight: 11 },
      { type: 'vox_spiral_pillar_tunnel', weight: 11 },
      { type: 'cryo_pendulum', weight: 11 },
      { type: 'colossal_rotating_spokes', weight: 11 },
      { type: 'frost_shard_gate', weight: 10 },
      { type: 'cryo_blizzard_vortex', weight: 10 },
      { type: 'slalom_chicane', weight: 9 },
      { type: 'glacier_spikes', weight: 9 },
      { type: 'boost_pad', weight: 5 },
      { type: 'energy_prism', weight: 5 },
    ],
  },
  {
    id: 'quantum_horizon',
    nameRu: 'КВАНТОВЫЙ ГОРИЗОНТ',
    nameEn: 'QUANTUM HORIZON',
    subtitle: 'Аномалия гиперпространства // Квантовые роторы',
    bannerColor: '#c026d3',
    accentColor: '#39ff14',
    startDistance: 7500,
    endDistance: 10000,
    tubeRadius: 12.0, // Agile, warped cyber tunnel
    skyColor: 0x100020,
    fogColor: 0x140124,
    fogDensity: 0.0016,
    ambientColor: 0xa855f7,
    ambientIntensity: 1.8,
    sunColor: 0x39ff14,
    sunIntensity: 2.4,
    tubeBaseColor: 0x180326,
    tubeEmissive: 0x9333ea,
    tubeEmissiveIntensity: 1.3,
    railColor1: 0x39ff14,
    railColor2: 0xf43f5e,
    ringColor: 0x39ff14,
    obstaclePool: [
      { type: 'vox_pinwheel_cross', weight: 14 },
      { type: 'vox_piston_press', weight: 14 },
      { type: 'vox_stepped_cascade', weight: 13 },
      { type: 'vox_helix_corkscrew', weight: 14 },
      { type: 'vox_aperture_iris', weight: 14 },
      { type: 'vox_dual_counter_rotator', weight: 14 },
      { type: 'colossal_rotating_spokes', weight: 13 },
      { type: 'colossal_voxel_fan', weight: 13 },
      { type: 'vox_slalom_pair', weight: 12 },
      { type: 'vox_slit_cascade', weight: 12 },
      { type: 'vox_spiral_pillar_tunnel', weight: 12 },
      { type: 'quantum_rotator', weight: 11 },
      { type: 'void_singularity_rift', weight: 11 },
      { type: 'vox_archway_tunnel', weight: 10 },
      { type: 'slalom_chicane', weight: 9 },
      { type: 'tachyon_warp_gate', weight: 9 },
      { type: 'magma_grinder', weight: 7 },
      { type: 'laser_quad_gate', weight: 5 },
      { type: 'boost_pad', weight: 4 },
      { type: 'energy_prism', weight: 4 },
    ],
  },
  {
    id: 'void_overlord',
    nameRu: 'БЕЗДНА ПУСТОТЫ // БИТВА С БОССОМ',
    nameEn: 'VOID ABYSS // BOSS BATTLE',
    subtitle: 'Флагман «Архитектор Бездны» // Выживите 1200 метров!',
    bannerColor: '#ef4444',
    accentColor: '#dc2626',
    startDistance: 10000,
    endDistance: 11200,
    tubeRadius: 16.0, // Colossal boss combat arena
    skyColor: 0x140420,
    fogColor: 0x160524,
    fogDensity: 0.0008,
    ambientColor: 0x821c4e,
    ambientIntensity: 1.6,
    sunColor: 0xff1055,
    sunIntensity: 2.8,
    tubeBaseColor: 0x180828,
    tubeEmissive: 0x6e0d48,
    tubeEmissiveIntensity: 1.1,
    railColor1: 0xff0055,
    railColor2: 0xa855f7,
    ringColor: 0xec4899,
    obstaclePool: [], // Boss arena has no static obstacle clutter
  },
];

export const CYCLE_LENGTH = 11200;
export const BOSS_START_DIST = 10000;
export const BOSS_END_DIST = 11200;

// Width of the smooth tapering / expanding transition corridor between biomes (±90m -> 180m total)
export const TRANSITION_HALF_WIDTH = 90;

/**
 * Checks if the distance falls within a smooth biome transition zone (narrowing or widening).
 * User mandate: At transition points there must only be smooth narrowing/widening without any obstacles!
 */
export function isBiomeTransitionZone(distance: number): boolean {
  const distInLoop = ((distance % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
  const boundaries = [0, 2500, 5000, 7500, 10000, CYCLE_LENGTH];
  for (const b of boundaries) {
    if (Math.abs(distInLoop - b) <= TRANSITION_HALF_WIDTH + 15) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the exact fixed tube radius for the current biome,
 * with C1 continuous smoothstep interpolation through the clear transition zones.
 */
export function getTubeRadiusAtDistance(distance: number): number {
  const distInLoop = ((distance % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;

  // 1. Transition Boundary 2500 (Metropolis 14m -> Inferno 10m) - Funnel / Narrowing
  if (distInLoop >= 2500 - TRANSITION_HALF_WIDTH && distInLoop <= 2500 + TRANSITION_HALF_WIDTH) {
    const t = (distInLoop - (2500 - TRANSITION_HALF_WIDTH)) / (2 * TRANSITION_HALF_WIDTH);
    const s = t * t * (3 - 2 * t);
    return THREE.MathUtils.lerp(14.0, 10.0, s);
  }

  // 2. Transition Boundary 5000 (Inferno 10m -> Cryo Void 18m) - Grand Expansion / Widening
  if (distInLoop >= 5000 - TRANSITION_HALF_WIDTH && distInLoop <= 5000 + TRANSITION_HALF_WIDTH) {
    const t = (distInLoop - (5000 - TRANSITION_HALF_WIDTH)) / (2 * TRANSITION_HALF_WIDTH);
    const s = t * t * (3 - 2 * t);
    return THREE.MathUtils.lerp(10.0, 18.0, s);
  }

  // 3. Transition Boundary 7500 (Cryo Void 18m -> Quantum Horizon 12m) - Funnel / Narrowing
  if (distInLoop >= 7500 - TRANSITION_HALF_WIDTH && distInLoop <= 7500 + TRANSITION_HALF_WIDTH) {
    const t = (distInLoop - (7500 - TRANSITION_HALF_WIDTH)) / (2 * TRANSITION_HALF_WIDTH);
    const s = t * t * (3 - 2 * t);
    return THREE.MathUtils.lerp(18.0, 12.0, s);
  }

  // 4. Transition Boundary 10000 (Quantum Horizon 12m -> Boss Arena 16m) - Expansion / Widening
  if (distInLoop >= 10000 - TRANSITION_HALF_WIDTH && distInLoop <= 10000 + TRANSITION_HALF_WIDTH) {
    const t = (distInLoop - (10000 - TRANSITION_HALF_WIDTH)) / (2 * TRANSITION_HALF_WIDTH);
    const s = t * t * (3 - 2 * t);
    return THREE.MathUtils.lerp(12.0, 16.0, s);
  }

  // 5. Loop Boundary 11200 / 0 (Boss Arena 16m -> Metropolis 14m)
  if (distInLoop >= 11200 - TRANSITION_HALF_WIDTH) {
    const t = (distInLoop - (11200 - TRANSITION_HALF_WIDTH)) / (2 * TRANSITION_HALF_WIDTH);
    const s = t * t * (3 - 2 * t);
    return THREE.MathUtils.lerp(16.0, 14.0, s);
  }
  if (distInLoop <= TRANSITION_HALF_WIDTH) {
    const t = (distInLoop + TRANSITION_HALF_WIDTH) / (2 * TRANSITION_HALF_WIDTH);
    const s = t * t * (3 - 2 * t);
    return THREE.MathUtils.lerp(16.0, 14.0, s);
  }

  // Inside steady biome regions: return fixed constant radius
  for (const b of BIOMES) {
    if (distInLoop >= b.startDistance && distInLoop < b.endDistance) {
      return b.tubeRadius;
    }
  }

  return 14.0;
}

export function isBossBiome(distance: number): boolean {
  const distInLoop = ((distance % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
  return distInLoop >= BOSS_START_DIST && distInLoop < BOSS_END_DIST;
}

export function getBiomeForDistance(distance: number): BiomeConfig {
  const distInLoop = ((distance % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
  for (const b of BIOMES) {
    if (distInLoop >= b.startDistance && distInLoop < b.endDistance) {
      return b;
    }
  }
  return BIOMES[0];
}

export function pickObstacleForBiome(biome: BiomeConfig, randNormalized?: number, difficultyFactor: number = 0): CyberObstacleType {
  if (!biome.obstaclePool || biome.obstaclePool.length === 0) {
    return 'spoke_wheel_gate';
  }

  // Adjust obstacle weights dynamically based on progression difficulty (0.0 to 1.0)
  const adjustedPool = biome.obstaclePool.map((item) => {
    let weight = item.weight;
    const isPickup = item.type === 'boost_pad' || item.type === 'energy_prism';
    const isComplex =
      item.type === 'quantum_rotator' ||
      item.type === 'cryo_pendulum' ||
      item.type === 'cryo_blizzard_vortex' ||
      item.type === 'volcanic_arch_eruption' ||
      item.type === 'magma_grinder' ||
      item.type === 'void_singularity_rift' ||
      item.type === 'tachyon_warp_gate' ||
      item.type === 'spiral_corkscrew_tunnel' ||
      item.type === 'compression_speed_tunnel';

    if (difficultyFactor < 0.2) {
      // Early start: ultra forgiving, wide openings, high pickups, no punishing rotators
      if (isPickup) weight *= 2.8;
      if (isComplex) weight *= 0.1;
      if (item.type === 'spoke_wheel_gate' || item.type === 'half_disc_barrier') weight *= 2.5;
    } else if (difficultyFactor < 0.35) {
      if (isPickup) weight *= 1.8;
      if (isComplex) weight *= 0.4;
    } else if (difficultyFactor > 0.65) {
      // Late/Master run: increase lethal dynamic obstacles, slight decrease in pickups
      if (isComplex) weight *= 1.6;
      if (isPickup) weight *= 0.7;
    }
    return { type: item.type, weight };
  });

  const totalWeight = adjustedPool.reduce((sum, item) => sum + item.weight, 0);
  let r = (randNormalized !== undefined ? randNormalized : Math.random()) * totalWeight;
  for (const item of adjustedPool) {
    if (r < item.weight) {
      return item.type;
    }
    r -= item.weight;
  }
  return adjustedPool[0].type;
}
