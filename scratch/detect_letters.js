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

// Unfilter PNG scanlines
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
      // Paeth
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

// Find column opacity (detect letter boundaries)
const colBrightness = [];
for (let x = 0; x < width; x++) {
  let sum = 0;
  for (let y = 0; y < height; y++) {
    const idx = (y * width + x) * 4;
    const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
    // Background is near black (< 30)
    if (r > 60 || g > 60 || b > 60) sum += (r + g + b) / 3;
  }
  colBrightness.push(sum);
}

// Group into segments
const segments = [];
let inChar = false;
let segStart = 0;

for (let x = 0; x < width; x++) {
  if (colBrightness[x] > 500) {
    if (!inChar) {
      inChar = true;
      segStart = x;
    }
  } else {
    if (inChar) {
      inChar = false;
      segments.push({ start: segStart, end: x - 1, width: x - segStart });
    }
  }
}
if (inChar) segments.push({ start: segStart, end: width - 1, width: width - segStart });

console.log('Detected letter segments count:', segments.length);
segments.forEach((s, i) => console.log(`Segment ${i}: x=${s.start}..${s.end} (w=${s.width})`));
