// ---------- spawn ----------
const player = Object.assign(makeBJStubbsFallback(), { pos: new T.Vector3(9.5, 0, 40), facing: 0, inCar: null });
attachBJProductionHuman(player);
{
  const crown = new T.Mesh(new T.CylinderGeometry(0.17, 0.2, 0.16, 8, 1, true), new T.MeshBasicMaterial({ color: 0xffd23a, side: T.DoubleSide }));
  crown.position.y = 1.98; player.mesh.add(crown);
}
const myCar = makeCar(0xf2b630, 5.6, 42, 0);

const headLight = new T.SpotLight(0xfff1d6, 2.2, 55, 0.6, 0.45, 1);
headLight.position.set(0, 1.2, -1.8);
const hlTarget = new T.Object3D(); hlTarget.position.set(0, 0, -18);
headLight.target = hlTarget;
let lightsOn = true;
function attachLight(car) { car.mesh.add(headLight); car.mesh.add(hlTarget); headLight.intensity = lightsOn ? 2.2 : 0; }
attachLight(myCar);
function toggleLights() { lightsOn = !lightsOn; headLight.intensity = lightsOn && player.inCar ? 2.2 : 0; toast(lightsOn ? 'Headlights on' : 'Headlights off'); }

function spawnTraffic(farFrom) {
  for (let t = 0; t < 40; t++) {
    const i = randi(-N, N), j = randi(-N, N), d = pick(DIRS), ni = i + d[0], nj = j + d[1];
    if (Math.abs(ni) > N || Math.abs(nj) > N) continue;
    const along = rand(12, 60), r = rightOf(d);
    const x = i * CELL + d[0] * along + r[0] * LANE, z = j * CELL + d[1] * along + r[1] * LANE;
    if (cars.some(c => Math.hypot(c.pos.x - x, c.pos.z - z) < 12)) continue;
    if (farFrom && Math.hypot(farFrom.x - x, farFrom.z - z) < 90) continue;
    const car = makeCar(pick(CAR_COLORS), x, z, Math.atan2(-d[0], -d[1]));
    car.ai = true; car.dir = d; car.node = [ni, nj]; car.path = [{ p: lanePt(ni, nj, d, -8), entry: true }]; car.speed = rand(6, 11);
    return car;
  }
  return null;
}
for (let k = 0; k < Q.traffic; k++) spawnTraffic();
for (let k = 0; k < Q.parked; k++) {
  for (let t = 0; t < 30; t++) {
    const i = randi(-N, N), j = randi(-N, N), d = pick(DIRS);
    if (Math.abs(i + d[0]) > N || Math.abs(j + d[1]) > N) continue;
    const along = rand(14, 58), r = rightOf(d);
    const x = i * CELL + d[0] * along + r[0] * 5.6, z = j * CELL + d[1] * along + r[1] * 5.6;
    if (cars.some(c => Math.hypot(c.pos.x - x, c.pos.z - z) < 8)) continue;
    makeCar(pick(CAR_COLORS), x, z, Math.atan2(-d[0], -d[1])); break;
  }
}

const S = BLOCK / 2 - 2.5;
function perim(u, out) {
  u = ((u % 4) + 4) % 4; const side = u | 0, f = u - side;
  if (side === 0) out.set(-S + 2 * S * f, 0, -S);
  else if (side === 1) out.set(S, 0, -S + 2 * S * f);
  else if (side === 2) out.set(S - 2 * S * f, 0, S);
  else out.set(-S, 0, S - 2 * S * f);
  return out;
}
const peds = [];
for (let k = 0; k < Q.peds; k++) {
  const p = makePerson(pick(SHIRTS), pick(PANTS), pick(SKINS));
  attachProductionHuman(p,k);
  p.cx = (randi(-N, N - 1) + 0.5) * CELL; p.cz = (randi(-N, N - 1) + 0.5) * CELL;
  p.u = rand(0, 4); p.dir = Math.random() < 0.5 ? 1 : -1; p.spd = rand(1.1, 1.7);
  p.state = 'walk'; p.timer = 0; p.heading = 0; p.pos = perim(p.u, new T.Vector3()).add(new T.Vector3(p.cx, 0, p.cz));
  peds.push(p);
}

// waypoint
const beam = new T.Mesh(new T.CylinderGeometry(1.3, 1.3, 120, 16, 1, true),
  new T.MeshBasicMaterial({ color: 0xf2b630, transparent: true, opacity: 0.3, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }));
