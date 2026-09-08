import * as THREE from 'three';
import { VehicleDef } from '../types';

export function createVoxelBox(
  width: number,
  height: number,
  depth: number,
  color: THREE.ColorRepresentation,
  roughness: number = 0.4,
  metalness: number = 0.3,
  emissive?: THREE.ColorRepresentation,
  emissiveIntensity: number = 0.0
): THREE.Mesh {
  const geom = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    flatShading: true,
    ...(emissive ? { emissive, emissiveIntensity } : {}),
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createNeonBox(
  width: number,
  height: number,
  depth: number,
  color: THREE.ColorRepresentation,
  intensity: number = 1.0
): THREE.Mesh {
  const geom = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.2,
    metalness: 0.1,
  });
  return new THREE.Mesh(geom, mat);
}

/**
 * Builds the Magnetic Hyper-Bike / Cyber Bolide
 * Designed specifically for riding the outer surface of the winding cosmic tube!
 */
export function buildVoxelShip(def: VehicleDef): THREE.Group {
  const bikeGroup = new THREE.Group();
  const primaryColor = new THREE.Color(def.baseColor);
  const accentColor = new THREE.Color(def.glowColor || '#00f0ff');
  const darkColor = new THREE.Color('#0d1117');
  const chromeColor = new THREE.Color('#475569');

  // --- 1. Central Aerodynamic Main Body Frame ---
  const spine = createVoxelBox(0.48, 0.45, 2.2, primaryColor, 0.3, 0.5);
  spine.position.set(0, 0.55, 0);
  bikeGroup.add(spine);

  // Aerodynamic Lower Keel
  const keel = createVoxelBox(0.35, 0.25, 1.8, darkColor, 0.6, 0.2);
  keel.position.set(0, 0.3, 0.05);
  bikeGroup.add(keel);

  // --- 2. Pilot Cybernetic Rider & Visor ---
  const riderGroup = new THREE.Group();
  riderGroup.position.set(0, 0.72, -0.1);

  // Rider Torso (leaning forward in aggressive aerodynamic stance)
  const riderTorso = createVoxelBox(0.42, 0.44, 0.65, '#0f172a', 0.5, 0.4);
  riderTorso.rotation.x = -0.32;
  riderTorso.position.set(0, 0.22, 0.1);
  riderGroup.add(riderTorso);

  // Cyberpunk Jacket Spine Neon LEDs
  const spineLeds = createNeonBox(0.08, 0.38, 0.62, accentColor, 2.2);
  spineLeds.rotation.x = -0.32;
  spineLeds.position.set(0, 0.28, 0.1);
  riderGroup.add(spineLeds);

  // Cybernetic Helmet
  const helmet = createVoxelBox(0.36, 0.36, 0.4, '#1e293b', 0.3, 0.6);
  helmet.position.set(0, 0.52, -0.16);
  helmet.rotation.x = -0.15;
  riderGroup.add(helmet);

  // Glowing Visor
  const visor = createNeonBox(0.34, 0.14, 0.18, accentColor, 3.0);
  visor.position.set(0, 0.52, -0.34);
  riderGroup.add(visor);

  // Pilot Arms gripping handlebars
  const armL = createVoxelBox(0.12, 0.14, 0.5, '#0f172a');
  armL.position.set(-0.28, 0.22, -0.22);
  armL.rotation.set(-0.35, 0.2, 0);
  const armR = createVoxelBox(0.12, 0.14, 0.5, '#0f172a');
  armR.position.set(0.28, 0.22, -0.22);
  armR.rotation.set(-0.35, -0.2, 0);
  riderGroup.add(armL, armR);

  // Pilot Legs tucked into bike fairings
  const legL = createVoxelBox(0.16, 0.18, 0.6, '#0f172a');
  legL.position.set(-0.3, 0.0, 0.3);
  const legR = createVoxelBox(0.16, 0.18, 0.6, '#0f172a');
  legR.position.set(0.3, 0.0, 0.3);
  riderGroup.add(legL, legR);

  bikeGroup.add(riderGroup);

  // --- 3. Front Magnetic Hover-Hub & Nose Cone ---
  const noseCone = createVoxelBox(0.4, 0.35, 0.9, primaryColor, 0.2, 0.6);
  noseCone.position.set(0, 0.52, -1.35);
  noseCone.rotation.x = 0.15;
  bikeGroup.add(noseCone);

  // Front Magnetic Ring (Hubless Wheel)
  const frontMagRingGeom = new THREE.TorusGeometry(0.42, 0.09, 10, 24);
  const frontMagRingMat = new THREE.MeshStandardMaterial({
    color: chromeColor,
    metalness: 0.9,
    roughness: 0.1,
  });
  const frontMagRing = new THREE.Mesh(frontMagRingGeom, frontMagRingMat);
  frontMagRing.position.set(0, 0.44, -1.25);
  bikeGroup.add(frontMagRing);

  // Front Mag-Ring Neon Core
  const frontCore = createNeonBox(0.08, 0.45, 0.45, accentColor, 1.8);
  frontCore.position.set(0, 0.44, -1.25);
  bikeGroup.add(frontCore);

  // --- 4. Rear Magnetic Hover-Drive ---
  const rearMagRingGeom = new THREE.TorusGeometry(0.5, 0.11, 10, 24);
  const rearMagRing = new THREE.Mesh(frontMagRingGeom, frontMagRingMat);
  rearMagRing.position.set(0, 0.48, 1.15);
  bikeGroup.add(rearMagRing);

  const rearCore = createNeonBox(0.1, 0.55, 0.55, accentColor, 2.0);
  rearCore.position.set(0, 0.48, 1.15);
  bikeGroup.add(rearCore);

  // --- 5. Twin Magnetic Stabilizer Wings ---
  const wingLeft = createVoxelBox(0.7, 0.08, 0.9, primaryColor, 0.3, 0.6);
  wingLeft.position.set(-0.55, 0.52, 0.2);
  wingLeft.rotation.z = -0.18;
  bikeGroup.add(wingLeft);

  const wingLeftNeon = createNeonBox(0.06, 0.12, 0.92, accentColor, 1.5);
  wingLeftNeon.position.set(-0.9, 0.58, 0.2);
  bikeGroup.add(wingLeftNeon);

  const wingRight = createVoxelBox(0.7, 0.08, 0.9, primaryColor, 0.3, 0.6);
  wingRight.position.set(0.55, 0.52, 0.2);
  wingRight.rotation.z = 0.18;
  bikeGroup.add(wingRight);

  const wingRightNeon = createNeonBox(0.06, 0.12, 0.92, accentColor, 1.5);
  wingRightNeon.position.set(0.9, 0.58, 0.2);
  bikeGroup.add(wingRightNeon);

  // --- 6. Twin High-Output Plasma Exhaust Nozzles ---
  const nozzleLeft = createVoxelBox(0.18, 0.18, 0.4, darkColor);
  nozzleLeft.position.set(-0.24, 0.52, 1.25);
  const nozzleRight = createVoxelBox(0.18, 0.18, 0.4, darkColor);
  nozzleRight.position.set(0.24, 0.52, 1.25);
  bikeGroup.add(nozzleLeft, nozzleRight);

  // Glowing Plasma Jets
  const jetL = createNeonBox(0.12, 0.12, 0.5, def.trailColor || '#38bdf8', 2.5);
  jetL.position.set(-0.24, 0.52, 1.5);
  const jetR = createNeonBox(0.12, 0.12, 0.5, def.trailColor || '#38bdf8', 2.5);
  jetR.position.set(0.24, 0.52, 1.5);
  bikeGroup.add(jetL, jetR);

  // --- 7. Model Specific Custom Details ---
  if (def.id === 'hyper_dart') {
    // Sharp needle prow & forward canards
    const needleProw = createNeonBox(0.12, 0.12, 1.2, '#f43f5e', 2.2);
    needleProw.position.set(0, 0.52, -1.9);
    bikeGroup.add(needleProw);

    const canardL = createVoxelBox(0.4, 0.05, 0.5, primaryColor);
    canardL.position.set(-0.35, 0.52, -0.9);
    canardL.rotation.z = -0.3;
    const canardR = createVoxelBox(0.4, 0.05, 0.5, primaryColor);
    canardR.position.set(0.35, 0.52, -0.9);
    canardR.rotation.z = 0.3;
    bikeGroup.add(canardL, canardR);
  } else if (def.id === 'void_phantom') {
    // Swept dual dorsal fins with purple glow
    const dorsalFinL = createNeonBox(0.08, 0.45, 0.7, '#c084fc', 1.8);
    dorsalFinL.position.set(-0.22, 0.85, 0.55);
    dorsalFinL.rotation.x = -0.25;
    const dorsalFinR = createNeonBox(0.08, 0.45, 0.7, '#c084fc', 1.8);
    dorsalFinR.position.set(0.22, 0.85, 0.55);
    dorsalFinR.rotation.x = -0.25;
    bikeGroup.add(dorsalFinL, dorsalFinR);
  } else if (def.id === 'overdrive_titan') {
    // Heavy magnetic ramming shield & triple thrusters
    const ramBar = createNeonBox(1.2, 0.2, 0.25, '#fbbf24', 2.0);
    ramBar.position.set(0, 0.52, -1.75);
    bikeGroup.add(ramBar);

    const centerJet = createNeonBox(0.16, 0.16, 0.6, '#ef4444', 3.0);
    centerJet.position.set(0, 0.68, 1.55);
    bikeGroup.add(centerJet);
  } else if (def.id === 'nebula_drifter') {
    // Twin outrigger pod nacelles
    const podL = createNeonBox(0.25, 0.25, 1.4, '#10b981', 1.5);
    podL.position.set(-0.85, 0.48, 0.1);
    const podR = createNeonBox(0.25, 0.25, 1.4, '#10b981', 1.5);
    podR.position.set(0.85, 0.48, 0.1);
    bikeGroup.add(podL, podR);
  }

  // --- 8. Magnetic Levitation Underglow Cushion ---
  const magFieldGeom = new THREE.PlaneGeometry(1.2, 2.4);
  const magFieldMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const magField = new THREE.Mesh(magFieldGeom, magFieldMat);
  magField.rotation.x = Math.PI / 2;
  magField.position.y = 0.08; // Hovering right above the tube surface
  bikeGroup.add(magField);

  return bikeGroup;
}

