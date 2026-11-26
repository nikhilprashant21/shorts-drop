// Kit for "In This Town, You Never Cross the Bridge in the Dark": the river set (long wooden bridge over black water
// in fog, snowy banks, Grandma's house, the carved sign), lanterns, pale fingers, wind-blown snow.
import * as THREE from 'three';
import { mat } from './world.js';
import { box, cyl, pine, house, flame, rnd } from './blocky.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const DECK = 2.2, HALF = 13, RAIL = 0.95, BW = 1.8;   // deck height, half length, rail height, deck width

/** a hand-held lantern: brass frame, glass, handle; .set(k, t) sets the flame (0 = out) */
export function lantern({ seed = 0, light = true } = {}) {
  const g = new THREE.Group(), brass = mat({ color: '#6E5530', metalness: 0.6, roughness: 0.45 });
  box(0.14, 0.03, 0.14, brass, 0, 0.015, 0, g); box(0.16, 0.04, 0.16, brass, 0, 0.24, 0, g);
  cyl(0.02, 0.07, 0.06, brass, 0, 0.29, 0, g, 8);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.012, 0.22, 0.012, brass, a * 0.062, 0.125, b * 0.062, g));
  const glassM = new THREE.MeshStandardMaterial({ color: '#FFE6B0', transparent: true, opacity: 0.18, emissive: '#FFB860', emissiveIntensity: 0.4, roughness: 0.1, depthWrite: false });
  const glass = box(0.115, 0.2, 0.115, glassM, 0, 0.125, 0, g); glass.castShadow = false;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.006, 6, 16, Math.PI), brass); handle.position.y = 0.32; g.add(handle);
  cyl(0.012, 0.012, 0.04, mat({ color: '#EDE6D6' }), 0, 0.05, 0, g, 6);
  const f = flame({ light, s: 0.9, seed }); f.position.y = 0.07; g.add(f);
  if (light) { const L = f.children.find((c) => c.isPointLight); if (L) { L.distance = 7; L.castShadow = false; } }
  g.flame = f;
  g.set = (k, t = 0) => { f.set(k, t); glassM.emissiveIntensity = 0.4 * Math.max(0, k); return g; };
  g.set(1); return g;
}

/** pale fingers hooking over a rail: .set(k) 0 = hidden below, 1 = curled over */
export function paleHand({ col = '#D9DEE4' } = {}) {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, emissive: '#8090A0', emissiveIntensity: 0.12 });
  const arm = box(0.07, 0.6, 0.07, m, 0, -0.38, 0.05, g);
  const palm = box(0.13, 0.12, 0.05, m, 0, -0.04, 0.05, g);
  const fingers = [-0.045, -0.015, 0.015, 0.045].map((x, i) => {
    const p = new THREE.Group(); p.position.set(x, 0.03, 0.05); g.add(p);
    const len = i === 0 || i === 3 ? 0.1 : 0.13;
    box(0.022, len, 0.022, m, 0, len / 2, 0, p);
    const q = new THREE.Group(); q.position.y = len; p.add(q); box(0.02, 0.09, 0.02, m, 0, 0.045, 0, q);
    return [p, q];
  });
  g.set = (k) => {
    const kk = Math.max(0, Math.min(1, k)); g.visible = kk > 0.01;
    g.position.y = g.userData.baseY - (1 - kk) * 0.45;
    fingers.forEach(([p, q], i) => { p.rotation.x = -kk * 1.25 - i * 0.03; q.rotation.x = -kk * 1.2; });
    return g;
  };
  g.userData.baseY = 0; return g;
}

