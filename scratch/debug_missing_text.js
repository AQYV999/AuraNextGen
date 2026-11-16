const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const l5Idx = html.indexOf('LAYER 5: LIQUID SPECULAR CAUSTICS');
console.log(html.slice(l5Idx, l5Idx + 4500));
