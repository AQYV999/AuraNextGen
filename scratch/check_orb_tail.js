const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const orbStart = html.indexOf('const canvas = document.getElementById(\'auraOrbCanvas\');');
const orbEnd = html.indexOf('</script>', orbStart);
const code = html.slice(orbStart, orbEnd);

console.log('Last 20 lines of code:');
console.log(code.split('\n').slice(-20).join('\n'));
