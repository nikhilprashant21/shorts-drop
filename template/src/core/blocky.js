// Blocky Town kit: box-built people with drawn faces that act, a snowy pastel town, cosy rooms, marble jars with a
// live count, a wall clock, falling snow. Everything is a pure function of the time you pass in.
//   const p = person({ shirt, pants, hat, hair, kid }) ; p.at(x,y,z) ; p.set({ mood, armL, armR, legs, phase, turn, look, nod })
//   town(E) -> { scene, sun, setNight(k), houses, snow }      room(E, opts) -> { scene, ... }
//   jar({ count, cap }) -> group with .setCount(n) .pop(k) .label     clock() -> .setTime(h, m, s)
import * as THREE from 'three';
import { mat, T, sky, sunlight, canvasTex } from './world.js';

export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const D = Math.PI / 180;
export const box = (w, h, d, m, x = 0, y = 0, z = 0, parent) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; if (parent) parent.add(b); return b; };
export const cyl = (r1, r2, h, m, x = 0, y = 0, z = 0, parent, seg = 20) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); c.position.set(x, y, z); c.castShadow = c.receiveShadow = true; if (parent) parent.add(c); return c; };
const glow = (col, i = 1) => new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: i });

// ───────────────────────────── faces ─────────────────────────────
const SKIN = '#F2C99B';
const FACE = {};
function faceTex(mood, skin = SKIN) {
  const key = mood + skin; if (FACE[key]) return FACE[key];
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = skin; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = g.fillStyle = '#1C1A22'; g.lineCap = 'round'; g.lineJoin = 'round';
  const eye = (x, y, rx = 11, ry = 17) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.fillStyle = '#FFF'; g.beginPath(); g.arc(x - 3, y - 6, 4, 0, 7); g.fill(); g.fillStyle = '#1C1A22'; };
  const bigEye = (x, y) => { g.fillStyle = '#FFF'; g.beginPath(); g.ellipse(x, y, 22, 26, 0, 0, 7); g.fill(); g.lineWidth = 5; g.stroke(); g.fillStyle = '#1C1A22'; g.beginPath(); g.arc(x, y + 3, 9, 0, 7); g.fill(); };
  const brow = (x1, y1, x2, y2) => { g.lineWidth = 8; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  const arc = (x, y, r, a0, a1, w = 7) => { g.lineWidth = w; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); };
  const L = 92, R = 164, EY = 118;
  switch (mood) {
    case 'happy': eye(L, EY); eye(R, EY); g.beginPath(); g.moveTo(96, 166); g.quadraticCurveTo(128, 206, 160, 166); g.closePath(); g.fill(); break;
    case 'smirk': eye(L, EY, 11, 13); eye(R, EY - 2, 11, 15); brow(76, 88, 106, 94); brow(150, 86, 180, 80); g.lineWidth = 7; g.beginPath(); g.moveTo(104, 178); g.quadraticCurveTo(140, 186, 166, 160); g.stroke(); break;
    case 'shocked': bigEye(L, EY); bigEye(R, EY); brow(70, 76, 108, 70); brow(148, 70, 186, 76); g.beginPath(); g.ellipse(128, 182, 14, 19, 0, 0, 7); g.fill(); break;
    case 'scared': bigEye(L, EY + 4); bigEye(R, EY + 4); brow(72, 84, 106, 72); brow(150, 72, 184, 84); g.lineWidth = 6; g.beginPath(); g.moveTo(98, 186); for (let i = 1; i <= 6; i++) g.lineTo(98 + i * 10, 186 + (i % 2 ? -7 : 0)); g.stroke(); break;
    case 'sad': eye(L, EY + 6, 10, 13); eye(R, EY + 6, 10, 13); brow(72, 96, 104, 84); brow(152, 84, 184, 96); arc(128, 200, 26, 1.15 * Math.PI, 1.85 * Math.PI); break;
    case 'crying': eye(L, EY + 6, 10, 12); eye(R, EY + 6, 10, 12); brow(72, 96, 104, 82); brow(152, 82, 184, 96); arc(128, 204, 26, 1.15 * Math.PI, 1.85 * Math.PI);
      g.fillStyle = '#6EC6F5'; [[L - 4, 150], [R + 4, 150]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x, y - 14); g.quadraticCurveTo(x + 13, y + 10, x, y + 16); g.quadraticCurveTo(x - 13, y + 10, x, y - 14); g.fill(); }); g.fillStyle = '#1C1A22'; break;
    case 'angry': eye(L, EY + 4, 11, 12); eye(R, EY + 4, 11, 12); brow(72, 84, 108, 100); brow(148, 100, 184, 84); arc(128, 200, 22, 1.2 * Math.PI, 1.8 * Math.PI); break;
    case 'worried': eye(L, EY, 11, 15); eye(R, EY, 11, 15); brow(74, 90, 104, 80); brow(152, 80, 182, 90); g.lineWidth = 6; g.beginPath(); g.moveTo(104, 182); g.quadraticCurveTo(128, 172, 152, 182); g.stroke(); break;
    case 'sleep': arc(L, EY - 2, 13, 0.1 * Math.PI, 0.9 * Math.PI, 6); arc(R, EY - 2, 13, 0.1 * Math.PI, 0.9 * Math.PI, 6); arc(128, 160, 14, 0.2 * Math.PI, 0.8 * Math.PI, 5); break;
    case 'awake': eye(L, EY, 11, 16); eye(R, EY, 11, 16); g.lineWidth = 6; g.beginPath(); g.moveTo(112, 180); g.lineTo(144, 180); g.stroke(); break;
    case 'talk': eye(L, EY); eye(R, EY); g.beginPath(); g.ellipse(128, 176, 18, 12, 0, 0, 7); g.fill(); g.fillStyle = '#C0505A'; g.beginPath(); g.ellipse(128, 182, 10, 5, 0, 0, 7); g.fill(); break;
    case 'warm': eye(L, EY, 10, 14); eye(R, EY, 10, 14); arc(128, 150, 26, 0.2 * Math.PI, 0.8 * Math.PI, 7); g.fillStyle = 'rgba(230,110,110,0.35)'; [[66, 160], [190, 160]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 16, 10, 0, 0, 7); g.fill(); }); break;
    default: eye(L, EY); eye(R, EY); arc(128, 154, 24, 0.25 * Math.PI, 0.75 * Math.PI, 6);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; FACE[key] = t; return t;
}

