import * as THREE from 'three';
import { CyberObstacleType, ObstacleData, ObstacleMovement } from '../types';
import { cosmicTube } from './tubeCurve';

// ============================================================================
// SINGLETON TEXTURES (Pre-rendered on high-res canvas, zero GC allocations)
// ============================================================================

let cachedHazardTex: THREE.CanvasTexture | null = null;
let cachedMonolithTex: THREE.CanvasTexture | null = null;
let cachedBoostTex: THREE.CanvasTexture | null = null;
let cachedMagmaTex: THREE.CanvasTexture | null = null;
let cachedIceTex: THREE.CanvasTexture | null = null;
let cachedRunwayTex: THREE.CanvasTexture | null = null;
let cachedCanopyTex: THREE.CanvasTexture | null = null;

const cachedHazardTexMap = new Map<string, THREE.CanvasTexture>();

export function getHazardPlateTexture(themeColor: string = '#fcee0a', stripeColor: string = '#ff6600'): THREE.CanvasTexture {
  const key = `${themeColor}_${stripeColor}`;
  if (cachedHazardTexMap.has(key)) return cachedHazardTexMap.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep cyber navy backing
  ctx.fillStyle = '#080e1c';
  ctx.fillRect(0, 0, 512, 512);

  // Outer hyper-bright neon boundary
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 24;
  ctx.strokeRect(12, 12, 488, 488);

  // Bold diagonal high-contrast warning hazard stripes
  const stripeWidth = 56;
  for (let i = -512; i < 1024; i += stripeWidth * 2) {
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripeWidth, 0);
    ctx.lineTo(i + stripeWidth - 256, 512);
    ctx.lineTo(i - 256, 512);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = stripeColor;
    ctx.beginPath();
    ctx.moveTo(i + stripeWidth, 0);
    ctx.lineTo(i + stripeWidth * 2, 0);
    ctx.lineTo(i + stripeWidth * 2 - 256, 512);
    ctx.lineTo(i + stripeWidth - 256, 512);
    ctx.closePath();
    ctx.fill();
  }

  // Inner bright pinstripe
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, 456, 456);

  const tex = canvasToTex(canvas);
  cachedHazardTexMap.set(key, tex);
  return tex;
}

function canvasToTex(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function getMagmaPlateTexture(): THREE.CanvasTexture {
  if (cachedMagmaTex) return cachedMagmaTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#180400';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#ff3300';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 496, 496);

  ctx.fillStyle = '#ff6600';
  for (let i = -512; i < 1024; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 0);
    ctx.lineTo(i - 80, 512);
    ctx.lineTo(i - 112, 512);
    ctx.closePath();
    ctx.fill();
  }

  cachedMagmaTex = canvasToTex(canvas);
  return cachedMagmaTex;
}

export function getIcePlateTexture(): THREE.CanvasTexture {
  if (cachedIceTex) return cachedIceTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#031024';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 496, 496);

  ctx.fillStyle = '#00f0ff';
  for (let i = -512; i < 1024; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 28, 0);
    ctx.lineTo(i - 70, 512);
    ctx.lineTo(i - 98, 512);
    ctx.closePath();
    ctx.fill();
  }

  cachedIceTex = canvasToTex(canvas);
  return cachedIceTex;
}

const cachedMonolithTexMap = new Map<string, THREE.CanvasTexture>();

export function getMonolithTexture(themeColor: string = '#fcee0a', stripeColor: string = '#ff0055'): THREE.CanvasTexture {
  const key = `${themeColor}_${stripeColor}`;
  if (cachedMonolithTexMap.has(key)) return cachedMonolithTexMap.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // High-contrast cyber-tech body
  ctx.fillStyle = '#0a1020';
  ctx.fillRect(0, 0, 256, 512);

  // Glowing boundary
  ctx.strokeStyle = stripeColor;
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, 238, 494);

  // High-visibility hazard chevrons in neon themeColor
  ctx.fillStyle = themeColor;
  for (let y = 28; y < 490; y += 52) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(128, y + 26);
    ctx.lineTo(236, y);
    ctx.lineTo(236, y + 24);
    ctx.lineTo(128, y + 50);
    ctx.lineTo(20, y + 24);
    ctx.closePath();
    ctx.fill();
  }

  // Glowing center status badge
  ctx.fillStyle = '#05070d';
  ctx.fillRect(28, 218, 200, 76);
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 218, 200, 76);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 26px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HAZARD', 128, 256);

  const tex = new THREE.CanvasTexture(canvas);
  cachedMonolithTexMap.set(key, tex);
  return tex;
}

function getBoostPadTexture(): THREE.CanvasTexture {
  if (cachedBoostTex) return cachedBoostTex;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Clean cyber-blue background (no murky dark green!)
  ctx.fillStyle = '#0a1428';
  ctx.fillRect(0, 0, 256, 512);

  // Glowing neon borders
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 242, 498);

  ctx.strokeStyle = '#fcee0a';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let y = 70; y < 470; y += 95) {
    ctx.beginPath();
    ctx.moveTo(35, y + 45);
    ctx.lineTo(128, y - 45);
    ctx.lineTo(221, y + 45);
    ctx.stroke();
  }

  // Inner bright white/lime chevron
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  for (let y = 70; y < 470; y += 95) {
    ctx.beginPath();
    ctx.moveTo(42, y + 45);
    ctx.lineTo(128, y - 41);
    ctx.lineTo(214, y + 45);
    ctx.stroke();
  }

  cachedBoostTex = new THREE.CanvasTexture(canvas);
  return cachedBoostTex;
}

export function getTunnelRunwayTexture(): THREE.CanvasTexture {
  if (cachedRunwayTex) return cachedRunwayTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#050c18';
  ctx.fillRect(0, 0, 256, 512);

  // Neon cyan lateral border tracks
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(10, 0, 14, 512);
  ctx.fillRect(232, 0, 14, 512);

  // Glowing forward arrows/chevrons in neon yellow & white
  ctx.strokeStyle = '#fcee0a';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let y = 60; y < 480; y += 90) {
    ctx.beginPath();
    ctx.moveTo(40, y + 36);
    ctx.lineTo(128, y - 36);
    ctx.lineTo(216, y + 36);
    ctx.stroke();
  }

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  for (let y = 60; y < 480; y += 90) {
    ctx.beginPath();
    ctx.moveTo(46, y + 36);
    ctx.lineTo(128, y - 32);
    ctx.lineTo(210, y + 36);
    ctx.stroke();
  }

  cachedRunwayTex = new THREE.CanvasTexture(canvas);
  cachedRunwayTex.wrapS = THREE.RepeatWrapping;
  cachedRunwayTex.wrapT = THREE.RepeatWrapping;
  return cachedRunwayTex;
}

export function getTunnelCanopyTexture(): THREE.CanvasTexture {
  if (cachedCanopyTex) return cachedCanopyTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark obsidian composite
  ctx.fillStyle = '#080e18';
  ctx.fillRect(0, 0, 512, 512);

  // Voxel panel grid seams
  ctx.strokeStyle = '#0f2238';
  ctx.lineWidth = 4;
  for (let x = 0; x <= 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Glowing neon circuit lines in cyan & pink
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(64, 32);
  ctx.lineTo(192, 32);
  ctx.lineTo(256, 96);
  ctx.lineTo(256, 256);
  ctx.lineTo(384, 256);
  ctx.stroke();

  ctx.strokeStyle = '#ff007f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(448, 480);
  ctx.lineTo(320, 480);
  ctx.lineTo(256, 416);
  ctx.lineTo(256, 256);
  ctx.stroke();

  // Glowing circuit nodes
  ctx.fillStyle = '#fcee0a';
  [
    [64, 32],
    [256, 96],
    [384, 256],
    [448, 480],
    [256, 416],
  ].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  cachedCanopyTex = new THREE.CanvasTexture(canvas);
  cachedCanopyTex.wrapS = THREE.RepeatWrapping;
  cachedCanopyTex.wrapT = THREE.RepeatWrapping;
  return cachedCanopyTex;
}

const cachedGridMap = new Map<string, THREE.CanvasTexture>();
export function getVoxelGridTexture(color: string = '#fcee0a'): THREE.CanvasTexture {
  if (cachedGridMap.has(color)) return cachedGridMap.get(color)!;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep obsidian backing
  ctx.fillStyle = '#0a0d18';
  ctx.fillRect(0, 0, 512, 512);

  // High-contrast glowing square voxel dots
  const gridSize = 16;
  const dotSize = 10;
  ctx.fillStyle = color;
  for (let x = 4; x < 512; x += gridSize) {
    for (let y = 4; y < 512; y += gridSize) {
      ctx.fillRect(x, y, dotSize, dotSize);
    }
  }

  // Brilliant neon border frame
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 498, 498);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  cachedGridMap.set(color, tex);
  return tex;
}

const cachedStripesMap = new Map<string, THREE.CanvasTexture>();
export function getVoxelStripesTexture(primaryColor: string = '#ff5500', accentColor: string = '#ffffff'): THREE.CanvasTexture {
  const key = `${primaryColor}_${accentColor}`;
  if (cachedStripesMap.has(key)) return cachedStripesMap.get(key)!;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a101d';
  ctx.fillRect(0, 0, 512, 128);

  // Alternating segmented glowing neon blocks along spoke length
  const blockW = 64;
  for (let x = 0; x < 512; x += blockW * 2) {
    ctx.fillStyle = primaryColor;
    ctx.fillRect(x, 8, blockW - 8, 112);
    ctx.fillStyle = accentColor;
    ctx.fillRect(x + 12, 24, blockW - 32, 80);
  }

  // Neon trim
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 120);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  cachedStripesMap.set(key, tex);
  return tex;
}

// ============================================================================
// VOXOTRON ROTATION DIRECTION INDICATORS
// High-visibility glowing curved arrows and 3D chevron brackets
// indicating Clockwise (CW) or Counter-Clockwise (CCW) obstacle rotation
// ============================================================================
// VOXOTRON ROTATION DIRECTION INDICATORS
// High-visibility glowing curved arrows, 3D hub chevrons, and duplicated
// outer perimeter/face arrow chevrons indicating Clockwise (CW) or Counter-Clockwise (CCW)
// ============================================================================
const cachedArrowTexMap = new Map<string, THREE.CanvasTexture>();
export function getRotationArrowDiscTexture(direction: 'cw' | 'ccw', color: string = '#fcee0a'): THREE.CanvasTexture {
  const key = `${direction}_${color}`;
  if (cachedArrowTexMap.has(key)) return cachedArrowTexMap.get(key)!;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const cx = 512;
  const cy = 512;

  // Deep obsidian circular hub plate
  ctx.fillStyle = '#03050c';
  ctx.beginPath();
  ctx.arc(cx, cy, 508, 0, Math.PI * 2);
  ctx.fill();

  // Futuristic telemetry grid: radial tick marks around the perimeter
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 4;
  const numTicks = 64;
  for (let i = 0; i < numTicks; i++) {
    const a = (i * Math.PI * 2) / numTicks;
    const innerDist = i % 4 === 0 ? 430 : 455;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * innerDist, cy + Math.sin(a) * innerDist);
    ctx.lineTo(cx + Math.cos(a) * 488, cy + Math.sin(a) * 488);
    ctx.stroke();
  }

  // Bold outer neon ring
  ctx.strokeStyle = color;
  ctx.lineWidth = 36;
  ctx.beginPath();
  ctx.arc(cx, cy, 476, 0, Math.PI * 2);
  ctx.stroke();

  // Outer sharp white highlight pinstripe
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 492, 0, Math.PI * 2);
  ctx.stroke();

  // Inner boundary ring
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 426, 0, Math.PI * 2);
  ctx.stroke();

  // 3 Enormous, unmistakable curved arrows pointing in rotation direction
  // Note: On mesh facing oncoming player (-Z), positive math rotation corresponds to CCW, negative to CW.
  const isCW = direction === 'cw';
  const numArrows = 3;
  const arrowRadius = 295;

  for (let i = 0; i < numArrows; i++) {
    const baseA = (i * Math.PI * 2) / numArrows;
    const arcSpan = Math.PI * 0.44;

    // Curved arc body (thick vibrant neon)
    ctx.strokeStyle = color;
    ctx.lineWidth = 56;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (isCW) {
      ctx.arc(cx, cy, arrowRadius, baseA + arcSpan, baseA, true);
    } else {
      ctx.arc(cx, cy, arrowRadius, baseA, baseA + arcSpan, false);
    }
    ctx.stroke();

    // Secondary intense white-hot core line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20;
    ctx.beginPath();
    if (isCW) {
      ctx.arc(cx, cy, arrowRadius, baseA + arcSpan - 0.04, baseA + 0.04, true);
    } else {
      ctx.arc(cx, cy, arrowRadius, baseA + 0.04, baseA + arcSpan - 0.04, false);
    }
    ctx.stroke();

    // Colossal aerodynamic arrowhead at the leading tip
    const tipA = isCW ? baseA : baseA + arcSpan;
    const tipX = cx + Math.cos(tipA) * arrowRadius;
    const tipY = cy + Math.sin(tipA) * arrowRadius;

    // Tangent pointing in rotation direction
    const tangA = isCW ? tipA - Math.PI / 2 : tipA + Math.PI / 2;
    const normA = tipA;

    // Outer neon arrowhead polygon
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tipX + Math.cos(tangA) * 110, tipY + Math.sin(tangA) * 110); // Tip vertex
    ctx.lineTo(
      tipX - Math.cos(tangA) * 45 + Math.cos(normA) * 78,
      tipY - Math.sin(tangA) * 45 + Math.sin(normA) * 78
    );
    ctx.lineTo(tipX - Math.cos(tangA) * 20, tipY - Math.sin(tangA) * 20);
    ctx.lineTo(
      tipX - Math.cos(tangA) * 45 - Math.cos(normA) * 78,
      tipY - Math.sin(tangA) * 45 - Math.sin(normA) * 78
    );
    ctx.closePath();
    ctx.fill();

    // Inner pure-white core triangle inside arrowhead
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(tipX + Math.cos(tangA) * 85, tipY + Math.sin(tangA) * 85);
    ctx.lineTo(
      tipX - Math.cos(tangA) * 20 + Math.cos(normA) * 36,
      tipY - Math.sin(tangA) * 20 + Math.sin(normA) * 36
    );
    ctx.lineTo(tipX - Math.cos(tangA) * 20, tipY - Math.sin(tangA) * 20);
    ctx.lineTo(
      tipX - Math.cos(tangA) * 20 - Math.cos(normA) * 36,
      tipY - Math.sin(tangA) * 20 - Math.sin(normA) * 36
    );
    ctx.closePath();
    ctx.fill();
  }

  // Central high-tech gyro core
  ctx.fillStyle = '#060a18';
  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, 126, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#04060d';
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.fill();

  // Bold rotation indicator text
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isCW ? 'CW ↻' : 'CCW ↺', cx, cy + 180);

  const tex = new THREE.CanvasTexture(canvas);
  cachedArrowTexMap.set(key, tex);
  return tex;
}

/**
 * Unified 3D Glowing Chevron Arrow mesh pointing strictly along its local +X axis.
 * Consists of two angled luminous neon bars meeting at an intense pure-white apex core.
 */
export function createSingleChevronMesh(
  colorMat: THREE.Material = sharedMats.neonYellow,
  armLen: number = 1.35,
  armThick: number = 0.24,
  depth: number = 0.20
): THREE.Group {
  const g = new THREE.Group();
  const geom = new THREE.BoxGeometry(armLen, armThick, depth);

  const upper = new THREE.Mesh(geom, colorMat);
  upper.position.set(-armLen * 0.3, armLen * 0.3, 0);
  upper.rotation.z = -Math.PI / 4;

  const lower = new THREE.Mesh(geom, colorMat);
  lower.position.set(-armLen * 0.3, -armLen * 0.3, 0);
  lower.rotation.z = Math.PI / 4;

  const tip = new THREE.Mesh(
    new THREE.BoxGeometry(armThick * 1.5, armThick * 1.5, depth + 0.04),
    sharedMats.neonWhite
  );
  tip.position.set(0.12, 0, 0);

  g.add(upper, lower, tip);
  return g;
}

/**
 * Creates 3D glowing neon chevron arrow brackets along a spoke or beam,
 * pointing unambiguously in the direction of rotation (tangential +X for CW, -X for CCW).
 */
export function createBeamDirectionChevrons(
  spokeLength: number,
  direction: 'cw' | 'ccw',
  colorMat: THREE.Material = sharedMats.neonYellow,
  tubeRadius: number = TUBE_RADIUS,
  depthZ: number = 2.8
): THREE.Group {
  const group = new THREE.Group();
  const numChevrons = Math.max(3, Math.floor(spokeLength / 4.8));
  // In spoke local frame where +Y is outward: +X (rot 0) is CW, -X (rot PI) is CCW
  const rotZ = direction === 'cw' ? 0 : Math.PI;

  for (let c = 1; c <= numChevrons; c++) {
    const yPos = tubeRadius + (c / (numChevrons + 1)) * spokeLength;

    [depthZ * 0.44, -depthZ * 0.44].forEach((zPos) => {
      const chevron = createSingleChevronMesh(colorMat, 1.25, 0.24, 0.18);
      chevron.position.set(0, yPos, zPos);
      chevron.rotation.z = rotZ;
      group.add(chevron);
    });
  }

  return group;
}

/**
 * Creates 3D glowing neon arrow brackets mounted along the outer perimeter arc of the obstacle.
 * DUPLICATES the rotation direction directly on the outer edge/rim!
 */
export function createOuterArcRotationArrows(
  outerR: number,
  startA: number,
  arcSpan: number,
  direction: 'cw' | 'ccw',
  colorMat: THREE.Material = sharedMats.neonYellow,
  depthZ: number = 2.8
): THREE.Group {
  const group = new THREE.Group();
  const numArrows = Math.max(3, Math.floor((arcSpan * outerR) / 10.0));

  for (let i = 1; i <= numArrows; i++) {
    const angle = startA + (i / (numArrows + 1)) * arcSpan;

    [depthZ * 0.48, -depthZ * 0.48].forEach((zPos) => {
      const chevron = createSingleChevronMesh(colorMat, 1.4, 0.26, 0.20);
      chevron.position.set(Math.cos(angle) * (outerR + 0.35), Math.sin(angle) * (outerR + 0.35), zPos);
      // Tangential alignment matching rotational direction!
      // Clockwise (CW): points towards decreasing angle (angle - Math.PI / 2)
      // Counter-Clockwise (CCW): points towards increasing angle (angle + Math.PI / 2)
      const tangAngle = direction === 'cw' ? angle - Math.PI / 2 : angle + Math.PI / 2;
      chevron.rotation.z = tangAngle;
      group.add(chevron);
    });
  }

  return group;
}

/**
 * Creates 3D glowing chevron rows directly on the obstacle face/plates.
 * DUPLICATES the rotation direction directly on the obstacle face!
 */
export function createFaceDirectionChevrons(
  innerR: number,
  outerR: number,
  baseAngle: number,
  direction: 'cw' | 'ccw',
  colorMat: THREE.Material = sharedMats.neonYellow,
  depthZ: number = 2.8
): THREE.Group {
  const group = new THREE.Group();
  const radialSpan = outerR - innerR;
  const numTiers = Math.max(2, Math.floor(radialSpan / 6.0));

  for (let t = 1; t <= numTiers; t++) {
    const r = innerR + (t / (numTiers + 1)) * radialSpan;

    [depthZ * 0.52, -depthZ * 0.52].forEach((zPos) => {
      const chevron = createSingleChevronMesh(colorMat, 1.2, 0.22, 0.18);
      chevron.position.set(Math.cos(baseAngle) * r, Math.sin(baseAngle) * r, zPos);
      // Tangential alignment matching rotational direction!
      const tangAngle = direction === 'cw' ? baseAngle - Math.PI / 2 : baseAngle + Math.PI / 2;
      chevron.rotation.z = tangAngle;
      group.add(chevron);
    });
  }

  return group;
}

/**
 * Creates a central rotating hub plate with high-contrast rotation arrow texture
 * PLUS true 3D extruded glowing neon chevron arrows for maximum readability
 */
export function createCentralRotationHub(
  direction: 'cw' | 'ccw',
  colorHex: string = '#fcee0a',
  radius: number = 5.2,
  depthZ: number = 0.5
): THREE.Group {
  const hubGroup = new THREE.Group();
  const arrowTex = getRotationArrowDiscTexture(direction, colorHex);

  const hubMat = new THREE.MeshStandardMaterial({
    map: arrowTex,
    emissiveMap: arrowTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 1.0,
    roughness: 0.1,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });

  // Solid carbon core cylinder
  const coreMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, depthZ, 36).rotateX(-Math.PI / 2),
    sharedMats.carbon
  );
  hubGroup.add(coreMesh);

  // Front glowing indicator disc facing oncoming racer (normal towards -Z)
  const frontCircleGeom = new THREE.CircleGeometry(radius * 0.96, 48);
  const frontDisc = new THREE.Mesh(frontCircleGeom, hubMat);
  frontDisc.position.z = -depthZ * 0.52;
  frontDisc.rotation.y = Math.PI; // Face oncoming racer approaching from -Z
  hubGroup.add(frontDisc);

  // Back indicator disc for rear view
  const backDisc = new THREE.Mesh(frontCircleGeom, hubMat);
  backDisc.position.z = depthZ * 0.52;
  backDisc.rotation.y = 0;
  hubGroup.add(backDisc);

  // Outer glowing neon rim
  const rimGeom = new THREE.TorusGeometry(radius + 0.1, 0.22, 8, 40);
  const rimMesh = new THREE.Mesh(rimGeom, sharedMats.neonWhite);
  hubGroup.add(rimMesh);

  // Secondary outer accent torus
  const rimAccent = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.28, 0.1, 8, 40),
    sharedMats.neonYellow
  );
  hubGroup.add(rimAccent);

  // TRUE 3D EXTENDED GLOWING CHEVRONS floating in front of and behind the hub face
  const numChevrons = 4;
  const chevronOrbitR = radius * 0.62;

  for (let i = 0; i < numChevrons; i++) {
    const angle = (i * Math.PI * 2) / numChevrons;
    // Tangential alignment matching rotational direction!
    const tangAngle = direction === 'cw' ? angle - Math.PI / 2 : angle + Math.PI / 2;

    [-depthZ * 0.58, depthZ * 0.58].forEach((zOffset) => {
      const chevron3D = new THREE.Group();
      chevron3D.position.set(
        Math.cos(angle) * chevronOrbitR,
        Math.sin(angle) * chevronOrbitR,
        zOffset
      );
      chevron3D.rotation.z = tangAngle;

      // Unshaded glowing neon arrow mesh
      const armLen = 1.45;
      const armThick = 0.28;
      const armGeom = new THREE.BoxGeometry(armLen, armThick, 0.20);

      const armA = new THREE.Mesh(armGeom, sharedMats.neonYellow);
      armA.position.set(-armLen * 0.32, armLen * 0.32, 0);
      armA.rotation.z = -Math.PI / 4;

      const armB = new THREE.Mesh(armGeom, sharedMats.neonYellow);
      armB.position.set(-armLen * 0.32, -armLen * 0.32, 0);
      armB.rotation.z = Math.PI / 4;

      const tipMesh = new THREE.Mesh(
        new THREE.BoxGeometry(armThick * 1.6, armThick * 1.6, 0.26),
        sharedMats.neonWhite
      );
      tipMesh.position.set(0.14, 0, 0);

      chevron3D.add(armA, armB, tipMesh);
      hubGroup.add(chevron3D);
    });
  }

  return hubGroup;
}

let cachedLavaPuddleTex: THREE.CanvasTexture | null = null;
export function getLavaPuddleTexture(): THREE.CanvasTexture {
  if (cachedLavaPuddleTex) return cachedLavaPuddleTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Extra-bright multi-stage molten incandescent gradient with white-hot core
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#ffffff'); // White-hot core
  grad.addColorStop(0.18, '#ffff33'); // Incandescent blazing gold
  grad.addColorStop(0.45, '#ff5500'); // Volcanic molten orange
  grad.addColorStop(0.8, '#ff1100'); // Fiery crimson
  grad.addColorStop(1.0, '#ffffff'); // White-hot boundary
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Superheated boiling magma bubbles with glowing centers
  for (let i = 0; i < 45; i++) {
    const cx = (i * 47) % 512;
    const cy = (i * 73) % 256;
    const rw = 16 + (i % 5) * 12;
    const rh = 10 + (i % 4) * 8;
    const bubbleGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rw);
    bubbleGrad.addColorStop(0, '#ffffff');
    bubbleGrad.addColorStop(0.35, '#ffff55');
    bubbleGrad.addColorStop(0.8, '#ff3b00');
    bubbleGrad.addColorStop(1, '#880c00');
    ctx.fillStyle = bubbleGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, i * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blazing thermal lightning fracture veins
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let i = 0; i < 18; i++) {
    const sx = i * 28;
    ctx.moveTo(sx, 0);
    ctx.quadraticCurveTo(sx + 25, 128, sx - 15, 256);
  }
  ctx.stroke();

  ctx.strokeStyle = '#ffff77';
  ctx.lineWidth = 10;
  ctx.stroke();

  // High-visibility hazard chevrons at edges
  ctx.fillStyle = '#ffffff';
  for (let x = 0; x < 512; x += 32) {
    ctx.fillRect(x, 0, 16, 18);
    ctx.fillRect(x + 16, 238, 16, 18);
  }

  cachedLavaPuddleTex = new THREE.CanvasTexture(canvas);
  cachedLavaPuddleTex.wrapS = THREE.RepeatWrapping;
  cachedLavaPuddleTex.wrapT = THREE.RepeatWrapping;
  return cachedLavaPuddleTex;
}

