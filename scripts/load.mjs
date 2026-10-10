import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 390, height: 780 } });
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
for (let i = 0; i < 3; i++) { await p.goto('http://localhost:5173/'); await p.waitForTimeout(2500); if (await p.$('.intro-enter')) await p.click('.intro-enter'); await p.waitForTimeout(1200); console.log(await p.textContent('.strip-name b').catch(()=>'?') ?? '?', (await p.$('.err')) ? 'ERR' : 'ok'); }
await b.close();
