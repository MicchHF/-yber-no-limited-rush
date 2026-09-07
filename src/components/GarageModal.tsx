import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Rocket,
  Zap,
  Shield,
  Sparkles,
  Check,
  Lock,
  Coins,
  Box,
  Palette,
  Gauge,
  Wind,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sliders,
  Layers,
  Flame,
  ArrowLeft,
  Play,
  RotateCcw,
} from 'lucide-react';
import { UserProfile, VehicleDef } from '../types';
import { sound } from '../services/sound';
import { Hangar3DScene, HangarBiomeTheme } from '../game/hangarScene';
import { ALL_SKINS, getSkinById } from '../game/shipSkins';

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
}

const GLOW_COLORS = [
  { name: 'Неон Циан', hex: '#00f0ff' },
  { name: 'Солнечный Янтарь', hex: '#fbbf24' },
  { name: 'Квантовый Пурпур', hex: '#c084fc' },
  { name: 'Токсичный Изумруд', hex: '#10b981' },
  { name: 'Малиновый Форсаж', hex: '#f43f5e' },
  { name: 'Белая Плазма', hex: '#ffffff' },
];

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  if (!isOpen) return null;

  const [selectedVehId, setSelectedVehId] = useState<string>(profile.selectedVehicleId);
  const [activeTab, setActiveTab] = useState<'skins' | 'tuning' | 'glow'>('skins');
  const [hangarTheme, setHangarTheme] = useState<HangarBiomeTheme>('neo_metropolis');
  const [previewSkinId, setPreviewSkinId] = useState<string | null>(null);
  const [previewGlowColor, setPreviewGlowColor] = useState<string | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const hangarSceneRef = useRef<Hangar3DScene | null>(null);

  const vehicleList = Object.values(profile.vehicles) as VehicleDef[];
  const currentIndex = Math.max(0, vehicleList.findIndex((v) => v.id === selectedVehId));
  const currentVeh = vehicleList[currentIndex] || vehicleList[0];

  const displayVeh: VehicleDef = {
    ...currentVeh,
    selectedSkinId: previewSkinId || currentVeh.selectedSkinId || 'factory_stock',
    glowColor: previewGlowColor || currentVeh.glowColor,
    trailColor: previewGlowColor || currentVeh.trailColor,
  };

  // Initialize or update 3D Hangar Turntable Scene
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    if (!hangarSceneRef.current) {
      hangarSceneRef.current = new Hangar3DScene(canvasContainerRef.current, displayVeh, hangarTheme);
    } else {
      hangarSceneRef.current.setupShip(displayVeh);
    }

    return () => {
      if (hangarSceneRef.current) {
        hangarSceneRef.current.dispose();
        hangarSceneRef.current = null;
      }
    };
  }, []);

  // Update 3D ship when vehicle or skin changes
  useEffect(() => {
    if (hangarSceneRef.current) {
      hangarSceneRef.current.setupShip(displayVeh);
    }
  }, [displayVeh.id, displayVeh.selectedSkinId, displayVeh.glowColor, displayVeh.trailColor]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePrevVehicle();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleNextVehicle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, vehicleList.length]);

  const handlePrevVehicle = () => {
    sound.playClick();
    setPreviewSkinId(null);
    setPreviewGlowColor(null);
    const nextIdx = (currentIndex - 1 + vehicleList.length) % vehicleList.length;
    setSelectedVehId(vehicleList[nextIdx].id);
  };

  const handleNextVehicle = () => {
    sound.playClick();
    setPreviewSkinId(null);
    setPreviewGlowColor(null);
    const nextIdx = (currentIndex + 1) % vehicleList.length;
    setSelectedVehId(vehicleList[nextIdx].id);
  };

  const handlePreviewSkin = (skinId: string) => {
    sound.playClick();
    setPreviewSkinId(skinId);
  };

  const handleClearPreview = () => {
    sound.playClick();
    setPreviewSkinId(null);
    setPreviewGlowColor(null);
  };

  const handlePreviewGlow = (hex: string) => {
    sound.playClick();
    setPreviewGlowColor(hex);
  };

  const handleSelectActive = (vehId: string) => {
    sound.playClick();
    onUpdateProfile((prev) => ({
      ...prev,
      selectedVehicleId: vehId,
    }));
  };

  const handleBuyVehicle = (veh: VehicleDef) => {
    if (profile.coins < veh.price) return;
    sound.playCheckpoint();
    onUpdateProfile((prev) => {
      const chosenSkin = previewSkinId || veh.selectedSkinId || 'stock_factory';
      const skins = veh.unlockedSkins?.length ? [...veh.unlockedSkins] : ['stock_factory'];
      if (previewSkinId && !skins.includes(previewSkinId)) {
        skins.push(previewSkinId);
      }
      const updatedVehicles = {
        ...prev.vehicles,
        [veh.id]: {
          ...veh,
          unlocked: true,
          unlockedSkins: skins,
          selectedSkinId: chosenSkin,
          glowColor: previewGlowColor || veh.glowColor,
          trailColor: previewGlowColor || veh.trailColor,
        },
      };
      return {
        ...prev,
        coins: prev.coins - veh.price,
        vehicles: updatedVehicles,
        selectedVehicleId: veh.id,
      };
    });
  };

  const handleEquipSkin = (skinId: string) => {
    sound.playClick();
    onUpdateProfile((prev) => {
      const target = prev.vehicles[selectedVehId];
      return {
        ...prev,
        vehicles: {
          ...prev.vehicles,
          [selectedVehId]: {
            ...target,
            selectedSkinId: skinId,
          },
        },
      };
    });
  };

  const handleBuySkin = (skinId: string, price: number, scrapPrice: number) => {
    if (profile.coins < price || profile.scrapVoxels < scrapPrice) return;
    sound.playCheckpoint();
    onUpdateProfile((prev) => {
      const target = prev.vehicles[selectedVehId];
      const existing = target.unlockedSkins || ['factory_stock'];
      const updatedSkins = existing.includes(skinId) ? existing : [...existing, skinId];

      return {
        ...prev,
        coins: prev.coins - price,
        scrapVoxels: prev.scrapVoxels - scrapPrice,
        vehicles: {
          ...prev.vehicles,
          [selectedVehId]: {
            ...target,
            unlockedSkins: updatedSkins,
            selectedSkinId: skinId,
          },
        },
      };
    });
  };

  const handleUpgradeStat = (statKey: keyof VehicleDef['stats']) => {
    const currentVal = currentVeh.stats[statKey];
    if (currentVal >= 5) return;
    const upgradeCostCoins = (currentVal + 1) * 110;
    const upgradeCostScrap = (currentVal + 1) * 12;

    if (profile.coins < upgradeCostCoins || profile.scrapVoxels < upgradeCostScrap) return;

    sound.playCheckpoint();
    onUpdateProfile((prev) => {
      const targetVeh = prev.vehicles[selectedVehId];
      const updatedVeh = {
        ...targetVeh,
        stats: {
          ...targetVeh.stats,
          [statKey]: currentVal + 1,
        },
      };
      return {
        ...prev,
        coins: prev.coins - upgradeCostCoins,
        scrapVoxels: prev.scrapVoxels - upgradeCostScrap,
        vehicles: {
          ...prev.vehicles,
          [selectedVehId]: updatedVeh,
        },
      };
    });
  };

  const handleSetGlow = (hex: string) => {
    sound.playClick();
    onUpdateProfile((prev) => ({
      ...prev,
      vehicles: {
        ...prev.vehicles,
        [selectedVehId]: {
          ...prev.vehicles[selectedVehId],
          glowColor: hex,
          trailColor: hex,
        },
      },
    }));
  };

  const statLabels: { key: keyof VehicleDef['stats']; label: string; icon: any }[] = [
    { key: 'maxSpeed', label: 'Пиковая скорость (Top Speed)', icon: Gauge },
    { key: 'acceleration', label: 'Разгон плазмы (Acceleration)', icon: Zap },
    { key: 'handling', label: 'Маневренность 360° (Handling)', icon: Wind },
    { key: 'grazeRadius', label: 'Радиус сближения (Graze Field)', icon: Sparkles },
    { key: 'smoothnessBonus', label: 'Сохранение импульса (Inertia)', icon: Shield },
  ];

  const activeSkin = getSkinById(currentVeh.selectedSkinId || 'factory_stock');
  const unlockedSkins = currentVeh.unlockedSkins || ['factory_stock'];

  return (
    <div
      id="garage-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#050811] text-zinc-100 select-none overflow-hidden"
    >
      {/* ==================================================================== */}
      {/* TOP HEADER BAR                                                      */}
      {/* ==================================================================== */}
      <header className="pt-safe px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b border-zinc-800 bg-[#070b16]/95 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            id="garage-modal-back-btn"
            onClick={onClose}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border border-cyan-500/40 transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.15)] shrink-0 font-bold text-xs sm:text-sm"
            title="Вернуться к игре (ESC)"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Назад к игре</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white truncate">
              Ангар & Тюнинг болидов
            </h1>
          </div>
        </div>

        {/* Currency & Exit */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-zinc-900/90 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs sm:text-sm shadow-[0_0_10px_rgba(251,191,36,0.1)]">
            <Coins className="w-3.5 h-3.5" />
            <span>{profile.coins}</span>
            <span className="text-[9px] text-amber-500/60 font-sans ml-0.5">КР</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs sm:text-sm shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <Box className="w-3.5 h-3.5" />
            <span>{profile.scrapVoxels}</span>
            <span className="text-[9px] text-emerald-500/60 font-sans ml-0.5 hidden sm:inline">СКРАП</span>
          </div>

          <button
            id="garage-modal-close"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/80 transition-all cursor-pointer active:scale-95 text-xs font-bold"
            title="Закрыть (ESC)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Закрыть</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN SHOWROOM VIEWPORT (3D Turntable + Racing HUD Controls)          */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* LEFT/CENTER: 3D TURNTABLE VIEWPORT */}
        <div className="h-[34vh] sm:h-[40vh] lg:h-auto lg:flex-1 relative flex flex-col min-h-[220px] shrink-0">
          {/* WebGL Canvas Container */}
          <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Biome Atmosphere Selector & 360 Hint */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/85 border border-zinc-700/60 backdrop-blur-md shadow-lg">
              <span className="text-[10px] text-zinc-400 font-mono px-1.5 hidden xl:inline">БИОМ АНГАРА:</span>
              {[
                { id: 'neo_metropolis', name: '🏙️ Нео-Сити' },
                { id: 'inferno_core', name: '🔥 Магма' },
                { id: 'cryo_void', name: '❄️ Крио' },
                { id: 'quantum_horizon', name: '🌌 Квантум' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setHangarTheme(theme.id as HangarBiomeTheme);
                    hangarSceneRef.current?.setBiomeTheme(theme.id as HangarBiomeTheme);
                    sound.playClick();
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    hangarTheme === theme.id
                      ? 'bg-cyan-500 text-zinc-950 shadow-md'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-[11px] font-mono backdrop-blur-md">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>360° обзор</span>
            </div>
          </div>

          {/* Active Color Preview Indicator */}
          {(previewSkinId || previewGlowColor) && (
            <div className="absolute top-12 sm:top-14 left-2.5 z-10 flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-lg animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Предпросмотр окраски: {activeSkin.name}</span>
              <button
                onClick={handleClearPreview}
                className="ml-1 px-1.5 py-0.5 rounded bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] border border-zinc-700"
              >
                Сбросить ✕
              </button>
            </div>
          )}

          {/* Viewport Action Controls: Thruster Rev & Camera Reset */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-2">
            <button
              id="hangar-rev-engine-btn"
              onClick={() => {
                sound.playBoost();
                hangarSceneRef.current?.revEngine();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs shadow-[0_0_12px_rgba(244,63,94,0.25)] transition-all cursor-pointer active:scale-95 backdrop-blur-md"
              title="Тест форсажных камер болида"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Форсаж</span>
            </button>

            <button
              id="hangar-reset-camera-btn"
              onClick={() => {
                sound.playClick();
                hangarSceneRef.current?.resetCamera();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all cursor-pointer active:scale-95 backdrop-blur-md flex items-center gap-1 text-xs"
              title="Сбросить угол обзора"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сброс</span>
            </button>

            {/* Active Skin Label */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 border border-zinc-800 backdrop-blur-md">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeSkin.glowColor || activeSkin.baseColor }}
              />
              <span className="text-[11px] font-bold text-white truncate max-w-[120px]">{activeSkin.name}</span>
            </div>
          </div>

          {/* Bottom Overlaid Ship Card & Carousel Controls */}
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-2xl bg-black/80 border border-cyan-900/50 backdrop-blur-lg">
            {/* Ship Details */}
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <button
                id="btn-prev-ship"
                onClick={handlePrevVehicle}
                className="p-2 sm:p-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition-all cursor-pointer active:scale-95 shadow-md shrink-0"
                title="Предыдущий корабль (A / Стрелка влево)"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex flex-col text-center sm:text-left min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider truncate">
                    {currentVeh.manufacturer || 'HAMSTER DYNAMICS'}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 shrink-0">
                    {currentVeh.vesselClass || 'CLASS-A'}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide truncate">{currentVeh.name}</h2>
                <p className="text-[11px] text-zinc-400 line-clamp-1 hidden sm:block">{currentVeh.subtitle}</p>
              </div>

              <button
                id="btn-next-ship"
                onClick={handleNextVehicle}
                className="p-2 sm:p-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition-all cursor-pointer active:scale-95 shadow-md shrink-0"
                title="Следующий корабль (D / Стрелка вправо)"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Ship Action: Buy / Select / Active */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-stretch sm:justify-end">
              {!currentVeh.unlocked ? (
                <button
                  id="btn-buy-vehicle"
                  onClick={() => handleBuyVehicle(currentVeh)}
                  disabled={profile.coins < currentVeh.price}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg ${
                    profile.coins >= currentVeh.price
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-amber-500/25 cursor-pointer active:scale-95'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Разблокировать</span>
                  <span className="flex items-center gap-0.5 font-mono text-xs ml-1 font-black">
                    <Coins className="w-3 h-3" />
                    {currentVeh.price}
                  </span>
                </button>
              ) : profile.selectedVehicleId !== currentVeh.id ? (
                <button
                  id="btn-select-vehicle"
                  onClick={() => handleSelectActive(currentVeh.id)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Выбрать болид</span>
                </button>
              ) : (
                <button
                  id="btn-play-selected-ship"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-zinc-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  title="Вернуться к заезду с этим болидом"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>В игру (Выбран) ▶</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE CUSTOMIZATION & TUNING PANEL */}
        <aside className="w-full lg:w-[440px] flex-1 lg:h-full flex flex-col bg-[#080c18] border-t lg:border-t-0 lg:border-l border-zinc-800/80 z-20 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/80 p-1.5 sm:p-2 gap-1 overflow-x-auto scrollbar-none flex-nowrap shrink-0">
            <button
              id="tab-skins"
              onClick={() => {
                sound.playClick();
                setActiveTab('skins');
              }}
              className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'skins'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ливреи & Скины</span>
            </button>

            <button
              id="tab-tuning"
              onClick={() => {
                sound.playClick();
                setActiveTab('tuning');
              }}
              className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tuning'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Тюнинг систем</span>
            </button>

            <button
              id="tab-glow"
              onClick={() => {
                sound.playClick();
                setActiveTab('glow');
              }}
              className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'glow'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Плазма шлейфа</span>
            </button>
          </div>

          {/* TAB CONTENT: SKINS & LIVERIES */}
          {activeTab === 'skins' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Доступные гоночные ливреи ({ALL_SKINS.length})
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">PBR Texture Generator</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {ALL_SKINS.map((skin) => {
                  const isPreviewing = previewSkinId === skin.id;
                  const isEquipped = (currentVeh.selectedSkinId || 'factory_stock') === skin.id && !previewSkinId;
                  const isSkinUnlocked = unlockedSkins.includes(skin.id);
                  const scrapPrice = skin.scrapPrice ?? Math.max(8, Math.floor(skin.price * 0.12));
                  const canAfford =
                    profile.coins >= skin.price && profile.scrapVoxels >= scrapPrice;
                  const skinTier = skin.tier || skin.rarity;

                  return (
                    <div
                      key={skin.id}
                      id={`skin-card-${skin.id}`}
                      onClick={() => handlePreviewSkin(skin.id)}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer ${
                        isEquipped
                          ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                          : isPreviewing
                          ? 'bg-amber-950/35 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/50'
                          : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {/* Color swatch pair */}
                          <div className="flex -space-x-1.5">
                            <div
                              className="w-5 h-5 rounded-full border border-black shadow"
                              style={{ backgroundColor: skin.baseColor }}
                            />
                            <div
                              className="w-5 h-5 rounded-full border border-black shadow"
                              style={{ backgroundColor: skin.glowColor || skin.baseColor }}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white">{skin.name}</h4>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                  skinTier === 'legendary'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : skinTier === 'epic'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : skinTier === 'rare'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {skinTier.toUpperCase()}
                              </span>
                              {isPreviewing && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950 uppercase">
                                  В ПРЕВЬЮ
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 line-clamp-1">{skin.description}</p>
                          </div>
                        </div>

                        {/* Action: Equipped / Equip / Unlock / Preview */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!isEquipped && (
                            <button
                              onClick={() => handlePreviewSkin(skin.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                                isPreviewing
                                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                              }`}
                              title="Посмотреть эту окраску на 3D болиде"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{isPreviewing ? 'В превью' : 'Посмотреть'}</span>
                            </button>
                          )}

                          {isEquipped ? (
                            <div className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3 text-cyan-400" />
                              <span>УСТАНОВЛЕНО</span>
                            </div>
                          ) : isSkinUnlocked ? (
                            <button
                              id={`btn-equip-${skin.id}`}
                              onClick={() => {
                                handleEquipSkin(skin.id);
                                setPreviewSkinId(null);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-600 hover:text-black text-white text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                            >
                              Применить
                            </button>
                          ) : currentVeh.unlocked ? (
                            <button
                              id={`btn-buy-skin-${skin.id}`}
                              onClick={() => {
                                handleBuySkin(skin.id, skin.price, scrapPrice);
                                setPreviewSkinId(null);
                              }}
                              disabled={!canAfford}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                                canAfford
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-zinc-950 cursor-pointer active:scale-95 shadow-md'
                                  : 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-zinc-700/40'
                              }`}
                            >
                              <Lock className="w-3 h-3 shrink-0" />
                              <span className="flex items-center gap-0.5">
                                <Coins className="w-3 h-3 text-amber-900" />
                                {skin.price}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Box className="w-3 h-3 text-emerald-900" />
                                {scrapPrice}
                              </span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-mono px-2">
                              Скин заблокирован
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT: TUNING & UPGRADES */}
          {activeTab === 'tuning' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Модернизация бортовых систем болида
              </span>

              <div className="flex flex-col gap-2.5">
                {statLabels.map(({ key, label, icon: Icon }) => {
                  const currentLevel = currentVeh.stats[key];
                  const isMax = currentLevel >= 5;
                  const costCoins = (currentLevel + 1) * 110;
                  const costScrap = (currentLevel + 1) * 12;
                  const canAfford =
                    currentVeh.unlocked &&
                    !isMax &&
                    profile.coins >= costCoins &&
                    profile.scrapVoxels >= costScrap;

                  return (
                    <div
                      key={key}
                      className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                          <Icon className="w-3.5 h-3.5 text-amber-400" />
                          <span>{label}</span>
                        </div>

                        {/* Level Pips */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`w-6 h-2 rounded-sm transition-all ${
                                lvl <= currentLevel
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                                  : 'bg-zinc-800'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] font-mono text-zinc-500 ml-1.5">
                            {currentLevel}/5
                          </span>
                        </div>
                      </div>

                      {currentVeh.unlocked && !isMax && (
                        <button
                          id={`upgrade-btn-${key}`}
                          onClick={() => handleUpgradeStat(key)}
                          disabled={!canAfford}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center ${
                            canAfford
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 cursor-pointer active:scale-95'
                              : 'bg-zinc-800/80 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-black">Апгрейд</span>
                          <span className="text-[9px] font-mono opacity-90">
                            {costCoins}💰 {costScrap}📦
                          </span>
                        </button>
                      )}

                      {isMax && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase font-mono">
                          МАКС LVL
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT: PLASMA TAIL GLOW */}
          {activeTab === 'glow' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Кастомизация плазменного выхлопа и подцветки
              </span>

              <div className="flex flex-col gap-2">
                <span className="text-xs text-zinc-300 font-semibold">
                  Цвет светового следа (Light Trail):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {GLOW_COLORS.map((c) => {
                    const isCur =
                      (displayVeh.glowColor || '').toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        id={`glow-opt-${c.hex.replace('#', '')}`}
                        onClick={() => {
                          handlePreviewGlow(c.hex);
                          if (currentVeh.unlocked) {
                            handleSetGlow(c.hex);
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer active:scale-95 ${
                          isCur
                            ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-cyan-400'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-black shadow-[0_0_8px_currentColor]"
                          style={{ backgroundColor: c.hex, color: c.hex }}
                        />
                        <span className="text-xs font-bold">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Hangar Quick Strip + Back to Game button */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <span className="text-[10px] font-mono text-zinc-500">
                БОЛИД {currentIndex + 1} ИЗ {vehicleList.length}
              </span>
              <div className="flex items-center gap-1.5">
                {vehicleList.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedVehId(v.id);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      i === currentIndex ? 'bg-cyan-400 scale-125' : 'bg-zinc-700 hover:bg-zinc-500'
                    }`}
                    title={v.name}
                  />
                ))}
              </div>
            </div>

            <button
              id="btn-garage-done-bottom"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Готово, в игру</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