/**
 * Builds High-Contrast, Ultra-Readable Neon Obstacles for the Outside of the Tube:
 * Local coordinates:
 * - Y = 0 is the surface of the tube.
 * - +Y points outward into space.
 * - X is lateral around the tube.
 * - Z is along the tube path.
 */
export function createTubeObstacle(
  type: 'laser_gate' | 'magnetic_spire' | 'plasma_cross' | 'shatter_barrier' | 'boost_pad' | 'energy_prism',
  colorHex: string = '#f43f5e'
): THREE.Group {
  const group = new THREE.Group();

  // --- Ground Danger Hologram / Warning Projection on Tube Hull ---
  // Visible from afar on the surface of the tube
  if (type !== 'boost_pad' && type !== 'energy_prism') {
    const cautionGeom = new THREE.PlaneGeometry(4.2, 5.0);
    const cautionMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const cautionPlate = new THREE.Mesh(cautionGeom, cautionMat);
    cautionPlate.rotation.x = Math.PI / 2;
    cautionPlate.position.y = 0.04;
    group.add(cautionPlate);

    // Hazard Stripes on ground
    const stripeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fcee0a'),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    for (let s = -2; s <= 2; s += 1.2) {
      const stripeGeom = new THREE.PlaneGeometry(3.6, 0.25);
      const stripe = new THREE.Mesh(stripeGeom, stripeMat);
      stripe.rotation.x = Math.PI / 2;
      stripe.position.set(0, 0.05, s);
      group.add(stripe);
    }
  }

  if (type === 'laser_gate') {
    // --- Huge Neon Laser Gate (High Visibility) ---
    const pylonColor = '#05070d';
    const laserColor = '#ff003c';

    // Left Massive Pylon
    const pylonL = createVoxelBox(0.85, 3.8, 0.85, pylonColor, 0.2, 0.8);
    pylonL.position.set(-2.6, 1.9, 0);
    const pylonLNeon = createNeonBox(0.25, 3.7, 0.25, '#fcee0a', 3.0);
    pylonLNeon.position.set(-2.2, 1.9, 0);

    // Right Massive Pylon
    const pylonR = createVoxelBox(0.85, 3.8, 0.85, pylonColor, 0.2, 0.8);
    pylonR.position.set(2.6, 1.9, 0);
    const pylonRNeon = createNeonBox(0.25, 3.7, 0.25, '#fcee0a', 3.0);
    pylonRNeon.position.set(2.2, 1.9, 0);

    // Overhead Arch Bar
    const archCap = createVoxelBox(6.0, 0.7, 0.9, pylonColor, 0.2, 0.8);
    archCap.position.set(0, 3.8, 0);
    const archCapNeon = createNeonBox(5.6, 0.2, 0.95, laserColor, 3.0);
    archCapNeon.position.set(0, 4.15, 0);

    // Twin Hyper-Luminous Laser Plasma Beams
    const beam1 = createNeonBox(4.6, 0.35, 0.35, laserColor, 4.0);
    beam1.position.set(0, 1.1, 0);

    const beam2 = createNeonBox(4.6, 0.35, 0.35, laserColor, 4.0);
    beam2.position.set(0, 2.3, 0);

    // Strobe Warning Beacons
    const beaconL = createNeonBox(0.45, 0.45, 0.45, '#fcee0a', 3.5);
    beaconL.position.set(-2.4, 4.3, 0);
    const beaconR = createNeonBox(0.45, 0.45, 0.45, '#fcee0a', 3.5);
    beaconR.position.set(2.4, 4.3, 0);

    group.add(pylonL, pylonLNeon, pylonR, pylonRNeon, archCap, archCapNeon, beam1, beam2, beaconL, beaconR);
  } else if (type === 'magnetic_spire') {
    // --- Mega Magnetic Hazard Spire (Towering & High Contrast) ---
    const levels = 7;
    for (let i = 0; i < levels; i++) {
      const w = 2.6 - i * 0.32;
      const h = 0.9;
      const d = 2.6 - i * 0.32;
      const block = createVoxelBox(w, h, d, '#05070d', 0.2, 0.8);
      block.position.y = i * 0.85 + 0.45;
      group.add(block);

      // High-Contrast Cyberpunk Neon Hazard Trim
      const trimColor = i % 2 === 0 ? '#fcee0a' : colorHex;
      const trim = createNeonBox(w + 0.1, 0.15, d + 0.1, trimColor, 3.0);
      trim.position.y = i * 0.85 + 0.85;
      group.add(trim);
    }

    // Glowing energy spire crystal at the apex
    const apexCrystal = createNeonBox(0.7, 1.4, 0.7, '#00f0ff', 4.0);
    apexCrystal.position.y = levels * 0.85 + 0.7;
    apexCrystal.rotation.y = Math.PI / 4;
    group.add(apexCrystal);
  } else if (type === 'plasma_cross') {
    // --- Huge Spinning Plasma Cross ---
    const hub = createVoxelBox(1.2, 1.2, 0.8, '#05070d', 0.2, 0.9);
    hub.position.y = 2.0;
    group.add(hub);

    const hubCore = createNeonBox(0.6, 0.6, 0.9, '#fcee0a', 4.0);
    hubCore.position.y = 2.0;
    group.add(hubCore);

    // Quad Neon Blades (Wide span: 4.8m)
    const bladeColor = '#a855f7';
    const bladeH = createNeonBox(4.8, 0.45, 0.25, bladeColor, 3.2);
    bladeH.position.y = 2.0;
    const bladeV = createNeonBox(0.45, 4.8, 0.25, bladeColor, 3.2);
    bladeV.position.y = 2.0;

    // Glowing outer tips
    const tipL = createNeonBox(0.5, 0.6, 0.3, '#ff003c', 4.0);
    tipL.position.set(-2.2, 2.0, 0);
    const tipR = createNeonBox(0.5, 0.6, 0.3, '#ff003c', 4.0);
    tipR.position.set(2.2, 2.0, 0);

    const rotatingBlades = new THREE.Group();
    rotatingBlades.name = 'rotating_blades';
    rotatingBlades.add(bladeH, bladeV, tipL, tipR);
    group.add(rotatingBlades);
  } else if (type === 'shatter_barrier') {
    // --- Breakable Quantum Voxel Matrix (Large & Bright) ---
    const cols = 5;
    const rows = 4;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const posX = (c - (cols - 1) / 2) * 0.82;
        const posY = r * 0.82 + 0.45;
        const isCore = c >= 1 && c <= 3;
        const col = isCore ? colorHex : '#00f0ff';
        const box = createNeonBox(0.76, 0.76, 0.76, col, 2.5);
        box.position.set(posX, posY, 0);
        group.add(box);
      }
    }
  } else if (type === 'boost_pad') {
    // --- Cyberpunk Super-Luminous Chevron Boost Strip ---
    const basePlate = createVoxelBox(2.6, 0.06, 4.8, '#020617', 0.9, 0.1);
    basePlate.position.y = 0.03;
    group.add(basePlate);

    const chevronColor = '#fcee0a';
    for (let i = -1; i <= 1; i++) {
      const zOff = i * 1.3;
      const leftArrow = createNeonBox(0.42, 0.12, 1.2, chevronColor, 4.0);
      leftArrow.position.set(-0.45, 0.08, zOff);
      leftArrow.rotation.y = 0.58;

      const rightArrow = createNeonBox(0.42, 0.12, 1.2, chevronColor, 4.0);
      rightArrow.position.set(0.45, 0.08, zOff);
      rightArrow.rotation.y = -0.58;

      group.add(leftArrow, rightArrow);
    }
  } else if (type === 'energy_prism') {
    // --- 3D Golden Cyber Coin / Star (High-Visibility Collectible) ---
    const prismGroup = new THREE.Group();
    prismGroup.name = 'prism_body';

    const coinCore = new THREE.Group();
    coinCore.name = 'coin_core';
    coinCore.position.y = 1.25;

    // Thick 12-sided faceted gold coin cylinder
    const coinGeom = new THREE.CylinderGeometry(1.15, 1.15, 0.34, 12);
    coinGeom.rotateX(Math.PI / 2);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: new THREE.Color(0xff8800),
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.9,
      flatShading: true,
    });
    const coin = new THREE.Mesh(coinGeom, goldMat);
    coinCore.add(coin);

    // Chamfered golden outer ring
    const rimGeom = new THREE.TorusGeometry(1.12, 0.08, 8, 16);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xfcee0a });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    coinCore.add(rim);

    // Embossed Cyber Star on Front Face (+Z)
    const starGeom1 = new THREE.OctahedronGeometry(0.5, 0);
    starGeom1.scale(1.0, 1.0, 0.15);
    const starFront1 = new THREE.Mesh(starGeom1, rimMat);
    starFront1.position.z = 0.19;
    coinCore.add(starFront1);

    const starGeom2 = new THREE.OctahedronGeometry(0.38, 0);
    starGeom2.scale(1.0, 1.0, 0.15);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starFront2 = new THREE.Mesh(starGeom2, starMat);
    starFront2.rotation.z = Math.PI / 4;
    starFront2.position.z = 0.2;
    coinCore.add(starFront2);

    // Embossed Cyber Star on Back Face (-Z)
    const starBack1 = new THREE.Mesh(starGeom1, rimMat);
    starBack1.position.z = -0.19;
    coinCore.add(starBack1);

    const starBack2 = new THREE.Mesh(starGeom2, starMat);
    starBack2.rotation.z = Math.PI / 4;
    starBack2.position.z = -0.2;
    coinCore.add(starBack2);

    prismGroup.add(coinCore);

    // Orbiting Golden Sparkle Satellites
    const sparklesGroup = new THREE.Group();
    sparklesGroup.name = 'coin_sparkles';
    sparklesGroup.position.y = 1.25;

    const sparklePos = [
      [1.6, 0, 0],
      [-1.6, 0, 0],
      [0, 1.55, 0.2],
      [0, -1.55, -0.2],
    ];
    sparklePos.forEach(([x, y, z]) => {
      const sGeom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const sMesh = new THREE.Mesh(sGeom, starMat);
      sMesh.position.set(x, y, z);
      sparklesGroup.add(sMesh);
    });

    prismGroup.add(sparklesGroup);
    group.add(prismGroup);
  }

  return group;
}
