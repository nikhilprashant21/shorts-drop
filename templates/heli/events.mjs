import * as TL from './timeline.js';
import fs from 'fs';
// blade passes over the tail boom when rotor angle = 90 (mod 180)
const passes = []; for (const [s, e, , , r] of TL.SPEEDS) { if (r === null) continue; const a0 = TL.rotorDeg(s + 1e-9); let k = Math.ceil((a0 - 90) / 180 - 1e-9); for (;;) { const bb = s + (90 + 180 * k - a0) / r; if (bb >= e - 1e-9) break; if (bb >= s - 1e-9) passes.push(+bb.toFixed(4)); k++; } }
const ev = { B: TL.B, dur: TL.DUR_BEATS, passes, liftoff: TL.LIFTOFF, lines: [], labels: [], real: TL.SPEEDS.filter((s) => s[4] === null).map((s) => [s[0], Math.min(s[1], TL.DUR_BEATS)]) };
TL.CAPTIONS.forEach(c => c.lines.forEach(l => ev.lines.push({ b: c.t0 + l.d, big: l.size >= 32 })));
TL.LABELS.forEach(l => ev.labels.push({ b: l.t0 }));
fs.writeFileSync('events.json', JSON.stringify(ev)); console.log(passes.slice(0, 12).join(' '), passes.length);
