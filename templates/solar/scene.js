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


// ================= SOLAR TOPIC =================
// Set A: rooftop (metres) at origin. Set B: one cell cut open at "atom scale" at X0 (its own units).
const X0 = 600;
const skyTex = textTexture(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a5fc8'); gr.addColorStop(0.55, '#6aa8f0'); gr.addColorStop(1, '#ffe2b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
scene.background = skyTex; scene.fog = new THREE.Fog(0xbcd6f4, 40, 160);
const SUN_DIR = new THREE.Vector3(-0.35, 0.75, 0.55).normalize();
const A = {};
{
  // roof + parapet + neighbouring roofs
  const rt = textTexture(128, 128, (g, w, h) => { g.fillStyle = '#b9b2a4'; g.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(80,70,60,${Math.random() * 0.15})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); });
  rt.wrapS = rt.wrapT = THREE.RepeatWrapping; rt.repeat.set(10, 10);
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ map: rt, roughness: 0.9 })); roof.rotation.x = -Math.PI / 2; roof.receiveShadow = true; scene.add(roof);
  const wallM = toon(0xe8dcc4, { roughness: 0.85 });
  [[0, -7, 14, 0.25], [-7, 0, 0.25, 14], [7, 0, 0.25, 14]].forEach(([x, z, w, d]) => { const b2 = box(w, 0.9, d, wallM, x, 0.45, z, scene); b2.castShadow = true; b2.receiveShadow = true; });
  const city = toon(0xd8cbb0, { roughness: 0.9 });
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r = 22 + (i % 5) * 7, hgt = 2 + (i * 7 % 9); const bld = box(5 + (i % 3) * 2, hgt, 5, i % 4 ? city : toon(0xf0e6d4), Math.cos(a) * r, hgt / 2 - 3, Math.sin(a) * r - 4, scene); }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), toon(0x8aa070, { roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -3; scene.add(ground);
  // sun disc
  const st = textTexture(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,240,1)'); gr.addColorStop(0.35, 'rgba(255,240,180,0.9)'); gr.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  A.sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: st, depthWrite: false, fog: false })); A.sun.scale.setScalar(16); A.sun.position.copy(SUN_DIR.clone().multiplyScalar(120)); scene.add(A.sun);
}
// panels: 3 on a rack, 60 cells each (6 x 10), tilted 25 deg toward +z
const cellTex = textTexture(96, 96, (g, w, h) => { g.fillStyle = '#16244a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e3266'; g.fillRect(4, 4, w - 8, h - 8); g.fillStyle = 'rgba(200,210,230,0.55)'; for (let x = 6; x < w; x += 6) g.fillRect(x, 4, 1, h - 8); g.fillStyle = '#c9ccd8'; g.fillRect(28, 0, 4, h); g.fillRect(64, 0, 4, h); g.fillStyle = '#0e1630'; [[4, 4], [w - 12, 4], [4, h - 12], [w - 12, h - 12]].forEach(([x, y]) => g.fillRect(x, y, 8, 8)); });
A.panels = []; A.heroCells = [];
const PW = 1.0, PH = 1.7, TILT = 25 * Math.PI / 180;
{
  const alu = toon(0xc8ccd8, { metalness: 0.7, roughness: 0.3 }), glassM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0, clearcoat: 1 });
  [-1.08, 0, 1.08].forEach((x, pi) => {
    const g = new THREE.Group(); g.position.set(x, 0.95, 0); g.rotation.x = -(Math.PI / 2 - TILT); scene.add(g); A.panels.push(g);
    const back = box(PW, PH, 0.035, toon(0xe8ecf4), 0, 0, -0.02, g); back.castShadow = true;
    [[0, PH / 2, PW, 0.04], [0, -PH / 2, PW, 0.04], [PW / 2, 0, 0.04, PH], [-PW / 2, 0, 0.04, PH]].forEach(([fx, fy, w, h]) => box(w, h, 0.045, alu, fx, fy, 0, g));
    for (let r = 0; r < 10; r++) for (let c = 0; c < 6; c++) { const m = new THREE.MeshStandardMaterial({ map: cellTex, roughness: 0.25, metalness: 0.3, emissive: 0xffb636, emissiveIntensity: 0 }); const cell = new THREE.Mesh(new THREE.PlaneGeometry(0.152, 0.152), m); cell.position.set(-PW / 2 + 0.045 + 0.076 + c * 0.157, PH / 2 - 0.045 - 0.076 - r * 0.157, 0.002); g.add(cell); if (pi === 1) A.heroCells[r * 6 + (r % 2 ? 5 - c : c)] = cell; }
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.04, PH - 0.04), glassM); gl.position.z = 0.012; g.add(gl);
    if (pi === 1) { const lt = textTexture(256, 32, (c2, w, h) => { c2.fillStyle = '#c8ccd8'; c2.fillRect(0, 0, w, h); c2.font = '12px PS2P'; c2.fillStyle = '#3a3d52'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('ENGINEERS WITHOUT SLEEP  400W', w / 2, h / 2 + 1); });
      const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.032), new THREE.MeshBasicMaterial({ map: lt })); lb.position.set(0, -PH / 2 + 0.001, 0.0235); lb.rotation.x = 0; g.add(lb);
      const jb = box(0.16, 0.12, 0.04, toon(0x2a2c3c), 0, 0.5, -0.06, g); }
    // legs
    const legF = box(0.05, 0.25, 0.05, alu, x, 0.13, 0.72, scene), legB = box(0.05, 1.6, 0.05, alu, x, 0.8, -0.72, scene);
  });
  // cables to the inverter on the parapet
  const pts = [new THREE.Vector3(0, 1.3, -0.5), new THREE.Vector3(0, 0.1, -1.2), new THREE.Vector3(-2.5, 0.06, -2.2), new THREE.Vector3(-3, 0.06, -6.6), new THREE.Vector3(-3, 0.7, -6.8)];
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.02, 6), toon(0x1c1c22)));
  const inv = new THREE.Group(); inv.position.set(-3, 1.25, -6.8); scene.add(inv); A.inv = inv;
  box(0.55, 0.7, 0.18, toon(0xe8ecf4, { roughness: 0.4 }), 0, 0, 0.09, inv);
  const it = textTexture(256, 320, (c2, w, h) => { c2.fillStyle = '#e8ecf4'; c2.fillRect(0, 0, w, h); c2.fillStyle = '#120d22'; c2.fillRect(40, 40, w - 80, 90); c2.fillStyle = '#ffb636'; c2.fillRect(18, h - 70, w - 36, 52);
    c2.font = '16px PS2P'; c2.textAlign = 'center'; c2.fillStyle = '#120d22'; c2.fillText('ENGINEERS', w / 2, h - 50); c2.fillText('WITHOUT SLEEP', w / 2, h - 28); c2.font = '12px PS2P'; c2.fillStyle = '#5a6074'; c2.fillText('SOLAR INVERTER', w / 2, 170); c2.fillText('DC  >  AC', w / 2, 196); });
  A.invMat = new THREE.MeshStandardMaterial({ map: it, roughness: 0.5 }); const fp = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.625), A.invMat); fp.position.set(0, 0, 0.181); inv.add(fp);
  A.invLed = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.11), new THREE.MeshBasicMaterial({ color: 0x43e8b0 })); A.invLed.position.set(0, 0.17, 0.183); inv.add(A.invLed);
}
// sun rays raining onto the panels (instanced streaks)
const NR = 90; A.rays = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 4), new THREE.MeshBasicMaterial({ color: 0xfff2a0, transparent: true, opacity: 0.8, fog: false }), NR); A.rays.frustumCulled = false; scene.add(A.rays);

