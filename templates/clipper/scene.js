import * as THREE from './node_modules/three/build/three.module.js';
import * as TL from './timeline.js';
import { RoomEnvironment } from './node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from './node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

const W = 720, H = 1280, LW = 720, LH = 1280;
const HANDLE = '@ENGINEERSWITHOUTSLEEP';
const BRAND = 'ENGINEERS WITHOUT SLEEP';
const COL = {
  bg: 0x141127, cream: '#fff4dc', amber: '#ffb636', pink: '#ff4d7a', cyan: '#4fe0ff', mint: '#43e8b0',
  yellow: '#ffe14a', orange: '#ff7a2f', violet: '#a98bff', ink: '#120d22', red: '#e0313b', blue: '#3d7bff',
};

// ---------- renderer ----------
const glCanvas = document.createElement('canvas'); glCanvas.width = LW; glCanvas.height = LH;
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, preserveDrawingBuffer: true });
renderer.setSize(LW, LH, false); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const out = document.createElement('canvas'); out.width = W; out.height = H; document.body.appendChild(out);
const ctx = out.getContext('2d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2450);
scene.fog = new THREE.Fog(0x2a2450, 55, 140);
{ const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5; }
const NEAR = 0.3, FAR = 5000;
const camera = new THREE.PerspectiveCamera(35, LW / LH, NEAR, FAR);

const ramp = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
const toon = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.15, ...extra });
const box = (w, h, d, mat, x = 0, y = 0, z = 0, parent) => { const mn = Math.min(w, h, d); const m = new THREE.Mesh(mn > 0.12 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(0.1, mn * 0.12)) : new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent && parent.add(m); return m; };
const cyl = (r, h, mat, seg = 20, parent) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); parent && parent.add(m); return m; };

scene.add(new THREE.HemisphereLight(0xc8d8ff, 0x3a2c55, 0.9));
const sun = new THREE.DirectionalLight(0xffd2a8, 3.0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun); scene.add(sun.target);
const rim = new THREE.DirectionalLight(0xff6fa8, 1.1); rim.position.set(-40, 15, -20); scene.add(rim);
const bangLight = new THREE.PointLight(0xffa040, 0, 8, 1.5); scene.add(bangLight);

function textTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t;
}


// ================= HAIR CLIPPER TOPIC (units: cm) =================
scene.background = new THREE.Color(0x1e1236); scene.fog = new THREE.Fog(0x1e1236, 70, 160);
const PED_H = 4;
const gold = (c = 0xffc24a, r = 0.28, extra = {}) => new THREE.MeshPhysicalMaterial({ color: c, metalness: 1, roughness: r, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.7, ...extra });
const velvet = (c = 0x8a1236) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.85, sheen: 1, sheenColor: new THREE.Color(0xff7aa0), sheenRoughness: 0.5 });

