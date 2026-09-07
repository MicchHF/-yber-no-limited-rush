import React from 'react';
import { X, Flame, Flag, Calendar, Trophy, Zap, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { GameMode, UserProfile } from '../types';
import { sound } from '../services/sound';
import { getWeeklyTrials } from '../game/weeklyTrials';

interface TrackSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
  profile: UserProfile;
}

export const TrackSelectModal: React.FC<TrackSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  profile,
}) => {
  if (!isOpen) return null;

  const { trials, weekLabel, daysUntilReset } = getWeeklyTrials();

  const handleChoose = (mode: GameMode) => {
    sound.playCheckpoint();
    onSelectMode(mode);
    onClose();
  };

  const formatTime = (ms?: number) => {
    if (!ms) return '--:--.--';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const milli = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${milli.toString().padStart(2, '0')}`;
  };

  return (
    <div id="track-select-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-[#12151b] border border-zinc-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Выбор космического режима</h2>
              <p className="text-xs text-zinc-400">Voxotron by Squeezed Hamster Games</p>
            </div>
          </div>
          <button
            id="track-select-close"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode 1: 30-Second Hyper Sprint (Iconic Voxotron) */}
        <div
          id="mode-card-sprint"
          onClick={() => handleChoose('sprint_30s')}
          className="p-4 rounded-xl border border-amber-500/50 bg-gradient-to-r from-zinc-900/90 to-amber-950/30 hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-zinc-100">30-секундный гипер-спринт</h3>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 uppercase">
                  ФЛАГМАНСКИЙ РЕЖИМ
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                30 секунд бешеной скорости вокруг цилиндра: без лимитов скорости и тормозов!
              </p>
              <div className="text-[11px] font-mono text-amber-400 font-bold mt-1">
                Ваш рекорд: {profile.bestSprintScore.toLocaleString('ru-RU')} м
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
        </div>

        {/* Mode 2: Endless Cosmic Cylinder Survival */}
        <div
          id="mode-card-survival"
          onClick={() => handleChoose('survival')}
          className="p-4 rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900/80 to-purple-950/20 hover:border-purple-500/60 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">Бесконечное выживание на цилиндре</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                  ПРОЦЕДУРНАЯ ТРУБА
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Проедьте как можно дальше, выполняя грейзы (Graze) и уклоняясь от монолитов
              </p>
              <div className="text-[11px] font-mono text-purple-300 font-bold mt-1">
                Рекорд выживания: {profile.bestDistanceSurvival.toLocaleString('ru-RU')} м
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
        </div>

        {/* Mode 3: Daily Challenge */}
        <div
          id="mode-card-daily"
          onClick={() => handleChoose('daily')}
          className="p-4 rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900/80 to-sky-950/20 hover:border-sky-500/60 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">Ежедневная карта соревнований</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">
                  ОБЩИЙ СИД • х1.5 МОНЕТЫ
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Единая цилиндрическая трасса дня с еженедельно обновляемым ландшафтом
              </p>
              <div className="text-[11px] font-mono text-sky-400 font-bold mt-1">
                Рекорд дня: {profile.bestDailyScore.toLocaleString('ru-RU')} м
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-sky-400 transition-colors" />
        </div>

        {/* Speedrun Biome Trials (Weekly Fixed Seed) */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Еженедельные биом-испытания (Спидран)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-bold">
                {weekLabel}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Сброс через {daysUntilReset} дн.
              </span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 px-1 -mt-1">
            5 еженедельных испытаний, включая чистую дуэль с Флагманом-Боссом на 6 000 метров!
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {trials.map((trial) => {
              const bestTime = profile.speedrunTimes[trial.id];
              const isBoss = trial.id === 'speedrun_5';
              return (
                <div
                  key={trial.id}
                  id={`mode-card-${trial.id}`}
                  onClick={() => handleChoose(trial.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden ${
                    isBoss
                      ? 'sm:col-span-2 border-red-500/40 bg-gradient-to-r from-zinc-900/90 to-red-950/30 hover:border-red-400 shadow-md'
                      : 'border-zinc-800/90 bg-zinc-900/50 hover:border-cyan-500/50 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: trial.color, boxShadow: `0 0 8px ${trial.color}` }}
                      />
                      <span className={`text-xs font-bold transition-colors truncate ${isBoss ? 'text-red-200 group-hover:text-red-300' : 'text-white group-hover:text-cyan-300'}`}>
                        {trial.nameRu}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <span
                        className="text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={{ backgroundColor: `${trial.color}22`, color: trial.color, border: `1px solid ${trial.color}55` }}
                      >
                        {isBoss ? 'БОСС ДУЭЛЬ' : 'МОНО-БИОМ'}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-300">
                        {trial.targetDistance}м
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 line-clamp-1 mb-2">
                    {trial.subtitleRu}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/60">
                    <div className="text-[9px] font-mono text-zinc-500">
                      СИД: #{trial.seed.toString(16).slice(-6).toUpperCase()}
                    </div>
                    <div className="text-right flex items-center gap-1">
                      <span className="text-[9px] text-zinc-500">Рекорд:</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatTime(bestTime)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
