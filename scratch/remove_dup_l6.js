const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

const dupStart = html.lastIndexOf('// LAYER 6: HERMES-STYLE EDITORIAL SUBTEXT (Clean, Centered, No Stray Dots)');
const l7Anchor = '// LAYER 7: FRONT PARTICLES (z > 0)';
const l7Idx = html.indexOf(l7Anchor);

if (dupStart !== -1 && l7Idx !== -1 && dupStart < l7Idx) {
  html = html.slice(0, dupStart) + html.slice(l7Idx);
  console.log('Removed duplicate Layer 6 block.');
  fs.writeFileSync(path, html, 'utf8');
} else {
  console.log('No duplicate found or bounds incorrect.');
}
