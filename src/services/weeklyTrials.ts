export interface WeeklyTrialDef {
  id: 'speedrun_1' | 'speedrun_2' | 'speedrun_3' | 'speedrun_4' | 'speedrun_5';
  trackIndex: number;
  biomeId: 'neo_metropolis' | 'inferno_core' | 'cryo_void' | 'quantum_horizon' | 'void_overlord';
  nameRu: string;
  nameEn: string;
  subtitle: string;
  distanceMeters: number;
  color: string;
  accentHex: number;
  difficulty: 'Стандарт' | 'Высокая' | 'Эксперт' | 'Экстрим' | 'БОСС';
  description: string;
  hazards: string[];
}

export function getWeeklyTrialInfo() {
  const now = new Date();
  // ISO-8601 week number calculation
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = d.getUTCFullYear();

  // Calculation for days & hours until Sunday 23:59:59 UTC
  const nowUTC = now.getTime();
  // Next Monday 00:00:00 UTC
  const nextMonday = new Date(d);
  nextMonday.setUTCDate(d.getUTCDate() + (8 - (d.getUTCDay() || 7)));
  nextMonday.setUTCHours(0, 0, 0, 0);

  const msRemaining = Math.max(0, nextMonday.getTime() - nowUTC);
  const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return {
    weekNumber,
    year,
    weekId: `${year}-W${weekNumber.toString().padStart(2, '0')}`,
    daysRemaining,
    hoursRemaining,
  };
}

export const WEEKLY_TRIALS: WeeklyTrialDef[] = [
  {
    id: 'speedrun_1',
    trackIndex: 1,
    biomeId: 'neo_metropolis',
    nameRu: 'Испытание 1: Неоновый Метрополис',
    nameEn: 'Trial 1: Neo Metropolis',
    subtitle: 'Скоростные эстакады мегаполиса // Чистый спринт',
    distanceMeters: 1800,
    color: '#00f0ff',
    accentHex: 0x00f0ff,
    difficulty: 'Стандарт',
    description: 'Гладкие связки прямых, вращающиеся ворота со спицами и плотные дуги буст-панелей для идеальной скорости.',
    hazards: ['Ворота со спицами', 'Полудисковые барьеры', 'EMP-мины Enforcer X-1'],
  },
  {
    id: 'speedrun_2',
    trackIndex: 2,
    biomeId: 'inferno_core',
    nameRu: 'Испытание 2: Магматический Разлом',
    nameEn: 'Trial 2: Inferno Core',
    subtitle: 'Вулканический каньон // Лавовые жернова и плазма',
    distanceMeters: 1800,
    color: '#ff4500',
    accentHex: 0xff4500,
    difficulty: 'Высокая',
    description: 'Раскаленные циркулярные лавовые пилы, огнеметные барьеры и магматические бомбы корсара «Пирокласт».',
    hazards: ['Лавовые пилы Grinder', 'Огнеметные барьеры Firewall', 'Магматические кластеры'],
  },
  {
    id: 'speedrun_3',
    trackIndex: 3,
    biomeId: 'cryo_void',
    nameRu: 'Испытание 3: Криогенная Бездна',
    nameEn: 'Trial 3: Cryo Void',
    subtitle: 'Полярная туманность // Качающиеся крио-маятники',
    distanceMeters: 1800,
    color: '#38bdf8',
    accentHex: 0x38bdf8,
    difficulty: 'Эксперт',
    description: 'Резкие маятники со сверхпрочным льдом, кристаллические иглы и ледяные ловушки фантома «Фрост-Вайпер».',
    hazards: ['Крио-маятники', 'Осколочные ледяные врата', 'Криогенные сталактиты'],
  },
  {
    id: 'speedrun_4',
    trackIndex: 4,
    biomeId: 'quantum_horizon',
    nameRu: 'Испытание 4: Квантовый Горизонт',
    nameEn: 'Trial 4: Quantum Horizon',
    subtitle: 'Аномалия гиперпространства // Квантовые роторы',
    distanceMeters: 1800,
    color: '#c026d3',
    accentHex: 0xc026d3,
    difficulty: 'Экстрим',
    description: 'Вращающиеся квантовые лазеры, искривления гравитации и сингулярности хроно-фантома.',
    hazards: ['Квантовые роторы', 'Гравитационные сингулярности', 'Фазовые разломы'],
  },
  {
    id: 'speedrun_5',
    trackIndex: 5,
    biomeId: 'void_overlord',
    nameRu: 'Испытание 5: Арена Босса',
    nameEn: 'Trial 5: Boss Arena',
    subtitle: 'Дуэль с флагманом // Чистый бой на 6000 метров',
    distanceMeters: 6000,
    color: '#ef4444',
    accentHex: 0xef4444,
    difficulty: 'БОСС',
    description: 'Эпическая дуэль с флагманом «Архитектор Бездны» на 6 000 метров без статичных монолитов и препятствий. Только вы, бешеная скорость цилиндра и сокрушительные атаки колоссального корабля!',
    hazards: ['Лазерная зачистка сектора', 'Ковровые мины Пустоты', 'Аннигилятор плазмы', 'Гравитационные волны'],
  },
];

/**
 * Fast deterministic PRNG (Mulberry32)
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
    if (this.state === 0) this.state = 123456789;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public choice<T>(arr: T[]): T {
    const idx = Math.floor(this.next() * arr.length);
    return arr[Math.min(idx, arr.length - 1)];
  }
}

/**
 * Derives a globally fixed seed for a speedrun mode during the current ISO week.
 */
export function getWeeklySpeedrunSeed(mode: string): number {
  const { weekNumber, year } = getWeeklyTrialInfo();
  let trackIdx = 1;
  if (mode === 'speedrun_2') trackIdx = 2;
  if (mode === 'speedrun_3') trackIdx = 3;
  if (mode === 'speedrun_4') trackIdx = 4;
  if (mode === 'speedrun_5') trackIdx = 5;

  return (weekNumber * 884711 + trackIdx * 63729 + year * 9973) >>> 0;
}
