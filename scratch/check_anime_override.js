const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('ult visual mode: anime');
console.log(html.slice(idx - 100, idx + 800));