let cachedIceSlickTex: THREE.CanvasTexture | null = null;
export function getIceSlickTexture(): THREE.CanvasTexture {
  if (cachedIceSlickTex) return cachedIceSlickTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#0284c7');
  grad.addColorStop(0.5, '#38bdf8');
  grad.addColorStop(1, '#0ea5e9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  for (let i = 0; i < 28; i++) {
    const sx = (i * 37) % 512;
    const sy = (i * 29) % 256;
    const len = 35 + (i % 6) * 15;
    const angle = i * 0.7;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
    ctx.stroke();
  }

  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 248);

  cachedIceSlickTex = new THREE.CanvasTexture(canvas);
  cachedIceSlickTex.wrapS = THREE.RepeatWrapping;
  cachedIceSlickTex.wrapT = THREE.RepeatWrapping;
  return cachedIceSlickTex;
}

// Reusable Materials with high-visibility cyberpunk glow
const sharedMats = {
  carbon: new THREE.MeshStandardMaterial({
    color: 0x2d3a4f,
    emissive: new THREE.Color(0x1a365d),
    emissiveIntensity: 0.75,
    roughness: 0.2,
    metalness: 0.6,
  }),
  spokeDark: new THREE.MeshStandardMaterial({
    color: 0x33445e,
    emissive: new THREE.Color(0x1e3a63),
    emissiveIntensity: 0.75,
    roughness: 0.25,
    metalness: 0.55,
  }),
  neonOrange: new THREE.MeshBasicMaterial({ color: 0xff7700, transparent: true, opacity: 0.98 }),
  neonYellow: new THREE.MeshBasicMaterial({ color: 0xfcee0a, transparent: true, opacity: 0.98 }),
  neonRed: new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.98 }),
  neonCyan: new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.98 }),
  neonPink: new THREE.MeshBasicMaterial({ color: 0xff007f, transparent: true, opacity: 0.98 }),
  // Ultra-bright electric laser green and vibrant lime (super high visibility)
  neonGreen: new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 1.0 }),
  neonLime: new THREE.MeshBasicMaterial({ color: 0x76ff03, transparent: true, opacity: 1.0 }),
  neonWhite: new THREE.MeshBasicMaterial({ color: 0xfcee0a, transparent: true, opacity: 0.98 }), // User mandate: no white on obstacles -> vibrant neon electric yellow
  laserBeam: new THREE.MeshBasicMaterial({
    color: 0xff0055,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  }),
  skyPillar: new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  }),
  skyPillarGold: new THREE.MeshBasicMaterial({
    color: 0xfcee0a,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  }),
  magmaCore: new THREE.MeshBasicMaterial({
    color: 0xff4400,
    transparent: true,
    opacity: 0.98,
  }),
  magmaGlow: new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.95,
  }),
  cryoIce: new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.8,
  }),
  quantumPurple: new THREE.MeshBasicMaterial({
    color: 0xc026d3,
    transparent: true,
    opacity: 0.95,
  }),
  darkArmor: new THREE.MeshStandardMaterial({
    color: 0x24344d,
    emissive: new THREE.Color(0x00d4ff),
    emissiveIntensity: 0.7,
    roughness: 0.25,
    metalness: 0.8,
  }),
  magmaPlate: new THREE.MeshStandardMaterial({
    map: getMagmaPlateTexture(),
    emissive: new THREE.Color(0xff4400),
    emissiveIntensity: 0.6,
  }),
  icePlate: new THREE.MeshStandardMaterial({
    map: getIcePlateTexture(),
    emissive: new THREE.Color(0x00f0ff),
    emissiveIntensity: 0.5,
  }),
  iceGlow: new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.95,
  }),
  neonPurple: new THREE.MeshBasicMaterial({
    color: 0xd946ef,
    transparent: true,
    opacity: 0.98,
  }),
  goldCoinBody: new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    emissive: new THREE.Color(0xff8800),
    emissiveIntensity: 0.7,
    roughness: 0.15,
    metalness: 0.9,
    flatShading: true,
  }),
  goldStarGlow: new THREE.MeshBasicMaterial({
    color: 0xffcc00,
    transparent: true,
    opacity: 0.98,
  }),
  goldHaloRing: new THREE.MeshBasicMaterial({
    color: 0xffcc00,
    transparent: true,
    opacity: 0.85,
  }),
  frostBladeMat: new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.85,
    roughness: 0.15,
    metalness: 0.85,
    flatShading: true,
  }),
  obsidianArmor: new THREE.MeshStandardMaterial({
    color: 0x1e2d42,
    emissive: new THREE.Color(0x00e5ff),
    emissiveIntensity: 0.75,
    roughness: 0.2,
    metalness: 0.85,
    flatShading: true,
  }),
  iceWarningNeon: new THREE.MeshBasicMaterial({
    color: 0xff3b00,
    transparent: true,
    opacity: 1.0,
  }),
  hazardProjectionMat: new THREE.MeshBasicMaterial({
    color: 0xff1133,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }),
  hazardAmberProjectionMat: new THREE.MeshBasicMaterial({
    color: 0xff7700,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }),
  hazardPlate: new THREE.MeshStandardMaterial({
    map: getHazardPlateTexture('#ff0044'),
    emissiveMap: getHazardPlateTexture('#ff0044'),
    emissive: new THREE.Color(0xff0044),
    emissiveIntensity: 0.95,
    roughness: 0.2,
    metalness: 0.7,
  }),
  tunnelHazardWall: new THREE.MeshStandardMaterial({
    map: getHazardPlateTexture('#ff0033'),
    emissiveMap: getHazardPlateTexture('#ff0033'),
    emissive: new THREE.Color(0xff1144),
    emissiveIntensity: 0.98,
    roughness: 0.15,
    metalness: 0.4,
    side: THREE.DoubleSide,
  }),
  tunnelCanopy: new THREE.MeshStandardMaterial({
    map: getTunnelCanopyTexture(),
    emissiveMap: getTunnelCanopyTexture(),
    color: new THREE.Color(0x1a2638),
    emissive: new THREE.Color(0x0a1628),
    emissiveIntensity: 0.8,
    roughness: 0.25,
    metalness: 0.75,
    side: THREE.DoubleSide,
  }),
  lavaPuddleMat: new THREE.MeshStandardMaterial({
    map: getLavaPuddleTexture(),
    emissiveMap: getLavaPuddleTexture(),
    color: new THREE.Color(0xff4400),
    emissive: new THREE.Color(0xffaa00),
    emissiveIntensity: 2.8,
    roughness: 0.1,
    metalness: 0.15,
    side: THREE.DoubleSide,
  }),
  lavaPuddleCoreMat: new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }),
  iceSlickMat: new THREE.MeshStandardMaterial({
    map: getIceSlickTexture(),
    emissiveMap: getIceSlickTexture(),
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 0.95,
    roughness: 0.05,
    metalness: 0.65,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  }),
};

// ============================================================================
// BIOME CONTRAST CONFIGURATION
// Guarantees maximum visual contrast between obstacles and biome environments
// Prevents orange-on-orange camouflaged hazards in inferno_core
// ============================================================================
export interface BiomeContrastConfig {
  theme: 'cyan' | 'orange' | 'lime' | 'magenta';
  spokeColor1: string;
  spokeColor2: string;
  fanGridColor: string;
  archColor: THREE.MeshBasicMaterial;
  archLintel: THREE.MeshBasicMaterial;
  edgeMat: THREE.MeshBasicMaterial;
  accentMat: THREE.MeshBasicMaterial;
  beaconMat: THREE.MeshBasicMaterial;
  bladeEdgeMat: THREE.MeshBasicMaterial;
  pillarCoreMat: THREE.MeshBasicMaterial;
}

export function getBiomeContrastConfig(biomeId?: string): BiomeContrastConfig {
  switch (biomeId) {
    case 'inferno_core':
      // Fiery Magma Canyon -> Electric Cyan, Radiant Gold & Acid Lime (Zero White!)
      return {
        theme: 'cyan',
        spokeColor1: '#00f0ff',
        spokeColor2: '#39ff14',
        fanGridColor: '#00f0ff',
        archColor: sharedMats.neonCyan,
        archLintel: sharedMats.neonLime,
        edgeMat: sharedMats.neonCyan,
        accentMat: sharedMats.neonLime,
        beaconMat: sharedMats.neonYellow,
        bladeEdgeMat: sharedMats.neonCyan,
        pillarCoreMat: sharedMats.neonCyan,
      };
    case 'cryo_void':
      // Polar Ice Canyon -> Solar Flare Orange, Radiant Amber & Neon Red!
      return {
        theme: 'orange',
        spokeColor1: '#ff5500',
        spokeColor2: '#ffcc00',
        fanGridColor: '#ff5500',
        archColor: sharedMats.neonOrange,
        archLintel: sharedMats.neonYellow,
        edgeMat: sharedMats.neonOrange,
        accentMat: sharedMats.neonYellow,
        beaconMat: sharedMats.neonRed,
        bladeEdgeMat: sharedMats.neonOrange,
        pillarCoreMat: sharedMats.neonOrange,
      };
    case 'quantum_horizon':
      // Deep Purple Horizon -> Acid Laser Lime & Neon Cyan!
      return {
        theme: 'lime',
        spokeColor1: '#39ff14',
        spokeColor2: '#00f0ff',
        fanGridColor: '#39ff14',
        archColor: sharedMats.neonGreen,
        archLintel: sharedMats.neonCyan,
        edgeMat: sharedMats.neonGreen,
        accentMat: sharedMats.neonCyan,
        beaconMat: sharedMats.neonYellow,
        bladeEdgeMat: sharedMats.neonGreen,
        pillarCoreMat: sharedMats.neonGreen,
      };
    case 'void_overlord':
      // Boss Void Abyss -> Electric Cyan & Hot Magenta (Zero White!)
      return {
        theme: 'cyan',
        spokeColor1: '#00f0ff',
        spokeColor2: '#ff007f',
        fanGridColor: '#00f0ff',
        archColor: sharedMats.neonCyan,
        archLintel: sharedMats.neonYellow,
        edgeMat: sharedMats.neonCyan,
        accentMat: sharedMats.neonYellow,
        beaconMat: sharedMats.neonYellow,
        bladeEdgeMat: sharedMats.neonCyan,
        pillarCoreMat: sharedMats.neonCyan,
      };
    case 'neo_metropolis':
    default:
      // Cyberpunk Metropolis -> High-voltage Yellow, Electric Cyan & Magenta (Zero White!)
      return {
        theme: 'magenta',
        spokeColor1: '#fcee0a',
        spokeColor2: '#00f0ff',
        fanGridColor: '#fcee0a',
        archColor: sharedMats.neonPink,
        archLintel: sharedMats.neonYellow,
        edgeMat: sharedMats.neonYellow,
        accentMat: sharedMats.neonPink,
        beaconMat: sharedMats.neonRed,
        bladeEdgeMat: sharedMats.neonYellow,
        pillarCoreMat: sharedMats.neonPink,
      };
  }
}

/**
 * Returns the fixed base cylinder radius for a specific biome.
 * Metropolis: 14.0m, Inferno: 10.0m (tight chasm), Cryo: 18.0m (colossal canyon), Quantum: 12.0m, Boss: 16.0m
 */
export function getBiomeTubeRadius(biomeId?: string): number {
  switch (biomeId) {
    case 'inferno_core':
      return 10.0;
    case 'cryo_void':
      return 18.0;
    case 'quantum_horizon':
      return 12.0;
    case 'void_overlord':
      return 16.0;
    case 'neo_metropolis':
    default:
      return 14.0;
  }
}

export const TUBE_RADIUS = 14.0;

export interface BlockedSectorArc {
  centerAngle: number;
  halfArc: number;
  // Legacy compatibility
  minAngle: number;
  maxAngle: number;
}

export interface ChainedObstacleItem {
  offsetZ: number;
  type: CyberObstacleType;
  angle: number;
  result: CreatedObstacleResult;
}

export interface CreatedObstacleResult {
  group: THREE.Group;
  depthZ: number;
  blockedSectors: BlockedSectorArc[];
  primaryAngle: number;
  safeCenter?: number;
  isPickup?: boolean;
  movement?: ObstacleMovement;
  chainedItems?: ChainedObstacleItem[];
  totalSpanZ?: number;
  isLongitudinalTunnel?: boolean;
  tunnelSafeHalfArc?: number;
  tunnelTotalTwist?: number;
}

export function isAngleInSector(angle: number, minA: number, maxA: number): boolean {
  const normA = normalizeAngle(angle);
  const min = normalizeAngle(minA);
  const max = normalizeAngle(maxA);
  if (min <= max) {
    return normA >= min && normA <= max;
  }
  return normA >= min || normA <= max;
}

/**
 * Calculates the shortest angular distance on a circle in radians [0, PI].
 * Immune to negative numbers, 0/2PI wrapping, or order.
 */
export function shortestAngleDist(a: number, b: number): number {
  let diff = Math.abs(a - b) % (Math.PI * 2);
  if (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff;
}

/**
 * Normalizes angle to [0, 2*PI)
 */
export function normalizeAngle(angle: number): number {
  const TWO_PI = Math.PI * 2;
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

/**
 * Helper to build a clean sector arc object
 */
function makeSector(centerAngle: number, halfArc: number): BlockedSectorArc {
  const normCenter = normalizeAngle(centerAngle);
  return {
    centerAngle: normCenter,
    halfArc,
    minAngle: normalizeAngle(normCenter - halfArc),
    maxAngle: normalizeAngle(normCenter + halfArc),
  };
}

/**
 * Helper to add glowing green runway clearance markers in the open sector
 */
function addRunwayClearanceMarkers(group: THREE.Group, tubeR: number, openCenter: number, depthZ: number) {
  // Translucent ultra-bright glowing runway surface indicator
  const runwayPadGeom = new THREE.PlaneGeometry(4.2, depthZ * 2.0);
  runwayPadGeom.rotateX(-Math.PI / 2);
  const runwayPadMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const runwayPad = new THREE.Mesh(runwayPadGeom, runwayPadMat);
  runwayPad.position.set(
    Math.cos(openCenter) * (tubeR + 0.05),
    Math.sin(openCenter) * (tubeR + 0.05),
    0
  );
  runwayPad.rotation.z = openCenter - Math.PI / 2;
  group.add(runwayPad);

  // High-visibility hyper-bright neon lime chevron guide bars along Z
  [-depthZ * 0.45, 0, depthZ * 0.45].forEach((offset) => {
    const markerGeom = new THREE.BoxGeometry(2.0, 0.16, 0.55);
    const marker = new THREE.Mesh(markerGeom, sharedMats.neonLime);
    marker.position.set(
      Math.cos(openCenter) * (tubeR + 0.09),
      Math.sin(openCenter) * (tubeR + 0.09),
      offset
    );
    marker.rotation.z = openCenter - Math.PI / 2;
    group.add(marker);
  });

  // Flanking Neon Laser Boundary Rails defining the safe corridor
  const halfCorridor = 0.32; // ~18.3° flank rails
  [-halfCorridor, halfCorridor].forEach((side) => {
    const sideA = openCenter + side;
    const railGeom = new THREE.CylinderGeometry(0.09, 0.09, depthZ * 2.0, 8);
    railGeom.rotateX(Math.PI / 2);
    const rail = new THREE.Mesh(railGeom, sharedMats.neonGreen);
    rail.position.set(
      Math.cos(sideA) * (tubeR + 0.08),
      Math.sin(sideA) * (tubeR + 0.08),
      0
    );
    rail.rotation.z = sideA - Math.PI / 2;
    group.add(rail);
  });
}

/**
 * Projects a clear curved warning hazard zone directly onto the outer surface of the tube
 * beneath dynamic obstacles (pendulums, saws, rotators).
 */
function addHazardProjectionArc(
  group: THREE.Group,
  tubeR: number,
  centerAngle: number,
  arcSpan: number,
  depthZ: number,
  colorType: 'red' | 'amber' = 'red'
) {
  const segs = 24;
  const radius = tubeR + 0.04;
  // Curved open ribbon hugging the cylinder track along Z
  const arcGeom = new THREE.CylinderGeometry(
    radius,
    radius,
    depthZ * 1.05,
    segs,
    1,
    true,
    -arcSpan * 0.5,
    arcSpan
  );
  arcGeom.rotateX(Math.PI / 2);

  const mat = colorType === 'red' ? sharedMats.hazardProjectionMat : sharedMats.hazardAmberProjectionMat;
  const arcMesh = new THREE.Mesh(arcGeom, mat);
  // Align arc around cylinder z-axis at centerAngle
  arcMesh.rotation.z = centerAngle + Math.PI / 2;
  group.add(arcMesh);

  // Border guide rails in glowing neon red/amber at both edges of danger zone
  [-arcSpan * 0.5, arcSpan * 0.5].forEach((offset) => {
    const boundaryA = centerAngle + offset;
    const boundaryRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, depthZ * 1.08),
      colorType === 'red' ? sharedMats.neonRed : sharedMats.neonOrange
    );
    boundaryRail.position.set(
      Math.cos(boundaryA) * (tubeR + 0.06),
      Math.sin(boundaryA) * (tubeR + 0.06),
      0
    );
    boundaryRail.rotation.z = boundaryA - Math.PI / 2;
    group.add(boundaryRail);
  });
}

// ============================================================================
// ============================================================================
// OBSTACLE 1: GIANT SPOKE WHEEL GATE (From Screenshots 3 & 6)
// A 32-meter outer neon ring encircling the tube with spokes ONLY in the blocked half!
// The open 180° corridor is completely clean and marked with green runway lights!
// Features dynamic rotation with bold Voxotron rotation direction arrows & duplicated perimeter chevrons!
// ============================================================================
export function buildSpokeWheelGate(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const cfg = getBiomeContrastConfig(biomeId);
  const tubeR = TUBE_RADIUS;
  const outerR = tubeR + 40.0; // Towering colossal outer radius (55m total radius, 40m obstacle height!)
  const depthZ = 3.0;

  // 1. Outer Heavy Neon Perimeter Ring framing the entire view (Stationary gantry)
  const outerRingGeom = new THREE.TorusGeometry(outerR, 0.45, 8, 48);
  const outerRing = new THREE.Mesh(outerRingGeom, cfg.edgeMat);
  group.add(outerRing);

  // 2. Inner Rim hugging the outside of the tube
  const innerRimGeom = new THREE.TorusGeometry(tubeR + 0.1, 0.18, 8, 48);
  const innerRim = new THREE.Mesh(innerRimGeom, sharedMats.carbon);
  group.add(innerRim);

  const innerRimTrim = new THREE.Mesh(
    new THREE.TorusGeometry(tubeR + 0.12, 0.08, 8, 48),
    cfg.edgeMat
  );
  group.add(innerRimTrim);

  // 3. Blocked Solid Sector: Exactly 180° (from baseAngle to baseAngle + PI)
  const blockedCenter = baseAngle + Math.PI * 0.5;
  const halfArc = Math.PI * 0.38; // ~68.4 degrees on each side of center

  const sectorShape = new THREE.Shape();
  const segs = 24;
  for (let i = 0; i <= segs; i++) {
    const a = baseAngle + (i / segs) * Math.PI;
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) sectorShape.moveTo(x, y);
    else sectorShape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = baseAngle + (i / segs) * Math.PI;
    const x = Math.cos(a) * (tubeR + 0.08);
    const y = Math.sin(a) * (tubeR + 0.08);
    sectorShape.lineTo(x, y);
  }
  sectorShape.closePath();

  const sectorGeom = new THREE.ExtrudeGeometry(sectorShape, {
    depth: depthZ,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.18,
    bevelThickness: 0.18,
  });
  sectorGeom.translate(0, 0, -depthZ * 0.5);

  const hazardTex = getHazardPlateTexture(cfg.spokeColor1, cfg.spokeColor2);
  const sectorMat = new THREE.MeshStandardMaterial({
    map: hazardTex,
    emissiveMap: hazardTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.98,
    roughness: 0.18,
    metalness: 0.25,
  });
  const sectorMesh = new THREE.Mesh(sectorGeom, sectorMat);
  innerRotor.add(sectorMesh);

  // Glowing Outer Neon Arch Outline across the blocked sector
  const archCurvePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = baseAngle + (i / segs) * Math.PI;
    archCurvePoints.push(new THREE.Vector3(Math.cos(a) * (outerR + 0.14), Math.sin(a) * (outerR + 0.14), depthZ * 0.52));
  }
  const archCurve = new THREE.CatmullRomCurve3(archCurvePoints);
  const archRail = new THREE.Mesh(new THREE.TubeGeometry(archCurve, segs, 0.24, 6, false), cfg.edgeMat);
  innerRotor.add(archRail);

  // Dynamic rotation with Voxotron rotation direction indicators
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.52 + Math.random() * 0.32);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 1. Central Rotating Hub with bold 1024px curved direction arrows and 3D glowing chevrons
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.2, depthZ * 0.6);
  innerRotor.add(centralHub);

  // 2. DUPLICATED ROTATION INDICATORS: Outer perimeter arc arrows
  const outerArcArrows = createOuterArcRotationArrows(outerR, baseAngle, Math.PI, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArcArrows);

  // 3. DUPLICATED ROTATION INDICATORS: Face chevrons across the blocked barrier body
  const faceChevrons = createFaceDirectionChevrons(tubeR + 1.5, outerR - 1.5, blockedCenter, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(faceChevrons);

  // 4. Radial Spokes ONLY in blocked sector with direction chevrons
  const spokeLen = outerR - tubeR;
  [baseAngle, blockedCenter, baseAngle + Math.PI].forEach((spokeAngle) => {
    const spokeGroup = new THREE.Group();
    spokeGroup.rotation.z = spokeAngle - Math.PI / 2;

    const spokeGeom = new THREE.CylinderGeometry(0.38, 0.38, spokeLen, 8);
    spokeGeom.translate(0, tubeR + spokeLen * 0.5, 0);
    const spoke = new THREE.Mesh(spokeGeom, sharedMats.spokeDark);
    spokeGroup.add(spoke);

    const spokeRailGeom = new THREE.CylinderGeometry(0.14, 0.14, spokeLen, 6);
    spokeRailGeom.translate(0, tubeR + spokeLen * 0.5, 0);
    const spokeRail = new THREE.Mesh(spokeRailGeom, cfg.edgeMat);
    spokeRail.position.z = depthZ * 0.52;
    spokeGroup.add(spokeRail);

    // 3D rotation chevrons on spoke face
    const chevrons = createBeamDirectionChevrons(spokeLen, dirKey, cfg.edgeMat, tubeR, depthZ);
    spokeGroup.add(chevrons);

    innerRotor.add(spokeGroup);
  });

  // 5. Open Sector Guidance Markers: Center of open area
  const openCenter = baseAngle + Math.PI * 1.5;
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: blockedCenter,
    safeCenter: openCenter,
    blockedSectors: [makeSector(blockedCenter, halfArc)],
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle: blockedCenter,
      currentAngle: blockedCenter,
    },
  };
}

