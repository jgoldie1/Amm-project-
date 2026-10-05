// ---------- player ----------
function nearestCar(r) {
  let best = null, bd = r;
  for (const c of cars) { const d = Math.hypot(c.pos.x - player.pos.x, c.pos.z - player.pos.z); if (d < bd) { bd = d; best = c; } }
  return best;
}
function toggleCar() {
  if (player.inCar) {
    const car = player.inCar;
    if (Math.abs(car.speed) > 9) { toast('Slow down to get out'); return; }
    car.auto = false; car.path = [];
    const h = car.heading;
    player.pos.set(car.pos.x - Math.cos(h) * 2.5, 0, car.pos.z + Math.sin(h) * 2.5);
    collide(player.pos, 0.45);
    player.inCar = null; player.mesh.visible = true; player.facing = h;
    headLight.intensity = 0;
  } else {
    const c = nearestCar(4.6); if (!c) return;
    if (c.ai) { c.ai = false; c.path = []; toast('You took the car'); }
    player.inCar = c; c.auto = false; c.path = [];
    player.mesh.visible = false; attachLight(c); initAudio();
  }
}
function pushFromCars(pos, r) {
  for (const c of cars) {
    const dx = pos.x - c.pos.x, dz = pos.z - c.pos.z, h = c.heading;
    const a = dx * Math.cos(h) - dz * Math.sin(h), b = -dx * Math.sin(h) - dz * Math.cos(h);
    const ha = 1.0 + r, hb = 2.15 + r;
    if (Math.abs(a) < ha && Math.abs(b) < hb) {
      let na = a, nb = b;
      if (ha - Math.abs(a) < hb - Math.abs(b)) na = Math.sign(a || 1) * ha; else nb = Math.sign(b || 1) * hb;
      pos.x = c.pos.x + na * Math.cos(h) - nb * Math.sin(h);
      pos.z = c.pos.z - na * Math.sin(h) - nb * Math.cos(h);
    }
  }
}
function updateOnFoot(dt, inp) {
  let mx = inp.mx, my = inp.my;
  if (phone.open) { mx = 0; my = 0; }
  const amt = Math.min(1, Math.hypot(mx, my)), sp = (inp.run ? 8 : 4.2) * amt;
  const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
  let vx = rx * mx + fx * my, vz = rz * mx + fz * my; const l = Math.hypot(vx, vz);
  if (l > 0.01) {
    vx /= l; vz /= l;
    player.pos.x += vx * sp * dt; player.pos.z += vz * sp * dt;
    player.facing = lerpA(player.facing, Math.atan2(-vx, -vz), Math.min(1, dt * 12));
  }
  collide(player.pos, 0.45); pushFromCars(player.pos, 0.45);
  player.phase += sp * dt * 2.2;
  animatePerson(player, player.phase, l > 0.01 ? Math.min(1, sp / 5) : 0);
  player.mesh.position.copy(player.pos); player.mesh.rotation.y = player.facing;
}
let shake = 0;
function updatePlayerCar(dt, inp) {
  const car = player.inCar;
  if (car.auto === 'manual' && !phone.open && (Math.abs(inp.steer) > 0.35 || inp.throttle > 0.35 || inp.brake > 0.35)) {
    car.auto = false; car.path = []; toast('You have the wheel');
  }
  if (car.auto) aiDrive(car, dt, 15);
  else {
    const off = phone.open;
    driveCar(car, { throttle: off ? 0 : inp.throttle - inp.brake, steer: off ? 0 : inp.steer, handbrake: (!off && inp.handbrake) || car.arrive > 0 }, dt);
  }
  if (car.arrive > 0) car.arrive -= dt;
  if (collide(car.pos, 1.7)) {
    const imp = Math.abs(car.speed);
    if (imp > 6) { shake = Math.min(1, imp / 25); thud(); }
    car.speed *= -0.25;
    if (car.auto) { car.auto = false; car.path = []; toast('Auto-drive stopped'); }
  }
  for (const o of cars) {
    if (o === car) continue;
    const dx = o.pos.x - car.pos.x, dz = o.pos.z - car.pos.z, d = Math.hypot(dx, dz);
    if (d < 3.4 && d > 0.01) {
      const push = (3.4 - d) / 2, nx = dx / d, nz = dz / d;
      o.pos.x += nx * push; o.pos.z += nz * push; car.pos.x -= nx * push; car.pos.z -= nz * push;
      const imp = Math.abs(car.speed);
      if (imp > 4) { shake = Math.min(1, imp / 30); thud(); }
      car.speed *= 0.6; o.stun = 1.5;
      if (!o.ai) o.speed += car.speed * 0.3;
    }
  }
  player.pos.copy(car.pos);
}
function coast(c, dt) {
  if (Math.abs(c.speed) < 0.01) return;
  c.speed -= Math.sign(c.speed) * Math.min(Math.abs(c.speed), 8 * dt);
  c.pos.x += -Math.sin(c.heading) * c.speed * dt; c.pos.z += -Math.cos(c.heading) * c.speed * dt;
  if (collide(c.pos, 1.7)) c.speed = 0;
}
function syncCar(c, dt) {
  c.mesh.position.set(c.pos.x, 0, c.pos.z); c.mesh.rotation.y = c.heading;
  for (let k = 0; k < 4; k++) { const w = c.wheels[k]; w.rotation.x -= c.speed * dt / 0.4; if (k < 2) w.rotation.y = -c.steer * 0.9; }
}

