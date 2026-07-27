'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Server } = require('socket.io');
const { OAuth2Client } = require('google-auth-library');

const PORT = Number(process.env.PORT || 10000);
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'theammonmiverse@gmail.com').toLowerCase();
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'store.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS || 2500);
const GOOGLE_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID || '').trim();
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

function initialStore() { return { users: [], sessions: [], rooms: [], purchases: [], reports: [], events: [] }; }
function readStore() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
      const fresh = initialStore();
      fs.writeFileSync(DATA_FILE, JSON.stringify(fresh, null, 2));
      return fresh;
    }
    return { ...initialStore(), ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
  } catch (error) {
    console.error('Store read failed:', error);
    return initialStore();
  }
}
let store = readStore();
let writeQueue = Promise.resolve();
function saveStore() {
  writeQueue = writeQueue.then(async () => {
    const temp = `${DATA_FILE}.tmp`;
    await fs.promises.writeFile(temp, JSON.stringify(store, null, 2));
    await fs.promises.rename(temp, DATA_FILE);
  }).catch((error) => console.error('Store write failed:', error));
  return writeQueue;
}

const id = (prefix) => `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
const clean = (value, max = 120) => String(value || '').trim().slice(0, max);
const publicUser = (user) => user && ({ id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl || '', role: user.role, isCreator: user.isCreator, balanceCents: user.balanceCents || 0, authProvider: user.authProvider || 'password', createdAt: user.createdAt });
function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function passwordValid(password, stored) {
  try {
    const [salt, hash] = String(stored || '').split(':');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(passwordHash(password, salt).split(':')[1], 'hex'));
  } catch { return false; }
}
function bearer(req) { const value = req.headers.authorization || ''; return value.startsWith('Bearer ') ? value.slice(7) : ''; }
function userFromToken(token) {
  const session = store.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  return session && store.users.find((u) => u.id === session.userId);
}
function auth(req, res, next) {
  const user = userFromToken(bearer(req));
  if (!user) return res.status(401).json({ error: 'Sign in required' });
  req.user = user; next();
}
function admin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}
function createSession(userId) {
  store.sessions = store.sessions.filter((s) => s.expiresAt > Date.now());
  const session = { token: crypto.randomBytes(32).toString('hex'), userId, expiresAt: Date.now() + SESSION_TTL_MS };
  store.sessions.push(session); return session;
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'TryAMM Creator Live', version: '2.1.0', users: store.users.length, rooms: store.rooms.filter((r) => r.status === 'live').length, stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY), googleLoginConfigured: Boolean(GOOGLE_CLIENT_ID), time: new Date().toISOString() }));
app.get('/api/auth/google/config', (_req, res) => res.json({ enabled: Boolean(GOOGLE_CLIENT_ID), clientId: GOOGLE_CLIENT_ID || null }));
app.post('/api/auth/google', async (req, res, next) => {
  try {
    if (!googleClient) return res.status(503).json({ error: 'Google login is not configured', code: 'GOOGLE_LOGIN_NOT_CONFIGURED' });
    const credential = clean(req.body.credential, 5000);
    if (!credential) return res.status(400).json({ error: 'Google credential is required' });
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email || payload.email_verified !== true) return res.status(401).json({ error: 'Google account could not be verified' });
    const email = payload.email.toLowerCase();
    let user = store.users.find((u) => u.googleSub === payload.sub || u.email === email);
    if (!user) {
      user = { id: id('usr'), email, displayName: clean(payload.name || email.split('@')[0], 60), avatarUrl: clean(payload.picture, 500), googleSub: payload.sub, passwordHash: null, authProvider: 'google', role: email === ADMIN_EMAIL ? 'admin' : 'member', isCreator: false, balanceCents: 0, createdAt: new Date().toISOString() };
      store.users.push(user);
    } else {
      user.googleSub = payload.sub;
      user.authProvider = user.passwordHash ? 'password+google' : 'google';
      user.avatarUrl = clean(payload.picture, 500) || user.avatarUrl || '';
      if (!user.displayName) user.displayName = clean(payload.name || email.split('@')[0], 60);
    }
    const session = createSession(user.id);
    store.events.push({ id: id('evt'), type: 'google_login', userId: user.id, createdAt: new Date().toISOString() });
    await saveStore();
    res.json({ token: session.token, user: publicUser(user) });
  } catch (error) {
    if (/Token used too late|Invalid token|Wrong recipient|audience/i.test(error.message || '')) return res.status(401).json({ error: 'Google sign-in expired or was invalid. Please try again.' });
    next(error);
  }
});

app.post('/api/auth/register', async (req, res) => {
  const email = clean(req.body.email, 200).toLowerCase();
  const displayName = clean(req.body.displayName, 60);
  const password = String(req.body.password || '');
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
  if (displayName.length < 2) return res.status(400).json({ error: 'Display name is required' });
  if (password.length < 10) return res.status(400).json({ error: 'Password must be at least 10 characters' });
  if (store.users.some((u) => u.email === email)) return res.status(409).json({ error: 'Account already exists. Sign in with Google or your password.' });
  const user = { id: id('usr'), email, displayName, passwordHash: passwordHash(password), authProvider: 'password', role: email === ADMIN_EMAIL ? 'admin' : 'member', isCreator: false, balanceCents: 0, createdAt: new Date().toISOString() };
  store.users.push(user);
  const session = createSession(user.id);
  await saveStore();
  res.status(201).json({ token: session.token, user: publicUser(user) });
});
app.post('/api/auth/login', async (req, res) => {
  const email = clean(req.body.email, 200).toLowerCase();
  const user = store.users.find((u) => u.email === email);
  if (!user || !passwordValid(String(req.body.password || ''), user.passwordHash)) return res.status(401).json({ error: user?.googleSub && !user?.passwordHash ? 'This account uses Google sign-in' : 'Invalid email or password' });
  const session = createSession(user.id); await saveStore(); res.json({ token: session.token, user: publicUser(user) });
});
app.get('/api/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));
app.post('/api/auth/logout', auth, async (req, res) => { store.sessions = store.sessions.filter((s) => s.token !== bearer(req)); await saveStore(); res.json({ ok: true }); });

app.post('/api/creator/apply', auth, async (req, res) => {
  req.user.isCreator = true;
  req.user.creatorBio = clean(req.body.bio, 500);
  req.user.creatorCategory = clean(req.body.category, 80) || 'Creator';
  req.user.creatorApprovedAt = new Date().toISOString();
  await saveStore(); res.json({ user: publicUser(req.user), message: 'Creator tools activated' });
});
app.get('/api/rooms', (_req, res) => {
  const rooms = store.rooms.filter((r) => r.status === 'live').map((r) => ({ id: r.id, title: r.title, category: r.category, hostName: r.hostName, viewerCount: io.sockets.adapter.rooms.get(`room:${r.id}`)?.size || 0, ticketPriceCents: r.ticketPriceCents, startedAt: r.startedAt }));
  res.json({ rooms });
});
app.post('/api/rooms', auth, async (req, res) => {
  if (!req.user.isCreator && req.user.role !== 'admin') return res.status(403).json({ error: 'Activate creator tools first' });
  const room = { id: id('room'), hostId: req.user.id, hostName: req.user.displayName, title: clean(req.body.title, 100) || `${req.user.displayName} Live`, category: clean(req.body.category, 60) || 'Community', ticketPriceCents: Math.max(0, Math.min(100000, Number(req.body.ticketPriceCents || 0))), status: 'live', startedAt: new Date().toISOString(), endedAt: null, hearts: 0, giftsCents: 0 };
  store.rooms.push(room); await saveStore(); io.emit('rooms:changed'); res.status(201).json({ room });
});
app.post('/api/rooms/:roomId/end', auth, async (req, res) => {
  const room = store.rooms.find((r) => r.id === req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.hostId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not permitted' });
  room.status = 'ended'; room.endedAt = new Date().toISOString(); await saveStore(); io.to(`room:${room.id}`).emit('room:ended'); io.emit('rooms:changed'); res.json({ ok: true });
});
app.post('/api/rooms/:roomId/heart', auth, async (req, res) => {
  const room = store.rooms.find((r) => r.id === req.params.roomId && r.status === 'live');
  if (!room) return res.status(404).json({ error: 'Live room not found' });
  room.hearts += 1; await saveStore(); io.to(`room:${room.id}`).emit('heart', room.hearts); res.json({ hearts: room.hearts });
});

const GIFT_CATALOG = { applause: 99, rose: 199, crown: 499, lion: 999, kingdom: 2499 };
app.get('/api/gifts', (_req, res) => res.json({ gifts: GIFT_CATALOG }));
app.post('/api/rooms/:roomId/gifts', auth, async (req, res) => {
  const room = store.rooms.find((r) => r.id === req.params.roomId && r.status === 'live');
  if (!room) return res.status(404).json({ error: 'Live room not found' });
  const gift = clean(req.body.gift, 30).toLowerCase(); const amountCents = GIFT_CATALOG[gift];
  if (!amountCents) return res.status(400).json({ error: 'Unknown gift' });
  const host = store.users.find((u) => u.id === room.hostId);
  const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_BPS / 10000);
  const creatorCents = amountCents - platformFeeCents;
  if (host) host.balanceCents = (host.balanceCents || 0) + creatorCents;
  room.giftsCents += amountCents;
  const purchase = { id: id('pay'), kind: 'gift', status: 'recorded', buyerId: req.user.id, creatorId: room.hostId, roomId: room.id, item: gift, amountCents, platformFeeCents, creatorCents, createdAt: new Date().toISOString() };
  store.purchases.push(purchase); await saveStore();
  io.to(`room:${room.id}`).emit('gift', { gift, from: req.user.displayName, amountCents, total: room.giftsCents });
  res.status(201).json({ purchase });
});
app.post('/api/checkout', auth, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Stripe is not configured yet', code: 'STRIPE_NOT_CONFIGURED', required: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'APP_URL'] });
  const Stripe = require('stripe'); const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const room = store.rooms.find((r) => r.id === clean(req.body.roomId, 80));
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const amount = room.ticketPriceCents || 1000;
  const checkout = await stripe.checkout.sessions.create({ mode: 'payment', customer_email: req.user.email, line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: amount, product_data: { name: `TryAMM: ${room.title}` } } }], metadata: { roomId: room.id, buyerId: req.user.id, creatorId: room.hostId }, success_url: `${APP_URL}/?payment=success`, cancel_url: `${APP_URL}/?payment=cancelled` });
  res.json({ url: checkout.url });
});
app.get('/api/admin/summary', auth, admin, (_req, res) => {
  const gross = store.purchases.reduce((sum, p) => sum + p.amountCents, 0);
  const fees = store.purchases.reduce((sum, p) => sum + p.platformFeeCents, 0);
  res.json({ users: store.users.length, creators: store.users.filter((u) => u.isCreator).length, liveRooms: store.rooms.filter((r) => r.status === 'live').length, purchases: store.purchases.length, grossCents: gross, platformRevenueCents: fees, reports: store.reports.filter((r) => r.status === 'open').length });
});
app.post('/api/reports', auth, async (req, res) => {
  const report = { id: id('rpt'), reporterId: req.user.id, roomId: clean(req.body.roomId, 80), reason: clean(req.body.reason, 300), status: 'open', createdAt: new Date().toISOString() };
  if (!report.reason) return res.status(400).json({ error: 'Reason is required' });
  store.reports.push(report); await saveStore(); res.status(201).json({ report });
});

io.use((socket, next) => { const user = userFromToken(socket.handshake.auth?.token || ''); if (!user) return next(new Error('unauthorized')); socket.user = user; next(); });
io.on('connection', (socket) => {
  socket.on('room:join', ({ roomId }) => {
    const room = store.rooms.find((r) => r.id === roomId && r.status === 'live');
    if (!room) return socket.emit('error:message', 'Room is unavailable');
    socket.join(`room:${roomId}`); socket.data.roomId = roomId;
    socket.to(`room:${roomId}`).emit('peer:joined', { socketId: socket.id, name: socket.user.displayName });
    io.to(`room:${roomId}`).emit('viewer:count', io.sockets.adapter.rooms.get(`room:${roomId}`)?.size || 0);
  });
  socket.on('chat', ({ roomId, message }) => { const text = clean(message, 500); if (text) io.to(`room:${roomId}`).emit('chat', { id: id('msg'), from: socket.user.displayName, text, at: Date.now() }); });
  socket.on('webrtc:offer', ({ to, offer }) => io.to(to).emit('webrtc:offer', { from: socket.id, offer }));
  socket.on('webrtc:answer', ({ to, answer }) => io.to(to).emit('webrtc:answer', { from: socket.id, answer }));
  socket.on('webrtc:ice', ({ to, candidate }) => io.to(to).emit('webrtc:ice', { from: socket.id, candidate }));
  socket.on('disconnect', () => { const roomId = socket.data.roomId; if (roomId) io.to(`room:${roomId}`).emit('viewer:count', io.sockets.adapter.rooms.get(`room:${roomId}`)?.size || 0); });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((error, _req, res, _next) => { console.error(error); res.status(error.status || 500).json({ error: error.message || 'Server error' }); });
server.listen(PORT, () => console.log(`TryAMM running on port ${PORT}`));
