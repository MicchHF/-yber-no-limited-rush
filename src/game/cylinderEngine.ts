import * as THREE from 'three';
import {
  GameMode,
  LightingSettings,
  SpeedClass,
  VehicleDef,
  GhostFrame,
  PowerUpActive,
  ObstacleData,
  BiomeInfo,
  PickupFeedback,
  CyberObstacleType,
} from '../types';
import { createNeonBox } from './voxelModels';
import { buildCyberRacerShip } from './shipModel';
import { createCyberObstacleGroup, isAngleInSector, shortestAngleDist, normalizeAngle } from './cyberObstacles';
import { cosmicTube } from './tubeCurve';
import { NeonBikeTrail } from './trailSystem';
import { CyberpunkCityEnvironment } from './cyberpunkWorld';
import { getCyberTubeTexture } from './tubeTexture';
import { sound } from '../services/sound';
import { getBiomeForDistance, pickObstacleForBiome, BiomeConfig, BIOMES, isBossBiome, CYCLE_LENGTH, BOSS_START_DIST, BOSS_END_DIST } from './biomes';
import { RivalInterceptor } from './rivalInterceptor';
import { TitanBoss } from './bossTitan';
import { getWeeklyTrials, WeeklyTrialConfig, createMulberry32 } from './weeklyTrials';

export interface CylinderHUDState {
  speedKmh: number;
  speedClass: SpeedClass;
  smoothness: number;
  distance: number;
  timeMs: number;
  remainingTimeMs?: number;
  grazeStreak: number;
  coins: number;
  scrap: number;
  currentSector: number;
  rank: number;
  totalRacers: number;
  powerUps: PowerUpActive[];
  cylinderAngle: number;
  obstaclesRadar: {
    angle: number;
    safeCenter?: number;
    distZ: number;
    type: string;
    blockedSectors?: { minAngle: number; maxAngle: number; centerAngle?: number; halfArc?: number }[];
  }[];
  biome?: BiomeInfo;
  biomeBanner?: {
    nameRu: string;
    subtitle: string;
    color: string;
    show: boolean;
  };
  rivalAlert?: {
    message: string;
    type: 'warning' | 'info';
    show: boolean;
  };
  pickupFeedback?: PickupFeedback;
  bossState?: {
    active: boolean;
    progressMeters: number;
    targetMeters: number;
    currentAttack: string;
    warning: string;
  };
  cryoFreezeActive?: boolean;
}

export interface CylinderEngineCallbacks {
  onUpdateHUD: (hud: CylinderHUDState) => void;
  onGameOver: (result: {
    distance: number;
    timeMs: number;
    maxSpeedKmh: number;
    speedClassReached: SpeedClass;
    grazeCount: number;
    coinsCollected: number;
    scrapCollected: number;
    voxelsDestroyed: number;
    completed: boolean;
    reason: string;
    ghostData: GhostFrame[];
  }) => void;
  onGrazeTrigger?: (speedBonus: number, streak: number) => void;
  onSectorPassed?: (sector: number) => void;
}

interface TubeChunk {
  group: THREE.Group;
  startZ: number;
  length: number;
}

// Shared plasma projectile meshes & materials for 0-allocation high performance
const SHARED_PLASMA_CORE_GEOM = new THREE.SphereGeometry(1.3, 8, 8);
const SHARED_PLASMA_SHELL_GEOM = new THREE.SphereGeometry(2.3, 8, 8);
const SHARED_PLASMA_SPARK_GEOM = new THREE.SphereGeometry(0.55, 6, 6);

const SHARED_PLASMA_CORE_MAT = new THREE.MeshBasicMaterial({ color: 0xff2200 });
const SHARED_PLASMA_SHELL_MAT = new THREE.MeshBasicMaterial({
  color: 0xffaa00,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
});
const SHARED_PLASMA_SPARK_MAT = new THREE.MeshBasicMaterial({
  color: 0xff4400,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
});

// Shared cryo projectile meshes & materials
const SHARED_CRYO_CONE_GEOM = new THREE.ConeGeometry(1.2, 3.6, 5);
SHARED_CRYO_CONE_GEOM.rotateX(Math.PI / 2);
const SHARED_CRYO_HALO_GEOM = new THREE.SphereGeometry(2.2, 8, 8);
const SHARED_CRYO_CORE_MAT = new THREE.MeshBasicMaterial({ color: 0xffffff });
const SHARED_CRYO_FROST_MAT = new THREE.MeshBasicMaterial({
  color: 0x00f0ff,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
});

export class VoxotronCylinderEngine {
  private container: HTMLElement;
  private vehicleDef: VehicleDef;
  private lighting: LightingSettings;
  private mode: GameMode;
  public callbacks: CylinderEngineCallbacks;

  // Three.js Core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private isPaused: boolean = false;
  private isAttractMode: boolean = false;

  // Curving Tube Chunks (Outside Track)
  private tubeChunks: TubeChunk[] = [];
  private readonly CHUNK_LENGTH = 100;
  private readonly CHUNK_COUNT = 12;
  private chunkLastGeneratedZ = 0;

  // Environment & Starfield
  private starfield!: THREE.Points;
  private warpParticles!: THREE.Points;
  private warpPositions!: Float32Array;
  private ambientLight!: THREE.AmbientLight;
  private sunLight!: THREE.DirectionalLight;
  private bikePointLight!: THREE.PointLight;
  private fog!: THREE.FogExp2;

  // Player Cyber Bolide
  private bikeMesh!: THREE.Group;
  private bikeAngle: number = Math.PI / 2; // Starts riding on top
  private bikeAngularVelocity: number = 0;
  private currentBankAngle: number = 0;
  private camAngle: number = Math.PI / 2;
  private bikeZ: number = 0;
  private speedKmh: number = 220;
  private maxSpeedReached: number = 220;
  private currentSpeedClass: SpeedClass = 'CRUISE';
  private smoothnessFactor: number = 98;
  private boostActive: boolean = false;
  private grazeStreak: number = 0;
  private totalGrazes: number = 0;
  private coinsCollected: number = 0;
  private scrapCollected: number = 0;
  private voxelsDestroyed: number = 0;

  // Dynamic Neon Trail
  private bikeTrail: NeonBikeTrail;

  // Mode Timers
  private gameTimeMs: number = 0;
  private sprintRemainingMs: number = 30000;
  private currentSector: number = 1;

  // Input
  private inputSteer: number = 0;
  private inputBoost: boolean = false;
  private steeringSensitivity: number = 1.0;

  // Obstacles
  private obstacles: ObstacleData[] = [];
  private nextObstacleId: number = 1;
  private lastSpawnedObstacleZ: number = 45;

  // Voxel Debris
  private debrisGroup: THREE.Group;
  private debrisList: { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }[] = [];

  // Ghost Racer
  private ghostMesh?: THREE.Group;
  private recordedFrames: GhostFrame[] = [];
  private ghostFramesToPlay?: GhostFrame[];

  // Cyberpunk 2077 Voxel Environment
  private cyberCity: CyberpunkCityEnvironment;

  // Performance Scratch Variables (Zero runtime heap allocations)
  private _tempV1: THREE.Vector3 = new THREE.Vector3();
  private _tempV2: THREE.Vector3 = new THREE.Vector3();
  private _tempMat: THREE.Matrix4 = new THREE.Matrix4();
  private cameraShakeIntensity: number = 0;

