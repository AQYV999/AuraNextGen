const fs = require('fs');
const zlib = require('zlib');

const p = 'C:/Users/Administrator/.gemini/antigravity/brain/1967efdb-35e0-4cc7-b516-353d9b37ecb6/.user_uploaded/media_1794672859518_42cbad43.png';
const buf = fs.readFileSync(p);

// Read chunks
let pos = 8;
const idatChunks = [];
let width = 0, height = 0, colorType = 0, bitDepth = 0;

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.slice(pos + 4, pos + 8).toString('ascii');
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
    bitDepth = buf[pos + 16];
    colorType = buf[pos + 17];
  } else if (type === 'IDAT') {
    idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

console.log({ width, height, bitDepth, colorType, chunks: idatChunks.length });

const raw = zlib.inflateSync(Buffer.concat(idatChunks));
console.log('Uncompressed scanline bytes:', raw.length);
