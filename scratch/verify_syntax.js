const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let i = 0;
let errors = 0;

while ((match = regex.exec(html)) !== null) {
  i++;
  const isInline = !match[0].includes('src=');
  if (isInline) {
    const code = match[1];
    try {
      new vm.Script(code);
      console.log('Script #' + i + ' syntax OK (' + code.length + ' chars)');
    } catch (e) {
      console.error('Script #' + i + ' SYNTAX ERROR:', e.message);
      errors++;
    }
  }
}

console.log('Total scripts verified: ' + i + ', Errors: ' + errors);
if (errors > 0) process.exit(1);
