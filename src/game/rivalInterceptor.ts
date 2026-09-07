import * as THREE from 'three';
import { ObstacleData } from '../types';
import { createCyberObstacleGroup } from './cyberObstacles';
import { sound } from '../services/sound';
import { cosmicTube } from './tubeCurve';

export type RivalState = 'idle' | 'overtaking' | 'lead_taunt' | 'dropping' | 'warp_away';

export interface RivalAttackCallbacks {
  onDropMine?: (mineData: ObstacleData) => void;
  onFirePlasma?: (z: number, angle: number) => void;
  onFireCryoShard?: (z: number, angle: number) => void;
  onDeploySingularity?: (z: number, angle: number) => void;
  onAlert?: (message: string, type: 'warning' | 'info') => void;
}

export type BiomeRivalType = 'neo_metropolis' | 'inferno_core' | 'cryo_void' | 'quantum_horizon';

export class RivalInterceptor {
  public mesh: THREE.Group;
  public state: RivalState = 'idle';
  public z: number = 0;
  public angle: number = 0;
  public targetAngle: number = 0;
  public speed: number = 0;
  public active: boolean = false;
  public currentBiomeId: BiomeRivalType = 'neo_metropolis';

  private stateTimer: number = 0;
  private minesDropped: number = 0;
  private maxMinesToDrop: number = 2;
  private nextDropTimer: number = 0;
  private dropInterval: number = 2.0;
  private targetLeadDist: number = 145;
  private minLeadDist: number = 120;
  private difficultyFactor: number = 0;

  // Visual sub-elements
  private shipGroups: Record<BiomeRivalType, THREE.Group>;
  private targetReticle: THREE.Group;
  private laserBeams: THREE.LineSegments;
  private laserBeamMat: THREE.LineBasicMaterial;
  private afterburnerLight: THREE.PointLight;
  private preDropLight: THREE.PointLight;

  // Animated elements inside ships
  private policeSirens?: { red: THREE.Mesh; blue: THREE.Mesh };
  private pyroCores?: THREE.Mesh[];
  private cryoRotor?: THREE.Group;
  private quantumRings?: THREE.Mesh[];

  private callbacks?: RivalAttackCallbacks;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.visible = false;

    // Build the 4 distinct biome rival ships
    const police = this.buildPoliceInterceptor();
    const pyro = this.buildPyroclastCruiser();
    const cryo = this.buildFrostViperFighter();
    const quantum = this.buildSingularityPhantom();

    this.shipGroups = {
      neo_metropolis: police,
      inferno_core: pyro,
      cryo_void: cryo,
      quantum_horizon: quantum,
    };

    this.mesh.add(police, pyro, cryo, quantum);

