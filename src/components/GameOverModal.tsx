import React, { useEffect } from 'react';
import { RotateCcw, Home, Trophy, Coins, Box, Zap, Sparkles, Flame } from 'lucide-react';
import { GameMode, SpeedClass } from '../types';
import confetti from 'canvas-confetti';
import { sound } from '../services/sound';

interface GameOverModalProps {
  isOpen: boolean;
  result: {
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
  } | null;
  mode: GameMode;
  onRestart: () => void;
  onMenu: () => void;
  onOpenGarage: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  result,
  mode,
  onRestart,
  onMenu,
  onOpenGarage,
  onOpenLeaderboard,
}) => {
  useEffect(() => {
    if (isOpen && result) {
      if (result.completed || result.isNewRecord || result.speedClassReached === 'OVERDRIVE') {
        sound.playCheckpoint();
        confetti({ particleCount: 85, spread: 80, origin: { y: 0.6 } });
      }
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  return (
    <div id="game-over-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-[#0e1222] border border-[#ff007f]/40 rounded-2xl shadow-[0_0_40px_rgba(255,0,127,0.25)] p-5 sm:p-6 text-zinc-100 flex flex-col gap-4 text-center">
        {/* Title & Reason */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black tracking-widest text-[#ff007f] uppercase">
            UNLIMITED // RUSH
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {result.completed ? (mode === 'speedrun_5' ? '🏆 БОСС ПОВЕРЖЕН!' : 'ФИНИШ СПРИНТА!') : 'СТОЛКНОВЕНИЕ!'}
          </h2>
          <p className="text-xs text-zinc-400 font-semibold">{result.reason}</p>
        </div>

        {/* Speed Class reached badge */}
        <div className="flex items-center justify-center gap-2">
          {result.speedClassReached === 'OVERDRIVE' ? (
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ff007f] to-cyan-500 text-white font-black text-xs tracking-wider shadow-[0_0_20px_#ff007f] flex items-center gap-1.5 animate-pulse">
              <Flame className="w-4 h-4 fill-current text-white" />
              <span>ДОСТИГНУТ КЛАСС OVERDRIVE</span>
            </div>
          ) : result.speedClassReached === 'HYPER' ? (
            <div className="px-4 py-1.5 rounded-full bg-fuchsia-600 text-white font-black text-xs tracking-wider shadow-md flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-current" />
              <span>ДОСТИГНУТ КЛАСС HYPER</span>
            </div>
          ) : (
            <div className="px-4 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>КЛАСС FLOW</span>
            </div>
          )}
        </div>

        {/* New Record Banner */}
        {result.isNewRecord && (
          <div className="py-2 px-3 rounded-xl bg-[#ff007f]/20 border border-[#ff007f] text-pink-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,0,127,0.3)]">
            <Trophy className="w-4 h-4 text-[#ff007f]" />
            <span>НОВЫЙ ЛИЧНЫЙ РЕКОРД!</span>
          </div>
        )}

        {/* Global Leaderboard Rank Badge */}
        {result.rank ? (
          <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Место в таблице рекордов: <b className="font-mono text-amber-200">#{result.rank}</b></span>
          </div>
        ) : null}

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-950/50">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Пиковая скорость</span>
            <span className="font-mono text-lg font-black text-[#ff007f]">
              {result.maxSpeedKmh} км/ч
            </span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-950/50">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Дистанция</span>
            <span className="font-mono text-lg font-bold text-white">
              {result.distance.toLocaleString('ru-RU')} м
            </span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-950/50">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Грейзы (Near-Miss)</span>
            <span className="font-mono text-lg font-bold text-[#00f0ff] flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> {result.grazeCount}
            </span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-950/50">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Монеты</span>
            <span className="font-mono text-lg font-bold text-[#ff007f] flex items-center gap-1">
              <Coins className="w-4 h-4" /> +{result.coinsCollected}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            id="btn-restart-run"
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ff007f] via-pink-500 to-[#ff007f] hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,0,127,0.5)] transition-all active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>ПОВТОРИТЬ ПОЛЕТ</span>
          </button>

          <button
            id="btn-open-leaderboard-after-run"
            onClick={onOpenLeaderboard}
            className="w-full py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-amber-500/40 hover:border-amber-500/80 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Таблица рекордов</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-open-garage-after-run"
              onClick={onOpenGarage}
              className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-[#ff007f]/50 text-zinc-200 text-xs font-bold transition-colors"
            >
              Ангар кораблей
            </button>
            <button
              id="btn-menu-after-run"
              onClick={onMenu}
              className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>В главное меню</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
