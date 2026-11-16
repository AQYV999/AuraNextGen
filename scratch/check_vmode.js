const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const fxIdx = html.indexOf('id="auraFx"');
console.log('auraFx surrounding context:');
console.log(html.slice(fxIdx - 300, fxIdx + 300));

// Check if auraFx is hidden in orb mode or if it runs all the time
const vmodes = [...html.matchAll(/data-vmode/gi)];
console.log('data-vmode count:', vmodes.length);
vmodes.forEach((v, i) => {
  const p = v.index;
  console.log('vmode ' + i + ':', html.slice(Math.max(0, p - 40), Math.min(html.length, p + 100)));
});
