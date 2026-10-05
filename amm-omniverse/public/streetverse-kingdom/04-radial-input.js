// ---------- radial menu ----------
const RADIAL = [
  { id: 'phone', label: 'Phone' }, { id: 'auto', label: 'Auto-drive' }, { id: 'lights', label: 'Headlights' },
  { id: 'horn', label: 'Horn' }, { id: 'ride', label: 'Call my ride' }, { id: 'home', label: 'Route to Crown Plaza' },
];
const radial = { open: false, sel: -1, vx: 0, vy: 0, tap: false };
const ringEl = $('ring'), radialEl = $('radial');
RADIAL.forEach((r, k) => {
  const a = k / RADIAL.length * Math.PI * 2, b = document.createElement('button');
  b.className = 'slice'; b.textContent = r.label;
  b.style.left = `calc(50% + ${Math.sin(a) * 150}px)`; b.style.top = `calc(50% - ${Math.cos(a) * 150}px)`;
  b.addEventListener('click', e => { e.stopPropagation(); radial.sel = k; closeRadial(true); });
  b.addEventListener('pointerenter', () => { if (!IS_TOUCH) { radial.sel = k; paintRadial(); } });
  ringEl.appendChild(b);
});
radialEl.addEventListener('click', () => closeRadial(false));
function paintRadial() {
  [...ringEl.children].forEach((c, k) => c.classList.toggle('sel', k === radial.sel));
  $('radialLabel').textContent = radial.sel >= 0 ? RADIAL[radial.sel].label : 'Pick an action';
}
function openRadial(tap) {
  if (phone.open) return;
  radial.open = true; radial.tap = tap; radial.sel = -1; radial.vx = radial.vy = 0; radialEl.hidden = false; paintRadial();
}
function closeRadial(run) {
  if (!radial.open) return;
  radial.open = false; radialEl.hidden = true;
  if (run && radial.sel >= 0) doRadial(RADIAL[radial.sel].id);
}
function doRadial(id) {
  if (id === 'phone') openPhone();
  else if (id === 'auto') toggleAuto();
  else if (id === 'lights') toggleLights();
  else if (id === 'horn') horn();
  else if (id === 'ride') callRide();
  else if (id === 'home') setWaypoint(0);
}
function updateRadial() {
  if (!radial.open) return;
  let vx = radial.vx, vy = radial.vy;
  if (Math.abs(pad.axes[2]) + Math.abs(pad.axes[3]) > 0.3) { vx = pad.axes[2] * 100; vy = pad.axes[3] * 100; }
  if (Math.hypot(vx, vy) > 40) {
    let a = Math.atan2(vx, -vy); if (a < 0) a += Math.PI * 2;
    const s = Math.round(a / (Math.PI * 2 / RADIAL.length)) % RADIAL.length;
    if (s !== radial.sel) { radial.sel = s; paintRadial(); tick(); }
  }
}

