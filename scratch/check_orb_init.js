const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const orbIdx = html.indexOf('const canvas = document.getElementById(\'auraOrbCanvas\');');
console.log('auraOrbCanvas at', orbIdx);
console.log(html.slice(orbIdx, orbIdx + 400));
