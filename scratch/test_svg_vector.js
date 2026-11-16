const fs = require('fs');

// Build precision SVG wordmark
function buildHermesAuraSVG() {
  // Glyph A (width = 62)
  // Outer contour + inner triangle
  const pathA = `
    M 6,2
    L 35,2
    L 35,6
    L 31,6
    L 50,68
    L 56,96
    L 61,96
    L 61,100
    L 19,100
    L 19,96
    L 28,96
    L 33,72
    L 1,72
    L 1,100
    L 4,100
    L 31,74
    L 33,74
    L 31,68
    L 14,6
    L 6,6
    Z
    M 16,18
    L 31,68
    L 6,68
    Z
  `.replace(/\s+/g, ' ').trim();

  // Glyph U (width = 62)
  const pathU = `
    M 0,2
    L 38,2
    L 38,6
    L 29,6
    L 29,70
    C 29,84 34,93 40,93
    C 46,93 52,84 52,70
    L 52,6
    L 46,6
    L 46,2
    L 62,2
    L 62,6
    L 56,6
    L 56,70
    C 56,88 46,101 32,101
    C 20,101 11,88 11,70
    L 11,6
    L 0,6
    Z
  `.replace(/\s+/g, ' ').trim();

  // Glyph R (width = 66)
  const pathR = `
    M 0,2
    L 44,2
    L 44,6
    L 29,6
    C 44,6 66,16 66,28
    C 66,40 50,48 39,50
    L 62,56
    L 62,100
    L 59,100
    L 34,52
    L 29,52
    L 29,96
    L 35,96
    L 35,100
    L 0,100
    L 0,96
    L 11,96
    L 11,6
    L 0,6
    Z
    M 29,14
    C 42,14 48,20 48,27
    C 48,34 42,39 29,39
    Z
  `.replace(/\s+/g, ' ').trim();

  // Layout:
  // A at x=0
  // U at x=66 (spacing 4)
  // R at x=132 (spacing 4)
  // A at x=202 (spacing 4)
  // Total width = 202 + 62 = 264
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264 102" fill="none">
  <defs>
    <linearGradient id="hermesTitanium" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#f1f5f9"/>
      <stop offset="65%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>
  <g fill="url(#hermesTitanium)" fill-rule="evenodd">
    <!-- A 1 -->
    <path d="${pathA}" transform="translate(0, 0)"/>
    <!-- U -->
    <path d="${pathU}" transform="translate(66, 0)"/>
    <!-- R -->
    <path d="${pathR}" transform="translate(132, 0)"/>
    <!-- A 2 -->
    <path d="${pathA}" transform="translate(202, 0)"/>
  </g>
</svg>`;

  return svg;
}

const svgContent = buildHermesAuraSVG();
fs.writeFileSync('scratch/hermes_aura_vector.svg', svgContent);
console.log('Generated scratch/hermes_aura_vector.svg! Size:', svgContent.length);