// ───────────────────────────── people ─────────────────────────────
/** look: { shirt, pants, shoes, hat: none|beanie|cap|tophat|bun, hatCol, hair: '#hex'|null, kid, coat, sash, apron, skin } */
export function person(look = {}) {
  const L = { shirt: '#3C8DDB', pants: '#2B3550', shoes: '#22222A', hat: 'none', hatCol: '#D8343F', hair: '#4A2E1E', skin: SKIN, ...look };
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const sk = mat({ color: L.skin, roughness: 0.7 }), sh = mat({ color: L.shirt, roughness: 0.8 }), pa = mat({ color: L.pants, roughness: 0.85 });
  // legs (pivot at hips y 1.0)
  const legs = [-0.25, 0.25].map((x) => { const p = new THREE.Group(); p.position.set(x, 1.0, 0); body.add(p); box(0.46, 0.92, 0.48, pa, 0, -0.46, 0, p); box(0.48, 0.14, 0.52, mat({ color: L.shoes }), 0, -0.93, 0.02, p); return p; });
  const torso = box(1.0, 1.0, 0.5, sh, 0, 1.5, 0, body);
  if (L.apron) box(0.7, 0.75, 0.04, mat({ color: L.apron }), 0, 1.38, 0.27, body);
  if (L.sash) { const s = box(0.18, 1.3, 0.54, mat({ color: L.sash }), 0, 1.5, 0, body); s.rotation.z = 0.75; }
  if (L.zip) box(0.06, 0.95, 0.03, mat({ color: L.zip }), 0, 1.5, 0.26, body);
  // arms (pivot at shoulders)
  const arms = [-0.74, 0.74].map((x) => { const p = new THREE.Group(); p.position.set(x, 1.95, 0); body.add(p); box(0.46, 0.62, 0.46, sh, 0, -0.28, 0, p); box(0.44, 0.38, 0.44, sk, 0, -0.78, 0, p); const hand = new THREE.Group(); hand.position.set(0, -0.98, 0.05); p.add(hand); p.userData.hand = hand; return p; });
  // head (pivot at neck)
  const neck = new THREE.Group(); neck.position.set(0, 2.0, 0); body.add(neck);
  const faceM = new THREE.MeshStandardMaterial({ map: faceTex('neutral', L.skin), roughness: 0.7 });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), [sk, sk, sk, sk, faceM, sk]); head.position.y = 0.33; head.castShadow = true; neck.add(head);
  if (L.hair) { const hm = mat({ color: L.hair, roughness: 0.9 }); box(0.68, 0.16, 0.68, hm, 0, 0.68, 0, neck); box(0.68, 0.42, 0.14, hm, 0, 0.47, -0.29, neck); if (L.long) { box(0.14, 0.5, 0.6, hm, -0.33, 0.35, -0.04, neck); box(0.14, 0.5, 0.6, hm, 0.33, 0.35, -0.04, neck); box(0.68, 0.7, 0.14, hm, 0, 0.3, -0.3, neck); } else box(0.68, 0.1, 0.2, hm, 0, 0.62, 0.26, neck); }
  const hm = mat({ color: L.hatCol, roughness: 0.9 });
  if (L.hat === 'beanie') { box(0.7, 0.3, 0.7, hm, 0, 0.72, 0, neck); box(0.74, 0.1, 0.74, mat({ color: '#F4F4F4' }), 0, 0.59, 0, neck); const pp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), mat({ color: '#F4F4F4' })); pp.position.y = 0.92; neck.add(pp); }
  if (L.hat === 'cap') { box(0.7, 0.2, 0.7, hm, 0, 0.72, 0, neck); box(0.6, 0.05, 0.3, hm, 0, 0.64, 0.45, neck); }
  if (L.hat === 'tophat') { box(0.9, 0.06, 0.9, hm, 0, 0.66, 0, neck); box(0.58, 0.55, 0.58, hm, 0, 0.95, 0, neck); box(0.6, 0.1, 0.6, mat({ color: '#B8322F' }), 0, 0.74, 0, neck); }
  if (L.hat === 'bun') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), mat({ color: L.hair })); b.position.set(0, 0.78, -0.18); neck.add(b); }
  if (L.glasses) { const gm = new THREE.MeshBasicMaterial({ color: '#1C1A22' }); [-0.15, 0.15].forEach((x) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 6, 16), gm); r.position.set(x, 0.38, 0.32); neck.add(r); }); }
  if (L.scarf) box(0.72, 0.16, 0.6, mat({ color: L.scarf }), 0, 0.02, 0.02, neck);
  // collar name tag on the back (the premise object): .setTag(n)
  const tc = document.createElement('canvas'); tc.width = 192; tc.height = 120; const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace; tt.anisotropy = 8;
  const tagM = new THREE.MeshStandardMaterial({ map: tt, roughness: 0.6 });
  const tag = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.29, 0.03), [mat({ color: '#C8A35A' }), mat({ color: '#C8A35A' }), mat({ color: '#C8A35A' }), mat({ color: '#C8A35A' }), mat({ color: '#C8A35A' }), tagM]);
  tag.position.set(0, 1.78, -0.27); body.add(tag); tag.visible = !!L.tag;
  let tagShown = null;
  const drawTag = (n) => { if (n === tagShown) return; tagShown = n; const g = tc.getContext('2d'); g.fillStyle = '#C8A35A'; g.fillRect(0, 0, 192, 120); g.fillStyle = '#F7EED6'; g.fillRect(8, 8, 176, 104);
    g.fillStyle = n >= 300 ? '#C8202F' : '#2A2230'; g.font = '900 78px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 96, 64); tt.needsUpdate = true; };
  drawTag(L.tagN ?? 0);
  const s = L.kid ? 0.74 : 1; root.scale.setScalar(s * 0.66);   // adults ~1.75 m, kids ~1.3 m
  let mood = 'neutral';
  const P = {
    group: root, look: L, legs, arms, neck, head, body, tag,
    setTag(n) { drawTag(Math.max(0, Math.round(n))); return P; },
    at(x, y, z, ry) { root.position.set(x, y, z); if (ry != null) root.rotation.y = ry; return P; },
    face(m) { if (m !== mood) { mood = m; faceM.map = faceTex(m, L.skin); faceM.needsUpdate = true; } return P; },
    /** st: { mood, armL, armR: [forward°, out°], legs: stand|walk|run|sit, phase, turn (head yaw°), tilt (head pitch°), lean, nod, show } */
    set(st = {}) {
      root.visible = st.show ?? true;
      P.face(st.mood || 'neutral');
      const ph = st.phase || 0; let swing = 0, bob = 0;
      if (st.legs === 'walk') { swing = Math.sin(ph) * 32; bob = Math.abs(Math.cos(ph)) * 0.06; }
      if (st.legs === 'run') { swing = Math.sin(ph) * 55; bob = Math.abs(Math.cos(ph)) * 0.16; }
      legs[0].rotation.x = swing * D; legs[1].rotation.x = -swing * D; body.position.y = bob;
      if (st.legs === 'sit') { legs[0].rotation.x = legs[1].rotation.x = -90 * D; body.position.y = -0.48; }
      if (st.legs === 'lie') { legs[0].rotation.x = legs[1].rotation.x = 0; }
      if (st.legs === 'kneel') { legs[0].rotation.x = legs[1].rotation.x = 85 * D; body.position.y = -0.74; }
      const aL = st.armL || [st.legs === 'walk' || st.legs === 'run' ? -swing : 0, 0], aR = st.armR || [st.legs === 'walk' || st.legs === 'run' ? swing : 0, 0];
      arms[0].rotation.set(-aL[0] * D, 0, -(aL[1] || 0) * D); arms[1].rotation.set(-aR[0] * D, 0, (aR[1] || 0) * D);
      neck.rotation.set((st.tilt || 0) * D + (st.nod ? Math.sin(st.nod) * 0.25 : 0), (st.turn || 0) * D, (st.roll || 0) * D);
      body.rotation.x = (st.lean || 0) * D;
      return P;
    },
  };
  P.set();
  return P;
}

// ───────────────────────────── jar ─────────────────────────────
const MARBLE_COLS = ['#FF4D6D', '#FFC93C', '#3DDC97', '#4CC9F0', '#B388EB', '#FF8C42', '#F15BB5', '#00BBF9'];
const JR = 0.34, JH = 0.86, MR = 0.052;
function packPositions(n) {
  const out = []; let y = MR + 0.03, layer = 0;
  while (out.length < n) {
    const ring = [];
    for (let r = 0; r < JR - MR - 0.02; r += MR * 1.95) { const k = r < 0.01 ? 1 : Math.floor((2 * Math.PI * r) / (MR * 2.05)); for (let i = 0; i < k; i++) { const a = (i / k) * 2 * Math.PI + layer * 0.7; ring.push(V3(Math.cos(a) * r, y + rnd(out.length + i) * 0.012, Math.sin(a) * r)); } }
    ring.sort((a, b) => rnd(a.x * 91 + a.z * 37 + layer) - 0.5);
    for (const p of ring) { if (out.length < n) out.push(p); }
    y += MR * 1.72; layer++;
  }
  return out;
}
const PACK = packPositions(130);

