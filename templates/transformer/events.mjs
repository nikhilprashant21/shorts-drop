import * as TL from './timeline.js';
import fs from 'fs';
const ev = { B: TL.B, dur: TL.DUR_BEATS, peaks: TL.PEAKS, lines: [], labels: [],
  real: TL.SPEEDS.filter((s) => s[4] === null).map((s) => [s[0], Math.min(s[1], TL.DUR_BEATS)]) };
TL.CAPTIONS.forEach(c => c.lines.forEach(l => ev.lines.push({ b: c.t0 + l.d, big: l.size >= 32 })));
TL.LABELS.forEach(l => ev.labels.push({ b: l.t0 }));
fs.writeFileSync('events.json', JSON.stringify(ev));
