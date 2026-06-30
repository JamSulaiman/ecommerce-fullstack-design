const fs = require('fs');
const code = fs.readFileSync('src/pages/Home.jsx', 'utf8');
const lines = code.split('\n');
const stack = [];
const regex = /<\/?([A-Za-z][A-Za-z0-9]*)\b[^>]*>/g;
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','keygen','link','meta','param','source','track','wbr']);
let idx = 0;
for (let lineNum = 1; lineNum <= lines.length; lineNum++) {
  const line = lines[lineNum-1];
  let match;
  regex.lastIndex = 0;
  while ((match = regex.exec(line)) !== null) {
    const full = match[0];
    const tag = match[1];
    const isClose = full.startsWith('</');
    const selfClose = full.endsWith('/>') || voidTags.has(tag.toLowerCase());
    if (!isClose && !selfClose) {
      stack.push({tag, line: lineNum, text: full});
    } else if (isClose) {
      const top = stack[stack.length-1];
      if (!top) {
        console.log('extra close', tag, 'at', lineNum, full);
      } else if (top.tag === tag) {
        stack.pop();
      } else {
        console.log('mismatch at', lineNum, full, 'top', top.tag, 'opened at', top.line);
        stack.pop();
      }
    }
  }
  if (lineNum >= 260 && lineNum <= 310) {
    const snapshot = stack.slice(-5).map(item => `${item.tag}@${item.line}`);
    console.log('line', lineNum, 'stack', snapshot.join(', '));
  }
}
console.log('remaining', stack.slice(0,10));
console.log('remaining len', stack.length);
