const fs = require('fs');
const code = fs.readFileSync('src/pages/Home.jsx', 'utf8');
const lines = code.split('\n');
const stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openMatches = line.match(/<div\b/g) || [];
  const closeMatches = line.match(/<\/div>/g) || [];
  for (let j = 0; j < openMatches.length; j++) {
    stack.push({line: i+1, text: line.trim()});
  }
  for (let j = 0; j < closeMatches.length; j++) {
    if (stack.length > 0) stack.pop();
  }
}
console.log('unclosed divs:', stack.length);
console.log(stack.slice(-5));