/** a glass jar of marbles with a paper label showing the count. .setCount(n, fly) .label redraws itself */
export function jar({ count = 100, max = 100, name = '', glowI = 0.25 } = {}) {
  const g = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({ color: '#DDF3FF', transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, envMapIntensity: 1.0, depthWrite: false, side: THREE.DoubleSide });
  const body = cyl(JR, JR, JH, glass, 0, JH / 2, 0, g, 32); body.castShadow = false; body.renderOrder = 2;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(JR * 0.86, 0.035, 8, 32), new THREE.MeshStandardMaterial({ color: '#E8F6FF', transparent: true, opacity: 0.5, roughness: 0.1 })); rim.rotation.x = Math.PI / 2; rim.position.y = JH + 0.03; g.add(rim);
  const lid = cyl(JR * 0.86, JR * 0.86, 0.1, mat({ color: '#C8A35A', metalness: 0.6, roughness: 0.35 }), 0, JH + 0.08, 0, g, 32);
  box(JR * 1.2, 0.03, 0.02, mat({ color: '#A88440' }), 0, JH + 0.13, 0, g).visible = false;
  // label
  const lc = document.createElement('canvas'); lc.width = 256; lc.height = 160; const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = 8;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(JR + 0.006, JR + 0.006, 0.3, 32, 1, true, -0.62, 1.24), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.8, transparent: true }));
  label.position.y = JH * 0.62; g.add(label);
  let shown = null;
  const drawLabel = (n) => { if (n === shown) return; shown = n; const c = lc.getContext('2d'); c.clearRect(0, 0, 256, 160); c.fillStyle = '#F7EED6'; c.beginPath(); c.roundRect(4, 4, 248, 152, 16); c.fill(); c.strokeStyle = '#8C6A3A'; c.lineWidth = 5; c.stroke();
    c.fillStyle = n <= 5 ? '#C8202F' : '#2A2230'; c.font = '900 108px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), 128, 88); if (name) { c.font = '800 22px Inter'; c.fillStyle = '#8C6A3A'; c.fillText(name, 128, 24); } lt.needsUpdate = true; };
  // marbles
  const geo = new THREE.SphereGeometry(MR, 14, 10);
  const mm = new THREE.MeshStandardMaterial({ roughness: 0.12, metalness: 0.05, emissive: '#ffffff', emissiveIntensity: glowI });
  const N = 130, inst = new THREE.InstancedMesh(geo, mm, N); inst.castShadow = true; g.add(inst);
  const cols = []; for (let i = 0; i < N; i++) { const c = new THREE.Color(MARBLE_COLS[Math.floor(rnd(i * 13.7) * MARBLE_COLS.length)]); cols.push(c); inst.setColorAt(i, c); }
  // emissive tints from instance colour: use onBeforeCompile-free trick: emissive white * low intensity reads as glow
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V3(1, 1, 1);
  const extra = []; // flying marbles in local space: [{p, s, colIdx}]
  g.userData = { count };
  const fly = new THREE.InstancedMesh(geo, mm, 60); fly.castShadow = true; fly.frustumCulled = false; g.add(fly);
  const flyCol = new THREE.Color();
  const api = Object.assign(g, {
    label, lt, inst,
    /** n marbles resting; pop = 0..1 shrinking of marble index n (the one just leaving) */
    setCount(n, { pop = -1, labelN } = {}) {
      n = Math.max(0, Math.min(N, Math.round(n)));
      for (let i = 0; i < N; i++) {
        let s = i < n ? 1 : 0; const p = PACK[i];
        if (i === n && pop >= 0 && pop < 1) s = pop < 0.35 ? 1 + pop * 0.8 : Math.max(0, 1.28 * (1 - (pop - 0.35) / 0.65));
        sc.setScalar(s || 1e-4); m4.compose(p, q, sc); inst.setMatrixAt(i, m4);
      }
      inst.instanceMatrix.needsUpdate = true; drawLabel(labelN ?? n); g.userData.count = n; return api;
    },
    /** flying marbles: list of { p: Vector3 (local), i: colour index } */
    setFlying(list = []) {
      for (let i = 0; i < 60; i++) { const f = list[i]; sc.setScalar(f ? 1 : 1e-4); m4.compose(f ? f.p : V3(0, -9, 0), q, sc); fly.setMatrixAt(i, m4); fly.setColorAt(i, f ? cols[f.i % N] : flyCol.set('#000')); }
      fly.instanceMatrix.needsUpdate = true; if (fly.instanceColor) fly.instanceColor.needsUpdate = true; return api;
    },
    topOf(n) { return PACK[Math.max(0, Math.min(N - 1, n))].clone(); },
    mouth: V3(0, JH + 0.1, 0),
  });
  api.setCount(count); api.setFlying([]);
  return api;
}

/** a burst of sparkle sprites (pop / vanish). returns group with .set(k) 0..1 */
let sparkT = null;
function sparkTex() { if (sparkT) return sparkT; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,240,200,0.8)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); sparkT = new THREE.CanvasTexture(c); return sparkT; }
export function sparkles(n = 24, size = 0.12, col = '#FFF3C8', spread = 0.5) {
  const g = new THREE.Group(); const sp = [];
  for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); g.add(s); sp.push(s); }
  g.set = (k) => { sp.forEach((s, i) => { const a = rnd(i) * 6.28, b = rnd(i * 3.1) * 2 - 1, r = spread * (0.3 + rnd(i * 7) * 0.7) * Math.pow(k, 0.6);
    s.position.set(Math.cos(a) * r, b * r * 0.8 + k * spread * 0.6 * rnd(i * 5), Math.sin(a) * r); const v = k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k); s.scale.setScalar(size * (0.5 + rnd(i * 2)) * (0.4 + v)); s.material.opacity = v; }); g.visible = k > 0 && k < 1; return g; };
  g.set(0); return g;
}

// ───────────────────────────── clock ─────────────────────────────
export function clock(r = 0.6) {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#FBF5E6'; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill(); x.fillStyle = '#2A2230'; x.font = '800 64px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let h = 1; h <= 12; h++) { const a = (h / 12) * 2 * Math.PI; x.fillText(String(h), 256 + Math.sin(a) * 190, 256 - Math.cos(a) * 190); }
  for (let m = 0; m < 60; m++) { const a = (m / 60) * 2 * Math.PI, r0 = m % 5 ? 232 : 222; x.lineWidth = m % 5 ? 3 : 7; x.strokeStyle = '#2A2230'; x.beginPath(); x.moveTo(256 + Math.sin(a) * r0, 256 - Math.cos(a) * r0); x.lineTo(256 + Math.sin(a) * 244, 256 - Math.cos(a) * 244); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const face = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); face.position.z = 0.06; g.add(face);
  const rimm = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 10, 48), mat({ color: '#6B3E26', roughness: 0.5 })); rimm.position.z = 0.05; g.add(rimm);
  const back = cyl(r, r, 0.08, mat({ color: '#6B3E26' }), 0, 0, 0, g, 48); back.rotation.x = Math.PI / 2;
  const hand = (len, w, col, z) => { const p = new THREE.Group(); p.position.z = z; g.add(p); const b = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.02), new THREE.MeshStandardMaterial({ color: col })); b.position.y = len / 2 - 0.05; p.add(b); return p; };
  const hh = hand(r * 0.5, 0.06, '#1C1A22', 0.08), mh = hand(r * 0.78, 0.04, '#1C1A22', 0.09), sh = hand(r * 0.85, 0.016, '#C8202F', 0.1);
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12), mat({ color: '#C8A35A' })); pin.rotation.x = Math.PI / 2; pin.position.z = 0.11; g.add(pin);
  g.setTime = (h, m, s = 0) => { hh.rotation.z = -((h % 12) + m / 60) / 12 * 2 * Math.PI; mh.rotation.z = -(m + s / 60) / 60 * 2 * Math.PI; sh.rotation.z = -Math.floor(s) / 60 * 2 * Math.PI; return g; };
  g.setTime(11, 58, 0);
  return g;
}

