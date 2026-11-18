import * as TL from './timeline.js';
import fs from 'fs';
const ev = { B: TL.B, dur: TL.DUR_BEATS, hit: TL.HIT, sweep: TL.SWEEP, volt: TL.VOLT, wire: TL.WIRE, lamp: TL.LAMP, rain: TL.RAIN, lines: [], labels: [] };
TL.CAPTIONS.forEach(c => c.lines.forEach(l => ev.lines.push({ b: c.t0 + l.d, big: l.size >= 32 })));
TL.LABELS.forEach(l => ev.labels.push({ b: l.t0 }));
fs.writeFileSync('events.json', JSON.stringify(ev));