    // 85-Meter Ground-Targeting Guide Beams projecting backwards towards player
    // This gives generous advance warning of the enemy's line on the tube surface!
    const beamLength = 85;
    const beamGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.2, 0, 0),
      new THREE.Vector3(-1.4, -2.8, -beamLength),
      new THREE.Vector3(2.2, 0, 0),
      new THREE.Vector3(1.4, -2.8, -beamLength),
    ]);
    this.laserBeamMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.92,
    });
    this.laserBeams = new THREE.LineSegments(beamGeom, this.laserBeamMat);
    this.mesh.add(this.laserBeams);

    // High-visibility 3D Reticle on track surface
    this.targetReticle = new THREE.Group();
    const reticleGeom = new THREE.RingGeometry(1.6, 1.85, 4);
    reticleGeom.rotateZ(Math.PI / 4);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const reticleMesh = new THREE.Mesh(reticleGeom, reticleMat);
    this.targetReticle.add(reticleMesh);
    this.targetReticle.position.set(0, 2.4, 0);
    this.mesh.add(this.targetReticle);

    // Afterburner lighting
    this.afterburnerLight = new THREE.PointLight(0x00f0ff, 4.0, 36);
    this.afterburnerLight.position.set(0, 1.2, -2.0);
    this.mesh.add(this.afterburnerLight);

    // Pre-Drop Weapon Charge-Up Warning Light (flashes before mine is dropped)
    this.preDropLight = new THREE.PointLight(0xff0044, 0, 25);
    this.preDropLight.position.set(0, -0.6, -1.0);
    this.mesh.add(this.preDropLight);
  }

  // ==========================================================================
  // SHIP 1: ENFORCER X-1 (Neo Metropolis Police Interceptor)
  // Sleek carbon composite delta fighter with high-frequency police lightbars
  // ==========================================================================
  private buildPoliceInterceptor(): THREE.Group {
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x0c1222,
      roughness: 0.2,
      metalness: 0.9,
    });
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.7,
    });
    const visorMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.98,
    });
    const sirenRedMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const sirenBlueMat = new THREE.MeshBasicMaterial({ color: 0x0066ff });

    // Fuselage
    const noseGeom = new THREE.ConeGeometry(1.0, 5.2, 5);
    noseGeom.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(noseGeom, hullMat);
    group.add(fuselage);

    // Cockpit visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.26, 1.5), visorMat);
    visor.position.set(0, 0.45, 0.9);
    group.add(visor);

    // Swept delta wings
    const wingGeom = new THREE.BoxGeometry(7.2, 0.16, 2.6);
    const wings = new THREE.Mesh(wingGeom, hullMat);
    wings.position.set(0, 0.1, -0.6);
    group.add(wings);

    // Wingtips with Police Siren Strobes
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.7), sirenRedMat);
    s1.position.set(-3.5, 0.18, -0.6);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.7), sirenBlueMat);
    s2.position.set(3.5, 0.18, -0.6);
    group.add(s1, s2);
    this.policeSirens = { red: s1, blue: s2 };

    // Twin canted vertical fins
    [-1.8, 1.8].forEach((xPos, idx) => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 1.8), armorMat);
      fin.position.set(xPos, 0.75, -1.3);
      fin.rotation.z = idx === 0 ? -0.28 : 0.28;
      group.add(fin);
    });

    // Twin High-Power Jet Turbines
    [-0.95, 0.95].forEach((xPos) => {
      const engine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.48, 2.4, 10),
        armorMat
      );
      engine.geometry.rotateX(Math.PI / 2);
      engine.position.set(xPos, 0.12, -1.2);
      group.add(engine);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 2.8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 })
      );
      flame.name = 'flame';
      flame.geometry.rotateX(-Math.PI / 2);
      flame.position.set(xPos, 0.12, -2.6);
      group.add(flame);
    });

    return group;
  }

  // ==========================================================================
  // SHIP 2: PYROCLAST (Inferno Core Magma Dread-Cruiser)
  // Heavy dual-prow catamaran dreadnought with lava vents and molten boilers
  // ==========================================================================
  private buildPyroclastCruiser(): THREE.Group {
    const group = new THREE.Group();
    const basaltMat = new THREE.MeshStandardMaterial({
      color: 0x180502,
      roughness: 0.7,
      metalness: 0.3,
    });
    const magmaMat = new THREE.MeshBasicMaterial({
      color: 0xff3300,
    });
    const heatGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.92,
    });

    // Dual catamaran forward battle horns
    [-1.4, 1.4].forEach((xPos) => {
      const hornGeom = new THREE.ConeGeometry(0.75, 5.6, 4);
      hornGeom.rotateX(Math.PI / 2);
      const horn = new THREE.Mesh(hornGeom, basaltMat);
      horn.position.set(xPos, 0, 0.6);
      group.add(horn);

      // Glowing magma leading edge
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 3.8), magmaMat);
      edge.position.set(xPos, 0.25, 0.6);
      group.add(edge);
    });

    // Central Heavy Molten Boiler Core
    const coreGeom = new THREE.CylinderGeometry(1.2, 1.2, 3.2, 10);
    coreGeom.rotateX(Math.PI / 2);
    const core = new THREE.Mesh(coreGeom, basaltMat);
    core.position.set(0, 0.3, -0.4);
    group.add(core);

    // Glowing Lava Vent Grates
    const vent = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 2.2), magmaMat);
    vent.position.set(0, 0.7, -0.4);
    group.add(vent);

    // Heavy Jagged Armor Wings
    const wingGeom = new THREE.BoxGeometry(8.2, 0.35, 2.2);
    const wings = new THREE.Mesh(wingGeom, basaltMat);
    wings.position.set(0, 0.1, -1.0);
    group.add(wings);

    // Massive Molten Rocket Exhaust Nozzles
    [-1.4, 0, 1.4].forEach((xPos) => {
      const thruster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.65, 1.8, 8),
        basaltMat
      );
      thruster.geometry.rotateX(Math.PI / 2);
      thruster.position.set(xPos, 0.1, -2.1);
      group.add(thruster);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 3.4, 8),
        heatGlowMat
      );
      flame.name = 'flame';
      flame.geometry.rotateX(-Math.PI / 2);
      flame.position.set(xPos, 0.1, -3.8);
      group.add(flame);
    });

    this.pyroCores = [vent];
    return group;
  }

  // ==========================================================================
  // SHIP 3: FROST VIPER (Cryo Void Stasis Needle-Fighter)
  // Slender aerodynamic crystalline lance with rotating dorsal stasis gyro
  // ==========================================================================
  private buildFrostViperFighter(): THREE.Group {
    const group = new THREE.Group();
    const frostHullMat = new THREE.MeshStandardMaterial({
      color: 0xdbeafe,
      roughness: 0.15,
      metalness: 0.65,
    });
    const iceCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x99f6e4,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      transmission: 0.75,
      thickness: 1.0,
    });
    const stasisGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
    });

    // Forward Razor Crystal Lance
    const needleGeom = new THREE.ConeGeometry(0.7, 6.4, 6);
    needleGeom.rotateX(Math.PI / 2);
    const needle = new THREE.Mesh(needleGeom, frostHullMat);
    needle.position.set(0, 0.1, 1.2);
    group.add(needle);

    // Translucent razor ice needle tip
    const lanceTip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.6, 5), iceCrystalMat);
    lanceTip.geometry.rotateX(Math.PI / 2);
    lanceTip.position.set(0, 0.1, 4.4);
    group.add(lanceTip);

    // Swept forward razor ice wings
    const wingGeom = new THREE.BoxGeometry(6.4, 0.12, 3.2);
    const wings = new THREE.Mesh(wingGeom, iceCrystalMat);
    wings.position.set(0, 0.05, -0.6);
    wings.rotation.x = 0.08;
    group.add(wings);

    // Dorsal Rotating Cryo Stasis Ring
    const rotorGroup = new THREE.Group();
    rotorGroup.name = 'cryo_rotor';
    rotorGroup.position.set(0, 0.75, -0.4);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.12, 6, 20),
      stasisGlowMat
    );
    rotorGroup.add(ring);
    group.add(rotorGroup);
    this.cryoRotor = rotorGroup;

    // Triple Sub-Zero Thruster Emitters
    [-0.8, 0.8].forEach((xPos) => {
      const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 2.0, 8), frostHullMat);
      eng.geometry.rotateX(Math.PI / 2);
      eng.position.set(xPos, 0.1, -1.4);
      group.add(eng);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 2.8, 8),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.85 })
      );
      flame.name = 'flame';
      flame.geometry.rotateX(-Math.PI / 2);
      flame.position.set(xPos, 0.1, -2.8);
      group.add(flame);
    });

    return group;
  }

  // ==========================================================================
  // SHIP 4: SINGULARITY (Quantum Horizon Phase-Cruiser)
  // Non-Euclidean ship with disconnected floating wings and black hole core
  // ==========================================================================
  private buildSingularityPhantom(): THREE.Group {
    const group = new THREE.Group();
    const voidMat = new THREE.MeshStandardMaterial({
      color: 0x110220,
      roughness: 0.1,
      metalness: 0.95,
    });
    const acidGreenMat = new THREE.MeshBasicMaterial({
      color: 0x39ff14,
    });
    const singularityMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0xc026d3,
      transparent: true,
      opacity: 0.9,
    });

    // Central Singularity Core (Black Sphere with Swirling Violet Horizon)
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), singularityMat);
    core.position.set(0, 0.4, 0);
    group.add(core);

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.09, 8, 24), horizonMat);
    ring1.rotation.x = Math.PI / 3;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.07, 8, 24), acidGreenMat);
    ring2.rotation.y = Math.PI / 4;
    group.add(ring1, ring2);
    this.quantumRings = [ring1, ring2];

    // Levitating Disconnected Wing Pylons (Floating with no physical struts!)
    [-2.8, 2.8].forEach((xPos) => {
      const pylonGeom = new THREE.BoxGeometry(1.1, 0.45, 4.2);
      const pylon = new THREE.Mesh(pylonGeom, voidMat);
      pylon.position.set(xPos, 0.2, -0.3);
      group.add(pylon);

      // Acid-green tachyon drive edge
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 4.3), acidGreenMat);
      strip.position.set(xPos > 0 ? xPos + 0.5 : xPos - 0.5, 0.2, -0.3);
      group.add(strip);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 3.2, 8),
        new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.9 })
      );
      flame.name = 'flame';
      flame.geometry.rotateX(-Math.PI / 2);
      flame.position.set(xPos, 0.2, -2.8);
      group.add(flame);
    });

    return group;
  }

  public init(callbacks: RivalAttackCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Configures visual ship model, targeting beams, and lighting for the active biome
   */
  private applyBiomeStyle(biomeId: BiomeRivalType) {
    this.currentBiomeId = biomeId;

    // Show only the ship model matching active biome
    (Object.keys(this.shipGroups) as BiomeRivalType[]).forEach((bKey) => {
      this.shipGroups[bKey].visible = bKey === biomeId;
    });

    switch (biomeId) {
      case 'inferno_core':
        this.laserBeamMat.color.setHex(0xff3300);
        this.afterburnerLight.color.setHex(0xff4500);
        this.mesh.scale.set(1.5, 1.4, 1.5);
        break;

      case 'cryo_void':
        this.laserBeamMat.color.setHex(0x00f0ff);
        this.afterburnerLight.color.setHex(0x00f0ff);
        this.mesh.scale.set(1.4, 1.35, 1.45);
        break;

      case 'quantum_horizon':
        this.laserBeamMat.color.setHex(0x39ff14);
        this.afterburnerLight.color.setHex(0x39ff14);
        this.mesh.scale.set(1.4, 1.4, 1.4);
        break;

      case 'neo_metropolis':
      default:
        this.laserBeamMat.color.setHex(0x00f0ff);
        this.afterburnerLight.color.setHex(0x00f0ff);
        this.mesh.scale.set(1.4, 1.4, 1.4);
        break;
    }
  }

  /**
   * Spawns the interceptor drone BEHIND the player and initiates high-speed overtake.
   * Distance and mine capacity adapt directly to progression difficulty.
   */
  public spawn(
    playerZ: number,
    playerAngle: number,
    playerSpeed: number,
    biomeId: string = 'neo_metropolis',
    difficultyFactor: number = 0
  ) {
    this.active = true;
    this.state = 'overtaking';
    this.stateTimer = 0;
    this.minesDropped = 0;
    this.nextDropTimer = 0;
    this.difficultyFactor = difficultyFactor;

    // Lead distance: 155m in early game down to 125m at peak 12,000m
    // (Greatly increased from previous 95m, giving ample reaction time as requested!)
    this.targetLeadDist = THREE.MathUtils.lerp(155, 125, difficultyFactor);
    this.minLeadDist = THREE.MathUtils.lerp(130, 105, difficultyFactor);

    // Number of mines to drop scales with progression
    if (difficultyFactor < 0.25) {
      this.maxMinesToDrop = 1;
      this.dropInterval = 2.4;
    } else if (difficultyFactor < 0.65) {
      this.maxMinesToDrop = 2;
      this.dropInterval = 1.9;
    } else {
      this.maxMinesToDrop = 3;
      this.dropInterval = 1.45;
    }

    const bId = (biomeId as BiomeRivalType) || 'neo_metropolis';
    this.applyBiomeStyle(bId);

    // Start behind player and initiate surge
    this.z = playerZ - 16;
    const sideOffset = (Math.random() > 0.5 ? 1 : -1) * 0.45;
    this.angle = playerAngle + sideOffset;
    this.targetAngle = playerAngle;
    this.speed = playerSpeed + 80;

    this.mesh.visible = true;
    this.updateTransform();

    sound.playEnemyWarning();
    sound.playEnemyFlyby();

    if (bId === 'inferno_core') {
      this.callbacks?.onAlert?.('🔥 ТРЕВОГА! ТЯЖЕЛЫЙ КОРСАР «ПИРОКЛАСТ» ВЫШЕЛ НА ПЕРЕХВАТ!', 'warning');
    } else if (bId === 'cryo_void') {
      this.callbacks?.onAlert?.('❄️ ОПАСНОСТЬ! ЛЕДЯНОЙ ОХОТНИК «ФРОСТ-ВАЙПЕР» ПЕРЕХВАТЫВАЕТ ТРАССУ!', 'warning');
    } else if (bId === 'quantum_horizon') {
      this.callbacks?.onAlert?.('🌌 АНОМАЛИЯ! ХРОНО-ФАНТОМ «СИНГУЛЯРНОСТЬ» ИСКАЖАЕТ ПРОСТРАНСТВО!', 'warning');
    } else {
      this.callbacks?.onAlert?.('🚨 ВНИМАНИЕ! ПОЛИЦЕЙСКИЙ ПЕРЕХВАТЧИК ENFORCER X-1 БЛОКИРУЕТ КУРС!', 'warning');
    }
  }

  public update(delta: number, playerZ: number, playerSpeed: number, playerAngle: number) {
    if (!this.active) return;

    this.stateTimer += delta;
    const desiredZ = playerZ + this.targetLeadDist;

    // Calculate shortest angular difference around the cylinder
    let dAngle = playerAngle - this.angle;
    while (dAngle > Math.PI) dAngle -= Math.PI * 2;
    while (dAngle < -Math.PI) dAngle += Math.PI * 2;

    switch (this.state) {
      case 'overtaking': {
        // Accelerates smoothly past player into the distance
        this.speed = Math.max(playerSpeed + 90, 150);
        this.z += this.speed * delta;

        if (this.z < playerZ - 20) {
          this.z = playerZ - 16;
        }

        // Once established safe generous lead ahead
        if (this.z >= desiredZ) {
          this.state = 'lead_taunt';
          this.stateTimer = 0;
          if (this.currentBiomeId === 'inferno_core') {
            this.callbacks?.onAlert?.('💥 «ПИРОКЛАСТ» ЗАХВАТИЛ КУРС ПЛАЗМЕННЫМ ПРИЦЕЛОМ!', 'warning');
          } else if (this.currentBiomeId === 'cryo_void') {
            this.callbacks?.onAlert?.('🧊 «ФРОСТ-ВАЙПЕР» НАВОДИТ СТАЗИСНЫЙ КРИО-ИЗЛУЧАТЕЛЬ!', 'warning');
          } else if (this.currentBiomeId === 'quantum_horizon') {
            this.callbacks?.onAlert?.('🌀 «СИНГУЛЯРНОСТЬ» ИСКАЖАЕТ ПРОСТРАНСТВО ПЕРЕД ВАМИ!', 'warning');
          } else {
            this.callbacks?.onAlert?.('⚡ ENFORCER X-1 ПЕРЕРЕЗАЕТ ВАШУ ТРАЕКТОРИЮ!', 'warning');
          }
        }
        break;
      }

      case 'lead_taunt': {
        // Strictly maintains generous lead distance directly in front
        this.z = Math.max(playerZ + this.minLeadDist, THREE.MathUtils.lerp(this.z, desiredZ, Math.min(1, delta * 7.0)));
        this.speed = playerSpeed;

        // Tracks player movements with slight predictive weaving
        const weaveOffset = Math.sin(this.stateTimer * 2.4) * 0.4;
        this.angle += (dAngle + weaveOffset) * Math.min(1, delta * 4.0);

        // After 3.5 seconds of active harassment, prepare to deploy traps
        if (this.stateTimer > 3.5) {
          this.state = 'dropping';
          this.stateTimer = 0;
          this.minesDropped = 0;
          this.nextDropTimer = 0.9; // 0.9s charge-up telegraph before attack

          if (this.currentBiomeId === 'inferno_core') {
            this.callbacks?.onAlert?.('⚠️ «ПИРОКЛАСТ» ЗАРЯЖАЕТ ПЛАЗМЕННЫЙ ЛУЧ АННИГИЛЯЦИИ!', 'warning');
          } else if (this.currentBiomeId === 'cryo_void') {
            this.callbacks?.onAlert?.('⚠️ «ФРОСТ-ВАЙПЕР» ГОТОВИТ КРИО-ЗАМОРОЗКУ РУЛЕЙ!', 'warning');
          } else if (this.currentBiomeId === 'quantum_horizon') {
            this.callbacks?.onAlert?.('⚠️ «СИНГУЛЯРНОСТЬ» ГЕНЕРИРУЕТ ГРАВИТАЦИОННУЮ ВОРОНКУ!', 'warning');
          } else {
            this.callbacks?.onAlert?.('⚠️ ПЕРЕХВАТЧИК СБРАСЫВАЕТ ЭЛЕКТРОМАГНИТНЫЕ EMP-МИНЫ!', 'warning');
          }
        }
        break;
      }

      case 'dropping': {
        // Maintains lead distance in front of player
        this.z = Math.max(playerZ + this.minLeadDist, THREE.MathUtils.lerp(this.z, desiredZ, Math.min(1, delta * 7.0)));
        this.speed = playerSpeed;

        // Follows player angle to telegraph placement
        this.angle += dAngle * Math.min(1, delta * 4.2);

        this.nextDropTimer -= delta;

        // Pre-drop warning beacon flares up when drop is imminent (< 0.75s)
        if (this.nextDropTimer <= 0.75 && this.minesDropped < this.maxMinesToDrop) {
          this.preDropLight.intensity = (0.75 - this.nextDropTimer) * 16.0;
        } else {
          this.preDropLight.intensity = THREE.MathUtils.lerp(this.preDropLight.intensity, 0, delta * 10.0);
        }

        if (this.nextDropTimer <= 0 && this.minesDropped < this.maxMinesToDrop) {
          this.executeBiomeAttack();
          this.minesDropped++;
          this.nextDropTimer = this.dropInterval;
          this.afterburnerLight.intensity = 8.5;
        }

        if (this.minesDropped >= this.maxMinesToDrop && this.nextDropTimer <= 0.4) {
          this.state = 'warp_away';
          this.stateTimer = 0;
          this.speed = Math.max(this.speed, playerSpeed + 75);
          sound.playEnemyWarp();
          this.callbacks?.onAlert?.('🚀 ПЕРЕХВАТЧИК ВКЛЮЧАЕТ ВАРП-УСКОРИТЕЛЬ И УХОДИТ В ОТРЫВ!', 'info');
        }
        break;
      }

      case 'warp_away': {
        // Rockets away into distant horizon
        this.speed = Math.max(this.speed, playerSpeed + 100) + 540 * delta;
        this.z += this.speed * delta;
        this.preDropLight.intensity = 0;

        const s = Math.max(0.05, 1.4 - this.stateTimer * 1.4);
        this.mesh.scale.set(s, s, s);

        if (this.stateTimer > 1.6 || this.z - playerZ > 420) {
          this.despawn();
        }
        break;
      }
    }

    // Biome-specific custom animations
    if (this.policeSirens) {
      const strobe = Math.floor(this.stateTimer * 12) % 2 === 0;
      this.policeSirens.red.visible = strobe;
      this.policeSirens.blue.visible = !strobe;
    }
    if (this.cryoRotor) {
      this.cryoRotor.rotation.z += delta * 4.5;
    }
    if (this.quantumRings) {
      this.quantumRings[0].rotation.z += delta * 3.2;
      this.quantumRings[1].rotation.x += delta * 2.8;
    }

    // Flicker thruster flames
    const activeGroup = this.shipGroups[this.currentBiomeId];
    if (activeGroup) {
      activeGroup.traverse((child) => {
        if (child.name === 'flame') {
          const fl = 0.9 + Math.random() * 0.35;
          child.scale.set(1.0, 1.0, this.state === 'warp_away' ? 2.5 + this.stateTimer * 4 : fl);
        }
      });
    }

    // Target reticle rotation
    this.targetReticle.rotation.z += delta * 3.0;

    // Quantum phase flicker in quantum horizon biome
    if (this.currentBiomeId === 'quantum_horizon' && this.state !== 'warp_away') {
      this.mesh.visible = Math.sin(this.stateTimer * 16.0) > -0.85;
    } else {
      this.mesh.visible = true;
    }

    this.updateTransform();
  }

  private executeBiomeAttack() {
    switch (this.currentBiomeId) {
      case 'inferno_core':
        // Attack 2: Fires high-visibility Magma Plasma Ball down the track toward player
        sound.playPlasmaBeamFire();
        this.callbacks?.onFirePlasma?.(this.z - 6, this.angle);
        break;

      case 'cryo_void':
        // Attack 3: Fires high-velocity Cryo Shard Missile down track
        sound.playPlasmaBeamFire();
        this.callbacks?.onFireCryoShard?.(this.z - 6, this.angle);
        break;

      case 'quantum_horizon':
        // Attack 4: Deploys gravitational singularity vortex pulling player towards it
        sound.playGravityVortex();
        this.callbacks?.onDeploySingularity?.(this.z - 26, this.angle);
        break;

      case 'neo_metropolis':
      default:
        // Attack 1: Tactical EMP Phantom Mine dropper
        this.dropMine();
        break;
    }
  }

  private dropMine() {
    sound.playEnemyDrop();

    let mineType = 'phantom_mine';
    if (this.currentBiomeId === 'inferno_core') mineType = 'magma_mine';
    if (this.currentBiomeId === 'cryo_void') mineType = 'cryo_mine';
    if (this.currentBiomeId === 'quantum_horizon') mineType = 'quantum_mine';

    // Place mine right on the surface just behind rival craft
    const mineZ = this.z - 4.5;
    const created = createCyberObstacleGroup(mineType, this.angle);

    const center = cosmicTube.getCenter(mineZ);
    const frame = cosmicTube.getFrame(mineZ);
    created.group.position.copy(center);
    const rotMatrix = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.forward);
    created.group.setRotationFromMatrix(rotMatrix);

    const mineData: ObstacleData = {
      id: Math.floor(Math.random() * 900000) + 100000,
      type: mineType as any,
      mesh: created.group,
      z: mineZ,
      angle: this.angle,
      depthZ: created.depthZ,
      blockedSectors: created.blockedSectors,
      safeCenter: created.safeCenter,
      grazed: false,
      collected: false,
      cleared: false,
    };

    this.callbacks?.onDropMine?.(mineData);
  }

  private updateTransform() {
    const pos = cosmicTube.getSurfacePoint(this.z, this.angle, 1.8);
    this.mesh.position.copy(pos);

    const frame = cosmicTube.getFrame(this.z);
    const normal = cosmicTube.getRadialNormal(this.z, this.angle);
    const tangent = frame.forward;
    const lateral = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    const basisMatrix = new THREE.Matrix4().makeBasis(lateral, normal, tangent);
    this.mesh.setRotationFromMatrix(basisMatrix);
  }

  public despawn() {
    this.active = false;
    this.state = 'idle';
    this.mesh.visible = false;
    this.mesh.scale.set(1.4, 1.4, 1.4);
    this.preDropLight.intensity = 0;
  }
}
