// "How a helicopter rotor creates lift" - 100 BPM (beat 0.6 s). Robinson R44: 2 blades, 10.06 m rotor, 400 rpm (100%),
// tip ~705 ft/s at 102% (~770 km/h), max gross ~1,089-1,134 kg. Rotor turns CCW seen from above -> body wants to yaw CW.
// 4X slower = 1 rev per beat, 8X = 1 rev per 2 beats, 16X = 1 rev per 4 beats.
export const FPS = 30, BPM = 100, B = 0.6, DUR_BEATS = 72, DURATION = 43.2;
export const SCENE_BARS = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 14], [14, 16], [16, 18]];
const L = (text, size, color, d, font) => ({ text, size, color, d, font });
const S = (text, d, color = 'cream') => L(text, 24, color, d, 'silk');
export const CAPTIONS = [
  { t0: 0, t1: 7.9, lines: [L('HOW A HELICOPTER', 32, 'cream', 0), L('LIFTS OFF', 40, 'amber', 2), S('WITH JUST 2 SPINNING BLADES', 4, 'cyan')] },
  { t0: 8, t1: 15.9, lines: [L('THE BLADES', 32, 'cream', 0), L('ARE WINGS', 40, 'amber', 1), S('SPINNING 400 TIMES A MINUTE', 3, 'pink')] },
  { t0: 16, t1: 23.9, lines: [{ ...L('SHOVE', 40, 'cyan', 0), badge: '1/4' }, S('EACH BLADE MEETS THE AIR', 1), S('TILTED SLIGHTLY UP', 2), S('IT SHOVES AIR DOWN...', 4, 'cyan'), S('AIR SHOVES THE BLADE UP', 5, 'cyan')] },
  { t0: 24, t1: 31.9, lines: [{ ...L('SPEED', 40, 'pink', 0), badge: '2/4' }, S('MORE SPEED = MORE LIFT', 1), S('THE TIPS MOVE FASTEST', 2), S('~770 KM/H AT THE TIP', 4, 'pink')] },
  { t0: 32, t1: 39.9, lines: [{ ...L('PITCH', 40, 'amber', 0), badge: '3/4' }, S('COLLECTIVE: TILT EVERY BLADE', 1), S('A BIT MORE, ALL AT ONCE', 2), S('MORE BITE = MORE LIFT', 3, 'amber'), S('...AND UP IT GOES', 5, 'amber')] },
  { t0: 40, t1: 47.9, lines: [{ ...L('TILT', 40, 'mint', 0), badge: '4/4' }, S('CYCLIC: TILT THE DISC', 1), S('BLADE PITCH CHANGES', 2), S('ALL THE WAY ROUND', 3), S('SO LIFT LEANS FORWARD', 5, 'mint')] },
  { t0: 48, t1: 55.9, lines: [L('WHY THE TAIL', 32, 'cream', 0), L('ROTOR?', 40, 'pink', 1), S('SPIN THE BLADES ONE WAY', 2), S('THE BODY SPINS THE OTHER', 3, 'pink'), S('THE TAIL ROTOR PUSHES BACK', 5, 'cyan')] },
  { t0: 56, t1: 63.9, lines: [L('2 BLADES', 32, 'cream', 0), L('10 M ACROSS', 40, 'amber', 1), S('HOLD UP ~1.1 TONNES', 3, 'cyan')] },
  { t0: 64, t1: 72.5, lines: [L('SPINNING WINGS.', 32, 'cream', 0), L("THAT'S ALL.", 40, 'amber', 1), S('PITCH. TILT. PUSH BACK.', 3, 'cyan')] },
];
export const LABELS = [
  { id: 'rotor', text: 'MAIN ROTOR', t0: 10, t1: 15.9, side: 'R', y: 0.40, color: 'amber' },
  { id: 'swash', text: 'SWASHPLATE', t0: 11, t1: 15.9, side: 'L', y: 0.48, color: 'cyan' },
  { id: 'tail', text: 'TAIL ROTOR', t0: 12, t1: 15.9, side: 'L', y: 0.66, color: 'pink' },
  { id: 'lift', text: 'LIFT', t0: 17, t1: 23.9, side: 'R', y: 0.40, color: 'yellow' },
  
  { id: 'tip', text: 'TIP: FAST', t0: 25, t1: 31.9, side: 'R', y: 0.48, color: 'pink' },
  { id: 'root', text: 'ROOT: SLOW', t0: 26, t1: 31.9, side: 'L', y: 0.70, color: 'cream' },
  { id: 'swash2', text: 'SWASHPLATE RISES', t0: 33, t1: 39.9, side: 'L', y: 0.48, color: 'cyan' },
  { id: 'disc', text: 'DISC TILTS', t0: 41, t1: 47.9, side: 'R', y: 0.42, color: 'mint' },
  { id: 'tail2', text: 'TAIL ROTOR', t0: 52, t1: 55.9, side: 'L', y: 0.66, color: 'cyan' },
];
// [b0, b1, tag, colour, rotor degrees per beat (null = real speed)]
export const SPEEDS = [
  [0, 8, 'REAL SPEED', 'pink', null],
  [8, 16, '4X SLOWER', 'cyan', 360],
  [16, 32, '16X SLOWER', 'violet', 90],
  [32, 56, '8X SLOWER', 'cyan', 180],
  [56, 73, 'REAL SPEED', 'pink', null],
];
const secAt = (b) => SPEEDS.find((s) => b >= s[0] && b < s[1]) || SPEEDS[SPEEDS.length - 1];
export function speedTag(b) { if (b >= 50 && b < 52) return ['TAIL ROTOR OFF', 'pink']; const s = secAt(b); return [s[2], s[3]]; }
export const isReal = (b) => secAt(b)[4] === null;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
const hash = (n) => { const h = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return h - Math.floor(h); };
export function rotorDeg(b, frame = 0) {
  if (isReal(b)) return hash(frame) * 360;
  let a = 0; for (const [s, e, , , r] of SPEEDS) { if (r === null || b <= s) continue; a += (Math.min(b, e) - s) * r; } return a;
}
// controls + flight path
export const collective = (b) => 3 + 8 * ease((b - 33) / 1.2);           // blade pitch, degrees
export const cyclic = (b) => 7 * (ease((b - 41) / 1) - ease((b - 47) / 1)); // disc tilt forward, degrees
export function heliPose(b) {
  let x = 6 * ease((b - 41.5) / 6), y = 1.6 * ease((b - 35) / 3), yaw = 0, pitch = -0.8 * cyclic(b);
  if (b >= 64) { const u = ease((b - 64) / 8); y += 9 * u; x += 10 * u; pitch -= 5 * Math.sin(Math.PI * u); }
  if (b >= 50 && b < 56) { const tOff = Math.min(b, 52) - 50; yaw = -12 * tOff * tOff; if (b > 52) { const k = b - 52; yaw = -48 - 48 * Math.min(k, 1) + 96 * ease((k - 1) / 3); } }
  return { x, y, yaw, pitch };
}
export const LIFTOFF = 35;
export const HOOK_SHOTS = ['wide', 'hubClose', 'tipBlur', 'tailRotor', 'cockpit', 'skid', 'topDown', 'boomDecal'];
