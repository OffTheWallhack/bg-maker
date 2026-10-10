import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [n, vp] of [['desk', { width: 1280, height: 800 }], ['phone', { width: 390, height: 800 }]]) {
  const p = await b.newPage({ viewport: vp });
  p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
  await p.goto('http://localhost:5173/');
  await p.waitForTimeout(5000);
  await p.screenshot({ path: `/tmp/ui-${n}.png` });
  for (const t of ['Farby', 'Efekty', 'Animácia']) { await p.click(`.tabs >> text=${t}`); await p.waitForTimeout(700); await p.screenshot({ path: `/tmp/ui-${n}-${t}.png` }); }
  if (n === 'desk') { await p.click('.fmtbtn'); await p.waitForTimeout(300); await p.screenshot({ path: '/tmp/ui-fmt.png' }); }
}
await b.close();
