const fs = require('fs');

const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. UPDATE GOOGLE FONTS IN <head>
const oldFontLinkRegex = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+" rel="stylesheet">/;
const newFontLink = `<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">`;

if (oldFontLinkRegex.test(html)) {
  html = html.replace(oldFontLinkRegex, newFontLink);
  console.log('Updated Google Fonts link in <head>');
}

// 2. UPDATE @import IN <style>
const oldImportRegex = /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?[^']+'\);/;
const newImport = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');`;

if (oldImportRegex.test(html)) {
  html = html.replace(oldImportRegex, newImport);
  console.log('Updated @import in <style>');
}

// 3. UPDATE PREWARMING CONTAINERS
const oldPrewarmRegex = /<div style="font-family:'(?:Bodoni Moda|Instrument Serif)'[\s\S]*?aria-hidden="true">AURA<\/div>[\s\S]*?aria-hidden="true">(?:AURA|PERSONAL AI SYSTEM · LISTENING)<\/div>/;
const newPrewarm = `<div style="font-family:'Instrument Serif';font-weight:400;position:absolute;left:-9999px;opacity:0;pointer-events:none;" aria-hidden="true">AURA</div>
  <div style="font-family:'Space Grotesk';font-weight:500;position:absolute;left:-9999px;opacity:0;pointer-events:none;" aria-hidden="true">PERSONAL AI SYSTEM · LISTENING</div>`;

// Replace prewarm block
const prewarmAnchor = '<div style="font-family:\'Bodoni Moda\'';
const prewarmIdx = html.indexOf(prewarmAnchor);
if (prewarmIdx !== -1) {
  const endAnchor = '</div>\n  <div style="font-family:\'Playfair Display\';font-weight:900;position:absolute;left:-9999px;opacity:0;pointer-events:none;" aria-hidden="true">AURA</div>';
  const endIdx = html.indexOf(endAnchor, prewarmIdx);
  if (endIdx !== -1) {
    const fullOld = html.slice(prewarmIdx, endIdx + endAnchor.length);
    html = html.replace(fullOld, newPrewarm);
    console.log('Updated prewarming divs in HTML body');
  }
}

// 4. UPDATE auraOrbCanvas INITIALIZATION (Fonts loading & cleanup)
const orbInitTargetRegex = /\/\/ 100% Authentic Hermes Agent Precision Vector Glyphs[\s\S]*?document\.fonts\.load\('[^']+'\)\.catch\(\(\) => \{\}\);[\s\S]*?\}/;
const newOrbInit = `// Pre-load web fonts into canvas memory
  if (document.fonts) {
    document.fonts.load('400 156px "Instrument Serif"').catch(() => {});
    document.fonts.load('500 12px "Space Grotesk"').catch(() => {});
  }`;

if (orbInitTargetRegex.test(html)) {
  html = html.replace(orbInitTargetRegex, newOrbInit);
  console.log('Updated font preloading in auraOrbCanvas');
}

// 5. UPDATE LAYER 5 (AURA WORDMARK: Instrument Serif Regular) & LAYER 6 (SUBTITLE: Space Grotesk Medium 500)
const l5Start = '// LAYER 5:';
const l7Start = '// LAYER 7: FRONT PARTICLES (z > 0)';

const idx5 = html.indexOf(l5Start);
const idx7 = html.indexOf(l7Start);

if (idx5 === -1 || idx7 === -1) {
  console.error('Could not find Layer 5 or Layer 7 bounds!');
  process.exit(1);
}

const sliceStart = html.lastIndexOf('\n', idx5 - 1);

