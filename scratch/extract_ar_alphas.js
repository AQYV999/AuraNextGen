const fs = require('fs');
const zlib = require('zlib');

const p = 'C:/Users/Administrator/.gemini/antigravity/brain/1967efdb-35e0-4cc7-b516-353d9b37ecb6/.user_uploaded/media_1794672859518_42cbad43.png';
const buf = fs.readFileSync(p);

let pos = 8;
const idatChunks = [];
let width = 0, height = 0;

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.slice(pos + 4, pos + 8).toString('ascii');
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
  } else if (type === 'IDAT') {
    idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

const raw = zlib.inflateSync(Buffer.concat(idatChunks));
const stride = width * 4 + 1;
const pixels = Buffer.alloc(width * height * 4);

for (let y = 0; y < height; y++) {
  const filter = raw[y * stride];
  const srcRow = y * stride + 1;
  const dstRow = y * width * 4;

  for (let x = 0; x < width * 4; x++) {
    const val = raw[srcRow + x];
    const a = x >= 4 ? pixels[dstRow + x - 4] : 0;
    const b = y > 0 ? pixels[(y - 1) * width * 4 + x] : 0;
    const c = (x >= 4 && y > 0) ? pixels[(y - 1) * width * 4 + x - 4] : 0;

    let res = 0;
    if (filter === 0) res = val;
    else if (filter === 1) res = (val + a) & 0xff;
    else if (filter === 2) res = (val + b) & 0xff;
    else if (filter === 3) res = (val + Math.floor((a + b) / 2)) & 0xff;
    else if (filter === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      let pr = c;
      if (pa <= pb && pa <= pc) pr = a;
      else if (pb <= pc) pr = b;
      res = (val + pr) & 0xff;
    }
    pixels[dstRow + x] = res;
  }
}

// Extract Letter A: x=549..607, y=66..171
const aW = 607 - 549 + 1;
const aH = 171 - 66 + 1;
const aAlpha = Buffer.alloc(aW * aH);

for (let y = 0; y < aH; y++) {
  for (let x = 0; x < aW; x++) {
    const srcX = 549 + x;
    const srcY = 66 + y;
    const idx = (srcY * width + srcX) * 4;
    const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
    const bright = (r + g + b) / 3;
    // Background is ~16, foreground is ~175
    let alpha = (bright - 22) / (175 - 22);
    if (alpha < 0) alpha = 0;
    if (alpha > 1) alpha = 1;
    aAlpha[y * aW + x] = Math.round(alpha * 255);
  }
}

// Extract Letter R: x=207..273, y=66..171
const rW = 273 - 207 + 1;
const rH = 171 - 66 + 1;
const rAlpha = Buffer.alloc(rW * rH);

for (let y = 0; y < rH; y++) {
  for (let x = 0; x < rW; x++) {
    const srcX = 207 + x;
    const srcY = 66 + y;
    const idx = (srcY * width + srcX) * 4;
    const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
    const bright = (r + g + b) / 3;
    let alpha = (bright - 22) / (175 - 22);
    if (alpha < 0) alpha = 0;
    if (alpha > 1) alpha = 1;
    rAlpha[y * rW + x] = Math.round(alpha * 255);
  }
}

console.log(`Letter A extracted: ${aW}x${aH}`);
console.log(`Letter R extracted: ${rW}x${rH}`);
