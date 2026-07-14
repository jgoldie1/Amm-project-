const menuEl = document.querySelector('#menu');
const gameGrid = document.querySelector('#gameGrid');
const workspace = document.querySelector('#workspace');
const searchForm = document.querySelector('#searchForm');
const searchInput = document.querySelector('#searchInput');
let activeGame = null;
let gamepadLoop = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function show(title, data) {
  workspace.innerHTML += `<article class="message assistant"><div class="avatar">H</div><div class="bubble"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(typeof data === 'string' ? data : JSON.stringify(data, null, 2))}</p></div></article>`;
  workspace.scrollTop = workspace.scrollHeight;
}
async function getJson(url) {
  const response = await fetch(url); const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed'); return data;
}
async function postJson(url, body) {
  const response = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed'); return data;
}

async function loadMenu() {
  const items = await getJson('/api/holo/menu');
  menuEl.innerHTML = items.map(item => `<a class="mode" href="${escapeHtml(item.route || '#')}">${escapeHtml(item.title)} <small>${escapeHtml(item.status || '')}</small></a>`).join('');
}
async function loadGames() {
  const games = await getJson('/api/games');
  gameGrid.innerHTML = games.map(game => `<button data-game="${escapeHtml(game.id)}" title="${escapeHtml((game.modes || []).join(', '))}">${escapeHtml(game.title)} · ${escapeHtml(game.status)}</button>`).join('');
  gameGrid.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => {
    activeGame = games.find(game => game.id === button.dataset.game);
    show('Game selected', { ...activeGame, next: 'Connect controller, choose cast/XR mode, then launch the actual engine build.' });
  }));
}

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try { show('Holo Search results', await getJson(`/api/holo/search?q=${encodeURIComponent(searchInput.value)}`)); }
  catch (error) { show('Search error', error.message); }
});

function readGamepad() {
  const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
  if (pads.length) {
    const pad = pads[0];
    const pressed = pad.buttons.map((b, i) => b.pressed ? i : null).filter(i => i !== null);
    const axes = pad.axes.map(v => Number(v.toFixed(2)));
    document.title = pressed.length ? `Controller buttons: ${pressed.join(',')}` : 'TryAMM Holo Ecosystem';
    window.holoControllerState = { id: pad.id, pressed, axes, timestamp: pad.timestamp };
  }
  gamepadLoop = requestAnimationFrame(readGamepad);
}

document.querySelector('#detectController').addEventListener('click', () => {
  const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
  if (!pads.length) return show('Controller', 'Pair the Bluetooth controller in your phone, tablet, laptop, or TV operating-system settings, press a button, then try again.');
  show('Controller connected', { id: pads[0].id, buttons: pads[0].buttons.length, axes: pads[0].axes.length, game: activeGame?.title || 'No game selected' });
  if (!gamepadLoop) readGamepad();
});
window.addEventListener('gamepadconnected', event => show('Controller connected automatically', { id: event.gamepad.id, index: event.gamepad.index }));
window.addEventListener('gamepaddisconnected', event => show('Controller disconnected', { id: event.gamepad.id }));

document.querySelector('#startCast').addEventListener('click', async () => {
  if (window.chrome?.cast) return show('Cast ready', 'Google Cast SDK detected. The production sender must create a session and load the selected game or stream receiver app.');
  if (navigator.presentation) return show('Presentation API available', 'A compatible secondary display may be available. Production requires a receiver URL and device testing.');
  show('TV play options', 'Use browser screen casting, AirPlay, Miracast, HDMI, or a future dedicated Google Cast receiver until native TV apps and the Volcano console are released.');
});

document.querySelector('#startXR').addEventListener('click', async () => {
  if (!navigator.xr) return show('XR unavailable', 'This browser does not expose WebXR. Use a supported headset/browser or continue in phone, tablet, laptop, or cast mode.');
  const support = {};
  for (const mode of ['immersive-vr','immersive-ar']) {
    try { support[mode] = await navigator.xr.isSessionSupported(mode); } catch { support[mode] = false; }
  }
  show('XR capability', { ...support, selectedGame: activeGame?.title || null, next: 'The game engine must render stereoscopic scenes and map XR controllers before play can begin.' });
});

document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', async () => {
  try {
    const action = button.dataset.action;
    if (action === 'ride') show('Holo Ride draft', await postJson('/api/holo/rides', { pickup: 'Current location', destination: 'TryAMM Arena', riderId: 'demo-rider', estimatedFare: 0 }));
    if (action === 'delivery') show('Holo Delivery draft', await postJson('/api/holo/deliveries', { pickup: 'Marketplace vendor', dropoff: 'Customer address', customerId: 'demo-customer', estimatedFee: 0 }));
    if (action === 'music') show('Holo Music draft', await postJson('/api/content', { type: 'music', title: 'New Holo Music Session', description: 'Draft track, visualizer, lyrics, rights and livestream performance package.' }));
    if (action === 'arena') show('Holo Arena', await postJson('/api/holo/arena/session', { gameId: activeGame?.id || 'genesis-omniverse', format: 'tournament', spectators: true }));
  } catch (error) { show('Action error', error.message); }
}));

Promise.all([loadMenu(), loadGames()]).catch(error => show('Startup error', error.message));
