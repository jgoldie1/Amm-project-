const fs = require('fs');
const path = require('path');

function ensureFile(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
  }
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function attachJoinApi(app) {
  const file = path.join('data', 'referrals', 'joins.json');
  ensureFile(file, { joins: [] });

  app.post('/join-api', (req, res) => {
    const username = String(req.body?.username || '').trim();
    const referrer = String(req.body?.referrer || '').trim();

    if (!username) {
      return res.status(400).json({ ok: false, error: 'missing_username' });
    }

    const data = readJson(file, { joins: [] });
    data.joins.push({
      username,
      referrer,
      createdAt: new Date().toISOString()
    });
    writeJson(file, data);

    res.json({ ok: true, username, referrer });
  });
}

module.exports = { attachJoinApi };
