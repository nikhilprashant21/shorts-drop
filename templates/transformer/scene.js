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


// ================= TRANSFORMER TOPIC (units: cm) =================
scene.background = new THREE.Color(0x181a30); scene.fog = new THREE.Fog(0x181a30, 260, 600);
{
  const ft = textTexture(256, 256, (g, w, h) => { g.fillStyle = '#5d6478'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(220,225,255,${Math.random() * 0.1})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); });
  ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(16, 12);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(800, 600), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.35, metalness: 0.05 })); floor.rotation.x = -Math.PI / 2; floor.position.set(60, 0, 100); floor.receiveShadow = true; scene.add(floor);
  const hz = textTexture(64, 64, (g) => { for (let i = -64; i < 128; i += 16) { g.fillStyle = '#ffb636'; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 8, 0); g.lineTo(i + 72, 64); g.lineTo(i + 64, 64); g.fill(); } });
  hz.wrapS = hz.wrapT = THREE.RepeatWrapping; hz.repeat.set(30, 1);
  const fence = new THREE.Mesh(new THREE.PlaneGeometry(130, 5), new THREE.MeshBasicMaterial({ map: hz, transparent: true })); fence.rotation.x = -Math.PI / 2; fence.position.set(0, 0.06, 40); scene.add(fence);
  const wt = textTexture(1024, 512, (g, w, h) => {
    g.fillStyle = '#2b2d4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#33365a'; for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 32; x < w; x += 64) g.fillRect(x, y, 60, 28);
    g.font = '64px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#120d22'; g.fillText('ENGINEERS', w / 2 + 6, 150 + 6); g.fillText('WITHOUT SLEEP', w / 2 + 6, 250 + 6);
    g.fillStyle = '#4fe0ff'; g.fillText('ENGINEERS', w / 2, 150); g.fillStyle = '#ffb636'; g.fillText('WITHOUT SLEEP', w / 2, 250);
  });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(320, 160), new THREE.MeshBasicMaterial({ map: wt })); wall.position.set(-20, 95, -110); scene.add(wall); wall.userData.wall = 1;
  const side = new THREE.Mesh(new THREE.PlaneGeometry(900, 260), new THREE.MeshBasicMaterial({ color: 0x23253f })); side.position.set(60, 130, -110.5); scene.add(side); side.userData.wall = 1;
  // danger sign
  const st = textTexture(256, 256, (g, w, h) => { g.fillStyle = '#ffd84a'; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w - 10, h - 60); g.lineTo(10, h - 60); g.closePath(); g.fill(); g.strokeStyle = '#120d22'; g.lineWidth = 10; g.stroke();
    g.fillStyle = '#120d22'; g.beginPath(); g.moveTo(140, 60); g.lineTo(100, 130); g.lineTo(130, 130); g.lineTo(110, 180); g.lineTo(160, 110); g.lineTo(130, 110); g.closePath(); g.fill();
    g.font = '22px PS2P'; g.textAlign = 'center'; g.fillStyle = '#ffd84a'; g.fillText('DANGER', w / 2, h - 32); g.fillText('420 KV', w / 2, h - 6); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ map: st, transparent: true })); sign.position.set(-75, 55, -109.5); scene.add(sign);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(6, 20, 20), toon(0xff7a2f)); [[-48, 30], [48, 34]].forEach(([x, z]) => { const c2 = cone.clone(); c2.position.set(x, 10, z); c2.castShadow = true; scene.add(c2); });
  const drum = new THREE.Group(); drum.position.set(-80, 0, -30); scene.add(drum);
  [-6, 6].forEach((z) => { const d = cyl(18, 2, toon(0xb07a3a, { roughness: 0.8 }), 28, drum); d.rotation.x = Math.PI / 2; d.position.set(0, 18, z); });
  const core2 = cyl(12, 10, toon(0x2a2c3c), 24, drum); core2.rotation.x = Math.PI / 2; core2.position.y = 18; drum.traverse((o) => { if (o.isMesh) o.castShadow = true; });
}
const wallMats = []; scene.traverse((o) => { if (o.userData.wall) { o.material.userData.base = o.material.color.clone(); wallMats.push(o.material); } });

