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


// ================= GPS TOPIC (units: 1 = 1000 km, Earth centred at origin, +y = north) =================
import { LAND } from './land.js';
scene.background = new THREE.Color(0x05060f); scene.fog = null;
const G = {};
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
// stars
{ const n = 1600, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u); p.set([r * Math.cos(a) * 400, u * 400, r * Math.sin(a) * 400], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfff4dc, size: 2, sizeAttenuation: false }))); }
// earth: equirectangular land texture from world-atlas, lat/lon grid, atmosphere
{
  const tex = textTexture(2048, 1024, (g, w, h) => {
    g.fillStyle = '#16305e'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(40,80,150,${0.08 + 0.06 * Math.sin(y * 0.05)})`; g.fillRect(0, y, w, 2); }
    const X = (lon) => (lon + 180) / 360 * w, Y = (lat) => (90 - lat) / 180 * h;
    LAND.forEach((ring) => { g.beginPath(); ring.forEach(([lo, la], i) => (i ? g.lineTo(X(lo), Y(la)) : g.moveTo(X(lo), Y(la)))); g.closePath();
      const lat0 = ring.reduce((s, p) => s + p[1], 0) / ring.length; g.fillStyle = Math.abs(lat0) > 62 ? '#d8e4ef' : (Math.abs(lat0) < 30 ? '#4c9a4e' : '#5b8f48'); g.fill(); g.strokeStyle = '#2e6a3a'; g.lineWidth = 2; g.stroke(); });
    g.fillStyle = 'rgba(200,170,110,0.35)'; [[0, 23, 30, 10], [45, 25, 20, 8], [120, -25, 18, 9], [-110, 35, 10, 6]].forEach(([lo, la, ww, hh]) => { g.beginPath(); g.ellipse(X(lo + ww / 2), Y(la), ww / 360 * w, hh / 180 * h, 0, 0, Math.PI * 2); g.fill(); });
    g.strokeStyle = 'rgba(160,200,255,0.16)'; g.lineWidth = 1; for (let lo = -180; lo <= 180; lo += 15) { g.beginPath(); g.moveTo(X(lo), 0); g.lineTo(X(lo), h); g.stroke(); } for (let la = -75; la <= 75; la += 15) { g.beginPath(); g.moveTo(0, Y(la)); g.lineTo(w, Y(la)); g.stroke(); }
  });
  tex.anisotropy = 4;
  G.earth = new THREE.Mesh(new THREE.SphereGeometry(TL.RE, 96, 64), new THREE.MeshStandardMaterial({ map: tex, color: 0xa8a8b0, roughness: 0.95, metalness: 0.0 })); scene.add(G.earth);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(TL.RE * 1.035, 64, 32), new THREE.MeshBasicMaterial({ color: 0x4fa8ff, transparent: true, opacity: 0.16, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(atm);
}
// satellite model (sizes exaggerated ~1000x so they read); bus carries the brand on one side
const satProto = (() => {
  const g = new THREE.Group();
  const foil = new THREE.MeshStandardMaterial({ color: 0xd8a83a, metalness: 0.9, roughness: 0.35 });
  const bt = textTexture(256, 256, (c, w, h) => { c.fillStyle = '#c99a34'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,230,160,${Math.random() * 0.2})`; c.fillRect(Math.random() * w, Math.random() * h, 6, 2); }
    c.font = '20px PS2P'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(40,24,8,0.7)'; c.fillText('ENGINEERS', w / 2, 96); c.fillText('WITHOUT', w / 2, 128); c.fillText('SLEEP', w / 2, 160); c.font = '14px PS2P'; c.fillText('GPS  NOSLEEP-1', w / 2, 212); });
  const side = new THREE.MeshStandardMaterial({ map: bt, metalness: 0.7, roughness: 0.4 });
  const bt2 = bt.clone(); bt2.wrapS = bt2.wrapT = THREE.RepeatWrapping; bt2.repeat.set(-1, -1); bt2.needsUpdate = true; const side2 = new THREE.MeshStandardMaterial({ map: bt2, metalness: 0.7, roughness: 0.4 });
  const bus = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), [foil, foil, foil, foil, side, side2]); g.add(bus);
  const pt = textTexture(64, 128, (c, w, h) => { c.fillStyle = '#1d3a8a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6a8ad8'; c.lineWidth = 2; for (let x = 0; x < w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
  const pm = new THREE.MeshStandardMaterial({ map: pt, metalness: 0.4, roughness: 0.3 });
  [-1, 1].forEach((sd) => { const arm = box(0.3, 0.03, 0.03, toon(0xb9bfcc), sd * 0.36, 0, 0, g); const p = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 0.45), pm); p.position.set(sd * 1.0, 0, 0); g.add(p); });
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.08, 12), toon(0xe8ecf4)); ant.position.y = -0.25; g.add(ant);
  return g;
})();
G.sats = TL.SATS.map(() => { const s = satProto.clone(); scene.add(s); return s; });
// orbit rings
for (let k = 0; k < 6; k++) { const pts = []; for (let i = 0; i <= 128; i++) { const Om = k * 60 * Math.PI / 180, inc = 55 * Math.PI / 180, nu = i / 128 * Math.PI * 2; pts.push(new THREE.Vector3(TL.AORB * (Math.cos(nu) * Math.cos(Om) - Math.sin(nu) * Math.sin(Om) * Math.cos(inc)), TL.AORB * Math.sin(nu) * Math.sin(inc), TL.AORB * (Math.cos(nu) * Math.sin(Om) + Math.sin(nu) * Math.cos(Om) * Math.cos(inc)))); }
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x6a6aaa, transparent: true, opacity: 0.35 })); scene.add(l); }
// phone pin (3D beacon on the ground)
G.pin = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: 0x4fe0ff })); G.pin.position.copy(v3(TL.PHONE).multiplyScalar(1.004)); scene.add(G.pin);
// chosen satellites: signal shells + distance spheres
const SH_COL = [0x4fe0ff, 0x43e8b0, 0xffb636, 0xff4d7a];
G.shells = TL.PICK.map((p, j) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.MeshBasicMaterial({ color: SH_COL[j], transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); return m; });
G.spheres = TL.PICK.map((p, j) => { const g = new THREE.Group(); const c = v3(TL.satPos(...TL.SATS[p.i], 24)); g.position.copy(c); g.scale.setScalar(p.d);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshBasicMaterial({ color: SH_COL[j], transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false })));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1, 36, 18), new THREE.MeshBasicMaterial({ color: SH_COL[j], wireframe: true, transparent: true, opacity: 0.12, depthWrite: false })));
  g.visible = false; scene.add(g); return g; });
