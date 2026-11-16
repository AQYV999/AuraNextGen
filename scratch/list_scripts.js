const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = [...html.matchAll(/<script[^>]*>/gi)];
matches.forEach((m, i) => {
  const start = m.index;
  const end = html.indexOf('</script>', start);
  const snippet = html.slice(start, end).replace(/\n/g, ' ').slice(0, 100);
  console.log(`Script ${i} at ${start}..${end} (len ${end-start}): ${snippet}`);
});
