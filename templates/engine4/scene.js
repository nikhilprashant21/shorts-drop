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


// ================= 4-STROKE ENGINE TOPIC (units: cm) =================
scene.background = new THREE.Color(0x1a1830); scene.fog = new THREE.Fog(0x1a1830, 160, 420);
// ---------- garage: epoxy floor, branded wall, plate, props ----------
{
  const ft = textTexture(256, 256, (g, w, h) => { g.fillStyle = '#5d6478'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${200 + Math.random() * 55},${200 + Math.random() * 55},255,${Math.random() * 0.12})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); });
  ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(10, 10);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 400), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.35, metalness: 0.05 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 60); floor.receiveShadow = true; scene.add(floor);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(500, 4), new THREE.MeshStandardMaterial({ color: 0xffb636, roughness: 0.5 })); stripe.rotation.x = -Math.PI / 2; stripe.position.set(0, 0.05, 40); scene.add(stripe);
  const wt = textTexture(1024, 512, (g, w, h) => {
    g.fillStyle = '#2b2d4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#33365a'; for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 32; x < w; x += 64) g.fillRect(x, y, 60, 28);
    g.font = '64px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#120d22'; g.fillText('ENGINEERS', w / 2 + 6, 150 + 6); g.fillText('WITHOUT SLEEP', w / 2 + 6, 250 + 6);
    g.fillStyle = '#ffb636'; g.fillText('ENGINEERS', w / 2, 150); g.fillStyle = '#ff4d7a'; g.fillText('WITHOUT SLEEP', w / 2, 250);
  });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(320, 160), new THREE.MeshBasicMaterial({ map: wt })); wall.position.set(0, 80, -80); scene.add(wall); wall.userData.wall = 1;
  const side = new THREE.Mesh(new THREE.PlaneGeometry(500, 160), new THREE.MeshBasicMaterial({ color: 0x23253f })); side.position.set(0, 80, -80.5); scene.add(side); side.userData.wall = 1;
  // number plate on the wall
  const pt = textTexture(256, 64, (g, w, h) => { g.fillStyle = '#ffd84a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#120d22'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); g.font = '28px PS2P'; g.fillStyle = '#120d22'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NOSLEEP', w / 2, h / 2 + 2); });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(26, 6.5), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.4 })); plate.position.set(62, 38, -79.5); scene.add(plate);
  // props: tyre stack, oil cans, cone
  const tyreM = toon(0x1c1c22, { roughness: 0.8 });
  for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(13, 5.5, 12, 32), tyreM); t.rotation.x = Math.PI / 2; t.position.set(-70, 5.5 + i * 11, -40); t.castShadow = true; scene.add(t); }
  [[48, -30, 0xe0313b], [58, -26, 0x3d7bff], [53, -40, 0xffb636]].forEach(([x, z, c]) => { const m = cyl(5, 14, toon(c, { metalness: 0.4, roughness: 0.4 }), 20, scene); m.position.set(x, 7, z); m.castShadow = true; });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(6, 20, 20), toon(0xff7a2f)); cone.position.set(-40, 10, 20); cone.castShadow = true; scene.add(cone);
}
const wallMats = []; scene.traverse((o) => { if (o.userData.wall) { o.material.userData.base = o.material.color.clone(); wallMats.push(o.material); } });

