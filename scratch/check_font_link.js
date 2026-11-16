const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const linkIdx = html.indexOf('fonts.googleapis.com');
console.log(html.slice(linkIdx - 100, linkIdx + 400));
