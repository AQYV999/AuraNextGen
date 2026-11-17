const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Starting Aura Next Gen codebase modularization...');

const html = fs.readFileSync('index.html', 'utf8');

// Ensure directories exist
fs.mkdirSync('css', { recursive: true });
fs.mkdirSync('js', { recursive: true });

// 1. EXTRACT CSS
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
if (!styleMatch) {
  console.error('ERROR: Could not find <style> block');
  process.exit(1);
}
const fullCss = styleMatch[1];

// Let's divide CSS:
// Find boundary markers in fullCss
const idxWidgetsColumn = fullCss.indexOf('AURA NEXT GEN: 3-TIER WIDGETS COLUMN');
const idxNotepadStyles = fullCss.indexOf('AURA NEXT GEN: NOTEPAD & GOALS STYLES');
const idxLockStyles = fullCss.indexOf('LOCK SCREEN (REVAMPED)');

// We can split CSS cleanly:
// css/base.css: from start up to before LAYER 2 (UI MENGAMBANG) + Lock Screen styles
// Or even simpler and cleaner:
// css/base.css: Reset, Layer 1 face styles, fonts, lock screen, visual mode switcher, custom cursor
// css/layout.css: Layer 2 floating UI, top status capsule, bottom dock, top right drawer, chat log & bar, 3-tier widgets column, responsive media queries
// css/modals.css: Notepad, Reminders, Chat History, Weather Radar, Apps Launcher, ACC Control Center, Cloud Gallery & Lightbox, Guide Modal, Trend Modal, API Key Modal

// Let's write the CSS files cleanly!
fs.writeFileSync('css/base.css', `/* ============================================================
   AURA NEXT GEN: BASE STYLES & CORE VISUAL LAYERS
   ============================================================ */
` + fullCss.slice(0, fullCss.indexOf('/* ============ LAYER 2 — UI MENGAMBANG DI ATASNYA ============ */'))
);

const idxLayer2 = fullCss.indexOf('/* ============ LAYER 2 — UI MENGAMBANG DI ATASNYA ============ */');
const idxModalsStart = fullCss.indexOf('/* ============================================================\n     AURA NEXT GEN: NOTEPAD & GOALS STYLES');

fs.writeFileSync('css/layout.css', `/* ============================================================
   AURA NEXT GEN: LAYOUT, FLOATING UI & WIDGET CARDS
   ============================================================ */
` + fullCss.slice(idxLayer2, idxModalsStart));

fs.writeFileSync('css/modals.css', `/* ============================================================
   AURA NEXT GEN: MODALS & POPUP PANELS
   ============================================================ */
` + fullCss.slice(idxModalsStart));

console.log('CSS split complete: css/base.css, css/layout.css, css/modals.css');

// 2. EXTRACT JAVASCRIPT
// Extract Script 3 and Script 4
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const scripts = [];
let m;
while ((m = scriptRegex.exec(html)) !== null) {
  scripts.push(m[1]);
}
// scripts[0]: inline head perf script
// scripts[1]: external chart.js
// scripts[2]: main script 3
// scripts[3]: canvas script 4

const script3 = scripts[2];
const script4 = scripts[3];

// Save script 4 as js/canvas-aura.js
fs.writeFileSync('js/canvas-aura.js', `/* ============================================================
   AURA NEXT GEN: CANVAS PARTICLE & GLITCH TYPOGRAPHY ENGINE
   ============================================================ */
${script4.trim()}
`);

console.log('Extracted js/canvas-aura.js');

// Now let's split script3 into modules:
// We can find exact comment markers
const markers = {
  config: 0,
  faceTracking: script3.indexOf('/* ===== FACE TRACKING: wajah menoleh ke arah kursor / sentuhan ====='),
  aiChat: script3.indexOf('/* ===== LOCAL AI LANGSUNG (browser -> Ollama) ====='),
  trendChart: script3.indexOf('// ============ TREN HISTORI (Chart.js) ============'),
  apiKeyModal: script3.indexOf('/* ============================================================\n   AURA NEXT GEN: API KEY MODAL CONTROLLER'),
  notepadGoals: script3.indexOf('/* ============================================================\n   AURA NEXT GEN: NOTEPAD & GOALS CONTROLLER'),
  reminders: script3.indexOf('/* ============================================================\n   AURA NEXT GEN: NOTIFICATION & REMINDER SCHEDULER'),
  chatHistory: script3.indexOf('/* ============================================================\n   AURA NEXT GEN: CHAT HISTORY ARCHIVE CONTROLLER'),
  weather: script3.indexOf('/* ============================================================\n   AURA NEXT GEN: ADVANCED WEATHER RADAR & DASHBOARD'),
  appsLauncher: script3.indexOf('/* ============================================================\n   AURA NEXT GEN: AUTO BUKA APLIKASI & QUICK APPS LAUNCHER'),
  accHardware: script3.indexOf('/* ============================================================\n   AURA NEXT GEN: ACC (AURA CONTROL CENTER) CONTROLLER'),
  gallery: script3.indexOf('/* ============================================================\n   AURA NEXT GEN: CLOUD PHOTO STORAGE & GALLERY CONTROLLER'),
  app: script3.indexOf('/* ============================================================\n   DRAWER PANEL — hanya jalan di HP (<= 768px)')
};

console.log('Marker positions:', markers);

// Let's verify all markers were found
for (const [k, v] of Object.entries(markers)) {
  if (v === -1) {
    console.error(`ERROR: Marker ${k} not found!`);
    process.exit(1);
  }
}

