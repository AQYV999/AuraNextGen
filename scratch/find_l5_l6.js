const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('LAYER 5:');
console.log('Layer 5 found at', idx);
if (idx !== -1) {
  console.log(html.slice(idx - 40, idx + 200));
}

const idx6 = html.indexOf('LAYER 6:');
console.log('Layer 6 found at', idx6);
if (idx6 !== -1) {
  console.log(html.slice(idx6 - 40, idx6 + 200));
}
