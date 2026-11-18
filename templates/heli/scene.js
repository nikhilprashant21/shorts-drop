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


// ================= HELICOPTER TOPIC (units: metres; nose = +x, rotor CCW from above) =================
scene.background = new THREE.Color(0x1a1c34); scene.fog = new THREE.Fog(0x1a1c34, 40, 120);
// ---------- hangar ----------
{
  const ft = textTexture(256, 256, (g, w, h) => { g.fillStyle = '#6a7186'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(230,235,255,${Math.random() * 0.08})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); });
  ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(16, 16);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.4, metalness: 0.05 })); floor.rotation.x = -Math.PI / 2; floor.position.set(4, 0, 0); floor.receiveShadow = true; scene.add(floor);
  // helipad: yellow ring + H + ring lettering (blended branding)
  const pt = textTexture(1024, 1024, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#ffd84a'; g.lineWidth = 26; g.beginPath(); g.arc(w / 2, h / 2, 440, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(240,240,240,0.85)'; g.fillRect(330, 260, 80, 504); g.fillRect(614, 260, 80, 504); g.fillRect(410, 470, 204, 84);
    g.save(); g.translate(w / 2, h / 2); const txt = 'ENGINEERS WITHOUT SLEEP * HELIPAD 01 * '; g.font = '30px PS2P'; g.fillStyle = 'rgba(255,216,74,0.75)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let k = 0; k < txt.length; k++) { g.save(); g.rotate(k / txt.length * Math.PI * 2); g.translate(0, -390); g.fillText(txt[k], 0, 0); g.restore(); } g.restore(); });
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshStandardMaterial({ map: pt, transparent: true, roughness: 0.5 })); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.02, 0); pad.receiveShadow = true; scene.add(pad);
  // back wall with hangar door ribs and lights
  const wt = textTexture(512, 256, (g, w, h) => { g.fillStyle = '#2b2e4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#353a5c'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 16, h); g.fillStyle = '#ffd84a'; g.fillRect(0, h - 18, w, 6); });
  wt.wrapS = THREE.RepeatWrapping; wt.repeat.set(4, 1);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(140, 30), new THREE.MeshBasicMaterial({ map: wt })); wall.position.set(4, 15, -24); scene.add(wall); wall.userData.wall = 1;
  const wall2 = wall.clone(); wall2.material = wall.material.clone(); wall2.rotation.y = Math.PI / 2; wall2.position.set(-30, 15, 0); scene.add(wall2); wall2.userData.wall = 1;
  for (let i = 0; i < 6; i++) { const l = box(4, 0.25, 0.6, new THREE.MeshBasicMaterial({ color: 0xfff4dc }), -18 + i * 9, 22, -10, scene); }
  // props: barrels, cones, tool cart, crates
  const barrel = (x, z, c) => { const m = cyl(0.32, 0.9, toon(c, { metalness: 0.4, roughness: 0.4 }), 18, scene); m.position.set(x, 0.45, z); m.castShadow = true; };
  barrel(-9, -8, 0xe0313b); barrel(-8.2, -8.6, 0x3d7bff); barrel(-8.6, -7.6, 0xe0313b);
  [[7.5, 6.5], [-7.5, 6.5], [7.5, -6.5], [-7.5, -6.5]].forEach(([x, z]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 16), toon(0xff7a2f)); c.position.set(x, 0.35, z); c.castShadow = true; scene.add(c); });
  const crate = box(1.4, 1.2, 1.2, toon(0x9a7a4a, { roughness: 0.85 }), 10, 0.6, -9, scene); crate.castShadow = true; const c2 = box(1.0, 0.9, 1.0, toon(0x8a6a3a, { roughness: 0.85 }), 10.2, 1.65, -9.1, scene); c2.rotation.y = 0.3;
}
const wallMats = []; scene.traverse((o) => { if (o.userData.wall) { o.material.userData.base = o.material.color.clone(); wallMats.push(o.material); } });

