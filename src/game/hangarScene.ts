import * as THREE from 'three';
import { VehicleDef } from '../types';
import { buildCyberRacerShip } from './shipModel';

export type HangarBiomeTheme = 'neo_metropolis' | 'inferno_core' | 'cryo_void' | 'quantum_horizon';

export interface HangarThemeConfig {
  bgColor: number;
  fogColor: number;
  fogDensity: number;
  ambientColor: number;
  ambientIntensity: number;
  keyLightColor: number;
  rimLeftColor: number;
  rimRightColor: number;
  platformRingColor: number;
  particleColor: number;
}

const THEME_CONFIGS: Record<HangarBiomeTheme, HangarThemeConfig> = {
  neo_metropolis: {
    bgColor: 0x090f24,
    fogColor: 0x0a112b,
    fogDensity: 0.022,
    ambientColor: 0x38bdf8,
    ambientIntensity: 1.8,
    keyLightColor: 0xffffff,
    rimLeftColor: 0x00f0ff,
    rimRightColor: 0xff007f,
    platformRingColor: 0x00f0ff,
    particleColor: 0x00f0ff,
  },
  inferno_core: {
    bgColor: 0x240803,
    fogColor: 0x2b0a04,
    fogDensity: 0.024,
    ambientColor: 0xff5500,
    ambientIntensity: 2.2,
    keyLightColor: 0xffd1a4,
    rimLeftColor: 0xff4500,
    rimRightColor: 0xffaa00,
    platformRingColor: 0xff3300,
    particleColor: 0xff6600,
  },
  cryo_void: {
    bgColor: 0x04162e,
    fogColor: 0x051b38,
    fogDensity: 0.022,
    ambientColor: 0x67e8f9,
    ambientIntensity: 1.9,
    keyLightColor: 0xe0f2fe,
    rimLeftColor: 0x00f0ff,
    rimRightColor: 0x818cf8,
    platformRingColor: 0x00f0ff,
    particleColor: 0xa5f3fc,
  },
  quantum_horizon: {
    bgColor: 0x190326,
    fogColor: 0x1f042e,
    fogDensity: 0.024,
    ambientColor: 0xa855f7,
    ambientIntensity: 2.0,
    keyLightColor: 0xf5d0fe,
    rimLeftColor: 0x39ff14,
    rimRightColor: 0xc026d3,
    platformRingColor: 0x39ff14,
    particleColor: 0x39ff14,
  },
};

export class Hangar3DScene {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animId: number = 0;
  private shipGroup: THREE.Group | null = null;
  private turntable: THREE.Group;
  private holoRing1!: THREE.Mesh;
  private holoRing2!: THREE.Mesh;
  private lights: THREE.Group;
  private backdropGroup: THREE.Group;
  private dustParticles: THREE.Points | null = null;
  private steamParticles: THREE.Points | null = null;
  private coolantTubes: THREE.Mesh[] = [];

  // Dynamic light references
  private ambLight!: THREE.AmbientLight;
  private keySpot!: THREE.SpotLight;
  private rimLeft!: THREE.PointLight;
  private rimRight!: THREE.PointLight;
  private underLight!: THREE.PointLight;
  private frontFill!: THREE.PointLight;

  // Active theme
  private currentTheme: HangarBiomeTheme = 'neo_metropolis';

  // Interaction controls
  private isDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  private targetRotationY = 0;
  private currentRotationY = 0;
  private targetRotationX = 0.15;
  private currentRotationX = 0.15;
  private targetDist = 4.2;
  private currentDist = 4.2;
  private autoRotate = true;
  private revTimer = 0;

