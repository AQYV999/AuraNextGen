const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

// 1. UPDATE GOOGLE FONTS URL TO ROBUST STANDARD SYNTAX
const oldLink = html.match(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+" rel="stylesheet">/);
const robustUrl = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@600..900&family=Playfair+Display:ital,wght@0,600..900;1,600..900&family=Plus+Jakarta+Sans:wght@400..700&display=swap';

if (oldLink) {
  html = html.replace(oldLink[0], `<link href="${robustUrl}" rel="stylesheet">`);
  console.log('Updated <link> font URL.');
}

const oldImport = html.match(/@import url\('https:\/\/fonts\.googleapis\.com\/css2\?[^']+'\);/);
if (oldImport) {
  html = html.replace(oldImport[0], `@import url('${robustUrl}');`);
  console.log('Updated @import font URL.');
}

// 2. ENSURE WEIGHT IS 900 (MONUMENTAL BLACK DIDONE)
html = html.replace(
  `const fontStr = '800 ' + Math.round(fontSize) + 'px "Bodoni Moda"`,
  `const fontStr = '900 ' + Math.round(fontSize) + 'px "Bodoni Moda"`
);

// 3. TIGHTEN KERNING FOR STATUESQUE EDITORIAL SOLIDITY
html = html.replace(
  `const tracking = fontSize * 0.08;`,
  `const tracking = fontSize * 0.065;`
);

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully refined Hermes AURA typography.');