// ---------- helicopter ----------
const HUB_Y = 3.25, RAD = 5.03;
const heli = new THREE.Group(); scene.add(heli);
const body = new THREE.Group(); heli.add(body);
const Hh = {};
{
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xc81e3a, metalness: 0.2, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.2 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf4f1ea, metalness: 0.1, roughness: 0.35, clearcoat: 1 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x223a5a, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.55, clearcoat: 1 });
  const metal = toon(0xb9bfcc, { metalness: 0.7, roughness: 0.3 }), dark = toon(0x2a2c3c, { roughness: 0.5 });
  // cabin: scaled sphere, glass on the front
  const cab = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), paint); cab.scale.set(1.35, 0.85, 0.72); cab.position.set(0.4, 1.35, 0); body.add(cab);
  const ws = new THREE.Mesh(new THREE.SphereGeometry(1.01, 32, 20, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.12, Math.PI * 0.5), glass); ws.scale.copy(cab.scale); ws.position.copy(cab.position); ws.rotation.y = Math.PI / 2; body.add(ws);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38), white); belly.scale.set(1.36, 0.86, 0.73); belly.position.copy(cab.position); body.add(belly);
  // engine/transmission cowl + mast
  const cowl = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.7, 0.9, 3, 0.08), paint); cowl.position.set(-0.6, 2.05, 0); body.add(cowl);
  const mast = cyl(0.08, 1.0, metal, 12, body); mast.position.set(0, 2.75, 0);
  // tail boom (tapered), fin, stabiliser, decal + registration
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.24, 5.6, 16), paint); boom.rotation.z = Math.PI / 2; boom.position.set(-3.6, 1.65, 0); body.add(boom);
  const finS = new THREE.Shape(); finS.moveTo(0, 0); finS.lineTo(0.55, 0); finS.lineTo(0.2, 1.1); finS.lineTo(-0.15, 1.1); finS.lineTo(-0.1, 0); finS.lineTo(0, 0);
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(finS, { depth: 0.05, bevelEnabled: false }), paint); fin.position.set(-6.55, 1.62, -0.025); body.add(fin);
  const finL = new THREE.Mesh(new THREE.ExtrudeGeometry(finS, { depth: 0.05, bevelEnabled: false }), paint); finL.scale.y = -0.6; finL.position.set(-6.55, 1.66, -0.025); body.add(finL);
  const stab = box(0.5, 0.04, 1.3, paint, -6.0, 1.66, 0, body);
  const decal = (txt, w, h, font) => textTexture(w, h, (g, cw, ch) => { g.clearRect(0, 0, cw, ch); g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(244,241,234,0.92)'; g.fillText(txt, cw / 2, ch / 2 + 2); });
  [1, -1].forEach((sd) => {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.22), new THREE.MeshBasicMaterial({ map: decal('ENGINEERS WITHOUT SLEEP', 1024, 64, '34px PS2P'), transparent: true }));
    d.position.set(-3.5, 1.68, sd * 0.2); d.rotation.y = sd > 0 ? 0 : Math.PI; d.rotation.z = (sd > 0 ? 1 : -1) * 0.022; body.add(d);
    const r = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.16), new THREE.MeshBasicMaterial({ map: decal('NO-SLEEP', 256, 64, '30px PS2P'), transparent: true }));
    r.position.set(-6.45, 2.05, sd * 0.03); r.rotation.y = sd > 0 ? 0 : Math.PI; body.add(r);
    const st = box(1.9, 0.07, 0.02, white, 0.6, 1.02, sd * 0.68, body); st.rotation.y = sd * 0.1;
  });
  // skids
  [1, -1].forEach((sd) => { const sk = cyl(0.05, 3.6, metal, 10, body); sk.rotation.z = Math.PI / 2; sk.position.set(0.3, 0.05, sd * 1.05);
    const tip = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 12, Math.PI / 2), metal); tip.position.set(2.1, 0.23, sd * 1.05); tip.rotation.z = -Math.PI / 2; body.add(tip);
    [-0.7, 1.1].forEach((x) => { const s = cyl(0.045, 0.75, metal, 8, body); s.position.set(x, 0.42, sd * 0.85); s.rotation.x = sd * 0.5; }); });
  // swashplate (lower fixed ring + upper rotating ring)
  Hh.swash = new THREE.Group(); Hh.swash.position.set(0, 2.55, 0); body.add(Hh.swash);
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 24), toon(0x4fe0ff, { metalness: 0.6, roughness: 0.3 })); Hh.swash.add(lower);
  Hh.swashTop = new THREE.Group(); Hh.swash.add(Hh.swashTop); const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24), toon(0xffb636, { metalness: 0.6 })); upper.position.y = 0.07; Hh.swashTop.add(upper);
  // main rotor: hub + 2 blades with an airfoil section (NACA-ish), chord 0.27 m
  Hh.rotor = new THREE.Group(); Hh.rotor.position.set(0, HUB_Y, 0); body.add(Hh.rotor);
  const hub = cyl(0.16, 0.18, metal, 16, Hh.rotor);
  const af = new THREE.Shape(); const C = 0.27, T = 0.12; const pts = [];
  for (let i = 0; i <= 24; i++) { const x = 1 - (1 - Math.cos(Math.PI * i / 24)) / 2; pts.push([x, 5 * T * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4)]); }
  pts.forEach(([x, y], i) => { const px = (x - 0.25) * C, py = y * C; i ? af.lineTo(px, py) : af.moveTo(px, py); }); for (let i = pts.length - 2; i >= 0; i--) { const [x, y] = pts[i]; af.lineTo((x - 0.25) * C, -y * C); }
  const bladeGeo = new THREE.ExtrudeGeometry(af, { depth: RAD - 0.6, bevelEnabled: false, steps: 1, curveSegments: 1 }); bladeGeo.translate(0, 0, 0.35);
  const tipGeo = new THREE.ExtrudeGeometry(af, { depth: 0.25, bevelEnabled: false, steps: 1, curveSegments: 1 }); tipGeo.translate(0, 0, RAD - 0.25);
  const bladeM = toon(0xe8ecf4, { metalness: 0.4, roughness: 0.35 }), tipM = toon(0xffd84a);
  Hh.blades = [0, 1].map((k) => { const arm = new THREE.Group(); arm.rotation.y = k * Math.PI; Hh.rotor.add(arm);
    const pitchG = new THREE.Group(); arm.add(pitchG);
    const bl = new THREE.Mesh(bladeGeo, bladeM); bl.scale.x = -1; pitchG.add(bl); // leading edge faces +x = direction of travel (CCW from above)
    const tipC = new THREE.Mesh(tipGeo, tipM); tipC.scale.x = -1; pitchG.add(tipC);
    const grip = box(0.16, 0.12, 0.42, metal, 0, 0, 0.3, pitchG);
    return { arm, pitchG }; });
  // blades extrude along +z of the arm: chord along x (leading edge at +x? leading edge is x=-0.25C side). Set arm so blade points out along local +z; rotor CCW from above means the blade moves toward -x of its local frame when pointing +z... handled by leading-edge sign below
  Hh.tail = new THREE.Group(); Hh.tail.position.set(-6.62, 1.95, 0.24); body.add(Hh.tail);
  [0, 1].forEach((k) => { const tb = box(0.1, 0.73, 0.02, bladeM, 0, 0, 0, Hh.tail); tb.geometry.translate(0, 0.365, 0); tb.rotation.z = k * Math.PI; });
  const th = cyl(0.06, 0.1, metal, 10, Hh.tail); th.rotation.x = Math.PI / 2;
}
heli.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
// downwash air dots (instanced)
const ND = 260; Hh.air = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), new THREE.MeshBasicMaterial({ color: 0x9af0ff, transparent: true, opacity: 0.75 }), ND); Hh.air.frustumCulled = false; scene.add(Hh.air);
// lift arrows (one per blade, at 70% span) and a thrust arrow for the tail rotor
const mkArrow = (col) => { const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: col }); const sh = cyl(0.05, 1, m, 8, g); sh.position.y = 0.5; const hd = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 10), m); hd.position.y = 1.1; g.add(hd); g.userData.sh = sh; g.userData.hd = hd; return g; };
Hh.liftArrows = [0, 1].map(() => { const a = mkArrow(0xffd84a); scene.add(a); return a; });
Hh.tailArrow = mkArrow(0x4fe0ff); scene.add(Hh.tailArrow);
const setArrow = (a, len) => { a.userData.sh.scale.y = Math.max(0.01, len); a.userData.sh.position.y = len / 2; a.userData.hd.position.y = len + 0.15; a.visible = len > 0.05; };
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
  wide: [[15, 5, 17], [13, 5, 16], [0, 2.4, 0]],
  hubClose: [[2.2, 4.1, 2.6], [1.8, 4.0, 2.4], [0, 3.15, 0]],
  tipBlur: [[1.0, 3.9, 8.2], [0.6, 3.8, 7.8], [0, 3.25, 4.6]],
  tailRotor: [[-4.8, 2.4, 3.2], [-5.2, 2.5, 3.0], [-6.6, 1.95, 0.25]],
  cockpit: [[4.4, 1.9, 2.8], [4.0, 2.0, 2.6], [1.2, 1.4, 0]],
  skid: [[3.4, 0.45, 3.8], [3.0, 0.55, 3.5], [0.3, 0.45, 0.9]],
  topDown: [[0.1, 17, 2.4], [-0.1, 17, 2.2], [0, 3, 0]],
  boomDecal: [[-2.6, 2.3, 4.2], [-3.0, 2.3, 3.8], [-3.6, 1.68, 0.2]],
};
const SHOTS = [ // [b0, b1, pos0, pos1, tgt0, tgt1] relative to the helicopter position (x, y follow the pose)
  [8, 16, [17, 6, 21], [10, 4.6, 13], [0, 2.6, 0], [0, 2.8, 0]],
  [24, 32, [0, 21, 10], [0, 20, 8], [0, 3, 0], [0, 3, 0]],
  [32, 40, [11, 3, 15], [12, 4.6, 17], [0, 2.8, 0], [0, 4.0, 0]],
  [40, 48, [5, 5.5, 17], [3, 5.5, 16], [0, 4.0, 0], [0, 4.0, 0]],
  [48, 56, [9, 13, 13], [8, 12.5, 12], [0, 3.6, 0], [0, 3.6, 0]],
  [56, 64, [11, 3, 15], [7, 3.6, 12.5], [0, 4.0, 0], [0, 4.0, 0]],
  [64, 73, [16, 2, 22], [14, 2.5, 26], [0, 3.5, 0], [0, 6, 0]],
];
const WL = (o, x, y, z) => o.localToWorld(new THREE.Vector3(x, y, z));
const hash = (n) => { const h = Math.sin(n * 127.1 + 311.7) * 43758.5453; return h - Math.floor(h); };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(1, 1, 1), p4 = new THREE.Vector3();
let tailFreeze = null;

