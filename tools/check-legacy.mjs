// Parse-checks every legacy script (a syntax error in one block blanks the whole portal) and confirms the load list is complete.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const listSrc = fs.readFileSync(path.join(root, 'src/legacy/scripts.ts'), 'utf8');
const urls = [...listSrc.matchAll(/'(\/legacy\/[^']+)'/g)].map((m) => m[1]);
urls.push('/legacy/react-bridge.js');
let bad = 0;
for (const u of urls) {
  const file = path.join(root, 'public', u);
  if (!fs.existsSync(file)) { console.error('MISSING', u); bad++; continue; }
  try { new Function(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error('SYNTAX ERROR in', u, '-', e.message); bad++; }
}
const listed = new Set(urls.map((u) => path.basename(u)));
for (const f of fs.readdirSync(path.join(root, 'public/legacy/js'))) {
  if (!listed.has(f)) { console.error('NOT IN scripts.ts:', f); bad++; }
}
const markup = fs.readFileSync(path.join(root, 'src/legacy/markup.html'), 'utf8');
if (/<script|<style/i.test(markup)) { console.error('markup.html contains a script or style tag'); bad++; }
if (bad) { console.error(`legacy check failed (${bad})`); process.exit(1); }
console.log(`legacy check OK: ${urls.length} scripts parse, markup clean`);
