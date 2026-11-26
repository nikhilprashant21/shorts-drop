// IN THIS TOWN, SOMETHING KNOCKS WITH YOUR DAD'S VOICE: the shot list (Suspense Story / blocky-town style).
import * as THREE from 'three';
import { ctx, clamp, lerp, eo, eio } from './core/lib.js';
import { L, Le, Wd, T, lineWords } from './core/timing.js';
import { camera } from './core/engine.js';
import { CAP } from './core/captions.js';
import { mat } from './core/world.js';
import * as B from './core/blocky.js';
import * as K from './core/knock.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const talkM = (t) => (Math.sin(t * 15) > 0 ? 'talk' : 'neutral');
const wobble = (t, a = 0.02) => V3(Math.sin(t * 1.3) * a, Math.sin(t * 1.7 + 1) * a, 0);
const SKIN = '#F2C99B';

const LOOK = {
  mia: { shirt: '#3E6B4E', pants: '#2B3550', hair: '#5A3A22', long: true, kid: true, scarf: '#C8443F' },
  dad: { shirt: '#4A6380', pants: '#2E2E3A', hair: '#3A2A20', zip: '#2E3A4A' },
  hale: { shirt: '#8A6A4A', pants: '#2B2B35', hair: '#9A9AA0', glasses: true },
  wife: { shirt: '#C77DBA', pants: '#3A3550', hair: '#9A9AA0', long: true },
  lady: { shirt: '#5E8A7A', pants: '#3A3550', hair: '#8A5A3A', long: true },
  kid2: { shirt: '#F2A93B', pants: '#384060', hair: '#2A1C14', kid: true, hat: 'cap', hatCol: '#3C6FB6' },
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
  const NIGHT = { bloom: 0.4, bloomThreshold: 0.72, aperture: 0.0008, maxblur: 0.006, vignette: 0.55, exposure: 1.0, sat: 1.05 };
  const IN = { bloom: 0.38, bloomThreshold: 0.75, aperture: 0.0016, maxblur: 0.009, vignette: 0.55, exposure: 0.95, sat: 1.05, warm: 0.04 };
  const DAY = { bloom: 0.15, bloomThreshold: 0.9, aperture: 0.0012, maxblur: 0.007, vignette: 0.3, exposure: 0.95, sat: 1.05 };
  const black = () => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1080, 1920); };
  const knocks = (t0, pat, type = 'knock', gain = 1, o = {}) => pat.forEach((h) => cue(t0 + h, type, { gain, ...o }));
  const hits = (t0, pat) => pat.map((h) => t0 + h);

  // ── the town (aerial, the fog street) ───────────────────────
  const TW = B.town(E); TW.scene.updateMatrixWorld(true);
  TW.houses.forEach((h) => { if (h.userData.jar) h.userData.jar.visible = false; });
  const twM = K.mimic(); TW.scene.add(twM.group);
  const twKids = [B.person(LOOK.mia), B.person(LOOK.kid2)]; twKids.forEach((p) => TW.scene.add(p.group));
  const town = (night, fog = 1) => { TW.setNight(night); TW.scene.fog.near = lerp(55, 4, fog * night); TW.scene.fog.far = lerp(140, 30, fog * night); twM.group.visible = false; twKids.forEach((p) => (p.group.visible = false)); };

  // ── the house (hallway + kitchen inside, porch + pines outside) ───────────
  const HS = K.houseSet(E), HSc = HS.scene;
  const mia = B.person(LOOK.mia), dad = B.person(LOOK.dad), hale = B.person(LOOK.hale), lady = B.person(LOOK.lady); [mia, dad, hale, lady].forEach((p) => HSc.add(p.group));
  const hsM = K.mimic(); HSc.add(hsM.group);
  const mHand = K.knockHand({}); HSc.add(mHand);
  const miaHand = K.knockHand({ skin: SKIN, sleeve: LOOK.mia.shirt, long: false }); HSc.add(miaHand);
  const dadHand = K.knockHand({ skin: SKIN, sleeve: LOOK.dad.shirt, long: false }); dadHand.scale.setScalar(1.25); HSc.add(dadHand);
  const keyRing = K.keys(); keyRing.position.set(0.12, 0.03, -0.42); keyRing.rotation.y = 0.7; HSc.add(keyRing);
  const slipper = B.box(0.1, 0.06, 0.24, mat({ color: '#8A6A9A' }), 0.25, 0.03, 0.55, HSc); slipper.rotation.y = 0.5;
  const reset = (o = {}) => {
    [mia, dad, hale, lady].forEach((p) => (p.group.visible = false)); hsM.group.visible = false; mHand.visible = miaHand.visible = dadHand.visible = false;
    keyRing.visible = !!o.keys; slipper.visible = !!o.slipper; HS.openDoor(o.open || 0); HS.hinge.position.z = 0;
    HS.doorM.color.set(o.hale ? '#2E5A3E' : '#5E2226'); HS.inM.color.set(o.hale ? '#6E7A6A' : '#7D6A5C');
    HS.light({ mode: 'night', porch: true, lamp: 1, tlamp: 0, ...(o.light || {}) }); HS.under(o.under || { light: o.porchOff ? 0 : 1 }); HS.drawNote(o.note ?? 1);
    HS.note.visible = o.noteOn ?? true; HS.rim.intensity = 0; HS.pines.forEach((p) => (p.visible = true)); HS.winsO.forEach((w) => (w.material.emissiveIntensity = o.winGlow ?? 0));
  };
  const clear = (a, b) => { const ab = b.clone().sub(a), l = ab.length(); ab.normalize(); HS.pines.forEach((p) => { const ap = p.position.clone().setY(a.y).sub(a); const along = clamp(ap.dot(ab), 0, l); const dd = ap.sub(ab.clone().multiplyScalar(along)).setY(0).length(); p.visible = dd > 1.4; }); };
  const jolt = (t, hs, a = 0.012) => { let k = 0; hs.forEach((h) => { const d = t - h; if (d >= 0 && d < 0.12) k = Math.max(k, 1 - d / 0.12); }); HS.hinge.position.z = k * a; };
  // a hand knocking on the outside of the door (knuckles toward +z) at door point (x, y)
  const handOut = (hand, x, y, k, tilt = 0.35) => { hand.visible = true; hand.rotation.set(tilt, Math.PI, 0); hand.position.set(x, y, -0.2 - (1 - k) * 0.16); };

  // ── the bedroom upstairs at the Hales' ─────────────────────────────
  const BR = B.room(E, { wall: '#5A5070', floor: '#6E4A30', w: 7, d: 6, night: true, windowX: 1.3 });
  BR.key.intensity = 0.0; BR.moon.intensity = 0.5;
  const bed = B.bed('#5A6E9A'); bed.position.set(-1.0, 0, -4.3); BR.scene.add(bed);
  const piv = new THREE.Group(); piv.position.set(-1.0, 0.74, -4.15); BR.scene.add(piv); const wife = B.person(LOOK.wife); wife.group.position.set(0, -0.488, 0); piv.add(wife.group);
  piv.rotation.x = -Math.PI / 2 + 0.05; wife.set({ mood: 'sleep' }); bed.userData.blanket.position.y = 0.76; bed.userData.blanket.scale.y = 1.6;
  const nl = new THREE.PointLight('#FFC27A', 1.2, 3, 1.6); nl.position.set(0.2, 0.9, -5.2); BR.scene.add(nl);

  // ═════════════ HOOK ═════════════
  add({ id: 'S01', at: 0, note: 'aerial: the town at night in fog', draw(lt, d, t, blit) {
    town(1, 0.6); TW.snow.update(t);
    shoot(TW.scene, V3(-8, 22, 30), V3(-3, 9, 16), V3(0, 0, 2), V3(0, 1.4, 4), eo(clamp(lt / d)), { ...NIGHT, fov: 50, exposure: 0.95 }, t); blit();
  } });
  const wKnocks = Wd('knocks', 0) - 0.15, hookHits = hits(wKnocks + 0.1, [0, 0.32, 0.64]);
  add({ id: 'S02', at: wKnocks, note: 'close outside a door: a long grey hand knocks three times', draw(lt, d, t, blit) {
    reset({}); HS.snow.update(t); handOut(mHand, 0.2, 1.45, K.knockK(t, hookHits), 0.5); jolt(t, hookHits, 0.006);
    shoot(HSc, V3(0.85, 1.25, -1.0), V3(0.75, 1.3, -0.85), V3(0.15, 1.45, 0), null, eo(clamp(lt / d)), { ...NIGHT, fov: 46, aperture: 0.0018 }, t); blit();
  } });
  knocks(hookHits[0], [0, 0.32, 0.64], 'knock', 1.0);
  const wLove = Wd('love', 1);
  add({ id: 'S03', at: cut(1), note: 'inside: a woman hears a loved voice, smiles, reaches for the knob', draw(lt, d, t, blit) {
    reset({}); const k = eo(clamp((t - L(1)) / 1.6));
    lady.group.visible = true; lady.at(0.15, 0, lerp(1.2, 0.8, k), Math.PI - 0.7).set({ mood: t > wLove - 0.3 ? 'warm' : 'awake', armR: [lerp(10, 62, k), 8], turn: 0 });
    HS.under({ light: 1, feet: K.feetAt(0.1) });
    shoot(HSc, V3(1.45, 1.62, 0.4), V3(1.35, 1.6, 0.45), V3(0.2, 1.4, 0.95), null, eo(clamp(lt / d)), { ...IN, fov: 52 }, t); blit();
  } });
  const wSecret = Wd('secret', 2), famHits = hits(wSecret - 0.1, K.OLD_KNOCK);
  add({ id: 'S04', at: cut(2), note: 'outside: a dad\'s hand knocks a pattern; the door opens a crack of warm light', draw(lt, d, t, blit) {
    reset({ winGlow: 1.2 }); HS.snow.update(t); handOut(dadHand, 0.22, 1.42, K.knockK(t, famHits), 0.3);
    const op = eo(clamp((t - famHits[4] - 0.25) / 0.6)) * 0.22; HS.openDoor(op);
    shoot(HSc, V3(-0.9, 1.35, -1.5), V3(-0.75, 1.35, -1.25), V3(0.15, 1.3, 0), null, eo(clamp(lt / d)), { ...NIGHT, aperture: 0.0014 }, t); blit();
  } });
  knocks(famHits[0], K.OLD_KNOCK, 'knock', 0.7);
  const wNever3 = Wd('never', 3);
  add({ id: 'S05', at: cut(3), note: 'inside close: a small hand slides the chain lock on', draw(lt, d, t, blit) {
    reset({}); const k = eo(clamp((t - wNever3) / 0.5));
    HS.chain.position.x = lerp(HS.HW + 0.05, HS.HW - 0.05, k);
    miaHand.visible = true; miaHand.rotation.set(0.1, -Math.PI / 2 + 0.3, 0); miaHand.position.set(-0.48 + lerp(HS.HW + 0.2, HS.HW + 0.1, k), 1.42, 0.14);
    shoot(HSc, V3(1.05, 1.5, 1.45), V3(0.95, 1.48, 1.25), V3(0.42, 1.38, 0.05), null, eo(clamp(lt / d)), { ...IN, fov: 46, aperture: 0.0018 }, t); blit();
  } });
  cue(wNever3 + 0.3, 'tock', { gain: 0.8 });

  // ═════════════ THE WORLD ═════════════
  const wCall = Wd('call', 4);
  add({ id: 'S06', at: cut(4), note: 'under the door: two feet in the light outside, standing still', draw(lt, d, t, blit) {
    reset({}); HS.under({ light: 1, feet: K.feetAt(0.05 + Math.sin(t * 0.7) * 0.01) });
    shoot(HSc, V3(0.35, 0.32, 1.6), V3(0.25, 0.26, 1.2), V3(0.0, 0.05, 0.0), null, eio(clamp(lt / d)), { ...IN, aperture: 0.002, exposure: 0.9 }, t); blit();
  } });
  add({ id: 'S07', at: wCall - 0.1, note: 'the fog street: a tall thin shape stands far off between the houses', draw(lt, d, t, blit) {
    town(1, 1); TW.snow.update(t); twM.group.visible = true; twM.at(3, 0, 6.8, -Math.PI / 2).set({ tilt: Math.sin(t) * 3 });
    shoot(TW.scene, V3(-9, 0.9, 7.6), V3(-7.5, 1.0, 7.4), V3(3, 1.9, 6.8), null, eio(clamp(lt / d)), { ...NIGHT, aperture: 0.0005, exposure: 1.05 }, t); blit();
  } });
  cue(wCall, 'rumble', { dur: 2.2, gain: 0.8 });
  const wOpened = Wd('opened', 5);
  add({ id: 'S08', at: cut(5), note: 'Mr. Hale, smiling, opens his door into the dark fog', draw(lt, d, t, blit) {
    reset({ hale: true, light: { porch: false } }); HS.snow.update(t); const k = eio(clamp((t - wOpened) / 1.4));
    hale.group.visible = true; hale.at(0.5, 0, lerp(0.8, 0.95, k), Math.PI - 0.7).set({ mood: 'warm', armR: [lerp(55, 35, k), 0] }); HS.openDoor(k * 1.0);
    shoot(HSc, V3(1.75, 1.7, 0.45), V3(1.65, 1.68, 0.5), V3(0.35, 1.35, 0.8), null, eio(clamp(lt / d)), { ...IN }, t); blit();
  } });
  cue(wOpened, 'creak', { dur: 1.4, gain: 0.8 });
  add({ id: 'S09', at: cut(6), note: 'upstairs: his wife asleep in bed', draw(lt, d, t, blit) {
    BR.snow.update(t);
    shoot(BR.scene, V3(0.1, 1.55, -3.9), V3(-0.15, 1.45, -4.15), V3(-1.0, 0.8, -5.0), null, eio(clamp(lt / d)), { ...IN, exposure: 1.05 }, t); blit();
  } });
  const wClosed = Wd('closed', 7);
  add({ id: 'S10', at: cut(7), note: 'the empty hallway: his door swings shut by itself; one slipper left', draw(lt, d, t, blit) {
    reset({ hale: true, slipper: true, light: { porch: false } }); HS.snow.update(t); const k = clamp((t - wClosed + 0.2) / 0.55);
    HS.openDoor(1.0 * (1 - k * k));
    shoot(HSc, V3(0.9, 1.2, 4.2), V3(0.75, 1.15, 3.7), V3(0.1, 0.9, 0), null, eo(clamp(lt / d)), { ...IN, exposure: 0.92 }, t); blit();
  } });
  cue(wClosed + 0.33, 'slam', { gain: 1.1 });
  add({ id: 'S11', at: cut(8), note: 'two kids tap their knocks on their palms', draw(lt, d, t, blit) {
    town(0.3, 0); TW.snow.update(t); const [a, b] = twKids; a.group.visible = b.group.visible = true;
    const tap = (ph) => Math.max(0, Math.sin(t * 9 + ph)) * 14;
    a.at(-0.55, 0, 6.6, Math.PI / 2 - 0.25).set({ mood: 'worried', armL: [70, -28], armR: [62 + tap(0), 22], tilt: 22 });
    b.at(0.55, 0, 6.6, -Math.PI / 2 + 0.25).set({ mood: 'worried', armL: [70, -28], armR: [62 + tap(1.5), 22], tilt: 22 });
    shoot(TW.scene, V3(0.4, 1.0, 8.3), V3(0.2, 0.95, 7.8), V3(0, 0.75, 6.6), null, eo(clamp(lt / d)), { ...DAY, exposure: 0.85 }, t); blit();
  } });
  add({ id: 'S12', at: cut(9), note: 'in the fog between the pines: the thin shape tilts its head, listening', draw(lt, d, t, blit) {
    reset({ light: { lamp: 0 } }); HS.snow.update(t); clear(V3(0.6, 1.4, -2.4), V3(1.4, 1.6, -8.4)); HS.rim.position.set(1.4, 2.2, -7.2); HS.rim.intensity = 1.5; hsM.group.visible = true; hsM.at(1.4, -0.18, -8.4, 0.2).set({ tilt: 0, roll: lerp(0, 24, eio(clamp((t - Wd('hears', 9)) / 0.8))) });
    shoot(HSc, V3(0.4, 1.3, -1.4), V3(0.7, 1.4, -3.4), V3(1.4, 1.6, -8.4), null, eio(clamp(lt / d)), { ...NIGHT, aperture: 0.0004, exposure: 1.1 }, t); blit();
  } });
  const dadPalm = hits(Wd('two', 10) - 0.05, K.OLD_KNOCK);
  add({ id: 'S13', at: cut(10), note: 'warm memory: Dad kneels and teaches Mia our knock on his palm', draw(lt, d, t, blit) {
    reset({ light: { mode: 'evening', tlamp: 1 }, under: { light: 0 } });
    const k = K.knockK(t, dadPalm);
    dad.group.visible = mia.group.visible = true;
    dad.at(1.05, 0, 2.5, -Math.PI / 2).set({ legs: 'kneel', mood: 'warm', armL: [55, -18], armR: [62 + k * -16, 26] });
    mia.at(0.2, 0, 2.5, Math.PI / 2).set({ mood: 'happy', tilt: 10 });
    shoot(HSc, V3(0.7, 1.15, 5.3), V3(0.65, 1.1, 4.9), V3(0.62, 0.85, 2.5), null, eo(clamp(lt / d)), { ...IN, exposure: 1.05 }, t); blit();
  } });
  knocks(dadPalm[0], K.OLD_KNOCK, 'tock', 0.7);

  // ═════════════ THE MISTAKE ═════════════
  add({ id: 'S14', at: cut(11), note: 'outside after dark: Mia rattles the locked door; the house is dark', draw(lt, d, t, blit) {
    reset({ light: { lamp: 0 } }); HS.snow.update(t); mia.group.visible = true;
    mia.at(0.3, 0, -0.62, 0).set({ mood: 'worried', armR: [72 + Math.sin(t * 14) * 3, -6], turn: Math.sin(t * 0.9) * 25 });
    shoot(HSc, V3(-1.6, 1.5, -3.2), V3(-1.3, 1.4, -2.6), V3(0.2, 1.0, -0.3), null, eo(clamp(lt / d)), { ...NIGHT }, t); blit();
  } });
  cue(L(11) + 0.9, 'rattle', { dur: 0.7, gain: 0.8 });
  const miaHits = hits(Le(12) + 0.12, K.OLD_KNOCK);
  add({ id: 'S15', at: cut(12), note: 'close: her fist pounds our knock on the door, loud', draw(lt, d, t, blit) {
    reset({ light: { lamp: 0 } }); HS.snow.update(t); handOut(miaHand, 0.18, 1.2, K.knockK(t, miaHits), 0.15); jolt(t, miaHits, 0.01);
    shoot(HSc, V3(0.75, 1.15, -0.9), V3(0.65, 1.18, -0.75), V3(0.15, 1.22, 0), null, eo(clamp(lt / d)), { ...NIGHT, fov: 46, aperture: 0.0018 }, t); blit();
  } });
  knocks(miaHits[0], K.OLD_KNOCK, 'knock', 1.25);
  add({ id: 'S16', at: cut(13), note: 'reverse: Mia turns from the door toward the black pines', draw(lt, d, t, blit) {
    reset({ light: { lamp: 0 } }); HS.snow.update(t); mia.group.visible = true; const k = eio(clamp((t - L(13)) / 0.9));
    mia.at(0.55, 0, -0.85, lerp(0, Math.PI, k)).set({ mood: 'scared' });
    shoot(HSc, V3(0.8, 1.3, -0.15), V3(0.78, 1.28, -0.3), V3(-0.5, 1.0, -5), null, eio(clamp(lt / d)), { ...NIGHT, aperture: 0.0006, exposure: 1.05 }, t); blit();
  } });
  const backHits = hits(Le(14) + 0.15, K.OLD_KNOCK);
  add({ id: 'S17', at: cut(14), note: 'in the fog: a long grey hand knocks our knock on a tree trunk', draw(lt, d, t, blit) {
    reset({ light: { lamp: 0 } }); HS.snow.update(t); hsM.group.visible = true; hsM.at(-0.75, -0.18, -6.55, -0.6).set({ armR: [40, 30] });
    HS.rim.position.set(-0.6, 1.9, -5.4); HS.rim.intensity = 2.2; const k = K.knockK(t, backHits); mHand.visible = true; mHand.rotation.set(0.2, Math.PI / 2, 0); mHand.position.set(-1.4 + 0.19 + 0.14 + (1 - k) * 0.14, 1.45, -6.12);
    shoot(HSc, V3(-0.65, 1.55, -5.0), V3(-0.8, 1.5, -5.25), V3(-1.2, 1.45, -6.12), null, eo(clamp(lt / d)), { ...NIGHT, fov: 44, aperture: 0.0012, exposure: 1.35 }, t); blit();
  } });
  knocks(backHits[0], K.OLD_KNOCK, 'knockfar', 1.0, { pan: -0.3 });

  // ═════════════ DAD ═════════════
  add({ id: 'S18', at: cut(15), note: 'close: Dad\'s face goes white', draw(lt, d, t, blit) {
    reset({ light: { mode: 'evening', tlamp: 1 }, under: { light: 0 } }); dad.group.visible = true;
    dad.at(0.4, 0, 1.0, 0).set({ mood: t > Wd('white', 15) - 0.2 ? 'shocked' : 'worried' });
    shoot(HSc, V3(0.5, 1.55, 2.5), V3(0.46, 1.55, 2.2), V3(0.4, 1.52, 1.0), null, eo(clamp(lt / d)), { ...IN, fov: 44, aperture: 0.002, sat: 0.75 }, t); blit();
  } });
  const wNew16 = Wd('new', 16);
  add({ id: 'S19', at: cut(16), note: 'Dad slams the bolt and talks to Mia over his shoulder', draw(lt, d, t, blit) {
    reset({ light: { mode: 'evening', tlamp: 1 }, under: { light: 0 } }); dad.group.visible = mia.group.visible = true;
    const b = eo(clamp((t - L(16) - 0.2) / 0.3)); HS.bolt.position.x = lerp(HS.HW - 0.04, HS.HW - 0.16, b);
    dad.at(0.55, 0, 0.62, Math.PI).set({ mood: t < Le(16) ? talkM(t) : 'worried', armR: [65, -8], turn: lerp(0, -55, eo(clamp((t - L(16) - 0.6) / 0.5))) });
    mia.at(-0.9, 0, 1.6, Math.PI - 0.6).set({ mood: 'scared' });
    shoot(HSc, V3(0.3, 1.4, 3.0), V3(0.3, 1.36, 2.7), V3(0.3, 1.15, 0.6), null, eo(clamp(lt / d)), { ...IN }, t); blit();
  } });
  cue(L(16) + 0.35, 'tock', { gain: 1.0 });
  add({ id: 'S20', at: cut(17), note: 'evening: Dad at the kitchen table writing on a note by lamplight', draw(lt, d, t, blit) {
    reset({ light: { mode: 'evening', tlamp: 1 }, under: { light: 0 }, note: clamp((t - L(17)) / 2.6) * 0.85 }); dad.group.visible = true;
    dad.at(3.15, 0, 4.05, Math.PI).set({ legs: 'sit', mood: 'worried', armR: [58 + Math.sin(t * 7) * 3, -10], tilt: 25 });
    dad.group.updateMatrixWorld(true); HS.pencil.position.copy(dad.arms[1].userData.hand.getWorldPosition(V3()));
    shoot(HSc, V3(2.0, 1.55, 2.2), V3(2.15, 1.5, 2.45), V3(3.1, 0.95, 3.5), null, eo(clamp(lt / d)), { ...IN, exposure: 1.05 }, t); blit();
    HS.pencil.position.set(3.28, 0.866, 3.38);
  } });

  // ═════════════ MIDNIGHT ═════════════
  const oldHits = hits(Le(18) + 0.25, K.OLD_KNOCK);
  add({ id: 'S21', at: cut(18), note: 'midnight: Mia alone in the dark hall; feet in the light under the door; our knock', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(0.05) } }); mia.group.visible = true; jolt(t, oldHits, 0.008);
    mia.at(0.25, 0, 3.2, Math.PI).set({ mood: 'scared' });
    shoot(HSc, V3(0.9, 1.3, 5.6), V3(0.75, 1.25, 5.0), V3(0.1, 0.8, 0), null, eio(clamp(lt / d)), { ...IN, exposure: 0.9 }, t); blit();
  } });
  knocks(oldHits[0], K.OLD_KNOCK, 'knock', 1.1);
  add({ id: 'S22', at: cut(19), note: 'close: Mia\'s face: it\'s our knock. Relief.', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(0.05) } }); mia.group.visible = true;
    mia.at(0.25, 0, 3.2, Math.PI).set({ mood: t > Wd('fast', 19) ? 'warm' : 'shocked', tilt: -5 });
    shoot(HSc, V3(0.4, 1.15, 1.75), V3(0.35, 1.14, 1.95), V3(0.25, 1.1, 3.2), null, eo(clamp(lt / d)), { ...IN, fov: 46, aperture: 0.002 }, t); blit();
  } });
  add({ id: 'S23', at: cut(20), note: 'Mia walks to the door; Dad\'s voice from outside', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(0.05) } }); mia.group.visible = true; const k = eio(clamp((t - L(20)) / 2.2));
    mia.at(0.25, 0, lerp(3.0, 0.9, k), Math.PI).set({ legs: k < 1 ? 'walk' : 'stand', phase: t * 7, mood: 'warm', armR: [lerp(0, 60, clamp(k * 1.4 - 0.4)), -4] });
    shoot(HSc, V3(0.6, 1.0, 5.0), V3(0.5, 1.0, 3.2), V3(0.15, 1.0, 0), null, eio(clamp(lt / d)), { ...IN, exposure: 0.92 }, t); blit();
  } });
  add({ id: 'S24', at: cut(21), note: 'close: her hand stops just short of the bolt', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(0.05) } }); const k = eo(clamp((t - L(21) - 0.6) / 0.5));
    miaHand.visible = true; miaHand.rotation.set(0.1, Math.PI + 0.25, 0); miaHand.position.set(HS.HW - 0.6 + 0.0, 1.2, lerp(0.17, 0.32, k));
    shoot(HSc, V3(0.95, 1.38, 1.35), V3(0.88, 1.35, 1.15), V3(0.3, 1.18, 0.1), null, eo(clamp(lt / d)), { ...IN, fov: 46, aperture: 0.0016, exposure: 0.95 }, t); blit();
  } });
  add({ id: 'S25', at: cut(22), note: 'Mia frozen in front of the door', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(0.05) } }); mia.group.visible = true;
    mia.at(0.25, 0, 1.15, Math.PI).set({ mood: 'scared', armR: [20, 0], armL: [10, 0] });
    shoot(HSc, V3(-1.1, 1.15, 2.4), V3(-1.0, 1.12, 2.2), V3(0.1, 0.95, 0.7), null, eo(clamp(lt / d)), { ...IN, exposure: 0.9 }, t); blit();
  } });
  const wQuiet = Wd('quiet', 23);
  add({ id: 'S26', at: cut(23), note: 'under the door: the feet shift, begging... then step away into the dark', draw(lt, d, t, blit) {
    reset({}); const away = clamp((t - wQuiet + 0.1) / 0.6), x = 0.05 + Math.sin(t * 5) * 0.03 * (1 - away) + away * 0.5;
    HS.under({ light: 1, feet: K.feetAt(x, 1 - away) });
    shoot(HSc, V3(0.35, 0.32, 1.6), V3(0.25, 0.26, 1.2), V3(0.0, 0.05, 0.0), null, eio(clamp(lt / d)), { ...IN, aperture: 0.002, exposure: 0.9 }, t); blit();
  } });
  const newHits = hits(Le(24) + 0.15, K.NEW_KNOCK);
  add({ id: 'S27', at: cut(24), note: 'the door, a new pair of feet; a different knock', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(-0.08) } }); jolt(t, newHits, 0.01);
    shoot(HSc, V3(0.5, 1.2, 2.5), V3(0.42, 1.15, 2.1), V3(0.1, 0.9, 0), null, eo(clamp(lt / d)), { ...IN, exposure: 0.9 }, t); blit();
  } });
  knocks(newHits[0], K.NEW_KNOCK, 'knock', 1.1);
  add({ id: 'S28', at: cut(25), note: 'close: Mia doesn\'t know this knock', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(-0.08) } }); mia.group.visible = true;
    mia.at(0.25, 0, 1.6, Math.PI).set({ mood: 'worried', tilt: 4, roll: 8 });
    shoot(HSc, V3(0.4, 1.15, 0.3), V3(0.36, 1.14, 0.45), V3(0.25, 1.08, 1.6), null, eo(clamp(lt / d)), { ...IN, fov: 46, aperture: 0.002 }, t); blit();
  } });
  const wSaw = Wd('saw', 26), wNew26 = Wd('new', 26);
  const pounds = []; for (let x = L(26) + 0.15; x < wSaw - 0.1; x += 0.38) pounds.push(x);
  add({ id: 'S29', at: cut(26), note: 'the door shakes under pounding fists; the knob twists', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(-0.08 + Math.sin(t * 9) * 0.02) } }); jolt(t, pounds, 0.025); HS.knob.rotation.z = Math.sin(t * 22) * 0.4;
    shoot(HSc, V3(0.3, 1.25, 1.4), V3(0.25, 1.22, 1.15), V3(0.1, 1.1, 0), null, 0, { ...IN, shake: 0.03, exposure: 0.9 }, t); blit();
  } });
  pounds.forEach((p) => cue(p, 'pound', { gain: 0.9 })); cue(L(26) + 0.1, 'rattle', { dur: 1.0, gain: 0.8 });
  add({ id: 'S30', at: wSaw - 0.1, note: 'under the door: Dad\'s feet, frantic; a long thin shadow slides in beside them', draw(lt, d, t, blit) {
    reset({}); const sl = eio(clamp((t - wNew26 + 0.3) / 1.2));
    HS.under({ light: 1, feet: [...K.feetAt(-0.08 + Math.sin(t * 9) * 0.025), { x: lerp(-0.75, -0.32, sl), w: 0.07, a: sl, long: true }, { x: lerp(-0.7, -0.27, sl), w: 0.05, a: sl, long: true }] });
    shoot(HSc, V3(0.3, 0.3, 1.5), V3(0.22, 0.24, 1.15), V3(-0.05, 0.05, 0.0), null, eio(clamp(lt / d)), { ...IN, aperture: 0.002, exposure: 0.92 }, t); blit();
  } });
  cue(wNew26, 'rumble', { dur: 2.2, gain: 0.7 });
  add({ id: 'S31', at: cut(27), note: 'close: Mia crying, hands over her ears', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(-0.08) } }); mia.group.visible = true;
    mia.at(0.25, 0, 1.6, Math.PI).set({ mood: 'crying', armL: [165, 18], armR: [165, 18], tilt: 10 });
    shoot(HSc, V3(0.4, 1.2, 0.2), V3(0.36, 1.18, 0.35), V3(0.25, 1.08, 1.6), null, eo(clamp(lt / d)), { ...IN, fov: 46, aperture: 0.002, shake: 0.02 }, t); blit();
  } });
  const pounds2 = []; for (let x = L(28) + 0.1; x < Le(28) + 0.6; x += 0.42) pounds2.push(x);
  add({ id: 'S32', at: cut(28), note: 'wide: she backs away down the hall from the shaking door', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(-0.08) } }); mia.group.visible = true; jolt(t, pounds2, 0.02); const k = eo(clamp((t - L(28)) / 1.6));
    mia.at(0.25, 0, lerp(1.6, 3.4, k), Math.PI).set({ mood: 'crying', legs: k < 0.98 ? 'walk' : 'stand', phase: -t * 6, armL: [30, 10], armR: [30, 10] });
    shoot(HSc, V3(1.1, 1.3, 5.6), V3(1.0, 1.25, 5.3), V3(0.15, 0.9, 0.6), null, eo(clamp(lt / d)), { ...IN, exposure: 0.9 }, t); blit();
  } });
  pounds2.forEach((p) => cue(p, 'pound', { gain: 0.8 }));
  const wThud = Wd('thud', 29);
  add({ id: 'S33', at: cut(29), note: 'under the door: one heavy thud; the feet are gone; still light', draw(lt, d, t, blit) {
    reset({}); const gone = t > wThud + 0.05; jolt(t, [wThud], 0.03);
    HS.under({ light: 1, feet: gone ? [] : [...K.feetAt(-0.08 + Math.sin(t * 9) * 0.025), { x: -0.32, w: 0.07, a: 1, long: true }] });
    shoot(HSc, V3(0.3, 0.3, 1.5), V3(0.2, 0.22, 1.05), V3(-0.05, 0.05, 0.0), null, eio(clamp(lt / d)), { ...IN, aperture: 0.002, exposure: 0.92 }, t); blit();
  } });
  cue(wThud, 'thud', { gain: 1.3 }); cue(wThud + 0.02, 'slam', { gain: 0.8 });

  // ═════════════ MORNING: THE TWIST ═════════════
  add({ id: 'S34', at: cut(30), note: 'morning, outside: Dad\'s keys on the snowy doormat', draw(lt, d, t, blit) {
    reset({ keys: true, light: { mode: 'day' } });
    shoot(HSc, V3(0.55, 0.75, -1.25), V3(0.4, 0.55, -0.95), V3(0.12, 0.03, -0.42), null, eo(clamp(lt / d)), { ...DAY, fov: 46, aperture: 0.002 }, t); blit();
  } });
  add({ id: 'S35', at: cut(31), note: 'the kitchen in daylight: the note waiting on the table; Mia walks up', draw(lt, d, t, blit) {
    reset({ light: { mode: 'day' }, under: { light: 0 } }); mia.group.visible = true; const k = eio(clamp((t - L(31)) / 2.2));
    mia.at(lerp(1.6, 2.75, k), 0, lerp(2.0, 2.75, k), lerp(0.99, 0.6, clamp(k * 2 - 1))).set({ legs: k < 0.98 ? 'walk' : 'stand', phase: t * 7, mood: 'sad', tilt: lerp(0, 25, k) });
    shoot(HSc, V3(4.1, 1.7, 1.3), V3(3.95, 1.6, 1.7), V3(2.9, 0.9, 3.2), null, eio(clamp(lt / d)), { ...DAY }, t); blit();
  } });
  add({ id: 'S36', at: cut(32), note: 'close on the note: Mia, our NEW knock (dots), Love, Dad', draw(lt, d, t, blit) {
    reset({ light: { mode: 'day' }, under: { light: 0 } });
    const n = HS.note.position;
    shoot(HSc, V3(n.x + 0.02, 1.38, n.z + 0.2), V3(n.x + 0.01, 1.28, n.z + 0.14), V3(n.x, 0.86, n.z - 0.02), null, eo(clamp(lt / d)), { ...DAY, fov: 40, aperture: 0.001, exposure: 1.0 }, t); blit();
  } });
  add({ id: 'S37', at: cut(33), note: 'close: Mia at the table, crying', draw(lt, d, t, blit) {
    reset({ light: { mode: 'day' }, under: { light: 0 } }); mia.group.visible = true;
    mia.at(2.75, 0, 2.75, 0.6).set({ mood: 'crying', tilt: 14 });
    shoot(HSc, V3(3.4, 1.2, 3.75), V3(3.3, 1.18, 3.6), V3(2.75, 1.08, 2.75), null, eo(clamp(lt / d)), { ...DAY, fov: 44, aperture: 0.002, sat: 0.8 }, t); blit();
  } });
  add({ id: 'S38', at: cut(34), note: 'night again: Mia sits on the hall floor facing the door, the note in her lap', draw(lt, d, t, blit) {
    reset({ under: { light: 1 } }); mia.group.visible = true;
    mia.at(0.25, 0, 2.6, Math.PI).set({ legs: 'sit', mood: 'scared', armL: [40, -10], armR: [40, 10], tilt: 10 });
    shoot(HSc, V3(0.7, 0.9, 4.6), V3(0.6, 0.85, 4.1), V3(0.1, 0.7, 0), null, eio(clamp(lt / d)), { ...IN, exposure: 0.9 }, t); blit();
  } });
  const wKnocking = Wd('knocking', 35), endHits = hits(wKnocking + 0.05, K.NEW_KNOCK), endHits2 = hits(Le(35) + 0.7, K.NEW_KNOCK), endBlack = Le(35) + 2.45;
  add({ id: 'S39', at: cut(35), note: 'slow push to the door: feet in the light, our NEW knock; black', draw(lt, d, t, blit) {
    reset({ under: { light: 1, feet: K.feetAt(0.05) } }); jolt(t, [...endHits, ...endHits2], 0.008);
    shoot(HSc, V3(0.3, 1.0, 3.4), V3(0.15, 0.9, 1.3), V3(0.05, 0.8, 0), null, eio(clamp(lt / (d - 0.4))), { ...IN, exposure: 0.88 }, t); blit();
    if (t > endBlack) black();
  } });
  knocks(endHits[0], K.NEW_KNOCK, 'knock', 1.1); knocks(endHits2[0], K.NEW_KNOCK, 'knock', 0.9);

  CAP.y = 1250; const noteA = cut(32), noteB = cut(33); CAP.yAt = (t) => (t >= noteA && t < noteB ? 1790 : 1250);
  return { shots: S, cues: CUES };
}
