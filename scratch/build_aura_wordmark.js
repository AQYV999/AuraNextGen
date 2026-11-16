const fs = require('fs');
const zlib = require('zlib');

// 1. Read source Hermes Agent PNG
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

// Top and bottom bounds of glyphs: y=66..171 (h=106)
const topY = 66;
const hGlyph = 106;

// Function to extract 2D alpha grid for a subrectangle
function extractAlpha(x1, x2) {
  const w = x2 - x1 + 1;
  const grid = [];
  for (let y = 0; y < hGlyph; y++) {
    const row = new Float32Array(w);
    for (let x = 0; x < w; x++) {
      const idx = ((topY + y) * width + (x1 + x)) * 4;
      const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
      const bright = (r + g + b) / 3;
      let alpha = (bright - 22) / (175 - 22);
      if (alpha < 0) alpha = 0;
      if (alpha > 1) alpha = 1;
      row[x] = alpha;
    }
    grid.push(row);
  }
  return { w, h: hGlyph, grid };
}

const glyphA = extractAlpha(549, 607); // 'A' (w=59)
const glyphR = extractAlpha(207, 273); // 'R' (w=67)
const glyphH = extractAlpha(41, 128);  // 'H' (w=88)
const glyphN = extractAlpha(754, 827); // 'N' (w=74)

console.log('Extracted glyphs A, R, H, N');

// Construct glyph 'U':
// Width = 64. Left stem from H (x=0..32), right stem from N (x=50..73 shifted), bottom bowl
const uW = 64;
const glyphU = { w: uW, h: hGlyph, grid: [] };

for (let y = 0; y < hGlyph; y++) {
  const row = new Float32Array(uW);
  for (let x = 0; x < uW; x++) {
    if (y < 75) {
      // Top 70% of 'U' is straight vertical legs
      // Left leg from left of 'H' (first 28px of H)
      if (x < 28) {
        row[x] = glyphH.grid[y][x];
      }
      // Right leg from right of 'N' (last 20px of N)
      else if (x >= uW - 20) {
        const nX = glyphN.w - (uW - x);
        if (nX >= 0 && nX < glyphN.w) {
          row[x] = glyphN.grid[y][nX];
        }
      }
    } else {
      // Bottom bowl of 'U': smooth Didone curve
      // Outer ellipse from x=7..58, y=70..105
      // Inner ellipse from x=27..54, y=70..101
      const ny = (y - 70) / (105 - 70); // 0..1
      const cxL = 20, cxR = 56;
      const innerW = 24;

      // Distance to bottom curve
      const angle = Math.asin(Math.max(-1, Math.min(1, (y - 70) / 35)));
      const cosA = Math.cos(angle);

      // Left thick curve tapering to right thin curve
      const leftOuter = 7 + (1 - cosA) * 13;
      const leftInner = 27 + (1 - cosA) * 3;
      const rightInner = 54 - (1 - cosA) * 3;
      const rightOuter = 58 - (1 - cosA) * 4;

      if (x >= leftOuter && x <= rightOuter) {
        if (x >= leftInner && x <= rightInner && y < 101) {
          // Inside hole
          row[x] = 0;
        } else {
          // On the curve: interpolate thickness brightness
          const t = (x - leftOuter) / (rightOuter - leftOuter);
          row[x] = Math.max(0.2, 1.0 - t * 0.2);
        }
      }
    }
  }
  glyphU.grid.push(row);
}

// Assemble A - U - R - A with tight kerning
const kerning = 4;
const totalOutW = glyphA.w + kerning + glyphU.w + kerning + glyphR.w + kerning + glyphA.w;
console.log(`Total assembled width: ${totalOutW}px, height: ${hGlyph}px`);

// Create RGBA image buffer (with 2x super-sampling for retina sharpness: 2 * totalOutW x 2 * hGlyph)
const scale = 2;
const finalW = totalOutW * scale;
const finalH = hGlyph * scale;
const finalRgba = Buffer.alloc(finalW * finalH * 4);

const glyphs = [
  { g: glyphA, x: 0 },
  { g: glyphU, x: glyphA.w + kerning },
  { g: glyphR, x: glyphA.w + kerning + glyphU.w + kerning },
  { g: glyphA, x: glyphA.w + kerning + glyphU.w + kerning + glyphR.w + kerning }
];

for (let y = 0; y < finalH; y++) {
  const srcY = y / scale;
  const y0 = Math.floor(srcY);
  const y1 = Math.min(hGlyph - 1, y0 + 1);
  const fy = srcY - y0;

  for (let x = 0; x < finalW; x++) {
    const srcX = x / scale;

    let maxAlpha = 0;
    for (const item of glyphs) {
      const gx = srcX - item.x;
      if (gx >= 0 && gx < item.g.w - 1) {
        const x0 = Math.floor(gx);
        const x1 = Math.min(item.g.w - 1, x0 + 1);
        const fx = gx - x0;

        // Bilinear interpolation of alpha
        const a00 = item.g.grid[y0][x0];
        const a10 = item.g.grid[y0][x1];
        const a01 = item.g.grid[y1][x0];
        const a11 = item.g.grid[y1][x1];

        const aTop = a00 * (1 - fx) + a10 * fx;
        const aBot = a01 * (1 - fx) + a11 * fx;
        const a = aTop * (1 - fy) + aBot * fy;

        if (a > maxAlpha) maxAlpha = a;
      }
    }

    if (maxAlpha > 0.02) {
      // Color: Pure titanium-silver gradient
      // Top (y=0): #ffffff, middle: #dbe4ee, bottom (y=finalH): #94a3b8
      const vProgress = y / finalH;
      const r = Math.round(255 * (1 - vProgress * 0.35));
      const g = Math.round(255 * (1 - vProgress * 0.30));
      const b = Math.round(255 * (1 - vProgress * 0.22));

      const dstIdx = (y * finalW + x) * 4;
      finalRgba[dstIdx] = r;
      finalRgba[dstIdx+1] = g;
      finalRgba[dstIdx+2] = b;
      finalRgba[dstIdx+3] = Math.round(Math.min(1, maxAlpha * 1.05) * 255);
    }
  }
}

// Encode to PNG using our zero-dependency PNG encoder
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c;
}
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function makeChunk(t, d) {
  const tb = Buffer.from(t, 'ascii');
  const lb = Buffer.alloc(4);
  lb.writeUInt32BE(d.length, 0);
  const p = Buffer.concat([tb, d]);
  const cb = Buffer.alloc(4);
  cb.writeUInt32BE(crc32(p), 0);
  return Buffer.concat([lb, p, cb]);
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(finalW, 0);
ihdr.writeUInt32BE(finalH, 4);
ihdr[8] = 8; ihdr[9] = 6;
const ihdrChunk = makeChunk('IHDR', ihdr);

const strideF = finalW * 4;
const scanlines = Buffer.alloc((strideF + 1) * finalH);
for (let y = 0; y < finalH; y++) {
  scanlines[y * (strideF + 1)] = 0;
  finalRgba.copy(scanlines, y * (strideF + 1) + 1, y * strideF, (y + 1) * strideF);
}
const idatChunk = makeChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 }));
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const finalPng = Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
const outPath = 'C:\\Users\\Administrator\\AuraNextGen\\aura-wordmark.png';
fs.writeFileSync(outPath, finalPng);
console.log(`Successfully generated ${outPath}! Size: ${finalPng.length} bytes, Resolution: ${finalW}x${finalH}`);
