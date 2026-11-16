const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('ctx.fillStyle = \'#ffffff\';');
console.log(html.slice(idx, idx + 3500));
