const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('LAYER 4: CRISP REFINED "AURA" WORDMARK');
console.log(html.slice(start, start + 3000));
