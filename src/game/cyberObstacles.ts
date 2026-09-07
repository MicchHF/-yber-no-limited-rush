import * as THREE from 'three';
import { CyberObstacleType, ObstacleData, ObstacleMovement } from '../types';

// ============================================================================
// SINGLETON TEXTURES (Pre-rendered on high-res canvas, zero GC allocations)
// ============================================================================

let cachedHazardTex: THREE.CanvasTexture | null = null;
let cachedMonolithTex: THREE.CanvasTexture | null = null;
let cachedBoostTex: THREE.CanvasTexture | null = null;
let cachedMagmaTex: THREE.CanvasTexture | null = null;
let cachedIceTex: THREE.CanvasTexture | null = null;

export function getHazardPlateTexture(themeColor: string = '#ff0055'): THREE.CanvasTexture {
  if (cachedHazardTex) return cachedHazardTex;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep cyber navy backing (never murky swamp green)
  ctx.fillStyle = '#0a1020';
  ctx.fillRect(0, 0, 512, 512);

  // Outer hyper-bright neon boundary
  ctx.strokeStyle = '#fcee0a';
  ctx.lineWidth = 20;
  ctx.strokeRect(10, 10, 492, 492);

  // Bold diagonal high-contrast warning stripes in blazing neon orange/red
  ctx.fillStyle = '#ff6600';
  for (let i = -512; i < 1024; i += 72) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 38, 0);
    ctx.lineTo(i - 78, 512);
    ctx.lineTo(i - 116, 512);
    ctx.closePath();
    ctx.fill();
  }

  return canvasToTex(canvas);
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

function getMonolithTexture(): THREE.CanvasTexture {
  if (cachedMonolithTex) return cachedMonolithTex;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // High-contrast cyber-tech body
  ctx.fillStyle = '#0c1428';
  ctx.fillRect(0, 0, 256, 512);

  // Glowing boundary in laser crimson
  ctx.strokeStyle = '#ff0055';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 240, 496);

  // High-visibility hazard chevrons in neon yellow
  ctx.fillStyle = '#fcee0a';
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
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 218, 200, 76);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 26px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BARRIER', 128, 256);

  cachedMonolithTex = new THREE.CanvasTexture(canvas);
  return cachedMonolithTex;
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

// Reusable Materials with high-visibility cyberpunk glow
const sharedMats = {
  carbon: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: new THREE.Color(0x0f1d32),
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.6,
  }),
  spokeDark: new THREE.MeshStandardMaterial({
    color: 0x253347,
    emissive: new THREE.Color(0x13253d),
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.55,
  }),
  neonOrange: new THREE.MeshBasicMaterial({ color: 0xff7700, transparent: true, opacity: 0.98 }),
  neonYellow: new THREE.MeshBasicMaterial({ color: 0xfcee0a, transparent: true, opacity: 0.98 }),
  neonRed: new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.98 }),
  neonCyan: new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.98 }),
  // Ultra-bright electric laser green and vibrant lime (super high visibility)
  neonGreen: new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 1.0 }),
  neonLime: new THREE.MeshBasicMaterial({ color: 0x76ff03, transparent: true, opacity: 1.0 }),
  neonWhite: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 }),
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
    color: 0x111827,
    roughness: 0.3,
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
};

export const TUBE_RADIUS = 6.5;

export interface BlockedSectorArc {
  centerAngle: number;
  halfArc: number;
  // Legacy compatibility
  minAngle: number;
  maxAngle: number;
}

export interface CreatedObstacleResult {
  group: THREE.Group;
  depthZ: number;
  blockedSectors: BlockedSectorArc[];
  primaryAngle: number;
  safeCenter?: number;
  isPickup?: boolean;
  movement?: ObstacleMovement;
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

// ============================================================================
// OBSTACLE 1: GIANT SPOKE WHEEL GATE (From Screenshots 3 & 6)
// A 27-meter outer neon ring encircling the tube with spokes ONLY in the blocked half!
// The open 180° corridor is completely clean and marked with green runway lights!
// ============================================================================
export function buildSpokeWheelGate(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const outerR = 13.2;
  const depthZ = 2.4;

  // 1. Outer Heavy Neon Perimeter Ring framing the entire view
  const outerRingGeom = new THREE.TorusGeometry(outerR, 0.32, 8, 48);
  const outerRing = new THREE.Mesh(outerRingGeom, sharedMats.neonYellow);
  group.add(outerRing);

  // 2. Inner Rim hugging the outside of the tube
  const innerRimGeom = new THREE.TorusGeometry(tubeR + 0.1, 0.18, 8, 48);
  const innerRim = new THREE.Mesh(innerRimGeom, sharedMats.carbon);
  group.add(innerRim);

  // Inner Rim Neon Guide Trim
  const innerRimTrim = new THREE.Mesh(
    new THREE.TorusGeometry(tubeR + 0.12, 0.05, 8, 48),
    sharedMats.neonCyan
  );
  group.add(innerRimTrim);

  // 3. Blocked Solid Sector: Exactly 180° (from baseAngle to baseAngle + PI)
  // Collision halfArc is tightened to ~68.4° (Math.PI * 0.38) giving a generous ~21.6° safe boundary margin
  const blockedCenter = baseAngle + Math.PI * 0.5;
  const halfArc = Math.PI * 0.38; // ~68.4 degrees on each side of center

  const sectorShape = new THREE.Shape();
  const segs = 20;
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
    bevelSize: 0.15,
    bevelThickness: 0.15,
  });
  sectorGeom.translate(0, 0, -depthZ * 0.5);

  const hazardTex = getHazardPlateTexture('#ff7700');
  const sectorMat = new THREE.MeshStandardMaterial({
    map: hazardTex,
    emissiveMap: hazardTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.95,
    roughness: 0.2,
    metalness: 0.3,
  });
  const sectorMesh = new THREE.Mesh(sectorGeom, sectorMat);
  group.add(sectorMesh);

  // Glowing Outer Neon Arch Outline across the blocked sector
  const archCurvePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = baseAngle + (i / segs) * Math.PI;
    archCurvePoints.push(new THREE.Vector3(Math.cos(a) * (outerR + 0.12), Math.sin(a) * (outerR + 0.12), depthZ * 0.52));
  }
  const archCurve = new THREE.CatmullRomCurve3(archCurvePoints);
  const archRail = new THREE.Mesh(new THREE.TubeGeometry(archCurve, segs, 0.16, 6, false), sharedMats.neonOrange);
  group.add(archRail);

  // 4. Radial Spokes: ONLY at the boundaries (baseAngle, baseAngle + PI) and middle of blocked sector!
  // ZERO spokes in the open half!
  [baseAngle, blockedCenter, baseAngle + Math.PI].forEach((spokeAngle) => {
    const spokeLen = outerR - tubeR;
    const spokeGeom = new THREE.CylinderGeometry(0.24, 0.24, spokeLen, 8);
    spokeGeom.translate(0, tubeR + spokeLen * 0.5, 0);

    const spoke = new THREE.Mesh(spokeGeom, sharedMats.spokeDark);
    spoke.rotation.z = spokeAngle - Math.PI / 2;
    group.add(spoke);

    const spokeRailGeom = new THREE.CylinderGeometry(0.08, 0.08, spokeLen, 6);
    spokeRailGeom.translate(0, tubeR + spokeLen * 0.5, 0);
    const spokeRail = new THREE.Mesh(spokeRailGeom, sharedMats.neonYellow);
    spokeRail.rotation.z = spokeAngle - Math.PI / 2;
    spokeRail.position.z = depthZ * 0.52;
    group.add(spokeRail);
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
  };
}

