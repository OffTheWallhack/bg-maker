import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [n, vp] of [['desk', { width: 1280, height: 800 }], ['phone', { width: 390, height: 780 }]]) {
  const p = await b.newPage({ viewport: vp });
  p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
  p.on('console', (m) => m.type() === 'error' && console.log('[err]', m.text().slice(0, 300)));
  await p.goto('http://localhost:5173/');
  await p.waitForTimeout(4000);
  await p.screenshot({ path: `/tmp/ui-${n}.png` });
  if (n === 'desk') { await p.click('text=Export'); await p.waitForTimeout(500); await p.screenshot({ path: '/tmp/ui-exp.png' }); }
}
await b.close();