// ───────────────────────────── snow ─────────────────────────────
let flakeT = null;
function flakeTex() { if (flakeT) return flakeT; const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); flakeT = new THREE.CanvasTexture(c); return flakeT; }
/** falling snow in a box around `center`; .update(t) */
export function snowfall(n = 1500, size = [30, 14, 30], center = [0, 0, 0], ps = 0.09) {
  const pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([rnd(i) * size[0] - size[0] / 2, rnd(i * 2.3) * size[1], rnd(i * 4.1) * size[2] - size[2] / 2, 0.5 + rnd(i * 7.7) * 0.6]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: ps, map: flakeTex(), transparent: true, depthWrite: false, color: '#FFFFFF', sizeAttenuation: true }));
  pts.position.set(...center); pts.frustumCulled = false;
  pts.update = (t) => { for (let i = 0; i < n; i++) { const [x, y, z, v] = base[i]; let yy = (y - t * v) % size[1]; if (yy < 0) yy += size[1]; pos[i * 3] = x + Math.sin(t * 0.7 + i) * 0.25; pos[i * 3 + 1] = yy; pos[i * 3 + 2] = z + Math.cos(t * 0.5 + i * 1.3) * 0.2; } geo.attributes.position.needsUpdate = true; };
  pts.update(0); return pts;
}

// ───────────────────────────── town ─────────────────────────────
const PASTEL = ['#F4C6D0', '#C9E4F5', '#F7E1A8', '#CDE8C6', '#E3D1F2', '#F8D2B4', '#BFD8E8', '#F2C9C2'];
export function pine(s = 1) {
  const g = new THREE.Group(); cyl(0.08 * s, 0.1 * s, 0.5 * s, mat({ color: '#6B4A32' }), 0, 0.25 * s, 0, g, 6);
  const gm = mat({ color: '#1F6B45', flatShading: true }), sm = mat({ color: '#FFFFFF', flatShading: true });
  [[0.9, 1.0, 0.45], [0.7, 0.9, 1.05], [0.48, 0.8, 1.6]].forEach(([r, h, y], i) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r * s, h * s, 7), gm); c.position.y = y * s + h * s / 2; c.castShadow = true; c.receiveShadow = true; g.add(c); const sn = new THREE.Mesh(new THREE.ConeGeometry(r * s * 0.55, h * s * 0.45, 7), sm); sn.position.y = y * s + h * s * 0.78; g.add(sn); });
  return g;
}
/** a pastel gabled house facing +z. returns group with .win (sill world spot), .door, .lights */
export function house({ w = 3.2, d = 2.6, h = 2.0, wall = '#F4C6D0', roof = '#8E5A4A', seed = 1, sillJar = true } = {}) {
  const g = new THREE.Group();
  const wm = mat({ color: wall, roughness: 0.9 }), trim = mat({ color: '#FFFFFF' });
  box(w, h, d, wm, 0, h / 2, 0, g);
  // gable ends
  const sh = new THREE.Shape(); sh.moveTo(-d / 2, 0); sh.lineTo(d / 2, 0); sh.lineTo(0, h * 0.55); sh.closePath();
  const gab = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false });
  [-1, 1].forEach((sgn) => { const m = new THREE.Mesh(gab, wm); m.rotation.y = Math.PI / 2; m.position.set(sgn * w / 2 - (sgn > 0 ? 0.02 : 0), h, 0); m.castShadow = m.receiveShadow = true; g.add(m); });
  const ang = Math.atan2(h * 0.55, d / 2), sl = Math.hypot(h * 0.55, d / 2) + 0.35;
  [-1, 1].forEach((sgn) => {
    const pv = new THREE.Group(); pv.position.set(0, h + h * 0.55, 0); pv.rotation.x = sgn * (Math.PI / 2 - ang); g.add(pv);
    box(w + 0.5, 0.12, sl, mat({ color: roof }), 0, 0, sgn * sl / 2, pv).rotation.x = 0;
    box(w + 0.56, 0.12, sl * 0.98, mat({ color: '#FBFDFF', roughness: 0.95 }), 0, 0.1, sgn * sl / 2, pv);
  });
  box(0.36, 0.9, 0.36, mat({ color: '#A8473C' }), w * 0.28, h + h * 0.55, -d * 0.12, g); box(0.42, 0.1, 0.42, mat({ color: '#FFFFFF' }), w * 0.28, h + h * 0.55 + 0.46, -d * 0.12, g);
  // door
  const dm = mat({ color: ['#B8322F', '#2F6B8F', '#3E8A5A', '#7A4A8C'][seed % 4] });
  const door = new THREE.Group(); door.position.set(-w * 0.22 - 0.32, 0, d / 2 + 0.01); g.add(door); box(0.64, 1.15, 0.06, dm, 0.32, 0.58, 0, door);
  box(0.8, 0.08, 0.1, trim, -w * 0.22, 1.22, d / 2 + 0.03, g);
  // window with sill
  const winGlow = glow('#FFD58A', 0.0);
  const wx = w * 0.18, wy = 1.0;
  box(0.95, 0.72, 0.04, winGlow, wx, wy + 0.36, d / 2 + 0.01, g);
  box(1.05, 0.08, 0.08, trim, wx, wy + 0.76, d / 2 + 0.04, g); box(0.06, 0.72, 0.06, trim, wx, wy + 0.36, d / 2 + 0.04, g); box(0.95, 0.06, 0.06, trim, wx, wy + 0.36, d / 2 + 0.04, g);
  box(1.15, 0.08, 0.3, trim, wx, wy - 0.02, d / 2 + 0.12, g);
  let j = null;
  if (sillJar) { j = jar({ count: 40 + Math.floor(rnd(seed) * 60), glowI: 0.5 }); j.scale.setScalar(0.32); j.position.set(wx + 0.25, wy + 0.02, d / 2 + 0.14); g.add(j); }
  g.userData = { winGlow, jar: j, door, sill: V3(wx, wy, d / 2 + 0.14) };
  return g;
}

