const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { id, now } = require('../../shared/utils');
const { loadJson, saveJson } = require('../../shared/store');
const { ok, fail, num } = require('../../shared/http');
const { getConfig } = require('../../shared/config');

const USERS_FILE = 'data/users.json';
const WALLETS_FILE = 'data/wallets.json';

function getUsers() {
  return loadJson(USERS_FILE, {});
}
function saveUsers(users) {
  saveJson(USERS_FILE, users);
}
function getWallets() {
  return loadJson(WALLETS_FILE, {});
}
function saveWallets(wallets) {
  saveJson(WALLETS_FILE, wallets);
}

exports.register = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const age = num(req.body.age, 0);
  const role = String(req.body.role || 'creator').trim();

  if (!email) return fail(res, 400, 'email_required');
  if (!password || password.length < 6) return fail(res, 400, 'password_too_short');

  const users = getUsers();
  const exists = Object.values(users).find(u => u.email === email);
  if (exists) return fail(res, 409, 'email_exists', { userId: exists.userId });

  const userId = id();
  const passwordHash = await bcrypt.hash(password, 10);

  users[userId] = {
    userId,
    email,
    passwordHash,
    age,
    parentId: req.body.parentId || null,
    verified: false,
    trustScore: 0,
    role,
    status: 'active',
    createdAt: now()
  };
  saveUsers(users);

  const wallets = getWallets();
  if (!wallets[userId]) {
    wallets[userId] = {
      userId,
      balance: 0,
      credits: 0,
      pending: 0,
      lifetimeEarned: 0,
      platformFeesPaid: 0,
      updatedAt: now()
    };
    saveWallets(wallets);
  }

  return ok(res, { userId, email, role });
};

exports.login = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return fail(res, 400, 'email_password_required');

  const users = getUsers();
  const user = Object.values(users).find(u => u.email === email);
  if (!user) return fail(res, 404, 'user_not_found');

  if (!user.passwordHash) return fail(res, 400, 'legacy_user_reset_needed');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return fail(res, 401, 'invalid_credentials');

  const cfg = getConfig();
  const token = jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    cfg.jwtSecret,
    { expiresIn: '7d' }
  );

  return ok(res, {
    token,
    user: {
      userId: user.userId,
      email: user.email,
      role: user.role,
      verified: !!user.verified,
      trustScore: user.trustScore || 0
    }
  });
};
