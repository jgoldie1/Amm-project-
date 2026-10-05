/* Kingdom District — open-world vertical slice
   Three.js r128, no build step. Controller (Gamepad API), keyboard/mouse and touch. */
'use strict';
const T = window.THREE;
if (!T) { document.body.innerHTML = '<p style="color:#fff;padding:24px;font-family:sans-serif">Three.js did not load. Make sure vendor/three.min.js is next to index.html.</p>'; return; }

// ---------- helpers ----------
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const wrapA = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const lerpA = (a, b, t) => a + wrapA(b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[(Math.random() * a.length) | 0];
const tmpV = new T.Vector3();

// ---------- city layout ----------
const CELL = 74, ROAD = 14, N = 3, LANE = 3.4, EXT = N * CELL, BLOCK = CELL - ROAD; // roads at k*CELL, k=-3..3
const IS_TOUCH = matchMedia('(pointer: coarse)').matches;
const Q = IS_TOUCH ? { peds: 22, traffic: 12, parked: 8 } : { peds: 42, traffic: 20, parked: 12 };
const settings = { invertY: false, sens: 1, sharp: !IS_TOUCH };
const SENS = [{ v: 0.6, l: 'Low' }, { v: 1, l: 'Normal' }, { v: 1.5, l: 'High' }];

// ---------- renderer ----------
const renderer = new T.WebGLRenderer({ antialias: !IS_TOUCH, powerPreference: 'high-performance' });
function applyPixelRatio() { renderer.setPixelRatio(settings.sharp ? Math.min(devicePixelRatio, 2) : Math.min(devicePixelRatio, 1.25)); }
applyPixelRatio();
renderer.setSize(innerWidth, innerHeight);
$('game').appendChild(renderer.domElement);

const SKY = 0x15122c;
const scene = new T.Scene();
scene.background = new T.Color(SKY);
scene.fog = new T.Fog(SKY, 70, 280);
const camera = new T.PerspectiveCamera(66, innerWidth / innerHeight, 0.1, 800);
scene.add(new T.HemisphereLight(0x7a74c4, 0x2a1d12, 0.85));
const moon = new T.DirectionalLight(0xc2c8ff, 0.45); moon.position.set(-90, 140, 50); scene.add(moon);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
}

// ---------- materials ----------
const windowTexs = [0, 1, 2, 3].map(() => canvasTex(64, 64, g => {
  g.fillStyle = '#1a1730'; g.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const r = Math.random();
    g.fillStyle = r < 0.36 ? (Math.random() < 0.35 ? '#ffcf7a' : '#ffeccc') : r < 0.42 ? '#7fe8ff' : '#2b2849';
    g.fillRect(x * 16 + 3, y * 16 + 4, 10, 9);
  }
}));
const TINTS = [0xffffff, 0xd8d0ff, 0xffe2d0, 0xc9e6ff];
const sideMats = [];
windowTexs.forEach(t => TINTS.forEach(c => sideMats.push(new T.MeshLambertMaterial({ color: c, map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.55 }))));
const roofMat = new T.MeshLambertMaterial({ color: 0x2a2640 });
const NEON = [0xff4f9a, 0x39e0d0, 0xf2b630, 0x9d6bff];
const neonMats = NEON.map(c => new T.MeshBasicMaterial({ color: c }));

// ---------- world ----------
const colliders = []; // {x0,x1,z0,z1,h}
function addCollider(cx, cz, w, d, h) { colliders.push({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2, h }); }

const ground = new T.Mesh(new T.PlaneGeometry(1600, 1600), new T.MeshLambertMaterial({ color: 0x26233b }));
ground.rotation.x = -Math.PI / 2; scene.add(ground);