// ============================================================================
// OBSTACLE 2: HALF-DISC SECTOR BARRIER (From Screenshots 3 & 4)
// A massive 160° curved barricade with outer neon arch and warning plates!
// Leaves 200° wide open flight clearance!
// ============================================================================
export function buildHalfDiscBarrier(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const outerR = 12.8;
  const depthZ = 2.6;
  const arcSpan = Math.PI * 0.85; // ~153 degrees (leaving 207 degrees open)
  // Collision halfArc is tightened to ~57.6° (Math.PI * 0.32) so wingtips provide clean grazing and no false hits
  const halfArc = Math.PI * 0.32;
  const visualHalfArc = arcSpan * 0.5;
  const startA = baseAngle - visualHalfArc;

  const shape = new THREE.Shape();
  const segs = 24;
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
    bevelSize: 0.18,
    bevelThickness: 0.18,
    bevelSegments: 2,
  });
  geom.translate(0, 0, -depthZ * 0.5);

  const hazardTex = getHazardPlateTexture('#ff0044');
  const mat = new THREE.MeshStandardMaterial({
    map: hazardTex,
    emissiveMap: hazardTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.95,
    roughness: 0.2,
    metalness: 0.3,
  });
  const mesh = new THREE.Mesh(geom, mat);
  group.add(mesh);

  // Glowing Neon Outer Arch Edge (Front face)
  const archCurvePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * arcSpan;
    archCurvePoints.push(new THREE.Vector3(Math.cos(a) * (outerR + 0.15), Math.sin(a) * (outerR + 0.15), depthZ * 0.52));
  }
  const archCurve = new THREE.CatmullRomCurve3(archCurvePoints);
  const archRailGeom = new THREE.TubeGeometry(archCurve, segs, 0.22, 6, false);
  const archRail = new THREE.Mesh(archRailGeom, sharedMats.neonYellow);
  group.add(archRail);

  // Inner Surface Contact Neon Rail
  const innerArchPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * arcSpan;
    innerArchPoints.push(new THREE.Vector3(Math.cos(a) * (tubeR + 0.15), Math.sin(a) * (tubeR + 0.15), depthZ * 0.52));
  }
  const innerArchCurve = new THREE.CatmullRomCurve3(innerArchPoints);
  const innerRail = new THREE.Mesh(new THREE.TubeGeometry(innerArchCurve, segs, 0.12, 6, false), sharedMats.neonOrange);
  group.add(innerRail);

  // Strobe beacons at outer left and right tips
  const pL = archCurvePoints[0];
  const pR = archCurvePoints[archCurvePoints.length - 1];
  const beaconGeom = new THREE.SphereGeometry(0.5, 8, 8);
  const b1 = new THREE.Mesh(beaconGeom, sharedMats.neonRed);
  b1.position.copy(pL);
  const b2 = new THREE.Mesh(beaconGeom, sharedMats.neonRed);
  b2.position.copy(pR);
  group.add(b1, b2);

  // Guidance runway markers on open side
  const openCenter = baseAngle + Math.PI;
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: baseAngle,
    safeCenter: openCenter,
    blockedSectors: [makeSector(baseAngle, halfArc)],
  };
}

// ============================================================================
// OBSTACLE 3: VOXEL STEPPER GATE (From Screenshots 2 & 5)
// Crisp chevron cascade of voxel pylons covering ~75° arc with 285° clear space!
// Compact depth so collisions match visual location with 100% precision!
// ============================================================================
export function buildSpiralVoxelFan(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const count = 7;
  const stepAngle = 0.16; // ~9.1 degrees per step
  const totalArc = (count - 1) * stepAngle; // ~55 degrees
  const halfArc = totalArc * 0.5 - 0.08;
  const blockedCenter = baseAngle;
  const depthZ = 3.2;

  const beamWidth = 1.3;
  const beamHeight = 6.4;
  const beamDepth = 1.8;

  for (let i = 0; i < count; i++) {
    const angle = (baseAngle - totalArc * 0.5) + i * stepAngle;
    const isRed = i % 2 === 0;

    const beamGeom = new THREE.BoxGeometry(beamWidth, beamHeight, beamDepth);
    beamGeom.translate(0, tubeR + beamHeight * 0.5, 0);

    const beamMesh = new THREE.Mesh(beamGeom, isRed ? sharedMats.neonRed : sharedMats.neonWhite);
    beamMesh.rotation.z = angle - Math.PI / 2;
    group.add(beamMesh);

    // Glowing hazard crown on each voxel pillar
    const capGeom = new THREE.BoxGeometry(beamWidth + 0.1, 0.28, beamDepth + 0.1);
    capGeom.translate(0, tubeR + beamHeight + 0.14, 0);
    const cap = new THREE.Mesh(capGeom, isRed ? sharedMats.neonYellow : sharedMats.neonCyan);
    cap.rotation.z = angle - Math.PI / 2;
    group.add(cap);
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
  };
}

