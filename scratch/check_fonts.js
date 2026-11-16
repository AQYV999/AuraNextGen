const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('Current fonts in index.html:');
const fontLinks = [...html.matchAll(/fonts\.googleapis\.com[^\"]+/gi)].map(m => m[0]);
console.log('Google Fonts:', fontLinks);

const fontFamilies = [...html.matchAll(/font-family:[^;\}]+/gi)].map(m => m[0]);
console.log('Unique font families in CSS:', [...new Set(fontFamilies)].slice(0, 10));