function knock(p, car) {
  p.state = 'down'; p.timer = 4;
  p.pos.x += -Math.sin(car.heading) * 3; p.pos.z += -Math.cos(car.heading) * 3;
  p.mesh.position.set(p.pos.x, 0.2, p.pos.z); p.mesh.rotation.set(-Math.PI / 2, p.heading, 0);
  car.speed *= 0.8; thud();
}
function updatePeds(dt) {
  const car = player.inCar;
  for (const p of peds) {
    if (p.state === 'down') {
      p.timer -= dt;
      if (p.timer <= 0) { p.state = 'walk'; p.mesh.rotation.set(0, p.heading, 0); p.mesh.position.y = 0; }
      continue;
    }
    let sp = p.spd;
    if (car && Math.abs(car.speed) > 4) {
      const d = Math.hypot(car.pos.x - p.pos.x, car.pos.z - p.pos.z);
      if (d < 2.1 && Math.abs(car.speed) > 6) { knock(p, car); continue; }
      if (d < 10) { p.state = 'flee'; p.timer = 2.5; }
    }
    if (p.state === 'flee') { p.timer -= dt; sp *= 3.2; if (p.timer <= 0) p.state = 'walk'; }
    p.u += p.dir * sp * dt / (2 * S);
    perim(p.u, tmpV);
    const nx = tmpV.x + p.cx, nz = tmpV.z + p.cz, mvx = nx - p.pos.x, mvz = nz - p.pos.z;
    if (mvx * mvx + mvz * mvz > 1e-6) p.heading = Math.atan2(-mvx, -mvz);
    p.pos.set(nx, 0, nz);
    p.phase += sp * dt * 2.4; animatePerson(p, p.phase, Math.min(1, sp / 2));
    if (p.state === 'flee') { p.armL.rotation.x = -2.6; p.armR.rotation.x = -2.6; }
    p.mesh.position.copy(p.pos); p.mesh.rotation.y = p.heading;
  }
}

