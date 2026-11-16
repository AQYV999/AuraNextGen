const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let idx = 0;
while ((idx = html.indexOf('textBuffer', idx)) !== -1) {
  console.log('textBuffer at', idx, ':', html.slice(Math.max(0, idx - 40), Math.min(html.length, idx + 80)));
  idx += 10;
}
