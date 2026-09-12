import * as THREE from 'three';
import { SkinDef } from '../types';

export const ALL_SKINS: SkinDef[] = [
  {
    id: 'factory_stock',
    name: 'Заводской оригинал // Amber Glow',
    description: 'Оригинальная титано-композитная обшивка завода Squeezed Hamster Aerospace с золотистым лаком.',
    rarity: 'common',
    price: 0,
    previewGradient: 'from-amber-400 via-yellow-500 to-zinc-900',
    baseColor: '#ffb703',
    glowColor: '#00f0ff',
    trailColor: '#00f0ff',
    roughness: 0.25,
    metalness: 0.8,
    pattern: 'factory',
  },
  {
    id: 'carbon_matrix',
    name: 'Карбоновая матрица // 07',
    description: 'Углепластиковый монокок с открытым плетением, неоновыми квантовыми шинами и циан-полосами.',
    rarity: 'rare',
    price: 250,
    previewGradient: 'from-zinc-900 via-cyan-900 to-cyan-400',
    baseColor: '#161c28',
    glowColor: '#00f0ff',
    trailColor: '#00f0ff',
    roughness: 0.15,
    metalness: 0.9,
    pattern: 'carbon_matrix',
  },
  {
    id: 'hazard_tiger',
    name: 'Тигровый форсаж // Hazard',
    description: 'Слепящий гоночный жёлтый цвет с агрессивными черными диагональными полосами.',
    rarity: 'rare',
    price: 320,
    previewGradient: 'from-yellow-400 via-amber-500 to-zinc-900',
    baseColor: '#ffea00',
    glowColor: '#ff9900',
    trailColor: '#ffea00',
    roughness: 0.2,
    metalness: 0.7,
    pattern: 'hazard_tiger',
  },
  {
    id: 'synthwave_sunset',
    name: 'Синтвейв // Cyber Glitch',
    description: 'Сочный градиент неонового заката Нео-Токио: от фуксии к индиго с лазерной сеткой.',
    rarity: 'epic',
    price: 550,
    previewGradient: 'from-fuchsia-500 via-pink-500 to-cyan-400',
    baseColor: '#ff007f',
    glowColor: '#00f0ff',
    trailColor: '#ff007f',
    roughness: 0.12,
    metalness: 0.92,
    pattern: 'synthwave_sunset',
  },
  {
    id: 'arctic_hex',
    name: 'Арктический стелс // Hex',
    description: 'Ослепительно белая криогенная броня с небесно-голубым гексагональным камуфляжем.',
    rarity: 'epic',
    price: 680,
    previewGradient: 'from-slate-50 via-sky-200 to-cyan-400',
    baseColor: '#f8fafc',
    glowColor: '#00f0ff',
    trailColor: '#7dd3fc',
    roughness: 0.2,
    metalness: 0.6,
    pattern: 'arctic_hex',
  },
  {
    id: 'toxic_venom',
    name: 'Токсичный яд // Acid Lab',
    description: 'Графитовая броня с пылающими кислотно-зелеными линиями плазменного охлаждения.',
    rarity: 'epic',
    price: 750,
    previewGradient: 'from-emerald-400 via-lime-400 to-zinc-900',
    baseColor: '#0a1711',
    glowColor: '#00ff66',
    trailColor: '#00ff66',
    roughness: 0.2,
    metalness: 0.85,
    pattern: 'toxic_venom',
  },
  {
    id: 'sakura_cyber',
    name: 'Сакура Нео-Токио // Blossom',
    description: 'Яркий перламутровый неоново-розовый монокок с белоснежными иероглифами скорости.',
    rarity: 'epic',
    price: 780,
    previewGradient: 'from-pink-500 via-rose-400 to-fuchsia-600',
    baseColor: '#ff2a85',
    glowColor: '#ffffff',
    trailColor: '#ff66c4',
    roughness: 0.15,
    metalness: 0.85,
    pattern: 'sakura_cyber',
  },
  {
    id: 'solar_flare',
    name: 'Солнечная Вспышка // Plasma',
    description: 'Огненный градиент солнечной короны: слепящий апельсиновый ультра-глянец с золотыми соплами.',
    rarity: 'epic',
    price: 850,
    previewGradient: 'from-orange-500 via-amber-400 to-yellow-300',
    baseColor: '#ff5500',
    glowColor: '#ffee00',
    trailColor: '#ff7700',
    roughness: 0.14,
    metalness: 0.88,
    pattern: 'solar_flare',
  },
  {
    id: 'imperial_gold',
    name: 'Имперский абсолют // 24K',
    description: 'Зеркальное червонное золото с платиновыми соплами и кристальным зеркальным отражением.',
    rarity: 'legendary',
    price: 1200,
    previewGradient: 'from-amber-300 via-yellow-400 to-amber-500',
    baseColor: '#ffc700',
    glowColor: '#fffbeb',
    trailColor: '#ffc700',
    roughness: 0.06,
    metalness: 0.98,
    pattern: 'imperial_gold',
  },
  {
    id: 'electric_violet',
    name: 'Электро-Виолет // Acid Volt',
    description: 'Насыщенный кибер-ультрафиолет с контрастными ядовито-лаймовыми гоночными стрелами.',
    rarity: 'legendary',
    price: 1350,
    previewGradient: 'from-purple-600 via-fuchsia-600 to-lime-400',
    baseColor: '#7c3aed',
    glowColor: '#39ff14',
    trailColor: '#a855f7',
    roughness: 0.15,
    metalness: 0.9,
    pattern: 'electric_violet',
  },
  {
    id: 'hyper_cobalt',
    name: 'Кобальт Ле-Ман // Gulf Tech',
    description: 'Глубокий королевский синий металлик с контрастной ярко-оранжевой гоночной полосой.',
    rarity: 'legendary',
    price: 1400,
    previewGradient: 'from-sky-600 via-blue-600 to-amber-500',
    baseColor: '#0284c7',
    glowColor: '#ff7700',
    trailColor: '#38bdf8',
    roughness: 0.12,
    metalness: 0.92,
    pattern: 'hyper_cobalt',
  },
  {
    id: 'kaneda_racing',
    name: 'Канеда // Arasaka Pro',
    description: 'Культовая ярко-алая спортивная ливрея с белыми гоночными полосами и спонсорскими эмблемами.',
    rarity: 'legendary',
    price: 1500,
    previewGradient: 'from-red-500 via-rose-600 to-white',
    baseColor: '#ff003c',
    glowColor: '#ffffff',
    trailColor: '#ff003c',
    roughness: 0.14,
    metalness: 0.8,
    pattern: 'kaneda_racing',
  },
  {
    id: 'neon_cyberpunk',
    name: 'Неон Киберпанк // 2099',
    description: 'Ультра-яркий неоново-розовый монокок с ядовито-лаймовыми стрелами и светящимися кибер-символами.',
    rarity: 'legendary',
    price: 1650,
    previewGradient: 'from-fuchsia-500 via-pink-500 to-lime-400',
    baseColor: '#ff007f',
    glowColor: '#39ff14',
    trailColor: '#ff007f',
    roughness: 0.1,
    metalness: 0.9,
    pattern: 'neon_cyberpunk',
  },
  {
    id: 'gold_phoenix',
    name: 'Золотой Феникс // Phoenix',
    description: 'Пылающее зеркальное золото с огненными багровыми всполохами плазмы вдоль бортов.',
    rarity: 'legendary',
    price: 1800,
    previewGradient: 'from-amber-400 via-orange-500 to-red-600',
    baseColor: '#ffb703',
    glowColor: '#ff3300',
    trailColor: '#ffb703',
    roughness: 0.08,
    metalness: 0.96,
    pattern: 'gold_phoenix',
  },
  {
    id: 'plasma_aurora',
    name: 'Плазменная Аврора // Borealis',
    description: 'Космический спектр северного сияния: сочный бирюзовый, изумрудный и электрический индиго.',
    rarity: 'epic',
    price: 950,
    previewGradient: 'from-teal-400 via-emerald-400 to-indigo-600',
    baseColor: '#00f0ff',
    glowColor: '#10b981',
    trailColor: '#06b6d4',
    roughness: 0.12,
    metalness: 0.88,
    pattern: 'plasma_aurora',
  },
  {
    id: 'hyper_redline',
    name: 'Красная Линия // Redline GT',
    description: 'Гоночный глянец Rosso Corsa со сдвоенными белоснежными полосами Ле-Ман и золотой отделкой.',
    rarity: 'legendary',
    price: 1900,
    previewGradient: 'from-red-600 via-red-500 to-white',
    baseColor: '#e11d48',
    glowColor: '#fcee0a',
    trailColor: '#e11d48',
    roughness: 0.06,
    metalness: 0.95,
    pattern: 'hyper_redline',
  },
];

