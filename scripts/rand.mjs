import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 900, height: 700 } });
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
await p.goto('http://localhost:5173/'); await p.waitForTimeout(1500);
await p.click('.tabs >> text=Farby'); await p.click('text=Náhodné farby'); await p.waitForTimeout(300);
for (let i = 0; i < 24; i++) { await p.click('button[title="Všetko náhodne"]'); await p.waitForTimeout(250); if (await p.$('.err')) console.log('ERR', await p.textContent('.err')); if (i % 8 === 7) await p.screenshot({ path: `/tmp/r${i}.png` }); }
console.log('done'); await b.close();
