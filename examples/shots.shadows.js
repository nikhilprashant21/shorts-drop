// IN THIS TOWN, COUNT YOUR SHADOWS: the shot list (Suspense Story / blocky-town style).
import * as THREE from 'three';
import { ctx, clamp, lerp, eo, eio } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import { CAP } from './core/captions.js';
import { mat } from './core/world.js';
import * as B from './core/blocky.js';
import * as K from './core/shadows.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const wobble = (t, a = 0.02) => V3(Math.sin(t * 1.3) * a, Math.sin(t * 1.7 + 1) * a, 0);
const WZ = K.WALKZ, LX = K.LAMPS;

const LOOK = {
  mia: { shirt: '#3E6B4E', pants: '#2B3550', hair: '#5A3A22', long: true, kid: true, scarf: '#C8443F' },
  kid2: { shirt: '#F2A93B', pants: '#384060', hair: '#2A1C14', kid: true, hat: 'beanie', hatCol: '#3C6FB6' },
  kid3: { shirt: '#C77DBA', pants: '#3A3550', hair: '#8A5A3A', kid: true, long: true },
  man: { shirt: '#4A5E80', pants: '#2E2E3A', hair: '#3A2A20', hat: 'beanie', hatCol: '#7A3A3A' },
  pell: { shirt: '#6E5A48', pants: '#2B2B35', hair: '#9A9AA0', glasses: true },
};

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(58);
  const shoot = (scene, from, to, at, at2, k, look = {}, t = 0) => {
    const fov = look.fov || 58; if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(from).lerp(to, k).add(wobble(t, look.shake ?? 0.01));
    const tg = at2 ? at.clone().lerp(at2, k) : at; cam.up.set(0, 1, 0); if (look.upX) cam.up.set(1, 0, 0); cam.lookAt(tg);
    E.render(scene, cam, { bloom: 0.3, bloomThreshold: 0.75, aperture: 0.0009, maxblur: 0.007, ...look, focus: look.focus ?? cam.position.distanceTo(tg), t });
  };
  const NIGHT = { bloom: 0.4, bloomThreshold: 0.78, aperture: 0.0007, maxblur: 0.006, vignette: 0.55, exposure: 0.95, sat: 1.0 };
  const CLOSE = { ...NIGHT, aperture: 0.002, maxblur: 0.009 };
  const TOP = { ...NIGHT, aperture: 0.0005, upX: true, exposure: 1.0 };
  const IN = { bloom: 0.25, bloomThreshold: 0.85, aperture: 0.0012, maxblur: 0.008, vignette: 0.55, exposure: 0.8, warm: 0.03 };
  const black = () => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1080, 1920); };
  const walk = (t, t0, v) => (t - t0) * v;

  // ── street ─────────────────────────────────────────────
  const ST = K.streetSet(E), SC = ST.scene;
  const ppl = {}; Object.keys(LOOK).forEach((k) => { ppl[k] = B.person(LOOK[k]); SC.add(ppl[k].group); });
  const gh = {}; ['kid2', 'man', 'pell', 'mia'].forEach((k) => { gh[k] = K.ghostify(B.person(LOOK[k])); SC.add(gh[k].group); });
  const caseM = mat({ color: '#2A2A34' }); const vcase = new THREE.Group(); B.box(0.12, 0.3, 0.68, caseM, 0, -0.15, 0, vcase); SC.add(vcase);
  const caseG = vcase.clone(); caseG.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.colorWrite = false; o.material.depthWrite = false; } }); SC.add(caseG);
  const home = ST.home; home.updateMatrixWorld(true); const homeDoor = home.userData.door.getWorldPosition(V3()); // hinge side of the door
  const doorFront = homeDoor.clone().add(V3(-0.55, 0, -0.15));
  const reset = (o = {}) => {
    Object.values(ppl).forEach((p) => { p.group.visible = false; K.noShadow(p, false); }); Object.values(gh).forEach((p) => (p.group.visible = false));
    vcase.visible = caseG.visible = false; vcase.traverse((o) => { if (o.isMesh) o.castShadow = true; }); home.userData.door.rotation.y = 0; ST.set(o); ST.snow.update(o.t || 0);
  };
  const show = (k, x, z, ry, st = {}) => { const p = ppl[k]; p.group.visible = true; p.at(x, 0, z, ry).set(st); return p; };
  const ghost = (k, x, z, ry, st = {}) => { const p = gh[k]; p.group.visible = true; p.at(x, 0, z, ry).set(st); return p; };
  const carry = (p, c) => { p.group.updateMatrixWorld(true); c.visible = true; c.position.copy(p.arms[1].userData.hand.getWorldPosition(V3())); c.rotation.y = p.group.rotation.y; };
  const E1 = Math.PI / 2;   // facing +x (walking home)

  // ═════════════ HOOK ═════════════
  const lampOn = (t) => LX.map((_, i) => clamp((t - 0.5 - i * 0.32) / 0.15));
  const wCount = Wd('count', 0);
  add({ id: 'S01', at: 0, note: 'aerial: the snowy street at dusk; the six lamps flick on one after another', draw(lt, d, t, blit) {
    reset({ t, on: lampOn(t), broken: -1 });
    shoot(SC, V3(-14, 22, -18), V3(4, 11, -10), V3(18, 0, 3), V3(22, 0, 3.5), eo(clamp(lt / d)), { ...NIGHT, fov: 52 }, t); blit();
  } });
  const kidX = LX[2] + 1.7, wTwo = Wd('two', 1);
  add({ id: 'S02', at: wCount - 0.1, note: 'top-down: a boy under a lamp, one shadow on the snow', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 2, broken: -1 }); show('kid2', kidX, WZ, E1 + 0.3, { tilt: 30 });
    shoot(SC, V3(kidX + 1.0, 5.4, WZ + 0.25), V3(kidX + 1.0, 4.9, WZ + 0.25), V3(kidX + 1.0, 0, WZ + 0.25), null, eo(clamp(lt / d)), { ...TOP }, t); blit();
  } });
  add({ id: 'S03', at: cut(1), note: 'top-down: a second shadow slides out beside his', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 2, broken: -1 }); show('kid2', kidX, WZ, E1 + 0.3, { tilt: 30 });
    if (t > wTwo - 0.1) { const k = eo(clamp((t - wTwo + 0.1) / 0.5)); ghost('kid2', kidX, WZ + 0.1 + 0.4 * k, E1 + 0.3, {}); }
    shoot(SC, V3(kidX + 1.0, 4.9, WZ + 0.3), V3(kidX + 1.0, 4.5, WZ + 0.3), V3(kidX + 1.0, 0, WZ + 0.3), null, eo(clamp(lt / d)), { ...TOP }, t); blit();
  } });
  add({ id: 'S04', at: cut(2), note: 'close: the boy\'s face, staring down, terrified', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 2, broken: -1 }); show('kid2', kidX, WZ, E1 + 0.3, { tilt: 30, mood: 'scared' }); ghost('kid2', kidX, WZ + 0.5, E1 + 0.3, {});
    shoot(SC, V3(kidX + 2.5, 1.25, WZ - 0.7), V3(kidX + 2.3, 1.23, WZ - 0.65), V3(kidX, 0.98, WZ), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });
  add({ id: 'S05', at: cut(3), note: 'low on the sidewalk: a man walks; two shadows stretch behind him, in step', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 3 }); const x = LX[3] - 3 + walk(t, L(3), 1.0);
    show('man', x, WZ, E1, { legs: 'walk', phase: t * 6 }); ghost('man', x, WZ + 0.55, E1, { legs: 'walk', phase: t * 6 });
    shoot(SC, V3(LX[3] + 3.2, 0.5, WZ - 0.8), V3(LX[3] + 2.8, 0.55, WZ - 0.7), V3(x - 0.5, 0.4, WZ + 0.6), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  const hx = 15.6 + 1.7 * 0.75, hz = 9.5 - 2.55;   // door of the house at x 15.6 (north side)
  add({ id: 'S06', at: cut(4), note: 'he reaches his front door; on the wall, his shadow... and a second one beside it', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 2 }); const k = eo(clamp((t - L(4)) / 1.8)); const z = lerp(hz - 2.0, hz - 0.45, k);
    show('man', hx, z, 0, { legs: k < 1 ? 'walk' : 'stand', phase: t * 6, armR: [lerp(0, 60, clamp((t - L(4) - 1.8) / 0.4)), 0] }); ghost('man', hx - 0.55, z - 0.05, 0, { legs: k < 1 ? 'walk' : 'stand', phase: t * 6, turn: t > Wd('comes', 4) ? -60 : 0 });
    shoot(SC, V3(hx - 2.4, 1.8, hz - 4.4), V3(hx - 2.0, 1.75, hz - 3.9), V3(hx - 0.3, 1.2, hz), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  add({ id: 'S07', at: cut(5), note: 'two kids pass under a lamp, both staring down at their feet', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 1 }); const x = LX[1] - 1.5 + walk(t, L(5), 0.8);
    show('kid2', x, WZ - 0.25, E1, { legs: 'walk', phase: t * 7, tilt: 32, mood: 'worried' }); show('kid3', x - 0.2, WZ + 0.35, E1, { legs: 'walk', phase: t * 7 + 1, tilt: 32, mood: 'worried' });
    shoot(SC, V3(x + 0.8, 1.1, WZ + 2.6), V3(x + 1.0, 1.05, WZ + 2.4), V3(x, 0.6, WZ), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  const wTwoP = Wd('two', 6);
  add({ id: 'S08', at: cut(6), note: 'top-down: old Mr. Pell under a lamp: two shadows. He looks down.', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 3 }); const x = LX[3] + 0.6 + walk(Math.min(t, wTwoP), L(6), 0.6);
    show('pell', x, WZ, E1, { legs: t < wTwoP ? 'walk' : 'stand', phase: t * 5, tilt: t > wTwoP ? 35 : 0 }); ghost('pell', x, WZ + 0.55, E1, { legs: t < wTwoP ? 'walk' : 'stand', phase: t * 5 });
    shoot(SC, V3(x + 1.1, 6.0, WZ + 0.3), V3(x + 1.1, 5.4, WZ + 0.3), V3(x + 1.1, 0, WZ + 0.3), null, eo(clamp(lt / d)), { ...TOP }, t); blit();
  } });
  const pell = ST.pell, pellWin = V3(pell.position.x + 3.4 * 0.18 * 1.7, 1.36 * 1.7, pell.position.z + 1.5 * 1.7);
  add({ id: 'S09', at: cut(7), note: 'Mr. Pell\'s house: the curtains glow red and stay shut', draw(lt, d, t, blit) {
    reset({ t });
    shoot(SC, V3(pellWin.x - 2.4, 1.8, pellWin.z + 7.0), V3(pellWin.x - 1.2, 1.9, pellWin.z + 4.4), pellWin, null, eio(clamp(lt / d)), { ...NIGHT, exposure: 1.25 }, t); blit();
  } });
  add({ id: 'S10', at: cut(8), note: 'wide: one broken lamp: a pool of black between two lit ones', draw(lt, d, t, blit) {
    reset({ t });
    shoot(SC, V3(LX[4] - 1, 3.2, -3.5), V3(LX[4] - 0.5, 2.6, -2.6), V3(LX[4], 0.6, WZ), null, eio(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  add({ id: 'S11', at: cut(9), note: 'low: a man walks out of the lamplight; both shadows thin out and vanish in the dark', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 3 }); const x = LX[3] + 0.5 + walk(t, L(9), 1.3);
    show('man', x, WZ, E1, { legs: 'walk', phase: t * 6 }); ghost('man', x, WZ + 0.55, E1, { legs: 'walk', phase: t * 6 });
    shoot(SC, V3(LX[3] - 1.5, 0.6, WZ - 1.2), V3(LX[3] - 1.2, 0.6, WZ - 1.1), V3(x, 0.3, WZ + 0.8), null, 0, { ...NIGHT }, t); blit();
  } });
  add({ id: 'S12', at: cut(10), note: 'near black: a figure standing still in the dark under the broken lamp', draw(lt, d, t, blit) {
    reset({ t, dark: 0.3 }); show('man', LX[4] + 0.6, WZ, E1 + 0.5, { tilt: 15 });
    shoot(SC, V3(LX[4] + 3.4, 1.4, WZ - 2.6), V3(LX[4] + 3.0, 1.35, WZ - 2.3), V3(LX[4] + 0.6, 1.0, WZ), null, eo(clamp(lt / d)), { ...NIGHT, exposure: 1.4 }, t); blit();
  } });
  add({ id: 'S13', at: cut(11), note: 'he steps out into the next lamp: one shadow', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 5 }); const x = LX[5] - 2.6 + walk(t, L(11), 0.9);
    show('man', x, WZ, E1, { legs: 'walk', phase: t * 6, tilt: 20 });
    shoot(SC, V3(LX[5] + 1.2, 4.4, WZ + 1.2), V3(LX[5] + 1.0, 4.0, WZ + 1.1), V3(x + 0.3, 0, WZ + 0.6), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });

  // ═════════════ MIA ═════════════
  const miaWalk = (t, x, st = {}) => { const p = show('mia', x, WZ, E1, { legs: 'walk', phase: t * 7, armR: [6, -4], ...st }); carry(p, vcase); return p; };
  const miaGhost = (t, x, st = {}, dz = 0.5) => { const g = ghost('mia', x, WZ + dz, E1, { legs: 'walk', phase: t * 7, armR: [6, -4], ...st }); g.group.updateMatrixWorld(true); caseG.visible = true; caseG.position.copy(g.arms[1].userData.hand.getWorldPosition(V3())); caseG.rotation.y = E1; return g; };
  add({ id: 'S14', at: cut(12), note: 'Mia sets off with her violin case under the first lamp', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 0 }); const x = LX[0] - 1.8 + walk(t, L(12), 0.8); miaWalk(t, x, { mood: 'neutral' });
    shoot(SC, V3(x + 2.6, 1.3, WZ - 2.2), V3(x + 2.6, 1.25, WZ - 2.0), V3(x, 0.7, WZ), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  add({ id: 'S15', at: cut(13), note: 'long view: six lamps lead down the street to her house', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 0 }); const x = LX[0] + 0.5 + walk(t, L(13), 0.8); miaWalk(t, x);
    shoot(SC, V3(LX[0] - 3.5, 1.7, WZ - 0.6), V3(LX[0] - 3.0, 1.65, WZ - 0.55), V3(LX[5], 1.2, WZ + 1.5), null, eo(clamp(lt / d)), { ...NIGHT, aperture: 0.0004 }, t); blit();
  } });
  const wLooked = Wd('looked', 14), m3 = LX[2] + 1.6;
  add({ id: 'S16', at: cut(14), note: 'under the third lamp: Mia looks down', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 2 }); const x = Math.min(m3, m3 - 1.4 + walk(t, L(14), 0.8)); const tl = eo(clamp((t - wLooked) / 0.5)) * 34;
    miaWalk(t, x, { legs: x < m3 ? 'walk' : 'stand', tilt: tl, mood: t > wLooked ? 'worried' : 'neutral' }); miaGhost(t, x, { legs: x < m3 ? 'walk' : 'stand' });
    shoot(SC, V3(m3 + 1.4, 1.0, WZ - 0.5), V3(m3 + 1.25, 1.0, WZ - 0.45), V3(x, 0.98, WZ), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });
  add({ id: 'S17', at: cut(15), note: 'top-down: two shadows from her feet', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 2 }); miaWalk(t, m3, { legs: 'stand', tilt: 34, mood: 'scared' }); miaGhost(t, m3, { legs: 'stand' });
    shoot(SC, V3(m3 + 1.0, 5.0, WZ + 0.25), V3(m3 + 1.0, 4.5, WZ + 0.25), V3(m3 + 1.0, 0, WZ + 0.25), null, eo(clamp(lt / d)), { ...TOP }, t); blit();
  } });
  const wTurned = Wd('turned', 16);
  add({ id: 'S18', at: cut(16), note: 'top-down, closer: the second shadow turns its head. Mia doesn\'t move.', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 2 }); miaWalk(t, m3, { legs: 'stand', tilt: 34, mood: 'scared' });
    const k = eio(clamp((t - wTurned) / 0.7)); miaGhost(t, m3, { legs: 'stand', turn: k * 80, roll: k * 20 });
    shoot(SC, V3(m3 + 1.1, 3.9, WZ + 0.3), V3(m3 + 1.1, 3.6, WZ + 0.3), V3(m3 + 1.1, 0, WZ + 0.3), null, eo(clamp(lt / d)), { ...TOP }, t); blit();
  } });
  cue(wTurned, 'rumble', { dur: 2.2, gain: 0.9 });
  add({ id: 'S19', at: cut(17), note: 'tracking low: Mia runs; both shadows race beside her on the snow', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 3 }); const x = LX[3] - 4 + walk(t, L(17), 3.0);
    miaWalk(t, x, { legs: 'run', phase: t * 13, mood: 'scared' }); miaGhost(t, x, { legs: 'run', phase: t * 13 });
    shoot(SC, V3(x + 1.0, 0.8, WZ + 2.5), V3(x + 1.0, 0.8, WZ + 2.5), V3(x, 0.3, WZ + 0.4), null, 0, { ...NIGHT, shake: 0.03 }, t); blit();
  } });
  cue(L(17), 'whoosh', { gain: 0.6 });
  add({ id: 'S20', at: cut(18), note: 'ahead: lamp four is dead. A pool of black before home.', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 3 }); const x = LX[3] + 1 + walk(t, L(18), 3.0);
    miaWalk(t, x, { legs: 'run', phase: t * 13, mood: 'scared' }); miaGhost(t, x, { legs: 'run', phase: t * 13 });
    shoot(SC, V3(LX[3] - 2, 1.6, WZ - 1.0), V3(LX[3] - 1, 1.55, WZ - 0.9), V3(LX[4] + 2, 1.0, WZ + 0.5), null, eo(clamp(lt / d)), { ...NIGHT, aperture: 0.0004 }, t); blit();
  } });
  add({ id: 'S21', at: cut(19), note: 'behind her: she runs into the black and is swallowed', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 3 }); const x = Math.min(LX[4] + 0.3, LX[4] - 3.5 + walk(t, L(19), 3.0));
    miaWalk(t, x, { legs: x < LX[4] + 0.3 ? 'run' : 'stand', phase: t * 13 }); miaGhost(t, x, { legs: x < LX[4] + 0.3 ? 'run' : 'stand', phase: t * 13 });
    shoot(SC, V3(LX[4] - 5.5, 1.3, WZ - 0.8), V3(LX[4] - 5.0, 1.25, WZ - 0.75), V3(LX[4], 0.8, WZ), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  add({ id: 'S22', at: cut(20), note: 'pitch dark: the faintest outline of Mia, eyes squeezed shut, counting', draw(lt, d, t, blit) {
    reset({ t, dark: 0.4 }); miaWalk(t, LX[4] + 0.3, { legs: 'stand', mood: 'scared', tilt: 8 });
    shoot(SC, V3(LX[4] + 1.6, 1.0, WZ - 0.5), V3(LX[4] + 1.4, 1.0, WZ - 0.45), V3(LX[4] + 0.3, 0.95, WZ), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50, exposure: 1.5 }, t); blit();
  } });
  add({ id: 'S23', at: cut(21), note: 'black, snow drifting through it, while she counts to ten', draw(lt, d, t, blit) {
    reset({ t, dark: 0.7 }); miaWalk(t, LX[4] + 0.3, { legs: 'stand', mood: 'scared', tilt: 8 });
    shoot(SC, V3(LX[4] + 3.2, 1.3, WZ - 1.8), V3(LX[4] + 2.6, 1.2, WZ - 1.4), V3(LX[4] + 0.3, 0.8, WZ), null, eio(clamp(lt / d)), { ...NIGHT, exposure: 1.3 }, t); blit();
  } });
  // from here on the Tagalong IS her shadow: Mia casts none, the ghost walks in her exact place
  const outX = (t) => Math.min(LX[5] + 1.6, LX[4] + 0.6 + walk(t, L(22), 1.6));
  add({ id: 'S24', at: cut(22), note: 'she steps out of the dark into the last lamp\'s light', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 5 }); const x = outX(t), w = x < LX[5] + 1.6;
    K.noShadow(miaWalk(t, x, { legs: w ? 'walk' : 'stand', mood: 'worried' })); caseOff(); miaGhost(t, x, { legs: w ? 'walk' : 'stand' }, 0);
    shoot(SC, V3(LX[5] + 3.4, 1.2, WZ + 2.0), V3(LX[5] + 3.1, 1.15, WZ + 1.8), V3(x, 0.8, WZ), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  function caseOff() { vcase.traverse((o) => { if (o.isMesh) o.castShadow = false; }); }
  add({ id: 'S25', at: cut(23), note: 'top-down: one shadow', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 5 }); K.noShadow(miaWalk(t, LX[5] + 1.6, { legs: 'stand', tilt: 34, mood: 'worried' })); caseOff(); miaGhost(t, LX[5] + 1.6, { legs: 'stand' }, 0);
    shoot(SC, V3(LX[5] + 2.6, 5.0, WZ), V3(LX[5] + 2.6, 4.5, WZ), V3(LX[5] + 2.6, 0, WZ), null, eo(clamp(lt / d)), { ...TOP }, t); blit();
  } });
  const wave = (t) => (t > Wd('waved', 24) - 0.2 ? [150 + Math.sin(t * 9) * 18, 18] : [6, -4]);
  add({ id: 'S26', at: cut(24), note: 'she waves; the shadow waves back, perfectly in time. Relief.', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 5 }); K.noShadow(miaWalk(t, LX[5] + 1.6, { legs: 'stand', tilt: 30, mood: t > Wd('back', 24) ? 'warm' : 'worried', armL: wave(t), armR: [6, -4] })); caseOff(); miaGhost(t, LX[5] + 1.6, { legs: 'stand', armL: wave(t), armR: [6, -4] }, 0);
    shoot(SC, V3(LX[5] + 0.9, 2.6, WZ - 1.8), V3(LX[5] + 1.1, 2.4, WZ - 1.6), V3(LX[5] + 2.4, 0.3, WZ + 0.2), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  const wSlam = Wd('slammed', 25);
  add({ id: 'S27', at: cut(25), note: 'she runs to her door, in, and slams it', draw(lt, d, t, blit) {
    reset({ t, shadowAt: 5 }); const k = eo(clamp((t - L(25)) / 1.7)); const p0 = V3(LX[5] + 1.6, 0, WZ), p1 = doorFront.clone().add(V3(0, 0, 0.6));
    const inside = t > wSlam - 0.35; const pos = p0.clone().lerp(p1, k);
    const door = home.userData.door; door.rotation.y = t < wSlam - 0.05 ? lerp(0, 1.3, eo(clamp((t - L(25) - 1.4) / 0.3))) : lerp(1.3, 0, clamp((t - wSlam + 0.05) / 0.12));
    if (!inside) { const ry = Math.atan2(p1.x - p0.x, p1.z - p0.z); K.noShadow(miaWalk(t, pos.x, { legs: 'run', phase: t * 13 })); ppl.mia.group.position.z = pos.z; ppl.mia.group.rotation.y = ry; caseOff(); vcase.visible = false; const g = miaGhost(t, pos.x, { legs: 'run', phase: t * 13 }, 0); g.group.position.z = pos.z; g.group.rotation.y = ry; caseG.visible = false; }
    shoot(SC, V3(doorFront.x + 3.0, 1.6, WZ - 0.6), V3(doorFront.x + 2.7, 1.55, WZ - 0.3), V3(doorFront.x - 0.4, 1.0, doorFront.z - 0.6), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  cue(wSlam, 'slam', { gain: 1.1 });

  // ═════════════ THE ROOM ═════════════
  const BR = K.bedroom(E), BS = BR.scene;
  const bm = B.person(LOOK.mia); BS.add(bm.group); K.noShadow(bm);
  const bg = K.ghostify(B.person(LOOK.mia)); BS.add(bg.group);
  const MP = V3(0.45, 0, -3.6), MRY = 0.5;
  const wReached = Wd('reached', 26), wDown = Wd('down', 29), LAG = 1.0;
  const armAt = (t, holdForever) => { const up = eo(clamp((t - wReached) / 0.6)); const down = holdForever ? 0 : eo(clamp((t - wDown + 0.25) / 0.5)); return [lerp(5, 128, up * (1 - down)), lerp(-4, -10, up * (1 - down))]; };
  const bedPose = (t, extra = {}) => {
    bm.at(MP.x, 0, MP.z, MRY).set({ armR: armAt(t, false), mood: extra.mood || 'neutral', turn: extra.turn || 0 });
    const gt = t - LAG; bg.at(MP.x, 0, MP.z, MRY).set({ armR: armAt(gt, gt > wDown - 1.0), turn: 0, roll: extra.roll || 0 });
  };
  const wallPt = V3(-0.6, 1.5, -6);
  add({ id: 'S28', at: cut(26), note: 'her bedroom: Mia reaches up for the lamp chain; her shadow huge on the wall behind', draw(lt, d, t, blit) {
    BR.set(1); bedPose(t);
    shoot(BS, V3(2.4, 1.6, -1.2), V3(2.2, 1.55, -1.5), V3(0, 1.3, -5.0), null, eo(clamp(lt / d)), { ...IN }, t); blit();
  } });
  add({ id: 'S29', at: cut(27), note: 'the wall: the shadow\'s arm rises... after hers', draw(lt, d, t, blit) {
    BR.set(1); bedPose(t);
    shoot(BS, V3(1.7, 1.6, -2.5), V3(1.55, 1.6, -2.7), wallPt.clone().add(V3(0, 0.3, 0)), null, eo(clamp(lt / d)), { ...IN }, t); blit();
  } });
  add({ id: 'S30', at: cut(28), note: 'close: Mia\'s face as she notices, eyes sliding toward the wall', draw(lt, d, t, blit) {
    BR.set(1); bedPose(t, { mood: 'shocked', turn: lerp(0, -35, eo(clamp((t - L(28)) / 0.6))) });
    shoot(BS, V3(1.45, 1.22, -2.75), V3(1.38, 1.2, -2.85), V3(MP.x, 1.12, MP.z), null, eo(clamp(lt / d)), { ...IN, fov: 50, aperture: 0.002 }, t); blit();
  } });
  add({ id: 'S31', at: cut(29), note: 'wide: she lowers her hand. On the wall, the shadow\'s hand stays up.', draw(lt, d, t, blit) {
    BR.set(1); bedPose(t, { mood: 'scared', turn: -35 });
    shoot(BS, V3(2.6, 1.65, -1.4), V3(2.4, 1.6, -1.6), V3(-0.1, 1.35, -5.0), null, eo(clamp(lt / d)), { ...IN }, t); blit();
  } });
  add({ id: 'S32', at: cut(30), note: 'slow push on the wall: the shadow tilts its head', draw(lt, d, t, blit) {
    BR.set(1); bedPose(t, { mood: 'scared', turn: -35, roll: lerp(0, 28, eio(clamp((t - L(30) - 0.4) / 1.4))) });
    shoot(BS, V3(1.5, 1.7, -2.6), V3(0.9, 1.75, -4.2), wallPt.clone().add(V3(0.1, 0.5, 0)), null, eio(clamp(lt / d)), { ...IN }, t); blit();
  } });
  const offAt = Le(31) + 0.5;
  add({ id: 'S33', at: cut(31), note: 'Mia frozen in front; the shadow behind her with its arm up and head tilted; the lamp clicks off', draw(lt, d, t, blit) {
    BR.set(t > offAt ? 0 : 1); bedPose(t, { mood: 'scared', turn: -35, roll: 28 });
    shoot(BS, V3(1.3, 1.25, -2.7), V3(1.15, 1.22, -2.95), V3(-0.2, 1.3, -5.2), null, eo(clamp(lt / d)), { ...IN, fov: 54 }, t); blit();
    if (t > offAt) black();
  } });
  cue(offAt, 'tock', { gain: 1.0 });

  CAP.y = 1250;
  return { shots: S, cues: CUES };
}
