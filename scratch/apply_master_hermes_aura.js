const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

// Check where wordmark can be preloaded in auraOrbCanvas IIFE
const orbInitTarget = `  // Dedicated High-Performance Offscreen Buffer for Liquid Specular Caustics
  let textBuffer = null;
  let tCtx = null;
  try {
    textBuffer = document.createElement('canvas');
    tCtx = textBuffer ? textBuffer.getContext('2d', { alpha: true }) : null;
  } catch (e) {
    textBuffer = null;
    tCtx = null;
  }`;

const newOrbInit = `  // Dedicated High-Performance Offscreen Buffer for Liquid Specular Caustics
  let textBuffer = null;
  let tCtx = null;
  try {
    textBuffer = document.createElement('canvas');
    tCtx = textBuffer ? textBuffer.getContext('2d', { alpha: true }) : null;
  } catch (e) {
    textBuffer = null;
    tCtx = null;
  }

  // 100% Authentic Hermes Agent AURA Master Wordmark Asset
  const auraWordmark = new Image();
  auraWordmark.src = 'aura-wordmark.png';
  let wordmarkLoaded = false;
  auraWordmark.onload = () => { wordmarkLoaded = true; };
  if (auraWordmark.complete) wordmarkLoaded = true;`;

if (html.includes(orbInitTarget)) {
  html = html.replace(orbInitTarget, newOrbInit);
  console.log('Added auraWordmark image preloading.');
}

// Update Layer 5 in index.html to render the authentic Hermes Agent wordmark
const l5Start = '// LAYER 5: SOLID HERMES AGENT EDITORIAL WORDMARK WITH LIQUID CAUSTICS';
const l6Start = '// LAYER 6: HERMES-STYLE EDITORIAL SUBTEXT';

const l5Idx = html.indexOf(l5Start);
const l6Idx = html.indexOf(l6Start);

if (l5Idx === -1 || l6Idx === -1) {
  console.error('Could not find Layer 5 or Layer 6!');
  process.exit(1);
}

const sliceStart = html.lastIndexOf('\n', l5Idx - 1);