// ============================================================================
// OBSTACLE 2: HALF-DISC SECTOR BARRIER (Voxotron Grand Curved Barricade)
// A massive 175° curved barricade with dynamic rotation, outer neon arch,
// central indicator hub, and duplicated face & perimeter chevrons!
// ============================================================================
export function buildHalfDiscBarrier(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const cfg = getBiomeContrastConfig(biomeId);
  const tubeR = TUBE_RADIUS;
  const outerR = tubeR + 40.0; // Colossal 55m outer radius, 40m obstacle height!
  const depthZ = 3.2;
  const arcSpan = Math.PI * 0.95; // ~171 degrees (leaving safe 189 degrees open)
  const halfArc = Math.PI * 0.36; // Collision halfArc tightened for fair graze mechanics
  const visualHalfArc = arcSpan * 0.5;
  const startA = baseAngle - visualHalfArc;

  const shape = new THREE.Shape();
  const segs = 28;
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * arcSpan;
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = startA + (i / segs) * arcSpan;
    const x = Math.cos(a) * (tubeR + 0.05);
    const y = Math.sin(a) * (tubeR + 0.05);
    shape.lineTo(x, y);
  }
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: depthZ,
    bevelEnabled: true,
    bevelSize: 0.2,
    bevelThickness: 0.2,
    bevelSegments: 2,
  });
  geom.translate(0, 0, -depthZ * 0.5);

  const hazardTex = getHazardPlateTexture(cfg.spokeColor1, cfg.spokeColor2);
  const mat = new THREE.MeshStandardMaterial({
    map: hazardTex,
    emissiveMap: hazardTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.98,
    roughness: 0.18,
    metalness: 0.25,
  });
  const mesh = new THREE.Mesh(geom, mat);
  innerRotor.add(mesh);

  // Dynamic rotation: clockwise or counter-clockwise
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.48 + Math.random() * 0.32);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 1. Central Rotating Hub with bold curved direction arrows and 3D chevrons
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.2, depthZ * 0.6);
  innerRotor.add(centralHub);

  // 2. DUPLICATED ROTATION INDICATORS: Outer perimeter arc arrows
  const outerArcArrows = createOuterArcRotationArrows(outerR, startA, arcSpan, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArcArrows);

  // 3. DUPLICATED ROTATION INDICATORS: Face chevrons across the barricade
  const faceCenter = createFaceDirectionChevrons(tubeR + 1.5, outerR - 1.5, baseAngle, dirKey, cfg.edgeMat, depthZ);
  const faceLeft = createFaceDirectionChevrons(tubeR + 1.5, outerR - 1.5, baseAngle - arcSpan * 0.28, dirKey, cfg.edgeMat, depthZ);
  const faceRight = createFaceDirectionChevrons(tubeR + 1.5, outerR - 1.5, baseAngle + arcSpan * 0.28, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(faceCenter, faceLeft, faceRight);

  // Glowing Neon Outer Arch Edge (Front & Back)
  const archCurvePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * arcSpan;
    archCurvePoints.push(new THREE.Vector3(Math.cos(a) * (outerR + 0.16), Math.sin(a) * (outerR + 0.16), depthZ * 0.52));
  }
  const archCurve = new THREE.CatmullRomCurve3(archCurvePoints);
  const archRailGeom = new THREE.TubeGeometry(archCurve, segs, 0.24, 6, false);
  const archRail = new THREE.Mesh(archRailGeom, cfg.edgeMat);
  innerRotor.add(archRail);

  // Inner Surface Contact Neon Rail
  const innerArchPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * arcSpan;
    innerArchPoints.push(new THREE.Vector3(Math.cos(a) * (tubeR + 0.15), Math.sin(a) * (tubeR + 0.15), depthZ * 0.52));
  }
  const innerArchCurve = new THREE.CatmullRomCurve3(innerArchPoints);
  const innerRail = new THREE.Mesh(new THREE.TubeGeometry(innerArchCurve, segs, 0.14, 6, false), cfg.accentMat);
  innerRotor.add(innerRail);

  // Strobe beacons at outer left and right tips
  const pL = archCurvePoints[0];
  const pR = archCurvePoints[archCurvePoints.length - 1];
  const beaconGeom = new THREE.SphereGeometry(0.65, 8, 8);
  const b1 = new THREE.Mesh(beaconGeom, cfg.beaconMat);
  b1.position.copy(pL);
  const b2 = new THREE.Mesh(beaconGeom, cfg.beaconMat);
  b2.position.copy(pR);
  innerRotor.add(b1, b2);

  // Guidance runway markers on open side
  const openCenter = baseAngle + Math.PI;
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    safeCenter: openCenter,
    blockedSectors: [makeSector(baseAngle, halfArc)],
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle,
      currentAngle: baseAngle,
    },
  };
}

// ============================================================================
// OBSTACLE 3: VOXEL STEPPER GATE
// Crisp chevron cascade of voxel pylons covering ~100° arc with dynamic rotation!
// Features central indicator hub and glowing perimeter warning chevrons!
// ============================================================================
export function buildSpiralVoxelFan(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const cfg = getBiomeContrastConfig(biomeId);
  const tubeR = TUBE_RADIUS;
  const count = 11;
  const stepAngle = 0.16; // ~9.1 degrees per step
  const totalArc = (count - 1) * stepAngle; // ~92 degrees
  const halfArc = totalArc * 0.5 - 0.06;
  const blockedCenter = baseAngle;
  const depthZ = 3.2;

  const beamWidth = 1.6;
  const beamHeight = 40.0; // Colossal 40m towering voxel pillars!
  const beamDepth = 2.2;

  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.45 + Math.random() * 0.28);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // Central indicator hub
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.0, depthZ * 0.6);
  innerRotor.add(centralHub);

  // Duplicated outer perimeter chevrons
  const outerArc = createOuterArcRotationArrows(tubeR + beamHeight, baseAngle - totalArc * 0.5, totalArc, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArc);

  for (let i = 0; i < count; i++) {
    const angle = (baseAngle - totalArc * 0.5) + i * stepAngle;
    const isAlt = i % 2 === 0;

    const beamGeom = new THREE.BoxGeometry(beamWidth, beamHeight, beamDepth);
    beamGeom.translate(0, tubeR + beamHeight * 0.5, 0);

    const beamMesh = new THREE.Mesh(beamGeom, isAlt ? cfg.edgeMat : sharedMats.neonWhite);
    beamMesh.rotation.z = angle - Math.PI / 2;
    innerRotor.add(beamMesh);

    // Glowing hazard crown on each voxel pillar
    const capGeom = new THREE.BoxGeometry(beamWidth + 0.14, 0.36, beamDepth + 0.14);
    capGeom.translate(0, tubeR + beamHeight + 0.18, 0);
    const cap = new THREE.Mesh(capGeom, isAlt ? cfg.accentMat : cfg.beaconMat);
    cap.rotation.z = angle - Math.PI / 2;
    innerRotor.add(cap);

    // Face chevrons on every 3rd pillar
    if (i % 3 === 1) {
      const pylonChevrons = createBeamDirectionChevrons(beamHeight, dirKey, cfg.edgeMat, tubeR, depthZ);
      pylonChevrons.rotation.z = angle - Math.PI / 2;
      innerRotor.add(pylonChevrons);
    }
  }

  // Guidance runway markers on open side
  const openCenter = baseAngle + Math.PI;
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: blockedCenter,
    safeCenter: openCenter,
    blockedSectors: [makeSector(blockedCenter, halfArc)],
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle: blockedCenter,
      currentAngle: blockedCenter,
    },
  };
}

// ============================================================================
// OBSTACLE 4: TITAN MONOLITH TOWER
// Massive carbon block covering ~70° sector with dynamic sweep, sky beacon,
// central rotation hub, and duplicated glowing face chevrons!
// ============================================================================
export function buildTitanMonolith(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const cfg = getBiomeContrastConfig(biomeId);
  const tubeR = TUBE_RADIUS;
  const height = 40.0; // Colossal Voxotron skyscraper height (40m height!)
  const depthZ = 3.2;
  const angularSpan = 1.15; // ~66 degrees wide
  const halfArc = 0.42; // Fair grazing margin
  const startA = angle - angularSpan * 0.5;

  // Extrude curved monolith block
  const shape = new THREE.Shape();
  const segs = 14;
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * angularSpan;
    const x = Math.cos(a) * (tubeR + height);
    const y = Math.sin(a) * (tubeR + height);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = startA + (i / segs) * angularSpan;
    const x = Math.cos(a) * (tubeR + 0.05);
    const y = Math.sin(a) * (tubeR + 0.05);
    shape.lineTo(x, y);
  }
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: depthZ,
    bevelEnabled: true,
    bevelSize: 0.2,
    bevelThickness: 0.2,
  });
  geom.translate(0, 0, -depthZ * 0.5);

  const monoTex = getMonolithTexture(cfg.spokeColor1, cfg.spokeColor2);
  const mat = new THREE.MeshStandardMaterial({
    map: monoTex,
    emissiveMap: monoTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.98,
    roughness: 0.18,
    metalness: 0.25,
  });
  const mesh = new THREE.Mesh(geom, mat);
  innerRotor.add(mesh);

  // Dynamic rotation
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.38 + Math.random() * 0.24);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 1. Central indicator hub
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.0, depthZ * 0.6);
  innerRotor.add(centralHub);

  // 2. Duplicated outer crest chevrons
  const outerArc = createOuterArcRotationArrows(tubeR + height, startA, angularSpan, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArc);

  // 3. Duplicated face chevrons
  const faceChevrons = createFaceDirectionChevrons(tubeR + 2.0, tubeR + height - 2.0, angle, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(faceChevrons);

  // Glowing Neon Crest Outlines along the curved edges of the monolith
  const monolithCrestPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * angularSpan;
    monolithCrestPoints.push(new THREE.Vector3(Math.cos(a) * (tubeR + height + 0.12), Math.sin(a) * (tubeR + height + 0.12), depthZ * 0.52));
  }
  const crestCurve = new THREE.CatmullRomCurve3(monolithCrestPoints);
  const crestRail = new THREE.Mesh(new THREE.TubeGeometry(crestCurve, segs, 0.24, 6, false), cfg.edgeMat);
  innerRotor.add(crestRail);

  // Summit Aircraft Warning Beacon
  const beaconPos = new THREE.Vector3(
    Math.cos(angle) * (tubeR + height + 0.6),
    Math.sin(angle) * (tubeR + height + 0.6),
    0
  );
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), cfg.beaconMat);
  beacon.position.copy(beaconPos);
  innerRotor.add(beacon);

  // Vertical skyward energy pillar
  const beamGeom = new THREE.CylinderGeometry(0.35, 0.7, 50, 8);
  beamGeom.translate(0, 25.0, 0);
  const beam = new THREE.Mesh(beamGeom, sharedMats.skyPillar);
  beam.position.copy(beaconPos);
  beam.rotation.z = angle - Math.PI / 2;
  innerRotor.add(beam);

  // Guidance runway markers on open side
  const openCenter = angle + Math.PI;
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: angle,
    safeCenter: openCenter,
    blockedSectors: [makeSector(angle, halfArc)],
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle: angle,
      currentAngle: angle,
    },
  };
}

// ============================================================================
// OBSTACLE 5: LASER QUAD GATE
// Complete 32m gantry ring with thick laser fences across 180°!
// Extends ALL THE WAY DOWN TO THE TUBE SURFACE with dynamic rotation,
// central indicator hub, and duplicated beam chevrons!
// ============================================================================
export function buildLaserQuadGate(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const cfg = getBiomeContrastConfig(biomeId);
  const tubeR = TUBE_RADIUS;
  const outerR = tubeR + 40.0; // Colossal 55m gantry ring, 40m obstacle height!
  const depthZ = 3.0;

  // Gantry perimeter ring (stationary outer reference)
  const ringGeom = new THREE.TorusGeometry(outerR, 0.45, 8, 48);
  const ringMesh = new THREE.Mesh(ringGeom, sharedMats.carbon);
  group.add(ringMesh);

  // Outer ring neon accent trim
  const ringNeon = new THREE.Mesh(new THREE.TorusGeometry(outerR + 0.16, 0.12, 8, 48), cfg.edgeMat);
  group.add(ringNeon);

  const blockedCenter = baseAngle + Math.PI * 0.5;
  const halfArc = Math.PI * 0.38; // Tightened collision margin

  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.46 + Math.random() * 0.28);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 1. Central indicator hub
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.2, depthZ * 0.6);
  innerRotor.add(centralHub);

  // 2. Duplicated outer perimeter chevrons
  const outerArc = createOuterArcRotationArrows(outerR, baseAngle, Math.PI, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArc);

  // Emitter pylons ONLY at baseAngle, blockedCenter, and baseAngle + PI
  [baseAngle, blockedCenter, baseAngle + Math.PI].forEach((a) => {
    const pylonGeom = new THREE.BoxGeometry(0.95, outerR - tubeR, 0.95);
    pylonGeom.translate(0, tubeR + (outerR - tubeR) * 0.5, 0);
    const pylon = new THREE.Mesh(pylonGeom, sharedMats.spokeDark);
    pylon.rotation.z = a - Math.PI / 2;
    innerRotor.add(pylon);

    // Glowing emitter strip
    const stripGeom = new THREE.BoxGeometry(0.18, outerR - tubeR, 0.98);
    stripGeom.translate(0, tubeR + (outerR - tubeR) * 0.5, 0);
    const strip = new THREE.Mesh(stripGeom, cfg.edgeMat);
    strip.rotation.z = a - Math.PI / 2;
    innerRotor.add(strip);

    // 3D rotation chevrons on pylon face
    const chevrons = createBeamDirectionChevrons(outerR - tubeR, dirKey, cfg.edgeMat, tubeR, depthZ);
    chevrons.rotation.z = a - Math.PI / 2;
    innerRotor.add(chevrons);
  });

  // Solid ground hazard curb across the blocked arc right on the tube surface
  const curbShape = new THREE.Shape();
  const curbSegs = 24;
  for (let i = 0; i <= curbSegs; i++) {
    const a = baseAngle + (i / curbSegs) * Math.PI;
    const x = Math.cos(a) * (tubeR + 0.38);
    const y = Math.sin(a) * (tubeR + 0.38);
    if (i === 0) curbShape.moveTo(x, y);
    else curbShape.lineTo(x, y);
  }
  for (let i = curbSegs; i >= 0; i--) {
    const a = baseAngle + (i / curbSegs) * Math.PI;
    const x = Math.cos(a) * (tubeR + 0.04);
    const y = Math.sin(a) * (tubeR + 0.04);
    curbShape.lineTo(x, y);
  }
  curbShape.closePath();
  const curbGeom = new THREE.ExtrudeGeometry(curbShape, { depth: depthZ, bevelEnabled: false });
  curbGeom.translate(0, 0, -depthZ * 0.5);
  const curbMesh = new THREE.Mesh(curbGeom, sharedMats.spokeDark);
  innerRotor.add(curbMesh);

  // Glowing neon strip on top of the curb
  const curbTrimPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= curbSegs; i++) {
    const a = baseAngle + (i / curbSegs) * Math.PI;
    curbTrimPoints.push(new THREE.Vector3(Math.cos(a) * (tubeR + 0.42), Math.sin(a) * (tubeR + 0.42), depthZ * 0.52));
  }
  const curbTrimCurve = new THREE.CatmullRomCurve3(curbTrimPoints);
  const curbTrim = new THREE.Mesh(new THREE.TubeGeometry(curbTrimCurve, curbSegs, 0.14, 6, false), cfg.accentMat);
  innerRotor.add(curbTrim);

  // Triple Laser Wall across blocked arc starting right at surface level (tubeR + 0.25)!
  const startA = baseAngle;
  const segs = 20;
  [tubeR + 0.25, tubeR + 2.4, tubeR + 5.0].forEach((rad) => {
    const laserPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= segs; i++) {
      const a = startA + (i / segs) * Math.PI;
      laserPoints.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, 0));
    }
    const laserCurve = new THREE.CatmullRomCurve3(laserPoints);
    const laserTubeGeom = new THREE.TubeGeometry(laserCurve, segs, 0.32, 6, false);
    const laserBeam = new THREE.Mesh(laserTubeGeom, cfg.edgeMat);
    innerRotor.add(laserBeam);
  });

  // Translucent Energy Field across the blocked sector
  const fieldShape = new THREE.Shape();
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * Math.PI;
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) fieldShape.moveTo(x, y);
    else fieldShape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = startA + (i / segs) * Math.PI;
    const x = Math.cos(a) * (tubeR + 0.2);
    const y = Math.sin(a) * (tubeR + 0.2);
    fieldShape.lineTo(x, y);
  }
  fieldShape.closePath();
  const fieldGeom = new THREE.ShapeGeometry(fieldShape);
  const fieldMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(cfg.spokeColor1),
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const fieldMesh = new THREE.Mesh(fieldGeom, fieldMat);
  innerRotor.add(fieldMesh);

  // Guidance runway markers on open side
  const openCenter = baseAngle + Math.PI * 1.5;
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: blockedCenter,
    safeCenter: openCenter,
    blockedSectors: [makeSector(blockedCenter, halfArc)],
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle: blockedCenter,
      currentAngle: blockedCenter,
    },
  };
}

// ============================================================================
// PICKUP 1: BOOST PAD (Floor speed boost strip with animated chevrons)
// ============================================================================
export function buildBoostPad(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const width = 2.8;
  const depthZ = 4.6;

  // Track surface pad
  const geom = new THREE.PlaneGeometry(width, depthZ);
  geom.rotateX(-Math.PI / 2);

  const mat = new THREE.MeshBasicMaterial({
    map: getBoostPadTexture(),
    transparent: true,
    opacity: 0.98,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(Math.cos(angle) * (tubeR + 0.05), Math.sin(angle) * (tubeR + 0.05), 0);
  mesh.rotation.z = angle - Math.PI / 2;
  group.add(mesh);

  // High-visibility glowing neon border rails flanking the pad
  const railGeom = new THREE.BoxGeometry(0.16, 0.22, depthZ);
  const railOffsetA = (width * 0.5) / tubeR;
  const leftRail = new THREE.Mesh(railGeom, sharedMats.neonYellow);
  leftRail.position.set(Math.cos(angle - railOffsetA) * (tubeR + 0.1), Math.sin(angle - railOffsetA) * (tubeR + 0.1), 0);
  leftRail.rotation.z = angle - Math.PI / 2;

  const rightRail = new THREE.Mesh(railGeom, sharedMats.neonYellow);
  rightRail.position.set(Math.cos(angle + railOffsetA) * (tubeR + 0.1), Math.sin(angle + railOffsetA) * (tubeR + 0.1), 0);
  rightRail.rotation.z = angle - Math.PI / 2;

  group.add(leftRail, rightRail);

  const arcSpan = width / tubeR;
  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
    isPickup: true,
  };
}

// ============================================================================
// PICKUP 2: GOLDEN CYBER COIN / STAR (High-visibility collectible)
// Unmistakable golden-amber coin with embossed star, orbiting sparkles & gold sky pillar
// ============================================================================
export function buildEnergyPrism(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 2.4;

  // 1. TALL RADIANT GOLDEN SKY BEACON PILLAR (Visible from 200m+ down the tube!)
  const beaconGeom = new THREE.CylinderGeometry(0.2, 0.7, 22, 8, 1, true);
  const beacon = new THREE.Mesh(beaconGeom, sharedMats.skyPillarGold);
  beacon.position.set(Math.cos(angle) * (tubeR + 11.0), Math.sin(angle) * (tubeR + 11.0), 0);
  beacon.rotation.z = angle - Math.PI / 2;
  group.add(beacon);

  // 2. Ground Projector Halo & Concentric Target Ring on track surface
  const groundHaloGeom = new THREE.RingGeometry(0.7, 1.4, 24);
  const groundHalo = new THREE.Mesh(groundHaloGeom, sharedMats.goldHaloRing);
  groundHalo.position.set(Math.cos(angle) * (tubeR + 0.05), Math.sin(angle) * (tubeR + 0.05), 0);
  groundHalo.rotation.z = angle - Math.PI / 2;
  group.add(groundHalo);

  const groundPulseGeom = new THREE.RingGeometry(1.45, 1.62, 24);
  const groundPulse = new THREE.Mesh(groundPulseGeom, sharedMats.neonYellow);
  groundPulse.position.set(Math.cos(angle) * (tubeR + 0.06), Math.sin(angle) * (tubeR + 0.06), 0);
  groundPulse.rotation.z = angle - Math.PI / 2;
  group.add(groundPulse);

  // 3. Central Hovering 3D Golden Cyber Coin / Star Assembly
  const prismGroup = new THREE.Group();
  prismGroup.name = 'prism_body';
  prismGroup.position.set(Math.cos(angle) * (tubeR + 1.25), Math.sin(angle) * (tubeR + 1.25), 0);
  prismGroup.rotation.z = angle - Math.PI / 2;

  // Sub-group coin_core for smooth levitation and rotation
  const coinCore = new THREE.Group();
  coinCore.name = 'coin_core';

  // Thick 12-sided faceted gold coin cylinder
  const coinGeom = new THREE.CylinderGeometry(1.15, 1.15, 0.34, 12);
  coinGeom.rotateX(Math.PI / 2);
  const coin = new THREE.Mesh(coinGeom, sharedMats.goldCoinBody);
  coinCore.add(coin);

  // Chamfered golden outer ring
  const rimGeom = new THREE.TorusGeometry(1.12, 0.08, 8, 16);
  const rim = new THREE.Mesh(rimGeom, sharedMats.neonYellow);
  coinCore.add(rim);

  // Embossed Cyber Star on Front Face (+Z)
  const starGeom1 = new THREE.OctahedronGeometry(0.5, 0);
  starGeom1.scale(1.0, 1.0, 0.15);
  const starFront1 = new THREE.Mesh(starGeom1, sharedMats.neonYellow);
  starFront1.position.z = 0.19;
  coinCore.add(starFront1);

  const starGeom2 = new THREE.OctahedronGeometry(0.38, 0);
  starGeom2.scale(1.0, 1.0, 0.15);
  const starFront2 = new THREE.Mesh(starGeom2, sharedMats.goldStarGlow);
  starFront2.rotation.z = Math.PI / 4;
  starFront2.position.z = 0.2;
  coinCore.add(starFront2);

  // Embossed Cyber Star on Back Face (-Z)
  const starBack1 = new THREE.Mesh(starGeom1, sharedMats.neonYellow);
  starBack1.position.z = -0.19;
  coinCore.add(starBack1);

  const starBack2 = new THREE.Mesh(starGeom2, sharedMats.goldStarGlow);
  starBack2.rotation.z = Math.PI / 4;
  starBack2.position.z = -0.2;
  coinCore.add(starBack2);

  prismGroup.add(coinCore);

  // Orbiting Golden Sparkle Satellites
  const sparklesGroup = new THREE.Group();
  sparklesGroup.name = 'coin_sparkles';

  const sparklePos = [
    [1.6, 0, 0],
    [-1.6, 0, 0],
    [0, 1.55, 0.2],
    [0, -1.55, -0.2],
  ];
  sparklePos.forEach(([x, y, z]) => {
    const sGeom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const sMesh = new THREE.Mesh(sGeom, sharedMats.goldStarGlow);
    sMesh.position.set(x, y, z);
    sparklesGroup.add(sMesh);
  });

  prismGroup.add(sparklesGroup);
  group.add(prismGroup);

  const arcSpan = 0.65; // radians
  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
    isPickup: true,
  };
}

// ============================================================================
// PICKUP 3: HYPER BATTERY (Golden High-Yield Energy Capsule)
// Gives +100 Coins, +5 Scrap, and immediate Speed Class Surge
// ============================================================================
export function buildHyperBattery(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 2.4;

  // 1. Radiant Golden Sky Pillar
  const beaconGeom = new THREE.CylinderGeometry(0.25, 0.8, 20, 8, 1, true);
  const beacon = new THREE.Mesh(beaconGeom, sharedMats.skyPillarGold);
  beacon.position.set(Math.cos(angle) * (tubeR + 10.0), Math.sin(angle) * (tubeR + 10.0), 0);
  beacon.rotation.z = angle - Math.PI / 2;
  group.add(beacon);

  // 2. Golden ground pad
  const groundRingGeom = new THREE.RingGeometry(1.0, 1.6, 16);
  const groundRing = new THREE.Mesh(groundRingGeom, sharedMats.neonYellow);
  groundRing.position.set(Math.cos(angle) * (tubeR + 0.06), Math.sin(angle) * (tubeR + 0.06), 0);
  groundRing.rotation.z = angle - Math.PI / 2;
  group.add(groundRing);

  // 3. Floating Gold Battery Body
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'prism_body';
  bodyGroup.position.set(Math.cos(angle) * (tubeR + 1.2), Math.sin(angle) * (tubeR + 1.2), 0);
  bodyGroup.rotation.z = angle - Math.PI / 2;

  // Golden Voxel Capsule
  const boxGeom = new THREE.BoxGeometry(0.9, 1.2, 0.9);
  const box = new THREE.Mesh(boxGeom, sharedMats.neonYellow);
  bodyGroup.add(box);

  const coreGeom = new THREE.BoxGeometry(0.5, 0.8, 0.5);
  const core = new THREE.Mesh(coreGeom, sharedMats.neonWhite);
  bodyGroup.add(core);

  // Double Orbiting Rings
  const ring1Geom = new THREE.TorusGeometry(1.6, 0.08, 8, 24);
  const ring1 = new THREE.Mesh(ring1Geom, sharedMats.neonGreen);
  ring1.rotation.x = Math.PI / 3;

  const ring2Geom = new THREE.TorusGeometry(1.4, 0.08, 8, 24);
  const ring2 = new THREE.Mesh(ring2Geom, sharedMats.neonOrange);
  ring2.rotation.y = Math.PI / 3;

  bodyGroup.add(ring1, ring2);
  group.add(bodyGroup);

  const arcSpan = 0.7;
  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
    isPickup: true,
  };
}

