const fs = require('fs');
const code = fs.readFileSync('src/pages/Home.jsx', 'utf8');
const lines = code.split('\n');
let count = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div\b/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  count += opens - closes;
  if (opens || closes) {
    console.log(`${i+1}: ${line.trim()}  | open ${opens} close ${closes} => count ${count}`);
  }
}
console.log('final count', count);
