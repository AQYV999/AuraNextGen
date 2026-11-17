/* ============================================================
   AURA NEXT GEN: CANVAS PARTICLE & GLITCH TYPOGRAPHY ENGINE
   ============================================================ */
/* ============================================================
   REFINED AURA TYPOGRAPHY CORE ENGINE (Ultra-Clean & Minimal)
   - Crisp, sharp, white-cyan "AURA" Wordmark
   - 50-60% Reduced Atmospheric Cyan Glow (No Solid Orb Appearance)
   - Zero Dark Blurry Spot Behind Text
   - Highly Readable "PERSONAL AI SYSTEM" Subtext
   - 16 Minimal Celestial Particles & Hairline Subtle Orbital Rings
   ============================================================ */
(() => {
  const canvas = document.getElementById('auraOrbCanvas');
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
  }

  // --- AURA NEXT GEN: Cyberpunk Digital Glitch State ---
  let nextGlitchTime = performance.now() + 2500;
  let glitchEndTime = 0;

  // Pre-load web fonts into canvas memory
  if (document.fonts) {
    document.fonts.load('400 156px "Instrument Serif"').catch(() => {});
    document.fonts.load('500 12px "Space Grotesk"').catch(() => {});
  }

  let W = 0, H = 0, DPR = 1;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // Responsive DPR & Viewport Resize
  function resize() {
    const isLite = document.documentElement.classList.contains('perf-lite');
    DPR = isLite ? 0.9 : Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Mouse & Touch Subtle Parallax Tracking
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / W) * 2 - 1;
    mouse.targetY = (e.clientY / H) * 2 - 1;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      mouse.targetX = (e.touches[0].clientX / W) * 2 - 1;
      mouse.targetY = (e.touches[0].clientY / H) * 2 - 1;
    }
  }, { passive: true });

  // 16 Minimal, Delicate Celestial Stardust Particles (Reduced from 36)
  const PARTICLES = [];
  const PARTICLE_COUNT = 16;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    PARTICLES.push({
      angle: Math.random() * Math.PI * 2,
      orbitR: 1.22 + Math.random() * 0.55,
      tilt: (Math.random() - 0.5) * 1.2,
      speed: (0.0004 + Math.random() * 0.0009) * (Math.random() < 0.5 ? 1 : -1),
      size: 0.8 + Math.random() * 1.1,
      floatSpeed: 0.0012 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2
    });
  }

  // State Theme Configuration
  function getRefinedTheme(state, isListening) {
    if (isListening) {
      return {
        accent: '#00f0ff',
        ring: 'rgba(0, 240, 255, 0.22)',
        glow: 'rgba(0, 240, 255, 0.12)',
        dot: '#00f0ff',
        subtext: 'PERSONAL AI SYSTEM · LISTENING'
      };
    }
    switch (state) {
      case 'mikir':
        return {
          accent: '#c084fc',
          ring: 'rgba(192, 132, 252, 0.22)',
          glow: 'rgba(192, 132, 252, 0.12)',
          dot: '#c084fc',
          subtext: 'PERSONAL AI SYSTEM · PROCESSING'
        };
      case 'offline':
      case 'sedih':
        return {
          accent: '#f87171',
          ring: 'rgba(239, 68, 68, 0.18)',
          glow: 'rgba(239, 68, 68, 0.08)',
          dot: '#f87171',
          subtext: 'PERSONAL AI SYSTEM · OFFLINE'
        };
      case 'kaget':
        return {
          accent: '#fbbf24',
          ring: 'rgba(251, 191, 36, 0.20)',
          glow: 'rgba(251, 191, 36, 0.10)',
          dot: '#fbbf24',
          subtext: 'PERSONAL AI SYSTEM · PRESENCE DETECTED'
        };
      default:
        return {
          accent: '#38bdf8',
          ring: 'rgba(56, 189, 248, 0.18)',
          glow: 'rgba(56, 189, 248, 0.09)',
          dot: '#22c55e',
          subtext: 'PERSONAL AI SYSTEM'
        };
    }
  }

  // Speech Viseme Tracker
  let voicePhase = 0;
  let voiceAmp = 0;
  let rippleTime = 0;

  function render(now) {
    requestAnimationFrame(render);

    const state = faceProxy ? (faceProxy.getAttribute('data-state') || 'senang') : 'senang';
    const isSpeaking = faceProxy ? (faceProxy.getAttribute('data-bicara') === 'on') : false;
    const isThinking = (state === 'mikir');
    const isListening = (document.activeElement === inpTanya);
    const theme = getRefinedTheme(state, isListening);

    // Smooth Parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    const cx = W / 2 + mouse.x * 12;
    const cy = (H / 2 - 15) + mouse.y * 12;

    // Monumental, commanding Hermes Agent scale (70-80% larger hero wordmark)
    const fontSize = Math.max(62, Math.min(W * 0.16, Math.min(H * 0.20, 156)));
    const coreR = fontSize * 1.42;

    // Clear Canvas
    ctx.clearRect(0, 0, W, H);

    // Audio reactivity
    const targetAmp = isSpeaking ? 1 : 0;
    voiceAmp += (targetAmp - voiceAmp) * 0.15;
    if (isSpeaking) voicePhase += 0.22;

    const breath = 0.9 + Math.sin(now * 0.0016) * 0.1;

    // ========================================================
    // LAYER 1: 50-60% REDUCED SUBTLE ATMOSPHERIC GLOW
    // Transparent, ethereal, non-solid atmospheric haze
    // ========================================================
    const glowR = coreR * 0.75;
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (0.08 * breath) + ')');
    glowGrad.addColorStop(0.35, theme.glow.replace('0.09', '0.05').replace('0.12', '0.07'));
    glowGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.02)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ========================================================
    // LAYER 2: ELEGANT ACOUSTIC RIPPLE (Active in Listening / Speaking)
    // ========================================================
    if (isListening || isSpeaking) {
      rippleTime += isSpeaking ? 0.02 : 0.012;
      ctx.save();
      for (let rIdx = 0; rIdx < 2; rIdx++) {
        const p = (rippleTime + rIdx * 0.5) % 1;
        const currentR = coreR * (0.55 + p * 0.85);
        const alpha = (1 - p) * 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ========================================================
    // LAYER 3: BACK PARTICLES (z < 0)
    // ========================================================
    ctx.save();
    for (let i = 0; i < PARTICLES.length; i++) {
      const p = PARTICLES[i];
      p.angle += p.speed * (isThinking ? 1.8 : 1);
      const curR = coreR * p.orbitR;
      const z = Math.sin(p.angle) * Math.sin(p.tilt);

      if (z <= 0) {
        const x = cx + Math.cos(p.angle) * curR;
        const y = cy + Math.sin(p.angle) * curR * Math.cos(p.tilt) + Math.sin(now * p.floatSpeed + p.phase) * 4;
        // Strict exclusion zone: zero particles over text area
        if (Math.abs(x - cx) < fontSize * 2.3 && Math.abs(y - cy) < fontSize * 1.15) continue;
        const alpha = (0.2 + Math.sin(now * 0.0025 + p.phase) * 0.15) * 0.45;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = theme.accent;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fill();
      }
    }
    ctx.restore();

    // ========================================================
    // LAYER 4: THIN, SUBTLE ORBITAL RINGS & TELEMETRY
    // ========================================================
    ctx.save();
    ctx.translate(cx, cy);

    // 4A: Telemetry Precision Ring with Micro-Ticks
    const compassR = coreR * 1.1;
    const compassSpeed = now * (isThinking ? 0.0012 : 0.00025);
    ctx.save();
    ctx.rotate(compassSpeed);

    // Hairline Track
    ctx.beginPath();
    ctx.arc(0, 0, compassR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 36 Micro-Ticks
    const tickCount = 36;
    for (let t = 0; t < tickCount; t++) {
      const angle = (t / tickCount) * Math.PI * 2;
      const isCardinal = (t % 9 === 0);
      const len = isCardinal ? 4.5 : 2.0;
      const r1 = compassR;
      const r2 = compassR + len;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = isCardinal ? theme.accent : 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = isCardinal ? 0.9 : 0.5;
      ctx.globalAlpha = isCardinal ? 0.6 : 0.3;
      ctx.stroke();
    }
    ctx.restore();

    // 4B: Gyroscopic Quantum Orbit Ring 1 (X-Tilt 3D Ellipse)
    const gyroSpeed1 = now * (isThinking ? 0.0018 : 0.0006);
    ctx.save();
    ctx.rotate(gyroSpeed1);
    ctx.scale(1, 0.34);
    ctx.beginPath();
    ctx.arc(0, 0, coreR * 1.0, 0, Math.PI * 2);
    ctx.strokeStyle = theme.ring;
    ctx.lineWidth = 0.75;
    ctx.globalAlpha = 0.22 * breath;
    ctx.stroke();
    ctx.restore();

    // 4C: Gyroscopic Quantum Orbit Ring 2 (Y-Tilt 3D Ellipse)
    const gyroSpeed2 = -now * (isThinking ? 0.0015 : 0.0005) + 1.2;
    ctx.save();
    ctx.rotate(gyroSpeed2);
    ctx.scale(0.36, 1);
    ctx.beginPath();
    ctx.arc(0, 0, coreR * 1.06, 0, Math.PI * 2);
    ctx.strokeStyle = theme.ring;
    ctx.lineWidth = 0.65;
    ctx.globalAlpha = 0.18 * breath;
    ctx.stroke();
    ctx.restore();

    // 4D: Outer Hairline Boundary with 2 Micro-Beacons
    const outerBoundaryR = coreR * 1.25;
    ctx.beginPath();
    ctx.arc(0, 0, outerBoundaryR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.35;
    ctx.stroke();

    for (let b = 0; b < 2; b++) {
      const beaconAngle = now * 0.00035 * (b === 0 ? 1 : -1) + b * Math.PI;
      const bx = Math.cos(beaconAngle) * outerBoundaryR;
      const by = Math.sin(beaconAngle) * outerBoundaryR;

      ctx.beginPath();
      ctx.arc(bx, by, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.7;
      ctx.fill();
    }

    ctx.restore();

    // ========================================================
    // ========================================================
    // ========================================================
    // ========================================================
    // ========================================================
    // ========================================================
    // ========================================================
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

      // --- STEP 5D: BLIT TO MAIN CANVAS WITH SUBTLE GLOW & CYBERPUNK GLITCH ---
      const drawX = startX - padX;
      const drawY = cy - bufH / 2;

      // Update Glitch Timing State (triggers every ~2.4s - 4.5s for ~110ms - 190ms)
      if (now >= nextGlitchTime) {
        glitchEndTime = now + (110 + Math.random() * 80);
        nextGlitchTime = now + (2400 + Math.random() * 2100);
      }
      const isGlitching = (now < glitchEndTime);

      if (isGlitching) {
        // 1. Chromatic Aberration (Cyan & Magenta RGB Split)
        const shiftX = (Math.random() - 0.5) * 8;
        const shiftY = (Math.random() - 0.5) * 3;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Cyan channel shift
        ctx.shadowColor = 'rgba(0, 243, 255, 0.75)';
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.70;
        ctx.drawImage(textBuffer, drawX - shiftX, drawY - shiftY, bufW, bufH);

        // Magenta channel shift
        ctx.shadowColor = 'rgba(255, 0, 85, 0.75)';
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.70;
        ctx.drawImage(textBuffer, drawX + shiftX, drawY + shiftY, bufW, bufH);
        ctx.restore();

        // 2. Horizontal scanline displacement slices (2-3 random slices)
        const numSlices = 2 + Math.floor(Math.random() * 2);
        for (let s = 0; s < numSlices; s++) {
          const sliceH = Math.max(4, Math.floor(Math.random() * (bufH * 0.35)));
          const sliceY = Math.floor(Math.random() * (bufH - sliceH));
          const sliceOffset = (Math.random() - 0.5) * 12;

          ctx.save();
          ctx.beginPath();
          ctx.rect(drawX - 20, drawY + sliceY, bufW + 40, sliceH);
          ctx.clip();
          ctx.shadowColor = isThinking ? 'rgba(192, 132, 252, 0.5)' : 'rgba(56, 189, 248, 0.5)';
          ctx.shadowBlur = 8;
          ctx.drawImage(textBuffer, drawX + sliceOffset, drawY, bufW, bufH);
          ctx.restore();
        }

        // 3. Base blit with subtle micro-flicker alpha
        ctx.save();
        ctx.shadowColor = isThinking ? 'rgba(192, 132, 252, 0.35)' : 'rgba(56, 189, 248, 0.30)';
        ctx.shadowBlur = (9 + voiceAmp * 6) * breath;
        ctx.globalAlpha = 0.72 + Math.random() * 0.28;
        ctx.drawImage(textBuffer, drawX, drawY, bufW, bufH);
        ctx.restore();
      } else {
        // Pristine normal render
        ctx.shadowColor = isThinking ? 'rgba(192, 132, 252, 0.28)' : 'rgba(56, 189, 248, 0.22)';
        ctx.shadowBlur = (9 + voiceAmp * 6) * breath;
        ctx.drawImage(textBuffer, drawX, drawY, bufW, bufH);
      }
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
    ctx.restore();
// LAYER 7: FRONT PARTICLES (z > 0)
    // ========================================================
    ctx.save();
    for (let i = 0; i < PARTICLES.length; i++) {
      const p = PARTICLES[i];
      const curR = coreR * p.orbitR;
      const z = Math.sin(p.angle) * Math.sin(p.tilt);

      if (z > 0) {
        const x = cx + Math.cos(p.angle) * curR;
        const y = cy + Math.sin(p.angle) * curR * Math.cos(p.tilt) + Math.sin(now * p.floatSpeed + p.phase) * 4;
        // Strict exclusion zone: zero particles over text area
        if (Math.abs(x - cx) < fontSize * 2.3 && Math.abs(y - cy) < fontSize * 1.15) continue;
        const alpha = 0.45 + Math.sin(now * 0.0025 + p.phase) * 0.25;

        ctx.beginPath();
        ctx.arc(x, y, p.size * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = Math.min(0.85, alpha);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, p.size * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = theme.accent;
        ctx.globalAlpha = alpha * 0.25;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  requestAnimationFrame(render);
})();