const masterHermesLayer5 = `
    // ========================================================
    // LAYER 5: 100% AUTHENTIC HERMES AGENT AURA WORDMARK (MASTER IMAGE)
    // Exact stencil cutout notch in 'A', dagger leg in 'R', and Didone 'U'
    // With dynamic liquid specular caustics & gyroscopic light roll
    // ========================================================
    ctx.save();

    // Scale wordmark to monumental hero dimensions
    const drawH = Math.max(76, Math.min(W * 0.16, Math.min(H * 0.20, 156)));
    const imgAspect = 522 / 212; // 2.462 aspect ratio
    const drawW = Math.round(drawH * imgAspect);
    const startX = Math.round(cx - drawW / 2);
    const startY = Math.round(cy - drawH / 2);

    const padX = Math.round(drawH * 0.15);
    const bufW = Math.ceil(drawW + padX * 2);
    const bufH = Math.ceil(drawH * 1.25);

    if (wordmarkLoaded && textBuffer && tCtx) {
      if (textBuffer.width !== Math.round(bufW * DPR) || textBuffer.height !== Math.round(bufH * DPR)) {
        textBuffer.width = Math.round(bufW * DPR);
        textBuffer.height = Math.round(bufH * DPR);
      }

      tCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
      tCtx.clearRect(0, 0, bufW, bufH);

      // --- STEP 5A: DRAW AUTHENTIC MASTER HERMES AURA GLYPHS ---
      tCtx.globalCompositeOperation = 'source-over';
      const imgLocalY = Math.round((bufH - drawH) / 2);
      tCtx.drawImage(auraWordmark, padX, imgLocalY, drawW, drawH);

      // --- STEP 5B: COMPOSITE LIQUID SPECULAR CAUSTICS VIA 'source-atop' ---
      tCtx.globalCompositeOperation = 'source-atop';

      const flowSpeed = isThinking ? 0.0022 : (isSpeaking ? 0.0016 : 0.0009);
      const flowT = now * flowSpeed;
      const waveAmp = (6 + voiceAmp * 12) * (drawH / 150);

      // Specular light sweep across glyphs
      const autoCycle = ((now * 0.00028) % 2.8) - 0.9;
      const sweepProgress = autoCycle + mouse.x * 0.35;
      const sweepCenter = padX + drawW * sweepProgress;
      const beamW = drawH * 0.85;

      const beamGrad = tCtx.createLinearGradient(
        sweepCenter - beamW * 0.6, 0,
        sweepCenter + beamW * 0.6, bufH
      );

      if (isThinking) {
        beamGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
        beamGrad.addColorStop(0.28, 'rgba(192, 132, 252, 0.45)');
        beamGrad.addColorStop(0.50, 'rgba(255, 255, 255, 0.85)');
        beamGrad.addColorStop(0.72, 'rgba(232, 121, 249, 0.45)');
        beamGrad.addColorStop(1, 'rgba(232, 121, 249, 0)');
      } else {
        beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        beamGrad.addColorStop(0.26, 'rgba(56, 189, 248, 0.48)');
        beamGrad.addColorStop(0.50, 'rgba(255, 255, 255, 0.85)');
        beamGrad.addColorStop(0.74, 'rgba(192, 132, 252, 0.42)');
        beamGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
      }

      tCtx.fillStyle = beamGrad;
      tCtx.fillRect(0, 0, bufW, bufH);

      // Liquid mercury fluid wavelets
      tCtx.save();
      tCtx.globalAlpha = 0.30 + Math.sin(now * 0.0018) * 0.10;
      tCtx.beginPath();
      const waveBaseY = bufH * (0.50 + mouse.y * 0.08);
      tCtx.moveTo(0, waveBaseY);
      for (let wx = 0; wx <= bufW; wx += 6) {
        const wy = waveBaseY
          + Math.sin(wx * 0.024 + flowT * 2.2) * waveAmp
          + Math.cos(wx * 0.048 - flowT * 1.6) * (waveAmp * 0.6);
        tCtx.lineTo(wx, wy);
      }
      tCtx.lineTo(bufW, bufH);
      tCtx.lineTo(0, bufH);
      tCtx.closePath();

      const liquidWaveGrad = tCtx.createLinearGradient(0, waveBaseY - waveAmp, 0, bufH);
      liquidWaveGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      liquidWaveGrad.addColorStop(0.4, isThinking ? 'rgba(192, 132, 252, 0.28)' : 'rgba(56, 189, 248, 0.25)');
      liquidWaveGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      tCtx.fillStyle = liquidWaveGrad;
      tCtx.fill();
      tCtx.restore();

      // --- STEP 5C: BLIT TO MAIN CANVAS ---
      ctx.shadowColor = isThinking ? 'rgba(192, 132, 252, 0.24)' : 'rgba(226, 232, 240, 0.20)';
      ctx.shadowBlur = (8 + voiceAmp * 6) * breath;
      ctx.drawImage(textBuffer, startX - padX, startY - imgLocalY, bufW, bufH);
    } else if (wordmarkLoaded) {
      ctx.drawImage(auraWordmark, startX, startY, drawW, drawH);
    } else {
      // Font fallback during initial image decode
      const fontStr = '900 ' + Math.round(drawH * 0.9) + 'px "Bodoni Moda", "Cinzel", Georgia, serif';
      ctx.font = fontStr;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('AURA', cx, cy);
    }
    ctx.restore();

    // ========================================================
    // LAYER 6: HERMES-STYLE EDITORIAL SUBTEXT (Clean, Centered, No Stray Dots)
    // ========================================================
    ctx.save();
    const hudY = cy + drawH * 0.58;
    ctx.font = '600 12px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    let displayLabel = theme.subtext;
    if (isSpeaking) {
      displayLabel = 'PERSONAL AI SYSTEM · SPEAKING';
    }

    ctx.fillStyle = isThinking ? '#c084fc' : (isSpeaking ? '#38bdf8' : '#cbd5e1');
    ctx.globalAlpha = 0.90;
    ctx.fillText(displayLabel, cx, hudY);
    ctx.restore();

    `;

html = html.slice(0, sliceStart) + masterHermesLayer5 + html.slice(l6Idx);
fs.writeFileSync(path, html, 'utf8');
console.log('Successfully updated index.html with 100% Authentic Hermes Wordmark!');
