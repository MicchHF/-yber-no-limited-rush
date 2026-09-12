import React from 'react';
import {
  Flame,
  Zap,
  Sparkles,
  Pause,
  SunMedium,
  Volume2,
  VolumeX,
  Coins,
  Box,
  AlertTriangle,
  Compass,
  Crosshair,
  Skull,
  ShieldAlert,
  Snowflake,
} from 'lucide-react';
import { SpeedClass, GameMode } from '../types';
import { CylinderHUDState } from '../game/cylinderEngine';

interface CylinderHUDProps {
  hud: CylinderHUDState;
  mode: GameMode;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenLighting: () => void;
}

export const CylinderHUD: React.FC<CylinderHUDProps> = ({
  hud,
  mode,
  isMuted,
  onToggleMute,
  onPause,
  onOpenLighting,
}) => {
  const getSpeedClassBadge = (sc: SpeedClass) => {
    switch (sc) {
      case 'OVERDRIVE':
        return (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ff007f] text-white font-black text-[10px] sm:text-xs tracking-wider shadow-[0_0_15px_#ff007f] animate-pulse">
            <Flame className="w-3 h-3 fill-current" />
            <span>OVERDRIVE</span>
          </div>
        );
      case 'WARP':
        return (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-[10px] sm:text-xs tracking-wider shadow-[0_0_12px_#f59e0b]">
            <Zap className="w-3 h-3 fill-current text-zinc-950" />
            <span>WARP</span>
          </div>
        );
      case 'HYPER':
        return (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-fuchsia-600 text-white font-black text-[10px] sm:text-xs tracking-wider shadow-[0_0_10px_#c026d3]">
            <Zap className="w-3 h-3 fill-current" />
            <span>HYPER</span>
          </div>
        );
      case 'APEX':
        return (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-[10px] tracking-wider shadow-[0_0_8px_#10b981]">
            <Sparkles className="w-3 h-3 text-zinc-950" />
            <span>APEX</span>
          </div>
        );
      case 'FLOW':
        return (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold text-[10px] tracking-wider">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>FLOW</span>
          </div>
        );
      case 'CRUISE':
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 font-bold text-[10px] tracking-wider">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            <span>CRUISE</span>
          </div>
        );
    }
  };

  // Find nearest hazard directly in the flight path (<45m)
  const imminentHazard = hud.obstaclesRadar.find((o) => {
    if (o.distZ <= 0 || o.distZ > 45 || o.type === 'boost_pad' || o.type === 'energy_prism') return false;
    return o.blockedSectors?.some((sec: any) => {
      const center = sec.centerAngle ?? (sec.minAngle + sec.maxAngle) * 0.5;
      const halfArc = sec.halfArc ?? 0.45;
      let diff = Math.abs(center - hud.cylinderAngle) % (Math.PI * 2);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      return diff <= halfArc;
    });
  });

  return (
    <div
      id="cylinder-hud-root"
      className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-5 text-zinc-100 select-none overflow-hidden font-sans"
    >
      {/* Top Telemetry Header - Clean & Focused */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Speedometer & Speed Tier */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            {getSpeedClassBadge(hud.speedClass)}
            <span className="text-[10px] font-mono font-bold text-zinc-400">
              СЕКТОР {hud.currentSector}
            </span>
            {hud.biome && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wider backdrop-blur-md"
                style={{
                  borderColor: `${hud.biome.accentColor}70`,
                  backgroundColor: `${hud.biome.accentColor}15`,
                  color: hud.biome.accentColor,
                }}
              >
                <Compass className="w-2.5 h-2.5" />
                <span>{hud.biome.nameRu}</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              {hud.speedKmh}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-zinc-400 tracking-wider">
              КМ/Ч
            </span>
            {mode === 'sprint_30s' && (
              <span className="ml-1 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase animate-pulse">
                ⚡ МАКС. РАЗГОН
              </span>
            )}
          </div>

          {/* Smoothness Mini Bar */}
          <div className="flex items-center gap-1.5 opacity-80">
            <div className="w-20 sm:w-24 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  hud.smoothness > 80
                    ? 'bg-cyan-400'
                    : hud.smoothness > 50
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${hud.smoothness}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-zinc-400">{hud.smoothness}%</span>
          </div>
        </div>

        {/* Center: Countdown Timer or Distance */}
        <div className="flex flex-col items-center">
          {mode === 'sprint_30s' && hud.remainingTimeMs !== undefined ? (
            <div className="flex flex-col items-center px-4 py-1.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md shadow-md">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                ТАЙМЕР
              </span>
              <span
                className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  hud.remainingTimeMs < 5000 ? 'text-[#ff007f] animate-pulse' : 'text-white'
                }`}
              >
                {(hud.remainingTimeMs / 1000).toFixed(1)}с
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center px-4 py-1.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md shadow-md">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                ДИСТАНЦИЯ
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {hud.distance.toLocaleString('ru-RU')} м
              </span>
            </div>
          )}

          {/* Graze Streak Badge (Only when active) */}
          {hud.grazeStreak > 0 && (
            <div className="mt-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ff007f] text-white font-black text-[11px] shadow-[0_0_15px_#ff007f] animate-bounce">
              <Sparkles className="w-3 h-3 fill-current text-cyan-300" />
              <span>GRAZE x{hud.grazeStreak}</span>
            </div>
          )}
        </div>

        {/* Right: Currency & Action Controls */}
        <div className="flex flex-col items-end gap-2">
          {/* Currencies Pill */}
          <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center gap-1 text-amber-400 font-bold font-mono text-xs">
              <Coins className="w-3.5 h-3.5" />
              <span>{hud.coins}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-xs">
              <Box className="w-3.5 h-3.5" />
              <span>{hud.scrap}</span>
            </div>
          </div>

          {/* Pause Button Only (Clean & uncluttered in-race control) */}
          <div className="pointer-events-auto flex items-center">
            <button
              id="hud-btn-pause"
              onClick={onPause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/80 text-white transition-all shadow-md cursor-pointer active:scale-95"
              title="Пауза (Esc / P)"
            >
              <Pause className="w-3.5 h-3.5 fill-current text-cyan-400" />
              <span className="text-[11px] font-bold font-mono tracking-wider">ПАУЗА</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Biome Transition Banner */}
      {hud.biomeBanner?.show && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 px-6 py-2.5 rounded-2xl bg-[#070912] border-2 border-white/30 z-30 pointer-events-none text-center transform-gpu will-change-transform transition-opacity duration-200">
          <div className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            ВХОД В НОВЫЙ БИОМ
          </div>
          <div
            className="text-xl sm:text-2xl font-black tracking-wider uppercase drop-shadow-[0_0_8px_currentColor]"
            style={{ color: hud.biomeBanner.color }}
          >
            {hud.biomeBanner.nameRu}
          </div>
          <div className="text-xs font-medium text-zinc-300">
            {hud.biomeBanner.subtitle}
          </div>
        </div>
      )}

      {/* Titan Boss Encounter Gauge */}
      {hud.bossState?.active && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md flex flex-col gap-1.5 p-3 rounded-2xl bg-[#090b14] border-2 border-red-500 z-30 pointer-events-none transform-gpu will-change-transform">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-black tracking-wider text-red-400 uppercase">
                ТИТАН БЕЗДНЫ «ОБСИДИАН-ПРЕМЬЕР»
              </span>
            </div>
            <div className="text-[11px] font-mono font-bold text-zinc-300">
              {hud.bossState.progressMeters} / {hud.bossState.targetMeters}м
            </div>
          </div>

          {/* Survival / Integrity Progress Bar */}
          <div className="relative w-full h-3 rounded-full bg-zinc-900 border border-zinc-700/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-150"
              style={{
                width: `${Math.min(100, Math.max(0, (hud.bossState.progressMeters / hud.bossState.targetMeters) * 100))}%`,
              }}
            />
          </div>

          {/* Current Boss Telegraph / Attack */}
          {hud.bossState.warning && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-amber-300">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>{hud.bossState.warning}</span>
            </div>
          )}
        </div>
      )}

      {/* Cryo Freeze Steering Impairment Banner */}
      {hud.cryoFreezeActive && (
        <div className="absolute top-40 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#031525] border-2 border-cyan-400 text-xs font-black text-cyan-200 z-30 pointer-events-none transform-gpu will-change-transform">
          <Snowflake className="w-4 h-4 text-cyan-300 animate-spin" />
          <span>РУЛИ ЗАМОРОЖЕНЫ! МАНЕВРЕННОСТЬ -60%</span>
        </div>
      )}

      {/* Rival Interceptor Drone Warning Banner */}
      {hud.rivalAlert?.show && (
        <div className="absolute top-44 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-[#1a0509] border-2 border-red-500 text-xs sm:text-sm font-black text-red-100 z-30 pointer-events-none text-center transform-gpu will-change-transform">
          <Crosshair className="w-5 h-5 text-red-400 animate-spin" />
          <span>{hud.rivalAlert.message}</span>
        </div>
      )}

      {/* High-Visibility Pickup Floating Popup (Noticeable reward feedback!) */}
      {hud.pickupFeedback && (
        <div
          key={hud.pickupFeedback.id}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center px-5 py-2 rounded-2xl bg-[#080a12] border-2 pointer-events-none z-30 transform-gpu will-change-transform"
          style={{
            borderColor: hud.pickupFeedback.color,
          }}
        >
          <div
            className="text-base sm:text-xl font-black tracking-wide drop-shadow-[0_0_12px_currentColor]"
            style={{ color: hud.pickupFeedback.color }}
          >
            {hud.pickupFeedback.text}
          </div>
          {hud.pickupFeedback.subtext && (
            <div className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wider">
              {hud.pickupFeedback.subtext}
            </div>
          )}
        </div>
      )}

      {/* Subtle Imminent Danger Warning (Only triggers when a crash is really about to happen) */}
      {imminentHazard && (
        <div className="self-center my-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/90 border border-rose-500/80 backdrop-blur-md text-xs font-black text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>ПРЕПЯТСТВИЕ ПО КУРСУ — СМЕЩАЙТЕСЬ!</span>
        </div>
      )}

      {/* Sleek Minimalist 360° Radar at Middle-Right (Unobtrusive) */}
      <div className="self-end my-auto flex flex-col items-center mr-1">
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border border-cyan-500/30 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center shadow-md overflow-hidden">
          {/* Reticle Circles */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(0,240,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="40" cy="40" r="16" fill="none" stroke="rgba(255,0,127,0.1)" strokeWidth="1" />

            {/* Blocked Danger Arcs */}
            {hud.obstaclesRadar.map((obs, oIdx) => {
              if (obs.distZ > 100 || !obs.blockedSectors || obs.type === 'boost_pad' || obs.type === 'energy_prism') return null;
              const isUrgent = obs.distZ < 40;
              const opacity = Math.max(0.3, 1 - obs.distZ / 100);

              return (
                <g key={`obs-arc-${oIdx}`}>
                  {obs.blockedSectors.map((sec: any, sIdx: number) => {
                    const center = sec.centerAngle ?? (sec.minAngle + sec.maxAngle) * 0.5;
                    let relCenter = center - hud.cylinderAngle;
                    while (relCenter > Math.PI) relCenter -= Math.PI * 2;
                    while (relCenter < -Math.PI) relCenter += Math.PI * 2;
                    const halfArc = sec.halfArc ?? 0.42;

                    const a1 = Math.PI / 2 - (relCenter + halfArc);
                    const a2 = Math.PI / 2 - (relCenter - halfArc);
                    const r = 28;
                    const x1 = 40 + r * Math.cos(a1);
                    const y1 = 40 + r * Math.sin(a1);
                    const x2 = 40 + r * Math.cos(a2);
                    const y2 = 40 + r * Math.sin(a2);
                    const span = halfArc * 2;
                    const largeArc = span > Math.PI ? 1 : 0;
                    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

                    return (
                      <path
                        key={`${oIdx}-${sIdx}`}
                        d={d}
                        fill="none"
                        stroke={isUrgent ? '#ff0044' : '#f59e0b'}
                        strokeWidth={isUrgent ? '4' : '2.5'}
                        strokeLinecap="round"
                        opacity={opacity}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Pickups & Pads on Radar */}
          {hud.obstaclesRadar.map((obs, idx) => {
            if (obs.distZ > 90) return null;
            let rel = obs.angle - hud.cylinderAngle;
            while (rel > Math.PI) rel -= Math.PI * 2;
            while (rel < -Math.PI) rel += Math.PI * 2;
            const screenAngle = Math.PI / 2 - rel;
            const r = obs.type === 'boost_pad' ? 18 : obs.type === 'energy_prism' ? 20 : 28;
            const ox = Math.cos(screenAngle) * r;
            const oy = Math.sin(screenAngle) * r;

            return (
              <div
                key={idx}
                className={`absolute rounded-full ${
                  obs.type === 'boost_pad'
                    ? 'w-2 h-2 bg-amber-400'
                    : obs.type === 'energy_prism'
                    ? 'w-2 h-2 bg-cyan-400'
                    : 'w-1.5 h-1.5 bg-rose-500'
                }`}
                style={{
                  transform: `translate(${ox}px, ${oy}px)`,
                }}
              />
            );
          })}

          {/* Player Ship Marker (at 6 o'clock) */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{ transform: 'translate(0px, 28px)' }}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
          </div>
        </div>
      </div>
    </div>
  );
};
