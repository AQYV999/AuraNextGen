const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

// 1. ADD CSS @import FOR GOOGLE FONTS AT TOP OF <style> FOR BULLETPROOF LOADING
const importCSS = `@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,700..900&family=Cinzel:wght@700;800;900&family=Playfair+Display:ital,wght@0,700..900;1,700..900&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');\n`;

if (!html.includes('@import url(\'https://fonts.googleapis.com/css2?family=Bodoni+Moda')) {
  html = html.replace('<style>', '<style>\n  ' + importCSS);
  console.log('Added @import for Bodoni Moda & Cinzel in <style>');
}

// 2. LOCATE LAYER 5 AND LAYER 6 IN auraOrbCanvas
const l5Anchor = '// LAYER 5: LIQUID SPECULAR CAUSTICS — AURA EDITORIAL WORDMARK';
const l5Idx = html.indexOf(l5Anchor);
const l7Anchor = '// LAYER 7: FRONT PARTICLES (z > 0)';
const l7Idx = html.indexOf(l7Anchor);

if (l5Idx === -1 || l7Idx === -1) {
  console.error('Could not locate Layer 5 or Layer 7 bounds!');
  process.exit(1);
}

const sliceStart = html.lastIndexOf('\n', l5Idx - 1);

const solidHermesCore = `
    // ========================================================
    // LAYER 5: SOLID HERMES AGENT EDITORIAL WORDMARK WITH LIQUID CAUSTICS
    // Heavy, bold, solid Didone letters with dynamic surface caustics & tight kerning
    // ========================================================
    ctx.save();
    const letters = ['A', 'U', 'R', 'A'];

    // Monumental High-Contrast Editorial Serif (Bodoni Moda / Cinzel / Playfair / Georgia)
    const fontStr = '900 ' + Math.round(fontSize) + 'px "Bodoni Moda", "Cinzel", "Playfair Display", "Prata", "Didot", Georgia, serif';
    ctx.font = fontStr;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    const letterWidths = letters.map(c => ctx.measureText(c).width);
    // Tight, regal, authoritative editorial tracking (like HERMES AGENT)
    const tracking = fontSize * 0.07;
    const totalWidth = letterWidths.reduce((a, b) => a + b, 0) + (letters.length - 1) * tracking;
    const startX = cx - totalWidth / 2;

    const padX = Math.round(fontSize * 0.25);
    const bufW = Math.ceil(totalWidth + padX * 2);
    const bufH = Math.ceil(fontSize * 1.45);

    if (textBuffer && tCtx) {
      if (textBuffer.width !== Math.round(bufW * DPR) || textBuffer.height !== Math.round(bufH * DPR)) {
        textBuffer.width = Math.round(bufW * DPR);
        textBuffer.height = Math.round(bufH * DPR);
      }

      tCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
      tCtx.clearRect(0, 0, bufW, bufH);

      // --- STEP 5A: DRAW 100% SOLID, OPAQUE SCULPTURAL LETTERS ---
      tCtx.globalCompositeOperation = 'source-over';
      tCtx.font = fontStr;
      tCtx.textBaseline = 'middle';
      tCtx.textAlign = 'left';

      // Rich Hermes Titanium-Silver Gradient (Solid, Heavy, Sculptural)
      const baseGrad = tCtx.createLinearGradient(0, bufH * 0.15, 0, bufH * 0.85);
      baseGrad.addColorStop(0, '#ffffff');    // Pure crisp top specular
      baseGrad.addColorStop(0.22, '#f1f5f9'); // Clean slate-100
      baseGrad.addColorStop(0.65, '#cbd5e1'); // Metallic slate-300
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
      // 'source-atop' preserves 100% of the solid letters and draws caustics strictly on top!
      tCtx.globalCompositeOperation = 'source-atop';

      const flowSpeed = isThinking ? 0.0022 : (isSpeaking ? 0.0016 : 0.0009);
      const flowT = now * flowSpeed;
      const waveAmp = (6 + voiceAmp * 12) * (fontSize / 150);

      // Dynamic light beam tracking mouse & auto-roll
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
      tCtx.globalAlpha = 0.35 + Math.sin(now * 0.0018) * 0.10;
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
      tCtx.lineWidth = 0.75;
      tCtx.globalAlpha = 0.60;

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
      // Direct solid fallback
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

    // High Contrast Crisp Subtext (Slate-300 / Theme Accent)
    ctx.fillStyle = isThinking ? '#c084fc' : (isSpeaking ? '#38bdf8' : '#cbd5e1');
    ctx.globalAlpha = 0.90;
    ctx.fillText(displayLabel, cx, hudY);
    ctx.restore();

    `;

html = html.slice(0, sliceStart) + solidHermesCore + html.slice(l7Idx);
fs.writeFileSync(path, html, 'utf8');
console.log('Successfully applied Solid Hermes Agent AURA Core!');