// ---------- transformer (local: core y 0..60, x +-22.5, z +-5; front = +z) ----------
const XF_Y = 12, LEG = 17.5, CY0 = 14, CY1 = 46, CRAD = 8;
const xf = new THREE.Group(); xf.position.set(0, XF_Y, 0); scene.add(xf);
const X = {};
{
  const plinth = box(80, XF_Y, 44, toon(0x8a8fa0, { roughness: 0.8 }), 0, -XF_Y / 2, 0, xf); plinth.receiveShadow = true;
  const lam = (vert) => { const t = textTexture(64, 64, (g, w, h) => { g.fillStyle = '#4a5068'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a7290'; for (let i = 0; i < 64; i += 4) vert ? g.fillRect(i, 0, 2, h) : g.fillRect(0, i, w, 2); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(vert ? 2 : 8, vert ? 8 : 2); return toon(0xffffff, { map: t, metalness: 0.5, roughness: 0.45 }); };
  box(10, 60, 10, lam(true), -LEG, 30, 0, xf); box(10, 60, 10, lam(true), LEG, 30, 0, xf);
  box(25, 10, 10, lam(false), 0, 5, 0, xf); box(25, 10, 10, lam(false), 0, 55, 0, xf);
  // primary: 4 thick turns; secondary: 40 thin turns (one mesh each so they can light up)
  class Helix extends THREE.Curve { constructor(x, r, turns, y0, y1) { super(); Object.assign(this, { x, r, turns, y0, y1 }); } getPoint(u, o = new THREE.Vector3()) { const a = u * this.turns * Math.PI * 2; return o.set(this.x + Math.sin(a) * this.r, this.y0 + (this.y1 - this.y0) * u, Math.cos(a) * this.r); } }
  X.pCurve = new Helix(-LEG, CRAD, 4, CY0, CY1);
  X.pMat = new THREE.MeshStandardMaterial({ color: 0xe08a3a, metalness: 0.8, roughness: 0.3, emissive: 0xffb636, emissiveIntensity: 0 });
  X.prim = new THREE.Mesh(new THREE.TubeGeometry(X.pCurve, 240, 1.0, 10, false), X.pMat); xf.add(X.prim);
  X.sCurve = new Helix(LEG, CRAD, 40, CY0, CY1);
  X.sTurns = [];
  for (let k = 0; k < 40; k++) {
    const sub = { getPoint: (u, o) => X.sCurve.getPoint((k + u) / 40, o) };
    const c = new (class extends THREE.Curve { getPoint(u, o = new THREE.Vector3()) { return sub.getPoint(u, o); } })();
    const m = new THREE.MeshStandardMaterial({ color: 0xc8502e, metalness: 0.7, roughness: 0.35, emissive: 0x4fe0ff, emissiveIntensity: 0 });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.34, 6, false), m); xf.add(mesh); X.sTurns.push(mesh);
  }
  // leads up to the bushings
  const lead = (pts, r, mat) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 40, r, 8, false), mat); xf.add(m); return m; };
  lead([[-LEG, CY1, CRAD], [-LEG - 4, 54, 9], [-20, 64, 6], [-20, 70, 0]], 0.9, X.pMat);
  lead([[-LEG, CY0, CRAD], [-LEG - 9, 12, 8], [-28, 40, 6], [-24, 64, 4], [-24, 70, 0]], 0.9, X.pMat);
  X.sLeadMat = new THREE.MeshStandardMaterial({ color: 0xc8502e, metalness: 0.7, roughness: 0.35, emissive: 0x4fe0ff, emissiveIntensity: 0 });
  lead([[LEG, CY1, CRAD], [LEG + 3, 54, 9], [20, 64, 6], [20, 70, 0]], 0.4, X.sLeadMat);
  // tank (fades out in x-ray), fins, bushings, nameplate
  X.tankMats = [];
  const tm = toon(0x7d8a99, { metalness: 0.4, roughness: 0.5 }); tm.transparent = true; X.tankMats.push(tm);
  X.tank = box(64, 68, 34, tm, 0, 32, 0, xf); X.tank.castShadow = true;
  for (let i = 0; i < 9; i++) [-1, 1].forEach((sd) => { box(8, 54, 0.7, tm, sd * 36, 32, -12 + i * 3, xf); });
  const lid = box(68, 3, 38, tm, 0, 67.5, 0, xf);
  const nt = textTexture(512, 192, (g, w, h) => { g.fillStyle = '#d8dbe6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#120d22'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.font = '26px PS2P'; g.fillStyle = '#120d22'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ENGINEERS', w / 2, 46); g.fillText('WITHOUT SLEEP', w / 2, 86);
    g.font = '18px PS2P'; g.fillStyle = '#c81e3a'; g.fillText('STEP-UP  1 : 10', w / 2, 132); g.fillStyle = '#3a3d52'; g.fillText('50 HZ   99% EFF', w / 2, 164); });
  const nm = new THREE.MeshBasicMaterial({ map: nt, transparent: true }); X.tankMats.push(nm);
  const np = new THREE.Mesh(new THREE.PlaneGeometry(22, 8.25), nm); np.position.set(0, 46, 17.05); xf.add(np);
  const bush = (x, n, col) => { const g = new THREE.Group(); g.position.set(x, 69, 0); xf.add(g); const por = toon(col, { roughness: 0.25 });
    for (let i = 0; i < n; i++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.8, 18), por); d.position.y = 1.5 + i * 2.6; g.add(d); }
    const rod = cyl(1.3, n * 2.6 + 2, por, 14, g); rod.position.y = (n * 2.6 + 2) / 2; const cap = cyl(1.6, 1.6, toon(0xd8dbe6, { metalness: 0.8 }), 12, g); cap.position.y = n * 2.6 + 2.6; g.userData.top = n * 2.6 + 3.4; return g; };
  X.lv = bush(-22, 3, 0x9a5a3a); X.hv = bush(20, 14, 0x9a5a3a);
}
xf.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
// magnetic flux arrows round the core (front face)
X.arrows = [];
{
  const am = new THREE.MeshBasicMaterial({ color: 0xa98bff });
  const path = []; const P0 = [[-LEG, 5], [-LEG, 55], [LEG, 55], [LEG, 5]];
  for (let s = 0; s < 4; s++) { const [x0, y0] = P0[s], [x1, y1] = P0[(s + 1) % 4]; const n = s % 2 ? 4 : 5; for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; path.push({ x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u, dx: Math.sign(x1 - x0), dy: Math.sign(y1 - y0) }); } }
  path.forEach((p) => { const g = new THREE.Group(); g.position.set(p.x, p.y, 5.8); const c = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4, 4), am); c.rotation.y = Math.PI / 4; g.add(c); g.userData.dir = Math.atan2(-p.dx, p.dy); xf.add(g); X.arrows.push(g); });
}
// power line: 3 mini pylons to the right, wires from the HV bushing
const PYL = [[75, -25], [135, -45], [195, -65]];
X.wires = [];
{
  const pm = toon(0x9aa3b5, { metalness: 0.6, roughness: 0.4 });
  PYL.forEach(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    for (let i = 0; i < 4; i++) { const sx = i % 2 ? 1 : -1, sz = i < 2 ? 1 : -1; const l = box(0.8, 78, 0.8, pm, sx * 5, 39, sz * 5, g); l.rotation.z = -sx * 0.06; l.rotation.x = sz * 0.06; }
    for (let k = 0; k < 6; k++) { const y = 8 + k * 12, w = 10 - k * 1.2; box(w + 2, 0.5, 0.5, pm, 0, y, 5 - k * 0.7, g); box(w + 2, 0.5, 0.5, pm, 0, y, -5 + k * 0.7, g); }
    box(30, 1, 1, pm, 0, 74, 0, g); box(22, 1, 1, pm, 0, 64, 0, g);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); });
  const wm = toon(0x2a2c3c);
  const top = new THREE.Vector3(20, XF_Y + 69 + 14 * 2.6 + 3.4, 0);
  const pts = [top, ...PYL.map(([x, z]) => new THREE.Vector3(x + 14, 73, z))];
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b2 = pts[i + 1]; const ps = []; for (let k = 0; k <= 16; k++) { const u = k / 16; const p = a.clone().lerp(b2, u); p.y -= Math.sin(Math.PI * u) * 6; ps.push(p); }
    const c = new THREE.CatmullRomCurve3(ps); X.wires.push(c); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.35, 6, false), wm); scene.add(m); }
}
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
  tankWide: [[60, 62, 150], [52, 60, 142], [0, 56, 0]],
  bushingsHV: [[40, 122, 72], [34, 120, 66], [18, 108, 0]],
  nameplate: [[12, 54, 62], [8, 54, 58], [0, 52, 17]],
  fins: [[74, 46, 34], [70, 48, 30], [36, 44, 0]],
  pylons: [[60, 54, 60], [70, 56, 52], [130, 56, -35]],
  coilXray: [[32, 54, 62], [28, 54, 58], [-17, 44, 0]],
  coreClose: [[-22, 54, 48], [-18, 54, 45], [0, 44, 0]],
  wallWide: [[-80, 72, 180], [-70, 72, 170], [20, 62, -30]],
};
const SHOTS = [ // [b0, b1, pos0, pos1, tgt0, tgt1]
  [8, 16, [40, 72, 160], [18, 58, 112], [0, 52, 0], [0, 47, 0]],
  [16, 24, [-46, 56, 72], [-39, 54, 64], [-14, 44, 0], [-14, 44, 0]],
  [24, 32, [26, 58, 100], [18, 55, 92], [0, 47, 0], [0, 47, 0]],
  [32, 40, [46, 56, 72], [39, 54, 64], [14, 44, 0], [14, 44, 0]],
  [40, 48, [42, 50, 62], [36, 48, 56], [15, 40, 0], [15, 40, 0]],
  [48, 56, [0, 56, 118], [0, 54, 110], [0, 26, 0], [0, 26, 0]],
  [56, 64, [-22, 56, 112], [-15, 54, 105], [0, 26, 0], [0, 26, 0]],
  [64, 72, [12, 56, 108], [5, 54, 102], [0, 26, 0], [0, 26, 0]],
  [72, 80, [72, 92, 175], [56, 86, 155], [8, 72, 0], [8, 72, 0]],
  [80, 89, [-30, 74, 185], [40, 84, 205], [75, 58, -25], [85, 58, -30]],
];
const KH = { tankWide: 2.0, bushingsHV: 1.3, nameplate: 1.0, fins: 1.3, pylons: 1.6, coilXray: 1.35, coreClose: 1.7, wallWide: 1.4 };
const KS = [2.0, 1.2, 2.1, 1.2, 2.4, 2.0, 2.0, 2.0, 1.45, 1.35];
const far = (pos, tgt, k) => tgt.clone().add(pos.sub(tgt).multiplyScalar(k));
function camAt(b) {
  if (b < 8) { const nm = TL.HOOK_SHOTS[Math.floor(b)], [p0, p1, tg] = HOOK[nm]; const u = b - Math.floor(b); const tgt = V(tg); return { pos: far(V(p0).lerp(V(p1), u), tgt, KH[nm]), tgt }; }
  const i = Math.max(0, SHOTS.findIndex((x) => b >= x[0] && b < x[1])), s = SHOTS[i < 0 ? SHOTS.length - 1 : i];
  const si = SHOTS.findIndex((x) => b >= x[0] && b < x[1]), ss = SHOTS[si < 0 ? SHOTS.length - 1 : si], k = KS[si < 0 ? SHOTS.length - 1 : si];
  const u = TL.ease((b - ss[0]) / (ss[1] - ss[0]));
  const tgt = V(ss[4]).lerp(V(ss[5]), u); return { pos: far(V(ss[2]).lerp(V(ss[3]), u), tgt, k), tgt };
}
const W2 = (x, y, z) => xf.localToWorld(new THREE.Vector3(x, y, z));
const hash = (n) => { const h = Math.sin(n * 127.1 + 311.7) * 43758.5453; return h - Math.floor(h); };
const tmpV = new THREE.Vector3();

