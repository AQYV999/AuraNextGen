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

// Find top and bottom bounds of text
let topY = height, bottomY = 0;
for (let y = 0; y < height; y++) {
  let hasRow = false;
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    if (pixels[idx] > 60 || pixels[idx+1] > 60 || pixels[idx+2] > 60) {
      hasRow = true;
      break;
    }
  }
  if (hasRow) {
    if (y < topY) topY = y;
    if (y > bottomY) bottomY = y;
  }
}

console.log('Text vertical bounds: y =', topY, '..', bottomY, '(h =', bottomY - topY + 1, ')');

// Check background color (sample corners)
const c1 = [pixels[0], pixels[1], pixels[2]];
const c2 = [pixels[(width-1)*4], pixels[(width-1)*4+1], pixels[(width-1)*4+2]];
console.log('Background corners:', c1, c2);

// Check text color (sample center of 'A' and 'R')
// Segment 6 'A': x=549..607
let maxA = [0,0,0], maxR = [0,0,0];
for (let y = topY; y <= bottomY; y++) {
  for (let x = 549; x <= 607; x++) {
    const idx = (y * width + x) * 4;
    if (pixels[idx] > maxA[0]) maxA = [pixels[idx], pixels[idx+1], pixels[idx+2]];
  }
  for (let x = 207; x <= 273; x++) {
    const idx = (y * width + x) * 4;
    if (pixels[idx] > maxR[0]) maxR = [pixels[idx], pixels[idx+1], pixels[idx+2]];
  }
}
console.log('Max color in A:', maxA);
console.log('Max color in R:', maxR);
