import React, { useState, useEffect } from 'react';
import { X, Trophy, RefreshCw, Car, User, Dices } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { fetchLeaderboard, fetchDailyInfo, generateFunnyPilotName } from '../services/storage';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: string;
  playerName: string;
  onUpdatePlayerName?: (newName: string) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  playerName,
  onUpdatePlayerName,
}) => {
  const [selectedMode, setSelectedMode] = useState<string>(currentMode || 'survival');
  const [records, setRecords] = useState<LeaderboardEntry[]>([]);
  const [dailyInfo, setDailyInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentName, setCurrentName] = useState(playerName);

  const loadData = async (mode: string) => {
    setIsLoading(true);
    try {
      const [recs, daily] = await Promise.all([fetchLeaderboard(mode), fetchDailyInfo()]);
      setRecords(recs);
      setDailyInfo(daily);
    } catch (e) {
      console.warn('Leaderboard fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData(selectedMode);
      setCurrentName(playerName);
    }
  }, [isOpen, selectedMode, playerName]);

  if (!isOpen) return null;

  const handleRollFunnyName = () => {
    const newName = generateFunnyPilotName();
    setCurrentName(newName);
    if (onUpdatePlayerName) {
      onUpdatePlayerName(newName);
    }
  };

  const handleSaveName = (val: string) => {
    setCurrentName(val);
    if (onUpdatePlayerName && val.trim()) {
      onUpdatePlayerName(val.trim());
    }
  };

  const modeTabs = [
    { id: 'survival', label: 'Выживание' },
    { id: 'speedrun_1', label: 'Спидран 1' },
    { id: 'speedrun_2', label: 'Спидран 2' },
    { id: 'speedrun_3', label: 'Спидран 3' },
    { id: 'speedrun_4', label: 'Спидран 4' },
    { id: 'speedrun_5', label: 'Босс (6000м)' },
    { id: 'daily', label: 'Ежедневная' },
  ];

  return (
    <div
      id="leaderboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none"
    >
      <div
        className="w-full max-w-xl bg-[#12151b] border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 flex flex-col h-[90dvh] max-h-[640px] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* ========================================================================= */}
        {/* FIXED STICKY HEADER - NEVER SCROLLS AWAY                                 */}
        {/* ========================================================================= */}
        <div className="shrink-0 p-3 sm:p-4 border-b border-zinc-800 bg-[#12151b] flex flex-col gap-2.5 z-10 shadow-md">
          {/* Top Title & Close Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                  Таблица лидеров и рекордов
                </h2>
                <p className="text-[11px] text-zinc-400 truncate">
                  Соревнование сообщества Squeezed Hamster
                </p>
              </div>
            </div>
            <button
              id="leaderboard-modal-close"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0 active:scale-95"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Player Name & Randomizer */}
          <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs text-zinc-400 shrink-0 hidden xs:inline">Пилот:</span>
              <input
                type="text"
                value={currentName}
                onChange={(e) => handleSaveName(e.target.value)}
                placeholder="Имя пилота..."
                className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-700 text-xs font-bold text-cyan-300 w-full outline-none focus:border-cyan-500 transition-colors"
                maxLength={24}
              />
            </div>
            <button
              onClick={handleRollFunnyName}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold shrink-0 cursor-pointer active:scale-95 transition-all"
              title="Сгенерировать смешное имя"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">Смешное имя</span>
            </button>
          </div>

          {/* Weekly Landscape Banner (Daily Mode Only) */}
          {selectedMode === 'daily' && dailyInfo && (
            <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-sky-500/15 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <span className="font-bold text-amber-300 block truncate">
                  Ландшафт: {dailyInfo.weeklyTheme?.name}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  Общий сид дня • Бонус x{dailyInfo.bonusMultiplier}
                </span>
              </div>
              <span className="font-mono font-bold text-amber-400 shrink-0 text-[11px]">
                {dailyInfo.dateString}
              </span>
            </div>
          )}

          {/* Mode Tabs with hidden scrollbars for clean mobile swiping */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
            {modeTabs.map((tab) => {
              const isSel = selectedMode === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`lead-tab-${tab.id}`}
                  onClick={() => setSelectedMode(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0 ${
                    isSel
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                      : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCROLLABLE RECORDS AREA WITH SAFE AREA PADDING                            */}
        {/* ========================================================================= */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 flex flex-col gap-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-400 gap-2.5">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs font-medium">Загрузка рекордов...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="py-14 text-center text-zinc-500 text-xs px-4">
              Пока нет рекордов в этом режиме. Станьте первым!
            </div>
          ) : (
            records.map((rec, idx) => {
              const rank = idx + 1;
              const isTop1 = rank === 1;
              const isCurrentPlayer = rec.playerName.toLowerCase() === currentName.toLowerCase();

              return (
                <div
                  key={rec.id}
                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrentPlayer
                      ? 'bg-amber-500/20 border-amber-500/80 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/40'
                      : isTop1
                      ? 'bg-amber-500/10 border-amber-500/30 text-zinc-100'
                      : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isTop1
                          ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                          : rank === 2
                          ? 'bg-slate-300 text-zinc-950 font-bold'
                          : rank === 3
                          ? 'bg-amber-700 text-zinc-100 font-bold'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {rank}
                    </div>

                    {/* Name & Vehicle Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                        <span className="truncate">{rec.playerName}</span>
                        {isCurrentPlayer && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-black uppercase tracking-wider shrink-0 shadow-sm">
                            ВЫ
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                        <Car className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate">{rec.vehicleId.replace('_', ' ')}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="shrink-0">{rec.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0 pl-2">
                    <div
                      className={`font-mono text-xs sm:text-sm font-black ${
                        isCurrentPlayer
                          ? 'text-amber-300'
                          : isTop1
                          ? 'text-amber-400'
                          : 'text-zinc-200'
                      }`}
                    >
                      {rec.displayValue}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