// ---------- input ----------
const keys = {};
const queue = [];
const act = a => queue.push(a);
let lookDX = 0, lookDY = 0, mouseDown = false;
const pad = { axes: [0, 0, 0, 0], btn: [], prev: [] };
function pollPad() {
  let gps = [];
  try { gps = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { gps = []; }
  let gp = null; for (const g of gps) if (g && g.connected) { gp = g; break; }
  pad.prev = pad.btn; pad.btn = [];
  if (!gp) { pad.axes = [0, 0, 0, 0]; return; }
  for (let i = 0; i < gp.buttons.length; i++) pad.btn[i] = gp.buttons[i].value || (gp.buttons[i].pressed ? 1 : 0);
  for (let i = 0; i < 4; i++) { const v = gp.axes[i] || 0; pad.axes[i] = Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82; }
  if (pad.axes.some(a => a) || pad.btn.some(b => b > 0.5)) setInputMode('pad');
}
const held = i => (pad.btn[i] || 0) > 0.5;
const wasHeld = i => (pad.prev[i] || 0) > 0.5;
const pressed = i => held(i) && !wasHeld(i);
const released = i => !held(i) && wasHeld(i);
function setInputMode(m) { if (lastInput !== m) { lastInput = m; if (phone.open) applyFocus(); } }

addEventListener('keydown', e => {
  if (e.code === 'Tab') e.preventDefault();
  setInputMode('kb');
  if (e.repeat) return;
  keys[e.code] = true;
  if (!running) { if (e.code !== 'Escape') startGame(); return; }
  if (phone.open) {
    const m = { ArrowUp: 'nav-up', ArrowDown: 'nav-down', ArrowLeft: 'nav-left', ArrowRight: 'nav-right', Enter: 'confirm', Backspace: 'back', Escape: 'back', KeyP: 'phone', Backquote: 'phone' };
    if (m[e.code]) { e.preventDefault(); act(m[e.code]); }
    return;
  }
  const m = { KeyF: 'enter', KeyE: 'enter', KeyP: 'phone', Backquote: 'phone', KeyH: 'horn', KeyG: 'auto', KeyL: 'lights', Tab: 'radialOpen' };
  if (m[e.code]) act(m[e.code]);
});
addEventListener('keyup', e => { keys[e.code] = false; if (e.code === 'Tab') act('radialClose'); });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

const cv = renderer.domElement;
cv.addEventListener('mousedown', () => {
  mouseDown = true;
  if (running && !IS_TOUCH && !phone.open && cv.requestPointerLock) { try { cv.requestPointerLock(); } catch (e) {} }
});
addEventListener('mouseup', () => { mouseDown = false; });
addEventListener('mousemove', e => {
  if (!running || IS_TOUCH) return;
  if (document.pointerLockElement === cv) {
    setInputMode('kb');
    if (radial.open) { radial.vx = clamp(radial.vx + e.movementX, -120, 120); radial.vy = clamp(radial.vy + e.movementY, -120, 120); }
    else { lookDX += e.movementX * 0.0026; lookDY += e.movementY * 0.0026; }
  } else if (radial.open) { radial.vx = e.clientX - innerWidth / 2; radial.vy = e.clientY - innerHeight / 2; }
  else if (mouseDown && !phone.open) { lookDX += e.movementX * 0.004; lookDY += e.movementY * 0.004; }
});

// touch
const touch = { mx: 0, my: 0, alt: false, stickId: null, ox: 0, oy: 0, lookId: null, lx: 0, ly: 0 };
const stickZone = $('stickZone'), stickBase = $('stickBase'), stickKnob = $('stickKnob'), lookZone = $('lookZone');
stickZone.addEventListener('pointerdown', e => {
  setInputMode('touch'); touch.stickId = e.pointerId; touch.ox = e.clientX; touch.oy = e.clientY;
  stickBase.classList.add('on'); stickBase.style.left = e.clientX + 'px'; stickBase.style.top = (e.clientY - 60) + 'px';
  stickZone.setPointerCapture(e.pointerId);
});
stickZone.addEventListener('pointermove', e => {
  if (e.pointerId !== touch.stickId) return;
  let dx = e.clientX - touch.ox, dy = e.clientY - touch.oy; const m = Math.hypot(dx, dy), R = 52;
  if (m > R) { dx *= R / m; dy *= R / m; }
  stickKnob.style.transform = `translate(${dx}px,${dy}px)`; touch.mx = dx / R; touch.my = -dy / R;
});
const endStick = e => {
  if (e.pointerId !== touch.stickId) return;
  touch.stickId = null; touch.mx = touch.my = 0; stickKnob.style.transform = '';
  stickBase.classList.remove('on'); stickBase.style.left = ''; stickBase.style.top = '';
};
stickZone.addEventListener('pointerup', endStick); stickZone.addEventListener('pointercancel', endStick);
lookZone.addEventListener('pointerdown', e => { setInputMode('touch'); touch.lookId = e.pointerId; touch.lx = e.clientX; touch.ly = e.clientY; lookZone.setPointerCapture(e.pointerId); });
lookZone.addEventListener('pointermove', e => {
  if (e.pointerId !== touch.lookId) return;
  lookDX += (e.clientX - touch.lx) * 0.006; lookDY += (e.clientY - touch.ly) * 0.005; touch.lx = e.clientX; touch.ly = e.clientY;
});
const endLook = e => { if (e.pointerId === touch.lookId) touch.lookId = null; };
lookZone.addEventListener('pointerup', endLook); lookZone.addEventListener('pointercancel', endLook);
document.querySelectorAll('#btns .tb').forEach(b => {
  b.addEventListener('pointerdown', e => {
    e.preventDefault(); setInputMode('touch'); b.classList.add('down'); initAudio();
    const a = b.dataset.act;
    if (a === 'alt') touch.alt = true;
    else if (a === 'menu') radial.open ? closeRadial(false) : openRadial(true);
    else act(a);
  });
  const up = () => { b.classList.remove('down'); if (b.dataset.act === 'alt') touch.alt = false; };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
});
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());

