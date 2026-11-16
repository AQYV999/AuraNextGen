const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('id="faceSvg"');
console.log(html.slice(idx - 50, idx + 2500));
