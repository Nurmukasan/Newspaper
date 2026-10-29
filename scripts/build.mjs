import { readFileSync, existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'style.css'), 'utf8');
const refs = [
  ...[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1]),
  ...[...css.matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/g)].map(m => m[1] ?? m[2] ?? m[3]),
].filter(p => !p.startsWith('data:') && !/^https?:/.test(p));
const missing = [...new Set(refs)].filter(p => !existsSync(join(root, p)));
if (missing.length) throw new Error('Missing published assets:\n' + missing.join('\n'));
if (!html.includes('Все события и цитаты вымышлены')) throw new Error('Missing fiction notice');
if (!html.includes('lang="ru"')) throw new Error('Missing document language');
console.log(`Validated ${new Set(refs).size} local assets, Russian document language and fiction notice.`);
if (!process.argv.includes('--check')) {
  const out = join(root, 'dist');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const file of ['index.html', 'style.css', 'app.js', 'assets']) cpSync(join(root, file), join(out, file), { recursive: true });
  console.log('Built static GitHub Pages artifact in dist/. No external runtime dependencies.');
}
