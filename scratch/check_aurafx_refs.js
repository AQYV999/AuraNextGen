const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let idx = 0;
while ((idx = html.indexOf('auraFx', idx)) !== -1) {
  console.log('auraFx at', idx, ':', html.slice(Math.max(0, idx - 30), Math.min(html.length, idx + 80)));
  idx += 6;
}
