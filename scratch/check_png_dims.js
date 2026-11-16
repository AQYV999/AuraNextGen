const fs = require('fs');
const p = 'C:/Users/Administrator/.gemini/antigravity/brain/1967efdb-35e0-4cc7-b516-353d9b37ecb6/.user_uploaded/media_1794672859518_42cbad43.png';
const buf = fs.readFileSync(p);

// PNG header: bytes 16-23 are width and height (4 bytes each, big endian)
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('PNG dimensions:', width, 'x', height);
