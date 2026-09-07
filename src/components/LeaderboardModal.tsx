import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Flag, Flame, RefreshCw, Car, User, Dices } from 'lucide-react';
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
    const [recs, daily] = await Promise.all([fetchLeaderboard(mode), fetchDailyInfo()]);
    setRecords(recs);
    setDailyInfo(daily);
    setIsLoading(false);
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
    <div id="leaderboard-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-[#12151b] border border-zinc-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Таблица лидеров и рекордов</h2>
              <p className="text-xs text-zinc-400">Соревнование сообщества Squeezed Hamster</p>
            </div>
          </div>
          <button
            id="leaderboard-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Name & Funny Generator Bar */}
        <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-zinc-400 shrink-0">Пилот:</span>
            <input
              type="text"
              value={currentName}
              onChange={(e) => handleSaveName(e.target.value)}
              className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-700 text-xs font-bold text-cyan-300 w-full max-w-[200px] outline-none focus:border-cyan-500"
              maxLength={24}
            />
          </div>
          <button
            onClick={handleRollFunnyName}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold shrink-0 cursor-pointer active:scale-95 transition-all"
            title="Сгенерировать смешное имя"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Смешное имя</span>
          </button>
        </div>

        {/* Weekly Landscape Banner for Daily Mode */}
        {selectedMode === 'daily' && dailyInfo && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-sky-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-300">
                Ландшафт недели: {dailyInfo.weeklyTheme?.name}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Общий сид дня • Награда x{dailyInfo.bonusMultiplier}
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              {dailyInfo.dateString}
            </span>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {modeTabs.map((tab) => {
            const isSel = selectedMode === tab.id;
            return (
              <button
                key={tab.id}
                id={`lead-tab-${tab.id}`}
                onClick={() => setSelectedMode(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Records Table */}
        <div className="flex flex-col gap-1.5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs">Загрузка рекордов...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="py-10 text-center text-zinc-500 text-xs">
              Пока нет рекордов в этом режиме. Станьте первым!
            </div>
          ) : (
            records.map((rec, idx) => {
              const rank = idx + 1;
              const isTop1 = rank === 1;
              const isTop3 = rank <= 3;
              const isCurrentPlayer = rec.playerName.toLowerCase() === playerName.toLowerCase();

              return (
                <div
                  key={rec.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrentPlayer
                      ? 'bg-amber-500/15 border-amber-500/70 text-amber-200'
                      : isTop1
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isTop1
                          ? 'bg-amber-500 text-zinc-950 font-black'
                          : rank === 2
                          ? 'bg-slate-300 text-zinc-950'
                          : rank === 3
                          ? 'bg-amber-700 text-zinc-100'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {rank}
                    </div>

                    {/* Name & Vehicle */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-100">
                        <span>{rec.playerName}</span>
                        {isCurrentPlayer && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-zinc-950 font-extrabold uppercase">
                            Вы
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Car className="w-2.5 h-2.5" />
                        <span>{rec.vehicleId.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{rec.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="font-mono text-sm sm:text-base font-bold text-amber-400">
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