// ---------- engine (local: crank centre at origin, crank axis = z, cut plane z = 0, front = +z) ----------
const ENG_Y = 24;
const eng = new THREE.Group(); eng.position.set(0, ENG_Y, 0); scene.add(eng);
const CR = 4.3, ROD = 14.5, BORE = 4.3, ROOF = 23.25, HEAD_TOP = 30.5, CAM_Y = 31.6, VX = 2.8, VZ = -1.2, LIFT = 0.9;
const E = {};
const paint = toon(0x8a90a6, { metalness: 0.55, roughness: 0.4 }), dark = toon(0x2a2c3c, { roughness: 0.6 });
const steel = toon(0xd8dbe6, { metalness: 0.8, roughness: 0.25 });
const hatchTex = (w, h, holes) => textTexture(Math.round(w * 24), Math.round(h * 24), (g, cw, ch) => {
  g.fillStyle = '#b8406a'; g.fillRect(0, 0, cw, ch); g.strokeStyle = '#5e1d3f'; g.lineWidth = 6;
  for (let i = -ch; i < cw + ch; i += 14) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + ch, ch); g.stroke(); }
  if (holes) { g.globalCompositeOperation = 'destination-out'; holes(g, (x) => x * 24, (y) => ch - y * 24); g.globalCompositeOperation = 'source-over'; }
});
const face = (w, h, x0, y0, holes) => { // hatch cut face with bottom-left corner at (x0, y0) on z = 0
  const t = hatchTex(w, h, holes); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: !!holes, alphaTest: 0.5 }));
  m.position.set(x0 + w / 2, y0 + h / 2, 0.02); eng.add(m); return m;
};
const backBox = (w, h, d, x, y, zBack, mat = paint) => box(w, h, d, mat, x, y, zBack + d / 2, eng);
{
  // cylinder block: side walls + bore (back half)
  [-1, 1].forEach((sd) => { backBox(2.4, 15.25, 5.5, sd * (BORE + 1.2), 15.625, -5.5); face(2.4, 15.25, sd > 0 ? BORE : -BORE - 2.4, 8); });
  backBox(11, 15.25, 0.8, 0, 15.625, -6.3);
  const bore = new THREE.Mesh(new THREE.CylinderGeometry(BORE, BORE, 15.25, 32, 1, true, Math.PI / 2, Math.PI), toon(0xaeb6c8, { metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide })); bore.position.y = 15.625; eng.add(bore);
  // crankcase + oil pan
  [-1, 1].forEach((sd) => { backBox(2, 15, 5.5, sd * 7.5, 0.5, -5.5); face(2, 15, sd > 0 ? 6.5 : -8.5, -7); });
  backBox(17, 15, 0.8, 0, 0.5, -6.3, dark);
  backBox(17, 2.5, 5.5, 0, -8.25, -5.5, toon(0x3a3d52)); face(17, 2.5, -8.5, -9.5);
  // cylinder head: hatch face with port / stem / plug holes, dark box behind
  const HW = 14, HH = HEAD_TOP - ROOF;
  face(HW, HH, -7, ROOF, (g, X, Y) => {
    const port = (sd) => { g.lineCap = 'round'; g.lineWidth = 2.3 * 24; g.beginPath(); g.moveTo(X(7 + sd * 7.2), Y(5.6)); g.quadraticCurveTo(X(7 + sd * 4.4), Y(5.0), X(7 + sd * VX), Y(0.6)); g.stroke(); g.fillRect(X(7 + sd * VX - 1.5), Y(1.1), 3 * 24, 1.1 * 24); };
    port(-1); port(1);
    [-VX, VX].forEach((x) => { g.fillRect(X(7 + x - 0.45), Y(HH), 0.9 * 24, HH * 24); g.fillRect(X(7 + x - 1.05), Y(HH), 2.1 * 24, 1.3 * 24); });
    g.fillRect(X(7 - 0.75), Y(HH), 1.5 * 24, HH * 24);
  });
  backBox(HW, HH, 2.9, 0, ROOF + HH / 2, -5.5, dark);
  backBox(HW, HH, 0.4, 0, ROOF + HH / 2, -2.6, toon(0x14121f));
  // cam cover: back half shell, top plate carries the brand
  const red = toon(0xc81e3a, { roughness: 0.75, metalness: 0.2 });
  backBox(14.4, 0.6, 5.7, 0, 34.9, -5.7, red); backBox(14.4, 4.4, 0.6, 0, 32.7, -5.7, red);
  [-1, 1].forEach((sd) => { backBox(0.6, 4.4, 5.7, sd * 6.9, 32.7, -5.7, red); });
  const ct = textTexture(512, 192, (g, w, h) => { g.fillStyle = '#c81e3a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.font = '30px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#5a0a18'; g.fillText('ENGINEERS', w / 2 + 3, 62 + 3); g.fillText('WITHOUT SLEEP', w / 2 + 3, 124 + 3); g.fillStyle = '#e8ecf4'; g.fillText('ENGINEERS', w / 2, 62); g.fillText('WITHOUT SLEEP', w / 2, 124); });
  const ctop = new THREE.Mesh(new THREE.PlaneGeometry(13.6, 5.1), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.6, metalness: 0.2 })); ctop.rotation.x = -Math.PI / 2; ctop.position.set(0, 35.21, -2.85); eng.add(ctop);
  // engine stand
  const stand = toon(0xe0313b, { metalness: 0.3, roughness: 0.45 });
  box(4, ENG_Y - 9.5, 4, stand, 0, -9.5 - (ENG_Y - 9.5) / 2, -3, eng); box(30, 2, 4, stand, 0, -ENG_Y + 1, -3, eng); box(4, 2, 30, stand, 0, -ENG_Y + 1, -3, eng);
}
// moving parts
E.crank = new THREE.Group(); eng.add(E.crank);
{
  const j = cyl(1.4, 9, steel, 20, E.crank); j.rotation.x = Math.PI / 2; j.position.z = -2;
  [-1.5, 1.5].forEach((z) => { box(3.4, 8.2, 0.8, toon(0x9aa3b5, { metalness: 0.7 }), 0, 0.8, z - 1.2, E.crank); const cw = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.8, 24, 1, false, Math.PI / 2, Math.PI), toon(0x7d8599, { metalness: 0.7 })); cw.rotation.x = Math.PI / 2; cw.position.set(0, -0.6, z - 1.2); E.crank.add(cw); });
  const pin = cyl(1.1, 3.0, steel, 16, E.crank); pin.rotation.x = Math.PI / 2; pin.position.set(0, CR, -1.2);
  box(0.3, 3.0, 0.3, toon(0xff4d7a), 0, -2.5, 0.05, E.crank);
}
E.rod = new THREE.Group(); eng.add(E.rod);
{ const rm = toon(0xffb636, { metalness: 0.5, roughness: 0.35 }); box(1.3, ROD, 0.9, rm, 0, 0, -1.2, E.rod); const be = cyl(1.7, 1.2, rm, 20, E.rod); be.rotation.x = Math.PI / 2; be.position.set(0, -ROD / 2, -1.2); const se = cyl(0.9, 1.2, rm, 16, E.rod); se.rotation.x = Math.PI / 2; se.position.set(0, ROD / 2, -1.2); }
E.piston = new THREE.Group(); eng.add(E.piston);
{
  const pm = toon(0xd8dbe6, { metalness: 0.6, roughness: 0.3 });
  const half = new THREE.Mesh(new THREE.CylinderGeometry(BORE - 0.06, BORE - 0.06, 6, 32, 1, false, Math.PI / 2, Math.PI), pm); half.position.y = 0.5; E.piston.add(half);
  const st = textTexture(128, 96, (g, w, h) => { g.fillStyle = '#c9ccd8'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5f74'; [8, 18, 28].forEach((y) => g.fillRect(0, y, w, 5)); g.fillStyle = '#9aa0b4'; g.fillRect(54, 40, 20, 56); g.beginPath(); g.arc(64, 56, 9, 0, Math.PI * 2); g.fillStyle = '#2a2c3c'; g.fill(); });
  const pf = new THREE.Mesh(new THREE.PlaneGeometry((BORE - 0.06) * 2, 6), new THREE.MeshBasicMaterial({ map: st })); pf.position.set(0, 0.5, 0.01); E.piston.add(pf);
}
// valves (stem + head + tappet), cams, spark plug
const mkValve = (x, col) => { const g = new THREE.Group(); g.position.set(x, 0, VZ); eng.add(g); const vm = toon(col, { metalness: 0.6, roughness: 0.3 });
  const hd = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 0.5, 0.45, 24), vm); hd.position.y = ROOF + 0.22; g.add(hd);
  const stem = cyl(0.22, 6.4, vm, 10, g); stem.position.y = ROOF + 3.4;
  const tap = cyl(0.95, 0.9, steel, 20, g); tap.position.y = HEAD_TOP - 0.45; return g; };
