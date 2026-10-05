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
const matCache = new Map();
const lam = c => { if (!matCache.has(c)) matCache.set(c, new T.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.12 })); return matCache.get(c); };
const SKINS = [0x5a3825,0x8d5a3b,0x3d2618,0xc68b5e,0x6b4430,0xe0b48c];
const SHIRTS = [0xe8e8ee,0x2b2b38,0xd63a2f,0x3466ff,0x39e0d0,0xff4f9a,0x7a2cff,0x8a6a3a];
const PANTS = [0x1d1a33,0x2f3a5a,0x3a2f28,0x111118,0x5a5a66];
const HAIR = [0x16100e,0x2b1a12,0x362318,0x090909,0x5a3924];

function cyl(r1,r2,h,segments=10){
  const g=new T.CylinderGeometry(r1,r2,h,segments);
  g.translate(0,-h/2,0);
  return g;
}
const HUMAN_GEO={
  head:new T.SphereGeometry(.205,14,12),
  neck:new T.CylinderGeometry(.09,.105,.16,10),
  chest:new T.SphereGeometry(.34,12,10),
  pelvis:new T.SphereGeometry(.265,12,10),
  upperArm:cyl(.095,.082,.43,10),
  foreArm:cyl(.082,.068,.40,10),
  thigh:cyl(.115,.095,.48,10),
  shin:cyl(.09,.072,.48,10),
  hand:new T.SphereGeometry(.075,10,8),
  shoe:new T.SphereGeometry(.105,10,8),
  nose:new T.ConeGeometry(.04,.11,8),
  eye:new T.SphereGeometry(.026,8,6),
  pupil:new T.SphereGeometry(.011,8,6),
};
HUMAN_GEO.nose.rotateX(Math.PI/2);

