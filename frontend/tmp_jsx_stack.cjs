const fs = require('fs');
const code = fs.readFileSync('src/pages/Home.jsx', 'utf8');
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','keygen','link','meta','param','source','track','wbr']);
const stack = [];
const regex = /<\/?([A-Za-z][A-Za-z0-9]*)\b[^>]*>/g;
let match;
while ((match = regex.exec(code)) !== null) {
  const full = match[0];
  const tag = match[1];
  const isClose = full.startsWith('</');
  const selfClose = full.endsWith('/>') || voidTags.has(tag.toLowerCase());
  const idx = code.slice(0, match.index).split('\n').length;
  if (!isClose && !selfClose) {
    stack.push({tag, line: idx, text: full});
  } else if (isClose) {
    if (stack.length === 0) {
      console.log('extra close', tag, idx, full);
      continue;
    }
    const top = stack[stack.length-1];
    if (top.tag === tag) stack.pop();
    else {
      console.log('mismatch', tag, 'expected', top.tag, 'at line', idx, full);
      stack.pop();
    }
  }
}
console.log('remaining', stack.length);
console.log(stack.slice(-5));
