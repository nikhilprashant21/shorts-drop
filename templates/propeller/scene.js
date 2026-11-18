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


// ================= SHIP PROPELLER TOPIC (metres; ship bow = +x, prop at the stern) =================
const C = {};
const skyTex = textTexture(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2c2a6b'); gr.addColorStop(0.55, '#b3567d'); gr.addColorStop(0.8, '#ff9a62'); gr.addColorStop(1, '#ffd08a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
skyTex.magFilter = THREE.LinearFilter;
const hemi = new THREE.HemisphereLight(0xffc9b0, 0x1d2f55, 0.6); scene.add(hemi);
const OCEAN_N = 140;
const oceanGeo = new THREE.PlaneGeometry(1600, 1600, OCEAN_N, OCEAN_N); oceanGeo.rotateX(-Math.PI / 2);
const oceanMat = new THREE.MeshStandardMaterial({ color: 0x1f5f8f, roughness: 0.25, metalness: 0.1, flatShading: true, transparent: true, opacity: 1, side: THREE.DoubleSide });
const ocean = new THREE.Mesh(oceanGeo, oceanMat); ocean.receiveShadow = true; scene.add(ocean);
const oBase = oceanGeo.attributes.position.array.slice();
const ship = new THREE.Group(); scene.add(ship);
const hullMats = [];
{
  const outline = new THREE.Shape();
  outline.moveTo(-200, -26); outline.lineTo(110, -28); outline.quadraticCurveTo(185, -26, 202, 0); outline.quadraticCurveTo(185, 26, 110, 28); outline.lineTo(-200, 26); outline.quadraticCurveTo(-206, 0, -200, -26);
  const ext = (y0, y1, color) => { const g = new THREE.ExtrudeGeometry(outline, { depth: y1 - y0, bevelEnabled: false, curveSegments: 16 }); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0);
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 1 }); hullMats.push(m); const mesh = new THREE.Mesh(g, m); ship.add(mesh); return mesh; };
  ext(-15, -1, 0xb8322f); ext(-1, 15, 0x23314f);
  // stern skeg that carries the shaft down to the prop
  const skegM = new THREE.MeshStandardMaterial({ color: 0xb8322f, roughness: 0.6, transparent: true }); hullMats.push(skegM);
  const sk = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 3.2), skegM); sk.position.set(-196, -10, 0); ship.add(sk);
  const n = 26 * 20 * 8, inst = new THREE.InstancedMesh(new THREE.BoxGeometry(12.0, 2.5, 2.35), new THREE.MeshStandardMaterial({ roughness: 0.7 }), n);
  const cols = [0x2f6db5, 0xc9472f, 0xf2f2ee, 0xe0a52c, 0x2e8b6b, 0x7d4fa8, 0x9aa3b5, 0x3fa6c9].map((c) => new THREE.Color(c));
  let i = 0; const m4 = new THREE.Matrix4();
  for (let bay = 0; bay < 26; bay++) { const x = -160 + bay * 12.6; if (x > 40 && x < 62) continue; const tiers = 4 + ((bay * 7) % 5);
    for (let r = 0; r < 20; r++) for (let tr = 0; tr < tiers; tr++) { if (i >= n) break; m4.makeTranslation(x, 16.3 + tr * 2.6, -23.75 + r * 2.5); inst.setMatrixAt(i, m4); inst.setColorAt(i, cols[(bay * 13 + r * 7 + tr * 3) % cols.length]); i++; } }
  inst.count = i; ship.add(inst); C.containers = inst;
  const white = new THREE.MeshStandardMaterial({ color: 0xf0f0ea, roughness: 0.5 });
  const br = new THREE.Mesh(new RoundedBoxGeometry(14, 34, 50, 2, 0.8), white); br.position.set(51, 32, 0); ship.add(br);
  const win = new THREE.Mesh(new THREE.BoxGeometry(14.2, 2.2, 50.2), new THREE.MeshStandardMaterial({ color: 0x1c2333, roughness: 0.2, metalness: 0.5 })); win.position.set(51, 45, 0); ship.add(win);
  const fun = new THREE.Mesh(new RoundedBoxGeometry(12, 26, 14, 2, 1), new THREE.MeshStandardMaterial({ color: 0x23314f, roughness: 0.5 })); fun.position.set(-178, 28, 0); ship.add(fun);
  const band = new THREE.Mesh(new THREE.BoxGeometry(12.3, 3, 14.3), new THREE.MeshStandardMaterial({ color: 0x4fb8e6 })); band.position.set(-178, 36, 0); ship.add(band);
  const brand = textTexture(1024, 64, (g, w, h) => { g.fillStyle = '#23314f'; g.fillRect(0, 0, w, h); g.font = '40px PS2P'; g.fillStyle = '#fff4dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(BRAND, w / 2, h / 2 + 2); });
  [1, -1].forEach((sd) => { const bt = new THREE.Mesh(new THREE.PlaneGeometry(150, 9.4), new THREE.MeshBasicMaterial({ map: brand })); bt.position.set(0, 8, sd * 26.05); if (sd < 0) bt.rotation.y = Math.PI; ship.add(bt); });
  // x-ray parts: engine glow + the long shaft
  C.shipEngine = new THREE.Mesh(new RoundedBoxGeometry(27, 13.5, 6, 2, 0.6), new THREE.MeshStandardMaterial({ color: 0xffb636, emissive: 0xff8a20, emissiveIntensity: 0.6, transparent: true, opacity: 0 })); C.shipEngine.position.set(-90, -7.5, 0); ship.add(C.shipEngine);
  C.shipShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 105, 12), new THREE.MeshStandardMaterial({ color: 0xd8dbe6, metalness: 0.8, roughness: 0.25, transparent: true, opacity: 1 })); C.shipShaft.rotation.z = Math.PI / 2; C.shipShaft.position.set(-153.5, -8, 0); ship.add(C.shipShaft);
  C.thrustBrg = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.2, 20), new THREE.MeshStandardMaterial({ color: 0xff4d7a, emissive: 0xff4d7a, emissiveIntensity: 0.3, transparent: true, opacity: 0 })); C.thrustBrg.rotation.z = Math.PI / 2; C.thrustBrg.position.set(-108, -8, 0); ship.add(C.thrustBrg);
  // wake
  const wakeTex = textTexture(256, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.75)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const wake = new THREE.Mesh(new THREE.PlaneGeometry(500, 40), new THREE.MeshBasicMaterial({ map: wakeTex, transparent: true, depthWrite: false })); wake.rotation.x = -Math.PI / 2; wake.position.set(-450, 1.6, 0); ship.add(wake);
  const bow = new THREE.Mesh(new THREE.RingGeometry(20, 34, 32, 1, -Math.PI / 2.4, Math.PI / 1.2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); bow.rotation.x = -Math.PI / 2; bow.position.set(190, 1.7, 0); ship.add(bow);
}
// ---------- hero propeller: 6 skewed, twisted blades, 9.6 m, pitch ~9 m; axis = x; pushes water toward -x ----------
const PROP_X = -207, PROP_Y = -8, PR = 4.8, PITCH = 9.0;
const bronze = new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.85, roughness: 0.28, side: THREE.DoubleSide });
C.prop = new THREE.Group(); C.prop.position.set(PROP_X, PROP_Y, 0); ship.add(C.prop);
const pitchAng = (r) => Math.atan(PITCH / (2 * Math.PI * r)); // steep near hub, flat at tip
{
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.15, 2.6, 28), bronze); hub.rotation.z = Math.PI / 2; C.prop.add(hub);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), bronze); cap.rotation.z = Math.PI / 2; cap.position.x = -1.3; C.prop.add(cap);
  const NR = 22, NC = 12, geo = new THREE.BufferGeometry(), pos = [], idx = [];
  for (let i = 0; i <= NR; i++) { const r = 1.0 + (PR - 1.0) * i / NR, u = i / NR; const chord = (1.5 + 1.6 * Math.sin(Math.PI * Math.min(1, u * 1.15))) * (u > 0.85 ? Math.sqrt(Math.max(0.02, (1 - u) / 0.15)) : 1); const skew = 0.9 * u * u; const ph = pitchAng(r);
    for (let j = 0; j <= NC; j++) { const s = (j / NC - 0.5) * chord + skew; // along the chord
      const thick = 0.05 * (1 - u * 0.6) * Math.sin(Math.PI * j / NC); pos.push(-s * Math.sin(ph) + thick * Math.cos(ph), r, s * Math.cos(ph) + thick * Math.sin(ph)); } }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NC; j++) { const a = i * (NC + 1) + j, b2 = a + 1, c2 = a + NC + 1, d = c2 + 1; idx.push(a, c2, b2, b2, c2, d); }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  C.blades = []; for (let k = 0; k < 6; k++) { const arm = new THREE.Group(); arm.rotation.x = k * Math.PI / 3; const bl = new THREE.Mesh(geo, bronze); bl.castShadow = true; arm.add(bl); C.prop.add(arm); C.blades.push(arm); }
  // cast maker's stamp on the hub (blended branding)
  const st = textTexture(512, 64, (g, w, h) => { g.fillStyle = '#c99a3a'; g.fillRect(0, 0, w, h); g.font = '22px PS2P'; g.fillStyle = 'rgba(60,40,10,0.75)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ENGINEERS WITHOUT SLEEP * 131 T', w / 2, h / 2 + 1); });
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.01, 1.01, 0.5, 40, 1, true), new THREE.MeshStandardMaterial({ map: st, metalness: 0.7, roughness: 0.35 })); ring.rotation.z = Math.PI / 2; ring.position.x = 0.6; C.prop.add(ring);
  // rudder behind
  const rud = box(8, 13, 1.2, new THREE.MeshStandardMaterial({ color: 0xb8322f, roughness: 0.6 }), PROP_X - 7, PROP_Y + 1, 0, ship); C.rudder = rud;
  const rs = cyl(0.4, 10, toon(0x9aa3b5), 12, ship); rs.position.set(PROP_X - 7, PROP_Y + 9, 0);
}
// diver for scale (1.8 m)
C.diver = new THREE.Group(); C.diver.position.set(PROP_X + 2.5, PROP_Y - 1, 6.5); ship.add(C.diver);
{
  const suit = toon(0x1c1c22, { roughness: 0.6 }), tank = toon(0xffb636, { metalness: 0.4 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.9, 6, 10), suit); body.rotation.z = Math.PI / 2 - 0.3; C.diver.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), suit); head.position.set(0.68, 0.22, 0); C.diver.add(head);
  const mask = box(0.06, 0.1, 0.18, toon(0x4fe0ff, { emissive: 0x1a5a6a }), 0.82, 0.24, 0, C.diver);
  const tk = cyl(0.11, 0.6, tank, 10, C.diver); tk.rotation.z = Math.PI / 2 - 0.3; tk.position.set(0.05, 0.28, 0);
  [-0.12, 0.12].forEach((z) => { const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.6, 4, 8), suit); leg.rotation.z = Math.PI / 2 - 0.2; leg.position.set(-0.75, -0.18, z); C.diver.add(leg); const fin = box(0.4, 0.03, 0.18, toon(0xffb636), -1.25, -0.28, z, C.diver); });
}
// water flow particles through the prop (instanced), cavitation bubbles, thrust arrows, helix trail
const NP = 220; C.water = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 6, 4), new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: 0.85 }), NP); C.water.frustumCulled = false; ship.add(C.water);
const NB = 120; C.bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), NB); C.bub.frustumCulled = false; C.prop.add(C.bub);
const mkArrow = (col, r = 0.35) => { const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: col }); const sh = cyl(r, 1, m, 10, g); sh.position.y = 0.5; const hd = new THREE.Mesh(new THREE.ConeGeometry(r * 2.6, r * 5, 12), m); hd.position.y = 1 + r * 2.5; g.add(hd); g.userData = { sh, hd, r }; return g; };
const setArrow = (a, len) => { a.userData.sh.scale.y = Math.max(0.01, len); a.userData.sh.position.y = len / 2; a.userData.hd.position.y = len + a.userData.r * 2.5; a.visible = len > 0.1; };
C.arrWater = mkArrow(0x4fe0ff, 0.45); C.arrWater.rotation.z = Math.PI / 2; C.arrWater.position.set(PROP_X - 2, PROP_Y, 0); ship.add(C.arrWater);
C.arrShip = mkArrow(0xff4d7a, 0.45); C.arrShip.rotation.z = -Math.PI / 2; C.arrShip.position.set(PROP_X + 2, PROP_Y + 0.0, 0); ship.add(C.arrShip);
C.helix = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 241 }, (_, i) => { const th = i / 240 * Math.PI * 6; return new THREE.Vector3(PROP_X - PITCH * th / (2 * Math.PI), PROP_Y + Math.cos(th) * PR, Math.sin(th) * PR); })), new THREE.LineBasicMaterial({ color: 0x43e8b0, transparent: true, opacity: 0 })); ship.add(C.helix);
ship.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
function updateOcean(t) {
  const p = oceanGeo.attributes.position.array, adv = t * 6;
  for (let i = 0; i < p.length; i += 3) { const x = oBase[i] + adv, z = oBase[i + 2];
    p[i + 1] = 1.6 * Math.sin(x * 0.012 + t * 0.9) + 1.0 * Math.sin(z * 0.02 - t * 1.3 + x * 0.004) + 0.6 * Math.sin((x + z) * 0.035 + t * 1.7); }
  oceanGeo.attributes.position.needsUpdate = true; oceanGeo.computeVertexNormals();
}
const wallMats = [];
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


