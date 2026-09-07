import { UserProfile, VehicleDef, LeaderboardEntry } from '../types';
import { DEFAULT_LIGHTING } from '../game/lighting';

const STORAGE_KEY = 'voxotron_squeezed_hamster_profile_v2';

export const DEFAULT_VEHICLES: Record<string, VehicleDef> = {
  hamster_interceptor: {
    id: 'hamster_interceptor',
    name: 'Interceptor Mag-Bike',
    subtitle: 'Флагманский магнитный мото-гипер-болид Squeezed Hamster',
    manufacturer: 'HAMSTER DYNAMICS',
    vesselClass: 'INTERCEPTOR CLASS-A',
    selectedSkinId: 'factory_stock',
    unlockedSkins: ['factory_stock'],
    price: 0,
    unlocked: true,
    baseColor: '#eab308', // Amber gold
    glowColor: '#00f0ff', // Neon cyan
    trailColor: '#00f0ff',
    stats: {
      maxSpeed: 3,
      acceleration: 4,
      handling: 4,
      grazeRadius: 3,
      smoothnessBonus: 4,
    },
  },
  hyper_dart: {
    id: 'hyper_dart',
    name: 'Apex Light-Cycle',
    subtitle: 'Сверхскоростной игольчатый кибер-мотоцикл для OVERDRIVE',
    manufacturer: 'KAWASAKI CYBERCORP',
    vesselClass: 'PURSUIT RACER',
    selectedSkinId: 'factory_stock',
    unlockedSkins: ['factory_stock'],
    price: 350,
    unlocked: false,
    baseColor: '#f43f5e', // Ruby crimson
    glowColor: '#fbbf24', // Amber
    trailColor: '#f43f5e',
    stats: {
      maxSpeed: 5,
      acceleration: 5,
      handling: 3,
      grazeRadius: 2,
      smoothnessBonus: 4,
    },
  },
  void_phantom: {
    id: 'void_phantom',
    name: 'Void Phantom Cycle',
    subtitle: 'Стелс-мотоцикл на квантовой магнитной подушке',
    manufacturer: 'CYBERDYNE AEROSPACE',
    vesselClass: 'STEALTH INFILTRATOR',
    selectedSkinId: 'factory_stock',
    unlockedSkins: ['factory_stock'],
    price: 650,
    unlocked: false,
    baseColor: '#18181b', // Obsidian dark
    glowColor: '#a855f7', // Purple neon
    trailColor: '#c084fc',
    stats: {
      maxSpeed: 4,
      acceleration: 4,
      handling: 5,
      grazeRadius: 4,
      smoothnessBonus: 4,
    },
  },
  nebula_drifter: {
    id: 'nebula_drifter',
    name: 'Nebula Mag-Racer',
    subtitle: 'Двухгондольный подрейсер с высокой маневренностью в виражах',
    manufacturer: 'TETSUO ORBITAL',
    vesselClass: 'TWIN-POD DRIFT RACER',
    selectedSkinId: 'factory_stock',
    unlockedSkins: ['factory_stock'],
    price: 900,
    unlocked: false,
    baseColor: '#06b6d4', // Cyan
    glowColor: '#10b981', // Emerald
    trailColor: '#10b981',
    stats: {
      maxSpeed: 4,
      acceleration: 5,
      handling: 5,
      grazeRadius: 5,
      smoothnessBonus: 3,
    },
  },
  overdrive_titan: {
    id: 'overdrive_titan',
    name: 'Titan Juggernaut',
    subtitle: 'Тяжелый магнитный болид-таран с утроенным плазменным ускорителем',
    manufacturer: 'TITAN HEAVY INDUSTRIES',
    vesselClass: 'ARMORED DREADNOUGHT',
    selectedSkinId: 'factory_stock',
    unlockedSkins: ['factory_stock'],
    price: 1300,
    unlocked: false,
    baseColor: '#334155', // Slate
    glowColor: '#f59e0b', // Solar amber
    trailColor: '#f59e0b',
    stats: {
      maxSpeed: 5,
      acceleration: 3,
      handling: 2,
      grazeRadius: 5,
      smoothnessBonus: 5,
    },
  },
  solar_valkyrie: {
    id: 'solar_valkyrie',
    name: 'Solar Valkyrie',
    subtitle: 'Стреловидный гипер-истребитель с плазменными солнечными крыльями',
    manufacturer: 'SOLARIS AEROSPACE',
    vesselClass: 'VARIABLE-GEOMETRY FIGHTER',
    selectedSkinId: 'factory_stock',
    unlockedSkins: ['factory_stock'],
    price: 1600,
    unlocked: false,
    baseColor: '#ff5500', // Radiant solar orange
    glowColor: '#ffee00', // Blazing gold
    trailColor: '#ff3300',
    stats: {
      maxSpeed: 5,
      acceleration: 4,
      handling: 4,
      grazeRadius: 3,
      smoothnessBonus: 5,
    },
  },
  quantum_spectre: {
    id: 'quantum_spectre',
    name: 'Quantum Spectre',
    subtitle: 'Экспериментальный трехкрылый болид на гравитационных антиматерийных кольцах',
    manufacturer: 'QUANTUM REACH LABS',
    vesselClass: 'EXPERIMENTAL GRAV-SHIP',
    selectedSkinId: 'factory_stock',
    unlockedSkins: ['factory_stock'],
    price: 2100,
    unlocked: false,
    baseColor: '#7c3aed', // Deep quantum violet
    glowColor: '#00f0ff', // Electric cyan
    trailColor: '#38bdf8',
    stats: {
      maxSpeed: 5,
      acceleration: 5,
      handling: 5,
      grazeRadius: 4,
      smoothnessBonus: 4,
    },
  },
};