/** wind-blown snow: .update(t, wind) wind = sideways m/s */
export function windSnow(n = 1200, size = [26, 9, 14], center = [0, 0, 0], ps = 0.06) {
  const pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([rnd(i) * size[0], rnd(i * 2.3) * size[1], rnd(i * 4.1) * size[2] - size[2] / 2, 0.5 + rnd(i * 7.7) * 0.6]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 32; const gx = c.getContext('2d'); const gr = gx.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); gx.fillStyle = gr; gx.fillRect(0, 0, 32, 32);
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: ps, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, sizeAttenuation: true }));
  pts.position.set(center[0] - size[0] / 2, center[1], center[2]); pts.frustumCulled = false;
  pts.update = (t, wind = 0.3) => { for (let i = 0; i < n; i++) { const [x, y, z, v] = base[i]; let yy = (y - t * v * (1 + Math.abs(wind) * 0.3)) % size[1]; if (yy < 0) yy += size[1]; let xx = (x + t * wind * v + Math.sin(t * 0.7 + i) * 0.2) % size[0]; if (xx < 0) xx += size[0]; pos[i * 3] = xx; pos[i * 3 + 1] = yy; pos[i * 3 + 2] = z + Math.cos(t * 0.5 + i * 1.3) * 0.2; } geo.attributes.position.needsUpdate = true; };
  pts.update(0); return pts;
}

