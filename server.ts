import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

// Persistent data files on server
const DATA_DIR = path.join(process.cwd(), "data");
const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");
const CLOUD_SAVES_FILE = path.join(DATA_DIR, "cloud_saves.json");

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.error("Failed to create data dir:", e);
  }
}

// In-memory data stores with default seeds
interface CloudSaveData {
  syncKey: string;
  updatedAt: number;
  profile: any;
}

interface LeaderboardRecord {
  id: string;
  playerName: string;
  score: number; // distance in meters or time in milliseconds
  displayValue: string;
  vehicleId: string;
  date: string;
  mode: string; // 'survival' | 'speedrun_1' | 'speedrun_2' | 'speedrun_3' | 'speedrun_4' | 'speedrun_5' | 'daily'
  ghostPath?: Array<{ x: number; y: number; z: number; time: number; speed: number }>;
}

function loadSavedCloudSaves(): Record<string, CloudSaveData> {
  ensureDataDir();
  try {
    if (fs.existsSync(CLOUD_SAVES_FILE)) {
      const content = fs.readFileSync(CLOUD_SAVES_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (e) {
    console.error("Failed to load saved cloud saves:", e);
  }
  return {};
}

function persistCloudSaves() {
  ensureDataDir();
  try {
    fs.writeFileSync(CLOUD_SAVES_FILE, JSON.stringify(cloudSaves, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist cloud saves:", e);
  }
}

const cloudSaves: Record<string, CloudSaveData> = loadSavedCloudSaves();

// Initial realistic leaderboards with funny pilot names
const initialLeaderboards: LeaderboardRecord[] = [
  // Survival (meters)
  { id: "s1", playerName: "Кибер-Хомяк GT", score: 8420, displayValue: "8,420 m", vehicleId: "cyber_runner", date: "Сегодня", mode: "survival" },
  { id: "s2", playerName: "Турбо-Пельмень", score: 6750, displayValue: "6,750 m", vehicleId: "voxel_speeder", date: "Вчера", mode: "survival" },
  { id: "s3", playerName: "Шальной Тостер 3000", score: 5310, displayValue: "5,310 m", vehicleId: "hamster_buggy", date: "2 дня назад", mode: "survival" },
  { id: "s4", playerName: "Квантовая Капибара", score: 4190, displayValue: "4,190 m", vehicleId: "heavy_rover", date: "3 дня назад", mode: "survival" },
  { id: "s5", playerName: "Атомный Чебурек", score: 3280, displayValue: "3,280 m", vehicleId: "hover_craft", date: "4 дня назад", mode: "survival" },
  { id: "s6", playerName: "Хрустящий Коржик", score: 2640, displayValue: "2,640 m", vehicleId: "hamster_buggy", date: "5 дней назад", mode: "survival" },

  // Speedrun Track 1 (seconds: lower is better)
  { id: "sp1_1", playerName: "Ультра-Шмыгарь Pro", score: 28450, displayValue: "00:28.45", vehicleId: "voxel_speeder", date: "Сегодня", mode: "speedrun_1" },
  { id: "sp1_2", playerName: "Космический Бублик", score: 30120, displayValue: "00:30.12", vehicleId: "cyber_runner", date: "Вчера", mode: "speedrun_1" },
  { id: "sp1_3", playerName: "Гравитационный Огурец", score: 32600, displayValue: "00:32.60", vehicleId: "hamster_buggy", date: "2 дня назад", mode: "speedrun_1" },
  { id: "sp1_4", playerName: "Неоновый Енот MAX", score: 34950, displayValue: "00:34.95", vehicleId: "hover_craft", date: "3 дня назад", mode: "speedrun_1" },

  // Speedrun Track 2
  { id: "sp2_1", playerName: "Магнитный Вареник", score: 38200, displayValue: "00:38.20", vehicleId: "cyber_runner", date: "Сегодня", mode: "speedrun_2" },
  { id: "sp2_2", playerName: "Варп-Пылесос 007", score: 41150, displayValue: "00:41.15", vehicleId: "voxel_speeder", date: "Вчера", mode: "speedrun_2" },
  { id: "sp2_3", playerName: "Плазменный Крендель", score: 43800, displayValue: "00:43.80", vehicleId: "heavy_rover", date: "4 дня назад", mode: "speedrun_2" },

  // Speedrun Track 3
  { id: "sp3_1", playerName: "Дрифт-Утконос v8", score: 49100, displayValue: "00:49.10", vehicleId: "cyber_runner", date: "Сегодня", mode: "speedrun_3" },
  { id: "sp3_2", playerName: "Супер-Сухарик", score: 52400, displayValue: "00:52.40", vehicleId: "hover_craft", date: "Вчера", mode: "speedrun_3" },

  // Speedrun Track 4
  { id: "sp4_1", playerName: "Квазарный Стриж", score: 59800, displayValue: "00:59.80", vehicleId: "voxel_speeder", date: "Сегодня", mode: "speedrun_4" },
  { id: "sp4_2", playerName: "Турбо-Пельмень", score: 63250, displayValue: "01:03.25", vehicleId: "cyber_runner", date: "Вчера", mode: "speedrun_4" },

  // Speedrun Track 5 (Boss Fight: Arch-Titan)
  { id: "sp5_1", playerName: "Архитектор Победы", score: 78900, displayValue: "01:18.90", vehicleId: "cyber_runner", date: "Сегодня", mode: "speedrun_5" },
  { id: "sp5_2", playerName: "Кибер-Хомяк GT", score: 84300, displayValue: "01:24.30", vehicleId: "voxel_speeder", date: "Вчера", mode: "speedrun_5" },

  // Daily Challenge
  { id: "d1", playerName: "Кибер-Хомяк GT", score: 7120, displayValue: "7,120 m", vehicleId: "cyber_runner", date: "Сегодня", mode: "daily" },
  { id: "d2", playerName: "Шальной Тостер 3000", score: 5890, displayValue: "5,890 m", vehicleId: "hamster_buggy", date: "Сегодня", mode: "daily" },
  { id: "d3", playerName: "Квантовая Капибара", score: 4650, displayValue: "4,650 m", vehicleId: "voxel_speeder", date: "Сегодня", mode: "daily" },
];

function loadSavedLeaderboards(): LeaderboardRecord[] {
  ensureDataDir();
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const content = fs.readFileSync(LEADERBOARD_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load saved leaderboards:", e);
  }
  return [...initialLeaderboards];
}

function persistLeaderboards() {
  ensureDataDir();
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboardStore, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist leaderboards:", e);
  }
}

let leaderboardStore: LeaderboardRecord[] = loadSavedLeaderboards();

// Ghost racers for real-time race simulations
const ghostRacerTemplates = [
  { name: "Кибер-Хомяк", vehicleId: "hamster_buggy", color: "#f59e0b", avgSpeed: 38, style: "aggressive" },
  { name: "Варп-Пылесос", vehicleId: "voxel_speeder", color: "#38bdf8", avgSpeed: 44, style: "balanced" },
  { name: "Тостер 3000", vehicleId: "heavy_rover", color: "#a855f7", avgSpeed: 34, style: "steady" },
  { name: "Турбо-Пельмень", vehicleId: "cyber_runner", color: "#22c55e", avgSpeed: 48, style: "speedrunner" },
];

// API: Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", studio: "Squeezed Hamster Games", engine: "Voxotron Mobile Voxel Engine" });
});

// Helper for saving cloud profile
const handleCloudSave = (req: express.Request, res: express.Response) => {
  const { syncKey, profile, profileData } = req.body;
  const p = profile || profileData;
  if (!syncKey || !p) {
    return res.status(400).json({ error: "syncKey and profile are required" });
  }

  cloudSaves[syncKey] = {
    syncKey,
    updatedAt: Date.now(),
    profile: p,
  };

  persistCloudSaves();

  res.json({ success: true, syncKey, savedAt: cloudSaves[syncKey].updatedAt });
};

// API: Cloud Save (both endpoint variants)
app.post("/api/cloud/save", handleCloudSave);
app.post("/api/cloud-save", handleCloudSave);

// Helper for loading cloud profile
const handleCloudLoad = (req: express.Request, res: express.Response) => {
  const syncKey = req.params.syncKey;
  const save = cloudSaves[syncKey];
  if (!save) {
    return res.status(404).json({ error: "Save not found for key: " + syncKey });
  }
  res.json({ success: true, profile: save.profile, profileData: save.profile, updatedAt: save.updatedAt });
};

// API: Cloud Load (both endpoint variants)
app.get("/api/cloud/load/:syncKey", handleCloudLoad);
app.get("/api/cloud-save/:syncKey", handleCloudLoad);

// Helper for fetching leaderboards
const handleGetLeaderboards = (req: express.Request, res: express.Response) => {
  const mode = req.params.mode || (req.query.mode as string) || "survival";
  const records = leaderboardStore
    .filter((r) => r.mode === mode)
    .sort((a, b) => {
      if (mode.startsWith("speedrun")) {
        return a.score - b.score;
      }
      return b.score - a.score;
    })
    .slice(0, 50);

  res.json({ success: true, mode, records });
};

// API: Leaderboards GET (supports /api/leaderboards, /api/leaderboard, and /api/leaderboard/:mode)
app.get("/api/leaderboards", handleGetLeaderboards);
app.get("/api/leaderboard", handleGetLeaderboards);
app.get("/api/leaderboard/:mode", handleGetLeaderboards);

// Helper for submitting scores
const handleSubmitLeaderboard = (req: express.Request, res: express.Response) => {
  const { playerName, score, displayValue, vehicleId, mode, ghostPath } = req.body;
  if (!playerName || typeof score !== "number" || !mode) {
    return res.status(400).json({ error: "Invalid submission data" });
  }

  const newRecord: LeaderboardRecord = {
    id: "rec_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    playerName: String(playerName).slice(0, 24),
    score,
    displayValue: displayValue || String(score),
    vehicleId: vehicleId || "hamster_buggy",
    date: "Только что",
    mode,
    ghostPath: Array.isArray(ghostPath) ? ghostPath.slice(0, 120) : undefined,
  };

  leaderboardStore.push(newRecord);
  persistLeaderboards();

  // Determine rank
  const sorted = leaderboardStore
    .filter((r) => r.mode === mode)
    .sort((a, b) => (mode.startsWith("speedrun") ? a.score - b.score : b.score - a.score));

  const rank = sorted.findIndex((r) => r.id === newRecord.id) + 1;

  res.json({ success: true, record: newRecord, rank, total: sorted.length });
};

// API: Leaderboard SUBMIT (both endpoint variants)
app.post("/api/leaderboard/submit", handleSubmitLeaderboard);
app.post("/api/leaderboard", handleSubmitLeaderboard);

// API: Real-time Live Ghost Racers
app.get("/api/ghost-racers", (req, res) => {
  const mode = (req.query.mode as string) || "survival";
  // Select 3-4 ghost racers to populate the race track
  res.json({
    racers: ghostRacerTemplates.map((template, idx) => ({
      ...template,
      id: `ghost_${idx}`,
      startDelay: idx * 0.8,
    })),
  });
});

// API: Daily Challenge info (Weekly landscape theme)
app.get("/api/daily-info", (_req, res) => {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const weekNum = Math.ceil(dayOfYear / 7);

  const weeklyThemes = [
    { name: "Скандинавские сумерки", biome: "nordic_dusk", ambientColor: "#334155", fogColor: "#1e293b", groundColor: "#272e39" },
    { name: "Обсидиановый каньон", biome: "obsidian_canyon", ambientColor: "#27272a", fogColor: "#18181b", groundColor: "#202024" },
    { name: "Янтарная пустошь", biome: "amber_wasteland", ambientColor: "#451a03", fogColor: "#29150b", groundColor: "#382316" },
    { name: "Северное сияние", biome: "aurora_valley", ambientColor: "#064e3b", fogColor: "#022c22", groundColor: "#0f3228" },
  ];

  const currentTheme = weeklyThemes[weekNum % weeklyThemes.length];

  res.json({
    seed: `vox_daily_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`,
    dateString: now.toLocaleDateString("ru-RU"),
    weeklyTheme: currentTheme,
    bonusMultiplier: 1.5,
  });
});

// Vite middleware & Static Serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Voxotron Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