/** the snowy town. setNight(k): 0 bright snowy day → 1 blue night with warm windows */
export function town(E) {
  const scene = new THREE.Scene();
  const skyM = sky(scene, { top: '#7FA6CC', horizon: '#DCE6EE', ground: '#DCE6EE' });
  const sun = sunlight(scene, E, { col: '#FFF3E2', i: 2.2, pos: [8, 14, 9], box: 24, sky: '#DCE8F4', ground: '#B8C4D0', hemi: 1.0, env: 0.25 });
  scene.fog = new THREE.Fog('#E4ECF2', 55, 140);
  const snowM = mat({ color: '#E8EEF5', roughness: 0.95 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), snowM); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const G = new THREE.Group(); G.scale.setScalar(1.7); scene.add(G);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(220, 3.2), mat({ color: '#5B6170', roughness: 0.9 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 4); road.receiveShadow = true; G.add(road);
  for (let x = -100; x < 100; x += 2.2) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.12), new THREE.MeshStandardMaterial({ color: '#E8C24A' })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, 4); G.add(m); }
  [2.2, 5.8].forEach((z) => { const sw = box(220, 0.08, 0.8, mat({ color: '#D7DEE6' }), 0, 0.04, z, G); sw.receiveShadow = true; });
  
  const houses = [];
  for (let i = -6; i <= 6; i++) {
    const hh = house({ wall: PASTEL[(i + 12) % PASTEL.length], roof: ['#8E5A4A', '#6E7FA0', '#9A4B54', '#5F7F68'][(i + 12) % 4], seed: i + 20, w: 3.0 + rnd(i) * 0.6 });
    hh.position.set(i * 4.6, 0, -1.2); G.add(hh); houses.push(hh);
    if (Math.abs(i) <= 5) { const hb = house({ wall: PASTEL[(i + 15) % PASTEL.length], seed: i + 40, w: 3.0 + rnd(i * 3) * 0.6 }); hb.position.set(i * 4.6 + 2.3, 0, 10.4); hb.rotation.y = Math.PI; G.add(hb); houses.push(hb); }
    const p = pine(0.9 + rnd(i * 5) * 0.5); p.position.set(i * 4.6 + 2.3, 0, -1.6 + rnd(i) * 1.5); G.add(p);
    if (i % 2 === 0) { const p2 = pine(1.2); p2.position.set(i * 4.6 + 1.0, 0, -6 - rnd(i) * 3); G.add(p2); }
    if (i % 2) { const lp = new THREE.Group(); cyl(0.05, 0.06, 2.4, mat({ color: '#2E3440' }), 0, 1.2, 0, lp, 8); const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), glow('#FFE7A8', 0.4)); b.position.y = 2.45; lp.add(b); lp.position.set(i * 4.6 + 2.3, 0, 2.0); G.add(lp); lp.userData.bulb = b; houses.push(lp); }
  }
  for (let k = 0; k < 40; k++) { const p = pine(1 + rnd(k) * 0.8); p.position.set(-60 + rnd(k * 3) * 120, 0, -14 - rnd(k * 9) * 30); G.add(p); }
  // snow mounds
  for (let k = 0; k < 30; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.6 + rnd(k) * 0.8, 12, 8), snowM); m.scale.y = 0.35; m.position.set(-50 + rnd(k * 2) * 100, 0, rnd(k * 4) > 0.5 ? 1.6 + rnd(k) * 0.3 : 6.6 + rnd(k) * 0.4); m.receiveShadow = true; G.add(m); }
  const snow = snowfall(3000, [50, 22, 40], [0, 0, 4], 0.11); scene.add(snow);
  const cDay = { top: new THREE.Color('#7FA6CC'), hor: new THREE.Color('#DCE6EE') }, cNight = { top: new THREE.Color('#0D1630'), hor: new THREE.Color('#33466E') };
  const setNight = (k) => {
    skyM.material.uniforms.top.value.copy(cDay.top).lerp(cNight.top, k); skyM.material.uniforms.hor.value.copy(cDay.hor).lerp(cNight.hor, k); skyM.material.uniforms.gnd.value.copy(skyM.material.uniforms.hor.value);
    scene.fog.color.copy(skyM.material.uniforms.hor.value);
    sun.key.intensity = 2.2 * (1 - k) + 0.5 * k; sun.key.color.set('#FFF3E2').lerp(new THREE.Color('#8FA8E0'), k);
    scene.environmentIntensity = 0.25 * (1 - k) + 0.05 * k;
    scene.traverse((o) => { if (o.isHemisphereLight) { o.intensity = 1.0 * (1 - k) + 0.28 * k; o.color.set('#DCE8F4').lerp(new THREE.Color('#5A6E9E'), k); o.groundColor.set('#B8C4D0').lerp(new THREE.Color('#1A2238'), k); } if (o.isDirectionalLight && o !== sun.key) o.intensity = 0.4 * (1 - k) + 0.05 * k; });
    scene.traverse((o) => { if (o.userData && o.userData.winGlow) o.userData.winGlow.emissiveIntensity = 0.05 + 1.3 * k; if (o.userData && o.userData.bulb) o.userData.bulb.material.emissiveIntensity = 0.3 + 2.5 * k; });
  };
  setNight(0);
  const W = (x, y, z) => V3(x * 1.7, y * 1.7, z * 1.7);
  return { scene, sun, setNight, houses, snow, G, W };
}

// ───────────────────────────── rooms ─────────────────────────────
/** a cosy room: back wall with a window (snowy night or day view), side walls, plank floor, warm lamp.
 *  opts: { wall, floor, w, d, h, night, wallpaper } */
export function room(E, { wall = '#E9C9A6', trim = '#FFFFFF', floor = '#A8693E', w = 8, d = 7, h = 3.6, night = true, windowX = 1.6, wy: WY = 1.1, wh: WH = 1.4, ww: WW = 1.6, noView = false } = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(night ? '#0A0E1C' : '#CFE2F0');
  scene.environment = E.envMap; scene.environmentIntensity = night ? 0.12 : 0.35;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d + 2), mat({ map: T.planks(floor, [w / 2.5, (d + 2) / 2.5]) })); fl.rotation.x = -Math.PI / 2; fl.position.z = -d / 2 + 1; fl.receiveShadow = true; scene.add(fl);
  fl.material.map.rotation = Math.PI / 2;
  const wm = mat({ color: wall, roughness: 0.92 });
  const ww = WW, wh = WH, wy = WY, back = new THREE.Group(); back.position.z = -d; scene.add(back);
  const lw = w / 2 + windowX - ww / 2, rw = w / 2 - windowX - ww / 2;
  box(lw, h, 0.2, wm, -w / 2 + lw / 2, h / 2, 0, back); box(rw, h, 0.2, wm, w / 2 - rw / 2, h / 2, 0, back);
  box(ww, wy, 0.2, wm, windowX, wy / 2, 0, back); box(ww, h - wy - wh, 0.2, wm, windowX, h - (h - wy - wh) / 2, 0, back);
  const tm = mat({ color: trim });
  box(ww + 0.16, 0.1, 0.26, tm, windowX, wy, 0.06, back); box(ww + 0.16, 0.1, 0.26, tm, windowX, wy + wh, 0.06, back); box(0.08, wh, 0.26, tm, windowX - ww / 2, wy + wh / 2, 0.06, back); box(0.08, wh, 0.26, tm, windowX + ww / 2, wy + wh / 2, 0.06, back); if (!noView) { box(0.05, wh, 0.12, tm, windowX, wy + wh / 2, 0.06, back); box(ww, 0.05, 0.12, tm, windowX, wy + wh / 2, 0.06, back); }
  const sill = box(ww + 0.4, 0.08, 0.42, tm, windowX, wy - 0.02, 0.2, back);
  // the view outside: night sky gradient + houses silhouettes with lit windows
  const vt = canvasTex('view' + night, 512, 384, (g) => { const gr = g.createLinearGradient(0, 0, 0, 384); if (night) { gr.addColorStop(0, '#0D1630'); gr.addColorStop(1, '#3A4E78'); } else { gr.addColorStop(0, '#A9C3DA'); gr.addColorStop(1, '#EEF3F7'); } g.fillStyle = gr; g.fillRect(0, 0, 512, 384);
    for (let i = 0; i < 9; i++) { const x = i * 62 - 10, hh = 70 + rnd(i) * 40; g.fillStyle = night ? '#1B2440' : '#B6C3D2'; g.fillRect(x, 384 - hh - 60, 54, hh); g.beginPath(); g.moveTo(x - 6, 384 - hh - 60); g.lineTo(x + 27, 384 - hh - 95); g.lineTo(x + 60, 384 - hh - 60); g.fill(); g.fillStyle = night ? '#FFD58A' : '#E8EEF3'; g.fillRect(x + 18, 384 - hh - 30, 16, 14); }
    g.fillStyle = '#F2F6FA'; g.fillRect(0, 324, 512, 60); if (night) { g.fillStyle = '#FFF'; for (let i = 0; i < 70; i++) { g.globalAlpha = 0.4 + rnd(i) * 0.6; g.beginPath(); g.arc(rnd(i * 3) * 512, rnd(i * 5) * 300, 1 + rnd(i) * 1.5, 0, 7); g.fill(); } g.globalAlpha = 1; } });
  const view = new THREE.Mesh(new THREE.PlaneGeometry(ww * 3, wh * 3), new THREE.MeshBasicMaterial({ map: vt, toneMapped: false })); view.position.set(windowX, wy + wh / 2, -2); back.add(view); view.visible = !noView;
  const snow = snowfall(300, [3, 3, 1.2], [windowX, wy - 0.3, -d - 0.8], 0.035); scene.add(snow); snow.visible = !noView;
  [-1, 1].forEach((s) => box(0.2, h, d + 2, wm, s * w / 2, h / 2, -d / 2 + 1, scene));
  box(w, 0.2, d + 2, mat({ color: '#F4EDE2' }), 0, h + 0.1, -d / 2 + 1, scene);
  box(w, 0.18, 0.08, tm, 0, 0.09, -d + 0.14, scene); [-1, 1].forEach((s) => box(0.08, 0.18, d + 2, tm, s * (w / 2 - 0.14), 0.09, -d / 2 + 1, scene));
  // lights
  const key = new THREE.PointLight(night ? '#FFC98A' : '#FFF1DE', night ? 9 : 6, 14, 1.3); key.position.set(-1.6, h - 0.5, -d / 2); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.002; key.shadow.radius = 5; scene.add(key);
  const moon = new THREE.DirectionalLight(night ? '#7E9CE0' : '#FFF6E8', night ? 0.9 : 1.6); moon.position.set(windowX, 4, -d - 4); moon.target.position.set(windowX, 0, -d + 3); scene.add(moon, moon.target);
  scene.add(new THREE.HemisphereLight(night ? '#58648C' : '#FFF4E6', '#3A2A22', night ? 0.55 : 1.0));
  return { scene, key, moon, snow, sill: V3(windowX, wy + 0.02, -d + 0.2), w, d, h, windowX };
}