// lane dashes
const roadLen = 2 * EXT + ROAD + 20;
const dashTex = canvasTex(8, 64, g => { g.fillStyle = '#f2b630'; g.fillRect(0, 0, 8, 30); });
dashTex.repeat.set(1, roadLen / 7);
const dashMat = new T.MeshBasicMaterial({ map: dashTex, transparent: true, alphaTest: 0.5 });
const dashGeo = new T.PlaneGeometry(0.28, roadLen);
for (let k = -N; k <= N; k++) {
  const a = new T.Mesh(dashGeo, dashMat); a.rotation.x = -Math.PI / 2; a.position.set(k * CELL, 0.02, 0); scene.add(a);
  const b = new T.Mesh(dashGeo, dashMat); b.rotation.set(-Math.PI / 2, 0, Math.PI / 2); b.position.set(0, 0.021, k * CELL); scene.add(b);
}

function buildingGeo(w, h, d) {
  const g = new T.BoxGeometry(w, h, d), uv = g.attributes.uv;
  for (let f = 0; f < 6; f++) {
    let su, sv;
    if (f < 2) { su = d / 8; sv = h / 6; } else if (f < 4) { su = 0; sv = 0; } else { su = w / 8; sv = h / 6; }
    for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * su, uv.getY(k) * sv); }
  }
  return g;
}

const walkMat = new T.MeshLambertMaterial({ color: 0x423c5e });
const walkGeo = new T.BoxGeometry(BLOCK, 0.2, BLOCK);
const parkMat = new T.MeshLambertMaterial({ color: 0x1f4a3a });
const plazaMat = new T.MeshLambertMaterial({ color: 0x5a4a2a });
const trunkGeo = new T.CylinderGeometry(0.22, 0.3, 2.2, 6); trunkGeo.translate(0, 1.1, 0);
const crownGeo = new T.ConeGeometry(1.8, 4, 7); crownGeo.translate(0, 4, 0);
const trunkMat = new T.MeshLambertMaterial({ color: 0x4a3020 });
const leafMat = new T.MeshLambertMaterial({ color: 0x2f7a52 });
function tree(x, z) {
  const t = new T.Mesh(trunkGeo, trunkMat); t.position.set(x, 0.2, z); scene.add(t);
  const c = new T.Mesh(crownGeo, leafMat); c.position.set(x, 0.2, z); scene.add(c);
  addCollider(x, z, 0.8, 0.8, 6);
}

const PLAZA = { i: 0, j: 0 };
for (let i = -N; i < N; i++) for (let j = -N; j < N; j++) {
  const cx = (i + 0.5) * CELL, cz = (j + 0.5) * CELL;
  const walk = new T.Mesh(walkGeo, walkMat); walk.position.set(cx, 0.1, cz); scene.add(walk);
  if (i === PLAZA.i && j === PLAZA.j) {
    const pz = new T.Mesh(new T.BoxGeometry(BLOCK - 10, 0.1, BLOCK - 10), plazaMat); pz.position.set(cx, 0.22, cz); scene.add(pz);
    const ob = new T.Mesh(new T.BoxGeometry(3, 26, 3), new T.MeshLambertMaterial({ color: 0xf2b630, emissive: 0x6a4a08 }));
    ob.position.set(cx, 13, cz); scene.add(ob); addCollider(cx, cz, 3.4, 3.4, 26);
    const cap = new T.Mesh(new T.ConeGeometry(2.3, 4, 4), new T.MeshBasicMaterial({ color: 0xffd96a })); cap.position.set(cx, 28, cz); cap.rotation.y = Math.PI / 4; scene.add(cap);
    const ringM = new T.Mesh(new T.TorusGeometry(9, 0.5, 6, 32), new T.MeshLambertMaterial({ color: 0x8c86a8 })); ringM.rotation.x = -Math.PI / 2; ringM.position.set(cx, 0.6, cz); scene.add(ringM);
    for (const [ox, oz] of [[-18, -18], [18, -18], [-18, 18], [18, 18]]) tree(cx + ox, cz + oz);
    continue;
  }
  const centerBias = 1 - Math.hypot(cx, cz) / (EXT * 1.2);
  for (const ox of [-13, 13]) for (const oz of [-13, 13]) {
    const lx = cx + ox, lz = cz + oz;
    if (Math.random() < 0.13) {
      const p = new T.Mesh(new T.BoxGeometry(22, 0.1, 22), parkMat); p.position.set(lx, 0.22, lz); scene.add(p);
      tree(lx - 5, lz - 4); tree(lx + 5, lz + 5); if (Math.random() < 0.5) tree(lx + 4, lz - 6);
      continue;
    }
    const w = rand(14, 22), d = rand(14, 22);
    const h = rand(8, 24) + Math.max(0, centerBias) * rand(8, 58);
    const sm = pick(sideMats);
    const b = new T.Mesh(buildingGeo(w, h, d), [sm, sm, roofMat, roofMat, sm, sm]);
    b.position.set(lx, h / 2, lz); scene.add(b);
    addCollider(lx, lz, w, d, h);
    if (Math.random() < 0.35) {
      const ny = rand(4, Math.min(h - 2, 16));
      const sign = new T.Mesh(new T.BoxGeometry(w * 0.7, 0.55, 0.14), pick(neonMats));
      const face = pick([0, 1, 2, 3]);
      if (face === 0) sign.position.set(lx, ny, lz + d / 2 + 0.08);
      else if (face === 1) sign.position.set(lx, ny, lz - d / 2 - 0.08);
      else { sign.geometry = new T.BoxGeometry(0.14, 0.55, d * 0.7); sign.position.set(lx + (face === 2 ? 1 : -1) * (w / 2 + 0.08), ny, lz); }
      scene.add(sign);
    }
  }
}

