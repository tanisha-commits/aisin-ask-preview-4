// Scopes a preview stylesheet under a wrapper class so Preview 1 and Preview 2 CSS can coexist unchanged.
// usage: node tools/scope-css.js <scope> <keepDocLevel:0|1> <out.css> <in.css>...
const postcss = require('postcss'); const fs = require('fs');
const [scope, keepDoc, out, ...inputs] = process.argv.slice(2);
const S = '.' + scope; const DOC = new Set(['menu-open', 'is-loading', 'motion-ready', 'has-motion', 'hero-ready']);
function splitFirst(sel) { // returns [firstCompound, combinator, rest]
  let depth = 0;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (c === '(' || c === '[') depth++; else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && /[\s>+~]/.test(c)) {
      let j = i; while (j < sel.length && /[\s>+~]/.test(sel[j])) j++;
      const comb = sel.slice(i, j).trim();
      return [sel.slice(0, i), comb ? comb : ' ', sel.slice(j)];
    }
  }
  return [sel, '', ''];
}
function isDoc(first) {
  if (/^(html|body|:root|main)(?![\w-])/.test(first)) return true;
  const m = first.match(/^((?:\.[\w-]+)+)/); if (!m || m[1] !== first.replace(/:.*/, '')) return false;
  return m[1].split('.').filter(Boolean).every(c => DOC.has(c));
}
function mapSel(sel) {
  sel = sel.trim();
  if (/^(html|body|:root)$/.test(sel)) return S;
  const [first, comb, rest] = splitFirst(sel);
  if (isDoc(first)) {
    if (!rest) return keepDoc === '1' ? sel : null; // doc-level-only rules (body.menu-open, html.x) belong to the page owner
    return `${first} ${S}${comb === ' ' ? ' ' : comb}${rest}`;
  }
  return `${S} ${sel}`;
}
let css = '';
for (const f of inputs) {
  const root = postcss.parse(fs.readFileSync(f, 'utf8'), { from: f });
  root.walkRules(r => {
    if (r.parent.type === 'atrule' && /keyframes/i.test(r.parent.name)) return;
    const sels = r.selectors.map(mapSel).filter(Boolean);
    if (!sels.length) r.remove(); else r.selectors = [...new Set(sels)];
  });
  css += `/* ===== ${f.replace(/^.*src\//, 'src/')} scoped to ${S} ===== */\n` + root.toString() + '\n';
}
fs.writeFileSync(out, css);
console.log(out, css.length);
