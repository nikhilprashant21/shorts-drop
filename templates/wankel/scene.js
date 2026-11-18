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


// ================= WANKEL ENGINE (units: cm). Standard coords inside `std`: major axis = x; group turned 90 deg so it stands upright =================
scene.background = new THREE.Color(0x1a1830); scene.fog = new THREE.Fog(0x1a1830, 160, 420);
const RR = 10.5, EE = 1.5, DEPTH = 8, ENG_Y = 34;
const eng = new THREE.Group(); eng.position.set(0, ENG_Y, 0); scene.add(eng);
const std = new THREE.Group(); std.rotation.z = Math.PI / 2; eng.add(std);
const R = {};
const troch = (a, off = 0) => { const x = EE * Math.cos(3 * a) + RR * Math.cos(a), y = EE * Math.sin(3 * a) + RR * Math.sin(a);
  if (!off) return [x, y]; const dx = -3 * EE * Math.sin(3 * a) - RR * Math.sin(a), dy = 3 * EE * Math.cos(3 * a) + RR * Math.cos(a), l = Math.hypot(dx, dy); return [x + dy / l * off, y - dx / l * off]; };
const D2R = Math.PI / 180;
const ANG = { in: 300, ex: 240, p1: 80, p2: 100 };
const alu = toon(0xb9bfcc, { metalness: 0.6, roughness: 0.38 });
{
  // rotor housing: rounded block with the epitrochoid bore
  const W2 = 14.2, H2 = 12.6, rr = 3.2;
  const outer = new THREE.Shape(); outer.moveTo(-W2 + rr, -H2); outer.lineTo(W2 - rr, -H2); outer.quadraticCurveTo(W2, -H2, W2, -H2 + rr); outer.lineTo(W2, H2 - rr); outer.quadraticCurveTo(W2, H2, W2 - rr, H2); outer.lineTo(-W2 + rr, H2); outer.quadraticCurveTo(-W2, H2, -W2, H2 - rr); outer.lineTo(-W2, -H2 + rr); outer.quadraticCurveTo(-W2, -H2, -W2 + rr, -H2);
  const hole = new THREE.Path(); for (let i = 0; i <= 180; i++) { const [x, y] = troch(-i / 180 * Math.PI * 2, -0.06); i ? hole.lineTo(x, y) : hole.moveTo(x, y); } outer.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(outer, { depth: DEPTH, bevelEnabled: false, curveSegments: 12 }); g.translate(0, 0, -DEPTH);
  // front face texture in shape coords: machined alu, coolant passages, bolt holes, port channels, cast lettering
  const PX = 20, tw = Math.round(2 * W2 * PX), th = Math.round(2 * H2 * PX);
  const tx = textTexture(tw, th, (c, w, h) => {
    const X = (x) => (x + W2) * PX, Y = (y) => (H2 - y) * PX;
    c.fillStyle = '#b9bfcc'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 1); }
    c.fillStyle = '#3a3e52';
    [[-12.4, -10.8], [12.4, -10.8], [-12.4, 10.8], [12.4, 10.8], [0, -11.4], [0, 11.4], [-7, -11.2], [7, -11.2], [-7, 11.2], [7, 11.2]].forEach(([x, y]) => { c.beginPath(); c.arc(X(x), Y(y), 0.45 * PX, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = '#5a6074'; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; const [x, y] = troch(a, 1.25); c.beginPath(); c.ellipse(X(x), Y(y), 0.5 * PX, 0.3 * PX, -a, 0, Math.PI * 2); c.fill(); }
    const chan = (deg, col) => { const a = deg * D2R; const [x0, y0] = troch(a, 0); const [x1, y1] = troch(a, 6); c.strokeStyle = col; c.lineWidth = 1.6 * PX; c.lineCap = 'butt'; c.beginPath(); c.moveTo(X(x0), Y(y0)); c.lineTo(X(x1), Y(y1)); c.stroke(); };
    chan(ANG.in, '#1c2a44'); chan(ANG.ex, '#2a1c1c');
    // cast lettering on the two wide bands (reads upright once the engine stands)
    c.save(); c.translate(X(0), Y(-10.75)); c.rotate(Math.PI / 2); c.font = `${Math.round(0.82 * PX)}px PS2P`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.restore();
    const band = (y, txt) => { c.save(); c.translate(X(0), Y(y)); c.font = `${Math.round(0.8 * PX)}px PS2P`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(70,76,96,0.55)'; c.fillText(txt, 1.5, 1.5); c.fillStyle = 'rgba(232,236,244,0.55)'; c.fillText(txt, 0, 0); c.restore(); };
    band(-10.9, 'ENGINEERS WITHOUT SLEEP'); band(10.9, 'EWS-13B  ROTOR HOUSING');
  });
  tx.repeat.set(1 / (2 * W2), 1 / (2 * H2)); tx.offset.set(0.5, 0.5); tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping;
  const faceM = toon(0xffffff, { map: tx, metalness: 0.5, roughness: 0.4 });
  R.housing = new THREE.Mesh(g, [faceM, alu]); R.housing.castShadow = true; R.housing.receiveShadow = true; std.add(R.housing);
  // inner running surface (chrome-ish band) and back side plate
  const inner = []; for (let i = 0; i <= 180; i++) { const [x, y] = troch(i / 180 * Math.PI * 2, -0.04); inner.push(new THREE.Vector2(x, y)); }
  const plate = box(2 * W2, 2 * H2, 1.2, toon(0x4a5068, { metalness: 0.5, roughness: 0.45 }), 0, 0, -DEPTH - 0.6, std); plate.receiveShadow = true;
  // fixed (stationary) gear on the side plate: 20 teeth, pitch radius 3.0
  const gearShape = (rp, n, inward) => { const s = new THREE.Shape(); const N = n * 4; for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, tooth = (i % 4 === 1 || i % 4 === 2) ? 1 : 0; const r = rp + (inward ? -1 : 1) * (tooth ? 0.32 : -0.32); i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return s; };
  const fg = new THREE.Mesh(new THREE.ExtrudeGeometry(gearShape(3.0, 20, false), { depth: 1.6, bevelEnabled: false }), toon(0x43e8b0, { metalness: 0.6, roughness: 0.3 })); fg.position.z = -DEPTH; std.add(fg); R.fixedGear = fg;
  // ports: intake runner + exhaust pipe sticking out of the housing
  const pipe = (deg, col, r) => { const a = deg * D2R; const [x0, y0] = troch(a, 3.2), [x1, y1] = troch(a, 14); const v0 = new THREE.Vector3(x0, y0, -DEPTH / 2), v1 = new THREE.Vector3(x1, y1, -DEPTH / 2);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, v0.distanceTo(v1), 16), toon(col, { metalness: 0.5, roughness: 0.45 })); m.position.copy(v0).lerp(v1, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v1.clone().sub(v0).normalize()); m.castShadow = true; std.add(m);
    const fl = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.7, r + 0.7, 0.6, 16), alu); fl.position.copy(v0); fl.quaternion.copy(m.quaternion); std.add(fl); };
  pipe(ANG.in, 0x3d5a8a, 1.5); pipe(ANG.ex, 0x8a4a3a, 1.7);
  // spark plugs (leading / trailing) on the far side
  R.sparks = [];
  [ANG.p1, ANG.p2].forEach((deg) => { const a = deg * D2R; const [x0, y0] = troch(a, 2.9), [x1, y1] = troch(a, 8.5); const v0 = new THREE.Vector3(x0, y0, -DEPTH / 2), v1 = new THREE.Vector3(x1, y1, -DEPTH / 2), up = v1.clone().sub(v0).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
    const hx = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.0, 6), toon(0x9aa3b5, { metalness: 0.7 })); hx.position.copy(v0).addScaledVector(up, 0.6); hx.quaternion.copy(q); std.add(hx);
    const cer = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4.2, 14), toon(0xf4f1ea, { roughness: 0.2 })); cer.position.copy(v0).addScaledVector(up, 3.2); cer.quaternion.copy(q); std.add(cer);
    const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.8, 14), toon(0x1c1c22)); boot.position.copy(v0).addScaledVector(up, 5.6); boot.quaternion.copy(q); std.add(boot);
    const [xi, yi] = troch(a, 0.25); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); gl.position.set(xi, yi, -DEPTH / 2); std.add(gl); R.sparks.push(gl); });
  // engine stand
  const stand = toon(0xe0313b, { metalness: 0.3, roughness: 0.45 });
  box(4, ENG_Y - 12, 4, stand, 0, -12 - (ENG_Y - 12) / 2, -DEPTH - 3, eng); box(4, 4, 2.4, stand, 0, -12.5, -DEPTH - 2.5, eng);
  box(30, 2, 4, stand, 0, -ENG_Y + 1, -DEPTH - 3, eng); box(4, 2, 30, stand, 0, -ENG_Y + 1, -DEPTH - 3, eng);
}
// rotor: three apexes at radius RR, flanks bulge 1.6, bore 3.4; brand embossed round the bore
{
  const SAG = 1.6, s = new THREE.Shape(); const ap = [0, 1, 2].map((i) => { const a = i * 2 * Math.PI / 3; return [Math.cos(a) * (RR - 0.12), Math.sin(a) * (RR - 0.12)]; });
  const flankPts = (p, q, n) => { const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy); const nx = dy / L, ny = -dx / L; // outward normal (CCW order)
    const rad = (L * L / 4 + SAG * SAG) / (2 * SAG), cx = mx - nx * (rad - SAG), cy = my - ny * (rad - SAG); const a0 = Math.atan2(p[1] - cy, p[0] - cx), a1 = Math.atan2(q[1] - cy, q[0] - cx); let da = a1 - a0; while (da < 0) da += Math.PI * 2; const o = []; for (let i = 0; i <= n; i++) { const a = a0 + da * i / n; o.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); } return o; };
  R.flank = (i) => flankPts(ap[i], ap[(i + 1) % 3], 24);
  // check orientation: flank midpoint should be farther than the chord midpoint
  let first = true; for (let i = 0; i < 3; i++) { flankPts(ap[i], ap[(i + 1) % 3], 24).forEach(([x, y], k) => { if (first) { s.moveTo(x, y); first = false; } else if (k > 0) s.lineTo(x, y); }); }
  const bore = new THREE.Path(); for (let i = 0; i <= 48; i++) { const a = -i / 48 * Math.PI * 2; i ? bore.lineTo(Math.cos(a) * 3.4, Math.sin(a) * 3.4) : bore.moveTo(Math.cos(a) * 3.4, Math.sin(a) * 3.4); } s.holes.push(bore);
  const g = new THREE.ExtrudeGeometry(s, { depth: DEPTH - 0.6, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, -DEPTH + 0.3);
  const PX = 24, S2 = RR + 1, tw = Math.round(2 * S2 * PX);
  const rt = textTexture(tw, tw, (c, w, h) => { const X = (x) => (x + S2) * PX, Y = (y) => (S2 - y) * PX;
    c.fillStyle = '#8a90a2'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(30,30,40,${Math.random() * 0.1})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    // combustion recesses on each flank
    for (let i = 0; i < 3; i++) { const a = (i + 0.5) * 2 * Math.PI / 3, r = RR * 0.5 + 0.9; c.save(); c.translate(X(Math.cos(a) * r), Y(Math.sin(a) * r)); c.rotate(-a); c.fillStyle = '#6a7084'; c.fillRect(-0.6 * PX, -2.6 * PX, 1.2 * PX, 5.2 * PX); c.restore(); }
    // embossed ring text
    c.save(); c.translate(X(0), Y(0)); const txt = 'ENGINEERS WITHOUT SLEEP * '; c.font = `${Math.round(0.62 * PX)}px PS2P`; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let k = 0; k < txt.length; k++) { const a = -Math.PI / 2 + k / txt.length * Math.PI * 2; c.save(); c.rotate(a); c.translate(0, -4.35 * PX); c.fillStyle = 'rgba(40,44,58,0.6)'; c.fillText(txt[k], 1, 1); c.fillStyle = 'rgba(220,226,238,0.55)'; c.fillText(txt[k], 0, 0); c.restore(); }
    c.strokeStyle = 'rgba(40,44,58,0.5)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 3.75 * PX, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(0, 0, 5.0 * PX, 0, Math.PI * 2); c.stroke(); c.restore(); });
  rt.repeat.set(1 / (2 * S2), 1 / (2 * S2)); rt.offset.set(0.5, 0.5);
  R.rotorFace = toon(0xffffff, { map: rt, metalness: 0.55, roughness: 0.38, transparent: true }); R.rotorSide = toon(0x7d8599, { metalness: 0.6, roughness: 0.35, transparent: true });
  R.rotor = new THREE.Group(); std.add(R.rotor);
  const rm = new THREE.Mesh(g, [R.rotorFace, R.rotorSide]); rm.castShadow = true; R.rotor.add(rm);
  // apex seals
  ap.forEach(([x, y]) => { const a = Math.atan2(y, x); const sl = box(0.5, 0.35, DEPTH - 0.6, toon(0xffd36b, { metalness: 0.8, roughness: 0.2, emissive: 0x3a2a00 }), Math.cos(a) * (RR - 0.05), Math.sin(a) * (RR - 0.05), -DEPTH / 2, R.rotor); sl.rotation.z = a; });
  // internal ring gear (30 teeth, pitch r 4.5) recessed at the back of the rotor
  const gearRing = new THREE.Shape(); for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; i ? gearRing.lineTo(Math.cos(a) * 5.6, Math.sin(a) * 5.6) : gearRing.moveTo(5.6, 0); }
  const gh = new THREE.Path(); const N = 120; for (let i = 0; i <= N; i++) { const a = -i / N * Math.PI * 2, tooth = (i % 4 === 1 || i % 4 === 2); const r = 4.5 + (tooth ? -0.32 : 0.32); i ? gh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : gh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } gearRing.holes.push(gh);
  R.ringGear = new THREE.Mesh(new THREE.ExtrudeGeometry(gearRing, { depth: 1.6, bevelEnabled: false }), toon(0xffb636, { metalness: 0.6, roughness: 0.3 })); R.ringGear.position.z = -DEPTH + 0.0; R.rotor.add(R.ringGear);
}
// eccentric shaft: centre shaft + offset lobe (rotates 3x the rotor) + front pulley with marker
R.shaft = new THREE.Group(); std.add(R.shaft);
{
  const sm = toon(0xd8dbe6, { metalness: 0.8, roughness: 0.25 });
  const sh = cyl(1.2, 14, sm, 20, R.shaft); sh.rotation.x = Math.PI / 2; sh.position.z = -3;
  R.lobeMat = toon(0x4fe0ff, { metalness: 0.6, roughness: 0.3, transparent: true }); R.lobe = cyl(3.25, DEPTH - 1.2, R.lobeMat, 32, R.shaft); R.lobe.rotation.x = Math.PI / 2; R.lobe.position.set(EE, 0, -DEPTH / 2);
  const pul = cyl(2.4, 0.8, toon(0x2a2c3c), 28, R.shaft); pul.rotation.x = Math.PI / 2; pul.position.z = 1.0;
  const mk = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), toon(0xff4d7a, { emissive: 0xff4d7a, emissiveIntensity: 0.4 })); mk.position.set(1.7, 0, 1.45); R.shaft.add(mk);
}
// three chamber fills (dynamic quad strips between housing arc and flank)
const NS = 24; R.ch = [];
for (let i = 0; i < 3; i++) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((NS + 1) * 2 * 3), 3));
  const idx = []; for (let k = 0; k < NS; k++) { const a = k * 2, b2 = k * 2 + 1, c2 = k * 2 + 2, d = k * 2 + 3; idx.push(a, c2, b2, b2, c2, d); } geo.setIndex(idx);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x4fe0ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false })); m.position.z = -1.2; m.renderOrder = 3; m.frustumCulled = false; std.add(m); R.ch.push(m);
}
eng.traverse((o) => { if (o.isMesh && !R.ch.includes(o)) { o.castShadow = true; o.receiveShadow = true; } });
// stroke of a chamber from its centre angle psi (deg, standard coords): 0 intake, 1 compression, 2 power, 3 exhaust
const strokeOf = (psi) => { const a = (((psi - 270) % 360) + 360) % 360; return [Math.floor(a / 90), (a % 90) / 90]; };
const chCol = new THREE.Color(), cA = new THREE.Color(), cB = new THREE.Color();
function chamberColour(st, u) {
  const mix = (a, b2, t) => chCol.copy(cA.set(a)).lerp(cB.set(b2), TL.clamp01(t));
  if (st === 0) { mix('#2a8cff', '#4fe0ff', u); return 0.3 + 0.25 * u; }
  if (st === 1) { mix('#4fe0ff', '#c8f8ff', u); return 0.55 + 0.35 * u; }
  if (st === 2) { if (u < 0.25) mix('#ffffff', '#ffd36b', u / 0.25); else mix('#ff7a2f', '#8a2030', (u - 0.25) / 0.75); return 0.95 - 0.4 * u; }
  mix('#7a5a50', '#4a4458', u); return 0.5 - 0.25 * u;
}
// ---------- garage: epoxy floor, branded wall, plate, props ----------
{
  const ft = textTexture(256, 256, (g, w, h) => { g.fillStyle = '#5d6478'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${200 + Math.random() * 55},${200 + Math.random() * 55},255,${Math.random() * 0.12})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); });
  ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(10, 10);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 400), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.35, metalness: 0.05 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 60); floor.receiveShadow = true; scene.add(floor);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(500, 4), new THREE.MeshStandardMaterial({ color: 0xffb636, roughness: 0.5 })); stripe.rotation.x = -Math.PI / 2; stripe.position.set(0, 0.05, 40); scene.add(stripe);
  const wt = textTexture(1024, 512, (g, w, h) => {
    g.fillStyle = '#2b2d4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#33365a'; for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 32; x < w; x += 64) g.fillRect(x, y, 60, 28);
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

// stencilled crate + pegboard (blended branding)
{
  const ct = textTexture(256, 256, (g, w, h) => { g.fillStyle = '#9a7a4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#86683c'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 4); g.strokeStyle = '#6a5030'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.beginPath(); g.moveTo(5, 5); g.lineTo(w - 5, h - 5); g.stroke();
    g.font = '22px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(30,22,16,0.72)'; g.fillText('ENGINEERS', w / 2, 96); g.fillText('WITHOUT', w / 2, 128); g.fillText('SLEEP', w / 2, 160); g.font = '14px PS2P'; g.fillText('ROTOR PARTS - HANDLE W/ CARE', w / 2, 210); });
  const crate = new THREE.Mesh(new THREE.BoxGeometry(26, 26, 26), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.85 })); crate.position.set(-46, 13, -18); crate.rotation.y = 0.35; crate.castShadow = true; crate.receiveShadow = true; scene.add(crate);
  const c2 = crate.clone(); c2.scale.setScalar(0.7); c2.position.set(-44, 26 + 9.1, -20); c2.rotation.y = -0.2; scene.add(c2);
  const pb = textTexture(256, 128, (g, w, h) => { g.fillStyle = '#c9a46a'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a6040'; for (let y = 6; y < h; y += 12) for (let x = 6; x < w; x += 12) g.fillRect(x, y, 3, 3); });
  const peg = new THREE.Mesh(new THREE.PlaneGeometry(90, 45), new THREE.MeshStandardMaterial({ map: pb, roughness: 0.9 })); peg.position.set(-10, 62, -79.6); scene.add(peg);
  const tm = toon(0xc8ccd8, { metalness: 0.7, roughness: 0.3 });
  [[-40, 66, 0.3], [-28, 64, -0.2], [-14, 68, 0.1], [2, 63, 0.5], [18, 67, -0.4], [28, 64, 0.2]].forEach(([x, y, r]) => { const w = box(2, 16, 1, tm, x, y, -78.8, scene); w.rotation.z = r; });
}
const wallMats = []; scene.traverse((o) => { if (o.userData.wall) { o.material.userData.base = o.material.color.clone(); wallMats.push(o.material); } });
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
  wide: [[-62, 52, 124], [-54, 50, 116], [0, 38, 0]],
  rotorClose: [[7, 40, 42], [5, 39, 40], [0, 36, 0]],
  sparkClose: [[-30, 42, 34], [-27, 42, 32], [-12, 36, -2]],
  portsClose: [[30, 42, 34], [27, 42, 32], [12, 36, -2]],
  apexClose: [[6, 54, 30], [4, 53, 28], [0, 45, -2]],
  side3q: [[48, 46, 52], [44, 48, 48], [0, 36, -4]],
  plate: [[44, 42, -36], [48, 42, -40], [62, 38, -79.5]],
  shaftClose: [[4, 39, 20], [3, 38.5, 19], [0, 35, 1]],
};
const SHOTS = [ // [b0, b1, pos0, pos1, tgt0, tgt1]
  [8, 16, [52, 62, 145], [10, 44, 84], [0, 40, 0], [0, 39, 0]],
  [16, 24, [8, 44, 82], [5, 43, 78], [0, 39, 0], [0, 39, 0]],
  [24, 32, [-6, 44, 80], [-4, 43, 76], [0, 39, 0], [0, 39, 0]],
  [32, 40, [0, 42, 74], [2, 42, 84], [0, 39, 0], [0, 39, 0]],
  [40, 48, [8, 44, 80], [5, 43, 76], [0, 39, 0], [0, 39, 0]],
  [48, 56, [-12, 44, 82], [-8, 43, 78], [0, 39, 0], [0, 39, 0]],
  [56, 64, [5, 42, 56], [3, 41, 52], [0, 37.5, 0], [0, 37.5, 0]],
  [64, 72, [20, 44, 82], [14, 44, 78], [0, 39, 0], [0, 39, 0]],
  [72, 80, [48, 42, 98], [-48, 44, 98], [0, 39, 0], [0, 39, 0]],
  [80, 89, [-22, 52, 112], [12, 62, 152], [0, 41, 0], [0, 42, 0]],
];
function camAt(b) {
  if (b < 8) { const [p0, p1, tg] = HOOK[TL.HOOK_SHOTS[Math.floor(b)]]; const u = b - Math.floor(b); return { pos: V(p0).lerp(V(p1), u), tgt: V(tg) }; }
  const s = SHOTS.find((x) => b >= x[0] && b < x[1]) || SHOTS[SHOTS.length - 1];
  const u = TL.ease((b - s[0]) / (s[1] - s[0]));
  return { pos: V(s[2]).lerp(V(s[3]), u), tgt: V(s[4]).lerp(V(s[5]), u) };
}
const WS = (x, y, z) => std.localToWorld(new THREE.Vector3(x, y, z));
const bez = (p, s) => { const [a, b2, c, d] = p, u = 1 - s; return a.clone().multiplyScalar(u * u * u).add(b2.clone().multiplyScalar(3 * u * u * s)).add(c.clone().multiplyScalar(3 * u * s * s)).add(d.clone().multiplyScalar(s * s * s)); };
const mod = (a, m) => ((a % m) + m) % m;