// ---------- throne room: checker marble floor, damask wall, brand banners ----------
{
  const ft = textTexture(256, 256, (g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? '#3a2350' : '#e8dcc4'; g.fillRect(x * 128, y * 128, 128, 128); }
    g.globalAlpha = 0.18; g.strokeStyle = '#8a7aa0'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo((i * 53) % 256, 0); g.bezierCurveTo(60, 90, 180, 160, (i * 97) % 256, 256); g.stroke(); } g.globalAlpha = 1; });
  ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(12, 10); ft.magFilter = THREE.LinearFilter;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(180, 150), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.35, metalness: 0.05 })); floor.receiveShadow = true;
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 30); scene.add(floor);
  const wt = textTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#4a1236'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a1a42';
    for (let y = 0; y < h; y += 64) for (let x = ((y / 64) % 2) * 32; x < w; x += 64) { g.beginPath(); g.moveTo(x + 32, y); g.lineTo(x + 52, y + 32); g.lineTo(x + 32, y + 64); g.lineTo(x + 12, y + 32); g.closePath(); g.fill(); }
    g.fillStyle = '#7a3a2a'; for (let y = 0; y < h; y += 64) for (let x = ((y / 64) % 2) * 32; x < w; x += 64) g.fillRect(x + 29, y + 29, 6, 6);
  });
  wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(10, 4);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(200, 80), new THREE.MeshBasicMaterial({ map: wt })); wall.position.set(0, 40, -30); scene.add(wall); wall.userData.wall = 1;
  const wains = new THREE.Mesh(new THREE.PlaneGeometry(200, 7), new THREE.MeshBasicMaterial({ color: 0x2c0c24 })); wains.position.set(0, 3.5, -29.9); scene.add(wains); wains.userData.wall = 1;
  // vertical banners: channel name stacked in gold pixel letters + crown
  const banner = (x, words) => {
    const tex = textTexture(256, 640, (g, w, h) => {
      g.fillStyle = '#8a1236'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffc24a'; g.fillRect(0, 0, w, 14); g.fillRect(0, 0, 12, h); g.fillRect(w - 12, 0, 12, h);
      g.beginPath(); g.moveTo(0, h - 70); g.lineTo(w / 2, h); g.lineTo(w, h - 70); g.lineTo(w, h); g.lineTo(0, h); g.fillStyle = '#1e1236'; g.fill();
      g.fillStyle = '#ffc24a'; // pixel crown
      [[88, 120, 80, 24], [88, 80, 12, 40], [122, 70, 12, 50], [156, 80, 12, 40]].forEach(([a, b2, c, d]) => g.fillRect(a, b2, c, d));
      g.fillStyle = '#ff4d7a'; g.fillRect(122, 126, 12, 12);
      g.font = '28px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd36b';
      words.forEach((wd, i) => g.fillText(wd, w / 2, 230 + i * 70));
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(11, 27.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.position.set(x, 26, -29.5); scene.add(m); m.userData.wall = 1;
    const rod = cyl(0.35, 13, gold(), 12, scene); rod.rotation.z = Math.PI / 2; rod.position.set(x, 40, -29.3);
  };
  banner(-15, ['ENGINEERS', 'WITHOUT', 'SLEEP']); banner(15, ['ENGINEERS', 'WITHOUT', 'SLEEP']);
  // gold pillars
  [-30, 30].forEach((x) => { const p = cyl(2.2, 60, gold(0xe0a93a, 0.35), 24, scene); p.position.set(x, 30, -26); });
}
const wallMats = []; scene.traverse((o) => { if (o.userData.wall) { o.material.userData.base = o.material.color.clone(); wallMats.push(o.material); } });

// ---------- pedestal + velvet cushion + plaque ----------
{
  const marble = new THREE.MeshStandardMaterial({ color: 0x2c1a44, roughness: 0.3, metalness: 0.1 });
  const base = cyl(5.6, 2.6, marble, 40, scene); base.position.y = 1.3;
  [0.15, 2.5].forEach((y) => { const r = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.16, 8, 48), gold()); r.rotation.x = Math.PI / 2; r.position.y = y; scene.add(r); });
  const cush = new THREE.Mesh(new RoundedBoxGeometry(7.4, 1.4, 7.4, 4, 0.6), velvet()); cush.position.y = 3.3; scene.add(cush);
  [[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]].forEach(([x, z]) => { const t = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 10), gold()); t.position.set(x, 2.6, z); scene.add(t); const k = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), gold()); k.position.set(x, 3.2, z); scene.add(k); });
  const pt = textTexture(512, 64, (g, w, h) => { g.fillStyle = '#ffc24a'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a3a10'; g.fillRect(4, 4, w - 8, h - 8); g.font = '20px PS2P'; g.fillStyle = '#ffd36b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ENGINEERS WITHOUT SLEEP', w / 2, h / 2 + 2); });
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.8), new THREE.MeshBasicMaterial({ map: pt })); plaque.position.set(0, 1.3, 5.62); scene.add(plaque);
}
// props: coin stacks, a gold comb
{
  const coin = gold(0xffcf5a, 0.3);
  [[-9, 6, 7], [-10.5, 4.2, 4], [9.5, 5.5, 6], [11, 3, 3]].forEach(([x, z, n]) => { for (let i = 0; i < n; i++) { const c = cyl(1.0, 0.28, coin, 20, scene); c.position.set(x + Math.sin(i * 1.7) * 0.08, 0.14 + i * 0.3, z); } });
  const comb = new THREE.Group(); comb.position.set(8, 0.15, 10); comb.rotation.y = 0.6; scene.add(comb);
  box(6, 0.3, 0.8, gold(), 0, 0, 0, comb); for (let i = 0; i < 20; i++) box(0.12, 0.25, 1.4, gold(), -2.8 + i * 0.29, 0, 1.0, comb);
}

