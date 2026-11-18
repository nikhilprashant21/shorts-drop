import * as TL from './timeline.js';
import fs from 'fs';
const ev = { B: TL.B, dur: TL.DUR_BEATS, arrivals: TL.ARRIVALS, emits: TL.ARRIVALS.map((a, j) => a.map((x) => +(x - TL.travelBeats(j)).toFixed(3))), spheres: TL.SPHERE_ON, circle: TL.CIRCLE_ON, points: TL.POINTS_ON, farFade: TL.FAR_FADE, lock: TL.LOCK, lines: [], labels: [] };
TL.CAPTIONS.forEach(c => c.lines.forEach(l => ev.lines.push({ b: c.t0 + l.d, big: l.size >= 32 })));
TL.LABELS.forEach(l => ev.labels.push({ b: l.t0 }));
fs.writeFileSync('events.json', JSON.stringify(ev));
