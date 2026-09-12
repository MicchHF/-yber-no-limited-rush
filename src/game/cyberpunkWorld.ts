import * as THREE from 'three';
import { cosmicTube } from './tubeCurve';
import { getBiomeForDistance, BIOMES } from './biomes';

export interface CyberProp {
  mesh: THREE.Object3D;
  baseZ: number;
  type: 'arch' | 'building' | 'billboard' | 'volcano' | 'iceberg' | 'quantum';
}

export interface TrafficCar {
  mesh: THREE.Group;
  speed: number;
  z: number;
  angle: number;
  radius: number;
}

/**
 * Cyberpunk 3D Megacity Environment matching IMG_8404.jpeg:
 * - Spacious luminous Cyber Portal Arches framing the highway without blocking the view
 * - Continuous futuristic skyscraper skyline with illuminated window matrices
 * - High-tech floating holographic billboards
 * - Airborne hover traffic streams gliding through the metropolis
 * - Uniform, continuous coverage from Z = -200 to Z = 1600+ with zero pop-in
 */
export class CyberpunkCityEnvironment {
  public group: THREE.Group;
  public overrideBiomeId: string | null = null;
  private props: CyberProp[] = [];
  private trafficCars: TrafficCar[] = [];
  private searchlights: THREE.Mesh[] = [];
  private backdropMesh!: THREE.Mesh;
  private animTime: number = 0;
  private lastGeneratedZ: number = -100;

  // Shared reusable materials & geometries for maximum performance & smoothness
  private frameMat: THREE.MeshStandardMaterial;
  private neonCyanMat: THREE.MeshBasicMaterial;
  private neonPinkMat: THREE.MeshBasicMaterial;
  private neonYellowMat: THREE.MeshBasicMaterial;
  private buildingMat: THREE.MeshStandardMaterial;
  private windowLitMat: THREE.MeshBasicMaterial;
  private billboardMats: THREE.MeshBasicMaterial[] = [];

  // Specialized materials for Magma Rift
  private obsidianMat: THREE.MeshStandardMaterial;
  private lavaGlowMat: THREE.MeshBasicMaterial;
  private lavaYellowMat: THREE.MeshBasicMaterial;
  private firePlumeMat: THREE.MeshBasicMaterial;

  // Specialized materials for Cryo Void
  private iceCrystalMat: THREE.MeshPhysicalMaterial;
  private iceGlowMat: THREE.MeshBasicMaterial;
  private frostWhiteMat: THREE.MeshStandardMaterial;

  // Specialized materials for Quantum Horizon
  private alienObsidianMat: THREE.MeshStandardMaterial;
  private quantumGreenMat: THREE.MeshBasicMaterial;
  private quantumPurpleMat: THREE.MeshBasicMaterial;
  private quantumCoreMat: THREE.MeshBasicMaterial;