// ---------- the golden clipper (local: body y 0..13, blade tips y 15.8; front = +z) ----------
const clip = new THREE.Group(); clip.position.set(0, PED_H, 0); scene.add(clip);
const K = {}; const bodyMats = [];
const PITCH = 0.4, ECC = 0.2, Y_CAM = 11.0, Y_PIN = 11.35, Z_CUT = 1.52, Z_FIX = 1.64, Z_HAIR = 1.58;
{
  const s = new THREE.Shape();
  s.moveTo(1.3, 0); s.quadraticCurveTo(2.0, 0.1, 2.0, 1.2); s.lineTo(2.15, 8.8); s.quadraticCurveTo(2.2, 10.4, 1.9, 11.3); s.quadraticCurveTo(2.35, 11.9, 2.35, 12.6); s.lineTo(2.2, 12.9);
  s.lineTo(-2.2, 12.9); s.lineTo(-2.35, 12.6); s.quadraticCurveTo(-2.35, 11.9, -1.9, 11.3); s.quadraticCurveTo(-2.2, 10.4, -2.15, 8.8); s.lineTo(-2.0, 1.2); s.quadraticCurveTo(-2.0, 0.1, -1.3, 0); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 2.2, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.3, bevelSegments: 5, curveSegments: 28 }); g.translate(0, 0, -1.1);
  const bm = gold(); bm.transparent = true; bodyMats.push(bm);
  K.body = new THREE.Mesh(g, bm); K.body.castShadow = true; clip.add(K.body);
  K.edges = new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), new THREE.LineBasicMaterial({ color: 0xffe08a, transparent: true })); clip.add(K.edges);
  // knurled grip panels
  const kt = textTexture(64, 64, (c) => { c.fillStyle = '#b07a1c'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#ffd66a'; for (let y = 0; y < 64; y += 16) for (let x = (y / 16) % 2 * 8; x < 64; x += 16) { c.beginPath(); c.moveTo(x + 8, y); c.lineTo(x + 15, y + 8); c.lineTo(x + 8, y + 16); c.lineTo(x + 1, y + 8); c.fill(); } });
  kt.wrapS = kt.wrapT = THREE.RepeatWrapping; kt.repeat.set(2, 9);
  [-1.3, 1.3].forEach((x) => { const m = gold(0xffffff, 0.4, { map: kt }); m.transparent = true; bodyMats.push(m); const p = new THREE.Mesh(new THREE.BoxGeometry(1.15, 7.2, 0.05), m); p.position.set(x, 5.6, 1.47); clip.add(p); });
  // engraved nameplate (channel name, vertical)
  const nt = textTexture(128, 1024, (c, w, h) => { c.fillStyle = '#1a0f08'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffc24a'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12);
    c.save(); c.translate(w / 2, h / 2); c.rotate(-Math.PI / 2); c.font = '36px PS2P'; c.fillStyle = '#ffd36b'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ENGINEERS WITHOUT SLEEP', 0, 3); c.restore(); });
  const nm = new THREE.MeshStandardMaterial({ map: nt, roughness: 0.4, metalness: 0.3, transparent: true }); bodyMats.push(nm);
  const np = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 7.4), nm); np.position.set(0, 5.6, 1.48); clip.add(np);
  // crown emblem + ruby switch
  const cm = gold(0xffe08a, 0.2); cm.transparent = true; bodyMats.push(cm);
  const crownE = new THREE.Group(); crownE.position.set(0, 10.1, 1.5); clip.add(crownE);
  box(1.5, 0.32, 0.14, cm, 0, 0, 0, crownE); [-0.55, 0, 0.55].forEach((x, i) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, i === 1 ? 0.7 : 0.5, 4), cm); c.position.set(x, i === 1 ? 0.5 : 0.4, 0); crownE.add(c); });
  const rubyM = new THREE.MeshPhysicalMaterial({ color: 0xe0103a, roughness: 0.05, metalness: 0, clearcoat: 1, emissive: 0x400010, transparent: true }); bodyMats.push(rubyM);
  const ruby = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), rubyM); ruby.position.set(0, 0.02, 0.12); crownE.add(ruby);
  const sw = new THREE.Mesh(new THREE.OctahedronGeometry(0.32), rubyM); sw.scale.set(1, 1.3, 0.6); sw.position.set(0, 1.0, 1.5); clip.add(sw);
  [-1.6, 1.6].forEach((x) => { const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshPhysicalMaterial({ color: 0x2a6aff, roughness: 0.05, clearcoat: 1, transparent: true })); bodyMats.push(sp.material); sp.position.set(x, 10.1, 1.5); clip.add(sp); });
  // taper lever on the side
  const lv = gold(); lv.transparent = true; bodyMats.push(lv);
  box(0.25, 0.25, 1.6, lv, -2.6, 11.9, 0.3, clip);
}
// internals (visible in x-ray)
const inner = new THREE.Group(); clip.add(inner);
{
  const can = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 6, 32, 1, true, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0xc8d0e0, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
  can.position.y = 6.2; inner.add(can); K.can = can;
  const lt = textTexture(256, 64, (g, w, h) => { g.fillStyle = '#120d22'; g.fillRect(0, 0, w, h); g.font = '16px PS2P'; g.fillStyle = '#ffb636'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EWS-6800', w / 2, 20); g.font = '10px PS2P'; g.fillStyle = '#fff4dc'; g.fillText('ENGINEERS WITHOUT SLEEP', w / 2, 46); });
  const label = new THREE.Mesh(new THREE.CylinderGeometry(1.27, 1.27, 0.75, 32, 1, true, -0.9, 1.8), new THREE.MeshBasicMaterial({ map: lt })); label.position.y = 3.55; inner.add(label);
  [-1, 1].forEach((sd) => { const mg = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 5.4, 16, 1, true, sd > 0 ? Math.PI / 2 - 0.55 : 1.5 * Math.PI - 0.55, 1.1), new THREE.MeshStandardMaterial({ color: sd > 0 ? 0xd83a4a : 0x3a6ad8, roughness: 0.5, side: THREE.DoubleSide })); mg.position.y = 6.2; inner.add(mg); });
  K.rotor = new THREE.Group(); K.rotor.position.y = 6.2; inner.add(K.rotor);
  cyl(0.55, 5.0, toon(0x6c7088, { metalness: 0.6, roughness: 0.35 }), 20, K.rotor);
  const copper = new THREE.MeshStandardMaterial({ color: 0xd8742e, metalness: 0.8, roughness: 0.3 });
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; const w = box(0.5, 4.4, 0.5, copper, Math.sin(a) * 0.72, 0, Math.cos(a) * 0.72, K.rotor); w.rotation.y = a; }
  box(0.08, 4.6, 0.08, toon(0xff4d7a), 0, 0, 0.98, K.rotor);
  const shaft = cyl(0.12, 2.2, toon(0xd8dbe6, { metalness: 0.8, roughness: 0.25 }), 12, K.rotor); shaft.position.y = 3.6;
  const brg = cyl(0.45, 0.4, toon(0x9aa3b5, { metalness: 0.6 }), 16, inner); brg.position.y = 9.6;
  K.cam = new THREE.Group(); K.cam.position.y = Y_CAM; inner.add(K.cam);
  cyl(0.55, 0.2, gold(0xffb636, 0.3), 24, K.cam);
  const pin = cyl(0.11, 0.85, toon(0xff4d7a, { emissive: 0x401020 }), 12, K.cam); pin.position.set(0, 0.45, ECC);
  box(0.1, 0.22, 0.12, toon(0x4fe0ff), 0, 0.02, -0.5, K.cam);
  // fork (U-shaped drive) - moves only in x
  K.fork = new THREE.Group(); inner.add(K.fork);
  const mint = toon(0x43e8b0, { metalness: 0.3, roughness: 0.35 });
  [-0.17, 0.17].forEach((x) => box(0.08, 0.36, 1.0, mint, x, Y_PIN + 0.1, -0.05, K.fork));
  box(0.42, 0.36, 0.12, mint, 0, Y_PIN + 0.1, 0.5, K.fork);
  box(0.24, 0.12, 0.95, mint, 0, Y_PIN + 0.22, 1.0, K.fork);
  box(0.5, 1.1, 0.06, mint, 0, Y_PIN + 0.75, Z_CUT - 0.06, K.fork);
}
// blades
const steelCut = new THREE.MeshPhysicalMaterial({ color: 0xdbe8f4, metalness: 1, roughness: 0.18, envMapIntensity: 1.8 });
K.cutter = new THREE.Group(); clip.add(K.cutter);
box(4.2, 2.1, 0.08, steelCut, 0, 13.55, Z_CUT, K.cutter);
for (let k = -5; k <= 5; k++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.72, 0.08), steelCut); t.position.set(k * PITCH, 14.95, Z_CUT); K.cutter.add(t); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), steelCut); tip.rotation.y = Math.PI / 4; tip.scale.z = 0.4; tip.position.set(k * PITCH, 15.4, Z_CUT); K.cutter.add(tip); }
const fixM = gold(0xffd36b, 0.22); fixM.transparent = true;
K.fixed = new THREE.Group(); clip.add(K.fixed);
{ const pl = box(4.6, 2.6, 0.12, fixM, 0, 13.5, Z_FIX, K.fixed); pl.castShadow = true;
  for (let k = -5; k <= 5; k++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.0, 0.12), fixM); t.position.set(k * PITCH, 15.3, Z_FIX); K.fixed.add(t); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 10), fixM); c.rotation.x = Math.PI / 2; c.position.set(k * PITCH, 15.8, Z_FIX); K.fixed.add(c); }
  [-1.6, 1.6].forEach((x) => { const sc = cyl(0.18, 0.1, gold(0xb08a3a, 0.3), 12, K.fixed); sc.rotation.x = Math.PI / 2; sc.position.set(x, 12.7, Z_FIX + 0.1); }); }
