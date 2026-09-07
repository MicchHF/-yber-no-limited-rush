import React, { useState } from 'react';
import {
  Play,
  Rocket,
  Flag,
  Trophy,
  Calendar,
  Coins,
  Box,
  Sliders,
  Volume2,
  VolumeX,
  Edit2,
  Check,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { UserProfile, GameMode } from '../types';
import { sound } from '../services/sound';
import { PWAInstallButton } from './PWAInstallButton';

interface MainMenuProps {
  profile: UserProfile;
  currentMode: GameMode;
  onStartGame: () => void;
  onOpenGarage: () => void;
  onOpenTrackSelect: () => void;
  onOpenLeaderboards: () => void;
  onOpenQuests: () => void;
  onOpenLighting: () => void;
  onOpenSettings: () => void;
  onOpenCloud: () => void;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  currentMode,
  onStartGame,
  onOpenGarage,
  onOpenTrackSelect,
  onOpenLeaderboards,
  onOpenQuests,
  onOpenLighting,
  onOpenSettings,
  onOpenCloud,
  onUpdateProfile,
  isMuted,
  onToggleMute,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.playerName);

  const activeVeh =
    profile.vehicles[profile.selectedVehicleId] || profile.vehicles['hamster_interceptor'];
  const unclaimedQuestsCount = profile.quests.filter((q) => q.completed && !q.claimed).length;

  const currentSens = profile.touchControls.sensitivity ?? 1.0;
  const sensPercent = Math.round(currentSens * 100);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      sound.playClick();
      onUpdateProfile((prev) => ({
        ...prev,
        playerName: nameInput.trim().slice(0, 16),
      }));
    }
    setIsEditingName(false);
  };

  const getModeTitle = () => {
    if (currentMode === 'sprint_30s') return 'Спринт 30 секунд';
    if (currentMode === 'survival') return 'Бесконечное выживание';
    if (currentMode === 'daily') return 'Ежедневная трасса';
    return `Спидран: Трасса ${currentMode.replace('speedrun_', '')}`;
  };

  return (
    <div
      id="main-menu-container"
      className="absolute inset-0 z-10 w-full h-full flex flex-col justify-between pt-safe pb-safe px-4 sm:px-8 py-3 sm:py-5 overflow-y-auto bg-gradient-to-b from-black/80 via-black/50 to-black/85 backdrop-blur-[2px] select-none text-zinc-100 font-sans"
    >
      {/* Top Header: Clean, balanced & uncluttered */}
      <header className="w-full flex items-center justify-between gap-3">
        {/* Pilot Name */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-cyan-500/50 rounded-xl px-2.5 py-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                maxLength={16}
                className="bg-transparent text-white font-bold text-xs sm:text-sm focus:outline-none w-28 sm:w-36"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-1 rounded bg-cyan-500 text-zinc-950 hover:bg-cyan-400 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNameInput(profile.playerName);
                setIsEditingName(true);
              }}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all cursor-pointer"
              title="Изменить имя пилота"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
              <span className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                {profile.playerName}
              </span>
              <Edit2 className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 opacity-75" />
            </button>
          )}
        </div>

        {/* Currency & Quick Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/70 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs sm:text-sm shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{profile.coins}</span>
          </div>

          {/* Scrap */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/70 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs sm:text-sm shadow-sm">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>{profile.scrapVoxels}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="menu-btn-mute"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Звук"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Settings Button */}
          <button
            id="menu-btn-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Настройки управления и чувствительности"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* Center Showcase: Clean Title, Active Vessel & Main Action */}
      <main className="my-auto flex flex-col items-center text-center gap-4 py-2 w-full max-w-md mx-auto">
        {/* Game Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            UNLIMITED RUSH
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 font-medium tracking-wide mt-1">
            360° Космическая гонка в трубе • Без тормозов
          </p>
        </div>

        {/* Selected Vessel Card */}
        <div
          id="menu-active-vehicle-card"
          onClick={onOpenGarage}
          className="w-full p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/50 transition-all cursor-pointer group backdrop-blur-md flex flex-col gap-2.5 shadow-lg shadow-black/40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: activeVeh.baseColor + '20',
                  borderColor: activeVeh.baseColor,
                }}
              >
                <Rocket className="w-5 h-5" style={{ color: activeVeh.baseColor }} />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>{activeVeh.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold uppercase">
                    Выбран
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 line-clamp-1">{activeVeh.subtitle}</div>
              </div>
            </div>

            <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0">
              Ангар & Тюнинг →
            </span>
          </div>

          {/* 3 Key Stats */}
          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-zinc-800/60 text-[10px]">
            <div>
              <span className="text-zinc-500">Скорость</span>
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1.5 flex-1 rounded-sm ${
                      lvl <= activeVeh.stats.maxSpeed ? 'bg-cyan-400' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-zinc-500">Ускорение</span>
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1.5 flex-1 rounded-sm ${
                      lvl <= activeVeh.stats.acceleration ? 'bg-cyan-400' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-zinc-500">Манёвренность</span>
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1.5 flex-1 rounded-sm ${
                      lvl <= activeVeh.stats.handling ? 'bg-amber-400' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button: START FLIGHT */}
        <div className="flex flex-col items-center gap-2 w-full">
          <button
            id="btn-main-start-game"
            onClick={onStartGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 font-black text-base sm:text-lg tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>СТАРТ ЗАЕЗДА</span>
          </button>

          {/* Mode Selector Pill */}
          <button
            id="btn-open-track-select"
            onClick={onOpenTrackSelect}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{getModeTitle()}</span>
            <span className="text-[10px] text-cyan-400 font-bold uppercase underline ml-1">
              Сменить
            </span>
          </button>

          {/* PWA Install Button (Android, iOS, PC) */}
          <PWAInstallButton className="w-full justify-center" variant="full" />
        </div>
      </main>

      {/* Bottom Bar: Sensitivity Quick Chip & Navigation */}
      <footer className="w-full flex flex-col gap-2.5 max-w-md mx-auto">
        {/* Quick Sensitivity & Scheme chip */}
        <div
          onClick={onOpenSettings}
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/80 text-[11px] text-zinc-400 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-300 font-medium">
              Чувствительность: <b className="text-cyan-400">{sensPercent}%</b>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              {profile.touchControls.layout === 'swipe_orbit' ? 'Свайп 360°' : 'Кнопки'}
            </span>
          </div>

          <span className="text-cyan-400 font-bold hover:underline">Настроить</span>
        </div>

        {/* 5 Clean Navigation Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {/* Garage */}
          <button
            id="nav-btn-garage"
            onClick={onOpenGarage}
            className="p-2 sm:p-2.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-zinc-300 hover:text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-[10px] font-bold truncate">Ангар</span>
          </button>

          {/* Modes / Tracks */}
          <button
            id="nav-btn-modes"
            onClick={onOpenTrackSelect}
            className="p-2 sm:p-2.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-zinc-300 hover:text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-[10px] font-bold truncate">Трассы</span>
          </button>

          {/* Leaderboards */}
          <button
            id="nav-btn-leaderboard"
            onClick={onOpenLeaderboards}
            className="p-2 sm:p-2.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="text-[10px] font-bold truncate">Рекорды</span>
          </button>

          {/* Quests */}
          <button
            id="nav-btn-quests"
            onClick={onOpenQuests}
            className="p-2 sm:p-2.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer relative"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span className="text-[10px] font-bold truncate">Задания</span>
            {unclaimedQuestsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          {/* Settings */}
          <button
            id="nav-btn-settings"
            onClick={onOpenSettings}
            className="p-2 sm:p-2.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-zinc-300 hover:text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-[10px] font-bold truncate">Опции</span>
          </button>
        </div>

        {/* Subtle Cloud Sync Footer */}
        <div className="flex items-center justify-between px-1 text-[10px] text-zinc-500">
          <span>UNLIMITED RUSH • 2026</span>
          <button
            id="btn-open-cloud-footer"
            onClick={onOpenCloud}
            className="flex items-center gap-1 text-zinc-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <Cloud className="w-3 h-3" />
            <span>Облачный сейв</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
