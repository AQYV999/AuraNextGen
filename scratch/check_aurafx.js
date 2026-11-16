const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Find all occurrences of auraFx CSS or canvas
console.log('auraFx CSS:');
const cssIdx = html.indexOf('.aura-fx');
if (cssIdx !== -1) {
  console.log(html.slice(cssIdx - 50, cssIdx + 300));
}

// Find visual-canvas CSS
console.log('\nvisual-canvas CSS:');
const vcIdx = html.indexOf('.visual-canvas');
if (vcIdx !== -1) {
  console.log(html.slice(vcIdx - 50, vcIdx + 400));
}

// Check what auraFx is doing
console.log('\nauraFx in DOM:');
const domIdx = html.indexOf('id="auraFx"');
if (domIdx !== -1) {
  console.log(html.slice(domIdx - 200, domIdx + 500));
}
