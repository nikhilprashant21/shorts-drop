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


// ---------- hall: floor + branded back wall ----------
{
  const ft = textTexture(256, 256, (g) => { g.fillStyle = '#4a5378'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#525c84'; for (let i = 0; i < 400; i++) g.fillRect((i * 97) % 256, (i * 61) % 256, 3, 3); g.fillStyle = '#3f476a'; g.fillRect(0, 0, 256, 4); g.fillRect(0, 0, 4, 256); });
  ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(60, 18);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(330, 70), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.9 })); floor.receiveShadow = true;
  floor.rotation.x = -Math.PI / 2; floor.position.set(80, 0, 15); scene.add(floor);
  // wall: one panel per set, each carrying the channel name in big faint pixel letters
  [0, 80, 160].forEach((cx) => {
    const tex = textTexture(1024, 256, (g, w, h) => {
      g.fillStyle = '#343a66'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#3a4170'; for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 32; x < w; x += 64) g.fillRect(x, y, 30, 30);
      g.font = '48px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#56609a'; g.fillText(BRAND, w / 2, h * 0.5);
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 20), new THREE.MeshBasicMaterial({ map: tex }));
    wall.position.set(cx, 18, -14); scene.add(wall); wall.userData.wall = 1;
    const lower = new THREE.Mesh(new THREE.PlaneGeometry(80, 8), new THREE.MeshBasicMaterial({ color: 0x2b3058 }));
    lower.position.set(cx, 4, -14); scene.add(lower); lower.userData.wall = 1;
  });
  // hall pillars
  for (let x = -36; x <= 196; x += 12) { box(1.2, 30, 1.2, toon(0x2e2a52), x, 15, -13, scene); }
}
const wallMats = []; scene.traverse((o) => { if (o.userData.wall) { o.material.userData.base = o.material.color.clone(); wallMats.push(o.material); } });

// ---------- props ----------
{
  const coneM = new THREE.MeshStandardMaterial({ color: 0xff6a1a, roughness: 0.5 }), white = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.5 });
  const crateM = new THREE.MeshStandardMaterial({ color: 0xc8742e, roughness: 0.8 }), barrelM = new THREE.MeshStandardMaterial({ color: 0x4fa3c7, roughness: 0.5, metalness: 0.3 });
  [[-0.5, 11.2], [1.0, 10.6], [-10.6, 6.2], [-9.4, 4.4], [3.2, 7.2]].forEach(([x, z]) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.55, 16), coneM); c.position.set(x, 0.3, z); scene.add(c);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.135, 0.08, 16), white); s.position.set(x, 0.33, z); scene.add(s);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), coneM); b.position.set(x, 0.02, z); scene.add(b);
  });
  [[-11, 9.5, 0.3], [-10.2, 10.6, 1.1], [4.6, 8.8, 0.6]].forEach(([x, z, r]) => { const c = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.7, 1.0, 2, 0.06), crateM); c.position.set(x, 0.35, z); c.rotation.y = r; scene.add(c); });
  [[-12.2, 7.6], [-12.9, 8.4], [5.4, 6.4]].forEach(([x, z]) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 18), barrelM); b.position.set(x, 0.45, z); scene.add(b); });
}


// ---------- RT-flex96C exterior (14 cylinders along x) ----------
const engine = new THREE.Group(); scene.add(engine);
{
  const steelD = toon(0x4a5584), steel = toon(0x6c7cab), steelL = toon(0x8c9cc8), rib = toon(0x7e8fbd), cream = toon(0xece6d4), grey = toon(0xa9b1c2, { metalness: 0.5, roughness: 0.35 }), amber = toon(0xffb636), brass = toon(0xc98f2e, { metalness: 0.7, roughness: 0.35 });
  box(26.6, 2.4, 5.4, steelD, 0, 1.2, 0, engine);
  box(26.6, 4.6, 4.6, steel, 0, 4.7, 0, engine);
  box(26.6, 3.0, 3.8, steelL, 0, 8.5, 0, engine);
  for (let i = 0; i <= 14; i++) box(0.3, 4.6, 0.25, rib, -12.6 + i * 1.8, 4.7, 2.35, engine);
  for (let i = 0; i < 14; i++) {
    const x = -11.7 + i * 1.8;
    box(0.9, 1.3, 0.12, cream, x, 4.9, 2.36, engine);
    box(0.4, 0.4, 0.14, toon(0x2a2350), x, 4.9, 2.38, engine);
    const cv = cyl(0.8, 1.2, cream, 16, engine); cv.position.set(x, 10.6, 0.3);
    const vh = cyl(0.36, 1.1, grey, 10, engine); vh.position.set(x, 11.75, 0.3);
    box(0.5, 0.18, 0.5, toon(0xff4d7a), x, 12.4, 0.3, engine);
  }
  // walkways + rails
  [[7.0, 2.9], [10.0, 2.4]].forEach(([y, z]) => {
    box(26.8, 0.12, 1.1, toon(0x2e2a52), 0, y, z, engine);
    box(26.8, 0.08, 0.08, amber, 0, y + 1.0, z + 0.5, engine);
    for (let i = 0; i <= 14; i++) box(0.07, 1.0, 0.07, amber, -13.3 + i * 1.9, y + 0.5, z + 0.5, engine);
  });
  const exh = cyl(1.0, 26, toon(0x4a5a86), 18, engine); exh.rotation.z = Math.PI / 2; exh.position.set(0, 11.0, -2.0);
  const scav = cyl(0.85, 26, steel, 18, engine); scav.rotation.z = Math.PI / 2; scav.position.set(0, 7.6, -2.6);
  [-7, 0, 7].forEach((x) => { const tb = cyl(1.0, 2.2, brass, 16, engine); tb.rotation.x = Math.PI / 2; tb.position.set(x, 12.6, -2.4); const tc = cyl(0.55, 1.2, toon(0xe3b04b), 12, engine); tc.position.set(x, 13.7, -2.4); });
  // nameplate on the bedplate front
  const np = textTexture(1024, 128, (g, w, h) => {
    g.fillStyle = '#120d22'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffb636'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.font = '40px PS2P'; g.fillStyle = '#fff4dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(BRAND, w / 2, h * 0.38);
    g.font = '24px PS2P'; g.fillStyle = '#ffb636'; g.fillText('14 RT-FLEX96C  /  107,390 HP', w / 2, h * 0.74);
  });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.5), new THREE.MeshBasicMaterial({ map: np })); plate.position.set(0, 1.25, 2.72); engine.add(plate);
}

