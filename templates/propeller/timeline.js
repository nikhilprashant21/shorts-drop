// "How a ship propeller works" - 102 BPM: the Emma Maersk-class prop turns at 102 rpm, so REAL SPEED = 1 turn per beat.
// Facts: Emma Maersk propeller 9.6 m, 6 blades, ~131 t, cast in one piece (MMG, Guinness largest by weight); shaft over 100 m;
// RT-flex96C direct drive at 102 rpm (no gearbox). Cavitation: low pressure on the blade back boils water -> bubbles collapse, pit metal.
export const FPS = 30, BPM = 102, B = 60 / 102, DUR_BEATS = 80, DURATION = 80 * 60 / 102;
export const SCENE_BARS = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 20]];
const L = (text, size, color, d, font) => ({ text, size, color, d, font });
const S = (text, d, color = 'cream') => L(text, 24, color, d, 'silk');
export const CAPTIONS = [
  { t0: 0, t1: 7.9, lines: [L('HOW A SHIP', 32, 'cream', 0), L('PROPELLER WORKS', 32, 'amber', 2), S('SPINNING IN REAL TIME', 4, 'cyan')] },
  { t0: 8, t1: 15.9, lines: [L('9.6 M ACROSS', 40, 'amber', 0), S('131 TONNES OF BRONZE,', 1), S('6 BLADES, ONE PIECE', 2), S('THE HEAVIEST EVER CAST', 4, 'cyan')] },
  { t0: 16, t1: 23.9, lines: [{ ...L('TWIST', 40, 'amber', 0), badge: '1/4' }, S('EACH BLADE IS A WING,', 1), S('TWISTED LIKE A FAN BLADE:', 2), S('STEEP AT THE HUB,', 3), S('FLAT AT THE FAST TIP', 4, 'amber')] },
  { t0: 24, t1: 31.9, lines: [{ ...L('GRAB', 40, 'cyan', 0), badge: '2/4' }, S('AS IT SPINS, EACH BLADE', 1), S('SCOOPS WATER IN FRONT', 2), S('AND HURLS IT BACKWARDS', 3, 'cyan')] },
  { t0: 32, t1: 39.9, lines: [{ ...L('PUSH', 40, 'pink', 0), badge: '3/4' }, S('WATER GOES BACK...', 1), S('SO THE SHIP GOES FORWARD', 2, 'pink'), S('A THRUST BEARING HANDS', 4), S('THE PUSH TO THE HULL', 5)] },
  { t0: 40, t1: 47.9, lines: [{ ...L('SCREW', 40, 'mint', 0), badge: '4/4' }, S('LIKE A SCREW IN WOOD,', 1), S('EVERY TURN WORKS', 2), S('THE SHIP FORWARD', 3, 'mint'), S('THROUGH THE WATER', 4)] },
  { t0: 48, t1: 55.9, lines: [L('WHY SO SLOW?', 32, 'cream', 0), S('SPIN TOO FAST AND WATER', 1), S('BOILS ON THE BLADES', 2, 'pink'), S('THE BUBBLES POP', 4), S('AND EAT THE METAL', 5, 'pink')] },
  { t0: 56, t1: 63.9, lines: [L('102 RPM', 40, 'amber', 0), S('STRAIGHT FROM THE ENGINE,', 1), S('NO GEARBOX,', 2), S('ON A SHAFT OVER 100 M LONG', 3, 'cyan')] },
  { t0: 64, t1: 71.9, lines: [L('BIG AND SLOW', 32, 'cream', 0), S('MOVING LOTS OF WATER GENTLY', 1), S('BEATS A LITTLE WATER FAST', 2, 'mint')] },
  { t0: 72, t1: 80.5, lines: [L('6 TWISTED WINGS.', 32, 'cream', 0), L('ONE GIANT SCREW.', 32, 'amber', 1), S('PUSHING A CITY OF BOXES', 3, 'cyan')] },
];
export const LABELS = [
  { id: 'hub', text: 'HUB', t0: 10, t1: 15.9, side: 'L', y: 0.56, color: 'amber' },
  { id: 'blade', text: 'BLADE', t0: 11, t1: 15.9, side: 'R', y: 0.42, color: 'amber' },
  { id: 'diver', text: 'DIVER: 1.8 M', t0: 12, t1: 15.9, side: 'R', y: 0.70, color: 'cyan' },
  { id: 'rudder', text: 'RUDDER', t0: 13, t1: 15.9, side: 'L', y: 0.74, color: 'cream' },
  { id: 'thrust', text: 'THRUST BEARING', t0: 36, t1: 39.9, side: 'R', y: 0.44, color: 'pink' },
  { id: 'bubbles', text: 'BUBBLES', t0: 50, t1: 55.9, side: 'R', y: 0.50, color: 'pink' },
  { id: 'engine', text: 'ENGINE', t0: 57, t1: 63.9, side: 'R', y: 0.62, color: 'amber' },
  { id: 'shaft', text: 'SHAFT', t0: 58, t1: 63.9, side: 'L', y: 0.66, color: 'cyan' },
];
// [b0, b1, tag, colour, prop degrees per beat (null = fast blur)]
export const SPEEDS = [
  [0, 16, 'REAL SPEED', 'pink', 360], [16, 24, '2X SLOWER', 'cyan', 180], [24, 48, '4X SLOWER', 'violet', 90],
  [48, 56, 'WHAT IF: 3X FASTER', 'pink', null], [56, 81, 'REAL SPEED', 'pink', 360],
];
const secAt = (b) => SPEEDS.find((s) => b >= s[0] && b < s[1]) || SPEEDS[SPEEDS.length - 1];
export function speedTag(b) { const s = secAt(b); return [s[2], s[3]]; }
export const isBlur = (b) => secAt(b)[4] === null;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
const hash = (n) => { const h = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return h - Math.floor(h); };
export function propDeg(b, frame = 0) {
  if (isBlur(b)) return hash(frame) * 360;
  let a = 0; for (const [s, e, , , r] of SPEEDS) { if (r === null || b <= s) continue; a += (Math.min(b, e) - s) * r; } return a;
}
// blade passes the top (12 o'clock) = whoosh; 6 blades -> every 60 degrees
export const PASSES = (() => { const o = []; for (let b = 0; b < 80; b += 1 / 12) { if (isBlur(b)) continue; const a0 = propDeg(b), a1 = propDeg(b + 1 / 12); if (Math.floor(a1 / 60) > Math.floor(a0 / 60)) o.push(+(b + (60 * Math.floor(a1 / 60) - a0) / ((a1 - a0) / (1 / 12))).toFixed(4)); } return o; })();
export const PUSH = 32;
export const HOOK_SHOTS = ['shipWide', 'propUnder', 'hub', 'tipClose', 'wake', 'diverScale', 'sternAbove', 'propSide'];
export const underwater = (b) => { if (b < 8) return !['shipWide', 'wake', 'sternAbove'].includes(HOOK_SHOTS[Math.floor(b)]); return !(b >= 64 && b < 72); };
