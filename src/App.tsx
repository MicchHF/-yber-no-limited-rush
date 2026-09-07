import React, { useState, useRef, useEffect } from 'react';
import {
  UserProfile,
  GameMode,
  SpeedClass,
  GhostFrame,
} from './types';
import {
  loadLocalProfile,
  saveLocalProfile,
  submitLeaderboardScore,
} from './services/storage';
import { sound } from './services/sound';
import { VoxotronCylinderEngine, CylinderHUDState } from './game/cylinderEngine';
import { GameCanvas } from './components/GameCanvas';
import { CylinderHUD } from './components/CylinderHUD';
import { TouchControls } from './components/TouchControls';
import { MainMenu } from './components/MainMenu';
import { GarageModal } from './components/GarageModal';
import { TrackSelectModal } from './components/TrackSelectModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { DailyQuestsModal } from './components/DailyQuestsModal';
import { LightingModal } from './components/LightingModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadLocalProfile());
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [currentMode, setCurrentMode] = useState<GameMode>('sprint_30s');
  const [isMuted, setIsMuted] = useState(false);

  // Engine & Real-time HUD telemetry
  const engineRef = useRef<VoxotronCylinderEngine | null>(null);
  const [hudData, setHudData] = useState<CylinderHUDState>({
    speedKmh: 240,
    speedClass: 'FLOW',
    smoothness: 98,
    distance: 0,
    timeMs: 0,
    remainingTimeMs: 30000,
    grazeStreak: 0,
    coins: 0,
    scrap: 0,
    currentSector: 1,
    rank: 1,
    totalRacers: 6,
    powerUps: [],
    cylinderAngle: Math.PI / 2,
    obstaclesRadar: [],
  });

  // Game Over Run Result
  const [gameResult, setGameResult] = useState<{
    distance: number;
    timeMs: number;
    maxSpeedKmh: number;
    speedClassReached: SpeedClass;
    grazeCount: number;
    coinsCollected: number;
    scrapCollected: number;
    voxelsDestroyed: number;
    completed: boolean;
    reason: string;
    isNewRecord?: boolean;
    rank?: number;
  } | null>(null);

  // Modals visibility
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isTrackSelectOpen, setIsTrackSelectOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isLightingOpen, setIsLightingOpen] = useState(false);
  const [isCloudOpen, setIsCloudOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 3-second resume countdown state
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<any>(null);

  // Global Keyboard Listener for Pause/Resume (Escape or P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'KeyP') {
        if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
        if (gameState === 'playing' && resumeCountdown === null) {
          e.preventDefault();
          handlePause();
        } else if (gameState === 'paused') {
          e.preventDefault();
          handleResume();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, resumeCountdown]);

  // Clean up countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Persist profile changes to localStorage
  const updateProfile = (updater: (prev: UserProfile) => UserProfile) => {
    setProfile((prev) => {
      const updated = updater(prev);
      saveLocalProfile(updated);
      if (engineRef.current && updated.touchControls?.sensitivity !== undefined) {
        engineRef.current.setSteeringSensitivity(updated.touchControls.sensitivity);
      }
      return updated;
    });
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sound.setMuted(nextMute);
  };

  const activeVehicle =
    profile.vehicles[profile.selectedVehicleId] || profile.vehicles['hamster_interceptor'];

  // Start Game
  const handleStartGame = () => {
    sound.playCheckpoint();
    setGameResult(null);
    setGameState('playing');
    if (engineRef.current) {
      engineRef.current.startRace(currentMode, activeVehicle);
    }
  };

  // Pause & Resume
  const handlePause = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setResumeCountdown(null);
    if (gameState === 'playing') {
      sound.playClick();
      if (engineRef.current) engineRef.current.setPaused(true);
      setGameState('paused');
    }
  };

  const handleResume = () => {
    sound.playClick();
    setGameState('playing');

    // 3 second countdown before unpausing the engine
    let count = 3;
    setResumeCountdown(count);
    sound.playCountdownBeep(count);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setResumeCountdown(count);
        sound.playCountdownBeep(count);
      } else if (count === 0) {
        setResumeCountdown(0);
        sound.playCountdownBeep(0);
        if (engineRef.current) {
          engineRef.current.setPaused(false);
        }
      } else {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setResumeCountdown(null);
      }
    }, 1000);
  };

  const handleRestart = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setResumeCountdown(null);
    sound.playCheckpoint();
    setGameResult(null);
    setGameState('playing');
    if (engineRef.current) {
      engineRef.current.restartRace();
    }
  };

  const handleBackToMenu = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setResumeCountdown(null);
    sound.playClick();
    if (engineRef.current) {
      engineRef.current.setAttractMode(true);
    }
    setGameState('menu');
  };

  // Callback from Game Engine on Game Over
  const handleEngineGameOver = (result: {
    distance: number;
    timeMs: number;
    maxSpeedKmh: number;
    speedClassReached: SpeedClass;
    grazeCount: number;
    coinsCollected: number;
    scrapCollected: number;
    voxelsDestroyed: number;
    completed: boolean;
    reason: string;
    ghostData: GhostFrame[];
  }) => {
    // Determine new record
    let isNewRecord = false;
    if (currentMode === 'sprint_30s') {
      if (result.distance > profile.bestSprintScore) {
        isNewRecord = true;
      }
    } else if (currentMode === 'survival') {
      if (result.distance > profile.bestDistanceSurvival) {
        isNewRecord = true;
      }
    } else if (currentMode === 'daily') {
      if (result.distance > profile.bestDailyScore) {
        isNewRecord = true;
      }
    } else if (currentMode.startsWith('speedrun') && result.completed) {
      const existingBest = profile.speedrunTimes[currentMode];
      if (!existingBest || result.timeMs < existingBest) {
        isNewRecord = true;
      }
    }

    // Submit score to Leaderboard API
    const scoreVal = currentMode.startsWith('speedrun') ? result.timeMs : result.distance;
    const formatScore = currentMode.startsWith('speedrun')
      ? `${(result.timeMs / 1000).toFixed(2)}s`
      : `${result.distance} м (${result.maxSpeedKmh} км/ч)`;

    submitLeaderboardScore({
      playerName: profile.playerName,
      score: scoreVal,
      displayValue: formatScore,
      vehicleId: profile.selectedVehicleId,
      mode: currentMode,
      speedClassReached: result.speedClassReached,
      maxSpeedKmh: result.maxSpeedKmh,
      grazeCount: result.grazeCount,
    }).then((res) => {
      if (res.rank) {
        setGameResult((prev) => (prev ? { ...prev, rank: res.rank } : null));
      }
    });

    // Update player currency, stats, quests & achievements
    updateProfile((prev) => {
      const newCoins = prev.coins + result.coinsCollected;
      const newScrap = prev.scrapVoxels + result.scrapCollected;
      const newTotalDist = prev.stats.totalDistance + result.distance;
      const newTotalGrazes = prev.stats.totalGrazes + result.grazeCount;
      const newTotalVoxels = prev.stats.voxelsDestroyed + result.voxelsDestroyed;

      // Update Quests
      const updatedQuests = prev.quests.map((q) => {
        let add = 0;
        if (q.type === 'graze_count') {
          add = result.grazeCount;
        } else if (q.type === 'reach_overdrive' && result.speedClassReached === 'OVERDRIVE') {
          add = 1;
        } else if (q.type === 'complete_30s' && currentMode === 'sprint_30s' && result.completed) {
          add = 1;
        }
        const updatedCurrent = q.current + add;
        return {
          ...q,
          current: updatedCurrent,
          completed: q.completed || updatedCurrent >= q.target,
        };
      });

      // Update Achievements
      const updatedAchievements = prev.achievements.map((ach) => {
        let pVal = ach.progress;
        if (ach.id === 'ach_first_flight') pVal = 1;
        if (ach.id === 'ach_hyper_speed') pVal = Math.max(ach.progress, result.maxSpeedKmh);
        if (ach.id === 'ach_overdrive') pVal = Math.max(ach.progress, result.maxSpeedKmh);
        if (ach.id === 'ach_graze_streak_10') pVal = Math.max(ach.progress, result.grazeCount);
        if (ach.id === 'ach_survivor_5k') pVal = Math.max(ach.progress, result.distance);
        return {
          ...ach,
          progress: pVal,
          unlocked: ach.unlocked || pVal >= ach.target,
        };
      });

      const updatedSpeedrunTimes = { ...prev.speedrunTimes };
      if (currentMode.startsWith('speedrun') && result.completed) {
        if (!updatedSpeedrunTimes[currentMode] || result.timeMs < updatedSpeedrunTimes[currentMode]) {
          updatedSpeedrunTimes[currentMode] = result.timeMs;
        }
      }

      return {
        ...prev,
        coins: newCoins,
        scrapVoxels: newScrap,
        bestSprintScore:
          currentMode === 'sprint_30s'
            ? Math.max(prev.bestSprintScore, result.distance)
            : prev.bestSprintScore,
        bestDistanceSurvival:
          currentMode === 'survival'
            ? Math.max(prev.bestDistanceSurvival, result.distance)
            : prev.bestDistanceSurvival,
        bestDailyScore:
          currentMode === 'daily'
            ? Math.max(prev.bestDailyScore, result.distance)
            : prev.bestDailyScore,
        speedrunTimes: updatedSpeedrunTimes,
        quests: updatedQuests,
        achievements: updatedAchievements,
        stats: {
          totalDistance: newTotalDist,
          totalGrazes: newTotalGrazes,
          overdriveTimeSeconds: prev.stats.overdriveTimeSeconds + (result.speedClassReached === 'OVERDRIVE' ? 10 : 0),
          voxelsDestroyed: newTotalVoxels,
          runsCompleted: prev.stats.runsCompleted + 1,
        },
      };
    });

    setGameResult({
      ...result,
      isNewRecord,
    });
    setGameState('gameover');
  };

  return (
    <main id="voxotron-app-root" className="relative w-full h-full overflow-hidden select-none bg-[#090b10]">
      {/* 3D Cosmic Cylinder Viewport - Always mounted, zero flicker */}
      <GameCanvas
        vehicleDef={activeVehicle}
        lighting={profile.lighting}
        mode={currentMode}
        isAttractMode={gameState === 'menu'}
        onUpdateHUD={setHudData}
        onGameOver={handleEngineGameOver}
        onEngineReady={(engine) => {
          engineRef.current = engine;
          if (engine && profile.touchControls?.sensitivity !== undefined) {
            engine.setSteeringSensitivity(profile.touchControls.sensitivity);
          }
        }}
      />

      {/* Main Menu View (Overlaid on top of cruising cosmic cylinder) */}
      {gameState === 'menu' && (
        <MainMenu
          profile={profile}
          currentMode={currentMode}
          onStartGame={handleStartGame}
          onOpenGarage={() => setIsGarageOpen(true)}
          onOpenTrackSelect={() => setIsTrackSelectOpen(true)}
          onOpenLeaderboards={() => setIsLeaderboardOpen(true)}
          onOpenQuests={() => setIsQuestsOpen(true)}
          onOpenLighting={() => setIsLightingOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCloud={() => setIsCloudOpen(true)}
          onUpdateProfile={updateProfile}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Active Game In-Race 360-degree Cylinder HUD */}
      {gameState === 'playing' && (
        <>
          <CylinderHUD
            hud={hudData}
            mode={currentMode}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
            onOpenLighting={() => setIsLightingOpen(true)}
          />

          {/* Mobile Touch Controls Layer */}
          <TouchControls
            engine={engineRef.current}
            layout={profile.touchControls.layout}
            sensitivity={profile.touchControls.sensitivity}
            haptics={profile.touchControls.haptics}
            autoBoost={profile.touchControls.autoBoost}
            disabled={resumeCountdown !== null}
          />

          {/* 3-Second Resume Countdown Overlay */}
          {resumeCountdown !== null && (
            <div
              id="resume-countdown-overlay"
              className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px] transition-all"
            >
              <div className="flex flex-col items-center select-none scale-105 transition-transform duration-200">
                <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-cyan-400 to-blue-600 drop-shadow-[0_0_40px_rgba(6,182,212,0.9)] animate-pulse">
                  {resumeCountdown === 0 ? 'В БОЙ!' : resumeCountdown}
                </span>
                <span className="mt-4 text-xs sm:text-sm font-black font-mono tracking-widest text-cyan-200 uppercase bg-black/70 px-5 py-2 rounded-full border border-cyan-500/50 shadow-lg">
                  {resumeCountdown === 0 ? 'ГАЗ В ПОЛ!' : 'ПРИГОТОВЬТЕСЬ'}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          isOpen={true}
          onResume={handleResume}
          onRestart={handleRestart}
          onMenu={handleBackToMenu}
          onOpenLighting={() => setIsLightingOpen(true)}
          profile={profile}
          onUpdateSensitivity={(val) => {
            updateProfile((prev) => ({
              ...prev,
              touchControls: {
                ...prev.touchControls,
                sensitivity: val,
              },
            }));
          }}
          onToggleTouchLayout={() => {
            updateProfile((prev) => ({
              ...prev,
              touchControls: {
                ...prev.touchControls,
                layout: prev.touchControls.layout === 'swipe_orbit' ? 'buttons' : 'swipe_orbit',
              },
            }));
          }}
          onToggleHaptics={() => {
            updateProfile((prev) => ({
              ...prev,
              touchControls: {
                ...prev.touchControls,
                haptics: !prev.touchControls.haptics,
              },
            }));
          }}
          onToggleAutoBoost={() => {
            updateProfile((prev) => ({
              ...prev,
              touchControls: {
                ...prev.touchControls,
                autoBoost: !prev.touchControls.autoBoost,
              },
            }));
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          isOpen={true}
          result={gameResult}
          mode={currentMode}
          onRestart={handleRestart}
          onMenu={handleBackToMenu}
          onOpenGarage={() => setIsGarageOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {/* Garage Modal */}
      <GarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
      />

      {/* Track & Mode Select Modal */}
      <TrackSelectModal
        isOpen={isTrackSelectOpen}
        onClose={() => setIsTrackSelectOpen(false)}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
        }}
        profile={profile}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentMode={currentMode}
        playerName={profile.playerName}
        onUpdatePlayerName={(newName) => {
          updateProfile((prev) => ({
            ...prev,
            playerName: newName,
          }));
        }}
      />

      {/* Daily Quests & Achievements Modal */}
      <DailyQuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
      />

      {/* Atmospheric Lighting & Graphic Performance Modal */}
      <LightingModal
        isOpen={isLightingOpen}
        onClose={() => setIsLightingOpen(false)}
        settings={profile.lighting}
        onChange={(newSettings) => {
          updateProfile((prev) => ({
            ...prev,
            lighting: newSettings,
          }));
        }}
      />

      {/* Cloud Save & Cross-Device Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudOpen}
        onClose={() => setIsCloudOpen(false)}
        profile={profile}
        onProfileUpdated={(newProf) => {
          setProfile(newProf);
          saveLocalProfile(newProf);
        }}
      />

      {/* Settings Modal (Sensitivity, Controls, Sound) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLighting={() => {
          setIsSettingsOpen(false);
          setIsLightingOpen(true);
        }}
      />
    </main>
  );
}