// ---------- camera ----------
let camYaw = 0, camPitch = 0.28, lookIdle = 0;
const camTarget = new T.Vector3();
function updateCamera(dt) {
  let lx = lookDX * settings.sens, ly = lookDY * settings.sens; lookDX = lookDY = 0;
  if (!radial.open && !phone.open) { lx += pad.axes[2] * 2.6 * dt * settings.sens; ly += pad.axes[3] * 1.8 * dt * settings.sens; }
  else { lx = 0; ly = 0; }
  camYaw -= lx; camPitch = clamp(camPitch + ly * (settings.invertY ? -1 : 1), -0.12, 1.15);
  const looking = Math.abs(lx) + Math.abs(ly) > 1e-4;
  lookIdle = looking ? 0 : lookIdle + dt;
  const car = player.inCar;
  let dist = 6.2, ty = 1.7;
  if (car) {
    if (lookIdle > 1.2) {
      const behind = car.speed < -2 ? car.heading + Math.PI : car.heading;
      camYaw = lerpA(camYaw, behind, Math.min(1, dt * 3)); camPitch += (0.22 - camPitch) * Math.min(1, dt * 2);
    }
    dist = 9.5 + Math.abs(car.speed) * 0.06; ty = 1.9;
  }
  camTarget.set(player.pos.x, ty, player.pos.z);
  const dx = Math.sin(camYaw) * Math.cos(camPitch), dy = Math.sin(camPitch), dz = Math.cos(camYaw) * Math.cos(camPitch);
  for (let s = 1; s <= dist; s += 0.5) {
    if (insideBuilding(camTarget.x + dx * s, camTarget.y + dy * s, camTarget.z + dz * s)) { dist = Math.max(1.6, s - 0.6); break; }
  }
  camera.position.set(camTarget.x + dx * dist, Math.max(0.5, camTarget.y + dy * dist), camTarget.z + dz * dist);
  if (shake > 0) { camera.position.x += (Math.random() - 0.5) * shake * 0.6; camera.position.y += (Math.random() - 0.5) * shake * 0.4; shake = Math.max(0, shake - dt * 2.5); }
  camera.lookAt(camTarget);
  const fov = 66 + (car ? Math.min(12, Math.abs(car.speed) * 0.35) : 0);
  if (Math.abs(camera.fov - fov) > 0.1) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 4); camera.updateProjectionMatrix(); }
}
function titleCam(now) {
  const a = now * 0.00006;
  camera.position.set(37 + Math.cos(a) * 150, 105, 37 + Math.sin(a) * 150);
  camera.lookAt(37, 0, 37);
}

// ---------- minimap ----------
const mm = $('minimap'), mctx = mm.getContext('2d');
function drawMap(ctx, W, H, cx, cz, sc, opts) {
  ctx.save(); ctx.clearRect(0, 0, W, H);
  if (!opts.full) { ctx.beginPath(); ctx.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2); ctx.clip(); }
  const X = x => W / 2 + (x - cx) * sc, Z = z => H / 2 + (z - cz) * sc;
  ctx.fillStyle = '#100d22'; ctx.fillRect(0, 0, W, H);
  const e = EXT + ROAD / 2;
  ctx.fillStyle = '#5a5384'; ctx.fillRect(X(-e), Z(-e), 2 * e * sc, 2 * e * sc);
  for (let i = -N; i < N; i++) for (let j = -N; j < N; j++) {
    ctx.fillStyle = i === PLAZA.i && j === PLAZA.j ? '#6a5524' : '#2a2546';
    ctx.fillRect(X((i + 0.5) * CELL - BLOCK / 2), Z((j + 0.5) * CELL - BLOCK / 2), BLOCK * sc, BLOCK * sc);
  }
  for (const c of cars) {
    if (c === player.inCar) continue;
    ctx.fillStyle = c === myCar ? '#f2b630' : c.ai ? '#39e0d0' : '#8c86a8';
    ctx.fillRect(X(c.pos.x) - 2, Z(c.pos.z) - 2, 4, 4);
  }
  if (opts.full) {
    ctx.font = '600 12px "Saira Condensed", sans-serif'; ctx.textAlign = 'center';
    for (const l of LANDMARKS) {
      const lx=Array.isArray(l.pos)?l.pos[0]:l.node[0]*CELL, lz=Array.isArray(l.pos)?l.pos[1]:l.node[1]*CELL;
      const x = X(lx), y = Z(lz);
      ctx.fillStyle = '#f5f1ff'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
      ctx.fillText(l.name, clamp(x, 52, W - 52), y + (y > H - 20 ? -8 : 15));
    }
  }
  if (waypoint) {
    let x = X(waypoint.pos.x), y = Z(waypoint.pos.z);
    if (!opts.full) { const dx = x - W / 2, dy = y - H / 2, d = Math.hypot(dx, dy), R = W / 2 - 10; if (d > R) { x = W / 2 + dx / d * R; y = H / 2 + dy / d * R; } }
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#f2b630'; ctx.fillRect(-6, -6, 12, 12); ctx.restore();
  }
  const h = player.inCar ? player.inCar.heading : player.facing;
  ctx.save(); ctx.translate(X(player.pos.x), Z(player.pos.z)); ctx.rotate(-h);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#15122c'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, 7); ctx.lineTo(0, 3); ctx.lineTo(-7, 7); ctx.closePath(); ctx.stroke(); ctx.fill();
  ctx.restore(); ctx.restore();
}