function waterNormal() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = 'rgb(128,128,255)'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { const x = rnd(i) * 256, y = rnd(i * 3.1) * 256, r = 3 + rnd(i * 5.3) * 14; const gr = g.createRadialGradient(x, y, 0, x, y, r); const a = rnd(i * 9.7) > 0.5; gr.addColorStop(0, a ? 'rgba(170,150,255,0.5)' : 'rgba(90,110,255,0.5)'); gr.addColorStop(1, 'rgba(128,128,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r * 2.2, r, 0, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(28, 28); return t;
}

function signTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 300; const g = c.getContext('2d');
  g.fillStyle = '#5A4030'; g.fillRect(0, 0, 512, 300);
  for (let y = 0; y < 300; y += 6) { g.fillStyle = `rgba(0,0,0,${0.05 + rnd(y) * 0.08})`; g.fillRect(0, y, 512, 3); }
  g.textAlign = 'center'; g.font = '700 60px Caladea';
  const carve = (s, y) => { g.fillStyle = 'rgba(255,230,190,0.25)'; g.fillText(s, 258, y + 3); g.fillStyle = '#20140C'; g.fillText(s, 256, y); };
  carve('ONE FLAME.', 125); carve('ONE CROSSING.', 225);
  g.strokeStyle = '#2A1A10'; g.lineWidth = 10; g.strokeRect(8, 8, 496, 284);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/** the river set. Bridge deck runs along x from -HALF to HALF at y = DECK; river flows along z. */
export function riverSet(E) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#060912'); scene.fog = new THREE.Fog('#0B1222', 5, 26);
  scene.environment = E.envMap; scene.environmentIntensity = 0.06;
  // water
  const wn = waterNormal();
  const waterM = new THREE.MeshStandardMaterial({ color: '#070C16', roughness: 0.3, metalness: 0.2, normalMap: wn, normalScale: new THREE.Vector2(0.3, 0.3) });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), waterM); water.rotation.x = -Math.PI / 2; water.receiveShadow = true; scene.add(water);
  // banks
  const snowM = mat({ color: '#C3CCDA', roughness: 0.95 });
  [-1, 1].forEach((s) => { const b = box(30, DECK + 0.4, 60, snowM, s * (HALF - 1 + 15), DECK - (DECK + 0.4) / 2, 0, scene); b.receiveShadow = true; });
  // deck + rails + posts + pillars
  const wood = mat({ color: '#5A4232', roughness: 0.9 }), dark = mat({ color: '#3E2E24', roughness: 0.95 });
  for (let x = -HALF; x < HALF; x += 0.32) { const p = box(0.29, 0.08, BW, rnd(x * 10) > 0.5 ? wood : mat({ color: '#634A38', roughness: 0.9 }), x + 0.16, DECK - 0.04, 0, scene); p.receiveShadow = true; }
  box(HALF * 2, 0.2, 0.14, dark, 0, DECK - 0.18, BW / 2 - 0.1, scene); box(HALF * 2, 0.2, 0.14, dark, 0, DECK - 0.18, -BW / 2 + 0.1, scene);
  [-1, 1].forEach((s) => { box(HALF * 2, 0.08, 0.1, wood, 0, DECK + RAIL, s * (BW / 2), scene); box(HALF * 2, 0.05, 0.05, wood, 0, DECK + 0.45, s * (BW / 2), scene); });
  for (let x = -HALF; x <= HALF; x += 2.0) [-1, 1].forEach((s) => box(0.12, RAIL + 0.08, 0.12, dark, x, DECK + RAIL / 2, s * (BW / 2), scene));
  for (let x = -HALF + 3; x < HALF; x += 4.4) [-1, 1].forEach((s) => cyl(0.2, 0.24, DECK, dark, x, DECK / 2, s * 0.7, scene, 8));
  // left bank: Grandma's house with a warm window, pines; sign at the bridge foot
  const gh = house({ w: 3.4, d: 2.8, h: 2.1, wall: '#8E7A9A', roof: '#4A3A44', seed: 2, sillJar: false }); gh.position.set(-HALF - 6.5, DECK, -2.5); gh.rotation.y = Math.PI / 2 - 0.4; scene.add(gh);
  gh.userData.winGlow.emissiveIntensity = 1.2;
  const porchL = new THREE.PointLight('#FFC27A', 2.0, 7, 1.6); porchL.position.set(-HALF - 4.6, DECK + 1.6, -1.6); scene.add(porchL);
  const pines = []; for (let k = 0; k < 30; k++) { const s = k % 2 ? 1 : -1, p = pine(1.2 + rnd(k) * 0.9); p.position.set(s * (HALF + 2 + rnd(k * 7) * 14), DECK, -12 + rnd(k * 3) * 24); if (Math.abs(p.position.z) < 2.5 && Math.abs(p.position.x) < HALF + 7) p.position.z += 5 * (p.position.z < 0 ? -1 : 1); scene.add(p); pines.push(p); }
  const signG = new THREE.Group(); signG.position.set(-HALF - 0.6, DECK, 1.55); signG.rotation.y = 0.5; scene.add(signG);
  box(0.1, 1.3, 0.1, dark, -0.45, 0.65, 0, signG); box(0.1, 1.3, 0.1, dark, 0.45, 0.65, 0, signG);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.68, 0.06), [wood, wood, wood, wood, new THREE.MeshStandardMaterial({ map: signTex(), roughness: 0.9 }), wood]); sign.position.y = 1.2; signG.add(sign);
  // lights
  const moon = new THREE.DirectionalLight('#7E9CE0', 0.45); moon.position.set(-6, 14, -10); scene.add(moon);
  const hemi = new THREE.HemisphereLight('#36446A', '#0A0A12', 0.35); scene.add(hemi);
  const rim = new THREE.PointLight('#A8C0F0', 0, 5, 1.5); scene.add(rim);
  const day = new THREE.DirectionalLight('#E8EEF6', 0); day.position.set(4, 12, 6); scene.add(day);
  const snow = windSnow(1400, [30, 9, 12], [0, DECK - 1, 0]); scene.add(snow);

  const R = {
    scene, water, waterM, pines, sign, signG, gh, rim, snow, porchL,
    /** flow: how fast the ripples move (0 = dead still); mode 'night' | 'morning' */
    set({ t = 0, flow = 1, mode = 'night', fog = 1, wind = 0.3 } = {}) {
      wn.offset.set(0, (t * 0.02 * flow) % 1); waterM.normalScale.setScalar(0.04 + 0.3 * Math.min(1, flow));
      const m = mode === 'morning';
      scene.background.set(m ? '#8E9AAA' : '#060912'); scene.fog.color.set(m ? '#9AA6B4' : '#0B1222'); scene.fog.near = m ? 4 : 5 + 4 * (1 - fog); scene.fog.far = m ? 24 : 22 + 14 * (1 - fog);
      day.intensity = m ? 1.4 : 0; hemi.intensity = m ? 1.0 : 0.35; hemi.color.set(m ? '#DDE4EE' : '#36446A'); moon.intensity = m ? 0 : 0.45; scene.environmentIntensity = m ? 0.25 : 0.06;
      porchL.intensity = m ? 0 : 2.0; gh.userData.winGlow.emissiveIntensity = m ? 0.1 : 1.2; snow.update(t, wind);
      return R;
    },
  };
  R.set({});
  return R;
}
