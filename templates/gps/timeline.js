// "How GPS finds your location" - continuous story. 120 BPM (beat 0.5 s). Units: 1 = 1000 km. Earth R 6.371, GPS orbit 20,200 km up.
// Light slowed 30X: 300,000 km/s / 30 = 10,000 km/s = 5 units per beat -> a 20,000 km shout takes ~4 beats.
// Facts: ~30 operational satellites, 20,200 km up, 12 h orbits, one-way signal; 1 microsecond = 300 m; relativity +38 us/day -> ~10 km/day.
export const FPS = 30, BPM = 120, B = 0.5, DUR_BEATS = 88, DURATION = 44;
export const SCENE_BARS = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 20], [20, 22]];
const L = (text, size, color, d, font) => ({ text, size, color, d, font });
const S = (text, d, color = 'cream') => L(text, 24, color, d, 'silk');
// one running sentence: each block picks up where the last stopped
export const CAPTIONS = [
  { t0: 0, t1: 7.9, lines: [L('HOW GPS FINDS', 32, 'cream', 0), L('YOUR LOCATION', 40, 'amber', 2), S('WITHOUT EVER TALKING BACK', 4, 'cyan')] },
  { t0: 8, t1: 15.9, lines: [L('YOUR PHONE', 32, 'cream', 0), L('JUST LISTENS...', 40, 'amber', 1), S('IT NEVER SENDS GPS A THING.', 3), S('IT LISTENS...', 5, 'cyan')] },
  { t0: 16, t1: 23.9, lines: [S('...TO ABOUT 30 SATELLITES,', 0), S('20,200 KM UP, CIRCLING', 1), S('THE EARTH TWICE A DAY,', 2), S('EACH CARRYING ATOMIC CLOCKS...', 4, 'cyan')] },
  { t0: 24, t1: 31.9, lines: [S('...AND SHOUTING THE EXACT TIME', 0), S('AT THE SPEED OF LIGHT.', 1, 'yellow'), S('THE SHOUT TAKES ~0.07 S', 3), S('TO REACH YOU...', 4)] },
  { t0: 32, t1: 39.9, lines: [S('...SO THAT DELAY', 0), S('IS YOUR DISTANCE:', 1), S('ABOUT 20,000 KM.', 2, 'amber'), S('YOU ARE SOMEWHERE', 4), S('ON THIS SPHERE...', 5, 'cyan')] },
  { t0: 40, t1: 47.9, lines: [S('...BUT A 2ND SATELLITE', 0), S('GIVES A 2ND SPHERE,', 1), S('AND THEY CROSS', 3), S('IN JUST A CIRCLE...', 4, 'mint')] },
  { t0: 48, t1: 55.9, lines: [S('...A 3RD LEAVES 2 POINTS.', 0), S('ONE IS OUT IN SPACE,', 2), S('SO YOU ARE HERE...', 4, 'pink')] },
  { t0: 56, t1: 63.9, lines: [S('...AND A 4TH SATELLITE', 0), S('FIXES THE ONE CHEAP CLOCK', 1), S('IN THE WHOLE SYSTEM:', 2), S('YOUR PHONE.', 3, 'amber')] },
  { t0: 64, t1: 71.9, lines: [S('IT HAS TO, BECAUSE', 0), S('1 MILLIONTH OF A SECOND', 1), S('OFF = 300 M WRONG...', 2, 'pink')] },
  { t0: 72, t1: 79.9, lines: [S('...AND EVEN EINSTEIN JOINS IN:', 0), S('UP THERE, CLOCKS GAIN', 1), S('38 MILLIONTHS OF A SEC A DAY,', 2, 'violet'), S('SO THEY ARE BUILT TO RUN SLOW', 4), S('OR YOU DRIFT ~10 KM A DAY...', 5, 'pink')] },
  { t0: 80, t1: 88.5, lines: [L('...ALL THAT', 32, 'cream', 0), L('FOR ONE', 32, 'cream', 1), L('BLUE DOT.', 40, 'cyan', 2)] },
];
export const LABELS = [
  { id: 'clock', text: 'ATOMIC CLOCKS', t0: 24, t1: 31.9, side: 'R', y: 0.44, color: 'cyan' },
  { id: 'dist', text: '~20,000 KM', t0: 34, t1: 39.9, side: 'L', y: 0.50, color: 'amber' },
  { id: 'far', text: 'DEEP SPACE: NO', t0: 51, t1: 55.9, side: 'R', y: 0.44, color: 'pink' },
  { id: 'you', text: 'YOU', t0: 52, t1: 63.9, side: 'L', y: 0.66, color: 'cyan' },
];
export const SPEEDS = [
  [0, 8, 'REAL SPEED', 'pink'], [8, 24, 'SATELLITES SPED UP', 'violet'], [24, 80, 'LIGHT 30X SLOWER', 'cyan'], [80, 89, 'REAL SPEED', 'pink'],
];
export function speedTag(b) { const s = SPEEDS.find((x) => b >= x[0] && b < x[1]) || SPEEDS[SPEEDS.length - 1]; return [s[2], s[3]]; }
export const isReal = (b) => b < 8 || b >= 80;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
// ---------- orbit maths (shared by picture and sound) ----------
export const RE = 6.371, AORB = 6.371 + 20.2, VLIGHT = 5; // units per beat at 30X slower
const D = Math.PI / 180;
export const PHONE_LAT = 28.6, PHONE_LON = 77.2; // New Delhi
export const unitLL = (lat, lon) => [Math.cos(lat * D) * Math.cos(lon * D), Math.sin(lat * D), -Math.cos(lat * D) * Math.sin(lon * D)];
export const PU = unitLL(PHONE_LAT, PHONE_LON);
export const PHONE = PU.map((v) => v * RE);
export const orbitAdvance = (b) => (Math.min(Math.max(b, 8), 24) - 8) * 360 / 43.2; // sped-up orbits between 8 and 24, frozen after (light is slowed)
export function satPos(k, m, b) {
  const Om = k * 60 * D, inc = 55 * D, nu = (m * 72 + k * 12 + 18 + orbitAdvance(b)) * D;
  const N = [Math.cos(Om), 0, Math.sin(Om)], Q = [-Math.sin(Om) * Math.cos(inc), Math.sin(inc), Math.cos(Om) * Math.cos(inc)];
  return [0, 1, 2].map((i) => AORB * (Math.cos(nu) * N[i] + Math.sin(nu) * Q[i]));
}
export const SATS = []; for (let k = 0; k < 6; k++) for (let m = 0; m < 5; m++) SATS.push([k, m]);
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = (a) => Math.sqrt(dot(a, a));
// the 4 highest satellites above the phone once the picture freezes (b = 24)
export const PICK = (() => { const e = SATS.map(([k, m], i) => { const s = satPos(k, m, 24), v = sub(s, PHONE); return { i, el: Math.asin(dot(v, PU) / len(v)) / D, d: len(v) }; }).filter((o) => o.el > 15).sort((a, b) => b.el - a.el); return e.slice(0, 4); })();
// each chosen satellite shouts every 4 beats; arrivals land on the beat
export const FIRST_ARRIVAL = [28, 42, 49, 57];
export const ARRIVALS = PICK.map((p, j) => { const o = []; for (let a = FIRST_ARRIVAL[j]; a < 80; a += 4) o.push(a); return o; });
export const travelBeats = (j) => PICK[j].d / VLIGHT;
export const SPHERE_ON = [36, 42.5, 49.5, 57.5];
export const CIRCLE_ON = 44.5, POINTS_ON = 50.5, FAR_FADE = 53.5, LOCK = 60;
export const HOOK_SHOTS = ['earthPin', 'satClose', 'wide', 'india', 'panel', 'orbits', 'satSide', 'globe'];