// ---------- cutaway cylinder (real scale, metres) at x = 80 ----------
const cut = new THREE.Group(); cut.position.set(80, 0, 0); scene.add(cut);
const CR = 1.25, CONROD = 4.4, CRANK_Y = 2.6, PROD = 3.4, COVER_Y = 12.4;
const hatch = textTexture(32, 32, (g) => { g.fillStyle = '#b8406a'; g.fillRect(0, 0, 32, 32); g.strokeStyle = '#5e1d3f'; g.lineWidth = 6; for (let i = -32; i < 64; i += 12) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 32, 32); g.stroke(); } });
hatch.wrapS = hatch.wrapT = THREE.RepeatWrapping;
const cutFace = (w, h, x, y, z) => { const t = hatch.clone(); t.needsUpdate = true; t.repeat.set(w * 2, h * 2); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t })); m.position.set(x, y, z); cut.add(m); return m; };
const C = {};
{
  const steelD = toon(0x3c4670), steel = toon(0x5d6f9c), steelL = toon(0x7889b8), cream = toon(0xe9e3d0), grey = toon(0x9aa3b5);
  box(5.2, 2.4, 2.8, steelD, 0, 1.2, -0.3, cut);
  [-1.75, 1.75].forEach((x) => box(0.7, 6.5, 2.2, steel, x, 5.65, -0.4, cut)); // A-frames
  [-0.75, 0.75].forEach((x) => box(0.2, 3.7, 0.9, grey, x, 7.05, 0, cut));    // crosshead guides
  box(3.8, 0.3, 2.0, steelL, 0, 8.95, -0.3, cut);                                 // diaphragm
  // jacket + liner walls (section cut, hatched faces)
  [-1, 1].forEach((s) => {
    box(0.9, 3.4, 2.0, steelL, s * 1.03, 10.7, -0.4, cut);
    cutFace(0.9, 3.4, s * 1.03, 10.7, 0.61);
    box(0.16, 3.4, 1.2, grey, s * 0.56, 10.7, -0.3, cut);
  });
  box(1.0, 3.4, 0.1, toon(0x1b1633), 0, 10.7, -0.62, cut); // back of the bore
  box(2.9, 0.7, 2.0, cream, 0, COVER_Y + 0.35, -0.3, cut); cutFace(2.9, 0.7, 0, COVER_Y + 0.35, 0.71);
  const vh = cyl(0.42, 1.2, grey, 12, cut); vh.position.set(0, COVER_Y + 1.3, -0.3);
  C.valve = new THREE.Group(); cut.add(C.valve);
  box(0.62, 0.1, 0.62, toon(0xa98bff), 0, 0, 0, C.valve); box(0.08, 0.8, 0.08, grey, 0, 0.45, 0, C.valve);
  // scavenge port glows
  C.ports = [-1, 1].map((s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.6), new THREE.MeshBasicMaterial({ color: 0x43e8b0, transparent: true, opacity: 0 })); m.position.set(s * 0.56, 9.5, 0.32); cut.add(m); return m; });
  // moving parts
  C.journal = cyl(0.5, 1.2, grey, 16, cut); C.journal.rotation.x = Math.PI / 2; C.journal.position.set(0, CRANK_Y, 0);
  C.web = new THREE.Group(); C.web.position.set(0, CRANK_Y, 0.2); cut.add(C.web);
  box(0.9, CR + 0.9, 0.35, toon(0xc98f2e), 0, (CR + 0.9) / 2 - 0.45, 0.25, C.web);
  const pin = cyl(0.32, 0.9, grey, 12, C.web); pin.rotation.x = Math.PI / 2; pin.position.set(0, CR, 0.1);
  C.conrod = box(0.34, CONROD, 0.3, toon(0x4fe0ff, { emissive: 0x0b3a48 }), 0, 0, 0.35, cut);
  C.xhead = box(1.2, 0.55, 0.8, toon(0xffb636), 0, 0, 0.25, cut);
  C.prod = box(0.2, PROD, 0.2, toon(0xd8dbe6), 0, 0, 0.15, cut);
  C.piston = cyl(0.47, 0.5, toon(0xd8dbe6), 20, cut);
  box(0.96, 0.06, 0.95, toon(0xff4d7a), 0, 0.27, 0, C.piston); // ring belt
}
// gas between crown and cover
const gasMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uCol: { value: new THREE.Color() }, uA: { value: 0.9 }, uT: { value: 0 }, uHi: { value: 0 } },
  vertexShader: 'varying vec2 vP; void main(){ vP = (modelMatrix*vec4(position,1.)).xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform vec3 uCol; uniform float uA; uniform float uT; uniform float uHi; varying vec2 vP;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
  void main(){ vec2 p=vP*4.0; float v=n(p+vec2(uT*1.3,-uT*1.7))*0.6+n(p*2.1-vec2(uT*2.0,uT*1.1))*0.4;
    gl_FragColor=vec4(uCol*(0.65+0.6*v)+uHi*vec3(0.5,0.45,0.3)*v, uA); }`,
});
const gas = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 1), gasMat); gas.renderOrder = 2; cut.add(gas);

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
// tiny pixel Miata sprite (side view, nose right)
const SPR = ['....xxxx......', '...xw..wx.....', '.xxxxxxxxxxxx.', 'xxxxxxxxxxxxxl', 'xxkkxxxxxxkkxx', '..kk......kk..'];
function drawSprite(x, y, px, alpha = 1) {
  ctx.globalAlpha = alpha;
  SPR.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '.') return; ctx.fillStyle = ch === 'x' ? COL.red : ch === 'w' ? '#8fd8ff' : ch === 'k' ? '#1a1530' : COL.amber;
    ctx.fillRect(x + i * px, y + j * px, px, px);
  }));
  ctx.globalAlpha = 1;
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
function gasLookCrank(phi, static_) {
  const C3 = (h) => new THREE.Color(h);
  if (static_) return { c: C3(COL.mint), a: 0.55, hi: 0 };
  const p = ((phi % 360) + 360) % 360;
  if (p < 14) return { c: C3('#fff6c8').lerp(C3(COL.orange), p / 14), a: 0.97, hi: 1 - p / 14 };
  if (p < 110) return { c: C3(COL.orange).lerp(C3('#c2304a'), (p - 14) / 96), a: 0.95, hi: 0 };
  if (p < 145) return { c: C3('#c2304a').lerp(C3('#7b62c9'), (p - 110) / 35), a: 0.85, hi: 0 };
  if (p < 230) return { c: C3('#7b62c9').lerp(C3(COL.mint), (p - 145) / 85), a: 0.7, hi: 0 };
  return { c: C3(COL.mint).lerp(C3(COL.yellow), (p - 230) / 130), a: 0.75 + 0.2 * (p - 230) / 130, hi: 0.5 * (p - 230) / 130 };
}


// ---------- extra cutaway parts: fuel injector + spray ----------
{
  const grey = toon(0xa9b1c2, { metalness: 0.5, roughness: 0.35 });
  const inj = box(0.16, 0.7, 0.16, toon(0xff7a2f), 0.85, COVER_Y + 0.55, 0.2, cut); inj.rotation.z = 0.5;
  C.spray = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0, depthWrite: false }));
  C.spray.position.set(0.32, COVER_Y - 0.28, 0.05); C.spray.rotation.z = 0.7; cut.add(C.spray);
}
const gasMesh = gas;

// ---------- direct drive rig: flywheel, shaft line, propeller (hall, x 14..44) ----------
const SHAFT_Y = 2.0;
const drive = new THREE.Group(); scene.add(drive);
{
  const grey = toon(0xa9b1c2, { metalness: 0.6, roughness: 0.3 }), bronze = new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.85, roughness: 0.25 });
  const sh = cyl(0.42, 28, grey, 20, drive); sh.rotation.z = Math.PI / 2; sh.position.set(28, SHAFT_Y, 0);
  [20, 27, 34].forEach((x) => box(1.2, SHAFT_Y, 1.6, toon(0x4a5584), x, SHAFT_Y / 2, 0, drive));
  // water channel under the propeller
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ color: 0x2a7fb8, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(44, 0.03, 0); drive.add(pool);
  C.spin = new THREE.Group(); C.spin.position.set(14.6, SHAFT_Y, 0); drive.add(C.spin);
  const fw = cyl(2.0, 0.5, toon(0x8c9cc8, { metalness: 0.5 }), 32, C.spin); fw.rotation.z = Math.PI / 2;
  for (let k = 0; k < 6; k++) { const m = box(0.55, 0.3, 0.3, toon(0xff4d7a), 0.3, Math.cos(k * Math.PI / 3) * 1.6, Math.sin(k * Math.PI / 3) * 1.6, C.spin); }
  C.prop = new THREE.Group(); C.prop.position.set(44, SHAFT_Y, 0); drive.add(C.prop);
  const hub = cyl(0.9, 1.8, bronze, 24, C.prop); hub.rotation.z = Math.PI / 2;
  for (let k = 0; k < 6; k++) {
    const bl = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), bronze);
    bl.scale.set(0.12, 2.1, 0.85); bl.position.set(0, 2.6, 0); bl.rotation.y = 0.5;
    const arm = new THREE.Group(); arm.rotation.x = k * Math.PI / 3; arm.add(bl); C.prop.add(arm);
  }
  // the prop sits higher than the shaft: show a short angled coupling so it reads as one line
}

// ---------- turbocharger cutaway (hall, x = 130) ----------
const TX = 130, TY = 3.6;
const turbo = new THREE.Group(); turbo.position.set(TX, TY, 0); scene.add(turbo);
{
  const hot = toon(0x9a7fd6, { metalness: 0.4, roughness: 0.4 }), cool = toon(0x7fd6c0, { metalness: 0.3, roughness: 0.4 }), grey = toon(0xa9b1c2, { metalness: 0.6, roughness: 0.3 });
  const half = (r, len, mat, x) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 32, 1, true, Math.PI, Math.PI), mat); m.material = mat.clone(); m.material.side = THREE.DoubleSide; m.rotation.z = Math.PI / 2; m.position.x = x; turbo.add(m); return m; };
  half(1.6, 1.6, hot, -1.5); half(1.6, 1.6, cool, 1.5); half(0.7, 1.4, grey, 0);
  const st = cyl(0.22, 4.6, grey, 16, turbo); st.rotation.z = Math.PI / 2;
  const wheel = (x, mat, n) => { const g = new THREE.Group(); g.position.x = x; turbo.add(g); const hubm = cyl(0.35, 0.8, mat, 16, g); hubm.rotation.z = Math.PI / 2;
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; const bl = box(0.7, 1.15, 0.06, mat, 0, Math.cos(a) * 0.85, Math.sin(a) * 0.85, g); bl.rotation.x = -a; bl.rotation.y = 0.45; } return g; };
  C.turbine = wheel(-1.5, toon(0xffb636, { metalness: 0.7, roughness: 0.3 }), 14);
  C.compressor = wheel(1.5, toon(0xd8dbe6, { metalness: 0.8, roughness: 0.25 }), 12);
  box(1.4, 2.4, 1.4, toon(0x4a5584), 0, -2.4, 0, turbo); // stand
  const pipe = (a, b2, r, mat) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b2); const m = cyl(r, A.distanceTo(Bv), mat, 16, turbo); m.position.copy(A).add(Bv).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), Bv.clone().sub(A).normalize()); return m; };
  const pipeM = toon(0x6c7cab, { transparent: true, opacity: 0.45 });
  pipe([-1.5, 1.6, -0.6], [-1.5, 5.5, -0.6], 0.7, pipeM); pipe([-3.2, 0, -0.6], [-6.5, 0, -0.6], 0.8, pipeM);
  pipe([3.2, 0, -0.6], [6.0, 0, -0.6], 0.8, pipeM); pipe([1.5, -1.6, -0.6], [1.5, -3.2, -0.6], 0.6, pipeM);
}
// flow particles: list of paths in world space
function makeFlow(points, n, color, size, speed) {
  const pts = points.map((p) => new THREE.Vector3(...p));
  const lens = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = pts[i].distanceTo(pts[i - 1]); lens.push(l); tot += l; }
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(size, 8, 6), new THREE.MeshBasicMaterial({ color }), n); scene.add(mesh);
  const m4 = new THREE.Matrix4();
  return { mesh, update(t, on) { mesh.visible = on; if (!on) return; for (let i = 0; i < n; i++) { let d = ((t * speed / tot + i / n) % 1) * tot, j = 0; while (d > lens[j] && j < lens.length - 1) { d -= lens[j]; j++; }
    const p = pts[j].clone().lerp(pts[j + 1], Math.min(1, d / lens[j])); p.y += Math.sin(i * 7.1 + t * 3) * 0.12; p.z += Math.cos(i * 3.3 + t * 2) * 0.12; m4.makeTranslation(p.x, p.y, p.z); mesh.setMatrixAt(i, m4); } mesh.instanceMatrix.needsUpdate = true; } };
}
const T0 = (x, y, z = 0) => [TX + x, TY + y, z];
const flows = [
  makeFlow([T0(-1.5, 5.5, -0.6), T0(-1.5, 1.2, -0.6), T0(-1.6, 0, 0.2), T0(-3.2, 0, 0), T0(-6.5, 0, -0.6)], 70, 0xa98bff, 0.13, 4),
  makeFlow([T0(6.0, 0, -0.6), T0(3.2, 0, 0), T0(1.6, 0, 0.2), T0(1.5, -1.4, -0.6), T0(1.5, -3.2, -0.6)], 70, 0x43e8b0, 0.13, 4),
];

// everything built so far lives in the hall
const hallObjs = scene.children.filter((o) => !o.isLight);

// ---------- at sea: sky, ocean, container ship (far away, own lighting) ----------
const sea = new THREE.Group(); sea.position.set(-8000, 0, 0); scene.add(sea);
const skyTex = textTexture(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2c2a6b'); gr.addColorStop(0.55, '#b3567d'); gr.addColorStop(0.8, '#ff9a62'); gr.addColorStop(1, '#ffd08a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
skyTex.magFilter = THREE.LinearFilter;
const OCEAN_N = 140;
const oceanGeo = new THREE.PlaneGeometry(5000, 5000, OCEAN_N, OCEAN_N); oceanGeo.rotateX(-Math.PI / 2);
const ocean = new THREE.Mesh(oceanGeo, new THREE.MeshStandardMaterial({ color: 0x1f5f8f, roughness: 0.25, metalness: 0.1, flatShading: true, transparent: true, opacity: 1 }));
ocean.receiveShadow = true; sea.add(ocean);
const oBase = oceanGeo.attributes.position.array.slice();
const SHIP_L = 400;
const ship = new THREE.Group(); sea.add(ship);
const hullMats = [];
{
  const outline = new THREE.Shape(); // top view, bow +x
  outline.moveTo(-200, -26); outline.lineTo(110, -28); outline.quadraticCurveTo(185, -26, 202, 0); outline.quadraticCurveTo(185, 26, 110, 28); outline.lineTo(-200, 26); outline.quadraticCurveTo(-206, 0, -200, -26);
  const ext = (y0, y1, color) => { const g = new THREE.ExtrudeGeometry(outline, { depth: y1 - y0, bevelEnabled: false, curveSegments: 16 }); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0);
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 1 }); hullMats.push(m); const mesh = new THREE.Mesh(g, m); mesh.castShadow = mesh.receiveShadow = true; ship.add(mesh); return mesh; };
  ext(-15, -1, 0xb8322f); ext(-1, 15, 0x23314f);
  // containers
  const n = 26 * 20 * 8, inst = new THREE.InstancedMesh(new THREE.BoxGeometry(12.0, 2.5, 2.35), new THREE.MeshStandardMaterial({ roughness: 0.7 }), n);
  const cols = [0x2f6db5, 0xc9472f, 0xf2f2ee, 0xe0a52c, 0x2e8b6b, 0x7d4fa8, 0x9aa3b5, 0x3fa6c9].map((c) => new THREE.Color(c));
  let i = 0; const m4 = new THREE.Matrix4();
  for (let bay = 0; bay < 26; bay++) { const x = -160 + bay * 12.6; if (x > 40 && x < 62) continue; const tiers = 4 + ((bay * 7) % 5);
    for (let r = 0; r < 20; r++) for (let tr = 0; tr < tiers; tr++) { if (i >= n) break; m4.makeTranslation(x, 16.3 + tr * 2.6, -23.75 + r * 2.5); inst.setMatrixAt(i, m4); inst.setColorAt(i, cols[(bay * 13 + r * 7 + tr * 3) % cols.length]); i++; } }
  inst.count = i; inst.castShadow = inst.receiveShadow = true; ship.add(inst); C.containers = inst;
  // bridge + funnel
  const white = new THREE.MeshStandardMaterial({ color: 0xf0f0ea, roughness: 0.5 });
  const br = new THREE.Mesh(new RoundedBoxGeometry(14, 34, 50, 2, 0.8), white); br.position.set(51, 32, 0); ship.add(br);
  const win = new THREE.Mesh(new THREE.BoxGeometry(14.2, 2.2, 50.2), new THREE.MeshStandardMaterial({ color: 0x1c2333, roughness: 0.2, metalness: 0.5 })); win.position.set(51, 45, 0); ship.add(win);
  const fun = new THREE.Mesh(new RoundedBoxGeometry(12, 26, 14, 2, 1), new THREE.MeshStandardMaterial({ color: 0x23314f, roughness: 0.5 })); fun.position.set(-178, 28, 0); ship.add(fun);
  const band = new THREE.Mesh(new THREE.BoxGeometry(12.3, 3, 14.3), new THREE.MeshStandardMaterial({ color: 0x4fb8e6 })); band.position.set(-178, 36, 0); ship.add(band);
  const brand = textTexture(1024, 64, (g, w, h) => { g.fillStyle = '#23314f'; g.fillRect(0, 0, w, h); g.font = '40px PS2P'; g.fillStyle = '#fff4dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(BRAND, w / 2, h / 2 + 2); });
  const bt = new THREE.Mesh(new THREE.PlaneGeometry(150, 9.4), new THREE.MeshBasicMaterial({ map: brand })); bt.position.set(0, 8, 26.05); ship.add(bt);
  ship.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // engine glow inside the stern (x-ray shot) + propeller + rudder
  C.shipEngine = new THREE.Mesh(new RoundedBoxGeometry(27, 13.5, 6, 2, 0.6), new THREE.MeshStandardMaterial({ color: 0xffb636, emissive: 0xff8a20, emissiveIntensity: 0.6, transparent: true, opacity: 0 }));
  C.shipEngine.position.set(-150, -7.5, 0); ship.add(C.shipEngine);
  C.shipShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 46, 12), new THREE.MeshStandardMaterial({ color: 0xd8dbe6, transparent: true, opacity: 0 })); C.shipShaft.rotation.z = Math.PI / 2; C.shipShaft.position.set(-185, -9, 0); ship.add(C.shipShaft);
  C.shipProp = new THREE.Group(); C.shipProp.position.set(-207, -8, 0); ship.add(C.shipProp);
  const bronze = new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.85, roughness: 0.25, emissive: 0x3a2400 });
  for (let k = 0; k < 6; k++) { const bl = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), bronze); bl.scale.set(0.4, 4.4, 1.6); bl.position.set(0, 4.4, 0); bl.rotation.y = 0.5; const arm = new THREE.Group(); arm.rotation.x = k * Math.PI / 3; arm.add(bl); C.shipProp.add(arm); }
  C.shipPropMat = bronze;
  // wake
  const wakeTex = textTexture(256, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.75)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const wake = new THREE.Mesh(new THREE.PlaneGeometry(500, 40), new THREE.MeshBasicMaterial({ map: wakeTex, transparent: true, depthWrite: false })); wake.rotation.x = -Math.PI / 2; wake.position.set(-450, 1.6, 0); ship.add(wake);
  const bow = new THREE.Mesh(new THREE.RingGeometry(20, 34, 32, 1, -Math.PI / 2.4, Math.PI / 1.2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); bow.rotation.x = -Math.PI / 2; bow.position.set(190, 1.7, 0); ship.add(bow);
}
function updateOcean(t) {
  const p = oceanGeo.attributes.position.array;
  for (let i = 0; i < p.length; i += 3) { const x = oBase[i], z = oBase[i + 2];
    p[i + 1] = 1.6 * Math.sin(x * 0.012 + t * 0.9) + 1.0 * Math.sin(z * 0.02 - t * 1.3 + x * 0.004) + 0.6 * Math.sin((x + z) * 0.035 + t * 1.7); }
  oceanGeo.attributes.position.needsUpdate = true; oceanGeo.computeVertexNormals();
}

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
const SX = -8000; // sea offset
const HOOK = {
  shipBow: [[SX + 330, 22, 120], [SX + 320, 24, 110], [SX + 170, 12, 0], true],
  pistonClose: [[81.7, 11.4, 5.6], [81.4, 11.2, 5.2], [80, 11.0, 0]],
  shipStack: [[SX - 120, 70, 140], [SX - 135, 70, 135], [SX - 175, 35, 0], true],
  crankClose: [[82.8, 4.2, 8.6], [82.3, 4.4, 8.0], [80, 3.8, 0]],
  turboClose: [[TX + 2.5, TY + 2.5, 8], [TX + 1.5, TY + 2.3, 7.6], [TX, TY, 0]],
  shipSide: [[SX - 40, 30, 260], [SX + 20, 30, 260], [SX, 10, 0], true],
  coversClose: [[6.5, 13.8, 9.5], [4.5, 13.5, 9.5], [2, 11, 1]],
  propClose: [[52, 4.5, 11], [51, 5, 10], [44, 2.2, 0]],
};
const SHOTS = [ // [b0, b1, pos0, pos1, tgt0, tgt1, atSea]
  [8, 12, [SX + 420, 120, 520], [SX - 95, 2, 215], [SX, 10, 0], [SX - 172, -6, 0], true],
  [12, 16, [SX - 95, 2, 215], [SX - 105, 1, 205], [SX - 172, -6, 0], [SX - 175, -6, 0], true],
  [16, 24, [81.6, 9.7, 34], [81.4, 9.7, 33], [80.9, 9.7, 0], [80.9, 9.7, 0]],
  [24, 57, [81.2, 11.7, 20], [81.0, 11.8, 19], [80.5, 11.7, 0], [80.5, 11.8, 0]],
  [57, 64, [TX + 3.5, TY + 3.0, 15], [TX + 2.5, TY + 2.6, 13.5], [TX, TY + 0.6, 0], [TX, TY + 0.6, 0]],
  [64, 72, [81.4, 7.4, 19], [81.2, 7.6, 18], [80.6, 7.0, 0], [80.6, 7.2, 0]],
  [72, 80, [64, 6.5, 10], [61, 6, 9], [30, 3, 0], [30, 3, 0]],
  [80, 88, [SX - 260, 40, 380], [SX - 200, 34, 360], [SX, 20, 0], [SX + 20, 20, 0], true],
  [88, 97, [SX + 520, 60, 300], [SX + 760, 90, 420], [SX, 15, 0], [SX - 40, 15, 0], true],
];
function camAt(b) {
  if (b < 8) { const [p0, p1, tg, s] = HOOK[TL.HOOK_SHOTS[Math.floor(b)]]; const u = b - Math.floor(b); return { pos: V(p0).lerp(V(p1), u), tgt: V(tg), atSea: !!s }; }
  const s = SHOTS.find((x) => b >= x[0] && b < x[1]) || SHOTS[SHOTS.length - 1];
  const u = TL.ease((b - s[0]) / (s[1] - s[0]));
  return { pos: V(s[2]).lerp(V(s[3]), u), tgt: V(s[4]).lerp(V(s[5]), u), atSea: !!s[6] };
}
const hemi = scene.children.find((o) => o.isHemisphereLight);

window.renderFrame = function (t) {
  const b = t / TL.B;
  const { pos, tgt, atSea } = camAt(b);
  hallObjs.forEach((o) => { o.visible = !atSea; }); sea.visible = atSea;
  flows.forEach((f) => f.update(t, !atSea && b >= 56 || (!atSea && b < 8)));
  if (atSea) {
    scene.background = skyTex; scene.fog.color.set(0xd98a7a); scene.fog.near = 600; scene.fog.far = 3200;
    sun.color.set(0xffb98a); sun.intensity = 3.2; hemi.color.set(0xffc9b0); hemi.groundColor.set(0x1d2f55);
    updateOcean(t);
    const xray = b >= 9 && b < 16 ? TL.clamp01((b - 9) / 1.5) : 0;
    hullMats.forEach((m) => { m.opacity = 1 - 0.7 * xray; m.depthWrite = xray < 0.5; });
    ocean.material.opacity = 1 - 0.55 * xray; ocean.material.depthWrite = xray < 0.5;
    C.containers.visible = true;
    C.shipEngine.material.opacity = xray; C.shipShaft.material.opacity = xray; C.shipProp.visible = xray > 0.3;
    C.shipEngine.material.emissiveIntensity = 0.5 + 0.4 * Math.exp(-((b % 1) * TL.B) * 6) * xray;
    C.shipProp.rotation.x = -TL.crankDeg(b) * Math.PI / 180;
    ship.rotation.z = Math.sin(t * 0.6) * 0.004; ship.position.y = Math.sin(t * 0.8) * 0.4;
  } else {
    scene.background = new THREE.Color(0x2a2450); scene.fog.color.set(0x2a2450); scene.fog.near = 55; scene.fog.far = 140;
    sun.color.set(0xffd2a8); sun.intensity = 3.0; hemi.color.set(0xc8d8ff); hemi.groundColor.set(0x3a2c55);
  }

  // cutaway kinematics
  const phi = TL.crankDeg(b), pr = phi * Math.PI / 180;
  const pinX = CR * Math.sin(pr), pinY = CRANK_Y + CR * Math.cos(pr);
  const xY = CRANK_Y + CR * Math.cos(pr) + Math.sqrt(CONROD * CONROD - (CR * Math.sin(pr)) ** 2);
  C.web.rotation.z = -pr;
  C.conrod.position.set(pinX / 2, (pinY + xY) / 2, 0.35); C.conrod.rotation.z = Math.atan2(pinX, xY - pinY);
  C.xhead.position.y = xY; C.prod.position.y = xY + PROD / 2;
  const pistonY = xY + PROD + 0.25; C.piston.position.y = pistonY;
  const crown = pistonY + 0.25, p360 = ((phi % 360) + 360) % 360;
  const lift = p360 > 110 && p360 < 250 ? 0.35 * Math.sin(Math.PI * (p360 - 110) / 140) : 0;
  C.valve.position.set(0, COVER_Y - 0.05 - lift, -0.3);
  C.ports.forEach((m) => { m.material.opacity = TL.clamp01((9.95 - crown) / 0.3) * 0.9; });
  const gh = Math.max(0.02, COVER_Y - crown); gasMesh.scale.y = gh; gasMesh.position.set(0, crown + gh / 2, -0.1);
  const look = gasLookCrank(phi, false);
  gasMat.uniforms.uCol.value.copy(look.c); gasMat.uniforms.uA.value = look.a; gasMat.uniforms.uHi.value = look.hi; gasMat.uniforms.uT.value = t;
  const sprayK = p360 > 352 || p360 < 22 ? 1 : 0; C.spray.material.opacity = sprayK * 0.85; C.spray.scale.setScalar(0.6 + 0.6 * sprayK);
  // drive rig + turbo
  const rot = -pr; C.spin.rotation.x = rot; C.prop.rotation.x = rot;
  C.turbine.rotation.x = t * 14; C.compressor.rotation.x = t * 14;

  const lastBang = (() => { let r = -99; for (const x of TL.BANGS) if (x <= b) r = x; return r; })();
  const bangAge = (b - lastBang) * TL.B, showCut = TL.cutawayVisible(b);
  const flash = showCut && bangAge < 0.25 ? 1 - bangAge / 0.25 : 0;
  bangLight.position.set(80, 12.3, 1.5); bangLight.intensity = flash * 4;

  // camera
  let shake = showCut ? flash * 0.04 : 0;
  pos.x += Math.sin(t * 71) * shake; pos.y += Math.cos(t * 59) * shake;
  camera.position.copy(pos); camera.lookAt(tgt);
  camera.near = atSea ? 2 : 0.3; camera.far = atSea ? 5000 : 300;
  const sb = (b % 1) * TL.B, sbar = (b % 4) * TL.B;
  camera.fov = 35 - (b >= 8 ? 1.2 * Math.exp(-sbar * 7) : 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  wallMats.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(1 + (b >= 8 ? 0.6 * Math.exp(-sb * 10) : 0)));

  const dist = pos.distanceTo(tgt), sz = atSea ? 260 : Math.max(6, Math.min(30, dist * 0.75));
  sun.target.position.copy(tgt); sun.position.copy(tgt).add(atSea ? new THREE.Vector3(-300, 260, 400) : new THREE.Vector3(18, 30, 22));
  Object.assign(sun.shadow.camera, { left: -sz, right: sz, top: sz, bottom: -sz, near: 1, far: atSea ? 1500 : 120 }); sun.shadow.camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  if (flash > 0.01) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,190,110,${flash * 0.12})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  dither();

  // overlays
  drawSpeedTag(b);
  TL.CAPTIONS.filter((c) => b >= c.t0 && b < c.t1).forEach((c) => drawCaption(c, b));
  const P = (v) => project(v);
  const anchors = {
    engineInShip: P(new THREE.Vector3(SX - 150, -4, 3)), prop: P(new THREE.Vector3(SX - 207, -3, 0)),
    injector: P(new THREE.Vector3(80.85, COVER_Y + 0.5, 0.3)), valve: P(new THREE.Vector3(80.25, COVER_Y + 0.4, 0.7)), ports: P(new THREE.Vector3(80.56, 9.5, 0.4)),
    turbine: P(new THREE.Vector3(TX - 1.5, TY - 0.6, 1.0)), compressor: P(new THREE.Vector3(TX + 1.5, TY - 0.6, 1.0)),
    crosshead: P(new THREE.Vector3(80 - 0.5, xY, 0.6)), propHall: P(new THREE.Vector3(44, SHAFT_Y + 3.5, 0.6)), shaft: P(new THREE.Vector3(24, SHAFT_Y + 0.4, 0.4)),
  };
  TL.LABELS.forEach((lb) => drawLabel(lb, anchors[lb.id], b));
  if (showCut && b >= 16) drawPop('BANG!', P(new THREE.Vector3(81.3, 12.8, 0.5)), bangAge, COL.yellow);
  // crosshead forces
  if (b >= 65 && b < 71.9) {
    const xp = P(new THREE.Vector3(80, xY, 0.6)), side = Math.sin(pr) * 70;
    if (Math.abs(side) > 8) arrow(xp.x, xp.y, xp.x - side, xp.y, COL.pink, 7);
    const pp = P(new THREE.Vector3(80, pistonY, 0.6)); arrow(pp.x + 70, pp.y + 50, pp.x + 70, pp.y - 30 * Math.sign(Math.cos(pr) + 0.001) + 20, COL.mint, 5);
  }
  // reverse indicator
  if (b >= 72 && b < 80) {
    const back = TL.isBackwards(b), pp = P(new THREE.Vector3(44, SHAFT_Y + 5.5, 0));
    ctx.font = `24px ${FONT.ps}`; ctx.textAlign = 'center'; ctx.fillStyle = back ? COL.pink : COL.cyan;
    ctx.fillStyle = COL.ink; ctx.fillRect(W / 2 - 150, H - 170, 300, 56); ctx.fillStyle = back ? COL.pink : COL.cyan; ctx.font = `28px ${FONT.ps}`; ctx.fillText(back ? '<< ASTERN' : 'AHEAD >>', W / 2, H - 140); ctx.textAlign = 'left';
  }
  // efficiency bars
  if (b >= 80 && b < 87.9) {
    const u1 = TL.ease((b - 80.5) / 1.5), u2 = TL.ease((b - 83) / 1.5), x0 = 70, y0 = 760, wMax = 560;
    ctx.fillStyle = 'rgba(18,13,34,0.85)'; ctx.fillRect(40, y0 - 40, W - 80, 260);
    [[u1 * 0.5, 'SHIP ENGINE', '~50%', COL.mint], [u2 * 0.38, 'CAR ENGINE', '<40%', COL.pink]].forEach(([v, name, val, c], i) => {
      const y = y0 + i * 110; ctx.font = `20px ${FONT.ps}`; ctx.fillStyle = c; ctx.textBaseline = 'top'; ctx.fillText(name, x0, y);
      ctx.fillStyle = '#2a2350'; ctx.fillRect(x0, y + 34, wMax, 40); ctx.fillStyle = c; ctx.fillRect(x0, y + 34, wMax * v, 40);
      if (v > 0.02) { ctx.font = `24px ${FONT.ps}`; ctx.fillStyle = COL.ink; ctx.fillText(val, x0 + 10, y + 42); }
    });
    ctx.textBaseline = 'middle';
  }
  drawHandle();
  return out.toDataURL('image/jpeg', 0.92);
};
window.ready = Promise.resolve(true);
