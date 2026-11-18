// "How a transformer steps up voltage" - 120 BPM (beat 0.5 s). Grid AC: 50 Hz (flips direction 100 times a second).
// 50X slower = 1 AC cycle per 2 beats, 100X = 1 cycle per bar, 200X = 1 cycle per 2 bars.
// Model: primary 4 turns, secondary 40 turns (1:10). Voltage/current ~ cos(th), core flux ~ sin(th) (EMF ~ dflux/dt).
// Real GSU transformer: 23.5 kV / 420 kV (Siemens for NTPC). Efficiency > 99%. DC: steady flux, no induced voltage.
export const FPS = 30, BPM = 120, B = 0.5, DUR_BEATS = 88, DURATION = 44;
export const SCENE_BARS = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 20], [20, 22]];
const L = (text, size, color, d, font) => ({ text, size, color, d, font });
const S = (text, d, color = 'cream') => L(text, 24, color, d, 'silk');
export const CAPTIONS = [
  { t0: 0, t1: 7.9, lines: [L('HOW A TRANSFORMER', 32, 'cream', 0), L('STEPS UP VOLTS', 40, 'amber', 2), S('NO MOVING PARTS AT ALL', 4, 'cyan')] },
  { t0: 8, t1: 15.9, lines: [L('TWO COILS', 32, 'cream', 0), L('ONE IRON RING', 40, 'amber', 1), S('THE WIRES NEVER TOUCH', 3, 'pink')] },
  { t0: 16, t1: 23.9, lines: [{ ...L('WIGGLE', 40, 'yellow', 0), badge: '1/4' }, S('AC IN THE PRIMARY FLIPS', 1), S('100 TIMES A SECOND', 2), S('ELECTRONS JUST JIGGLE', 4, 'yellow')] },
  { t0: 24, t1: 31.9, lines: [{ ...L('MAGNET', 40, 'violet', 0), badge: '2/4' }, S('THE CURRENT MAKES A MAGNET', 1), S('THE IRON CARRIES ITS FIELD', 2), S('ROUND THE RING', 3), S('...AND IT KEEPS FLIPPING', 5, 'violet')] },
  { t0: 32, t1: 39.9, lines: [{ ...L('INDUCE', 40, 'cyan', 0), badge: '3/4' }, S('A CHANGING FIELD', 1), S('PUSHES CURRENT', 2), S('IN THE OTHER COIL', 3), S('STRONGEST AS IT FLIPS', 5, 'cyan')] },
  { t0: 40, t1: 47.9, lines: [{ ...L('MULTIPLY', 40, 'pink', 0), badge: '4/4' }, S('EVERY TURN ADDS', 1), S('THE SAME FEW VOLTS', 2), S('4 TURNS IN, 40 OUT', 4, 'pink'), S('= 10X THE VOLTS', 5, 'pink')] },
  { t0: 48, t1: 55.9, lines: [L('THE CATCH', 40, 'amber', 0), S('VOLTS GO UP 10X', 1), S('CURRENT DROPS 10X', 2), S('POWER STAYS THE SAME', 4, 'amber')] },
  { t0: 56, t1: 63.9, lines: [L('SO WHY BOTHER?', 32, 'cream', 0), S('WIRES HEAT UP WITH CURRENT', 1), S('1/10 THE CURRENT', 3, 'mint'), S('= 1/100 THE HEAT LOST', 4, 'mint')] },
  { t0: 64, t1: 71.9, lines: [L('ONLY WORKS ON AC', 32, 'pink', 0), S('STEADY DC = STEADY FIELD', 1), S('THE SECONDARY GETS NOTHING', 2), S('IT HAS TO KEEP CHANGING', 5, 'cyan')] },
  { t0: 72, t1: 79.9, lines: [L('A REAL ONE:', 32, 'cream', 0), L('23,500 V IN', 32, 'cyan', 1), L('420,000 V OUT', 40, 'pink', 2), S('OVER 99% EFFICIENT', 4, 'amber')] },
  { t0: 80, t1: 88.5, lines: [L('NO MOVING PARTS.', 32, 'cream', 0), L('JUST A FLIP.', 40, 'amber', 1), S('THAT IS HOW POWER TRAVELS', 3, 'cyan')] },
];
export const LABELS = [
  { id: 'prim', text: 'PRIMARY: 4 TURNS', t0: 10, t1: 15.9, side: 'L', y: 0.74, color: 'yellow' },
  { id: 'core', text: 'IRON CORE', t0: 11, t1: 15.9, side: 'L', y: 0.44, color: 'violet' },
  { id: 'sec', text: 'SECONDARY: 40', t0: 12, t1: 15.9, side: 'R', y: 0.80, color: 'cyan' },
  { id: 'elec', text: 'ELECTRONS', t0: 17, t1: 23.9, side: 'R', y: 0.48, color: 'yellow' },
  { id: 'field', text: 'MAGNETIC FIELD', t0: 25, t1: 31.9, side: 'R', y: 0.44, color: 'violet' },
  { id: 'secC', text: 'INDUCED CURRENT', t0: 33, t1: 39.9, side: 'R', y: 0.48, color: 'cyan' },
  { id: 'lv', text: 'LOW VOLTS IN', t0: 72.5, t1: 79.9, side: 'L', y: 0.56, color: 'cyan' },
  { id: 'hv', text: 'HIGH VOLTS OUT', t0: 73.5, t1: 79.9, side: 'R', y: 0.48, color: 'pink' },
];
// [b0, b1, tag, colour, AC radians per beat (null = real speed)]
export const SPEEDS = [
  [0, 8, 'REAL SPEED', 'pink', null],
  [8, 16, '50X SLOWER', 'cyan', Math.PI],
  [16, 40, '100X SLOWER', 'cyan', Math.PI / 2],
  [40, 48, '200X SLOWER', 'violet', Math.PI / 4],
  [48, 64, '100X SLOWER', 'cyan', Math.PI / 2],
  [64, 68, 'DC: NO FLIPPING', 'amber', 0],
  [68, 72, '100X SLOWER', 'cyan', Math.PI / 2],
  [72, 89, 'REAL SPEED', 'pink', null],
];
const secAt = (b) => SPEEDS.find((s) => b >= s[0] && b < s[1]) || SPEEDS[SPEEDS.length - 1];
export function speedTag(b) { const s = secAt(b); return [s[2], s[3]]; }
export const isReal = (b) => secAt(b)[4] === null;
export const isDC = (b) => b >= 64 && b < 68;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
const hash = (n) => { const h = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return h - Math.floor(h); };
export function acAngle(b, frame = 0) {
  if (isReal(b)) return hash(frame) * Math.PI * 2;
  let a = 0;
  for (const [s, e, , , r] of SPEEDS) { if (r === null || b <= s) continue; a += (Math.min(b, e) - s) * r; }
  return a;
}
// current peaks (|cos| = 1) in slow AC sections: the beats where the angle is a multiple of pi
export const PEAKS = (() => { const o = []; for (let b = 8; b < 72; b += 0.25) { if (isReal(b) || isDC(b)) continue; const k = acAngle(b) / Math.PI; if (Math.abs(k - Math.round(k)) < 1e-6) o.push(b); } return o; })();
export const TURN_LIGHT = [41, 48]; // secondary turns light up one by one across these beats (in groups of 5 per beat... 40 turns / 7 beats)
export const HOOK_SHOTS = ['tankWide', 'bushingsHV', 'nameplate', 'fins', 'pylons', 'coilXray', 'coreClose', 'wallWide'];
export function xray(b) { if (b < 8) { const s = HOOK_SHOTS[Math.floor(b)]; return s === 'coilXray' || s === 'coreClose' ? 1 : 0; } if (b < 10) return ease((b - 8.3) / 1.4); return b >= 72 && b < 80 ? 1 - 0.7 * ease((b - 72) / 1.5) : 1; }
