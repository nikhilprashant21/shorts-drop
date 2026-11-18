// "How a 4-stroke car engine works" - 100 BPM (beat = 0.6 s). Real idle 800 RPM.
// 8X slower = 100 rpm = 1 crank turn per beat; 16X = half a turn (1 stroke) per beat; 128X = 1 stroke per 8 beats.
// Each stroke = half a crank turn; camshaft turns at half crank speed; spark just before TDC.
// Cycle angle: intake 0-180, compression 180-360, power 360-540, exhaust 540-720.
// 6,000 rpm = 100 turns/s = 200 piston reversals/s. Inline-4 firing order 1-3-4-2. Compression ~10:1.
export const FPS = 30, BPM = 100, B = 0.6, DUR_BEATS = 80, DURATION = 80 * 0.6;
export const SCENE_BARS = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 20]];

const L = (text, size, color, d, font) => ({ text, size, color, d, font });
const S = (text, d, color = 'cream') => L(text, 24, color, d, 'silk');
export const CAPTIONS = [
  { t0: 0, t1: 7.9, lines: [L('HOW A CAR ENGINE', 32, 'cream', 0), L('MAKES POWER', 40, 'amber', 2), S('800 RPM. JUST IDLING.', 4, 'pink')] },
  { t0: 8, t1: 15.9, lines: [L('ONE CYLINDER', 32, 'cream', 0), L('4 STROKES', 40, 'amber', 1), S('SUCK. SQUEEZE. BANG. BLOW.', 3, 'cyan')] },
  { t0: 16, t1: 23.9, lines: [{ ...L('SUCK', 40, 'cyan', 0), badge: '1/4' }, S('THE PISTON SLIDES DOWN', 1), S('THE INTAKE VALVE OPENS', 2), S('AIR + FUEL RUSH IN', 4, 'cyan')] },
  { t0: 24, t1: 31.9, lines: [{ ...L('SQUEEZE', 40, 'amber', 0), badge: '2/4' }, S('BOTH VALVES SHUT', 1), S('THE PISTON RISES AND', 2), S('SQUEEZES IT 10X SMALLER', 4, 'amber')] },
  { t0: 32, t1: 39.9, lines: [{ ...L('BANG', 40, 'pink', 0), badge: '3/4' }, S('A SPARK LIT IT', 1), S('BURNING GAS SHOVES', 2), S('THE PISTON DOWN', 3), S('THE ONLY STROKE THAT PUSHES', 5, 'pink')] },
  { t0: 40, t1: 47.9, lines: [{ ...L('BLOW', 40, 'mint', 0), badge: '4/4' }, S('THE EXHAUST VALVE OPENS', 1), S('THE PISTON PUSHES', 2), S('THE BURNT GAS OUT', 3), S('...AND REPEAT', 5, 'mint')] },
  { t0: 48, t1: 55.9, lines: [L('2 CRANK TURNS', 32, 'cream', 0), L('= 1 BANG', 40, 'pink', 1), S('SO THE CAMSHAFT', 3), S('SPINS AT HALF SPEED', 4, 'amber')] },
  { t0: 56, t1: 63.9, lines: [L('4 CYLINDERS', 32, 'cream', 0), L('TAKE TURNS', 40, 'amber', 1), S('FIRING ORDER 1-3-4-2', 3, 'cyan'), S('A BANG EVERY HALF TURN', 5)] },
  { t0: 64, t1: 71.9, lines: [L('AT 6,000 RPM', 40, 'pink', 0), S('EACH PISTON STOPS', 1), S('AND REVERSES', 2), S('200 TIMES A SECOND', 3, 'pink')] },
  { t0: 72, t1: 80.5, lines: [L('SUCK. SQUEEZE.', 32, 'cyan', 0), L('BANG. BLOW.', 40, 'pink', 1), S('4 CYLINDERS. ALL DAY LONG.', 3, 'amber')] },
];
export const LABELS = [
  { id: 'piston', text: 'PISTON', t0: 10, t1: 15.9, side: 'R', y: 0.62, color: 'cream' },
  { id: 'spark', text: 'SPARK PLUG', t0: 11, t1: 15.9, side: 'R', y: 0.40, color: 'yellow' },
  { id: 'valves', text: 'VALVES', t0: 12, t1: 15.9, side: 'L', y: 0.44, color: 'violet' },
  { id: 'crank', text: 'CRANKSHAFT', t0: 13, t1: 15.9, side: 'L', y: 0.74, color: 'amber' },
  { id: 'inV', text: 'INTAKE VALVE', t0: 17, t1: 23.9, side: 'L', y: 0.40, color: 'cyan' },
  { id: 'mix', text: 'AIR + FUEL', t0: 18, t1: 23.9, side: 'R', y: 0.56, color: 'cyan' },
  { id: 'shut', text: 'VALVES SHUT', t0: 25, t1: 31.9, side: 'R', y: 0.40, color: 'amber' },
  { id: 'hot', text: 'HOT GAS', t0: 33, t1: 39.9, side: 'R', y: 0.50, color: 'pink' },
  { id: 'exV', text: 'EXHAUST VALVE', t0: 41, t1: 47.9, side: 'R', y: 0.40, color: 'mint' },
  { id: 'burnt', text: 'BURNT GAS', t0: 42, t1: 47.9, side: 'L', y: 0.56, color: 'mint' },
  { id: 'crankP', text: 'CRANK: 2 TURNS', t0: 49, t1: 55.9, side: 'L', y: 0.76, color: 'amber' },
  { id: 'camP', text: 'CAM: 1 TURN', t0: 50, t1: 55.9, side: 'R', y: 0.44, color: 'cyan' },
];
// [b0, b1, tag, colour, crank degrees per beat (null = real speed)]
export const SPEEDS = [
  [0, 8, 'REAL SPEED', 'pink', null],
  [8, 16, '8X SLOWER', 'cyan', 360],
  [16, 48, '128X SLOWER', 'violet', 22.5],
  [48, 56, '16X SLOWER', 'cyan', 180],
  [56, 64, '8X SLOWER', 'cyan', 360],
  [64, 81, 'REAL SPEED', 'pink', null],
];
const secAt = (b) => SPEEDS.find((s) => b >= s[0] && b < s[1]) || SPEEDS[SPEEDS.length - 1];
export function speedTag(b) { const s = secAt(b); return [s[2], s[3]]; }
export const isReal = (b) => secAt(b)[4] === null;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
const hash = (n) => { const h = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return h - Math.floor(h); };
// crank angle in degrees (cycle angle mod 720). Real-speed frames get a random angle (reads as blur, no wagon-wheel).
export function crankDeg(b, frame = 0) {
  if (isReal(b)) return hash(frame) * 720;
  let a = 0;
  for (const [s, e, , , r] of SPEEDS) { if (r === null || b <= s) continue; a += (Math.min(b, e) - s) * r; }
  return a;
}
// times (beats) where the crank angle crosses target (mod 720) in slow sections
function crossings(target) {
  const o = [];
  for (const [s, e, , , r] of SPEEDS) {
    if (r === null) continue; const a0 = crankDeg(s + 1e-9);
    let k = Math.ceil((a0 - target) / 720 - 1e-9);
    for (;;) { const a = target + 720 * k, bb = s + (a - a0) / r; if (bb >= e - 1e-9) break; if (bb >= s - 1e-9) o.push(+bb.toFixed(4)); k++; }
  }
  return o;
}
export const BANGS = crossings(360);          // this cylinder's power strokes (TDC after compression)
export const SPARKS = crossings(350);         // spark 10 deg before TDC
export const IN_CLOSE = crossings(210), EX_OPEN = crossings(520), IN_OPEN = crossings(710), EX_CLOSE = crossings(20);
export const ALL_BANGS = (() => { const o = []; for (let b = 56; b < 64; b += 0.5) o.push(b); return o; })(); // 4 cylinders, 1 bang per half turn
export const HOOK_SHOTS = ['wide', 'pistonClose', 'sparkClose', 'valvesClose', 'crankClose', 'beltBack', 'coverTop', 'side3q'];