// ---------- HUD ----------
let gameMinutes = 23 * 60 + 12, hudT = 0;
const fmtClock = (m, ampm) => {
  const hh = Math.floor(m / 60) % 24, mm2 = String(Math.floor(m % 60)).padStart(2, '0');
  return ampm ? `${hh % 12 || 12}:${mm2} ${hh < 12 ? 'AM' : 'PM'}` : `${hh}:${mm2}`;
};
function updateHUD(dt) {
  gameMinutes = (gameMinutes + dt) % 1440;
  drawMap(mctx, 240, 240, player.pos.x, player.pos.z, 0.6, {});
  hudT += dt; if (hudT < 0.15) return; hudT = 0;
  $('zone').textContent = zoneName(player.pos.x, player.pos.z);
  $('clock').textContent = fmtClock(gameMinutes, true);
  $('phClock').textContent = fmtClock(gameMinutes, false);
  const car = player.inCar;
  $('speedo').hidden = !car;
  if (car) { $('spd').textContent = Math.round(Math.abs(car.speed) * 2.237); $('autoTag').hidden = !car.auto; }
  let pr = '';
  if (!phone.open && !radial.open) {
    const ka=(!car&&typeof nearestKingdomActivity==='function')?nearestKingdomActivity(4.5):null;
    const kd=(!car&&typeof nearestKingdomDestination==='function')?nearestKingdomDestination(8):null;
    if (ka) pr = `${glyph('enter')}${ka.shortLabel}`;
    else if (kd) pr = `${glyph('enter')}Enter ${kd.shortName}`;
    else if (!car && nearestCar(4.6)) pr = `${glyph('enter')}Get in`;
    else if (car && Math.abs(car.speed) < 1 && !car.auto) pr = `${glyph('enter')}Get out`;
  }
  const pe = $('prompt'); if (pe.innerHTML !== pr) pe.innerHTML = pr; pe.hidden = !pr;
  $('bEnter').textContent = car ? 'Exit' : 'Enter';
  $('bAlt').textContent = car ? 'Brake' : 'Sprint';
}
function updateWaypoint(now) {
  if (!waypoint) return;
  beam.material.opacity = 0.22 + Math.sin(now * 0.004) * 0.08;
  if (Math.hypot(player.pos.x - waypoint.pos.x, player.pos.z - waypoint.pos.z) < 12) {
    toast(`You made it to ${waypoint.name}`);
    const car = player.inCar;
    if (car && car.auto) { car.auto = false; car.path = []; car.arrive = 1.5; if (phone.open) closePhone(); }
    waypoint = null; beam.visible = false; if (car) car.target = null;
  }
}
function updateAudio() {
  if (!engGain) return;
  const car = player.inCar;
  engGain.gain.value += ((car ? 0.045 : 0) - engGain.gain.value) * 0.1;
  if (car) engOsc.frequency.value = 42 + Math.abs(car.speed) * 4.2;
}

// ---------- game state ----------
let running = false, hasStarted = false, trafficT = 0;
function startGame() {
  if (running) return;
  running = true; initAudio(); $('start').hidden = true; $('hud').hidden = false;
  if (IS_TOUCH) $('touch').hidden = false;
  if (!hasStarted) {
    hasStarted = true; camYaw = 0; camPitch = 0.28;
    setTimeout(() => toast(IS_TOUCH ? 'Your gold car is parked right there. Walk up and tap Enter.'
      : lastInput === 'pad' ? 'Your gold car is parked right there. Walk up and press Y.' : 'Your gold car is parked right there. Walk up and press F. Click to look around.'), 400);
  }
}
function pauseGame() {
  running = false; if (radial.open) closeRadial(false);
  $('start').hidden = false; $('startBtn').textContent = 'Resume'; $('startSub').textContent = 'Paused.';
  $('touch').hidden = true;
}
$('startBtn').addEventListener('click', e => {
  e.stopPropagation(); startGame();
  if (!IS_TOUCH && cv.requestPointerLock) { try { cv.requestPointerLock(); } catch (er) {} }
});
$('start').addEventListener('pointerdown', e => { if (e.target.id !== 'startBtn' && IS_TOUCH) startGame(); });
if (IS_TOUCH) $('startHint').textContent = 'Tap anywhere to start. Pair a controller in Bluetooth settings to play with a pad.';
