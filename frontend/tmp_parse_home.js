const fs = require('fs');
const path = 'src/pages/Home.jsx';
const code = fs.readFileSync(path, 'utf8');
try {
  const parser = require('@babel/parser');
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('parsed ok');
} catch (e) {
  console.error('error:', e.message);
  if (e.loc) console.error('loc:', e.loc);
  process.exit(1);
}