beam.position.y = 60; beam.visible = false; scene.add(beam);
let waypoint = null;
function setWaypointNode(i, j, name, customPos) {
  const px=Array.isArray(customPos)?Number(customPos[0]):i*CELL, pz=Array.isArray(customPos)?Number(customPos[1]):j*CELL;
  waypoint = { name, node: [i, j], pos: new T.Vector3(px, 0, pz) };
  beam.position.x = waypoint.pos.x; beam.position.z = waypoint.pos.z; beam.visible = true;
  if (player.inCar && player.inCar.auto) player.inCar.target = waypoint.node;
  toast(`Waypoint set: ${name}`);
}
function setWaypoint(k) {
  if (k < 0) { waypoint = null; beam.visible = false; if (player.inCar) player.inCar.target = null; toast('Waypoint cleared'); return; }
  const l = LANDMARKS[k]; setWaypointNode(l.node[0], l.node[1], l.name, l.pos);
}

// ---------- audio ----------
let actx = null, engOsc = null, engGain = null;
function initAudio() {
  if (actx) { actx.resume && actx.resume(); return; }
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    engOsc = actx.createOscillator(); engOsc.type = 'sawtooth';
    const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380;
    engGain = actx.createGain(); engGain.gain.value = 0;
    engOsc.connect(f); f.connect(engGain); engGain.connect(actx.destination); engOsc.start();
  } catch (e) { actx = null; }
}
function blip(freqs, type, dur, vol) {
  if (!actx) return; const t = actx.currentTime;
  for (const fr of freqs) {
    const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = fr;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.05);
  }
}
const horn = () => blip([392, 494], 'square', 0.45, 0.07);
let thudCd = 0;
const thud = () => { if (thudCd > 0) return; thudCd = 0.3; blip([70, 55], 'triangle', 0.25, 0.25); };
const tick = () => blip([1200], 'sine', 0.06, 0.03);

// ---------- UI: toast / prompt ----------
let toastTimer = 0;
function toast(m) {
  const el = $('toast'); el.textContent = m; el.hidden = false;
  el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
}
let lastInput = IS_TOUCH ? 'touch' : 'kb';
const GLYPH = { pad: { enter: 'Y', phone: 'View' }, kb: { enter: 'F', phone: 'P' } };
const glyph = a => lastInput === 'touch' ? '' : `<kbd>${GLYPH[lastInput][a]}</kbd>`;

