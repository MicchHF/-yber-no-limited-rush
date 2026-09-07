import React, { useState } from 'react';
import { Download, Smartphone, Apple, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed and launched from home screen / standalone, do not show button
  if (isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        id="pwa-install-btn"
        onClick={handleTrigger}
        className={`flex items-center gap-2 font-bold transition-all cursor-pointer select-none active:scale-95 ${
          variant === 'full'
            ? 'px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/40 text-cyan-300 text-xs sm:text-sm shadow-lg shadow-cyan-950/40'
            : 'px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-300 text-xs'
        } ${className}`}
        title="Установить игру на Android / iOS / ПК"
      >
        <Download className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
        <span>Установить приложение</span>
      </button>

      {/* Mobile Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#12151d] border border-cyan-500/40 rounded-2xl shadow-2xl p-5 text-zinc-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Установка UNLIMITED // RUSH</h3>
                  <p className="text-xs text-zinc-400">Запуск без рамок браузера и на весь экран</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              {/* iOS Safari instructions */}
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Apple className="w-4 h-4" />
                  <span>Для iPhone / iPad (Safari):</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-300">
                  <Share2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>1. Нажмите кнопку <strong>«Поделиться»</strong> (значок со стрелкой вверх) в нижней панели Safari.</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-300">
                  <PlusSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>2. Прокрутите список вниз и выберите <strong>«На экран „Домой“»</strong>.</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>3. Нажмите <strong>«Добавить»</strong> в верхнем правом углу. Иконка появится на рабочем столе!</span>
                </div>
              </div>

              {/* Android Chrome instructions */}
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>Для Android (Chrome / Яндекс / Edge):</span>
                </div>
                {isInstallable ? (
                  <button
                    onClick={async () => {
                      await install();
                      setShowGuideModal(false);
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Установить в 1 клик</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5 text-zinc-300">
                    <div>1. Откройте меню браузера (три точки <strong>⋮</strong> в правом верхнем углу).</div>
                    <div>2. Выберите пункт <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.</div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
};