// ============================================================================
// BIOME 2 OBSTACLE: MAGMA GRINDER (Moving Rotating 3-Blade Volcanic Saw)
// ============================================================================
export function buildMagmaGrinder(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 3.6;
  const cfg = getBiomeContrastConfig(biomeId);

  // Speed of rotation (clockwise or counter-clockwise)
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.65 + Math.random() * 0.35);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 3 Rotating Volcanic Obsidian Blades at 120° angles (2.094 rad)
  const bladeArc = 0.28; // Precision-calibrated blade collision arc
  const bladeAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  const rotorGroup = new THREE.Group();
  rotorGroup.name = 'inner_rotor';
  rotorGroup.rotation.z = baseAngle - Math.PI / 2;

  // Central volcanic hub with Voxotron rotation arrow indicators
  const magmaHub = createCentralRotationHub(dirKey, '#ff5500', 5.2, depthZ * 0.85);
  rotorGroup.add(magmaHub);

  // Colossal Obsidian blade body soaring 38m into the sky
  const bladeHeight = 38.0;

  // Duplicated perimeter arrows along the blade tip orbit
  const outerArcArrows = createOuterArcRotationArrows(tubeR + bladeHeight, 0, Math.PI * 2, dirKey, cfg.edgeMat, depthZ);
  rotorGroup.add(outerArcArrows);

  for (const bAngle of bladeAngles) {
    const bladeGroup = new THREE.Group();
    bladeGroup.rotation.z = bAngle;

    const armGeom = new THREE.BoxGeometry(1.5, tubeR + bladeHeight, depthZ);
    const arm = new THREE.Mesh(armGeom, sharedMats.spokeDark);
    arm.position.y = (tubeR + bladeHeight) * 0.5;
    bladeGroup.add(arm);

    // Blazing incandescent teeth / cutting edge (High contrast)
    const edgeGeom = new THREE.BoxGeometry(0.42, tubeR + bladeHeight + 0.4, depthZ * 0.95);
    const edge = new THREE.Mesh(edgeGeom, cfg.edgeMat);
    edge.position.set(0.75, (tubeR + bladeHeight + 0.4) * 0.5, 0);
    bladeGroup.add(edge);

    // 3D rotation chevrons on blade face
    const chevrons = createBeamDirectionChevrons(bladeHeight, dirKey, cfg.edgeMat, tubeR, depthZ);
    bladeGroup.add(chevrons);

    // Hazard warning stripe on blade outer rim
    const rimGeom = new THREE.BoxGeometry(2.0, 0.55, depthZ);
    const rim = new THREE.Mesh(rimGeom, cfg.beaconMat);
    rim.position.y = tubeR + bladeHeight;
    bladeGroup.add(rim);

    // Apex volcanic fire beacon
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.8), cfg.beaconMat);
    beacon.position.y = tubeR + bladeHeight + 0.75;
    bladeGroup.add(beacon);

    // Blazing track-level hazard cutting pad right at surface
    const groundFootprintGeom = new THREE.BoxGeometry(1.8, 0.14, depthZ * 0.95);
    const groundFootprint = new THREE.Mesh(groundFootprintGeom, cfg.edgeMat);
    groundFootprint.position.y = tubeR + 0.05;
    bladeGroup.add(groundFootprint);

    rotorGroup.add(bladeGroup);
  }

  group.add(rotorGroup);

  // Orbit warning danger ring on tube surface
  const orbitWarningGeom = new THREE.TorusGeometry(tubeR + 0.04, 0.14, 6, 36);
  const orbitWarning = new THREE.Mesh(orbitWarningGeom, cfg.edgeMat);
  group.add(orbitWarning);

  const blockedSectors: BlockedSectorArc[] = bladeAngles.map((ba) =>
    makeSector(normalizeAngle(baseAngle + ba), bladeArc * 0.5)
  );

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    blockedSectors,
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle,
      currentAngle: baseAngle,
    },
  };
}

// ============================================================================
// BIOME 2 OBSTACLE: INFERNO PILLAR (Volcanic Basalt Monolith Spire)
// ============================================================================
export function buildInfernoPillar(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 4.2;
  const arcSpan = 0.44; // Exact collision arc matching 2.6m basalt monolith
  const cfg = getBiomeContrastConfig(biomeId);

  const pillarGroup = new THREE.Group();
  // Aligns local +Y with angle (+X in cylinder frame)
  pillarGroup.rotation.z = angle - Math.PI / 2;

  // Central colossal volcanic monolith (height 38m)
  const pillarHeight = 38.0;
  const basaltGeom = new THREE.BoxGeometry(2.6, pillarHeight, depthZ);
  const basalt = new THREE.Mesh(basaltGeom, sharedMats.spokeDark);
  basalt.position.y = tubeR + pillarHeight * 0.5;
  pillarGroup.add(basalt);

  // Erupting magma fissures on sides with high contrast styling
  const fissureGeom = new THREE.BoxGeometry(0.4, pillarHeight - 0.5, depthZ * 1.02);
  const leftFissure = new THREE.Mesh(fissureGeom, cfg.edgeMat);
  leftFissure.position.set(-1.35, tubeR + pillarHeight * 0.5, 0);

  const rightFissure = new THREE.Mesh(fissureGeom, cfg.edgeMat);
  rightFissure.position.set(1.35, tubeR + pillarHeight * 0.5, 0);

  pillarGroup.add(leftFissure, rightFissure);

  // Bright Neon Edge Rails lining the 4 corners of the monolith
  const railGeom = new THREE.BoxGeometry(0.18, pillarHeight, 0.18);
  [-1.32, 1.32].forEach((rx) => {
    [-depthZ * 0.48, depthZ * 0.48].forEach((rz) => {
      const rail = new THREE.Mesh(railGeom, cfg.edgeMat);
      rail.position.set(rx, tubeR + pillarHeight * 0.5, rz);
      pillarGroup.add(rail);
    });
  });

  // Glowing crest on top
  const crestGeom = new THREE.BoxGeometry(2.8, 0.55, depthZ);
  const crest = new THREE.Mesh(crestGeom, cfg.beaconMat);
  crest.position.y = tubeR + pillarHeight + 0.3;
  pillarGroup.add(crest);

  // Apex erupting volcanic fire beacon
  const apexBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.8), cfg.beaconMat);
  apexBeacon.position.y = tubeR + pillarHeight + 1.1;
  pillarGroup.add(apexBeacon);

  // Glowing warning beacon on the track bed directly under pillar
  const padGeom = new THREE.BoxGeometry(2.6, 0.2, depthZ);
  const pad = new THREE.Mesh(padGeom, cfg.edgeMat);
  pad.position.y = tubeR + 0.1;
  pillarGroup.add(pad);

  group.add(pillarGroup);

  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
  };
}

// ============================================================================
// BIOME 3 OBSTACLE: CRYO PENDULUM (Moving Sweeping Glacial Pendulum)
// ============================================================================
export function buildCryoPendulum(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 3.8;
  const pendulumArc = 0.36; // Precision collision arc matching 2.2m bob width
  const sweepAmp = 0.65; // ~37 degrees oscillation each side
  const cfg = getBiomeContrastConfig(biomeId);

  // 1. Semi-transparent amber/red hazard projection arc on the tube surface
  addHazardProjectionArc(group, tubeR, baseAngle, sweepAmp * 2.15, depthZ, 'amber');

  // 2. Pendulum body attached to center pivot soaring 40m into the sky
  const pendulumGroup = new THREE.Group();
  const pendulumHeight = 40.0;

  // Dark obsidian heavy alloy arm extending outward
  const armGeom = new THREE.BoxGeometry(0.85, tubeR + pendulumHeight, depthZ * 0.7);
  const arm = new THREE.Mesh(armGeom, sharedMats.obsidianArmor);
  arm.position.y = (tubeR + pendulumHeight) * 0.5;
  pendulumGroup.add(arm);

  // High-contrast Obsidian Heavy Armor Shell for Bob (height 22m)
  const shellHeight = 22.0;
  const shellGeom = new THREE.BoxGeometry(2.6, shellHeight, depthZ);
  const shell = new THREE.Mesh(shellGeom, sharedMats.obsidianArmor);
  shell.position.y = tubeR + shellHeight * 0.5;
  pendulumGroup.add(shell);

  // High-contrast Glacial Crystal Core
  const coreGeom = new THREE.BoxGeometry(1.8, shellHeight - 1.2, depthZ * 1.02);
  const core = new THREE.Mesh(coreGeom, cfg.edgeMat);
  core.position.y = tubeR + shellHeight * 0.5;
  pendulumGroup.add(core);

  // Vivid High-Visibility Warning Crest
  const crestGeom = new THREE.BoxGeometry(2.8, 0.65, depthZ * 1.05);
  const crest = new THREE.Mesh(crestGeom, cfg.beaconMat);
  crest.position.y = tubeR + shellHeight + 0.35;
  pendulumGroup.add(crest);

  // Apex crystal beacon at 40m summit
  const apexBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.95), cfg.beaconMat);
  apexBeacon.position.y = tubeR + pendulumHeight + 0.8;
  pendulumGroup.add(apexBeacon);

  // Active ground hazard projection laser pad on track surface directly under bob
  const groundLaserGeom = new THREE.BoxGeometry(2.6, 0.14, depthZ * 0.95);
  const groundLaser = new THREE.Mesh(groundLaserGeom, cfg.beaconMat);
  groundLaser.position.y = tubeR + 0.05;
  pendulumGroup.add(groundLaser);

  pendulumGroup.name = 'inner_rotor';
  pendulumGroup.rotation.z = baseAngle - Math.PI / 2;
  group.add(pendulumGroup);

  const sweepSpeed = 1.6 + Math.random() * 0.6;

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    blockedSectors: [makeSector(baseAngle, pendulumArc * 0.5)],
    movement: {
      type: 'sweep',
      speed: sweepSpeed,
      amplitude: sweepAmp,
      baseAngle,
      currentAngle: baseAngle,
    },
  };
}

// ============================================================================
// BIOME 3 OBSTACLE: GLACIER SPIKES (Cluster of Jagged Ice Spikes)
// ============================================================================
export function buildGlacierSpikes(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 3.6;
  const arcSpan = 0.58; // Calibrated to 3-spike cluster width
  const cfg = getBiomeContrastConfig(biomeId);

  const clusterGroup = new THREE.Group();
  clusterGroup.rotation.z = angle - Math.PI / 2;

  // Dark high-contrast obsidian base mount on track surface
  const baseGeom = new THREE.BoxGeometry(3.2, 0.45, depthZ);
  const baseMesh = new THREE.Mesh(baseGeom, sharedMats.obsidianArmor);
  baseMesh.position.y = tubeR + 0.16;
  clusterGroup.add(baseMesh);

  // High-visibility neon warning strip along base
  const baseStripeGeom = new THREE.BoxGeometry(3.4, 0.14, depthZ * 1.02);
  const baseStripe = new THREE.Mesh(baseStripeGeom, cfg.edgeMat);
  baseStripe.position.y = tubeR + 0.08;
  clusterGroup.add(baseStripe);

  // 3 colossal jagged icy monoliths with obsidian backing and warning tips (heights up to 40m!)
  const offsets = [-0.65, 0, 0.65];
  offsets.forEach((xOff, i) => {
    const height = 36.0 + (i === 1 ? 4.0 : 0); // Center is 40.0m!

    // Dark obsidian structural backing
    const spineGeom = new THREE.BoxGeometry(1.0, height * 0.88, 0.7);
    const spine = new THREE.Mesh(spineGeom, sharedMats.obsidianArmor);
    spine.position.set(xOff * 1.5, tubeR + height * 0.44, -0.15);
    clusterGroup.add(spine);

    // Razor ice cone
    const spikeGeom = new THREE.ConeGeometry(1.3, height, 5);
    const spike = new THREE.Mesh(spikeGeom, sharedMats.frostBladeMat);
    spike.position.set(xOff * 1.5, tubeR + height * 0.5, 0);
    spike.rotation.z = (Math.random() - 0.5) * 0.12;
    clusterGroup.add(spike);

    // Blazing hazard warning tip
    const tipGeom = new THREE.ConeGeometry(0.65, 4.0, 5);
    const tip = new THREE.Mesh(tipGeom, cfg.beaconMat);
    tip.position.set(xOff * 1.5, tubeR + height * 0.92, 0);
    clusterGroup.add(tip);
  });

  group.add(clusterGroup);

  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
  };
}

// ============================================================================
// BIOME 4 OBSTACLE: QUANTUM ROTATOR (Moving Rotating Twin Laser Gate)
// ============================================================================
export function buildQuantumRotator(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 3.2;
  const cfg = getBiomeContrastConfig(biomeId);

  // Twin opposed rotating pylons (180° apart)
  const armAngles = [0, Math.PI];
  const arcSpan = 0.22;

  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.85 + Math.random() * 0.45);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  const rotorGroup = new THREE.Group();
  rotorGroup.name = 'inner_rotor';
  rotorGroup.rotation.z = baseAngle - Math.PI / 2;

  // Central hub with Voxotron rotation arrow indicators
  const qHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.5, depthZ * 0.7);
  rotorGroup.add(qHub);

  // Colossal carbon pylon soaring 40m into space
  const pylonHeight = 40.0;

  // Duplicated outer perimeter rotation chevrons along the full orbit
  const outerArcArrows = createOuterArcRotationArrows(tubeR + pylonHeight, 0, Math.PI * 2, dirKey, cfg.edgeMat, depthZ);
  rotorGroup.add(outerArcArrows);

  for (const aAngle of armAngles) {
    const armGroup = new THREE.Group();
    armGroup.rotation.z = aAngle;

    const pylonGeom = new THREE.BoxGeometry(1.2, tubeR + pylonHeight, depthZ * 0.85);
    const pylon = new THREE.Mesh(pylonGeom, sharedMats.carbon);
    pylon.position.y = (tubeR + pylonHeight) * 0.5;
    armGroup.add(pylon);

    // Quantum laser beam blade
    const beamGeom = new THREE.BoxGeometry(0.35, tubeR + pylonHeight + 0.4, depthZ);
    const beam = new THREE.Mesh(beamGeom, cfg.edgeMat);
    beam.position.set(0.6, (tubeR + pylonHeight + 0.4) * 0.5, 0);
    armGroup.add(beam);

    // 3D rotation chevrons on pylon face
    const chevrons = createBeamDirectionChevrons(pylonHeight, dirKey, cfg.edgeMat, tubeR, depthZ);
    armGroup.add(chevrons);

    // Outer quantum warning ring
    const capGeom = new THREE.BoxGeometry(2.0, 0.6, depthZ);
    const cap = new THREE.Mesh(capGeom, cfg.accentMat);
    cap.position.y = tubeR + pylonHeight;
    armGroup.add(cap);

    // Apex laser beacon
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.85), cfg.beaconMat);
    beacon.position.y = tubeR + pylonHeight + 0.8;
    armGroup.add(beacon);

    // Active track hazard projection pad at pylon base
    const groundPad = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.15, depthZ * 0.95),
      cfg.edgeMat
    );
    groundPad.position.y = tubeR + 0.05;
    armGroup.add(groundPad);

    rotorGroup.add(armGroup);
  }

  group.add(rotorGroup);

  // Orbit danger ring on the tube surface
  const hazardRing = new THREE.Mesh(
    new THREE.TorusGeometry(tubeR + 0.04, 0.12, 6, 36),
    cfg.edgeMat
  );
  group.add(hazardRing);

  const blockedSectors: BlockedSectorArc[] = armAngles.map((a) =>
    makeSector(normalizeAngle(baseAngle + a), arcSpan * 0.5)
  );

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    blockedSectors,
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle,
      currentAngle: baseAngle,
    },
  };
}

// ============================================================================
// RIVAL INTERCEPTOR TRAP: PHANTOM MINE (Dropped by enemy drone!)
// Heavy electromagnetic pulse mine with massive footprint and vertical laser beacon
// ============================================================================
export function buildPhantomMine(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 3.8;
  const arcSpan = 0.52; // Precision collision matching mine body
  const cfg = getBiomeContrastConfig(biomeId);

  const mineGroup = new THREE.Group();
  mineGroup.rotation.z = angle - Math.PI / 2;

  // 1. Heavy faceted stealth explosive chassis
  const bodyGeom = new THREE.CylinderGeometry(1.4, 2.0, 2.6, 6);
  bodyGeom.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeom, sharedMats.carbon);
  body.position.y = tubeR + 1.5;
  mineGroup.add(body);

  // 2. Huge glowing high-contrast plasma core
  const coreGeom = new THREE.SphereGeometry(1.2, 16, 16);
  const core = new THREE.Mesh(coreGeom, cfg.edgeMat);
  core.position.y = tubeR + 1.5;
  mineGroup.add(core);

  // 3. 4 Heavy radiating electromagnetic spikes with hazard tips
  for (let i = 0; i < 4; i++) {
    const spikeAngle = (i * Math.PI) / 2;
    const spikeGeom = new THREE.BoxGeometry(0.26, 2.2, 0.26);
    const spike = new THREE.Mesh(spikeGeom, cfg.beaconMat);
    spike.position.set(
      Math.cos(spikeAngle) * 1.5,
      tubeR + 1.5 + Math.sin(spikeAngle) * 1.5,
      0
    );
    spike.rotation.z = spikeAngle;
    mineGroup.add(spike);
  }

  // 4. Rotating holographic hazard warning ring around the bomb
  const holoRingGeom = new THREE.TorusGeometry(2.4, 0.12, 6, 28);
  const holoRing = new THREE.Mesh(holoRingGeom, cfg.edgeMat);
  holoRing.position.y = tubeR + 1.5;
  holoRing.rotation.x = Math.PI / 3;
  mineGroup.add(holoRing);

  // 5. Skyward vertical laser warning beacon (shoots 40m up into cylinder air!)
  const beaconGeom = new THREE.CylinderGeometry(0.22, 0.22, 40.0, 8);
  const beacon = new THREE.Mesh(beaconGeom, cfg.beaconMat);
  beacon.position.y = tubeR + 20.0;
  mineGroup.add(beacon);

  // 6. Giant glowing threat projection on the track bed
  const groundRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 3.2, 24), cfg.beaconMat);
  groundRing.position.y = tubeR + 0.08;
  groundRing.rotation.x = -Math.PI / 2;
  mineGroup.add(groundRing);

  // Track warning pad with hazard color
  const groundPad = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, depthZ), cfg.edgeMat);
  groundPad.position.y = tubeR + 0.04;
  mineGroup.add(groundPad);

  group.add(mineGroup);

  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
  };
}

// ============================================================================
// 14. PLASMA FIREWALL (INFERNO CORE - Searing Molten Laser Curtain)
// Colossal rotating laser barrier with twin towering pylons soaring 22m,
// central rotation hub, and duplicated perimeter chevrons!
// ============================================================================
function buildPlasmaFirewall(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const depthZ = 3.6;
  const arcSpan = 1.35; // ~77 degrees wide
  const tubeR = TUBE_RADIUS;
  const pylonHeight = 38.0;
  const cfg = getBiomeContrastConfig(biomeId);

  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.42 + Math.random() * 0.28);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 1. Central indicator hub
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.2, depthZ * 0.6);
  innerRotor.add(centralHub);

  // 2. Duplicated outer perimeter chevrons
  const outerArcArrows = createOuterArcRotationArrows(tubeR + pylonHeight, angle - arcSpan * 0.5, arcSpan, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArcArrows);

  // 3. Duplicated face chevrons across the fire curtain
  const faceChevrons = createFaceDirectionChevrons(tubeR + 1.8, tubeR + pylonHeight - 2.0, angle, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(faceChevrons);

  const wallGroup = new THREE.Group();
  wallGroup.rotation.z = angle - Math.PI / 2;

  // Twin Basalt Industrial Emitter Pylons
  [-arcSpan * 0.48, arcSpan * 0.48].forEach((pylonOffset) => {
    const pylonGeom = new THREE.CylinderGeometry(0.55, 0.75, pylonHeight, 8);
    const pylon = new THREE.Mesh(pylonGeom, sharedMats.spokeDark);
    const pAngle = pylonOffset;
    pylon.position.set(
      Math.sin(pAngle) * (tubeR + pylonHeight * 0.5),
      Math.cos(pAngle) * (tubeR + pylonHeight * 0.5),
      0
    );
    pylon.rotation.z = -pAngle;

    // Glowing molten emitter rings (High contrast neon)
    for (let r = 0; r < 4; r++) {
      const ringGeom = new THREE.TorusGeometry(0.8, 0.12, 6, 16);
      const ring = new THREE.Mesh(ringGeom, cfg.edgeMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = (r - 1.5) * (pylonHeight * 0.24);
      pylon.add(ring);
    }

    // Apex warning beacon
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.7), cfg.beaconMat);
    beacon.position.y = pylonHeight * 0.5 + 0.6;
    pylon.add(beacon);

    wallGroup.add(pylon);
  });

  // Molten Plasma Curtain Sheet (High contrast color: electric cyan/violet or vivid red)
  const sheetGeom = new THREE.PlaneGeometry(tubeR * arcSpan * 0.95, pylonHeight * 0.9);
  const sheetColor = biomeId === 'inferno_core' ? 0x00ffff : 0xff1100;
  const sheetMat = new THREE.MeshBasicMaterial({
    color: sheetColor,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const sheet = new THREE.Mesh(sheetGeom, sheetMat);
  sheet.position.y = tubeR + pylonHeight * 0.48;
  wallGroup.add(sheet);

  // Flaming ground plate with bright warning rails
  const groundGeom = new THREE.BoxGeometry(tubeR * arcSpan, 0.22, depthZ);
  const ground = new THREE.Mesh(groundGeom, cfg.edgeMat);
  ground.position.y = tubeR + 0.05;
  wallGroup.add(ground);

  innerRotor.add(wallGroup);

  // Runway guidance markers on open side
  const openCenter = normalizeAngle(angle + Math.PI);
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: angle,
    safeCenter: openCenter,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle: angle,
      currentAngle: angle,
    },
  };
}

// ============================================================================
// 15. FROST SHARD GATE (CRYO VOID - Rotating Razor Ice Crystals)
// High-performance: soaring 40m crystal spines, vivid neon warning tips,
// 5.5 central hub with rotation indicators and perimeter chevrons.
// ============================================================================
function buildFrostShardGate(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const depthZ = 3.4;
  const tubeR = TUBE_RADIUS;
  const bladeArc = 0.28;
  const numBlades = 3;
  const bladeHeight = 40.0;
  const cfg = getBiomeContrastConfig(biomeId);

  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.60 + Math.random() * 0.35);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 1. Central rotating hub with bold Voxotron direction arrows
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.5, depthZ * 0.75);
  innerRotor.add(centralHub);

  // 2. Duplicated outer perimeter chevrons along the full 360° razor orbit
  const outerArcArrows = createOuterArcRotationArrows(tubeR + bladeHeight, 0, Math.PI * 2, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArcArrows);

  // 3. Hazard warning danger ring on the tube surface
  const hazardRingGeom = new THREE.TorusGeometry(tubeR + 0.04, 0.14, 6, 36);
  const hazardRing = new THREE.Mesh(hazardRingGeom, cfg.edgeMat);
  group.add(hazardRing);

  innerRotor.rotation.z = angle - Math.PI / 2;

  for (let i = 0; i < numBlades; i++) {
    const bladeGroup = new THREE.Group();
    const bladeAngle = (i / numBlades) * Math.PI * 2;
    bladeGroup.rotation.z = bladeAngle;

    // Dark obsidian structural spine
    const spineGeom = new THREE.BoxGeometry(0.85, bladeHeight, 0.7);
    const spine = new THREE.Mesh(spineGeom, sharedMats.obsidianArmor);
    spine.position.y = tubeR + bladeHeight * 0.5;
    bladeGroup.add(spine);

    // Razor ice crystal facet
    const bladeGeom = new THREE.ConeGeometry(1.2, bladeHeight, 5);
    bladeGeom.scale(1.0, 1.0, 0.45);
    const blade = new THREE.Mesh(bladeGeom, sharedMats.frostBladeMat);
    blade.position.y = tubeR + bladeHeight * 0.5;
    blade.rotation.z = Math.PI;

    // 3D rotation chevrons along blade facet
    const chevrons = createBeamDirectionChevrons(bladeHeight, dirKey, cfg.edgeMat, tubeR, depthZ);
    bladeGroup.add(chevrons);

    // Vivid high-visibility warning needle tip
    const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.85), cfg.beaconMat);
    tip.position.y = tubeR + bladeHeight + 0.8;
    bladeGroup.add(tip);

    bladeGroup.add(blade);

    // Active ground hazard projection pad at blade outer tip on tube surface
    const groundPad = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.14, depthZ * 0.95),
      cfg.beaconMat
    );
    groundPad.position.y = tubeR + 0.05;
    bladeGroup.add(groundPad);

    innerRotor.add(bladeGroup);
  }

  const blockedSectors: BlockedSectorArc[] = [];
  for (let i = 0; i < numBlades; i++) {
    const a = (i / numBlades) * Math.PI * 2;
    blockedSectors.push(makeSector(normalizeAngle(angle + a), bladeArc * 0.5));
  }

  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors,
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle: angle,
      currentAngle: angle,
    },
  };
}