// circle where spheres 1 and 2 cross; the two candidate points of spheres 1-3
{
  const S = TL.PICK.map((p) => v3(TL.satPos(...TL.SATS[p.i], 24))), r = TL.PICK.map((p) => p.d), P = v3(TL.PHONE);
  const d = S[1].clone().sub(S[0]), dl = d.length(), n = d.clone().normalize(), a = (r[0] * r[0] - r[1] * r[1] + dl * dl) / (2 * dl), hc = Math.sqrt(Math.max(0, r[0] * r[0] - a * a)), C = S[0].clone().addScaledVector(n, a);
  const e1 = P.clone().sub(C).normalize(), e2 = n.clone().cross(e1).normalize(); const pts = []; for (let i = 0; i <= 160; i++) { const t = i / 160 * Math.PI * 2; pts.push(C.clone().addScaledVector(e1, Math.cos(t) * hc).addScaledVector(e2, Math.sin(t) * hc)); }
  G.circle = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x43e8b0, transparent: true, opacity: 0 })); scene.add(G.circle);
  const pn = S[1].clone().sub(S[0]).cross(S[2].clone().sub(S[0])).normalize(); const far = P.clone().sub(pn.clone().multiplyScalar(2 * P.clone().sub(S[0]).dot(pn)));
  G.farPt = far; G.farDot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff4d7a, transparent: true })); G.farDot.position.copy(far); G.farDot.visible = false; scene.add(G.farDot);
  G.S = S;
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