/** furniture */
export function bed(col = '#4C7FCF') {
  const g = new THREE.Group(), wood = mat({ color: '#8A5A36' });
  box(1.5, 0.45, 2.6, wood, 0, 0.22, 0, g); box(1.5, 1.1, 0.12, wood, 0, 0.55, -1.32, g); box(1.5, 0.7, 0.12, wood, 0, 0.35, 1.32, g);
  box(1.4, 0.2, 2.5, mat({ color: '#F4F1EA' }), 0, 0.55, 0, g);
  const blanket = box(1.48, 0.12, 1.7, mat({ color: col }), 0, 0.68, 0.38, g);
  box(0.9, 0.18, 0.45, mat({ color: '#FFFFFF' }), 0, 0.72, -0.95, g);
  g.userData.blanket = blanket; return g;
}
export function table(w = 1.8, d = 1.1, hgt = 0.95) { const g = new THREE.Group(), m = mat({ color: '#A0673D' }); box(w, 0.08, d, m, 0, hgt, 0, g); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.08, hgt, 0.08, m, a * (w / 2 - 0.1), hgt / 2, b * (d / 2 - 0.1), g)); return g; }
export function chair() { const g = new THREE.Group(), m = mat({ color: '#7A4A2E' }); box(0.55, 0.06, 0.55, m, 0, 0.55, 0, g); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.05, 0.55, 0.05, m, a * 0.24, 0.27, b * 0.24, g)); box(0.55, 0.6, 0.05, m, 0, 0.88, -0.25, g); return g; }
export function counter(len = 3) { const g = new THREE.Group(); box(len, 0.95, 0.65, mat({ color: '#6F9C8C' }), 0, 0.475, 0, g); box(len + 0.06, 0.06, 0.7, mat({ color: '#F1EDE4' }), 0, 0.98, 0, g); for (let i = 0; i < len / 0.8 - 1; i++) box(0.04, 0.3, 0.02, mat({ color: '#C8A35A' }), -len / 2 + 0.5 + i * 0.8, 0.8, 0.33, g); return g; }
export function doorway(col = '#F4F1EA') { const g = new THREE.Group(), m = mat({ color: col }); const leaf = new THREE.Group(); g.add(leaf); box(0.9, 2.0, 0.06, m, 0.45, 1.0, 0, leaf); const k = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mat({ color: '#C8A35A', metalness: 0.6 })); k.position.set(0.8, 1.0, 0.06); leaf.add(k); g.userData.leaf = leaf; return g; }
export function cookieJar() { const g = new THREE.Group(); cyl(0.18, 0.2, 0.32, mat({ color: '#E8D6B8' }), 0, 0.16, 0, g, 20); cyl(0.14, 0.14, 0.06, mat({ color: '#B8322F' }), 0, 0.35, 0, g, 20); return g; }
export function ball(col = '#E8483C') { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), mat({ color: col, roughness: 0.5 })); m.castShadow = true; return m; }
export function coat(col = '#7A4A2E') { const g = new THREE.Group(); const m = mat({ color: col }); const a = box(0.9, 0.08, 0.7, m, 0, 0.05, 0, g); a.rotation.y = 0.2; box(0.3, 0.07, 0.6, m, 0.55, 0.05, 0.2, g).rotation.y = 0.9; box(0.3, 0.07, 0.6, m, -0.5, 0.05, -0.15, g).rotation.y = -0.6; return g; }