// ============================================================================
// OBSTACLE 4: TITAN MONOLITH TOWER
// Massive carbon block covering ~44° sector with beacon & sky beam!
// 316° wide open clearance!
// ============================================================================
export function buildTitanMonolith(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const height = 13.5;
  const depthZ = 2.8;
  const angularSpan = 0.72; // ~41 degrees
  const halfArc = 0.25; // Tightened collision margin
  const startA = angle - angularSpan * 0.5;

  // Extrude curved monolith block
  const shape = new THREE.Shape();
  const segs = 10;
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
    bevelSize: 0.15,
    bevelThickness: 0.15,
  });
  geom.translate(0, 0, -depthZ * 0.5);

  const monoTex = getMonolithTexture();
  const mat = new THREE.MeshStandardMaterial({
    map: monoTex,
    emissiveMap: monoTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.95,
    roughness: 0.2,
    metalness: 0.3,
  });
  const mesh = new THREE.Mesh(geom, mat);
  group.add(mesh);

  // Glowing Neon Crest Outlines along the curved edges of the monolith
  const monolithCrestPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = startA + (i / segs) * angularSpan;
    monolithCrestPoints.push(new THREE.Vector3(Math.cos(a) * (tubeR + height + 0.1), Math.sin(a) * (tubeR + height + 0.1), depthZ * 0.52));
  }
  const crestCurve = new THREE.CatmullRomCurve3(monolithCrestPoints);
  const crestRail = new THREE.Mesh(new THREE.TubeGeometry(crestCurve, segs, 0.18, 6, false), sharedMats.neonYellow);
  group.add(crestRail);

  // Summit Aircraft Warning Beacon
  const beaconPos = new THREE.Vector3(
    Math.cos(angle) * (tubeR + height + 0.6),
    Math.sin(angle) * (tubeR + height + 0.6),
    0
  );
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), sharedMats.neonYellow);
  beacon.position.copy(beaconPos);
  group.add(beacon);

  // Vertical skyward energy pillar
  const beamGeom = new THREE.CylinderGeometry(0.25, 0.5, 30, 8);
  beamGeom.translate(0, 15, 0);
  const beam = new THREE.Mesh(beamGeom, sharedMats.skyPillar);
  beam.position.copy(beaconPos);
  beam.rotation.z = angle - Math.PI / 2;
  group.add(beam);

  // Guidance runway markers on open side
  const openCenter = angle + Math.PI;
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: angle,
    safeCenter: openCenter,
    blockedSectors: [makeSector(angle, halfArc)],
  };
}

// ============================================================================
// OBSTACLE 5: LASER QUAD GATE
// Complete gantry ring with thick laser fences across 180°!
// Extends ALL THE WAY DOWN TO THE TUBE SURFACE with unmistakable energy curtains!
// ============================================================================
export function buildLaserQuadGate(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const outerR = 13.0;
  const depthZ = 2.0;

  // Gantry perimeter ring
  const ringGeom = new THREE.TorusGeometry(outerR, 0.32, 8, 48);
  const ringMesh = new THREE.Mesh(ringGeom, sharedMats.carbon);
  group.add(ringMesh);

  // Outer ring neon accent trim
  const ringNeon = new THREE.Mesh(new THREE.TorusGeometry(outerR + 0.12, 0.08, 8, 48), sharedMats.neonYellow);
  group.add(ringNeon);

  const blockedCenter = baseAngle + Math.PI * 0.5;
  const halfArc = Math.PI * 0.38; // Tightened collision margin leaving ~21.6° safe clearance at edge pylons

  // Emitter pylons ONLY at baseAngle, blockedCenter, and baseAngle + PI
  // (ZERO pylons in the open corridor!)
  [baseAngle, blockedCenter, baseAngle + Math.PI].forEach((a) => {
    const pylonGeom = new THREE.BoxGeometry(0.7, outerR - tubeR, 0.7);
    pylonGeom.translate(0, tubeR + (outerR - tubeR) * 0.5, 0);
    const pylon = new THREE.Mesh(pylonGeom, sharedMats.spokeDark);
    pylon.rotation.z = a - Math.PI / 2;
    group.add(pylon);

    // Glowing emitter strip
    const stripGeom = new THREE.BoxGeometry(0.12, outerR - tubeR, 0.72);
    stripGeom.translate(0, tubeR + (outerR - tubeR) * 0.5, 0);
    const strip = new THREE.Mesh(stripGeom, sharedMats.neonYellow);
    strip.rotation.z = a - Math.PI / 2;
    group.add(strip);
  });

  // Solid ground hazard curb across the blocked arc right on the tube surface
  const curbShape = new THREE.Shape();
  const curbSegs = 24;
  for (let i = 0; i <= curbSegs; i++) {
    const a = baseAngle + (i / curbSegs) * Math.PI;
    const x = Math.cos(a) * (tubeR + 0.35);
    const y = Math.sin(a) * (tubeR + 0.35);
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
  group.add(curbMesh);

  // Glowing neon strip on top of the curb
  const curbTrimPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= curbSegs; i++) {
    const a = baseAngle + (i / curbSegs) * Math.PI;
    curbTrimPoints.push(new THREE.Vector3(Math.cos(a) * (tubeR + 0.38), Math.sin(a) * (tubeR + 0.38), depthZ * 0.52));
  }
  const curbTrimCurve = new THREE.CatmullRomCurve3(curbTrimPoints);
  const curbTrim = new THREE.Mesh(new THREE.TubeGeometry(curbTrimCurve, curbSegs, 0.1, 6, false), sharedMats.neonOrange);
  group.add(curbTrim);

  // Triple Laser Wall across blocked arc starting right at surface level (tubeR + 0.25)!
  const startA = baseAngle;
  const segs = 20;
  [tubeR + 0.25, tubeR + 1.8, tubeR + 3.8].forEach((rad) => {
    const laserPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= segs; i++) {
      const a = startA + (i / segs) * Math.PI;
      laserPoints.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, 0));
    }
    const laserCurve = new THREE.CatmullRomCurve3(laserPoints);
    const laserTubeGeom = new THREE.TubeGeometry(laserCurve, segs, 0.24, 6, false);
    const laserBeam = new THREE.Mesh(laserTubeGeom, sharedMats.laserBeam);
    group.add(laserBeam);
  });

  // Translucent Crimson Energy Field across the blocked sector
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
    color: 0xff0055,
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const fieldMesh = new THREE.Mesh(fieldGeom, fieldMat);
  group.add(fieldMesh);

  // Guidance runway markers on open side
  const openCenter = baseAngle + Math.PI * 1.5;
  addRunwayClearanceMarkers(group, tubeR, openCenter, depthZ);

  return {
    group,
    depthZ,
    primaryAngle: blockedCenter,
    safeCenter: openCenter,
    blockedSectors: [makeSector(blockedCenter, halfArc)],
  };
}

