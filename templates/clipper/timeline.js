// "How a hair clipper works" - 136 BPM. Real motor: 6,800 RPM (BaBylissPRO GoldFX+ class) = 13,600 strokes/min.
// At 136 BPM: 50X slower = 1 turn per beat, 100X slower = 1 stroke per beat, 200X slower = 1 stroke per 2 beats.
// Facts: rotary motor turns an off-centre (eccentric) pin; pin rides in a U-shaped fork/slot on the cutter drive,
// so only the side-to-side part of the circle moves the moving blade over the fixed blade. 1 turn = 2 strokes.
// 13,600 / 60 = 227 strokes per second.
export const FPS = 30, BPM = 136, B = 60 / 136, DUR_BEATS = 88, DURATION = 88 * B;
export const SCENE_BARS = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 20], [20, 22]];

const L = (text, size, color, d, font) => ({ text, size, color, d, font });
const S = (text, d, color = 'cream') => L(text, 24, color, d, 'silk');
export const CAPTIONS = [
  { t0: 0, t1: 7.9, lines: [L('HOW DOES A', 32, 'cream', 0), L('HAIR CLIPPER', 40, 'amber', 2), L('ACTUALLY CUT?', 32, 'cream', 4)] },
  { t0: 8, t1: 15.9, lines: [L('INSIDE THE GOLD', 32, 'cream', 0), L('ONE MOTOR', 40, 'amber', 1), S('AND TWO BLADES', 2), S('NO GEARBOX. NO MAGIC.', 5, 'cyan')] },
  { t0: 16, t1: 23.9, lines: [L('6,800 RPM', 40, 'pink', 0), S('13,600 BLADE STROKES A MINUTE', 1), S('TOO FAST TO SEE...', 2), S("LET'S SLOW IT DOWN", 4, 'cyan')] },
  { t0: 24, t1: 31.9, lines: [{ ...L('SPIN', 40, 'amber', 0), badge: '1/4' }, S('THE MOTOR TURNS A PIN', 1), S('THAT SITS OFF-CENTRE', 2), S('SO IT RIDES IN A CIRCLE', 4, 'amber')] },
  { t0: 32, t1: 39.9, lines: [{ ...L('SWING', 40, 'mint', 0), badge: '2/4' }, S('THE PIN SITS IN A FORK', 1), S('IT SLIDES FREE FRONT TO BACK', 2), S('SO IT ONLY SHOVES SIDEWAYS', 4, 'mint')] },
  { t0: 40, t1: 47.9, lines: [{ ...L('SLIDE', 40, 'cyan', 0), badge: '3/4' }, S('THE FORK DRAGS THE', 1), S('MOVING BLADE LEFT, RIGHT', 2), S('THE FIXED BLADE STAYS PUT', 4, 'cyan')] },
  { t0: 48, t1: 55.9, lines: [{ ...L('SNIP', 40, 'yellow', 0), badge: '4/4' }, S('HAIR SLIPS BETWEEN TEETH', 1), S('THE MOVING BLADE CLOSES', 2), S('THE GAP AND SHEARS IT', 3), S('LIKE TINY SCISSORS', 4, 'yellow')] },
  { t0: 56, t1: 63.9, lines: [L('1 TURN =', 32, 'cream', 0), L('2 STROKES', 40, 'cyan', 1), S('6,800 RPM X 2', 4), S('= 13,600 A MINUTE', 5, 'amber')] },
  { t0: 64, t1: 71.9, lines: [L('THAT BUZZ?', 40, 'cream', 0), S('IS THE BLADE SLIDING', 1), S('227 TIMES A SECOND', 2, 'pink')] },
  { t0: 72, t1: 79.9, lines: [L('SPIN.', 40, 'amber', 0), L('SWING.', 40, 'mint', 1), L('SNIP.', 40, 'pink', 2)] },
  { t0: 80, t1: 88.5, lines: [L('FIT FOR', 32, 'cream', 0), L('A KING.', 40, 'amber', 1), S('EVERY TURN = 2 CUTS', 3, 'cyan')] },
];
export const LABELS = [
  { id: 'motor', text: 'MOTOR', t0: 13, t1: 15.9, side: 'L', y: 0.66, color: 'amber' },
  { id: 'blades', text: 'BLADES', t0: 14, t1: 15.9, side: 'R', y: 0.40, color: 'cyan' },
  { id: 'motorC', text: 'MOTOR', t0: 25, t1: 31.9, side: 'L', y: 0.72, color: 'amber' },
  { id: 'pin', text: 'OFF-CENTRE PIN', t0: 26, t1: 31.9, side: 'R', y: 0.50, color: 'pink' },
  { id: 'fork', text: 'FORK', t0: 33, t1: 39.9, side: 'R', y: 0.46, color: 'mint' },
  { id: 'pin2', text: 'PIN', t0: 34, t1: 39.9, side: 'L', y: 0.66, color: 'pink' },
  { id: 'cutter', text: 'MOVING BLADE', t0: 41, t1: 47.9, side: 'L', y: 0.74, color: 'cyan' },
  { id: 'fixed', text: 'FIXED BLADE', t0: 42, t1: 47.9, side: 'R', y: 0.80, color: 'amber' },
];
// speed sections: [b0, b1, tag, colour, rad per beat (null = real speed blur)]
export const SPEEDS = [
  [0, 20, 'REAL SPEED', 'pink', null],
  [20, 24, '50X SLOWER', 'cyan', 2 * Math.PI],
  [24, 48, '100X SLOWER', 'cyan', Math.PI],
  [48, 56, '200X SLOWER', 'violet', Math.PI / 2],
  [56, 60, '100X SLOWER', 'cyan', Math.PI],
  [60, 89, 'REAL SPEED', 'pink', null],
];
const secAt = (b) => SPEEDS.find((s) => b >= s[0] && b < s[1]) || SPEEDS[SPEEDS.length - 1];
export function speedTag(b) { const s = secAt(b); return [s[2], s[3]]; }
export const isReal = (b) => secAt(b)[4] === null;
// motor angle (rad). Slow sections start at pi/2 so the blade sits at a stroke end on every beat.
export function motorAngle(b, frame) {
  if (isReal(b)) { const h = Math.sin(frame * 12.9898 + 78.233) * 43758.5453; return (h - Math.floor(h)) * Math.PI * 2; }
  let a = Math.PI / 2;
  for (const [s, e, , , r] of SPEEDS) { if (r === null || b <= s) continue; a += (Math.min(b, e) - s) * r; }
  return a;
}
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
// stroke ends (blade fully across a gap) in slow sections = beats where the angle hits pi/2 + n*pi
export const STROKES = (() => {
  const o = [];
  for (let b = 20; b < 60; b += 0.5) { const k = (motorAngle(b, 0) - Math.PI / 2) / Math.PI; if (Math.abs(k - Math.round(k)) < 1e-6) o.push(b); }
  return o;
})();
export const CUTS = [50, 52, 54];           // hair snipped on screen (200X section)
export const HOOK_SHOTS = ['heroLow', 'bladeMacro', 'xrayMotor', 'camMacro', 'topDown', 'plate', 'wide', 'bladeSide'];
export function xray(b) {
  if (b < 8) { const s = HOOK_SHOTS[Math.floor(b)]; return s === 'xrayMotor' || s === 'camMacro' ? 1 : 0; }
  if (b >= 12 && b < 16) return ease((b - 12) / 1.5);
  if (b >= 20 && b < 40) return 1;
  if (b >= 56 && b < 64) return 1;
  return 0;
}
export const CROWN_LAND = 76;
