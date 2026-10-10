import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1100, height: 800 }, acceptDownloads: true });
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
await p.goto('http://localhost:5173/'); await p.waitForTimeout(2500);
if (await p.$('.intro-enter')) await p.click('.intro-enter');
await p.waitForTimeout(1200);
await p.click('.rtile >> nth=2'); await p.waitForTimeout(1500);   // neotribal chrome
await p.click('.tabs >> text=Export');
await p.click('text=Priehľadné pozadie'); await p.click('.seg >> text=×2');
const [d] = await Promise.all([p.waitForEvent('download', { timeout: 90000 }), p.click('text=Uložiť PNG')]);
await d.saveAs('/tmp/t.png');
// share link round trip
const url = await p.evaluate(async () => { const m = await import('/src/share.ts'); const s = await import('/src/store.ts'); return m.shareUrl(s.getState().scene); });
console.log('link len', url.length);
await p.goto(url); await p.waitForTimeout(2500);
if (await p.$('.intro-enter')) await p.click('.intro-enter');
await p.waitForTimeout(1200);
console.log('loaded tex:', await p.textContent('.strip-name b'));
await p.screenshot({ path: '/tmp/f-share.png' });
await b.close();
