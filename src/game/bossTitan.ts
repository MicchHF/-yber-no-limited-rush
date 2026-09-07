import * as THREE from 'three';
import { ObstacleData } from '../types';
import { createCyberObstacleGroup } from './cyberObstacles';
import { sound } from '../services/sound';
import { cosmicTube } from './tubeCurve';

export interface BossCallbacks {
  onAlert: (message: string, type: 'warning' | 'info') => void;
  onDropObstacle: (obs: ObstacleData, customReason?: string) => void;
  onFirePlasma: (z: number, angle: number, speed?: number) => void;
  onBossDefeated: () => void;
}

export type BossAttackType =
  | 'none'
  | 'lasers'
  | 'carpet_bombs'
  | 'plasma_flurry'
  | 'pincer_strike'
  | 'chaotic_barrage'
  | 'singularity_pulse';

interface LaserBeamVisual {
  core: THREE.Mesh;
  halo: THREE.Mesh;
  groundDisc: THREE.Mesh;
  angle: number;
  active: boolean;
}

export class TitanBoss {
  public mesh: THREE.Group;
  public laserGroup: THREE.Group;
  public active: boolean = false;
  public z: number = 0;
  public angle: number = Math.PI / 2;
  public progressMeters: number = 0;
  public targetDistanceMeters: number = 6000;
  public currentAttack: BossAttackType = 'none';
  public attackWarning: string = '';
  public currentPhase: number = 1; // 1 to 4

  // Visual sub-elements
  private reactorCore: THREE.Mesh;
  private reactorRings: THREE.Mesh[];
  private thrusterFlames: THREE.Mesh[] = [];
  private plasmaCannons: THREE.Mesh[] = [];
  private coreLight: THREE.PointLight;
  private explosionGroup: THREE.Group;

  // 4 Volumetric 3D Laser Beams & Ground Targeting Discs
  private laserVisuals: LaserBeamVisual[] = [];
  private laserCoreMat: THREE.MeshBasicMaterial;
  private laserHaloMat: THREE.MeshBasicMaterial;
  private groundDiscMat: THREE.MeshBasicMaterial;
  public isLaserLethal: boolean = false;

  // Combat State Machine & High-Frequency AI
  private attackTimer: number = 0;
  private attackPhaseTime: number = 0;
  private nextAttackIndex: number = 0;
  private isDefeated: boolean = false;
  private defeatTimer: number = 0;
  private lastPhaseReported: number = 1;
  private callbacks?: BossCallbacks;

  // Predictive Tracking & Anti-Circling Intelligence
  private lastPlayerAngle: number = 0;
  private playerAngularVelocity: number = 0;
  private circlingDuration: number = 0;
  private chaosTimer: number = 0;
  private chaosAngleOffset: number = 0;
  private plasmaShotCounter: number = 0;
  private mineWaveCounter: number = 0;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.visible = false;
    this.laserGroup = new THREE.Group();

    // Scale up Dreadnought by 1.35x for imposing horizon presence
    this.mesh.scale.set(1.35, 1.35, 1.35);