  constructor(overrideBiomeId?: string | null) {
    this.group = new THREE.Group();
    this.overrideBiomeId = overrideBiomeId || null;

    this.frameMat = new THREE.MeshStandardMaterial({
      color: 0x0a101f,
      roughness: 0.3,
      metalness: 0.8,
    });

    this.neonCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95,
    });

    this.neonPinkMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      transparent: true,
      opacity: 0.95,
    });

    this.neonYellowMat = new THREE.MeshBasicMaterial({
      color: 0xfcee0a,
      transparent: true,
      opacity: 0.95,
    });

    this.buildingMat = new THREE.MeshStandardMaterial({
      color: 0x070b16,
      roughness: 0.45,
      metalness: 0.75,
    });

    this.windowLitMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });

    // Magma Biome Materials
    this.obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x140806,
      roughness: 0.85,
      metalness: 0.25,
    });
    this.lavaGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff3700,
    });
    this.lavaYellowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
    });
    this.firePlumeMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    // Cryo Biome Materials
    this.iceCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.65,
      thickness: 1.2,
      transparent: true,
      opacity: 0.88,
    });
    this.iceGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
    });
    this.frostWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xdff6ff,
      roughness: 0.35,
      metalness: 0.4,
    });

    // Quantum Biome Materials
    this.alienObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x0a0314,
      roughness: 0.2,
      metalness: 0.95,
    });
    this.quantumGreenMat = new THREE.MeshBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.95,
    });
    this.quantumPurpleMat = new THREE.MeshBasicMaterial({
      color: 0xc026d3,
      transparent: true,
      opacity: 0.95,
    });
    this.quantumCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      blending: THREE.AdditiveBlending,
    });

    // Create textures for holographic billboards
    const titles = ['UNLIMITED // RUSH', 'OVERDRIVE', 'CYBER SPEEDWAY', 'NEO TOKYO', 'NO BRAKES', 'HYPER GRID'];
    const colors = ['#ff007f', '#00f0ff', '#fcee0a', '#a855f7'];

    titles.forEach((title, idx) => {
      const col = colors[idx % colors.length];
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = '#040714';
      ctx.fillRect(0, 0, 512, 256);

      // Neon Frame
      ctx.strokeStyle = col;
      ctx.lineWidth = 12;
      ctx.strokeRect(10, 10, 492, 236);

      // Scanlines
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let y = 14; y < 240; y += 8) {
        ctx.fillRect(10, y, 492, 4);
      }

      // Title Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = col;
      ctx.shadowBlur = 25;
      ctx.fillText(title, 256, 120);

      // Slogan
      ctx.fillStyle = col;
      ctx.font = 'bold 20px monospace';
      ctx.fillText('SPEEDWAY SYSTEM // 2026', 256, 175);

      const tex = new THREE.CanvasTexture(canvas);
      this.billboardMats.push(
        new THREE.MeshBasicMaterial({
          map: tex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92,
        })
      );
    });

    // 1. Build Distant Cyberpunk Megacity Horizon Backdrop
    this.createDistantCityBackdrop();

    // 2. Build Volumetric Skyward Searchlights
    this.createSkywardSearchlights();

    // Initial pre-population across the entire visible world from -100 to 1400
    this.populateInitialSkyline();
  }

  /**
   * Generates a 360-degree Megacity panoramic horizon dome
   * showing hundreds of illuminated skyscrapers, glowing ads, and atmospheric cyber smog
   */
  private createDistantCityBackdrop() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Distinguish atmospheric backdrop palette by active biome
    const isInferno = this.overrideBiomeId === 'inferno_core';
    const isCryo = this.overrideBiomeId === 'cryo_void';
    const isQuantum = this.overrideBiomeId === 'quantum_horizon';
    const isVoid = this.overrideBiomeId === 'void_overlord';

    let skyTop = '#03050d';
    let skyMid = '#070c1d';
    let skyLow = '#120d2b';
    let skyBottom = '#1c0828';
    let moonCol1 = 'rgba(0, 240, 255, 0.15)';
    let moonCol2 = 'rgba(255, 0, 127, 0.25)';
    let moonCore = '#ffffff';
    let moonShadow = '#00f0ff';

    if (isVoid) {
      skyTop = '#0a0218';
      skyMid = '#1d052e';
      skyLow = '#3b0b42';
      skyBottom = '#5e104d';
      moonCol1 = 'rgba(255, 0, 95, 0.65)';
      moonCol2 = 'rgba(168, 85, 247, 0.75)';
      moonCore = '#ff2277';
      moonShadow = '#a855f7';
    } else if (isInferno) {
      skyTop = '#140502';
      skyMid = '#280c05';
      skyLow = '#3d1206';
      skyBottom = '#5e1505';
      moonCol1 = 'rgba(255, 85, 0, 0.25)';
      moonCol2 = 'rgba(255, 170, 0, 0.35)';
      moonCore = '#ffdd66';
      moonShadow = '#ff3700';
    } else if (isCryo) {
      skyTop = '#020b14';
      skyMid = '#041829';
      skyLow = '#082845';
      skyBottom = '#0e3d64';
      moonCol1 = 'rgba(56, 189, 248, 0.25)';
      moonCol2 = 'rgba(125, 211, 252, 0.3)';
      moonCore = '#e0f2fe';
      moonShadow = '#38bdf8';
    } else if (isQuantum) {
      skyTop = '#0a0214';
      skyMid = '#16042b';
      skyLow = '#260747';
      skyBottom = '#3b0a6b';
      moonCol1 = 'rgba(192, 38, 211, 0.25)';
      moonCol2 = 'rgba(57, 255, 20, 0.25)';
      moonCore = '#f0abfc';
      moonShadow = '#c026d3';
    }

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    skyGrad.addColorStop(0.0, skyTop);
    skyGrad.addColorStop(0.5, skyMid);
    skyGrad.addColorStop(0.75, skyLow);
    skyGrad.addColorStop(1.0, skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Giant Celestial Neon Moon / Anomaly
    ctx.save();
    ctx.beginPath();
    ctx.arc(1400, 320, 110, 0, Math.PI * 2);
    ctx.fillStyle = moonCol1;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1400, 320, 90, 0, Math.PI * 2);
    ctx.fillStyle = moonCol2;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1400, 320, 70, 0, Math.PI * 2);
    ctx.fillStyle = moonCore;
    ctx.shadowColor = moonShadow;
    ctx.shadowBlur = 45;
    ctx.fill();
    ctx.restore();

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 400; i++) {
      const sx = Math.random() * 2048;
      const sy = Math.random() * 500;
      const sr = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant Far Layer Skyscrapers (Dark purple silhouettes with lights)
    for (let x = 0; x < 2048; x += 30 + Math.random() * 35) {
      const bWidth = 25 + Math.random() * 40;
      const bHeight = 180 + Math.random() * 260;
      const bY = 1024 - bHeight;

      ctx.fillStyle = '#0a0d24';
      ctx.fillRect(x, bY, bWidth, bHeight);

      // Micro window lights
      ctx.fillStyle = Math.random() > 0.5 ? '#38bdf8' : '#e0e7ff';
      for (let wy = bY + 15; wy < 1000; wy += 14) {
        for (let wx = x + 4; wx < x + bWidth - 4; wx += 8) {
          if (Math.random() > 0.4) {
            ctx.fillRect(wx, wy, 4, 6);
          }
        }
      }
    }

    // Mid-Layer Megacity Towers (Detailed with corporate logos and neon spires)
    const logos = ['ARASAKA', 'KANEDA', 'NIGHT CITY', 'CYBERTECH', 'NEO GRID', 'TETSUO', 'KANG TAO'];
    let logoIdx = 0;

    for (let x = 0; x < 2048; x += 60 + Math.random() * 50) {
      const bWidth = 50 + Math.random() * 70;
      const bHeight = 260 + Math.random() * 340;
      const bY = 1024 - bHeight;

      // Building Body
      ctx.fillStyle = '#060914';
      ctx.fillRect(x, bY, bWidth, bHeight);

      // High-contrast vertical neon edge strips
      const neonCol = logoIdx % 2 === 0 ? '#00f0ff' : '#ff007f';
      ctx.fillStyle = neonCol;
      ctx.fillRect(x, bY, 3, bHeight);
      ctx.fillRect(x + bWidth - 3, bY, 3, bHeight);

      // Windows Matrix
      for (let wy = bY + 25; wy < 1000; wy += 18) {
        for (let wx = x + 8; wx < x + bWidth - 8; wx += 10) {
          if (Math.random() > 0.35) {
            ctx.fillStyle = Math.random() > 0.2 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(252, 238, 10, 0.8)';
            ctx.fillRect(wx, wy, 5, 8);
          }
        }
      }

      // Rooftop Corporate Sign / Billboard
      if (Math.random() > 0.4 && logoIdx < logos.length * 3) {
        const logoName = logos[logoIdx % logos.length];
        logoIdx++;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 4, bY - 30, bWidth - 8, 24);
        ctx.strokeStyle = neonCol;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, bY - 30, bWidth - 8, 24);

        ctx.fillStyle = neonCol;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(logoName, x + bWidth * 0.5, bY - 14);

        // Antenna with red beacon
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + bWidth * 0.5, bY - 30);
        ctx.lineTo(x + bWidth * 0.5, bY - 65);
        ctx.stroke();

        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(x + bWidth * 0.5, bY - 65, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Atmospheric Ground Smog Layer
    const smogGrad = ctx.createLinearGradient(0, 750, 0, 1024);
    smogGrad.addColorStop(0, 'rgba(255, 0, 127, 0)');
    smogGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.18)');
    smogGrad.addColorStop(1, 'rgba(255, 0, 127, 0.35)');
    ctx.fillStyle = smogGrad;
    ctx.fillRect(0, 750, 2048, 274);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(2, 1);

    // Large Panorama Cylinder
    const backdropGeom = new THREE.CylinderGeometry(520, 520, 1200, 32, 1, true);
    backdropGeom.rotateX(Math.PI / 2);

    const backdropMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      fog: false, // Horizon stays visible through the game fog
      depthWrite: false,
    });

    this.backdropMesh = new THREE.Mesh(backdropGeom, backdropMat);
    this.backdropMesh.position.set(0, 40, 400);
    this.group.add(this.backdropMesh);
  }

  /**
   * Builds moving cinematic skyward searchlights sweeping the megalopolis
   */
  private createSkywardSearchlights() {
    const beamGeom = new THREE.ConeGeometry(8, 260, 12, 1, true);
    beamGeom.translate(0, 130, 0);

    const searchlightMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const searchlightPinkMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    for (let i = 0; i < 6; i++) {
      const isPink = i % 2 === 1;
      const beam = new THREE.Mesh(beamGeom, isPink ? searchlightPinkMat : searchlightMat);
      const angle = (i / 6) * Math.PI * 2;
      const dist = 75 + Math.random() * 30;

      beam.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 100 + i * 160);
      beam.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      beam.rotation.z = (Math.random() - 0.5) * 0.4;

      this.group.add(beam);
      this.searchlights.push(beam);
    }
  }

  /**
   * Pre-generates the entire continuous city at startup so there is never any empty space!
   */
  private populateInitialSkyline() {
    this.generateDecorationsUpTo(1400);

    // Initial traffic
    for (let i = 0; i < 35; i++) {
      this.spawnTrafficCar(Math.random() * 1200);
    }
  }

  public setOverrideBiome(biomeId: string | null) {
    this.overrideBiomeId = biomeId;
  }

  /**
   * Extends the city continuously as player progresses
   */
  public generateDecorationsUpTo(targetZ: number) {
    while (this.lastGeneratedZ < targetZ) {
      const startZ = this.lastGeneratedZ;
      const step = 80;
      this.generateCitySegment(startZ, step);
      this.lastGeneratedZ += step;
    }
  }

  private generateCitySegment(startZ: number, length: number) {
    const isCheckpointArch = Math.floor((startZ + length) / 280) > Math.floor(startZ / 280);
    const archZ = startZ + length * 0.5;
    const biome = this.overrideBiomeId
      ? (BIOMES.find(b => b.id === this.overrideBiomeId) || getBiomeForDistance(startZ))
      : getBiomeForDistance(startZ);

    if (biome.id === 'inferno_core') {
      // ==================== INFERNO CORE BIOME ====================
      // 1. Heavy Industrial Smelting Arch
      if (isCheckpointArch) {
        const arch = this.createIndustrialSmeltingArch(archZ);
        this.group.add(arch);
        this.props.push({ mesh: arch, baseZ: archZ, type: 'arch' });
      }

      // 2. Jagged Volcanic Basalt Spires (Surrounding the distant horizon)
      const spireCount = 5;
      for (let i = 0; i < spireCount; i++) {
        const bZ = startZ + (i / spireCount) * length + (Math.random() - 0.5) * 15;
        const angle = Math.random() * Math.PI * 2;
        const distance = 78 + Math.random() * 65;

        const spire = this.createVolcanicBasaltSpire();
        const center = cosmicTube.getCenter(bZ);
        const frame = cosmicTube.getFrame(bZ);

        const pos = center
          .clone()
          .addScaledVector(frame.right, Math.cos(angle) * distance)
          .addScaledVector(frame.up, Math.sin(angle) * distance);

        spire.position.copy(pos);
        spire.lookAt(center);

        this.group.add(spire);
        this.props.push({ mesh: spire, baseZ: bZ, type: 'volcano' });
      }

      // 3. Erupting Magma Geysers (Set back to avoid distraction)
      for (let i = 0; i < 2; i++) {
        const gZ = startZ + (i + 0.5) * (length / 2);
        const angle = (i % 2 === 0 ? 0.4 : -0.4) * Math.PI;
        const dist = 52 + Math.random() * 20;

        const geyser = this.createMagmaGeyser();
        const center = cosmicTube.getCenter(gZ);
        const frame = cosmicTube.getFrame(gZ);

        const pos = center
          .clone()
          .addScaledVector(frame.right, Math.cos(angle) * dist)
          .addScaledVector(frame.up, Math.sin(angle) * dist);

        geyser.position.copy(pos);
        geyser.lookAt(center);

        this.group.add(geyser);
        this.props.push({ mesh: geyser, baseZ: gZ, type: 'volcano' });
      }
    } else if (biome.id === 'cryo_void') {
      // ==================== CRYO VOID BIOME ====================
      // 1. Frozen Stargate Ice Arch
      if (isCheckpointArch) {
        const arch = this.createFrozenIceArch(archZ);
        this.group.add(arch);
        this.props.push({ mesh: arch, baseZ: archZ, type: 'arch' });
      }

      // 2. Colossal Crystalline Glaciers & Icebergs (Set further back on the horizon)
      const iceCount = 4;
      for (let i = 0; i < iceCount; i++) {
        const bZ = startZ + (i / iceCount) * length + (Math.random() - 0.5) * 15;
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 65;

        const glacier = this.createGlacialIceberg();
        const center = cosmicTube.getCenter(bZ);
        const frame = cosmicTube.getFrame(bZ);

        const pos = center
          .clone()
          .addScaledVector(frame.right, Math.cos(angle) * distance)
          .addScaledVector(frame.up, Math.sin(angle) * distance);

        glacier.position.copy(pos);
        glacier.lookAt(center);

        this.group.add(glacier);
        this.props.push({ mesh: glacier, baseZ: bZ, type: 'iceberg' });
      }

      // 3. Sharp Ice Needle Clusters (Pushed outward)
      for (let i = 0; i < 2; i++) {
        const nZ = startZ + (i + 0.5) * (length / 2);
        const angle = (i * 0.7 + 0.3) * Math.PI;
        const dist = 50 + Math.random() * 20;

        const needles = this.createIceNeedleCluster();
        const center = cosmicTube.getCenter(nZ);
        const frame = cosmicTube.getFrame(nZ);

        const pos = center
          .clone()
          .addScaledVector(frame.right, Math.cos(angle) * dist)
          .addScaledVector(frame.up, Math.sin(angle) * dist);

        needles.position.copy(pos);
        needles.lookAt(center);

        this.group.add(needles);
        this.props.push({ mesh: needles, baseZ: nZ, type: 'iceberg' });
      }
    } else if (biome.id === 'quantum_horizon') {
      // ==================== QUANTUM HORIZON BIOME ====================
      // 1. Quantum Hyperspace Portal Ring
      if (isCheckpointArch) {
        const arch = this.createStargatePortalArch(archZ);
        this.group.add(arch);
        this.props.push({ mesh: arch, baseZ: archZ, type: 'arch' });
      }

      // 2. Rotating Translucent Quantum Hypercubes (Pushed outward for clarity)
      const cubeCount = 4;
      for (let i = 0; i < cubeCount; i++) {
        const bZ = startZ + (i / cubeCount) * length + (Math.random() - 0.5) * 12;
        const angle = Math.random() * Math.PI * 2;
        const distance = 75 + Math.random() * 60;

        const cube = this.createQuantumHypercube();
        const center = cosmicTube.getCenter(bZ);
        const frame = cosmicTube.getFrame(bZ);

        const pos = center
          .clone()
          .addScaledVector(frame.right, Math.cos(angle) * distance)
          .addScaledVector(frame.up, Math.sin(angle) * distance);

        cube.position.copy(pos);
        cube.lookAt(center);

        this.group.add(cube);
        this.props.push({ mesh: cube, baseZ: bZ, type: 'quantum' });
      }

      // 3. Alien Runic Obelisks (Set back)
      const obeliskCount = 4;
      for (let i = 0; i < obeliskCount; i++) {
        const oZ = startZ + (i / obeliskCount) * length + (Math.random() - 0.5) * 10;
        const angle = (i * 0.45 + 0.2) * Math.PI * 2;
        const distance = 80 + Math.random() * 60;

        const obelisk = this.createAlienObelisk();
        const center = cosmicTube.getCenter(oZ);
        const frame = cosmicTube.getFrame(oZ);

        const pos = center
          .clone()
          .addScaledVector(frame.right, Math.cos(angle) * distance)
          .addScaledVector(frame.up, Math.sin(angle) * distance);

        obelisk.position.copy(pos);
        obelisk.lookAt(center);

        this.group.add(obelisk);
        this.props.push({ mesh: obelisk, baseZ: oZ, type: 'quantum' });
      }
    } else if (biome.id === 'void_overlord') {
      // ==================== VOID OVERLORD // BOSS ARENA BIOME ====================
      // 1. Ominous Void Monolith Arches
      if (isCheckpointArch) {
        const arch = this.createSpaciousCyberArch(archZ);
        this.group.add(arch);
        this.props.push({ mesh: arch, baseZ: archZ, type: 'arch' });
      }

      // 2. Radiant Luminous Arena Rings encircling the void space
      for (let i = 0; i < 2; i++) {
        const rZ = startZ + (i + 0.5) * (length / 2);
        const ring = this.createVoidArenaRing(rZ);
        this.group.add(ring);
        this.props.push({ mesh: ring, baseZ: rZ, type: 'arch' });
      }

      // 3. Colossal Void Citadels & Dark Matter Pillars framing the arena
      const spireCount = 4;
      for (let i = 0; i < spireCount; i++) {
        const bZ = startZ + (i / spireCount) * length + (Math.random() - 0.5) * 15;
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 55;

        const spire = this.createVolcanicBasaltSpire();
        const center = cosmicTube.getCenter(bZ);
        const frame = cosmicTube.getFrame(bZ);

        const pos = center
          .clone()
          .addScaledVector(frame.right, Math.cos(angle) * distance)
          .addScaledVector(frame.up, Math.sin(angle) * distance);

        spire.position.copy(pos);
        spire.lookAt(center);

        this.group.add(spire);
        this.props.push({ mesh: spire, baseZ: bZ, type: 'volcano' });
      }
    } else {
      // ==================== NEO METROPOLIS BIOME (Default) ====================
      // 1. Sleek Cyber Portal Arch
      if (isCheckpointArch) {
        const arch = this.createSpaciousCyberArch(archZ);
        this.group.add(arch);
        this.props.push({ mesh: arch, baseZ: archZ, type: 'arch' });
      }

      // 2. Megacity Skyscraper Cluster pushed further back onto the horizon
      const buildingCount = 5;
      for (let i = 0; i < buildingCount; i++) {
        const bZ = startZ + (i / buildingCount) * length + (Math.random() - 0.5) * 15;
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 75;

        const building = this.createModernSkyscraper();
        const center = cosmicTube.getCenter(bZ);
        const frame = cosmicTube.getFrame(bZ);

        const pos = center
          .clone()
          .addScaledVector(frame.right, Math.cos(angle) * distance)
          .addScaledVector(frame.up, Math.sin(angle) * distance);

        building.position.copy(pos);
        building.lookAt(center);

        this.group.add(building);
        this.props.push({ mesh: building, baseZ: bZ, type: 'building' });
      }

      // 3. Floating Holographic Cyber Speedway Billboards (Set back)
      for (let i = 0; i < 2; i++) {
        const billZ = startZ + (i + 0.5) * (length / 2);
        const angle = (i % 2 === 0 ? 0.35 : -0.35) * Math.PI;
        const dist = 46 + Math.random() * 16;

        const billboard = this.createHoloBillboard();
        const center = cosmicTube.getCenter(billZ);
        const frame = cosmicTube.getFrame(billZ);

        const pos = center
          .clone()
          .addScaledVector(frame.right, Math.cos(angle) * dist)
          .addScaledVector(frame.up, Math.sin(angle) * dist);

        billboard.position.copy(pos);
        billboard.lookAt(center);

        this.group.add(billboard);
        this.props.push({ mesh: billboard, baseZ: billZ, type: 'billboard' });
      }

      // 4. Distant Ambient Hover Traffic (Reduced density and pushed to high orbit)
      if (this.trafficCars.length < 24) {
        this.spawnTrafficCar(startZ + Math.random() * length);
      }
    }
  }

  /**
   * Builds the Spacious Cyber Portal Arch
   * - Slender glowing electric neon wire contours
   * - ZERO thick solid black rings or obstructing beams!
   * - Crystal clear visibility to the skyline and city backdrop
   */
  private createSpaciousCyberArch(z: number): THREE.Group {
    const archGroup = new THREE.Group();
    const center = cosmicTube.getCenter(z);
    const frame = cosmicTube.getFrame(z);

    archGroup.position.copy(center);
    const rotMat = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.forward);
    archGroup.setRotationFromMatrix(rotMat);

    const innerR = 17.0;
    const outerR = 19.4;

    // Inner glowing electric cyan neon contour rim (slender wire, no black occlusion!)
    const innerRimGeom = new THREE.TorusGeometry(innerR, 0.14, 6, 40);
    const innerRim = new THREE.Mesh(innerRimGeom, this.neonCyanMat);
    archGroup.add(innerRim);

    // Outer hot pink neon contour rim
    const outerRimGeom = new THREE.TorusGeometry(outerR, 0.14, 6, 40);
    const outerRim = new THREE.Mesh(outerRimGeom, this.neonPinkMat);
    archGroup.add(outerRim);

    // Upper Holographic Speedway Header Screen
    const headerGroup = new THREE.Group();
    headerGroup.position.set(0, outerR + 1.2, 0);

    const headerFrame = new THREE.Mesh(new THREE.BoxGeometry(12.0, 1.4, 0.3), this.frameMat);
    const headerPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(11.4, 1.1),
      this.billboardMats[Math.floor(Math.random() * this.billboardMats.length)]
    );
    headerPanel.position.z = 0.2;
    headerGroup.add(headerFrame, headerPanel);

    archGroup.add(headerGroup);
    return archGroup;
  }

  /**
   * Radiant Luminous Arena Rings for Void Overlord Boss Arena
   */
  private createVoidArenaRing(z: number): THREE.Group {
    const ringGroup = new THREE.Group();
    const center = cosmicTube.getCenter(z);
    const frame = cosmicTube.getFrame(z);
    ringGroup.position.copy(center);
    const rotMat = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.forward);
    ringGroup.setRotationFromMatrix(rotMat);

    // Radiant magenta & cyan/purple double ring encircling the tube
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(20.0, 0.35, 8, 36), this.neonPinkMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(23.5, 0.25, 8, 36), this.neonCyanMat);
    ringGroup.add(ring1, ring2);

    // 8 glowing energy beacons orbiting the ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pod = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 8), this.neonPinkMat);
      pod.position.set(Math.cos(a) * 21.8, Math.sin(a) * 21.8, 0);
      ringGroup.add(pod);
    }
    return ringGroup;
  }

  /**
   * Builds Heavy Industrial Smelting Arch for Inferno Core
   */
  private createIndustrialSmeltingArch(z: number): THREE.Group {
    const archGroup = new THREE.Group();
    const center = cosmicTube.getCenter(z);
    const frame = cosmicTube.getFrame(z);

    archGroup.position.copy(center);
    const rotMat = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.forward);
    archGroup.setRotationFromMatrix(rotMat);

    const r = 18.2;
    // Heavy angular dark-iron gantry
    const gantryGeom = new THREE.TorusGeometry(r, 0.5, 5, 12);
    const gantry = new THREE.Mesh(gantryGeom, this.obsidianMat);

    // Molten magma conduits
    const pipeGeom = new THREE.TorusGeometry(r + 0.9, 0.2, 6, 24);
    const magmaPipe = new THREE.Mesh(pipeGeom, this.lavaGlowMat);

    // Top molten reservoir
    const topVat = new THREE.Mesh(new THREE.BoxGeometry(14, 1.8, 1.2), this.obsidianMat);
    topVat.position.y = r + 1.2;
    const vatLava = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 1.3), this.lavaYellowMat);
    vatLava.position.y = r + 1.2;

    archGroup.add(gantry, magmaPipe, topVat, vatLava);
    return archGroup;
  }

  /**
   * Builds Frozen Stargate Ice Arch for Cryo Void
   */
  private createFrozenIceArch(z: number): THREE.Group {
    const archGroup = new THREE.Group();
    const center = cosmicTube.getCenter(z);
    const frame = cosmicTube.getFrame(z);

    archGroup.position.copy(center);
    const rotMat = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.forward);
    archGroup.setRotationFromMatrix(rotMat);

    const r = 18.0;
    // Translucent glacial ice ring
    const iceRingGeom = new THREE.TorusGeometry(r, 0.6, 6, 32);
    const iceRing = new THREE.Mesh(iceRingGeom, this.iceCrystalMat);

    // Glowing cyan frost laser rings
    const laserGeom = new THREE.TorusGeometry(r + 0.7, 0.12, 6, 32);
    const laser = new THREE.Mesh(laserGeom, this.iceGlowMat);

    // Radiating crystalline frost spikes
    for (let i = 0; i < 8; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.5, 4), this.frostWhiteMat);
      const a = (i / 8) * Math.PI * 2;
      spike.position.set(Math.cos(a) * (r + 1.8), Math.sin(a) * (r + 1.8), 0);
      spike.rotation.z = a - Math.PI / 2;
      archGroup.add(spike);
    }

    archGroup.add(iceRing, laser);
    return archGroup;
  }

  /**
   * Builds Quantum Stargate Portal Arch for Quantum Horizon
   */
  private createStargatePortalArch(z: number): THREE.Group {
    const archGroup = new THREE.Group();
    const center = cosmicTube.getCenter(z);
    const frame = cosmicTube.getFrame(z);

    archGroup.position.copy(center);
    const rotMat = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.forward);
    archGroup.setRotationFromMatrix(rotMat);

    const r = 18.4;
    // Alien dark alloy frame
    const ringGeom = new THREE.TorusGeometry(r, 0.7, 6, 36);
    const ring = new THREE.Mesh(ringGeom, this.alienObsidianMat);

    // Glowing hyper-green quantum accelerator ribbon
    const greenGeom = new THREE.TorusGeometry(r - 0.5, 0.15, 6, 36);
    const greenRibbon = new THREE.Mesh(greenGeom, this.quantumGreenMat);

    // Outer magenta dimensional ring
    const purpleGeom = new THREE.TorusGeometry(r + 0.8, 0.15, 6, 36);
    const purpleRibbon = new THREE.Mesh(purpleGeom, this.quantumPurpleMat);

    // 6 Quantum chevron nodes around perimeter
    for (let i = 0; i < 6; i++) {
      const node = new THREE.Mesh(new THREE.OctahedronGeometry(1.0, 0), this.quantumCoreMat);
      const a = (i / 6) * Math.PI * 2;
      node.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
      archGroup.add(node);
    }

    archGroup.add(ring, greenRibbon, purpleRibbon);
    return archGroup;
  }

  /**
   * Volcanic Basalt Spire with Glowing Lava Veins
   */
  private createVolcanicBasaltSpire(): THREE.Group {
    const group = new THREE.Group();
    const height = 90 + Math.random() * 110;
    const baseR = 14 + Math.random() * 8;

    // Basalt obsidian rock column
    const rockGeom = new THREE.CylinderGeometry(2.5, baseR, height, 5);
    const rock = new THREE.Mesh(rockGeom, this.obsidianMat);
    group.add(rock);

    // Glowing vertical lava fissures
    const veinGeom = new THREE.BoxGeometry(1.2, height * 0.85, 1.2);
    const vein1 = new THREE.Mesh(veinGeom, this.lavaGlowMat);
    vein1.position.set(baseR * 0.3, 0, baseR * 0.3);
    const vein2 = new THREE.Mesh(veinGeom, this.lavaYellowMat);
    vein2.position.set(-baseR * 0.3, 0, -baseR * 0.3);

    group.add(vein1, vein2);
    return group;
  }

  /**
   * Volcanic Magma Geyser with Erupting Fire Plume
   */
  private createMagmaGeyser(): THREE.Group {
    const group = new THREE.Group();

    // Caldera crater base
    const craterGeom = new THREE.CylinderGeometry(6.0, 13.0, 16.0, 6);
    const crater = new THREE.Mesh(craterGeom, this.obsidianMat);
    group.add(crater);

    // Glowing magma pool inside crater
    const poolGeom = new THREE.CylinderGeometry(5.8, 5.8, 0.4, 8);
    const pool = new THREE.Mesh(poolGeom, this.lavaYellowMat);
    pool.position.y = 8.1;
    group.add(pool);

    // Erupting plasma fire plume
    const plumeGeom = new THREE.ConeGeometry(5.5, 45.0, 7);
    const plume = new THREE.Mesh(plumeGeom, this.firePlumeMat);
    plume.position.y = 28.0;
    group.add(plume);

    return group;
  }

  /**
   * Colossal Faceted Glacial Iceberg for Cryo Void
   */
  private createGlacialIceberg(): THREE.Group {
    const group = new THREE.Group();
    const radius = 18 + Math.random() * 16;

    // Faceted crystalline iceberg
    const iceGeom = new THREE.DodecahedronGeometry(radius, 0);
    const iceberg = new THREE.Mesh(iceGeom, this.iceCrystalMat);
    group.add(iceberg);

    // Internal cold light glow core
    const core = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.45, 8, 8), this.iceGlowMat);
    group.add(core);

    return group;
  }

  /**
   * Sharp Ice Needle Cluster for Cryo Void
   */
  private createIceNeedleCluster(): THREE.Group {
    const group = new THREE.Group();
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const h = 35 + Math.random() * 40;
      const needleGeom = new THREE.ConeGeometry(1.4, h, 4);
      const needle = new THREE.Mesh(needleGeom, this.frostWhiteMat);
      needle.position.set((Math.random() - 0.5) * 6, h * 0.5, (Math.random() - 0.5) * 6);
      needle.rotation.x = (Math.random() - 0.5) * 0.35;
      needle.rotation.z = (Math.random() - 0.5) * 0.35;

      const tip = new THREE.Mesh(new THREE.ConeGeometry(1.0, 8, 4), this.iceGlowMat);
      tip.position.y = h * 0.5 - 2;
      needle.add(tip);

      group.add(needle);
    }
    return group;
  }

  /**
   * Translucent Rotating Quantum Hypercube for Quantum Horizon
   */
  private createQuantumHypercube(): THREE.Group {
    const group = new THREE.Group();
    const size = 15 + Math.random() * 8;

    // Outer wireframe tesseract cube
    const wireGeom = new THREE.BoxGeometry(size, size, size);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xc026d3, wireframe: true });
    const wireCube = new THREE.Mesh(wireGeom, wireMat);
    group.add(wireCube);

    // Inner floating alien crystal octahedron
    const octGeom = new THREE.OctahedronGeometry(size * 0.5, 0);
    const oct = new THREE.Mesh(octGeom, this.alienObsidianMat);

    // Radioactive neon green core
    const coreGeom = new THREE.SphereGeometry(size * 0.22, 8, 8);
    const core = new THREE.Mesh(coreGeom, this.quantumCoreMat);

    group.add(oct, core);
    return group;
  }

  /**
   * Alien Runic Obelisk for Quantum Horizon
   */
  private createAlienObelisk(): THREE.Group {
    const group = new THREE.Group();
    const h = 85 + Math.random() * 60;

    // Tall obsidian alien monolith
    const obeliskGeom = new THREE.CylinderGeometry(0.8, 8.0, h, 3);
    const obelisk = new THREE.Mesh(obeliskGeom, this.alienObsidianMat);
    group.add(obelisk);

    // Vertical glowing green runic energy channels
    const runeGeom = new THREE.BoxGeometry(0.35, h * 0.85, 0.35);
    const rune = new THREE.Mesh(runeGeom, this.quantumGreenMat);
    rune.position.z = 4.0;
    group.add(rune);

    return group;
  }

  /**
   * Builds sleek modern sci-fi skyscraper monoliths
   */
  private createModernSkyscraper(): THREE.Group {
    const group = new THREE.Group();

    const width = 18 + Math.random() * 16;
    const height = 90 + Math.random() * 140;
    const depth = 18 + Math.random() * 16;

    // Main tower monolith
    const towerGeom = new THREE.BoxGeometry(width, height, depth);
    const tower = new THREE.Mesh(towerGeom, this.buildingMat);
    group.add(tower);

    // Glowing window strips (vertical neon bands)
    const stripGeom = new THREE.BoxGeometry(0.6, height * 0.85, depth + 0.3);
    const strip1 = new THREE.Mesh(stripGeom, this.windowLitMat);
    strip1.position.x = -width * 0.25;

    const strip2 = new THREE.Mesh(stripGeom, this.windowLitMat);
    strip2.position.x = width * 0.25;

    group.add(strip1, strip2);

    // Rooftop Antenna / Communication Spire
    const spireHeight = 25 + Math.random() * 25;
    const spireGeom = new THREE.CylinderGeometry(0.4, 1.2, spireHeight, 6);
    const spire = new THREE.Mesh(spireGeom, this.frameMat);
    spire.position.y = height * 0.5 + spireHeight * 0.5;

    // Spire beacon
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), this.neonPinkMat);
    beacon.position.y = height * 0.5 + spireHeight;

    group.add(spire, beacon);

    return group;
  }

  /**
   * Floating Holographic Billboard
   */
  private createHoloBillboard(): THREE.Group {
    const group = new THREE.Group();

    const w = 14;
    const h = 7;

    const frameGeom = new THREE.BoxGeometry(w + 0.8, h + 0.8, 0.4);
    const frame = new THREE.Mesh(frameGeom, this.frameMat);
    group.add(frame);

    const mat = this.billboardMats[Math.floor(Math.random() * this.billboardMats.length)];
    const screenGeom = new THREE.PlaneGeometry(w, h);
    const screen = new THREE.Mesh(screenGeom, mat);
    screen.position.z = 0.25;
    group.add(screen);

    // Neon edge trim
    const trimGeom = new THREE.BoxGeometry(w + 0.4, 0.15, 0.5);
    const trimTop = new THREE.Mesh(trimGeom, this.neonCyanMat);
    trimTop.position.y = h * 0.5;
    const trimBottom = new THREE.Mesh(trimGeom, this.neonPinkMat);
    trimBottom.position.y = -h * 0.5;
    group.add(trimTop, trimBottom);

    return group;
  }

  private spawnTrafficCar(startZ: number) {
    const drone = new THREE.Group();

    // Sleek hovercar body
    const bodyGeom = new THREE.BoxGeometry(2.4, 0.6, 4.2);
    const body = new THREE.Mesh(bodyGeom, this.frameMat);
    drone.add(body);

    // Cyan Headlights (forward)
    const headGeom = new THREE.BoxGeometry(0.6, 0.2, 0.2);
    const headL = new THREE.Mesh(headGeom, this.neonCyanMat);
    headL.position.set(-0.8, 0, 2.1);
    const headR = new THREE.Mesh(headGeom, this.neonCyanMat);
    headR.position.set(0.8, 0, 2.1);

    // Hot Pink Taillights (rear)
    const tailGeom = new THREE.BoxGeometry(1.8, 0.18, 0.2);
    const tail = new THREE.Mesh(tailGeom, this.neonPinkMat);
    tail.position.set(0, 0, -2.1);

    drone.add(headL, headR, tail);

    this.group.add(drone);

    const speed = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 50);
    const radius = 55 + Math.random() * 45;
    const angle = Math.random() * Math.PI * 2;

    this.trafficCars.push({
      mesh: drone,
      speed,
      z: startZ,
      angle,
      radius,
    });
  }

  /**
   * Updates props, recycles far-behind objects, streams new objects ahead, and animates traffic
   */
  public update(delta: number, bikeZ: number) {
    // Keep environment pre-populated at least 1200 meters ahead
    if (this.lastGeneratedZ < bikeZ + 1200) {
      this.generateDecorationsUpTo(bikeZ + 1400);
    }

    // Follow player with panoramic megacity backdrop cylinder aligned with flight vector
    if (this.backdropMesh) {
      const aheadZ = bikeZ + 380;
      const bCenter = cosmicTube.getCenter(aheadZ);
      const frame = cosmicTube.getFrame(aheadZ);
      this.backdropMesh.position.set(bCenter.x, bCenter.y + 40, bCenter.z);

      // Orthonormal basis matching track curve
      const rotMatrix = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.forward);
      this.backdropMesh.setRotationFromMatrix(rotMatrix);
      this.backdropMesh.rotateX(Math.PI / 2);
    }

    // Animate searchlights sweeping the megalopolis sky
    this.animTime += delta;
    for (let i = 0; i < this.searchlights.length; i++) {
      const sl = this.searchlights[i];
      sl.rotation.z = Math.sin(this.animTime * 0.8 + i * 1.2) * 0.4;
      sl.rotation.x = Math.PI / 2 + Math.cos(this.animTime * 0.6 + i * 1.5) * 0.25;

      // Keep searchlights moving along with active corridor
      if (sl.position.z < bikeZ - 100) {
        sl.position.z += 960;
      }
    }

    // Animate quantum dimensional rotations
    for (let i = 0; i < this.props.length; i++) {
      const p = this.props[i];
      if (p.type === 'quantum') {
        p.mesh.rotation.x += delta * 0.35;
        p.mesh.rotation.y += delta * 0.55;
      }
    }

    // Clean up far behind props (> 200m behind) and dispose GPU memory
    for (let i = this.props.length - 1; i >= 0; i--) {
      const p = this.props[i];
      if (p.baseZ < bikeZ - 200) {
        this.group.remove(p.mesh);
        p.mesh.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => m.dispose?.());
            } else {
              child.material.dispose?.();
            }
          }
        });
        this.props.splice(i, 1);
      }
    }

    // Animate flying hovercar traffic
    for (let i = 0; i < this.trafficCars.length; i++) {
      const c = this.trafficCars[i];
      c.z += c.speed * delta;

      // Wrap traffic smoothly around player's active zone
      if (c.z < bikeZ - 100) {
        c.z = bikeZ + 1000 + Math.random() * 200;
      } else if (c.z > bikeZ + 1200) {
        c.z = bikeZ - 80 - Math.random() * 50;
      }

      const center = cosmicTube.getCenter(c.z);
      const frame = cosmicTube.getFrame(c.z);

      const pos = center
        .clone()
        .addScaledVector(frame.right, Math.cos(c.angle) * c.radius)
        .addScaledVector(frame.up, Math.sin(c.angle) * c.radius);

      c.mesh.position.copy(pos);

      // Orient forward or backward along track
      const dir = frame.forward.clone().multiplyScalar(c.speed >= 0 ? 1 : -1);
      c.mesh.lookAt(pos.clone().add(dir));
    }
  }

  public updateBiomeColors(
    neonPrimary: number,
    neonSecondary: number,
    windowColor: number,
    delta: number
  ) {
    this.neonCyanMat.color.lerp(new THREE.Color(neonPrimary), 2.5 * delta);
    this.neonPinkMat.color.lerp(new THREE.Color(neonSecondary), 2.5 * delta);
    this.windowLitMat.color.lerp(new THREE.Color(windowColor), 2.5 * delta);
  }

  public reset(startZ: number = 0, overrideBiomeId?: string | null) {
    if (overrideBiomeId !== undefined) {
      this.overrideBiomeId = overrideBiomeId;
    }

    // Clear all existing props
    this.props.forEach((p) => this.group.remove(p.mesh));
    this.props = [];

    this.trafficCars.forEach((c) => this.group.remove(c.mesh));
    this.trafficCars = [];

    // Rebuild backdrop if biome was overridden
    if (this.backdropMesh) {
      this.group.remove(this.backdropMesh);
      this.backdropMesh.geometry.dispose();
      (this.backdropMesh.material as THREE.Material).dispose();
      this.createDistantCityBackdrop();
    }

    this.lastGeneratedZ = startZ - 100;
    this.populateInitialSkyline();
  }
}
