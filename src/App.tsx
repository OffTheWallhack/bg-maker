import { useEffect, useState } from 'react';
import { FORMATS } from './defaults';
import { redo, setFormat, setState, undo, useStore } from './store';
import type { Tab } from './store';
import { AnimTab } from './ui/AnimTab';
import { ColorTab } from './ui/ColorTab';
import { DirtTab } from './ui/DirtTab';
import { ExportTab } from './ui/ExportTab';
import { Preview } from './ui/Preview';
import { TextureTab } from './ui/TextureTab';

const TABS: [Tab, string][] = [['texture', 'Textúra'], ['colors', 'Farby'], ['dirt', 'Špina'], ['anim', 'Animácia'], ['export', 'Export']];

export function App() {
  const [error, setError] = useState('');
  const tab = useStore((s) => s.tab);
  const sheet = useStore((s) => s.sheet);
  const safe = useStore((s) => s.safe);
  const fmt = useStore((s) => s.scene.format);
  const canUndo = useStore((s) => s.past.length > 0);
  const canRedo = useStore((s) => s.future.length > 0);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' && (e.target as HTMLInputElement).type === 'text') return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const pickTab = (t: Tab) => setState({ tab: t, sheet: sheet === 'peek' ? 'half' : sheet });

  return (
    <div className={'app sheet-' + sheet}>
      <header className="top">
        <div className="fmts">
          {FORMATS.map((f) => (
            <button key={f.id} className={fmt.preset === f.id ? 'on' : ''} onClick={() => setFormat(f.id, f.id === 'custom' ? fmt.w : f.w, f.id === 'custom' ? fmt.h : f.h)}>{f.name}</button>
          ))}
        </div>
        <div className="tools">
          <button onClick={undo} disabled={!canUndo} title="Späť">↶</button>
          <button onClick={redo} disabled={!canRedo} title="Znova">↷</button>
          <button className={safe ? 'on' : ''} onClick={() => setState({ safe: !safe })} title="Bezpečné zóny">▭</button>
        </div>
      </header>
      {fmt.preset === 'custom' && (
        <div className="custom">
          <input type="number" value={fmt.w} onChange={(e) => setFormat('custom', +e.target.value, fmt.h)} /> ×
          <input type="number" value={fmt.h} onChange={(e) => setFormat('custom', fmt.w, +e.target.value)} /> px
        </div>
      )}
      <main className="stage">
        <Preview onError={setError} />
        {error && <div className="err">{error}</div>}
      </main>
      <aside className="panel">
        <button className="handle" onClick={() => setState({ sheet: sheet === 'full' ? 'half' : sheet === 'half' ? 'peek' : 'half' })} aria-label="Panel"><i /></button>
        <nav className="tabs">
          {TABS.map(([id, n]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => pickTab(id)}>{n}</button>)}
        </nav>
        <div className="body">
          {tab === 'texture' && <TextureTab />}
          {tab === 'colors' && <ColorTab />}
          {tab === 'dirt' && <DirtTab />}
          {tab === 'anim' && <AnimTab />}
          {tab === 'export' && <ExportTab />}
        </div>
      </aside>
    </div>
  );
}
