import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Home,
  SunMedium,
  Smartphone,
  MoveHorizontal,
  Volume2,
  VolumeX,
  Music,
} from 'lucide-react';
import { UserProfile } from '../types';
import { sound } from '../services/sound';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onOpenLighting: () => void;
  profile: UserProfile;
  onUpdateSensitivity?: (val: number) => void;
  onToggleTouchLayout: () => void;
  onToggleHaptics: () => void;
  onToggleAutoBoost: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onMenu,
  onOpenLighting,
  profile,
  onUpdateSensitivity,
  onToggleTouchLayout,
  onToggleHaptics,
  onToggleAutoBoost,
  isMuted,
  onToggleMute,
}) => {
  const [trackName, setTrackName] = useState(() => sound.getCurrentTrack().name);

  if (!isOpen) return null;

  const currentSens = profile.touchControls.sensitivity ?? 1.0;
  const sensPercent = Math.round(currentSens * 100);

  return (
    <div
      id="pause-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto select-none"
    >
      <div className="w-full max-w-sm bg-[#0e121b] border border-zinc-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-zinc-100 flex flex-col gap-4 text-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">ПАУЗА ЗАЕЗДА</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Настройте управление или продолжите гонку</p>
        </div>

        {/* 1. SENSITIVITY SLIDER (With 50% softer baseline notice) */}
        {onUpdateSensitivity && (
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-left text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <MoveHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                Чувствительность
              </span>
              <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-[11px]">
                {sensPercent}%
              </span>
            </div>

            <p className="text-[10px] text-zinc-400">
              Базовая скорость откалибрована на 80% от первоначальной для быстрого, но плавного отклика.
            </p>

            <input
              id="pause-slider-sensitivity"
              type="range"
              min="0.4"
              max="1.8"
              step="0.05"
              value={currentSens}
              onChange={(e) => onUpdateSensitivity(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 my-1"
            />

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onUpdateSensitivity(0.7)}
                className={`py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                  Math.abs(currentSens - 0.7) < 0.05
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
                }`}
              >
                Мягкая (70%)
              </button>
              <button
                onClick={() => onUpdateSensitivity(1.0)}
                className={`py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                  Math.abs(currentSens - 1.0) < 0.05
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
                }`}
              >
                Норма (100%)
              </button>
              <button
                onClick={() => onUpdateSensitivity(1.4)}
                className={`py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                  Math.abs(currentSens - 1.4) < 0.05
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
                }`}
              >
                Чуткая (140%)
              </button>
            </div>
          </div>
        )}

        {/* 2. TOUCH CONTROLS & SOUND QUICK TOGGLES */}
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-left text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-medium">Управление:</span>
            <button
              id="pause-toggle-layout"
              onClick={onToggleTouchLayout}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold text-xs transition-colors cursor-pointer"
            >
              {profile.touchControls.layout === 'swipe_orbit' ? 'Свайп 360°' : 'Кнопки влево/вправо'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-medium">Вибрация:</span>
            <button
              id="pause-toggle-haptics"
              onClick={onToggleHaptics}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                profile.touchControls.haptics
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {profile.touchControls.haptics ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-medium">Звуковые эффекты:</span>
            <button
              id="pause-toggle-mute"
              onClick={onToggleMute}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                !isMuted
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{!isMuted ? 'ВКЛ' : 'ВЫКЛ'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-medium flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              Вайб-трек:
            </span>
            <button
              id="pause-switch-track"
              onClick={() => {
                const next = sound.nextTrack();
                sound.playClick();
                setTrackName(next.name);
              }}
              className="px-2.5 py-1 rounded-lg font-bold text-xs bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/60 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{trackName}</span>
              <span className="text-[10px] text-cyan-200">↻</span>
            </button>
          </div>
        </div>

        {/* 3. PRIMARY ACTIONS */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            id="btn-resume"
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Продолжить заезд</span>
          </button>

          <button
            id="btn-pause-lighting"
            onClick={onOpenLighting}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
            <span>Настройка графики и освещения</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-pause-restart"
              onClick={onRestart}
              className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Рестарт</span>
            </button>

            <button
              id="btn-pause-menu"
              onClick={onMenu}
              className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>В меню</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
