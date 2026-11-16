const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const l5Idx = html.indexOf('LAYER 5:');
console.log(html.slice(l5Idx, l5Idx + 3000));
