// ---------- collisions ----------
function collide(pos, r) {
  let hit = false;
  for (const b of colliders) {
    if (pos.x > b.x0 - r && pos.x < b.x1 + r && pos.z > b.z0 - r && pos.z < b.z1 + r) {
      const a1 = pos.x - (b.x0 - r), a2 = (b.x1 + r) - pos.x, c1 = pos.z - (b.z0 - r), c2 = (b.z1 + r) - pos.z;
      const m = Math.min(a1, a2, c1, c2);
      if (m === a1) pos.x = b.x0 - r; else if (m === a2) pos.x = b.x1 + r; else if (m === c1) pos.z = b.z0 - r; else pos.z = b.z1 + r;
      hit = true;
    }
  }
  const L = EXT + 6;
  if (pos.x < -L || pos.x > L || pos.z < -L || pos.z > L) { pos.x = clamp(pos.x, -L, L); pos.z = clamp(pos.z, -L, L); hit = true; }
  return hit;
}
function insideBuilding(x, y, z) {
  for (const b of colliders) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && y < b.h) return true;
  return false;
}

// ---------- people ----------
const pGeo = {
  torso: new T.BoxGeometry(0.62, 0.72, 0.34), head: new T.SphereGeometry(0.21, 10, 8),
  leg: new T.BoxGeometry(0.21, 0.8, 0.23), arm: new T.BoxGeometry(0.15, 0.68, 0.17),
};
pGeo.leg.translate(0, -0.4, 0); pGeo.arm.translate(0, -0.34, 0);
const SKINS = [0x5a3825, 0x8d5a3b, 0x3d2618, 0xc68b5e, 0x6b4430, 0xe0b48c];
const SHIRTS = [0xe8e8ee, 0x2b2b38, 0xd63a2f, 0x3466ff, 0x39e0d0, 0xff4f9a, 0x7a2cff, 0x8a6a3a];
const PANTS = [0x1d1a33, 0x2f3a5a, 0x3a2f28, 0x111118, 0x5a5a66];
const matCache = new Map();
const lam = c => { if (!matCache.has(c)) matCache.set(c, new T.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.2 })); return matCache.get(c); };
function makePerson(shirt, pants, skin) {
  const g = new T.Group(); g.rotation.order = 'YXZ';
  const torso = new T.Mesh(pGeo.torso, lam(shirt)); torso.position.y = 1.18; g.add(torso);
  const head = new T.Mesh(pGeo.head, lam(skin)); head.position.y = 1.78; g.add(head);
  const legL = new T.Mesh(pGeo.leg, lam(pants)); legL.position.set(-0.16, 0.82, 0); g.add(legL);
  const legR = new T.Mesh(pGeo.leg, lam(pants)); legR.position.set(0.16, 0.82, 0); g.add(legR);
  const armL = new T.Mesh(pGeo.arm, lam(shirt)); armL.position.set(-0.41, 1.5, 0); g.add(armL);
  const armR = new T.Mesh(pGeo.arm, lam(shirt)); armR.position.set(0.41, 1.5, 0); g.add(armR);
  scene.add(g);
  return { mesh: g, legL, legR, armL, armR, phase: 0 };
}
function animatePerson(p, t, amt) {
  const s = Math.sin(t) * 0.7 * amt;
  p.legL.rotation.x = s; p.legR.rotation.x = -s; p.armL.rotation.x = -s * 0.8; p.armR.rotation.x = s * 0.8;
}

