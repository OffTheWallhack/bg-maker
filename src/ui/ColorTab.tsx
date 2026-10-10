import { useState } from 'react';
import { PALETTE_SLOTS } from '../defaults';
import { BUILTIN_PALETTES } from '../palettes';
import { HARMONIES } from '../paletteGen';
import type { Harmony } from '../paletteGen';
import { deletePalette, newPalette, randomPalette, renamePalette, selectPalette, setGrade, setPaletteColor, update, useStore } from '../store';
import { normHex } from '../color';
import type { Palette } from '../types';
import { Segment, Slider, Toggle } from './Controls';

const R = (id: string, label: string, min: number, max: number, def: number, step = 0.01) => ({ type: 'range' as const, id, label, min, max, step, default: def });
const DEFS = {
  hue: R('hue', 'Posun odtieňa', -180, 180, 0, 1),
  contrast: R('contrast', 'Kontrast', 0.3, 2.5, 1),
  brightness: R('brightness', 'Jas', -0.5, 0.5, 0),
  saturation: R('saturation', 'Sýtosť', 0, 2, 1),
};

function Swatch({ i, value }: { i: number; value: string }) {
  return (
    <label className="swatch">
      <span className="swatch-c" style={{ background: value }}><input type="color" value={normHex(value) ?? '#000000'} onChange={(e) => setPaletteColor(i, e.target.value)} /></span>
      <small>{PALETTE_SLOTS[i]}</small>
      <em>{value.toUpperCase()}</em>
    </label>
  );
}

function Card({ p, active, onPick }: { p: Palette; active: boolean; onPick: () => void }) {
  return (
    <button className={'pcard' + (active ? ' on' : '')} onClick={onPick}>
      <span className="stripes">{p.colors.map((c, i) => <i key={i} style={{ background: c }} />)}</span>
      <b>{p.name}</b>
    </button>
  );
}

export function ColorTab() {
  const scene = useStore((s) => s.scene);
  const mine = useStore((s) => s.palettes);
  const active = useStore((s) => s.activePalette);
  const [harm, setHarm] = useState<Harmony>('auto');
  const g = scene.grade;
  const same = (p: Palette) => p.colors.every((c, i) => c.toLowerCase() === scene.palette[i].toLowerCase());
  const cur = mine.find((p) => p.id === active);

  return (
    <div className="stack">
      <h4>Paleta</h4>
      <div className="swatches">{scene.palette.map((c, i) => <Swatch key={i} i={i} value={c} />)}</div>
      <div className="row">
        <button className="btn acc grow" onClick={() => randomPalette(harm)}>🎲 Náhodné farby</button>
        <button className="btn" onClick={() => { const n = prompt('Názov palety', 'Moja paleta'); if (n) newPalette(n); }}>Uložiť</button>
      </div>
      <div className="seg">
        {HARMONIES.map((h) => <button key={h.id} className={h.id === harm ? 'on' : ''} onClick={() => { setHarm(h.id); randomPalette(h.id); }}>{h.name}</button>)}
      </div>

      <h4>Hotové palety</h4>
      <div className="pgrid">
        {BUILTIN_PALETTES.map((p) => <Card key={p.id} p={p} active={same(p)} onPick={() => selectPalette(p.id)} />)}
      </div>

      {mine.length > 0 && (<>
        <h4>Moje palety</h4>
        <div className="pgrid">
          {mine.map((p) => <Card key={p.id} p={p} active={same(p)} onPick={() => selectPalette(p.id)} />)}
        </div>
        {cur && (
          <div className="row">
            <button className="btn small" onClick={() => { const n = prompt('Nový názov', cur.name); if (n) renamePalette(cur.id, n); }}>Premenovať</button>
            <button className="btn small" onClick={() => confirm(`Zmazať paletu „${cur.name}“?`) && deletePalette(cur.id)}>Zmazať</button>
          </div>
        )}
      </>)}

      <h4>Úpravy farieb</h4>
      {(Object.keys(DEFS) as (keyof typeof DEFS)[]).map((k) => (
        <Slider key={k} p={DEFS[k]} value={g[k]} onChange={(v) => setGrade(k, v)} onReset={() => setGrade(k, DEFS[k].default)} />
      ))}
      <Toggle label="Invertovať" value={g.invert} onChange={(v) => setGrade('invert', v)} />
      <Toggle label="Duotone (jas → 2 farby)" value={g.duotone} onChange={(v) => setGrade('duotone', v)} />
      {g.duotone && (<>
        <Segment label="Tmavá" options={PALETTE_SLOTS} value={g.duoA} onChange={(v) => setGrade('duoA', v)} />
        <Segment label="Svetlá" options={PALETTE_SLOTS} value={g.duoB} onChange={(v) => setGrade('duoB', v)} />
      </>)}
      <button className="btn ghost" onClick={() => update((s) => ({ ...s, grade: { ...s.grade, hue: 0, contrast: 1, brightness: 0, saturation: 1, invert: false, duotone: false } }))}>Obnoviť úpravy</button>
    </div>
  );
}
