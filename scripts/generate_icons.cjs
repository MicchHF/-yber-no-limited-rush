const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xFF];
  }
  return (c ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

function createCyberIconPNG(width, height, isMaskable = false) {
  const stride = width * 4;
  const rawData = Buffer.alloc((stride + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width / 2;
  const paddingRatio = isMaskable ? 0.70 : 0.85;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = (x - cx) / (maxR * paddingRatio);
      const dy = (y - cy) / (maxR * paddingRatio);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Solid dark cyberpunk background strictly matching #0d0f12
      let r = 13;
      let g = 15;
      let b = 18;
      let a = 255; // Strictly opaque (no alpha transparency for iOS apple-touch-icon compliance)

      // Outer glowing ring
      if (Math.abs(dist - 0.78) < 0.055) {
        const ringGlow = 1.0 - Math.abs(dist - 0.78) / 0.055;
        const angle = Math.atan2(dy, dx);
        if (angle > 0) {
          r = Math.floor(13 * (1 - ringGlow) + 0 * ringGlow);
          g = Math.floor(15 * (1 - ringGlow) + 240 * ringGlow);
          b = Math.floor(18 * (1 - ringGlow) + 255 * ringGlow);
        } else {
          r = Math.floor(13 * (1 - ringGlow) + 255 * ringGlow);
          g = Math.floor(15 * (1 - ringGlow) + 0 * ringGlow);
          b = Math.floor(18 * (1 - ringGlow) + 128 * ringGlow);
        }
      }

      // Delta racing ship
      const inShip = (dy >= -0.48 && dy <= 0.28 && Math.abs(dx) <= (dy + 0.48) * 0.58);
      const inNotch = (dy > 0.16 && dy <= 0.28 && Math.abs(dx) < (dy - 0.16) * 1.6);

      if (inShip && !inNotch) {
        // Ship gradient: Neon cyan at top to vivid pink/orange
        const t = (dy + 0.48) / 0.76;
        r = Math.floor(0 * (1 - t) + 255 * t);
        g = Math.floor(240 * (1 - t) + 30 * t);
        b = Math.floor(255 * (1 - t) + 100 * t);

        // Cockpit glass
        if (Math.abs(dx) < 0.09 && dy > -0.25 && dy < 0.05) {
          r = 255; g = 255; b = 255;
        }
      }

      // Thruster flame
      if (dy > 0.18 && dy < 0.52 && Math.abs(dx) < (0.52 - dy) * 0.42) {
        r = 0; g = 240; b = 255;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // ColorType RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const compressedData = zlib.deflateSync(rawData);

  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createCyberIconPNG(192, 192, false));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createCyberIconPNG(512, 512, false));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createCyberIconPNG(512, 512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createCyberIconPNG(180, 180, false));
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), createCyberIconPNG(64, 64, false));

console.log('Successfully generated all PWA PNG icons!');
