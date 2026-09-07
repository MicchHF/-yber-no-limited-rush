import { GameMode } from '../types';

export interface WeeklyTrialConfig {
  id: GameMode;
  modeKey: 'speedrun_1' | 'speedrun_2' | 'speedrun_3' | 'speedrun_4' | 'speedrun_5';
  biomeId: 'neo_metropolis' | 'inferno_core' | 'cryo_void' | 'quantum_horizon' | 'void_overlord';
  nameRu: string;
  subtitleRu: string;
  targetDistance: number;
  sectorCount: number;
  color: string;
  seed: number;
  weekLabel: string;
}

/**
 * Calculates ISO 8601 week number and year
 */
export function getIsoWeekNumber(d: Date = new Date()): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: date.getUTCFullYear(), week: weekNo };
}

/**
 * Simple 32-bit hash function from string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Fast Mulberry32 deterministic PRNG
 */
export function createMulberry32(seed: number) {
  let s = seed | 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns the weekly trials configuration with fixed weekly seeds and biomes
 */
export function getWeeklyTrials(date: Date = new Date()): {
  trials: WeeklyTrialConfig[];
  weekLabel: string;
  daysUntilReset: number;
} {
  const { year, week } = getIsoWeekNumber(date);
  const weekLabel = `Сезон ${year} • Неделя ${week}`;

  // Calculate days until next Monday 00:00 UTC
  const now = date.getTime();
  const nextMonday = new Date(date);
  const day = date.getUTCDay();
  const daysUntilNextMonday = ((7 - day) % 7) || 7;
  nextMonday.setUTCDate(date.getUTCDate() + daysUntilNextMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);
  const diffMs = Math.max(0, nextMonday.getTime() - now);
  const daysUntilReset = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const trials: WeeklyTrialConfig[] = [
    {
      id: 'speedrun_1',
      modeKey: 'speedrun_1',
      biomeId: 'neo_metropolis',
      nameRu: 'Испытание 1: Неоновый Метрополис',
      subtitleRu: 'Сверхзвуковой хайвей через ночной мегаполис [9 000м]',
      targetDistance: 9000,
      sectorCount: 6,
      color: '#00f0ff',
      seed: hashString(`${year}-W${week}-trial-neo_metropolis`),
      weekLabel,
    },
    {
      id: 'speedrun_2',
      modeKey: 'speedrun_2',
      biomeId: 'inferno_core',
      nameRu: 'Испытание 2: Магматический Разлом',
      subtitleRu: 'Вулканический каньон с вращающимися лавовыми пилами [12 000м]',
      targetDistance: 12000,
      sectorCount: 8,
      color: '#ff4500',
      seed: hashString(`${year}-W${week}-trial-inferno_core`),
      weekLabel,
    },
    {
      id: 'speedrun_3',
      modeKey: 'speedrun_3',
      biomeId: 'cryo_void',
      nameRu: 'Испытание 3: Криогенная Бездна',
      subtitleRu: 'Полярная туманность с качающимися крио-маятниками [15 000м]',
      targetDistance: 15000,
      sectorCount: 10,
      color: '#38bdf8',
      seed: hashString(`${year}-W${week}-trial-cryo_void`),
      weekLabel,
    },
    {
      id: 'speedrun_4',
      modeKey: 'speedrun_4',
      biomeId: 'quantum_horizon',
      nameRu: 'Испытание 4: Квантовый Горизонт',
      subtitleRu: 'Аномалия гиперпространства с квантовыми роторами [18 000м]',
      targetDistance: 18000,
      sectorCount: 12,
      color: '#c026d3',
      seed: hashString(`${year}-W${week}-trial-quantum_horizon`),
      weekLabel,
    },
    {
      id: 'speedrun_5',
      modeKey: 'speedrun_5',
      biomeId: 'void_overlord',
      nameRu: 'Испытание 5: Арена Босса',
      subtitleRu: 'Флагман «Архитектор Бездны» // Чистая дуэль с боссом [6 000м]',
      targetDistance: 6000,
      sectorCount: 10,
      color: '#ef4444',
      seed: hashString(`${year}-W${week}-trial-boss_battle`),
      weekLabel,
    },
  ];

  return { trials, weekLabel, daysUntilReset };
}

/**
 * Checks if a gameMode is one of the speedrun trials
 */
export function isSpeedrunTrial(mode: GameMode): boolean {
  return mode === 'speedrun_1' || mode === 'speedrun_2' || mode === 'speedrun_3' || mode === 'speedrun_4' || mode === 'speedrun_5';
}
