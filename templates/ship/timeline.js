// "How a 100,000 HP ship engine works" - 102 BPM so REAL SPEED (102 rpm) = one bang per beat. Times in BEATS.
export const FPS = 30, BPM = 102, B = 60 / 102, DUR_BEATS = 96, DURATION = 96 * B;
export const SCENE_BARS = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 20], [20, 22], [22, 24]];
// Facts: RT-flex96C 14-cyl 107,390 hp @ 102 rpm; uniflow scavenged; hydraulic exhaust valves, no camshaft;
// crosshead bearings; direct drive, reversed by running the engine backwards; BSFC 171 g/kWh (~50% efficient);
// Emma Maersk, a quarter-mile-long ship; can run for up to 25 years.

const L = (text, size, color, d, font) => ({ text, size, color, d, font });
const S = (text, d, color = 'cream') => L(text, 24, color, d, 'silk');
export const CAPTIONS = [
  { t0: 0, t1: 7.9, lines: [L('HOW DOES A', 32, 'cream', 0), L('SHIP ENGINE', 40, 'amber', 2), L('ACTUALLY WORK?', 32, 'cream', 4)] },
  { t0: 8, t1: 15.9, lines: [L('IT LIVES HERE:', 32, 'cream', 0), L('THE VERY BOTTOM', 32, 'amber', 1), S('ONE ENGINE. ONE PROPELLER.', 4), S('107,390 HP.', 5, 'pink')] },
  { t0: 16, t1: 19.9, lines: [L('2-STROKE:', 32, 'cream', 0), L('A BANG EVERY', 40, 'orange', 1), L('SINGLE TURN', 40, 'orange', 2)] },
  { t0: 20, t1: 23.9, lines: [L('NO SPARK PLUGS.', 32, 'cream', 0), S("LET'S SLOW IT DOWN", 2, 'cyan')] },
  { t0: 24, t1: 31.9, lines: [{ ...L('BANG', 40, 'orange', 0), badge: '1/4' }, S('FUEL SPRAYS INTO RED-HOT AIR', 1), S('AND LIGHTS ITSELF', 2), S('THE BLAST SHOVES THE PISTON DOWN', 4, 'amber')] },
  { t0: 32, t1: 39.9, lines: [{ ...L('OUT', 40, 'violet', 0), badge: '2/4' }, S('THE EXHAUST VALVE OPENS', 1), S('HOT GAS RUSHES OUT THE TOP', 2)] },
  { t0: 40, t1: 47.9, lines: [{ ...L('AIR IN', 40, 'mint', 0), badge: '3/4' }, S('PISTON UNCOVERS THE PORTS', 1), S('FRESH AIR SWIRLS IN', 2), S('AND PUSHES OLD GAS UP AND OUT', 3, 'mint')] },
  { t0: 48, t1: 55.9, lines: [{ ...L('SQUEEZE', 40, 'yellow', 0), badge: '4/4' }, S('VALVE SHUTS, PISTON RISES', 1), S('AIR GETS HOT ENOUGH', 2), S('TO LIGHT FUEL...', 3, 'yellow')] },
  { t0: 57, t1: 63.9, lines: [L('THE TURBO', 40, 'amber', 0), S('EXHAUST SPINS A TURBINE', 1, 'violet'), S('WHICH BLOWS FRESH AIR', 2, 'mint'), S('BACK INTO THE ENGINE', 3, 'mint')] },
  { t0: 64, t1: 71.9, lines: [L('WHY SO TALL?', 32, 'cream', 0), L('THE CROSSHEAD', 40, 'amber', 1), S('IT TAKES THE SIDEWAYS SHOVE', 2), S('SO THE PISTON ONLY MOVES STRAIGHT', 3, 'amber')] },
  { t0: 72, t1: 79.9, lines: [L('NO GEARBOX', 40, 'cream', 0), S('THE PROPELLER TURNS', 1), S('AT THE SAME 102 RPM', 2, 'cyan'), S('REVERSE? RUN THE ENGINE BACKWARDS', 6, 'pink')] },
  { t0: 80, t1: 87.9, lines: [L('ABOUT 50%', 40, 'mint', 0), S('OF THE FUEL BECOMES MOTION', 1), S('MOST CAR ENGINES: UNDER 40%', 3, 'pink')] },
  { t0: 88, t1: 96.5, lines: [L('SLOW.', 40, 'cream', 0), L('HUGE.', 40, 'cream', 1), L('RUNS FOR 25 YEARS.', 32, 'amber', 2), S('AND IT MOVES THE WORLD.', 4, 'cyan')] },
];
export const LABELS = [
  { id: 'engineInShip', text: 'MAIN ENGINE', t0: 10, t1: 15.9, side: 'L', y: 0.66, color: 'amber' },
  { id: 'prop', text: 'PROPELLER', t0: 12, t1: 15.9, side: 'R', y: 0.74, color: 'cyan' },
  { id: 'propHall', text: 'PROPELLER', t0: 73.5, t1: 79.9, side: 'R', y: 0.62, color: 'cyan' },
  { id: 'injector', text: 'FUEL INJECTOR', t0: 25, t1: 31.9, side: 'R', y: 0.44, color: 'orange' },
  { id: 'valve', text: 'EXHAUST VALVE', t0: 33, t1: 39.9, side: 'R', y: 0.44, color: 'violet' },
  { id: 'ports', text: 'AIR PORTS', t0: 41, t1: 47.9, side: 'R', y: 0.62, color: 'mint' },
  { id: 'turbine', text: 'TURBINE', t0: 58, t1: 63.9, side: 'L', y: 0.66, color: 'violet' },
  { id: 'compressor', text: 'COMPRESSOR', t0: 59, t1: 63.9, side: 'R', y: 0.66, color: 'mint' },
  { id: 'crosshead', text: 'CROSSHEAD', t0: 65, t1: 71.9, side: 'L', y: 0.62, color: 'amber' },
  { id: 'shaft', text: 'SHAFT', t0: 73, t1: 79.9, side: 'L', y: 0.70, color: 'cream' },
];
export function speedTag(b) {
  if (b < 8) return ['REAL SPEED', 'pink'];
  if (b >= 16 && b < 20) return ['REAL SPEED', 'pink'];
  if (b >= 20 && b < 24) return ['2X SLOWER', 'cyan'];
  if (b >= 24 && b < 56) return ['SLOW-MO', 'cyan'];
  if (b >= 56 && b < 57) return ['REAL SPEED', 'pink'];
  if (b >= 64 && b < 72) return ['4X SLOWER', 'cyan'];
  if (b >= 72 && b < 80) return ['REAL SPEED', 'pink'];
  return null;
}
// crank angle (deg, 0 = TDC). Real = 360/beat. Walkthrough: BANG 360->470, OUT 470->510, AIR IN 510->600, SQUEEZE 600->720.
export function crankDeg(b) {
  const segs = [[0, 20, 360], [20, 24, 180]];
  let a = 0;
  for (const [s, e, v] of segs) if (b > s) a += (Math.min(b, e) - s) * v;
  if (b <= 24) return a;
  const base = a; // = 16*360 + ... multiple of 360 (TDC)
  const walk = [[24, 32, 0, 110], [32, 40, 110, 150], [40, 48, 150, 240], [48, 56, 240, 360]];
  for (const [s, e, p0, p1] of walk) if (b <= e) return base + p0 + (p1 - p0) * (b - s) / (e - s);
  let c = base + 360;
  if (b <= 64) return c + (b - 56) * 360;          // turbo section (cutaway hidden), real speed
  c += 8 * 360;
  if (b <= 72) return c + (b - 64) * 90;            // crosshead, 4x slower
  c += 8 * 90;
  if (b <= 78) return c + (b - 72) * 360;           // direct drive, real speed
  c += 6 * 360;
  if (b <= 78.75) { const u = (b - 78) / 0.75; return c + 270 * (u - u * u / 2); } // stop
  c += 135;
  if (b <= 79.25) return c;
  const u = Math.min(1, (b - 79.25) / 0.75); return c - 270 * (u * u / 2) - Math.max(0, b - 80) * 360; // astern
}
export const isBackwards = (b) => b >= 79.25;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
export const HOOK_SHOTS = ['shipBow', 'pistonClose', 'shipStack', 'crankClose', 'turboClose', 'shipSide', 'coversClose', 'propClose'];
export function cutawayVisible(b) {
  if (b < 8) { const s = HOOK_SHOTS[Math.floor(b)]; return s === 'pistonClose' || s === 'crankClose'; }
  return (b >= 16 && b < 57) || (b >= 64 && b < 72);
}
// TDC crossings (bangs) inside cutaway shots
export const BANGS = (() => {
  const o = [];
  for (let b = 0; b <= 72; b += 0.25) { const r = crankDeg(b) / 360; if (Math.abs(r - Math.round(r)) < 1e-6 && cutawayVisible(b + 0.001)) o.push(b); }
  return o;
})();
export const EFF = [80.5, 82.5]; // efficiency bars animate
