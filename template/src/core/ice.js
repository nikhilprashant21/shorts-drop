// Kit for "In This Town, Never Let Go on the Ice": a frozen lake at dusk with see-through ice, black water below,
// snowy shore with pines, lamps and a bench, scratched words, a crack decal, and upside-down "under-ice" people.
import * as THREE from 'three';
import { mat } from './world.js';
import { box, cyl, pine, streetLamp, rnd, snowfall } from './blocky.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const SHORE = 22;   // the near shore line (z)

function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

function iceTex() {
  const t = canvasT(512, 512, (g, w, h) => {
    g.fillStyle = 'rgb(205,226,240)'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(255,255,255,${0.15 + rnd(i) * 0.35})`; g.lineWidth = 0.6 + rnd(i * 2) * 1.4; g.beginPath(); const x = rnd(i * 3) * w, y = rnd(i * 5) * h, a = rnd(i * 7) * 6.28, l = 20 + rnd(i * 9) * 120; g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.4) * l / 2, y + Math.sin(a + 0.4) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    for (let i = 0; i < 40; i++) { const x = rnd(i * 11) * w, y = rnd(i * 13) * h, r = 20 + rnd(i * 17) * 70; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(160,190,215,0.35)'); gr.addColorStop(1, 'rgba(160,190,215,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8); return t;
}
function wordsTex() {
  return canvasT(1024, 300, (g) => {
    g.clearRect(0, 0, 1024, 300); g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
    g.font = '700 150px Caladea'; g.textAlign = 'center'; g.fillStyle = 'rgba(0,0,0,0)';
    g.save(); g.translate(512, 200); g.rotate(-0.03); g.strokeText('NEVER ALONE', 0, 0); g.lineWidth = 2; g.strokeStyle = 'rgba(220,240,255,0.7)'; g.strokeText('NEVER ALONE', 4, 3); g.restore();
  });
}
function crackTex() {
  return canvasT(512, 512, (g) => {
    g.clearRect(0, 0, 512, 512); g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineCap = 'round';
    const branch = (x, y, a, l, w, d) => { if (d > 4 || l < 8) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); branch(x2, y2, a + (rnd(x2 + d) - 0.5) * 0.9, l * 0.75, w * 0.7, d + 1); if (rnd(y2 * 3 + d) > 0.45) branch(x2, y2, a + (rnd(x2 * 7) > 0.5 ? 0.8 : -0.8), l * 0.55, w * 0.6, d + 1); };
    for (let i = 0; i < 9; i++) branch(256, 256, (i / 9) * 6.28 + rnd(i) * 0.4, 60 + rnd(i * 3) * 40, 5, 0);
  });
}
function skyTex() {
  return canvasT(16, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#0E1230'); gr.addColorStop(0.45, '#2C2E5A'); gr.addColorStop(0.62, '#7A5A7E'); gr.addColorStop(0.72, '#D08A6A'); gr.addColorStop(1, '#30304A'); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); });
}

/** an upside-down copy of a person standing on the underside of the ice (feet at y = 0) */
export function underize(p, { dark = true } = {}) {
  p.group.traverse((o) => { if (o.isMesh) { const ms = Array.isArray(o.material) ? o.material : [o.material]; const c = ms.map((m) => { const n = m.clone(); n.side = THREE.DoubleSide; if (dark) { n.color && n.color.multiplyScalar(0.12); n.map = dark === 'face' ? n.map : null; n.emissive && n.emissive.set('#1A3A6A'); n.emissiveIntensity = 0.8; n.roughness = 0.4; } return n; }); o.material = Array.isArray(o.material) ? c : c[0]; o.castShadow = false; } });
  p.under = true; return p;
}

export function lakeSet(E) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1A1D36'); scene.fog = new THREE.Fog('#2A2C4C', 14, 60);
  scene.environment = E.envMap; scene.environmentIntensity = 0.15;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 24, 16), new THREE.MeshBasicMaterial({ map: skyTex(), side: THREE.BackSide, fog: false, toneMapped: false })); scene.add(sky);
  // black water under the ice + a dim blue light down there
  const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#04101C', roughness: 1 })); water.rotation.x = -Math.PI / 2; water.position.y = -3.0; scene.add(water);
  const underL = new THREE.PointLight('#4A7AB8', 1.4, 7, 1.4); underL.position.set(0, -1.6, 0); scene.add(underL);
  // the ice (see-through)
  const iceM = new THREE.MeshStandardMaterial({ color: '#CFE4F2', map: iceTex(), transparent: true, opacity: 0.4, roughness: 0.35, metalness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const ice = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), iceM); ice.rotation.x = -Math.PI / 2; ice.receiveShadow = true; ice.renderOrder = 5; scene.add(ice);
  // shore: snow banks around the lake
  const snowM = mat({ color: '#D2DAE6', roughness: 0.95 });
  box(120, 0.12, 40, snowM, 0, 0.0, 22 + 20, scene); box(120, 0.12, 40, snowM, 0, 0.0, -22 - 20, scene); box(40, 0.12, 44, snowM, 22 + 20, 0.0, 0, scene); box(40, 0.12, 44, snowM, -22 - 20, 0.0, 0, scene);
  const shoreG = new THREE.Mesh(new THREE.PlaneGeometry(120, 36), snowM); shoreG.rotation.x = -Math.PI / 2; shoreG.position.set(0, 0.065, SHORE + 18); shoreG.receiveShadow = true; scene.add(shoreG);
  for (let k = 0; k < 40; k++) { const p = pine(1.4 + rnd(k) * 1.1); const a = rnd(k * 3) * 6.28, r = 26 + rnd(k * 7) * 14; p.position.set(Math.cos(a) * r, 0.06, Math.sin(a) * r); if (p.position.z > 0 && Math.abs(p.position.x) < 8) p.position.x += 14 * Math.sign(p.position.x || 1); scene.add(p); }
  const lamps = [-7, 7].map((x) => { const g = streetLamp(); g.position.set(x, 0, SHORE + 2.4); g.rotation.y = Math.PI; scene.add(g); g.set(0.7); const l = new THREE.PointLight('#FFC88A', 2.5, 12, 1.4); l.position.set(x, 3.1, SHORE + 1.8); scene.add(l); return g; });
  const bench = new THREE.Group(); { const w = mat({ color: '#6A4A34' }); box(1.8, 0.08, 0.45, w, 0, 0.48, 0, bench); box(1.8, 0.4, 0.06, w, 0, 0.75, -0.2, bench); [-0.8, 0.8].forEach((x) => box(0.08, 0.48, 0.4, w, x, 0.24, 0, bench)); }
  bench.position.set(2.5, 0, SHORE + 3.2); bench.rotation.y = Math.PI; scene.add(bench);
  // scratched words near the shore
  const words = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.0), new THREE.MeshBasicMaterial({ map: wordsTex(), transparent: true, depthWrite: false, toneMapped: false, opacity: 0.85 })); words.rotation.x = -Math.PI / 2; words.position.set(-1.5, 0.012, SHORE - 1.6); scene.add(words);
  // crack decal
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: crackTex(), transparent: true, depthWrite: false, toneMapped: false })); crack.rotation.x = -Math.PI / 2; crack.position.y = 0.014; crack.visible = false; scene.add(crack);
  // light
  const hemi = new THREE.HemisphereLight('#8A90C8', '#2A2C40', 0.9); scene.add(hemi);
  const dusk = new THREE.DirectionalLight('#F0B090', 0.9); dusk.position.set(-20, 10, -30); dusk.castShadow = true; dusk.shadow.mapSize.set(1024, 1024); Object.assign(dusk.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 80 }); dusk.shadow.camera.updateProjectionMatrix(); scene.add(dusk, dusk.target);
  const snow = snowfall(900, [30, 9, 30], [0, 0, 6], 0.05); scene.add(snow);
  const R = {
    scene, ice, iceM, underL, crack, words, lamps, bench, snow, dusk, hemi,
    /** night: 0 dusk → 1 night; follow: where the shadow camera centres */
    set({ t = 0, night = 0, at = V3(0, 0, 0), crackAt = null, crackK = 0 } = {}) {
      hemi.intensity = 0.9 - 0.55 * night; dusk.intensity = 0.9 * (1 - night); underL.position.set(at.x + 1.5, -2.4, at.z + 1.0);
      dusk.target.position.copy(at); dusk.position.copy(at).add(V3(-20, 14, -30));
      crack.visible = !!crackAt && crackK > 0; if (crackAt) { crack.position.set(crackAt.x, 0.014, crackAt.z); crack.scale.setScalar(Math.max(0.01, crackK)); }
      snow.update(t); return R;
    },
  };
  R.set({});
  return R;
}
