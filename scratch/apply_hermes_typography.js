const fs = require('fs');
const path = 'C:\\Users\\Administrator\\AuraNextGen\\index.html';

let html = fs.readFileSync(path, 'utf8');

// 1. ADD GOOGLE FONTS IN <head>
const googleFontsSnippet = `
  <!-- ============================================================
       HERMES AGENT EDITORIAL DISPLAY SERIF FONTS (Bodoni Moda & Cinzel)
       ============================================================ -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,700..900;1,6..96,700..900&family=Cinzel:wght@700;800;900&family=Playfair+Display:ital,wght@0,700..900;1,700..900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
`;

if (!html.includes('Bodoni+Moda')) {
  html = html.replace('<meta charset="UTF-8">', googleFontsSnippet + '\n  <meta charset="UTF-8">');
  console.log('Added Google Fonts to <head>');
}

// 2. ADD PRE-WARMING HIDDEN CONTAINERS TO PRE-LOAD GLYPHS INSTANTLY
const fontPrewarmSnippet = `
  <!-- Hidden elements to trigger immediate WebFont downloading for Canvas 2D -->
  <div style="font-family:'Bodoni Moda';font-weight:900;position:absolute;left:-9999px;opacity:0;pointer-events:none;" aria-hidden="true">AURA</div>
  <div style="font-family:'Cinzel';font-weight:900;position:absolute;left:-9999px;opacity:0;pointer-events:none;" aria-hidden="true">AURA</div>
  <div style="font-family:'Playfair Display';font-weight:900;position:absolute;left:-9999px;opacity:0;pointer-events:none;" aria-hidden="true">AURA</div>
`;

if (!html.includes('font-family:\'Bodoni Moda\'')) {
  html = html.replace('<!-- LAYER 2: UI MENGAMBANG -->', fontPrewarmSnippet + '\n<!-- LAYER 2: UI MENGAMBANG -->');
  console.log('Added font prewarming containers');
}

// 3. LOCATE AND UPDATE LAYER 5 (AURA WORDMARK IN auraOrbCanvas)
const oldLayer5Anchor = '// LAYER 5: CRISP, SHARP, CLEAN "AURA" WORDMARK';
const oldLayer5Idx = html.indexOf(oldLayer5Anchor);

if (oldLayer5Idx === -1) {
  console.error('Could not find Layer 5 anchor in index.html!');
  process.exit(1);
}

const layer6Anchor = '// LAYER 6: HIGHLY READABLE "PERSONAL AI SYSTEM" SUBTEXT';
const layer6Idx = html.indexOf(layer6Anchor, oldLayer5Idx);

if (layer6Idx === -1) {
  console.error('Could not find Layer 6 anchor in index.html!');
  process.exit(1);
}

const newLayer5Code = `// LAYER 5: HERMES AGENT EDITORIAL DISPLAY SERIF "AURA" WORDMARK
    // High-contrast, monumental luxury Didone serif with titanium-silver finish
    // ========================================================
    ctx.save();
    const letters = ['A', 'U', 'R', 'A'];

    // Hermes-style Editorial Display Serif (Bodoni Moda / Cinzel / Playfair)
    ctx.font = '800 ' + Math.round(fontSize) + 'px "Bodoni Moda", "Cinzel", "Playfair Display", "Didot", "Bodoni MT", serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    const letterWidths = letters.map(c => ctx.measureText(c).width);
    // Editorial refined tracking (statuesque, not overly loose)
    const tracking = fontSize * 0.22;
    const totalWidth = letterWidths.reduce((a, b) => a + b, 0) + (letters.length - 1) * tracking;
    const startX = cx - totalWidth / 2;

    // Smooth Specular Shimmer Sweep
    const shimmerSpeed = isThinking ? 0.00065 : 0.00028;
    const sweepProgress = ((now * shimmerSpeed) % 2.8) - 0.9;
    const sweepX = startX + totalWidth * sweepProgress;

    // Hermes Agent Luxury Titanium-Platinum Gradient (Cool Editorial Slate)
    const textGrad = ctx.createLinearGradient(startX, cy - fontSize * 0.46, startX, cy + fontSize * 0.46);
    textGrad.addColorStop(0, '#f8fafc');   // Crisp pure top specular
    textGrad.addColorStop(0.28, '#e2e8f0'); // Cool metallic silver
    textGrad.addColorStop(0.72, '#cbd5e1'); // Architectural slate
    textGrad.addColorStop(1, '#94a3b8');   // Grounding shadow

    // Pure, Razor-Sharp Specular Glow (Zero Blurry Neon Slop)
    ctx.shadowColor = 'rgba(226, 232, 240, 0.22)';
    ctx.shadowBlur = 6 * breath;

    // Render Letters with Monumental Editorial Sharpness
    let curX = startX;
    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];
      const charW = letterWidths[i];

      const visemeY = isSpeaking ? Math.sin(now * 0.016 + i * 1.4) * voiceAmp * 3.5 : 0;
      const charY = cy + visemeY;

      // Base Sculptural Fill
      ctx.fillStyle = textGrad;
      ctx.globalAlpha = 0.98;
      ctx.fillText(char, curX, charY);

      // Specular Highlight Glint Sweep
      const distToSweep = Math.abs((curX + charW / 2) - sweepX);
      if (distToSweep < fontSize * 0.55) {
        const sheenAlpha = (1 - distToSweep / (fontSize * 0.55)) * 0.45;
        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = sheenAlpha;
        ctx.fillText(char, curX, charY);
        ctx.restore();
      }

      // Razor Hairline Stroke for Chiseled Monumental Edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.60)';
      ctx.lineWidth = 0.65;
      ctx.globalAlpha = 0.50;
      ctx.strokeText(char, curX, charY);

      curX += charW + tracking;
    }
    ctx.restore();

    `;

html = html.slice(0, oldLayer5Idx) + newLayer5Code + html.slice(layer6Idx);
console.log('Updated Layer 5 to Hermes Agent Editorial Display Serif');

// 4. UPDATE LAYER 6 (SUBTEXT) TO MATCH HERMES TYPOGRAPHY
const oldSubtextFont = `ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "SF Mono", monospace';`;
const newSubtextFont = `ctx.font = '500 11px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';`;

if (html.includes(oldSubtextFont)) {
  html = html.replace(oldSubtextFont, newSubtextFont);
  console.log('Updated subtext font to Plus Jakarta Sans');
}

// 5. PRE-WARM FONT LOADING IN JAVASCRIPT
const oldResizeStart = `function resize() {`;
const newResizeStart = `// Pre-load web fonts into canvas memory
  if (document.fonts) {
    document.fonts.load('800 64px "Bodoni Moda"').catch(() => {});
    document.fonts.load('800 64px "Cinzel"').catch(() => {});
    document.fonts.load('800 64px "Playfair Display"').catch(() => {});
  }

  function resize() {`;

if (html.includes(oldResizeStart) && !html.includes('document.fonts.load(\'800 64px "Bodoni Moda"\')')) {
  html = html.replace(oldResizeStart, newResizeStart);
  console.log('Added document.fonts.load pre-warmer');
}

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully applied Hermes Agent typography to index.html!');
