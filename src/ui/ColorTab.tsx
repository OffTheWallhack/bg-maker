import { PALETTE_SLOTS } from '../defaults';
import { deletePalette, newPalette, renamePalette, selectPalette, setGrade, setPaletteColor, updatePaletteFromScene, update, useStore } from '../store';
import { ColorField, Slider, Toggle, Segment } from './Controls';

const R = (id: string, label: string, min: number, max: number, def: number, step = 0.01) => ({ type: 'range' as const, id, label, min, max, step, default: def });
const DEFS = {
  hue: R('hue', 'Posun odtieňa', -180, 180, 0, 1),
  contrast: R('contrast', 'Kontrast', 0.3, 2.5, 1),
  brightness: R('brightness', 'Jas', -0.5, 0.5, 0),
  saturation: R('saturation', 'Sýtosť', 0, 2, 1),
};

export function ColorTab() {
  const scene = useStore((s) => s.scene);
  const palettes = useStore((s) => s.palettes);
  const active = useStore((s) => s.activePalette);
  const g = scene.grade;
  const cur = palettes.find((p) => p.id === active);
  const dirty = cur && cur.colors.some((c, i) => c.toLowerCase() !== scene.palette[i].toLowerCase());

  return (
    <div className="stack">
      <h4>Profily</h4>
      <div className="chips">
        {palettes.map((p) => (
          <button key={p.id} className={'chip' + (p.id === active ? ' on' : '')} onClick={() => selectPalette(p.id)}>
            <span className="dots">{p.colors.slice(0, 5).map((c, i) => <i key={i} style={{ background: c }} />)}</span>{p.name}
          </button>
        ))}
      </div>
      <div className="row wrap">
        <button className="btn" onClick={() => { const n = prompt('Názov nového profilu', 'Nový profil'); if (n) newPalette(n); }}>＋ Nový z aktuálnych</button>
        {cur && <>
          {dirty && <button className="btn acc" onClick={() => updatePaletteFromScene(cur.id)}>Uložiť zmeny</button>}
          <button className="btn" onClick={() => { const n = prompt('Nový názov', cur.name); if (n) renamePalette(cur.id, n); }}>Premenovať</button>
          <button className="btn" onClick={() => confirm(`Zmazať profil „${cur.name}“?`) && deletePalette(cur.id)}>Zmazať</button>
        </>}
      </div>
      <h4>Paleta</h4>
      <div className="colors">
        {PALETTE_SLOTS.map((n, i) => <ColorField key={n} label={n} value={scene.palette[i]} onChange={(v) => setPaletteColor(i, v)} />)}
      </div>
      <h4>Globálne úpravy</h4>
      {(Object.keys(DEFS) as (keyof typeof DEFS)[]).map((k) => (
        <Slider key={k} p={DEFS[k]} value={g[k]} onChange={(v) => setGrade(k, v)} onReset={() => setGrade(k, DEFS[k].default)} />
      ))}
      <Toggle label="Invertovať" value={g.invert} onChange={(v) => setGrade('invert', v)} />
      <Toggle label="Duotone (jas → 2 farby)" value={g.duotone} onChange={(v) => setGrade('duotone', v)} />
      {g.duotone && <>
        <Segment label="Tmavá" options={PALETTE_SLOTS} value={g.duoA} onChange={(v) => setGrade('duoA', v)} />
        <Segment label="Svetlá" options={PALETTE_SLOTS} value={g.duoB} onChange={(v) => setGrade('duoB', v)} />
      </>}
      <button className="btn ghost" onClick={() => update((s) => ({ ...s, grade: { ...s.grade, hue: 0, contrast: 1, brightness: 0, saturation: 1, invert: false, duotone: false } }))}>Obnoviť úpravy</button>
    </div>
  );
}
