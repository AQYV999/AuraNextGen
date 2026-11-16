const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

const anchor = 'auraOrbCanvas';
const startTag = html.lastIndexOf('<script', html.indexOf('const canvas = document.getElementById(\'auraOrbCanvas\');'));
const endTag = html.indexOf('</script>', startTag) + 9;
const scriptTag = html.slice(startTag, endTag);
const code = scriptTag.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');

console.log('Found auraOrbCanvas script block! Length:', code.length);

function createMockCtx() {
  return {
    setTransform: () => {},
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    fillText: (txt, x, y) => {},
    strokeText: () => {},
    fillRect: (x, y, w, h) => {},
    measureText: (txt) => ({ width: txt.length * 40 }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    drawImage: (img, x, y, w, h) => {
      console.log('ctx.drawImage called! Blitting wordmark/textBuffer at:', x, y, w, h);
    },
    translate: () => {},
    rotate: () => {},
    scale: () => {}
  };
}

const mockCanvas = {
  width: 1920,
  height: 1080,
  style: {},
  getContext: () => createMockCtx()
};

let capturedRaf = null;

class MockPath2D { constructor(d) { this.d = d; } }
class MockImage {
  constructor() {
    this.src = '';
    this.complete = true;
    setTimeout(() => { if (this.onload) this.onload(); }, 0);
  }
}

const sandbox = {
  window: {
    innerWidth: 1920,
    innerHeight: 1080,
    devicePixelRatio: 1,
    addEventListener: () => {},
    matchMedia: () => ({ matches: false })
  },
  Path2D: MockPath2D,
  document: {
    documentElement: { classList: { contains: () => false, add: () => {}, remove: () => {} } },
    getElementById: (id) => {
      if (id === 'auraOrbCanvas') return mockCanvas;
      return { getAttribute: () => null, classList: { contains: () => false } };
    },
    createElement: (tag) => {
      if (tag === 'canvas') {
        return {
          width: 500,
          height: 200,
          getContext: () => createMockCtx()
        };
      }
      return {};
    },
    fonts: { load: () => Promise.resolve() },
    activeElement: null
  },
  Image: MockImage,
  requestAnimationFrame: (cb) => {
    capturedRaf = cb;
    return 1;
  },
  performance: { now: () => 1000 },
  Math,
  console
};

try {
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  console.log('Script initialized successfully!');

  if (capturedRaf) {
    console.log('Triggering frame 1...');
    capturedRaf(1016);
    console.log('Frame 1 SUCCESSFUL!');
    console.log('Triggering frame 2...');
    capturedRaf(1032);
    console.log('Frame 2 SUCCESSFUL!');
  } else {
    console.log('No RAF captured.');
  }
} catch (err) {
  console.error('RUNTIME ERROR:', err);
  process.exit(1);
}
