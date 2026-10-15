import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, acceptDownloads: true });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && console.log('[' + m.type() + ']', m.text().slice(0, 300)));
await p.goto('http://localhost:5173/'); await p.waitForTimeout(3000);
await p.screenshot({ path: '/tmp/au-intro.png' });
await p.click('.intro-enter'); await p.waitForTimeout(1500);
for (const t of ['Textúra', 'Farby', 'Efekty', 'Animácia', 'Export']) {
  await p.click(`.tabs >> text=${t}`); await p.waitForTimeout(600);
  await p.screenshot({ path: `/tmp/au-${t}.png` });
}
console.log('VideoEncoder:', await p.evaluate(async () => 'VideoEncoder' in window ? (await VideoEncoder.isConfigSupported({ codec: 'avc1.640034', width: 1080, height: 1920, bitrate: 3e7, framerate: 30 })).supported : 'none'));
// short loop for the test
await p.evaluate(async () => { const s = await import('/src/store.ts'); s.setAnim('loop', 2); });
await p.waitForTimeout(300);
const t0 = Date.now();
const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 240000 }), p.click('text=Uložiť video slučku')]);
await dl.saveAs('/tmp/v.out'); console.log('video', dl.suggestedFilename(), 'ms', Date.now() - t0);
await b.close();