E.vIn = mkValve(-VX, 0x4fe0ff); E.vEx = mkValve(VX, 0x43e8b0);
const camShape = (() => { const s = new THREE.Shape(); const N = 48; for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2; const d = Math.cos(a); const r = 1.1 + LIFT * Math.max(0, (d - Math.cos(Math.PI * 0.30)) / (1 - Math.cos(Math.PI * 0.30))) ** 1.5; const px = Math.sin(a) * r, py = -Math.cos(a) * r; i ? s.lineTo(px, py) : s.moveTo(px, py); } return s; })();
const mkCam = (x, col) => { const g = new THREE.Group(); g.position.set(x, CAM_Y, 0); eng.add(g);
  const lobe = new THREE.Mesh(new THREE.ExtrudeGeometry(camShape, { depth: 1.2, bevelEnabled: false, curveSegments: 4 }), toon(col, { metalness: 0.6, roughness: 0.3 })); lobe.position.z = VZ - 0.6; g.add(lobe);
  const sh = cyl(0.55, 5.5, steel, 14, g); sh.rotation.x = Math.PI / 2; sh.position.z = -3; return g; };
E.camIn = mkCam(-VX, 0x4fe0ff); E.camEx = mkCam(VX, 0x43e8b0);
{
  const plug = new THREE.Group(); plug.position.set(0, 0, -0.95); eng.add(plug);
  const p1 = cyl(0.5, 3.0, steel, 12, plug); p1.position.y = ROOF + 1.5;
  const hx = cyl(0.8, 1.0, toon(0x9aa3b5, { metalness: 0.7 }), 6, plug); hx.position.y = ROOF + 3.5;
  const cer = cyl(0.48, 5.5, toon(0xf4f1ea, { roughness: 0.2 }), 14, plug); cer.position.y = ROOF + 6.75;
  const coil = cyl(0.9, 3, toon(0x1c1c22), 14, plug); coil.position.y = ROOF + 11;
  E.sparkGlow = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); E.sparkGlow.position.set(0, ROOF - 0.1, -0.95); eng.add(E.sparkGlow);
}
// gas in the cylinder (cut plane colour slab)
E.gas = new THREE.Mesh(new THREE.PlaneGeometry(BORE * 2 - 0.1, 1), new THREE.MeshBasicMaterial({ color: 0x4fe0ff, transparent: true, opacity: 0.4, depthWrite: false })); E.gas.position.z = -0.3; E.gas.renderOrder = 3; eng.add(E.gas);
// timing belt at the back (z = -7): crank pulley r 1.3, cam pulleys r 2.6 (2:1)
const BZ = -7.4, CP = 1.3, MP = 2.6;
{
  const pm = toon(0xb8c0d2, { metalness: 0.7, roughness: 0.3 });
  const mk = (r, x, y, col) => { const g = new THREE.Group(); g.position.set(x, y, BZ); eng.add(g); const d = cyl(r, 1.0, pm, 32, g); d.rotation.x = Math.PI / 2; const mark = new THREE.Mesh(new THREE.SphereGeometry(r * 0.22, 10, 8), toon(col, { emissive: col, emissiveIntensity: 0.4 })); mark.position.set(0, r * 0.72, -0.55); g.add(mark); const hub = cyl(r * 0.3, 1.3, toon(0x2a2c3c), 12, g); hub.rotation.x = Math.PI / 2; return g; };
  E.pCrank = mk(CP, 0, 0, 0xffb636); E.pCamIn = mk(MP, -VX, CAM_Y, 0x4fe0ff); E.pCamEx = mk(MP, VX, CAM_Y, 0x43e8b0);
  const pts = []; const arc = (cx, cy, r, a0, a1, n) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push(new THREE.Vector3(cx + Math.cos(a) * (r + 0.15), cy + Math.sin(a) * (r + 0.15), BZ)); } };
  arc(0, 0, CP, 0, -Math.PI, 10); arc(-VX, CAM_Y, MP, Math.PI, Math.PI / 2, 8); arc(VX, CAM_Y, MP, Math.PI / 2, 0, 8);
  const belt = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.18, 6, true), toon(0x1c1c22, { roughness: 0.7 })); belt.scale.z = 1; eng.add(belt);
}
eng.traverse((o) => { if (o.isMesh && o !== E.gas && o !== E.sparkGlow) { o.castShadow = true; o.receiveShadow = true; } });
// kinematics
function pistonPinY(phDeg) { const a = phDeg * Math.PI / 180, s = CR * Math.sin(a); return CR * Math.cos(a) + Math.sqrt(ROD * ROD - s * s); }
const liftAt = (c, open, dur) => { let u = ((c - open) % 720 + 720) % 720; return u < dur ? LIFT * Math.sin(Math.PI * u / dur) ** 2 : 0; };
const IN_OPEN_DEG = -10, EX_OPEN_DEG = 520, VDUR = 230;
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
  wide: [[-70, 45, 110], [-60, 44, 105], [0, 34, 0]],
  pistonClose: [[7, 42, 24], [6, 41, 23], [0, 41, 0]],
  sparkClose: [[8, 54, 26], [6.5, 53.5, 25], [0, 50, 0]],
  valvesClose: [[-9, 58, 28], [-7.5, 57.5, 27], [0, 54, -1]],
  crankClose: [[11, 27, 26], [10, 28, 24], [0, 24.5, 0]],
  beltBack: [[26, 48, -84], [21, 47, -80], [0, 46, -7]],
  coverTop: [[3, 80, 26], [-3, 80, 25], [0, 59, -2.8]],
  side3q: [[44, 44, 48], [40, 46, 46], [0, 36, 0]],
};
const SHOTS = [ // [b0, b1, pos0, pos1, tgt0, tgt1]
  [8, 16, [60, 52, 125], [26, 42, 66], [0, 34, 0], [0, 37, 0]],
  [16, 24, [-15, 51, 53], [-12, 50, 50], [-1, 48.5, 0], [-1, 48.5, 0]],
  [24, 32, [10, 49, 52], [7, 51, 48], [0, 48.5, 0], [0, 49, 0]],
  [32, 40, [0, 49, 50], [2, 47, 60], [0, 49, 0], [0, 48, 0]],
  [40, 48, [15, 51, 53], [12, 50, 50], [1, 48.5, 0], [1, 48.5, 0]],
  [48, 56, [34, 50, -98], [26, 49, -90], [0, 47, -7], [0, 47, -7]],
  [56, 64, [34, 44, 66], [26, 44, 58], [0, 34, 0], [0, 34, 0]],
  [64, 72, [8, 52, 44], [6, 51, 41], [0, 48, 0], [0, 48, 0]],
  [72, 81, [46, 34, 96], [-44, 38, 96], [0, 36, 0], [0, 36, 0]],
];
function camAt(b) {
  if (b < 8) { const [p0, p1, tg] = HOOK[TL.HOOK_SHOTS[Math.floor(b)]]; const u = b - Math.floor(b); return { pos: V(p0).lerp(V(p1), u), tgt: V(tg) }; }
  const s = SHOTS.find((x) => b >= x[0] && b < x[1]) || SHOTS[SHOTS.length - 1];
  const u = TL.ease((b - s[0]) / (s[1] - s[0]));
  return { pos: V(s[2]).lerp(V(s[3]), u), tgt: V(s[4]).lerp(V(s[5]), u) };
}
const W2 = (x, y, z) => eng.localToWorld(new THREE.Vector3(x, y, z));
const gasCol = new THREE.Color(), cA = new THREE.Color(), cB = new THREE.Color();
const hexMix = (a, b, u) => gasCol.copy(cA.set(a)).lerp(cB.set(b), TL.clamp01(u));
const bez = (p, s) => { const [a, b2, c, d] = p, u = 1 - s; return a.clone().multiplyScalar(u * u * u).add(b2.clone().multiplyScalar(3 * u * u * s)).add(c.clone().multiplyScalar(3 * u * s * s)).add(d.clone().multiplyScalar(s * s * s)); };