export const FUNNY_PILOT_PREFIXES = [
  'Кибер-',
  'Турбо-',
  'Варп-',
  'Квантовый ',
  'Неоновый ',
  'Шальной ',
  'Хрустящий ',
  'Ультра-',
  'Электро-',
  'Магнитный ',
  'Супер-',
  'Галактический ',
  'Гравитационный ',
  'Дрифт-',
  'Атомный ',
  'Космический ',
  'Плазменный ',
  'Гипер-',
];

export const FUNNY_PILOT_NOUNS = [
  'Хомяк',
  'Пельмень',
  'Тостер',
  'Чебурек',
  'Огурец',
  'Котлета',
  'Коржик',
  'Сухарик',
  'Капибара',
  'Пылесос',
  'Енот',
  'Батон',
  'Бублик',
  'Улитка',
  'Шмыгарь',
  'Крендель',
  'Пирожок',
  'Пингвин',
  'Утконос',
  'Вареник',
  'Байкер',
  'Пончик',
  'Барсук',
  'Шмель',
  'Чайник',
];

export const FUNNY_PILOT_SUFFIXES = [
  ' 3000',
  ' GT',
  ' v8',
  '-77',
  ' Pro',
  ' 99',
  ' Turbo',
  ' MAX',
  ' 007',
  ' Ultra',
  ' Fix',
  ' 404',
  '',
  '',
];

export function generateFunnyPilotName(): string {
  const prefix = FUNNY_PILOT_PREFIXES[Math.floor(Math.random() * FUNNY_PILOT_PREFIXES.length)];
  const noun = FUNNY_PILOT_NOUNS[Math.floor(Math.random() * FUNNY_PILOT_NOUNS.length)];
  const suffix = FUNNY_PILOT_SUFFIXES[Math.floor(Math.random() * FUNNY_PILOT_SUFFIXES.length)];
  return `${prefix}${noun}${suffix}`.trim();
}

