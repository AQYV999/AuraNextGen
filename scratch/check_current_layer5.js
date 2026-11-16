const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const l5Idx = html.indexOf('// LAYER 5: HERMES AGENT EDITORIAL DISPLAY SERIF "AURA" WORDMARK');
console.log(html.slice(l5Idx - 50, l5Idx + 2500));
