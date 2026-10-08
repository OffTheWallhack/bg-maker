import { useRef, useState } from 'react';
import { convertToMp4, deliver, recordLoop, saveImage } from '../export';
import { loadScene, sanitizeScene, savePresets, uid, useStore } from '../store';
import { sceneThumb } from '../thumbs';
import type { Preset } from '../types';

export function ExportTab() {
  const scene = useStore((s) => s.scene);
  const presets = useStore((s) => s.presets);
  const [busy, setBusy] = useState('');
  const [prog, setProg] = useState(0);
  const [msg, setMsg] = useState('');
  const [video, setVideo] = useState<{ blob: Blob; ext: string } | null>(null);
  const [name, setName] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label); setProg(0); setMsg('');
    try { await fn(); } catch (e) { setMsg(String((e as Error).message ?? e)); }
    setBusy('');
  };
  const base = `bglab-${scene.textureId}-${scene.seed}-${scene.format.w}x${scene.format.h}`;

  const store = (ps: Preset[]) => { if (!savePresets(ps)) setMsg('Úložisko je plné – exportuj zálohu a zmaž staré presety.'); };
  const saveNew = () => {
    const p: Preset = { id: uid(), name: name.trim() || `Preset ${presets.length + 1}`, thumb: sceneThumb(scene, 160), created: Date.now(), scene: JSON.parse(JSON.stringify(scene)) };
    store([p, ...presets]); setName('');
  };
  const dup = (p: Preset) => store([{ ...p, id: uid(), name: p.name + ' kópia', created: Date.now() }, ...presets]);
  const exportJson = () => deliver(new Blob([JSON.stringify({ bglab: 1, presets }, null, 1)], { type: 'application/json' }), 'bglab-presets.json');
  const importJson = async (f: File) => {
    try {
      const j = JSON.parse(await f.text());
      const list: Preset[] = (j.presets ?? []).map((p: Preset) => ({ ...p, id: uid(), scene: sanitizeScene(p.scene) }));
      store([...list, ...presets]); setMsg(`Importovaných presetov: ${list.length}`);
    } catch { setMsg('Neplatný súbor.'); }
  };

  return (
    <div className="stack">
      <h4>Obrázok · {scene.format.w}×{scene.format.h}</h4>
      <div className="row">
        <button className="btn acc grow" disabled={!!busy} onClick={() => run('png', () => saveImage(scene, 'png'))}>Uložiť PNG</button>
        <button className="btn acc grow" disabled={!!busy} onClick={() => run('jpg', () => saveImage(scene, 'jpg'))}>Uložiť JPG</button>
      </div>
      <h4>Video slučka · {scene.anim.loop} s</h4>
      <button className="btn grow" disabled={!!busy} onClick={() => run('rec', async () => {
        const r = await recordLoop(scene, setProg);
        setVideo(r);
        await deliver(r.blob, `${base}.${r.ext}`);
      })}>● Nahrať slučku (zapne animáciu)</button>
      {video && (
        <div className="row">
          <button className="btn grow" disabled={!!busy} onClick={() => deliver(video.blob, `${base}.${video.ext}`)}>Uložiť {video.ext.toUpperCase()}</button>
          <button className="btn grow" disabled={!!busy} onClick={() => run('mp4', async () => {
            setMsg('Sťahujem ffmpeg…');
            const m = await convertToMp4(video.blob, (p) => { setProg(p); setMsg('Konvertujem…'); });
            setMsg('');
            await deliver(m, `${base}.mp4`);
          })}>MP4 pre Instagram</button>
        </div>
      )}
      {busy && <div className="progress"><div style={{ width: `${Math.round(prog * 100)}%` }} /></div>}
      {msg && <p className="hint">{msg}</p>}

      <h4>Presety</h4>
      <div className="row">
        <input className="search" placeholder="Názov presetu" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn" onClick={saveNew}>Uložiť</button>
      </div>
      <div className="presets">
        {presets.map((p) => (
          <div className="preset" key={p.id}>
            <img src={p.thumb} alt="" onClick={() => loadScene(p.scene)} />
            <div className="pn"><b>{p.name}</b><small>{p.scene.format.w}×{p.scene.format.h}</small></div>
            <div className="pa">
              <button onClick={() => loadScene(p.scene)}>Načítať</button>
              <button onClick={() => dup(p)}>Duplikovať</button>
              <button onClick={() => { const n = prompt('Názov', p.name); if (n) store(presets.map((x) => (x.id === p.id ? { ...x, name: n } : x))); }}>Názov</button>
              <button onClick={() => confirm('Zmazať preset?') && store(presets.filter((x) => x.id !== p.id))}>Zmazať</button>
            </div>
          </div>
        ))}
        {!presets.length && <p className="hint">Zatiaľ žiadne presety.</p>}
      </div>
      <div className="row">
        <button className="btn grow" onClick={exportJson} disabled={!presets.length}>Exportovať JSON</button>
        <button className="btn grow" onClick={() => file.current?.click()}>Importovať JSON</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }} />
      </div>
    </div>
  );
}