window.renderFrame = function (t) {
  const b = t / TL.B, frame = Math.round(t * 30), real = TL.isReal(b);
  const { pos, tgt } = camAt(b);
  const ph = TL.crankDeg(b, frame), c = ((ph % 720) + 720) % 720, a = ph * Math.PI / 180;
  // crank -> rod -> piston
  E.crank.rotation.z = -a;
  const px = CR * Math.sin(a), py = CR * Math.cos(a), yp = pistonPinY(ph);
  E.piston.position.y = yp; const crown = yp + 3.5;
  E.rod.position.set(px / 2, (py + yp) / 2, 0); E.rod.rotation.z = Math.atan2(px, yp - py);
  // valves + cams (cam = half crank speed)
  const lIn = liftAt(c, IN_OPEN_DEG, VDUR), lEx = liftAt(c, EX_OPEN_DEG, VDUR);
  E.vIn.position.y = -lIn; E.vEx.position.y = -lEx;
  const pkIn = IN_OPEN_DEG + VDUR / 2, pkEx = EX_OPEN_DEG + VDUR / 2;
  E.camIn.rotation.z = -(ph - pkIn) / 2 * Math.PI / 180; E.camEx.rotation.z = -(ph - pkEx) / 2 * Math.PI / 180;
  E.pCrank.rotation.z = -a; E.pCamIn.rotation.z = -a / 2; E.pCamEx.rotation.z = -a / 2;
  // gas slab colour by stroke
  let gOp = 0.4;
  if (c < 180) { hexMix('#2a8cff', '#4fe0ff', c / 180); gOp = 0.25 + 0.2 * c / 180; }
  else if (c < 350) { hexMix('#4fe0ff', '#9af0ff', (c - 180) / 170); gOp = 0.45 + 0.35 * (c - 180) / 170; }
  else if (c < 360) { gasCol.set('#ffffff'); gOp = 0.85; }
  else if (c < 540) { const u = (c - 360) / 180; hexMix(u < 0.3 ? '#fff2a0' : '#ff7a2f', u < 0.3 ? '#ff7a2f' : '#8a2030', u < 0.3 ? u / 0.3 : (u - 0.3) / 0.7); gOp = 0.9 - 0.35 * u; }
  else { hexMix('#7a5a50', '#4a4458', (c - 540) / 180); gOp = 0.5 - 0.3 * (c - 540) / 180; }
  E.gas.material.color.copy(gasCol); E.gas.material.opacity = gOp;
  E.gas.scale.y = Math.max(0.05, ROOF - crown); E.gas.position.y = (ROOF + crown) / 2;
  const sparkOn = c >= 346 && c < 362;
  E.sparkGlow.material.opacity = sparkOn ? 1 : 0; E.sparkGlow.scale.setScalar(sparkOn ? 1 + Math.random() * 0.6 : 1);
  eng.position.set(real ? Math.sin(t * 830) * 0.05 : 0, ENG_Y + (real ? Math.cos(t * 970) * 0.04 : 0), 0);

  // camera
  const sb = (b % 1) * TL.B, sbar = (b % 4) * TL.B;
  const shake = real && b >= 8 ? pos.distanceTo(tgt) * 0.0012 : 0;
  pos.x += Math.sin(t * 71) * shake; pos.y += Math.cos(t * 59) * shake;
  const bangs = b >= 56 && b < 64 ? TL.ALL_BANGS : TL.BANGS, lastB = lastBefore(bangs, b), bAge = (b - lastB) * TL.B;
  const bigBoom = Math.abs(lastB - 32) < 1e-6 && bAge < 0.6;
  if (bigBoom) { const k = Math.exp(-bAge * 8) * 0.35; pos.x += Math.sin(t * 90) * k; pos.y += Math.cos(t * 77) * k; }
  camera.position.copy(pos); camera.lookAt(tgt);
  camera.fov = 35 - (b >= 8 ? 1.2 * Math.exp(-sbar * 7) : 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  wallMats.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(1 + (b >= 8 ? 0.4 * Math.exp(-sb * 10) : 0)));
  const dist = pos.distanceTo(tgt), sz = Math.max(6, Math.min(30, dist * 0.75));
  sun.target.position.copy(tgt); sun.position.copy(tgt).add(new THREE.Vector3(30, 60, 45));
  Object.assign(sun.shadow.camera, { left: -sz, right: sz, top: sz, bottom: -sz, near: 1, far: 300 }); sun.shadow.camera.updateProjectionMatrix();
  // bang light + flash
  let flash = 0;
  if (real) flash = (c > 360 && c < 470) ? 0.35 * Math.random() : 0;
  else if (bAge < 0.35) flash = (bigBoom ? 1 : 0.5) * (1 - bAge / 0.35);
  bangLight.position.copy(W2(0, ROOF - 2, 3)); bangLight.distance = 40; bangLight.intensity = flash * 40 + (sparkOn ? 15 : 0);
  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  if (flash > 0.02) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,170,90,${flash * (bigBoom ? 0.35 : 0.12)})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  dither();

  // overlays
  const P = (x, y, z) => project(W2(x, y, z));
  // gas flow particles through the ports (driven by crank angle, so they stop when it slows)
  const inPath = [W2(-7, ROOF + 5.6, -1.4), W2(-4.6, ROOF + 4.8, -1.4), W2(-VX, ROOF + 1.6, -1.2), W2(-1.2, crown + 1.5, -0.6)];
  const exPath = [W2(1.2, crown + 1.5, -0.6), W2(VX, ROOF + 1.6, -1.2), W2(4.6, ROOF + 4.8, -1.4), W2(7.4, ROOF + 5.8, -1.4)];
  const flow = (path, lift, col) => { if (lift < 0.08 || b >= 48 && b < 56) return; const N = 16; ctx.fillStyle = col; ctx.globalAlpha = TL.clamp01(lift / LIFT * 1.5);
    for (let i = 0; i < N; i++) { const s = ((ph / 40 + i / N) % 1 + 1) % 1, q = project(bez(path, s)); const sz2 = 6; ctx.fillRect(Math.round(q.x - sz2 / 2), Math.round(q.y - sz2 / 2), sz2, sz2); } ctx.globalAlpha = 1; };
  flow(inPath, lIn, COL.cyan); flow(exPath, lEx, '#b7a8a0');
  const anchors = {
    piston: P(BORE, crown - 2, 0), spark: P(0.4, ROOF + 4, -0.6), valves: P(-VX - 0.8, ROOF + 0.4 - lIn, 0), crank: P(px, py, 0),
    inV: P(-VX - 1.2, ROOF + 0.3 - lIn, 0), mix: P(1.5, (ROOF + crown) / 2, 0), shut: P(VX + 1.2, ROOF + 0.3, 0), hot: P(2, (ROOF + crown) / 2, 0),
    exV: P(VX + 1.2, ROOF + 0.3 - lEx, 0), burnt: P(-1.5, (ROOF + crown) / 2, 0),
    crankP: P(-CP, 0, BZ - 0.6), camP: P(VX + MP, CAM_Y, BZ - 0.6),
  };
  TL.LABELS.forEach((lb) => drawLabel(lb, anchors[lb.id], b));
  // piston direction arrow in the step scenes
  if (b >= 16 && b < 48) { const goingDown = Math.sin(a) > 0.02, goingUp = Math.sin(a) < -0.02; if (goingDown || goingUp) { const q = P(-BORE - 1.2, crown - 3, 0); arrow(q.x, q.y + (goingDown ? -40 : 40), q.x, q.y + (goingDown ? 40 : -40), goingDown ? COL.cyan : COL.amber, 7); } }
  // pops
  if (!real) { const sp = lastBefore(TL.SPARKS, b); if (b >= 24 && b < 40) drawPop('ZAP', P(0, ROOF + 2.5, 0), (b - sp) * TL.B, COL.yellow, 24); }
  if (b >= 32 && b < 34) drawPop('BANG!', P(0, crown + 1, 0), (b - 32) * TL.B, COL.pink, 40);
  if (b >= 48 && b < 56 && bAge < 0.6) drawPop('BANG', P(0, ROOF, BZ), bAge, COL.pink, 28);
  // firing order panel (4 cylinders)
  if (b >= 56.5 && b < 64) {
    const y0 = H - 250, k = TL.ease((b - 56.5) / 0.5); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(40, y0, W - 80, 140);
    const offs = [0, 540, 180, 360]; // crank offset of cylinders 1..4 (fires 1-3-4-2)
    for (let i = 0; i < 4; i++) { const age = (((ph - 360 - offs[i]) % 720) + 720) % 720, on = age < 175, x = 80 + i * 145;
      ctx.fillStyle = on ? COL.orange : '#3a3d52'; ctx.fillRect(x, y0 + 30, 110, 80); if (on) { ctx.fillStyle = COL.yellow; ctx.fillRect(x + 8, y0 + 38, 94 * (1 - age / 175), 10); }
      ctx.font = `28px ${FONT.ps}`; ctx.fillStyle = on ? COL.ink : COL.cream; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), x + 55, y0 + 74); }
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }
  // 200 reversals counter
  if (b >= 67 && b < 72) {
    const y0 = H - 250, u = TL.ease((b - 67) / 2.5); ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(40, y0, W - 80, 140);
    ctx.font = `20px ${FONT.ps}`; ctx.textBaseline = 'top'; ctx.fillStyle = COL.amber; ctx.fillText('6,000 RPM = 100 TURNS/S', 64, y0 + 24);
    ctx.font = `36px ${FONT.ps}`; ctx.fillStyle = COL.pink; ctx.fillText(`${Math.round(200 * u)} STOPS/S`, 64, y0 + 74); ctx.textBaseline = 'middle';
  }
  drawSpeedTag(b);
  TL.CAPTIONS.filter((cp) => b >= cp.t0 && b < cp.t1).forEach((cp) => drawCaption(cp, b));
  drawHandle();
  return out.toDataURL('image/jpeg', 0.92);
};
window.ready = Promise.resolve(true);