export function getSkinById(id?: string): SkinDef {
  return ALL_SKINS.find((s) => s.id === id) || ALL_SKINS[0];
}

// Cached canvas textures so materials are only rendered once
const textureCache = new Map<string, THREE.CanvasTexture>();

export function generateSkinTexture(skin: SkinDef): THREE.CanvasTexture {
  if (textureCache.has(skin.id)) {
    return textureCache.get(skin.id)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base background fill
  ctx.fillStyle = skin.baseColor;
  ctx.fillRect(0, 0, 512, 512);

  switch (skin.pattern) {
    case 'carbon_matrix': {
      // Carbon fiber weave
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      for (let y = 0; y < 512; y += 8) {
        for (let x = 0; x < 512; x += 8) {
          if ((x / 8 + y / 8) % 2 === 0) {
            ctx.fillRect(x, y, 8, 8);
          }
        }
      }
      // High-tech racing stripe & cyan circuit traces
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(240, 0, 8, 512);
      ctx.fillRect(264, 0, 8, 512);

      // Decal: #07
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('07', 256, 320);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('CARBON // V.2', 256, 370);
      break;
    }

    case 'hazard_tiger': {
      // Diagonal hazard chevrons
      ctx.fillStyle = '#111319';
      ctx.beginPath();
      for (let i = -512; i < 1024; i += 64) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 32, 0);
        ctx.lineTo(i - 96, 512);
        ctx.lineTo(i - 128, 512);
      }
      ctx.fill();

      // Bold hazard banner
      ctx.fillStyle = '#000000';
      ctx.fillRect(180, 0, 152, 512);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(190, 0, 8, 512);
      ctx.fillRect(314, 0, 8, 512);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(256, 256);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('CAUTION // EXPERIMENTAL', 0, 0);
      ctx.restore();
      break;
    }

    case 'synthwave_sunset': {
      // Neon Synthwave Sunset gradient
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#ff007f');
      grad.addColorStop(0.5, '#7928ca');
      grad.addColorStop(1, '#00f0ff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Retro horizon grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 3;
      for (let y = 128; y < 512; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Center glowing sun decal
      ctx.fillStyle = '#fffb26';
      ctx.beginPath();
      ctx.arc(256, 180, 60, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'arctic_hex': {
      // Arctic camouflage base
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 512, 512);

      // Light gray geometric camo patches
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(40, 60); ctx.lineTo(160, 20); ctx.lineTo(220, 140); ctx.lineTo(90, 160); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(340, 280); ctx.lineTo(480, 240); ctx.lineTo(440, 420); ctx.lineTo(310, 360); ctx.fill();

      // Electric cyan hex grid overlay
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)';
      ctx.lineWidth = 2;
      const r = 24;
      const h = r * Math.sqrt(3);
      for (let y = 0; y < 512 + h; y += h) {
        for (let x = 0; x < 512 + r * 3; x += r * 3) {
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (a * Math.PI) / 3;
            const px = x + r * Math.cos(angle);
            const py = y + r * Math.sin(angle);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    }

    case 'toxic_venom': {
      // Deep graphite carbon
      ctx.fillStyle = '#090d14';
      ctx.fillRect(0, 0, 512, 512);

      // Acid green plasma veins
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(60, 0); ctx.lineTo(180, 200); ctx.lineTo(140, 512);
      ctx.moveTo(452, 0); ctx.lineTo(332, 200); ctx.lineTo(372, 512);
      ctx.stroke();

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Biohazard / Radiation symbol
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 80px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('☣ 09', 256, 300);
      break;
    }

    case 'imperial_gold': {
      // Polished gold gradient
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#ffe57f');
      grad.addColorStop(0.3, '#ffc107');
      grad.addColorStop(0.6, '#ffd54f');
      grad.addColorStop(1, '#b58500');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Platinum racing accents
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(236, 0, 40, 512);

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 28px serif';
      ctx.textAlign = 'center';
      ctx.fillText('IMPERIAL // 24K', 256, 260);
      break;
    }

    case 'kaneda_racing': {
      // Racing Crimson with white dual stripes
      ctx.fillStyle = '#ff003c';
      ctx.fillRect(0, 0, 512, 512);

      // Crisp white racing twin stripes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(190, 0, 40, 512);
      ctx.fillRect(282, 0, 40, 512);

      // Sponsor decals
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ARASAKA', 256, 280);

      ctx.fillStyle = '#111827';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('CANON // SPEED DEMON', 256, 330);
      break;
    }

    case 'sakura_cyber': {
      // Neon blossom magenta-pink base
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#ff2a85');
      grad.addColorStop(0.6, '#f43f5e');
      grad.addColorStop(1, '#9333ea');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Crisp white geometric racing lines
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(246, 0, 20, 512);

      // Japanese Kanji for High Speed / Swift Wind (疾風)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 64px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('疾風', 256, 260);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('SAKURA // TOKYO', 256, 320);

      // Blossom petals
      ctx.fillStyle = '#fbcfe8';
      for (let i = 0; i < 8; i++) {
        const px = 100 + (i * 45) % 320;
        const py = 60 + i * 50;
        ctx.beginPath();
        ctx.ellipse(px, py, 14, 7, (i * Math.PI) / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'solar_flare': {
      // Saturated fiery solar corona
      const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 360);
      grad.addColorStop(0, '#fffbeb');
      grad.addColorStop(0.2, '#ffea00');
      grad.addColorStop(0.55, '#ff5500');
      grad.addColorStop(1, '#991b1b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Golden racing arcs
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(256, 256, 180, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SOLAR // 01', 256, 275);
      break;
    }

    case 'electric_violet': {
      // Deep cyberpunk ultraviolet
      ctx.fillStyle = '#581c87';
      ctx.fillRect(0, 0, 512, 512);

      // Saturated radioactive lime racing chevrons
      ctx.fillStyle = '#39ff14';
      ctx.beginPath();
      ctx.moveTo(256, 60); ctx.lineTo(380, 200); ctx.lineTo(340, 200); ctx.lineTo(256, 110); ctx.lineTo(172, 200); ctx.lineTo(132, 200); ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(256, 180); ctx.lineTo(380, 320); ctx.lineTo(340, 320); ctx.lineTo(256, 230); ctx.lineTo(172, 320); ctx.lineTo(132, 320); ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ACID // VOLT', 256, 390);
      break;
    }

    case 'hyper_cobalt': {
      // Le Mans cobalt blue
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 0, 512, 512);

      // Saturated Gulf racing orange center stripe flanked with white lines
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(196, 0, 120, 512);
      ctx.fillStyle = '#ff6b00';
      ctx.fillRect(212, 0, 88, 512);

      // Circle racing number roundel
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(256, 256, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 84px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('88', 256, 285);
      break;
    }

    case 'neon_cyberpunk': {
      // Hot magenta base with high-voltage acid lime speed chevrons
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(0, 0, 512, 512);

      // Acid lime lightning chevrons
      ctx.fillStyle = '#39ff14';
      for (let i = 0; i < 512; i += 96) {
        ctx.beginPath();
        ctx.moveTo(256, i);
        ctx.lineTo(336, i + 48);
        ctx.lineTo(312, i + 48);
        ctx.lineTo(256, i + 14);
        ctx.lineTo(200, i + 48);
        ctx.lineTo(176, i + 48);
        ctx.closePath();
        ctx.fill();
      }

      // Neon cyan racing flanks
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(30, 0, 36, 512);
      ctx.fillRect(446, 0, 36, 512);

      // Cyber Kanji / Roman 2099 decal
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('超音速 // 99', 256, 290);
      break;
    }

    case 'gold_phoenix': {
      // Deep 24K Gold base
      const goldGrad = ctx.createLinearGradient(0, 0, 512, 512);
      goldGrad.addColorStop(0, '#ffd700');
      goldGrad.addColorStop(0.5, '#ffae00');
      goldGrad.addColorStop(1, '#e65100');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Searing vermilion and crimson flame wings
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(256, 0);
      ctx.bezierCurveTo(340, 160, 420, 320, 490, 512);
      ctx.lineTo(256, 512);
      ctx.lineTo(22, 512);
      ctx.bezierCurveTo(92, 320, 172, 160, 256, 0);
      ctx.fill();

      // Bright inner solar yellow flame
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(256, 60);
      ctx.bezierCurveTo(310, 200, 360, 360, 400, 512);
      ctx.lineTo(256, 512);
      ctx.lineTo(112, 512);
      ctx.bezierCurveTo(152, 360, 202, 200, 256, 60);
      ctx.fill();

      // Bold Phoenix insignia
      ctx.fillStyle = '#18181b';
      ctx.font = 'bold 44px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PHOENIX', 256, 360);
      break;
    }

    case 'plasma_aurora': {
      // Hypersaturated Aurora Borealis wave gradient
      const auroraGrad = ctx.createLinearGradient(0, 0, 512, 512);
      auroraGrad.addColorStop(0, '#00f0ff');
      auroraGrad.addColorStop(0.35, '#10b981');
      auroraGrad.addColorStop(0.7, '#6366f1');
      auroraGrad.addColorStop(1, '#a855f7');
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Flowing luminous plasma ribbon waves
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 14;
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 10) {
        const y = 256 + Math.sin(x * 0.025) * 80;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Polar starburst roundel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '900 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AURORA // 01', 256, 180);
      break;
    }

    case 'hyper_redline': {
      // Deep Rosso Corsa red
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 512, 512);

      // Twin bold Le Mans racing stripes in crisp white with black outlines
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(170, 0, 172, 512);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(182, 0, 64, 512);
      ctx.fillRect(266, 0, 64, 512);

      // Gold highlight pin-stripes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(160, 0, 6, 512);
      ctx.fillRect(346, 0, 6, 512);

      // Scuderia style shield roundel
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(256, 180);
      ctx.lineTo(310, 230);
      ctx.lineTo(256, 330);
      ctx.lineTo(202, 230);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#18181b';
      ctx.font = '900 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GT', 256, 270);
      break;
    }

    case 'factory':
    default: {
      // Clean high-tech panelling with subtle seam lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 452, 452);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.fillRect(246, 40, 20, 432);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MAG-TECH', 256, 270);
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  textureCache.set(skin.id, texture);
  return texture;
}
