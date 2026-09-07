import { LightingSettings, LightingPresetId } from '../types';

export const LIGHTING_PRESETS: Record<LightingPresetId, LightingSettings> = {
  cosmic_void: {
    preset: 'cosmic_void',
    ambientIntensity: 0.35,
    sunIntensity: 1.2,
    sunColor: '#93c5fd', // Cool stellar blue
    fogDensity: 0.008,
    fogColor: '#090b10', // Deep cosmic charcoal
    cylinderGlowIntensity: 0.8,
    trackColor: '#181f2c',
    shadowsEnabled: true,
    bloomEnabled: true,
    qualityProfile: 'high',
  },
  nordic_dusk: {
    preset: 'nordic_dusk',
    ambientIntensity: 0.45,
    sunIntensity: 0.9,
    sunColor: '#38bdf8', // Nordic cyan
    fogDensity: 0.012,
    fogColor: '#0b131e', // Slate night
    cylinderGlowIntensity: 0.7,
    trackColor: '#111e2e',
    shadowsEnabled: true,
    bloomEnabled: true,
    qualityProfile: 'high',
  },
  deep_obsidian: {
    preset: 'deep_obsidian',
    ambientIntensity: 0.25,
    sunIntensity: 1.4,
    sunColor: '#f1f5f9', // Clean silver-white
    fogDensity: 0.007,
    fogColor: '#050608', // Pure obsidian
    cylinderGlowIntensity: 0.9,
    trackColor: '#12141a',
    shadowsEnabled: true,
    bloomEnabled: true,
    qualityProfile: 'high',
  },
  solar_flare: {
    preset: 'solar_flare',
    ambientIntensity: 0.4,
    sunIntensity: 1.3,
    sunColor: '#fbbf24', // Warm stellar amber
    fogDensity: 0.01,
    fogColor: '#171109', // Dark amber mist
    cylinderGlowIntensity: 0.85,
    trackColor: '#241a10',
    shadowsEnabled: true,
    bloomEnabled: true,
    qualityProfile: 'high',
  },
  cyber_neon: {
    preset: 'cyber_neon',
    ambientIntensity: 0.3,
    sunIntensity: 1.1,
    sunColor: '#c084fc', // Subtle violet
    fogDensity: 0.009,
    fogColor: '#0d0914', // Deep neon dusk
    cylinderGlowIntensity: 1.1,
    trackColor: '#1a1228',
    shadowsEnabled: true,
    bloomEnabled: true,
    qualityProfile: 'high',
  },
  aurora_mist: {
    preset: 'aurora_mist',
    ambientIntensity: 0.4,
    sunIntensity: 1.0,
    sunColor: '#34d399', // Aurora emerald
    fogDensity: 0.011,
    fogColor: '#081412', // Deep pine aurora
    cylinderGlowIntensity: 0.8,
    trackColor: '#0e2320',
    shadowsEnabled: true,
    bloomEnabled: true,
    qualityProfile: 'high',
  },
};

export interface LightingPresetItem {
  id: LightingPresetId;
  name: string;
  description: string;
  settings: LightingSettings;
}

export const LIGHTING_PRESETS_LIST: LightingPresetItem[] = [
  {
    id: 'cosmic_void',
    name: 'Космическая бездна (Cosmic Void)',
    description: 'Глубокий угольный космос со звездным сиянием и высокой контрастностью',
    settings: LIGHTING_PRESETS.cosmic_void,
  },
  {
    id: 'nordic_dusk',
    name: 'Нордические сумерки (Nordic Dusk)',
    description: 'Холодная сине-голубая палитра с мягкой дымкой',
    settings: LIGHTING_PRESETS.nordic_dusk,
  },
  {
    id: 'deep_obsidian',
    name: 'Глубокий обсидиан (Deep Obsidian)',
    description: 'Минималистичный монохром высокой четкости',
    settings: LIGHTING_PRESETS.deep_obsidian,
  },
  {
    id: 'solar_flare',
    name: 'Солнечная вспышка (Solar Flare)',
    description: 'Теплый янтарно-золотой закат с золотым шлейфом',
    settings: LIGHTING_PRESETS.solar_flare,
  },
  {
    id: 'cyber_neon',
    name: 'Киберпанк неон (Cyber Neon)',
    description: 'Фиолетово-пурпурное сияние с ярким неоновым свечением',
    settings: LIGHTING_PRESETS.cyber_neon,
  },
  {
    id: 'aurora_mist',
    name: 'Полярное сияние (Aurora Mist)',
    description: 'Изумрудно-бирюзовая туманность',
    settings: LIGHTING_PRESETS.aurora_mist,
  },
];

export const DEFAULT_LIGHTING: LightingSettings = LIGHTING_PRESETS.cosmic_void;
