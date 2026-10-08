// usage: node scripts/sheet.mjs out.png [query]   (dev server must run on :5173)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [out = 'sheet.png', query = ''] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 800, height: 600 } });
p.on('console', (m) => console.log('[page]', m.text().slice(0, 400)));
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 400)));
await p.goto('http://localhost:5173/dev/sheet.html?' + query);
await p.waitForFunction(() => window.__result, null, { timeout: 280000 });
const res = await p.evaluate(() => window.__result);
console.log(JSON.stringify({ ms: Math.round(res.ms), count: res.count, errors: res.errors }, null, 1));
await (await p.$('#sheet')).screenshot({ path: out });
await b.close();
