const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

// 1. UPDATE CSS TO COMPLETELY HIDE AND DISABLE #auraFx
if (!html.includes('#auraFx { display: none !important; }')) {
  const cssInjection = `
  /* Disable legacy background neural/radar canvas to eliminate stray dots/nodes */
  #auraFx {
    display: none !important;
  }
`;
  html = html.replace('.aura-fx {', cssInjection + '\n.aura-fx {');
}

// 2. DISABLE auraFx JS EXECUTION COMPLETELY
const oldFxStart = 'const canvas = document.getElementById(\'auraFx\');\n  if (!canvas) return;';
const newFxStart = 'const canvas = document.getElementById(\'auraFx\');\n  return; // Disabled: replaced by clean AURA Typography Core';

if (html.includes(oldFxStart)) {
  html = html.replace(oldFxStart, newFxStart);
  console.log('Disabled auraFx JS loop.');
} else {
  console.log('auraFx start pattern not matched or already disabled.');
}

// 3. REFINE PARTICLES IN auraOrbCanvas:
// A: Move orbits outward so particles never intersect typography core (orbitR >= 1.20)
html = html.replace(
  'orbitR: 0.85 + Math.random() * 0.75,',
  'orbitR: 1.22 + Math.random() * 0.55,'
);

// B: Add exclusion zone check in Layer 3 (Back Particles)
const oldLayer3Check = `      if (z <= 0) {
        const x = cx + Math.cos(p.angle) * curR;
        const y = cy + Math.sin(p.angle) * curR * Math.cos(p.tilt) + Math.sin(now * p.floatSpeed + p.phase) * 4;`;

const newLayer3Check = `      if (z <= 0) {
        const x = cx + Math.cos(p.angle) * curR;
        const y = cy + Math.sin(p.angle) * curR * Math.cos(p.tilt) + Math.sin(now * p.floatSpeed + p.phase) * 4;
        // Strict exclusion zone: zero particles over text area
        if (Math.abs(x - cx) < fontSize * 2.3 && Math.abs(y - cy) < fontSize * 1.15) continue;`;

if (html.includes(oldLayer3Check)) {
  html = html.replace(oldLayer3Check, newLayer3Check);
  console.log('Added Layer 3 exclusion zone.');
}

// C: Add exclusion zone check in Layer 7 (Front Particles)
const oldLayer7Check = `      if (z > 0) {
        const x = cx + Math.cos(p.angle) * curR;
        const y = cy + Math.sin(p.angle) * curR * Math.cos(p.tilt) + Math.sin(now * p.floatSpeed + p.phase) * 4;`;

const newLayer7Check = `      if (z > 0) {
        const x = cx + Math.cos(p.angle) * curR;
        const y = cy + Math.sin(p.angle) * curR * Math.cos(p.tilt) + Math.sin(now * p.floatSpeed + p.phase) * 4;
        // Strict exclusion zone: zero particles over text area
        if (Math.abs(x - cx) < fontSize * 2.3 && Math.abs(y - cy) < fontSize * 1.15) continue;`;

if (html.includes(oldLayer7Check)) {
  html = html.replace(oldLayer7Check, newLayer7Check);
  console.log('Added Layer 7 exclusion zone.');
}

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully updated index.html to remove bintik ganggu!');
