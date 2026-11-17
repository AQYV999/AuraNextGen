const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let m, count = 0;
while ((m = scriptRegex.exec(html)) !== null) {
  count++;
  const isExternal = m[0].includes('src=');
  const head = m[1].slice(0, 150).replace(/\s+/g, ' ').trim();
  console.log(`Script ${count} ${isExternal ? '[EXTERNAL]' : '[INLINE]'} (${m[1].length} chars): ${head}`);
}