const newTypographyLayers = `
    // ========================================================
    // LAYER 5: AURA WORDMARK — INSTRUMENT SERIF (REGULAR 400)
    // Elegant, distinctive, high-contrast serif with custom kerning
    // Preserves existing white-cyan-lavender gradient and subtle glow
    // ========================================================
    ctx.save();

    const letters = ['A', 'U', 'R', 'A'];
    const fontStr = '400 ' + Math.round(fontSize) + 'px "Instrument Serif", Georgia, "Times New Roman", serif';
    ctx.font = fontStr;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    const letterWidths = letters.map(c => ctx.measureText(c).width);
    // Refined, statuesque letter spacing
    const tracking = fontSize * 0.052;
    // Custom kerning pairs: A-U balanced, U-R balanced, R-A optically tucked
    const kerningPairs = [0, 0, -fontSize * 0.022];

    let totalWidth = 0;
    for (let i = 0; i < letters.length; i++) {
      totalWidth += letterWidths[i];
      if (i < letters.length - 1) {
        totalWidth += tracking + (kerningPairs[i] || 0);
      }
    }
    const startX = Math.round(cx - totalWidth / 2);

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

      // --- STEP 5A: DRAW SOLID INSTRUMENT SERIF LETTERS ---
      tCtx.globalCompositeOperation = 'source-over';
      tCtx.font = fontStr;
      tCtx.textBaseline = 'middle';
      tCtx.textAlign = 'left';

      // White-Cyan-Lavender Gradient (Luminous editorial palette)
      const baseGrad = tCtx.createLinearGradient(0, (bufH - fontSize) / 2, 0, (bufH + fontSize) / 2);
      baseGrad.addColorStop(0, '#ffffff');    // Pure crisp top specular
      baseGrad.addColorStop(0.24, '#f0f9ff'); // Clean luminous white-cyan
      baseGrad.addColorStop(0.66, '#e0e7ff'); // Soft lavender-indigo
      baseGrad.addColorStop(1, '#a5b4fc');    // Grounded lavender shadow

      tCtx.fillStyle = baseGrad;
      tCtx.globalAlpha = 1.0;

      let curLocalX = padX;
      for (let i = 0; i < letters.length; i++) {
        const char = letters[i];
        const charW = letterWidths[i];
        const visemeY = isSpeaking ? Math.sin(now * 0.016 + i * 1.4) * voiceAmp * 3.5 : 0;
        tCtx.fillText(char, curLocalX, bufH / 2 + visemeY);
        curLocalX += charW + tracking + (kerningPairs[i] || 0);
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
        beamGrad.addColorStop(0.50, 'rgba(255, 255, 255, 0.88)');
        beamGrad.addColorStop(0.72, 'rgba(232, 121, 249, 0.45)');
        beamGrad.addColorStop(1, 'rgba(232, 121, 249, 0)');
      } else {
        beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        beamGrad.addColorStop(0.26, 'rgba(56, 189, 248, 0.48)');
        beamGrad.addColorStop(0.50, 'rgba(255, 255, 255, 0.88)');
        beamGrad.addColorStop(0.74, 'rgba(192, 132, 252, 0.45)');
        beamGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
      }

      tCtx.fillStyle = beamGrad;
      tCtx.fillRect(0, 0, bufW, bufH);

      // Liquid mercury fluid wavelets
      tCtx.save();
      tCtx.globalAlpha = 0.30 + Math.sin(now * 0.0018) * 0.10;
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
      tCtx.strokeStyle = 'rgba(255, 255, 255, 0.60)';
      tCtx.lineWidth = 0.65;
      tCtx.globalAlpha = 0.50;

      curLocalX = padX;
      for (let i = 0; i < letters.length; i++) {
        const char = letters[i];
        const charW = letterWidths[i];
        const visemeY = isSpeaking ? Math.sin(now * 0.016 + i * 1.4) * voiceAmp * 3.5 : 0;
        tCtx.strokeText(char, curLocalX, bufH / 2 + visemeY);
        curLocalX += charW + tracking + (kerningPairs[i] || 0);
      }

      // --- STEP 5D: BLIT TO MAIN CANVAS WITH SUBTLE GLOW ---
      ctx.shadowColor = isThinking ? 'rgba(192, 132, 252, 0.28)' : 'rgba(56, 189, 248, 0.22)';
      ctx.shadowBlur = (9 + voiceAmp * 6) * breath;
      ctx.drawImage(textBuffer, startX - padX, cy - bufH / 2, bufW, bufH);
    } else {
      // Solid Direct Fallback
      ctx.font = fontStr;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      let dCurX = startX;
      for (let i = 0; i < letters.length; i++) {
        ctx.fillText(letters[i], dCurX, cy);
        dCurX += letterWidths[i] + tracking + (kerningPairs[i] || 0);
      }
    }
    ctx.restore();

    // ========================================================
    // LAYER 6: SUBTITLE — SPACE GROTESK (MEDIUM 500)
    // Uppercase, clean, modern with balanced letter spacing
    // Text: "PERSONAL AI SYSTEM · LISTENING"
    // ========================================================
    ctx.save();
    const hudY = cy + fontSize * 0.72;
    ctx.font = '500 11px "Space Grotesk", "Plus Jakarta Sans", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    let displayLabel = 'PERSONAL AI SYSTEM · LISTENING';
    if (isSpeaking) {
      displayLabel = 'PERSONAL AI SYSTEM · SPEAKING';
    } else if (isThinking) {
      displayLabel = 'PERSONAL AI SYSTEM · PROCESSING';
    }

    ctx.fillStyle = isThinking ? '#c084fc' : (isSpeaking ? '#38bdf8' : '#cbd5e1');
    ctx.globalAlpha = 0.88;

    // Clean, modern letter spacing
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = '0.18em';
      ctx.fillText(displayLabel, cx, hudY);
    } else {
      // Balanced letter spacing fallback
      const trackPx = 2.0;
      const chars = displayLabel.split('');
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalSubW = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * trackPx;
      let subCurX = cx - totalSubW / 2;
      for (let i = 0; i < chars.length; i++) {
        ctx.fillText(chars[i], subCurX + charWidths[i] / 2, hudY);
        subCurX += charWidths[i] + trackPx;
      }
    }
    ctx.restore();\n`;

html = html.slice(0, sliceStart) + newTypographyLayers + html.slice(idx7);

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully applied Instrument Serif + Space Grotesk typography identity to index.html!');
