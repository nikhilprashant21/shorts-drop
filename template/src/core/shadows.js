// Kit for "In This Town, Count Your Shadows": a snowy night street with six lamps (spot lights that cast real
// shadows), Mia's house, Mr. Pell's house with shut curtains, a bedroom with a floor lamp, and "ghost" people:
// invisible bodies that still cast a shadow (the Tagalong).
import * as THREE from 'three';
import { mat } from './world.js';
import { box, cyl, pine, house, streetLamp, room, rnd, snowfall } from './blocky.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const LAMPS = [0, 9, 18, 27, 36, 45], WALKZ = 4.2, LAMPZ = 3.2;

/** make a person (from B.person) invisible but still casting a shadow */
export function ghostify(p) {
  p.group.traverse((o) => { if (o.isMesh) { const ms = Array.isArray(o.material) ? o.material : [o.material]; const c = ms.map((m) => { const n = m.clone(); n.colorWrite = false; n.depthWrite = false; return n; }); o.material = Array.isArray(o.material) ? c : c[0]; o.castShadow = true; o.receiveShadow = false; } });
  return p;
}
/** stop a person from casting a shadow (their shadow has been taken) */
export function noShadow(p, off = true) { p.group.traverse((o) => { if (o.isMesh) o.castShadow = !off; }); }

export function streetSet(E) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05070F'); scene.fog = new THREE.Fog('#0A0F1E', 10, 46);
  scene.environment = E.envMap; scene.environmentIntensity = 0.04;
  const snowM = mat({ color: '#D6DDE8', roughness: 0.95 }), roadM = mat({ color: '#3A3E48', roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 60), snowM); ground.rotation.x = -Math.PI / 2; ground.position.set(22, 0, 0); ground.receiveShadow = true; scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(140, 5.6), roadM); road.rotation.x = -Math.PI / 2; road.position.set(22, 0.005, -0.2); road.receiveShadow = true; scene.add(road);
  for (let x = -40; x < 90; x += 4) box(1.8, 0.01, 0.14, mat({ color: '#C8B060', roughness: 0.8 }), x, 0.008, -0.2, scene);
  box(140, 0.12, 0.25, mat({ color: '#8A8E98' }), 22, 0.06, 2.65, scene);
  // houses: north side (z = 9, facing the street) and south side
  const houses = [];
  const cols = ['#8E7A9A', '#7A8E9A', '#9A8A6E', '#6E8A7A', '#9A6E6E', '#7A7A9A', '#8A9A7A'];
  for (let i = 0; i < 9; i++) { const h = house({ w: 3.4, d: 3.0, h: 2.0, wall: cols[i % cols.length], roof: '#3E3440', seed: i, sillJar: false }); h.scale.setScalar(1.7); h.position.set(-6 + i * 7.2, 0, 9.5); h.rotation.y = Math.PI; scene.add(h); houses.push(h); h.userData.winGlow.emissiveIntensity = rnd(i * 3) > 0.4 ? 0.9 : 0; }
  for (let i = 0; i < 9; i++) { const h = house({ w: 3.4, d: 3.0, h: 2.0, wall: cols[(i + 3) % cols.length], roof: '#3E3440', seed: i + 20, sillJar: false }); h.scale.setScalar(1.7); h.position.set(-2.5 + i * 7.2, 0, -9.5); scene.add(h); houses.push(h); h.userData.winGlow.emissiveIntensity = rnd(i * 5 + 1) > 0.5 ? 0.8 : 0; }
  for (let k = 0; k < 24; k++) { const p = pine(1.3 + rnd(k) * 0.8); p.position.set(-10 + rnd(k * 7) * 70, 0, (k % 2 ? 1 : -1) * (13 + rnd(k * 3) * 6)); scene.add(p); }
  // Mia's house: the one at x ≈ 47.4 on the north side (door faces -z)
  const home = houses.find((h) => Math.abs(h.position.x - 44.4) < 1) || houses[7];
  // Mr. Pell's house: south side, curtains shut (dim red glow)
  const pell = houses.find((h) => h.position.z < 0 && Math.abs(h.position.x - 26.3) < 1) || houses[13];
  const pg = pell.userData.winGlow; pg.emissiveIntensity = 0.5; if (pg.emissive) pg.emissive.set('#A03A2A'); if (pg.color) pg.color.set('#5A1E18');
  // lamps: SpotLights from each head, pointing down onto the sidewalk
  const lamps = LAMPS.map((x) => {
    const g = streetLamp(); g.position.set(x, 0, LAMPZ); scene.add(g);
    const sp = new THREE.SpotLight('#FFD090', 0, 14, 0.95, 0.55, 1.4); sp.position.set(x, 3.15, LAMPZ + 0.66); sp.target.position.set(x, 0, LAMPZ + 0.9);
    sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0015; sp.shadow.camera.near = 0.3; scene.add(sp, sp.target);
    g.userData.spot = sp; return g;
  });
  const moon = new THREE.DirectionalLight('#6F88C8', 0.12); moon.position.set(-10, 20, -12); scene.add(moon);
  const hemi = new THREE.HemisphereLight('#2A3456', '#05050A', 0.18); scene.add(hemi);
  const snow = snowfall(1500, [40, 9, 14], [0, 0, 3], 0.05); scene.add(snow);
  const S = {
    scene, lamps, houses, home, pell, snow, moon, hemi,
    /** on: per-lamp brightness (array or number); shadowAt: index (or list) of lamps whose light casts shadows this shot */
    set({ on = 1, shadowAt = [], dark = 0, broken = 4 } = {}) {
      const sh = Array.isArray(shadowAt) ? shadowAt : [shadowAt];
      lamps.forEach((g, i) => { const k = i === broken ? 0 : Array.isArray(on) ? on[i] : on; g.set(0.45 * k); g.userData.spot.intensity = 9 * k; g.userData.spot.castShadow = sh.includes(i) && k > 0; });
      moon.intensity = 0.12 * (1 - dark); hemi.intensity = 0.18 * (1 - dark);
      return S;
    },
  };
  S.set({});
  return S;
}