// ============================================================================
// PICKUP 1: BOOST PAD (Floor speed boost strip with animated chevrons)
// ============================================================================
export function buildBoostPad(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
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
  const leftRail = new THREE.Mesh(railGeom, sharedMats.neonYellow);
  leftRail.position.set(Math.cos(angle - 0.22) * (tubeR + 0.1), Math.sin(angle - 0.22) * (tubeR + 0.1), 0);
  leftRail.rotation.z = angle - Math.PI / 2;

  const rightRail = new THREE.Mesh(railGeom, sharedMats.neonYellow);
  rightRail.position.set(Math.cos(angle + 0.22) * (tubeR + 0.1), Math.sin(angle + 0.22) * (tubeR + 0.1), 0);
  rightRail.rotation.z = angle - Math.PI / 2;

  group.add(leftRail, rightRail);

  const arcSpan = width / tubeR; // ~0.43 radians
  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
    isPickup: true,
  };
}

// ============================================================================
// PICKUP 2: ENERGY PRISM (High-visibility collectible with vertical sky beacon)
// ============================================================================
export function buildEnergyPrism(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const depthZ = 2.4;

  // 1. TALL VERTICAL SKY BEACON PILLAR (Visible from 150m+ down the tube!)
  const beaconGeom = new THREE.CylinderGeometry(0.2, 0.6, 16, 8, 1, true);
  const beacon = new THREE.Mesh(beaconGeom, sharedMats.skyPillar);
  // Position cylinder so its base is at the surface and points outward away from tube center
  beacon.position.set(Math.cos(angle) * (tubeR + 8.0), Math.sin(angle) * (tubeR + 8.0), 0);
  beacon.rotation.z = angle - Math.PI / 2;
  group.add(beacon);

  // 2. Ground Projector Ring on track surface
  const groundRingGeom = new THREE.RingGeometry(0.8, 1.2, 16);
  const groundRing = new THREE.Mesh(groundRingGeom, sharedMats.neonCyan);
  groundRing.position.set(Math.cos(angle) * (tubeR + 0.06), Math.sin(angle) * (tubeR + 0.06), 0);
  groundRing.rotation.z = angle - Math.PI / 2;
  group.add(groundRing);

  // 3. Central Hovering Diamond Crystal Body
  const prismGroup = new THREE.Group();
  prismGroup.name = 'prism_body';
  prismGroup.position.set(Math.cos(angle) * (tubeR + 1.1), Math.sin(angle) * (tubeR + 1.1), 0);
  prismGroup.rotation.z = angle - Math.PI / 2;

  const prismGeom = new THREE.OctahedronGeometry(1.05, 0);
  const prism = new THREE.Mesh(prismGeom, sharedMats.neonCyan);
  prismGroup.add(prism);

  // Inner hyper-white core
  const coreGeom = new THREE.OctahedronGeometry(0.55, 0);
  const core = new THREE.Mesh(coreGeom, sharedMats.neonWhite);
  prismGroup.add(core);

  // Orbiting gyroscope torus ring
  const ringGeom = new THREE.TorusGeometry(1.5, 0.07, 8, 20);
  const ring = new THREE.Mesh(ringGeom, sharedMats.neonYellow);
  ring.rotation.x = Math.PI / 2.5;
  prismGroup.add(ring);

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
  const tubeR = 6.5;
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
export function buildMagmaGrinder(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const depthZ = 3.6;

  // Central volcanic hub
  const hubGeom = new THREE.CylinderGeometry(2.4, 2.4, depthZ * 0.8, 16);
  hubGeom.rotateX(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeom, sharedMats.carbon);
  group.add(hub);

  // Glowing magma core inside hub
  const hubCoreGeom = new THREE.CylinderGeometry(1.6, 1.6, depthZ * 0.85, 16);
  hubCoreGeom.rotateX(Math.PI / 2);
  const hubCore = new THREE.Mesh(hubCoreGeom, sharedMats.magmaCore);
  group.add(hubCore);

  // 3 Rotating Volcanic Obsidian Blades at 120° angles (2.094 rad)
  const bladeArc = 0.38; // radians width of each blade
  const bladeAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  const rotorGroup = new THREE.Group();
  rotorGroup.name = 'inner_rotor';
  // Note: -Math.PI / 2 aligns arm at local +Y to angle baseAngle (+X in cylinder frame)
  rotorGroup.rotation.z = baseAngle - Math.PI / 2;

  for (const bAngle of bladeAngles) {
    const bladeGroup = new THREE.Group();
    bladeGroup.rotation.z = bAngle;

    // Obsidian blade body
    const armGeom = new THREE.BoxGeometry(1.1, tubeR + 1.2, depthZ);
    const arm = new THREE.Mesh(armGeom, sharedMats.spokeDark);
    arm.position.y = (tubeR + 1.2) * 0.5;
    bladeGroup.add(arm);

    // Blazing incandescent teeth / cutting edge
    const edgeGeom = new THREE.BoxGeometry(0.35, tubeR + 1.4, depthZ * 0.95);
    const edge = new THREE.Mesh(edgeGeom, sharedMats.magmaCore);
    edge.position.set(0.65, (tubeR + 1.4) * 0.5, 0);
    bladeGroup.add(edge);

    // Hazard warning stripe on blade outer rim
    const rimGeom = new THREE.BoxGeometry(1.6, 0.4, depthZ);
    const rim = new THREE.Mesh(rimGeom, sharedMats.magmaGlow);
    rim.position.y = tubeR + 0.6;
    bladeGroup.add(rim);

    rotorGroup.add(bladeGroup);
  }

  group.add(rotorGroup);

  // Speed of rotation (clockwise or counter-clockwise)
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.65 + Math.random() * 0.35);

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
export function buildInfernoPillar(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const depthZ = 4.2;
  const arcSpan = 0.85; // radians

  const pillarGroup = new THREE.Group();
  // Aligns local +Y with angle (+X in cylinder frame)
  pillarGroup.rotation.z = angle - Math.PI / 2;

  // Central volcanic monolith
  const basaltGeom = new THREE.BoxGeometry(2.4, 4.2, depthZ);
  const basalt = new THREE.Mesh(basaltGeom, sharedMats.carbon);
  basalt.position.y = tubeR + 1.8;
  pillarGroup.add(basalt);

  // Erupting magma fissures on sides
  const fissureGeom = new THREE.BoxGeometry(0.4, 4.0, depthZ * 1.02);
  const leftFissure = new THREE.Mesh(fissureGeom, sharedMats.magmaCore);
  leftFissure.position.set(-1.25, tubeR + 1.8, 0);

  const rightFissure = new THREE.Mesh(fissureGeom, sharedMats.magmaCore);
  rightFissure.position.set(1.25, tubeR + 1.8, 0);

  pillarGroup.add(leftFissure, rightFissure);

  // Glowing magma crest on top
  const crestGeom = new THREE.BoxGeometry(2.6, 0.45, depthZ);
  const crest = new THREE.Mesh(crestGeom, sharedMats.magmaGlow);
  crest.position.y = tubeR + 3.8;
  pillarGroup.add(crest);

  // Glowing warning beacon on the track bed directly under pillar
  const padGeom = new THREE.BoxGeometry(2.6, 0.2, depthZ);
  const pad = new THREE.Mesh(padGeom, sharedMats.magmaGlow);
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
export function buildCryoPendulum(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const depthZ = 3.8;
  const pendulumArc = 0.55; // radians width of pendulum bob

  // Pendulum body attached to center pivot
  const pendulumGroup = new THREE.Group();

  // Ice Crystal arm extending outward
  const armGeom = new THREE.BoxGeometry(0.5, tubeR + 1.8, depthZ * 0.7);
  const arm = new THREE.Mesh(armGeom, sharedMats.spokeDark);
  arm.position.y = (tubeR + 1.8) * 0.5;
  pendulumGroup.add(arm);

  // Heavy Glacial Crystal Bob at the cylinder track
  const bobGeom = new THREE.BoxGeometry(1.8, 2.2, depthZ);
  const bob = new THREE.Mesh(bobGeom, sharedMats.cryoIce);
  bob.position.y = tubeR + 0.9;
  pendulumGroup.add(bob);

  // Glowing Frost Beacon
  const beaconGeom = new THREE.BoxGeometry(2.0, 0.4, depthZ * 1.05);
  const beacon = new THREE.Mesh(beaconGeom, sharedMats.neonCyan);
  beacon.position.y = tubeR + 0.9;
  pendulumGroup.add(beacon);

  pendulumGroup.name = 'inner_rotor';
  pendulumGroup.rotation.z = baseAngle - Math.PI / 2;
  group.add(pendulumGroup);

  const sweepSpeed = 1.6 + Math.random() * 0.6;
  const sweepAmp = 0.65; // ~37 degrees oscillation each side

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
export function buildGlacierSpikes(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const depthZ = 3.6;
  const arcSpan = 0.95;

  const clusterGroup = new THREE.Group();
  clusterGroup.rotation.z = angle - Math.PI / 2;

  // 3 jagged icy teeth
  const offsets = [-0.65, 0, 0.65];
  offsets.forEach((xOff, i) => {
    const height = 2.4 + (i === 1 ? 0.9 : 0);
    const spikeGeom = new THREE.ConeGeometry(0.65, height, 5);
    const spike = new THREE.Mesh(spikeGeom, sharedMats.cryoIce);
    spike.position.set(xOff, tubeR + height * 0.45, 0);
    spike.rotation.z = (Math.random() - 0.5) * 0.3;
    clusterGroup.add(spike);

    // Glowing ice crest
    const tipGeom = new THREE.ConeGeometry(0.3, 0.8, 5);
    const tip = new THREE.Mesh(tipGeom, sharedMats.neonCyan);
    tip.position.set(xOff, tubeR + height * 0.8, 0);
    clusterGroup.add(tip);
  });

  // Track warning base for high visibility
  const baseGeom = new THREE.BoxGeometry(2.4, 0.25, depthZ);
  const baseMesh = new THREE.Mesh(baseGeom, sharedMats.neonCyan);
  baseMesh.position.y = tubeR + 0.1;
  clusterGroup.add(baseMesh);

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
export function buildQuantumRotator(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const depthZ = 3.2;

  // Center quantum singularity hub
  const hubGeom = new THREE.SphereGeometry(1.6, 16, 12);
  const hub = new THREE.Mesh(hubGeom, sharedMats.quantumPurple);
  group.add(hub);

  // Twin opposed rotating pylons (180° apart)
  const armAngles = [0, Math.PI];
  const arcSpan = 0.45;

  const rotorGroup = new THREE.Group();
  rotorGroup.name = 'inner_rotor';
  rotorGroup.rotation.z = baseAngle - Math.PI / 2;

  for (const aAngle of armAngles) {
    const armGroup = new THREE.Group();
    armGroup.rotation.z = aAngle;

    // Carbon pylon
    const pylonGeom = new THREE.BoxGeometry(0.8, tubeR + 1.2, depthZ * 0.8);
    const pylon = new THREE.Mesh(pylonGeom, sharedMats.carbon);
    pylon.position.y = (tubeR + 1.2) * 0.5;
    armGroup.add(pylon);

    // Quantum laser beam blade
    const beamGeom = new THREE.BoxGeometry(0.25, tubeR + 1.4, depthZ);
    const beam = new THREE.Mesh(beamGeom, sharedMats.neonGreen);
    beam.position.set(0.45, (tubeR + 1.4) * 0.5, 0);
    armGroup.add(beam);

    // Outer quantum warning ring
    const capGeom = new THREE.BoxGeometry(1.4, 0.4, depthZ);
    const cap = new THREE.Mesh(capGeom, sharedMats.quantumPurple);
    cap.position.y = tubeR + 0.6;
    armGroup.add(cap);

    rotorGroup.add(armGroup);
  }

  group.add(rotorGroup);
  const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.85 + Math.random() * 0.45);

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
export function buildPhantomMine(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = 6.5;
  const depthZ = 3.8;
  const arcSpan = 0.85;

  const mineGroup = new THREE.Group();
  mineGroup.rotation.z = angle - Math.PI / 2;

  // 1. Heavy faceted stealth explosive chassis
  const bodyGeom = new THREE.CylinderGeometry(1.2, 1.8, 2.4, 6);
  bodyGeom.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeom, sharedMats.carbon);
  body.position.y = tubeR + 1.4;
  mineGroup.add(body);

  // 2. Huge glowing crimson plasma core
  const coreGeom = new THREE.SphereGeometry(1.0, 16, 16);
  const core = new THREE.Mesh(coreGeom, sharedMats.laserBeam);
  core.position.y = tubeR + 1.4;
  mineGroup.add(core);

  // 3. 4 Heavy radiating electromagnetic spikes with hazard tips
  for (let i = 0; i < 4; i++) {
    const spikeAngle = (i * Math.PI) / 2;
    const spikeGeom = new THREE.BoxGeometry(0.22, 1.9, 0.22);
    const spike = new THREE.Mesh(spikeGeom, sharedMats.neonRed);
    spike.position.set(
      Math.cos(spikeAngle) * 1.3,
      tubeR + 1.4 + Math.sin(spikeAngle) * 1.3,
      0
    );
    spike.rotation.z = spikeAngle;
    mineGroup.add(spike);
  }

  // 4. Rotating holographic hazard warning ring around the bomb
  const holoRingGeom = new THREE.TorusGeometry(2.1, 0.08, 6, 28);
  const holoRing = new THREE.Mesh(holoRingGeom, sharedMats.neonRed);
  holoRing.position.y = tubeR + 1.4;
  holoRing.rotation.x = Math.PI / 3;
  mineGroup.add(holoRing);

  // 5. Skyward vertical laser warning beacon (shoots 8m up into cylinder air)
  const beaconGeom = new THREE.CylinderGeometry(0.12, 0.12, 8.0, 8);
  const beacon = new THREE.Mesh(beaconGeom, sharedMats.neonRed);
  beacon.position.y = tubeR + 4.5;
  mineGroup.add(beacon);

  // 6. Giant glowing threat projection on the track bed
  const groundRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 2.6, 24), sharedMats.neonRed);
  groundRing.position.y = tubeR + 0.08;
  groundRing.rotation.x = -Math.PI / 2;
  mineGroup.add(groundRing);

  // Track warning pad with hazard color
  const groundPad = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, depthZ), sharedMats.magmaGlow);
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
// ============================================================================
function buildPlasmaFirewall(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.5;
  const arcSpan = 1.15; // ~66 degrees
  const tubeR = TUBE_RADIUS;

  const wallGroup = new THREE.Group();
  // Aligns local +Y to angle in cylinder coordinates
  wallGroup.rotation.z = angle - Math.PI / 2;

  // Twin Basalt Industrial Emitter Pylons
  [-arcSpan * 0.48, arcSpan * 0.48].forEach((pylonOffset) => {
    const pylonGeom = new THREE.CylinderGeometry(0.35, 0.48, 4.2, 8);
    const pylon = new THREE.Mesh(pylonGeom, sharedMats.darkArmor);
    const pAngle = pylonOffset;
    pylon.position.set(
      Math.sin(pAngle) * (tubeR + 1.8),
      Math.cos(pAngle) * (tubeR + 1.8),
      0
    );
    pylon.rotation.z = -pAngle;

    // Glowing molten emitter rings
    const ringGeom = new THREE.TorusGeometry(0.5, 0.08, 6, 16);
    const ring = new THREE.Mesh(ringGeom, sharedMats.magmaGlow);
    ring.rotation.x = Math.PI / 2;
    pylon.add(ring);

    wallGroup.add(pylon);
  });

  // Molten Plasma Curtain Sheet
  const sheetGeom = new THREE.PlaneGeometry(tubeR * arcSpan * 0.95, 3.8);
  const sheetMat = new THREE.MeshBasicMaterial({
    color: 0xff3300,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const sheet = new THREE.Mesh(sheetGeom, sheetMat);
  sheet.position.y = tubeR + 1.9;
  wallGroup.add(sheet);

  // Flaming ground plate
  const groundGeom = new THREE.BoxGeometry(tubeR * arcSpan, 0.2, depthZ);
  const ground = new THREE.Mesh(groundGeom, sharedMats.magmaPlate);
  ground.position.y = tubeR + 0.05;
  wallGroup.add(ground);

  group.add(wallGroup);

  return {
    group,
    depthZ,
    primaryAngle: angle,
    blockedSectors: [makeSector(angle, arcSpan * 0.5)],
  };
}

// ============================================================================
// 15. FROST SHARD GATE (CRYO VOID - Rotating Razor Ice Crystals)
// ============================================================================
function buildFrostShardGate(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.0;
  const tubeR = TUBE_RADIUS;
  const bladeArc = 0.28; // Calibrated fair collision arc (~16 degrees)
  const numBlades = 3;

  const rotor = new THREE.Group();
  rotor.name = 'inner_rotor';
  rotor.rotation.z = angle - Math.PI / 2;

  const iceMat = new THREE.MeshPhysicalMaterial({
    color: 0x99f6e4,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.75,
    roughness: 0.1,
    transmission: 0.7,
    thickness: 1.2,
  });

  for (let i = 0; i < numBlades; i++) {
    const bladeGroup = new THREE.Group();
    const bladeAngle = (i / numBlades) * Math.PI * 2;
    bladeGroup.rotation.z = bladeAngle;

    const bladeGeom = new THREE.ConeGeometry(0.55, 4.6, 5);
    bladeGeom.scale(1.0, 1.0, 0.4);
    const blade = new THREE.Mesh(bladeGeom, iceMat);
    blade.position.y = tubeR + 1.8;
    blade.rotation.z = Math.PI;

    // Glowing frosty needle tip
    const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), sharedMats.iceGlow);
    tip.position.y = 2.4;
    blade.add(tip);

    bladeGroup.add(blade);
    rotor.add(bladeGroup);
  }

  // Central cryogenic condensation core
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), sharedMats.iceGlow);
  rotor.add(core);

  group.add(rotor);

  const rotSpeed = 1.35;
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
    },
  };
}

