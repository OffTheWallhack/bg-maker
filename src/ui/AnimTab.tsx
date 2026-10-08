import { LOOP_LENGTHS, MOTION_NAMES } from '../defaults';
import { setAnim, useStore } from '../store';
import { Segment, Slider, Toggle } from './Controls';

export function AnimTab() {
  const a = useStore((s) => s.scene.anim);
  return (
    <div className="stack">
      <Toggle label="Animácia zapnutá" value={a.on} onChange={(v) => setAnim('on', v)} />
      <Slider p={{ type: 'range', id: 'speed', label: 'Rýchlosť (cykly za slučku)', min: 1, max: 4, step: 1, default: 1 }} value={a.speed} onChange={(v) => setAnim('speed', v)} onReset={() => setAnim('speed', 1)} />
      <Segment label="Dĺžka slučky (s)" options={LOOP_LENGTHS.map(String)} value={LOOP_LENGTHS.indexOf(a.loop)} onChange={(i) => setAnim('loop', LOOP_LENGTHS[i])} />
      <Segment label="Typ pohybu" options={MOTION_NAMES} value={a.motion} onChange={(v) => setAnim('motion', v)} />
      <p className="hint">Pohyb je riadený periodickými funkciami, takže prvý a posledný snímok sú rovnaké – video sa opakuje bez škuchnutia. Zrno, prach a škrabance sa menia po snímkoch.</p>
    </div>
  );
}
