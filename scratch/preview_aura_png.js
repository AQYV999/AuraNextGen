const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:\\Users\\Administrator\\AuraNextGen\\aura-wordmark.png');

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

for (let y = 0; y < height; y += 6) {
  let line = '';
  for (let x = 0; x < width; x += 3) {
    const idx = y * stride + 1 + x * 4;
    const a = raw[idx + 3];
    if (a > 180) line += '#';
    else if (a > 60) line += '.';
    else line += ' ';
  }
  console.log(line);
}