// 1. js/config.js: from 0 to faceTracking
fs.writeFileSync('js/config.js', `/* ============================================================
   AURA NEXT GEN: CONFIG & GLOBAL UTILITIES
   ============================================================ */
${script3.slice(0, markers.faceTracking).trim()}
`);

// 2. js/face-tracking.js: from faceTracking to aiChat
fs.writeFileSync('js/face-tracking.js', `/* ============================================================
   AURA NEXT GEN: FACE TRACKING & MICRO-EXPRESSIONS
   ============================================================ */
${script3.slice(markers.faceTracking, markers.aiChat).trim()}
`);

// 3. js/ai-chat.js: from aiChat to trendChart
fs.writeFileSync('js/ai-chat.js', `/* ============================================================
   AURA NEXT GEN: AI ENGINE (GEMINI, OLLAMA, TTS & CHAT ORCHESTRATOR)
   ============================================================ */
${script3.slice(markers.aiChat, markers.trendChart).trim()}
`);

// 4. js/trend-chart.js: from trendChart to apiKeyModal
fs.writeFileSync('js/trend-chart.js', `/* ============================================================
   AURA NEXT GEN: 24H TREND CHART (CHART.JS)
   ============================================================ */
${script3.slice(markers.trendChart, markers.apiKeyModal).trim()}
`);

// 5. js/api-key-modal.js: from apiKeyModal to notepadGoals
fs.writeFileSync('js/api-key-modal.js', `/* ============================================================
   AURA NEXT GEN: API KEY MODAL CONTROLLER
   ============================================================ */
${script3.slice(markers.apiKeyModal, markers.notepadGoals).trim()}
`);

// 6. js/notepad-goals.js: from notepadGoals to reminders
fs.writeFileSync('js/notepad-goals.js', `/* ============================================================
   AURA NEXT GEN: NOTEPAD & GOALS CONTROLLER
   ============================================================ */
${script3.slice(markers.notepadGoals, markers.reminders).trim()}
`);

// 7. js/reminders.js: from reminders to chatHistory
fs.writeFileSync('js/reminders.js', `/* ============================================================
   AURA NEXT GEN: NOTIFICATION & REMINDER SCHEDULER
   ============================================================ */
${script3.slice(markers.reminders, markers.chatHistory).trim()}
`);

// 8. js/chat-history.js: from chatHistory to weather
fs.writeFileSync('js/chat-history.js', `/* ============================================================
   AURA NEXT GEN: CHAT HISTORY ARCHIVE CONTROLLER
   ============================================================ */
${script3.slice(markers.chatHistory, markers.weather).trim()}
`);

// 9. js/weather.js: from weather to appsLauncher
fs.writeFileSync('js/weather.js', `/* ============================================================
   AURA NEXT GEN: WEATHER RADAR & FORECAST (OPEN-METEO)
   ============================================================ */
${script3.slice(markers.weather, markers.appsLauncher).trim()}
`);

// 10. js/apps-launcher.js: from appsLauncher to app
// Note: between appsLauncher and app is the apps launcher code!
fs.writeFileSync('js/apps-launcher.js', `/* ============================================================
   AURA NEXT GEN: QUICK APPS LAUNCHER & DEEP LINKING
   ============================================================ */
${script3.slice(markers.appsLauncher, markers.app).trim()}
`);

// 11. js/app.js: from app to accHardware
// Contains: Drawer, Graphics mode, Local AI guide, AURA FX, Ambient environment, Custom cursor, Lock screen!
fs.writeFileSync('js/app.js', `/* ============================================================
   AURA NEXT GEN: APP CONTROLLER, LOCK SCREEN & ENVIRONMENT
   ============================================================ */
${script3.slice(markers.app, markers.accHardware).trim()}
`);

// 12. js/acc-hardware.js: from accHardware to gallery
fs.writeFileSync('js/acc-hardware.js', `/* ============================================================
   AURA NEXT GEN: ACC (AURA CONTROL CENTER) CONTROLLER
   ============================================================ */
${script3.slice(markers.accHardware, markers.gallery).trim()}
`);

// 13. js/gallery.js: from gallery to end of script3
fs.writeFileSync('js/gallery.js', `/* ============================================================
   AURA NEXT GEN: CLOUD PHOTO STORAGE & GALLERY CONTROLLER
   ============================================================ */
${script3.slice(markers.gallery).trim()}
`);

console.log('JavaScript extraction complete!');

// 3. SYNTAX VERIFICATION ON ALL NEW JS FILES
const jsFiles = [
  'js/config.js',
  'js/face-tracking.js',
  'js/ai-chat.js',
  'js/trend-chart.js',
  'js/api-key-modal.js',
  'js/notepad-goals.js',
  'js/reminders.js',
  'js/chat-history.js',
  'js/weather.js',
  'js/apps-launcher.js',
  'js/acc-hardware.js',
  'js/gallery.js',
  'js/app.js',
  'js/canvas-aura.js'
];

let allOk = true;
for (const file of jsFiles) {
  const code = fs.readFileSync(file, 'utf8');
  try {
    new vm.Script(code);
    console.log(`[PASS] ${file} (${code.length} chars)`);
  } catch (err) {
    console.error(`[FAIL] ${file}: ${err.message}`);
    allOk = false;
  }
}

if (!allOk) {
  console.error('Syntax verification failed on some files!');
  process.exit(1);
}

console.log('ALL JS FILES PASSED SYNTAX CHECK!');
