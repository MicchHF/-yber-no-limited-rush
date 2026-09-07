import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Voxotron ErrorBoundary caught fatal crash]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearCacheAndRestart = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isStandalone =
        typeof window !== 'undefined' &&
        ((window.navigator as any).standalone === true ||
          window.matchMedia('(display-mode: standalone)').matches);

      return (
        <div
          id="error-boundary-screen"
          className="fixed inset-0 w-full h-full bg-[#0d0f12] text-zinc-100 flex flex-col items-center justify-center p-6 z-[99999] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]"
        >
          <div className="max-w-lg w-full bg-[#12151a]/95 border border-cyan-500/30 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xl font-black">
                !
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-extrabold text-white tracking-wide">
                  UNLIMITED // СБОЙ ЗАПУСКА
                </h1>
                <p className="text-xs text-zinc-400">
                  {isStandalone ? 'Режим: Standalone PWA (iOS / Домой)' : 'Режим: Веб-браузер'}
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Произошла непредвиденная ошибка при загрузке движка или профиля игры. Если в кэше
              браузера осталась несовместимая старая версия данных, нажмите кнопку очистки ниже.
            </p>

            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-red-300 max-h-36 overflow-y-auto break-all">
              {this.state.error?.name}: {this.state.error?.message || 'Неизвестная ошибка инициализации'}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-clear-cache-restart"
                onClick={this.handleClearCacheAndRestart}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-black font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Очистить кэш и перезапустить</span>
              </button>
              <button
                id="btn-simple-reload"
                onClick={this.handleReload}
                className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-bold py-3.5 px-5 rounded-xl text-sm transition-all border border-zinc-700 flex items-center justify-center cursor-pointer"
              >
                Повторить
              </button>
            </div>

            <div className="text-[11px] text-zinc-500 text-center">
              Экран: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'} •
              Память localStorage защищена
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
