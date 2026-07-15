const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'holo-state.json');

const games = [
  { id: 'volcano-arena', title: 'Volcano Arena', genre: 'arena fighter', modes: ['web','mobile','tv','vr','mr'], players: '1-8' },
  { id: 'gridiron-legends', title: 'Gridiron Legends', genre: 'football', modes: ['web','mobile','tv','vr'], players: '1-22' },
  { id: 'hoops-dynasty', title: 'Hoops Dynasty', genre: 'basketball', modes: ['web','mobile','tv','vr'], players: '1-10' },
  { id: 'diamond-kings', title: 'Diamond Kings', genre: 'baseball', modes: ['web','mobile','tv'], players: '1-18' },
  { id: 'ice-realm', title: 'Ice Realm', genre: 'hockey', modes: ['web','mobile','tv','vr'], players: '1-12' },
  { id: 'world-pitch', title: 'World Pitch', genre: 'soccer', modes: ['web','mobile','tv','vr'], players: '1-22' },
  { id: 'fight-night-holo', title: 'Fight Night Holo', genre: 'boxing and MMA', modes: ['web','mobile','tv','vr','mr'], players: '1-2' },
  { id: 'silver-hawk-racing', title: 'Silver Hawk Racing', genre: 'futuristic racing', modes: ['web','mobile','tv','vr','mr'], players: '1-16' },
  { id: 'yogihoo-battle', title: 'Yogihoo Holo Battle', genre: 'creature card battle', modes: ['web','mobile','ar','vr'], players: '1-4' },
  { id: 'genesis-quest', title: 'Genesis Quest', genre: 'action RPG', modes: ['web','mobile','tv','vr','mr'], players: '1-8' },
  { id: 'city-of-creators', title: 'City of Creators', genre: 'open-world creator simulation', modes: ['web','mobile','tv','vr','mr'], players: '1-64' }
];