// ============================================================================
// 16. VOID SINGULARITY RIFT (QUANTUM HORIZON - Dimensional Event Horizon)
// ============================================================================
function buildVoidSingularityRift(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.6;
  const arcSpan = 0.95;
  const tubeR = TUBE_RADIUS;
  const riftHeight = 40.0;
  const cfg = getBiomeContrastConfig(biomeId);

  const riftGroup = new THREE.Group();
  // Aligns local +Y to angle in cylinder coordinates
  riftGroup.rotation.z = angle - Math.PI / 2;

  // Dark dimensional core towering high above tube
  const coreGeom = new THREE.SphereGeometry(3.2, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x140124,
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  core.position.y = tubeR + riftHeight * 0.5;
  riftGroup.add(core);

  // Swirling Event Horizon Torus Ring
  const torusGeom = new THREE.TorusGeometry(5.2, 0.45, 10, 32);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0xc026d3,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
  });
  const torus = new THREE.Mesh(torusGeom, torusMat);
  torus.position.y = tubeR + riftHeight * 0.5;
  torus.rotation.x = Math.PI / 4;
  riftGroup.add(torus);

  // Outer Gravitational Coil
  const outerTorusGeom = new THREE.TorusGeometry(6.4, 0.28, 8, 28);
  const outerTorus = new THREE.Mesh(outerTorusGeom, cfg.edgeMat);
  outerTorus.position.y = tubeR + riftHeight * 0.5;
  outerTorus.rotation.y = Math.PI / 3;
  riftGroup.add(outerTorus);

  // Towering gravity tethers from surface to 40m singularity
  [-0.8, 0.8].forEach((xOff) => {
    const tetherGeom = new THREE.CylinderGeometry(0.2, 0.35, riftHeight, 8);
    const tether = new THREE.Mesh(tetherGeom, cfg.beaconMat);
    tether.position.set(xOff, tubeR + riftHeight * 0.5, 0);
    riftGroup.add(tether);
  });

  // Ground rift distortion warning
  const groundPad = new THREE.Mesh(new THREE.RingGeometry(0.8, 3.2, 24), cfg.accentMat);
  groundPad.position.y = tubeR + 0.08;
  groundPad.rotation.x = -Math.PI / 2;
  riftGroup.add(groundPad);

  group.add(riftGroup);

  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
    movement: {
      type: 'oscillate',
      speed: 1.8,
      baseAngle: angle,
      amplitude: 0.35,
    },
  };
}

// ============================================================================
// 17. VOLCANIC ARCH ERUPTION (INFERNO CORE - Cascading Magma Waterfall Gateway)
// Spans 130 degrees with pouring molten pillars, leaves wide 230-degree passage!
// ============================================================================
function buildVolcanicArchEruption(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 4.2;
  const archSpan = 2.1; // ~120 degrees
  const halfArc = archSpan * 0.5 - 0.1;
  const archHeight = 40.0;
  const cfg = getBiomeContrastConfig(biomeId);

  const archGroup = new THREE.Group();
  archGroup.rotation.z = baseAngle - Math.PI / 2;

  // Massive basalt overhead bridge span soaring 40m outward
  const bridgeGeom = new THREE.TorusGeometry(tubeR + archHeight, 1.2, 8, 32, archSpan);
  const bridge = new THREE.Mesh(bridgeGeom, sharedMats.spokeDark);
  bridge.rotation.z = Math.PI / 2 - archSpan * 0.5;
  archGroup.add(bridge);

  // Glowing crest on bridge with contrast accent
  const crestGeom = new THREE.TorusGeometry(tubeR + archHeight + 0.4, 0.45, 6, 32, archSpan);
  const crest = new THREE.Mesh(crestGeom, cfg.edgeMat);
  crest.rotation.z = Math.PI / 2 - archSpan * 0.5;
  archGroup.add(crest);

  // Cascading Pillar Columns soaring 40m from tube surface to overhead arch
  const numPillars = 5;
  for (let i = 0; i < numPillars; i++) {
    const pAngle = (i / (numPillars - 1) - 0.5) * (archSpan * 0.88);
    const pillarGeom = new THREE.CylinderGeometry(0.45, 0.8, archHeight, 8);
    const pillar = new THREE.Mesh(pillarGeom, cfg.beaconMat);
    pillar.position.set(
      -Math.sin(pAngle) * (tubeR + archHeight * 0.5),
      Math.cos(pAngle) * (tubeR + archHeight * 0.5),
      0
    );
    pillar.rotation.z = pAngle;
    archGroup.add(pillar);
  }

  // Molten ground slag pad with bright neon border
  const groundGeom = new THREE.BoxGeometry(tubeR * archSpan * 0.85, 0.25, depthZ);
  const ground = new THREE.Mesh(groundGeom, cfg.edgeMat);
  ground.position.y = tubeR + 0.05;
  archGroup.add(ground);

  group.add(archGroup);

  const safeCenter = normalizeAngle(baseAngle + Math.PI);
  // Guidance runway markers in the open corridor
  addRunwayClearanceMarkers(group, tubeR, safeCenter, depthZ);
  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    safeCenter,
    blockedSectors: [makeSector(baseAngle, halfArc)],
  };
}

// ============================================================================
// 18. CRYO BLIZZARD VORTEX (CRYO VOID - Twin Counter-Rotating Stasis Rings)
// ============================================================================
function buildCryoBlizzardVortex(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 3.6;
  const arcSpan = 0.50; // Precision collision matching stasis vortex footprint
  const cfg = getBiomeContrastConfig(biomeId);
  const vortexHeight = 40.0;

  const vortexGroup = new THREE.Group();
  vortexGroup.name = 'inner_rotor';
  vortexGroup.rotation.z = baseAngle - Math.PI / 2;

  // Stasis crystal emitter base on the tube surface soaring into 40m pylon
  const baseGeom = new THREE.CylinderGeometry(0.9, 1.3, vortexHeight, 8);
  const baseMesh = new THREE.Mesh(baseGeom, sharedMats.obsidianArmor);
  baseMesh.position.y = tubeR + vortexHeight * 0.5;
  vortexGroup.add(baseMesh);

  // Ground warning stasis pad defining collision boundary clearly
  const pad = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, depthZ), cfg.edgeMat);
  pad.position.y = tubeR + 0.05;
  vortexGroup.add(pad);

  // Counter-rotating cryogenic stasis ring at mid-height
  const rotor = new THREE.Group();
  rotor.name = 'vortex_spinner';
  rotor.position.y = tubeR + vortexHeight * 0.5;

  const ringGeom = new THREE.TorusGeometry(3.6, 0.32, 8, 28);
  const ring1 = new THREE.Mesh(ringGeom, cfg.edgeMat);
  rotor.add(ring1);

  // 4 Razor Frost Spikes jutting inward/outward
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.4, 5), sharedMats.frostBladeMat);
    spike.position.set(Math.cos(a) * 3.0, Math.sin(a) * 3.0, 0);
    spike.rotation.z = a + Math.PI / 2;
    rotor.add(spike);

    // Hazard neon warning tip
    const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.4), cfg.beaconMat);
    tip.position.set(Math.cos(a) * 2.1, Math.sin(a) * 2.1, 0);
    rotor.add(tip);
  }

  vortexGroup.add(rotor);

  // Summit warning beacon at 40m
  const topBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.9), cfg.beaconMat);
  topBeacon.position.y = tubeR + vortexHeight + 0.8;
  vortexGroup.add(topBeacon);

  group.add(vortexGroup);

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    blockedSectors: [makeSector(baseAngle, arcSpan * 0.5)],
    movement: {
      type: 'sweep',
      speed: 1.6,
      baseAngle: baseAngle,
      amplitude: 0.45,
    },
  };
}

// ============================================================================
// 19. TACHYON WARP GATE (QUANTUM HORIZON - Shifting Dimensional Phase Gate)
// ============================================================================
function buildTachyonWarpGate(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 4.0;
  const arcSpan = 0.38; // Precision collision matching gate width
  const gateHeight = 40.0;
  const cfg = getBiomeContrastConfig(biomeId);

  const gateGroup = new THREE.Group();
  gateGroup.rotation.z = baseAngle - Math.PI / 2;

  // Quantum Phase Pillars soaring 40m into space
  [-1.2, 1.2].forEach((xPos) => {
    const pylonGeom = new THREE.BoxGeometry(0.7, gateHeight, 0.8);
    const pylon = new THREE.Mesh(pylonGeom, sharedMats.darkArmor);
    pylon.position.set(xPos, tubeR + gateHeight * 0.5, 0);
    gateGroup.add(pylon);

    // Glowing neon phase inductors along the 40m pillar
    for (let c = 0; c < 4; c++) {
      const coil = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.2, 0.95), cfg.accentMat);
      coil.position.set(xPos, tubeR + (c + 0.5) * (gateHeight * 0.23), 0);
      gateGroup.add(coil);
    }

    // Apex beacon
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.75), cfg.beaconMat);
    beacon.position.set(xPos, tubeR + gateHeight + 0.7, 0);
    gateGroup.add(beacon);
  });

  // Pulsing Tachyon Laser Grid across the full 40m height
  const laserMat = new THREE.MeshBasicMaterial({
    color: cfg.beaconMat.color,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const laser = new THREE.Mesh(new THREE.PlaneGeometry(2.4, gateHeight * 0.96), laserMat);
  laser.position.set(0, tubeR + gateHeight * 0.5, 0);
  gateGroup.add(laser);

  // Ground Warning Pad
  const pad = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, depthZ), cfg.edgeMat);
  pad.position.set(0, tubeR + 0.05, 0);
  gateGroup.add(pad);

  group.add(gateGroup);

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    blockedSectors: [makeSector(baseAngle, arcSpan * 0.5)],
    movement: {
      type: 'oscillate',
      speed: 2.2,
      baseAngle: baseAngle,
      amplitude: 0.4,
    },
  };
}

// ============================================================================
// 20. SPECIALIZED BIOME RIVAL MINES
// ============================================================================
function buildMagmaMine(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.8;
  const arcSpan = 0.46;
  const tubeR = TUBE_RADIUS;
  const cfg = getBiomeContrastConfig(biomeId);

  const mineGroup = new THREE.Group();
  // Aligns local +Y to angle in cylinder coordinates
  mineGroup.rotation.z = angle - Math.PI / 2;

  // Molten slag core
  const core = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3), cfg.beaconMat);
  core.position.y = tubeR + 1.5;
  mineGroup.add(core);

  // Spikes
  for (let i = 0; i < 6; i++) {
    const spikeAngle = (i / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.4, 5), sharedMats.darkArmor);
    spike.position.set(
      Math.cos(spikeAngle) * 1.4,
      tubeR + 1.5 + Math.sin(spikeAngle) * 1.4,
      0
    );
    spike.rotation.z = spikeAngle;
    mineGroup.add(spike);
  }

  // 40m Vertical warning laser beacon
  const beaconGeom = new THREE.CylinderGeometry(0.2, 0.2, 40.0, 8);
  const beacon = new THREE.Mesh(beaconGeom, cfg.beaconMat);
  beacon.position.y = tubeR + 20.0;
  mineGroup.add(beacon);

  // Blazing ground flare
  const groundRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 3.2, 24), cfg.edgeMat);
  groundRing.position.y = tubeR + 0.06;
  groundRing.rotation.x = -Math.PI / 2;
  mineGroup.add(groundRing);

  group.add(mineGroup);
  return { group, depthZ, primaryAngle: angle, blockedSectors: [makeSector(angle, arcSpan * 0.5)] };
}

function buildCryoMine(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.8;
  const arcSpan = 0.46;
  const tubeR = TUBE_RADIUS;
  const cfg = getBiomeContrastConfig(biomeId);

  const mineGroup = new THREE.Group();
  // Aligns local +Y to angle in cylinder coordinates
  mineGroup.rotation.z = angle - Math.PI / 2;

  // Crystal ice core
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.4), cfg.edgeMat);
  core.position.y = tubeR + 1.5;
  mineGroup.add(core);

  // Ice spikes
  for (let i = 0; i < 6; i++) {
    const spikeAngle = (i / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.5, 5), sharedMats.frostBladeMat);
    spike.position.set(
      Math.cos(spikeAngle) * 1.5,
      tubeR + 1.5 + Math.sin(spikeAngle) * 1.5,
      0
    );
    spike.rotation.z = spikeAngle;
    mineGroup.add(spike);
  }

  // 40m Vertical warning laser beacon
  const beaconGeom = new THREE.CylinderGeometry(0.2, 0.2, 40.0, 8);
  const beacon = new THREE.Mesh(beaconGeom, cfg.beaconMat);
  beacon.position.y = tubeR + 20.0;
  mineGroup.add(beacon);

  // Cyan frost warning ring
  const groundRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 3.2, 24), cfg.beaconMat);
  groundRing.position.y = tubeR + 0.06;
  groundRing.rotation.x = -Math.PI / 2;
  mineGroup.add(groundRing);

  group.add(mineGroup);
  return { group, depthZ, primaryAngle: angle, blockedSectors: [makeSector(angle, arcSpan * 0.5)] };
}

const quantumMineCoreGeom = new THREE.BoxGeometry(1.3, 1.3, 1.3);
const quantumMineRingGeom = new THREE.TorusGeometry(2.0, 0.12, 6, 24);
const quantumMineGroundGeom = new THREE.RingGeometry(0.8, 3.2, 24);

function buildQuantumMine(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.8;
  const arcSpan = 0.46;
  const tubeR = TUBE_RADIUS;
  const cfg = getBiomeContrastConfig(biomeId);

  const mineGroup = new THREE.Group();
  // Aligns local +Y to angle in cylinder coordinates
  mineGroup.rotation.z = angle - Math.PI / 2;

  // Quantum core hypercube
  const core = new THREE.Mesh(quantumMineCoreGeom, cfg.beaconMat);
  core.userData.isShared = true;
  core.position.y = tubeR + 1.5;
  core.rotation.set(Math.PI / 4, Math.PI / 4, 0);
  mineGroup.add(core);

  // Phase rings
  const ring = new THREE.Mesh(quantumMineRingGeom, cfg.edgeMat);
  ring.userData.isShared = true;
  ring.position.y = tubeR + 1.5;
  mineGroup.add(ring);

  // 40m Vertical warning laser beacon
  const beaconGeom = new THREE.CylinderGeometry(0.2, 0.2, 40.0, 8);
  const beacon = new THREE.Mesh(beaconGeom, cfg.beaconMat);
  beacon.position.y = tubeR + 20.0;
  mineGroup.add(beacon);

  // Ground warning
  const groundRing = new THREE.Mesh(quantumMineGroundGeom, cfg.edgeMat);
  groundRing.userData.isShared = true;
  groundRing.position.y = tubeR + 0.06;
  groundRing.rotation.x = -Math.PI / 2;
  mineGroup.add(groundRing);

  group.add(mineGroup);
  return { group, depthZ, primaryAngle: angle, blockedSectors: [makeSector(angle, arcSpan * 0.5)] };
}

// ============================================================================
// 21. FLOW & SLALOM CORRIDORS (CHEVRON INDICATOR HELPER)
// ============================================================================
function addSlalomChevrons(
  parentGroup: THREE.Group,
  tubeR: number,
  angle: number,
  direction: 'left' | 'right',
  leadStartZ: number = -3.8,
  count: number = 3
) {
  const arrowGroup = new THREE.Group();
  arrowGroup.rotation.z = angle - Math.PI / 2;

  const sign = direction === 'right' ? 1 : -1;
  const barGeom = new THREE.BoxGeometry(0.7, 0.08, 0.22);
  const glowMat = sharedMats.neonYellow;
  const cyanMat = sharedMats.neonCyan;

  for (let c = 0; c < count; c++) {
    const zPos = leadStartZ + c * 1.5;
    const chevron = new THREE.Group();
    chevron.position.set(0, tubeR + 0.05, zPos);

    // Forward angled wing
    const wing1 = new THREE.Mesh(barGeom, c % 2 === 0 ? glowMat : cyanMat);
    wing1.position.set(sign * 0.3, 0, -0.2);
    wing1.rotation.y = sign * (Math.PI / 4.2);
    chevron.add(wing1);

    // Backward angled wing
    const wing2 = new THREE.Mesh(barGeom, c % 2 === 0 ? glowMat : cyanMat);
    wing2.position.set(sign * 0.3, 0, 0.2);
    wing2.rotation.y = -sign * (Math.PI / 4.2);
    chevron.add(wing2);

    // Arrow tip beacon
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.22), sharedMats.neonWhite);
    tip.position.set(sign * 0.65, 0, 0);
    chevron.add(tip);

    arrowGroup.add(chevron);
  }
  parentGroup.add(arrowGroup);
}

// ============================================================================
// 22. QUANTUM CORKSCREW TUNNEL («Квантовый штопор»)
// 10-arch spiral corridor with continuous 360° roll trajectory & golden coins
// ============================================================================
function buildCorkscrewArchSlice(
  archIndex: number,
  safeAngle: number,
  openArc: number,
  depthZ: number = 2.4
): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;

  const archGroup = new THREE.Group();
  archGroup.rotation.z = safeAngle - Math.PI / 2;

  const blockedAngleSpan = Math.PI * 2 - openArc;
  const startAngle = openArc * 0.5;

  // 1. High-visibility glowing hazard rib (bright warning color where you cannot pass)
  const ribGeom = new THREE.TorusGeometry(tubeR + 0.85, 0.44, 6, 28, blockedAngleSpan);
  const ribMesh = new THREE.Mesh(ribGeom, sharedMats.tunnelHazardWall);
  ribMesh.rotation.z = startAngle;
  archGroup.add(ribMesh);

  // 2. High-intensity neon energy inner rim
  const neonGeom = new THREE.TorusGeometry(tubeR + 0.74, 0.15, 6, 28, blockedAngleSpan);
  const neonMat = archIndex % 2 === 0 ? sharedMats.neonCyan : sharedMats.neonPurple;
  const neonMesh = new THREE.Mesh(neonGeom, neonMat);
  neonMesh.rotation.z = startAngle;
  archGroup.add(neonMesh);

  // 3. Two massive anchor pylons flanking the open gateway
  [-openArc * 0.5, openArc * 0.5].forEach((pylonAngle) => {
    const pylon = new THREE.Group();
    pylon.rotation.z = pylonAngle;

    const baseGeom = new THREE.BoxGeometry(0.85, 2.0, depthZ * 0.85);
    const baseMesh = new THREE.Mesh(baseGeom, sharedMats.darkArmor);
    baseMesh.position.y = tubeR + 1.0;
    pylon.add(baseMesh);

    const plateGeom = new THREE.BoxGeometry(0.9, 0.8, depthZ * 0.9);
    const plate = new THREE.Mesh(plateGeom, sharedMats.hazardPlate);
    plate.position.y = tubeR + 1.1;
    pylon.add(plate);

    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.32), sharedMats.neonYellow);
    beacon.position.y = tubeR + 2.1;
    pylon.add(beacon);

    archGroup.add(pylon);
  });

  // 4. Safe gateway runway lighting on the tube surface in the open sector
  const runwayGeom = new THREE.BoxGeometry(0.18, 0.08, depthZ * 0.95);
  [-openArc * 0.42, openArc * 0.42].forEach((xOff) => {
    const light = new THREE.Mesh(runwayGeom, sharedMats.neonGreen);
    light.position.set(xOff * tubeR, tubeR + 0.04, 0);
    archGroup.add(light);
  });

  group.add(archGroup);

  const blockedCenter = normalizeAngle(safeAngle + Math.PI);
  const blockedHalfArc = (Math.PI * 2 - openArc) * 0.5;

  return {
    group,
    depthZ,
    primaryAngle: blockedCenter,
    safeCenter: safeAngle,
    blockedSectors: [makeSector(blockedCenter, blockedHalfArc)],
  };
}

// ============================================================================
// SOLID HAZARD SECTOR BARRIER BUILDER
// Creates an unmistakable, continuous, curved monolithic barrier block with
// hyper-visible glowing hazard plates (bright red/orange + yellow neon rails),
// leaving zero ambiguous gaps or deceptive narrow holes.
// ============================================================================
function createSolidHazardSectorBarrier(
  bCenter: number,
  barrierHalfArc: number,
  depthZ: number,
  tubeR: number,
  wallHeight: number = 13.0
): THREE.Group {
  const wallGroup = new THREE.Group();
  const segs = 20;
  const startA = bCenter - barrierHalfArc;
  const outerR = tubeR + wallHeight;
  const innerR = tubeR + 0.04;

  const shape = new THREE.Shape();
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * (barrierHalfArc * 2);
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = startA + (i / segs) * (barrierHalfArc * 2);
    const x = Math.cos(a) * innerR;
    const y = Math.sin(a) * innerR;
    shape.lineTo(x, y);
  }
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: depthZ,
    bevelEnabled: true,
    bevelSize: 0.14,
    bevelThickness: 0.14,
    bevelSegments: 2,
  });
  geom.translate(0, 0, -depthZ * 0.5);

  // Bright, high-contrast hazard wall material (where you cannot pass -> BRIGHT color)
  const wallMesh = new THREE.Mesh(geom, sharedMats.tunnelHazardWall);
  wallGroup.add(wallMesh);

  // Continuous glowing neon yellow reinforcement crown tube along outer curve
  const crownPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * (barrierHalfArc * 2);
    crownPoints.push(new THREE.Vector3(Math.cos(a) * (outerR + 0.22), Math.sin(a) * (outerR + 0.22), 0));
  }
  const crownCurve = new THREE.CatmullRomCurve3(crownPoints);
  const crownRail = new THREE.Mesh(
    new THREE.TubeGeometry(crownCurve, segs, 0.28, 6, false),
    sharedMats.neonYellow
  );
  wallGroup.add(crownRail);

  // Inner track curb rail in bright neon yellow at cylinder surface
  const innerPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * (barrierHalfArc * 2);
    innerPoints.push(new THREE.Vector3(Math.cos(a) * (innerR + 0.12), Math.sin(a) * (innerR + 0.12), -depthZ * 0.48));
  }
  const innerCurve = new THREE.CatmullRomCurve3(innerPoints);
  const innerRail = new THREE.Mesh(
    new THREE.TubeGeometry(innerCurve, segs, 0.22, 6, false),
    sharedMats.neonYellow
  );
  wallGroup.add(innerRail);

  // Front-facing glowing hazard chevron strip
  const frontPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * (barrierHalfArc * 2);
    frontPoints.push(new THREE.Vector3(Math.cos(a) * (tubeR + 3.8), Math.sin(a) * (tubeR + 3.8), -depthZ * 0.52));
  }
  const frontCurve = new THREE.CatmullRomCurve3(frontPoints);
  const frontHazard = new THREE.Mesh(
    new THREE.TubeGeometry(frontCurve, segs, 0.34, 4, false),
    sharedMats.neonYellow
  );
  wallGroup.add(frontHazard);

  // High-altitude warning antenna beacons at flanks and apex
  [startA + 0.08, bCenter, startA + barrierHalfArc * 2 - 0.08].forEach((a) => {
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.65), sharedMats.neonRed);
    beacon.position.set(Math.cos(a) * (outerR + 0.8), Math.sin(a) * (outerR + 0.8), 0);
    wallGroup.add(beacon);
  });

  return wallGroup;
}

