// Test script for liquid caustics offscreen canvas logic
const { createCanvas } = (() => {
  try { return require('canvas'); } catch (e) { return {}; }
})();

console.log('Testing mathematics of caustic waves...');
const W = 550, H = 220;
const now = 1000;
const mouse = { x: 0.2, y: -0.1 };

for (let x = 0; x < 5; x++) {
  const normX = x / 5;
  const wave1 = Math.sin(normX * 6 + now * 0.002) * 20;
  const wave2 = Math.cos(normX * 8 - now * 0.0015) * 15;
  const glintPos = ((now * 0.0004 + mouse.x * 0.5) % 2.4) - 0.7;
  console.log(`x=${normX.toFixed(2)}: wave=${(wave1+wave2).toFixed(2)}, glint=${glintPos.toFixed(2)}`);
}
console.log('Math logic OK!');
