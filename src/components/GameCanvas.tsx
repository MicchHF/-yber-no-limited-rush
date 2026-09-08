import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { VoxotronCylinderEngine, CylinderEngineCallbacks } from '../game/cylinderEngine';
import { GameMode, LightingSettings, VehicleDef, GhostFrame } from '../types';

interface GameCanvasProps {
  vehicleDef: VehicleDef;
  lighting: LightingSettings;
  mode: GameMode;
  isAttractMode?: boolean;
  onUpdateHUD: CylinderEngineCallbacks['onUpdateHUD'];
  onGameOver: CylinderEngineCallbacks['onGameOver'];
  onSectorPassed?: CylinderEngineCallbacks['onSectorPassed'];
  onGrazeTrigger?: CylinderEngineCallbacks['onGrazeTrigger'];
  onEngineReady: (engine: VoxotronCylinderEngine | null) => void;
  ghostData?: GhostFrame[];
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  vehicleDef,
  lighting,
  mode,
  isAttractMode = false,
  onUpdateHUD,
  onGameOver,
  onSectorPassed,
  onGrazeTrigger,
  onEngineReady,
  ghostData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxotronCylinderEngine | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);

  const onUpdateHUDRef = useRef(onUpdateHUD);
  onUpdateHUDRef.current = onUpdateHUD;

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const onSectorPassedRef = useRef(onSectorPassed);
  onSectorPassedRef.current = onSectorPassed;

  const onGrazeTriggerRef = useRef(onGrazeTrigger);
  onGrazeTriggerRef.current = onGrazeTrigger;

  const onEngineReadyRef = useRef(onEngineReady);
  onEngineReadyRef.current = onEngineReady;

  // Mount Three.js Cylinder Engine with deferred iOS Standalone layout safety
  useEffect(() => {
    let isDisposed = false;
    let timerId: any = null;
    let ro: ResizeObserver | null = null;
    let retryCount = 0;

    const startEngine = () => {
      if (isDisposed || !containerRef.current) return;
      const el = containerRef.current;

      // On iOS 17 Standalone WebClip, clientWidth/clientHeight can be 0 initially until layout paint
      if ((el.clientWidth === 0 || el.clientHeight === 0) && retryCount < 10) {
        retryCount++;
        timerId = setTimeout(startEngine, 60);
        return;
      }

      try {
        const engine = new VoxotronCylinderEngine(
          el,
          vehicleDef,
          lighting,
          mode,
          {
            onUpdateHUD: (hud) => onUpdateHUDRef.current?.(hud),
            onGameOver: (res) => onGameOverRef.current?.(res),
            onSectorPassed: (sec) => onSectorPassedRef.current?.(sec),
            onGrazeTrigger: (spd, stk) => onGrazeTriggerRef.current?.(spd, stk),
          },
          isAttractMode,
          ghostData
        );

        if (isDisposed) {
          engine.destroy();
          return;
        }

        engineRef.current = engine;
        onEngineReadyRef.current(engine);

        ro = new ResizeObserver(() => {
          if (engineRef.current) {
            engineRef.current.handleResize();
          }
        });
        ro.observe(el);
      } catch (err: any) {
        console.error('[Voxotron CylinderEngine Init Error]:', err);
        setEngineError(err?.message || 'Не удалось запустить WebGL-графику на данном устройстве');
      }
    };

    // 100ms deferred launch allows iOS standalone viewport and dimensions to initialize
    timerId = setTimeout(startEngine, 100);

    return () => {
      isDisposed = true;
      if (timerId) clearTimeout(timerId);
      if (ro) ro.disconnect();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      onEngineReadyRef.current(null);
    };
  }, []); // Run once on mount! Never destroy/recreate on HUD updates!

  // Update attract mode
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setAttractMode(isAttractMode);
    }
  }, [isAttractMode]);

  // Update vehicle appearance if changed in garage
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateVehicle(vehicleDef);
    }
  }, [vehicleDef]);

  // Update dynamic lighting without recreating WebGL context
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateLighting(lighting);
    }
  }, [lighting]);

  const handleClearCacheAndRestart = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }
    } catch (e) {
      // Safe no-op
    }
    window.location.reload();
  };

  return (
    <div
      id="voxotron-cylinder-viewport"
      ref={containerRef}
      className="absolute inset-0 w-full h-full min-h-[100dvh] overflow-hidden select-none bg-[#090b10]"
    >
      {engineError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-[#0d0f12]/95 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-2xl bg-zinc-900/90 border border-red-500/40 shadow-2xl flex flex-col items-center text-center">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-mono tracking-tight text-white mb-2">
              СБОЙ 3D РЕНДЕРА (STANDALONE)
            </h2>
            <p className="text-sm text-zinc-300 mb-3 font-sans leading-relaxed">
              Не удалось создать WebGL контекст для ускорения графики.
            </p>
            <div className="w-full p-3 rounded-lg bg-black/60 border border-zinc-800 text-xs text-red-300 font-mono break-all mb-6 text-left max-h-24 overflow-y-auto">
              {engineError}
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Повторить
              </button>
              <button
                onClick={handleClearCacheAndRestart}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold font-mono text-xs uppercase tracking-wider transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                Сброс кэша
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