  constructor(container: HTMLDivElement, initialVehicle: VehicleDef, initialTheme: HangarBiomeTheme = 'neo_metropolis') {
    this.container = container;
    this.currentTheme = initialTheme;
    const width = Math.max(container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 320), 320);
    const height = Math.max(container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 400), 300);

    this.scene = new THREE.Scene();
    const cfg = THEME_CONFIGS[this.currentTheme];
    this.scene.background = new THREE.Color(cfg.bgColor);
    this.scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fogDensity);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 1.5, 4.2);
    this.camera.lookAt(0, 0.25, 0);

    let rendererInstance: THREE.WebGLRenderer | null = null;
    const rendererConfigs: THREE.WebGLRendererParameters[] = [
      { antialias: true, alpha: false, powerPreference: 'default' },
      { antialias: false, alpha: false, powerPreference: 'default' },
      { antialias: false, alpha: false, powerPreference: 'low-power' },
    ];

    for (const conf of rendererConfigs) {
      try {
        rendererInstance = new THREE.WebGLRenderer(conf);
        if (rendererInstance && rendererInstance.getContext()) break;
      } catch (e) {
        console.warn('[Hangar] WebGL renderer try failed:', e);
      }
    }

    if (!rendererInstance) {
      throw new Error('WebGL не поддерживается');
    }
    this.renderer = rendererInstance;

    this.renderer.domElement.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
      },
      false,
    );
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    this.backdropGroup = new THREE.Group();
    this.scene.add(this.backdropGroup);

    this.turntable = new THREE.Group();
    this.scene.add(this.turntable);

    this.lights = new THREE.Group();
    this.scene.add(this.lights);

    this.setupLighting();
    this.setupTurntableEnvironment();
    this.setupBackdropScenery();
    this.setupAtmosphere();
    this.setupShip(initialVehicle);
    this.bindEvents();
    this.startLoop();
  }

  public setBiomeTheme(theme: HangarBiomeTheme) {
    this.currentTheme = theme;
    const cfg = THEME_CONFIGS[theme];

    // Background & fog
    (this.scene.background as THREE.Color).setHex(cfg.bgColor);
    if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(cfg.fogColor);
      this.scene.fog.density = cfg.fogDensity;
    }

    // Lights
    this.ambLight.color.setHex(cfg.ambientColor);
    this.ambLight.intensity = cfg.ambientIntensity;
    this.keySpot.color.setHex(cfg.keyLightColor);
    this.rimLeft.color.setHex(cfg.rimLeftColor);
    this.rimRight.color.setHex(cfg.rimRightColor);
    this.underLight.color.setHex(cfg.platformRingColor);
    (this.holoRing1.material as THREE.MeshBasicMaterial).color.setHex(cfg.platformRingColor);
    (this.holoRing2.material as THREE.MeshBasicMaterial).color.setHex(cfg.rimRightColor);

    this.coolantTubes.forEach((tube) => {
      const mat = tube.material as THREE.MeshBasicMaterial;
      if (mat) mat.color.setHex(cfg.platformRingColor);
    });
    if (this.steamParticles) {
      (this.steamParticles.material as THREE.PointsMaterial).color.setHex(cfg.platformRingColor);
    }

    // Rebuild scenery backdrop for chosen biome
    this.setupBackdropScenery();
    this.setupAtmosphere();
  }

  private setupLighting() {
    const cfg = THEME_CONFIGS[this.currentTheme];

    // High-output ambient fill to banish dark muddy shadows
    this.ambLight = new THREE.AmbientLight(cfg.ambientColor, cfg.ambientIntensity * 1.55);
    this.lights.add(this.ambLight);

    // Primary High-Output Key Spotlight (sharp automotive specular reflection)
    this.keySpot = new THREE.SpotLight(cfg.keyLightColor, 7.8, 30, Math.PI / 3.4, 0.25);
    this.keySpot.position.set(0, 8.5, 3.2);
    this.keySpot.target.position.set(0, 0.25, 0);
    this.lights.add(this.keySpot);
    this.lights.add(this.keySpot.target);

    // Contrasting Razor Rim Light (Left)
    this.rimLeft = new THREE.PointLight(cfg.rimLeftColor, 6.2, 16);
    this.rimLeft.position.set(-4.5, 2.2, -1.2);
    this.lights.add(this.rimLeft);

    // Contrasting Razor Rim Light (Right)
    this.rimRight = new THREE.PointLight(cfg.rimRightColor, 6.2, 16);
    this.rimRight.position.set(4.5, 2.2, -1.2);
    this.lights.add(this.rimRight);

    // Front Nose Fill Light (vivid headlights and cockpit illumination)
    this.frontFill = new THREE.PointLight(0xffffff, 4.2, 12);
    this.frontFill.position.set(0, 1.8, 3.8);
    this.lights.add(this.frontFill);

    // Under-Pedestal Magnetic Levitation Uplight
    this.underLight = new THREE.PointLight(cfg.platformRingColor, 5.0, 8);
    this.underLight.position.set(0, 0.1, 0);
    this.lights.add(this.underLight);

    // Studio Overhead LED Light Strips (visible in reflections!)
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripGeom = new THREE.BoxGeometry(0.18, 0.05, 5.5);
    const stripL = new THREE.Mesh(stripGeom, stripMat);
    stripL.position.set(-1.9, 5.0, 0);
    const stripR = new THREE.Mesh(stripGeom, stripMat);
    stripR.position.set(1.9, 5.0, 0);
    this.scene.add(stripL, stripR);
  }

  private setupTurntableEnvironment() {
    const cfg = THEME_CONFIGS[this.currentTheme];

    // Showroom Hex Deck Floor with high reflectivity
    const floorGeom = new THREE.CircleGeometry(16, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f1422,
      roughness: 0.12,
      metalness: 0.92,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.12;
    this.scene.add(floor);

    // Radial Docking Runway Markings
    const runwayRing = new THREE.Mesh(
      new THREE.RingGeometry(3.1, 3.22, 48),
      new THREE.MeshBasicMaterial({ color: 0x334155 })
    );
    runwayRing.rotation.x = -Math.PI / 2;
    runwayRing.position.y = -0.11;
    this.scene.add(runwayRing);

    // --- High-Tech Multi-Tier Pedestal ---
    // 1. Heavy Octagonal Armored Foundation
    const baseGeom = new THREE.CylinderGeometry(2.95, 3.25, 0.2, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x131b2e,
      roughness: 0.28,
      metalness: 0.85,
    });
    const basePlaform = new THREE.Mesh(baseGeom, baseMat);
    basePlaform.position.y = -0.1;
    this.scene.add(basePlaform);

    // 2. Rotating Upper Magnetic Deck
    const pedestalGeom = new THREE.CylinderGeometry(2.45, 2.65, 0.14, 40);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.18,
      metalness: 0.9,
    });
    const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestal.position.y = 0.08;
    this.turntable.add(pedestal);

    // 3. Four Heavy Chrome Hydraulic Piston Shock-Struts
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const x = Math.cos(a) * 2.1;
      const z = Math.sin(a) * 2.1;

      // Piston housing
      const houseGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.22, 12);
      const houseMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.3 });
      const house = new THREE.Mesh(houseGeom, houseMat);
      house.position.set(x, -0.01, z);
      this.scene.add(house);

      // Chrome inner shaft
      const shaftGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.16, 12);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.98, roughness: 0.05 });
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);
      shaft.position.set(x, 0.08, z);
      this.scene.add(shaft);
    }

    // 4. Outer Rotating Holographic Alignment Ring
    const ring1Geom = new THREE.TorusGeometry(2.32, 0.035, 8, 56);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: cfg.platformRingColor });
    this.holoRing1 = new THREE.Mesh(ring1Geom, ring1Mat);
    this.holoRing1.rotation.x = Math.PI / 2;
    this.holoRing1.position.y = 0.16;
    this.turntable.add(this.holoRing1);

    // 5. Inner Reticle Ring
    const ring2Geom = new THREE.TorusGeometry(1.72, 0.025, 8, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: cfg.rimRightColor });
    this.holoRing2 = new THREE.Mesh(ring2Geom, ring2Mat);
    this.holoRing2.rotation.x = Math.PI / 2;
    this.holoRing2.position.y = 0.165;
    this.turntable.add(this.holoRing2);

    // 6. Docking Edge Beacon Lights
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const bGeom = new THREE.BoxGeometry(0.09, 0.04, 0.28);
      const bMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? cfg.platformRingColor : cfg.rimRightColor });
      const b = new THREE.Mesh(bGeom, bMat);
      b.position.set(Math.cos(a) * 2.45, 0.155, Math.sin(a) * 2.45);
      b.rotation.y = -a;
      this.turntable.add(b);
    }

    // --- Industrial Conduit & Cryogenic Pipe System ---
    this.coolantTubes = [];
    const pipeAngles = [-Math.PI * 0.72, -Math.PI * 0.28, Math.PI * 0.28, Math.PI * 0.72];
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });

    pipeAngles.forEach((angle) => {
      const pipeGroup = new THREE.Group();
      const length = 5.2;

      // Heavy conduit outer sheath
      const pipeGeom = new THREE.CylinderGeometry(0.09, 0.09, length, 12);
      pipeGeom.rotateX(Math.PI / 2);
      const pipeMesh = new THREE.Mesh(pipeGeom, pipeMat);
      pipeMesh.position.set(0, -0.04, length * 0.5 + 2.8);
      pipeGroup.add(pipeMesh);

      // Glowing liquid plasma / coolant window tube
      const coolantGeom = new THREE.CylinderGeometry(0.045, 0.045, length * 0.65, 10);
      coolantGeom.rotateX(Math.PI / 2);
      const coolantMat = new THREE.MeshBasicMaterial({
        color: cfg.platformRingColor,
        transparent: true,
        opacity: 0.9,
      });
      const coolantMesh = new THREE.Mesh(coolantGeom, coolantMat);
      coolantMesh.position.set(0, -0.01, length * 0.5 + 2.8);
      pipeGroup.add(coolantMesh);
      this.coolantTubes.push(coolantMesh);

      // Reinforced coupling rings along pipe
      [3.4, 4.6, 5.8, 7.0].forEach((dist) => {
        const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 16), jointMat);
        ringMesh.position.set(0, -0.04, dist);
        pipeGroup.add(ringMesh);
      });

      // Cable bundle harness flanking the pipe
      const cableMat = new THREE.MeshStandardMaterial({ color: 0x0a0e17, roughness: 0.6 });
      const cableGeom = new THREE.CylinderGeometry(0.035, 0.035, length, 8);
      cableGeom.rotateX(Math.PI / 2);
      const cable1 = new THREE.Mesh(cableGeom, cableMat);
      cable1.position.set(-0.16, -0.07, length * 0.5 + 2.8);
      const cable2 = cable1.clone();
      cable2.position.x = 0.16;
      pipeGroup.add(cable1, cable2);

      pipeGroup.rotation.y = angle;
      this.scene.add(pipeGroup);
    });

    // Floor steam vents with vapor effect around pedestal
    this.setupSteamVapor();
  }

  private setupSteamVapor() {
    if (this.steamParticles) {
      this.scene.remove(this.steamParticles);
      this.steamParticles.geometry.dispose();
      this.steamParticles = null;
    }

    const cfg = THEME_CONFIGS[this.currentTheme];
    const sCount = 80;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(sCount * 3);

    for (let i = 0; i < sCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2.4 + Math.random() * 0.8;
      pos[i * 3 + 0] = Math.cos(a) * r;
      pos[i * 3 + 1] = 0.05 + Math.random() * 0.8;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const sMat = new THREE.PointsMaterial({
      size: 0.12,
      color: cfg.platformRingColor,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    this.steamParticles = new THREE.Points(geom, sMat);
    this.scene.add(this.steamParticles);
  }

  private setupBackdropScenery() {
    // Clear old scenery
    while (this.backdropGroup.children.length > 0) {
      const c = this.backdropGroup.children[0];
      this.backdropGroup.remove(c);
    }

    const cfg = THEME_CONFIGS[this.currentTheme];

    // Rear Launch Bay Gate Arch
    const archGeom = new THREE.TorusGeometry(6.5, 0.35, 8, 36, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const arch = new THREE.Mesh(archGeom, archMat);
    arch.position.set(0, 0, -6.5);
    this.backdropGroup.add(arch);

    // Neon Gate Outline
    const neonArch = new THREE.Mesh(
      new THREE.TorusGeometry(6.6, 0.08, 6, 36, Math.PI),
      new THREE.MeshBasicMaterial({ color: cfg.platformRingColor })
    );
    neonArch.position.set(0, 0, -6.4);
    this.backdropGroup.add(neonArch);

    if (this.currentTheme === 'neo_metropolis') {
      // Futuristic Metropolis Skyline Backdrop
      const bldgCount = 18;
      for (let i = 0; i < bldgCount; i++) {
        const a = -Math.PI * 0.45 + (i / bldgCount) * Math.PI * 0.9;
        const dist = 14 + (i % 3) * 3.5;
        const bldgH = 8 + (i % 5) * 3;
        const bldgW = 2.2 + (i % 2) * 1.2;

        const bldg = new THREE.Mesh(
          new THREE.BoxGeometry(bldgW, bldgH, bldgW),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 })
        );
        bldg.position.set(Math.sin(a) * dist, bldgH * 0.5 - 2, -Math.cos(a) * dist);
        this.backdropGroup.add(bldg);

        // Window glow matrix
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(bldgW * 0.92, bldgH * 0.8, 0.05),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00f0ff : 0xff007f })
        );
        win.position.copy(bldg.position);
        win.position.z += bldgW * 0.52;
        this.backdropGroup.add(win);
      }
    } else if (this.currentTheme === 'inferno_core') {
      // Volcanic Smelting Pillars & Lava Cascades
      for (let i = 0; i < 12; i++) {
        const a = -Math.PI * 0.45 + (i / 12) * Math.PI * 0.9;
        const dist = 12 + (i % 3) * 3;
        const pylonH = 10 + (i % 4) * 2;

        const pylon = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.8, pylonH, 6),
          new THREE.MeshStandardMaterial({ color: 0x1c0602, roughness: 0.8, metalness: 0.2 })
        );
        pylon.position.set(Math.sin(a) * dist, pylonH * 0.5 - 2, -Math.cos(a) * dist);
        this.backdropGroup.add(pylon);

        // Molten lava slit
        const lava = new THREE.Mesh(
          new THREE.PlaneGeometry(0.6, pylonH * 0.8),
          new THREE.MeshBasicMaterial({ color: 0xff4500 })
        );
        lava.position.copy(pylon.position);
        lava.position.z += 1.3;
        this.backdropGroup.add(lava);
      }
    } else if (this.currentTheme === 'cryo_void') {
      // Polar Iceberg Spikes & Aurora Arcs
      for (let i = 0; i < 14; i++) {
        const a = -Math.PI * 0.45 + (i / 14) * Math.PI * 0.9;
        const dist = 13 + (i % 3) * 3;
        const spikeH = 9 + (i % 5) * 2.5;

        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(1.4, spikeH, 5),
          new THREE.MeshPhysicalMaterial({
            color: 0xcffafe,
            emissive: 0x00e5ff,
            emissiveIntensity: 0.4,
            roughness: 0.1,
            metalness: 0.2,
            transmission: 0.6,
          })
        );
        spike.position.set(Math.sin(a) * dist, spikeH * 0.5 - 2, -Math.cos(a) * dist);
        this.backdropGroup.add(spike);
      }
    } else {
      // Quantum Horizon Hyper-Ring Pillars
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI * 0.45 + (i / 10) * Math.PI * 0.9;
        const dist = 13 + (i % 2) * 3;
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(3.5, 0.2, 8, 24),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x39ff14 : 0xc026d3 })
        );
        ring.position.set(Math.sin(a) * dist, 4 + (i % 3) * 1.5, -Math.cos(a) * dist);
        ring.rotation.y = a;
        this.backdropGroup.add(ring);
      }
    }
  }

  private setupAtmosphere() {
    if (this.dustParticles) {
      this.scene.remove(this.dustParticles);
      this.dustParticles.geometry.dispose();
      this.dustParticles = null;
    }

    const cfg = THEME_CONFIGS[this.currentTheme];
    const pCount = 180;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = 0.2 + Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      color: cfg.particleColor,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    this.dustParticles = new THREE.Points(geom, mat);
    this.scene.add(this.dustParticles);
  }

  public setupShip(vehicleDef: VehicleDef) {
    if (this.shipGroup) {
      this.turntable.remove(this.shipGroup);
      this.shipGroup.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
        }
      });
      this.shipGroup = null;
    }

    this.shipGroup = buildCyberRacerShip(vehicleDef);
    // Position comfortably floating 0.35m above the turntable
    this.shipGroup.position.set(0, 0.35, 0);
    this.turntable.add(this.shipGroup);
  }

  private bindEvents() {
    const el = this.container;

    const onPointerDown = (e: PointerEvent) => {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      this.autoRotate = false;
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      this.targetRotationY += dx * 0.008;
      this.targetRotationX = Math.max(-0.25, Math.min(0.65, this.targetRotationX + dy * 0.006));
    };

    const onPointerUp = (e: PointerEvent) => {
      this.isDragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.targetDist = Math.max(2.4, Math.min(6.5, this.targetDist + e.deltaY * 0.004));
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });
  }

  private startLoop() {
    let lastTime = performance.now();

    const loop = (now: number) => {
      this.animId = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      this.revTimer += dt;

      // Auto-rotation when not interacting
      if (this.autoRotate) {
        this.targetRotationY += dt * 0.45;
      }

      // Smooth interpolation for orbit angles & distance
      this.currentRotationY = THREE.MathUtils.lerp(this.currentRotationY, this.targetRotationY, dt * 8.0);
      this.currentRotationX = THREE.MathUtils.lerp(this.currentRotationX, this.targetRotationX, dt * 8.0);
      this.currentDist = THREE.MathUtils.lerp(this.currentDist, this.targetDist, dt * 8.0);

      // Camera position on orbital sphere
      const cx = Math.sin(this.currentRotationY) * Math.cos(this.currentRotationX) * this.currentDist;
      const cy = Math.sin(this.currentRotationX) * this.currentDist + 0.35;
      const cz = Math.cos(this.currentRotationY) * Math.cos(this.currentRotationX) * this.currentDist;

      this.camera.position.set(cx, Math.max(0.2, cy), cz);
      this.camera.lookAt(0, 0.3, 0);

      // Gentle anti-gravity ship bobbing & tilting
      if (this.shipGroup) {
        const bob = Math.sin(this.revTimer * 2.2) * 0.035;
        this.shipGroup.position.y = 0.35 + bob;
        this.shipGroup.rotation.z = Math.sin(this.revTimer * 1.5) * 0.02;
      }

      // Holographic alignment rings spinning
      if (this.holoRing1) this.holoRing1.rotation.z += dt * 0.8;
      if (this.holoRing2) this.holoRing2.rotation.z -= dt * 1.2;

      // Pulsate glowing liquid coolant flowing inside cryogenic floor pipes
      if (this.coolantTubes.length > 0) {
        const pulse = 0.55 + Math.sin(this.revTimer * 3.5) * 0.35;
        this.coolantTubes.forEach((tube) => {
          const mat = tube.material as THREE.MeshBasicMaterial;
          if (mat) mat.opacity = pulse;
        });
      }

      // Rising steam mist particles from floor vents
      if (this.steamParticles) {
        const sPos = this.steamParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < sPos.length; i += 3) {
          sPos[i] += dt * 0.6;
          if (sPos[i] > 1.2) sPos[i] = 0.05;
        }
        this.steamParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Slowly float dust particles upward
      if (this.dustParticles) {
        const pos = this.dustParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] += dt * 0.25;
          if (pos[i] > 6.0) pos[i] = 0.2;
        }
        this.dustParticles.geometry.attributes.position.needsUpdate = true;
      }

      this.renderer.render(this.scene, this.camera);
    };

    this.animId = requestAnimationFrame(loop);
  }

  public revEngine() {
    this.targetDist = 3.2;
    setTimeout(() => {
      this.targetDist = 4.2;
    }, 900);
  }

  public resetCamera() {
    this.targetRotationY = 0;
    this.targetRotationX = 0.15;
    this.targetDist = 4.2;
    this.autoRotate = true;
  }

  public dispose() {
    cancelAnimationFrame(this.animId);
    this.renderer.dispose();
    this.scene.clear();
  }
}
