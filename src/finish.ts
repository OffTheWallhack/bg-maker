import type { Param } from './types';

const R = (id: string, label: string, min: number, max: number, def: number, step = 1, group?: string): Param => ({ type: 'range', id, label, min, max, step, default: def, group });

/** Dirt / finish layer. Uniform names are u_f_<id>. Amount sliders are 0–100. */
export const FINISH_GROUPS: { name: string; params: Param[] }[] = [
  { name: 'Zrno', params: [R('grain', 'Filmové zrno', 0, 100, 22), R('grainSize', 'Veľkosť zrna', 0.5, 5, 1.4, 0.1)] },
  { name: 'Špina', params: [R('dust', 'Prach a škrabance', 0, 100, 0), R('hairs', 'Vlasy', 0, 100, 0), R('paper', 'Papierová štruktúra', 0, 100, 0)] },
  { name: 'Xerox / tlač', params: [R('toner', 'Xerox toner', 0, 100, 0), R('streaks', 'Pruhy kopírky', 0, 100, 0), R('bleed', 'Presiaknutie farby', 0, 100, 0)] },
  {
    name: 'Registrácia',
    params: [R('misX', 'Posun farieb X', -20, 20, 0, 0.5), R('misY', 'Posun farieb Y', -20, 20, 0, 0.5), R('ca', 'Chromatická aberácia', 0, 100, 0)],
  },
  { name: 'Okraje', params: [R('vignette', 'Vignetácia', 0, 100, 25), R('edge', 'Prepálené okraje', 0, 100, 0)] },
  {
    name: 'Light leak',
    params: [
      R('leak', 'Light leak', 0, 100, 0),
      R('leakX', 'Pozícia X', 0, 100, 85),
      R('leakY', 'Pozícia Y', 0, 100, 25),
      R('leakSize', 'Veľkosť', 10, 100, 55),
      { type: 'color', id: 'leakColor', label: 'Farba', default: '#ff6a3d' },
    ],
  },
  {
    name: 'Viac farieb',
    params: [
      R('multi', 'Farebná variácia', 0, 100, 0),
      R('multiScale', 'Mierka farieb', 0.3, 4, 1, 0.1),
      { type: 'select', id: 'multiMode', label: 'Režim', options: ['Odtieň', 'Paleta', 'Dúha'], default: 1 },
    ],
  },
  { name: 'Obraz', params: [R('scan', 'Scan lines', 0, 100, 0), R('scanSize', 'Hrúbka riadkov', 1, 10, 3, 0.5), R('jpeg', 'JPEG crush', 0, 100, 0), R('blur', 'Rozostrenie', 0, 100, 0), R('glow', 'Žiara (glow)', 0, 100, 0)] },
  {
    name: 'Pokojná zóna (logo / text)',
    params: [
      R('calm', 'Sila', 0, 100, 0),
      { type: 'select', id: 'calmPos', label: 'Pozícia', options: ['Hore', 'Stred', 'Dole'], default: 1 },
      R('calmSize', 'Výška pásu', 10, 60, 28),
    ],
  },
];

export const FINISH_PARAMS: Param[] = FINISH_GROUPS.flatMap((g) => g.params);
