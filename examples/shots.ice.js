// IN THIS TOWN, NEVER LET GO ON THE ICE: the shot list (Suspense Story / blocky-town style).
import * as THREE from 'three';
import { ctx, clamp, lerp, eo, eio } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import { CAP } from './core/captions.js';
import * as B from './core/blocky.js';
import * as K from './core/ice.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const wobble = (t, a = 0.02) => V3(Math.sin(t * 1.3) * a, Math.sin(t * 1.7 + 1) * a, 0);
const SH = K.SHORE, N = Math.PI;   // facing -z (out onto the lake) = ry PI

const LOOK = {
  mia: { shirt: '#3E6B4E', pants: '#2B3550', hair: '#5A3A22', long: true, kid: true, scarf: '#C8443F', hat: 'beanie', hatCol: '#E8E0D0' },
  leo: { shirt: '#3C6FB6', pants: '#384060', hair: '#2A1C14', kid: true, hat: 'beanie', hatCol: '#C8443F', scarf: '#F2A93B' },
  kid2: { shirt: '#F2A93B', pants: '#384060', hair: '#6A4A2A', kid: true, hat: 'cap', hatCol: '#3C6FB6' },
  kid3: { shirt: '#C77DBA', pants: '#3A3550', hair: '#8A5A3A', kid: true, long: true },
  lady: { shirt: '#5E8A7A', pants: '#3A3550', hair: '#8A5A3A', long: true, coat: '#6A3A3A' },
  man: { shirt: '#4A5E80', pants: '#2E2E3A', hair: '#3A2A20', hat: 'beanie', hatCol: '#7A3A3A' },
};

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(58);
  const shoot = (scene, from, to, at, at2, k, look = {}, t = 0) => {
    const fov = look.fov || 58; if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(from).lerp(to, k).add(wobble(t, look.shake ?? 0.01));
    const tg = at2 ? at.clone().lerp(at2, k) : at; cam.up.set(0, 1, 0); if (look.upZ) cam.up.set(0, 0, -1); cam.lookAt(tg);
    E.render(scene, cam, { bloom: 0.3, bloomThreshold: 0.8, aperture: 0.0008, maxblur: 0.006, ...look, focus: look.focus ?? cam.position.distanceTo(tg), t });
  };
  const DUSK = { bloom: 0.3, bloomThreshold: 0.82, aperture: 0.0007, maxblur: 0.006, vignette: 0.45, exposure: 0.95, sat: 1.05 };
  const CLOSE = { ...DUSK, aperture: 0.002, maxblur: 0.008 };
  const TOP = { ...DUSK, aperture: 0.0004, upZ: true, exposure: 1.0 };
  const UNDER = { ...DUSK, aperture: 0.0005, exposure: 1.1, sat: 0.8 };
  const fill = (c, a) => { if (a > 0) { ctx.fillStyle = `rgba(${c},${Math.min(1, a)})`; ctx.fillRect(0, 0, 1080, 1920); } };

  const LK = K.lakeSet(E), SC = LK.scene;
  const mk = (look) => { const p = B.person(look); SC.add(p.group); p.base = p.group.scale.x; return p; };
  const P = { mia: mk(LOOK.mia), leo: mk(LOOK.leo), kid2: mk(LOOK.kid2), kid3: mk(LOOK.kid3), lady: mk(LOOK.lady), man: mk(LOOK.man) };
  const U = { mia: K.underize(mk(LOOK.mia)), leo: K.underize(mk(LOOK.leo)), kid2: K.underize(mk(LOOK.kid2)), man: K.underize(mk(LOOK.man)) };
  const realLeo = K.underize(mk(LOOK.leo), { dark: false });
  const reset = (o = {}) => { [...Object.values(P), ...Object.values(U), realLeo].forEach((p) => (p.group.visible = false)); LK.set(o); };
  const sk = (p, x, z, ry, t, st = {}) => { p.group.visible = true; p.at(x, 0, z, ry).set({ legs: 'walk', phase: t * 3.4, ...st }); p.group.scale.set(p.base, p.base, p.base); return p; };
  const still = (p, x, z, ry, st = {}) => { p.group.visible = true; p.at(x, 0, z, ry).set({ legs: 'stand', ...st }); p.group.scale.set(p.base, p.base, p.base); return p; };
  // the shadow copy: same place, same pose, hanging upside down under the ice
  const under = (u, x, z, ry, st = {}) => { u.group.visible = true; u.at(x, -0.02, z, ry).set(st); u.group.scale.set(u.base, -u.base, u.base); return u; };
  const pairArms = { a: { armR: [16, 40] }, b: { armL: [16, 40] } };   // a holds b's hand (b on a's right)

  // ═════════════ HOOK ═════════════
  const wUp = Wd('upside', 0);
  add({ id: 'S01', at: 0, note: 'aerial: the frozen lake at dusk, pairs of skaters holding hands', draw(lt, d, t, blit) {
    reset({ t }); [[-3, 4], [2, -1]].forEach(([x0, z0], i) => { const z = z0 - t * 0.9, x = x0 + Math.sin(t * 0.3 + i) * 0.8; const a = sk(i ? P.man : P.lady, x, z, N, t + i, pairArms.a.armR ? { armR: [16, 40] } : {}); sk(i ? P.kid2 : P.kid3, x - 0.55, z, N, t + i, { armL: [16, 40] }); });
    shoot(SC, V3(10, 18, 22), V3(5, 9, 12), V3(0, 0, 0), V3(-1, 0, 0), eo(clamp(lt / d)), { ...DUSK, fov: 52 }, t); blit();
  } });
  add({ id: 'S02', at: wUp - 0.2, note: 'top-down close: a skater glides... beneath the ice, an upside-down dark copy matches every stroke', draw(lt, d, t, blit) {
    reset({ t }); const z = 3 - (t - wUp) * 1.0, x = 0.3; sk(P.man, x, z, N, t); under(U.man, x, z, N, { legs: 'walk', phase: t * 3.4 });
    shoot(SC, V3(x + 1.7, 2.3, z + 2.0), V3(x + 1.5, 2.1, z + 1.7), V3(x, -0.35, z), null, eo(clamp(lt / d)), { ...DUSK, aperture: 0.0006 }, t); blit();
  } });
  add({ id: 'S03', at: cut(1), note: 'low close: two mittened hands locked together, gliding', draw(lt, d, t, blit) {
    reset({ t }); const z = 6 - (t - L(1)) * 1.0; sk(P.lady, 0, z, N, t, { armR: [16, 40] }); sk(P.kid3, -0.55, z, N, t, { armL: [16, 40] });
    shoot(SC, V3(0.4, 1.0, z - 3.6), V3(0.3, 0.98, z - 3.3), V3(-0.25, 0.75, z), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });

  // ═════════════ THE RULES ═════════════
  add({ id: 'S04', at: cut(2), note: 'from BELOW the ice, looking up: blades glide over us; the Underskater hangs upside down in the murk', draw(lt, d, t, blit) {
    reset({ t, at: V3(0, 0, 0) }); const z = 1.5 - (t - L(2)) * 0.8; sk(P.man, 0, z, N, t); under(U.man, 0, z, N, { legs: 'walk', phase: t * 3.4 });
    shoot(SC, V3(1.6, -2.4, z + 2.2), V3(1.3, -2.2, z + 1.8), V3(0, -0.5, z), null, eo(clamp(lt / d)), { ...UNDER }, t); blit();
  } });
  add({ id: 'S05', at: cut(3), note: 'top-down: one lone skater; one copy underneath', draw(lt, d, t, blit) {
    reset({ t }); const z = 2 - (t - L(3)) * 1.0; sk(P.kid2, 0.2, z, N, t); under(U.kid2, 0.2, z, N, { legs: 'walk', phase: t * 3.4 });
    shoot(SC, V3(1.9, 2.3, z + 2.0), V3(1.7, 2.1, z + 1.7), V3(0.2, -0.35, z), null, eo(clamp(lt / d)), { ...DUSK, aperture: 0.0006 }, t); blit();
  } });
  add({ id: 'S06', at: cut(4), note: 'top-down: a pair holding hands; the copy below twitches between them, unable to choose', draw(lt, d, t, blit) {
    reset({ t }); const z = 2 - (t - L(4)) * 0.9; sk(P.kid2, 0.3, z, N, t, { armR: [16, 40] }); sk(P.kid3, -0.25, z, N, t, { armL: [16, 40] });
    const flick = Math.sin(t * 13) > 0 ? 0.3 : -0.25; under(U.kid2, lerp(0.02, flick, 0.6 + 0.4 * Math.sin(t * 7)), z, N + Math.sin(t * 9) * 0.4, { legs: 'walk', phase: t * 6 });
    shoot(SC, V3(1.6, 2.4, z + 2.2), V3(1.4, 2.2, z + 1.9), V3(0.05, -0.35, z), null, eo(clamp(lt / d)), { ...DUSK, aperture: 0.0006 }, t); blit();
  } });
  const wLetGo = Wd('go', 5), wPicks = Wd('picks', 5);
  add({ id: 'S07', at: cut(5), note: 'they let go; the copy slides under ONE of them and locks on', draw(lt, d, t, blit) {
    reset({ t }); const z = 1 - (t - L(5)) * 0.9; const sep = eo(clamp((t - wLetGo) / 0.8)) * 0.9;
    sk(P.kid2, 0.3 + sep, z, N, t, { armR: [lerp(16, 0, sep), lerp(40, 6, sep)] }); sk(P.kid3, -0.25 - sep * 0.3, z, N, t, { armL: [lerp(16, 0, sep), lerp(40, 6, sep)], mood: 'worried' });
    const lock = eo(clamp((t - wPicks) / 0.7)); under(U.kid2, lerp(0.02, -0.25 - sep * 0.3, lock), z, N, { legs: 'walk', phase: t * 3.4 });
    shoot(SC, V3(1.7, 2.5, z + 2.3), V3(1.5, 2.3, z + 2.0), V3(0.1, -0.35, z), null, eo(clamp(lt / d)), { ...DUSK, aperture: 0.0006 }, t); blit();
  } });
  add({ id: 'S08', at: cut(6), note: 'a lone small figure steps off the ice onto the snowy shore, back to us, too still', draw(lt, d, t, blit) {
    reset({ t, night: 0.3, at: V3(-0.5, 0, SH) }); const k = clamp((t - L(6)) / 3.2); still(P.kid3, -0.5, lerp(SH - 1.5, SH + 1.2, k), 0, { legs: 'walk', phase: t * 4 });
    shoot(SC, V3(-0.3, 1.0, SH - 4.2), V3(-0.3, 1.0, SH - 3.6), V3(-0.5, 0.6, SH + 0.5), null, eo(clamp(lt / d)), { ...DUSK }, t); blit();
  } });
  add({ id: 'S09', at: cut(7), note: 'wide: every pair on the lake skating hand in hand', draw(lt, d, t, blit) {
    reset({ t }); [[-2.5, 5, P.lady, P.kid3], [2, 2, P.man, P.kid2]].forEach(([x, z0, a, b], i) => { const z = z0 - (t - L(7)) * 0.8; sk(a, x, z, N, t + i, { armR: [16, 40] }); sk(b, x - 0.55, z, N, t + i, { armL: [16, 40] }); });
    shoot(SC, V3(3.5, 2.0, 11), V3(3.0, 1.8, 9.5), V3(-0.5, 0.6, 2), null, eo(clamp(lt / d)), { ...DUSK }, t); blit();
  } });
  const wLets = Wd('lets', 8);
  add({ id: 'S10', at: cut(8), note: 'Mrs. Dunn on the shore, waving her son in the instant his friend lets go', draw(lt, d, t, blit) {
    reset({ t, at: V3(0, 0, SH) }); const sep = eo(clamp((t - wLets + 0.1) / 0.5));
    still(P.lady, 0.8, SH + 0.8, N, { mood: t > wLets ? 'shocked' : 'worried', armR: t > wLets ? [150 + Math.sin(t * 12) * 20, 30] : [10, 0] });
    sk(P.kid2, -0.6 + sep * 0.5, SH - 4, 0.3, t, { armR: [16 * (1 - sep), 40 * (1 - sep)] }); sk(P.kid3, -1.15 - sep * 0.6, SH - 4, 0.3, t, { armL: [16 * (1 - sep), 40 * (1 - sep)] });
    shoot(SC, V3(-0.6, 1.5, SH - 7.5), V3(-0.5, 1.45, SH - 6.8), V3(0.2, 0.8, SH - 1.5), null, eo(clamp(lt / d)), { ...DUSK }, t); blit();
  } });
  const W = LK.words.position;
  add({ id: 'S11', at: cut(9), note: 'low across the ice: scratches by the shore', draw(lt, d, t, blit) {
    reset({ t, at: V3(W.x, 0, W.z) });
    shoot(SC, V3(W.x + 2.5, 0.5, W.z - 3.2), V3(W.x + 1.4, 0.8, W.z - 1.8), V3(W.x, 0, W.z), null, eio(clamp(lt / d)), { ...DUSK }, t); blit();
  } });
  add({ id: 'S12', at: cut(10), note: 'top-down: NEVER ALONE scratched into the ice', draw(lt, d, t, blit) {
    reset({ t, at: V3(W.x, 0, W.z) });
    shoot(SC, V3(W.x, 6.4, W.z), V3(W.x, 6.0, W.z), V3(W.x, 0, W.z - 0.01), null, eo(clamp(lt / d)), { ...TOP, exposure: 1.1 }, t); blit();
  } });

  // ═════════════ MIA & LEO ═════════════
  add({ id: 'S13', at: cut(11), note: 'on the bench by the shore: Leo grinning, lacing skates; Mia beside him', draw(lt, d, t, blit) {
    reset({ t, at: V3(2.5, 0, SH + 3.2) }); const b = LK.bench.position;
    still(P.leo, b.x - 0.35, b.z - 0.1, N, { legs: 'sit', mood: 'happy', armR: [40, 0] }); still(P.mia, b.x + 0.4, b.z - 0.1, N, { legs: 'sit', mood: 'warm' });
    shoot(SC, V3(b.x + 0.1, 0.9, b.z - 2.4), V3(b.x + 0.1, 0.88, b.z - 2.1), V3(b.x, 0.62, b.z), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  const duo = (t, x, z, ry, o = {}) => { sk(P.mia, x, z, ry, t, { armR: [16, 40], mood: 'happy', ...o.mia }); sk(P.leo, x + 0.55 * Math.cos(ry - N), z - 0.55 * Math.sin(ry - N) * 0, ry, t + 0.3, { armL: [16, 40], mood: 'happy', ...o.leo }); };
  add({ id: 'S14', at: cut(12), note: 'wide: Mia and Leo skating hand in hand, sunset behind', draw(lt, d, t, blit) {
    reset({ t, at: V3(0, 0, 6) }); const z = 9 - (t - L(12)) * 1.1; duo(t, -0.3, z, N);
    shoot(SC, V3(2.4, 1.0, z + 4.2), V3(2.0, 0.95, z + 3.6), V3(0, 0.7, z - 1), null, eo(clamp(lt / d)), { ...DUSK }, t); blit();
  } });
  add({ id: 'S15', at: cut(13), note: 'Leo leans ahead, grinning, tugging her faster', draw(lt, d, t, blit) {
    reset({ t, at: V3(0, 0, 5) }); const z = 6 - (t - L(13)) * 1.4; duo(t * 1.4, -0.3, z, N, { leo: { mood: 'smirk', armL: [40, 40] } });
    shoot(SC, V3(0.9, 1.0, z - 2.6), V3(0.8, 0.98, z - 2.3), V3(0, 0.9, z), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  const wYank = Wd('yanked', 14);
  add({ id: 'S16', at: cut(14), note: 'close on their hands: he yanks his free', draw(lt, d, t, blit) {
    reset({ t, at: V3(0, 0, 3) }); const z = 4 - (t - L(14)) * 1.2, s = eo(clamp((t - wYank) / 0.3));
    sk(P.mia, -0.3, z, N, t, { armR: [lerp(16, 30, s), lerp(40, 30, s)], mood: s > 0.5 ? 'shocked' : 'happy' }); sk(P.leo, 0.25 + s * 0.5, z - s * 0.4, N, t, { armL: [lerp(16, 0, s), lerp(40, 4, s)] });
    shoot(SC, V3(0.3, 0.9, z - 2.9), V3(0.25, 0.88, z - 2.7), V3(0.0, 0.6, z), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });
  cue(wYank, 'whoosh', { gain: 0.5 });
  const LZ = -1.5, LX = 1.4;   // where Leo ends up: alone in the middle
  add({ id: 'S17', at: cut(15), note: 'Leo skates away backwards, laughing: "Catch me!"', draw(lt, d, t, blit) {
    reset({ t, at: V3(LX, 0, 1) }); const k = (t - L(15)); sk(P.leo, 0.6 + k * 0.4, 2.4 - k * 1.6, 0.3, t, { mood: Math.sin(t * 14) > 0 ? 'talk' : 'happy', armL: [40, 30], armR: [40, 30] });
    shoot(SC, V3(-0.2, 1.05, 4.6), V3(-0.15, 1.05, 4.3), V3(0.8 + k * 0.4, 0.9, 2.0 - k * 1.6), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  add({ id: 'S18', at: cut(16), note: 'high wide: Leo alone in the middle of the lake; Mia far behind', draw(lt, d, t, blit) {
    reset({ t, at: V3(LX, 0, LZ) }); sk(P.leo, LX, LZ, 0.2, t * 0.6, { mood: 'happy' }); under(U.leo, LX, LZ, 0.2, { legs: 'walk', phase: t * 2 }); still(P.mia, -0.6, 3.4, N, { mood: 'worried' }); under(U.mia, -0.6, 3.4, N, {});
    shoot(SC, V3(4, 9, 9), V3(3.4, 8, 8), V3(0.4, 0, 1), null, eio(clamp(lt / d)), { ...DUSK, fov: 52 }, t); blit();
  } });
  const wStopped = Wd('stopped', 17);
  add({ id: 'S19', at: cut(17), note: 'top-down under Mia: her dark copy stops copying her... and slides away', draw(lt, d, t, blit) {
    reset({ t, at: V3(-0.6, 0, 3) }); const z = 3.6 - (t - L(17)) * 0.7; sk(P.mia, -0.6, z, N, t, { mood: 'scared' });
    const g = eo(clamp((t - wStopped - 0.2) / 1.2)); under(U.mia, -0.6 + g * 1.4, Math.max(z, 3.2) - g * 1.2, N - g * 0.8, { legs: g > 0 ? 'stand' : 'walk', phase: t * 3.4 });
    shoot(SC, V3(1.4, 2.4, z + 1.8), V3(1.3, 2.2, z + 1.5), V3(-0.1, -0.35, z - 0.3), null, eo(clamp(lt / d)), { ...DUSK, aperture: 0.0006 }, t); blit();
  } });
  add({ id: 'S20', at: cut(18), note: 'under the ice: the shape glides toward Leo\'s blades above', draw(lt, d, t, blit) {
    reset({ t, at: V3(LX, 0, LZ) }); sk(P.leo, LX, LZ, 0.2, t * 0.6, { mood: 'happy' }); const k = eo(clamp((t - L(18)) / 1.6));
    under(U.mia, lerp(LX - 2.6, LX - 0.6, k), lerp(LZ + 2.4, LZ + 0.5, k), lerp(N, 0.2, k), { legs: 'walk', phase: t * 2 });
    shoot(SC, V3(LX - 3.4, -2.0, LZ + 3.8), V3(LX - 3.0, -1.9, LZ + 3.3), V3(LX - 0.4, -0.4, LZ), null, eo(clamp(lt / d)), { ...UNDER }, t); blit();
  } });
  add({ id: 'S21', at: cut(19), note: 'tracking: Mia skates as hard as she can toward him', draw(lt, d, t, blit) {
    reset({ t, at: V3(0, 0, 2) }); const k = clamp((t - L(19)) / 1.8); const x = lerp(-0.6, LX - 0.9, k), z = lerp(3.4, LZ + 1.0, k);
    sk(P.mia, x, z, N + 0.5, t * 2.2, { mood: 'scared', armR: [40 + Math.sin(t * 14) * 25, 10], armL: [40 - Math.sin(t * 14) * 25, 10] });
    shoot(SC, V3(x + 1.6, 0.9, z + 1.4), V3(x + 1.6, 0.9, z + 1.4), V3(x, 0.7, z), null, 0, { ...CLOSE, shake: 0.03 }, t); blit();
  } });
  const wPerf = Wd('perfectly', 20);
  add({ id: 'S22', at: cut(20), note: 'top-down on Leo: the dark copy slides under him and lines up, blade to blade', draw(lt, d, t, blit) {
    reset({ t, at: V3(LX, 0, LZ) }); sk(P.leo, LX, LZ, 0.2, t * 0.5, { mood: 'happy' });
    const k = eo(clamp((t - L(20)) / (wPerf - L(20)))); under(U.mia, lerp(LX - 1.2, LX, k), lerp(LZ + 0.9, LZ, k), lerp(-0.4, 0.2, k), { legs: 'walk', phase: t * 0.5 * 3.4 });
    shoot(SC, V3(LX + 1.7, 2.3, LZ + 1.9), V3(LX + 1.5, 2.1, LZ + 1.7), V3(LX - 0.2, -0.35, LZ), null, eo(clamp(lt / d)), { ...DUSK, aperture: 0.0006 }, t); blit();
  } });
  cue(wPerf, 'rumble', { dur: 2.4, gain: 1 });
  const wGrab = Wd('grabbed', 21);
  add({ id: 'S23', at: cut(21), note: 'close: her hand catches his', draw(lt, d, t, blit) {
    reset({ t, at: V3(LX, 0, LZ) }); const k = eo(clamp((t - wGrab + 0.15) / 0.3));
    still(P.leo, LX, LZ, 0.2, { armL: [lerp(0, 16, k), lerp(4, 40, k)], mood: 'shocked' }); still(P.mia, LX - 0.62, LZ + 0.15, 0.2, { armR: [lerp(40, 16, k), lerp(10, 40, k)], mood: 'scared' }); under(U.mia, LX, LZ, 0.2, {});
    shoot(SC, V3(LX + 0.1, 0.9, LZ - 2.9), V3(LX + 0.05, 0.88, LZ - 2.7), V3(LX - 0.3, 0.6, LZ), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });
  const wCrack = Wd('crack', 22), wFlash = Wd('flash', 22);
  add({ id: 'S24', at: cut(22), note: 'top-down: a crack bursts out under Leo\'s blades... white flash', draw(lt, d, t, blit) {
    reset({ t, at: V3(LX, 0, LZ), crackAt: V3(LX, 0, LZ), crackK: eo(clamp((t - wCrack) / 0.25)) }); still(P.leo, LX, LZ, 0.2, { armL: [16, 40], mood: 'shocked' }); still(P.mia, LX - 0.62, LZ + 0.15, 0.2, { armR: [16, 40], mood: 'scared' }); under(U.mia, LX, LZ, 0.2, {});
    shoot(SC, V3(LX - 0.1, 4.6, LZ), V3(LX - 0.1, 4.3, LZ), V3(LX - 0.1, -0.5, LZ), null, eo(clamp(lt / d)), { ...TOP, shake: t > wCrack ? 0.04 : 0.01 }, t); blit();
    fill('255,255,255', t > wFlash - 0.05 ? 1 - (t - wFlash) / 0.9 : 0);
  } });
  cue(wCrack, 'crack', { gain: 1.1 }); cue(wFlash, 'thud', { gain: 1.0 });
  add({ id: 'S25', at: cut(23), note: 'after the flash: Leo standing, still holding her hand. The crack is gone. No copy below.', draw(lt, d, t, blit) {
    reset({ t, at: V3(LX, 0, LZ) }); still(P.leo, LX, LZ, 0.2, { armL: [16, 40], mood: 'neutral' }); still(P.mia, LX - 0.62, LZ + 0.15, 0.2, { armR: [16, 40], mood: 'warm' });
    shoot(SC, V3(LX - 0.3, 1.0, LZ - 2.6), V3(LX - 0.3, 0.98, LZ - 2.3), V3(LX - 0.3, 0.8, LZ), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
    fill('255,255,255', 0.5 - (t - L(23)) / 0.8);
  } });

  // ═════════════ THE SHORE ═════════════
  const walkOff = (t, t0, dur) => clamp((t - t0) / dur);
  add({ id: 'S26', at: cut(24), note: 'backs to us: the two walk off the ice together, hand in hand', draw(lt, d, t, blit) {
    reset({ t, night: 0.4, at: V3(0, 0, SH) }); const k = walkOff(t, L(24), 2.0), z = lerp(SH - 2.0, SH + 0.6, k);
    still(P.mia, -0.3, z, 0, { legs: 'walk', phase: t * 5, armL: [16, 40] }); still(P.leo, 0.25, z, 0, { legs: 'walk', phase: t * 5 + 3, armR: [16, 40] });
    shoot(SC, V3(0, 1.1, SH - 5.4), V3(0, 1.1, SH - 4.8), V3(0, 0.7, SH), null, eo(clamp(lt / d)), { ...DUSK }, t); blit();
  } });
  const SZ = SH + 1.4;   // on the shore
  add({ id: 'S27', at: cut(25), note: 'close: Leo\'s face, blank, not a word', draw(lt, d, t, blit) {
    reset({ t, night: 0.45, at: V3(0, 0, SZ) }); still(P.leo, 0.25, SZ, 0, { mood: 'neutral', armR: [16, 40] }); still(P.mia, -0.3, SZ, 0, { armL: [16, 40] });
    shoot(SC, V3(0.4, 1.12, SZ + 1.35), V3(0.38, 1.12, SZ + 1.2), V3(0.25, 1.1, SZ), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });
  add({ id: 'S28', at: cut(26), note: 'close on their joined hands: frost creeping over his', draw(lt, d, t, blit) {
    reset({ t, night: 0.45, at: V3(0, 0, SZ) }); still(P.leo, 0.25, SZ, 0, { mood: 'neutral', armR: [16, 40] }); still(P.mia, -0.3, SZ, 0, { armL: [16, 40], mood: 'worried' });
    shoot(SC, V3(-0.05, 0.85, SZ + 2.7), V3(-0.05, 0.82, SZ + 2.5), V3(-0.02, 0.55, SZ), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50, sat: 0.6, exposure: 1.0 }, t); blit();
  } });
  const wNot = Wd('not', 27);
  add({ id: 'S29', at: cut(27), note: 'Mia tries to slip her hand free; his grip doesn\'t give', draw(lt, d, t, blit) {
    reset({ t, night: 0.5, at: V3(0, 0, SZ) }); const pull = Math.max(0, Math.sin((t - L(27)) * 4)) * eo(clamp((t - L(27)) / 0.5));
    still(P.leo, 0.25, SZ, 0, { mood: 'neutral', armR: [16 + pull * 10, 40 + pull * 20] }); still(P.mia, -0.3 - pull * 0.12, SZ, 0.2 * pull, { armL: [16, 40], mood: 'scared' });
    shoot(SC, V3(0, 1.0, SZ + 2.6), V3(0, 0.98, SZ + 2.3), V3(0, 0.75, SZ), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  add({ id: 'S30', at: cut(28), note: 'over Mia\'s shoulder: she looks back at the empty, darkening lake', draw(lt, d, t, blit) {
    reset({ t, night: 0.55, at: V3(0, 0, SZ) }); still(P.mia, -0.3, SZ, lerp(0, N - 0.4, eio(clamp((t - L(28)) / 0.8))), { mood: 'worried', armL: [16, 40] }); still(P.leo, 0.25, SZ, 0, { armR: [16, 40] });
    shoot(SC, V3(-0.5, 1.2, SZ + 1.8), V3(-0.55, 1.15, SZ + 1.5), V3(1, 0.2, LZ), null, eio(clamp(lt / d)), { ...DUSK }, t); blit();
  } });
  const RL = V3(1.2, -0.42, 5.5);   // the real Leo, trapped under the ice near the shore
  const pound = (t) => Math.max(0, Math.sin(t * 9));
  const leoUnder = (t, o = {}) => { realLeo.group.visible = true; realLeo.at(RL.x, RL.y, RL.z, 0).set({ armL: [175 + pound(t) * -20, 10], armR: [175 + pound(t + 0.5) * -20, -10], mood: o.mood || 'crying' }); realLeo.group.rotation.x = -Math.PI / 2; realLeo.group.scale.setScalar(realLeo.base); };
  add({ id: 'S31', at: cut(29), note: 'top-down through the ice: the real Leo underneath, face up, fists pounding on the ice', draw(lt, d, t, blit) {
    reset({ t, night: 0.6, at: V3(RL.x, 0, RL.z) }); leoUnder(t); realLeo.group.rotation.set(-Math.PI / 2, 0, 0); realLeo.group.position.set(RL.x, RL.y, RL.z + 0.6);
    shoot(SC, V3(RL.x, 2.6, RL.z - 0.1), V3(RL.x, 2.2, RL.z - 0.1), V3(RL.x, -0.4, RL.z - 0.12), null, eo(clamp(lt / d)), { ...TOP, exposure: 1.15 }, t); blit();
  } });
  for (let x = L(29) + 0.3; x < Le(29) + 0.4; x += 0.7) cue(x, 'knockfar', { gain: 0.9 });
  add({ id: 'S32', at: cut(30), note: 'close through the ice: his face, mouth open, screaming without sound', draw(lt, d, t, blit) {
    reset({ t, night: 0.6, at: V3(RL.x, 0, RL.z) }); leoUnder(t, { mood: 'shocked' }); realLeo.group.rotation.set(-Math.PI / 2, 0, 0); realLeo.group.position.set(RL.x, RL.y, RL.z + 0.6);
    shoot(SC, V3(RL.x, 1.25, RL.z - 0.7), V3(RL.x, 1.1, RL.z - 0.72), V3(RL.x, -0.4, RL.z - 0.72), null, eo(clamp(lt / d)), { ...TOP, exposure: 1.2, aperture: 0.0015 }, t); blit();
  } });
  add({ id: 'S33', at: cut(31), note: 'close: the Leo beside her smiles', draw(lt, d, t, blit) {
    reset({ t, night: 0.6, at: V3(0, 0, SZ) }); still(P.leo, 0.25, SZ, 0, { mood: t > Wd('smiled', 31) - 0.2 ? 'smirk' : 'neutral', armR: [16, 40] }); still(P.mia, -0.3, SZ, N - 0.4, { armL: [16, 40] });
    shoot(SC, V3(0.38, 1.12, SZ + 1.2), V3(0.36, 1.12, SZ + 1.05), V3(0.25, 1.1, SZ), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });
  add({ id: 'S34', at: cut(32), note: 'flashback, grey: the copy had already lined up when her hand caught his', draw(lt, d, t, blit) {
    reset({ t, at: V3(LX, 0, LZ) }); still(P.leo, LX, LZ, 0.2, { armL: [16, 40], mood: 'shocked' }); still(P.mia, LX - 0.62, LZ + 0.15, 0.2, { armR: [16, 40], mood: 'scared' }); under(U.mia, LX, LZ, 0.2, {});
    shoot(SC, V3(LX + 1.8, 1.4, LZ + 2.0), V3(LX + 1.6, 1.3, LZ + 1.8), V3(LX - 0.3, -0.3, LZ), null, eo(clamp(lt / d)), { ...CLOSE, sat: 0.15, exposure: 0.9 }, t); blit();
  } });
  add({ id: 'S35', at: cut(33), note: 'wide: two small figures walking home hand in hand along the shore', draw(lt, d, t, blit) {
    reset({ t, night: 0.75, at: V3(0, 0, SZ + 3) }); const x = -1 - (t - L(33)) * 0.8; still(P.mia, x, SZ + 3, -N / 2, { legs: 'walk', phase: t * 5, armL: [16, 40] }); still(P.leo, x, SZ + 3.55, -N / 2, { legs: 'walk', phase: t * 5 + 3, armR: [16, 40] });
    shoot(SC, V3(3.5, 2.2, SZ - 3.5), V3(3.0, 2.0, SZ - 3.0), V3(x - 1, 0.5, SZ + 3), null, eo(clamp(lt / d)), { ...DUSK }, t); blit();
  } });
  const endBlack = Le(34) + 0.6;
  add({ id: 'S36', at: cut(34), note: 'slow push down onto the ice: under it, Leo\'s palm pressed flat, still. Fade to black.', draw(lt, d, t, blit) {
    reset({ t, night: 0.8, at: V3(RL.x, 0, RL.z) }); realLeo.group.visible = true; realLeo.at(RL.x, RL.y - 0.05, RL.z + 0.6, 0).set({ armL: [178, 10], armR: [178, -10], mood: 'sad' }); realLeo.group.rotation.set(-Math.PI / 2, 0, 0); realLeo.group.scale.setScalar(realLeo.base);
    shoot(SC, V3(RL.x + 0.2, 3.4, RL.z + 1.4), V3(RL.x + 0.05, 1.6, RL.z + 0.2), V3(RL.x, -0.4, RL.z - 0.4), null, eio(clamp(lt / d)), { ...TOP, exposure: 1.05, upZ: false }, t); blit();
    fill('0,0,0', (t - (endBlack - 1.0)) / 1.0);
  } });

  CAP.y = 1250;
  return { shots: S, cues: CUES };
}
