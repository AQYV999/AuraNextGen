const fs = require('fs');

const p = 'C:/Users/Administrator/.gemini/antigravity/brain/1967efdb-35e0-4cc7-b516-353d9b37ecb6/.system_generated/steps/1346/output.txt';
const txt = fs.readFileSync(p, 'utf8');

const oldBlockHeader = 'Old block:\n';
const oldBlockIdx = txt.indexOf(oldBlockHeader);
const endAnchor = '\nSuccessfully cleaned up font preloader block.';
const endIdx = txt.indexOf(endAnchor);

if (oldBlockIdx === -1 || endIdx === -1) {
  console.error('Could not find bounds in output.txt!');
  process.exit(1);
}

let fullOldBlock = txt.slice(oldBlockIdx + oldBlockHeader.length, endIdx);
console.log('fullOldBlock length:', fullOldBlock.length);

// In fullOldBlock, fix the badEnd snippet at the very end
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

if (fullOldBlock.includes(badEnd)) {
  fullOldBlock = fullOldBlock.replace(badEnd, goodEnd);
  console.log('Replaced badEnd in fullOldBlock successfully!');
} else {
  console.error('badEnd not found in fullOldBlock!');
  process.exit(1);
}

// Now, restore index.html
let html = fs.readFileSync('index.html', 'utf8');

// Find the corrupted region in index.html:
// Starts with `if (document.fonts) {\n    document.fonts.load('800 156px "Bodoni Moda"')`
const corrStartAnchor = 'if (document.fonts) {\n    document.fonts.load(\'800 156px "Bodoni Moda"\')';
const corrStartIdx = html.indexOf(corrStartAnchor);

// Ends right before `let W = 0, H = 0, DPR = 1;` in auraOrbCanvas
const corrEndAnchor = 'let W = 0, H = 0, DPR = 1;\n  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };';
const corrEndIdx = html.indexOf(corrEndAnchor, corrStartIdx);

if (corrStartIdx === -1 || corrEndIdx === -1) {
  console.error('Could not find corrupted bounds in index.html! start=' + corrStartIdx + ', end=' + corrEndIdx);
  process.exit(1);
}

html = html.slice(0, corrStartIdx) + fullOldBlock + html.slice(corrEndIdx);

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html successfully restored with 100% untruncated content!');
