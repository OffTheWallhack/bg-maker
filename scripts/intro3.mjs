import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const id of ['heatwave', 'frost', 'toxic']) {
  const p = await b.newPage({ viewport: { width: 390, height: 780 } });
  p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
  await p.goto('http://localhost:5173/?intro=' + id); await p.waitForTimeout(4000);
  await p.screenshot({ path: `/tmp/in-${id}.png` });
}
await b.close();
