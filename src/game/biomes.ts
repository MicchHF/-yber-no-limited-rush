import { CyberObstacleType, BiomeInfo } from '../types';

export interface BiomeConfig extends BiomeInfo {
  startDistance: number;
  endDistance: number;
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
      { type: 'spoke_wheel_gate', weight: 24 },
      { type: 'half_disc_barrier', weight: 24 },
      { type: 'spiral_voxel_fan', weight: 18 },
      { type: 'laser_quad_gate', weight: 14 },
      { type: 'titan_monolith', weight: 8 },
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
      { type: 'magma_grinder', weight: 22 },
      { type: 'plasma_firewall', weight: 20 },
      { type: 'volcanic_arch_eruption', weight: 20 },
      { type: 'inferno_pillar', weight: 16 },
      { type: 'half_disc_barrier', weight: 10 },
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
    skyColor: 0x01081e,
    fogColor: 0x02112e,
    fogDensity: 0.0015,
    ambientColor: 0x38bdf8,
    ambientIntensity: 1.7,
    sunColor: 0x80dfff,
    sunIntensity: 2.3,
    tubeBaseColor: 0x02132e,
    tubeEmissive: 0x00e5ff,
    tubeEmissiveIntensity: 1.2,
    railColor1: 0x67e8f9,
    railColor2: 0xa5b4fc,
    ringColor: 0x00f0ff,
    obstaclePool: [
      { type: 'cryo_pendulum', weight: 22 },
      { type: 'frost_shard_gate', weight: 20 },
      { type: 'cryo_blizzard_vortex', weight: 20 },
      { type: 'glacier_spikes', weight: 18 },
      { type: 'spiral_voxel_fan', weight: 10 },
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
      { type: 'quantum_rotator', weight: 22 },
      { type: 'void_singularity_rift', weight: 20 },
      { type: 'tachyon_warp_gate', weight: 20 },
      { type: 'magma_grinder', weight: 12 },
      { type: 'cryo_pendulum', weight: 12 },
      { type: 'laser_quad_gate', weight: 6 },
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
      item.type === 'tachyon_warp_gate';

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