function makeHumanLimb(upperGeo,lowerGeo,skinOrCloth,skin){
  const root=new T.Group();
  const upper=new T.Mesh(upperGeo,lam(skinOrCloth));root.add(upper);
  const elbow=new T.Group();elbow.position.y=-.43;root.add(elbow);
  const lower=new T.Mesh(lowerGeo,lam(skin));elbow.add(lower);
  return {root,upper,elbow,lower};
}
function makePerson(shirt,pants,skin){
  const g=new T.Group();g.rotation.order='YXZ';

  const torso=new T.Group();torso.position.y=1.40;g.add(torso);
  const chest=new T.Mesh(HUMAN_GEO.chest,lam(shirt));chest.scale.set(1.0,1.18,.72);torso.add(chest);
  const pelvis=new T.Mesh(HUMAN_GEO.pelvis,lam(pants));pelvis.position.y=-.42;pelvis.scale.set(.92,.70,.78);torso.add(pelvis);

  const neck=new T.Mesh(HUMAN_GEO.neck,lam(skin));neck.position.y=.34;torso.add(neck);
  const headPivot=new T.Group();headPivot.position.y=.53;torso.add(headPivot);
  const head=new T.Mesh(HUMAN_GEO.head,lam(skin));head.scale.set(.90,1.08,.88);headPivot.add(head);

  const hairColor=pick(HAIR);
  const hair=new T.Mesh(new T.SphereGeometry(.212,14,10,0,Math.PI*2,0,Math.PI*.55),lam(hairColor));
  hair.position.y=.055;hair.scale.set(.93,1.0,.91);headPivot.add(hair);

  const eyeWhite=lam(0xf4efe8), pupilMat=lam(0x24170f);
  for(const sx of [-1,1]){
    const e=new T.Mesh(HUMAN_GEO.eye,eyeWhite);e.position.set(.07*sx,.035,-.184);headPivot.add(e);
    const p=new T.Mesh(HUMAN_GEO.pupil,pupilMat);p.position.set(.07*sx,.035,-.207);headPivot.add(p);
  }
  const nose=new T.Mesh(HUMAN_GEO.nose,lam(skin));nose.position.set(0,-.02,-.205);headPivot.add(nose);

  const leftArm=makeHumanLimb(HUMAN_GEO.upperArm,HUMAN_GEO.foreArm,shirt,skin);
  const rightArm=makeHumanLimb(HUMAN_GEO.upperArm,HUMAN_GEO.foreArm,shirt,skin);
  leftArm.root.position.set(-.36,.16,0);rightArm.root.position.set(.36,.16,0);torso.add(leftArm.root,rightArm.root);
  const handL=new T.Mesh(HUMAN_GEO.hand,lam(skin));handL.position.y=-.40;leftArm.elbow.add(handL);
  const handR=new T.Mesh(HUMAN_GEO.hand,lam(skin));handR.position.y=-.40;rightArm.elbow.add(handR);

  const legL=new T.Group(),legR=new T.Group();legL.position.set(-.14,.98,0);legR.position.set(.14,.98,0);g.add(legL,legR);
  const thighL=new T.Mesh(HUMAN_GEO.thigh,lam(pants)),thighR=new T.Mesh(HUMAN_GEO.thigh,lam(pants));legL.add(thighL);legR.add(thighR);
  const kneeL=new T.Group(),kneeR=new T.Group();kneeL.position.y=-.48;kneeR.position.y=-.48;legL.add(kneeL);legR.add(kneeR);
  const shinL=new T.Mesh(HUMAN_GEO.shin,lam(pants)),shinR=new T.Mesh(HUMAN_GEO.shin,lam(pants));kneeL.add(shinL);kneeR.add(shinR);
  const shoeMat=lam(0x121218);
  const shoeL=new T.Mesh(HUMAN_GEO.shoe,shoeMat),shoeR=new T.Mesh(HUMAN_GEO.shoe,shoeMat);
  shoeL.scale.set(1.0,.55,1.6);shoeR.scale.set(1.0,.55,1.6);shoeL.position.set(0,-.49,-.035);shoeR.position.set(0,-.49,-.035);kneeL.add(shoeL);kneeR.add(shoeR);

  const scale=rand(.94,1.07);g.scale.setScalar(scale);
  scene.add(g);
  return {
    mesh:g,torso,chest,pelvis,headPivot,head,hair,
    legL,legR,kneeL,kneeR,
    armL:leftArm.root,armR:rightArm.root,
    elbowL:leftArm.elbow,elbowR:rightArm.elbow,
    phase:rand(0,Math.PI*2),
    humanFallback:true,
    externalModel:null,
    mixer:null
  };
}
function animatePerson(p,t,amt){
  const s=Math.sin(t)*.48*amt;
  p.legL.rotation.x=s;p.legR.rotation.x=-s;
  p.kneeL.rotation.x=Math.max(0,-s)*.45;p.kneeR.rotation.x=Math.max(0,s)*.45;
  p.armL.rotation.x=-s*.8;p.armR.rotation.x=s*.8;
  p.elbowL.rotation.x=-.10-Math.max(0,s)*.15;p.elbowR.rotation.x=-.10-Math.max(0,-s)*.15;
  p.torso.rotation.z=Math.sin(t*.5)*.025*amt;
  p.headPivot.rotation.y=Math.sin(t*.27)*.035;
}

