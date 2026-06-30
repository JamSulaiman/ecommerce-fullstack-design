const fs = require('fs');
const path = 'src/pages/Home.jsx';
const code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');
let brace = 0, paren = 0, divOpen = 0, divClose = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const ch of line) {
    if (ch === '{') brace++;
    else if (ch === '}') brace--;
    else if (ch === '(') paren++;
    else if (ch === ')') paren--;
  }
  divOpen += (line.match(/<div\b/g) || []).length;
  divClose += (line.match(/<\/div>/g) || []).length;
}
console.log('brace', brace, 'paren', paren, 'divOpen', divOpen, 'divClose', divClose);
for (let i = 430; i < 492; i++) {
  console.log((i+1) + ': ' + (lines[i] || ''));
}
