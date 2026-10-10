import { paramValues } from '../gl/renderer';
import { randomAll, randomize, remix, resetParam, setParam, setSeed, texParams, update, useStore } from '../store';
import { CATEGORIES, TEXTURE_BY_ID } from '../textures';
import { ParamControl } from './Controls';

export function TextureTab() {
  const scene = useStore((s) => s.scene);
  const def = TEXTURE_BY_ID[scene.textureId];
  const vals = paramValues(def, texParams(scene));
  const cat = CATEGORIES.find((c) => c.id === def.category)?.name;
  return (
    <div className="stack">
      <div className="curr"><small>{cat}</small><b>{def.name}</b></div>
      <button className="btn acc" onClick={randomAll}>🎲 Všetko náhodne</button>
      <div className="row">
        <button className="btn grow" onClick={randomize}>Náhodná textúra</button>
        <button className="btn grow" onClick={remix}>↻ Remix</button>
      </div>
      <div className="row seedrow">
        <label>Seed</label>
        <input className="num" type="number" min={0} value={scene.seed} onChange={(e) => setSeed(+e.target.value)} />
        <button className="btn" onClick={() => setSeed(Math.floor(Math.random() * 99999))}>nový</button>
      </div>
      <h4>Nastavenia textúry</h4>
      {def.params.map((p) => (
        <ParamControl key={def.id + p.id} p={p} value={vals[p.id]} onChange={(v) => setParam(p.id, v)} onReset={() => resetParam(p)} />
      ))}
      <button className="btn ghost" onClick={() => update((s) => ({ ...s, params: { ...s.params, [s.textureId]: {} } }))}>Obnoviť predvolené</button>
    </div>
  );
}