// ---------- shots (ship coordinates; ship sits at the world origin) ----------
C.blurDisc = new THREE.Mesh(new THREE.CircleGeometry(PR, 48), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false })); C.blurDisc.rotation.y = Math.PI / 2; C.prop.add(C.blurDisc);
const V = (a) => new THREE.Vector3(...a);
const P0 = [PROP_X, PROP_Y, 0];
const HOOK = {
  shipWide: [[-120, 40, 260], [-110, 38, 250], [0, 10, 0]],
  propUnder: [[-193, -6, 18], [-194, -6.2, 17], P0],
  hub: [[-201, -7.2, 6.5], [-201.5, -7.3, 6], P0],
  tipClose: [[-202, -2.0, 6.5], [-202.5, -2.2, 6], [-207, -3.6, 0]],
  wake: [[-150, 22, 60], [-158, 20, 56], [-260, 1, 0]],
  diverScale: [[-191, -5.5, 22], [-192, -5.7, 21], [-205, -8, 3]],
  sternAbove: [[-160, 20, 75], [-165, 18, 70], [-205, 0, 0]],
  propSide: [[-207, -8, 24], [-206, -8.2, 23], P0],
};
const SHOTS = [ // [b0, b1, pos0, pos1, tgt0, tgt1]
  [8, 16, [-218, -4, 30], [-213, -5.5, 23], [-205.5, -8, 2], [-205.5, -8, 2]],
  [16, 24, [-199.5, -3.5, 12.5], [-200.5, -4, 11], [-207, -5, 0], [-207, -5.2, 0]],
  [24, 32, [-228, -3, 22], [-226, -3.5, 20], [-209, -8, 0], [-209, -8, 0]],
  [32, 40, [-188, -3, 36], [-185, -4, 32], [-205, -8, 0], [-204, -8, 0]],
  [40, 48, [-196, -3, 26], [-198, -4, 23], [-217, -8, 0], [-217, -8, 0]],
  [48, 56, [-199.5, -4.5, 12], [-200.5, -5, 10.5], [-207, -6, 0], [-207, -6, 0]],
  [56, 64, [-70, -13, 26], [-76, -13, 21], [-160, -8, 0], [-162, -8, 0]],
  [64, 72, [60, 26, 210], [-20, 22, 195], [0, 12, 0], [0, 12, 0]],
  [72, 81, [-187, -5, 27], [-193, -6, 21], [-206, -8, 2], [-206, -8, 2]],
];
function camAt(b) {
  if (b < 8) { const [p0, p1, tg] = HOOK[TL.HOOK_SHOTS[Math.floor(b)]]; const u = b - Math.floor(b); return { pos: V(p0).lerp(V(p1), u), tgt: V(tg) }; }
  const s = SHOTS.find((x) => b >= x[0] && b < x[1]) || SHOTS[SHOTS.length - 1]; const u = TL.ease((b - s[0]) / (s[1] - s[0]));
  return { pos: V(s[2]).lerp(V(s[3]), u), tgt: V(s[4]).lerp(V(s[5]), u) };
}
const hash = (n) => { const h = Math.sin(n * 127.1 + 311.7) * 43758.5453; return h - Math.floor(h); };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(1, 1, 1), p4 = new THREE.Vector3();
const WS = (x, y, z) => ship.localToWorld(new THREE.Vector3(x, y, z));

