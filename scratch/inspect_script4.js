const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match, i = 0;
while ((match = regex.exec(html)) !== null) {
  i++;
  if (i === 4) {
    const lines = match[1].split('\n');
    console.log('Script 4 lines 1..50:');
    console.log(lines.slice(0, 50).map((l, idx) => (idx + 1) + ': ' + l).join('\n'));
  }
}
