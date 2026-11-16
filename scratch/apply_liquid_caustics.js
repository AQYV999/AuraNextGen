const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

// 1. ADD textBuffer TO auraOrbCanvas IIFE INITIALIZATION IF NOT PRESENT
if (!html.includes('textBuffer = document.createElement(\'canvas\')')) {
  const oldInitTarget = `  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;`;

  const newInitTarget = `  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Dedicated High-Performance Offscreen Buffer for Liquid Specular Caustics
  const textBuffer = document.createElement('canvas');
  const tCtx = textBuffer.getContext('2d', { alpha: true });`;

  html = html.replace(oldInitTarget, newInitTarget);
  console.log('Added textBuffer declaration.');
}

// 2. LOCATE EXACT BOUNDS
const l5Anchor = '// LAYER 5: HERMES AGENT EDITORIAL DISPLAY SERIF "AURA" WORDMARK';
const l6Anchor = '// LAYER 6: HIGHLY READABLE "PERSONAL AI SYSTEM" SUBTEXT';

const l5Idx = html.indexOf(l5Anchor);
const l6Idx = html.indexOf(l6Anchor);

if (l5Idx === -1 || l6Idx === -1) {
  console.error('Could not locate Layer 5 or Layer 6 bounds! l5:', l5Idx, 'l6:', l6Idx);
  process.exit(1);
}

// Find previous line break for clean slice
const sliceStart = html.lastIndexOf('\n', l5Idx - 1);

