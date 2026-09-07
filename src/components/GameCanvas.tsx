import React, { useEffect, useRef } from 'react';
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

  // Mount Three.js Cylinder Engine once
  useEffect(() => {
    if (!containerRef.current) return;

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

    engineRef.current = engine;
    onEngineReadyRef.current(engine);

    const ro = new ResizeObserver(() => {
      if (engineRef.current) {
        engineRef.current.handleResize();
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
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

  return (
    <div
      id="voxotron-cylinder-viewport"
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#090b10]"
    />
  );
};