// ───────────────────────────── Lamplighter story pieces ─────────────────────────────
let poolT = null;
function poolTex() { if (poolT) return poolT; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,205,130,0.42)'); gr.addColorStop(0.45, 'rgba(255,185,105,0.18)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); poolT = new THREE.CanvasTexture(c); return poolT; }
/** a street lamp ~3.4 m tall with a warm pool of light on the snow and a soft light cone. .set(k) 0 = dark, 1 = full */
export function streetLamp({ sign = false } = {}) {
  const g = new THREE.Group(), pm = mat({ color: '#2E3440', roughness: 0.5, metalness: 0.4 });
  cyl(0.07, 0.09, 3.3, pm, 0, 1.65, 0, g, 10); cyl(0.16, 0.2, 0.3, pm, 0, 0.15, 0, g, 10);
  box(0.06, 0.06, 0.7, pm, 0, 3.3, 0.33, g);
  const head = new THREE.Group(); head.position.set(0, 3.2, 0.66); g.add(head);
  box(0.42, 0.08, 0.42, pm, 0, 0.12, 0, head);
  const bulbM = new THREE.MeshStandardMaterial({ color: '#FFF2C8', emissive: '#FFD080', emissiveIntensity: 3 });
  const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), bulbM); head.add(bulb);
  const poolM = new THREE.MeshBasicMaterial({ map: poolTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), poolM); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.16, 0.66); g.add(pool);
  const coneM = new THREE.MeshBasicMaterial({ color: '#FFD9A0', transparent: true, opacity: 0.025, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3.1, 24, 1, true), coneM); cone.position.set(0, 1.62, 0.66); g.add(cone);
  if (sign) {
    const st = canvasTex('smile', 256, 320, (x) => { x.fillStyle = '#F2E6CF'; x.fillRect(0, 0, 256, 320); x.strokeStyle = '#2A2230'; x.lineWidth = 12; x.strokeRect(6, 6, 244, 308); x.fillStyle = '#2A2230'; x.font = '900 64px Inter'; x.textAlign = 'center'; x.fillText('SMILE.', 128, 96); x.font = '800 40px Inter'; x.fillText("IT'S", 128, 168); x.fillText('WATCHING.', 128, 216);
      x.lineWidth = 9; x.beginPath(); x.arc(128, 262, 30, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); x.beginPath(); x.arc(114, 252, 4, 0, 7); x.arc(142, 252, 4, 0, 7); x.fill(); });
    const sg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.03), [mat({ color: '#2A2230' }), mat({ color: '#2A2230' }), mat({ color: '#2A2230' }), mat({ color: '#2A2230' }), new THREE.MeshStandardMaterial({ map: st, roughness: 0.8 }), mat({ color: '#2A2230' })]);
    sg.position.set(0, 1.85, 0.1); g.add(sg); g.userData.sign = sg;
  }
  g.set = (k) => { bulbM.emissiveIntensity = 0.05 + 2.2 * k; bulbM.color.set(k > 0.05 ? '#FFF2C8' : '#5A5A60'); poolM.opacity = k; coneM.opacity = 0.025 * k; pool.visible = cone.visible = k > 0.01; return g; };
  g.set(1); return g;
}
/** the Lamplighter: very tall and thin, long dark coat, a lantern for a head. .set({ phase, walk, bow, glow, armR }) */
export function lamplighter() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const coat = mat({ color: '#15151C', roughness: 0.9 }), metal = mat({ color: '#2A2620', metalness: 0.6, roughness: 0.4 });
  const legs = [-0.13, 0.13].map((x) => { const p = new THREE.Group(); p.position.set(x, 1.5, 0); body.add(p); box(0.14, 1.5, 0.16, coat, 0, -0.75, 0, p); return p; });
  box(0.62, 1.55, 0.36, coat, 0, 2.2, 0, body);
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.5, 0.9, 6), coat); skirt.position.y = 1.4; skirt.castShadow = true; body.add(skirt);
  const arms = [-0.4, 0.4].map((x) => { const p = new THREE.Group(); p.position.set(x, 2.9, 0); body.add(p); box(0.13, 1.5, 0.13, coat, 0, -0.75, 0, p); box(0.1, 0.18, 0.1, mat({ color: '#0A0A0E' }), 0, -1.55, 0, p); return p; });
  const neck = new THREE.Group(); neck.position.set(0, 3.0, 0); body.add(neck);
  cyl(0.05, 0.05, 0.2, metal, 0, 0.1, 0, neck, 8);
  box(0.5, 0.06, 0.5, metal, 0, 0.22, 0, neck); box(0.5, 0.06, 0.5, metal, 0, 0.82, 0, neck);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 4), metal); roof.rotation.y = Math.PI / 4; roof.position.y = 1.0; neck.add(roof);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), metal); ring.position.y = 1.2; neck.add(ring);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.04, 0.6, 0.04, metal, a * 0.23, 0.52, b * 0.23, neck));
  const glassM = new THREE.MeshStandardMaterial({ color: '#FFE2A0', emissive: '#FFB040', emissiveIntensity: 2.5, transparent: true, opacity: 0.9 });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.42), glassM); glass.position.y = 0.52; neck.add(glass);
  const flameM = new THREE.MeshBasicMaterial({ color: '#FFF6E0', toneMapped: false });
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), flameM); flame.scale.y = 1.6; flame.position.y = 0.5; neck.add(flame);
  const light = new THREE.PointLight('#FFB45A', 3, 6, 1.6); light.position.y = 0.5; neck.add(light);
  root.scale.setScalar(0.92);
  const P = { group: root, neck, arms, legs,
    at(x, y, z, ry) { root.position.set(x, y, z); if (ry != null) root.rotation.y = ry; return P; },
    set(st = {}) { root.visible = st.show ?? true; const ph = st.phase || 0, w = st.walk ? Math.sin(ph) * 22 : 0;
      legs[0].rotation.x = w * D; legs[1].rotation.x = -w * D; body.position.y = st.walk ? Math.abs(Math.cos(ph)) * 0.05 : 0;
      arms[0].rotation.x = -w * D * 0.6 - (st.armL || 0) * D; arms[1].rotation.x = w * D * 0.6 - (st.armR || 0) * D;
      neck.rotation.x = (st.bow || 0) * D; body.rotation.x = (st.lean || 0) * D;
      const gl = st.glow ?? 1, fl = 0.85 + 0.15 * Math.sin((st.t || 0) * 23) * Math.sin((st.t || 0) * 7.3);
      glassM.emissiveIntensity = 2.5 * gl * fl; light.intensity = 3 * gl * fl; flame.scale.set(1, 1.6 * fl, 1); return P; } };
  P.set(); return P;
}
export function tombstone(s = 1, seed = 0) { const g = new THREE.Group(), m = mat({ color: '#A9ADB5', roughness: 0.9 }); box(0.6 * s, 0.75 * s, 0.16, m, 0, 0.37 * s, 0, g); const top = cyl(0.3 * s, 0.3 * s, 0.16, m, 0, 0.75 * s, 0, g, 18); top.rotation.x = Math.PI / 2; box(0.7 * s, 0.1, 0.3, mat({ color: '#8E9299' }), 0, 0.05, 0, g); g.rotation.y = (rnd(seed) - 0.5) * 0.2; return g; }
export function bareTree(s = 1) { const g = new THREE.Group(), m = mat({ color: '#4A3A30', roughness: 0.9 }); cyl(0.08 * s, 0.14 * s, 2.4 * s, m, 0, 1.2 * s, 0, g, 6); [[0.6, 1.6, 0.5], [-0.5, 1.9, -0.6], [0.3, 2.2, 0.9], [-0.4, 1.4, 0.8]].forEach(([a, y, r]) => { const b = cyl(0.03 * s, 0.06 * s, 1.1 * s, m, 0, y * s, 0, g, 5); b.rotation.z = a; b.rotation.y = r; b.position.x = Math.sin(a) * -0.4 * s; }); return g; }

export function calendar() { const c = document.createElement('canvas'); c.width = 256; c.height = 320; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 })); let cur = null;
  m.setDay = (day, num) => { const k = day + num; if (k === cur) return m; cur = k; const g = c.getContext('2d'); g.fillStyle = '#FBF5E6'; g.fillRect(0, 0, 256, 320); g.fillStyle = '#C8202F'; g.fillRect(0, 0, 256, 80); g.fillStyle = '#FFF'; g.font = '900 52px Inter'; g.textAlign = 'center'; g.fillText(day, 128, 58); g.fillStyle = '#2A2230'; g.font = '900 150px Inter'; g.fillText(String(num), 128, 250); t.needsUpdate = true; return m; };
  m.setDay('MON', 14); return m; }
export function busStop() { const g = new THREE.Group(), m = mat({ color: '#2E3440', metalness: 0.4, roughness: 0.5 }); cyl(0.05, 0.05, 2.6, m, 0.9, 1.3, 0, g, 8); const s = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), mat({ color: '#2F6B8F' })); s.position.set(0.9, 2.45, 0.06); g.add(s);
  box(1.4, 0.08, 0.45, mat({ color: '#8A5A36' }), -0.3, 0.48, 0, g); box(1.4, 0.4, 0.06, mat({ color: '#8A5A36' }), -0.3, 0.75, -0.2, g); [-0.9, 0.3].forEach((x) => box(0.06, 0.48, 0.4, m, x, 0.24, 0, g)); return g; }
export function loaf() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.22, 4, 10), mat({ color: '#C88A4A' })); b.rotation.z = Math.PI / 2; g.add(b); return g; }

