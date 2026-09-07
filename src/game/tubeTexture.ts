import * as THREE from 'three';

let cachedTubeTexture: THREE.CanvasTexture | null = null;

/**
 * Creates the glowing procedural Cyberpunk Voxel Highway Texture
 * matching the visual aesthetic of IMG_8404.jpeg:
 * - Emissive cyan & lavender longitudinal highway lanes
 * - Voxel grid matrix with digital circuit cells
 * - Glowing transverse highway pulse bands
 * - High-contrast neon edge guide rails
 */
export function getCyberTubeTexture(): THREE.CanvasTexture {
  if (cachedTubeTexture) {
    return cachedTubeTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Midnight Cyberpunk Blue/Carbon Base
  ctx.fillStyle = '#060919';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Subtle Darker Hex / Voxel Tile Grid
  const tileSize = 32;
  ctx.strokeStyle = '#0d1633';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // 3. Glowing Longitudinal Highway Lanes (along Y / forward along tube)
  // Major lane dividers
  const lanes = [64, 192, 320, 448, 576, 704, 832, 960];
  lanes.forEach((x, idx) => {
    // Soft outer glow
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.25)' : 'rgba(129, 140, 248, 0.2)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();

    // Sharp bright core
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.85)' : 'rgba(168, 85, 247, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  });

  // Secondary fine guide lanes
  for (let x = 32; x < 1024; x += 64) {
    if (!lanes.includes(x)) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([16, 16]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // 4. Subtle Speed Guidance Hash Marks (Forward direction)
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
  ctx.lineWidth = 1.5;
  for (let y = 64; y < 1024; y += 128) {
    for (let x = 16; x < 1024; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x, y + 8);
      ctx.stroke();
    }
  }

  // 5. Luminous Transverse Speed Bands from IMG_8404.jpeg (Lavender & Cyan cross-ribs)
  for (let y = 0; y < 1024; y += 256) {
    // Wide lavender glow band
    ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.fillRect(0, y, 1024, 48);

    // Bright cyan core stripe
    ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
    ctx.fillRect(0, y + 18, 1024, 10);

    // Thin crisp white center edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, y + 21, 1024, 4);
  }

  // 6. Digital Cyber Data Micro-Traces (Refined high-tech details)
  ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
  for (let i = 0; i < 40; i++) {
    const rx = Math.floor(Math.random() * 32) * 32;
    const ry = Math.floor(Math.random() * 32) * 32;
    ctx.fillRect(rx + 8, ry + 12, 16, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Repeat nicely along tube circumference and length
  texture.repeat.set(4, 8);
  texture.needsUpdate = true;

  cachedTubeTexture = texture;
  return texture;
}
