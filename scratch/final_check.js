const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const linkMatch = html.match(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+" rel="stylesheet">/);
console.log('Font link:', linkMatch ? linkMatch[0] : 'NOT FOUND');

const fontStrMatch = html.match(/fontStr\s*=\s*'[^']+'/);
console.log('Layer 5 fontStr:', fontStrMatch ? fontStrMatch[0] : 'NOT FOUND');

const l6FontMatch = html.match(/ctx\.font\s*=\s*'500 11px[^']+'/);
console.log('Layer 6 font:', l6FontMatch ? l6FontMatch[0] : 'NOT FOUND');

const labelMatch = html.match(/displayLabel\s*=\s*'[^']+'/);
console.log('Layer 6 text:', labelMatch ? labelMatch[0] : 'NOT FOUND');
