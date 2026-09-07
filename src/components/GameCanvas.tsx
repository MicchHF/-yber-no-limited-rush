import React, { useState, useEffect, useRef } from 'react';
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
  const [initError, setInitError] = useState<string | null>(null);

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

  // Mount Three.js Cylinder Engine with delayed launch & Standalone protection
  useEffect(() => {
    let isCancelled = false;
    let ro: ResizeObserver | null = null;
    let timerId: any = null;

    const startEngine = () => {
      if (isCancelled || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const width = containerRef.current.clientWidth || rect.width || window.innerWidth;
      const height = containerRef.current.clientHeight || rect.height || window.innerHeight;

      // On iOS Standalone, during splash/transition viewport can briefly be 0
      if ((width <= 0 || height <= 0) && typeof requestAnimationFrame !== 'undefined') {
        timerId = setTimeout(startEngine, 80);
        return;
      }

      try {
        const engine = new VoxotronCylinderEngine(
          containerRef.current,
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

        if (isCancelled) {
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
        ro.observe(containerRef.current);
      } catch (err: any) {
        console.error('[GameCanvas] 3D Engine Initialization Error:', err);
        setInitError(err?.message || 'Не удалось запустить 3D-графику WebGL');
      }
    };

    // Delayed start to ensure DOM and dimensions are fully settled (especially in iOS PWA / WebClip)
    timerId = setTimeout(() => {
      requestAnimationFrame(startEngine);
    }, 100);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      if (ro) ro.disconnect();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      onEngineReadyRef.current(null);
    };
  }, []); // Run once on mount!

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

  const handleHardReset = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (_) {}
    window.location.reload();
  };

  return (
    <div
      id="voxotron-cylinder-viewport"
      ref={containerRef}
      className="absolute inset-0 w-full h-full min-h-[100dvh] overflow-hidden select-none bg-[#090b10]"
    >
      {initError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#090b10]/95 text-center text-zinc-200">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-3xl font-black">
            !
          </div>
          <h3 className="text-xl font-bold font-['Unbounded',sans-serif] text-rose-400 mb-2 tracking-wide">
            СБОЙ ИНИЦИАЛИЗАЦИИ 3D
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
            {initError}. Графический контекст WebGL не смог запуститься.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 text-black font-bold text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform"
            >
              Перезапустить
            </button>
            <button
              onClick={handleHardReset}
              className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-xs tracking-wider uppercase hover:bg-zinc-700 active:scale-95 transition-transform"
            >
              Сбросить кэш
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