window.renderFrame = function (t) {
  const b = t / TL.B, frame = Math.round(t * 30), real = TL.isReal(b);
  const rd = TL.rotorDeg(b, frame), rr = rd * Math.PI / 180;
  const pose = TL.heliPose(b), col = TL.collective(b), cyc = TL.cyclic(b);
  heli.position.set(pose.x, pose.y, 0); heli.rotation.set(0, pose.yaw * Math.PI / 180, pose.pitch * Math.PI / 180);
  Hh.rotor.rotation.set(0, 0, -cyc * Math.PI / 180); Hh.rotor.children.forEach(() => {});
  const spin = new THREE.Euler(0, rr, 0); Hh.blades.forEach((bl, k) => { bl.arm.rotation.y = rr + k * Math.PI; });
  const showAoA = b >= 16 && b < 24 ? 7 * TL.ease((b - 16.3) / 0.8) : 0;
  Hh.blades.forEach((bl, k) => { const psi = rr + k * Math.PI; const p = col + showAoA + cyc * 0.9 * Math.cos(psi); bl.pitchG.rotation.z = p * Math.PI / 180; });
  Hh.swash.position.y = 2.55 + 0.02 * (col - 3); Hh.swash.rotation.z = -cyc * Math.PI / 180; Hh.swashTop.rotation.y = rr;
  // tail rotor (about 6x main rotor speed), stops while "off"
  const tailOff = b >= 50 && b < 52;
  if (!tailOff) Hh.tail.rotation.z = real ? hash(frame + 9) * Math.PI * 2 : rr * 6.07;
  // lift
  const liftK = 0.35 + 0.65 * TL.ease((b - 33) / 1.5) + (showAoA ? 0.4 : 0);
  // downwash dots
  const clock = real ? t * 6.67 : rd / 360; let n = 0;
  for (let k = 0; k < ND; k++) { const r = 4.7 * Math.sqrt(hash(k)), a = 2 * Math.PI * hash(k * 3 + 1), fall = ((clock * 0.9 * liftK + hash(k * 7 + 2) * 7) % 7);
    const lp = new THREE.Vector3(Math.sin(a) * r, HUB_Y - 0.25 - fall, Math.cos(a) * r); const wp = heli.localToWorld(lp);
    const vis = wp.y > 0.08 && b >= 8 && !(b >= 16 && b < 24); p4.copy(wp); q4.identity(); s4.setScalar(vis ? 1 : 0); m4.compose(p4, q4, s4); Hh.air.setMatrixAt(n++, m4); }
  Hh.air.instanceMatrix.needsUpdate = true; Hh.air.material.opacity = 0.35 + 0.45 * Math.min(1, liftK);
  // lift arrows on both blades (16-48), tail thrust arrow
  const showLift = b >= 16 && b < 48;
  heli.updateMatrixWorld(true);
  const rq = new THREE.Quaternion(); Hh.rotor.getWorldQuaternion(rq);
  Hh.blades.forEach((bl, k) => { const a = Hh.liftArrows[k]; const wp = WL(bl.pitchG, 0, 0.06, RAD * 0.72); a.position.copy(wp); a.quaternion.copy(rq); setArrow(a, showLift ? 0.5 + 1.2 * liftK : 0); });
  const tq = new THREE.Quaternion(); body.getWorldQuaternion(tq); const tArr = Hh.tailArrow; tArr.position.copy(WL(body, -6.62, 1.95, 0.4)); tArr.quaternion.copy(tq).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));
  setArrow(tArr, b >= 48 && b < 56 && !tailOff ? 1.4 : 0);

  // camera
  let pos, tgt;
  if (b < 8) { const [p0, p1, tg] = HOOK[TL.HOOK_SHOTS[Math.floor(b)]]; const u = b - Math.floor(b); pos = V(p0).lerp(V(p1), u); tgt = V(tg); }
  else if (b >= 16 && b < 24) { const bl = Hh.blades[0].arm; pos = WL(bl, 2.4, 1.5, RAD - 0.2); tgt = WL(bl, 0, 0.1, RAD - 1.6); }
  else { const s = SHOTS.find((x) => b >= x[0] && b < x[1]) || SHOTS[SHOTS.length - 1]; const u = TL.ease((b - s[0]) / (s[1] - s[0])); const off = new THREE.Vector3(pose.x, pose.y, 0);
    pos = V(s[2]).lerp(V(s[3]), u).add(off); tgt = V(s[4]).lerp(V(s[5]), u).add(off); }
  if (real && b >= 8) { const k = pos.distanceTo(tgt) * 0.0015; pos.x += Math.sin(t * 61) * k; pos.y += Math.cos(t * 53) * k; }
  const sb = (b % 1) * TL.B, sbar = (b % 4) * TL.B;
  camera.position.copy(pos); camera.up.set(0, 1, 0); camera.lookAt(tgt); camera.near = 0.05;
  camera.fov = 35 - (b >= 8 ? 1.2 * Math.exp(-sbar * 7) : 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  wallMats.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(1 + (b >= 8 ? 0.35 * Math.exp(-sb * 10) : 0)));
  const dist = pos.distanceTo(tgt), sz = Math.max(6, Math.min(30, dist * 0.75));
  sun.target.position.copy(heli.position); sun.position.copy(heli.position).add(new THREE.Vector3(8, 18, 10));
  Object.assign(sun.shadow.camera, { left: -sz, right: sz, top: sz, bottom: -sz, near: 1, far: 80 }); sun.shadow.camera.updateProjectionMatrix();
  const lift0 = Math.abs(b - TL.LIFTOFF) < 0.6 ? 1 - Math.abs(b - TL.LIFTOFF) / 0.6 : 0;
  bangLight.intensity = 0;
  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  dither();

  // ---- overlays ----
  const P = (v) => project(v);
  // SLICE panel: blade cross-section, air pushed down, lift up (16-24)
  if (b >= 16.5 && b < 24) {
    const y0 = H - 360, ph2 = 270, k = TL.ease((b - 16.5) / 0.6); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(18,13,34,0.92)'; ctx.fillRect(40, y0, W - 80, ph2);
    ctx.font = `16px ${FONT.ps}`; ctx.fillStyle = COL.cream; ctx.textBaseline = 'top'; ctx.fillText('BLADE SLICE', 60, y0 + 12); ctx.textBaseline = 'middle';
    const al = (col + showAoA) * Math.PI / 180, cx = 330, cy = y0 + 150, CH = 250, ca = Math.cos(-al), sa = Math.sin(-al);
    const tr = (x, y) => [cx + (x * ca - y * sa) * CH, cy + (x * sa + y * ca) * CH];
    const T2 = 0.12, prof = []; for (let i = 0; i <= 30; i++) { const x = (1 - Math.cos(Math.PI * i / 30)) / 2; prof.push([x - 0.3, 5 * T2 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4)]); }
    ctx.fillStyle = '#e8ecf4'; ctx.beginPath(); prof.forEach(([x, y], i) => { const [px, py] = tr(x, -y); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); for (let i = prof.length - 1; i >= 0; i--) { const [x, y] = prof[i]; const [px, py] = tr(x, y); ctx.lineTo(px, py); } ctx.fill();
    // streamlines: air arrives from the left (the blade moves left), leaves deflected down
    ctx.fillStyle = COL.cyan; const rows = [-0.32, -0.2, -0.1, 0.1, 0.2, 0.32];
    rows.forEach((r0, j) => { for (let i = 0; i < 12; i++) { const s2 = ((rd / 18 + i / 12 + j * 0.07) % 1 + 1) % 1, x = -0.9 + 1.9 * s2; const bump = Math.exp(-(((x - 0.05) / 0.35) ** 2)) * 0.06 * Math.sign(r0);
      let y = r0 + bump; if (x > 0.2) y += Math.tan(al + 0.08) * (x - 0.2) * (r0 < 0 ? 1.3 : 0.9); const px = cx + x * CH, py = cy + y * CH; if (px < 52 || px > W - 52 || py < y0 + 34 || py > y0 + ph2 - 10) continue; ctx.fillRect(Math.round(px - 4), Math.round(py - 4), 8, 8); } });
    if (b >= 20) { arrow(cx + 20, cy - 30, cx + 20, cy - 110, COL.yellow, 8); ctx.font = `16px ${FONT.ps}`; ctx.fillStyle = COL.yellow; ctx.fillText('LIFT', cx + 40, cy - 96);
      arrow(cx + 230, cy + 30, cx + 250, cy + 100, COL.cyan, 6); ctx.fillStyle = COL.cyan; ctx.fillText('AIR DOWN', cx + 120, cy + 110); }
    ctx.globalAlpha = 1;
  }
  // speed bars along a blade, 24-32
  if (b >= 24.5 && b < 32) { const arm = Hh.blades[0].arm; for (let k = 1; k <= 5; k++) { const r = k * RAD / 5 - 0.1, a0 = P(WL(arm, 0, 0.1, r)), a1 = P(WL(arm, 0.9 * r / RAD * 2.2, 0.1, r)); arrow(a0.x, a0.y, a1.x, a1.y, k === 5 ? COL.pink : COL.cream, 3 + k); } }
  // torque arrows (tail scene)
  if (b >= 48.5 && b < 56) { const hub = WL(body, 0, HUB_Y + 0.3, 0); ctx.lineWidth = 6;
    const arc = (cx, r, a0, a1, colr, y) => { ctx.strokeStyle = colr; ctx.beginPath(); for (let i = 0; i <= 24; i++) { const a = a0 + (a1 - a0) * i / 24, q = P(heli.localToWorld(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r))); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); } ctx.stroke(); };
    arc(0, 2.6, 0.2, 2.6, COL.amber, HUB_Y + 0.35);
    if (b >= 50 && b < 53) arc(0, 1.9, 2.6, 0.2, COL.pink, 1.0);
    const lab = (txt, v, c) => { const q = P(v); ctx.font = `14px ${FONT.ps}`; ctx.fillStyle = 'rgba(18,13,34,0.85)'; const w2 = ctx.measureText(txt).width + 12; ctx.fillRect(q.x - w2 / 2, q.y - 12, w2, 24); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, q.x, q.y + 1); ctx.textAlign = 'left'; };
    lab('ROTOR', heli.localToWorld(new THREE.Vector3(0, HUB_Y + 0.35, 2.6)), COL.amber); if (b >= 50 && b < 53) lab('BODY', heli.localToWorld(new THREE.Vector3(0, 1.0, -1.9)), COL.pink); }
  if (b >= 35 && b < 37) drawPop('LIFT OFF!', P(WL(body, 0, 0.2, 1.2)), (b - TL.LIFTOFF) * TL.B, COL.yellow, 30);
  const anchors = {
    rotor: P(WL(Hh.blades[1].pitchG, 0, 0, 3.2)), swash: P(WL(Hh.swash, -0.26, 0, 0)), tail: P(WL(Hh.tail, 0, 0, 0)),
    lift: P(Hh.liftArrows[0].localToWorld(new THREE.Vector3(0, 1.6, 0))), air: { x: 120, y: H - 230, z: 0 },
    tip: P(WL(Hh.blades[0].pitchG, 0, 0, RAD - 0.1)), root: P(WL(Hh.blades[0].pitchG, 0, 0, 0.8)), swash2: P(WL(Hh.swash, -0.26, 0, 0)),
    disc: P(WL(Hh.blades[1].pitchG, 0, 0, RAD - 0.3)), tail2: P(WL(Hh.tail, 0, 0, 0)),
  };
  TL.LABELS.forEach((lb) => drawLabel(lb, anchors[lb.id], b));
  drawSpeedTag(b);
  TL.CAPTIONS.filter((cp) => b >= cp.t0 && b < cp.t1).forEach((cp) => drawCaption(cp, b));
  drawHandle();
  return out.toDataURL('image/jpeg', 0.92);
};
window.ready = Promise.resolve(true);