let navCd = 0;
function gather() {
  pollPad();
  const k = c => keys[c] ? 1 : 0;
  let kx = k('KeyD') + k('ArrowRight') - k('KeyA') - k('ArrowLeft');
  let ky = k('KeyW') + k('ArrowUp') - k('KeyS') - k('ArrowDown');
  if (phone.open) { kx = 0; ky = 0; }
  let mx = kx + pad.axes[0] + touch.mx, my = ky - pad.axes[1] + touch.my;
  const L = Math.hypot(mx, my); if (L > 1) { mx /= L; my /= L; }
  const throttle = Math.max(ky > 0 ? 1 : 0, pad.btn[7] || 0, touch.my > 0.15 ? touch.my : 0);
  const brake = Math.max(ky < 0 ? 1 : 0, pad.btn[6] || 0, touch.my < -0.15 ? -touch.my : 0);
  const steer = clamp(kx + pad.axes[0] + touch.mx, -1, 1);
  const handbrake = !!(keys.Space || held(0) || touch.alt);
  const run = !!(keys.ShiftLeft || keys.ShiftRight || held(0) || held(10) || touch.alt);

  if (!running) {
    if (pad.btn.some((v, i) => v > 0.5 && !wasHeld(i))) startGame();
  } else if (phone.open) {
    if (pressed(12)) act('nav-up'); if (pressed(13)) act('nav-down'); if (pressed(14)) act('nav-left'); if (pressed(15)) act('nav-right');
    if (pressed(0)) act('confirm'); if (pressed(1)) act('back'); if (pressed(8)) act('phone');
    if (navCd <= 0) {
      if (Math.abs(pad.axes[1]) > 0.6) { act(pad.axes[1] < 0 ? 'nav-up' : 'nav-down'); navCd = 0.22; }
      else if (Math.abs(pad.axes[0]) > 0.6) { act(pad.axes[0] < 0 ? 'nav-left' : 'nav-right'); navCd = 0.22; }
    }
  } else {
    if (pressed(3)) act('enter'); if (pressed(8)) act('phone'); if (pressed(2)) act('auto');
    if (pressed(1) && player.inCar) act('horn'); if (pressed(11)) act('lights'); if (pressed(9)) act('pause');
    if (pressed(4)) act('radialOpen'); if (released(4)) act('radialClose');
  }
  return { mx, my, steer, throttle, brake, handbrake, run };
}

function handle(a) {
  switch (a) {
    case 'enter': if (!phone.open && !radial.open) toggleCar(); break;
    case 'phone': phone.open ? closePhone() : openPhone(); break;
    case 'horn': horn(); break;
    case 'auto': toggleAuto(); if (phone.open) renderPhone(); break;
    case 'lights': toggleLights(); break;
    case 'radialOpen': openRadial(false); break;
    case 'radialClose': if (!radial.tap) closeRadial(true); break;
    case 'nav-up': if (phone.open) phoneNav(0, -1); break;
    case 'nav-down': if (phone.open) phoneNav(0, 1); break;
    case 'nav-left': if (phone.open) phoneNav(-1, 0); break;
    case 'nav-right': if (phone.open) phoneNav(1, 0); break;
    case 'confirm': if (phone.open) { const f = screenEl.querySelectorAll('[data-f]')[phone.focus]; if (f) f.click(); } break;
    case 'back': if (phone.open) phoneBack(); break;
    case 'pause': pauseGame(); break;
  }
}
