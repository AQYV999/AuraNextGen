const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('LAYER 3:');
console.log(html.slice(idx, idx + 3500));
