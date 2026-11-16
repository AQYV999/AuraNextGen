const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const anchor = 'if (document.fonts) {';
const startIdx = html.indexOf(anchor, html.indexOf('id="auraOrbCanvas"'));

if (startIdx !== -1) {
  const endIdx = html.indexOf('let W = 0', startIdx);
  const oldBlock = html.slice(startIdx, endIdx);
  console.log('Old block:\n', oldBlock);
  const newBlock = `if (document.fonts) {
    document.fonts.load('400 156px "Instrument Serif"').catch(() => {});
    document.fonts.load('500 12px "Space Grotesk"').catch(() => {});
  }

  `;
  html = html.slice(0, startIdx) + newBlock + html.slice(endIdx);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully cleaned up font preloader block.');
} else {
  console.error('Could not find startIdx!');
}