// ---------- continuous camera: one smooth spline after the hook ----------
const P0 = v3(TL.PHONE), U = v3(TL.PU).normalize();
const lonR = TL.PHONE_LON * Math.PI / 180, latR = TL.PHONE_LAT * Math.PI / 180;
const EAST = new THREE.Vector3(-Math.sin(lonR), 0, -Math.cos(lonR)).normalize(), NORTH = U.clone().cross(EAST).negate().normalize();
const K = (up, e, n, base = P0) => base.clone().addScaledVector(U, up).addScaledVector(EAST, e).addScaledVector(NORTH, n);
const S1 = G.S[0], S2 = G.S[1], H1 = v3(TL.satPos(...TL.SATS[TL.PICK[0].i], 8)), H2 = v3(TL.satPos(...TL.SATS[TL.PICK[1].i], 8)), MID = S1.clone().lerp(P0, 0.5), FARM = P0.clone().lerp(G.farPt, 0.5);
const farDir = G.farPt.clone().sub(P0), farSide = farDir.clone().cross(U).normalize();
const KEYS = [
  [8, K(2.4, 0.7, -1.0), P0.clone()],
  [13, K(10, 4.5, -6), K(1.5, 0, 0)],
  [19, U.clone().multiplyScalar(52).addScaledVector(EAST, 28).addScaledVector(NORTH, -20), U.clone().multiplyScalar(7)],
  [24.5, K(0.7, 1.7, -1.1, S1), S1.clone()],
  [28.5, K(2, 6, -6, S1), S1.clone().lerp(P0, 0.35)],
  [33.5, K(0, 15, -11, MID), MID.clone()],
  [39, K(30, 46, -32), K(10, 0, 0)],
  [46, K(42, -42, -36), K(8, 0, 0)],
  [53, FARM.clone().addScaledVector(farSide, farDir.length() * 1.25).addScaledVector(U, 12), FARM.clone()],
  [59, K(18, 8, -6), P0.clone()],
  [65, K(6, 3, -3.2), P0.clone()],
  [70.5, K(8, -4, -5), P0.clone()],
  [73, K(1.0, 3.2, -2.4, S2), S2.clone()],
  [77, K(0.4, 1.6, -1.1, S2), S2.clone()],
  [80.5, K(22, 6, -2), P0.clone()],
  [88.5, K(1.1, 0.25, -0.35), P0.clone()],
];
const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => k[1]), false, 'centripetal'), tgtCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => k[2]), false, 'centripetal');
function camAt(b) {
  const i = Math.max(0, Math.min(KEYS.length - 2, KEYS.findIndex((k, j) => j < KEYS.length - 1 && b >= k[0] && b < KEYS[j + 1][0])));
  const f = TL.clamp01((b - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0])), tt = (i + f) / (KEYS.length - 1);
  return { pos: posCurve.getPoint(tt), tgt: tgtCurve.getPoint(tt) };
}
const HOOK = {
  earthPin: [K(3.2, 1.2, -1.4), K(2.8, 1.0, -1.2), P0],
  satClose: [K(1.2, 1.4, 3.6, H1), K(1.0, 1.2, 3.2, H1), H1],
  wide: [U.clone().multiplyScalar(60).addScaledVector(EAST, 30), U.clone().multiplyScalar(56).addScaledVector(EAST, 26), new THREE.Vector3()],
  india: [K(1.2, 0.4, -0.5), K(1.0, 0.35, -0.45), P0],
  panel: [K(0.6, 2.4, 2.2, H2), K(0.5, 2.1, 2.0, H2), H2],
  orbits: [U.clone().multiplyScalar(34).addScaledVector(NORTH, 30), U.clone().multiplyScalar(30).addScaledVector(NORTH, 28), new THREE.Vector3()],
  satSide: [K(0.4, -2.6, 2.4, H1), K(0.3, -2.3, 2.1, H1), H1],
  globe: [U.clone().multiplyScalar(22).addScaledVector(EAST, -6), U.clone().multiplyScalar(19).addScaledVector(EAST, -5), new THREE.Vector3()],
};
const hashF = (n) => { const h = Math.sin(n * 127.1 + 311.7) * 43758.5453; return h - Math.floor(h); };
const visibleFrom = (cam, p) => { const toCam = cam.clone().sub(p); const ray = p.clone().sub(cam); const tc = -cam.dot(ray) / ray.lengthSq(); if (tc <= 0 || tc >= 1) return true; const closest = cam.clone().addScaledVector(ray, tc); return closest.length() > TL.RE * 0.999; };
const SHC = ['#4fe0ff', '#43e8b0', '#ffb636', '#ff4d7a'];