// hair strands (one per gap) + falling pieces
const hairM = new THREE.MeshStandardMaterial({ color: 0x24160e, roughness: 0.6 });
const HAIR_X = []; for (let k = -5; k <= 4; k++) HAIR_X.push((k + 0.5) * PITCH);
K.hairs = HAIR_X.map((x, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1, 6), hairM); m.position.x = x; m.userData.tilt = Math.sin(i * 2.3) * 0.03; clip.add(m); return m; });
const NP = 70; K.pieces = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.032, 0.032, 0.42, 6), hairM, NP); K.pieces.frustumCulled = false; clip.add(K.pieces);
// crown for the finale
K.crown = new THREE.Group(); scene.add(K.crown);
{
  const cg = gold(0xffc24a, 0.22);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.6, 1.3, 40, 1, true), cg); band.material = cg.clone(); band.material.side = THREE.DoubleSide; K.crown.add(band);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; const sp = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.4, 4), cg); sp.position.set(Math.sin(a) * 2.65, 1.3, Math.cos(a) * 2.65); K.crown.add(sp);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), cg); ball.position.set(Math.sin(a) * 2.65, 2.05, Math.cos(a) * 2.65); K.crown.add(ball);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), new THREE.MeshPhysicalMaterial({ color: k % 2 ? 0x2a6aff : 0xe0103a, roughness: 0.05, clearcoat: 1 })); gem.position.set(Math.sin(a) * 2.72, 0, Math.cos(a) * 2.72); K.crown.add(gem); }
  const vel = new THREE.Mesh(new THREE.SphereGeometry(2.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), velvet()); vel.position.y = 0.3; vel.scale.y = 0.7; K.crown.add(vel);
  const tr = new THREE.Mesh(new THREE.TorusGeometry(2.68, 0.18, 8, 40), cg); tr.rotation.x = Math.PI / 2; tr.position.y = -0.62; K.crown.add(tr);
}
K.crown.traverse((o) => { if (o.isMesh) o.castShadow = true; }); K.crown.scale.setScalar(0.85);
clip.traverse((o) => { if (o.isMesh) o.castShadow = true; });
// ---------- post: ordered dither (done on the 2D canvas) ----------
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
function dither() {
  const img = ctx.getImageData(0, 0, W, H), d = img.data, L = 9, step = 255 / (L - 1);
  for (let y = 0; y < H; y++) { const row = (y & 3) * 4; for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, bb = BAY[row + (x & 3)] * step * 0.9;
    d[i] = Math.round((d[i] + bb) / step) * step; d[i + 1] = Math.round((d[i + 1] + bb) / step) * step; d[i + 2] = Math.round((d[i + 2] + bb) / step) * step;
  } }
  ctx.putImageData(img, 0, 0);
}

