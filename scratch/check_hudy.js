const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let idx = 0;
while ((idx = html.indexOf('hudY', idx)) !== -1) {
  console.log('hudY at', idx, ':', html.slice(Math.max(0, idx - 40), Math.min(html.length, idx + 100)));
  idx += 4;
}