// ============================================================================
// 16. VOID SINGULARITY RIFT (QUANTUM HORIZON - Dimensional Event Horizon)
// ============================================================================
function buildVoidSingularityRift(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.6;
  const arcSpan = 0.95;
  const tubeR = TUBE_RADIUS;

  const riftGroup = new THREE.Group();
  // Aligns local +Y to angle in cylinder coordinates
  riftGroup.rotation.z = angle - Math.PI / 2;

  // Dark dimensional core
  const coreGeom = new THREE.SphereGeometry(1.4, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x140124,
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  core.position.y = tubeR + 1.8;
  riftGroup.add(core);

  // Swirling Event Horizon Torus Ring
  const torusGeom = new THREE.TorusGeometry(2.4, 0.22, 10, 32);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0xc026d3,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
  });
  const torus = new THREE.Mesh(torusGeom, torusMat);
  torus.position.y = tubeR + 1.8;
  torus.rotation.x = Math.PI / 4;
  riftGroup.add(torus);

  // Outer Hyper-Green Gravitational Coil
  const outerTorusGeom = new THREE.TorusGeometry(2.9, 0.12, 8, 28);
  const outerTorus = new THREE.Mesh(outerTorusGeom, sharedMats.neonGreen);
  outerTorus.position.y = tubeR + 1.8;
  outerTorus.rotation.y = Math.PI / 3;
  riftGroup.add(outerTorus);

  // Ground rift distortion warning
  const groundPad = new THREE.Mesh(new THREE.RingGeometry(0.8, 2.8, 24), sharedMats.neonPurple);
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
function buildVolcanicArchEruption(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 4.2;
  const archSpan = 2.1; // ~120 degrees
  const halfArc = archSpan * 0.5 - 0.1;

  const archGroup = new THREE.Group();
  archGroup.rotation.z = baseAngle - Math.PI / 2;

  // Massive basalt overhead bridge span (aligned strictly centered at +Y)
  const bridgeGeom = new THREE.TorusGeometry(tubeR + 2.2, 0.7, 8, 28, archSpan);
  const bridge = new THREE.Mesh(bridgeGeom, sharedMats.darkArmor);
  bridge.rotation.z = Math.PI / 2 - archSpan * 0.5;
  archGroup.add(bridge);

  // Glowing molten magma crest on bridge
  const crestGeom = new THREE.TorusGeometry(tubeR + 2.4, 0.3, 6, 28, archSpan);
  const crest = new THREE.Mesh(crestGeom, sharedMats.magmaCore);
  crest.rotation.z = Math.PI / 2 - archSpan * 0.5;
  archGroup.add(crest);

  // Cascading Magma Pillar Columns aligned symmetrically around +Y
  const numPillars = 5;
  for (let i = 0; i < numPillars; i++) {
    const pAngle = (i / (numPillars - 1) - 0.5) * (archSpan * 0.88);
    const pillarGeom = new THREE.CylinderGeometry(0.28, 0.45, 3.8, 6);
    const pillar = new THREE.Mesh(pillarGeom, sharedMats.magmaGlow);
    pillar.position.set(
      -Math.sin(pAngle) * (tubeR + 1.6),
      Math.cos(pAngle) * (tubeR + 1.6),
      0
    );
    pillar.rotation.z = pAngle;
    archGroup.add(pillar);
  }

  // Molten ground slag pad
  const groundGeom = new THREE.BoxGeometry(tubeR * archSpan * 0.85, 0.25, depthZ);
  const ground = new THREE.Mesh(groundGeom, sharedMats.magmaPlate);
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
function buildCryoBlizzardVortex(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 3.6;
  const arcSpan = 0.85;

  const vortexGroup = new THREE.Group();
  vortexGroup.name = 'inner_rotor';
  vortexGroup.rotation.z = baseAngle - Math.PI / 2;

  // Stasis crystal emitter base on the tube surface
  const baseGeom = new THREE.CylinderGeometry(0.7, 0.9, 1.4, 8);
  const baseMesh = new THREE.Mesh(baseGeom, sharedMats.darkArmor);
  baseMesh.position.y = tubeR + 0.7;
  vortexGroup.add(baseMesh);

  // Ground warning stasis pad defining collision boundary clearly
  const pad = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, depthZ), sharedMats.icePlate);
  pad.position.y = tubeR + 0.05;
  vortexGroup.add(pad);

  // Counter-rotating outer cryogenic stasis ring
  const rotor = new THREE.Group();
  rotor.name = 'vortex_spinner';
  rotor.position.y = tubeR + 2.2;

  const ringGeom = new THREE.TorusGeometry(2.0, 0.16, 8, 24);
  const ring1 = new THREE.Mesh(ringGeom, sharedMats.iceGlow);
  rotor.add(ring1);

  // 4 Razor Frost Spikes jutting inward
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.2, 5), sharedMats.icePlate);
    spike.position.set(Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0);
    spike.rotation.z = a + Math.PI / 2;
    rotor.add(spike);
  }

  vortexGroup.add(rotor);
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
function buildTachyonWarpGate(baseAngle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const tubeR = TUBE_RADIUS;
  const depthZ = 4.0;
  const arcSpan = 0.92;

  const gateGroup = new THREE.Group();
  gateGroup.rotation.z = baseAngle - Math.PI / 2;

  // Quantum Phase Pillars
  [-0.9, 0.9].forEach((xPos) => {
    const pylonGeom = new THREE.BoxGeometry(0.5, 4.4, 0.6);
    const pylon = new THREE.Mesh(pylonGeom, sharedMats.darkArmor);
    pylon.position.set(xPos, tubeR + 2.0, 0);
    gateGroup.add(pylon);

    // Glowing neon purple phase inductors
    const coil = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.75), sharedMats.neonPurple);
    coil.position.set(xPos, tubeR + 2.6, 0);
    gateGroup.add(coil);
  });

  // Pulsing Tachyon Laser Grid
  const laserMat = new THREE.MeshBasicMaterial({
    color: 0x39ff14,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
  });
  const laser = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.4), laserMat);
  laser.position.set(0, tubeR + 2.0, 0);
  gateGroup.add(laser);

  // Ground Warning Pad
  const pad = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, depthZ), sharedMats.neonGreen);
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
function buildMagmaMine(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.8;
  const arcSpan = 0.8;
  const tubeR = TUBE_RADIUS;

  const mineGroup = new THREE.Group();
  // Aligns local +Y to angle in cylinder coordinates
  mineGroup.rotation.z = angle - Math.PI / 2;

  // Molten slag core
  const core = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2), sharedMats.magmaGlow);
  core.position.y = tubeR + 1.4;
  mineGroup.add(core);

  // Spikes
  for (let i = 0; i < 6; i++) {
    const spikeAngle = (i / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.2, 5), sharedMats.darkArmor);
    spike.position.set(
      Math.cos(spikeAngle) * 1.3,
      tubeR + 1.4 + Math.sin(spikeAngle) * 1.3,
      0
    );
    spike.rotation.z = spikeAngle;
    mineGroup.add(spike);
  }

  // Blazing ground flare
  const groundRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 2.6, 20), sharedMats.magmaGlow);
  groundRing.position.y = tubeR + 0.06;
  groundRing.rotation.x = -Math.PI / 2;
  mineGroup.add(groundRing);

  group.add(mineGroup);
  return { group, depthZ, primaryAngle: angle, blockedSectors: [makeSector(angle, arcSpan * 0.5)] };
}

