import { createRequire } from 'node:module';
import { mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR ?? '/node_modules/playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'design', 'mockups');
const shots = join(root, 'screenshots');
mkdirSync(shots, { recursive: true });

const screens = readdirSync(root).filter((f) => /^0\d-.*\.html$/.test(f));
const SHOT = [[390, 844, 'mobile'], [1440, 900, 'desktop']];
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];

const inspect = () => {
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; };
  const small = [...document.querySelectorAll('button, a.btn, input:not([type="radio"]), select, summary')]
    .filter(visible).map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width < 43.5 || r.height < 43.5)
    .map(({ el, r }) => `${el.tagName.toLowerCase()}:${(el.getAttribute('aria-label') || el.textContent).trim().slice(0, 20)} ${Math.round(r.width)}x${Math.round(r.height)}`);
  const long = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent.trim();
    if (t && n.parentElement.closest('svg, style, script') === null && visible(n.parentElement) && t.length >= 20) long.push(t);
  }
  document.querySelectorAll('[aria-label]').forEach((el) => { if (visible(el) && el.getAttribute('aria-label').length >= 20) long.push(el.getAttribute('aria-label')); });
  const overflow = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
  return { overflow, small, long };
};

const browser = await chromium.launch();
const report = [];
for (const file of screens) {
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w >= 960 ? 900 : 844 } });
    const p = await ctx.newPage();
    await p.goto(`file://${join(root, file)}`);
    const r = await p.evaluate(inspect);
    report.push({ file, width: w, ...r });
    const kind = SHOT.find(([sw]) => sw === w);
    if (kind) await p.screenshot({ path: join(shots, `${file.replace('.html', '')}-${kind[2]}.png`), fullPage: file !== '01-planet.html' && !/0[2-4]/.test(file.slice(0, 2)) });
    await ctx.close();
  }
}
await browser.close();

let bad = 0;
for (const r of report) {
  const issues = [];
  if (r.overflow > 0) issues.push(`overflow ${r.overflow}px`);
  if (r.small.length) issues.push(`small targets: ${r.small.join('; ')}`);
  if (r.long.length) issues.push(`long text: ${r.long.join(' | ')}`);
  if (issues.length) { bad++; console.log(`${r.file} @${r.width}: ${issues.join(' / ')}`); }
}
console.log(`${report.length} checks, ${bad} with issues`);
process.exit(bad ? 1 : 0);
