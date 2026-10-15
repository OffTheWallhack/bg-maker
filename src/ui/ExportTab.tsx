import { useRef, useState } from 'react';
import { convertToMp4, deliverFiles, encodeVideo, exportSize, FILE_PREFIX, renderImage, renderSet } from '../export';
import type { OutFile } from '../export';
import { FORMATS } from '../defaults';
import { shareUrl } from '../share';
import { loadScene, sanitizeScene, savePresets, setState, uid, useStore } from '../store';
import { Segment, Toggle } from './Controls';
import { sceneThumb } from '../thumbs';
import type { Preset } from '../types';

export function ExportTab() {
  const scene = useStore((s) => s.scene);
  const presets = useStore((s) => s.presets);
  const scale = useStore((s) => s.scale);
  const transparent = useStore((s) => s.transparent);
  const [busy, setBusy] = useState('');
  const [prog, setProg] = useState(0);
  const [msg, setMsg] = useState('');
  const [pending, setPending] = useState<OutFile[] | null>(null);
  const [webm, setWebm] = useState<OutFile | null>(null);
  const [vq, setVq] = useState(1);
  const [fps, setFps] = useState(30);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<string[]>(['story', 'post', 'square']);
  const [linkMsg, setLinkMsg] = useState('');
  const [ew, eh] = exportSize(scene.format.w, scene.format.h, scale);
  const opts = { scale, transparent };
  const file = useRef<HTMLInputElement>(null);

  /** run a job, then hand the files over (or keep them for one more tap if the phone needs it) */
  const run = async (label: string, job: () => Promise<OutFile[]>) => {
    setBusy(label); setProg(0); setMsg(''); setPending(null);
    try {
      const files = await job();
      if ((await deliverFiles(files, `${FILE_PREFIX}-sada-${scene.seed}.zip`)) === 'tap') setPending(files);
    } catch (e) { setMsg(String((e as Error).message ?? e)); }
    setBusy('');
  };

  const store = (ps: Preset[]) => { if (!savePresets(ps)) setMsg('Úložisko je plné – exportuj zálohu a zmaž staré presety.'); };
  const saveNew = () => {
    const p: Preset = { id: uid(), name: name.trim() || `Preset ${presets.length + 1}`, thumb: sceneThumb(scene, 160), created: Date.now(), scene: JSON.parse(JSON.stringify(scene)) };
    store([p, ...presets]); setName('');
  };
  const dup = (p: Preset) => store([{ ...p, id: uid(), name: p.name + ' kópia', created: Date.now() }, ...presets]);
  const exportJson = () => deliverFiles([{ blob: new Blob([JSON.stringify({ bgmaker: 1, presets }, null, 1)], { type: 'application/json' }), name: `${FILE_PREFIX}-presety.json` }]);
  const importJson = async (f: File) => {
    try {
      const j = JSON.parse(await f.text());
      const list: Preset[] = (j.presets ?? []).map((p: Preset) => ({ ...p, id: uid(), scene: sanitizeScene(p.scene) }));
      store([...list, ...presets]); setMsg(`Importovaných presetov: ${list.length}`);
    } catch { setMsg('Neplatný súbor.'); }
  };
  const vw = scene.format.w - (scene.format.w % 2), vh = scene.format.h - (scene.format.h % 2);

  return (
    <div className="stack">
      {busy && (
        <div className="busy">
          <span>{busy === 'video' ? 'Renderujem video…' : 'Pripravujem…'} {Math.round(prog * 100)} %</span>
          <div className="progress"><div style={{ width: `${Math.round(prog * 100)}%` }} /></div>
        </div>
      )}
      {pending && (
        <button className="btn acc big" onClick={async () => { if ((await deliverFiles(pending, `${FILE_PREFIX}-sada.zip`)) === 'ok') setPending(null); }}>
          📥 Hotovo – uložiť {pending.length > 1 ? `${pending.length} súbory` : pending[0].name.split('.').pop()?.toUpperCase()}
        </button>
      )}
      {msg && <p className="hint">{msg}</p>}

      <h4>Obrázok · {ew}×{eh}</h4>
      <div className="row">
        <button className="btn acc grow" disabled={!!busy} onClick={() => run('png', async () => [await renderImage(scene, 'png', opts)])}>Uložiť PNG</button>
        <button className="btn acc grow" disabled={!!busy} onClick={() => run('jpg', async () => [await renderImage(scene, 'jpg', opts)])}>Uložiť JPG</button>
      </div>
      <Segment label="Rozlíšenie" options={['×1', '×2', '×3']} value={scale - 1} onChange={(i) => setState({ scale: i + 1 })} />
      <Toggle label="Priehľadné pozadie (PNG) – vyreže farbu pozadia" value={transparent} onChange={(v) => setState({ transparent: v })} />

      <h4>Video · MP4 · {vw}×{vh} · {scene.anim.loop} s</h4>
      <Segment label="Kvalita" options={['Vysoká', 'Maximálna']} value={vq} onChange={setVq} />
      <Segment label="Snímky za sekundu" options={['30 fps', '60 fps']} value={fps === 60 ? 1 : 0} onChange={(i) => setFps(i ? 60 : 30)} />
      <button className="btn acc" disabled={!!busy} onClick={() => run('video', async () => {
        setWebm(null);
        const f = await encodeVideo(scene, { quality: vq, fps }, setProg);
        if (f.needsConvert) setWebm(f);
        return [f];
      })}>▶ Uložiť video slučku</button>
      <p className="hint">Video sa renderuje snímku po snímke vo vysokom dátovom toku, takže jemné zrno a detaily zostanú ostré. Animácia sa zapne sama a slučka sa opakuje bez švu. Instagram video pri nahraní ešte raz skomprimuje – pri veľmi silnom zrne môže byť lepšie zrno trochu zmierniť.</p>
      {webm && (
        <button className="btn" disabled={!!busy} onClick={() => run('mp4', async () => {
          setMsg('Sťahujem prevodník…');
          const m = await convertToMp4(webm.blob, setProg);
          setMsg('');
          return [{ blob: m, name: webm.name.replace(/\.(webm|mp4)$/, '-h264.mp4') }];
        })}>Previesť na H.264 MP4 (pre Instagram a Fotky)</button>
      )}

      <h4>Sada formátov naraz</h4>
      <div className="checks">
        {FORMATS.map((f) => {
          const on = picked.includes(f.id);
          return <button key={f.id} className={'chk' + (on ? ' on' : '')} onClick={() => setPicked(on ? picked.filter((x) => x !== f.id) : [...picked, f.id])}><i>{on ? '✓' : ''}</i>{f.name}<small>{f.w}×{f.h}</small></button>;
        })}
      </div>
      <button className="btn acc" disabled={!!busy || !picked.length} onClick={() => run('set', () => renderSet(scene, FORMATS.filter((f) => picked.includes(f.id)), opts, setProg))}>Uložiť sadu ({picked.length})</button>

      <h4>Odkaz na tento obraz</h4>
      <button className="btn" onClick={async () => {
        const url = shareUrl(scene);
        try {
          if (navigator.share && /iPhone|iPad|Android/i.test(navigator.userAgent)) await navigator.share({ title: 'bg maker', url });
          else { await navigator.clipboard.writeText(url); setLinkMsg('Odkaz skopírovaný.'); }
        } catch { setLinkMsg(url); }
      }}>🔗 Zdieľať odkaz (recept)</button>
      {linkMsg && <p className="hint" style={{ wordBreak: 'break-all' }}>{linkMsg}</p>}
      <p className="hint">Kto odkaz otvorí, uvidí presne to isté nastavenie. Vlastná fotka sa v odkaze nenachádza.</p>

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
