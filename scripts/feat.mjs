import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1100, height: 800 }, acceptDownloads: true });
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
await p.goto('http://localhost:5173/'); await p.waitForTimeout(2500);
if (await p.$('.intro-enter')) await p.click('.intro-enter');
await p.waitForTimeout(1500);
// recipe
await p.click('.rtile >> nth=3'); await p.waitForTimeout(1500);
await p.screenshot({ path: '/tmp/f-recipe.png' });
// layer on
await p.click('.fx-h:has-text("Vrstva 2")'); await p.waitForTimeout(1200);
// photo
await p.setInputFiles('input[type=file][accept="image/*"]', '/tmp/photo-test.png'); await p.waitForTimeout(2000);
await p.screenshot({ path: '/tmp/f-photo.png' });
console.log('err:', await p.$('.err') ? await p.textContent('.err') : 'none');
// export set
await p.click('.tabs >> text=Export'); await p.waitForTimeout(400);
const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('text=Uložiť sadu')]);
console.log('set:', dl.suggestedFilename());
await dl.saveAs('/tmp/set.zip');
const [d2] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('text=Uložiť PNG')]);
await d2.saveAs('/tmp/one.png'); console.log('png', d2.suggestedFilename());
await b.close();