window.renderFrame = function (t) {
  const b = t / TL.B, frame = Math.round(t * 30), blur = TL.isBlur(b), under = TL.underwater(b);
  const { pos, tgt } = camAt(b);
  const pd = TL.propDeg(b, frame), pr = pd * Math.PI / 180;
  C.prop.rotation.x = -pr; C.blurDisc.material.opacity = blur ? 0.32 : 0;
  updateOcean(t);
  ship.rotation.z = Math.sin(t * 0.6) * 0.003; ship.position.y = Math.sin(t * 0.8) * 0.3;
  C.diver.position.y = PROP_Y - 1 + Math.sin(t * 1.3) * 0.15; C.diver.visible = (b >= 8 && b < 24) || b >= 72 || (b < 8 && TL.HOOK_SHOTS[Math.floor(b)] === 'diverScale');
  // environment
  if (under) { scene.background = new THREE.Color(0x0b4656); scene.fog = scene.fog || new THREE.Fog(0x0b4656, 3, 80); scene.fog.color.set(0x0b4656); scene.fog.near = 4; scene.fog.far = b >= 56 && b < 64 ? 280 : 85; oceanMat.color.set(0x6ad4e0); oceanMat.opacity = 0.9; hemi.color.set(0x8ae0e8); hemi.groundColor.set(0x062a36); sun.intensity = 1.6; sun.color.set(0xbff0ff); }
  else { scene.background = skyTex; scene.fog.color.set(0xd98a7a); scene.fog.near = 600; scene.fog.far = 3200; oceanMat.color.set(0x1f5f8f); hemi.color.set(0xffc9b0); hemi.groundColor.set(0x1d2f55); sun.intensity = 3.2; sun.color.set(0xffb98a); }
  const xray = b >= 56 && b < 64 ? TL.ease((b - 56.3) / 1) : (b >= 24 && b < 48 ? 0.55 : 0);
  C.rudder.material.transparent = true; C.rudder.material.opacity = b >= 24 && b < 48 ? 0.28 : 1; C.rudder.material.depthWrite = !(b >= 24 && b < 48);
  hullMats.forEach((m) => { m.opacity = 1 - 0.75 * xray; m.depthWrite = xray < 0.5; });
  if (!under) { oceanMat.opacity = 1 - 0.75 * (b >= 56 && b < 64 ? xray : 0); oceanMat.depthWrite = oceanMat.opacity > 0.6; }
  C.shipEngine.material.opacity = b >= 56 && b < 64 ? xray : 0; C.shipEngine.material.emissiveIntensity = 0.5 + 0.5 * Math.exp(-((b % 1) * TL.B) * 6);
  C.thrustBrg.material.opacity = b >= 36 && b < 40 ? TL.ease((b - 36) / 0.8) : (b >= 56 && b < 64 ? xray * 0.6 : 0);
  // water through the prop
  const showW = (b >= 24 && b < 48) || b >= 72 || (b < 8 && ['propUnder', 'propSide', 'tipClose'].includes(TL.HOOK_SHOTS[Math.floor(b)]));
  const clock = pd / 360;
  for (let k = 0; k < NP; k++) { const r = PR * 0.95 * Math.sqrt(hash(k)), a0 = 2 * Math.PI * hash(k * 3 + 1), s = (clock * 0.22 + hash(k * 7 + 2)) % 1;
    let x, rr = r, a = a0; if (s < 0.45) x = PROP_X + 14 - 14 * (s / 0.45); else { const u = (s - 0.45) / 0.55; x = PROP_X - 34 * u; rr = r * (1 - 0.18 * Math.min(1, u * 3)); a = a0 - u * 2.2; }
    p4.set(x, PROP_Y + Math.cos(a) * rr, Math.sin(a) * rr); s4.setScalar(showW ? (s < 0.45 ? 0.8 : 1.15) : 0); m4.compose(p4, q4, s4); C.water.setMatrixAt(k, m4); }
  C.water.instanceMatrix.needsUpdate = true;
  // cavitation bubbles on the blade backs near the tips (only in the "too fast" what-if)
  for (let k = 0; k < NB; k++) { const bl = k % 6, ph = (t * 3 + hash(k)) % 1, r = 3.4 + 1.3 * hash(k * 5), ang = bl * Math.PI / 3 + (hash(k * 11) - 0.5) * 0.25 - ph * 0.6; const on = blur;
    p4.set(-0.25 - ph * 1.5, Math.cos(ang) * r, Math.sin(ang) * r); s4.setScalar(on ? Math.sin(Math.PI * ph) * 1.6 + 0.2 : 0); m4.compose(p4, q4, s4); C.bub.setMatrixAt(k, m4); }
  C.bub.instanceMatrix.needsUpdate = true;
  // thrust arrows, helix
  setArrow(C.arrWater, b >= 32.5 && b < 40 ? 9 * TL.ease((b - 32.5) / 0.6) : 0);
  setArrow(C.arrShip, b >= 33.5 && b < 40 ? 9 * TL.ease((b - 33.5) / 0.6) : 0);
  C.helix.material.opacity = b >= 41 && b < 48 ? TL.ease((b - 41) / 1) : 0;

  // camera
  const sbar = (b % 4) * TL.B, sb = (b % 1) * TL.B;
  if (b >= 32 && b < 33) { const k = Math.exp(-(b - 32) * TL.B * 6) * 0.25; pos.x += Math.sin(t * 80) * k; pos.y += Math.cos(t * 70) * k; }
  camera.position.copy(pos); camera.up.set(0, 1, 0); camera.lookAt(tgt); camera.near = 0.1; camera.far = 4000;
  camera.fov = 35 - (b >= 8 ? 1.2 * Math.exp(-sbar * 7) : 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const dist = pos.distanceTo(tgt), sz = under ? Math.max(8, Math.min(40, dist * 0.8)) : 260;
  sun.target.position.copy(tgt); sun.position.copy(tgt).add(new THREE.Vector3(-120, 160, 90).normalize().multiplyScalar(under ? 60 : 400));
  Object.assign(sun.shadow.camera, { left: -sz, right: sz, top: sz, bottom: -sz, near: 1, far: under ? 160 : 900 }); sun.shadow.camera.updateProjectionMatrix();
  bangLight.intensity = 0;
  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  if (under) { ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 6; i++) { const x = ((i * 157 + t * 20) % (W + 200)) - 100; const gr = ctx.createLinearGradient(x, 0, x + 120, H); gr.addColorStop(0, 'rgba(160,240,255,0.10)'); gr.addColorStop(1, 'rgba(160,240,255,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 60, 0); ctx.lineTo(x + 200, H); ctx.lineTo(x + 120, H); ctx.fill(); } ctx.globalCompositeOperation = 'source-over'; }
  dither();

  // ---- overlays ----
  const P = (x, y, z) => project(WS(x, y, z));
  // twist panel: blade section near hub (steep) vs at tip (flat)
  if (b >= 17 && b < 24) { const y0 = H - 300, k = TL.ease((b - 17) / 0.6); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(18,13,34,0.92)'; ctx.fillRect(40, y0, W - 80, 220);
    ctx.font = `14px ${FONT.ps}`; ctx.textBaseline = 'top'; ctx.fillStyle = COL.cream; ctx.fillText('BLADE SLICES', 60, y0 + 12);
    const sec = (cx, cy, ang, lab, col) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(-ang); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 90, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); ctx.fillStyle = col; ctx.font = `14px ${FONT.ps}`; ctx.textAlign = 'center'; ctx.fillText(lab, cx, cy + 70); ctx.textAlign = 'left';
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 110, cy); ctx.lineTo(cx + 110, cy); ctx.stroke(); ctx.fillStyle = COL.cream; ctx.fillText(`${Math.round(ang * 180 / Math.PI)} DEG`, cx - 40, cy - 64); };
    sec(205, y0 + 120, pitchAng(1.2), 'NEAR HUB', COL.amber); sec(515, y0 + 120, pitchAng(4.6), 'AT THE TIP', COL.cyan); ctx.globalAlpha = 1; ctx.textBaseline = 'middle'; }
  if (b >= 32 && b < 34) drawPop('PUSH!', P(PROP_X + 6, PROP_Y + 5, 0), (b - TL.PUSH) * TL.B, COL.pink, 36);
  if (b >= 33 && b < 40) { const a = P(PROP_X - 12, PROP_Y - 2.5, 0), c = P(PROP_X + 12, PROP_Y - 2.5, 0); ctx.font = `16px ${FONT.ps}`; ctx.textAlign = 'center'; ctx.fillStyle = COL.cyan; ctx.fillText('WATER', a.x, a.y); if (b >= 34) { ctx.fillStyle = COL.pink; ctx.fillText('SHIP', c.x, c.y); } ctx.textAlign = 'left'; }
  // thrust arrows (water back, ship forward)
  if (b >= 32.5 && b < 40) { const k1 = TL.ease((b - 32.5) / 0.6), k2 = TL.ease((b - 33.5) / 0.6); const o = P(PROP_X - 1.5, PROP_Y, 0), wa = P(PROP_X - 1.5 - 12 * k1, PROP_Y, 0); arrow(o.x, o.y, wa.x, wa.y, COL.cyan, 10);
    if (k2 > 0) { const o2 = P(PROP_X + 1.5, PROP_Y + 2.5, 0), sa = P(PROP_X + 1.5 + 12 * k2, PROP_Y + 2.5, 0); arrow(o2.x, o2.y, sa.x, sa.y, COL.pink, 10); } }
  // the screw path the blade tips trace through the water (aft of the prop)
  if (b >= 41 && b < 48) { const k = TL.ease((b - 41) / 1.5); ctx.strokeStyle = COL.mint; ctx.lineWidth = 5; ctx.beginPath(); const N = 160, th0 = -pr;
    for (let i = 0; i <= N * k; i++) { const th = i / N * Math.PI * 6, q = P(PROP_X - PITCH * th / (2 * Math.PI), PROP_Y + Math.cos(th0 + th) * PR, Math.sin(th0 + th) * PR); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); } ctx.stroke();
    const t1 = P(PROP_X, PROP_Y + Math.cos(th0) * PR, Math.sin(th0) * PR); ctx.fillStyle = COL.yellow; ctx.fillRect(t1.x - 7, t1.y - 7, 14, 14); }
  // shaft line from the prop to the engine (x-ray)
  if (b >= 57 && b < 64) { const k = TL.ease((b - 57) / 1.2), a0 = P(PROP_X + 1, PROP_Y, 0), a1 = P(PROP_X + 1 + (-90 - PROP_X) * k, PROP_Y, 0); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke(); }
  const tipA = -pr + Math.PI / 3; const anchors = {
    hub: P(PROP_X + 1.3, PROP_Y - 0.6, 0.9), blade: P(PROP_X, PROP_Y + Math.cos(-pr) * 3.6, Math.sin(-pr) * 3.6), diver: P(...C.diver.position.toArray()), rudder: P(PROP_X - 7, PROP_Y - 4, 0.7),
    thrust: P(-108, -8, 0), bubbles: P(PROP_X - 0.5, PROP_Y + 4.2, 0.5), engine: P(-90, -2, 0), shaft: P(-150, -8, 0),
  };
  TL.LABELS.forEach((lb) => drawLabel(lb, anchors[lb.id], b));
  drawSpeedTag(b);
  TL.CAPTIONS.filter((cp) => b >= cp.t0 && b < cp.t1).forEach((cp) => drawCaption(cp, b));
  drawHandle();
  return out.toDataURL('image/jpeg', 0.92);
};
window.ready = Promise.resolve(true);