// ---------- set B: one cell cut open ----------
const Bset = new THREE.Group(); Bset.position.set(X0, 0, 0); scene.add(Bset);
const Bo = {};
{
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(140, 90), new THREE.MeshBasicMaterial({ color: 0x14122a, fog: false })); bd.position.set(0, 3, -12); Bset.add(bd);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(140, 60), new THREE.MeshBasicMaterial({ color: 0x1c1a38, fog: false })); fl.rotation.x = -Math.PI / 2; fl.position.y = -2.5; Bset.add(fl);
  const lay = (y0, y1, col, op) => { const m = new THREE.MeshStandardMaterial({ color: col, transparent: op < 1, opacity: op, roughness: 0.6, metalness: 0.1 }); const b2 = box(10, y1 - y0, 3, m, 0, (y0 + y1) / 2, 0, Bset); return b2; };
  Bo.back = lay(0, 0.4, 0x9aa3b5, 1); Bo.p = lay(0.4, 4.4, 0xc86a8a, 1); Bo.n = lay(4.4, 5.0, 0x4fa8d8, 1); Bo.ar = lay(5.0, 5.1, 0x1d2a6a, 1);
  [-3, 0, 3].forEach((x) => box(0.35, 0.3, 3, toon(0xd8dbe6, { metalness: 0.8, roughness: 0.25 }), x, 5.25, 0, Bset));
  // lattice atoms on the cut face
  const pts = []; for (let y = 0.75; y < 4.95; y += 0.55) for (let x = -4.6; x <= 4.65; x += 0.6) pts.push([x + (Math.round(y / 0.55) % 2) * 0.3, y]);
  Bo.atoms = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 10, 8), toon(0x3a3d52, { roughness: 0.5 }), pts.length); const m4 = new THREE.Matrix4();
  pts.forEach(([x, y], i) => { m4.makeTranslation(x, y, 1.53); Bo.atoms.setMatrixAt(i, m4); }); Bset.add(Bo.atoms);
  // spare electrons (N) and holes (P)
  Bo.spare = []; Bo.holes = []; const eM = new THREE.MeshBasicMaterial({ color: 0xffd84a }), hM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 12; i++) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), eM); e.position.set(-4.3 + i * 0.78, 4.7, 1.62); Bset.add(e); Bo.spare.push(e); }
  for (let i = 0; i < 10; i++) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 16), hM); h.position.set(-4.1 + i * 0.92, 1.2 + (i % 3) * 0.9, 1.62); Bset.add(h); Bo.holes.push(h); }
  // one-way wall (depletion zone) + field arrows (pointing down: N -> P)
  Bo.wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.75), new THREE.MeshBasicMaterial({ color: 0xffb636, transparent: true, opacity: 0, depthWrite: false })); Bo.wall.position.set(0, 4.2, 1.6); Bset.add(Bo.wall);
  Bo.arrows = []; for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 4), new THREE.MeshBasicMaterial({ color: 0xffb636, transparent: true, opacity: 0 })); c.rotation.z = Math.PI; c.position.set(-4 + i * 1.6, 4.2, 1.66); Bset.add(c); Bo.arrows.push(c); }
  // hero photon, electron, hole
  Bo.photon = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), new THREE.MeshBasicMaterial({ color: 0xfff2a0 })); Bset.add(Bo.photon);
  Bo.eHero = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffd84a })); Bset.add(Bo.eHero);
  Bo.hHero = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 8, 20), new THREE.MeshBasicMaterial({ color: 0xffffff })); Bset.add(Bo.hHero);
  // rain pool for FLOW
  Bo.rp = []; for (let i = 0; i < 14; i++) { const ph = Bo.photon.clone(); const e = Bo.eHero.clone(); const h = Bo.hHero.clone(); [ph, e, h].forEach((o) => Bset.add(o)); Bo.rp.push({ ph, e, h }); }
  // circuit: finger -> up -> right -> lamp -> down -> back contact
  const wp = [[3, 5.4], [3, 7.4], [7.6, 7.4], [7.6, 3.9], null, [7.6, 2.1], [7.6, -0.9], [5.6, -0.9], [5.6, 0.2], [5.0, 0.2]];
  Bo.wireA = wp.slice(0, 4).map(([x, y]) => new THREE.Vector3(x, y, 1.5)); Bo.wireB = wp.slice(5).map(([x, y]) => new THREE.Vector3(x, y, 1.5));
  const tube = (pp) => { const cp = new THREE.CurvePath(); for (let i = 0; i < pp.length - 1; i++) cp.add(new THREE.LineCurve3(pp[i], pp[i + 1])); const m = new THREE.Mesh(new THREE.TubeGeometry(cp, 80, 0.07, 6, false), toon(0xd8742e, { metalness: 0.7, roughness: 0.3 })); Bset.add(m); return { m, cp }; };
  Bo.tA = tube(Bo.wireA); Bo.tB = tube(Bo.wireB);
  Bo.lampG = new THREE.Group(); Bo.lampG.position.set(7.6, 3.0, 1.5); Bset.add(Bo.lampG);
  Bo.lampM = new THREE.MeshBasicMaterial({ color: 0x3a3d52, transparent: true, opacity: 0.85 }); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 14), Bo.lampM); bulb.position.y = 0.25; Bo.lampG.add(bulb);
  box(0.5, 0.4, 0.5, toon(0x9aa3b5, { metalness: 0.7 }), 0, -0.55, 0, Bo.lampG);
  Bo.lampLight = new THREE.PointLight(0xffd36b, 0, 14); Bo.lampLight.position.set(7.6, 3.3, 2.5); Bset.add(Bo.lampLight);
}
const lerpV = (a, b2, u) => a.clone().lerp(b2, TL.clamp01(u));
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
const VB = (a) => new THREE.Vector3(a[0] + X0, a[1], a[2]);
const SUNT = SUN_DIR.clone().multiplyScalar(30).toArray();
const HOOK = {
  roofWide: [[5, 3, 7], [4.5, 2.8, 6.5], [0, 0.8, 0]],
  cells: [[0.7, 1.55, 1.7], [0.5, 1.5, 1.6], [0, 0.95, 0.1]],
  sun: [[1.2, 0.6, 3.2], [1.0, 0.6, 3.0], SUNT],
  inverter: [[-2.4, 1.4, -5.6], [-2.6, 1.35, -5.8], [-3, 1.25, -6.7]],
  busbar: [[0.18, 1.12, 0.62], [0.12, 1.1, 0.56], [0, 0.95, 0.12]],
  frameLabel: [[0.35, 0.72, 1.35], [0.25, 0.7, 1.25], [0, 0.6, 0.72]],
  cables: [[1.6, 0.8, -2.6], [1.4, 0.8, -2.4], [0, 0.8, -0.4]],
  roofHigh: [[-4, 6, 6], [-3.6, 5.8, 5.6], [0, 0.6, 0]],
};
const SHOTS = [ // [b0, b1, pos0, pos1, tgt0, tgt1, setB]
  [8, 16, [3.5, 2.4, 5.2], [0.3, 1.15, 0.85], [0, 0.9, 0], [0, 0.95, 0.12], 0],
  [16, 24, [3, 5, 15], [2, 4.5, 13.5], [0, 3, 0], [0, 3, 0], 1],
  [24, 32, [2.5, 4.2, 10.5], [1.8, 4.0, 9], [0.4, 3.4, 1.5], [0.5, 3.6, 1.5], 1],
  [32, 40, [-2.2, 3.6, 11], [-1.6, 3.4, 10], [0.4, 2.8, 1.5], [0.4, 2.8, 1.5], 1],
  [40, 48, [3.3, 5.6, 40], [2.9, 5.4, 37], [2.6, 5.0, 0], [2.6, 5.0, 0], 1],
  [48, 56, [2.2, 1.7, 2.5], [-1.8, 1.7, 2.5], [0, 0.95, 0], [0, 0.95, 0], 0],
  [56, 64, [3.2, 2.2, 4.2], [2.6, 1.9, 3.6], [0, 0.9, 0], [0, 0.9, 0], 0],
  [64, 72, [-2.0, 1.5, -5.0], [-2.4, 1.4, -5.4], [-3, 1.25, -6.7], [-3, 1.25, -6.7], 0],
  [72, 80, [5, 2.5, 6], [-5, 2.5, 6], [0, 0.8, 0], [0, 0.8, 0], 0],
  [80, 89, [-2, 2, 7], [2, 6, 9.5], [0, 0.8, 0], [0, 0.6, -1], 0],
];
function camAt(b) {
  if (b < 8) { const [p0, p1, tg] = HOOK[TL.HOOK_SHOTS[Math.floor(b)]]; const u = b - Math.floor(b); return { pos: V(p0).lerp(V(p1), u), tgt: V(tg), setB: false }; }
  const s = SHOTS.find((x) => b >= x[0] && b < x[1]) || SHOTS[SHOTS.length - 1]; const u = TL.ease((b - s[0]) / (s[1] - s[0])); const f = s[6] ? VB : V;
  return { pos: f(s[2]).lerp(f(s[3]), u), tgt: f(s[4]).lerp(f(s[5]), u), setB: !!s[6] };
}
const hash = (n) => { const h = Math.sin(n * 127.1 + 311.7) * 43758.5453; return h - Math.floor(h); };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), SUN_DIR), s4 = new THREE.Vector3(1, 1, 1);
const WB = (x, y, z) => new THREE.Vector3(x + X0, y, z);
const H0 = [0.5, 3.6, 1.62];
const fingerX = (x) => (x < -1.5 ? -3 : x > 1.5 ? 3 : 0);