export function generateSyncKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = 'HAMSTER-';
  for (let i = 0; i < 6; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function createDefaultProfile(): UserProfile {
  return {
    playerName: generateFunnyPilotName(),
    syncKey: generateSyncKey(),
    coins: 100,
    scrapVoxels: 10,
    selectedVehicleId: 'hamster_interceptor',
    vehicles: { ...DEFAULT_VEHICLES },
    lighting: DEFAULT_LIGHTING,
    touchControls: {
      layout: 'swipe_orbit',
      sensitivity: 1.0,
      haptics: true,
      invertHorizontal: false,
      autoBoost: false,
    },
    bestDistanceSurvival: 0,
    bestSprintScore: 0,
    bestDailyScore: 0,
    speedrunTimes: {},
    questDate: new Date().toISOString().slice(0, 10),
    quests: [
      {
        id: 'q_graze_15',
        title: 'Мастер опасного сближения',
        description: 'Выполните 15 успешных грейзов (Graze) рядом с монолитами',
        target: 15,
        current: 0,
        rewardCoins: 120,
        rewardScrap: 15,
        completed: false,
        claimed: false,
        type: 'graze_count',
      },
      {
        id: 'q_reach_overdrive',
        title: 'Преодоление барьера Overdrive',
        description: 'Разогонитесь свыше 900 км/ч на космическом цилиндре',
        target: 1,
        current: 0,
        rewardCoins: 180,
        rewardScrap: 20,
        completed: false,
        claimed: false,
        type: 'reach_overdrive',
      },
      {
        id: 'q_sprint_trial',
        title: '30-секундный спринт',
        description: 'Завершите заезд в режиме гипер-спринта без столкновений',
        target: 1,
        current: 0,
        rewardCoins: 150,
        rewardScrap: 12,
        completed: false,
        claimed: false,
        type: 'complete_30s',
      },
    ],
    achievements: [
      {
        id: 'ach_first_flight',
        title: 'Первый гипер-старт',
        description: 'Завершите свой первый полет вокруг космического цилиндра',
        unlocked: false,
        progress: 0,
        target: 1,
        reward: 100,
      },
      {
        id: 'ach_hyper_speed',
        title: 'Класс HYPER',
        description: 'Преодолейте рубеж 450 км/ч',
        unlocked: false,
        progress: 0,
        target: 450,
        reward: 150,
      },
      {
        id: 'ach_overdrive',
        title: 'Класс OVERDRIVE',
        description: 'Достигните безумной скорости 900+ км/ч',
        unlocked: false,
        progress: 0,
        target: 900,
        reward: 300,
      },
      {
        id: 'ach_graze_streak_10',
        title: 'Серия грейзов x10',
        description: 'Сделайте непрерывную цепочку из 10 грейзов',
        unlocked: false,
        progress: 0,
        target: 10,
        reward: 200,
      },
      {
        id: 'ach_survivor_5k',
        title: 'Космический марафонец',
        description: 'Преодолейте 5 000 метров в режиме выживания',
        unlocked: false,
        progress: 0,
        target: 5000,
        reward: 350,
      },
    ],
    stats: {
      totalDistance: 0,
      totalGrazes: 0,
      overdriveTimeSeconds: 0,
      voxelsDestroyed: 0,
      runsCompleted: 0,
    },
  };
}

export function loadLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw);
    const defaultProf = createDefaultProfile();

    const mergedVehicles: Record<string, VehicleDef> = {};
    for (const [k, defaultVeh] of Object.entries(DEFAULT_VEHICLES)) {
      const saved = parsed.vehicles?.[k] || {};
      mergedVehicles[k] = {
        ...defaultVeh,
        ...saved,
        stats: {
          ...defaultVeh.stats,
          ...(saved.stats || {}),
        },
        selectedSkinId: saved.selectedSkinId || defaultVeh.selectedSkinId || 'factory_stock',
        unlockedSkins:
          Array.isArray(saved.unlockedSkins) && saved.unlockedSkins.length > 0
            ? saved.unlockedSkins
            : ['factory_stock'],
      };
    }

    // If player has old boring "Pilot_xxx" name, replace with funny name
    let playerName = parsed.playerName || defaultProf.playerName;
    if (!playerName || playerName.startsWith('Pilot_')) {
      playerName = generateFunnyPilotName();
    }

    return {
      ...defaultProf,
      ...parsed,
      playerName,
      vehicles: mergedVehicles,
    };
  } catch (e) {
    return createDefaultProfile();
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage:', e);
  }
}

export async function saveProfileToCloud(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/cloud-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syncKey: profile.syncKey,
        profileData: profile,
      }),
    });
    const data = await response.json();
    return { success: data.success, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Ошибка сети при сохранении в облако' };
  }
}

export async function loadProfileFromCloud(syncKey: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const response = await fetch(`/api/cloud-save/${encodeURIComponent(syncKey)}`);
    const data = await response.json();
    if (data.success && (data.profile || data.profileData)) {
      return { success: true, profile: data.profile || data.profileData };
    }
    return { success: false, error: data.error || 'Ключ не найден в облачной базе' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Сбой соединения с облачным сервером' };
  }
}

export async function fetchLeaderboard(mode: string): Promise<LeaderboardEntry[]> {
  const cacheKey = `voxotron_lb_${mode}`;
  try {
    const res = await fetch(`/api/leaderboard/${encodeURIComponent(mode)}`);
    const data = await res.json();
    if (Array.isArray(data.records) && data.records.length > 0) {
      localStorage.setItem(cacheKey, JSON.stringify(data.records));
      return data.records;
    }
  } catch {
    // Network fallback
  }

  // Fallback to cached entries if offline or network error
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }

  return [];
}

export async function submitLeaderboardScore(scoreData: {
  playerName: string;
  score: number;
  displayValue: string;
  vehicleId: string;
  mode: string;
  speedClassReached?: string;
  maxSpeedKmh?: number;
  grazeCount?: number;
}): Promise<{ success: boolean; rank?: number }> {
  const cacheKey = `voxotron_lb_${scoreData.mode}`;
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData),
    });
    const data = await res.json();

    // Cache user's score locally as well
    try {
      const cached = localStorage.getItem(cacheKey);
      let list: any[] = cached ? JSON.parse(cached) : [];
      list.push({
        id: 'local_' + Date.now(),
        playerName: scoreData.playerName,
        score: scoreData.score,
        displayValue: scoreData.displayValue,
        vehicleId: scoreData.vehicleId,
        date: 'Только что',
        mode: scoreData.mode,
      });
      if (scoreData.mode.startsWith('speedrun')) {
        list.sort((a, b) => a.score - b.score);
      } else {
        list.sort((a, b) => b.score - a.score);
      }
      localStorage.setItem(cacheKey, JSON.stringify(list.slice(0, 50)));
    } catch {
      // ignore
    }

    return data;
  } catch {
    return { success: true };
  }
}

export async function fetchDailyInfo() {
  try {
    const res = await fetch('/api/daily-challenge');
    return await res.json();
  } catch {
    return null;
  }
}