function makeBJStubbsFallback(){
  const p=makePerson(0x111111,0x171717,0x70462f);
  p.mesh.scale.setScalar(1.01);
  p.chest.scale.set(.94,1.16,.68);
  p.head.scale.set(.93,1.07,.90);
  p.hair.material=lam(0x17110f);
  p.hair.scale.set(.95,.78,.93);
  // pulled-back loc silhouette
  const locMat=lam(0x17110f);
  for(let i=0;i<10;i++){
    const a=(i/9-.5)*1.15;
    const loc=new T.Mesh(new T.CylinderGeometry(.025,.035,.68,7),locMat);
    loc.position.set(Math.sin(a)*.18,-.16,.13+Math.cos(a)*.06);
    loc.rotation.z=Math.sin(a)*.18;
    p.headPivot.add(loc);
  }
  // salt-and-pepper beard
  const beard=new T.Mesh(new T.SphereGeometry(.17,12,9,0,Math.PI*2,Math.PI*.38,Math.PI*.55),lam(0x625c59));
  beard.position.set(0,-.105,-.105);beard.scale.set(.88,.72,.52);p.headPivot.add(beard);
  const beardDark=new T.Mesh(new T.SphereGeometry(.176,12,9,0,Math.PI*2,Math.PI*.42,Math.PI*.48),lam(0x2c2725));
  beardDark.position.set(0,-.08,-.11);beardDark.scale.set(.90,.65,.5);p.headPivot.add(beardDark);
  // gold pendant / chain marker
  const chain=new T.Mesh(new T.TorusGeometry(.12,.012,6,18),lam(0xd5aa36));
  chain.rotation.x=Math.PI/2;chain.position.set(0,.01,-.31);p.torso.add(chain);
  const pendant=new T.Mesh(new T.SphereGeometry(.035,10,8),lam(0xd5aa36));
  pendant.position.set(0,-.11,-.33);p.torso.add(pendant);
  p.characterId='bj-stubbs';
  p.displayName='BJ Stubbs';
  p.visualIdentity='bj-v6-fallback';
  return p;
}
function attachBJProductionHuman(person){
  if(!T.GLTFLoader)return;
  const url=`${KINGDOM_HUMAN_ASSET_BASE}/SV_BJ_STUBBS_V6.glb`;
  const attach=gltf=>{
    if(!gltf?.scene)return;
    const clone=gltf.scene.clone(true);
    const box=new T.Box3().setFromObject(clone),size=new T.Vector3();box.getSize(size);
    const scale=size.y>0?1.82/size.y:1;
    clone.scale.setScalar(scale);clone.position.y=0;
    person.mesh.add(clone);
    person.torso.visible=false;person.legL.visible=false;person.legR.visible=false;
    person.externalModel=clone;person.humanFallback=false;person.visualIdentity='bj-v6-production';
  };
  if(humanAssetCache.has(url)){attach(humanAssetCache.get(url));return;}
  const loader=new T.GLTFLoader();
  loader.load(url,gltf=>{humanAssetCache.set(url,gltf);attach(gltf)},undefined,()=>{});
}

// Production human-mesh slots. Kingdom attempts these when GLTFLoader and files exist.
// Until then, the articulated rounded fallback above remains visible instead of block people.
const KINGDOM_HUMAN_ASSET_BASE='/tryamm-assets/meshy/characters';
const KINGDOM_HUMAN_ASSETS=[
 'SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',
 'SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb',
 'SV_NPC_BLACK_MAN_ADULT_01.glb',
 'SV_NPC_BLACK_WOMAN_ADULT_01.glb',
 'SV_NPC_BLACK_MAN_SENIOR_01.glb',
 'SV_NPC_BLACK_WOMAN_SENIOR_01.glb',
 'SV_NPC_WHITE_MAN_YOUNGADULT_01.glb',
 'SV_NPC_WHITE_WOMAN_YOUNGADULT_01.glb',
 'SV_NPC_LATINO_MAN_ADULT_01.glb',
 'SV_NPC_LATINA_WOMAN_ADULT_01.glb',
 'SV_NPC_EAST_ASIAN_YOUNGADULT_01.glb',
 'SV_NPC_SOUTH_ASIAN_ADULT_01.glb',
 'SV_NPC_MENA_ADULT_01.glb',
 'SV_NPC_MULTIRACIAL_YOUNGADULT_01.glb'
];
const humanAssetCache=new Map();
function attachProductionHuman(person,index){
  if(!T.GLTFLoader)return;
  const file=KINGDOM_HUMAN_ASSETS[index%KINGDOM_HUMAN_ASSETS.length];
  const url=`${KINGDOM_HUMAN_ASSET_BASE}/${file}`;
  const attach=gltf=>{
    if(!gltf?.scene)return;
    const clone=gltf.scene.clone(true);
    const box=new T.Box3().setFromObject(clone),size=new T.Vector3();box.getSize(size);
    const target=1.75,scale=size.y>0?target/size.y:1;
    clone.scale.setScalar(scale);
    clone.position.y=0;
    person.mesh.add(clone);
    person.torso.visible=false;person.legL.visible=false;person.legR.visible=false;
    person.externalModel=clone;person.humanFallback=false;
  };
  if(humanAssetCache.has(url)){attach(humanAssetCache.get(url));return;}
  const loader=new T.GLTFLoader();
  loader.load(url,gltf=>{humanAssetCache.set(url,gltf);attach(gltf)},undefined,()=>{});
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
