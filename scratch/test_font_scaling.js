const screens = [
  { name: '1080p Desktop', w: 1920, h: 1080 },
  { name: '1440p Desktop', w: 2560, h: 1440 },
  { name: '1366 Laptop', w: 1366, h: 768 },
  { name: '1280 Desktop', w: 1280, h: 720 },
  { name: 'iPad Pro', w: 1024, h: 1366 },
  { name: 'iPad Mini', w: 768, h: 1024 },
  { name: 'iPhone 14 Pro', w: 393, h: 852 },
];

function calcOld(W, H) {
  return Math.min(W * 0.11, Math.max(52, Math.min(H * 0.13, 86)));
}

function calcNew(W, H) {
  // Monumental, commanding Hermes Agent scale
  return Math.max(58, Math.min(W * 0.155, Math.min(H * 0.19, 148)));
}

screens.forEach(s => {
  console.log(`${s.name} (${s.w}x${s.h}): Old = ${calcOld(s.w, s.h).toFixed(1)}px -> New = ${calcNew(s.w, s.h).toFixed(1)}px (+${Math.round((calcNew(s.w, s.h) / calcOld(s.w, s.h) - 1) * 100)}%)`);
});
