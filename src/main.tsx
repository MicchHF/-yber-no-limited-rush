import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

// Global error handlers for catching unhandled exceptions in iOS Standalone / WebClip
window.addEventListener('error', (event) => {
  console.error('[UNLIMITED // RUSH Fatal Error]:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UNLIMITED // RUSH Unhandled Rejection]:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
