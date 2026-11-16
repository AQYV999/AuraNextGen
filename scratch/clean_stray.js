const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const badSnippet = `  // Pre-load web fonts into canvas memory
  if (document.fonts) {
    document.fonts.load('400 156px "Instrument Serif"').catch(() => {});
    document.fonts.load('500 12px "Space Grotesk"').catch(() => {});
  });
    document.fonts.load('800 156px "Cinzel"').catch(() => {});
  }`;

const goodSnippet = `  // Pre-load web fonts into canvas memory
  if (document.fonts) {
    document.fonts.load('400 156px "Instrument Serif"').catch(() => {});
    document.fonts.load('500 12px "Space Grotesk"').catch(() => {});
  }`;

if (html.includes(badSnippet)) {
  html = html.replace(badSnippet, goodSnippet);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Cleaned up bad snippet successfully!');
} else {
  console.log('Snippet not exact match, using regex...');
  const rgx = /\/\/ Pre-load web fonts into canvas memory[\s\S]*?document\.fonts\.load\('800 156px "Cinzel"'\)\.catch\(\(\) => \{\}\);\s*\}/;
  if (rgx.test(html)) {
    html = html.replace(rgx, goodSnippet);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Cleaned up via regex!');
  } else {
    console.log('Could not find via regex either!');
  }
}
