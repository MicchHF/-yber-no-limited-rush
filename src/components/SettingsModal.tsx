import React, { useState } from 'react';
import {
  X,
  Sliders,
  Smartphone,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  RotateCcw,
  Zap,
  MoveHorizontal,
  Music,
} from 'lucide-react';
import { UserProfile } from '../types';
import { sound, VIBE_TRACKS } from '../services/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLighting: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  isMuted,
  onToggleMute,
  onOpenLighting,
}) => {
  const [activeTrack, setActiveTrack] = useState(sound.getCurrentTrack().id);
  const [musicVol, setMusicVol] = useState(Math.round(sound.getMusicVolume() * 100));
  const [sfxVol, setSfxVol] = useState(Math.round(sound.getSfxVolume() * 100));

  if (!isOpen) return null;

  const currentSensitivity = profile.touchControls.sensitivity ?? 1.0;
  const sensPercent = Math.round(currentSensitivity * 100);

  const handleSensitivityChange = (val: number) => {
    onUpdateProfile((prev) => ({
      ...prev,
      touchControls: {
        ...prev.touchControls,
        sensitivity: val,
      },
    }));
  };

  const setPreset = (val: number) => {
    sound.playClick();
    handleSensitivityChange(val);
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto select-none"
    >
      <div className="w-full max-w-md bg-[#0e121b] border border-zinc-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-zinc-100 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-white">Настройки управления</h2>
              <p className="text-[11px] text-zinc-400">Чувствительность и комфорт в гонке</p>
            </div>
          </div>

          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. STEERING SENSITIVITY (With 50% softer baseline) */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <MoveHorizontal className="w-3.5 h-3.5 text-[#00f0ff]" />
              Чувствительность поворотов
            </span>
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff]/30 text-[#00f0ff]">
              {sensPercent}%
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Базовый отклик установлен на 80% от первоначального для быстрого и контролируемого манёвра:
          </p>

          {/* Slider */}
          <input
            id="slider-steering-sensitivity"
            type="range"
            min="0.4"
            max="1.8"
            step="0.05"
            value={currentSensitivity}
            onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00f0ff]"
          />

          {/* Presets */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setPreset(0.7)}
              className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                Math.abs(currentSensitivity - 0.7) < 0.05
                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/50'
                  : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
              }`}
            >
              Мягкая (70%)
            </button>
            <button
              onClick={() => setPreset(1.0)}
              className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                Math.abs(currentSensitivity - 1.0) < 0.05
                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/50'
                  : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
              }`}
            >
              Стандарт (100%)
            </button>
            <button
              onClick={() => setPreset(1.4)}
              className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                Math.abs(currentSensitivity - 1.4) < 0.05
                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/50'
                  : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
              }`}
            >
              Быстрая (140%)
            </button>
          </div>
        </div>

        {/* 2. TOUCH CONTROL SCHEME */}
        <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#ff007f]" />
            Схема управления на экране
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="settings-scheme-swipe"
              onClick={() => {
                sound.playClick();
                onUpdateProfile((prev) => ({
                  ...prev,
                  touchControls: { ...prev.touchControls, layout: 'swipe_orbit' },
                }));
              }}
              className={`p-2.5 rounded-xl text-left border flex flex-col gap-1 transition-all cursor-pointer ${
                profile.touchControls.layout === 'swipe_orbit'
                  ? 'bg-[#ff007f]/15 border-[#ff007f]/60 text-white'
                  : 'bg-zinc-800/50 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Свайп 360°</span>
                {profile.touchControls.layout === 'swipe_orbit' && (
                  <Check className="w-3.5 h-3.5 text-[#ff007f]" />
                )}
              </div>
              <span className="text-[10px] text-zinc-400">В любой точке экрана</span>
            </button>

            <button
              id="settings-scheme-buttons"
              onClick={() => {
                sound.playClick();
                onUpdateProfile((prev) => ({
                  ...prev,
                  touchControls: { ...prev.touchControls, layout: 'buttons' },
                }));
              }}
              className={`p-2.5 rounded-xl text-left border flex flex-col gap-1 transition-all cursor-pointer ${
                profile.touchControls.layout === 'buttons'
                  ? 'bg-[#ff007f]/15 border-[#ff007f]/60 text-white'
                  : 'bg-zinc-800/50 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Кнопки</span>
                {profile.touchControls.layout === 'buttons' && (
                  <Check className="w-3.5 h-3.5 text-[#ff007f]" />
                )}
              </div>
              <span className="text-[10px] text-zinc-400">Влево / Вправо</span>
            </button>
          </div>
        </div>

        {/* 3. AUDIO & VIBE SOUNDTRACK */}
        <div className="space-y-3 bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Вайб-саундтрек & Звук
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#00f0ff] uppercase bg-[#00f0ff]/10 px-2 py-0.5 rounded-full border border-[#00f0ff]/30">
              {VIBE_TRACKS.find((t) => t.id === activeTrack)?.bpm} BPM
            </span>
          </div>

          {/* Track Cards */}
          <div className="grid grid-cols-3 gap-2">
            {VIBE_TRACKS.map((t) => {
              const isActive = t.id === activeTrack;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    sound.setTrack(t.id);
                    sound.playClick();
                    setActiveTrack(t.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/40 border-[#00f0ff] shadow-sm shadow-[#00f0ff]/20 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[11px] font-black truncate">{t.name}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />}
                  </div>
                  <span className="text-[9px] text-zinc-400 line-clamp-2 leading-tight">
                    {t.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Volume Sliders */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Музыка</span>
                <span className="text-[#00f0ff] font-bold">{musicVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVol}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMusicVol(val);
                  sound.setMusicVolume(val / 100);
                }}
                className="w-full accent-[#00f0ff] cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Эффекты SFX</span>
                <span className="text-[#ff007f] font-bold">{sfxVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVol}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSfxVol(val);
                  sound.setSfxVolume(val / 100);
                }}
                className="w-full accent-[#ff007f] cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>

        {/* 4. TOGGLES: Sound, Haptics, AutoBoost */}
        <div className="grid grid-cols-3 gap-2">
          {/* Sound */}
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              !isMuted
                ? 'bg-zinc-900 border-[#00f0ff]/40 text-[#00f0ff]'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
            }`}
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] font-bold">Звук: {!isMuted ? 'ВКЛ' : 'ВЫКЛ'}</span>
          </button>

          {/* Haptics */}
          <button
            onClick={() => {
              sound.playClick();
              onUpdateProfile((prev) => ({
                ...prev,
                touchControls: {
                  ...prev.touchControls,
                  haptics: !prev.touchControls.haptics,
                },
              }));
            }}
            className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              profile.touchControls.haptics
                ? 'bg-zinc-900 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-[10px] font-bold">
              Вибро: {profile.touchControls.haptics ? 'ВКЛ' : 'ВЫКЛ'}
            </span>
          </button>

          {/* AutoBoost */}
          <button
            onClick={() => {
              sound.playClick();
              onUpdateProfile((prev) => ({
                ...prev,
                touchControls: {
                  ...prev.touchControls,
                  autoBoost: !prev.touchControls.autoBoost,
                },
              }));
            }}
            className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              profile.touchControls.autoBoost
                ? 'bg-zinc-900 border-[#ff007f]/40 text-[#ff007f]'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold">
              Буст: {profile.touchControls.autoBoost ? 'АВТО' : 'РУЧНОЙ'}
            </span>
          </button>
        </div>

        {/* Atmosphere / Lighting button */}
        <button
          onClick={() => {
            onClose();
            onOpenLighting();
          }}
          className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Настройка графики, неонового света и туннеля</span>
        </button>

        {/* Close Button */}
        <button
          id="btn-settings-done"
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Сохранить и закрыть</span>
        </button>
      </div>
    </div>
  );
};
