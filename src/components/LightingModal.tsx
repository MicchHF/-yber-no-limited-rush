import React from 'react';
import { X, Sun, Sliders, Cpu } from 'lucide-react';
import { LightingSettings, QualityProfile } from '../types';
import { LIGHTING_PRESETS_LIST, LIGHTING_PRESETS } from '../game/lighting';

interface LightingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LightingSettings;
  onChange: (newSettings: LightingSettings) => void;
}

export const LightingModal: React.FC<LightingModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
}) => {
  if (!isOpen) return null;

  const handlePresetSelect = (presetId: string) => {
    const preset = LIGHTING_PRESETS[presetId];
    if (!preset) return;
    onChange({
      ...settings,
      ...preset,
      preset: presetId,
    });
  };

  const handleQualitySelect = (qualityProfile: QualityProfile) => {
    onChange({
      ...settings,
      qualityProfile,
      shadowsEnabled: qualityProfile !== 'low',
    });
  };

  return (
    <div id="lighting-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-[#12151b] border border-zinc-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-zinc-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Атмосфера и освещение</h2>
              <p className="text-xs text-zinc-400">Минималистичная светотень и оптимизация FPS</p>
            </div>
          </div>
          <button
            id="lighting-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Атмосферные пресеты
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LIGHTING_PRESETS_LIST.map((p) => {
              const isSelected = settings.preset === p.id;
              return (
                <button
                  key={p.id}
                  id={`preset-${p.id}`}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 leading-tight">{p.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality & Weak Device Optimization */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Оптимизация для слабых устройств
            </label>
            <span className="text-[10px] text-emerald-400 font-mono">60 FPS target</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as QualityProfile[]).map((q) => {
              const isSel = settings.qualityProfile === q;
              const labels = {
                low: 'Энергосбережение',
                medium: 'Баланс',
                high: 'Максимум',
              };
              const subs = {
                low: '1.0x, без теней',
                medium: '1.25x, мягкие тени',
                high: '1.75x, HD тени',
              };
              return (
                <button
                  key={q}
                  id={`quality-opt-${q}`}
                  onClick={() => handleQualitySelect(q)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSel
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-bold">{labels[q]}</div>
                  <div className="text-[9px] opacity-75 mt-0.5">{subs[q]}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deep Lighting Sliders */}
        <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800/80">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Тонкая настройка светотени
          </label>

          {/* Sun Intensity */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Яркость направленного света</span>
              <span className="font-mono text-amber-400">{settings.sunIntensity.toFixed(2)}x</span>
            </div>
            <input
              id="slider-sun-intensity"
              type="range"
              min="0.2"
              max="1.8"
              step="0.05"
              value={settings.sunIntensity}
              onChange={(e) => onChange({ ...settings, sunIntensity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Ambient Light */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Рассеянный свет (Ambient)</span>
              <span className="font-mono text-amber-400">{settings.ambientIntensity.toFixed(2)}x</span>
            </div>
            <input
              id="slider-ambient-intensity"
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.ambientIntensity}
              onChange={(e) => onChange({ ...settings, ambientIntensity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Fog Density */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Плотность атмосферного тумана</span>
              <span className="font-mono text-amber-400">{(settings.fogDensity * 1000).toFixed(1)}</span>
            </div>
            <input
              id="slider-fog-density"
              type="range"
              min="0.003"
              max="0.030"
              step="0.001"
              value={settings.fogDensity}
              onChange={(e) => onChange({ ...settings, fogDensity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer">
              <span className="text-xs text-zinc-300">Динамические тени</span>
              <input
                id="toggle-shadows"
                type="checkbox"
                checked={settings.shadowsEnabled}
                onChange={(e) => onChange({ ...settings, shadowsEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer">
              <span className="text-xs text-zinc-300">Мягкое свечение</span>
              <input
                id="toggle-bloom"
                type="checkbox"
                checked={settings.bloomEnabled}
                onChange={(e) => onChange({ ...settings, bloomEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            id="btn-apply-lighting"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
          >
            Применить атмосферу
          </button>
        </div>
      </div>
    </div>
  );
};
