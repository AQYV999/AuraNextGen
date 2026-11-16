const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

// 1. UPDATE FONT SIZE FORMULA & CORE RADIUS
const oldFontSizeLine = 'const fontSize = Math.min(W * 0.11, Math.max(52, Math.min(H * 0.13, 86)));\n    const coreR = fontSize * 1.6;';
const newFontSizeLine = `// Monumental, commanding Hermes Agent scale (70-80% larger hero wordmark)
    const fontSize = Math.max(62, Math.min(W * 0.16, Math.min(H * 0.20, 156)));
    const coreR = fontSize * 1.42;`;

if (html.includes(oldFontSizeLine)) {
  html = html.replace(oldFontSizeLine, newFontSizeLine);
  console.log('Updated fontSize and coreR formula.');
} else {
  console.error('Could not find old fontSize line!');
  process.exit(1);
}

// 2. UPDATE SUBTEXT FONT SIZE TO 12px FOR CRISP PROPORTION
html = html.replace(
  `ctx.font = '500 11px "Plus Jakarta Sans"`,
  `ctx.font = '500 12px "Plus Jakarta Sans"`
);

// 3. UPDATE PRE-WARMING FOR LARGER SIZES
html = html.replace(
  `document.fonts.load('800 64px "Bodoni Moda"')`,
  `document.fonts.load('800 156px "Bodoni Moda"')`
);

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully enlarged AURA font in index.html!');
