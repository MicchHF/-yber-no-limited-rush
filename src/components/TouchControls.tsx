import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Zap, MoveHorizontal, Sliders } from 'lucide-react';
import { VoxotronCylinderEngine } from '../game/cylinderEngine';
import { sound } from '../services/sound';

interface TouchControlsProps {
  engine: VoxotronCylinderEngine | null;
  layout?: 'swipe_orbit' | 'buttons' | 'gyro';
  sensitivity?: number;
  haptics?: boolean;
  autoBoost?: boolean;
  disabled?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  engine,
  layout: defaultLayout = 'swipe_orbit',
  sensitivity: sensitivityMultiplier = 1.0,
  haptics = true,
  autoBoost = false,
  disabled = false,
}) => {
  const [controlMode, setControlMode] = useState<'screen_drag' | 'buttons'>(
    defaultLayout === 'buttons' ? 'buttons' : 'screen_drag'
  );
  const [isBoosting, setIsBoosting] = useState(false);
  const [activeSteer, setActiveSteer] = useState(0);

  // Full-screen touch tracking
  const activeTouchId = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);

  // Mouse dragging support on desktop
  const isMouseDown = useRef(false);
  const mouseStartX = useRef<number | null>(null);

  // When disabled, reset steer and boost
  useEffect(() => {
    if (disabled && engine) {
      engine.setSteer(0);
      engine.setBoost(false);
      setActiveSteer(0);
      setIsBoosting(false);
    }
  }, [disabled, engine]);

  // Trigger Haptic Vibration if supported
  const triggerHaptic = (duration = 20) => {
    if (haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // Ignored
      }
    }
  };

  const applySteer = (val: number) => {
    const clamped = Math.max(-1, Math.min(1, val));
    setActiveSteer(clamped);
    if (engine) {
      engine.setSteer(clamped);
    }
  };

  // Keyboard listener
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = true;
      updateKeyboardInput();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
      updateKeyboardInput();
    };

    const updateKeyboardInput = () => {
      if (disabled) return;
      let steer = 0;
      if (keysPressed['arrowleft'] || keysPressed['a']) steer -= 1;
      if (keysPressed['arrowright'] || keysPressed['d']) steer += 1;

      const boost =
        keysPressed[' '] ||
        keysPressed['shift'] ||
        keysPressed['arrowup'] ||
        keysPressed['w'] ||
        autoBoost;

      applySteer(steer);

      if (engine) {
        engine.setBoost(boost);
      }
      setIsBoosting(boost);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, autoBoost, disabled]);

  // --- FULL SCREEN TOUCH HANDLING (Anywhere on screen!) ---
  const handleScreenTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    // Check if target is a button
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    if (activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    touchStartX.current = touch.clientX;
    lastTouchX.current = touch.clientX;
    triggerHaptic(15);
  };

  const handleScreenTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || activeTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        const deltaX = touch.clientX - touchStartX.current;
        // Calibrated sensitivity: 80% of original baseline (75px swipe for full steer, scaled by user sensitivity)
        const effectiveSensitivity = 75 / Math.max(0.3, sensitivityMultiplier);
        const steer = Math.max(-1, Math.min(1, deltaX / effectiveSensitivity));
        applySteer(steer);
        lastTouchX.current = touch.clientX;
      }
    }
  };

  const handleScreenTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        activeTouchId.current = null;
        touchStartX.current = null;
        lastTouchX.current = null;
        applySteer(0);
      }
    }
  };

  // --- FULL SCREEN MOUSE DRAG HANDLING (Desktop anywhere on screen) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;
    const deltaX = e.clientX - mouseStartX.current;
    const effectiveSensitivity = 100 / Math.max(0.3, sensitivityMultiplier);
    const steer = Math.max(-1, Math.min(1, deltaX / effectiveSensitivity));
    applySteer(steer);
  };

  const handleMouseUp = () => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      mouseStartX.current = null;
      applySteer(0);
    }
  };

  const handleBoostDown = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    triggerHaptic(40);
    setIsBoosting(true);
    if (engine) engine.setBoost(true);
  };

  const handleBoostUp = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setIsBoosting(false);
    if (engine) engine.setBoost(false);
  };

  return (
    <div
      id="full-screen-touch-controller"
      onTouchStart={handleScreenTouchStart}
      onTouchMove={handleScreenTouchMove}
      onTouchEnd={handleScreenTouchEnd}
      onTouchCancel={handleScreenTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="absolute inset-0 z-20 select-none flex flex-col justify-end p-3 sm:p-5 overflow-hidden pointer-events-auto cursor-grab active:cursor-grabbing"
    >
      {/* Bottom Area: Controls, Buttons & Boost */}
      <div className="w-full flex items-end justify-between pointer-events-auto">
        {/* Left Side: Buttons or Subtle Mode Switcher */}
        {controlMode === 'buttons' ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="touch-btn-left"
              onTouchStart={(e) => {
                e.stopPropagation();
                triggerHaptic();
                applySteer(-1);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                applySteer(0);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                applySteer(-1);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                applySteer(0);
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950/80 active:bg-cyan-500/90 border border-zinc-700 active:border-cyan-400 text-white active:text-zinc-950 flex flex-col items-center justify-center backdrop-blur-md shadow-xl transition-transform active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-8 h-8" />
              <span className="text-[9px] font-black uppercase tracking-wider">ВЛЕВО</span>
            </button>

            <button
              id="touch-btn-right"
              onTouchStart={(e) => {
                e.stopPropagation();
                triggerHaptic();
                applySteer(1);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                applySteer(0);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                applySteer(1);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                applySteer(0);
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950/80 active:bg-cyan-500/90 border border-zinc-700 active:border-cyan-400 text-white active:text-zinc-950 flex flex-col items-center justify-center backdrop-blur-md shadow-xl transition-transform active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-8 h-8" />
              <span className="text-[9px] font-black uppercase tracking-wider">ВПРАВО</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setControlMode('screen_drag');
              }}
              className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
              title="Переключить на свайп"
            >
              <MoveHorizontal className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setControlMode('buttons');
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/70 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              title="Включить экранные кнопки"
            >
              <MoveHorizontal className="w-3 h-3 text-cyan-400" />
              <span>Кнопки</span>
            </button>
          </div>
        )}

        {/* Right Side: Clean Hyper-Boost Button */}
        <div className="flex flex-col items-end">
          <button
            id="touch-btn-boost"
            onTouchStart={handleBoostDown}
            onTouchEnd={handleBoostUp}
            onMouseDown={handleBoostDown}
            onMouseUp={handleBoostUp}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-xl backdrop-blur-md select-none cursor-pointer ${
              isBoosting
                ? 'bg-[#ff007f] border-pink-200 text-white shadow-[0_0_30px_rgba(255,0,127,0.7)]'
                : 'bg-zinc-950/80 border-[#ff007f]/50 text-[#ff007f] hover:border-[#ff007f]'
            }`}
          >
            <Zap className={`w-7 h-7 sm:w-8 sm:h-8 ${isBoosting ? 'fill-current' : ''}`} />
            <span className="text-xs font-black tracking-wider uppercase">
              БУСТ
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