// ---------- 2D helpers ----------
const FONT = { ps: 'PS2P', silk: 'SILK' };
const colorOf = (n) => COL[n] || n;
function project(v3) { const v = v3.clone().project(camera); return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, z: v.z }; }
function shade(hex, k) { const c = new THREE.Color(hex); if (k < 0) c.multiplyScalar(1 + k); else c.lerp(new THREE.Color('#fff'), k); return '#' + c.getHexString(); }
function drawBox(x, y, w, h, accent) { ctx.fillStyle = shade(accent, -0.55); ctx.fillRect(x + 6, y + 6, w, h); ctx.fillStyle = COL.ink; ctx.fillRect(x, y, w, h); ctx.fillStyle = accent; ctx.fillRect(x, y, 6, h); }
function textW(s, size, font) { ctx.font = `${size}px ${font}`; return ctx.measureText(s).width; }
function drawLabel(lb, anchor, b) {
  const lt = (b - lb.t0) * TL.B, outT = (lb.t1 - b) * TL.B; if (lt < 0 || outT < 0 || !anchor) return;
  const k = Math.min(1, lt / 0.22) * Math.min(1, outT / 0.12), acc = colorOf(lb.color);
  const w = textW(lb.text, 24, FONT.silk) + 30, h = 44, bx = lb.side === 'L' ? 28 : W - 28 - w, by = lb.y * H;
  const sx = lb.side === 'L' ? bx + w : bx, sy = by + h / 2;
  ctx.strokeStyle = acc; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (anchor.x - sx) * k, sy + (anchor.y - sy) * k); ctx.stroke();
  if (k >= 1) { ctx.fillStyle = acc; ctx.fillRect(anchor.x - 7, anchor.y - 7, 14, 14); ctx.fillStyle = COL.ink; ctx.fillRect(anchor.x - 3, anchor.y - 3, 6, 6); }
  ctx.globalAlpha = Math.min(1, lt / 0.1) * Math.min(1, outT / 0.12);
  drawBox(bx, by, w, h, acc); ctx.font = `24px ${FONT.silk}`; ctx.fillStyle = acc; ctx.textBaseline = 'middle'; ctx.fillText(lb.text, bx + 18, by + h / 2 + 1);
  ctx.globalAlpha = 1;
}
function drawPop(text, p, ageS, color, size = 32) {
  if (ageS < 0 || ageS > 0.5) return;
  const s = ageS < 0.08 ? 0.6 + 5 * ageS : 1, a = ageS > 0.35 ? 1 - (ageS - 0.35) / 0.15 : 1;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y - ageS * 60); ctx.scale(s, s); ctx.rotate(-0.08);
  ctx.font = `${size}px ${FONT.ps}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = COL.ink; ctx.fillText(text, 4, 4); ctx.fillStyle = color; ctx.fillText(text, 0, 0); ctx.restore(); ctx.textAlign = 'left';
}
function drawHandle() {
  ctx.font = `20px ${FONT.silk}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.5; ctx.fillStyle = COL.ink; ctx.fillText(HANDLE, W / 2 + 2, H - 32);
  ctx.fillStyle = COL.cream; ctx.fillText(HANDLE, W / 2, H - 34); ctx.globalAlpha = 1; ctx.textAlign = 'left';
}
function drawSpeedTag(b) {
  const tag = TL.speedTag(b); if (!tag) return;
  const [label, cn] = tag, acc = colorOf(cn);
  ctx.font = `16px ${FONT.ps}`; const w = ctx.measureText(label).width + 52, x = W - w - 28, y = 30;
  ctx.fillStyle = COL.ink; ctx.fillRect(x, y, w, 40); ctx.strokeStyle = acc; ctx.lineWidth = 4; ctx.strokeRect(x + 2, y + 2, w - 4, 36);
  if ((b % 1) < 0.5) { ctx.fillStyle = acc; ctx.fillRect(x + 14, y + 14, 12, 12); }
  ctx.fillStyle = acc; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 36, y + 22);
}