    // Materials
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x0c0212,
      metalness: 0.95,
      roughness: 0.15,
    });
    const armorPlateMat = new THREE.MeshStandardMaterial({
      color: 0x240410,
      metalness: 0.88,
      roughness: 0.28,
    });
    const crimsonGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
    });
    const purpleGlowMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
    });
    const darkMatterMat = new THREE.MeshBasicMaterial({
      color: 0x05000a,
    });

    // 1. Central Superstructure (Dreadnought Command Citadel)
    const citadelGeom = new THREE.BoxGeometry(4.6, 2.4, 15.5);
    const citadel = new THREE.Mesh(citadelGeom, hullMat);
    citadel.position.set(0, 1.5, 0);
    this.mesh.add(citadel);

    // Glowing Crimson Bridge Visor
    const bridgeGeom = new THREE.BoxGeometry(4.0, 0.5, 4.2);
    const bridge = new THREE.Mesh(bridgeGeom, crimsonGlowMat);
    bridge.position.set(0, 2.4, 3.5);
    this.mesh.add(bridge);

    // 2. Twin Massive Catamaran Outriggers / Heavy Armor Wings
    [-5.2, 5.2].forEach((xSide) => {
      // Main heavy wing sponson
      const wingGeom = new THREE.BoxGeometry(3.6, 1.8, 18.0);
      const wing = new THREE.Mesh(wingGeom, armorPlateMat);
      wing.position.set(xSide, 1.1, -1.0);
      this.mesh.add(wing);

      // Angled razor armor prow
      const razorGeom = new THREE.ConeGeometry(1.8, 7.0, 4);
      razorGeom.rotateX(Math.PI / 2);
      const razor = new THREE.Mesh(razorGeom, hullMat);
      razor.position.set(xSide, 1.1, 9.5);
      this.mesh.add(razor);

      // Crimson Energy Siphon Conduits along wings
      const conduitGeom = new THREE.BoxGeometry(0.35, 0.45, 16.0);
      const conduit = new THREE.Mesh(conduitGeom, crimsonGlowMat);
      conduit.position.set(xSide > 0 ? xSide + 1.7 : xSide - 1.7, 1.2, -1.0);
      this.mesh.add(conduit);

      // Twin Heavy Thruster Blocks on each wing
      [-0.9, 0.9].forEach((subX) => {
        const thrusterGeom = new THREE.CylinderGeometry(0.9, 1.1, 4.5, 10);
        thrusterGeom.rotateX(Math.PI / 2);
        const thruster = new THREE.Mesh(thrusterGeom, hullMat);
        thruster.position.set(xSide + subX, 1.0, -10.0);
        this.mesh.add(thruster);

        // Blazing ion exhaust plume
        const flameGeom = new THREE.ConeGeometry(1.0, 9.0, 10);
        flameGeom.rotateX(-Math.PI / 2);
        const flameMat = new THREE.MeshBasicMaterial({
          color: xSide > 0 ? 0xff0044 : 0x8b5cf6,
          transparent: true,
          opacity: 0.95,
        });
        const flame = new THREE.Mesh(flameGeom, flameMat);
        flame.position.set(xSide + subX, 1.0, -14.5);
        this.mesh.add(flame);
        this.thrusterFlames.push(flame);
      });

      // Twin Heavy Annihilator Plasma Cannons on wings
      const cannonGeom = new THREE.CylinderGeometry(0.5, 0.7, 5.0, 8);
      cannonGeom.rotateX(Math.PI / 2);
      const cannon = new THREE.Mesh(cannonGeom, crimsonGlowMat);
      cannon.position.set(xSide * 0.75, 0.6, 6.0);
      this.mesh.add(cannon);
      this.plasmaCannons.push(cannon);
    });

    // 3. Central Singularity Dark Matter Reactor Core
    const coreGeom = new THREE.SphereGeometry(2.1, 20, 20);
    this.reactorCore = new THREE.Mesh(coreGeom, darkMatterMat);
    this.reactorCore.position.set(0, 1.5, -2.8);
    this.mesh.add(this.reactorCore);

    // Orbiting Singularity Accretion Rings
    this.reactorRings = [];
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.16, 8, 32), crimsonGlowMat);
    ring1.rotation.x = Math.PI / 4;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.14, 8, 32), purpleGlowMat);
    ring2.rotation.y = Math.PI / 3;
    this.reactorCore.add(ring1, ring2);
    this.reactorRings.push(ring1, ring2);

    // Intense pulsating red point light
    this.coreLight = new THREE.PointLight(0xff0044, 25.0, 80);
    this.coreLight.position.set(0, 2.8, -2.2);
    this.mesh.add(this.coreLight);

    // 4. Volumetric 3D Laser Beams & Ground Target Reticles
    this.laserCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    this.laserHaloMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    this.groundDiscMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    // Create 4 Volumetric Laser Columns + Ground Contact Discs
    for (let i = 0; i < 4; i++) {
      // Cylindrical beam with origin centered
      const beamCoreGeom = new THREE.CylinderGeometry(0.22, 0.28, 1, 8);
      const beamHaloGeom = new THREE.CylinderGeometry(0.55, 0.7, 1, 8);
      const coreMesh = new THREE.Mesh(beamCoreGeom, this.laserCoreMat);
      const haloMesh = new THREE.Mesh(beamHaloGeom, this.laserHaloMat);

      const discGeom = new THREE.RingGeometry(0.6, 2.6, 20);
      const groundDisc = new THREE.Mesh(discGeom, this.groundDiscMat);

      this.laserGroup.add(coreMesh);
      this.laserGroup.add(haloMesh);
      this.laserGroup.add(groundDisc);

      this.laserVisuals.push({
        core: coreMesh,
        halo: haloMesh,
        groundDisc,
        angle: 0,
        active: false,
      });
    }

    // 5. Explosion Group for Defeat Cinematic
    this.explosionGroup = new THREE.Group();
    this.explosionGroup.visible = false;
    this.mesh.add(this.explosionGroup);

    for (let i = 0; i < 18; i++) {
      const expMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff3300 : 0xffffff,
        transparent: true,
        opacity: 0.95,
      });
      const expSphere = new THREE.Mesh(new THREE.SphereGeometry(1.4 + Math.random() * 2.0, 8, 8), expMat);
      expSphere.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 18
      );
      this.explosionGroup.add(expSphere);
    }
  }

  public init(callbacks: BossCallbacks) {
    this.callbacks = callbacks;
  }

  public spawn(playerZ: number, playerAngle: number, targetDistanceMeters: number = 6000) {
    this.active = true;
    this.isDefeated = false;
    this.defeatTimer = 0;
    this.progressMeters = 0;
    this.targetDistanceMeters = targetDistanceMeters;
    this.attackTimer = 0;
    this.attackPhaseTime = 0;
    this.currentAttack = 'none';
    this.attackWarning = '';
    this.nextAttackIndex = 0;
    this.currentPhase = 1;
    this.lastPhaseReported = 1;
    this.lastPlayerAngle = playerAngle;
    this.playerAngularVelocity = 0;
    this.circlingDuration = 0;
    this.chaosTimer = 0;
    this.chaosAngleOffset = 0;
    this.plasmaShotCounter = 0;
    this.mineWaveCounter = 0;
    this.isLaserLethal = false;

    // Position Boss far ahead: 235m ahead for high-speed perspective and bullet-hell visibility
    this.z = playerZ + 240;
    this.angle = playerAngle;
    this.mesh.visible = true;
    this.explosionGroup.visible = false;
    this.setLaserBeamsActive(false);

    this.updateTransform();

    sound.playBossWarning();
    const alertMsg = `⚠️ ТРЕВОГА УРОВНЯ ОМЕГА! ФЛАГМАН «АРХИТЕКТОР БЕЗДНЫ» АТАКУЕТ! ЦЕЛЬ: ВЫЖИТЬ ${this.targetDistanceMeters} МЕТРОВ!`;
    this.callbacks?.onAlert(alertMsg, 'warning');
  }

  public update(delta: number, playerZ: number, playerSpeed: number, playerAngle: number) {
    if (!this.active) {
      this.setLaserBeamsActive(false);
      return;
    }

    // Progression and Phase Evolution across the battle
    const progressRatio = Math.min(1.0, Math.max(0, playerZ / this.targetDistanceMeters));
    let calculatedPhase = 1;
    if (progressRatio >= 0.75) calculatedPhase = 4;
    else if (progressRatio >= 0.50) calculatedPhase = 3;
    else if (progressRatio >= 0.25) calculatedPhase = 2;

    if (calculatedPhase !== this.lastPhaseReported) {
      this.lastPhaseReported = calculatedPhase;
      this.currentPhase = calculatedPhase;
      if (calculatedPhase === 2) {
        sound.playBossWarning();
        this.callbacks?.onAlert('⚠️ БОСС ФАЗА 2: ЗАПУСК КЛАСТЕРНЫХ МИН И ПЕРЕХВАТА МАНЕВРОВ!', 'warning');
      } else if (calculatedPhase === 3) {
        sound.playBossLaserSweep();
        this.callbacks?.onAlert('⚠️ БОСС ФАЗА 3: РАЗВЕРТЫВАНИЕ 4-ЛУЧЕВЫХ ОРБИТАЛЬНЫХ ЛАЗЕРОВ!', 'warning');
      } else if (calculatedPhase === 4) {
        sound.playBossWarning();
        this.callbacks?.onAlert('⚡ ФИНАЛЬНАЯ ФАЗА: ОВЕРДРАЙВ ТИТАНА! НЕПРЕРЫВНЫЙ ОГОНЬ!', 'warning');
      }
    }

    // 1. Dynamic tactical maneuvering distance (closer during dive attacks, farther during orbital strikes)
    let attackDistanceOffset = 0;
    switch (this.currentAttack) {
      case 'plasma_flurry':
      case 'pincer_strike':
        // Aggressive dive strafe - boss looms huge and close (165m - 175m ahead)
        attackDistanceOffset = -65;
        break;
      case 'carpet_bombs':
        // Low altitude bombing pass (185m ahead)
        attackDistanceOffset = -45;
        break;
      case 'lasers':
        // Pull back into high orbital altitude for sweeping laser vantage (275m - 290m ahead)
        attackDistanceOffset = 45;
        break;
      case 'singularity_pulse':
      case 'chaotic_barrage':
        attackDistanceOffset = -15;
        break;
      default:
        // Natural tactical hovering wave (+/- 20m)
        attackDistanceOffset = Math.sin(this.attackTimer * 1.1) * 20;
        break;
    }

    const baseLeadDistance = 230;
    const targetLead = THREE.MathUtils.clamp(baseLeadDistance + attackDistanceOffset, 155, 295);
    const desiredZ = playerZ + targetLead;
    this.z = THREE.MathUtils.lerp(this.z, desiredZ, Math.min(1, delta * 4.2));

    // 2. Animate visuals (reactor rings, thrusters, cannon flares)
    const ringSpeed = 1.2 + (this.currentPhase - 1) * 0.6;
    this.reactorRings[0].rotation.x += delta * 3.0 * ringSpeed;
    this.reactorRings[0].rotation.y += delta * 2.2 * ringSpeed;
    this.reactorRings[1].rotation.y += delta * 3.8 * ringSpeed;

    const flicker = 0.9 + Math.random() * 0.35 * this.currentPhase;
    this.thrusterFlames.forEach((flame) => {
      flame.scale.set(1.0, 1.0, flicker);
    });
    this.coreLight.intensity = (20.0 + Math.sin(this.attackTimer * (7.0 + this.currentPhase * 2)) * 10.0);

    // Handle Defeat Sequence
    if (this.isDefeated) {
      this.setLaserBeamsActive(false);
      this.defeatTimer += delta;
      this.explosionGroup.visible = true;

      this.explosionGroup.children.forEach((exp, idx) => {
        const s = 1.0 + Math.sin(this.defeatTimer * 14.0 + idx) * 0.8;
        exp.scale.set(s, s, s);
      });

      if (this.defeatTimer > 2.0) {
        this.mesh.scale.multiplyScalar(Math.max(0.01, 1 - delta * 5.0));
      }

      if (this.defeatTimer > 2.6) {
        this.active = false;
        this.mesh.visible = false;
        this.callbacks?.onBossDefeated();
      }
      this.updateTransform();
      return;
    }

    // 3. AI Tracking & Anti-Circling Intelligence
    // Calculate player's angular velocity around cylinder
    let dPlayerTheta = playerAngle - this.lastPlayerAngle;
    while (dPlayerTheta > Math.PI) dPlayerTheta -= Math.PI * 2;
    while (dPlayerTheta < -Math.PI) dPlayerTheta += Math.PI * 2;
    const instantVel = dPlayerTheta / Math.max(0.001, delta);
    this.playerAngularVelocity = THREE.MathUtils.lerp(
      this.playerAngularVelocity,
      instantVel,
      Math.min(1, delta * 8.0)
    );
    this.lastPlayerAngle = playerAngle;

    // Detect if player is constantly circling in one direction to cheat the tracking
    if (Math.abs(this.playerAngularVelocity) > 0.35) {
      this.circlingDuration += delta;
    } else {
      this.circlingDuration = Math.max(0, this.circlingDuration - delta * 2.2);
    }

    // Lead prediction: Boss aims where player will be, not where they were
    const leadTime = 0.85 + (this.currentPhase - 1) * 0.15;
    let predictedPlayerAngle = playerAngle + this.playerAngularVelocity * leadTime;

    // If player is continuously circling, lead even further ahead to cut them off!
    if (this.circlingDuration > 0.9) {
      const cutOffLead = Math.sign(this.playerAngularVelocity) * (0.45 + (this.currentPhase - 1) * 0.12);
      predictedPlayerAngle += cutOffLead;
    }

    // Periodic chaotic feint to break predictability
    this.chaosTimer += delta;
    if (this.chaosTimer > 3.6) {
      this.chaosTimer = 0;
      if (Math.random() < 0.4) {
        this.chaosAngleOffset = (Math.random() > 0.5 ? 1 : -1) * (0.75 + Math.random() * 0.65);
      } else {
        this.chaosAngleOffset = 0;
      }
    }

    // Smooth Dreadnought tracking towards predicted target angle
    this.attackTimer += delta;
    this.attackPhaseTime += delta;

    const weaveSpeed = 1.0 + (this.currentPhase - 1) * 0.4;
    const weaveAngle = Math.sin(this.attackTimer * weaveSpeed) * 0.35;
    const desiredAngle = predictedPlayerAngle + weaveAngle + this.chaosAngleOffset;

    let dAngle = desiredAngle - this.angle;
    while (dAngle > Math.PI) dAngle -= Math.PI * 2;
    while (dAngle < -Math.PI) dAngle += Math.PI * 2;
    const trackSpeed = 3.4 + (this.currentPhase - 1) * 0.8;
    this.angle += dAngle * Math.min(1, delta * trackSpeed);

    // 4. Combat Phase Cycle (High spam rate, varied attacks)
    this.updateCombatLoop(delta, playerZ, playerAngle, predictedPlayerAngle);

    this.updateTransform();
    this.updateLaserVisuals(playerZ);
  }

  /**
   * High-Frequency Combat Execution Loop
   */
  private updateCombatLoop(delta: number, playerZ: number, playerAngle: number, predictedAngle: number) {
    // Rest intervals between attacks are short and get shorter: 1.1s down to 0.35s!
    const restInterval = Math.max(0.35, 1.15 - (this.currentPhase - 1) * 0.25);

    if (this.currentAttack === 'none') {
      this.setLaserBeamsActive(false);

      if (this.attackPhaseTime >= restInterval) {
        this.attackPhaseTime = 0;
        this.plasmaShotCounter = 0;
        this.mineWaveCounter = 0;

        // Dynamic attack selection based on phase & player behavior
        let pool: BossAttackType[];
        if (this.circlingDuration > 1.2 && Math.random() < 0.75) {
          // If player is continuously circling, execute intercept pincer to counter!
          this.currentAttack = 'pincer_strike';
        } else {
          if (this.currentPhase === 1) {
            pool = ['plasma_flurry', 'lasers', 'carpet_bombs', 'singularity_pulse'];
          } else if (this.currentPhase === 2) {
            pool = ['pincer_strike', 'plasma_flurry', 'carpet_bombs', 'lasers', 'singularity_pulse'];
          } else if (this.currentPhase === 3) {
            pool = ['chaotic_barrage', 'lasers', 'pincer_strike', 'plasma_flurry', 'carpet_bombs'];
          } else {
            // Overdrive Phase 4: relentless chaos & quad lasers
            pool = ['chaotic_barrage', 'pincer_strike', 'lasers', 'plasma_flurry', 'carpet_bombs'];
          }
          this.currentAttack = pool[this.nextAttackIndex % pool.length];
          this.nextAttackIndex++;
        }

        this.executeAttackStart(playerAngle, predictedAngle);
      }
    } else {
      // Active Attack Execution
      switch (this.currentAttack) {
        case 'plasma_flurry':
          this.handlePlasmaFlurry(delta, predictedAngle);
          break;

        case 'lasers':
          this.handleLasers(delta, playerAngle);
          break;

        case 'carpet_bombs':
          this.handleCarpetBombs(delta, predictedAngle);
          break;

        case 'pincer_strike':
          this.handlePincerStrike(delta, playerAngle, predictedAngle);
          break;

        case 'chaotic_barrage':
          this.handleChaoticBarrage(delta);
          break;

        case 'singularity_pulse':
          if (this.attackPhaseTime > 1.8) {
            this.currentAttack = 'none';
            this.attackPhaseTime = 0;
          }
          break;
      }
    }
  }

  private executeAttackStart(playerAngle: number, predictedAngle: number) {
    switch (this.currentAttack) {
      case 'plasma_flurry':
        this.attackWarning = '⚠️ СНАЙПЕРСКИЙ ЗАЛП ПЛАЗМЫ! МАНЕВРИРУЙТЕ!';
        sound.playPlasmaBeamFire();
        break;

      case 'lasers':
        this.attackWarning = this.currentPhase >= 3
          ? '⚠️ ТРЕВОГА! 4-ЛУЧЕВОЙ ОРБИТАЛЬНЫЙ ЛАЗЕР!'
          : '⚠️ ЛАЗЕРНАЯ ЗАЧИСТКА СЕКТОРА! СМЕЩАЙТЕСЬ!';
        sound.playBossLaserSweep();
        break;

      case 'carpet_bombs':
        this.attackWarning = '⚠️ КОВРОВЫЙ СБРОС КЛАСТЕРНЫХ МИН!';
        sound.playBiomeEnemyDrop('quantum_horizon');
        break;

      case 'pincer_strike':
        this.attackWarning = '⚠️ ПЕРЕХВАТ МАНЕВРА: ТИТАН БЬЕТ НА ОПЕРЕЖЕНИЕ!';
        sound.playPlasmaBeamFire();
        break;

      case 'chaotic_barrage':
        this.attackWarning = '⚡ ХАОТИЧЕСКИЙ ЗАЛП ПУСТОТЫ ПО ВСЕМ СЕКТОРАМ!';
        sound.playBossWarning();
        break;

      case 'singularity_pulse':
        this.attackWarning = '⚠️ ГРАВИТАЦИОННЫЙ ВСПЛЕСК ЯДРА!';
        sound.playGravityVortex();
        break;
    }
  }

  /**
   * Attack 1: Rapid Predictive Plasma Flurry (3 to 5 bolts leading player)
   */
  private handlePlasmaFlurry(delta: number, predictedAngle: number) {
    const totalShots = this.currentPhase >= 3 ? 5 : (this.currentPhase === 2 ? 4 : 3);
    const shotInterval = 0.32;
    const targetShot = Math.floor(this.attackPhaseTime / shotInterval);

    if (targetShot > this.plasmaShotCounter && this.plasmaShotCounter < totalShots) {
      this.plasmaShotCounter++;
      // Leading spread angles: centers on predictedAngle with slight fan spread
      const offset = (this.plasmaShotCounter - (totalShots + 1) / 2) * 0.28;
      const shotAngle = predictedAngle + offset;
      // Spawn plasma bolt well ahead of player at high speed (65 m/s)
      this.callbacks?.onFirePlasma(this.z - 25, shotAngle, 65);
      sound.playPlasmaBeamFire();
    }

    if (this.attackPhaseTime > totalShots * shotInterval + 0.4) {
      this.currentAttack = 'none';
      this.attackPhaseTime = 0;
    }
  }

  /**
   * Attack 2: Volumetric Sweeping Lasers (2 or 4 beams with visible telegraph)
   */
  private handleLasers(delta: number, playerAngle: number) {
    const telegraphTime = 0.65; // 0.65s clear visual telegraph before lethal fire!
    const sweepDuration = 2.4;

    const isTelegraph = this.attackPhaseTime < telegraphTime;
    this.isLaserLethal = !isTelegraph;

    // Laser sweeps back and forth in wide arcs
    const sweepProgress = Math.sin((this.attackPhaseTime - telegraphTime) * (2.8 + (this.currentPhase - 1) * 0.6));
    const sweepSpread = 0.55 + (this.currentPhase - 1) * 0.1;

    // Laser beam angles
    const beamCount = this.currentPhase >= 3 ? 4 : 2;

    // Beam 0: Left sweep
    this.laserVisuals[0].angle = this.angle - sweepSpread + sweepProgress * 0.45;
    this.laserVisuals[0].active = true;

    // Beam 1: Right sweep
    this.laserVisuals[1].angle = this.angle + sweepSpread - sweepProgress * 0.45;
    this.laserVisuals[1].active = true;

    if (beamCount === 4) {
      // Beam 2 & 3: Outer crossfire beams
      this.laserVisuals[2].angle = this.angle - sweepSpread * 1.8 - sweepProgress * 0.35;
      this.laserVisuals[2].active = true;
      this.laserVisuals[3].angle = this.angle + sweepSpread * 1.8 + sweepProgress * 0.35;
      this.laserVisuals[3].active = true;
    } else {
      this.laserVisuals[2].active = false;
      this.laserVisuals[3].active = false;
    }

    // Material updates for clear visual telegraphing vs lethal firing
    if (isTelegraph) {
      // Warning phase: Flashing amber/orange, low opacity, ground reticle pulses
      const pulse = 0.25 + Math.sin(this.attackPhaseTime * 20.0) * 0.15;
      this.laserCoreMat.color.setHex(0xffffff);
      this.laserHaloMat.color.setHex(0xffaa00);
      this.groundDiscMat.color.setHex(0xffaa00);
      this.laserCoreMat.opacity = pulse * 0.6;
      this.laserHaloMat.opacity = pulse;
      this.groundDiscMat.opacity = pulse * 1.4;
    } else {
      // Lethal phase: Blazing fiery crimson/white, thick volumetric presence
      const lethalPulse = 0.85 + Math.sin(this.attackPhaseTime * 12.0) * 0.15;
      this.laserCoreMat.color.setHex(0xffffff);
      this.laserHaloMat.color.setHex(0xff0044);
      this.groundDiscMat.color.setHex(0xff0044);
      this.laserCoreMat.opacity = 0.95;
      this.laserHaloMat.opacity = lethalPulse;
      this.groundDiscMat.opacity = 0.95;
    }

    if (this.attackPhaseTime > telegraphTime + sweepDuration) {
      this.setLaserBeamsActive(false);
      this.currentAttack = 'none';
      this.attackPhaseTime = 0;
    }
  }

  /**
   * Attack 3: Cluster Mine Carpet (staggered drops with navigation lanes)
   */
  private handleCarpetBombs(delta: number, predictedAngle: number) {
    // Wave 1
    if (this.mineWaveCounter === 0 && this.attackPhaseTime >= 0.5) {
      this.mineWaveCounter = 1;
      this.dropClusterMines(predictedAngle, [-0.95, -0.32, 0.32, 0.95]);
    }
    // Wave 2 in later phases
    if (this.currentPhase >= 3 && this.mineWaveCounter === 1 && this.attackPhaseTime >= 1.2) {
      this.mineWaveCounter = 2;
      this.dropClusterMines(predictedAngle, [-0.64, 0, 0.64]);
    }

    if (this.attackPhaseTime > (this.currentPhase >= 3 ? 2.1 : 1.6)) {
      this.currentAttack = 'none';
      this.attackPhaseTime = 0;
    }
  }

  /**
   * Attack 4: Pincer / Intercept Strike (counters continuous circling)
   */
  private handlePincerStrike(delta: number, playerAngle: number, predictedAngle: number) {
    if (this.plasmaShotCounter === 0 && this.attackPhaseTime >= 0.4) {
      this.plasmaShotCounter = 1;
      // Intercept shot directly ahead of player's turning vector to cut them off
      const turnDir = Math.sign(this.playerAngularVelocity) || 1;
      const interceptAngle = playerAngle + turnDir * 0.65;
      this.callbacks?.onFirePlasma(this.z - 25, interceptAngle, 70);
      sound.playPlasmaBeamFire();
    }

    if (this.plasmaShotCounter === 1 && this.attackPhaseTime >= 0.85) {
      this.plasmaShotCounter = 2;
      // Trapping mine on player's trailing flank
      const turnDir = Math.sign(this.playerAngularVelocity) || 1;
      const trapAngle = playerAngle - turnDir * 0.45;
      this.dropSingleMine(trapAngle);
    }

    if (this.attackPhaseTime > 1.7) {
      this.currentAttack = 'none';
      this.attackPhaseTime = 0;
    }
  }

  /**
   * Attack 5: Chaotic Omnidirectional Void Barrage
   */
  private handleChaoticBarrage(delta: number) {
    if (this.plasmaShotCounter === 0 && this.attackPhaseTime >= 0.45) {
      this.plasmaShotCounter = 1;
      // 5 plasma bolts fanned across 5 sectors
      [-1.1, -0.55, 0, 0.55, 1.1].forEach((off) => {
        this.callbacks?.onFirePlasma(this.z - 25, this.angle + off, 60);
      });
      sound.playPlasmaBeamFire();
    }

    if (this.mineWaveCounter === 0 && this.attackPhaseTime >= 0.95) {
      this.mineWaveCounter = 1;
      this.dropClusterMines(this.angle, [-0.8, 0.8]);
    }

    if (this.attackPhaseTime > 2.0) {
      this.currentAttack = 'none';
      this.attackPhaseTime = 0;
    }
  }

  private dropClusterMines(centerAngle: number, offsetAngles: number[]) {
    sound.playBiomeEnemyDrop('quantum_horizon');
    offsetAngles.forEach((off) => {
      this.dropSingleMine(centerAngle + off);
    });
  }

  private dropSingleMine(dropAngle: number) {
    const dropZ = this.z - 30; // Dropped ~205m ahead of player for fair reaction time!
    const created = createCyberObstacleGroup('quantum_mine', dropAngle);
    const center = cosmicTube.getCenter(dropZ);
    const frame = cosmicTube.getFrame(dropZ);
    created.group.position.copy(center);

    const rotMat = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.forward);
    created.group.setRotationFromMatrix(rotMat);

    this.callbacks?.onDropObstacle(
      {
        id: Math.floor(Math.random() * 1000000) + 700000,
        type: 'quantum_mine',
        mesh: created.group,
        z: dropZ,
        angle: dropAngle,
        depthZ: created.depthZ,
        blockedSectors: created.blockedSectors,
        safeCenter: created.safeCenter,
        isPickup: false,
        grazed: false,
      },
      'ПОДРЫВ НА КЛАСТЕРНОЙ МИНЕ ПУСТОТЫ'
    );
  }

  /**
   * Updates 3D volumetric laser beam geometries and ground contact discs
   */
  private updateLaserVisuals(playerZ: number) {
    const bossSurfacePos = this.mesh.position;
    const impactZ = Math.max(playerZ - 10, this.z - 235);

    this.laserVisuals.forEach((vis) => {
      if (!vis.active) {
        vis.core.visible = false;
        vis.halo.visible = false;
        vis.groundDisc.visible = false;
        return;
      }

      vis.core.visible = true;
      vis.halo.visible = true;
      vis.groundDisc.visible = true;

      // Surface impact point on track cylinder
      const impactPos = cosmicTube.getSurfacePoint(impactZ, vis.angle, 0.08);

      // Midpoint between boss and surface impact
      const mid = new THREE.Vector3().addVectors(bossSurfacePos, impactPos).multiplyScalar(0.5);
      const dist = bossSurfacePos.distanceTo(impactPos);

      // Position and orient laser core cylinder
      vis.core.position.copy(mid);
      vis.core.scale.set(1, dist, 1);
      vis.core.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), impactPos.clone().sub(bossSurfacePos).normalize());

      // Position and orient laser halo cylinder
      vis.halo.position.copy(mid);
      vis.halo.scale.set(1, dist, 1);
      vis.halo.quaternion.copy(vis.core.quaternion);

      // Position and orient ground impact disc flat on cylinder surface
      vis.groundDisc.position.copy(impactPos);
      const normal = cosmicTube.getRadialNormal(impactZ, vis.angle);
      const tangent = cosmicTube.getTangent(impactZ);
      const lateral = new THREE.Vector3().crossVectors(normal, tangent).normalize();
      const discRotMat = new THREE.Matrix4().makeBasis(lateral, normal, tangent);
      vis.groundDisc.setRotationFromMatrix(discRotMat);
      // Flat against surface
      vis.groundDisc.rotateX(Math.PI / 2);
    });
  }

  private setLaserBeamsActive(active: boolean) {
    this.isLaserLethal = false;
    this.laserVisuals.forEach((vis) => {
      vis.active = active;
      vis.core.visible = active;
      vis.halo.visible = active;
      vis.groundDisc.visible = active;
    });
    if (!active) {
      this.laserCoreMat.opacity = 0;
      this.laserHaloMat.opacity = 0;
      this.groundDiscMat.opacity = 0;
    }
  }

  /**
   * Called when player completes the trial distance!
   */
  public triggerDefeat(customMessage?: string) {
    if (this.isDefeated) return;
    this.isDefeated = true;
    this.defeatTimer = 0;
    this.setLaserBeamsActive(false);
    sound.playBossDefeat();
    this.callbacks?.onAlert(
      customMessage || '🏆 РЕАКТОР ТИТАНА ВЗОРВАН! ФЛАГМАН «АРХИТЕКТОР БЕЗДНЫ» ПОВЕРЖЕН!',
      'info'
    );
  }

  /**
   * 100% accurate collision check: matches visible beam angles on the ground
   */
  public checkLaserHit(playerZ: number, playerAngle: number): boolean {
    if (this.currentAttack !== 'lasers' || !this.isLaserLethal) return false;
    // Check if player is traversing through the laser strike corridor
    if (playerZ < this.z - 260 || playerZ > this.z) return false;

    // Check against all active lethal beams
    for (const vis of this.laserVisuals) {
      if (!vis.active) continue;
      let diff = Math.abs(playerAngle - vis.angle) % (Math.PI * 2);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;

      // 0.28 rad corresponds to ~2.5m corridor on track surface
      if (diff < 0.28) {
        return true;
      }
    }

    return false;
  }

  private updateTransform() {
    const hoverHeight = 4.2; // Majestic high-altitude cruiser above track
    const pos = cosmicTube.getSurfacePoint(this.z, this.angle, hoverHeight);
    this.mesh.position.copy(pos);

    const normal = cosmicTube.getRadialNormal(this.z, this.angle);
    const tangent = cosmicTube.getTangent(this.z);
    const lateral = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    const rotMatrix = new THREE.Matrix4().makeBasis(lateral, normal, tangent);
    this.mesh.setRotationFromMatrix(rotMatrix);
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.mesh);
    scene.remove(this.laserGroup);

    this.mesh.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material?.dispose();
        }
      }
    });

    this.laserGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material?.dispose();
        }
      }
    });
  }
}