window.renderFrame = function (t) {
  const b = t / TL.B, frame = Math.round(t * 30);
  const { pos, tgt, setB } = camAt(b);
  // ---- set A ----
  const rayOn = b < 8 || (b >= 56 && b < 64) || b >= 72;
  for (let k = 0; k < NR; k++) { const life = 0.45, ph = (t / life + hash(k)) % 1, cyc = Math.floor(t / life + hash(k)); const hx = (hash(k * 3 + cyc) - 0.5) * 3.2, hz = (hash(k * 7 + cyc) - 0.5) * 1.4; const hit = new THREE.Vector3(hx, 0.95 + hz * Math.tan(TILT) * 0.5, hz);
    const p = hit.clone().addScaledVector(SUN_DIR, (1 - ph) * 6 + 0.25); s4.setScalar(rayOn ? 1 : 0); m4.compose(p, q4, s4); A.rays.setMatrixAt(k, m4); }
  A.rays.instanceMatrix.needsUpdate = true;
  const nLit = b >= 49 && b < 56 ? Math.floor(TL.clamp01((b - 49) / 6) * 60) : (b >= 56 ? 60 : 0);
  A.heroCells.forEach((c, i) => { c.material.emissiveIntensity = b >= 49 && b < 64 && i < nLit ? (i === nLit - 1 ? 0.9 : 0.28) : 0; });
  A.invLed.material.color.set(b >= 66 ? (Math.sin(t * 8) > 0 ? 0x43e8b0 : 0x2a8a6a) : 0x43e8b0);
  // ---- set B ----
  const w = TL.ease((b - 20) / 1);
  Bo.wall.material.opacity = 0.28 * w; Bo.arrows.forEach((a) => { a.material.opacity = w; });
  Bo.spare.forEach((e, i) => { e.visible = b >= 17; e.position.y = 4.7 + 0.05 * Math.sin(t * 6 + i); });
  Bo.holes.forEach((h, i) => { h.visible = b >= 18 && !(b >= 41); });
  // hero photon -> pair -> sorted
  const ph = TL.clamp01((b - 26) / 2); Bo.photon.visible = b >= 26 && b < 28.1; Bo.photon.position.set(H0[0], 11 - (11 - H0[1]) * ph * ph + 0.7, H0[2]);
  const eStart = new THREE.Vector3(...H0), eLoose = new THREE.Vector3(H0[0] + 0.15, H0[1] + 0.2, H0[2]), eN = new THREE.Vector3(H0[0] + 0.1, 4.75, H0[2]), hP = new THREE.Vector3(H0[0], 0.6, H0[2]);
  Bo.eHero.visible = b >= 28 && b < 41; Bo.hHero.visible = b >= 28 && b < 41;
  let ep = lerpV(eStart, eLoose, (b - 28) / 0.5); if (b >= 32) ep = lerpV(eLoose, eN, ((b - 32) / 1) ** 2); Bo.eHero.position.copy(ep).add(new THREE.Vector3(0, b < 32 ? 0.04 * Math.sin(t * 9) : 0, 0));
  let hp = new THREE.Vector3(...H0); if (b >= 32) hp = lerpV(new THREE.Vector3(...H0), hP, (b - 32) / 3); Bo.hHero.position.copy(hp);
  // rain of photons during FLOW
  Bo.rp.forEach((r) => { r.ph.visible = r.e.visible = r.h.visible = false; });
  TL.RAIN.forEach((bk, k) => { const r = Bo.rp[k % Bo.rp.length], x = -4 + 8 * hash(k * 5 + 1), y = 3.0 + 0.8 * hash(k * 9 + 2), z = 1.62;
    if (b >= bk - 0.5 && b < bk) { const u = (b - (bk - 0.5)) / 0.5; r.ph.visible = true; r.ph.position.set(x, 11 - (11 - y) * u * u + 0.7, z); }
    if (b >= bk && b < bk + 1.1) { const u = (b - bk); r.e.visible = true; const fx = fingerX(x); r.e.position.copy(u < 0.5 ? lerpV(new THREE.Vector3(x, y, z), new THREE.Vector3(x, 4.75, z), u / 0.5) : lerpV(new THREE.Vector3(x, 4.75, z), new THREE.Vector3(fx, 5.2, z), (u - 0.5) / 0.5));
      r.h.visible = u < 1; r.h.position.copy(lerpV(new THREE.Vector3(x, y, z), new THREE.Vector3(x, 0.55, z), u)); } });
  // wire draws on at WIRE, lamp at LAMP
  const wd = TL.ease((b - TL.WIRE) / 1); [Bo.tA.m, Bo.tB.m].forEach((m) => { m.visible = wd > 0.01; m.geometry.setDrawRange(0, Math.floor(m.geometry.index.count * wd / 3) * 3); });
  const lamp = TL.ease((b - TL.LAMP) / 0.4); Bo.lampM.color.set(lamp > 0.5 ? 0xffe28a : 0x3a3d52); Bo.lampM.opacity = 0.85; Bo.lampLight.intensity = lamp * (6 + Math.sin(t * 9));

  // ---- camera & light ----
  const sbar = (b % 4) * TL.B, sb = (b % 1) * TL.B;
  if (b < 8 || b >= 72) { const k = 0.004 * pos.distanceTo(tgt); pos.x += Math.sin(t * 2.1) * k; }
  camera.position.copy(pos); camera.up.set(0, 1, 0); camera.lookAt(tgt); camera.near = 0.02; camera.far = 600;
  camera.fov = 35 - (b >= 8 ? 1.2 * Math.exp(-sbar * 7) : 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const base = setB ? new THREE.Vector3(X0, 2, 0) : new THREE.Vector3(0, 0.8, 0);
  sun.target.position.copy(base); sun.position.copy(base).addScaledVector(SUN_DIR, 20);
  const sz = setB ? 14 : Math.max(4, Math.min(16, pos.distanceTo(tgt) * 0.9)); Object.assign(sun.shadow.camera, { left: -sz, right: sz, top: sz, bottom: -sz, near: 1, far: 60 }); sun.shadow.camera.updateProjectionMatrix();
  const hitFlash = b >= 28 && b < 28.4 ? 1 - (b - 28) / 0.4 : 0;
  bangLight.position.copy(WB(...H0)).add(new THREE.Vector3(0, 0, 1.5)); bangLight.distance = 10; bangLight.intensity = hitFlash * 30;
  scene.background = setB ? null : skyTex; if (setB) scene.background = new THREE.Color(0x14122a);
  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  if (hitFlash > 0.02) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,240,170,${hitFlash * 0.3})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  dither();

  // ---- overlays ----
  const P = (v) => project(v);
  if (b >= 28 && b < 30) drawPop('ZAP!', P(WB(H0[0], H0[1] + 0.9, H0[2])), (b - 28) * TL.B, COL.yellow, 32);
  // charge build-up: minus along N, plus along P bottom, voltmeter
  if (b >= 34 && b < 40) { const k = TL.ease((b - 34) / 1.5); ctx.font = `20px ${FONT.ps}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 7; i++) { if (i / 7 > k) continue; const a = P(WB(-4.2 + i * 1.4, 4.75, 1.7)), c = P(WB(-4.2 + i * 1.4, 0.65, 1.7)); ctx.fillStyle = COL.cyan; ctx.fillText('-', a.x, a.y); ctx.fillStyle = COL.pink; ctx.fillText('+', c.x, c.y); }
    ctx.textAlign = 'left'; if (b >= TL.VOLT) { const y0 = H - 250; ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(200, y0, 320, 110); ctx.font = `40px ${FONT.ps}`; ctx.fillStyle = COL.amber; ctx.textAlign = 'center'; ctx.fillText('0.6 V', 360, y0 + 58); ctx.textAlign = 'left'; } }
  // current flow along the wire
  if (b >= 41 && b < 48) { const N = 26; ctx.fillStyle = COL.yellow; for (let i = 0; i < N; i++) { const s = (t * 0.35 + i / N) % 1; const v = s < 0.5 ? Bo.tA.cp.getPointAt(s * 2) : Bo.tB.cp.getPointAt((s - 0.5) * 2); const q = P(v.clone().add(new THREE.Vector3(X0, 0, 0.05))); ctx.fillRect(Math.round(q.x - 4), Math.round(q.y - 4), 8, 8); } }
  // series counter
  if (b >= 49 && b < 56) { const y0 = H - 250; ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(40, y0, W - 80, 140); ctx.font = `20px ${FONT.ps}`; ctx.textBaseline = 'top'; ctx.fillStyle = COL.amber; ctx.fillText('CELLS', 70, y0 + 22); ctx.fillStyle = COL.cyan; ctx.fillText('VOLTS', 390, y0 + 22);
    ctx.font = `36px ${FONT.ps}`; ctx.fillStyle = COL.cream; ctx.fillText(String(Math.max(1, nLit)), 70, y0 + 66); ctx.fillText((Math.max(1, nLit) * 0.6).toFixed(1), 390, y0 + 66); ctx.textBaseline = 'middle'; }
  // where the light goes
  if (b >= 57 && b < 64) { const y0 = H - 260, k = TL.ease((b - 57) / 1.5), k2 = TL.ease((b - 59) / 1); ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(40, y0, W - 80, 150); ctx.font = `16px ${FONT.ps}`; ctx.textBaseline = 'top';
    ctx.fillStyle = COL.cream; ctx.fillText('SUNLIGHT IN: 100%', 60, y0 + 16); const bw = W - 120; ctx.fillStyle = COL.yellow; ctx.fillRect(60, y0 + 44, bw * k, 26);
    if (k2 > 0) { ctx.fillStyle = COL.mint; ctx.fillRect(60, y0 + 92, bw * 0.2 * k2, 26); ctx.fillStyle = COL.orange; ctx.fillRect(60 + bw * 0.2, y0 + 92, bw * 0.8 * k2, 26); ctx.fillStyle = COL.ink; ctx.fillText('~20%', 66, y0 + 98); ctx.fillText('HEAT + BOUNCE', 60 + bw * 0.2 + 10, y0 + 98); }
    ctx.textBaseline = 'middle'; }
  // DC -> AC scope
  if (b >= 65 && b < 72) { const y0 = H - 260, h2 = 150; ctx.fillStyle = 'rgba(18,13,34,0.9)'; ctx.fillRect(40, y0, W - 80, h2); const mid = y0 + h2 / 2 + 10, x0 = 60, x1 = W - 60, xm = (x0 + x1) / 2;
    ctx.lineWidth = 4; ctx.strokeStyle = COL.cyan; ctx.beginPath(); ctx.moveTo(x0, mid - 40); ctx.lineTo(xm - 20, mid - 40); ctx.stroke();
    const k = TL.ease((b - 66) / 1); if (k > 0) { ctx.strokeStyle = COL.amber; ctx.beginPath(); for (let x = xm + 20; x <= xm + 20 + (x1 - xm - 20) * k; x += 3) { const yy = mid - 50 * Math.sin((x - xm) * 0.08 - t * 6); x === xm + 20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); arrow(xm - 18, mid - 40, xm + 14, mid - 40, COL.cream, 4); }
    ctx.font = `16px ${FONT.ps}`; ctx.textBaseline = 'top'; ctx.fillStyle = COL.cyan; ctx.fillText('DC', 64, y0 + 10); ctx.fillStyle = COL.amber; ctx.fillText('AC', xm + 24, y0 + 10); ctx.textBaseline = 'middle'; }
  const hc = A.heroCells[27]; const anchors = {
    cell: P(hc.localToWorld(new THREE.Vector3(0.07, 0, 0))), bus: P(A.heroCells[33].localToWorld(new THREE.Vector3(-0.04, 0, 0))),
    nl: P(WB(-4.9, 4.7, 1.6)), pl: P(WB(-4.9, 2.4, 1.6)), wall: P(WB(4.8, 4.2, 1.6)), eln: P(Bo.eHero.getWorldPosition(new THREE.Vector3())), hol: P(Bo.hHero.getWorldPosition(new THREE.Vector3())),
    bulb: P(WB(7.6, 3.7, 1.5)), inv: P(A.inv.localToWorld(new THREE.Vector3(-0.28, 0, 0.18))),
  };
  TL.LABELS.forEach((lb) => drawLabel(lb, anchors[lb.id], b));
  drawSpeedTag(b);
  TL.CAPTIONS.filter((cp) => b >= cp.t0 && b < cp.t1).forEach((cp) => drawCaption(cp, b));
  drawHandle();
  return out.toDataURL('image/jpeg', 0.92);
};
window.ready = Promise.resolve(true);