// ---------- phone ----------
const ICON = {
  kingdom: '<path d="M4 19h16M6 19V9l3 3 3-6 3 6 3-3v10M8 15h8"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14m6-12v14"/>',
  drive: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M3.8 11h6.2m4 0h6.2M12 14v6.5"/>',
  texts: '<path d="M4 5h16v11H9l-5 4z"/>',
  ride: '<path d="M3 16v-3.5L5.5 7h13l2.5 5.5V16zM6.5 16v2.5m11-2.5v2.5M3.5 12.5h17"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3.5m0 12v3.5M2.5 12H6m12 0h3.5M5.3 5.3l2.5 2.5m8.4 8.4 2.5 2.5M5.3 18.7l2.5-2.5m8.4-8.4 2.5-2.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
};
const APPS = [
  { id: 'kingdom', label: 'Yahisrael', c: '#e8b944' }, { id: 'map', label: 'Map', c: '#39e0d0' }, { id: 'drive', label: 'Auto-drive', c: '#f2b630' }, { id: 'texts', label: 'Texts', c: '#ff4f9a' },
  { id: 'ride', label: 'My ride', c: '#ff9a4a' }, { id: 'settings', label: 'Settings', c: '#b8b2dc' }, { id: 'help', label: 'Controls', c: '#9d6bff' },
];
const TEXTS = [
  { from: 'Unc', t: 'Pull up to Crown Plaza when you get a chance. Bring the gold car.' },
  { from: 'Tasha', t: 'Neon Row is packed tonight. Traffic is crazy on the east side.' },
  { from: 'Kingdom Arena', t: 'Doors open at midnight. Set your waypoint and ride out.' },
];
const phone = { open: false, screen: 'home', focus: 0 };
const phoneEl = $('phone'), screenEl = $('phoneScreen');
function openPhone() {
  if (radial.open) closeRadial(false);
  phone.open = true; phone.screen = 'home'; phone.focus = 0; phoneEl.hidden = false;
  if (document.pointerLockElement) document.exitPointerLock();
  const car = player.inCar;
  if (car && !car.auto && Math.abs(car.speed) > 2 && startAuto(car, 'phone')) toast('Auto-drive on while you use your phone');
  renderPhone(); tick();
}
function closePhone() {
  phone.open = false; phoneEl.hidden = true;
  const car = player.inCar;
  if (car && car.auto === 'phone') { car.auto = false; car.path = []; toast('You have the wheel'); }
}
function helpHTML() {
  return `<div class="help">
  <p><b>Controller</b>Left stick move and steer. RT gas, LT brake. A sprint or handbrake. Y get in or out. Hold LB for the menu, aim with the right stick. View opens the phone. X auto-drive. B horn.</p>
  <p><b>Keyboard</b>WASD move and drive. Shift sprint, Space handbrake. F get in or out. Hold Tab for the menu. P phone. G auto-drive. H horn. L lights. Click to look with the mouse.</p>
  <p><b>Touch</b>Left thumb moves and drives. Drag on the right side to look. Buttons do the rest.</p></div>`;
}
function renderPhone() {
  const s = phone.screen; let h = '';
  const bar = t => `<div class="ph-bar"><button data-f data-back>Back</button><b>${t}</b></div>`;
  if (s === 'home') {
    h = `<div class="ph-head"><b>${zoneName(player.pos.x, player.pos.z)}</b><span>${waypoint ? 'Heading to ' + waypoint.name : 'No waypoint set'}</span></div><div class="apps">` +
      APPS.map(a => `<button class="app" data-f data-app="${a.id}" style="--c:${a.c}"><i><svg viewBox="0 0 24 24">${ICON[a.id]}</svg></i><span>${a.label}</span></button>`).join('') + '</div>' +
      (player.inCar && player.inCar.auto ? '<p class="ph-note">Auto-drive has the wheel. Close the phone to take over.</p>' : '');
  } else if (s === 'map') {
    h = bar('Map') + '<canvas id="phMap" width="300" height="300"></canvas><div class="list">' +
      LANDMARKS.map((l, k) => `<button data-f data-wp="${k}">${l.name}${waypoint && waypoint.name === l.name ? '<em>Set</em>' : ''}</button>`).join('') +
      '<button data-f data-wp="-1">Clear waypoint</button></div>';
  } else if (s === 'kingdom') {
    const destinations=window.YAHISRAEL_DESTINATIONS||[];
    const progress=window.YAHISRAEL_PATH_PROGRESS||{visited:[],completed:false};
    const activities=window.YAHISRAEL_ACTIVITY_PROGRESS||{completed:[]};
    const pathIds=['judah-gate','hebrew-school','servants-center','garden-farm','press-ai-cafe'];
    const pathDone=pathIds.filter(id=>progress.visited?.includes(id)).length;
    const citizenCount=Number(window.YAHISRAEL_CITIZEN_COUNT||0);
    const householdCount=Array.isArray(window.YAHISRAEL_HOUSEHOLDS)?window.YAHISRAEL_HOUSEHOLDS.length:0;
    const arch=window.YAHISRAEL_ARCHITECTURE_STATUS||{loaded:[],fallback:[]};
    h = bar('Yahisrael') + `<div class="ph-note">WHERE HEAVEN MEETS EARTH • KINGDOM PATH ${pathDone}/${pathIds.length}${progress.completed?' • COMPLETE':''}<br>${citizenCount} KINGDOM CITIZENS • ${householdCount} HOUSEHOLDS • ${activities.completed?.length||0} LOCAL ACTIVITIES COMPLETE<br>ARCHITECTURE: ${arch.loaded?.length||0}/6 PRODUCTION GLBs • ${arch.fallback?.length||0} FALLBACK</div><div class="list">` +
      destinations.map((d,k)=>`<button data-f data-kdest="${k}"><span><b>${progress.visited?.includes(d.id)?'✓ ':''}${d.shortName}</b><br><small>${d.objective}</small></span><em>Route</em></button>`).join('') + '</div>';
  } else if (s === 'texts') {
    h = bar('Texts') + TEXTS.map(m => `<div class="msg"><b>${m.from}</b>${m.t}</div>`).join('');
  } else if (s === 'settings') {
    const sl = SENS.find(x => x.v === settings.sens) || SENS[1];
    h = bar('Settings') + `<div class="list">
      <button data-f data-set="invert">Invert look <em>${settings.invertY ? 'On' : 'Off'}</em></button>
      <button data-f data-set="sens">Look speed <em>${sl.l}</em></button>
      <button data-f data-set="gfx">Graphics <em>${settings.sharp ? 'Sharp' : 'Fast'}</em></button></div>`;
  } else if (s === 'help') {
    h = bar('Controls') + helpHTML();
  }
  screenEl.innerHTML = h;
  const mapC = $('phMap');
  if (mapC) {
    drawMap(mapC.getContext('2d'), 300, 300, 0, 0, 300 / (2 * EXT + 30), { full: true });
    mapC.addEventListener('pointerdown', e => {
      const r = mapC.getBoundingClientRect(), sc = 300 / (2 * EXT + 30);
      const wx = ((e.clientX - r.left) / r.width * 300 - 150) / sc, wz = ((e.clientY - r.top) / r.height * 300 - 150) / sc;
      setWaypointNode(clamp(Math.round(wx / CELL), -N, N), clamp(Math.round(wz / CELL), -N, N), 'Pinned spot'); renderPhone();
    });
  }
  phone.focus = clamp(phone.focus, 0, Math.max(0, screenEl.querySelectorAll('[data-f]').length - 1));
  applyFocus();
}
function applyFocus() {
  const f = [...screenEl.querySelectorAll('[data-f]')];
  f.forEach((b, k) => b.classList.toggle('focus', k === phone.focus && lastInput !== 'touch'));
  if (f[phone.focus] && lastInput !== 'touch') f[phone.focus].scrollIntoView({ block: 'nearest' });
}
function phoneNav(dx, dy) {
  const n = screenEl.querySelectorAll('[data-f]').length; if (!n) return;
  const cols = phone.screen === 'home' ? 3 : 1;
  phone.focus = clamp(phone.focus + (cols === 1 ? dx + dy : dx + dy * cols), 0, n - 1); applyFocus(); tick();
}
function phoneBack() { if (phone.screen === 'home') closePhone(); else { phone.screen = 'home'; phone.focus = 0; renderPhone(); } }
screenEl.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.back !== undefined) { phoneBack(); return; }
  if (b.dataset.app) {
    const a = b.dataset.app;
    if (a === 'drive') { toggleAuto(); renderPhone(); }
    else if (a === 'ride') { callRide(); }
    else { phone.screen = a; phone.focus = 0; renderPhone(); }
    return;
  }
  if (b.dataset.wp !== undefined) { setWaypoint(+b.dataset.wp); renderPhone(); return; }
  if (b.dataset.kdest !== undefined) { const d=(window.YAHISRAEL_DESTINATIONS||[])[+b.dataset.kdest]; if(d&&typeof setKingdomDestinationWaypoint==='function')setKingdomDestinationWaypoint(d.id); renderPhone(); return; }
  if (b.dataset.set) {
    const k = b.dataset.set;
    if (k === 'invert') settings.invertY = !settings.invertY;
    if (k === 'sens') { const i = SENS.findIndex(x => x.v === settings.sens); settings.sens = SENS[(i + 1) % SENS.length].v; }
    if (k === 'gfx') { settings.sharp = !settings.sharp; applyPixelRatio(); renderer.setSize(innerWidth, innerHeight); }
    renderPhone();
  }
});

function callRide() {
  if (player.inCar) { toast("You're already driving"); return; }
  const p = player.pos, rx = Math.round(p.x / CELL) * CELL, rz = Math.round(p.z / CELL) * CELL;
  let x, z, h;
  if (Math.abs(p.x - rx) < Math.abs(p.z - rz)) { const side = p.x >= rx ? 1 : -1; x = rx + side * 5.4; z = clamp(p.z, -EXT, EXT); h = side > 0 ? 0 : Math.PI; }
  else { const side = p.z >= rz ? 1 : -1; z = rz + side * 5.4; x = clamp(p.x, -EXT, EXT); h = side > 0 ? -Math.PI / 2 : Math.PI / 2; }
  for (const c of cars) if (c !== myCar && Math.hypot(c.pos.x - x, c.pos.z - z) < 4.5) { c.pos.x += 6; }
  myCar.ai = false; myCar.auto = false; myCar.path = []; myCar.speed = 0; myCar.pos.set(x, 0, z); myCar.heading = h;
  toast('Your ride pulled up');
  if (phone.open) closePhone();
}