// ───────────────────────────── The Counter story pieces ─────────────────────────────
let flameT = null;
function flameTex() { if (flameT) return flameT; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,220,150,0.9)'); gr.addColorStop(0.4, 'rgba(255,170,80,0.35)'); gr.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); flameT = new THREE.CanvasTexture(c); return flameT; }
/** a flame (teardrop + glow sprite) with an optional point light. .set(k, t) k: 0 out .. 1 full */
export function flame({ light = true, s = 1, seed = 0 } = {}) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.022 * s, 12, 10), new THREE.MeshBasicMaterial({ color: '#FFF6DA', toneMapped: false }));
  core.scale.y = 1.9; core.position.y = 0.035 * s; g.add(core);
  const outer = new THREE.Mesh(new THREE.SphereGeometry(0.034 * s, 12, 10), new THREE.MeshBasicMaterial({ color: '#FFB24A', transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false }));
  outer.scale.y = 2.0; outer.position.y = 0.04 * s; g.add(outer);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  glow.scale.setScalar(0.32 * s); glow.position.y = 0.045 * s; g.add(glow);
  const L = light ? new THREE.PointLight('#FFB060', 1.1, 4.5, 1.6) : null; if (L) { L.position.y = 0.08; g.add(L); }
  g.set = (k, t = 0) => { const fl = 0.86 + 0.14 * Math.sin(t * 19 + seed * 7) * Math.sin(t * 6.1 + seed); const kk = Math.max(0, k);
    core.scale.set(kk, 1.9 * kk * fl, kk); outer.scale.set(kk, 2.0 * kk * fl, kk); glow.material.opacity = kk; core.visible = outer.visible = kk > 0.02; glow.visible = kk > 0.02;
    if (L) L.intensity = 1.1 * kk * fl; g.rotation.z = Math.sin(t * 3 + seed) * 0.06 * kk; return g; };
  g.set(1); return g;
}
/** a candle: white wax stick on a little brass holder, with a flame on top. .set(k, t) */
export function candle({ light = true, seed = 0 } = {}) {
  const g = new THREE.Group();
  cyl(0.06, 0.07, 0.025, mat({ color: '#B8903F', metalness: 0.6, roughness: 0.35 }), 0, 0.012, 0, g, 16);
  cyl(0.022, 0.022, 0.16, mat({ color: '#F4EEDF', roughness: 0.6 }), 0, 0.105, 0, g, 12);
  const f = flame({ light, seed }); f.position.y = 0.19; g.add(f); g.flame = f;
  g.set = (k, t) => { f.set(k, t); return g; };
  return g;
}
/** a painted door number plate: .draw({ num, crossed: 0..1 (paint stroke over num), next: number painted beside, nextK: 0..1 }) */
export function doorPlate(w = 0.34, h = 0.26) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 196; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, transparent: true })); let key = '';
  m.draw = ({ num = 3, crossed = 0, next = null, nextK = 0, bg = '#EDE3CC' } = {}) => {
    const k = [num, crossed.toFixed(2), next, nextK.toFixed(2), bg].join(); if (k === key) return m; key = k; const g = c.getContext('2d');
    g.clearRect(0, 0, 256, 196); g.fillStyle = bg; g.beginPath(); g.roundRect(6, 6, 244, 184, 18); g.fill(); g.strokeStyle = '#3A2A20'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#2A1C14'; g.font = '900 150px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (next == null) g.fillText(String(num), 128, 106);
    else { g.font = '900 120px Inter'; g.fillText(String(num), 78, 106); }
    if (crossed > 0) { g.fillStyle = bg; g.globalAlpha = 0.92; const x0 = next == null ? 50 : 18; g.beginPath(); g.roundRect(x0, 50, 120 * crossed + 10, 96, 30); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = 'rgba(120,100,80,0.35)'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x0 + 6, 60 + i * 18); g.lineTo(x0 + 120 * crossed, 64 + i * 18); g.stroke(); } }
    if (next != null && nextK > 0) { g.save(); g.beginPath(); g.rect(130, 0, 120 * nextK, 196); g.clip(); g.fillStyle = '#7A1E22'; g.font = '900 120px Inter'; g.fillText(String(next), 188, 108); g.restore(); }
    t.needsUpdate = true; return m; };
  m.draw(); return m;
}
/** the Counter: very tall hooded figure in a long robe, a black void face with two pale pin eyes, long pale fingers.
 *  .set({ phase, walk, armR (forward°), armL, reach (0..1 extends the right forearm), point, pinch (0..1), lean, tilt, turn, t }) .tip() world pos of the right index fingertip */
export function theCounter() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const robe = mat({ color: '#121218', roughness: 0.95 }), skin = mat({ color: '#E6E1D6', roughness: 0.6 });
  const r = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.55, 2.3, 8), robe); r.position.y = 1.15; r.castShadow = true; body.add(r);
  box(0.75, 0.35, 0.42, robe, 0, 2.35, 0, body);
  const neck = new THREE.Group(); neck.position.set(0, 2.5, 0); body.add(neck);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.6, 0.52), robe); hood.position.y = 0.3; hood.castShadow = true; neck.add(hood);
  const tipH = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 4), robe); tipH.rotation.set(-0.5, Math.PI / 4, 0); tipH.position.set(0, 0.6, -0.18); neck.add(tipH);
  const voidM = new THREE.MeshBasicMaterial({ color: '#000000' }); const face = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.42), voidM); face.position.set(0, 0.27, 0.262); neck.add(face);
  const eyeM = new THREE.MeshBasicMaterial({ color: '#E8ECF4', toneMapped: false });
  [-0.07, 0.07].forEach((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), eyeM); e.position.set(x, 0.3, 0.265); neck.add(e); });
  const arm = (sx) => { const sh = new THREE.Group(); sh.position.set(sx * 0.42, 2.4, 0); body.add(sh);
    box(0.17, 0.85, 0.17, robe, 0, -0.42, 0, sh); const el = new THREE.Group(); el.position.y = -0.85; sh.add(el);
    box(0.15, 0.75, 0.15, robe, 0, -0.37, 0, el); const hand = new THREE.Group(); hand.position.y = -0.78; el.add(hand);
    box(0.11, 0.13, 0.06, skin, 0, -0.04, 0, hand);
    const fingers = [-0.04, -0.013, 0.013, 0.04].map((x, i) => { const f = new THREE.Group(); f.position.set(x, -0.1, 0); hand.add(f); box(0.018, i === 1 ? 0.26 : 0.2, 0.018, skin, 0, i === 1 ? -0.13 : -0.1, 0, f); return f; });
    const thumb = new THREE.Group(); thumb.position.set(sx * 0.06, -0.05, 0.02); hand.add(thumb); box(0.02, 0.12, 0.02, skin, 0, -0.06, 0, thumb);
    return { sh, el, hand, fingers, thumb }; };
  const R = arm(1), Lh = arm(-1);
  const tipObj = new THREE.Object3D(); tipObj.position.set(0, -0.26, 0); R.fingers[1].add(tipObj);
  const P = { group: root, neck, R, L: Lh,
    at(x, y, z, ry) { root.position.set(x, y, z); if (ry != null) root.rotation.y = ry; return P; },
    set(st = {}) { root.visible = st.show ?? true; const ph = st.phase || 0; const t = st.t || 0;
      body.position.y = st.walk ? Math.abs(Math.sin(ph)) * 0.04 : Math.sin(t * 1.3) * 0.01; r.rotation.z = st.walk ? Math.sin(ph) * 0.04 : 0;
      const D = Math.PI / 180; R.sh.rotation.set(-(st.armR || 0) * D, 0, (st.armRout || 4) * D); R.el.rotation.x = -(st.reach || 0) * 40 * D;
      Lh.sh.rotation.set(-(st.armL || 0) * D, 0, -4 * D); Lh.el.rotation.x = -10 * D;
      R.fingers.forEach((f, i) => (f.rotation.x = st.point && i !== 1 ? 1.4 : (st.pinch || 0) * 0.9)); R.thumb.rotation.z = -(st.pinch || 0) * 0.8;
      neck.rotation.set((st.tilt || 0) * D, (st.turn || 0) * D, 0); body.rotation.x = (st.lean || 0) * D; return P; },
    tip() { root.updateMatrixWorld(true); return tipObj.getWorldPosition(new THREE.Vector3()); } };
  P.set(); return P;
}
export function bellTower() {
  const g = new THREE.Group(), w = mat({ color: '#8E8478', roughness: 0.95 }), d = mat({ color: '#3A2E2A' });
  box(2.6, 10, 2.6, w, 0, 5, 0, g); box(2.9, 0.3, 2.9, mat({ color: '#F4F8FC' }), 0, 10.1, 0, g);
  [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].forEach(([x, z]) => box(0.4, 2.2, 0.4, w, x, 11.3, z, g));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.4, 4), d); roof.rotation.y = Math.PI / 4; roof.position.y = 13.6; g.add(roof);
  box(3.0, 0.25, 3.0, w, 0, 12.4, 0, g);
  const bp = new THREE.Group(); bp.position.y = 12.2; g.add(bp); const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.7, 0.9, 16, 1, true), mat({ color: '#B8903F', metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide })); bell.position.y = -0.55; bp.add(bell);
  box(0.9, 1.4, 0.1, d, 0, 2.5, 1.31, g); [4.5, 7.5].forEach((y) => box(0.5, 0.8, 0.1, mat({ color: '#FFD58A', emissive: '#FFB040', emissiveIntensity: 0.6 }), 0, y, 1.31, g));
  g.swing = (a) => { bp.rotation.z = a; }; return g;
}
