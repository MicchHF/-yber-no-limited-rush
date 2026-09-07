import * as THREE from 'three';
import { VehicleDef } from '../types';
import { getSkinById, generateSkinTexture } from './shipSkins';

/**
 * Builds authentic high-tech racing bolides with distinct chassis geometries
 * and full skin/livery support.
 */
export function buildCyberRacerShip(def: VehicleDef): THREE.Group {
  const ship = new THREE.Group();
  const skin = getSkinById(def.selectedSkinId);

  const baseColor = new THREE.Color(def.baseColor || skin.baseColor);
  const glowColor = new THREE.Color(def.glowColor || skin.glowColor);
  const trailColor = new THREE.Color(def.trailColor || skin.trailColor);

  // Generate real procedural canvas texture for the skin livery
  const skinTexture = generateSkinTexture(skin);

  // High-fidelity PBR materials with automotive clearcoat lacquer
  // Emissive boost ensures colors stay punchy, vivid, and visible under any ambient lighting
  const hullMat = new THREE.MeshPhysicalMaterial({
    map: skinTexture,
    color: 0xffffff,
    emissive: new THREE.Color(skin.baseColor),
    emissiveMap: skinTexture,
    emissiveIntensity: 0.22,
    roughness: Math.max(0.06, skin.roughness * 0.7),
    metalness: Math.min(0.85, skin.metalness),
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });

  // Vibrant accent material mirroring the chosen livery's main color
  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(skin.baseColor),
    emissive: new THREE.Color(skin.baseColor),
    emissiveIntensity: 0.32,
    roughness: 0.12,
    metalness: 0.75,
  });

  const darkHullMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.22,
    metalness: 0.88,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x243046,
    roughness: 0.18,
    metalness: 0.95,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.05,
    metalness: 0.98,
  });

  const neonMat = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: 1.0,
  });

  const neonSecMat = new THREE.MeshBasicMaterial({
    color: trailColor,
    transparent: true,
    opacity: 1.0,
  });

  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: glowColor,
    emissive: glowColor,
    emissiveIntensity: 0.88,
    roughness: 0.04,
    transmission: 0.68,
    thickness: 0.85,
    metalness: 0.15,
  });

  const plumeMat = new THREE.MeshBasicMaterial({
    color: trailColor,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  });

  const chassisId = def.id || 'hamster_interceptor';

  if (chassisId === 'hyper_dart') {
    // 1. HYPER DART: Ultra-slender hypersonic needle dart
    // Needle nose
    const noseGeom = new THREE.ConeGeometry(0.35, 3.2, 5);
    noseGeom.rotateX(Math.PI / 2);
    noseGeom.scale(1.0, 0.45, 1.0);
    const nose = new THREE.Mesh(noseGeom, hullMat);
    nose.position.set(0, 0.25, 0.4);
    ship.add(nose);

    // High streamlined cockpit canopy
    const canopyGeom = new THREE.ConeGeometry(0.24, 1.6, 8);
    canopyGeom.rotateX(Math.PI / 2);
    canopyGeom.scale(0.8, 0.5, 1.0);
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 0.38, 0.2);
    ship.add(canopy);

    // Razor-thin swept delta wings
    const wingGeom = new THREE.BoxGeometry(1.6, 0.03, 1.4);
    const wing = new THREE.Mesh(wingGeom, hullMat);
    wing.position.set(0, 0.22, -0.4);
    ship.add(wing);

    // Wingtip neon blades
    const bladeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 1.1), neonMat);
    bladeL.position.set(-0.8, 0.26, -0.4);
    const bladeR = bladeL.clone();
    bladeR.position.x = 0.8;
    ship.add(bladeL, bladeR);

    // Dorsal aero stabilizer blade
    const dorsal = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.85), accentMat);
    dorsal.position.set(0, 0.46, -0.5);
    ship.add(dorsal);

    // Triple vector thrusters
    [-0.26, 0, 0.26].forEach((x, i) => {
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 0.5, 10).rotateX(Math.PI / 2),
        metalMat
      );
      nozzle.position.set(x, 0.25, -1.15);
      ship.add(nozzle);
    });

    // Center Plume
    const thrusterPlume = new THREE.Mesh(
      new THREE.ConeGeometry(0.26, 1.6, 8).rotateX(-Math.PI / 2),
      plumeMat
    );
    thrusterPlume.name = 'thruster_plume';
    thrusterPlume.position.set(0, 0.25, -1.9);
    ship.add(thrusterPlume);

  } else if (chassisId === 'void_phantom') {
    // 2. VOID PHANTOM: Stealth diamond faceted wedge
    const wedgeGeom = new THREE.CylinderGeometry(0.1, 0.75, 2.8, 4);
    wedgeGeom.rotateX(Math.PI / 2);
    wedgeGeom.rotateZ(Math.PI / 4);
    wedgeGeom.scale(1.3, 0.35, 1.0);
    const wedge = new THREE.Mesh(wedgeGeom, hullMat);
    wedge.position.set(0, 0.24, 0.1);
    ship.add(wedge);

    // Stealth faceted canopy
    const canopyGeom = new THREE.BoxGeometry(0.35, 0.18, 1.2);
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 0.36, 0.3);
    ship.add(canopy);

    // Inverted V-tail stabilizers with vibrant accent livery
    const vTailL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.75), accentMat);
    vTailL.position.set(-0.42, 0.38, -0.9);
    vTailL.rotation.z = -0.35;
    const vTailR = vTailL.clone();
    vTailR.position.x = 0.42;
    vTailR.rotation.z = 0.35;
    ship.add(vTailL, vTailR);

    // Neon edge stealth glow seams
    const seamL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 2.2), neonMat);
    seamL.position.set(-0.52, 0.22, 0.0);
    const seamR = seamL.clone();
    seamR.position.x = 0.52;
    ship.add(seamL, seamR);

    // Twin rectangular plasma vents
    const ventL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.4), chromeMat);
    ventL.position.set(-0.25, 0.24, -1.2);
    const ventR = ventL.clone();
    ventR.position.x = 0.25;
    ship.add(ventL, ventR);

    const thrusterPlume = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 1.5, 8).rotateX(-Math.PI / 2),
      plumeMat
    );
    thrusterPlume.name = 'thruster_plume';
    thrusterPlume.position.set(0, 0.24, -1.8);
    ship.add(thrusterPlume);

  } else if (chassisId === 'nebula_drifter') {
    // 3. NEBULA DRIFTER: Outrigger twin-pod racer with center magnetic core
    // Left & right engine nacelles
    const nacelleGeom = new THREE.CylinderGeometry(0.26, 0.3, 2.7, 12);
    nacelleGeom.rotateX(Math.PI / 2);

    const nacelleL = new THREE.Mesh(nacelleGeom, hullMat);
    nacelleL.position.set(-0.55, 0.28, 0.0);

    const nacelleR = new THREE.Mesh(nacelleGeom, hullMat);
    nacelleR.position.set(0.55, 0.28, 0.0);
    ship.add(nacelleL, nacelleR);

    // Nacelle front intakes
    const intakeL = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 16), chromeMat);
    intakeL.position.set(-0.55, 0.28, 1.35);
    const intakeR = intakeL.clone();
    intakeR.position.x = 0.55;
    ship.add(intakeL, intakeR);

    // Central suspended cockpit module
    const cockGeom = new THREE.SphereGeometry(0.32, 16, 12);
    cockGeom.scale(0.8, 0.65, 1.7);
    const cock = new THREE.Mesh(cockGeom, canopyMat);
    cock.position.set(0, 0.35, 0.1);
    ship.add(cock);

    // Cross hydrofoil struts linking cockpit to nacelles (vibrant accent)
    const strutGeom = new THREE.BoxGeometry(1.2, 0.07, 0.55);
    const strut = new THREE.Mesh(strutGeom, accentMat);
    strut.position.set(0, 0.28, 0.0);
    ship.add(strut);

    // Energy tether laser arc between nacelles
    const tether = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6).rotateZ(Math.PI / 2), neonMat);
    tether.position.set(0, 0.28, 1.1);
    ship.add(tether);

    // Dual thruster nozzles
    const nozL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.5, 10).rotateX(Math.PI / 2), metalMat);
    nozL.position.set(-0.55, 0.28, -1.35);
    const nozR = nozL.clone();
    nozR.position.x = 0.55;
    ship.add(nozL, nozR);

    // Dual Plumes
    const plumeL = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.4, 8).rotateX(-Math.PI / 2), plumeMat);
    plumeL.name = 'thruster_plume';
    plumeL.position.set(-0.55, 0.28, -1.9);

    const plumeR = plumeL.clone();
    plumeR.position.x = 0.55;
    ship.add(plumeL, plumeR);

  } else if (chassisId === 'overdrive_titan') {
    // 4. OVERDRIVE TITAN: Heavy armored cyber-juggernaut
    // Heavy angular main hull
    const mainHull = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.38, 2.5), hullMat);
    mainHull.position.set(0, 0.32, 0.0);
    ship.add(mainHull);

    // Armored reinforced prow wedge in vivid accent finish
    const prowGeom = new THREE.ConeGeometry(0.65, 1.2, 4);
    prowGeom.rotateX(Math.PI / 2);
    prowGeom.rotateZ(Math.PI / 4);
    prowGeom.scale(1.2, 0.5, 1.0);
    const prow = new THREE.Mesh(prowGeom, accentMat);
    prow.position.set(0, 0.32, 1.55);
    ship.add(prow);

    // Heavy tactical cockpit slit visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.4), neonMat);
    visor.position.set(0, 0.46, 0.6);
    ship.add(visor);

    // Side armor plates with livery canvas
    const plateL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 2.0), hullMat);
    plateL.position.set(-0.52, 0.3, 0.0);
    const plateR = plateL.clone();
    plateR.position.x = 0.52;
    ship.add(plateL, plateR);

    // Quad heavy thruster cluster
    [[-0.26, 0.4], [0.26, 0.4], [-0.26, 0.24], [0.26, 0.24]].forEach(([x, y]) => {
      const noz = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 0.45, 10).rotateX(Math.PI / 2),
        metalMat
      );
      noz.position.set(x, y, -1.35);
      ship.add(noz);
    });

    // Massive Plume
    const thrusterPlume = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 1.8, 8).rotateX(-Math.PI / 2),
      plumeMat
    );
    thrusterPlume.name = 'thruster_plume';
    thrusterPlume.position.set(0, 0.32, -2.1);
    ship.add(thrusterPlume);

  } else if (chassisId === 'solar_valkyrie') {
    // 5. SOLAR VALKYRIE: Swept-forward variable geometry hypersonic fighter
    // Needle forward fuselage
    const noseGeom = new THREE.ConeGeometry(0.42, 3.4, 6);
    noseGeom.rotateX(Math.PI / 2);
    noseGeom.scale(1.1, 0.42, 1.0);
    const nose = new THREE.Mesh(noseGeom, hullMat);
    nose.position.set(0, 0.26, 0.4);
    ship.add(nose);

    // Aerodynamic bubble canopy
    const canopyGeom = new THREE.SphereGeometry(0.28, 16, 12);
    canopyGeom.scale(0.85, 0.65, 1.9);
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 0.38, 0.3);
    ship.add(canopy);

    // Swept-forward wings (Valkyrie signature)
    const wingGeom = new THREE.BoxGeometry(2.2, 0.04, 1.2);
    const wing = new THREE.Mesh(wingGeom, hullMat);
    wing.position.set(0, 0.24, -0.2);
    wing.rotation.y = 0.25; // Swept forward
    ship.add(wing);

    // Solar plasma edge blades on wingtips
    const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 1.2), neonMat);
    tipL.position.set(-1.1, 0.28, -0.05);
    const tipR = tipL.clone();
    tipR.position.x = 1.1;
    ship.add(tipL, tipR);

    // Twin dorsal canted stabilizers
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, 0.8), accentMat);
    finL.position.set(-0.35, 0.48, -0.6);
    finL.rotation.z = -0.22;
    const finR = finL.clone();
    finR.position.x = 0.35;
    finR.rotation.z = 0.22;
    ship.add(finL, finR);

    // Twin Heavy Jet Thrusters
    [-0.32, 0.32].forEach((x) => {
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.22, 0.6, 12).rotateX(Math.PI / 2),
        metalMat
      );
      nozzle.position.set(x, 0.26, -1.2);
      ship.add(nozzle);

      const plume = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 1.6, 8).rotateX(-Math.PI / 2),
        plumeMat
      );
      plume.name = 'thruster_plume';
      plume.position.set(x, 0.26, -1.95);
      ship.add(plume);
    });

  } else if (chassisId === 'quantum_spectre') {
    // 6. QUANTUM SPECTRE: Alien tri-wing hyper-craft with hovering magnetic ring cores
    // Central diamond faceted core
    const coreGeom = new THREE.OctahedronGeometry(0.55, 1);
    coreGeom.scale(0.85, 0.45, 2.2);
    const core = new THREE.Mesh(coreGeom, hullMat);
    core.position.set(0, 0.32, 0.1);
    ship.add(core);

    // Tri-wing configuration (Top dorsal fin + dihedral side wings)
    const dorsalWing = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 1.4), accentMat);
    dorsalWing.position.set(0, 0.62, -0.3);
    ship.add(dorsalWing);

    const wingGeom = new THREE.BoxGeometry(1.8, 0.05, 1.3);
    const leftWing = new THREE.Mesh(wingGeom, hullMat);
    leftWing.position.set(-0.6, 0.28, -0.2);
    leftWing.rotation.z = -0.15;
    const rightWing = new THREE.Mesh(wingGeom, hullMat);
    rightWing.position.set(0.6, 0.28, -0.2);
    rightWing.rotation.z = 0.15;
    ship.add(leftWing, rightWing);

    // Hovering Quantum Accelerator Ring around cockpit
    const ringGeom = new THREE.TorusGeometry(0.52, 0.04, 8, 32);
    const ring = new THREE.Mesh(ringGeom, neonMat);
    ring.position.set(0, 0.32, 0.3);
    ship.add(ring);

    // Crystal cockpit core
    const crystalGeom = new THREE.DodecahedronGeometry(0.28);
    crystalGeom.scale(0.8, 0.7, 1.6);
    const crystal = new THREE.Mesh(crystalGeom, canopyMat);
    crystal.position.set(0, 0.36, 0.3);
    ship.add(crystal);

    // Singularity engine emitter
    const emitter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.3, 0.4, 12).rotateX(Math.PI / 2),
      metalMat
    );
    emitter.position.set(0, 0.3, -1.2);
    ship.add(emitter);

    const plume = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 1.9, 8).rotateX(-Math.PI / 2),
      plumeMat
    );
    plume.name = 'thruster_plume';
    plume.position.set(0, 0.3, -2.1);
    ship.add(plume);

  } else {
    // 5. HAMSTER INTERCEPTOR (Flagship Cyber Bolide)
    // Central Aerodynamic Fuselage
    const fuselageGeom = new THREE.ConeGeometry(0.55, 2.6, 6);
    fuselageGeom.rotateX(Math.PI / 2);
    fuselageGeom.scale(1.2, 0.45, 1.0);
    const fuselage = new THREE.Mesh(fuselageGeom, hullMat);
    fuselage.position.set(0, 0.28, 0.2);
    ship.add(fuselage);

    // Lower magnetic keel
    const keelGeom = new THREE.BoxGeometry(0.6, 0.18, 2.2);
    const keel = new THREE.Mesh(keelGeom, darkHullMat);
    keel.position.set(0, 0.14, 0.1);
    ship.add(keel);

    // Cockpit Canopy
    const canopyGeom = new THREE.SphereGeometry(0.35, 16, 12);
    canopyGeom.scale(0.8, 0.6, 1.8);
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 0.42, 0.25);
    ship.add(canopy);

    // Aerodynamic Side Pods in vibrant accent lacquer
    const sidePodGeom = new THREE.BoxGeometry(0.22, 0.18, 1.8);
    const rightPod = new THREE.Mesh(sidePodGeom, accentMat);
    rightPod.position.set(0.36, 0.22, 0.1);
    const leftPod = rightPod.clone();
    leftPod.position.x = -0.36;
    ship.add(rightPod, leftPod);

    // Front Splitter in vibrant accent lacquer
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.05, 0.6), accentMat);
    splitter.position.set(0, 0.12, 1.1);
    ship.add(splitter);

    // Front LED Headlights
    const rightLight = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.08), neonMat);
    rightLight.position.set(0.26, 0.14, 1.38);
    const leftLight = rightLight.clone();
    leftLight.position.x = -0.26;
    ship.add(rightLight, leftLight);

    // Lateral Neon Cyber-Strips
    const rightStrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 1.7), neonSecMat);
    rightStrip.position.set(0.48, 0.23, 0.1);
    const leftStrip = rightStrip.clone();
    leftStrip.position.x = -0.48;
    ship.add(rightStrip, leftStrip);

    // Vertical Tail Fins
    const rightFin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.55), hullMat);
    rightFin.position.set(0.32, 0.45, -0.7);
    const leftFin = rightFin.clone();
    leftFin.position.x = -0.32;
    ship.add(rightFin, leftFin);

    // Twin Vector Thruster Nozzles
    const rightNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.24, 0.65, 12).rotateX(Math.PI / 2),
      metalMat
    );
    rightNozzle.position.set(0.32, 0.26, -1.05);
    const leftNozzle = rightNozzle.clone();
    leftNozzle.position.x = -0.32;
    ship.add(rightNozzle, leftNozzle);

    // Center High-Output Rocket Plume
    const thrusterPlume = new THREE.Mesh(
      new THREE.ConeGeometry(0.26, 1.5, 8).rotateX(-Math.PI / 2),
      plumeMat
    );
    thrusterPlume.name = 'thruster_plume';
    thrusterPlume.position.set(0, 0.26, -1.8);
    ship.add(thrusterPlume);
  }

  // Common Underside Magnetic Levitation Glow Rails (hugging the tube track)
  const magRailGeom = new THREE.BoxGeometry(0.12, 0.04, 1.8);
  const rightMagRail = new THREE.Mesh(magRailGeom, neonMat);
  rightMagRail.position.set(0.3, 0.04, 0.1);
  const leftMagRail = rightMagRail.clone();
  leftMagRail.position.x = -0.3;
  ship.add(rightMagRail, leftMagRail);

  // --- Rich High-Precision Ship Detailing ---
  // 1. Holographic HUD Reticle floating ahead of cockpit
  const hudRingGeom = new THREE.RingGeometry(0.12, 0.14, 16);
  const hudRing = new THREE.Mesh(hudRingGeom, neonMat);
  hudRing.position.set(0, 0.52, 0.65);
  hudRing.rotation.x = -0.2;
  ship.add(hudRing);

  // 2. Twin High-Output Anti-Gravity Repulsor Discs under hull
  [-0.45, 0.45].forEach((zPos) => {
    const repulsorGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12);
    const repulsor = new THREE.Mesh(repulsorGeom, metalMat);
    repulsor.position.set(0, 0.03, zPos);

    const repulsorGlow = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 6, 16), neonMat);
    repulsorGlow.rotation.x = Math.PI / 2;
    repulsor.add(repulsorGlow);
    ship.add(repulsor);
  });

  // 3. RCS Attitude Micro-Thruster Clusters
  [-0.6, 0.6].forEach((xPos) => {
    const rcsGeom = new THREE.BoxGeometry(0.06, 0.06, 0.12);
    const rcsPod = new THREE.Mesh(rcsGeom, chromeMat);
    rcsPod.position.set(xPos, 0.26, 0.4);
    ship.add(rcsPod);
  });

  // 4. Glowing Afterburner Heat Rings on Exhaust Exit
  const heatRingGeom = new THREE.TorusGeometry(0.24, 0.035, 8, 20);
  const heatRing = new THREE.Mesh(heatRingGeom, neonSecMat);
  heatRing.position.set(0, 0.26, -1.25);
  ship.add(heatRing);

  // 5. Dorsal Telemetry Sensor Fin
  const sensorFinGeom = new THREE.BoxGeometry(0.03, 0.12, 0.4);
  const sensorFin = new THREE.Mesh(sensorFinGeom, chromeMat);
  sensorFin.position.set(0, 0.55, -0.4);
  ship.add(sensorFin);

  return ship;
}