window.renderFrame = function (t) {
  const b = t / TL.B, frame = Math.round(t * 30), real = TL.isReal(b);
  const { pos, tgt } = camAt(b);
  const th = TL.shaftDeg(b, frame), ph = th / 3, thR = th * D2R, phR = ph * D2R;
  const C = [EE * Math.cos(thR), EE * Math.sin(thR)];
  R.rotor.position.set(C[0], C[1], 0); R.rotor.rotation.z = phR; R.shaft.rotation.z = thR;
  // x-ray rotor for the gear scene
  const xr = TL.xray(b); R.rotorFace.opacity = 1 - 0.8 * xr; R.rotorSide.opacity = 1 - 0.8 * xr; R.rotorFace.depthWrite = R.rotorSide.depthWrite = xr < 0.5; R.lobeMat.opacity = 1 - 0.8 * xr; R.lobeMat.depthWrite = xr < 0.5;
  // chambers
  const steps = b >= 16 && b < 48, chInfo = [];
  for (let i = 0; i < 3; i++) {
    const p = R.ch[i].geometry.attributes.position, fl = R.flank(i), cp = Math.cos(phR), sp = Math.sin(phR);
    let cx = 0, cy = 0;
    for (let k = 0; k <= NS; k++) { const a = (ph + 120 * i + 120 * k / NS) * D2R; const [hx, hy] = troch(a); const [lx, ly] = fl[k]; const fx = C[0] + lx * cp - ly * sp, fy = C[1] + lx * sp + ly * cp;
      p.setXYZ(k * 2, hx, hy, 0); p.setXYZ(k * 2 + 1, fx, fy, 0); cx += hx + fx; cy += hy + fy; }
    p.needsUpdate = true;
    const psi = ph + 60 + 120 * i, [st, u] = strokeOf(psi);
    let op = chamberColour(st, u); if (real) { const r2 = Math.random(); chamberColour(Math.floor(r2 * 4), r2 * 4 % 1); op = 0.6; }
    R.ch[i].material.color.copy(chCol); R.ch[i].material.opacity = op * (steps && i !== 0 ? 0.3 : 1) * (1 - 0.5 * xr);
    chInfo.push({ st, u, cx: cx / (2 * NS + 2), cy: cy / (2 * NS + 2), psi });
  }
  // sparks: glow just before/at a face reaching the top waist
  const nearFire = chInfo.some((c) => { const a = mod(c.psi - 90, 360); return a > 352 || a < 4; });
  R.sparks.forEach((s) => { s.material.opacity = (real ? Math.random() < 0.3 : nearFire) ? 1 : 0; s.scale.setScalar(1 + Math.random() * 0.5); });
  eng.position.set(real ? Math.sin(t * 830) * 0.04 : 0, ENG_Y + (real ? Math.cos(t * 970) * 0.03 : 0), 0);

  // camera + lights
  const sb = (b % 1) * TL.B, sbar = (b % 4) * TL.B;
  const lastB = lastBefore(TL.BANGS, b), bAge = (b - lastB) * TL.B, hero = Math.abs(lastB - TL.HERO_BANG) < 1e-6 && bAge < 0.6;
  if (hero) { const k = Math.exp(-bAge * 8) * 0.3; pos.x += Math.sin(t * 90) * k; pos.y += Math.cos(t * 77) * k; }
  if (real && b >= 8) { const k = pos.distanceTo(tgt) * 0.0012; pos.x += Math.sin(t * 71) * k; pos.y += Math.cos(t * 59) * k; }
  camera.position.copy(pos); camera.lookAt(tgt);
  camera.fov = 35 - (b >= 8 ? 1.2 * Math.exp(-sbar * 7) : 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  wallMats.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(1 + (b >= 8 ? 0.35 * Math.exp(-sb * 10) : 0)));
  const dist = pos.distanceTo(tgt), sz = Math.max(6, Math.min(30, dist * 0.75));
  sun.target.position.copy(tgt); sun.position.copy(tgt).add(new THREE.Vector3(30, 60, 45));
  Object.assign(sun.shadow.camera, { left: -sz, right: sz, top: sz, bottom: -sz, near: 1, far: 300 }); sun.shadow.camera.updateProjectionMatrix();
  let flash = real ? 0.25 * Math.random() : (bAge < 0.35 ? (hero ? 1 : 0.45) * (1 - bAge / 0.35) : 0);
  const fireCh = chInfo.find((c) => c.st === 2) || chInfo[0];
  bangLight.position.copy(WS(fireCh.cx, fireCh.cy, 4)); bangLight.distance = 40; bangLight.intensity = flash * 35;
  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  if (flash > 0.02) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,170,90,${flash * (hero ? 0.35 : 0.12)})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  dither();

  // ---- overlays ----
  const P = (x, y, z) => project(WS(x, y, z));
  const inChamber = (A) => chInfo.findIndex((c, i) => mod(A - (ph + 120 * i), 360) < 120);
  const flow = (A, toward, col) => { const i = inChamber(A); if (i < 0) return; const c = chInfo[i]; if (c.st !== (toward ? 0 : 3) || b >= 56 && b < 64) return;
    const a = A * D2R, o = troch(a, 13), m = troch(a, 2), q = troch(a, -0.5); let path = [new THREE.Vector3(o[0], o[1], -4), new THREE.Vector3(m[0], m[1], -4), new THREE.Vector3(q[0], q[1], -2), new THREE.Vector3(c.cx, c.cy, -1.5)];
    if (!toward) path = path.reverse(); ctx.fillStyle = col; const N = 14;
    for (let k = 0; k < N; k++) { const s = mod(th / 50 + k / N, 1), v = bez(path, s), pr = project(std.localToWorld(v)); ctx.fillRect(Math.round(pr.x - 3), Math.round(pr.y - 3), 6, 6); } };
  if (!real) { flow(ANG.in, true, COL.cyan); flow(ANG.ex, false, '#b7a8a0'); }
  const hf = R.flank(0)[12], cp = Math.cos(phR), sp = Math.sin(phR);
  const heroPt = [C[0] + hf[0] * cp - hf[1] * sp, C[1] + hf[0] * sp + hf[1] * cp];
  const tIn = troch(ANG.in * D2R, 3), tEx = troch(ANG.ex * D2R, 3), tPl = troch(ANG.p1 * D2R, 6), tW = troch(90 * D2R, 0), tH = troch(0, 1.5);
  const anchors = {
    rotor: P(C[0] + Math.cos(phR + 1.05) * 6, C[1] + Math.sin(phR + 1.05) * 6, -0.3), housing: P(tH[0], tH[1], 0), shaft: P(0, 0, 1.4), plugs: P(tPl[0], tPl[1], -4),
    inP: P(tIn[0], tIn[1], -2), face: P(heroPt[0], heroPt[1], -0.3), waist: P(tW[0], tW[1], 0), exP: P(tEx[0], tEx[1], -2),
    gearR: P(C[0] + 4.6, C[1], -DEPTH + 1.6), gearF: P(0, -3.1, -DEPTH + 1.6),
  };
  TL.LABELS.forEach((lb) => drawLabel(lb, anchors[lb.id], b));
  // hero face marker during the steps
  if (steps || (b >= 15 && b < 16)) { const q = anchors.face; ctx.fillStyle = COL.yellow; ctx.fillRect(Math.round(q.x - 6), Math.round(q.y - 6), 12, 12); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(Math.round(q.x - 6), Math.round(q.y - 6), 12, 12); }
  if (b >= 32 && b < 34) { const fp = troch(90 * D2R, -2.5); drawPop('BANG!', P(fp[0], fp[1], 0), (b - 32) * TL.B, COL.pink, 40); }
  if (b >= 64 && b < 72 && bAge < 0.5) { const fp = troch(90 * D2R, -2.5); drawPop('BANG', P(fp[0], fp[1], 0), bAge, COL.pink, 24); }
  // stroke badges on all three chambers
  if (b >= 49 && b < 56) { const names = ['SUCK', 'SQUEEZE', 'BANG', 'BLOW'], cols = [COL.cyan, COL.amber, COL.pink, COL.mint];
    chInfo.forEach((c) => { const q = P(c.cx, c.cy, 0); ctx.font = `14px ${FONT.ps}`; const w2 = ctx.measureText(names[c.st]).width + 14; ctx.fillStyle = 'rgba(18,13,34,0.85)'; ctx.fillRect(q.x - w2 / 2, q.y - 13, w2, 26); ctx.fillStyle = cols[c.st]; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(names[c.st], q.x, q.y + 1); ctx.textAlign = 'left'; }); }
  // 3:1 counter
  if (b >= 57 && b < 64) { const y0 = H - 250, turns = Math.floor(b - 56 + 1e-6); ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(40, y0, W - 80, 140);
    ctx.font = `20px ${FONT.ps}`; ctx.textBaseline = 'top'; ctx.fillStyle = COL.cyan; ctx.fillText('SHAFT', 70, y0 + 22); ctx.fillStyle = COL.amber; ctx.fillText('ROTOR', 390, y0 + 22);
    const wh = Math.floor(turns / 3), fr = turns % 3; ctx.font = `36px ${FONT.ps}`; ctx.fillStyle = COL.cream; ctx.fillText(String(turns), 70, y0 + 66); ctx.fillText(fr ? (wh ? `${wh} ${fr}/3` : `${fr}/3`) : String(wh), 390, y0 + 66); ctx.textBaseline = 'middle'; }
  // bang-rate comparison
  if (b >= 65 && b < 72) { const y0 = H - 250; ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(40, y0, W - 80, 140); ctx.font = `16px ${FONT.ps}`; ctx.textBaseline = 'top';
    ctx.fillStyle = COL.amber; ctx.fillText('ROTOR', 60, y0 + 24); ctx.fillStyle = COL.cream; ctx.fillText('PISTON', 60, y0 + 86);
    for (let k = 0; k < 8; k++) { const bb = 64 + k, x = 200 + k * 54; const on1 = b >= bb, on2 = b >= bb && k % 2 === 0; const age = (b - bb) * TL.B;
      ctx.fillStyle = on1 ? (age < 0.3 ? COL.yellow : COL.orange) : '#3a3d52'; ctx.fillRect(x, y0 + 18, 40, 32);
      ctx.fillStyle = on2 ? (age < 0.3 ? COL.yellow : '#9a6a40') : '#3a3d52'; ctx.fillRect(x, y0 + 80, 40, 32); }
    ctx.textBaseline = 'middle'; }
  drawSpeedTag(b);
  TL.CAPTIONS.filter((cp2) => b >= cp2.t0 && b < cp2.t1).forEach((cp2) => drawCaption(cp2, b));
  drawHandle();
  return out.toDataURL('image/jpeg', 0.92);
};
window.ready = Promise.resolve(true);
