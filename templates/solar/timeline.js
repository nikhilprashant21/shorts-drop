// "How a solar panel turns light into power" - 120 BPM. Facts: ~0.6 V per silicon cell at max power; 60 cells in series ~36 V;
// silicon band gap ~1.1 eV (extra photon energy -> heat); commercial panels ~20% (about 1/5); single-junction limit ~33%.
export const FPS = 30, BPM = 120, B = 0.5, DUR_BEATS = 88, DURATION = 44;
export const SCENE_BARS = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 20], [20, 22]];
const L = (text, size, color, d, font) => ({ text, size, color, d, font });
const S = (text, d, color = 'cream') => L(text, 24, color, d, 'silk');
export const CAPTIONS = [
  { t0: 0, t1: 7.9, lines: [L('HOW A SOLAR PANEL', 32, 'cream', 0), L('MAKES POWER', 40, 'amber', 2), S('FROM PLAIN SUNLIGHT', 4, 'cyan')] },
  { t0: 8, t1: 15.9, lines: [L('60 CELLS', 32, 'cream', 0), L('IN A ROW', 40, 'amber', 1), S("LET'S ZOOM INTO ONE...", 3, 'cyan')] },
  { t0: 16, t1: 23.9, lines: [{ ...L('SANDWICH', 40, 'amber', 0), badge: '1/4' }, S('TWO KINDS OF SILICON', 1), S('TOP: SPARE ELECTRONS', 2, 'cyan'), S('BOTTOM: MISSING ONES', 3, 'pink'), S('WHERE THEY MEET: A ONE-WAY WALL', 5, 'amber')] },
  { t0: 24, t1: 31.9, lines: [{ ...L('HIT', 40, 'yellow', 0), badge: '2/4' }, S('A PHOTON SMASHES IN', 1), S('AND KNOCKS AN ELECTRON', 2), S('LOOSE, LEAVING A HOLE', 3), S('ANY EXTRA ENERGY = HEAT', 5, 'pink')] },
  { t0: 32, t1: 39.9, lines: [{ ...L('SORT', 40, 'cyan', 0), badge: '3/4' }, S('THE WALL SORTS THEM:', 1), S('ELECTRONS UP,', 2, 'cyan'), S('HOLES DOWN', 3, 'pink'), S('= ~0.6 VOLTS PER CELL', 5, 'amber')] },
  { t0: 40, t1: 47.9, lines: [{ ...L('FLOW', 40, 'mint', 0), badge: '4/4' }, S('GIVE THEM A WIRE...', 1), S('ELECTRONS RACE ROUND', 2), S('TO REFILL THE HOLES', 3), S('THAT FLOW IS POWER', 5, 'yellow')] },
  { t0: 48, t1: 55.9, lines: [L('0.6 V X 60', 32, 'cream', 0), L('= ~36 VOLTS', 40, 'amber', 1), S('CELLS CHAINED IN A ROW', 3)] },
  { t0: 56, t1: 63.9, lines: [L('ONLY ~1/5', 40, 'pink', 0), S('OF THE LIGHT BECOMES POWER', 1), S('THE REST: HEAT + REFLECTION', 2), S('EVEN A PERFECT CELL: ~33%', 4, 'amber')] },
  { t0: 64, t1: 71.9, lines: [L("IT'S DC", 40, 'cyan', 0), S('AN INVERTER FLIPS IT', 1), S('INTO AC FOR YOUR HOME', 2, 'amber')] },
  { t0: 72, t1: 79.9, lines: [L('NO MOVING PARTS.', 32, 'cream', 0), L('JUST LIGHT', 40, 'amber', 1), S('KNOCKING ELECTRONS LOOSE', 2, 'cyan')] },
  { t0: 80, t1: 88.5, lines: [L('NO FUEL.', 32, 'cream', 0), L('NO NOISE.', 32, 'cream', 1), S('SUNLIGHT IN, POWER OUT.', 3, 'yellow')] },
];
export const LABELS = [
  { id: 'cell', text: 'ONE CELL', t0: 10, t1: 15.9, side: 'R', y: 0.56, color: 'amber' },
  { id: 'bus', text: 'SILVER WIRES', t0: 11, t1: 15.9, side: 'L', y: 0.64, color: 'cream' },
  { id: 'nl', text: 'N-TYPE', t0: 18, t1: 23.9, side: 'L', y: 0.44, color: 'cyan' },
  { id: 'pl', text: 'P-TYPE', t0: 19, t1: 23.9, side: 'L', y: 0.66, color: 'pink' },
  { id: 'wall', text: 'ONE-WAY WALL', t0: 21, t1: 39.9, side: 'R', y: 0.48, color: 'amber' },
  { id: 'eln', text: 'ELECTRON', t0: 29, t1: 39.9, side: 'R', y: 0.40, color: 'yellow' },
  { id: 'hol', text: 'HOLE', t0: 29.5, t1: 39.9, side: 'L', y: 0.72, color: 'cream' },
  { id: 'bulb', text: 'YOUR LAMP', t0: 42, t1: 47.9, side: 'R', y: 0.40, color: 'yellow' },
  { id: 'inv', text: 'INVERTER', t0: 65, t1: 71.9, side: 'L', y: 0.52, color: 'cyan' },
];
export const SPEEDS = [[0, 8, 'REAL SPEED', 'pink'], [8, 16, 'ZOOMING IN', 'cyan'], [16, 48, 'ATOM SCALE, SLOW-MO', 'violet'], [48, 72, 'PANEL SCALE', 'cyan'], [72, 89, 'REAL SPEED', 'pink']];
export function speedTag(b) { const s = SPEEDS.find((x) => b >= x[0] && b < x[1]) || SPEEDS[SPEEDS.length - 1]; return [s[2], s[3]]; }
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
export const inAtom = (b) => b >= 16 && b < 48;
export const HIT = 28, SWEEP = 32, VOLT = 36, WIRE = 40, LAMP = 42;
export const RAIN = (() => { const o = []; for (let b = 41; b < 48; b += 0.5) o.push(b); return o; })(); // photon hits during FLOW (one per half beat)
export const HOOK_SHOTS = ['roofWide', 'cells', 'sun', 'inverter', 'busbar', 'frameLabel', 'cables', 'roofHigh'];
