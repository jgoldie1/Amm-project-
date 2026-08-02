'use strict';
const crypto = require('crypto');

function b64(value) { return Buffer.from(JSON.stringify(value)).toString('base64url'); }
function sign(value, secret) { return crypto.createHmac('sha256', secret).update(value).digest('base64url'); }
function issueJwt(payload, secret, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + ttlSeconds, jti: crypto.randomUUID() };
  const unsigned = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(body)}`;
  return `${unsigned}.${sign(unsigned, secret)}`;
}
function verifyJwt(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = sign(unsigned, secret);
  const a = Buffer.from(expected), b = Buffer.from(parts[2]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('Invalid token signature');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}

module.exports = function registerProductionControlPlane({ app, auth, admin, clean, id, getStore, saveStore, persistence }) {
  const store = getStore();
  for (const key of ['wallets','walletTransactions','refreshTokens','payoutJobs','monitoringEvents','rateLimitEvents']) {
    if (!Array.isArray(store[key])) store[key] = [];
  }
  const limits = new Map();
  const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'development-only-change-me';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || `${jwtSecret}:refresh`;

  function walletFor(userId, currency = 'NGN') {
    let wallet = store.wallets.find(w => w.userId === userId && w.currency === currency);
    if (!wallet) {
      wallet = { id: id('wal'), userId, currency, availableMinor: 0, pendingMinor: 0, reserveMinor: 0, lifetimeEarnedMinor: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      store.wallets.push(wallet);
    }
    return wallet;
  }
  function rateLimit(name, max, windowMs) {
    return (req, res, next) => {
      const key = `${name}:${req.user?.id || req.ip || 'unknown'}`;
      const now = Date.now();
      const state = limits.get(key) || { count: 0, resetAt: now + windowMs };
      if (state.resetAt <= now) { state.count = 0; state.resetAt = now + windowMs; }
      state.count += 1; limits.set(key, state);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - state.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(state.resetAt / 1000));
      if (state.count > max) {
        store.rateLimitEvents.push({ id: id('rl'), key, route: req.path, createdAt: new Date().toISOString() });
        return res.status(429).json({ error: 'Too many requests', retryAfterSeconds: Math.ceil((state.resetAt - now) / 1000) });
      }
      next();
    };
  }
  function recordMetric(type, data = {}) {
    const event = { id: id('mon'), type, data, createdAt: new Date().toISOString() };
    store.monitoringEvents.push(event);
    if (store.monitoringEvents.length > 5000) store.monitoringEvents.splice(0, store.monitoringEvents.length - 5000);
    return event;
  }

  app.post('/api/auth/token/issue', auth, rateLimit('token-issue', 20, 60000), async (req, res) => {
    const accessToken = issueJwt({ sub: req.user.id, role: req.user.role, email: req.user.email }, jwtSecret, 900);
    const refreshToken = issueJwt({ sub: req.user.id, type: 'refresh' }, refreshSecret, 60 * 60 * 24 * 30);
    const decoded = verifyJwt(refreshToken, refreshSecret);
    store.refreshTokens.push({ id: decoded.jti, userId: req.user.id, tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'), expiresAt: new Date(decoded.exp * 1000).toISOString(), revokedAt: null, createdAt: new Date().toISOString() });
    await saveStore();
    res.json({ accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900 });
  });

  app.post('/api/auth/token/refresh', rateLimit('token-refresh', 30, 60000), async (req, res) => {
    try {
      const refreshToken = String(req.body.refreshToken || '');
      const decoded = verifyJwt(refreshToken, refreshSecret);
      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const record = store.refreshTokens.find(r => r.id === decoded.jti && r.tokenHash === hash && !r.revokedAt);
      if (!record) return res.status(401).json({ error: 'Refresh token revoked or unknown' });
      record.revokedAt = new Date().toISOString();
      const user = store.users.find(u => u.id === decoded.sub);
      if (!user) return res.status(401).json({ error: 'Account not found' });
      const accessToken = issueJwt({ sub: user.id, role: user.role, email: user.email }, jwtSecret, 900);
      const nextRefresh = issueJwt({ sub: user.id, type: 'refresh' }, refreshSecret, 60 * 60 * 24 * 30);
      const nextDecoded = verifyJwt(nextRefresh, refreshSecret);
      store.refreshTokens.push({ id: nextDecoded.jti, userId: user.id, tokenHash: crypto.createHash('sha256').update(nextRefresh).digest('hex'), expiresAt: new Date(nextDecoded.exp * 1000).toISOString(), revokedAt: null, createdAt: new Date().toISOString() });
      await saveStore();
      res.json({ accessToken, refreshToken: nextRefresh, tokenType: 'Bearer', expiresIn: 900 });
    } catch (error) { res.status(401).json({ error: error.message }); }
  });

  app.get('/api/wallet', auth, async (req, res) => {
    const wallet = walletFor(req.user.id, clean(req.query.currency, 8).toUpperCase() || 'NGN');
    await saveStore();
    res.json({ wallet, transactions: store.walletTransactions.filter(t => t.walletId === wallet.id).slice(-100).reverse() });
  });

  app.post('/api/admin/wallets/:userId/adjust', auth, admin, rateLimit('wallet-adjust', 20, 60000), async (req, res) => {
    const currency = clean(req.body.currency, 8).toUpperCase() || 'NGN';
    const amountMinor = Math.trunc(Number(req.body.amountMinor || 0));
    if (!Number.isFinite(amountMinor) || amountMinor === 0) return res.status(400).json({ error: 'Non-zero integer amountMinor required' });
    const wallet = walletFor(req.params.userId, currency);
    if (wallet.availableMinor + amountMinor < 0) return res.status(409).json({ error: 'Adjustment would create a negative available balance' });
    wallet.availableMinor += amountMinor; wallet.updatedAt = new Date().toISOString();
    const transaction = { id: id('wtx'), walletId: wallet.id, userId: wallet.userId, currency, amountMinor, kind: 'admin-adjustment', reference: clean(req.body.reference, 160) || id('ref'), status: 'posted', metadata: { reason: clean(req.body.reason, 500), actorUserId: req.user.id }, createdAt: new Date().toISOString() };
    store.walletTransactions.push(transaction); await saveStore();
    res.status(201).json({ wallet, transaction });
  });

  app.post('/api/payouts/automation/run', auth, admin, rateLimit('payout-run', 5, 60000), async (_req, res) => {
    const eligible = store.payouts.filter(p => p.status === 'eligibility_review');
    const jobs = [];
    for (const payout of eligible) {
      const existing = store.payoutJobs.find(j => j.payoutId === payout.id && !['failed','cancelled'].includes(j.status));
      if (existing) { jobs.push(existing); continue; }
      const wallet = walletFor(payout.userId, payout.currency);
      const job = { id: id('pjob'), payoutId: payout.id, userId: payout.userId, provider: payout.provider, amountMinor: payout.amountMinor, currency: payout.currency, status: 'manual-approval-required', attempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (wallet.availableMinor < payout.amountMinor) { job.status = 'blocked-insufficient-funds'; }
      store.payoutJobs.push(job); jobs.push(job);
    }
    await saveStore(); recordMetric('payout.automation.run', { eligible: eligible.length, jobs: jobs.length });
    res.json({ jobs, productionSubmissionEnabled: false, reason: 'Recipient verification and provider production approval are required.' });
  });

  app.get('/api/media/ice-servers', auth, rateLimit('ice-config', 60, 60000), (_req, res) => {
    const servers = [];
    if (process.env.STUN_URL) servers.push({ urls: process.env.STUN_URL.split(',').map(v => v.trim()) });
    if (process.env.TURN_URL && process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) servers.push({ urls: process.env.TURN_URL.split(',').map(v => v.trim()), username: process.env.TURN_USERNAME, credential: process.env.TURN_CREDENTIAL });
    res.json({ iceServers: servers, configured: servers.length > 0, liveKitConfigured: Boolean(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) });
  });

  app.get('/api/africa/providers', (_req, res) => res.json({
    providers: [
      { id: 'paystack', markets: ['NG','GH','ZA','KE'], configured: Boolean(process.env.PAYSTACK_SECRET_KEY), state: 'implemented-nigeria' },
      { id: 'flutterwave', markets: ['NG','GH','KE','UG','TZ','ZA','RW'], configured: Boolean(process.env.FLUTTERWAVE_SECRET_KEY), state: 'implemented-nigeria' },
      { id: 'm-pesa', markets: ['KE','TZ'], configured: Boolean(process.env.MPESA_CONSUMER_KEY), state: 'adapter-planned' },
      { id: 'monnify', markets: ['NG'], configured: Boolean(process.env.MONNIFY_API_KEY), state: 'adapter-planned' },
      { id: 'interswitch', markets: ['NG','KE','UG'], configured: Boolean(process.env.INTERSWITCH_CLIENT_ID), state: 'adapter-planned' }
    ], productionEnabled: false
  }));

  app.get('/api/creator/dashboard', auth, async (req, res) => {
    const wallet = walletFor(req.user.id, 'NGN'); await saveStore();
    res.json({ user: { id: req.user.id, displayName: req.user.displayName, isCreator: req.user.isCreator }, wallet, payouts: store.payouts.filter(p => p.userId === req.user.id), receipts: (store.receipts || []).filter(r => r.userId === req.user.id), entitlements: (store.entitlements || []).filter(e => e.userId === req.user.id), liveRooms: (store.rooms || []).filter(r => r.hostId === req.user.id), tracks: (store.tracks || []).filter(t => t.ownerId === req.user.id || t.creatorId === req.user.id) });
  });

  app.get('/api/admin/control-center', auth, admin, (_req, res) => {
    const now = Date.now();
    const lastHour = store.monitoringEvents.filter(e => Date.parse(e.createdAt) > now - 3600000);
    res.json({
      releaseTruth: 'verified-pre-alpha',
      users: store.users.length,
      liveRooms: store.rooms.filter(r => r.status === 'live').length,
      paymentIntents: (store.paymentIntents || []).length,
      pendingSettlements: (store.settlements || []).filter(s => s.status !== 'reconciled').length,
      pendingPayoutJobs: store.payoutJobs.filter(j => !['paid','cancelled'].includes(j.status)).length,
      rateLimitEvents: store.rateLimitEvents.length,
      monitoringEventsLastHour: lastHour.length,
      redisConfigured: Boolean(process.env.REDIS_URL),
      turnConfigured: Boolean(process.env.TURN_URL && process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL),
      alertsConfigured: Boolean(process.env.ALERT_WEBHOOK_URL || process.env.SENTRY_DSN),
      productionPaymentsEnabled: false
    });
  });

  app.post('/api/monitoring/events', auth, rateLimit('monitor-event', 120, 60000), async (req, res) => {
    const event = recordMetric(clean(req.body.type, 100) || 'client.event', { userId: req.user.id, route: clean(req.body.route, 200), detail: clean(req.body.detail, 1000) });
    await saveStore(); res.status(202).json({ eventId: event.id });
  });

  return { issueJwt, verifyJwt, rateLimit, walletFor, recordMetric };
};
