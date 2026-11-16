const fs = require('fs');
const zlib = require('zlib');

// Read source PNG
const buf = fs.readFileSync('C:/Users/Administrator/.gemini/antigravity/brain/1967efdb-35e0-4cc7-b516-353d9b37ecb6/.user_uploaded/media_1794672859518_42cbad43.png');

let pos = 8;
const idatChunks = [];
let width = 0, height = 0;

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.slice(pos + 4, pos + 8).toString('ascii');
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
  } else if (type === 'IDAT') idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
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
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      let pr = c;
      if (pa <= pb && pa <= pc) pr = a;
      else if (pb <= pc) pr = b;
      res = (val + pr) & 0xff;
    }
    pixels[dstRow + x] = res;
  }
}

// Function to find horizontal bounds for every row in a glyph
function getRowSpans(x1, x2, y1, y2, threshold = 90) {
  const spans = [];
  for (let y = y1; y <= y2; y++) {
    const rowSegments = [];
    let inSeg = false;
    let sStart = 0;
    for (let x = x1; x <= x2; x++) {
      const idx = (y * width + x) * 4;
      const b = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 3;
      if (b >= threshold) {
        if (!inSeg) { inSeg = true; sStart = x - x1; }
      } else {
        if (inSeg) { inSeg = false; rowSegments.push({ x0: sStart, x1: x - x1 - 1 }); }
      }
    }
    if (inSeg) rowSegments.push({ x0: sStart, x1: x2 - x1 });
    spans.push({ y: y - y1, segs: rowSegments });
  }
  return spans;
}

const spansA = getRowSpans(549, 607, 66, 171);
console.log('Spans for A (first 10 rows):', spansA.slice(0, 10));
console.log('Spans for A (crossbar area rows 65-80):', spansA.slice(65, 80));
console.log('Spans for A (bottom rows 90-105):', spansA.slice(90, 106));
