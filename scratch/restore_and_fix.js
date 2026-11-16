const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let oldBlock = fs.readFileSync('scratch/recovered_old_block.txt', 'utf8');

// In oldBlock, fix the typo at the end:
const badEnd = `  // Pre-load web fonts into canvas memory
  if (document.fonts) {
    document.fonts.load('400 156px "Instrument Serif"').catch(() => {});
    document.fonts.load('500 12px "Space Grotesk"').catch(() => {});
  });
    document.fonts.load('800 156px "Cinzel"').catch(() => {});
  }`;

const goodEnd = `  // Pre-load web fonts into canvas memory
  if (document.fonts) {
    document.fonts.load('400 156px "Instrument Serif"').catch(() => {});
    document.fonts.load('500 12px "Space Grotesk"').catch(() => {});
  }`;

if (oldBlock.includes(badEnd)) {
  oldBlock = oldBlock.replace(badEnd, goodEnd);
  console.log('Fixed typo at the end of recovered old block.');
} else {
  console.error('Could not find badEnd in oldBlock!');
  process.exit(1);
}

// In index.html, find where the faulty replacement was made
const badReplacementAnchor = `if (document.fonts) {
    document.fonts.load('400 156px "Instrument Serif"').catch(() => {});
    document.fonts.load('500 12px "Space Grotesk"').catch(() => {});
  }

  let W = 0, H = 0, DPR = 1;`;

const targetIdx = html.indexOf(badReplacementAnchor);
if (targetIdx === -1) {
  console.error('Could not find badReplacementAnchor in index.html!');
  process.exit(1);
}

const before = html.slice(0, targetIdx);
const after = html.slice(targetIdx + badReplacementAnchor.length);

// Reconstruct
html = before + oldBlock + 'let W = 0, H = 0, DPR = 1;' + after;
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully restored index.html!');
