const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const fxStart = html.indexOf('const canvas = document.getElementById(\'auraFx\');');
const fxEnd = html.indexOf('</script>', fxStart);
console.log('auraFx script length:', fxEnd - fxStart);
console.log(html.slice(fxStart, fxStart + 1500));
