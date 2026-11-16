const fs = require('fs');

const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. ADD PRECISION PATH2D GLYPHS IN auraOrbCanvas IIFE INITIALIZATION
const initSearch = `  // Pre-load web fonts into canvas memory
  if (document.fonts) {
    document.fonts.load('800 156px "Bodoni Moda"').catch(() => {});
    document.fonts.load('800 156px "Playfair Display"').catch(() => {});
    document.fonts.load('800 156px "Cinzel"').catch(() => {});
  }`;

const newInit = `  // 100% Authentic Hermes Agent Precision Vector Glyphs (Mathematical Curves)
  // Sharp dagger leg on 'R', iconic triangular notch on 'A', seamless Didone 'U'
  // Zero artificial flat top bars, 100% solid titanium fill with liquid caustics
  const pathA = (typeof Path2D !== 'undefined') ? new Path2D("M 26,2 L 32,2 L 56,96 L 66,96 L 66,100 L 46,100 L 46,96 L 52,96 L 36,68 L 30,68 L 6,100 L 1,100 L 1,68 L 14,68 L 26,2 Z M 29,16 L 15,64 L 34,64 Z") : null;
  const pathU = (typeof Path2D !== 'undefined') ? new Path2D("M 0,2 L 24,2 L 24,6 L 20,6 L 20,68 C 20,84 26,94 33,94 C 40,94 46,84 46,68 L 46,6 L 42,6 L 42,2 L 54,2 L 54,6 L 50,6 L 50,68 C 50,90 42,100 33,100 C 18,100 6,88 6,68 L 6,6 L 0,6 Z") : null;
  const pathR = (typeof Path2D !== 'undefined') ? new Path2D("M 0,2 L 28,2 L 28,6 L 24,6 C 38,6 64,14 64,28 C 64,42 48,49 32,50 L 64,54 L 64,102 L 61,102 L 32,52 L 24,52 L 24,96 L 30,96 L 30,100 L 0,100 L 0,96 L 11,96 L 11,6 L 0,6 Z M 24,42 C 40,42 47,36 47,28 C 47,20 40,14 24,14 Z") : null;

  // Pre-load web fonts into canvas memory as fallback
  if (document.fonts) {
    document.fonts.load('800 156px "Bodoni Moda"').catch(() => {});
    document.fonts.load('800 156px "Playfair Display"').catch(() => {});
    document.fonts.load('800 156px "Cinzel"').catch(() => {});
  }`;

if (html.includes(initSearch)) {
  html = html.replace(initSearch, newInit);
  console.log('Successfully added Path2D glyph definitions to auraOrbCanvas init.');
} else {
  console.log('Could not find exact initSearch string; searching for textBuffer init...');
  const tbIdx = html.indexOf('let textBuffer = null;');
  if (tbIdx !== -1) {
    const afterTry = html.indexOf('// Pre-load web fonts', tbIdx);
    if (afterTry !== -1) {
      const braceEnd = html.indexOf('}', afterTry) + 1;
      const targetStr = html.slice(afterTry, braceEnd + 4);
      html = html.replace(targetStr, newInit);
      console.log('Replaced font pre-loader with Path2D + font pre-loader.');
    }
  }
}

// 2. UPDATE LAYER 5 WITH PRECISION HERMES AURA RENDERING
const l5Start = '// LAYER 5: SOLID EDITORIAL DIDONE "AURA" WORDMARK';
const l6Start = '// LAYER 6: HERMES-STYLE EDITORIAL SUBTEXT';

const idx5 = html.indexOf(l5Start);
const idx6 = html.indexOf(l6Start);

if (idx5 === -1 || idx6 === -1) {
  console.error('Could not find Layer 5 or Layer 6 bounds! l5=' + idx5 + ', l6=' + idx6);
  process.exit(1);
}

const sliceStart = html.lastIndexOf('\n', idx5 - 1);