// ============================================================================
// 22. VOXOTRON SPIRAL PILLAR TUNNEL («Спиральный воксельный тоннель из столбов»)
// Streamlined 4-slice colonnade spaced 24m apart with an ultra-wide 173° flight
// corridor, glowing neon floor runway, and a solid bright-red hazard barrier
// on the blocked side to completely eliminate deceptive narrow gaps.
// ============================================================================
export function buildVoxotronPillarSpiralTunnel(
  baseAngle: number,
  baseZ: number = 0,
  theme?: 'orange' | 'cyan' | 'pink',
  biomeId?: string
): CreatedObstacleResult {
  const masterGroup = new THREE.Group();
  const tubeR = TUBE_RADIUS; // 6.5
  // Reduced number of rows: 4 spacious slices with 24m spacing for pristine readability
  const numSlices = 4;
  const stepZ = 24.0;
  const totalLength = numSlices * stepZ;
  // Ultra-wide safe flight corridor (~173° open clearance, >19.5m wide arc on track surface)
  const safeArc = Math.PI * 0.96;
  const dir = Math.random() > 0.5 ? 1 : -1;
  const stepAngle = dir * (Math.PI * 0.04); // Gentle, smooth spiral twist per slice

  // Auto-select contrasting theme based on biome if not explicitly overridden
  let effectiveTheme: 'orange' | 'cyan' | 'pink' = theme || 'orange';
  if (biomeId === 'inferno_core') {
    effectiveTheme = 'cyan'; // Cyan contrast against lava
  } else if (biomeId === 'cryo_void') {
    effectiveTheme = 'orange'; // Orange contrast against ice
  } else if (biomeId === 'quantum_horizon') {
    effectiveTheme = 'cyan';
  }

  const primaryCol = effectiveTheme === 'orange' ? '#ff6600' : effectiveTheme === 'cyan' ? '#00f0ff' : '#ff007f';
  const neonMat = effectiveTheme === 'orange' ? sharedMats.neonOrange : effectiveTheme === 'cyan' ? sharedMats.neonCyan : sharedMats.neonPink;
  const stripesTex = getVoxelStripesTexture(primaryCol, '#ffffff');

  const pillarMat = new THREE.MeshStandardMaterial({
    map: stripesTex,
    emissiveMap: stripesTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.95,
    roughness: 0.2,
    metalness: 0.3,
  });

  const chainedItems: ChainedObstacleItem[] = [];

  for (let i = 0; i < numSlices; i++) {
    const offsetZ = i * stepZ;
    const curSafeAngle = normalizeAngle(baseAngle + i * stepAngle);
    const sliceGroup = new THREE.Group();
    const depthZ = 3.2;

    // 1. Two colossal entrance/exit guide pillars flanking the wide flight corridor (38m monumental spires)
    const leftGatePillar = normalizeAngle(curSafeAngle - safeArc * 0.5);
    const rightGatePillar = normalizeAngle(curSafeAngle + safeArc * 0.5);
    const colHeight = 38.0;

    [leftGatePillar, rightGatePillar].forEach((pAngle, pIdx) => {
      const pylon = new THREE.Group();
      pylon.rotation.z = pAngle - Math.PI / 2;

      // Monumental segmented voxel column (height 38.0m)
      const colGeom = new THREE.BoxGeometry(2.4, colHeight, depthZ * 0.85);
      const colMesh = new THREE.Mesh(colGeom, pillarMat);
      colMesh.position.y = tubeR + colHeight * 0.5;
      pylon.add(colMesh);

      // Glowing Neon Corner Rails along full 38m height
      const railGeom = new THREE.BoxGeometry(0.2, colHeight, 0.2);
      [-1.1, 1.1].forEach((rx) => {
        [-depthZ * 0.36, depthZ * 0.36].forEach((rz) => {
          const rail = new THREE.Mesh(railGeom, sharedMats.neonWhite);
          rail.position.set(rx, tubeR + colHeight * 0.5, rz);
          pylon.add(rail);
        });
      });

      // Beacon on top
      const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(1.2), neonMat);
      beacon.position.y = tubeR + colHeight + 0.9;
      pylon.add(beacon);

      // INWARD-POINTING DIRECTIONAL CHEVRONS directing player into the safe passage
      // Left pillar points CW (inward), right pillar points CCW (inward)
      const inwardDir = pIdx === 0 ? 'cw' : 'ccw';
      const guideChevrons = createBeamDirectionChevrons(24.0, inwardDir, sharedMats.neonGreen, tubeR + 1.0, depthZ);
      pylon.add(guideChevrons);

      sliceGroup.add(pylon);
    });

    // 2. Continuous solid monolithic bright hazard barrier block spanning the entire blocked sector (38m high)
    const blockedCenter = normalizeAngle(curSafeAngle + Math.PI);
    const blockedHalfArc = (Math.PI * 2 - safeArc) * 0.5;
    const solidBarrier = createSolidHazardSectorBarrier(blockedCenter, blockedHalfArc, depthZ, tubeR, 38.0);
    sliceGroup.add(solidBarrier);

    // 3. Wide Glowing Runway Guide Strip on Cylinder Floor marking the safe path
    const floorPadGroup = new THREE.Group();
    floorPadGroup.rotation.z = curSafeAngle - Math.PI / 2;

    const floorGeom = new THREE.BoxGeometry(9.5, 0.14, stepZ * 0.96);
    const floorMesh = new THREE.Mesh(floorGeom, sharedMats.neonCyan);
    floorMesh.position.y = tubeR + 0.04;
    floorPadGroup.add(floorMesh);

    const floorCenterStripe = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.18, stepZ * 0.98),
      sharedMats.neonWhite
    );
    floorCenterStripe.position.y = tubeR + 0.06;
    floorPadGroup.add(floorCenterStripe);

    // Illuminated directional chevron arrows on floor pointing forward
    for (let c = -1; c <= 1; c++) {
      const arrowTip = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 4), sharedMats.neonYellow);
      arrowTip.rotation.x = Math.PI / 2;
      arrowTip.position.set(0, tubeR + 0.12, c * 6.0);
      floorPadGroup.add(arrowTip);
    }

    sliceGroup.add(floorPadGroup);

    // 4. Exact sectoral collision matching the solid barrier perfectly
    chainedItems.push({
      offsetZ,
      type: 'vox_spiral_pillar_tunnel',
      angle: curSafeAngle,
      result: {
        group: sliceGroup,
        depthZ,
        primaryAngle: curSafeAngle,
        safeCenter: curSafeAngle,
        blockedSectors: [makeSector(blockedCenter, blockedHalfArc)],
      },
    });

    // Boost pad in slice 1 for speed surge
    if (i === 1) {
      chainedItems.push({
        offsetZ: offsetZ + 2.0,
        type: 'boost_pad',
        angle: curSafeAngle,
        result: buildBoostPad(curSafeAngle),
      });
    }

    // Collectible energy prism in slice 2
    if (i === 2) {
      chainedItems.push({
        offsetZ: offsetZ + 2.0,
        type: 'energy_prism',
        angle: curSafeAngle,
        result: buildEnergyPrism(curSafeAngle),
      });
    }
  }

  const firstSafe = baseAngle;
  const initialBlockedCenter = normalizeAngle(firstSafe + Math.PI);
  const initialBlockedHalfArc = (Math.PI * 2 - safeArc) * 0.5;

  return {
    group: masterGroup,
    depthZ: totalLength,
    primaryAngle: firstSafe,
    safeCenter: firstSafe,
    blockedSectors: [makeSector(initialBlockedCenter, initialBlockedHalfArc)],
    chainedItems,
    totalSpanZ: totalLength + 25,
  };
}

// ============================================================================
// 23. COLOSSAL ROTATING SPOKE BEAMS («Громадные вращающиеся лучи-балки»)
// Matches Voxotron Steam screenshots 1 & 5: Giant segmented glowing beams
// sticking out 26m into the sky with neon stripes and rotation direction arrows!
// ============================================================================
export function buildColossalRotatingSpokeBeams(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const tubeR = TUBE_RADIUS;
  const spokeLength = 40.0; // Towering 40m high into the cosmos!
  const depthZ = 3.2;
  const spokeWidth = 2.4;

  const cfg = getBiomeContrastConfig(biomeId);
  const stripesTex = getVoxelStripesTexture(cfg.spokeColor1, cfg.spokeColor2);
  const spokeMat = new THREE.MeshStandardMaterial({
    map: stripesTex,
    emissiveMap: stripesTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.95,
    roughness: 0.2,
    metalness: 0.3,
  });

  // Dynamic rotation speed and unambiguous direction (CW or CCW)
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.60 + Math.random() * 0.40);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 1. Central Illuminated Rotating Hub with bold curved direction arrows
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.2, depthZ * 0.6);
  innerRotor.add(centralHub);

  // 2. Duplicated outer perimeter rotation chevrons along full orbit
  const outerArcArrows = createOuterArcRotationArrows(tubeR + spokeLength, 0, Math.PI * 2, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArcArrows);

  // 2 or 3 colossal spokes
  const numSpokes = Math.random() > 0.4 ? 2 : 3;
  const spokeSpan = (Math.PI * 2) / numSpokes;
  const spokeHalfArc = 0.16; // Precision collision matching spoke width
  const blockedSectors: BlockedSectorArc[] = [];

  for (let s = 0; s < numSpokes; s++) {
    const spokeAngle = baseAngle + s * spokeSpan;
    const spokeGroup = new THREE.Group();
    spokeGroup.rotation.z = spokeAngle - Math.PI / 2;

    // Main colossal beam body
    const beamGeom = new THREE.BoxGeometry(spokeWidth, spokeLength, depthZ * 0.85);
    const beamMesh = new THREE.Mesh(beamGeom, spokeMat);
    beamMesh.position.y = tubeR + spokeLength * 0.5;
    spokeGroup.add(beamMesh);

    // Glowing Neon Edge Trims (Biome contrast aware)
    const edgeGeom = new THREE.BoxGeometry(0.18, spokeLength, 0.18);
    [-spokeWidth * 0.48, spokeWidth * 0.48].forEach((ex) => {
      [-depthZ * 0.4, depthZ * 0.4].forEach((ez) => {
        const edge = new THREE.Mesh(edgeGeom, cfg.edgeMat);
        edge.position.set(ex, tubeR + spokeLength * 0.5, ez);
        spokeGroup.add(edge);
      });
    });

    // 2. VOXOTRON ROTATION DIRECTION CHEVRONS along the spoke face
    // Rows of luminous 3D chevrons pointing toward the rotation direction
    const chevrons = createBeamDirectionChevrons(spokeLength, dirKey, cfg.edgeMat, tubeR, depthZ);
    spokeGroup.add(chevrons);

    // Vertex aircraft warning beacon at spoke tip
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 8), cfg.beaconMat);
    beacon.position.y = tubeR + spokeLength + 0.5;
    spokeGroup.add(beacon);

    innerRotor.add(spokeGroup);
    blockedSectors.push(makeSector(spokeAngle, spokeHalfArc));
  }

  // Outer Neon Perimeter Torus framing the colossal rotation
  const outerPerimeter = new THREE.Mesh(
    new THREE.TorusGeometry(tubeR + spokeLength + 0.6, 0.24, 8, 48),
    cfg.archColor
  );
  group.add(outerPerimeter);

  // Inner tube rim ring
  const innerRim = new THREE.Mesh(
    new THREE.TorusGeometry(tubeR + 0.12, 0.16, 8, 48),
    sharedMats.carbon
  );
  group.add(innerRim);

  const openSafe = normalizeAngle(baseAngle + spokeSpan * 0.5);

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    safeCenter: openSafe,
    blockedSectors,
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle,
      currentAngle: baseAngle,
    },
  };
}

// ============================================================================
// 24. COLOSSAL VOXEL FAN SECTOR («Громадный воксельный веер»)
// Matches Voxotron Steam screenshot 3: Giant glowing yellow dotted voxel fan
// blade extending 25m out into space with rotation direction indicators!
// ============================================================================
export function buildColossalVoxelFanSector(angle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const tubeR = TUBE_RADIUS;
  const fanHeight = 40.0; // Radial height extending 40m far into the cosmos!
  const outerR = tubeR + fanHeight; // Towering colossal outer radius (55m total!)
  const depthZ = 3.2;
  const angularSpan = Math.PI * 0.84; // ~151° giant wedge
  const halfArc = angularSpan * 0.46; // Generous safe margin on borders
  const startA = angle - angularSpan * 0.5;

  // Extrude Sector Shape
  const shape = new THREE.Shape();
  const segs = 24;
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * angularSpan;
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = startA + (i / segs) * angularSpan;
    const x = Math.cos(a) * (tubeR + 0.08);
    const y = Math.sin(a) * (tubeR + 0.08);
    shape.lineTo(x, y);
  }
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: depthZ,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.16,
    bevelThickness: 0.16,
  });
  geom.translate(0, 0, -depthZ * 0.5);

  const cfg = getBiomeContrastConfig(biomeId);
  const gridTex = getVoxelGridTexture(cfg.fanGridColor);
  const mat = new THREE.MeshStandardMaterial({
    map: gridTex,
    emissiveMap: gridTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.98,
    roughness: 0.15,
    metalness: 0.25,
  });

  const mesh = new THREE.Mesh(geom, mat);
  innerRotor.add(mesh);

  // Dynamic rotation with rotation direction indicators
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.42 + Math.random() * 0.28);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 1. Central Rotating Hub with bold curved direction arrows
  const centralHub = createCentralRotationHub(dirKey, cfg.fanGridColor, 5.2, depthZ * 0.6);
  innerRotor.add(centralHub);

  // 2. Duplicated outer perimeter rotation chevrons along the fan's outer arc
  const outerArcArrows = createOuterArcRotationArrows(outerR + 0.4, startA, angularSpan, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArcArrows);

  // 3. Face direction chevrons across 3 radial columns (left, center, right)
  const faceCenter = createFaceDirectionChevrons(tubeR + 2.0, outerR - 2.0, angle, dirKey, cfg.edgeMat, depthZ);
  const faceLeft = createFaceDirectionChevrons(tubeR + 2.0, outerR - 2.0, angle - angularSpan * 0.28, dirKey, cfg.edgeMat, depthZ);
  const faceRight = createFaceDirectionChevrons(tubeR + 2.0, outerR - 2.0, angle + angularSpan * 0.28, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(faceCenter, faceLeft, faceRight);

  // Outer Glowing Neon Arc Rail across the fan perimeter
  const arcCurvePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * angularSpan;
    arcCurvePoints.push(new THREE.Vector3(Math.cos(a) * (outerR + 0.18), Math.sin(a) * (outerR + 0.18), depthZ * 0.52));
  }
  const arcCurve = new THREE.CatmullRomCurve3(arcCurvePoints);
  const arcRail = new THREE.Mesh(new THREE.TubeGeometry(arcCurve, segs, 0.24, 6, false), cfg.edgeMat);
  innerRotor.add(arcRail);

  // Boundary Warning Beacons on outer corners
  [startA, startA + angularSpan].forEach((cornerA) => {
    const bPos = new THREE.Vector3(Math.cos(cornerA) * (outerR + 0.4), Math.sin(cornerA) * (outerR + 0.4), 0);
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.65), cfg.beaconMat);
    beacon.position.copy(bPos);
    innerRotor.add(beacon);
  });

  // Open safe passage guidance runway lights on static group
  const openSafe = normalizeAngle(angle + Math.PI);
  addRunwayClearanceMarkers(group, tubeR, openSafe, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: angle,
    safeCenter: openSafe,
    blockedSectors: [makeSector(angle, halfArc)],
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle: angle,
      currentAngle: angle,
    },
  };
}

// ============================================================================
// 25. VOXEL ARCHWAY TUNNEL («Тоннель из светящихся воксельных арок»)
// Matches Voxotron Steam screenshot 4: Pink/Cyan cyberpunk voxel highway.
// Features an ultra-wide (163°) safe flight highway with glowing floor runway,
// framed by towering portal pylons and overhead arches. The entire impassable
// sector is sealed by a continuous solid bright-red hazard barrier, eliminating
// deceptive narrow traps and providing instant visual readability from afar.
// ============================================================================
export function buildVoxelArchwayTunnel(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const masterGroup = new THREE.Group();
  const tubeR = TUBE_RADIUS; // 6.5
  const cfg = getBiomeContrastConfig(biomeId);
  // Reduced number of arches (7 arches at 7.5m spacing) for crisp, clear visibility
  const numArches = 7;
  const stepZ = 7.5;
  const totalLength = numArches * stepZ;

  // Ultra-wide highway opening: 163° safe clearance (~18.5m on tube surface)
  const wideCenter = normalizeAngle(baseAngle);
  const wideHalfArc = 1.42;

  // Impassable sector is a single continuous solid barrier (where you cannot pass -> BRIGHT color)
  const blockedCenter = normalizeAngle(wideCenter + Math.PI);
  const blockedHalfArc = Math.PI - wideHalfArc; // ~1.72 rad (~98.6° each side)

  const chainedItems: ChainedObstacleItem[] = [];

  for (let i = 0; i < numArches; i++) {
    const offsetZ = i * stepZ;
    const sliceGroup = new THREE.Group();
    const depthZ = 3.4;

    // ------------------------------------------------------------------------
    // A. ULTRA-WIDE SAFE HIGHWAY PORTAL (Широкая часть)
    // ------------------------------------------------------------------------
    const wideLeftAngle = normalizeAngle(wideCenter - wideHalfArc);
    const wideRightAngle = normalizeAngle(wideCenter + wideHalfArc);
    const colHeight = 38.0;

    // Flanking Giant Voxel Gateway Pillars (38m Monumental Spires)
    [wideLeftAngle, wideRightAngle].forEach((pAngle, pIdx) => {
      const pylon = new THREE.Group();
      pylon.rotation.z = pAngle - Math.PI / 2;

      // Towering segmented voxel pillar (height 38.0m)
      const colGeom = new THREE.BoxGeometry(2.4, colHeight, depthZ * 0.85);
      const colMesh = new THREE.Mesh(colGeom, cfg.archColor);
      colMesh.position.set(0, tubeR + colHeight * 0.5, 0);
      pylon.add(colMesh);

      // Inner glowing white neon edge strip
      const edgeGeom = new THREE.BoxGeometry(0.32, colHeight, depthZ * 0.9);
      const edgeMesh = new THREE.Mesh(edgeGeom, cfg.edgeMat);
      edgeMesh.position.set(pIdx === 0 ? 1.2 : -1.2, tubeR + colHeight * 0.5, 0);
      pylon.add(edgeMesh);

      // Glowing hazard beacon at summit
      const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(1.2), cfg.beaconMat);
      beacon.position.set(0, tubeR + colHeight + 0.85, 0);
      pylon.add(beacon);

      // INWARD-POINTING DIRECTIONAL CHEVRONS directing into safe portal
      const inwardDir = pIdx === 0 ? 'cw' : 'ccw';
      const inwardChevrons = createBeamDirectionChevrons(24.0, inwardDir, sharedMats.neonGreen, tubeR + 1.0, depthZ);
      pylon.add(inwardChevrons);

      sliceGroup.add(pylon);
    });

    // Spanning Majestic Overhead Curved Portal Arch (soaring 16m OVER the tube)
    const archShape = new THREE.Shape();
    const archSegs = 20;
    const archInnerR = tubeR + 14.5;
    const archOuterR = tubeR + 17.0;

    for (let s = 0; s <= archSegs; s++) {
      const a = (wideCenter - wideHalfArc) + (s / archSegs) * (wideHalfArc * 2);
      const x = Math.cos(a) * archOuterR;
      const y = Math.sin(a) * archOuterR;
      if (s === 0) archShape.moveTo(x, y);
      else archShape.lineTo(x, y);
    }
    for (let s = archSegs; s >= 0; s--) {
      const a = (wideCenter - wideHalfArc) + (s / archSegs) * (wideHalfArc * 2);
      const x = Math.cos(a) * archInnerR;
      const y = Math.sin(a) * archInnerR;
      archShape.lineTo(x, y);
    }
    archShape.closePath();

    const archGeom = new THREE.ExtrudeGeometry(archShape, { depth: depthZ * 0.75, bevelEnabled: false });
    archGeom.translate(0, 0, -depthZ * 0.375);
    const archMesh = new THREE.Mesh(archGeom, cfg.archLintel);
    sliceGroup.add(archMesh);

    // Glowing summit beacon on arch crest
    const crestBeacon = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2), cfg.accentMat);
    crestBeacon.position.set(
      Math.cos(wideCenter) * (archOuterR + 1.2),
      Math.sin(wideCenter) * (archOuterR + 1.2),
      0
    );
    sliceGroup.add(crestBeacon);

    // Wide floor safe runway strip with bright contrast guide lines
    const wideRunway = new THREE.Group();
    wideRunway.rotation.z = wideCenter - Math.PI / 2;
    const floorPad = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.14, stepZ * 0.96),
      cfg.accentMat
    );
    floorPad.position.set(0, tubeR + 0.04, 0);
    wideRunway.add(floorPad);

    const floorCenter = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.18, stepZ * 0.98),
      sharedMats.neonWhite
    );
    floorCenter.position.set(0, tubeR + 0.06, 0);
    wideRunway.add(floorCenter);

    // Forward direction chevron arrows on the runway
    for (let c = -1; c <= 1; c++) {
      const arrowTip = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.4, 4), sharedMats.neonYellow);
      arrowTip.rotation.x = Math.PI / 2;
      arrowTip.position.set(0, tubeR + 0.14, c * 6.0);
      wideRunway.add(arrowTip);
    }

    sliceGroup.add(wideRunway);

    // ------------------------------------------------------------------------
    // B. IMPASSABLE SOLID BRIGHT HAZARD BARRIER (Сплошная яркая защитная стена)
    // Towering 38m continuous curved hazard barrier
    // ------------------------------------------------------------------------
    const solidFlankBarrier = createSolidHazardSectorBarrier(
      blockedCenter,
      blockedHalfArc,
      depthZ,
      tubeR,
      38.0
    );
    sliceGroup.add(solidFlankBarrier);

    // Register slice as chained item with exact sectoral collision blocking the solid barrier
    chainedItems.push({
      offsetZ,
      type: 'vox_archway_tunnel',
      angle: wideCenter,
      result: {
        group: sliceGroup,
        depthZ,
        primaryAngle: wideCenter,
        safeCenter: wideCenter,
        blockedSectors: [makeSector(blockedCenter, blockedHalfArc)],
      },
    });

    // ------------------------------------------------------------------------
    // C. COLLECTIBLES & EXACTLY ONE BOOST PAD
    // Exactly 1 boost pad at arch 3 along the wide runway ("слишком много, оставь одну")
    // Coins at arch 1 and 5
    // ------------------------------------------------------------------------
    if (i === 1 || i === 5) {
      chainedItems.push({
        offsetZ: offsetZ + 2.0,
        type: 'energy_prism',
        angle: wideCenter,
        result: buildEnergyPrism(wideCenter),
      });
    }

    if (i === 3) {
      chainedItems.push({
        offsetZ: offsetZ + 2.0,
        type: 'boost_pad',
        angle: wideCenter,
        result: buildBoostPad(wideCenter),
      });
    }
  }

  return {
    group: masterGroup,
    depthZ: totalLength,
    primaryAngle: wideCenter,
    safeCenter: wideCenter,
    blockedSectors: [makeSector(blockedCenter, blockedHalfArc)],
    chainedItems,
    totalSpanZ: totalLength + 25,
  };
}

export function buildSpiralCorkscrewTunnel(baseAngle: number, baseZ: number = 0): CreatedObstacleResult {
  return buildVoxotronPillarSpiralTunnel(baseAngle, baseZ, 'cyan');
}

export function buildCompressionSpeedTunnel(baseAngle: number, baseZ: number = 0): CreatedObstacleResult {
  return buildVoxelArchwayTunnel(baseAngle);
}

// ============================================================================
// 23. NEON SLALOM CHICANE («Неоновый слалом»)
// 3 colossal alternating left-right barriers with floor neon chevron turn indicators
// ============================================================================
function buildSlalomBarrierSlice(
  barrierIndex: number,
  barrierAngle: number,
  turnDirection: 'left' | 'right',
  depthZ: number = 3.2,
  biomeId?: string
): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const arcSpan = 0.60; // Precision collision matching barrier width
  const pylonHeight = 40.0;
  const cfg = getBiomeContrastConfig(biomeId);

  const barrierGroup = new THREE.Group();
  barrierGroup.rotation.z = barrierAngle - Math.PI / 2;

  // 1. Heavy obsidian reinforced pylon barrier body
  const bodyGeom = new THREE.BoxGeometry(3.6, 2.2, depthZ * 0.85);
  const body = new THREE.Mesh(bodyGeom, sharedMats.obsidianArmor);
  body.position.y = tubeR + 1.1;
  barrierGroup.add(body);

  // 1b. Colossal vertical guide pylons (height 40m) towering into the sky
  const pylonGeom = new THREE.BoxGeometry(1.0, pylonHeight, depthZ * 0.7);
  [-1.5, 1.5].forEach((px) => {
    const pMesh = new THREE.Mesh(pylonGeom, sharedMats.obsidianArmor);
    pMesh.position.set(px, tubeR + pylonHeight * 0.5, 0);
    barrierGroup.add(pMesh);

    // Neon edge rails on pylon
    const railGeom = new THREE.BoxGeometry(0.16, pylonHeight, 0.16);
    [-0.45, 0.45].forEach((rx) => {
      const rail = new THREE.Mesh(railGeom, cfg.edgeMat);
      rail.position.set(px + rx, tubeR + pylonHeight * 0.5, depthZ * 0.36);
      barrierGroup.add(rail);
    });

    const topBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.85), cfg.beaconMat);
    topBeacon.position.set(px, tubeR + pylonHeight + 0.8, 0);
    barrierGroup.add(topBeacon);
  });

  // 2. Front and rear hazard warning plates
  [-depthZ * 0.43, depthZ * 0.43].forEach((zOff) => {
    const plateGeom = new THREE.PlaneGeometry(3.5, 2.0);
    const plate = new THREE.Mesh(plateGeom, sharedMats.hazardPlate);
    plate.position.set(0, tubeR + 1.1, zOff);
    if (zOff < 0) plate.rotation.y = Math.PI;
    barrierGroup.add(plate);
  });

  // 3. High-voltage energy tripwire beam across the top
  const wireGeom = new THREE.BoxGeometry(3.8, 0.25, depthZ * 0.95);
  const wire = new THREE.Mesh(wireGeom, cfg.beaconMat);
  wire.position.y = tubeR + 2.25;
  barrierGroup.add(wire);

  // 4. Ground warning hazard pad at barrier footprint
  const groundPadGeom = new THREE.BoxGeometry(4.0, 0.12, depthZ * 1.05);
  const groundPad = new THREE.Mesh(groundPadGeom, cfg.edgeMat);
  groundPad.position.y = tubeR + 0.05;
  barrierGroup.add(groundPad);

  // 5. Pulsing hazard beacon
  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), cfg.beaconMat);
  beacon.position.y = tubeR + 2.6;
  barrierGroup.add(beacon);

  group.add(barrierGroup);

  // 6. Neon arrow chevrons on track surface pointing toward the safe lane
  addSlalomChevrons(group, tubeR, barrierAngle, turnDirection, -3.8, 3);

  return {
    group,
    depthZ,
    primaryAngle: barrierAngle,
    blockedSectors: [makeSector(barrierAngle, arcSpan * 0.5)],
  };
}

