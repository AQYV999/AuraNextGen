const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let idx = 0;
while ((idx = html.indexOf('AURA', idx)) !== -1) {
  console.log('AURA at', idx, ':', html.slice(Math.max(0, idx - 40), Math.min(html.length, idx + 80)));
  idx += 4;
}