function buildCryoMine(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.8;
  const arcSpan = 0.8;
  const tubeR = TUBE_RADIUS;

  const mineGroup = new THREE.Group();
  // Aligns local +Y to angle in cylinder coordinates
  mineGroup.rotation.z = angle - Math.PI / 2;

  // Crystal ice core
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.3), sharedMats.iceGlow);
  core.position.y = tubeR + 1.4;
  mineGroup.add(core);

  // Ice spikes
  for (let i = 0; i < 6; i++) {
    const spikeAngle = (i / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 5), sharedMats.icePlate);
    spike.position.set(
      Math.cos(spikeAngle) * 1.4,
      tubeR + 1.4 + Math.sin(spikeAngle) * 1.4,
      0
    );
    spike.rotation.z = spikeAngle;
    mineGroup.add(spike);
  }

  // Cyan frost warning ring
  const groundRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 2.6, 20), sharedMats.iceGlow);
  groundRing.position.y = tubeR + 0.06;
  groundRing.rotation.x = -Math.PI / 2;
  mineGroup.add(groundRing);

  group.add(mineGroup);
  return { group, depthZ, primaryAngle: angle, blockedSectors: [makeSector(angle, arcSpan * 0.5)] };
}

const quantumMineCoreGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const quantumMineRingGeom = new THREE.TorusGeometry(1.8, 0.1, 6, 24);
const quantumMineGroundGeom = new THREE.RingGeometry(0.8, 2.6, 20);

