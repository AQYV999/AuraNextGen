const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const linkIdx = html.indexOf('fonts.googleapis.com');
console.log(html.slice(linkIdx - 50, linkIdx + 300));

const importIdx = html.indexOf('@import');
console.log(html.slice(importIdx - 50, importIdx + 300));
