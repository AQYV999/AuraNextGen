const fs = require('fs');

// Build precision SVG wordmark
const pathA = `M 6,2 L 35,2 L 35,6 L 31,6 L 50,68 L 56,96 L 61,96 L 61,100 L 19,100 L 19,96 L 28,96 L 33,74 L 30,74 L 4,100 L 1,100 L 1,70 L 14,6 L 6,6 Z M 17,16 L 31,68 L 5,68 Z`;

const pathU = `M 0,2 L 38,2 L 38,6 L 29,6 L 29,70 C 29,85 34,94 40,94 C 46,94 52,85 52,70 L 52,6 L 46,6 L 46,2 L 62,2 L 62,6 L 56,6 L 56,70 C 56,89 46,100 32,100 C 19,100 11,89 11,70 L 11,6 L 0,6 Z`;

const pathR = `M 0,2 L 44,2 L 44,6 L 29,6 C 44,6 66,16 66,28 C 66,40 50,48 39,50 L 62,54 L 62,100 L 59,100 L 34,52 L 29,52 L 29,96 L 35,96 L 35,100 L 0,100 L 0,96 L 11,96 L 11,6 L 0,6 Z M 29,14 C 42,14 48,20 48,27 C 48,34 42,39 29,39 Z`;

const svgDoc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 102" width="1120" height="408">
  <rect width="100%" height="100%" fill="#0a0c10"/>
  <defs>
    <linearGradient id="hermesTitanium" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#f1f5f9"/>
      <stop offset="65%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>
  <g fill="url(#hermesTitanium)" fill-rule="evenodd">
    <path d="${pathA}" transform="translate(6, 0)"/>
    <path d="${pathU}" transform="translate(74, 0)"/>
    <path d="${pathR}" transform="translate(142, 0)"/>
    <path d="${pathA}" transform="translate(212, 0)"/>
  </g>
</svg>`;

fs.writeFileSync('scratch/preview_hermes_aura.svg', svgDoc);
console.log('SVG Preview generated: scratch/preview_hermes_aura.svg');