const newLiquidCausticsLayer5 = `
    // ========================================================
    // LAYER 5: LIQUID SPECULAR CAUSTICS — AURA EDITORIAL WORDMARK
    // Liquid mercury fluid caustics, chromatic prism dispersion & specular light roll
    // ========================================================
    ctx.save();
    const letters = ['A', 'U', 'R', 'A'];

    // Editorial Display Serif (Bodoni Moda / Cinzel / Playfair)
    const fontStr = '800 ' + Math.round(fontSize) + 'px "Bodoni Moda", "Cinzel", "Playfair Display", "Didot", "Bodoni MT", serif';
    ctx.font = fontStr;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    const letterWidths = letters.map(c => ctx.measureText(c).width);
    const tracking = fontSize * 0.22;
    const totalWidth = letterWidths.reduce((a, b) => a + b, 0) + (letters.length - 1) * tracking;
    const startX = cx - totalWidth / 2;

    // Prepare Offscreen Buffer (sized exactly to text + padding)
    const padX = Math.round(fontSize * 0.35);
    const bufW = Math.ceil(totalWidth + padX * 2);
    const bufH = Math.ceil(fontSize * 1.55);

    if (textBuffer.width !== Math.round(bufW * DPR) || textBuffer.height !== Math.round(bufH * DPR)) {
      textBuffer.width = Math.round(bufW * DPR);
      textBuffer.height = Math.round(bufH * DPR);
    }

    tCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    tCtx.clearRect(0, 0, bufW, bufH);

    // --- STEP 5A: DRAW BASE LETTERS (MASK BASE) ---
    tCtx.font = fontStr;
    tCtx.textBaseline = 'middle';
    tCtx.textAlign = 'left';

    // Base Titanium-Silver Gradient (Cool Luxury Editorial Slate)
    const baseGrad = tCtx.createLinearGradient(0, bufH * 0.2, 0, bufH * 0.85);
    baseGrad.addColorStop(0, '#f8fafc');   // Pure crisp top specular
    baseGrad.addColorStop(0.28, '#e2e8f0'); // Cool metallic silver
    baseGrad.addColorStop(0.70, '#cbd5e1'); // Architectural slate
    baseGrad.addColorStop(1, '#94a3b8');   // Grounding shadow

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

    // --- STEP 5B: CLIP TO LETTERFORMS VIA 'source-in' ---
    tCtx.globalCompositeOperation = 'source-in';

    // Fluid dynamics variables
    const flowSpeed = isThinking ? 0.0022 : (isSpeaking ? 0.0016 : 0.0009);
    const flowT = now * flowSpeed;
    const waveAmp = (8 + voiceAmp * 14) * (fontSize / 150);

    // Dynamic light source position (tracks mouse angle & auto-drift)
    const autoCycle = ((now * 0.00028) % 2.8) - 0.9;
    const sweepProgress = autoCycle + mouse.x * 0.40;
    const sweepCenter = padX + totalWidth * sweepProgress;

    // --- CAUSTIC PASS 1: MOLTEN LIQUID SPECULAR LIGHT BEAM WITH CHROMATIC DISPERSION ---
    tCtx.save();
    const beamW = fontSize * 0.95;
    const beamGrad = tCtx.createLinearGradient(
      sweepCenter - beamW * 0.7, 0,
      sweepCenter + beamW * 0.7, bufH
    );

    // Prismatic Chromatic Aberration Fringe (Cyan -> Molten White -> Violet)
    if (isThinking) {
      beamGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
      beamGrad.addColorStop(0.25, 'rgba(192, 132, 252, 0.45)'); // Violet leading fringe
      beamGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.96)'); // Pure liquid core
      beamGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.92)');
      beamGrad.addColorStop(0.75, 'rgba(232, 121, 249, 0.45)'); // Fuchsia trailing fringe
      beamGrad.addColorStop(1, 'rgba(232, 121, 249, 0)');
    } else {
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      beamGrad.addColorStop(0.24, 'rgba(56, 189, 248, 0.48)'); // Cyan leading fringe
      beamGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.96)'); // Intense molten titanium
      beamGrad.addColorStop(0.56, 'rgba(255, 255, 255, 0.90)');
      beamGrad.addColorStop(0.78, 'rgba(192, 132, 252, 0.42)'); // Violet trailing fringe
      beamGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
    }

    tCtx.fillStyle = beamGrad;
    tCtx.fillRect(0, 0, bufW, bufH);
    tCtx.restore();

    // --- CAUSTIC PASS 2: INTERNAL LIQUID MERCURY WAVELETS ---
    tCtx.save();
    tCtx.globalAlpha = 0.42 + Math.sin(now * 0.0018) * 0.12;
    tCtx.beginPath();
    const waveBaseY = bufH * (0.46 + mouse.y * 0.10);
    tCtx.moveTo(0, waveBaseY);

    for (let wx = 0; wx <= bufW; wx += 6) {
      const wy = waveBaseY
        + Math.sin(wx * 0.024 + flowT * 2.2) * waveAmp
        + Math.cos(wx * 0.048 - flowT * 1.6) * (waveAmp * 0.65)
        + Math.sin(wx * 0.082 + flowT * 3.1) * (waveAmp * 0.30);
      tCtx.lineTo(wx, wy);
    }
    tCtx.lineTo(bufW, bufH);
    tCtx.lineTo(0, bufH);
    tCtx.closePath();

    const liquidWaveGrad = tCtx.createLinearGradient(0, waveBaseY - waveAmp, 0, bufH);
    liquidWaveGrad.addColorStop(0, 'rgba(255, 255, 255, 0.70)');
    liquidWaveGrad.addColorStop(0.35, isThinking ? 'rgba(192, 132, 252, 0.35)' : 'rgba(56, 189, 248, 0.32)');
    liquidWaveGrad.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
    tCtx.fillStyle = liquidWaveGrad;
    tCtx.fill();
    tCtx.restore();

    // --- CAUSTIC PASS 3: MICRO-SPECULAR SHIMMER PARTICLES INSIDE LIQUID ---
    tCtx.save();
    for (let f = 0; f < 5; f++) {
      const fProgress = ((now * 0.00045 + f * 0.22 + mouse.x * 0.2) % 1.6) - 0.3;
      if (fProgress > 0 && fProgress < 1) {
        const fx = padX + totalWidth * fProgress;
        const fy = bufH * 0.5 + Math.sin(fProgress * Math.PI * 4 + flowT) * (bufH * 0.22);
        const fRad = (fontSize * 0.08) * (1 - Math.abs(fProgress - 0.5) * 1.8);
        if (fRad > 0.5) {
          const fGrad = tCtx.createRadialGradient(fx, fy, 0, fx, fy, fRad);
          fGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
          fGrad.addColorStop(0.4, isThinking ? 'rgba(232, 121, 249, 0.4)' : 'rgba(56, 189, 248, 0.4)');
          fGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          tCtx.fillStyle = fGrad;
          tCtx.beginPath();
          tCtx.arc(fx, fy, fRad, 0, Math.PI * 2);
          tCtx.fill();
        }
      }
    }
    tCtx.restore();

    // --- STEP 5C: RESTORE 'source-over' & DRAW CHISELED HAIRLINE STROKE ---
    tCtx.globalCompositeOperation = 'source-over';
    tCtx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    tCtx.lineWidth = 0.65;
    tCtx.globalAlpha = 0.55;

    curLocalX = padX;
    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];
      const charW = letterWidths[i];
      const visemeY = isSpeaking ? Math.sin(now * 0.016 + i * 1.4) * voiceAmp * 3.5 : 0;
      tCtx.strokeText(char, curLocalX, bufH / 2 + visemeY);
      curLocalX += charW + tracking;
    }

    // --- STEP 5D: BLIT RENDERED BUFFER TO MAIN CANVAS ---
    // Soft, crisp atmospheric specular aura behind the liquid letters
    ctx.shadowColor = isThinking ? 'rgba(192, 132, 252, 0.28)' : 'rgba(226, 232, 240, 0.24)';
    ctx.shadowBlur = (8 + voiceAmp * 6) * breath;
    ctx.drawImage(textBuffer, startX - padX, cy - bufH / 2, bufW, bufH);
    ctx.restore();

`;

html = html.slice(0, sliceStart) + newLiquidCausticsLayer5 + html.slice(l6Idx);
fs.writeFileSync(path, html, 'utf8');
console.log('Successfully applied Liquid Specular Caustics!');