window.renderFrame = function (t) {
  const b = t / TL.B, frame = Math.round(t * 30), real = TL.isReal(b), dc = TL.isDC(b);
  const { pos, tgt } = camAt(b);
  const th = TL.acAngle(b, frame);
  let cur = Math.cos(th), flux = Math.sin(th), disp = Math.sin(th);      // primary current, core flux, electron displacement
  let dcK = 0; // blend into / out of DC
  if (b >= 64 && b < 68) dcK = TL.ease((b - 64) / 0.5); else if (b >= 68 && b < 68.5) dcK = 1 - TL.ease((b - 68) / 0.5);
  if (dcK > 0) { cur = 1; flux = flux * (1 - dcK) + dcK; }
  const sec = dc ? 0 : Math.cos(th) * (b >= 68 && b < 68.5 ? 1 - dcK : 1);             // induced (secondary) ~ d(flux)/dt
  // x-ray: tank fades
  const xr = TL.xray(b);
  X.tankMats.forEach((m) => { m.opacity = 1 - 0.92 * xr; m.depthWrite = xr < 0.5; });
  // glow
  X.pMat.emissiveIntensity = (real ? 0.4 + 0.4 * Math.random() : 0.15 + 0.6 * Math.abs(cur)) * (b >= 8 || real ? 1 : 0);
  const secOn = b >= 32 || b < 8 || b >= 72;
  const lightN = b >= 40 && b < 48 ? Math.floor(TL.clamp01((b - 41) / 6) * 40) : 40;
  X.sTurns.forEach((m, k) => { const lit = k < lightN; m.material.emissiveIntensity = secOn ? (real ? 0.3 + 0.5 * Math.random() : (lit ? 0.12 + 0.75 * Math.abs(sec) : 0)) : 0; m.material.emissive.set(b >= 40 && b < 48 && lit && k === lightN - 1 ? 0xffffff : 0x4fe0ff); });
  X.sLeadMat.emissiveIntensity = secOn ? (real ? 0.5 : 0.75 * Math.abs(sec)) : 0;
  // flux arrows
  const showFlux = b >= 24 || (b < 8 && TL.HOOK_SHOTS[Math.floor(b)] === 'coreClose');
  X.arrows.forEach((g) => { const f = real ? 0.6 + 0.4 * Math.random() : flux; g.visible = showFlux && Math.abs(f) > 0.06; g.scale.setScalar(0.35 + 0.9 * Math.abs(f)); g.rotation.z = g.userData.dir + (f < 0 ? Math.PI : 0); });
  xf.position.set(real ? Math.sin(t * 600) * 0.03 : 0, XF_Y, 0);

  // camera
  const sb = (b % 1) * TL.B, sbar = (b % 4) * TL.B;
  camera.position.copy(pos); camera.lookAt(tgt);
  camera.fov = 35 - (b >= 8 ? 1.2 * Math.exp(-sbar * 7) : 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  wallMats.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(1 + (b >= 8 ? 0.4 * Math.exp(-sb * 10) : 0)));
  const dist = pos.distanceTo(tgt), sz = Math.max(6, Math.min(30, dist * 0.75)) * 2.5;
  sun.target.position.copy(tgt); sun.position.copy(tgt).add(new THREE.Vector3(60, 120, 90));
  Object.assign(sun.shadow.camera, { left: -sz, right: sz, top: sz, bottom: -sz, near: 1, far: 500 }); sun.shadow.camera.updateProjectionMatrix();
  const lastP = lastBefore(TL.PEAKS, b), pAge = (b - lastP) * TL.B;
  bangLight.position.copy(W2(LEG, 30, 14)); bangLight.distance = 60; bangLight.intensity = secOn && !real ? 20 * Math.abs(sec) : (real ? 10 : 0);
  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  dither();

  // ---- overlays ----
  const P = (x, y, z) => project(W2(x, y, z));
  // electrons: they only jiggle (AC) or drift (DC)
  const dots = (curve, n, amp, col, size) => { ctx.fillStyle = col;
    for (let i = 0; i < n; i++) { let u = (i + 0.5) / n + amp; u = ((u % 1) + 1) % 1; curve.getPoint(u, tmpV); const q = project(xf.localToWorld(tmpV.clone())); if (q.z > 1) continue; ctx.fillRect(Math.round(q.x - size / 2), Math.round(q.y - size / 2), size, size); } };
  const showE = b >= 16 || b < 8 || b >= 72;
  if (showE) {
    let pa = real ? hash(frame) * 0.02 : 0.012 * disp;
    if (b >= 64 && b < 68) pa = 0.012 * Math.sin(TL.acAngle(64)) + 0.05 * (b - 64);
    dots(X.pCurve, 72, pa, COL.yellow, 7);
    if (secOn) dots(X.sCurve, 320, real ? hash(frame + 3) * 0.002 : -0.0012 * Math.sin(th) * (dc ? 0 : 1), '#9af0ff', 4);
  }
  // power pulses along the line (finale)
  if (b >= 79) X.wires.forEach((c, wi) => { ctx.fillStyle = COL.pink; for (let i = 0; i < 6; i++) { const u = ((t * 1.4 + i / 6 + wi * 0.1) % 1); c.getPoint(u, tmpV); const q = project(tmpV); if (q.z < 1) ctx.fillRect(Math.round(q.x - 4), Math.round(q.y - 4), 8, 8); } });
  const anchors = {
    prim: P(-LEG - CRAD - 1, 20, 0), core: P(-LEG, 57, 5), sec: P(LEG + CRAD + 0.5, 18, 0), elec: P(-LEG - CRAD - 1, 32, 0),
    field: P(0, 55, 6), secC: P(LEG + CRAD + 0.5, 32, 0), lv: P(-22, 69 + X.lv.userData.top, 0), hv: P(20, 69 + X.hv.userData.top, 0),
  };
  TL.LABELS.forEach((lb) => drawLabel(lb, anchors[lb.id], b));
  // oscilloscope (multiply .. DC)
  const panel = (y0, hgt) => { ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(40, y0, W - 80, hgt); };
  if (b >= 41 && b < 48 || b >= 64 && b < 72) {
    const y0 = H - 260, hgt = 150; panel(y0, hgt);
    const mid = y0 + hgt / 2, x0 = 60, x1 = W - 60;
    for (const [col, amp, isOut] of [[COL.cyan, 7, false], [COL.pink, 62, true]]) {
      ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath();
      for (let x = x0; x <= x1; x += 4) { const bb = b - (x1 - x) / (x1 - x0) * 3; let v;
        if (bb >= 64 && bb < 68) v = isOut ? 0 : 1; else v = Math.cos(TL.acAngle(Math.max(bb, 8)));
        const yy = mid - v * amp; x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
      ctx.stroke();
    }
    ctx.font = `16px ${FONT.ps}`; ctx.textBaseline = 'top'; ctx.fillStyle = COL.cyan; ctx.fillText('IN', 64, y0 + 10); ctx.fillStyle = COL.pink; ctx.fillText('OUT', 64, y0 + hgt - 26); ctx.textBaseline = 'middle';
    if (b >= 41 && b < 48) { ctx.font = `20px ${FONT.ps}`; ctx.fillStyle = COL.cream; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText(`TURNS ${Math.max(1, Math.floor(TL.clamp01((b - 41) / 6) * 40))}/40`, W - 64, y0 + 10); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; }
  }
  // the catch: volts x amps
  if (b >= 49 && b < 56) {
    const y0 = H - 270, k = TL.ease((b - 49) / 0.6); panel(y0, 160); ctx.globalAlpha = k;
    ctx.font = `20px ${FONT.ps}`; ctx.textBaseline = 'top';
    ctx.fillStyle = COL.cyan; ctx.fillText('IN ', 60, y0 + 22); ctx.fillStyle = COL.cream; ctx.fillText('230 V  X 10 A', 140, y0 + 22);
    ctx.fillStyle = COL.pink; ctx.fillText('OUT', 60, y0 + 64); ctx.fillStyle = COL.cream; ctx.fillText('2,300 V X  1 A', 140, y0 + 64);
    if (b >= 52) { ctx.fillStyle = COL.amber; ctx.fillText('= 2,300 W BOTH SIDES', 60, y0 + 112); }
    ctx.globalAlpha = 1; ctx.textBaseline = 'middle';
  }
  // why: heat in the wires (I squared)
  if (b >= 57 && b < 64) {
    const y0 = H - 270; panel(y0, 160); ctx.font = `18px ${FONT.ps}`; ctx.textBaseline = 'top';
    const g1 = TL.ease((b - 57.5) / 1), g2 = TL.ease((b - 59) / 1);
    ctx.fillStyle = COL.cream; ctx.fillText('10 A', 60, y0 + 30); ctx.fillText(' 1 A', 60, y0 + 92);
    ctx.fillStyle = COL.orange; ctx.fillRect(170, y0 + 24, 460 * g1, 32); ctx.fillStyle = COL.mint; ctx.fillRect(170, y0 + 86, Math.max(4, 4.6 * g2), 32);
    ctx.fillStyle = COL.ink; if (g1 > 0.9) ctx.fillText('HEAT: 100', 190, y0 + 32); ctx.fillStyle = COL.mint; if (g2 > 0.9) ctx.fillText('HEAT: 1', 190, y0 + 94);
    ctx.textBaseline = 'middle';
  }
  // DC switch badge
  if (b >= 64 && b < 68) drawPop('DC', P(-LEG - 12, 50, 0), (b - 64) * TL.B, COL.amber, 32);
  if (b >= 68 && b < 70) drawPop('AC', P(-LEG - 12, 50, 0), (b - 68) * TL.B, COL.cyan, 32);
  drawSpeedTag(b);
  TL.CAPTIONS.filter((cp) => b >= cp.t0 && b < cp.t1).forEach((cp) => drawCaption(cp, b));
  drawHandle();
  return out.toDataURL('image/jpeg', 0.92);
};
window.ready = Promise.resolve(true);
