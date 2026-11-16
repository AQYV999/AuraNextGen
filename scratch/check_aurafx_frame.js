const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const fxStart = html.indexOf('function frame(now) {');
console.log(html.slice(fxStart, fxStart + 1500));
