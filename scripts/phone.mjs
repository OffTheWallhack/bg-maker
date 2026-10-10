import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [n, vp] of [['a', { width: 390, height: 844 }], ['b', { width: 375, height: 667 }]]) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(2500);
  if (await p.$('.intro-enter')) await p.click('.intro-enter');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `/tmp/p-${n}-1.png` });
  await p.click('.tabs >> text=Efekty'); await p.waitForTimeout(500);
  await p.screenshot({ path: `/tmp/p-${n}-2.png` });
  const m = await p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), Math.round(b.height)]; }; return { vh: innerHeight, doc: document.documentElement.scrollHeight, top: r('.top'), stage: r('.stage'), strip: r('.strip'), panel: r('.panel'), tabs: r('.tabs'), body: r('.body') }; });
  console.log(n, JSON.stringify(m));
}
await b.close();
