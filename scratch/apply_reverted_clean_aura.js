const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

// 1. CLEAN UP auraOrbCanvas IIFE INITIALIZATION
// Remove Path2D declarations and ensure clean textBuffer setup
const orbInitTarget = `  // 100% Authentic Hermes Agent Precision Vector Glyphs (Mathematical Curves)
  const pathA = (typeof Path2D !== 'undefined') ? new Path2D("M 6,2 L 35,2 L 35,6 L 31,6 L 50,68 L 56,96 L 61,96 L 61,100 L 19,100 L 19,96 L 28,96 L 33,74 L 30,74 L 4,100 L 1,100 L 1,70 L 14,6 L 6,6 Z M 17,16 L 31,68 L 5,68 Z") : null;
  const pathU = (typeof Path2D !== 'undefined') ? new Path2D("M 0,2 L 38,2 L 38,6 L 29,6 L 29,70 C 29,85 34,94 40,94 C 46,94 52,85 52,70 L 52,6 L 46,6 L 46,2 L 62,2 L 62,6 L 56,6 L 56,70 C 56,89 46,100 32,100 C 19,100 11,89 11,70 L 11,6 L 0,6 Z") : null;
  const pathR = (typeof Path2D !== 'undefined') ? new Path2D("M 0,2 L 44,2 L 44,6 L 29,6 C 44,6 66,16 66,28 C 66,40 50,48 39,50 L 62,54 L 62,100 L 59,100 L 34,52 L 29,52 L 29,96 L 35,96 L 35,100 L 0,100 L 0,96 L 11,96 L 11,6 L 0,6 Z M 29,14 C 42,14 48,20 48,27 C 48,34 42,39 29,39 Z") : null;`;

const newOrbInit = `  // Pre-load web fonts into canvas memory
  if (document.fonts) {
    document.fonts.load('800 156px "Bodoni Moda"').catch(() => {});
    document.fonts.load('800 156px "Playfair Display"').catch(() => {});
    document.fonts.load('800 156px "Cinzel"').catch(() => {});
  }`;

if (html.includes(orbInitTarget)) {
  html = html.replace(orbInitTarget, newOrbInit);
  console.log('Replaced custom stencil vectors with clean font pre-loader.');
}

// 2. REPLACE LAYER 5 & LAYER 6 WITH ELEGANT EDITORIAL SERIF (NO FLAT TOP BARS, NORMAL A & R)
const l5Start = '// LAYER 5: 100% PRECISION VECTOR HERMES AGENT AURA WORDMARK';
const l7Start = '// LAYER 7: FRONT PARTICLES (z > 0)';

const l5Idx = html.indexOf(l5Start);
const l7Idx = html.indexOf(l7Start);

if (l5Idx === -1 || l7Idx === -1) {
  console.error('Could not find Layer 5 or Layer 7 bounds!');
  process.exit(1);
}

const sliceStart = html.lastIndexOf('\n', l5Idx - 1);

