// Kit for "In This Town, Something Knocks With Your Dad's Voice": the house set (hallway + kitchen inside,
// porch + pines outside, one front door between them), the Mimic, its hand, keys, the note, knock timing.
import * as THREE from 'three';
import { mat, T as TX } from './world.js';
import { box, cyl, pine, snowfall, rnd } from './blocky.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const D = Math.PI / 180;

// ── knock patterns (seconds from the first hit) ─────────────────────────
export const OLD_KNOCK = [0, 0.5, 1.0, 1.17, 1.34];     // two slow, three fast
export const NEW_KNOCK = [0, 0.16, 0.62, 0.78, 1.3];    // two fast, two fast, one slow
/** 0 = hand pulled back, 1 = touching the wood, around each hit time */
export function knockK(t, hits) {
  let k = 0;
  for (const h of hits) { const d = t - h; if (d > -0.13 && d <= 0) k = Math.max(k, (d + 0.13) / 0.13); else if (d > 0 && d < 0.11) k = Math.max(k, 1 - d / 0.11); }
  return k * k * (3 - 2 * k);
}

// ── the under-door light strip (with shadows of feet) ────────────────────
function doorStrip(w = 0.92) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.5, 0.6), m); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.022, 0.3);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.022), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false }));
  line.position.set(0, 0.03, 0.045);
  let last = '';
  p.userData.draw = ({ light = 1, feet = [], col = '255,214,150' } = {}) => {
    const key = JSON.stringify([light, feet.map((f) => [f.x.toFixed(3), (f.w || 0.12).toFixed(3), (f.a ?? 1).toFixed(2), f.long || 0]), col]); if (key === last) return; last = key;
    const g = c.getContext('2d'); g.clearRect(0, 0, 256, 96);
    const px = (x) => 128 + (x / (w + 0.5)) * 256, x0 = px(-w / 2), x1 = px(w / 2);
    const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, `rgba(${col},${0.95 * light})`); gr.addColorStop(0.25, `rgba(${col},${0.35 * light})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, 0); g.lineTo(x1 + 50, 96); g.lineTo(x0 - 50, 96); g.closePath(); g.fill();
    g.globalCompositeOperation = 'destination-out';
    for (const f of feet) {
      const a = f.a ?? 1, fw = ((f.w || 0.12) / (w + 0.5)) * 256, cx = px(f.x), len = f.long ? 96 : 60;
      const gg = g.createLinearGradient(0, 0, 0, len); gg.addColorStop(0, `rgba(0,0,0,${a})`); gg.addColorStop(1, `rgba(0,0,0,${a * 0.6})`); g.fillStyle = gg;
      g.beginPath(); g.moveTo(cx - fw / 2, 0); g.lineTo(cx + fw / 2, 0); g.lineTo(cx + fw / 2 + fw * (f.long ? 0.2 : 0.7), len); g.lineTo(cx - fw / 2 - fw * (f.long ? 0.2 : 0.7), len); g.closePath(); g.fill();
    }
    g.globalCompositeOperation = 'source-over'; tx.needsUpdate = true;
  };
  p.userData.draw({});
  return { strip: p, line };
}
/** two feet standing behind the door: centre x, open-ness of the stance */
export const feetAt = (x, a = 1, w = 0.13) => [{ x: x - 0.1, w, a }, { x: x + 0.1, w, a }];

// ── the house: inside (z > 0) and outside (z < 0) share one front door at z = 0 ──
export function houseSet(E) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05070F'); scene.fog = new THREE.Fog('#0B1020', 6, 22);
  scene.environment = E.envMap; scene.environmentIntensity = 0.05;
  const HW = 0.96, HH = 2.08;                                    // the door hole
  // floors
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6.6), mat({ map: TX.planks('#6A4630', [3, 3]) })); fl.rotation.x = -Math.PI / 2; fl.position.set(1.4, 0.001, 3.25); fl.receiveShadow = true; scene.add(fl);
  const rug = box(1.1, 0.012, 1.8, mat({ color: '#4A3A44', roughness: 1 }), 0, 0.008, 1.9, scene); rug.receiveShadow = true;
  const snowG = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), mat({ color: '#C9D3E0', roughness: 0.95 })); snowG.rotation.x = -Math.PI / 2; snowG.position.set(0, -0.18, -20); snowG.receiveShadow = true; scene.add(snowG);
  // the front wall, two skins: inside colour / outside siding
  const inM = mat({ color: '#7D6A5C', roughness: 0.92 }), outM = mat({ color: '#5E6E86', roughness: 0.9 });
  const wallPair = (w, h, x, y) => { box(w, h, 0.1, inM, x, y, 0.05, scene); box(w, h, 0.1, outM, x, y, -0.05, scene); };
  const L0 = -1.7, R0 = 4.6; // inside width
  wallPair(-HW / 2 - (-6), 3.2, (-6 + -HW / 2) / 2, 1.6); wallPair(6 - HW / 2, 3.2, (6 + HW / 2) / 2, 1.6); wallPair(HW, 3.2 - HH, 0, HH + (3.2 - HH) / 2);
  // trim around the door, both sides
  const trimI = mat({ color: '#EDE4D6' }), trimO = mat({ color: '#E8ECF2' });
  [[0.11, trimI], [-0.11, trimO]].forEach(([z, m]) => { box(0.1, HH + 0.1, 0.04, m, -HW / 2 - 0.05, HH / 2, z, scene); box(0.1, HH + 0.1, 0.04, m, HW / 2 + 0.05, HH / 2, z, scene); box(HW + 0.2, 0.1, 0.04, m, 0, HH + 0.05, z, scene); });
  // inside walls + ceiling
  const sideM = mat({ color: '#7D6A5C', roughness: 0.92 });
  box(0.2, 3.0, 6.6, sideM, L0, 1.5, 3.3, scene); box(0.2, 3.0, 6.6, sideM, R0, 1.5, 3.3, scene); box(6.5, 3.0, 0.2, sideM, 1.45, 1.5, 6.6, scene);
  box(6.5, 0.2, 6.6, mat({ color: '#3A302A' }), 1.45, 2.9, 3.3, scene);
  box(6.3, 0.12, 0.04, trimI, 1.45, 0.06, 0.12, scene);
  // a picture + a coat hook rail + coats on the left wall
  box(0.04, 0.6, 0.8, mat({ color: '#4A3A2E' }), L0 + 0.12, 1.75, 2.6, scene); box(0.02, 0.48, 0.66, mat({ color: '#8EA3B5' }), L0 + 0.15, 1.75, 2.6, scene);
  box(0.06, 0.08, 1.2, mat({ color: '#5A4232' }), L0 + 0.13, 1.72, 0.9, scene);
  [[0.6, '#7A3A2E'], [1.05, '#3E5272'], [1.3, '#C8443F']].forEach(([z, c], i) => box(0.18, i === 2 ? 0.55 : 0.85, 0.36, mat({ color: c }), L0 + 0.22, i === 2 ? 1.42 : 1.3, z, scene));
  // side table + lamp by the door (the one warm light at night)
  box(0.45, 0.75, 0.45, mat({ color: '#4E3826' }), L0 + 0.38, 0.375, 2.0, scene);
  cyl(0.06, 0.08, 0.3, mat({ color: '#2E2A26' }), L0 + 0.38, 0.9, 2.0, scene, 10);
  const shadeM = new THREE.MeshStandardMaterial({ color: '#F4D9A8', emissive: '#FFB860', emissiveIntensity: 0.9, side: THREE.DoubleSide });
  const shade = cyl(0.12, 0.2, 0.22, shadeM, L0 + 0.38, 1.15, 2.0, scene, 16); shade.castShadow = false;
  const lampL = new THREE.PointLight('#FFB868', 3.0, 7, 1.6); lampL.position.set(L0 + 0.45, 1.25, 2.0); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.shadow.bias = -0.002; scene.add(lampL);
  // kitchen corner: table, chairs, the note, a pencil, a table lamp, a window
  const table = new THREE.Group(); { const m = mat({ color: '#9A6A44' }); box(1.5, 0.07, 0.95, m, 0, 0.82, 0, table); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.07, 0.82, 0.07, m, a * 0.66, 0.41, b * 0.4, table)); }
  table.position.set(3.2, 0, 3.4); scene.add(table);
  const chairAt = (x, z, ry) => { const g = new THREE.Group(), m = mat({ color: '#6E4630' }); box(0.5, 0.05, 0.5, m, 0, 0.5, 0, g); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.05, 0.5, 0.05, m, a * 0.22, 0.25, b * 0.22, g)); box(0.5, 0.55, 0.05, m, 0, 0.8, -0.23, g); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); return g; };
  chairAt(3.2, 4.2, Math.PI); chairAt(2.2, 3.4, Math.PI / 2);
  const noteC = document.createElement('canvas'); noteC.width = 384; noteC.height = 512; const noteT = new THREE.CanvasTexture(noteC); noteT.colorSpace = THREE.SRGBColorSpace; noteT.anisotropy = 8;
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.28), new THREE.MeshStandardMaterial({ map: noteT, roughness: 0.9 })); note.rotation.x = -Math.PI / 2; note.rotation.z = 0.25; note.position.set(3.05, 0.858, 3.3); scene.add(note);
  const drawNote = (k = 1) => {   // k: how much is written (0..1)
    const g = noteC.getContext('2d'); g.fillStyle = '#F6EFDD'; g.fillRect(0, 0, 384, 512);
    g.strokeStyle = 'rgba(120,150,200,0.35)'; g.lineWidth = 2; for (let y = 80; y < 512; y += 46) { g.beginPath(); g.moveTo(20, y); g.lineTo(364, y); g.stroke(); }
    g.save(); g.beginPath(); g.rect(0, 0, 384, 512 * k); g.clip();
    g.fillStyle = '#1E2A55'; g.font = 'italic 700 52px Caladea'; g.fillText('Mia,', 34, 72); g.font = 'italic 700 40px Caladea'; g.fillText('our NEW knock:', 34, 160);
    const dot = (x) => { g.beginPath(); g.arc(x, 240, 17, 0, 7); g.fill(); };
    [62, 104, 186, 228, 330].forEach(dot);
    g.font = 'italic 700 30px Caladea'; g.fillText('two fast, two fast,', 34, 318); g.fillText('one slow.', 34, 358); g.font = 'italic 700 40px Caladea'; g.fillText('Love, Dad', 150, 460);
    g.restore(); noteT.needsUpdate = true;
  };
  drawNote(1);
  const pencil = cyl(0.008, 0.008, 0.17, mat({ color: '#E8B830' }), 3.28, 0.866, 3.38, scene, 6); pencil.rotation.z = Math.PI / 2; pencil.rotation.y = 0.6;
  cyl(0.07, 0.09, 0.03, mat({ color: '#2E2A26' }), 3.65, 0.87, 3.15, scene, 12); cyl(0.012, 0.012, 0.3, mat({ color: '#2E2A26' }), 3.65, 1.02, 3.15, scene, 6);
  const tShade = cyl(0.08, 0.15, 0.16, shadeM, 3.65, 1.2, 3.15, scene, 16); tShade.castShadow = false;
  const tLamp = new THREE.PointLight('#FFC27A', 2.2, 4.5, 1.6); tLamp.position.set(3.6, 1.15, 3.25); scene.add(tLamp);
  const winM = new THREE.MeshBasicMaterial({ color: '#16203A', toneMapped: false }); const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), winM); win.position.set(R0 - 0.11, 1.6, 3.3); win.rotation.y = -Math.PI / 2; scene.add(win);
  [[0, 0.55], [0, -0.55]].forEach(([, y]) => box(0.06, 0.06, 1.3, trimI, R0 - 0.13, 1.6 + y, 3.3, scene)); [-0.62, 0.62].forEach((z) => box(0.06, 1.16, 0.06, trimI, R0 - 0.13, 1.6, 3.3 + z, scene)); box(0.05, 1.0, 0.04, trimI, R0 - 0.13, 1.6, 3.3, scene);
  // the door: hinge at x = -HW/2, swings inward (rotation.y < 0)
  const hinge = new THREE.Group(); hinge.position.set(-HW / 2, 0, 0); scene.add(hinge);
  const doorM = mat({ color: '#5E2226', roughness: 0.6 });
  const leaf = box(HW - 0.02, HH - 0.04, 0.06, doorM, HW / 2, HH / 2 + 0.02, 0, hinge);
  [[0.55, 1.45], [0.55, 0.6]].forEach(([, y]) => [0.25, 0.71].forEach((x) => { box(0.3, 0.6, 0.02, mat({ color: '#4E1C20', roughness: 0.6 }), x, y, 0.035, hinge); box(0.3, 0.6, 0.02, mat({ color: '#4E1C20', roughness: 0.6 }), x, y, -0.035, hinge); }));
  const brass = mat({ color: '#C8A35A', metalness: 0.7, roughness: 0.35 });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), brass); knob.position.set(HW - 0.12, 1.0, 0.06); hinge.add(knob);
  const knobO = knob.clone(); knobO.position.z = -0.06; hinge.add(knobO);
  const bolt = box(0.07, 0.05, 0.04, brass, HW - 0.12, 1.2, 0.05, hinge);
  const peep = cyl(0.018, 0.018, 0.04, brass, HW / 2, 1.55, 0.04, hinge, 10); peep.rotation.x = Math.PI / 2;
  const chain = box(0.22, 0.012, 0.012, mat({ color: '#B8B8C0', metalness: 0.8, roughness: 0.3 }), HW - 0.05, 1.42, 0.07, hinge);
  const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16), brass); knocker.position.set(HW / 2, 1.42, -0.05); hinge.add(knocker);
  const { strip, line } = doorStrip(HW - 0.04); scene.add(strip, line);
  // outside: porch, porch light, steps, overhang, windows, pines in fog
  box(2.6, 0.18, 1.6, mat({ color: '#6C5A4C' }), 0, -0.09, -0.8, scene); box(2.6, 0.09, 0.4, mat({ color: '#6C5A4C' }), 0, -0.135, -1.8, scene);
  box(3.2, 0.12, 1.5, mat({ color: '#3E3A44' }), 0, 2.75, -0.7, scene);
  const mat2 = box(0.8, 0.02, 0.5, mat({ color: '#5A4A3A', roughness: 1 }), 0, 0.01, -0.4, scene);
  const porchShade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), new THREE.MeshStandardMaterial({ color: '#FFE2A8', emissive: '#FFC870', emissiveIntensity: 1.4 })); porchShade.position.set(0.85, 2.0, -0.12); scene.add(porchShade);
  const porchL = new THREE.PointLight('#FFC27A', 2.4, 6, 1.5); porchL.position.set(0.85, 1.95, -0.4); porchL.castShadow = true; porchL.shadow.mapSize.set(1024, 1024); porchL.shadow.bias = -0.002; scene.add(porchL);
  const winsO = [-2.6, 2.6].map((x) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.0), new THREE.MeshStandardMaterial({ color: '#141A2A', emissive: '#FFB860', emissiveIntensity: 0 })); w.position.set(x, 1.5, -0.11); w.rotation.y = Math.PI; scene.add(w); return w; });
  const pines = []; for (let k = 0; k < 22; k++) { const p = pine(1.3 + rnd(k) * 0.9); p.position.set(-9 + rnd(k * 7) * 18, -0.18, -5.5 - rnd(k * 3) * 9); scene.add(p); pines.push(p); }
  const trunk = cyl(0.16, 0.2, 3.0, mat({ color: '#3A2C24', roughness: 1 }), -1.4, 1.5, -6.2, scene, 10);
  const moon = new THREE.DirectionalLight('#7E9CE0', 0.35); moon.position.set(-3, 6, -10); moon.target.position.set(0, 0, 0); scene.add(moon, moon.target);
  const hemi = new THREE.HemisphereLight('#3A4870', '#0A0A12', 0.3); scene.add(hemi);
  const snow = snowfall(900, [16, 8, 10], [0, 0, -5], 0.05); scene.add(snow);
  const sun = new THREE.DirectionalLight('#FFF1DE', 0); sun.position.set(3, 7, -6); sun.target.position.set(0, 0, 0); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); sun.shadow.camera.updateProjectionMatrix(); scene.add(sun, sun.target);
  const rim = new THREE.PointLight('#9FB8F0', 0, 4, 1.5); scene.add(rim);
  const dayFill = new THREE.PointLight('#FFF4E6', 0, 9, 1.2); dayFill.position.set(1.5, 2.5, 3.2); scene.add(dayFill);

  const H = {
    scene, pines, rim, hinge, leaf, knob, bolt, chain, peep, knocker, strip, line, note, drawNote, pencil, table, porchL, lampL, tLamp, snow, trunk, winsO, mat: mat2, doorM, inM,
    HW, HH,
    /** mode: 'night' (lamp only) | 'evening' (lamps on, warm) | 'day' (bright morning) ; porch light on/off */
    light({ mode = 'night', porch = true, lamp = 1, tlamp = 0, fog = 1 } = {}) {
      const day = mode === 'day';
      scene.background.set(day ? '#BFD0E2' : '#05070F'); scene.fog.color.set(day ? '#C9D6E4' : '#0B1020'); scene.fog.near = day ? 10 : 4 + 4 * (1 - fog); scene.fog.far = day ? 40 : 14 + 10 * (1 - fog);
      sun.intensity = day ? 2.0 : 0; moon.intensity = day ? 0 : 0.35; hemi.intensity = day ? 1.1 : 0.3; hemi.color.set(day ? '#FFF4E6' : '#3A4870');
      dayFill.intensity = day ? 3.5 : 0; scene.environmentIntensity = day ? 0.3 : 0.05;
      lampL.intensity = day ? 0 : 3.0 * lamp; shadeM.emissiveIntensity = day ? 0.1 : 0.9 * Math.max(lamp, tlamp);
      tLamp.intensity = day ? 0 : 2.2 * tlamp; porchL.intensity = porch && !day ? 2.4 : 0; porchShade.material.emissiveIntensity = porch && !day ? 1.4 : 0.1;
      winM.color.set(day ? '#DDEBF7' : '#16203A');
      return H;
    },
    under(o) { strip.userData.draw(o); },
    openDoor(a) { hinge.rotation.y = -a; },
  };
  H.light({});
  return H;
}

// ── the Mimic: very tall, thin, no face. .set({ armR:[fwd°,out°], armL, tilt, turn, lean, walk, phase }) ──
export function mimic() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const m = new THREE.MeshStandardMaterial({ color: '#14151B', roughness: 0.55, metalness: 0.05 });
  const legs = [-0.12, 0.12].map((x) => { const p = new THREE.Group(); p.position.set(x, 1.35, 0); body.add(p); box(0.11, 1.35, 0.12, m, 0, -0.675, 0, p); return p; });
  box(0.42, 1.0, 0.2, m, 0, 1.85, 0, body);
  const arms = [-0.27, 0.27].map((x) => { const p = new THREE.Group(); p.position.set(x, 2.3, 0); body.add(p); box(0.08, 1.5, 0.08, m, 0, -0.75, 0, p);
    [-0.045, -0.015, 0.015, 0.045].forEach((fx, i) => box(0.018, 0.26 + (i === 1 || i === 2 ? 0.05 : 0), 0.018, m, fx, -1.63, 0, p)); return p; });
  const neck = new THREE.Group(); neck.position.set(0, 2.38, 0); body.add(neck); box(0.07, 0.16, 0.07, m, 0, 0.06, 0, neck); const head = box(0.24, 0.34, 0.24, m, 0, 0.28, 0, neck);
  const M = {
    group: g, arms, neck, head,
    at(x, y, z, ry) { g.position.set(x, y, z); if (ry != null) g.rotation.y = ry; return M; },
    set(st = {}) {
      g.visible = st.show ?? true; const sw = st.walk ? Math.sin(st.phase || 0) * 22 : 0;
      legs[0].rotation.x = sw * D; legs[1].rotation.x = -sw * D;
      const aL = st.armL || [-sw * 0.6, 4], aR = st.armR || [sw * 0.6, 4];
      arms[0].rotation.set(-aL[0] * D, 0, -(aL[1] || 0) * D); arms[1].rotation.set(-aR[0] * D, 0, (aR[1] || 0) * D);
      neck.rotation.set((st.tilt || 0) * D, (st.turn || 0) * D, (st.roll || 0) * D); body.rotation.x = (st.lean || 0) * D; return M;
    },
  };
  M.set(); return M;
}

/** a hand + forearm with curled knuckles, knuckles pointing along -z of the group. skin/sleeve colours */
export function knockHand({ skin = '#3A3B46', sleeve = null, long = true } = {}) {
  const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.55 });
  const fl = long ? 0.75 : 0.45; box(0.075, 0.075, fl, m, 0, 0, fl / 2 + 0.1, g);
  if (sleeve) box(0.12, 0.12, 0.35, mat({ color: sleeve }), 0, 0, fl + 0.1, g);
  box(0.11, 0.05, 0.12, m, 0, 0, 0.06, g);
  [-0.04, -0.013, 0.013, 0.04].forEach((x, i) => { const f = box(0.022, 0.024, long ? 0.09 : 0.05, m, x, -0.008, -0.03, g); const tip = box(0.022, long ? 0.12 : 0.05, 0.022, m, x, long ? -0.065 : -0.03, long ? -0.075 : -0.055, g); });
  return g;
}

/** a key ring with three keys */
export function keys() {
  const g = new THREE.Group(), steel = mat({ color: '#C8CCD4', metalness: 0.85, roughness: 0.3 }), brassM = mat({ color: '#C8A35A', metalness: 0.8, roughness: 0.3 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.005, 6, 20), steel); ring.rotation.x = Math.PI / 2; g.add(ring);
  [[0.4, steel], [1.3, brassM], [-0.6, steel]].forEach(([a, mm]) => { const k = new THREE.Group(); k.rotation.y = a; g.add(k); box(0.035, 0.006, 0.03, mm, 0, 0, 0.05, k); box(0.012, 0.005, 0.07, mm, 0, 0, 0.1, k); box(0.006, 0.005, 0.012, mm, 0.009, 0, 0.115, k); });
  return g;
}
