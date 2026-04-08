const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const auth = require('../services/auth');
const identity = require('../services/identity');
const wallet = require('../services/wallet');
const music = require('../services/music');
const moderation = require('../services/moderation');
const ads = require('../services/ads');
const ai = require('../services/ai');
const intelligence = require('../services/intelligence');
const { getConfig } = require('../shared/config');
const { requireAdmin, requireUser, requireSelfParam } = require('../shared/auth');
const { loadJson } = require('../shared/store');

const app = express();
const cfg = getConfig();

app.use(bodyParser.json({ limit: '2mb' }));

function safeCount(filePath, fallback) {
  const data = loadJson(filePath, fallback);
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === 'object') return Object.keys(data).length;
  return 0;
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'gateway',
    appName: cfg.appName,
    environment: cfg.environment,
    time: new Date().toISOString()
  });
});

app.get('/health/detail', (_req, res) => {
  res.json({
    ok: true,
    checks: { config: true, gateway: true, auth: true, intelligence: true, audit: true },
    time: new Date().toISOString()
  });
});

app.get('/metrics', requireAdmin, (_req, res) => {
  res.json({
    ok: true,
    counts: {
      users: safeCount('data/users.json', {}),
      wallets: safeCount('data/wallets.json', {}),
      tracks: safeCount('data/tracks.json', {}),
      streams: safeCount('data/streams.json', []),
      reports: safeCount('data/reports.json', []),
      dmca: safeCount('data/dmca.json', []),
      appeals: safeCount('data/appeals.json', []),
      ads: safeCount('data/ads.json', []),
      transactions: safeCount('data/transactions.json', []),
      creatorMemory: safeCount('data/creator_memory.json', {})
    },
    time: new Date().toISOString()
  });
});

app.get('/admin/log-tail', requireAdmin, (_req, res) => {
  const fs = require('fs');
  const filePath = 'logs/gateway.log';
  try {
    const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    const lines = raw.trim() ? raw.trim().split('\n').slice(-50) : [];
    res.json({ ok: true, lines });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'log_read_failed' });
  }
});

app.get('/admin/audit-tail', requireAdmin, (_req, res) => {
  const fs = require('fs');
  const filePath = 'logs/audit.log';
  try {
    const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    const lines = raw.trim() ? raw.trim().split('\n').slice(-50) : [];
    res.json({ ok: true, lines });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'audit_read_failed' });
  }
});

app.post('/auth/register', auth.register);
app.post('/auth/login', auth.login);

app.post('/identity/verify', requireAdmin, identity.verify);
app.get('/identity/:userId', requireUser, requireSelfParam('userId'), identity.getUser);
app.get('/me', requireUser, (req, res) => {
  req.params.userId = req.user.userId;
  return identity.getUser(req, res);
});

app.post('/wallet/deposit', requireAdmin, wallet.deposit);
app.post('/wallet/transfer', requireUser, wallet.transfer);
app.post('/wallet/platform-split', requireAdmin, wallet.platformSplit);
app.post('/wallet/approve-payout', requireAdmin, wallet.approvePayout);
app.get('/wallet/:userId', requireUser, requireSelfParam('userId'), wallet.getWallet);
app.get('/my-wallet', requireUser, (req, res) => {
  req.params.userId = req.user.userId;
  return wallet.getWallet(req, res);
});

app.post('/music/upload', requireUser, music.upload);
app.post('/music/stream', music.streamEvent);
app.get('/my-tracks', requireUser, music.myTracks);

app.post('/moderation/report', moderation.report);
app.post('/moderation/dmca', moderation.dmcaNotice);
app.post('/moderation/appeal', moderation.appeal);

app.post('/ads/impression', ads.impression);
app.get('/admin/ads-summary', requireAdmin, ads.summary);

app.post('/ai/evaluate-stream', ai.evaluateStream);

app.get('/intelligence/my-insights', requireUser, intelligence.myInsights);
app.post('/intelligence/save-note', requireUser, intelligence.saveNote);
app.get('/intelligence/my-notes', requireUser, intelligence.myNotes);
app.get('/my-transactions', requireUser, intelligence.myTransactions);

app.get('/admin/users', requireAdmin, identity.listUsers);
app.get('/admin/wallet-summary', requireAdmin, wallet.summary);
app.get('/admin/tracks', requireAdmin, music.listTracks);
app.get('/admin/stream-summary', requireAdmin, music.streamSummary);
app.get('/admin/mod-summary', requireAdmin, moderation.summary);
app.get('/admin/reports', requireAdmin, moderation.listReports);
app.post('/admin/report-status', requireAdmin, moderation.updateReportStatus);

app.use('/admin-ui', express.static(path.join(__dirname, '..', 'public', 'admin')));
app.use('/creator-ui', express.static(path.join(__dirname, '..', 'public', 'creator')));
app.use('/home-ui', express.static(path.join(__dirname, '..', 'public', 'home')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home', 'index.html'));
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'index.html'));
});

app.get('/creator', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'creator', 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error('UNHANDLED_ERROR', err);
  res.status(500).json({ ok: false, error: 'internal_server_error' });
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'not_found' });
});

const PORT = process.env.PORT || cfg.port || 4000;
app.listen(PORT, () => console.log(`AAM Gateway on :${PORT}`));