const cleanEditorialLayer5 = `
    // ========================================================
    // LAYER 5: SOLID EDITORIAL DIDONE "AURA" WORDMARK
    // Classical pointed apex A, graceful sweeping leg R, seamless U
    // Zero artificial flat top bars, 100% solid titanium fill with liquid caustics
    // ========================================================
    ctx.save();
    const letters = ['A', 'U', 'R', 'A'];

    // High-Contrast Didone Serif (Pointed apex, natural graceful curves)
    const fontStr = '800 ' + Math.round(fontSize) + 'px "Bodoni Moda", "Playfair Display", "Cinzel", "Didot", "Bodoni MT", serif';
    ctx.font = fontStr;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    const letterWidths = letters.map(c => ctx.measureText(c).width);
    // Refined, natural editorial tracking (balanced, not wide or cramped)
    const tracking = fontSize * 0.08;
    const totalWidth = letterWidths.reduce((a, b) => a + b, 0) + (letters.length - 1) * tracking;
    const startX = cx - totalWidth / 2;

    const padX = Math.round(fontSize * 0.22);
    const bufW = Math.ceil(totalWidth + padX * 2);
    const bufH = Math.ceil(fontSize * 1.45);

    if (textBuffer && tCtx) {
      if (textBuffer.width !== Math.round(bufW * DPR) || textBuffer.height !== Math.round(bufH * DPR)) {
        textBuffer.width = Math.round(bufW * DPR);
        textBuffer.height = Math.round(bufH * DPR);
      }

      tCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
      tCtx.clearRect(0, 0, bufW, bufH);

      // --- STEP 5A: DRAW 100% SOLID OPAQUE CLASSICAL DIDONE LETTERS ---
      tCtx.globalCompositeOperation = 'source-over';
      tCtx.font = fontStr;
      tCtx.textBaseline = 'middle';
      tCtx.textAlign = 'left';

      // Rich Titanium-Silver Gradient (Crisp Top Specular to Architectural Slate Shadow)
      const baseGrad = tCtx.createLinearGradient(0, bufH * 0.15, 0, bufH * 0.85);
      baseGrad.addColorStop(0, '#ffffff');    // Pure crisp top specular
      baseGrad.addColorStop(0.24, '#f1f5f9'); // Clean slate-100
      baseGrad.addColorStop(0.66, '#cbd5e1'); // Metallic slate-300
      baseGrad.addColorStop(1, '#94a3b8');    // Deep architectural shadow

      tCtx.fillStyle = baseGrad;
      tCtx.globalAlpha = 1.0;

      let curLocalX = padX;
      for (let i = 0; i < letters.length; i++) {
        const char = letters[i];
        const charW = letterWidths[i];
        const visemeY = isSpeaking ? Math.sin(now * 0.016 + i * 1.4) * voiceAmp * 3.5 : 0;
        tCtx.fillText(char, curLocalX, bufH / 2 + visemeY);
        curLocalX += charW + tracking;
      }

      // --- STEP 5B: COMPOSITE LIQUID SPECULAR CAUSTICS VIA 'source-atop' ---
      // Preserves 100% of the solid letters and casts fluid light strictly across them
      tCtx.globalCompositeOperation = 'source-atop';

      const flowSpeed = isThinking ? 0.0022 : (isSpeaking ? 0.0016 : 0.0009);
      const flowT = now * flowSpeed;
      const waveAmp = (6 + voiceAmp * 12) * (fontSize / 150);

      // Specular light sweep across glyphs (responsive to mouse angle)
      const autoCycle = ((now * 0.00028) % 2.8) - 0.9;
      const sweepProgress = autoCycle + mouse.x * 0.35;
      const sweepCenter = padX + totalWidth * sweepProgress;
      const beamW = fontSize * 0.85;

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
      tCtx.lineWidth = 0.70;
      tCtx.globalAlpha = 0.55;

      curLocalX = padX;
      for (let i = 0; i < letters.length; i++) {
        const char = letters[i];
        const charW = letterWidths[i];
        const visemeY = isSpeaking ? Math.sin(now * 0.016 + i * 1.4) * voiceAmp * 3.5 : 0;
        tCtx.strokeText(char, curLocalX, bufH / 2 + visemeY);
        curLocalX += charW + tracking;
      }

      // --- STEP 5D: BLIT TO MAIN CANVAS ---
      ctx.shadowColor = isThinking ? 'rgba(192, 132, 252, 0.24)' : 'rgba(226, 232, 240, 0.20)';
      ctx.shadowBlur = (8 + voiceAmp * 6) * breath;
      ctx.drawImage(textBuffer, startX - padX, cy - bufH / 2, bufW, bufH);
    } else {
      // Solid fallback
      ctx.font = fontStr;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f8fafc';
      let dCurX = startX;
      for (let i = 0; i < letters.length; i++) {
        ctx.fillText(letters[i], dCurX, cy);
        dCurX += letterWidths[i] + tracking;
      }
    }
    ctx.restore();

    // ========================================================
    // LAYER 6: HERMES-STYLE EDITORIAL SUBTEXT (Clean, Centered, No Stray Dots)
    // ========================================================
    ctx.save();
    const hudY = cy + fontSize * 0.72;
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

html = html.slice(0, sliceStart) + cleanEditorialLayer5 + html.slice(l7Idx);
fs.writeFileSync(path, html, 'utf8');
console.log('Successfully reverted A & R to clean classical form and removed top bars!');