const menu = [
  { id:'holo-gpt', title:'HoloGPT', route:'/' },
  { id:'holo-search', title:'Holo Search', route:'/holo.html#search' },
  { id:'holo-streams', title:'Holo Streams', route:'/platform.html' },
  { id:'holo-music', title:'Holo Music', route:'/holo.html#music' },
  { id:'holo-games', title:'Holo Games', route:'/holo.html#games' },
  { id:'holo-arena', title:'Holo Arena', route:'/holo.html#arena' },
  { id:'holo-rides', title:'Holo Rideshare', route:'/holo.html#rides' },
  { id:'holo-delivery', title:'Holo Delivery', route:'/holo.html#delivery' },
  { id:'holo-market', title:'Holo Marketplace', route:'/platform.html' },
  { id:'holo-academy', title:'Holo Academy', route:'/holo.html#academy' }
];

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return { rides: [], deliveries: [], music: [], sessions: [], arenas: [], casts: [] }; }
}
function writeState(state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}
function id(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
function required(value, name) { if (!String(value || '').trim()) throw new Error(`${name} is required.`); return String(value).trim(); }

router.get('/menu', (req,res) => res.json(menu));
router.get('/games', (req,res) => res.json(games));
router.get('/capabilities', (req,res) => res.json({
  gamepad: true,
  bluetoothNote: 'Standard Bluetooth controllers are read through the browser Gamepad API after the operating system pairs them.',
  casting: ['Google Cast sender integration','screen mirroring fallback','HDMI/USB-C display output'],
  xr: ['WebXR AR','WebXR VR','mixed-reality capable devices'],
  volcanoBridge: 'Cloud profiles, controller mappings, saves and entitlements are designed to migrate to the future Volcano console.'
}));

router.get('/search', (req,res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  const state = readState();
  const items = [...menu, ...games, ...state.music];
  res.json(items.filter(item => JSON.stringify(item).toLowerCase().includes(q)).slice(0,50));
});

router.post('/rides/quote', (req,res,next) => {
  try {
    const pickup = required(req.body.pickup,'pickup'); const dropoff = required(req.body.dropoff,'dropoff');
    const distanceKm = Math.max(1, Number(req.body.distanceKm || 8));
    const amount = Number((3.5 + distanceKm * 1.35).toFixed(2));
    res.json({ id:id('ride_quote'), pickup, dropoff, distanceKm, currency:req.body.currency || 'USD', amount, status:'estimate', requiresLicensedOperator:true });
  } catch(e){ next(e); }
});
router.post('/rides/request', (req,res,next) => {
  try {
    const state=readState(); const ride={ id:id('ride'), pickup:required(req.body.pickup,'pickup'), dropoff:required(req.body.dropoff,'dropoff'), riderId:req.body.riderId || 'demo-user', status:'requested', createdAt:new Date().toISOString(), demo:true };
    state.rides.push(ride); writeState(state); res.status(201).json(ride);
  } catch(e){ next(e); }
});
router.post('/delivery/quote', (req,res,next) => {
  try {
    const pickup=required(req.body.pickup,'pickup'); const dropoff=required(req.body.dropoff,'dropoff'); const weightKg=Math.max(.1,Number(req.body.weightKg || 1));
    res.json({ id:id('delivery_quote'), pickup, dropoff, weightKg, currency:req.body.currency || 'USD', amount:Number((5 + weightKg*1.2).toFixed(2)), status:'estimate', requiresLicensedCourier:true });
  } catch(e){ next(e); }
});
router.post('/delivery/request', (req,res,next) => {
  try { const state=readState(); const delivery={ id:id('delivery'), pickup:required(req.body.pickup,'pickup'), dropoff:required(req.body.dropoff,'dropoff'), status:'requested', createdAt:new Date().toISOString(), demo:true }; state.deliveries.push(delivery); writeState(state); res.status(201).json(delivery); } catch(e){ next(e); }
});

router.get('/music', (req,res) => res.json(readState().music));
router.post('/music', (req,res,next) => {
  try { const state=readState(); const track={ id:id('track'), title:required(req.body.title,'title'), artist:required(req.body.artist || 'TryAMM Creator','artist'), audioUrl:req.body.audioUrl || null, coverUrl:req.body.coverUrl || null, spatialAudio:Boolean(req.body.spatialAudio), status:'draft', createdAt:new Date().toISOString() }; state.music.push(track); writeState(state); res.status(201).json(track); } catch(e){ next(e); }
});

router.post('/games/session', (req,res,next) => {
  try { const game=games.find(g=>g.id===req.body.gameId); if(!game) throw new Error('Unknown game.'); const state=readState(); const session={ id:id('game'), gameId:game.id, platform:req.body.platform || 'web', controllerProfile:req.body.controllerProfile || 'standard', castTarget:req.body.castTarget || null, xrMode:req.body.xrMode || 'flat', status:'ready', demo:true, createdAt:new Date().toISOString() }; state.sessions.push(session); writeState(state); res.status(201).json(session); } catch(e){ next(e); }
});
router.post('/arena/rooms', (req,res,next) => {
  try { const state=readState(); const room={ id:id('arena'), gameId:required(req.body.gameId,'gameId'), title:req.body.title || 'TryAMM Holo Arena', maxPlayers:Math.min(64,Math.max(2,Number(req.body.maxPlayers || 8))), spectatorMode:true, tournament:Boolean(req.body.tournament), status:'open', createdAt:new Date().toISOString() }; state.arenas.push(room); writeState(state); res.status(201).json(room); } catch(e){ next(e); }
});
router.post('/controllers/profile', (req,res) => res.status(201).json({ id:id('controller'), name:req.body.name || 'Standard Bluetooth Controller', mapping:req.body.mapping || 'standard', deadzone:Number(req.body.deadzone || .12), vibration:Boolean(req.body.vibration), accessibility:req.body.accessibility || { oneHanded:false }, saved:false }));
router.post('/cast/session', (req,res) => { const state=readState(); const cast={ id:id('cast'), target:req.body.target || 'tv', mode:req.body.mode || 'sender-receiver', contentId:req.body.contentId || null, status:'ready-for-client-connection', createdAt:new Date().toISOString() }; state.casts.push(cast); writeState(state); res.status(201).json(cast); });
router.post('/xr/session', (req,res) => res.status(201).json({ id:id('xr'), mode:['ar','vr','mr'].includes(req.body.mode)?req.body.mode:'ar', experience:req.body.experience || 'holo-arena', status:'capability-check-required', fallback:'3d-flat-screen', createdAt:new Date().toISOString() }));

module.exports = { holoRouter: router, games, menu };