// street lights
const poleGeo = new T.CylinderGeometry(0.12, 0.16, 7, 6); poleGeo.translate(0, 3.5, 0);
const poleMat = new T.MeshLambertMaterial({ color: 0x3a3556 });
const lampGeo = new T.BoxGeometry(0.7, 0.22, 1.0);
const lampMat = new T.MeshBasicMaterial({ color: 0xffb36a });
const glowGeo = new T.CircleGeometry(6, 20);
const glowMat = new T.MeshBasicMaterial({ color: 0xff9a4a, transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false });
for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
  const sx = pick([-1, 1]), sz = pick([-1, 1]);
  const x = i * CELL + sx * 8.6, z = j * CELL + sz * 8.6;
  const p = new T.Mesh(poleGeo, poleMat); p.position.set(x, 0, z); scene.add(p);
  const l = new T.Mesh(lampGeo, lampMat); l.position.set(x - sx * 0.8, 7, z - sz * 0.8); scene.add(l);
  const g = new T.Mesh(glowGeo, glowMat); g.rotation.x = -Math.PI / 2; g.position.set(x - sx * 3, 0.04, z - sz * 3); scene.add(g);
}

// distant skyline + stars (ignore fog so they read as silhouettes)
const skyMat = new T.MeshBasicMaterial({ color: 0x6a64a0, map: windowTexs[0], fog: false });
for (let k = 0; k < 64; k++) {
  const a = (k / 64) * Math.PI * 2 + rand(-0.03, 0.03), r = rand(360, 430);
  const w = rand(18, 40), h = rand(30, 130);
  const m = new T.Mesh(buildingGeo(w, h, w), skyMat); m.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); scene.add(m);
}
{
  const pos = [];
  for (let k = 0; k < 400; k++) {
    const a = Math.random() * Math.PI * 2, e = rand(0.15, 1.3), r = 650;
    pos.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  scene.add(new T.Points(g, new T.PointsMaterial({ color: 0xd8d4ff, size: 1.6, fog: false, sizeAttenuation: false })));
}

const LANDMARKS = [
  { name: 'Crown Plaza', node: [0, 0] },
  { name: 'Eastgate', node: [3, -2] },
  { name: 'Neon Row', node: [-2, -3] },
  { name: 'Southside Courts', node: [-3, 3] },
  { name: 'Kingdom Arena', node: [2, 3] },
];
function zoneName(x, z) { return x >= 0 ? (z >= 0 ? 'Crown Heights' : 'Eastgate') : (z >= 0 ? 'Southside' : 'Neon Row'); }