/** the bedroom: Mia's room with a floor lamp whose light throws her shadow big on the back wall */
export function bedroom(E) {
  const R = room(E, { wall: '#6A5E7E', floor: '#6E4A30', w: 6, d: 6, night: true, windowX: -2.1 });
  R.key.intensity = 0; R.key.castShadow = false; R.moon.intensity = 0.15;
  const pm = mat({ color: '#2E2A26' });
  const lamp = new THREE.Group(); lamp.position.set(1.05, 0, -2.15); R.scene.add(lamp);
  cyl(0.18, 0.2, 0.05, pm, 0, 0.025, 0, lamp, 16); cyl(0.02, 0.02, 1.0, pm, 0, 0.53, 0, lamp, 8);
  const shadeM = new THREE.MeshStandardMaterial({ color: '#F4D9A8', emissive: '#FFB860', emissiveIntensity: 1.0, side: THREE.DoubleSide });
  const shade = cyl(0.14, 0.22, 0.26, shadeM, 0, 1.12, 0, lamp, 18); shade.castShadow = false;
  const chain = cyl(0.004, 0.004, 0.22, mat({ color: '#C8A35A', metalness: 0.7 }), -0.1, 0.9, 0.05, lamp, 4);
  const sp = new THREE.SpotLight('#FFC27A', 8, 12, 0.9, 0.5, 1.2); sp.position.set(0.95, 1.1, -2.25); sp.target.position.set(-0.1, 1.4, -6); sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0015; sp.shadow.camera.near = 0.2; R.scene.add(sp, sp.target);
  const fill = new THREE.PointLight('#FFB868', 0.35, 4, 1.6); fill.position.set(1.2, 1.2, -1.8); R.scene.add(fill);
  const bed = (() => { const g = new THREE.Group(); box(1.1, 0.4, 2.0, mat({ color: '#5A4232' }), 0, 0.2, 0, g); box(1.0, 0.18, 1.9, mat({ color: '#7A9ACB' }), 0, 0.48, 0.02, g); box(0.7, 0.12, 0.35, mat({ color: '#F0EEE6' }), 0, 0.62, -0.72, g); box(1.1, 0.9, 0.08, mat({ color: '#5A4232' }), 0, 0.45, -1.0, g); return g; })();
  bed.position.set(-1.9, 0, -4.4); R.scene.add(bed);
  const violin = box(0.25, 0.1, 0.75, mat({ color: '#2A2A34' }), 1.9, 0.05, -4.8, R.scene); violin.rotation.y = 0.4;
  return { ...R, lamp, chain, spot: sp, fill, shadeM, set(k) { sp.intensity = 8 * k; fill.intensity = 0.35 * k; shadeM.emissiveIntensity = 0.8 * k; R.moon.intensity = 0.15; } };
}
