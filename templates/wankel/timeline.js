// "How a rotary (Wankel) engine works" - 120 BPM (beat 0.5 s). Real reference: 9,000 rpm (RENESIS / 787B R26B).
// Mazda geometry: rotor radius 105 mm, offset (eccentricity) 15 mm. Rotor turns 1/3 shaft speed (gears 3:2).
// 75X slower = 1 shaft turn per beat; 240X = 112.5 deg/beat; 800X = 33.75 deg/beat (one stroke = 270 shaft deg = 8 beats).
// Each face does all 4 strokes per rotor turn -> 1 power pulse per shaft turn per rotor.
// Mazda 787B (4-rotor R26B) 1991: only rotary-powered Le Mans winner.
export const FPS = 30, BPM = 120, B = 0.5, DUR_BEATS = 88, DURATION = 44;
export const SCENE_BARS = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 20], [20, 22]];
const L = (text, size, color, d, font) => ({ text, size, color, d, font });
const S = (text, d, color = 'cream') => L(text, 24, color, d, 'silk');
export const CAPTIONS = [
  { t0: 0, t1: 7.9, lines: [L('HOW A ROTARY', 32, 'cream', 0), L('ENGINE WORKS', 40, 'amber', 2), S('9,000 RPM. ZERO PISTONS.', 4, 'pink')] },
  { t0: 8, t1: 15.9, lines: [L('ONE TRIANGLE', 32, 'cream', 0), L('IN A PEANUT', 40, 'amber', 1), S('THE ROTOR SPINS AND WOBBLES', 3, 'cyan')] },
  { t0: 16, t1: 23.9, lines: [{ ...L('SUCK', 40, 'cyan', 0), badge: '1/4' }, S('FOLLOW ONE FACE', 1), S('IT SWEEPS PAST THE PORT', 2), S('THE GAP GROWS: AIR + FUEL IN', 4, 'cyan')] },
  { t0: 24, t1: 31.9, lines: [{ ...L('SQUEEZE', 40, 'amber', 0), badge: '2/4' }, S('THE ROTOR CARRIES IT ROUND', 1), S('INTO THE NARROW WAIST', 2), S('THE GAP SHRINKS', 4, 'amber')] },
  { t0: 32, t1: 39.9, lines: [{ ...L('BANG', 40, 'pink', 0), badge: '3/4' }, S('TWO SPARK PLUGS FIRE', 1), S('THE BLAST SHOVES THE FACE', 2), S('AND SPINS THE SHAFT', 4, 'pink')] },
  { t0: 40, t1: 47.9, lines: [{ ...L('BLOW', 40, 'mint', 0), badge: '4/4' }, S('THE FACE REACHES', 1), S('THE EXHAUST PORT', 2), S('AND SWEEPS IT OUT', 4, 'mint')] },
  { t0: 48, t1: 55.9, lines: [L('3 FACES', 32, 'cream', 0), L('3 CHAMBERS', 40, 'cyan', 1), S('ALL 4 STROKES', 3), S('HAPPEN AT ONCE', 4, 'cyan')] },
  { t0: 56, t1: 63.9, lines: [L('THE TRICK: 3:1', 32, 'amber', 0), S('GEARS MAKE THE SHAFT', 1), S('SPIN 3X FASTER', 2), S('THAN THE ROTOR', 3, 'amber')] },
  { t0: 64, t1: 71.9, lines: [L('A BANG EVERY', 32, 'cream', 0), L('SHAFT TURN', 40, 'pink', 1), S('A PISTON FIRES', 3), S('EVERY 2ND TURN', 4, 'pink')] },
  { t0: 72, t1: 79.9, lines: [L('LE MANS 1991', 32, 'amber', 0), S('A 4-ROTOR MAZDA 787B WON', 1), S('THE ONLY ROTARY EVER', 3, 'pink'), S('TO WIN IT', 4, 'pink')] },
  { t0: 80, t1: 88.5, lines: [L('NO PISTONS.', 32, 'cream', 0), L('JUST SPIN.', 40, 'amber', 1), S('3 FACES. 1 SHAFT. 9,000 RPM.', 3, 'cyan')] },
];
export const LABELS = [
  { id: 'rotor', text: 'ROTOR', t0: 10, t1: 15.9, side: 'R', y: 0.56, color: 'amber' },
  { id: 'housing', text: 'HOUSING', t0: 11, t1: 15.9, side: 'L', y: 0.42, color: 'cream' },
  { id: 'shaft', text: 'ECCENTRIC SHAFT', t0: 12, t1: 15.9, side: 'L', y: 0.66, color: 'cyan' },
  { id: 'plugs', text: 'SPARK PLUGS', t0: 13, t1: 15.9, side: 'L', y: 0.80, color: 'yellow' },
  { id: 'inP', text: 'INTAKE PORT', t0: 17, t1: 23.9, side: 'R', y: 0.44, color: 'cyan' },
  { id: 'face', text: 'THIS FACE', t0: 17.5, t1: 47.9, side: 'L', y: 0.42, color: 'yellow' },
  { id: 'waist', text: 'THE WAIST', t0: 26, t1: 31.9, side: 'L', y: 0.56, color: 'amber' },
  { id: 'exP', text: 'EXHAUST PORT', t0: 41, t1: 47.9, side: 'R', y: 0.78, color: 'mint' },
  { id: 'gearR', text: 'ROTOR GEAR', t0: 57, t1: 63.9, side: 'R', y: 0.44, color: 'amber' },
  { id: 'gearF', text: 'FIXED GEAR', t0: 58, t1: 63.9, side: 'L', y: 0.74, color: 'mint' },
];
// [b0, b1, tag, colour, shaft degrees per beat (null = real speed)]
export const SPEEDS = [
  [0, 8, 'REAL SPEED', 'pink', null],
  [8, 16, '75X SLOWER', 'cyan', 360],
  [16, 48, '800X SLOWER', 'violet', 33.75],
  [48, 56, '240X SLOWER', 'cyan', 112.5],
  [56, 72, '75X SLOWER', 'cyan', 360],
  [72, 89, 'REAL SPEED', 'pink', null],
];
const secAt = (b) => SPEEDS.find((s) => b >= s[0] && b < s[1]) || SPEEDS[SPEEDS.length - 1];
export function speedTag(b) { const s = secAt(b); return [s[2], s[3]]; }
export const isReal = (b) => secAt(b)[4] === null;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
const hash = (n) => { const h = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return h - Math.floor(h); };
const TH8 = 990; // shaft angle at beat 8 -> hero face starts intake exactly at beat 16
export function shaftDeg(b, frame = 0) {
  if (isReal(b)) return hash(frame) * 1080;
  let a = TH8;
  for (const [s, e, , , r] of SPEEDS) { if (r === null || b <= s) continue; a += (Math.min(b, e) - s) * r; }
  return a;
}
// power strokes: some face reaches the top waist when shaft angle = 90 (mod 360)
function crossings(target, period) {
  const o = [];
  for (const [s, e, , , r] of SPEEDS) { if (r === null) continue; const a0 = shaftDeg(s + 1e-9); let k = Math.ceil((a0 - target) / period - 1e-9);
    for (;;) { const bb = s + (target + period * k - a0) / r; if (bb >= e - 1e-9) break; if (bb >= s - 1e-9) o.push(+bb.toFixed(4)); k++; } }
  return o;
}
export const BANGS = crossings(90, 360);
export const HERO_BANG = 32;
export const HOOK_SHOTS = ['wide', 'rotorClose', 'sparkClose', 'portsClose', 'apexClose', 'side3q', 'plate', 'shaftClose'];
export function xray(b) { return b >= 56 && b < 64 ? ease((b - 56.3) / 0.8) : 0; } // rotor face fades to show the gears