const lastBefore = (list, b) => { let r = -99; for (const x of list) if (x <= b) r = x; return r; };
// ---------- captions with badges ----------
function drawCaption(cap, b) {
  let y = 92;
  cap.lines.forEach((ln) => {
    const lt = (b - cap.t0 - ln.d) * TL.B, outT = (cap.t1 - b) * TL.B;
    const font = ln.font === 'silk' ? FONT.silk : FONT.ps, size = ln.size, padX = 16, padY = ln.font === 'silk' ? 10 : 14, h = size + padY * 2;
    if (lt < 0) { y += h + 12; return; }
    const shown = ln.text.slice(0, Math.min(ln.text.length, Math.floor(lt * 34) + 1));
    const badgeW = ln.badge ? textW(ln.badge, 24, FONT.ps) + 28 : 0;
    const w = textW(ln.text, size, font) + padX * 2 + 6 + badgeW;
    const pop = Math.min(1, lt / 0.1), fade = Math.min(1, outT / 0.12), acc = colorOf(ln.color);
    drawBox(40, y, w * pop * fade, h, acc);
    if (pop >= 1 && fade >= 1) {
      let tx = 40 + 6 + padX;
      if (ln.badge) { ctx.fillStyle = acc; ctx.fillRect(tx, y + h / 2 - 20, badgeW - 12, 40); ctx.font = `24px ${FONT.ps}`; ctx.fillStyle = COL.ink; ctx.textBaseline = 'middle'; ctx.fillText(ln.badge, tx + 8, y + h / 2 + 2); tx += badgeW; }
      ctx.font = `${size}px ${font}`; ctx.fillStyle = ln.color === 'cream' ? COL.cream : acc; ctx.textBaseline = 'middle'; ctx.fillText(shown, tx, y + h / 2 + (font === FONT.ps ? 3 : 1));
    }
    y += h + 12;
  });
}
function arrow(x0, y0, x1, y1, color, wd = 6) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0); ctx.beginPath(); ctx.moveTo(x1 + Math.cos(a) * 12, y1 + Math.sin(a) * 12); ctx.lineTo(x1 + Math.cos(a + 2.4) * 16, y1 + Math.sin(a + 2.4) * 16); ctx.lineTo(x1 + Math.cos(a - 2.4) * 16, y1 + Math.sin(a - 2.4) * 16); ctx.fill();
}


// ---------- shots ----------
const V = (a) => new THREE.Vector3(...a);
const HOOK = {
  heroLow: [[9, 6, 22], [7, 6.5, 21], [0, 12, 0]],
  bladeMacro: [[4, 22, 13], [3, 21.8, 12.4], [0, 19.1, 1.6]],
  xrayMotor: [[5.5, 11, 9.5], [4.5, 11.5, 10], [0, 11, 0]],
  camMacro: [[5.2, 17.2, 7.4], [4.5, 17.3, 7.8], [0, 15.4, 0.6]],
  topDown: [[0.6, 28, 7.5], [-0.6, 28, 7.2], [0, 19, 1.4]],
  plate: [[-4.5, 9, 8], [-3.8, 10, 8.4], [0, 9.8, 1.4]],
  wide: [[-26, 16, 48], [-22, 16, 47], [0, 13, 0]],
  bladeSide: [[13, 21.5, 7], [12.2, 21.6, 8.2], [0, 18.6, 1.4]],
};
const SHOTS = [ // [b0, b1, pos0, pos1, tgt0, tgt1]
  [8, 12, [15, 16, 34], [-12, 15, 34], [0, 12, 0], [0, 12, 0]],
  [12, 16, [-12, 15, 34], [-9, 13.5, 26], [0, 12, 0], [0, 12.5, 0]],
  [16, 20, [4.5, 23, 15], [3.5, 22.6, 14], [0, 19.0, 1.6], [0, 19.0, 1.6]],
  [20, 24, [12, 13.5, 21], [11, 13.5, 20], [0, 12.6, 0.4], [0, 12.6, 0.4]],
  [24, 32, [7, 13, 11], [6, 13.3, 10.4], [0, 11.6, 0], [0, 11.8, 0]],
  [32, 40, [6.5, 17.6, 8.6], [5.8, 17.4, 8.1], [0, 15.5, 0.6], [0, 15.5, 0.6]],
  [40, 48, [4, 23.5, 15], [3.2, 23.2, 14.2], [0, 18.9, 1.6], [0, 18.9, 1.6]],
  [48, 56, [1.5, 21.5, 11], [1.0, 21.2, 10.2], [0, 19.3, 1.6], [0, 19.3, 1.6]],
  [56, 64, [7, 17.6, 10], [6.4, 17.2, 9.5], [0, 15.3, 0.6], [0, 15.3, 0.6]],
  [64, 72, [-4.2, 23, 15], [-3.2, 22.6, 14], [0, 19.0, 1.6], [0, 19.0, 1.6]],
  [72, 80, [14, 10, 30], [-10, 11, 30], [0, 12.5, 0], [0, 12.5, 0]],
  [80, 89, [-8, 15, 38], [2, 17, 50], [0, 14, 0], [0, 15, 0]],
];
function camAt(b) {
  if (b < 8) { const [p0, p1, tg] = HOOK[TL.HOOK_SHOTS[Math.floor(b)]]; const u = b - Math.floor(b); return { pos: V(p0).lerp(V(p1), u), tgt: V(tg) }; }
  const s = SHOTS.find((x) => b >= x[0] && b < x[1]) || SHOTS[SHOTS.length - 1];
  const u = TL.ease((b - s[0]) / (s[1] - s[0]));
  return { pos: V(s[2]).lerp(V(s[3]), u), tgt: V(s[4]).lerp(V(s[5]), u) };
}
const hookShot = (b) => (b < 8 ? TL.HOOK_SHOTS[Math.floor(b)] : null);
function hairOn(b) { const h = hookShot(b); if (h) return h === 'bladeMacro' || h === 'bladeSide' || h === 'topDown'; return (b >= 16 && b < 20) || (b >= 48 && b < 56) || (b >= 64 && b < 72); }
const hash = (n) => { const h = Math.sin(n * 127.1 + 311.7) * 43758.5453; return h - Math.floor(h); };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), s4 = new THREE.Vector3(1, 1, 1), p4 = new THREE.Vector3();
function setPiece(i, x, y, z, rx, rz) { e4.set(rx, 0, rz); q4.setFromEuler(e4); p4.set(x, y, z); m4.compose(p4, q4, s4); K.pieces.setMatrixAt(i, m4); }
const W2 = (x, y, z) => clip.localToWorld(new THREE.Vector3(x, y, z));

