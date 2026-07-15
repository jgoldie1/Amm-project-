const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ARENA_FILE = path.join(DATA_DIR, 'arena-sessions.json');
function id(prefix) { return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`; }
function money(value) { const n = Number(value); if (!Number.isFinite(n) || n < 0) throw new Error('Invalid amount.'); return Math.round(n * 100) / 100; }
function readJson(file, fallback = []) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2)); }

function createRide(input = {}) {
  if (!String(input.pickup || '').trim() || !String(input.destination || '').trim()) throw new Error('Pickup and destination are required.');
  return { id: id('ride'), status: 'requested', pickup: String(input.pickup), destination: String(input.destination), riderId: String(input.riderId || 'demo-rider'), vehicleType: String(input.vehicleType || 'standard'), accessibility: String(input.accessibility || ''), estimatedFare: money(input.estimatedFare || 0), currency: String(input.currency || 'USD').toUpperCase(), createdAt: new Date().toISOString(), provider: process.env.MAPS_PROVIDER || 'mock' };
}

function createDelivery(input = {}) {
  if (!String(input.pickup || '').trim() || !String(input.dropoff || '').trim()) throw new Error('Pickup and dropoff are required.');
  return { id: id('delivery'), status: 'requested', pickup: String(input.pickup), dropoff: String(input.dropoff), customerId: String(input.customerId || 'demo-customer'), packageType: String(input.packageType || 'standard'), accessibility: String(input.accessibility || ''), estimatedFee: money(input.estimatedFee || 0), currency: String(input.currency || 'USD').toUpperCase(), createdAt: new Date().toISOString(), provider: process.env.MAPS_PROVIDER || 'mock' };
}

function searchHolo({ query = '', scope = 'all', catalog = [], games = [] }) {
  const q = String(query).trim().toLowerCase();
  const all = [...catalog.map((x) => ({ ...x, source: 'content' })), ...games.map((x) => ({ ...x, source: 'game' })), ...menu().map(x => ({ ...x, source: 'module' }))];
  if (!q) return all.slice(0, 50);
  return all.filter((item) => {
    if (scope !== 'all' && item.source !== scope && item.type !== scope && item.genre !== scope) return false;
    return JSON.stringify(item).toLowerCase().includes(q);
  }).slice(0, 50);
}

function menu() {
  return [
    { id: 'hologpt', title: 'HoloGPT', route: '/', status: 'wired' },
    { id: 'search', title: 'Holo Search', route: '/holo.html#search', status: 'wired' },
    { id: 'menu', title: 'Holo Menu', route: '/holo.html#menu', status: 'wired' },
    { id: 'music', title: 'Holo Music', route: '/holo.html#music', status: 'draft-api' },
    { id: 'games', title: '11 Holo Games', route: '/holo.html#games', status: 'controller-shell' },
    { id: 'arena', title: 'Holo Arena', route: '/holo.html#arena', status: 'session-api' },
    { id: 'ride', title: 'Holo Rideshare', route: '/holo.html#ride', status: 'mock-safe' },
    { id: 'delivery', title: 'Holo Delivery', route: '/holo.html#delivery', status: 'mock-safe' },
    { id: 'reels', title: 'Holo Reels', route: '/platform.html', status: 'draft-api' },
    { id: 'drama', title: 'Holo Drama', route: '/platform.html', status: 'draft-api' },
    { id: 'ads', title: 'Holo Ads', route: '/platform.html', status: 'draft-api' }
  ];
}

function capabilities() {
  return {
    input: ['touch', 'keyboard', 'Bluetooth/USB controller through browser Gamepad API', 'future XR controllers'],
    screens: ['phone', 'tablet', 'laptop', 'desktop', 'TV casting/mirroring', 'future Volcano console'],
    immersive: ['WebXR VR', 'WebXR AR', 'mixed-reality design path'],
    continuity: ['shared account', 'cloud save planned', 'cross-device entitlement planned', 'controller profiles planned'],
    multiplayer: ['LiveKit voice/video and data', 'authoritative game server required for competitive play'],
    accessibility: ['remappable controls', 'one-handed presets', 'voice commands planned', 'captions', 'reduced motion']
  };
}

function createArenaSession(input = {}) {
  const record = { id: id('arena'), gameId: String(input.gameId || ''), format: String(input.format || 'match'), status: 'draft', spectators: input.spectators !== false, livekitRoom: `arena-${Date.now()}`, createdAt: new Date().toISOString() };
  if (!record.gameId) throw new Error('Game ID is required.');
  const rows = readJson(ARENA_FILE, []); rows.push(record); writeJson(ARENA_FILE, rows.slice(-2000));
  return record;
}

module.exports = { createRide, createDelivery, searchHolo, menu, capabilities, createArenaSession };
