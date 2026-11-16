const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const l5Idx = html.indexOf('ctx.drawImage(textBuffer');
console.log(html.slice(l5Idx - 200, l5Idx + 800));