window.renderFrame = function (t) {
  const b = t / TL.B, frame = Math.round(t * 30);
  const camPrev = b < 8 ? HOOK[TL.HOOK_SHOTS[Math.floor(b)]][0].clone() : camAt(b).pos;
  // satellites
  TL.SATS.forEach(([k, m], i) => { const p = TL.satPos(k, m, b); G.sats[i].position.set(p[0], p[1], p[2]); G.sats[i].lookAt(0, 0, 0); G.sats[i].rotateX(-Math.PI / 2); });
  // signal shells: latest shout of each picked satellite while it travels
  TL.PICK.forEach((p, j) => { const tb = TL.travelBeats(j); let rr = -1; for (const a of TL.ARRIVALS[j]) { const e0 = a - tb; if (b >= e0 && b < a + 0.6) rr = (b - e0) * TL.VLIGHT; }
    const sh = G.shells[j]; sh.visible = rr > 0 && b < 64; if (rr > 0) { sh.position.copy(G.S[j]); sh.scale.setScalar(rr); sh.material.opacity = 0.22 * (1 - TL.clamp01((rr - p.d) / 3)) * (camPrev.distanceTo(G.S[j]) < rr ? 0.3 : 1); } });
  G.spheres.forEach((s, j) => { const k = TL.ease((b - TL.SPHERE_ON[j]) / 1.2) * (1 - 0.85 * TL.ease((b - (TL.LOCK + 1)) / 2)); const inside = camPrev.distanceTo(s.position) < TL.PICK[j].d; s.visible = k > 0.01; s.children[0].material.opacity = 0.045 * k * (inside ? 0.3 : 1); s.children[1].material.opacity = 0.12 * k; });
  G.circle.material.opacity = TL.ease((b - TL.CIRCLE_ON) / 1) * (1 - TL.ease((b - (TL.LOCK + 1)) / 2));
  G.farDot.visible = b >= TL.POINTS_ON && b < TL.FAR_FADE + 1.5; G.farDot.material.opacity = 1 - TL.ease((b - TL.FAR_FADE) / 1.2); G.farDot.scale.setScalar(1 + 0.2 * Math.sin(t * 10));
  // camera
  let pos, tgt;
  if (b < 8) { const [p0, p1, tg] = HOOK[TL.HOOK_SHOTS[Math.floor(b)]]; const u = b - Math.floor(b); pos = p0.clone().lerp(p1, u); tgt = tg.clone(); }
  else ({ pos, tgt } = camAt(b));
  const sbar = (b % 4) * TL.B;
  camera.position.copy(pos); camera.up.copy(b < 8 ? new THREE.Vector3(0, 1, 0) : U.clone().lerp(new THREE.Vector3(0, 1, 0), 0.5).normalize()); camera.lookAt(tgt); camera.near = 0.02; camera.far = 2000;
  camera.fov = 35 - (b >= 8 ? 0.8 * Math.exp(-sbar * 7) : 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  sun.position.set(60, 30, 40); sun.target.position.set(0, 0, 0); sun.castShadow = false;
  bangLight.intensity = 0;
  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  dither();

  // ---- overlays ----
  const P = (v) => project(v);
  // blue dot (fixed pixel size, pulses on every arrival)
  if (visibleFrom(camera.position, P0)) { const q = P(P0); if (q.z < 1) { const lastA = Math.max(-9, ...TL.ARRIVALS.flat().filter((a) => a <= b)); const age = (b - lastA) * TL.B;
    if (age < 0.6 && b >= 24) { ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; ctx.globalAlpha = 1 - age / 0.6; ctx.beginPath(); ctx.arc(q.x, q.y, 10 + age * 90, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    const pr = 9 + 2 * Math.sin(t * 6); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(q.x, q.y, pr + 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2a8cff'; ctx.beginPath(); ctx.arc(q.x, q.y, pr, 0, Math.PI * 2); ctx.fill(); } }
  // chips on the 4 chosen satellites
  if (b >= 24 && b < 80) TL.PICK.forEach((p, j) => { if (b < TL.SPHERE_ON[j] - 4 && j > 0) return; const q = P(G.S[j]); if (q.z > 1 || q.x < 20 || q.x > W - 20 || q.y < 20 || q.y > H - 20) return; const txt = `SAT ${j + 1}`; ctx.font = `14px ${FONT.ps}`; const w2 = ctx.measureText(txt).width + 12; ctx.fillStyle = 'rgba(18,13,34,0.85)'; ctx.fillRect(q.x + 14, q.y - 30, w2, 24); ctx.fillStyle = SHC[j]; ctx.fillText(txt, q.x + 20, q.y - 17); });
  // atomic clock readout near SAT 1
  if (b >= 24 && b < 32) { const q = P(S1); if (q.z < 1) { const ns = Math.floor((t * 1e6) % 1e9).toString().padStart(9, '0'); const txt = `12:00:0${Math.floor(b / 8) % 10}.${ns}`; ctx.font = `14px ${FONT.ps}`; const w2 = ctx.measureText(txt).width + 16; const x = Math.min(W - w2 - 30, Math.max(30, q.x - w2 / 2)), y = Math.min(H - 220, q.y + 60); ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(x, y, w2, 30); ctx.fillStyle = COL.cyan; ctx.textBaseline = 'middle'; ctx.fillText(txt, x + 8, y + 16); } }
  // distance line SAT 1 -> you
  if (b >= 33.5 && b < 40) { const a = P(S1), c = P(P0); const k = TL.ease((b - 33.5) / 1); ctx.strokeStyle = COL.amber; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + (c.x - a.x) * k, a.y + (c.y - a.y) * k); ctx.stroke(); ctx.setLineDash([]); }
  const anchors = { clock: P(S1), dist: P(MID), far: P(G.farPt), you: P(P0) };
  TL.LABELS.forEach((lb) => drawLabel(lb, anchors[lb.id], b));
  const panel = (y0, h2) => { ctx.fillStyle = 'rgba(18,13,34,0.92)'; ctx.fillRect(40, y0, W - 80, h2); };
  // the cheap phone clock (56-72)
  if (b >= 57 && b < 72) { const y0 = H - 280, h2 = 170; panel(y0, h2); ctx.font = `18px ${FONT.ps}`; ctx.textBaseline = 'top';
    const fixed = b >= TL.LOCK, off = fixed ? 0 : 1; ctx.fillStyle = COL.cyan; ctx.fillText('SATS  12:00:00.000000', 60, y0 + 22); ctx.fillStyle = fixed ? COL.mint : COL.pink; ctx.fillText(`PHONE 12:00:00.00000${off}`, 60, y0 + 62);
    ctx.fillStyle = fixed ? COL.mint : COL.amber; ctx.fillText(fixed ? (b >= 64 ? '1 MILLIONTH = 300 M' : 'CLOCK FIXED BY SAT 4') : 'PHONE CLOCK: 1 MILLIONTH OFF', 60, y0 + 112); ctx.textBaseline = 'middle'; }
  // relativity ledger (72-80)
  if (b >= 72.5 && b < 80) { const y0 = H - 300, h2 = 200; panel(y0, h2); ctx.font = `16px ${FONT.ps}`; ctx.textBaseline = 'top'; ctx.fillStyle = COL.cream; ctx.fillText('SAT CLOCK VS GROUND, PER DAY', 60, y0 + 16); ctx.font = `14px ${FONT.silk}`; ctx.fillStyle = '#9aa0b4'; ctx.fillText('(MILLIONTHS OF A SECOND)', 60, y0 + 44);
    const rows = [['WEAKER GRAVITY', '+45', COL.violet, 73.5], ['ORBIT SPEED', ' -7', COL.cyan, 74.5], ['NET', '+38', COL.pink, 75.5]];
    ctx.font = `18px ${FONT.ps}`; rows.forEach(([a, v, c, bb], i) => { if (b < bb) return; ctx.fillStyle = c; ctx.fillText(a, 60, y0 + 76 + i * 38); ctx.textAlign = 'right'; ctx.fillText(v, W - 64, y0 + 76 + i * 38); ctx.textAlign = 'left'; }); ctx.textBaseline = 'middle'; }
  // phone screen at the end
  if (b >= 82) { const k = TL.ease((b - 82) / 0.8), pw = 300, ph = 460, x0 = W / 2 - pw / 2, y0 = H - 110 - ph * k; ctx.fillStyle = '#120d22'; ctx.fillRect(x0 - 12, y0 - 12, pw + 24, ph + 24); ctx.fillStyle = '#e8ecf4'; ctx.fillRect(x0, y0, pw, ph);
    ctx.fillStyle = '#cdd3e2'; for (let i = 0; i < 9; i++) { ctx.fillRect(x0, y0 + 30 + i * 52, pw, 10); ctx.fillRect(x0 + 20 + i * 40, y0, 10, ph); } ctx.fillStyle = '#9fd39a'; ctx.fillRect(x0 + 160, y0 + 250, 90, 70);
    const cx = x0 + pw / 2, cy = y0 + ph / 2; const r = 12 + 3 * Math.sin(t * 6); ctx.fillStyle = 'rgba(42,140,255,0.25)'; ctx.beginPath(); ctx.arc(cx, cy, 36 + 10 * Math.sin(t * 4), 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2a8cff'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.font = `14px ${FONT.ps}`; ctx.fillStyle = '#120d22'; ctx.textAlign = 'center'; ctx.fillText('YOU ARE HERE', cx, cy - 44); ctx.textAlign = 'left'; }
  drawSpeedTag(b);
  TL.CAPTIONS.filter((cp) => b >= cp.t0 && b < cp.t1).forEach((cp) => drawCaption(cp, b));
  drawHandle();
  return out.toDataURL('image/jpeg', 0.92);
};
window.ready = Promise.resolve(true);
