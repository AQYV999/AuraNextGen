const fs = require('fs');
const readline = require('readline');
const p = 'C:/Users/Administrator/.gemini/antigravity/brain/1967efdb-35e0-4cc7-b516-353d9b37ecb6/.system_generated/logs/transcript_full.jsonl';
const rl = readline.createInterface({ input: fs.createReadStream(p) });

rl.on('line', (line) => {
  if (line.includes('function rebuildNodes()') && line.includes('aura-cursor') && line.includes('auraOrbCanvas')) {
    const idx = line.indexOf('function rebuildNodes()');
    const endIdx = line.indexOf('const canvas = document.getElementById(\\\'auraOrbCanvas\\\');');
    if (idx !== -1 && endIdx !== -1) {
      console.log('Found full transition in transcript_full.jsonl!');
      // Parse the JSON object properly
      const obj = JSON.parse(line);
      const text = typeof obj.content === 'string' ? obj.content : JSON.stringify(obj);
      const tIdx = text.indexOf('function rebuildNodes()');
      const tEnd = text.indexOf('const canvas = document.getElementById(\'auraOrbCanvas\');');
      if (tIdx !== -1 && tEnd !== -1) {
        fs.writeFileSync('scratch/full_transition.txt', text.slice(tIdx, tEnd + 200));
        console.log('Wrote scratch/full_transition.txt successfully!');
        process.exit(0);
      }
    }
  }
});
