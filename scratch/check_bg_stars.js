const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('.bg-stars');
console.log(html.slice(idx - 50, idx + 400));
