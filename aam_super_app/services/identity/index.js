const { loadJson, saveJson } = require('../../shared/store');
const { ok, fail, num } = require('../../shared/http');
const { now } = require('../../shared/utils');
const { appendAudit } = require('../../shared/audit');

const DB_FILE = 'data/users.json';

function getUsers() {
  return loadJson(DB_FILE, {});
}
function saveUsers(users) {
  saveJson(DB_FILE, users);
}
function safeUser(user) {
  const clean = { ...user };
  delete clean.passwordHash;
  return clean;
}

exports.verify = (req, res) => {
  const userId = String(req.body.userId || '').trim();
  if (!userId) return fail(res, 400, 'userId_required');

  const users = getUsers();
  const user = users[userId];
  if (!user) return fail(res, 404, 'user_not_found');

  if (!user.verified) {
    user.verified = true;
    user.trustScore = num(user.trustScore, 0) + 10;
    user.verifiedAt = now();
    saveUsers(users);
  }

  appendAudit('identity_verify', { userId });

  return ok(res, {
    verified: true,
    trustScore: user.trustScore,
    user: safeUser(user)
  });
};

exports.getUser = (req, res) => {
  const users = getUsers();
  const user = users[req.params.userId];
  if (!user) return fail(res, 404, 'user_not_found');
  return ok(res, { user: safeUser(user) });
};

exports.listUsers = (_req, res) => {
  const users = Object.values(getUsers()).map(safeUser);
  return ok(res, { count: users.length, users });
};
