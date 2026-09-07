import React, { useState } from 'react';
import { X, Calendar, Award, CheckCircle2, Gift, Coins, Box, ChevronRight } from 'lucide-react';
import { UserProfile, DailyQuest, Achievement } from '../types';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'achievements'>('quests');

  if (!isOpen) return null;

  const handleClaimQuest = (questId: string) => {
    const quest = profile.quests.find((q) => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    sound.playCheckpoint();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    onUpdateProfile((prev) => ({
      ...prev,
      coins: prev.coins + quest.rewardCoins,
      scrapVoxels: prev.scrapVoxels + quest.rewardScrap,
      quests: prev.quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q)),
    }));
  };

  const handleClaimAchievement = (achId: string) => {
    const ach = profile.achievements.find((a) => a.id === achId);
    if (!ach || !ach.unlocked) return;
    // handled automatically or claimed
  };

  return (
    <div id="quests-modal" className="fixed inset-0 z-50 flex items-center justify-center pt-safe pb-safe p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-[#10141d] border border-zinc-800/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 flex flex-col gap-4 max-h-[88vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Задания и достижения</h2>
              <p className="text-xs text-zinc-400">Ежедневные награды от Squeezed Hamster</p>
            </div>
          </div>
          <button
            id="quests-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800">
          <button
            id="tab-quests"
            onClick={() => setActiveTab('quests')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'quests'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Ежедневные задания</span>
          </button>
          <button
            id="tab-achievements"
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Достижения ({profile.achievements.filter((a) => a.unlocked).length}/{profile.achievements.length})</span>
          </button>
        </div>

        {/* Tab Content: Quests */}
        {activeTab === 'quests' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>Обновляются каждые 24 часа</span>
              <span className="font-mono text-amber-400">Дата: {profile.questDate}</span>
            </div>

            {profile.quests.map((quest) => {
              const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
              const isCompleted = quest.completed || quest.current >= quest.target;

              return (
                <div
                  key={quest.id}
                  className={`p-3.5 sm:p-4 rounded-xl border flex flex-col gap-2.5 transition-all ${
                    quest.claimed
                      ? 'bg-zinc-900/30 border-zinc-800/60 opacity-65'
                      : isCompleted
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                      : 'bg-zinc-900/50 border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                        {quest.title}
                        {quest.claimed && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Получено
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{quest.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <Coins className="w-3.5 h-3.5" />
                          +{quest.rewardCoins}
                        </span>
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Box className="w-3.5 h-3.5" />
                          +{quest.rewardScrap}
                        </span>
                      </div>

                      {isCompleted && !quest.claimed && (
                        <button
                          id={`claim-quest-${quest.id}`}
                          onClick={() => handleClaimQuest(quest.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer uppercase tracking-wider"
                        >
                          Забрать
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full flex items-center gap-3">
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      {Math.min(quest.current, quest.target)} / {quest.target} ({percent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Content: Achievements */}
        {activeTab === 'achievements' && (
          <div className="flex flex-col gap-2.5">
            {profile.achievements.map((ach) => {
              const percent = Math.min(100, Math.round((ach.progress / ach.target) * 100));

              return (
                <div
                  key={ach.id}
                  className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between gap-3 ${
                    ach.unlocked
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        ach.unlocked
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                          : 'bg-zinc-800/50 border-zinc-700 text-zinc-500'
                      }`}
                    >
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                        {ach.title}
                        {ach.unlocked && (
                          <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/20">
                            ОТКРЫТО
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{ach.description}</p>
                      <div className="text-[10px] font-mono text-zinc-400 mt-1">
                        Прогресс: {ach.progress} / {ach.target} ({percent}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800 shrink-0">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{ach.reward}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
