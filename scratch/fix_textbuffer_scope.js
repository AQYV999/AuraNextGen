const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

// 1. Remove misplaced textBuffer from auraFx (if present)
const misplacedSnippet = `  // Dedicated High-Performance Offscreen Buffer for Liquid Specular Caustics
  const textBuffer = document.createElement('canvas');
  const tCtx = textBuffer.getContext('2d', { alpha: true });\n\n`;

if (html.includes(misplacedSnippet)) {
  html = html.replace(misplacedSnippet, '');
  console.log('Removed misplaced textBuffer from auraFx.');
}

// 2. Put textBuffer into auraOrbCanvas IIFE scope
const orbTarget = `const canvas = document.getElementById('auraOrbCanvas');
  const faceProxy = document.getElementById('faceSvg');
  const inpTanya = document.getElementById('inpTanya');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;`;

const newOrbTarget = `const canvas = document.getElementById('auraOrbCanvas');
  const faceProxy = document.getElementById('faceSvg');
  const inpTanya = document.getElementById('inpTanya');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Dedicated High-Performance Offscreen Buffer for Liquid Specular Caustics
  let textBuffer = null;
  let tCtx = null;
  try {
    textBuffer = document.createElement('canvas');
    tCtx = textBuffer ? textBuffer.getContext('2d', { alpha: true }) : null;
  } catch (e) {
    textBuffer = null;
    tCtx = null;
  }`;

if (html.includes(orbTarget)) {
  html = html.replace(orbTarget, newOrbTarget);
  console.log('Successfully injected textBuffer into auraOrbCanvas scope!');
} else {
  console.error('Could not find orbTarget!');
  process.exit(1);
}

// 3. Add safety fallback in Layer 5 if textBuffer or tCtx is ever null
const safeBufferCheck = `    // Prepare Offscreen Buffer (sized exactly to text + padding)
    const padX = Math.round(fontSize * 0.35);
    const bufW = Math.ceil(totalWidth + padX * 2);
    const bufH = Math.ceil(fontSize * 1.55);

    if (!textBuffer || !tCtx) {
      // Direct Canvas Fallback if offscreen canvas unavailable
      ctx.save();
      ctx.font = fontStr;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f8fafc';
      let fCurX = startX;
      for (let i = 0; i < letters.length; i++) {
        ctx.fillText(letters[i], fCurX, cy);
        fCurX += letterWidths[i] + tracking;
      }
      ctx.restore();
    } else {
      if (textBuffer.width !== Math.round(bufW * DPR) || textBuffer.height !== Math.round(bufH * DPR)) {
        textBuffer.width = Math.round(bufW * DPR);
        textBuffer.height = Math.round(bufH * DPR);
      }

      tCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
      tCtx.clearRect(0, 0, bufW, bufH);`;

html = html.replace(
  `    // Prepare Offscreen Buffer (sized exactly to text + padding)
    const padX = Math.round(fontSize * 0.35);
    const bufW = Math.ceil(totalWidth + padX * 2);
    const bufH = Math.ceil(fontSize * 1.55);

    if (textBuffer.width !== Math.round(bufW * DPR) || textBuffer.height !== Math.round(bufH * DPR)) {
      textBuffer.width = Math.round(bufW * DPR);
      textBuffer.height = Math.round(bufH * DPR);
    }

    tCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    tCtx.clearRect(0, 0, bufW, bufH);`,
  safeBufferCheck
);

// Close the else block at the end of Step 5D
html = html.replace(
  `    ctx.drawImage(textBuffer, startX - padX, cy - bufH / 2, bufW, bufH);
    ctx.restore();`,
  `    ctx.drawImage(textBuffer, startX - padX, cy - bufH / 2, bufW, bufH);
    }
    ctx.restore();`
);

fs.writeFileSync(path, html, 'utf8');
console.log('Saved index.html with scoped textBuffer & fallback protection.');
