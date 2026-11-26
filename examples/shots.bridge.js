// IN THIS TOWN, YOU NEVER CROSS THE BRIDGE IN THE DARK: the shot list (Suspense Story / blocky-town style).
import * as THREE from 'three';
import { ctx, clamp, lerp, eo, eio } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import { CAP } from './core/captions.js';
import * as B from './core/blocky.js';
import * as R from './core/bridge.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const wobble = (t, a = 0.02) => V3(Math.sin(t * 1.3) * a, Math.sin(t * 1.7 + 1) * a, 0);
const DK = R.DECK;

const LOOK = {
  mia: { shirt: '#3E6B4E', pants: '#2B3550', hair: '#5A3A22', long: true, kid: true, scarf: '#C8443F' },
  sam: { shirt: '#F2A93B', pants: '#384060', hair: '#2A1C14', kid: true, hat: 'beanie', hatCol: '#3C6FB6' },
  pale: { shirt: '#A9AFB8', pants: '#7C828C', hair: '#9DA2AA', long: true, kid: true, scarf: '#C6CAD0', skin: '#DCE0E6', shoes: '#8A9098' },
  okafor: { shirt: '#7A4A3A', pants: '#2B2B35', hair: '#1A1410', skin: '#8A5A3C', coat: '#3A3A44' },
  lady: { shirt: '#5E8A7A', pants: '#3A3550', hair: '#8A5A3A', long: true },
  man: { shirt: '#4A5E80', pants: '#2E2E3A', hair: '#3A2A20', hat: 'beanie', hatCol: '#7A3A3A' },
  gran: { shirt: '#C77DBA', pants: '#3A3550', hair: '#D8D8DC', long: true },
  kid2: { shirt: '#C8443F', pants: '#384060', hair: '#6A4A2A', kid: true, hat: 'cap', hatCol: '#E8B830' },
};

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(58);
  const shoot = (scene, from, to, at, at2, k, look = {}, t = 0) => {
    const fov = look.fov || 58; if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(from).lerp(to, k).add(wobble(t, look.shake ?? 0.01));
    const tg = at2 ? at.clone().lerp(at2, k) : at; cam.lookAt(tg);
    E.render(scene, cam, { bloom: 0.3, bloomThreshold: 0.75, aperture: 0.0009, maxblur: 0.007, ...look, focus: look.focus ?? cam.position.distanceTo(tg), t });
  };
  const NIGHT = { bloom: 0.5, bloomThreshold: 0.68, aperture: 0.0008, maxblur: 0.006, vignette: 0.55, exposure: 1.1, sat: 1.05 };
  const CLOSE = { ...NIGHT, aperture: 0.0022, maxblur: 0.009 };
  const MORN = { bloom: 0.15, bloomThreshold: 0.9, aperture: 0.0014, maxblur: 0.007, vignette: 0.4, exposure: 0.95, sat: 0.7 };
  const black = () => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1080, 1920); };
  const fadeOut = (k) => { if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, k)})`; ctx.fillRect(0, 0, 1080, 1920); } };
  const die = (t, t0, dur = 0.3) => (t < t0 ? 1 : Math.max(0, 1 - (t - t0) / dur)) * (t < t0 ? 1 : 0.6 + 0.4 * Math.sin((t - t0) * 60));

  // ── the set ─────────────────────────────────────────────
  const RV = R.riverSet(E), SC = RV.scene;
  const ppl = {}; Object.keys(LOOK).forEach((k) => { ppl[k] = B.person(LOOK[k]); SC.add(ppl[k].group); });
  Object.values(ppl).forEach((p) => (p.group.userData.base = p.group.scale.x)); ppl.sam.group.userData.s = 0.84;
  const lan = {}; ['a', 'b', 'c', 'd'].forEach((k, i) => { lan[k] = R.lantern({ seed: i * 2.3 }); SC.add(lan[k]); });
  const hands = []; for (let i = 0; i < 6; i++) { const h = R.paleHand(); SC.add(h); hands.push(h); }
  const reset = (o = {}) => {
    Object.values(ppl).forEach((p) => { p.group.visible = false; p.group.scale.setScalar(p.group.userData.base * (p.group.userData.s || 1)); });
    Object.values(lan).forEach((l) => { l.visible = false; l.rotation.set(0, 0, 0); l.set(1); });
    hands.forEach((h) => (h.visible = false)); RV.rim.intensity = 0; RV.rim.distance = 5;
    RV.set({ flow: 1, mode: 'night', wind: 0.3, ...o });
  };
  const show = (k, x, z, ry, st = {}) => { const p = ppl[k]; p.group.visible = true; p.at(x, DK, z, ry).set(st); return p; };
  // lantern hanging from a hand (side 1 = right, 0 = left)
  const hang = (p, l, k, t, side = 1) => { p.group.updateMatrixWorld(true); l.visible = true; l.position.copy(p.arms[side].userData.hand.getWorldPosition(V3())).add(V3(0, -0.34 * (p.group.userData.s ? 0.9 : 1), 0)); l.scale.setScalar(p.group.userData.s ? 0.9 : 1); l.set(k, t); return l; };
  const railHand = (i, x, side, k) => { const h = hands[i]; h.userData.baseY = DK + R.RAIL - 0.02; h.position.set(x, 0, side * (R.BW / 2 + 0.07)); h.rotation.y = side > 0 ? 0 : Math.PI; h.set(k); };
  const walk = (t, t0, v) => (t - t0) * v;

  // ═════════════ HOOK ═════════════
  const wLantern = Wd('lantern', 0);
  add({ id: 'S01', at: 0, note: 'aerial: the black river, the long bridge, one tiny lantern crossing in fog', draw(lt, d, t, blit) {
    reset({ t }); const x = -6 + walk(t, 0, 0.6); const p = show('lady', x, -0.2, Math.PI / 2, { legs: 'walk', phase: t * 6, armR: [8, -6] }); hang(p, lan.a, 1, t);
    shoot(SC, V3(-22, 15, 24), V3(-9, 6.5, 12), V3(0, 1, 0), V3(x, DK, 0), eo(clamp(lt / d)), { ...NIGHT, fov: 50, exposure: 1.5 }, t); blit();
  } });
  add({ id: 'S02', at: wLantern - 0.15, note: 'close: the lantern flame swinging along the planks', draw(lt, d, t, blit) {
    reset({ t }); const x = -6 + walk(t, 0, 0.6); const p = show('lady', x, -0.2, Math.PI / 2, { legs: 'walk', phase: t * 6, armR: [8, -6] }); const l = hang(p, lan.a, 1, t); const lp = l.position;
    shoot(SC, V3(lp.x + 0.35, lp.y + 0.15, lp.z + 0.75), V3(lp.x + 0.25, lp.y + 0.15, lp.z + 0.65), V3(lp.x, lp.y + 0.15, lp.z), null, eo(clamp(lt / d)), { ...CLOSE, fov: 44 }, t); blit();
  } });
  const wTakes = Wd('takes', 2);
  add({ id: 'S03', at: cut(1), note: 'low on the planks: walking legs, the flame shudders in the wind', draw(lt, d, t, blit) {
    reset({ t, wind: 1.2 }); const x = -6 + walk(t, 0, 0.6); const p = show('lady', x, -0.2, Math.PI / 2, { legs: 'walk', phase: t * 6, armR: [8, -6] });
    hang(p, lan.a, 0.65 + 0.35 * Math.abs(Math.sin(t * 5)), t);
    const lp3 = lan.a.position; shoot(SC, V3(lp3.x + 0.9, DK + 0.55, 1.5), V3(lp3.x + 0.7, DK + 0.55, 1.35), V3(lp3.x, lp3.y + 0.1, lp3.z), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  add({ id: 'S04', at: cut(2), note: 'the flame dies; dark; the lady is gone and her lantern drops to the planks', draw(lt, d, t, blit) {
    reset({ t, wind: 0.8 }); const x = -6 + walk(Math.min(t, wTakes), 0, 0.6); const gone = t > wTakes + 0.45;
    const l = lan.a; if (!gone) { const p = show('lady', x, -0.2, Math.PI / 2, { legs: t < wTakes ? 'walk' : 'stand', phase: t * 6, armR: [8, -6], mood: t > wTakes ? 'shocked' : 'worried' }); hang(p, l, die(t, wTakes), t); }
    else { l.visible = true; const k = eo(clamp((t - wTakes - 0.45) / 0.25)); l.position.y = lerp(l.position.y, DK + 0.06, k); l.rotation.z = k * 1.4; l.set(0); }
    RV.rim.position.set(x + 0.4, DK + 1.6, 1.2); RV.rim.intensity = 0.8;
    shoot(SC, V3(x + 2.6, DK + 1.5, 2.4), V3(x + 2.3, DK + 1.4, 2.2), V3(x, DK + 0.8, -0.2), null, eo(clamp(lt / d)), { ...CLOSE, exposure: 1.2 }, t); blit();
  } });
  cue(wTakes, 'puff', { gain: 1 }); cue(wTakes + 0.62, 'clink', { gain: 0.8 });

  // ═════════════ THE WORLD ═════════════
  add({ id: 'S05', at: cut(3), note: 'push along the empty foggy deck to a lantern left lying on the planks', draw(lt, d, t, blit) {
    reset({ t }); const l = lan.b; l.visible = true; l.position.set(1.2, DK + 0.06, 0.1); l.rotation.z = 1.4; l.set(0); RV.rim.position.set(1.4, DK + 1.2, 0.8); RV.rim.intensity = 3.5;
    shoot(SC, V3(-7, DK + 1.2, 0.2), V3(-0.6, DK + 0.55, 0.15), V3(1.2, DK + 0.15, 0.1), null, eio(clamp(lt / d)), { ...NIGHT, exposure: 1.2 }, t); blit();
  } });
  const wDied = Wd('died', 4);
  add({ id: 'S06', at: cut(4), note: 'Mr. Okafor mid-bridge, lit from below; his flame dies', draw(lt, d, t, blit) {
    reset({ t, wind: 0.8 }); const x = -1.5 + walk(Math.min(t, wDied), L(4), 0.5);
    const p = show('okafor', x, -0.15, Math.PI / 2, { legs: t < wDied ? 'walk' : 'stand', phase: t * 6, armR: [30, -4], mood: t > wDied ? 'shocked' : 'worried' }); hang(p, lan.a, die(t, wDied, 0.35), t);
    RV.rim.position.set(x + 1, DK + 2.2, 1.5); RV.rim.intensity = 0.7;
    shoot(SC, V3(x + 2.5, DK + 1.6, 0.9), V3(x + 2.2, DK + 1.6, 0.8), V3(x, DK + 1.25, -0.15), null, eo(clamp(lt / d)), { ...CLOSE, fov: 52 }, t); blit();
  } });
  cue(wDied, 'puff', { gain: 1 });
  add({ id: 'S07', at: cut(5), note: 'grey morning: his lantern on its side on the frosty planks', draw(lt, d, t, blit) {
    reset({ t, mode: 'morning', wind: 0.1 }); const l = lan.a; l.visible = true; l.position.set(0.3, DK + 0.06, -0.1); l.rotation.set(0, 0.5, 1.45); l.set(0);
    shoot(SC, V3(1.3, DK + 0.5, 0.9), V3(1.0, DK + 0.4, 0.7), V3(0.3, DK + 0.1, -0.1), null, eo(clamp(lt / d)), { ...MORN, fov: 46, aperture: 0.002 }, t); blit();
  } });
  add({ id: 'S08', at: cut(6), note: 'dusk at the bridge foot: a mother checks her child\'s wick', draw(lt, d, t, blit) {
    reset({ t }); const bx = -R.HALF - 1.6;
    show('lady', bx, -0.8, Math.PI - 0.6, { legs: 'kneel', mood: 'worried', armR: [55, -10] });
    show('kid2', bx + 0.7, -1.1, -Math.PI / 2 - 0.6, { mood: 'worried' });
    const l = lan.b; l.visible = true; l.position.set(bx + 0.42, DK, -0.95); l.set(0.7 + 0.3 * Math.sin(t * 3), t);
    shoot(SC, V3(bx + 0.9, DK + 1.4, -3.9), V3(bx + 0.8, DK + 1.3, -3.6), V3(bx + 0.35, DK + 0.5, -0.9), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  const sg = RV.signG, sDir = V3(Math.sin(sg.rotation.y), 0, Math.cos(sg.rotation.y)), sPos = sg.position.clone().add(V3(0, 1.2, 0));
  add({ id: 'S09', at: cut(7), note: 'the camera drifts to a carved wooden sign at the bridge foot', draw(lt, d, t, blit) {
    reset({ t }); const l = lan.b; l.visible = true; l.position.copy(sg.position).add(sDir.clone().multiplyScalar(0.5)).add(V3(0.6, 0, 0)); l.set(1, t);
    shoot(SC, sPos.clone().add(sDir.clone().multiplyScalar(4.2)).add(V3(1.6, 0.6, 0)), sPos.clone().add(sDir.clone().multiplyScalar(2.6)).add(V3(0.5, 0.2, 0)), sPos.clone().add(V3(1.5, -0.2, 0)), sPos, eio(clamp(lt / d)), { ...NIGHT, exposure: 1.2 }, t); blit();
  } });
  add({ id: 'S10', at: cut(8), note: 'close on the sign: ONE FLAME. ONE CROSSING.', draw(lt, d, t, blit) {
    reset({ t }); const l = lan.b; l.visible = true; l.position.copy(sg.position).add(sDir.clone().multiplyScalar(0.5)).add(V3(0.6, 0, 0)); l.set(1, t);
    shoot(SC, sPos.clone().add(sDir.clone().multiplyScalar(2.6)), sPos.clone().add(sDir.clone().multiplyScalar(2.35)), sPos, null, eo(clamp(lt / d)), { ...NIGHT, fov: 58, exposure: 1.3 }, t); blit();
  } });
  add({ id: 'S11', at: cut(9), note: 'wide: two people crossing, two small flames', draw(lt, d, t, blit) {
    reset({ t }); const x = -5 + walk(t, L(9), 0.7);
    hang(show('man', x, -0.3, Math.PI / 2, { legs: 'walk', phase: t * 6, armR: [8, -6] }), lan.a, 1, t);
    hang(show('lady', x - 1.2, 0.3, Math.PI / 2, { legs: 'walk', phase: t * 6 + 1, armR: [8, -6] }), lan.b, 1, t);
    shoot(SC, V3(x - 4, DK + 3.2, 7), V3(x - 2, DK + 2.4, 5.2), V3(x - 0.6, DK + 0.6, 0), null, eio(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  const wStays = Wd('stays', 10);
  add({ id: 'S12', at: cut(10), note: 'two people share ONE lantern... on "stays" one of them is simply gone', draw(lt, d, t, blit) {
    reset({ t }); const x = 0.5 + walk(t, L(10), 0.6);
    hang(show('man', x, -0.3, Math.PI / 2, { legs: 'walk', phase: t * 6, armR: [8, -6], mood: t > wStays + 0.1 ? 'shocked' : 'worried', turn: t > wStays + 0.3 ? 70 : 0 }), lan.a, 1, t);
    if (t < wStays) show('lady', x - 0.1, 0.35, Math.PI / 2, { legs: 'walk', phase: t * 6 + 1, mood: 'worried' });
    shoot(SC, V3(x + 0.8, DK + 1.6, 4.4), V3(x + 0.5, DK + 1.5, 4.0), V3(x - 0.1, DK + 0.9, 0), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  cue(wStays, 'rumble', { dur: 2.0, gain: 0.9 });

  // ═════════════ MIA & SAM ═════════════
  const PX = -R.HALF - 3.6;
  add({ id: 'S13', at: cut(11), note: 'Grandma\'s porch: little Sam stares at the bridge, scared; Mia beside him', draw(lt, d, t, blit) {
    reset({ t });
    show('sam', PX, 0.0, Math.PI / 2 - 0.3, { mood: 'scared' }); show('mia', PX - 0.2, -0.65, Math.PI / 2 - 0.2, { mood: 'neutral', armR: [10, 0] });
    shoot(SC, V3(PX + 3.0, DK + 1.2, 1.2), V3(PX + 2.7, DK + 1.15, 1.05), V3(PX, DK + 0.85, -0.3), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  add({ id: 'S14', at: cut(12), note: 'wide: Mia and Sam set off across the bridge with two lanterns; Grandma waves from the porch', draw(lt, d, t, blit) {
    reset({ t }); const x = -R.HALF - 0.5 + walk(t, L(12), 0.8);
    hang(show('mia', x, -0.3, Math.PI / 2, { legs: 'walk', phase: t * 7, armR: [8, -6] }), lan.a, 1, t);
    hang(show('sam', x - 0.2, 0.3, Math.PI / 2, { legs: 'walk', phase: t * 8, armR: [8, -6] }), lan.b, 1, t);
    show('gran', -R.HALF - 4.4, -1.4, Math.PI / 2, { mood: 'warm', armR: [150 + Math.sin(t * 6) * 15, 20] });
    shoot(SC, V3(-7, DK + 2.4, 7), V3(-7.5, DK + 2.0, 6), V3(-R.HALF - 1.5, DK + 0.6, 0), null, eio(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  add({ id: 'S15', at: cut(13), note: 'close: Mia kneels and checks Sam\'s lantern', draw(lt, d, t, blit) {
    reset({ t }); const x = -11.6;
    show('mia', x - 0.45, 0, Math.PI / 2, { legs: 'kneel', mood: 'neutral', armR: [70, -8], armL: [60, 8] });
    const s = show('sam', x + 0.25, 0, -Math.PI / 2, { mood: 'worried', armR: [55, 6] });
    hang(s, lan.b, 1, t); const l2 = lan.a; l2.visible = true; l2.position.set(x - 0.5, DK, -0.45); l2.set(1, t);
    shoot(SC, V3(x - 0.1, DK + 1.05, 2.7), V3(x - 0.1, DK + 1.0, 2.45), V3(x - 0.1, DK + 0.55, 0), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  add({ id: 'S16', at: cut(14), note: 'wind: snow blows sideways, the flames bend; the two set out', draw(lt, d, t, blit) {
    reset({ t, wind: 4.5, flow: 2.2 }); const x = -9 + walk(t, L(14), 0.8);
    hang(show('mia', x, -0.3, Math.PI / 2, { legs: 'walk', phase: t * 7, armL: [8, 6], armR: [8, -6] }), lan.a, 0.6 + 0.4 * Math.abs(Math.sin(t * 7)), t, 0);
    hang(show('sam', x, 0.3, Math.PI / 2, { legs: 'walk', phase: t * 8, armR: [8, -6] }), lan.b, 0.6 + 0.4 * Math.abs(Math.sin(t * 6 + 1)), t, 1);
    shoot(SC, V3(-14, DK + 1.5, 2.6), V3(-13.3, DK + 1.4, 2.3), V3(x + 1, DK + 0.6, 0), null, eio(clamp(lt / d)), { ...NIGHT, shake: 0.03 }, t); blit();
  } });
  cue(L(14) - 0.2, 'wind', { dur: 9.5, gain: 1 });
  const holding = (t, x) => {
    hang(show('mia', x, -0.22, Math.PI / 2, { legs: 'walk', phase: t * 7, armL: [8, 6], armR: [18, 38], mood: 'worried' }), lan.a, 0.75 + 0.25 * Math.sin(t * 8), t, 0);
    hang(show('sam', x, 0.3, Math.PI / 2, { legs: 'walk', phase: t * 8, armL: [18, 38], armR: [8, -6], mood: 'scared' }), lan.b, 0.7 + 0.3 * Math.sin(t * 9 + 1), t, 1);
  };
  add({ id: 'S17', at: cut(15), note: 'tracking close: Sam grips Mia\'s hand', draw(lt, d, t, blit) {
    reset({ t, wind: 3.5, flow: 2 }); const x = -3.2 + walk(t, L(15), 0.8); holding(t, x);
    shoot(SC, V3(x + 0.4, DK + 1.0, 3.0), V3(x + 0.5, DK + 0.95, 2.8), V3(x, DK + 0.6, 0.05), null, eo(clamp(lt / d)), { ...CLOSE, shake: 0.02 }, t); blit();
  } });
  const wOut = Wd('out', 16), MX = 0;   // halfway
  const stand = (t, samK = 0, st = {}) => {
    hang(show('mia', MX, -0.22, Math.PI / 2, { armL: [8, 6], mood: 'scared', ...st.mia }), lan.a, st.miaK ?? 1, t, 0);
    const s = show('sam', MX, 0.3, Math.PI / 2, { armR: [8, -6], mood: 'scared', ...st.sam }); if (!st.noSamLan) hang(s, lan.b, samK, t, 1);
  };
  add({ id: 'S18', at: cut(16), note: 'close on Sam\'s lantern: halfway across, his flame goes out', draw(lt, d, t, blit) {
    reset({ t, wind: 3, flow: 2 }); const walking = t < wOut; const x = walking ? MX - 1.2 + walk(t, L(16), 0.8) : MX;
    if (walking) holding(t, Math.min(x, MX)); else stand(t, die(t, wOut, 0.3));
    const lp = lan.b.position;
    shoot(SC, V3(lp.x + 0.7, DK + 0.7, 1.35), V3(lp.x + 0.6, DK + 0.68, 1.2), V3(lp.x, DK + 0.45, 0.3), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });
  cue(wOut, 'puff', { gain: 1.1 });
  const wStill = Wd('still', 17);
  add({ id: 'S19', at: cut(17), note: 'the black water below... the ripples stop dead; snow hangs', draw(lt, d, t, blit) {
    const f = t < wStill ? 1.6 : Math.max(0, 1.6 - (t - wStill) * 4);
    reset({ t: t < wStill ? t : wStill + (t - wStill) * 0.1, flow: f, wind: t < wStill ? 2.5 : 0.05 }); stand(t, 0); RV.rim.position.set(0.9, DK + 0.6, 3.2); RV.rim.distance = 8; RV.rim.intensity = 5;
    shoot(SC, V3(0.9, DK + 1.15, 0.45), V3(0.9, DK + 1.1, 0.55), V3(0.9, 0, 3.6), null, eo(clamp(lt / d)), { ...NIGHT, exposure: 1.2 }, t); blit();
  } });
  const wCurled = Wd('curled', 18);
  add({ id: 'S20', at: cut(18), note: 'facing Sam: behind him pale fingers rise and curl over the railing', draw(lt, d, t, blit) {
    reset({ t: wStill, flow: 0, wind: 0 }); stand(t, 0, { sam: { mood: 'scared' } }); RV.rim.position.set(-0.6, DK + 1.6, 1.4); RV.rim.intensity = 1.2;
    railHand(0, -0.65, 1, eio(clamp((t - wCurled + 0.5) / 1.0)));
    shoot(SC, V3(2.3, DK + 1.15, 0.85), V3(2.1, DK + 1.12, 0.85), V3(-0.4, DK + 0.85, 0.65), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  cue(wCurled, 'rumble', { dur: 2.5, gain: 1 });
  add({ id: 'S21', at: cut(19), note: 'close: Mia\'s face over her lantern, the only flame left', draw(lt, d, t, blit) {
    reset({ t: wStill, flow: 0, wind: 0 }); stand(t, 0, { mia: { mood: 'scared' } });
    shoot(SC, V3(MX + 1.5, DK + 1.05, -0.3), V3(MX + 1.35, DK + 1.03, -0.3), V3(MX, DK + 0.95, -0.22), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });
  add({ id: 'S22', at: cut(20), note: 'high wide: two kids in one small circle of light; pale fingers on both rails', draw(lt, d, t, blit) {
    reset({ t: wStill, flow: 0, wind: 0 }); stand(t, 0);
    [[-0.65, 1], [-2.0, -1], [1.6, 1], [2.4, -1], [-3.1, 1]].forEach(([x, s], i) => railHand(i, x, s, 1)); RV.rim.position.set(0, DK + 3, 0); RV.rim.intensity = 0.8;
    shoot(SC, V3(3.6, DK + 3.2, 3.2), V3(3.2, DK + 2.9, 2.8), V3(0, DK + 0.4, 0), null, eio(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  const wPushed = Wd('pushed', 21);
  add({ id: 'S23', at: cut(21), note: 'Mia turns and pushes her lantern into Sam\'s hands', draw(lt, d, t, blit) {
    reset({ t: wStill, flow: 0, wind: 0 }); const k = eio(clamp((t - wPushed + 0.2) / 0.7));
    const m = show('mia', MX, -0.22, lerp(Math.PI / 2, 0.15, eio(clamp((t - L(21)) / 0.5))), { mood: 'scared', armL: [lerp(8, 70, k), 0], armR: [lerp(0, 70, k), 0] });
    const s = show('sam', MX + 0.05, 0.42, Math.PI - 0.15, { mood: 'scared', armR: [lerp(8, 60, k), -6], armL: [lerp(0, 60, k), 6] });
    m.group.updateMatrixWorld(true); s.group.updateMatrixWorld(true);
    const a = m.arms[0].userData.hand.getWorldPosition(V3()), b = s.arms[1].userData.hand.getWorldPosition(V3());
    const l = lan.a; l.visible = true; l.position.copy(a.lerp(b, k)).add(V3(0, -0.3, 0)); l.set(1, t);
    railHand(0, -0.65, 1, 1); railHand(1, -2.0, -1, 1);
    shoot(SC, V3(MX + 2.7, DK + 1.15, 0.3), V3(MX + 2.45, DK + 1.1, 0.28), V3(MX, DK + 0.7, 0.1), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  add({ id: 'S24', at: cut(22), note: 'close: Mia, lit from below by the lantern now in Sam\'s hands: "Run. Don\'t look back."', draw(lt, d, t, blit) {
    reset({ t: wStill, flow: 0, wind: 0 }); show('mia', MX, -0.22, 0.15, { mood: t < Le(22) ? (Math.sin(t * 15) > 0 ? 'talk' : 'crying') : 'crying' });
    const l = lan.a; l.visible = true; l.position.set(MX + 0.08, DK + 0.42, 0.25); l.set(1, t);
    shoot(SC, V3(MX + 0.15, DK + 1.02, 1.2), V3(MX + 0.12, DK + 1.0, 1.08), V3(MX, DK + 0.95, -0.22), null, eo(clamp(lt / d)), { ...CLOSE, fov: 50 }, t); blit();
  } });
  const runX = (t) => MX + 0.3 + walk(t, L(23) - 0.1, 5.0);
  add({ id: 'S25', at: cut(23), note: 'behind Mia: Sam runs away with the light, smaller and smaller', draw(lt, d, t, blit) {
    reset({ t: wStill, flow: 0, wind: 0 }); show('mia', MX, -0.22, Math.PI / 2, { mood: 'crying' });
    const x = Math.min(runX(t), R.HALF + 2); hang(show('sam', x, 0.2, Math.PI / 2, { legs: 'run', phase: t * 14, armR: [20, -6] }), lan.a, 1, t);
    railHand(0, -0.65, 1, 1); railHand(1, -2.0, -1, 1); railHand(2, 1.6, 1, 1);
    shoot(SC, V3(MX - 2.3, DK + 1.35, -0.75), V3(MX - 2.15, DK + 1.32, -0.7), V3(MX + 6, DK + 0.7, 0), null, eo(clamp(lt / d)), { ...NIGHT, exposure: 1.2 }, t); blit();
  } });
  cue(L(23), 'whoosh', { gain: 0.5 });
  add({ id: 'S26', at: cut(24), note: 'Mia alone in the dark; pale fingers all along the rails; fade to black', draw(lt, d, t, blit) {
    reset({ t: wStill, flow: 0, wind: 0 }); show('mia', MX, 0, Math.PI / 2 + 0.3, { mood: 'scared', armL: [10, 0], armR: [10, 0] });
    RV.rim.position.set(MX + 0.8, DK + 2.2, 1.6); RV.rim.intensity = 0.9;
    [[-0.65, 1], [-2.0, -1], [1.6, 1], [0.9, -1], [-1.3, 1], [2.2, -1]].forEach(([x, s], i) => railHand(i, x, s, eio(clamp((t - L(24) - i * 0.25) / 0.8))));
    shoot(SC, V3(MX + 3.4, DK + 1.9, 2.3), V3(MX + 3.0, DK + 1.75, 2.0), V3(MX, DK + 0.8, 0), null, eio(clamp(lt / d)), { ...NIGHT, exposure: 1.15 }, t); blit();
    fadeOut((t - Le(24) - 0.2) / 0.8);
  } });

  // ═════════════ THE TWIST ═════════════
  add({ id: 'S27', at: cut(25), note: 'the far bank: Sam stumbles off the bridge, drops to his knees, lantern lit, looks back', draw(lt, d, t, blit) {
    reset({ t, flow: 0.6 }); const k = eo(clamp((t - L(25)) / 0.8)), x = lerp(R.HALF - 1.5, R.HALF + 0.9, k);
    const s = show('sam', x, 0.1, lerp(Math.PI / 2, -Math.PI / 2 + 0.6, clamp((t - L(25) - 0.9) / 0.6)), { legs: k >= 1 ? 'kneel' : 'run', phase: t * 12, mood: 'crying', armR: [30, -6] });
    hang(s, lan.a, 1, t);
    shoot(SC, V3(R.HALF + 4.2, DK + 1.3, 2.6), V3(R.HALF + 3.9, DK + 1.2, 2.4), V3(R.HALF + 0.6, DK + 0.5, 0), null, eo(clamp(lt / d)), { ...CLOSE }, t); blit();
  } });
  add({ id: 'S28', at: cut(26), note: 'mid-bridge: the planks where Mia stood are empty. No lantern left behind.', draw(lt, d, t, blit) {
    reset({ t, flow: 0.3 }); RV.rim.position.set(0, DK + 1.6, 1.2); RV.rim.intensity = 1.0;
    shoot(SC, V3(-2.2, DK + 0.5, 0.3), V3(-1.4, DK + 0.4, 0.25), V3(MX, DK + 0.1, 0), null, eio(clamp(lt / d)), { ...NIGHT, exposure: 1.2 }, t); blit();
  } });
  add({ id: 'S29', at: cut(27), note: 'reveal: a pale, colourless Mia standing in the fog in the middle of the bridge', draw(lt, d, t, blit) {
    reset({ t, flow: 0.3, wind: 0.15 }); show('pale', MX, 0, -Math.PI / 2, { mood: 'neutral' }); RV.rim.position.set(MX - 1.2, DK + 1.8, 1.0); RV.rim.intensity = 2.2;
    shoot(SC, V3(MX - 4.6, DK + 1.1, 0.25), V3(MX - 3.2, DK + 1.0, 0.15), V3(MX, DK + 0.8, 0), null, eio(clamp(lt / d)), { ...NIGHT, exposure: 1.2, sat: 0.6 }, t); blit();
  } });
  const wGave = Wd('gave', 28);
  add({ id: 'S30', at: cut(28), note: 'her pale hand curls over the railing: the same fingers as before. She is the Toll.', draw(lt, d, t, blit) {
    reset({ t, flow: 0.3, wind: 0.15 }); const p = show('pale', MX, 0.45, 0.1, { mood: 'neutral', armR: [55, 20] });
    RV.rim.position.set(MX - 0.4, DK + 1.8, 1.6); RV.rim.intensity = 2.0;
    const h = hands[0]; h.userData.baseY = DK + R.RAIL - 0.02; h.position.set(MX - 0.15, 0, R.BW / 2 + 0.07); h.rotation.y = 0; h.set(eio(clamp((t - L(28) - 0.3) / 1.4)));
    const k = eio(clamp((t - wGave + 0.6) / 1.6));
    shoot(SC, V3(MX - 0.75, DK + 1.15, 1.1), V3(MX - 2.2, DK + 1.3, 2.7), V3(MX - 0.15, DK + R.RAIL, 0.9), V3(MX, DK + 0.95, 0.5), k, { ...NIGHT, exposure: 1.2, sat: 0.6, aperture: 0.0016 }, t); blit();
  } });
  const wOut29 = Wd('out', 29), endBlack = Le(29) + 0.35;
  add({ id: 'S31', at: cut(29), note: 'a new child steps onto the bridge with a lantern; pale Mia turns to watch; the flame dies; black', draw(lt, d, t, blit) {
    reset({ t, flow: 0.4, wind: 0.6 }); const x = -R.HALF - 0.5 + walk(Math.min(t, wOut29), L(29), 0.6);
    hang(show('kid2', x, 0, Math.PI / 2, { legs: t < wOut29 ? 'walk' : 'stand', phase: t * 7, armR: [8, -6], mood: 'worried' }), lan.b, die(t, wOut29, 0.4), t);
    show('pale', -4.9, -0.55, Math.PI / 2, { mood: 'neutral', turn: lerp(0, 150, eio(clamp((t - L(29) - 0.8) / 1.5))) }); RV.rim.position.set(-4.9, DK + 1.8, 0.6); RV.rim.intensity = 1.6;
    shoot(SC, V3(-1.5, DK + 1.25, 0.6), V3(-1.8, DK + 1.2, 0.55), V3(-8, DK + 0.8, 0), null, eo(clamp(lt / d)), { ...NIGHT, exposure: 1.2 }, t); blit();
    if (t > endBlack) black();
  } });
  cue(wOut29, 'puff', { gain: 1 });

  CAP.y = 1250; const sA = cut(8), sB = cut(9); CAP.yAt = (t) => (t >= sA && t < sB ? 1700 : 1250);
  return { shots: S, cues: CUES };
}