export function buildSlalomChicane(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const masterGroup = new THREE.Group();
  // Streamlined grand chicane: 3 colossal alternating gates spaced at 24.0m
  const numBarriers = 3;
  const stepZ = 24.0;
  const depthZ = 3.8;
  const slalomOffset = 0.62; // ~35.5 degrees left / right
  const startDir = Math.random() > 0.5 ? 1 : -1;

  const chainedItems: ChainedObstacleItem[] = [];

  for (let i = 0; i < numBarriers; i++) {
    const offsetZ = i * stepZ;
    const sign = (i % 2 === 0 ? 1 : -1) * startDir;
    const barrierAngle = normalizeAngle(baseAngle + sign * slalomOffset);
    const safeAngle = normalizeAngle(baseAngle - sign * slalomOffset);
    const turnDir: 'left' | 'right' = sign > 0 ? 'left' : 'right';

    const barrierResult = buildSlalomBarrierSlice(i, barrierAngle, turnDir, depthZ, biomeId);

    chainedItems.push({
      offsetZ,
      type: 'slalom_chicane',
      angle: barrierAngle,
      result: barrierResult,
    });

    // Reward coin at the apex of the slalom weave between barriers
    if (i < numBarriers - 1) {
      const coinOffsetZ = offsetZ + stepZ * 0.5;
      const coinResult = buildEnergyPrism(safeAngle);
      chainedItems.push({
        offsetZ: coinOffsetZ,
        type: 'energy_prism',
        angle: safeAngle,
        result: coinResult,
      });
    }

    const sliceClone = barrierResult.group.clone();
    sliceClone.position.z = offsetZ;
    masterGroup.add(sliceClone);
  }

  const totalSpanZ = (numBarriers - 1) * stepZ + depthZ;

  return {
    group: masterGroup,
    depthZ: totalSpanZ,
    primaryAngle: baseAngle,
    blockedSectors: [makeSector(normalizeAngle(baseAngle + startDir * slalomOffset), 0.30)],
    chainedItems,
    totalSpanZ,
  };
}

// ============================================================================
// 24. COMPRESSION SPEED TUNNEL («Ребристый туннель скорости»)
// 10 closely spaced light rings leaving only a 90° opening, with midpoint turbo boost
// ============================================================================
function buildCompressionRingSlice(
  ringIndex: number,
  safeAngle: number,
  openArc: number = Math.PI * 0.85,
  depthZ: number = 2.0
): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;

  const ringGroup = new THREE.Group();
  ringGroup.rotation.z = safeAngle - Math.PI / 2;

  const blockedAngleSpan = Math.PI * 2 - openArc;
  const startAngle = openArc * 0.5;

  // 1. High-visibility glowing hazard rib (bright warning color where you cannot pass)
  const ribGeom = new THREE.TorusGeometry(tubeR + 0.82, 0.46, 8, 32, blockedAngleSpan);
  const ribMesh = new THREE.Mesh(ribGeom, sharedMats.tunnelHazardWall);
  ribMesh.rotation.z = startAngle;
  ringGroup.add(ribMesh);

  // 2. High-intensity neon energy inner rib (vibrant alternating red / cyan)
  const neonGeom = new THREE.TorusGeometry(tubeR + 0.72, 0.16, 8, 32, blockedAngleSpan);
  const neonMat = ringIndex % 2 === 0 ? sharedMats.neonRed : sharedMats.neonCyan;
  const neonMesh = new THREE.Mesh(neonGeom, neonMat);
  neonMesh.rotation.z = startAngle;
  ringGroup.add(neonMesh);

  // 3. Massive hydraulic compression teeth extending inward from top of rib
  const toothAngles = [Math.PI * 0.75, Math.PI * 1.0, Math.PI * 1.25];
  toothAngles.forEach((tAngle) => {
    const tooth = new THREE.Group();
    tooth.rotation.z = tAngle;

    const toothGeom = new THREE.ConeGeometry(0.55, 1.8, 5);
    const toothMesh = new THREE.Mesh(toothGeom, sharedMats.darkArmor);
    toothMesh.position.y = tubeR + 1.2;
    toothMesh.rotation.z = Math.PI;
    tooth.add(toothMesh);

    const toothTip = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), sharedMats.iceWarningNeon);
    toothTip.position.y = tubeR + 0.3;
    tooth.add(toothTip);

    ringGroup.add(tooth);
  });

  // 4. Two glowing entrance gateway pylons flanking the 90° opening
  [-openArc * 0.5, openArc * 0.5].forEach((postAngle) => {
    const post = new THREE.Group();
    post.rotation.z = postAngle;

    const postGeom = new THREE.BoxGeometry(0.75, 2.2, depthZ * 0.9);
    const postMesh = new THREE.Mesh(postGeom, sharedMats.darkArmor);
    postMesh.position.y = tubeR + 1.1;
    post.add(postMesh);

    const postBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.4, depthZ * 0.95), sharedMats.neonYellow);
    postBeacon.position.y = tubeR + 2.1;
    post.add(postBeacon);

    ringGroup.add(post);
  });

  // 5. Dual high-speed runway guide lines on the tube floor inside the 90° opening
  const runwayGeom = new THREE.BoxGeometry(0.18, 0.08, depthZ * 0.95);
  [-openArc * 0.38, openArc * 0.38].forEach((xOff) => {
    const line = new THREE.Mesh(runwayGeom, sharedMats.neonCyan);
    line.position.set(xOff * tubeR, tubeR + 0.04, 0);
    ringGroup.add(line);
  });

  group.add(ringGroup);

  const blockedCenter = normalizeAngle(safeAngle + Math.PI);
  const blockedHalfArc = (Math.PI * 2 - openArc) * 0.5;

  return {
    group,
    depthZ,
    primaryAngle: blockedCenter,
    safeCenter: safeAngle,
    blockedSectors: [makeSector(blockedCenter, blockedHalfArc)],
  };
}

// ============================================================================
// 27. LAVA PUDDLE TRAP (Экстра-яркая вулканическая лавовая лужа)
// User requirement: "реализуй лавовые экстрояркие лужи на которые нельзя наезжать"
// Blazing molten incandescent lake with white-hot core, glowing neon yellow curbs,
// overhead warning gantry, floating volcanic embers, and ground danger projection.
// ============================================================================
export function buildLavaPuddleTrap(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 26.0;
  const arcSpan = 1.25; // ~71 degrees of impassable boiling molten hazard
  const halfArc = arcSpan * 0.5;
  const startA = baseAngle - halfArc;
  const segs = 24;

  // 1. Primary Molten Magma Surface hugging cylinder surface (High-intensity incandescent emissive)
  const shape = new THREE.Shape();
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * arcSpan;
    const x = Math.cos(a) * (tubeR + 0.08);
    const y = Math.sin(a) * (tubeR + 0.08);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = startA + (i / segs) * arcSpan;
    const x = Math.cos(a) * (tubeR + 0.02);
    const y = Math.sin(a) * (tubeR + 0.02);
    shape.lineTo(x, y);
  }
  shape.closePath();

  const lakeGeom = new THREE.ExtrudeGeometry(shape, {
    depth: depthZ,
    bevelEnabled: false,
  });
  lakeGeom.translate(0, 0, -depthZ * 0.5);
  const lakeMesh = new THREE.Mesh(lakeGeom, sharedMats.lavaPuddleMat);
  group.add(lakeMesh);

  // 1b. Ultra-Bright White-Hot Core Crest Sheet (Inner 82% with Additive Blending)
  const coreSpan = arcSpan * 0.82;
  const coreStartA = baseAngle - coreSpan * 0.5;
  const coreShape = new THREE.Shape();
  for (let i = 0; i <= segs; i++) {
    const a = coreStartA + (i / segs) * coreSpan;
    const x = Math.cos(a) * (tubeR + 0.12);
    const y = Math.sin(a) * (tubeR + 0.12);
    if (i === 0) coreShape.moveTo(x, y);
    else coreShape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = coreStartA + (i / segs) * coreSpan;
    const x = Math.cos(a) * (tubeR + 0.06);
    const y = Math.sin(a) * (tubeR + 0.06);
    coreShape.lineTo(x, y);
  }
  coreShape.closePath();

  const coreGeom = new THREE.ExtrudeGeometry(coreShape, {
    depth: depthZ * 0.96,
    bevelEnabled: false,
  });
  coreGeom.translate(0, 0, -depthZ * 0.48);
  const coreMesh = new THREE.Mesh(coreGeom, sharedMats.lavaPuddleCoreMat);
  group.add(coreMesh);

  // 2. High-Visibility Boundary Curbs & Towering 18m Warning Pylons on both flanks
  [startA, baseAngle + halfArc].forEach((edgeAngle, idx) => {
    const flankGroup = new THREE.Group();
    flankGroup.rotation.z = edgeAngle - Math.PI / 2;

    // Glowing warning curb along entire puddle length
    const curbGeom = new THREE.BoxGeometry(0.85, 0.45, depthZ);
    const curb = new THREE.Mesh(curbGeom, sharedMats.neonYellow);
    curb.position.set(0, tubeR + 0.22, 0);
    flankGroup.add(curb);

    // Radiant white-hot inner curb stripe
    const rimGeom = new THREE.BoxGeometry(0.24, 0.52, depthZ * 1.02);
    const rim = new THREE.Mesh(rimGeom, sharedMats.neonWhite);
    rim.position.set(idx === 0 ? 0.42 : -0.42, tubeR + 0.26, 0);
    flankGroup.add(rim);

    // Towering 40m High Warning Spires flanking the lake
    const spireHeight = 40.0;
    const spireGeom = new THREE.BoxGeometry(1.6, spireHeight, 2.0);
    const spire = new THREE.Mesh(spireGeom, sharedMats.obsidianArmor);
    spire.position.set(0, tubeR + spireHeight * 0.5, 0);
    flankGroup.add(spire);

    // Continuous bright vertical neon beacon line
    const neonLineGeom = new THREE.BoxGeometry(0.28, spireHeight, 0.28);
    const neonLine = new THREE.Mesh(neonLineGeom, sharedMats.neonYellow);
    neonLine.position.set(0, tubeR + spireHeight * 0.5, 1.05);
    flankGroup.add(neonLine);

    // Summit dual warning beacons
    const beaconWhite = new THREE.Mesh(new THREE.OctahedronGeometry(0.95), sharedMats.neonWhite);
    beaconWhite.position.set(0, tubeR + spireHeight + 0.6, 0);
    flankGroup.add(beaconWhite);

    const beaconRed = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), sharedMats.neonRed);
    beaconRed.position.set(0, tubeR + spireHeight + 2.0, 0);
    flankGroup.add(beaconRed);

    group.add(flankGroup);
  });

  // 3. Overhead Warning Arch bridging across the puddle (Visible from 250m)
  const archGroup = new THREE.Group();
  archGroup.rotation.z = baseAngle - Math.PI / 2;
  const archTop = tubeR + 39.5;
  const chordW = 2 * archTop * Math.sin(halfArc);
  const archGeom = new THREE.BoxGeometry(chordW * 1.02, 1.8, 2.4);
  const archMesh = new THREE.Mesh(archGeom, sharedMats.neonYellow);
  archMesh.position.set(0, archTop * Math.cos(halfArc), 0);
  archGroup.add(archMesh);

  // Center crest danger diamond
  const crestBeacon = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4), sharedMats.neonRed);
  crestBeacon.position.set(0, archTop * Math.cos(halfArc) + 1.8, 0);
  archGroup.add(crestBeacon);
  group.add(archGroup);

  // 4. Floating Incandescent Fire Embers and Magma Spark Orbs hovering above the pool
  for (let e = 0; e < 14; e++) {
    const orbAngle = startA + (e / 13) * arcSpan;
    const orbDist = tubeR + 0.45 + (e % 4) * 0.4;
    const orbZ = -depthZ * 0.4 + (e / 13) * depthZ * 0.8;
    const ember = new THREE.Mesh(
      new THREE.SphereGeometry(0.32 + (e % 3) * 0.12, 6, 6),
      e % 2 === 0 ? sharedMats.neonWhite : sharedMats.neonYellow
    );
    ember.position.set(
      Math.cos(orbAngle) * orbDist,
      Math.sin(orbAngle) * orbDist,
      orbZ
    );
    group.add(ember);
  }

  // 5. Approach & Exit Hazard Projection Chevrons on cylinder floor
  [-depthZ * 0.52, depthZ * 0.52].forEach((warnZ) => {
    const warnPadGroup = new THREE.Group();
    warnPadGroup.rotation.z = baseAngle - Math.PI / 2;
    const padGeom = new THREE.BoxGeometry(tubeR * arcSpan * 1.05, 0.16, 2.0);
    const padMesh = new THREE.Mesh(padGeom, sharedMats.neonRed);
    padMesh.position.set(0, tubeR + 0.08, warnZ);
    warnPadGroup.add(padMesh);
    group.add(warnPadGroup);
  });

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    blockedSectors: [makeSector(baseAngle, halfArc)],
  };
}

// ============================================================================
// 28. ICE SLICK PATCH (Ледяное скользкое место)
// Translucent icy sheet spanning ~77° arc and 24m length.
// Drastically lowers steering friction causing extreme drifting slides!
// ============================================================================
export function buildIceSlickPatch(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 24.0;
  const arcSpan = 1.35; // ~77 degrees
  const halfArc = arcSpan * 0.5;
  const startA = baseAngle - halfArc;
  const segs = 22;

  // 1. Crystalline translucent ice surface
  const shape = new THREE.Shape();
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * arcSpan;
    const x = Math.cos(a) * (tubeR + 0.05);
    const y = Math.sin(a) * (tubeR + 0.05);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = startA + (i / segs) * arcSpan;
    const x = Math.cos(a) * (tubeR + 0.02);
    const y = Math.sin(a) * (tubeR + 0.02);
    shape.lineTo(x, y);
  }
  shape.closePath();

  const iceGeom = new THREE.ExtrudeGeometry(shape, {
    depth: depthZ,
    bevelEnabled: false,
  });
  iceGeom.translate(0, 0, -depthZ * 0.5);
  const iceMesh = new THREE.Mesh(iceGeom, sharedMats.iceSlickMat);
  group.add(iceMesh);

  // 2. Glacial crystal border spires (height 15.5m)
  [startA, baseAngle + halfArc].forEach((edgeAngle, idx) => {
    const flankGroup = new THREE.Group();
    flankGroup.rotation.z = edgeAngle - Math.PI / 2;

    const curbGeom = new THREE.BoxGeometry(0.7, 0.35, depthZ);
    const curb = new THREE.Mesh(curbGeom, sharedMats.obsidianArmor);
    curb.position.set(0, tubeR + 0.18, 0);
    flankGroup.add(curb);

    const railGeom = new THREE.BoxGeometry(0.16, 0.42, depthZ);
    const rail = new THREE.Mesh(railGeom, sharedMats.neonCyan);
    rail.position.set(idx === 0 ? 0.35 : -0.35, tubeR + 0.22, 0);
    flankGroup.add(rail);

    const spireHeight = 40.0;
    const spireGeom = new THREE.BoxGeometry(1.3, spireHeight, 1.6);
    const spire = new THREE.Mesh(spireGeom, sharedMats.frostBladeMat);
    spire.position.set(0, tubeR + spireHeight * 0.5, 0);
    flankGroup.add(spire);

    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.85), sharedMats.iceGlow);
    beacon.position.set(0, tubeR + spireHeight + 0.8, 0);
    flankGroup.add(beacon);

    group.add(flankGroup);
  });

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    isPickup: true,
    blockedSectors: [makeSector(baseAngle, halfArc)],
  };
}

// ============================================================================
// 27. VOX SLALOM PAIR («Воксельный дуэт слалома»)
// Matches classic Voxotron alternating gate slalom: Two sequential colossal
// half-disc barriers rotating in opposite directions (CW then CCW) spaced along
// the tube, forcing rapid banking maneuvers with clear rotation chevrons & hubs!
// ============================================================================
export function buildVoxSlalomPair(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const masterGroup = new THREE.Group();
  const stepZ = 46.0;
  const depthZ = 3.2;

  // Gate 1: Rotates Clockwise, safe lane centered at baseAngle, blocked half opposite
  const gate1Angle = normalizeAngle(baseAngle + Math.PI);
  const gate1Result = buildHalfDiscBarrier(gate1Angle, biomeId);
  if (gate1Result.movement) {
    gate1Result.movement.speed = -Math.abs(gate1Result.movement.speed);
  }

  // Gate 2: Rotates Counter-Clockwise, safe lane centered at baseAngle + Math.PI, blocked half at baseAngle
  const gate2Angle = normalizeAngle(baseAngle);
  const gate2Result = buildHalfDiscBarrier(gate2Angle, biomeId);
  if (gate2Result.movement) {
    gate2Result.movement.speed = Math.abs(gate2Result.movement.speed);
  }

  const chainedItems: ChainedObstacleItem[] = [
    {
      offsetZ: 0,
      type: 'vox_slalom_pair',
      angle: gate1Angle,
      result: gate1Result,
    },
    {
      offsetZ: stepZ * 0.5,
      type: 'energy_prism',
      angle: normalizeAngle(baseAngle + Math.PI * 0.5),
      result: buildEnergyPrism(normalizeAngle(baseAngle + Math.PI * 0.5)),
    },
    {
      offsetZ: stepZ,
      type: 'vox_slalom_pair',
      angle: gate2Angle,
      result: gate2Result,
    },
  ];

  const totalSpanZ = stepZ + depthZ;

  return {
    group: masterGroup,
    depthZ: totalSpanZ,
    primaryAngle: baseAngle,
    safeCenter: baseAngle,
    blockedSectors: gate1Result.blockedSectors,
    chainedItems,
    totalSpanZ,
  };
}

// ============================================================================
// 28. VOX SLIT CASCADE («Каскад воксельных щелей / турбин»)
// Matches Voxotron turbine sequence: 3 sequential colossal spoke/fan gates
// with alternating rotation speeds and phased openings, creating an intense
// high-speed rhythmic slalom through towering rotating neon monoliths!
// ============================================================================
export function buildVoxSlitCascade(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const masterGroup = new THREE.Group();
  const numGates = 3;
  const stepZ = 42.0;
  const depthZ = 3.2;

  const chainedItems: ChainedObstacleItem[] = [];

  for (let i = 0; i < numGates; i++) {
    const offsetZ = i * stepZ;
    // Alternate rotation direction: CW, CCW, CW
    const dirSign = i % 2 === 0 ? -1 : 1;
    const phaseOffset = i * ((Math.PI * 2) / 3);
    const gateAngle = normalizeAngle(baseAngle + phaseOffset);

    const gateResult = buildColossalRotatingSpokeBeams(gateAngle, biomeId);
    if (gateResult.movement) {
      gateResult.movement.speed = dirSign * Math.abs(gateResult.movement.speed);
    }

    chainedItems.push({
      offsetZ,
      type: 'vox_slit_cascade',
      angle: gateAngle,
      result: gateResult,
    });

    // Reward prism between each gate stage
    if (i < numGates - 1) {
      const rewardSafe = normalizeAngle(gateAngle + Math.PI * 0.5);
      chainedItems.push({
        offsetZ: offsetZ + stepZ * 0.5,
        type: 'energy_prism',
        angle: rewardSafe,
        result: buildEnergyPrism(rewardSafe),
      });
    }
  }

  const totalSpanZ = (numGates - 1) * stepZ + depthZ;

  return {
    group: masterGroup,
    depthZ: totalSpanZ,
    primaryAngle: baseAngle,
    blockedSectors: chainedItems[0].result.blockedSectors,
    chainedItems,
    totalSpanZ,
  };
}

// ============================================================================
// 29. VOX APERTURE IRIS («Воксельная диафрагма / Ирис»)
// Colossal mechanical iris with 5 towering voxel shutter blades extending
// 38m outward from the tube surface, dynamic rotation, central indicator hub,
// outer perimeter chevrons, and duplicated blade-face chevrons!
// ============================================================================
export function buildVoxApertureIris(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const tubeR = TUBE_RADIUS;
  const outerR = tubeR + 25.0; // Towering colossal 40m outer ring!
  const depthZ = 3.2;
  const cfg = getBiomeContrastConfig(biomeId);

  // 1. Stationary outer gantry frame
  const gantryGeom = new THREE.TorusGeometry(outerR, 0.42, 8, 48);
  const gantry = new THREE.Mesh(gantryGeom, sharedMats.carbon);
  group.add(gantry);

  const gantryTrim = new THREE.Mesh(
    new THREE.TorusGeometry(outerR + 0.16, 0.12, 8, 48),
    cfg.edgeMat
  );
  group.add(gantryTrim);

  // 2. Rotation parameters & direction key
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.48 + Math.random() * 0.28);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 3. Central rotation indicator hub
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.5, depthZ * 0.65);
  innerRotor.add(centralHub);

  // 4. Blocked sector (~175° arc covered by 5 stepping iris blades)
  const blockedCenter = baseAngle + Math.PI * 0.5;
  const halfArc = Math.PI * 0.36; // Collision halfArc tightened for fair graze mechanics
  const bladeCount = 5;
  const irisSpan = Math.PI * 0.95;
  const irisStart = baseAngle;

  // Outer crest chevrons along the blocked arc
  const outerArc = createOuterArcRotationArrows(outerR, irisStart, irisSpan, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArc);

  const bladeHeight = 40.0; // 40m colossal height!
  const stripesTex = getVoxelStripesTexture(cfg.spokeColor1, cfg.spokeColor2);
  const bladeMat = new THREE.MeshStandardMaterial({
    map: stripesTex,
    emissiveMap: stripesTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.3,
  });

  for (let i = 0; i < bladeCount; i++) {
    const bladeAngle = irisStart + (i / (bladeCount - 1)) * irisSpan;
    const bladeGroup = new THREE.Group();
    bladeGroup.rotation.z = bladeAngle - Math.PI / 2;

    const bladeWidth = 1.8;
    const bladeGeom = new THREE.BoxGeometry(bladeWidth, bladeHeight, depthZ * 0.9);
    bladeGeom.translate(0, tubeR + bladeHeight * 0.5, 0);
    const bladeMesh = new THREE.Mesh(bladeGeom, bladeMat);
    bladeGroup.add(bladeMesh);

    // Glowing corner neon rail along the full 38m blade
    const railGeom = new THREE.BoxGeometry(0.22, bladeHeight, 0.22);
    railGeom.translate(0, tubeR + bladeHeight * 0.5, 0);
    const rail = new THREE.Mesh(railGeom, cfg.edgeMat);
    rail.position.z = depthZ * 0.48;
    bladeGroup.add(rail);

    // Summit beacon
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.85), cfg.edgeMat);
    beacon.position.set(0, tubeR + bladeHeight + 0.6, 0);
    bladeGroup.add(beacon);

    // 3D rotation chevrons on blade face pointing in rotation direction
    const chevrons = createBeamDirectionChevrons(bladeHeight, dirKey, cfg.edgeMat, tubeR, depthZ);
    bladeGroup.add(chevrons);

    innerRotor.add(bladeGroup);
  }

  // 5. Open Sector Guidance Runway Markers on tube floor
  const openCenter = baseAngle + Math.PI * 1.5;
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: blockedCenter,
    safeCenter: openCenter,
    blockedSectors: [makeSector(blockedCenter, halfArc)],
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle: blockedCenter,
      currentAngle: blockedCenter,
    },
  };
}

