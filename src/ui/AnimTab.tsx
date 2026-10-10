import { LOOP_LENGTHS, MOTION_HINTS, MOTION_NAMES } from '../defaults';
import { setAnim, useStore } from '../store';
import { Segment, Slider, Toggle } from './Controls';

export function AnimTab() {
  const a = useStore((s) => s.scene.anim);
  return (
    <div className="stack">
      <Toggle label="Animácia zapnutá" value={a.on} onChange={(v) => setAnim('on', v)} />
      <h4>Typ pohybu</h4>
      <div className="motions">
        {MOTION_NAMES.map((n, i) => (
          <button key={n} className={'motion' + (a.motion === i ? ' on' : '')} onClick={() => { setAnim('motion', i); if (!a.on) setAnim('on', true); }}>
            <b>{n}</b><small>{MOTION_HINTS[i]}</small>
          </button>
        ))}
      </div>
      <Slider p={{ type: 'range', id: 'amount', label: 'Sila pohybu', min: 0.1, max: 2.5, step: 0.05, default: 1 }} value={a.amount ?? 1} onChange={(v) => setAnim('amount', v)} onReset={() => setAnim('amount', 1)} />
      <Slider p={{ type: 'range', id: 'speed', label: 'Rýchlosť (cykly za slučku)', min: 1, max: 4, step: 1, default: 1 }} value={a.speed} onChange={(v) => setAnim('speed', v)} onReset={() => setAnim('speed', 1)} />
      <Segment label="Dĺžka slučky (s)" options={LOOP_LENGTHS.map(String)} value={LOOP_LENGTHS.indexOf(a.loop)} onChange={(i) => setAnim('loop', LOOP_LENGTHS[i])} />
      <p className="hint">Prvý a posledný snímok sú rovnaké, takže sa video opakuje bez škuchnutia. Zrno, prach a škrabance sa menia po snímkoch.</p>
    </div>
  );
}