function buildQuantumMine(angle: number): CreatedObstacleResult {
  const group = new THREE.Group();
  const depthZ = 3.8;
  const arcSpan = 0.8;
  const tubeR = TUBE_RADIUS;

  const mineGroup = new THREE.Group();
  // Aligns local +Y to angle in cylinder coordinates
  mineGroup.rotation.z = angle - Math.PI / 2;

  // Quantum core hypercube
  const core = new THREE.Mesh(quantumMineCoreGeom, sharedMats.neonGreen);
  core.userData.isShared = true;
  core.position.y = tubeR + 1.4;
  core.rotation.set(Math.PI / 4, Math.PI / 4, 0);
  mineGroup.add(core);

  // Phase rings
  const ring = new THREE.Mesh(quantumMineRingGeom, sharedMats.neonPurple);
  ring.userData.isShared = true;
  ring.position.y = tubeR + 1.4;
  mineGroup.add(ring);

  // Ground warning
  const groundRing = new THREE.Mesh(quantumMineGroundGeom, sharedMats.neonGreen);
  groundRing.userData.isShared = true;
  groundRing.position.y = tubeR + 0.06;
  groundRing.rotation.x = -Math.PI / 2;
  mineGroup.add(groundRing);

  group.add(mineGroup);
  return { group, depthZ, primaryAngle: angle, blockedSectors: [makeSector(angle, arcSpan * 0.5)] };
}

