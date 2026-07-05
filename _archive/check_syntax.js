const fs = require('fs');
const acorn = require('acorn');
const html = fs.readFileSync('/Volumes/PortableSSD/tomua-map-travel/client/admin.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1];
  try {
    acorn.parse(code, { ecmaVersion: 2022 });
  } catch (e) {
    const errorLineInScript = e.loc.line;
    const scriptStartLine = html.substr(0, match.index).split('\n').length;
    console.log('Error at HTML line:', scriptStartLine + errorLineInScript - 1);
    console.log('Message:', e.message);
    
    const lines = html.split('\n');
    const start = Math.max(0, scriptStartLine + errorLineInScript - 6);
    const end = Math.min(lines.length, scriptStartLine + errorLineInScript + 4);
    console.log('Snippet:');
    for (let i = start; i < end; i++) {
      console.log((i+1) + ':', lines[i]);
    }
  }
}