  // Shared Track Materials & Geometries (Zero garbage collection stalls)
  private sharedTubeMat: THREE.MeshStandardMaterial | null = null;
  private sharedRailMatCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 });
  private sharedRailMatPink = new THREE.MeshBasicMaterial({ color: 0xff007f, transparent: true, opacity: 0.9 });
  private sharedRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7 });

  // Biomes & Dynamic Atmosphere
  private currentBiomeId: string = 'neo_metropolis';
  private biomeBanner: { nameRu: string; subtitle: string; color: string; show: boolean; expireAt: number } | null = null;

  // Fixed Weekly Trial Determinism
  private trialConfig: WeeklyTrialConfig | null = null;
  private trialPrng: (() => number) | null = null;

  // Rival Interceptor Drone
  private rivalInterceptor: RivalInterceptor = new RivalInterceptor();
  private lastRivalDespawnZ: number = 0;
  private wasRivalActive: boolean = false;
  private currentRivalAlert: { message: string; type: 'warning' | 'info'; show: boolean; expireAt: number } | null = null;

  // Titan Boss Encounter
  private titanBoss: TitanBoss = new TitanBoss();
  private bossDefeatedRewardClaimed: boolean = false;

  // Active Enemy Projectiles (Plasma Bolts & Cryo Shards)
  private enemyProjectiles: {
    mesh: THREE.Group;
    z: number;
    angle: number;
    speed: number;
    type: 'plasma' | 'cryo';
  }[] = [];

  // Active Gravitational Singularities
  private activeSingularities: {
    mesh: THREE.Group;
    z: number;
    angle: number;
    life: number;
  }[] = [];

  // Debuffs
  private cryoFreezeTimer: number = 0;

  // Pickup Notifications & Impact Shockwaves
  private currentPickupFeedback: (PickupFeedback & { expireAt: number }) | null = null;
  private pickupShockwaves: { mesh: THREE.Mesh; life: number; maxLife: number; scale: number }[] = [];

  // HUD Throttle
  private lastHudUpdateTime: number = 0;

  constructor(
    container: HTMLElement,
    vehicleDef: VehicleDef,
    lighting: LightingSettings,
    mode: GameMode,
    callbacks: CylinderEngineCallbacks,
    isAttractMode: boolean = false,
    ghostData?: GhostFrame[]
  ) {
    this.container = container;
    this.vehicleDef = vehicleDef;
    this.lighting = lighting;
    this.mode = mode;
    this.callbacks = callbacks;
    this.isAttractMode = isAttractMode;
    this.ghostFramesToPlay = ghostData;

    // Detect and configure dedicated weekly trial mode
    if (this.mode === 'speedrun_1' || this.mode === 'speedrun_2' || this.mode === 'speedrun_3' || this.mode === 'speedrun_4' || this.mode === 'speedrun_5') {
      const { trials } = getWeeklyTrials();
      this.trialConfig = trials.find((t) => t.id === this.mode) || null;
      if (this.trialConfig) {
        this.trialPrng = createMulberry32(this.trialConfig.seed);
        this.currentBiomeId = this.trialConfig.biomeId;
      }
    }

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.debrisGroup = new THREE.Group();
    this.scene.add(this.debrisGroup);

    this.cyberCity = new CyberpunkCityEnvironment(this.trialConfig ? this.trialConfig.biomeId : null);
    this.scene.add(this.cyberCity.group);

    this.bikeTrail = new NeonBikeTrail(this.vehicleDef.trailColor || '#00f0ff');
    this.scene.add(this.bikeTrail.getMesh());

    // Init Titan Boss
    this.scene.add(this.titanBoss.mesh);
    this.scene.add(this.titanBoss.laserGroup);
    this.titanBoss.init({
      onAlert: (message, type) => {
        this.currentRivalAlert = { message, type, show: true, expireAt: Date.now() + 4200 };
      },
      onDropObstacle: (obs) => {
        this.scene.add(obs.mesh);
        this.obstacles.push(obs);
      },
      onFirePlasma: (z, angle, speed) => {
        this.spawnPlasmaProjectile(z, angle, speed);
      },
      onBossDefeated: () => {
        if (!this.bossDefeatedRewardClaimed) {
          this.bossDefeatedRewardClaimed = true;
          this.coinsCollected += 5000;
          this.scrapCollected += 5000;
          this.triggerPickupFeedback('coin', '+5,000 МОНЕТ & ДЕТАЛЕЙ!', 'БОСС ПОВЕРЖЕН!', '#f59e0b');
        }
      },
    });

    // Init Rival Interceptor
    this.scene.add(this.rivalInterceptor.mesh);
    this.rivalInterceptor.init({
      onDropMine: (mineData) => {
        this.scene.add(mineData.mesh);
        this.obstacles.push(mineData);
      },
      onFirePlasma: (z, angle) => {
        this.spawnPlasmaProjectile(z, angle);
      },
      onFireCryoShard: (z, angle) => {
        this.spawnCryoShard(z, angle);
      },
      onDeploySingularity: (z, angle) => {
        this.spawnSingularityVortex(z, angle);
      },
      onAlert: (message, type) => {
        this.currentRivalAlert = { message, type, show: true, expireAt: Date.now() + 3800 };
      },
    });

    const width = Math.max(this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 320), 320);
    const height = Math.max(this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 480), 480);

    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1200);

    // Safe WebGL initialization with fallback for iOS Low Power Mode / restricted contexts
    let rendererInstance: THREE.WebGLRenderer | null = null;
    const rendererConfigs: THREE.WebGLRendererParameters[] = [
      { antialias: true, powerPreference: 'default', alpha: false, precision: 'mediump' },
      { antialias: false, powerPreference: 'default', alpha: false, precision: 'mediump' },
      { antialias: false, powerPreference: 'low-power', alpha: false },
    ];

    for (const config of rendererConfigs) {
      try {
        rendererInstance = new THREE.WebGLRenderer(config);
        if (rendererInstance && rendererInstance.getContext()) {
          break;
        }
      } catch (err) {
        console.warn('[Voxotron] WebGLRenderer init try failed:', err);
      }
    }

    if (!rendererInstance) {
      throw new Error('Ваш браузер или устройство не поддерживает аппаратное ускорение WebGL.');
    }
    this.renderer = rendererInstance;

    // Attach WebGL context loss and restore handlers for iOS WebKit
    this.renderer.domElement.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
        console.warn('[Voxotron] WebGL Context lost on iOS WebKit. Waiting for restoration...');
      },
      false,
    );

    this.renderer.domElement.addEventListener(
      'webglcontextrestored',
      () => {
        console.info('[Voxotron] WebGL Context restored! Re-applying dimensions...');
        this.handleResize();
      },
      false,
    );

    const isMobileDevice =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (typeof window !== 'undefined' && (window.innerWidth < 768 || window.innerHeight < 768));
    const pixelRatio = isMobileDevice
      ? Math.min(window.devicePixelRatio || 1, 1.2) // Capped for stable 60 FPS on Retina iPhones
      : Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    if (lighting.shadowsEnabled) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    this.setupLightingAndAtmosphere();
    this.setupCurvingTubeTrack();
    this.setupStarfield();
    this.setupWarpParticles();
    this.setupPlayerBike();

    if (this.ghostFramesToPlay && this.ghostFramesToPlay.length > 0) {
      this.setupGhostBike();
    }

    this.spawnInitialObstacles();

    if (!this.isAttractMode) {
      sound.startMusic();
    }

    this.startLoop();
  }

  private setupLightingAndAtmosphere() {
    const initialBiome = this.getEffectiveBiome(0);

    // Deep atmospheric palette for initial biome
    const cyberBg = new THREE.Color(initialBiome.skyColor);
    this.fog = new THREE.FogExp2(new THREE.Color(initialBiome.fogColor), initialBiome.fogDensity);
    this.scene.fog = this.fog;
    this.scene.background = cyberBg;

    // Ambient Fill
    this.ambientLight = new THREE.AmbientLight(new THREE.Color(initialBiome.ambientColor), initialBiome.ambientIntensity);
    this.scene.add(this.ambientLight);

    // Key Celestial / Atmospheric Rim Light
    this.sunLight = new THREE.DirectionalLight(new THREE.Color(initialBiome.sunColor), initialBiome.sunIntensity);
    this.sunLight.position.set(50, 90, -40);
    if (this.lighting.shadowsEnabled) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 1024;
      this.sunLight.shadow.mapSize.height = 1024;
      this.sunLight.shadow.camera.near = 10;
      this.sunLight.shadow.camera.far = 250;
      const d = 40;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
    }
    this.scene.add(this.sunLight);

    // Under-highway Dynamic Rim Light
    const underRim = new THREE.DirectionalLight(new THREE.Color(initialBiome.railColor1), 1.2);
    underRim.position.set(-50, -40, 30);
    this.scene.add(underRim);

    // Dynamic point light attached to the magnetic bike
    this.bikePointLight = new THREE.PointLight(this.vehicleDef.glowColor || initialBiome.railColor1, 7.0, 50);
    this.scene.add(this.bikePointLight);

    // Initialize shared rails and rings to initial biome
    this.sharedRailMatCyan.color.set(initialBiome.railColor1);
    this.sharedRailMatPink.color.set(initialBiome.railColor2);
    this.sharedRingMat.color.set(initialBiome.ringColor);
    this.cyberCity.updateBiomeColors(initialBiome.railColor1, initialBiome.railColor2, initialBiome.tubeEmissive, 1.0);

    if (this.trialConfig) {
      this.biomeBanner = {
        nameRu: initialBiome.nameRu.toUpperCase(),
        subtitle: `МОНО-БИОМ • ${this.trialConfig.nameRu}`,
        color: initialBiome.bannerColor,
        show: true,
        expireAt: Date.now() + 4500,
      };
    }
  }

  /**
   * Generates a curved 3D tube chunk that bends in space following cosmicTube.
   * Player rides on the OUTSIDE surface.
   */
  private createTubeChunkMesh(startZ: number, length: number): THREE.Group {
    const chunkGroup = new THREE.Group();
    const radialSegments = 28;
    const lengthSegments = 28;
    const r = cosmicTube.RADIUS;

    const vertexCount = (lengthSegments + 1) * (radialSegments + 1);
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices: number[] = [];

    let vIdx = 0;
    let uvIdx = 0;

    for (let i = 0; i <= lengthSegments; i++) {
      const frac = i / lengthSegments;
      const z = startZ + frac * length;
      const center = cosmicTube.getCenter(z);
      const { right, up } = cosmicTube.getFrame(z);

      for (let j = 0; j <= radialSegments; j++) {
        const theta = (j / radialSegments) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // Outward radial normal on the outside surface
        const nx = right.x * cosT + up.x * sinT;
        const ny = right.y * cosT + up.y * sinT;
        const nz = right.z * cosT + up.z * sinT;

        // Position on outside of tube
        positions[vIdx * 3] = center.x + nx * r;
        positions[vIdx * 3 + 1] = center.y + ny * r;
        positions[vIdx * 3 + 2] = center.z + nz * r;

        normals[vIdx * 3] = nx;
        normals[vIdx * 3 + 1] = ny;
        normals[vIdx * 3 + 2] = nz;

        uvs[uvIdx * 2] = (j / radialSegments) * 4.0;
        uvs[uvIdx * 2 + 1] = frac * 8.0;

        vIdx++;
        uvIdx++;
      }
    }

    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = (i + 1) * (radialSegments + 1) + j;
        const c = (i + 1) * (radialSegments + 1) + (j + 1);
        const d = i * (radialSegments + 1) + (j + 1);

        // Outer surface triangles
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setIndex(indices);

    // Luminous Cyber Highway Shared Material
    if (!this.sharedTubeMat) {
      const initialBiome = this.getEffectiveBiome(0);
      const cyberTex = getCyberTubeTexture();
      this.sharedTubeMat = new THREE.MeshStandardMaterial({
        map: cyberTex,
        emissiveMap: cyberTex,
        color: new THREE.Color(initialBiome.tubeBaseColor),
        emissive: new THREE.Color(initialBiome.tubeEmissive),
        emissiveIntensity: initialBiome.tubeEmissiveIntensity,
        roughness: 0.25,
        metalness: 0.45,
        side: THREE.FrontSide,
      });
    }

    const tubeMesh = new THREE.Mesh(geom, this.sharedTubeMat);
    chunkGroup.add(tubeMesh);

    // Glowing Neon Guide Rails along the outside of the tube (4 rails at 90° intervals)
    const railAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    railAngles.forEach((angle, rIdx) => {
      const railPoints: THREE.Vector3[] = [];
      for (let i = 0; i <= 24; i++) {
        const z = startZ + (i / 24) * length;
        railPoints.push(cosmicTube.getSurfacePoint(z, angle, 0.06));
      }
      const railCurve = new THREE.CatmullRomCurve3(railPoints);
      const railGeom = new THREE.TubeGeometry(railCurve, 24, 0.1, 6, false);
      const railMesh = new THREE.Mesh(railGeom, rIdx % 2 === 0 ? this.sharedRailMatCyan : this.sharedRailMatPink);
      chunkGroup.add(railMesh);
    });

    // Subtle sector checkpoints every 120 meters (leaving the track clean & high-contrast)
    for (let zOffset = 0; zOffset < length; zOffset += 120) {
      const ringZ = startZ + zOffset;
      const ringCenter = cosmicTube.getCenter(ringZ);
      const ringFrame = cosmicTube.getFrame(ringZ);

      // Sleek glowing neon contour hugging the cylinder surface
      const ringGeom = new THREE.TorusGeometry(r + 0.03, 0.05, 6, 36);
      const ringMesh = new THREE.Mesh(ringGeom, this.sharedRingMat);
      ringMesh.position.copy(ringCenter);

      const rotMat = this._tempMat.makeBasis(ringFrame.right, ringFrame.up, ringFrame.forward);
      ringMesh.setRotationFromMatrix(rotMat);
      chunkGroup.add(ringMesh);
    }

    return chunkGroup;
  }

  private setupCurvingTubeTrack() {
    for (let i = 0; i < this.CHUNK_COUNT; i++) {
      const startZ = i * this.CHUNK_LENGTH;
      const group = this.createTubeChunkMesh(startZ, this.CHUNK_LENGTH);
      this.scene.add(group);
      this.tubeChunks.push({
        group,
        startZ,
        length: this.CHUNK_LENGTH,
      });
    }
    this.chunkLastGeneratedZ = this.CHUNK_COUNT * this.CHUNK_LENGTH;
    this.cyberCity.generateDecorationsUpTo(this.chunkLastGeneratedZ + 200);
  }

  private setupStarfield() {
    const count = 1200;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#f43f5e'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#34d399'),
    ];

    for (let i = 0; i < count; i++) {
      const radius = 60 + Math.random() * 220;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i * 3] = radius * Math.cos(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = Math.random() * 1200 - 100;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    this.starfield = new THREE.Points(geom, mat);
    this.scene.add(this.starfield);
  }

  private setupWarpParticles() {
    const count = 250;
    const geom = new THREE.BufferGeometry();
    this.warpPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      this.warpPositions[i * 3] = (Math.random() - 0.5) * 40;
      this.warpPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      this.warpPositions[i * 3 + 2] = Math.random() * 150 - 50;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(this.warpPositions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 2.2,
      transparent: true,
      opacity: 0.0, // Fades in during high speed
      blending: THREE.AdditiveBlending,
    });

    this.warpParticles = new THREE.Points(geom, mat);
    this.scene.add(this.warpParticles);
  }

  private setupPlayerBike() {
    if (this.bikeMesh) {
      this.scene.remove(this.bikeMesh);
    }
    this.bikeMesh = buildCyberRacerShip(this.vehicleDef);
    this.scene.add(this.bikeMesh);
    this.updateBikeTransform(0.016);
  }

  private setupGhostBike() {
    if (this.ghostMesh) {
      this.scene.remove(this.ghostMesh);
    }
    this.ghostMesh = buildCyberRacerShip(this.vehicleDef);
    this.ghostMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          wireframe: true,
          transparent: true,
          opacity: 0.4,
        });
      }
    });
    this.scene.add(this.ghostMesh);
  }

  /**
   * Updates player cyber bolide position & orientation on the surface of the curving tube.
   * Firmly magnetized to track surface with aerodynamic bank lean.
   */
  private updateBikeTransform(delta: number = 0.016) {
    // Magnetized hover height (low to surface)
    const hoverHeight = 0.16;
    const bikePos = cosmicTube.getSurfacePoint(this.bikeZ, this.bikeAngle, hoverHeight);
    this.bikeMesh.position.copy(bikePos);

    // Normal pointing outward away from tube center
    const outwardNormal = cosmicTube.getRadialNormal(this.bikeZ, this.bikeAngle);
    // Tangent along the curve
    const tangent = cosmicTube.getTangent(this.bikeZ);
    // Lateral vector pointing to the bike's right wing (outwardNormal x tangent = lateral, det = +1)
    const lateral = new THREE.Vector3().crossVectors(outwardNormal, tangent).normalize();

    // Solid magnetic adherence to track (slightest micro-bank of ~2 degrees max) - no spinning or deep tipping
    const maxBank = 0.04;
    const targetBank = Math.max(-maxBank, Math.min(maxBank, -this.bikeAngularVelocity * 0.02));
    this.currentBankAngle = THREE.MathUtils.lerp(this.currentBankAngle, targetBank, Math.min(1.0, 10 * delta));

    const bankedNormal = outwardNormal.clone().applyAxisAngle(tangent, this.currentBankAngle);
    const bankedLateral = lateral.clone().applyAxisAngle(tangent, this.currentBankAngle);

    const rotMatrix = new THREE.Matrix4().makeBasis(bankedLateral, bankedNormal, tangent);
    this.bikeMesh.setRotationFromMatrix(rotMatrix);

    // Position dynamic point light
    this.bikePointLight.position.copy(bikePos).addScaledVector(outwardNormal, 0.7);

    // Feed trail with rear exhaust position hugging the track surface
    const exhaustPos = bikePos.clone().addScaledVector(tangent, -1.1);
    this.bikeTrail.addPoint(
      exhaustPos,
      outwardNormal,
      tangent,
      this.vehicleDef.trailColor || '#00f0ff',
      this.currentSpeedClass === 'OVERDRIVE' ? 1.15 : 0.8
    );

    // Animate rear rocket thruster plume
    const plume = this.bikeMesh.getObjectByName('thruster_plume');
    if (plume) {
      const scaleBoost = this.inputBoost ? 1.6 : 1.0;
      const flicker = 0.9 + Math.random() * 0.25;
      plume.scale.set(1.0, 1.0, scaleBoost * flicker);
    }
  }

  private getEffectiveBiome(z: number): BiomeConfig {
    if (this.trialConfig) {
      const match = BIOMES.find((b) => b.id === this.trialConfig!.biomeId);
      if (match) return match;
    }
    return getBiomeForDistance(z);
  }

  public getDifficultyFactor(distance: number = this.bikeZ): number {
    // Grace period for first 500m (smooth tutorial pace)
    if (distance <= 500) return 0.0;
    // Gradual ramp reaching peak cap at 12,000m (beginning of 3rd biome cycle)
    const t = Math.min(1.0, Math.max(0.0, (distance - 500) / 11500));
    return t * t * (3 - 2 * t); // Smoothstep easing
  }

  private getObstacleStepAtZ(z: number): number {
    const diff = this.getDifficultyFactor(z);
    // Spacing scales from ~115m - 155m in early game down to ~58m - 76m at peak 12,000m
    const base = THREE.MathUtils.lerp(115, 58, diff);
    const jitter = THREE.MathUtils.lerp(40, 18, diff);
    const rand = this.trialPrng ? this.trialPrng() : Math.random();
    return base + rand * jitter;
  }

  private spawnInitialObstacles() {
    this.obstacles.forEach((obs) => {
      this.scene.remove(obs.mesh);
      this.disposeGroupDeep(obs.mesh);
    });
    this.obstacles = [];
    this.lastSpawnedObstacleZ = 70;

    if (this.trialConfig) {
      this.trialPrng = createMulberry32(this.trialConfig.seed);
    }

    // Dynamic gradual spacing based on distance difficulty curve
    const maxInitialZ = this.trialConfig ? Math.min(900, this.trialConfig.targetDistance) : 900;
    while (this.lastSpawnedObstacleZ < maxInitialZ) {
      const step = this.getObstacleStepAtZ(this.lastSpawnedObstacleZ);
      this.lastSpawnedObstacleZ += step;
      this.spawnObstacleAtZ(this.lastSpawnedObstacleZ);
    }
  }

  private triggerPickupFeedback(type: 'coin' | 'boost' | 'battery' | 'scrap', text: string, subtext: string, color: string) {
    this.currentPickupFeedback = {
      id: Date.now() + Math.random(),
      type,
      text,
      subtext,
      color,
      timestamp: Date.now(),
      expireAt: Date.now() + 2400,
    };
  }

  private spawnPlasmaProjectile(z: number, angle: number, speed: number = 65) {
    const group = new THREE.Group();
    const core = new THREE.Mesh(SHARED_PLASMA_CORE_GEOM, SHARED_PLASMA_CORE_MAT);
    core.userData.isShared = true;
    const shell = new THREE.Mesh(SHARED_PLASMA_SHELL_GEOM, SHARED_PLASMA_SHELL_MAT);
    shell.userData.isShared = true;
    group.add(core, shell);

    // Glowing tail trail of fiery plasma sparks
    for (let i = 1; i <= 2; i++) {
      const spark = new THREE.Mesh(SHARED_PLASMA_SPARK_GEOM, SHARED_PLASMA_SPARK_MAT);
      spark.userData.isShared = true;
      spark.position.z = i * 2.2;
      group.add(spark);
    }

    const pos = cosmicTube.getSurfacePoint(z, angle, 0.5);
    group.position.copy(pos);
    this.scene.add(group);

    this.enemyProjectiles.push({
      mesh: group,
      z,
      angle,
      speed,
      type: 'plasma',
    });
  }

  private spawnCryoShard(z: number, angle: number) {
    const group = new THREE.Group();
    const shard = new THREE.Mesh(SHARED_CRYO_CONE_GEOM, SHARED_CRYO_CORE_MAT);
    shard.userData.isShared = true;
    const halo = new THREE.Mesh(SHARED_CRYO_HALO_GEOM, SHARED_CRYO_FROST_MAT);
    halo.userData.isShared = true;
    group.add(shard, halo);

    const pos = cosmicTube.getSurfacePoint(z, angle, 0.5);
    group.position.copy(pos);
    this.scene.add(group);

    this.enemyProjectiles.push({
      mesh: group,
      z,
      angle,
      speed: 25,
      type: 'cryo',
    });
  }

  private spawnSingularityVortex(z: number, angle: number) {
    const group = new THREE.Group();
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const core = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), darkMat);
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(1.8, 4.6, 32), ringMat);
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(4.8, 6.2, 32), outerRingMat);

    const normal = cosmicTube.getRadialNormal(z, angle);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    group.add(core, ring1, ring2);

    const light = new THREE.PointLight(0xc026d3, 7.0, 35);
    group.add(light);

    const pos = cosmicTube.getSurfacePoint(z, angle, 0.6);
    group.position.copy(pos);
    this.scene.add(group);

    this.activeSingularities.push({
      mesh: group,
      z,
      angle,
      life: 8.5,
    });
  }

  private spawnPickupShockwave(z: number, angle: number, colorHex: number) {
    const geom = new THREE.RingGeometry(0.7, 1.3, 20);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(geom, mat);
    const pos = cosmicTube.getSurfacePoint(z, angle, 0.35);
    ring.position.copy(pos);
    const norm = cosmicTube.getRadialNormal(z, angle);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), norm);
    this.scene.add(ring);
    this.pickupShockwaves.push({ mesh: ring, life: 0.4, maxLife: 0.4, scale: 1.0 });
  }

  private spawnObstacleAtZ(z: number) {
    const isBossTrack = this.mode === 'speedrun_5' || this.trialConfig?.modeKey === 'speedrun_5';
    if (isBossTrack) {
      // Pure boss fight without standard obstacles!
      // Only spawn occasional energy prisms or boost pads along the 6000m tube
      if (z % 380 < 40) {
        const rand = this.trialPrng ? this.trialPrng() : Math.random();
        const selectedType: CyberObstacleType = rand > 0.5 ? 'boost_pad' : 'energy_prism';
        const angle = this.trialPrng ? this.trialPrng() * Math.PI * 2 : Math.random() * Math.PI * 2;
        const created = createCyberObstacleGroup(selectedType, angle);

        const center = cosmicTube.getCenter(z);
        const frame = cosmicTube.getFrame(z);
        created.group.position.copy(center);

        const rotMatrix = this._tempMat.makeBasis(frame.right, frame.up, frame.forward);
        created.group.setRotationFromMatrix(rotMatrix);

        this.scene.add(created.group);
        this.obstacles.push({
          id: this.nextObstacleId++,
          type: selectedType,
          mesh: created.group,
          z,
          angle,
          depthZ: created.depthZ,
          blockedSectors: created.blockedSectors,
          safeCenter: created.safeCenter,
          isPickup: true,
          grazed: false,
        });
      }
      return;
    }

    if (isBossBiome(z)) {
      // In the boss arena (8000m - 9000m), don't clutter with random static obstacles,
      // but occasionally spawn energy prisms or hyper batteries
      const rand = this.trialPrng ? this.trialPrng() : Math.random();
      if (rand > 0.4) return;
    }

    const biome = this.getEffectiveBiome(z);
    const diff = this.getDifficultyFactor(z);
    const selectedType = pickObstacleForBiome(
      biome,
      this.trialPrng ? this.trialPrng() : undefined,
      diff
    );

    const angle = this.trialPrng ? this.trialPrng() * Math.PI * 2 : Math.random() * Math.PI * 2;
    const created = createCyberObstacleGroup(selectedType, angle);

    // Position centered directly at the tube centerline with orthonormal frame orientation
    const center = cosmicTube.getCenter(z);
    const frame = cosmicTube.getFrame(z);
    created.group.position.copy(center);

    const rotMatrix = this._tempMat.makeBasis(frame.right, frame.up, frame.forward);
    created.group.setRotationFromMatrix(rotMatrix);

    this.scene.add(created.group);

    this.obstacles.push({
      id: this.nextObstacleId++,
      type: selectedType,
      mesh: created.group,
      z,
      angle: created.primaryAngle ?? angle,
      depthZ: created.depthZ,
      blockedSectors: created.blockedSectors,
      safeCenter: created.safeCenter,
      isPickup: created.isPickup,
      grazed: false,
      movement: created.movement,
    });
  }

  public setSteer(steer: number) {
    this.inputSteer = Math.max(-1, Math.min(1, steer));
  }

  public setSteeringSensitivity(val: number) {
    this.steeringSensitivity = Math.max(0.2, Math.min(3.0, val));
  }

  public setBoost(boosting: boolean) {
    if (boosting && !this.inputBoost) {
      sound.playBoost();
    }
    this.inputBoost = boosting;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      this.clock.stop();
      sound.stopMusic();
    } else {
      this.clock.start();
      if (!this.isAttractMode) {
        sound.startMusic();
      }
    }
  }

  public setAttractMode(attract: boolean) {
    this.isAttractMode = attract;
    if (attract) {
      sound.stopMusic();
    } else {
      sound.startMusic();
    }
  }

  public startRace(mode: GameMode, vehicleDef?: VehicleDef) {
    if (vehicleDef) {
      this.vehicleDef = vehicleDef;
      this.setupPlayerBike();
    }
    this.mode = mode;

    // Detect and configure dedicated weekly trial mode
    if (this.mode === 'speedrun_1' || this.mode === 'speedrun_2' || this.mode === 'speedrun_3' || this.mode === 'speedrun_4' || this.mode === 'speedrun_5') {
      const { trials } = getWeeklyTrials();
      this.trialConfig = trials.find((t) => t.id === this.mode) || null;
      if (this.trialConfig) {
        this.trialPrng = createMulberry32(this.trialConfig.seed);
        this.currentBiomeId = this.trialConfig.biomeId;
      }
    } else {
      this.trialConfig = null;
      this.trialPrng = null;
    }

    this.isAttractMode = false;
    this.isPaused = false;
    this.resetState();
    sound.startMusic();
  }

  public restartRace() {
    this.isPaused = false;
    this.isAttractMode = false;

    if (this.mode === 'speedrun_1' || this.mode === 'speedrun_2' || this.mode === 'speedrun_3' || this.mode === 'speedrun_4' || this.mode === 'speedrun_5') {
      const { trials } = getWeeklyTrials();
      this.trialConfig = trials.find((t) => t.id === this.mode) || null;
      if (this.trialConfig) {
        this.trialPrng = createMulberry32(this.trialConfig.seed);
        this.currentBiomeId = this.trialConfig.biomeId;
      }
    }

    this.resetState();
    sound.startMusic();
  }

  private resetState() {
    // Clear obstacles
    this.obstacles.forEach((obs) => this.scene.remove(obs.mesh));
    this.obstacles = [];

    // Clear debris
    this.debrisList.forEach((d) => this.debrisGroup.remove(d.mesh));
    this.debrisList = [];

    this.bikeTrail.clear();

    this.bikeZ = 0;
    this.bikeAngle = Math.PI / 2; // Riding top of tube
    this.camAngle = Math.PI / 2;
    this.currentBankAngle = 0;
    this.bikeAngularVelocity = 0;
    this.speedKmh = 220;
    this.maxSpeedReached = 220;
    this.currentSpeedClass = 'CRUISE';
    this.smoothnessFactor = 98;
    this.gameTimeMs = 0;
    this.sprintRemainingMs = 30000;
    this.grazeStreak = 0;
    this.totalGrazes = 0;
    this.coinsCollected = 0;
    this.scrapCollected = 0;
    this.voxelsDestroyed = 0;
    this.currentSector = 1;
    this.recordedFrames = [];
    this.nextObstacleId = 1;

    // Reset Biomes & Enemy
    if (this.trialConfig) {
      this.currentBiomeId = this.trialConfig.biomeId;
      this.trialPrng = createMulberry32(this.trialConfig.seed);
    } else {
      this.currentBiomeId = 'neo_metropolis';
    }

    const startBiome = this.getEffectiveBiome(0);
    this.biomeBanner = this.trialConfig
      ? {
          nameRu: startBiome.nameRu.toUpperCase(),
          subtitle: `МОНО-БИОМ • ${this.trialConfig.nameRu}`,
          color: startBiome.bannerColor,
          show: true,
          expireAt: Date.now() + 4500,
        }
      : null;

    this.lastRivalDespawnZ = 0;
    this.wasRivalActive = false;
    this.currentRivalAlert = null;
    this.currentPickupFeedback = null;
    this.rivalInterceptor.despawn();

    // Reset Titan Boss & special hazards
    this.titanBoss.active = false;
    this.titanBoss.mesh.visible = false;
    this.titanBoss.laserGroup.visible = false;
    this.bossDefeatedRewardClaimed = false;
    this.cryoFreezeTimer = 0;

    this.enemyProjectiles.forEach((p) => {
      this.scene.remove(p.mesh);
      this.disposeGroupDeep(p.mesh);
    });
    this.enemyProjectiles = [];

    this.activeSingularities.forEach((s) => {
      this.scene.remove(s.mesh);
      this.disposeGroupDeep(s.mesh);
    });
    this.activeSingularities = [];

    this.pickupShockwaves.forEach((sw) => {
      this.scene.remove(sw.mesh);
      sw.mesh.geometry.dispose();
    });
    this.pickupShockwaves = [];

    // Immediately snap track materials to active mono-biome
    if (this.sharedTubeMat) {
      this.sharedTubeMat.color.set(startBiome.tubeBaseColor);
      this.sharedTubeMat.emissive.set(startBiome.tubeEmissive);
      this.sharedTubeMat.emissiveIntensity = startBiome.tubeEmissiveIntensity;
    }
    this.sharedRailMatCyan.color.set(startBiome.railColor1);
    this.sharedRailMatPink.color.set(startBiome.railColor2);
    this.sharedRingMat.color.set(startBiome.ringColor);

    // Immediately snap atmosphere and lighting
    if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.set(startBiome.fogColor);
      this.scene.fog.density = startBiome.fogDensity;
      (this.scene.background as THREE.Color).set(startBiome.skyColor);
    }
    if (this.ambientLight) {
      this.ambientLight.color.set(startBiome.ambientColor);
      this.ambientLight.intensity = startBiome.ambientIntensity;
    }
    if (this.sunLight) {
      this.sunLight.color.set(startBiome.sunColor);
      this.sunLight.intensity = startBiome.sunIntensity;
    }

    if (this.bikeMesh) {
      this.bikeMesh.visible = true;
      this.updateBikeTransform(0.016);
    }

    // Rebuild tube chunks starting at 0
    this.tubeChunks.forEach((chunk, idx) => {
      this.scene.remove(chunk.group);
      const startZ = idx * this.CHUNK_LENGTH;
      const group = this.createTubeChunkMesh(startZ, this.CHUNK_LENGTH);
      this.scene.add(group);
      chunk.group = group;
      chunk.startZ = startZ;
    });
    this.chunkLastGeneratedZ = this.CHUNK_COUNT * this.CHUNK_LENGTH;

    // Reset cyberpunk world with trial's dedicated mono-biome
    this.cyberCity.reset(0, this.trialConfig ? this.trialConfig.biomeId : null);
    this.cyberCity.updateBiomeColors(startBiome.railColor1, startBiome.railColor2, startBiome.tubeEmissive, 1.0);

    this.spawnInitialObstacles();
  }

  public updateVehicle(newVeh: VehicleDef) {
    this.vehicleDef = newVeh;
    this.setupPlayerBike();
  }

  public updateLighting(newSettings: LightingSettings) {
    this.lighting = newSettings;
    if (this.ambientLight) this.ambientLight.intensity = Math.max(0.6, newSettings.ambientIntensity * 1.5);
    if (this.sunLight) {
      this.sunLight.intensity = Math.max(1.2, newSettings.sunIntensity * 1.3);
      this.sunLight.color.set(newSettings.sunColor);
    }
    if (this.fog) {
      this.fog.density = Math.max(0.002, newSettings.fogDensity * 0.45);
      this.fog.color.set(newSettings.fogColor);
    }
    if (this.scene) this.scene.background = new THREE.Color(newSettings.fogColor);
  }

  private startLoop() {
    const loop = () => {
      if (this.isDestroyed) return;
      this.animFrameId = requestAnimationFrame(loop);

      if (this.isPaused) return;

      const delta = Math.min(this.clock.getDelta(), 0.08);
      this.updatePhysics(delta);
      this.updateObstaclesAndTrack(delta);
      this.updateCamera(delta);
      this.updateWarpSlipstream(delta);
      this.updateDebris(delta);
      this.updateGhost(delta);

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private updatePhysics(delta: number) {
    if (this.isAttractMode) {
      // Smooth cinematic cruise in attract mode
      this.speedKmh = 220;
      this.bikeAngle += 0.3 * delta;
      this.bikeZ += 30 * delta;
      this.updateBikeTransform();
      this.cyberCity.update(delta, this.bikeZ);
      return;
    }

    this.gameTimeMs += delta * 1000;
    this.cyberCity.update(delta, this.bikeZ);

    // Sprint Mode countdown
    if (this.mode === 'sprint_30s') {
      this.sprintRemainingMs -= delta * 1000;
      if (this.sprintRemainingMs <= 0) {
        this.sprintRemainingMs = 0;
        this.triggerFinish('ВРЕМЯ ВЫШЛО! Спринт завершен');
        return;
      }
    }

    // Weekly Speedrun Trial Finish Line check
    if (this.trialConfig && this.bikeZ >= this.trialConfig.targetDistance) {
      const timeSec = (this.gameTimeMs / 1000).toFixed(2);
      this.triggerFinish(`ФИНИШ! ${this.trialConfig.nameRu} пройдено за ${timeSec}с`);
      return;
    }

    // Sector progress
    const calculatedSector = Math.floor(this.bikeZ / 500) + 1;
    if (calculatedSector > this.currentSector) {
      this.currentSector = calculatedSector;
      sound.playCheckpoint();
      if (this.callbacks.onSectorPassed) {
        this.callbacks.onSectorPassed(this.currentSector);
      }
    }

    // Cryo freeze debuff timer
    if (this.cryoFreezeTimer > 0) {
      this.cryoFreezeTimer = Math.max(0, this.cryoFreezeTimer - delta);
    }

    // Calibrated Steering: 80% of original baseline (responsive, fast, and agile)
    const cryoMultiplier = this.cryoFreezeTimer > 0 ? 0.4 : 1.0;
    const baseAgility = (2.72 + this.vehicleDef.stats.handling * 0.48) * cryoMultiplier;
    const agility = baseAgility * this.steeringSensitivity;
    const targetAngularVel = this.inputSteer * agility;

    const angularDiff = Math.abs(targetAngularVel - this.bikeAngularVelocity);
    if (angularDiff > 0.08) {
      this.smoothnessFactor = Math.max(50, this.smoothnessFactor - angularDiff * 25 * delta);
    } else {
      this.smoothnessFactor = Math.min(100, this.smoothnessFactor + 10 * delta);
    }

    this.bikeAngularVelocity = THREE.MathUtils.lerp(this.bikeAngularVelocity, targetAngularVel, 18 * delta);
    this.bikeAngle += this.bikeAngularVelocity * delta;

    // Singularity Gravitational Pull
    for (let i = this.activeSingularities.length - 1; i >= 0; i--) {
      const sing = this.activeSingularities[i];
      sing.life -= delta;
      sing.mesh.rotation.z += delta * 4.0;
      const dz = Math.abs(this.bikeZ - sing.z);
      if (dz < 60) {
        let dAngle = sing.angle - this.bikeAngle;
        while (dAngle > Math.PI) dAngle -= Math.PI * 2;
        while (dAngle < -Math.PI) dAngle += Math.PI * 2;
        const pullForce = (1 - dz / 60) * 2.2 * delta;
        this.bikeAngle += Math.sign(dAngle) * Math.min(Math.abs(dAngle), pullForce);
      }
      if (sing.life <= 0 || sing.z < this.bikeZ - 30) {
        this.scene.remove(sing.mesh);
        this.disposeGroupDeep(sing.mesh);
        this.activeSingularities.splice(i, 1);
      }
    }

    if (this.bikeAngle < 0) this.bikeAngle += Math.PI * 2;
    if (this.bikeAngle >= Math.PI * 2) this.bikeAngle -= Math.PI * 2;

    // Continuous Acceleration (Survival-oriented pacing vs high-speed sprint)
    const isSurvival = this.mode === 'survival' || this.mode === 'daily';
    const baseAccel = isSurvival
      ? 5.0 + this.vehicleDef.stats.acceleration * 1.4 // Calibrated for strategic survival
      : 14.0 + this.vehicleDef.stats.acceleration * 3.2; // Energetic for 30s sprint
    const boostMultiplier = this.inputBoost ? (isSurvival ? 1.75 : 2.6) : 1.0;
    const smoothnessBonus = this.smoothnessFactor / 100;

    this.speedKmh += baseAccel * boostMultiplier * smoothnessBonus * delta;

    if (this.speedKmh > this.maxSpeedReached) {
      this.maxSpeedReached = Math.round(this.speedKmh);
    }

    // Refined 6-tier Speed Class Hierarchy
    let newClass: SpeedClass = 'CRUISE';
    if (this.speedKmh >= 1060) {
      newClass = 'OVERDRIVE';
    } else if (this.speedKmh >= 860) {
      newClass = 'WARP';
    } else if (this.speedKmh >= 660) {
      newClass = 'HYPER';
    } else if (this.speedKmh >= 460) {
      newClass = 'APEX';
    } else if (this.speedKmh >= 280) {
      newClass = 'FLOW';
    }

    if (newClass !== this.currentSpeedClass) {
      this.currentSpeedClass = newClass;
      sound.setSpeedClass(newClass);
    }

    // Forward progression along the curving tube (z coordinate)
    const forwardUnitsPerSec = (this.speedKmh / 3.6) * 0.48;
    this.bikeZ += forwardUnitsPerSec * delta;

    this.updateBikeTransform();

    this.recordedFrames.push({
      z: this.bikeZ,
      angle: this.bikeAngle,
      speed: this.speedKmh,
      timeMs: this.gameTimeMs,
    });

    // Biome Progression & Atmosphere Transitions (trials are strict mono-biomes)
    const activeBiome = this.getEffectiveBiome(this.bikeZ);
    if (!this.trialConfig && activeBiome.id !== this.currentBiomeId) {
      this.currentBiomeId = activeBiome.id;
      sound.playBiomeShift();
      this.biomeBanner = {
        nameRu: activeBiome.nameRu,
        subtitle: activeBiome.subtitle,
        color: activeBiome.bannerColor,
        show: true,
        expireAt: Date.now() + 4000,
      };
    }

    // Dynamic environmental lighting & fog adjustment for biome
    if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.lerp(new THREE.Color(activeBiome.fogColor), 2.5 * delta);
      this.scene.fog.density = THREE.MathUtils.lerp(this.scene.fog.density, activeBiome.fogDensity, 2.5 * delta);
      (this.scene.background as THREE.Color).lerp(new THREE.Color(activeBiome.skyColor), 2.5 * delta);
    }
    this.ambientLight.color.lerp(new THREE.Color(activeBiome.ambientColor), 2.5 * delta);
    this.ambientLight.intensity = THREE.MathUtils.lerp(this.ambientLight.intensity, activeBiome.ambientIntensity, 2.5 * delta);
    this.sunLight.color.lerp(new THREE.Color(activeBiome.sunColor), 2.5 * delta);
    this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, activeBiome.sunIntensity, 2.5 * delta);

    // Dynamic Track & Grid biome color transformation
    if (this.sharedTubeMat) {
      this.sharedTubeMat.color.lerp(new THREE.Color(activeBiome.tubeBaseColor), 3.0 * delta);
      this.sharedTubeMat.emissive.lerp(new THREE.Color(activeBiome.tubeEmissive), 3.0 * delta);
      this.sharedTubeMat.emissiveIntensity = THREE.MathUtils.lerp(
        this.sharedTubeMat.emissiveIntensity,
        activeBiome.tubeEmissiveIntensity,
        3.0 * delta
      );
    }
    this.sharedRailMatCyan.color.lerp(new THREE.Color(activeBiome.railColor1), 3.0 * delta);
    this.sharedRailMatPink.color.lerp(new THREE.Color(activeBiome.railColor2), 3.0 * delta);
    this.sharedRingMat.color.lerp(new THREE.Color(activeBiome.ringColor), 3.0 * delta);

    // Update megacity skyline and illuminated windows for active biome
    this.cyberCity.updateBiomeColors(
      activeBiome.railColor1,
      activeBiome.railColor2,
      activeBiome.tubeEmissive,
      delta
    );

    // Track when rival was active and despawns
    if (this.rivalInterceptor.active) {
      this.wasRivalActive = true;
    } else if (this.wasRivalActive && !this.rivalInterceptor.active) {
      this.wasRivalActive = false;
      this.lastRivalDespawnZ = this.bikeZ;
    }

    // Rival Interceptor Drone Spawning & AI Loop
    // Does NOT spawn on the first round (0 to 11,200m) so players experience all biomes and the Titan in peace!
    // When an enemy disappears, enforces a guaranteed cooldown gap (1600m - 2400m)
    const isBossTrack = this.mode === 'speedrun_5' || this.trialConfig?.modeKey === 'speedrun_5';
    const currentDiff = this.getDifficultyFactor(this.bikeZ);
    const rivalCooldown = THREE.MathUtils.lerp(2400, 1600, currentDiff);
    const canSpawnRival = this.bikeZ >= CYCLE_LENGTH &&
      (this.bikeZ - this.lastRivalDespawnZ > rivalCooldown) &&
      !this.rivalInterceptor.active &&
      !isBossBiome(this.bikeZ) &&
      !isBossTrack;

    if (canSpawnRival) {
      this.rivalInterceptor.spawn(
        this.bikeZ,
        this.bikeAngle,
        this.speedKmh / 3.6,
        activeBiome.id,
        currentDiff
      );
    }
    if (this.rivalInterceptor.active) {
      this.rivalInterceptor.update(delta, this.bikeZ, this.speedKmh / 3.6, this.bikeAngle);
    }

    // Enemy Projectiles Simulation & Collision
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      proj.z -= proj.speed * delta;
      const pos = cosmicTube.getSurfacePoint(proj.z, proj.angle, 0.4);
      proj.mesh.position.copy(pos);

      // Collision with player (dynamic pass window prevents tunneling at high speeds)
      const relSpeed = (this.speedKmh / 3.6) + proj.speed;
      const passWindow = Math.max(3.2, relSpeed * delta * 1.15);
      const dz = Math.abs(this.bikeZ - proj.z);
      if (dz < passWindow) {
        let dAngle = Math.abs(this.bikeAngle - proj.angle) % (Math.PI * 2);
        if (dAngle > Math.PI) dAngle = Math.PI * 2 - dAngle;

        if (dAngle < 0.40) {
          this.scene.remove(proj.mesh);
          this.disposeGroupDeep(proj.mesh);
          this.enemyProjectiles.splice(i, 1);

          if (proj.type === 'cryo') {
            // Cryo projectile freezes controls instead of killing!
            sound.playCryoFreeze();
            this.cryoFreezeTimer = 4.0;
            this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity, 0.6);
            this.spawnPickupShockwave(this.bikeZ, this.bikeAngle, 0x00f0ff);
            this.currentRivalAlert = {
              message: '❄️ РУЛИ ЗАМОРОЖЕНЫ! МАНЕВРЕННОСТЬ -60%',
              type: 'warning',
              show: true,
              expireAt: Date.now() + 3500,
            };
          } else {
            // Plasma fire projectile triggers fiery crash with explicit cause
            this.triggerCrash({
              id: 999999,
              type: 'plasma_firewall',
              mesh: proj.mesh,
              z: proj.z,
              angle: proj.angle,
              depthZ: 2.0,
              isPickup: false,
            }, 'ПРЯМОЕ ПОПАДАНИЕ ПЛАЗМЕННОГО АННИГИЛЯТОРА БОССА');
            return;
          }
          continue;
        }
      }

      if (proj.z < this.bikeZ - 25) {
        this.scene.remove(proj.mesh);
        this.disposeGroupDeep(proj.mesh);
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // Titan Boss Battle in Void Abyss or Speedrun Trial 5 (Boss Fight)
    const inBossBiome = isBossBiome(this.bikeZ);
    if (isBossTrack) {
      if (!this.titanBoss.active && !this.bossDefeatedRewardClaimed && this.bikeZ < 5950) {
        this.titanBoss.spawn(this.bikeZ, this.bikeAngle, 6000);
      }
    } else if (inBossBiome && !this.trialConfig) {
      if (!this.titanBoss.active && !this.bossDefeatedRewardClaimed) {
        this.titanBoss.spawn(this.bikeZ, this.bikeAngle, BOSS_END_DIST - BOSS_START_DIST);
      }
    } else {
      if (!inBossBiome && this.bossDefeatedRewardClaimed) {
        this.bossDefeatedRewardClaimed = false;
      }
    }

    if (this.titanBoss.active) {
      this.titanBoss.update(delta, this.bikeZ, this.speedKmh / 3.6, this.bikeAngle);

      if (isBossTrack) {
        if (this.bikeZ >= 5950 && !this.bossDefeatedRewardClaimed) {
          this.bossDefeatedRewardClaimed = true;
          this.titanBoss.triggerDefeat('🏆 ФЛАГМАН «АРХИТЕКТОР БЕЗДНЫ» УНИЧТОЖЕН! 6 000М ПРЕОДОЛЕНО!');
        }
      } else {
        const distInLoop = ((this.bikeZ % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
        if (distInLoop >= BOSS_END_DIST - 50 && !this.bossDefeatedRewardClaimed) {
          this.bossDefeatedRewardClaimed = true;
          this.titanBoss.triggerDefeat();
        }
      }

      if (this.titanBoss.checkLaserHit(this.bikeZ, this.bikeAngle)) {
        this.triggerCrash({
          id: 888888,
          type: 'laser_quad_gate',
          mesh: this.titanBoss.mesh,
          z: this.bikeZ,
          angle: this.bikeAngle,
          depthZ: 4.0,
          isPickup: false,
        }, 'РАССЕЧЕНИЕ ОРБИТАЛЬНЫМ ЛАЗЕРОМ БОССА');
        return;
      }
    }

    // Pickup Impact Shockwaves
    for (let i = this.pickupShockwaves.length - 1; i >= 0; i--) {
      const sw = this.pickupShockwaves[i];
      sw.life -= delta;
      sw.scale += delta * 10.0;
      sw.mesh.scale.set(sw.scale, sw.scale, sw.scale);
      (sw.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, sw.life / sw.maxLife);
      if (sw.life <= 0) {
        this.scene.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        this.pickupShockwaves.splice(i, 1);
      }
    }

    // Throttle HUD callback to ~25 FPS
    const now = performance.now();
    if (now - this.lastHudUpdateTime >= 38) {
      this.lastHudUpdateTime = now;

      const radarObstacles = this.obstacles
        .filter((o) => !o.cleared && o.z > this.bikeZ - 2 && o.z < this.bikeZ + 140)
        .slice(0, 8)
        .map((o) => ({
          angle: o.angle,
          safeCenter: o.safeCenter,
          distZ: o.z - this.bikeZ,
          type: o.type,
          blockedSectors: o.blockedSectors,
        }));

      const nowMs = Date.now();
      const activeBanner = this.biomeBanner && this.biomeBanner.expireAt > nowMs ? {
        nameRu: this.biomeBanner.nameRu,
        subtitle: this.biomeBanner.subtitle,
        color: this.biomeBanner.color,
        show: true,
      } : undefined;

      const activeRivalAlert = this.currentRivalAlert && this.currentRivalAlert.expireAt > nowMs ? {
        message: this.currentRivalAlert.message,
        type: this.currentRivalAlert.type,
        show: true,
      } : undefined;

      const activePickup = this.currentPickupFeedback && this.currentPickupFeedback.expireAt > nowMs ? {
        id: this.currentPickupFeedback.id,
        type: this.currentPickupFeedback.type,
        text: this.currentPickupFeedback.text,
        subtext: this.currentPickupFeedback.subtext,
        color: this.currentPickupFeedback.color,
        timestamp: this.currentPickupFeedback.timestamp,
      } : undefined;

      this.callbacks.onUpdateHUD({
        speedKmh: Math.round(this.speedKmh),
        speedClass: this.currentSpeedClass,
        smoothness: Math.round(this.smoothnessFactor),
        distance: Math.round(this.bikeZ),
        timeMs: this.gameTimeMs,
        remainingTimeMs: this.mode === 'sprint_30s' ? this.sprintRemainingMs : undefined,
        grazeStreak: this.grazeStreak,
        coins: this.coinsCollected,
        scrap: this.scrapCollected,
        currentSector: this.currentSector,
        rank: 1,
        totalRacers: 6,
        powerUps: this.inputBoost
          ? [{ type: 'boost', remainingMs: 1000, totalMs: 1000 }]
          : [],
        cylinderAngle: this.bikeAngle,
        obstaclesRadar: radarObstacles,
        biome: {
          id: activeBiome.id,
          nameRu: activeBiome.nameRu,
          nameEn: activeBiome.nameEn,
          subtitle: activeBiome.subtitle,
          bannerColor: activeBiome.bannerColor,
          accentColor: activeBiome.accentColor,
        },
        biomeBanner: activeBanner,
        rivalAlert: activeRivalAlert,
        pickupFeedback: activePickup,
        bossState: this.titanBoss.active ? {
          active: true,
          progressMeters: isBossTrack
            ? Math.floor(Math.min(6000, this.bikeZ))
            : Math.floor(Math.max(0, Math.min(BOSS_END_DIST - BOSS_START_DIST, ((this.bikeZ % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH - BOSS_START_DIST))),
          targetMeters: isBossTrack ? 6000 : (BOSS_END_DIST - BOSS_START_DIST),
          currentAttack: this.titanBoss.currentAttack,
          warning: this.titanBoss.attackWarning,
        } : undefined,
        cryoFreezeActive: this.cryoFreezeTimer > 0,
      });
    }
  }

  private disposeGroupDeep(group: THREE.Object3D) {
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry && !mesh.userData.isShared) {
        mesh.geometry.dispose();
      }
    });
  }

  private handleGrazeEvent(obs: ObstacleData) {
    this.grazeStreak++;
    this.totalGrazes++;
    const speedBonus = 50 + this.vehicleDef.stats.grazeRadius * 7;
    this.speedKmh += speedBonus;
    this.coinsCollected += 5 * Math.min(this.grazeStreak, 10);
    this.scrapCollected += 1;
    this.cameraShakeIntensity = 0.45; // Thrilling near-miss camera shake!

    sound.playGraze();

    if (this.callbacks.onGrazeTrigger) {
      this.callbacks.onGrazeTrigger(speedBonus, this.grazeStreak);
    }
  }

  private updateObstaclesAndTrack(delta: number) {
    // Dynamic looping of tube chunks as player moves forward
    for (let i = 0; i < this.tubeChunks.length; i++) {
      const chunk = this.tubeChunks[i];
      if (chunk.startZ + chunk.length < this.bikeZ - 40) {
        // Move chunk forward to the front and clean up memory
        this.scene.remove(chunk.group);
        this.disposeGroupDeep(chunk.group);

        const newStartZ = this.chunkLastGeneratedZ;
        const newGroup = this.createTubeChunkMesh(newStartZ, chunk.length);
        this.scene.add(newGroup);
        chunk.group = newGroup;
        chunk.startZ = newStartZ;
        this.chunkLastGeneratedZ += chunk.length;
      }
    }

    // Keep starfield centered around current bike position
    if (Math.abs(this.starfield.position.z - this.bikeZ) > 300) {
      this.starfield.position.z = this.bikeZ;
      const center = cosmicTube.getCenter(this.bikeZ);
      this.starfield.position.x = center.x;
      this.starfield.position.y = center.y;
    }

    // Spawn obstacles continuously ahead along the tube (up to trial finish for speedruns)
    const maxTargetSpawn = this.trialConfig ? this.trialConfig.targetDistance + 50 : this.bikeZ + 750;
    while (this.lastSpawnedObstacleZ < Math.min(this.bikeZ + 750, maxTargetSpawn)) {
      const step = this.getObstacleStepAtZ(this.lastSpawnedObstacleZ);
      this.lastSpawnedObstacleZ += step;
      this.spawnObstacleAtZ(this.lastSpawnedObstacleZ);
    }

    if (this.isAttractMode) return;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Clean up past obstacles
      if (obs.z < this.bikeZ - 35) {
        this.scene.remove(obs.mesh);
        this.disposeGroupDeep(obs.mesh);
        this.obstacles.splice(i, 1);
        continue;
      }

      // Dynamic moving obstacles animation
      if (obs.movement) {
        if (obs.movement.type === 'rotate') {
          const rotDelta = obs.movement.speed * delta;
          const innerRotor = obs.mesh.getObjectByName('inner_rotor');
          if (innerRotor) {
            innerRotor.rotateZ(rotDelta);
          } else {
            obs.mesh.rotateZ(rotDelta);
          }
          obs.movement.currentAngle = normalizeAngle((obs.movement.currentAngle ?? obs.angle) + rotDelta);
          if (obs.blockedSectors) {
            for (let s = 0; s < obs.blockedSectors.length; s++) {
              const sec = obs.blockedSectors[s];
              sec.centerAngle = normalizeAngle((sec.centerAngle ?? 0) + rotDelta);
              sec.minAngle = normalizeAngle(sec.centerAngle - (sec.halfArc ?? 0.38));
              sec.maxAngle = normalizeAngle(sec.centerAngle + (sec.halfArc ?? 0.38));
            }
          }
        } else if (obs.movement.type === 'sweep' || obs.movement.type === 'oscillate') {
          const t = this.gameTimeMs * 0.001;
          const sweepOffset = Math.sin(t * obs.movement.speed) * (obs.movement.amplitude ?? 0.65);
          const newAngle = normalizeAngle(obs.movement.baseAngle + sweepOffset);
          const innerRotor = obs.mesh.getObjectByName('inner_rotor');
          if (innerRotor) {
            // Keep local coordinate system alignment (-Math.PI/2 offset)
            innerRotor.rotation.z = (obs.movement.baseAngle - Math.PI / 2) + sweepOffset;
          }
          if (obs.blockedSectors && obs.blockedSectors[0]) {
            const sec = obs.blockedSectors[0];
            sec.centerAngle = newAngle;
            sec.minAngle = normalizeAngle(newAngle - (sec.halfArc ?? 0.45));
            sec.maxAngle = normalizeAngle(newAngle + (sec.halfArc ?? 0.45));
          }
        }
      }

      // Counter-rotating cryo vortex spinner
      const vortexSpinner = obs.mesh.getObjectByName('vortex_spinner');
      if (vortexSpinner) {
        vortexSpinner.rotateZ(2.8 * delta);
      }

      // Rotate spinning collectibles
      if (obs.type === 'energy_prism' || obs.type === 'hyper_battery') {
        const body = obs.mesh.getObjectByName('prism_body');
        if (body) {
          body.rotation.y += 0.05;
          body.rotation.x += 0.02;
        }
      }

      const halfDepth = (obs.depthZ ?? 2.5) * 0.5;

      // 1. If player ship's tail has cleared the rear of the obstacle, mark it cleared permanently
      if (this.bikeZ - 0.9 > obs.z + halfDepth) {
        obs.cleared = true;
      }
      if (obs.cleared) {
        continue;
      }

      // 2. Strict Z-Axis intersection check:
      // Ship nose is at bikeZ + 0.8, Obstacle front is at obs.z - halfDepth
      const bikeFront = this.bikeZ + 0.8;
      const obsFront = obs.z - halfDepth;
      if (bikeFront < obsFront) {
        // Obstacle is still ahead down the track
        continue;
      }

      // At this point, the bike is physically traversing through the obstacle's Z-slice
      // Boost Pad pickup
      if (obs.type === 'boost_pad') {
        const isOver = obs.blockedSectors?.some((sec: any) => {
          const center = sec.centerAngle ?? (sec.minAngle + sec.maxAngle) * 0.5;
          const halfArc = sec.halfArc ?? 0.35;
          return shortestAngleDist(this.bikeAngle, center) <= halfArc + 0.1;
        });
        if (isOver && !obs.grazed) {
          obs.grazed = true;
          this.speedKmh += 160;
          this.cameraShakeIntensity = 0.3;
          sound.playBoost();
          this.triggerPickupFeedback('boost', 'ГИПЕР-УСКОРЕНИЕ!', '+160 КМ/Ч', '#ff007f');
          this.spawnPickupShockwave(obs.z, obs.angle, 0xff007f);
          continue;
        }
      }

      // Collectible Energy Prism
      if (obs.type === 'energy_prism') {
        const isOver = obs.blockedSectors?.some((sec: any) => {
          const center = sec.centerAngle ?? (sec.minAngle + sec.maxAngle) * 0.5;
          const halfArc = sec.halfArc ?? 0.35;
          return shortestAngleDist(this.bikeAngle, center) <= halfArc + 0.15;
        });
        if (isOver && !obs.collected) {
          obs.collected = true;
          this.coinsCollected += 50;
          this.scrapCollected += 3;
          this.cameraShakeIntensity = 0.2;
          sound.playPrismCollect();
          this.triggerPickupFeedback('coin', '+50 КРЕДИТОВ!', 'ЭНЕРГО-ПРИЗМА СОБРАНА', '#00f0ff');
          this.spawnPickupShockwave(obs.z, obs.angle, 0x00f0ff);
          this.scene.remove(obs.mesh);
          this.disposeGroupDeep(obs.mesh);
          continue;
        }
      }

      // Collectible Hyper Battery
      if (obs.type === 'hyper_battery') {
        const isOver = obs.blockedSectors?.some((sec: any) => {
          const center = sec.centerAngle ?? (sec.minAngle + sec.maxAngle) * 0.5;
          const halfArc = sec.halfArc ?? 0.38;
          return shortestAngleDist(this.bikeAngle, center) <= halfArc + 0.15;
        });
        if (isOver && !obs.collected) {
          obs.collected = true;
          this.coinsCollected += 100;
          this.scrapCollected += 5;
          this.speedKmh += 140;
          this.cameraShakeIntensity = 0.35;
          sound.playPickupBig();
          this.triggerPickupFeedback('battery', '+100 МОНЕТ! +5 СКРАПА!', 'ГИПЕР-АККУМУЛЯТОР АКТИВИРОВАН', '#fcee0a');
          this.spawnPickupShockwave(obs.z, obs.angle, 0xfcee0a);
          this.scene.remove(obs.mesh);
          this.disposeGroupDeep(obs.mesh);
          continue;
        }
      }

      // Real Obstacle Collision & Graze checking
      if (!obs.isPickup) {
        let hitsObstacle = false;
        let isGraze = false;

        const sectors = obs.blockedSectors ?? [
          { centerAngle: obs.angle, halfArc: 0.42 } as any,
        ];

        for (const sec of sectors as any[]) {
          const center = sec.centerAngle ?? (sec.minAngle + sec.maxAngle) * 0.5;
          const halfArc = sec.halfArc ?? 0.42;
          const dist = shortestAngleDist(this.bikeAngle, center);

          // Collision: player is strictly within the blocked sector
          if (dist <= halfArc) {
            hitsObstacle = true;
            break;
          } else if (dist <= halfArc + 0.28) {
            // Near-miss grazing: within 0.28 radians (~1.8m) of the obstacle edge
            isGraze = true;
          }
        }

        if (hitsObstacle) {
          this.triggerCrash(obs);
          return;
        } else if (isGraze && !obs.grazed) {
          obs.grazed = true;
          this.handleGrazeEvent(obs);
        }
      }
    }
  }

  private updateCamera(delta: number) {
    // Smooth camera orbital angle around cylinder (circular shortest path)
    let angleDiff = this.bikeAngle - this.camAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.camAngle += angleDiff * Math.min(1.0, 9.0 * delta);

    // Camera position strictly synchronized with smoothed camAngle
    const targetCamPos = cosmicTube.getSurfacePoint(this.bikeZ - 8.2, this.camAngle, 3.1);
    this.camera.position.copy(targetCamPos);

    // Radial outward normal MUST be copied to camera.up BEFORE camera.lookAt!
    const outwardNormal = cosmicTube.getRadialNormal(this.bikeZ, this.camAngle);
    this.camera.up.copy(outwardNormal);

    // Look ahead down the winding highway
    const lookTarget = cosmicTube.getSurfacePoint(this.bikeZ + 32.0, this.camAngle, 1.1);
    this.camera.lookAt(lookTarget);

    // Camera shake on graze, boost, and high-speed turbulence
    if (this.cameraShakeIntensity > 0.001) {
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.addScaledVector(this.camera.up, shakeY);
      this.cameraShakeIntensity = THREE.MathUtils.lerp(this.cameraShakeIntensity, 0, 8 * delta);
    }

    // Dynamic FOV for warp sensation
    const targetFov =
      this.currentSpeedClass === 'OVERDRIVE'
        ? 88
        : this.currentSpeedClass === 'WARP'
        ? 82
        : this.currentSpeedClass === 'HYPER'
        ? 76
        : this.currentSpeedClass === 'APEX'
        ? 71
        : 65;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 6 * delta);
    this.camera.updateProjectionMatrix();
  }

  private updateWarpSlipstream(delta: number) {
    if (!this.warpParticles || !this.warpPositions) return;

    const targetOpacity =
      this.currentSpeedClass === 'OVERDRIVE'
        ? 0.85
        : this.currentSpeedClass === 'WARP'
        ? 0.65
        : this.currentSpeedClass === 'HYPER'
        ? 0.45
        : this.currentSpeedClass === 'APEX'
        ? 0.2
        : 0.0;
    const mat = this.warpParticles.material as THREE.PointsMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 5 * delta);

    if (mat.opacity <= 0.02) return;

    const count = this.warpPositions.length / 3;
    const center = cosmicTube.getCenter(this.bikeZ);

    for (let i = 0; i < count; i++) {
      // Move particles backward relative to bike
      this.warpPositions[i * 3 + 2] -= (this.speedKmh / 3.6) * delta * 2.2;
      if (this.warpPositions[i * 3 + 2] < this.bikeZ - 20) {
        this.warpPositions[i * 3 + 2] = this.bikeZ + 100 + Math.random() * 40;
        this.warpPositions[i * 3] = center.x + (Math.random() - 0.5) * 35;
        this.warpPositions[i * 3 + 1] = center.y + (Math.random() - 0.5) * 35;
      }
    }

    const posAttr = this.warpParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
  }

  private updateGhost(delta: number) {
    if (!this.ghostMesh || !this.ghostFramesToPlay || this.ghostFramesToPlay.length === 0) return;

    const targetTime = this.gameTimeMs;
    const frame = this.ghostFramesToPlay.find((f) => f.timeMs >= targetTime);

    if (frame) {
      const pos = cosmicTube.getSurfacePoint(frame.z, frame.angle, 0.25);
      this.ghostMesh.position.copy(pos);

      const normal = cosmicTube.getRadialNormal(frame.z, frame.angle);
      const tangent = cosmicTube.getTangent(frame.z);
      const lateral = new THREE.Vector3().crossVectors(normal, tangent).normalize();
      this.ghostMesh.setRotationFromMatrix(new THREE.Matrix4().makeBasis(lateral, normal, tangent));
    }
  }

  private triggerCrash(hitObstacle: ObstacleData, customReason?: string) {
    this.isPaused = true;
    sound.stopMusic();
    sound.playVoxelExplosion();

    this.bikeMesh.visible = false;

    // Determine precise death reason for clear player feedback
    let crashReason = customReason;
    if (!crashReason) {
      if (hitObstacle.type === 'quantum_mine') {
        crashReason = 'ПОДРЫВ НА КЛАСТЕРНОЙ МИНЕ ПУСТОТЫ';
      } else if (hitObstacle.type === 'laser_quad_gate') {
        crashReason = 'РАССЕЧЕНИЕ ОРБИТАЛЬНЫМ ЛАЗЕРОМ БОССА';
      } else if (hitObstacle.type === 'plasma_firewall') {
        crashReason = 'ПРЯМОЕ ПОПАДАНИЕ ПЛАЗМЕННОГО АННИГИЛЯТОРА БОССА';
      } else {
        crashReason = 'СТОЛКНОВЕНИЕ С НЕОНОВЫМ БАРЬЕРОМ';
      }
    }

    // Spectacular neon voxel explosion shower
    const colors = [this.vehicleDef.baseColor, this.vehicleDef.glowColor, '#ff0055', '#00f0ff', '#ffffff'];
    for (let i = 0; i < 90; i++) {
      const size = 0.25 + Math.random() * 0.35;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const voxel = createNeonBox(size, size, size, color, 2.0);
      voxel.position.copy(this.bikeMesh.position);
      voxel.position.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.8
        )
      );

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 25 + 5
      );

      this.debrisGroup.add(voxel);
      this.debrisList.push({ mesh: voxel, velocity: vel, life: 1.6 });
    }

    this.voxelsDestroyed += 55;

    setTimeout(() => {
      this.callbacks.onGameOver({
        distance: Math.round(this.bikeZ),
        timeMs: this.gameTimeMs,
        maxSpeedKmh: this.maxSpeedReached,
        speedClassReached: this.currentSpeedClass,
        grazeCount: this.totalGrazes,
        coinsCollected: this.coinsCollected,
        scrapCollected: this.scrapCollected,
        voxelsDestroyed: this.voxelsDestroyed,
        completed: false,
        reason: crashReason,
        ghostData: this.recordedFrames,
      });
    }, 900);
  }

  private triggerFinish(reason: string) {
    this.isPaused = true;
    sound.stopMusic();
    sound.playCheckpoint();

    setTimeout(() => {
      this.callbacks.onGameOver({
        distance: Math.round(this.bikeZ),
        timeMs: this.gameTimeMs,
        maxSpeedKmh: this.maxSpeedReached,
        speedClassReached: this.currentSpeedClass,
        grazeCount: this.totalGrazes,
        coinsCollected: this.coinsCollected,
        scrapCollected: this.scrapCollected,
        voxelsDestroyed: this.voxelsDestroyed,
        completed: true,
        reason,
        ghostData: this.recordedFrames,
      });
    }, 500);
  }

  private updateDebris(delta: number) {
    for (let i = this.debrisList.length - 1; i >= 0; i--) {
      const d = this.debrisList[i];
      d.mesh.position.addScaledVector(d.velocity, delta);
      d.mesh.rotation.x += delta * 6;
      d.mesh.rotation.y += delta * 8;
      d.life -= delta;

      if (d.life <= 0) {
        this.debrisGroup.remove(d.mesh);
        this.debrisList.splice(i, 1);
      }
    }
  }

  public handleResize() {
    const width = Math.max(this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 320), 320);
    const height = Math.max(this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 480), 480);
    if (this.camera && this.renderer) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  public destroy() {
    this.isDestroyed = true;
    sound.stopMusic();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.bikeTrail.dispose();
    this.titanBoss.dispose(this.scene);
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}