// ---------- cars ----------
const carGeo = {
  body: new T.BoxGeometry(2, 0.7, 4.3), cabin: new T.BoxGeometry(1.75, 0.62, 2.2),
  wheel: new T.CylinderGeometry(0.4, 0.4, 0.32, 12), light: new T.BoxGeometry(0.45, 0.18, 0.06),
};
carGeo.wheel.rotateZ(Math.PI / 2);
const glassMat = new T.MeshLambertMaterial({ color: 0x1a2236, emissive: 0x0b1020 });
const tireMat = new T.MeshLambertMaterial({ color: 0x141218 });
const headMat = new T.MeshBasicMaterial({ color: 0xfff2c4 });
const tailMat = new T.MeshBasicMaterial({ color: 0xff2a3a });
const CAR_COLORS = [0x39e0d0, 0xff4f9a, 0xe8e8ee, 0x2b2b38, 0x7a2cff, 0xd63a2f, 0x3466ff, 0x8c86a8, 0x1f6b4a];
const cars = [];
function makeCar(color, x, z, h) {
  const g = new T.Group();
  const body = new T.Mesh(carGeo.body, new T.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.2 })); body.position.y = 0.72; g.add(body);
  const cab = new T.Mesh(carGeo.cabin, glassMat); cab.position.set(0, 1.38, 0.25); g.add(cab);
  const wheels = [];
  for (const [wx, wz] of [[-1, -1.4], [1, -1.4], [-1, 1.4], [1, 1.4]]) {
    const w = new T.Mesh(carGeo.wheel, tireMat); w.rotation.order = 'YXZ'; w.position.set(wx, 0.4, wz); g.add(w); wheels.push(w);
  }
  for (const sx of [-0.62, 0.62]) {
    const hl = new T.Mesh(carGeo.light, headMat); hl.position.set(sx, 0.78, -2.16); g.add(hl);
    const tl = new T.Mesh(carGeo.light, tailMat); tl.position.set(sx, 0.82, 2.16); g.add(tl);
  }
  scene.add(g);
  const car = { mesh: g, wheels, pos: new T.Vector3(x, 0, z), heading: h, speed: 0, steer: 0, ai: false, auto: false,
    path: [], dir: [0, -1], node: [0, 0], target: null, stun: 0, arrive: 0, cruise: rand(9, 14) };
  cars.push(car); return car;
}

function driveCar(car, inp, dt) {
  const MAXF = 34, MAXR = -10, ACC = 15, BRAKE = 32;
  if (inp.throttle > 0.05) car.speed += ACC * inp.throttle * dt * (car.speed < 0 ? 2.5 : 1) * (1 - Math.max(0, car.speed) / (MAXF * 1.15));
  else if (inp.throttle < -0.05) { if (car.speed > 0.5) car.speed += BRAKE * inp.throttle * dt; else car.speed += ACC * 0.6 * inp.throttle * dt; }
  else car.speed -= Math.sign(car.speed) * Math.min(Math.abs(car.speed), 4 * dt);
  if (inp.handbrake) car.speed -= Math.sign(car.speed) * Math.min(Math.abs(car.speed), 20 * dt);
  car.speed = clamp(car.speed, MAXR, MAXF);
  const steerTarget = inp.steer * (0.62 - Math.min(0.34, Math.abs(car.speed) / 110));
  car.steer += (steerTarget - car.steer) * Math.min(1, dt * 8);
  car.heading -= car.steer * car.speed * dt * 0.12 * (inp.handbrake ? 1.7 : 1);
  car.pos.x += -Math.sin(car.heading) * car.speed * dt;
  car.pos.z += -Math.cos(car.heading) * car.speed * dt;
}