window.renderFrame = function (t) {
  const b = t / TL.B, frame = Math.round(t * 30), real = TL.isReal(b);
  const { pos, tgt } = camAt(b);
  // clipper pose
  clip.rotation.y = b >= 8 && b < 12 ? -0.5 + 1.0 * TL.ease((b - 8) / 4) : b >= 72 && b < 89 ? 0.25 * Math.sin((b - 72) * 0.2) : 0;
  clip.position.set(real ? Math.sin(t * 900) * 0.012 : 0, PED_H + (real ? Math.cos(t * 1100) * 0.008 : 0), 0);
  // motor -> pin -> fork -> moving blade
  const th = TL.motorAngle(b, frame), cx = ECC * Math.sin(th);
  K.rotor.rotation.y = th; K.cam.rotation.y = th; K.fork.position.x = cx; K.cutter.position.x = cx;
  // x-ray
  const xr = TL.xray(b);
  bodyMats.forEach((m) => { m.opacity = 1 - 0.8 * xr; m.depthWrite = xr < 0.5; });
  inner.visible = xr > 0.02; K.edges.visible = xr > 0.02; K.edges.material.opacity = xr;
  const fx = Math.max(0.55 * xr, b >= 40.5 && b < 48 ? 0.45 * TL.ease((b - 40.5) / 1) : 0); fixM.opacity = 1 - fx; fixM.depthWrite = fx < 0.3;
  // hair
  const hon = hairOn(b); let np = 0;
  let yEnd = 15.0;
  if (b >= 48 && b < 56) { const lc = TL.CUTS.filter((c) => c <= b).pop(); if (lc === undefined) yEnd = 17.2 - (17.2 - 14.85) * TL.clamp01((b - 48) / 2); else yEnd = 15.25 - 0.4 * TL.clamp01((b - lc) / 2); }
  else if (real) yEnd = 14.9 + 0.35 * hash(frame);
  K.hairs.forEach((h, i) => { h.visible = hon; const len = 7; h.scale.y = len; h.position.set(HAIR_X[i] + h.userData.tilt * 3, yEnd + len / 2, Z_HAIR); h.rotation.z = h.userData.tilt; });
  if (hon && b >= 48 && b < 56) {
    TL.CUTS.forEach((c) => { const age = (b - c) * TL.B; if (age < 0 || age > 1.4) return;
      HAIR_X.forEach((x, i) => { if (np >= NP) return; const r = hash(i * 7 + c), r2 = hash(i * 3 + c * 5);
        setPiece(np++, x + (r - 0.5) * 1.2 * age, 15.05 - 2.2 * age * age - 0.3 * age, Z_HAIR + 0.9 * age * (0.5 + r2), age * (2 + 3 * r), age * (r2 - 0.5) * 5); }); });
  } else if (hon) {
    for (let k = 0; k < 40; k++) { const life = 0.55, ph = (t / life + hash(k)) % 1, cyc = Math.floor(t / life + hash(k)); const age = ph * life, r = hash(k * 13 + cyc), r2 = hash(k * 7 + cyc * 3);
      const x0 = HAIR_X[Math.floor(r * HAIR_X.length)];
      setPiece(np++, x0 + (r2 - 0.5) * 5 * age, 15.0 - 30 * age * age, Z_HAIR + (1 + 5 * r2) * age, age * 18 * r, age * 14 * (r2 - 0.5)); }
  }
  K.pieces.count = np; K.pieces.instanceMatrix.needsUpdate = true;
  // crown
  const showCrown = b >= 76;
  K.crown.visible = showCrown;
  if (showCrown) { const u = TL.clamp01((b - 76) / 4), drop = (1 - u * u) * 14; const land = b >= 80 ? Math.exp(-(b - 80) * TL.B * 7) * Math.sin((b - 80) * TL.B * 30) * 0.25 : 0;
    const top = W2(0, 15.3, 0.5); K.crown.position.set(top.x, top.y + 0.2 + drop + land, top.z); K.crown.rotation.set(0.12, clip.rotation.y + (1 - u) * 3, 0); }

  // camera
  const sb = (b % 1) * TL.B, sbar = (b % 4) * TL.B;
  const shake = real && b >= 8 ? 0.012 * pos.distanceTo(tgt) * 0.05 : 0;
  pos.x += Math.sin(t * 71) * shake; pos.y += Math.cos(t * 59) * shake;
  camera.position.copy(pos); camera.lookAt(tgt);
  camera.near = 0.1; camera.far = 400;
  camera.fov = 35 - (b >= 8 ? 1.2 * Math.exp(-sbar * 7) : 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  wallMats.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(1 + (b >= 8 ? 0.5 * Math.exp(-sb * 10) : 0)));
  const dist = pos.distanceTo(tgt), sz = Math.max(6, Math.min(30, dist * 0.75));
  sun.target.position.copy(tgt); sun.position.copy(tgt).add(new THREE.Vector3(14, 26, 20));
  Object.assign(sun.shadow.camera, { left: -sz, right: sz, top: sz, bottom: -sz, near: 1, far: 120 }); sun.shadow.camera.updateProjectionMatrix();
  bangLight.position.copy(W2(0, 15.5, 3));
  const lastCut = lastBefore(TL.CUTS, b), cutAge = (b - lastCut) * TL.B, flash = b >= 48 && b < 56.5 && cutAge < 0.2 ? 1 - cutAge / 0.2 : (b >= 80 && b < 80.6 ? 1 - (b - 80) / 0.6 : 0);
  bangLight.intensity = flash * 3;
  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  if (flash > 0.01) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,220,140,${flash * 0.12})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  dither();

  // overlays
  drawSpeedTag(b);
  TL.CAPTIONS.filter((c) => b >= c.t0 && b < c.t1).forEach((c) => drawCaption(c, b));
  const P = (x, y, z) => project(W2(x, y, z));
  const pinP = P(ECC * Math.sin(th), Y_PIN + 0.3, ECC * Math.cos(th));
  const anchors = {
    motor: P(-1.3, 6.2, 0), blades: P(1.9, 15.2, Z_FIX), motorC: P(-1.25, 8.0, 0.4), pin: pinP, pin2: pinP,
    fork: P(cx + 0.25, Y_PIN + 0.5, 0.9), cutter: P(cx - 1.6, 14.9, Z_CUT), fixed: P(1.4, 14.2, Z_FIX + 0.06),
  };
  TL.LABELS.forEach((lb) => drawLabel(lb, anchors[lb.id], b));
  // pin path (circle) + arrows
  if (b >= 24 && b < 40 || b >= 56 && b < 60) {
    ctx.strokeStyle = COL.pink; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath();
    for (let k = 0; k <= 48; k++) { const a = k / 48 * Math.PI * 2, p = P(ECC * Math.sin(a), Y_PIN + 0.3, ECC * Math.cos(a)); k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  if (b >= 32 && b < 48) {
    const v = Math.cos(th), a = b < 40 ? P(cx, Y_PIN + 1.1, 1.0) : P(cx, 13.0, Z_FIX + 0.3), len = 70 * Math.sign(v) * Math.min(1, Math.abs(v) * 3);
    if (Math.abs(len) > 10) arrow(a.x - len * 0.2, a.y, a.x + len, a.y, b < 40 ? COL.mint : COL.cyan, 7);
  }
  if (b >= 48 && b < 56) TL.CUTS.forEach((c) => drawPop('SNIP!', P(0.6, 13.6, Z_FIX + 0.2), (b - c) * TL.B, COL.yellow));
  // stroke counter
  if (b >= 56 && b < 64) {
    let turns, strokes;
    if (b < 60) { strokes = TL.STROKES.filter((s) => s > 56 && s <= b + 1e-6).length; turns = strokes / 2; }
    else { const u = TL.ease((b - 60.5) / 2.5); turns = Math.round(2 + (6800 - 2) * u); strokes = turns * 2; }
    const y0 = H - 260; ctx.fillStyle = 'rgba(18,13,34,0.88)'; ctx.fillRect(40, y0, W - 80, 150);
    ctx.font = `20px ${FONT.ps}`; ctx.textBaseline = 'top'; ctx.fillStyle = COL.amber; ctx.fillText('TURNS', 70, y0 + 24); ctx.fillStyle = COL.cyan; ctx.fillText('STROKES', 390, y0 + 24);
    const fmt = (v) => (Math.abs(v - Math.round(v)) < 0.01 ? Math.round(v).toLocaleString('en-US') : v.toFixed(1));
    ctx.font = `36px ${FONT.ps}`; ctx.fillStyle = COL.cream; ctx.fillText(fmt(turns), 70, y0 + 66); ctx.fillText(fmt(strokes), 390, y0 + 66);
    if (b >= 60) { ctx.font = `16px ${FONT.silk}`; ctx.fillStyle = COL.pink; ctx.font = `20px ${FONT.silk}`; ctx.fillText('PER MINUTE', 70, y0 + 118); }
    ctx.textBaseline = 'middle';
  }
  // buzz oscilloscope
  if (b >= 64.5 && b < 72) {
    const y0 = H - 250, k = TL.ease((b - 64.5) / 0.5); ctx.fillStyle = 'rgba(18,13,34,0.88)'; ctx.fillRect(40, y0, W - 80, 140);
    ctx.strokeStyle = COL.pink; ctx.lineWidth = 4; ctx.beginPath();
    for (let x = 0; x <= W - 120; x += 3) { const yy = y0 + 70 + Math.sin(x * 0.09 - t * 30) * 42 * k; x ? ctx.lineTo(60 + x, yy) : ctx.moveTo(60 + x, yy); }
    ctx.stroke(); ctx.font = `20px ${FONT.ps}`; ctx.fillStyle = COL.cream; ctx.textBaseline = 'top'; ctx.fillText('227 / SEC', W - 280, y0 + 10); ctx.textBaseline = 'middle';
  }
  drawHandle();
  return out.toDataURL('image/jpeg', 0.92);
};
window.ready = Promise.resolve(true);
