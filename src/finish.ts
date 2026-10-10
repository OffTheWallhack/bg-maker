import type { Param } from './types';

const R = (id: string, label: string, min: number, max: number, def: number, step = 1): Param => ({ type: 'range', id, label, min, max, step, default: def });
const S = (id: string, label: string, options: string[], def = 0): Param => ({ type: 'select', id, label, options, default: def });
const C = (id: string, label: string, def: string): Param => ({ type: 'color', id, label, default: def });

export interface Effect {
  id: string;
  name: string;
  section: string;
  /** switched on by default */
  on: boolean;
  /** params forced to 0 when the effect is off */
  zero: string[];
  params: Param[];
}

export const SECTIONS = ['Zrno a špina', 'Tlač a kopírka', 'Svetlo a okraje', 'Farba', 'Deformácia a obraz'];

/** Every effect has an on/off switch; uniform names are u_f_<param id>. */
export const EFFECTS: Effect[] = [
  { id: 'grain', name: 'Filmové zrno', section: SECTIONS[0], on: true, zero: ['grain'], params: [R('grain', 'Sila', 0, 100, 22), R('grainSize', 'Veľkosť zrna', 0.5, 5, 1.4, 0.1)] },
  { id: 'dust', name: 'Prach a škrabance', section: SECTIONS[0], on: false, zero: ['dust'], params: [R('dust', 'Sila', 0, 100, 45)] },
  { id: 'hairs', name: 'Vlasy a vlákna', section: SECTIONS[0], on: false, zero: ['hairs'], params: [R('hairs', 'Sila', 0, 100, 45)] },
  { id: 'paper', name: 'Štruktúra papiera', section: SECTIONS[0], on: false, zero: ['paper'], params: [R('paper', 'Sila', 0, 100, 55)] },

  { id: 'toner', name: 'Xerox toner', section: SECTIONS[1], on: false, zero: ['toner'], params: [R('toner', 'Sila', 0, 100, 45)] },
  { id: 'streaks', name: 'Pruhy kopírky', section: SECTIONS[1], on: false, zero: ['streaks'], params: [R('streaks', 'Sila', 0, 100, 45)] },
  { id: 'bleed', name: 'Presiaknutie farby', section: SECTIONS[1], on: false, zero: ['bleed'], params: [R('bleed', 'Sila', 0, 100, 40)] },
  { id: 'misreg', name: 'Posun farieb (misregistrácia)', section: SECTIONS[1], on: false, zero: ['misX', 'misY'], params: [R('misX', 'Posun X', -20, 20, 5, 0.5), R('misY', 'Posun Y', -20, 20, 2, 0.5)] },
  { id: 'jpeg', name: 'JPEG crush', section: SECTIONS[1], on: false, zero: ['jpeg'], params: [R('jpeg', 'Sila', 0, 100, 30)] },

  { id: 'vignette', name: 'Vignetácia', section: SECTIONS[2], on: true, zero: ['vignette'], params: [R('vignette', 'Sila', 0, 100, 25)] },
  { id: 'edge', name: 'Prepálené okraje', section: SECTIONS[2], on: false, zero: ['edge'], params: [R('edge', 'Sila', 0, 100, 45)] },
  {
    id: 'leak', name: 'Light leak', section: SECTIONS[2], on: false, zero: ['leak'],
    params: [R('leak', 'Sila', 0, 100, 55), R('leakX', 'Pozícia X', 0, 100, 85), R('leakY', 'Pozícia Y', 0, 100, 25), R('leakSize', 'Veľkosť', 10, 100, 55), C('leakColor', 'Farba', '#ff6a3d')],
  },
  { id: 'glow', name: 'Žiara (glow)', section: SECTIONS[2], on: false, zero: ['glow'], params: [R('glow', 'Sila', 0, 100, 35)] },
  { id: 'tone', name: 'Farebné tiene a svetlá', section: SECTIONS[2], on: false, zero: ['tone'], params: [R('tone', 'Sila', 0, 100, 50), C('toneShadow', 'Farba tieňov', '#1c2a6b'), C('toneHigh', 'Farba svetiel', '#ffb36b')] },
  { id: 'calm', name: 'Pokojná zóna (logo / text)', section: SECTIONS[2], on: false, zero: ['calm'], params: [R('calm', 'Sila', 0, 100, 60), S('calmPos', 'Pozícia', ['Hore', 'Stred', 'Dole'], 1), R('calmSize', 'Výška pásu', 10, 60, 28)] },

  { id: 'multi', name: 'Farebná variácia', section: SECTIONS[3], on: false, zero: ['multi'], params: [R('multi', 'Sila', 0, 100, 55), R('multiScale', 'Veľkosť oblastí', 0.3, 4, 1, 0.1), S('multiMode', 'Režim', ['Odtieň', 'Paleta', 'Dúha'], 1)] },
  { id: 'poster', name: 'Posterizácia', section: SECTIONS[3], on: false, zero: ['poster'], params: [R('poster', 'Sila', 0, 100, 50)] },
  { id: 'ca', name: 'Chromatická aberácia', section: SECTIONS[3], on: false, zero: ['ca'], params: [R('ca', 'Sila', 0, 100, 40)] },

  { id: 'mirror', name: 'Zrkadlenie', section: SECTIONS[4], on: false, zero: ['mirror'], params: [R('mirror', 'Sila', 0, 100, 100), S('mirrorMode', 'Smer', ['Zľava doprava', 'Zhora nadol', 'Oboje'], 0), R('mirrorPos', 'Pozícia osi', 10, 90, 50)] },
  { id: 'wave', name: 'Vlnenie obrazu', section: SECTIONS[4], on: false, zero: ['wave'], params: [R('wave', 'Sila', 0, 100, 45), R('waveFreq', 'Hustota vĺn', 1, 40, 10), S('waveDir', 'Smer', ['Zvislé vlny', 'Vodorovné vlny'], 0)] },
  { id: 'slice', name: 'Glitch rezy', section: SECTIONS[4], on: false, zero: ['slice'], params: [R('slice', 'Sila', 0, 100, 40), R('sliceCount', 'Počet rezov', 4, 80, 22), R('sliceSplit', 'RGB rozdelenie', 0, 100, 30)] },
  { id: 'pixel', name: 'Pixelácia', section: SECTIONS[4], on: false, zero: ['pixel'], params: [R('pixel', 'Veľkosť pixelov', 0, 100, 35)] },
  { id: 'blur', name: 'Rozostrenie', section: SECTIONS[4], on: false, zero: ['blur'], params: [R('blur', 'Sila', 0, 100, 25)] },
  { id: 'scan', name: 'Scan lines', section: SECTIONS[4], on: false, zero: ['scan'], params: [R('scan', 'Sila', 0, 100, 40), R('scanSize', 'Hrúbka riadkov', 1, 10, 3, 0.5)] },
];

export const FINISH_PARAMS: Param[] = EFFECTS.flatMap((e) => e.params);
