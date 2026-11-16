const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('LAYER 6:');
console.log(html.slice(idx + 1000, idx + 4000));