const newLayer5Code = `
    // ========================================================
    // LAYER 5: 100% AUTHENTIC HERMES AGENT "AURA" MASTER WORDMARK
    // Exact dagger leg on 'R', triangular notch on 'A', seamless Didone 'U'
    // Zero artificial flat top bars, 100% solid titanium fill with liquid caustics
    // ========================================================
    ctx.save();

    const drawH = Math.max(76, Math.min(W * 0.16, Math.min(H * 0.20, 156)));
    const glyphScale = drawH / 104;
    const totalVecW = 289;
    const drawW = Math.round(totalVecW * glyphScale);
    const startX = Math.round(cx - drawW / 2);
    const startY = Math.round(cy - drawH / 2);

    const padX = Math.round(drawH * 0.22);
    const bufW = Math.ceil(drawW + padX * 2);
    const bufH = Math.ceil(drawH * 1.45);

    if (textBuffer && tCtx) {
      if (textBuffer.width !== Math.round(bufW * DPR) || textBuffer.height !== Math.round(bufH * DPR)) {
        textBuffer.width = Math.round(bufW * DPR);
        textBuffer.height = Math.round(bufH * DPR);
      }

      tCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
      tCtx.clearRect(0, 0, bufW, bufH);

      // --- STEP 5A: DRAW 100% SOLID OPAQUE HERMES AGENT LETTERS ---
      tCtx.globalCompositeOperation = 'source-over';

      // Rich Titanium-Silver Gradient (Crisp Top Specular to Architectural Slate Shadow)
      const baseGrad = tCtx.createLinearGradient(0, (bufH - drawH) / 2, 0, (bufH + drawH) / 2);
      baseGrad.addColorStop(0, '#ffffff');    // Pure crisp top specular
      baseGrad.addColorStop(0.24, '#f1f5f9'); // Clean slate-100
      baseGrad.addColorStop(0.66, '#cbd5e1'); // Metallic slate-300
      baseGrad.addColorStop(1, '#94a3b8');    // Deep architectural shadow

      tCtx.fillStyle = baseGrad;
      tCtx.globalAlpha = 1.0;

      const vY0 = isSpeaking ? Math.sin(now * 0.016 + 0 * 1.4) * voiceAmp * 3.5 : 0;
      const vY1 = isSpeaking ? Math.sin(now * 0.016 + 1 * 1.4) * voiceAmp * 3.5 : 0;
      const vY2 = isSpeaking ? Math.sin(now * 0.016 + 2 * 1.4) * voiceAmp * 3.5 : 0;
      const vY3 = isSpeaking ? Math.sin(now * 0.016 + 3 * 1.4) * voiceAmp * 3.5 : 0;

      if (pathA && pathU && pathR) {
        // High-Precision Vector Glyphs (Exact Hermes Anatomy)
        tCtx.save();
        tCtx.translate(padX, (bufH - drawH) / 2);
        tCtx.scale(glyphScale, glyphScale);

        // Letter 1: A (Hermes triangle notch at bottom-left, clean apex)
        tCtx.save();
        if (vY0) tCtx.translate(0, vY0 / glyphScale);
        tCtx.translate(0, 0);
        tCtx.fill(pathA, 'evenodd');
        tCtx.restore();

        // Letter 2: U (Seamless Didone curve, delicate serif top)
        tCtx.save();
        if (vY1) tCtx.translate(0, vY1 / glyphScale);
        tCtx.translate(79, 0);
        tCtx.fill(pathU, 'evenodd');
        tCtx.restore();

        // Letter 3: R (Hermes dagger blade leg, smooth upper loop)
        tCtx.save();
        if (vY2) tCtx.translate(0, vY2 / glyphScale);
        tCtx.translate(145, 0);
        tCtx.fill(pathR, 'evenodd');
        tCtx.restore();

        // Letter 4: A (Matching Hermes triangle notch)
        tCtx.save();
        if (vY3) tCtx.translate(0, vY3 / glyphScale);
        tCtx.translate(222, 0);
        tCtx.fill(pathA, 'evenodd');
        tCtx.restore();

        tCtx.restore();
      } else {
        // Fallback font rendering
        const fontStr = '800 ' + Math.round(drawH) + 'px "Bodoni Moda", "Playfair Display", "Cinzel", "Didot", serif';
        tCtx.font = fontStr;
        tCtx.textBaseline = 'middle';
        tCtx.textAlign = 'left';
        const letters = ['A', 'U', 'R', 'A'];
        const letterWidths = letters.map(c => tCtx.measureText(c).width);
        const tracking = drawH * 0.08;
        let curLocalX = padX;
        for (let i = 0; i < letters.length; i++) {
          const visemeY = isSpeaking ? Math.sin(now * 0.016 + i * 1.4) * voiceAmp * 3.5 : 0;
          tCtx.fillText(letters[i], curLocalX, bufH / 2 + visemeY);
          curLocalX += letterWidths[i] + tracking;
        }
      }

      // --- STEP 5B: COMPOSITE LIQUID SPECULAR CAUSTICS VIA 'source-atop' ---
      // Preserves 100% of the solid letters and casts fluid light strictly across them
      tCtx.globalCompositeOperation = 'source-atop';

      const flowSpeed = isThinking ? 0.0022 : (isSpeaking ? 0.0016 : 0.0009);
      const flowT = now * flowSpeed;
      const waveAmp = (6 + voiceAmp * 12) * (drawH / 150);

      // Specular light sweep across glyphs (responsive to mouse angle)
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
      tCtx.globalAlpha = 0.32 + Math.sin(now * 0.0018) * 0.10;
      tCtx.beginPath();
      const waveBaseY = bufH * (0.48 + mouse.y * 0.08);
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

      // --- STEP 5C: CHISELED HAIRLINE PERIMETER STROKE ---
      tCtx.globalCompositeOperation = 'source-over';
      tCtx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      tCtx.lineWidth = Math.max(0.6, 0.85 / glyphScale);
      tCtx.globalAlpha = 0.55;

      if (pathA && pathU && pathR) {
        tCtx.save();
        tCtx.translate(padX, (bufH - drawH) / 2);
        tCtx.scale(glyphScale, glyphScale);

        tCtx.save(); if (vY0) tCtx.translate(0, vY0 / glyphScale); tCtx.translate(0, 0); tCtx.stroke(pathA); tCtx.restore();
        tCtx.save(); if (vY1) tCtx.translate(0, vY1 / glyphScale); tCtx.translate(79, 0); tCtx.stroke(pathU); tCtx.restore();
        tCtx.save(); if (vY2) tCtx.translate(0, vY2 / glyphScale); tCtx.translate(145, 0); tCtx.stroke(pathR); tCtx.restore();
        tCtx.save(); if (vY3) tCtx.translate(0, vY3 / glyphScale); tCtx.translate(222, 0); tCtx.stroke(pathA); tCtx.restore();

        tCtx.restore();
      }

      // --- STEP 5D: BLIT TO MAIN CANVAS ---
      ctx.shadowColor = isThinking ? 'rgba(192, 132, 252, 0.24)' : 'rgba(226, 232, 240, 0.20)';
      ctx.shadowBlur = (8 + voiceAmp * 6) * breath;
      ctx.drawImage(textBuffer, startX - padX, cy - bufH / 2, bufW, bufH);
    } else {
      // Direct Canvas 2D Fallback
      if (pathA && pathU && pathR) {
        ctx.save();
        ctx.fillStyle = '#f8fafc';
        ctx.translate(startX, startY);
        ctx.scale(glyphScale, glyphScale);
        ctx.fill(pathA, 'evenodd');
        ctx.save(); ctx.translate(79, 0); ctx.fill(pathU, 'evenodd'); ctx.restore();
        ctx.save(); ctx.translate(145, 0); ctx.fill(pathR, 'evenodd'); ctx.restore();
        ctx.save(); ctx.translate(222, 0); ctx.fill(pathA, 'evenodd'); ctx.restore();
        ctx.restore();
      }
    }
    ctx.restore();\n`;

html = html.slice(0, sliceStart) + newLayer5Code + html.slice(idx6);
fs.writeFileSync(path, html, 'utf8');
console.log('Successfully updated index.html with 100% Authentic Hermes Agent AURA master typography!');
