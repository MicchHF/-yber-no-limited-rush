import React, { useState } from 'react';
import { X, Cloud, CloudUpload, CloudDownload, Copy, Check, Key, Smartphone, Laptop, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { saveProfileToCloud, loadProfileFromCloud } from '../services/storage';
import { sound } from '../services/sound';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated: (newProfile: UserProfile) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    sound.playClick();
    navigator.clipboard.writeText(profile.syncKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToCloud = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    sound.playClick();
    const result = await saveProfileToCloud(profile);
    setIsSyncing(false);

    if (result.success) {
      sound.playCheckpoint();
      setStatusMessage({
        type: 'success',
        text: 'Прогресс успешно сохранен в облако! Используйте ключ для синхронизации.',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Ошибка синхронизации с облаком',
      });
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!importKey.trim()) return;
    setIsSyncing(true);
    setStatusMessage(null);
    sound.playClick();
    const result = await loadProfileFromCloud(importKey);
    setIsSyncing(false);

    if (result.success && result.profile) {
      sound.playCheckpoint();
      onProfileUpdated(result.profile);
      setStatusMessage({
        type: 'success',
        text: 'Данные успешно загружены! Ваш прогресс полностью синхронизирован.',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Ключ не найден в облаке',
      });
    }
  };

  return (
    <div id="cloud-sync-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-[#12151b] border border-zinc-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Облачная синхронизация</h2>
              <p className="text-xs text-zinc-400">Перенос прогресса между устройствами</p>
            </div>
          </div>
          <button
            id="cloud-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Key Box */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-2">
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            Ваш уникальный ключ синхронизации:
          </span>

          <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-700/80">
            <span className="font-mono font-black text-base sm:text-lg tracking-wider text-amber-400 select-all">
              {profile.syncKey}
            </span>
            <button
              id="btn-copy-sync-key"
              onClick={handleCopyKey}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 transition-colors"
              title="Скопировать ключ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Сохраните этот ключ, чтобы загрузить автопарк, валюту и рекорды на планшете, телефоне или ПК.
          </p>
        </div>

        {/* Action 1: Upload to Cloud */}
        <button
          id="btn-cloud-save"
          onClick={handleSaveToCloud}
          disabled={isSyncing}
          className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CloudUpload className="w-4 h-4" />
          )}
          <span>Сохранить текущий прогресс в облако</span>
        </button>

        {/* Action 2: Restore / Import */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <CloudDownload className="w-3.5 h-3.5 text-sky-400" />
            Восстановить данные по ключу:
          </span>

          <div className="flex gap-2">
            <input
              id="input-sync-key"
              type="text"
              placeholder="HAMSTER-XXXXXX"
              value={importKey}
              onChange={(e) => setImportKey(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono font-bold text-amber-300 uppercase tracking-wide focus:outline-none focus:border-sky-500"
            />
            <button
              id="btn-cloud-load"
              onClick={handleRestoreFromCloud}
              disabled={isSyncing || !importKey.trim()}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Загрузить
            </button>
          </div>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Multi-device iconography hint */}
        <div className="flex items-center justify-center gap-4 text-zinc-500 text-[11px] pt-1">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" /> Смартфоны
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Laptop className="w-3.5 h-3.5" /> Планшеты и ПК
          </span>
        </div>
      </div>
    </div>
  );
};
