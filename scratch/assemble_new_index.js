const fs = require('fs');

const originalHtml = fs.readFileSync('index.html', 'utf8');

// 1. Get head up to <style>
const headStart = originalHtml.slice(0, originalHtml.indexOf('<style>')).trim();

// 2. Get body between </style> and chart.js
const styleEndStr = '</style>';
const bodyStartIdx = originalHtml.indexOf(styleEndStr) + styleEndStr.length;
const scriptChartStr = '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1';
const bodyEndIdx = originalHtml.indexOf(scriptChartStr);
const bodyHtml = originalHtml.slice(bodyStartIdx, bodyEndIdx).trim();

// 3. Assemble new clean modular index.html
const newIndexHtml = `<!DOCTYPE html>
<html lang="id">
<head>
${headStart.replace('<!DOCTYPE html>', '').replace('<html lang="id">', '').replace('<head>', '').trim()}

  <!-- ============================================================
       AURA NEXT GEN: MODULAR STYLESHEETS
       ============================================================ -->
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/modals.css">
</head>

${bodyHtml}

  <!-- ============================================================
       THIRD-PARTY CDN LIBRARIES
       ============================================================ -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <!-- ============================================================
       AURA NEXT GEN: MODULAR JAVASCRIPT CONTROLLERS
       ============================================================ -->
  <script src="js/config.js"></script>
  <script src="js/face-tracking.js"></script>
  <script src="js/ai-chat.js"></script>
  <script src="js/trend-chart.js"></script>
  <script src="js/api-key-modal.js"></script>
  <script src="js/notepad-goals.js"></script>
  <script src="js/reminders.js"></script>
  <script src="js/chat-history.js"></script>
  <script src="js/weather.js"></script>
  <script src="js/apps-launcher.js"></script>
  <script src="js/acc-hardware.js"></script>
  <script src="js/gallery.js"></script>
  <script src="js/app.js"></script>
  <script src="js/canvas-aura.js"></script>

</body>
</html>
`;

fs.writeFileSync('index.html', newIndexHtml);
console.log('Successfully wrote new modular index.html!');
console.log('New line count:', newIndexHtml.split('\n').length);
