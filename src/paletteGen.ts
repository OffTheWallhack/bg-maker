export type Harmony = 'auto' | 'analog' | 'compl' | 'triad' | 'mono' | 'light';
export const HARMONIES: { id: Harmony; name: string }[] = [
  { id: 'auto', name: 'Auto' }, { id: 'analog', name: 'Podobné' }, { id: 'compl', name: 'Kontrast' },
  { id: 'triad', name: 'Trio' }, { id: 'mono', name: 'Jedna farba' }, { id: 'light', name: 'Svetlý papier' },
];

const r = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function hsl(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))).toString(16).padStart(2, '0');
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** bg, ink1, ink2, highlight, dirt */
export function generatePalette(mode: Harmony = 'auto'): string[] {
  const m: Harmony = mode === 'auto' ? pick<Harmony>(['analog', 'compl', 'triad', 'mono', 'compl', 'analog', 'light']) : mode;
  const h0 = r(0, 360);
  let hA = h0, hB = h0;
  if (m === 'analog') { hA = h0 + r(15, 40); hB = h0 - r(15, 40); }
  else if (m === 'compl') { hA = h0 + 180 + r(-15, 15); hB = h0 + r(-20, 20); }
  else if (m === 'triad') { hA = h0 + 120; hB = h0 + 240; }
  else if (m === 'light') { hA = h0 + r(20, 160); hB = h0 + r(-60, 60); }
  if (m === 'light') {
    return [hsl(h0 + r(-10, 10), r(10, 30), r(90, 96)), hsl(h0, r(20, 45), r(6, 14)), hsl(hA, r(70, 95), r(48, 60)), hsl(hB, r(65, 90), r(40, 55)), hsl(h0, r(8, 20), r(55, 68))];
  }
  return [
    hsl(h0 + r(-12, 12), r(15, 45), r(2.5, 8)),
    hsl(h0 + r(-20, 20), r(5, 30), r(80, 93)),
    hsl(hA, r(70, 98), r(44, 60)),
    hsl(hB, r(60, 95), r(32, 58)),
    hsl(h0, r(5, 22), r(38, 56)),
  ];
}