// ---------- traffic AI + auto-drive ----------
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const rightOf = d => [-d[1], d[0]];
function lanePt(i, j, d, along) {
  const r = rightOf(d);
  return new T.Vector3(i * CELL + d[0] * along + r[0] * LANE, 0, j * CELL + d[1] * along + r[1] * LANE);
}
function planNext(car) {
  const [i, j] = car.node, d = car.dir;
  let opts = DIRS.filter(nd => {
    const ni = i + nd[0], nj = j + nd[1];
    return Math.abs(ni) <= N && Math.abs(nj) <= N && !(nd[0] === -d[0] && nd[1] === -d[1]);
  });
  if (!opts.length) opts = [[-d[0], -d[1]]];
  let nd;
  if (car.target) {
    const [ti, tj] = car.target; let best = 1e9;
    for (const o of opts) { const s = Math.abs(i + o[0] - ti) + Math.abs(j + o[1] - tj) + Math.random() * 0.1; if (s < best) { best = s; nd = o; } }
  } else {
    const straight = opts.find(o => o[0] === d[0] && o[1] === d[1]);
    nd = straight && Math.random() < 0.55 ? straight : pick(opts);
  }
  car.path.push({ p: lanePt(i, j, nd, 8), entry: false }, { p: lanePt(i + nd[0], j + nd[1], nd, -8), entry: true });
  car.dir = nd; car.node = [i + nd[0], j + nd[1]];
}
const obstacles = [];
function aiDrive(car, dt, cruise) {
  if (car.stun > 0) car.stun -= dt;
  if (!car.path.length) planNext(car);
  let w = car.path[0], dx = w.p.x - car.pos.x, dz = w.p.z - car.pos.z, dist = Math.hypot(dx, dz);
  if (dist < 2) {
    car.path.shift(); if (!car.path.length) planNext(car);
    w = car.path[0]; dx = w.p.x - car.pos.x; dz = w.p.z - car.pos.z; dist = Math.hypot(dx, dz);
  }
  let want = cruise;
  if (w.entry && dist < 18) want = Math.min(want, 6 + dist * 0.5);
  if (!w.entry) want = Math.min(want, 9);
  const fx = -Math.sin(car.heading), fz = -Math.cos(car.heading);
  for (const o of obstacles) {
    if (o === car) continue;
    if (o.ai) { const ofx = -Math.sin(o.heading), ofz = -Math.cos(o.heading); if (ofx * fx + ofz * fz < 0.3) continue; }
    const ox = o.pos.x - car.pos.x, oz = o.pos.z - car.pos.z, along = ox * fx + oz * fz;
    if (along > 0 && along < 12 && Math.abs(ox * fz - oz * fx) < 2.4) want = Math.min(want, Math.max(0, (along - 5.5) * 1.6));
  }
  if (car.stun > 0) want = 0;
  car.speed += clamp(want - car.speed, -24 * dt, 7 * dt);
  const th = Math.atan2(-dx, -dz);
  const before = car.heading;
  car.heading = lerpA(car.heading, th, Math.min(1, dt * (2 + Math.max(0, car.speed) * 0.25)));
  car.steer = clamp(-wrapA(car.heading - before) / Math.max(dt, 1e-3) * 0.5, -0.6, 0.6);
  car.pos.x += -Math.sin(car.heading) * car.speed * dt;
  car.pos.z += -Math.cos(car.heading) * car.speed * dt;
}
function startAuto(car, mode) {
  const p = car.pos;
  const onNS = Math.abs(p.x - Math.round(p.x / CELL) * CELL) < ROAD / 2 + 2;
  const onEW = Math.abs(p.z - Math.round(p.z / CELL) * CELL) < ROAD / 2 + 2;
  if (!onNS && !onEW) { toast('Get onto a road to use auto-drive'); return false; }
  const fx = -Math.sin(car.heading), fz = -Math.cos(car.heading);
  let d;
  if (onNS && !onEW) d = [0, fz >= 0 ? 1 : -1];
  else if (onEW && !onNS) d = [fx >= 0 ? 1 : -1, 0];
  else d = Math.abs(fx) > Math.abs(fz) ? [fx >= 0 ? 1 : -1, 0] : [0, fz >= 0 ? 1 : -1];
  const nextAlong = (v, s) => s > 0 ? Math.floor((v + 6) / CELL) + 1 : Math.ceil((v - 6) / CELL) - 1;
  let i, j;
  for (let tries = 0; tries < 2; tries++) {
    if (d[0] !== 0) { i = nextAlong(p.x, d[0]); j = clamp(Math.round(p.z / CELL), -N, N); if (Math.abs(i) > N) { d = [-d[0], 0]; continue; } }
    else { j = nextAlong(p.z, d[1]); i = clamp(Math.round(p.x / CELL), -N, N); if (Math.abs(j) > N) { d = [0, -d[1]]; continue; } }
    break;
  }
  i = clamp(i, -N, N); j = clamp(j, -N, N);
  car.dir = d; car.node = [i, j]; car.path = [{ p: lanePt(i, j, d, -8), entry: true }];
  car.target = waypoint ? waypoint.node : null;
  car.auto = mode;
  return true;
}
function toggleAuto() {
  const car = player.inCar;
  if (!car) { toast('Get in a car first'); return; }
  if (car.auto) { car.auto = false; car.path = []; toast('You have the wheel'); return; }
  if (startAuto(car, 'manual')) toast(waypoint ? `Auto-driving to ${waypoint.name}. Steer to take over.` : 'Auto-drive cruising. Steer to take over.');
}
