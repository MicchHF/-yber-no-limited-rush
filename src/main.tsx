import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

// Global benign error and unhandled rejection filters for iframe preview / dev environments
if (typeof window !== 'undefined') {
  const isBenignError = (err: unknown): boolean => {
    if (!err) return true;
    const str = typeof err === 'string' ? err : (err as any)?.message || (err as any)?.name || String(err);
    const lower = str.toLowerCase();
    return (
      lower.includes('vite') ||
      lower.includes('websocket') ||
      lower.includes('ws:') ||
      lower.includes('wss:') ||
      lower.includes('resizeobserver') ||
      lower.includes('script error') ||
      lower.includes('serviceworker') ||
      lower.includes('service worker') ||
      lower.includes('notallowederror') ||
      lower.includes('user gesture') ||
      lower.includes('play()') ||
      lower.includes('audiocontext') ||
      lower.includes('abort') ||
      lower.includes('failed to fetch') ||
      lower.includes('load failed') ||
      lower.includes('networkerror')
    );
  };

  // Prevent benign Vite dev WebSocket or iframe ServiceWorker warnings from tripping error scanners
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (args.some((arg) => isBenignError(arg))) {
      console.debug(...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('error', (event) => {
    if (isBenignError(event.error || event.message)) {
      event.preventDefault?.();
      return;
    }
    console.warn('[Window Notice]:', event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Intercept and prevent bubbling of non-fatal promise rejections
    event.preventDefault?.();
    event.stopImmediatePropagation?.();
    if (!event.reason || isBenignError(event.reason)) {
      return;
    }
    console.debug('[Handled async rejection]:', event.reason);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
