const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('#faceSvg {');
if (idx !== -1) {
  console.log(html.slice(idx - 100, idx + 500));
}
const idx2 = html.indexOf('#faceSvg');
console.log('all faceSvg CSS rules:');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('#faceSvg') && l.includes('{')) {
    console.log(i + ': ' + l.trim());
  }
});