export function createCyberObstacleGroup(type: string, angle: number): CreatedObstacleResult {
  switch (type) {
    case 'spoke_wheel_gate':
      return buildSpokeWheelGate(angle);
    case 'half_disc_barrier':
      return buildHalfDiscBarrier(angle);
    case 'spiral_voxel_fan':
      return buildSpiralVoxelFan(angle);
    case 'titan_monolith':
      return buildTitanMonolith(angle);
    case 'laser_quad_gate':
      return buildLaserQuadGate(angle);
    case 'magma_grinder':
      return buildMagmaGrinder(angle);
    case 'inferno_pillar':
      return buildInfernoPillar(angle);
    case 'plasma_firewall':
      return buildPlasmaFirewall(angle);
    case 'volcanic_arch_eruption':
      return buildVolcanicArchEruption(angle);
    case 'cryo_pendulum':
      return buildCryoPendulum(angle);
    case 'glacier_spikes':
      return buildGlacierSpikes(angle);
    case 'frost_shard_gate':
      return buildFrostShardGate(angle);
    case 'cryo_blizzard_vortex':
      return buildCryoBlizzardVortex(angle);
    case 'quantum_rotator':
      return buildQuantumRotator(angle);
    case 'void_singularity_rift':
      return buildVoidSingularityRift(angle);
    case 'tachyon_warp_gate':
      return buildTachyonWarpGate(angle);
    case 'phantom_mine':
      return buildPhantomMine(angle);
    case 'magma_mine':
      return buildMagmaMine(angle);
    case 'cryo_mine':
      return buildCryoMine(angle);
    case 'quantum_mine':
      return buildQuantumMine(angle);
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