// ============================================================================
// 30. VOX DUAL COUNTER ROTATOR («Двойной встречный ротор»)
// Dual concentric counter-rotating contraption:
// - Outer colossal 38m 3-blade rotor spinning CCW (inner_rotor)
// - Inner 20m 2-blade counter rotor spinning CW (counter_rotor)
// Complete with dual central hubs, outer orbit chevrons, and blade chevrons!
// ============================================================================
export function buildVoxDualCounterRotator(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();

  // Rotor 1: Outer colossal rotor
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  // Rotor 2: Counter-rotating rotor
  const counterRotor = new THREE.Group();
  counterRotor.name = 'counter_rotor';
  group.add(counterRotor);

  const tubeR = TUBE_RADIUS;
  const outerHeight = 40.0; // 40m colossal reach!
  const innerHeight = 22.0;
  const depthZ = 3.2;
  const cfg = getBiomeContrastConfig(biomeId);

  const rotSpeed = 0.52; // Primary rotor speed
  const dirKeyOuter: 'cw' | 'ccw' = 'ccw';
  const dirKeyInner: 'cw' | 'ccw' = 'cw';

  // 1. Dual central hub with CCW and CW indicators
  const hubOuter = createCentralRotationHub(dirKeyOuter, cfg.spokeColor1, 5.5, depthZ * 0.7);
  innerRotor.add(hubOuter);

  const hubInner = createCentralRotationHub(dirKeyInner, cfg.spokeColor2, 3.8, depthZ * 0.9);
  counterRotor.add(hubInner);

  // 2. Outer rotor blades (3 blades at 120° angles)
  const outerAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  outerAngles.forEach((angleOffset) => {
    const bladeGroup = new THREE.Group();
    bladeGroup.rotation.z = baseAngle + angleOffset - Math.PI / 2;

    const armGeom = new THREE.BoxGeometry(1.6, outerHeight, depthZ * 0.85);
    armGeom.translate(0, tubeR + outerHeight * 0.5, 0);
    const arm = new THREE.Mesh(armGeom, sharedMats.spokeDark);
    bladeGroup.add(arm);

    const railGeom = new THREE.BoxGeometry(0.24, outerHeight, 0.24);
    railGeom.translate(0, tubeR + outerHeight * 0.5, 0);
    const rail = new THREE.Mesh(railGeom, cfg.edgeMat);
    rail.position.z = depthZ * 0.45;
    bladeGroup.add(rail);

    const chevrons = createBeamDirectionChevrons(outerHeight, dirKeyOuter, cfg.edgeMat, tubeR, depthZ);
    bladeGroup.add(chevrons);

    innerRotor.add(bladeGroup);
  });

  // 3. Counter rotor blades (2 heavy blades at 0° and 180° offset by 60°)
  const innerAngles = [Math.PI / 3, (Math.PI * 4) / 3];
  innerAngles.forEach((angleOffset) => {
    const armGroup = new THREE.Group();
    armGroup.rotation.z = baseAngle + angleOffset - Math.PI / 2;

    const armGeom = new THREE.BoxGeometry(2.2, innerHeight, depthZ * 0.9);
    armGeom.translate(0, tubeR + innerHeight * 0.5, 0);
    const arm = new THREE.Mesh(armGeom, sharedMats.carbon);
    armGroup.add(arm);

    const edgeGeom = new THREE.BoxGeometry(0.28, innerHeight, 0.28);
    edgeGeom.translate(0, tubeR + innerHeight * 0.5, 0);
    const edge = new THREE.Mesh(edgeGeom, sharedMats.neonRed);
    edge.position.z = depthZ * 0.48;
    armGroup.add(edge);

    const chevrons = createBeamDirectionChevrons(innerHeight, dirKeyInner, sharedMats.neonRed, tubeR, depthZ);
    armGroup.add(chevrons);

    counterRotor.add(armGroup);
  });

  // 4. Outer arc warning chevrons
  const outerArc = createOuterArcRotationArrows(tubeR + outerHeight, 0, Math.PI * 2, dirKeyOuter, cfg.edgeMat, depthZ);
  innerRotor.add(outerArc);

  const blockedCenter = baseAngle;
  const halfArc = 0.32;

  return {
    group,
    depthZ,
    primaryAngle: blockedCenter,
    safeCenter: normalizeAngle(baseAngle + Math.PI),
    blockedSectors: [makeSector(blockedCenter, halfArc)],
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle: blockedCenter,
      currentAngle: blockedCenter,
    },
  };
}

// ============================================================================
// 31. VOX HELIX CORKSCREW («Воксельный винтовой штопор»)
// A magnificent 4-stage corkscrewing helical gate: 4 sequential colossal 38m
// voxel portal archways staggered along 64m of tube length, each stepping by
// 35° to create a thrilling roller-coaster bank trajectory with illuminated
// spiral chevrons and reward prisms nestled inside the helix curve!
// ============================================================================
export function buildVoxHelixCorkscrew(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const masterGroup = new THREE.Group();
  const numStages = 4;
  const stepZ = 16.0;
  const depthZ = 3.2;
  const tubeR = TUBE_RADIUS;
  const archHeight = 40.0; // 40m colossal height!
  const stepAngle = 0.58; // ~33 degrees per stage spiral progression
  const cfg = getBiomeContrastConfig(biomeId);

  const chainedItems: ChainedObstacleItem[] = [];

  for (let i = 0; i < numStages; i++) {
    const offsetZ = i * stepZ;
    const stageAngle = normalizeAngle(baseAngle + i * stepAngle);
    const stageGroup = new THREE.Group();

    // Towering 38m portal archway
    const archSpan = Math.PI * 0.65; // ~117° arch
    const halfArc = archSpan * 0.44;
    const startA = stageAngle - archSpan * 0.5;

    // Outer arch curve
    const segs = 18;
    const curvePoints: THREE.Vector3[] = [];
    for (let s = 0; s <= segs; s++) {
      const a = startA + (s / segs) * archSpan;
      curvePoints.push(new THREE.Vector3(Math.cos(a) * (tubeR + archHeight), Math.sin(a) * (tubeR + archHeight), 0));
    }
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const archTubeGeom = new THREE.TubeGeometry(curve, segs, 0.55, 8, false);
    const archTube = new THREE.Mesh(archTubeGeom, sharedMats.carbon);
    stageGroup.add(archTube);

    // Glowing neon spine
    const spineMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.2, 6, false), cfg.edgeMat);
    spineMesh.position.z = depthZ * 0.48;
    stageGroup.add(spineMesh);

    // Twin base monolith pillars grounding the archway on tube surface
    [-archSpan * 0.5, archSpan * 0.5].forEach((aOffset) => {
      const pylonGroup = new THREE.Group();
      const pAngle = stageAngle + aOffset;
      pylonGroup.rotation.z = pAngle - Math.PI / 2;

      const pylonGeom = new THREE.BoxGeometry(2.2, archHeight, depthZ * 0.9);
      pylonGeom.translate(0, tubeR + archHeight * 0.5, 0);
      const pylon = new THREE.Mesh(pylonGeom, sharedMats.spokeDark);
      pylonGroup.add(pylon);

      // Inward-pointing directional chevrons
      const chevronDir: 'cw' | 'ccw' = aOffset < 0 ? 'cw' : 'ccw';
      const chevrons = createBeamDirectionChevrons(archHeight, chevronDir, cfg.edgeMat, tubeR, depthZ);
      pylonGroup.add(chevrons);

      stageGroup.add(pylonGroup);
    });

    // Safe clearance runway markers on open side
    const openCenter = normalizeAngle(stageAngle + Math.PI);
    addRunwayClearanceMarkers(stageGroup, tubeR, openCenter, depthZ);

    chainedItems.push({
      offsetZ,
      type: 'vox_helix_corkscrew',
      angle: stageAngle,
      result: {
        group: stageGroup,
        depthZ,
        primaryAngle: stageAngle,
        safeCenter: openCenter,
        blockedSectors: [makeSector(stageAngle, halfArc)],
      },
    });

    // Reward prism placed at the apex of the open helical sweet-spot
    if (i < numStages - 1) {
      chainedItems.push({
        offsetZ: offsetZ + stepZ * 0.5,
        type: 'energy_prism',
        angle: openCenter,
        result: buildEnergyPrism(openCenter),
      });
    }
  }

  const totalSpanZ = (numStages - 1) * stepZ + depthZ;

  return {
    group: masterGroup,
    depthZ: totalSpanZ,
    primaryAngle: baseAngle,
    safeCenter: normalizeAngle(baseAngle + Math.PI),
    blockedSectors: chainedItems[0].result.blockedSectors,
    chainedItems,
    totalSpanZ,
  };
}

// ============================================================================
// 32. VOX PINWHEEL CROSS («Воксельный 4-лучевой крестообразный ротор»)
// Matches classic Voxotron pinwheel rotor: 4 towering 40m perpendicular
// voxel blades spinning around the tube with central rotation hub, outer orbit
// chevrons, blade-face chevrons, and luminous summit beacons.
// Leaves 4 generous 68° corridors for the player to slip through!
// ============================================================================
export function buildVoxPinwheelCross(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const innerRotor = new THREE.Group();
  innerRotor.name = 'inner_rotor';
  group.add(innerRotor);

  const tubeR = TUBE_RADIUS;
  const armHeight = 40.0; // 40m colossal height!
  const depthZ = 3.2;
  const armWidth = 2.0;
  const cfg = getBiomeContrastConfig(biomeId);

  // Dynamic rotation speed and direction
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.50 + Math.random() * 0.30);
  const dirKey: 'cw' | 'ccw' = rotSpeed < 0 ? 'cw' : 'ccw';

  // 1. Central Illuminated Rotating Hub with bold curved direction arrows
  const centralHub = createCentralRotationHub(dirKey, cfg.spokeColor1, 5.5, depthZ * 0.7);
  innerRotor.add(centralHub);

  // 2. Duplicated outer perimeter rotation chevrons along full orbit
  const outerArcArrows = createOuterArcRotationArrows(tubeR + armHeight, 0, Math.PI * 2, dirKey, cfg.edgeMat, depthZ);
  innerRotor.add(outerArcArrows);

  const stripesTex = getVoxelStripesTexture(cfg.spokeColor1, cfg.spokeColor2);
  const armMat = new THREE.MeshStandardMaterial({
    map: stripesTex,
    emissiveMap: stripesTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.3,
  });

  const armOffsets = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
  const armHalfArc = 0.14; // Narrow collision arc (~16°) per arm
  const blockedSectors: BlockedSectorArc[] = [];

  for (const offset of armOffsets) {
    const armAngle = baseAngle + offset;
    const armGroup = new THREE.Group();
    armGroup.rotation.z = armAngle - Math.PI / 2;

    // Colossal 40m arm body
    const armGeom = new THREE.BoxGeometry(armWidth, armHeight, depthZ * 0.85);
    const armMesh = new THREE.Mesh(armGeom, armMat);
    armMesh.position.y = tubeR + armHeight * 0.5;
    armGroup.add(armMesh);

    // High-contrast neon edge rails along 4 corners
    const railGeom = new THREE.BoxGeometry(0.18, armHeight, 0.18);
    [-armWidth * 0.48, armWidth * 0.48].forEach((rx) => {
      [-depthZ * 0.4, depthZ * 0.4].forEach((rz) => {
        const rail = new THREE.Mesh(railGeom, cfg.edgeMat);
        rail.position.set(rx, tubeR + armHeight * 0.5, rz);
        armGroup.add(rail);
      });
    });

    // 3D rotation chevrons on arm face
    const chevrons = createBeamDirectionChevrons(armHeight, dirKey, cfg.edgeMat, tubeR, depthZ);
    armGroup.add(chevrons);

    // Tip warning beacon at 40m summit
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.85), cfg.beaconMat);
    beacon.position.y = tubeR + armHeight + 0.8;
    armGroup.add(beacon);

    // Surface hazard footprint pad
    const groundFootprint = new THREE.Mesh(new THREE.BoxGeometry(armWidth * 1.2, 0.16, depthZ * 0.95), cfg.beaconMat);
    groundFootprint.position.y = tubeR + 0.05;
    armGroup.add(groundFootprint);

    innerRotor.add(armGroup);
    blockedSectors.push(makeSector(normalizeAngle(armAngle), armHalfArc));
  }

  // Safe open center halfway between arms
  const safeCenter = normalizeAngle(baseAngle + Math.PI * 0.25);
  addRunwayClearanceMarkers(group, tubeR, safeCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    safeCenter,
    blockedSectors,
    movement: {
      type: 'rotate',
      speed: rotSpeed,
      baseAngle,
      currentAngle: baseAngle,
    },
  };
}

// ============================================================================
// 33. VOX PISTON PRESS («Воксельный гидравлический пресс / Молот»)
// Voxotron-style mechanical stamper: A colossal 40m overhead portal gantry
// with twin vertical guide pylons and an oscillating voxel crushing hammer
// that stomps rhythmically across the danger sector!
// ============================================================================
export function buildVoxPistonPress(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const gantryHeight = 40.0; // 40m colossal structure!
  const depthZ = 3.6;
  const cfg = getBiomeContrastConfig(biomeId);

  // Twin support guide columns straddling the sector
  const spanArc = 0.82; // ~47° total frame span
  [-spanArc * 0.5, spanArc * 0.5].forEach((offsetA) => {
    const colAngle = baseAngle + offsetA;
    const colGroup = new THREE.Group();
    colGroup.rotation.z = colAngle - Math.PI / 2;

    const colGeom = new THREE.BoxGeometry(2.0, gantryHeight, depthZ * 0.9);
    colGeom.translate(0, tubeR + gantryHeight * 0.5, 0);
    const col = new THREE.Mesh(colGeom, sharedMats.spokeDark);
    colGroup.add(col);

    // Neon edge rails on guide columns
    const railGeom = new THREE.BoxGeometry(0.2, gantryHeight, 0.2);
    railGeom.translate(0, tubeR + gantryHeight * 0.5, 0);
    const rail = new THREE.Mesh(railGeom, cfg.edgeMat);
    rail.position.z = depthZ * 0.46;
    colGroup.add(rail);

    group.add(colGroup);
  });

  // Colossal overhead arch header connecting at 40m summit
  const headerGeom = new THREE.CylinderGeometry(tubeR + gantryHeight + 0.4, tubeR + gantryHeight + 0.4, depthZ * 0.95, 16, 1, true, baseAngle - spanArc * 0.55, spanArc * 1.1);
  headerGeom.rotateX(Math.PI / 2);
  const headerMesh = new THREE.Mesh(headerGeom, sharedMats.carbon);
  group.add(headerMesh);

  // Oscillating hydraulic piston hammer head
  const hammerGroup = new THREE.Group();
  hammerGroup.name = 'piston_head';
  hammerGroup.rotation.z = baseAngle - Math.PI / 2;

  const hammerWidth = 3.2;
  const hammerHeight = gantryHeight - 1.0;
  const stripesTex = getVoxelStripesTexture(cfg.spokeColor1, cfg.spokeColor2);
  const hammerMat = new THREE.MeshStandardMaterial({
    map: stripesTex,
    emissiveMap: stripesTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.92,
    roughness: 0.25,
    metalness: 0.3,
  });

  const hammerMesh = new THREE.Mesh(new THREE.BoxGeometry(hammerWidth, hammerHeight, depthZ * 0.92), hammerMat);
  hammerMesh.position.y = tubeR + hammerHeight * 0.5;
  hammerGroup.add(hammerMesh);

  // Apex beacon on hammer head
  const topBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.9), cfg.beaconMat);
  topBeacon.position.y = tubeR + hammerHeight + 0.8;
  hammerGroup.add(topBeacon);

  // High-intensity warning chevrons pointing downward to impact point
  [-1.0, 0, 1.0].forEach((hx) => {
    const chevronGeom = new THREE.ConeGeometry(0.35, 1.2, 4);
    chevronGeom.rotateZ(Math.PI);
    const chevron = new THREE.Mesh(chevronGeom, cfg.beaconMat);
    chevron.position.set(hx, tubeR + 2.5, depthZ * 0.48);
    hammerGroup.add(chevron);
  });

  // Track surface anvil impact pad
  const anvilGeom = new THREE.BoxGeometry(hammerWidth * 1.25, 0.2, depthZ);
  const anvil = new THREE.Mesh(anvilGeom, cfg.beaconMat);
  anvil.position.y = tubeR + 0.08;
  hammerGroup.add(anvil);

  group.add(hammerGroup);

  // Safe runway clearance markers on the open opposite side
  const openCenter = normalizeAngle(baseAngle + Math.PI);
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  // Sweep oscillation movement
  const sweepAmp = 0.35;
  const sweepSpeed = 1.8;

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    safeCenter: openCenter,
    blockedSectors: [makeSector(baseAngle, 0.32)],
    movement: {
      type: 'sweep',
      speed: sweepSpeed,
      baseAngle,
      currentAngle: baseAngle,
      amplitude: sweepAmp,
    },
  };
}

// ============================================================================
// 34. VOX STEPPED CASCADE («Воксельный каскадный эшелон»)
// 3 sequential towering 40m voxel monoliths staggered along Z (20m spacing),
// each shifting around the tube by 42° to create an exhilarating winding
// slalom cascade with floor chevrons and reward prisms!
// ============================================================================
export function buildVoxSteppedCascade(baseAngle: number, biomeId?: string): CreatedObstacleResult {
  const masterGroup = new THREE.Group();
  const numSteps = 3;
  const stepZ = 20.0;
  const depthZ = 3.2;
  const tubeR = TUBE_RADIUS;
  const monolithHeight = 40.0; // 40m colossal height!
  const angleStep = 0.72; // ~41 degrees per step
  const cfg = getBiomeContrastConfig(biomeId);

  const chainedItems: ChainedObstacleItem[] = [];

  for (let i = 0; i < numSteps; i++) {
    const offsetZ = i * stepZ;
    // Slalom left/right or cascading spiral progression
    const stepAngle = normalizeAngle(baseAngle + (i - 1) * angleStep);
    const stepGroup = new THREE.Group();
    stepGroup.rotation.z = stepAngle - Math.PI / 2;

    const monolithWidth = 3.4;
    const stripesTex = getVoxelStripesTexture(cfg.spokeColor1, cfg.spokeColor2);
    const monoMat = new THREE.MeshStandardMaterial({
      map: stripesTex,
      emissiveMap: stripesTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.3,
    });

    // 40m Colossal stepped monolith body
    const monoGeom = new THREE.BoxGeometry(monolithWidth, monolithHeight, depthZ * 0.88);
    monoGeom.translate(0, tubeR + monolithHeight * 0.5, 0);
    const mono = new THREE.Mesh(monoGeom, monoMat);
    stepGroup.add(mono);

    // Glowing corner neon rails
    const railGeom = new THREE.BoxGeometry(0.22, monolithHeight, 0.22);
    railGeom.translate(0, tubeR + monolithHeight * 0.5, 0);
    [-monolithWidth * 0.48, monolithWidth * 0.48].forEach((rx) => {
      const rail = new THREE.Mesh(railGeom, cfg.edgeMat);
      rail.position.set(rx, 0, depthZ * 0.46);
      stepGroup.add(rail);
    });

    // Face chevrons pointing toward the open gap
    const chevronDir: 'cw' | 'ccw' = i % 2 === 0 ? 'cw' : 'ccw';
    const chevrons = createBeamDirectionChevrons(monolithHeight, chevronDir, cfg.edgeMat, tubeR, depthZ);
    stepGroup.add(chevrons);

    // Summit warning beacon at 40m
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.9), cfg.beaconMat);
    beacon.position.set(0, tubeR + monolithHeight + 0.8, 0);
    stepGroup.add(beacon);

    // Surface hazard pad
    const groundPad = new THREE.Mesh(new THREE.BoxGeometry(monolithWidth * 1.3, 0.18, depthZ), cfg.beaconMat);
    groundPad.position.set(0, tubeR + 0.08, 0);
    stepGroup.add(groundPad);

    // Runway guidance marker on the safe open side
    const openCenter = normalizeAngle(stepAngle + Math.PI);
    addRunwayClearanceMarkers(stepGroup, tubeR, openCenter, depthZ);

    chainedItems.push({
      offsetZ,
      type: 'vox_stepped_cascade',
      angle: stepAngle,
      result: {
        group: stepGroup,
        depthZ,
        primaryAngle: stepAngle,
        safeCenter: openCenter,
        blockedSectors: [makeSector(stepAngle, 0.34)],
      },
    });

    // Reward prism in the winding chicane between steps
    if (i < numSteps - 1) {
      const rewardA = normalizeAngle(baseAngle + (i - 0.5) * angleStep + Math.PI);
      chainedItems.push({
        offsetZ: offsetZ + stepZ * 0.5,
        type: 'energy_prism',
        angle: rewardA,
        result: buildEnergyPrism(rewardA),
      });
    }
  }

  const totalSpanZ = (numSteps - 1) * stepZ + depthZ;

  return {
    group: masterGroup,
    depthZ: totalSpanZ,
    primaryAngle: baseAngle,
    safeCenter: normalizeAngle(baseAngle + Math.PI),
    blockedSectors: chainedItems[0].result.blockedSectors,
    chainedItems,
    totalSpanZ,
  };
}

export function createCyberObstacleGroup(type: string, angle: number, z: number = 0, biomeId?: string): CreatedObstacleResult {
  switch (type) {
    case 'vox_pinwheel_cross':
      return buildVoxPinwheelCross(angle, biomeId);
    case 'vox_piston_press':
      return buildVoxPistonPress(angle, biomeId);
    case 'vox_stepped_cascade':
      return buildVoxSteppedCascade(angle, biomeId);
    case 'vox_aperture_iris':
      return buildVoxApertureIris(angle, biomeId);
    case 'vox_dual_counter_rotator':
      return buildVoxDualCounterRotator(angle, biomeId);
    case 'vox_helix_corkscrew':
      return buildVoxHelixCorkscrew(angle, biomeId);
    case 'vox_slalom_pair':
      return buildVoxSlalomPair(angle, biomeId);
    case 'vox_slit_cascade':
      return buildVoxSlitCascade(angle, biomeId);
    case 'lava_puddle_trap':
      return buildLavaPuddleTrap(angle);
    case 'ice_slick_patch':
      return buildIceSlickPatch(angle);
    case 'vox_spiral_pillar_tunnel':
      return buildVoxotronPillarSpiralTunnel(angle, z, undefined, biomeId);
    case 'colossal_rotating_spokes':
      return buildColossalRotatingSpokeBeams(angle, biomeId);
    case 'colossal_voxel_fan':
      return buildColossalVoxelFanSector(angle, biomeId);
    case 'vox_archway_tunnel':
      return buildVoxelArchwayTunnel(angle, biomeId);
    case 'vox_longitudinal_tunnel':
      return buildVoxotronPillarSpiralTunnel(angle, z, 'cyan', biomeId);
    case 'vox_spiral_conduit':
      return buildVoxotronPillarSpiralTunnel(angle, z, 'pink', biomeId);
    case 'spiral_corkscrew_tunnel':
      return buildSpiralCorkscrewTunnel(angle, z);
    case 'compression_speed_tunnel':
      return buildCompressionSpeedTunnel(angle, z);
    case 'slalom_chicane':
      return buildSlalomChicane(angle, biomeId);
    case 'spoke_wheel_gate':
      return buildSpokeWheelGate(angle, biomeId);
    case 'half_disc_barrier':
      return buildHalfDiscBarrier(angle, biomeId);
    case 'spiral_voxel_fan':
      return buildSpiralVoxelFan(angle, biomeId);
    case 'titan_monolith':
      return buildTitanMonolith(angle, biomeId);
    case 'laser_quad_gate':
      return buildLaserQuadGate(angle, biomeId);
    case 'magma_grinder':
      return buildMagmaGrinder(angle, biomeId);
    case 'inferno_pillar':
      return buildInfernoPillar(angle, biomeId);
    case 'plasma_firewall':
      return buildPlasmaFirewall(angle, biomeId);
    case 'volcanic_arch_eruption':
      return buildVolcanicArchEruption(angle, biomeId);
    case 'cryo_pendulum':
      return buildCryoPendulum(angle, biomeId);
    case 'glacier_spikes':
      return buildGlacierSpikes(angle, biomeId);
    case 'frost_shard_gate':
      return buildFrostShardGate(angle, biomeId);
    case 'cryo_blizzard_vortex':
      return buildCryoBlizzardVortex(angle, biomeId);
    case 'quantum_rotator':
      return buildQuantumRotator(angle, biomeId);
    case 'void_singularity_rift':
      return buildVoidSingularityRift(angle, biomeId);
    case 'tachyon_warp_gate':
      return buildTachyonWarpGate(angle, biomeId);
    case 'phantom_mine':
      return buildPhantomMine(angle, biomeId);
    case 'magma_mine':
      return buildMagmaMine(angle, biomeId);
    case 'cryo_mine':
      return buildCryoMine(angle, biomeId);
    case 'quantum_mine':
      return buildQuantumMine(angle, biomeId);
    case 'boost_pad':
      return buildBoostPad(angle);
    case 'energy_prism':
      return buildEnergyPrism(angle);
    case 'hyper_battery':
      return buildHyperBattery(angle);
    default:
      return buildEnergyPrism(angle);
  }
}

