import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

// Global error handlers to prevent black screen in iOS Standalone WebClip
if (typeof window !== 'undefined') {
  const showFatalErrorBanner = (msg: string) => {
    let el = document.getElementById('voxotron-fatal-error-banner');
    if (!el && document.body) {
      el = document.createElement('div');
      el.id = 'voxotron-fatal-error-banner';
      el.style.cssText =
        'position:fixed;bottom:env(safe-area-inset-bottom,16px);left:16px;right:16px;z-index:999999;background:#18181be6;color:#f4f4f5;padding:12px 16px;border-radius:14px;border:1px solid rgba(239,68,68,0.4);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);font-family:ui-monospace,monospace;font-size:12px;box-shadow:0 12px 30px rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:space-between;gap:12px;';
      el.innerHTML = `
        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">
          <span style="color:#f87171;font-weight:bold;margin-right:6px;">[iOS STANDALONE]</span>
          <span id="voxotron-fatal-error-text"></span>
        </div>
        <button id="voxotron-fatal-error-btn" style="background:#06b6d4;color:#000;border:none;padding:6px 12px;border-radius:8px;font-weight:bold;cursor:pointer;flex-shrink:0;font-size:11px;letter-spacing:0.05em;">
          СБРОС КЭША
        </button>
      `;
      document.body.appendChild(el);
      document.getElementById('voxotron-fatal-error-btn')?.addEventListener('click', async () => {
        try {
          localStorage.clear();
          sessionStorage.clear();
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
          }
        } catch (_) {}
        window.location.reload();
      });
    }
    const textEl = document.getElementById('voxotron-fatal-error-text');
    if (textEl) textEl.textContent = msg;
  };

  window.addEventListener('error', (event) => {
    console.error('[Global Window Error]:', event.error || event.message);
    if (
      event.message &&
      (event.message.includes('ResizeObserver') || event.message.includes('Script error.'))
    ) {
      return;
    }
    showFatalErrorBanner(event.message || 'Сбой скрипта');
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global Unhandled Rejection]:', event.reason);
    const reason = event.reason;
    const msg =
      typeof reason === 'string'
        ? reason
        : reason?.message || 'Необработанная ошибка асинхронного вызова';
    if (msg && msg.includes('ResizeObserver')) return;
    showFatalErrorBanner(msg);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
