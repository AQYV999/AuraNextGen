const fs = require('fs');
const readline = require('readline');
const p = 'C:/Users/Administrator/.gemini/antigravity/brain/1967efdb-35e0-4cc7-b516-353d9b37ecb6/.system_generated/logs/transcript_full.jsonl';
const rl = readline.createInterface({ input: fs.createReadStream(p) });
let count = 0;

rl.on('line', (line) => {
  count++;
  if (count === 1347) {
    const obj = JSON.parse(line);
    const content = obj.content || '';
    fs.writeFileSync('scratch/full_line1347.txt', content);
    console.log('Saved full_line1347.txt, length:', content.length);
    process.exit(0);
  }
});
