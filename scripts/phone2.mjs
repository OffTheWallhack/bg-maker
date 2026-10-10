import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [n, vp] of [['a', { width: 390, height: 844 }], ['b', { width: 375, height: 667 }], ['c', { width: 360, height: 740 }]]) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(2500);
  if (await p.$('.intro-enter')) await p.click('.intro-enter');
  await p.waitForTimeout(1200);
  for (const t of ['Textúra', 'Farby', 'Efekty', 'Animácia', 'Export']) {
    await p.click(`.tabs >> text=${t}`); await p.waitForTimeout(400);
    const m = await p.evaluate(() => { const bd = document.querySelector('.body'); const top = document.querySelector('.top').getBoundingClientRect(); const tools = document.querySelector('.tools').getBoundingClientRect(); return { sw: document.documentElement.scrollWidth, iw: innerWidth, bodyOverflowX: bd.scrollWidth > bd.clientWidth, toolsRight: Math.round(tools.right), bodyH: Math.round(bd.clientHeight) }; });
    console.log(n, t, JSON.stringify(m));
  }
  await p.click('.tabs >> text=Textúra'); await p.waitForTimeout(300);
  await p.screenshot({ path: `/tmp/q-${n}.png` });
  await p.click('.handle'); await p.waitForTimeout(200); await p.click('.handle'); await p.waitForTimeout(400);
  await p.screenshot({ path: `/tmp/q-${n}-peek.png` });
  await p.click('.handle'); await p.waitForTimeout(200); await p.click('.handle'); await p.waitForTimeout(200);
}
await b.close();
