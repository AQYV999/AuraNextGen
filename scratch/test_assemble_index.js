const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const target = 'chart.umd.min.js';
const idx = html.indexOf(target);
console.log('Around chart.js:');
console.log(html.slice(idx - 150, idx + 200));

// Also check where the last script ends and </body></html> are
const lastScriptIdx = html.lastIndexOf('</script>');
console.log('\nAfter last script:');
console.log(html.slice(lastScriptIdx));
