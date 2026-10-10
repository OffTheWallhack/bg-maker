import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 390, height: 780 } });
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
await p.goto('http://localhost:5173/'); await p.waitForTimeout(3500);
await p.screenshot({ path: '/tmp/intro.png' });
await p.click('.intro-enter'); await p.waitForTimeout(1500);
console.log('intro gone:', !(await p.$('.intro')));
await b.close();
