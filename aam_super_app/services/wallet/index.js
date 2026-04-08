const { loadJson, saveJson } = require('../../shared/store');
const { ok, fail, num } = require('../../shared/http');
const { now } = require('../../shared/utils');
const { getConfig } = require('../../shared/config');
const { appendAudit } = require('../../shared/audit');

const DB_FILE = 'data/wallets.json';
const TX_FILE = 'data/transactions.json';

function getWallets() {
  return loadJson(DB_FILE, {});
}
function saveWallets(wallets) {
  saveJson(DB_FILE, wallets);
}
function getTxs() {
  return loadJson(TX_FILE, []);
}
function saveTxs(rows) {
  saveJson(TX_FILE, rows);
}
function ensure(userId) {
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
  return wallets[userId];
}
function addTx(type, payload) {
  const rows = getTxs();
  rows.push({ type, ...payload, createdAt: now() });
  saveTxs(rows);
}

exports.deposit = (req, res) => {
  const userId = String(req.body.userId || '').trim();
  const amount = num(req.body.amount, 0);
  if (!userId) return fail(res, 400, 'userId_required');
  if (amount <= 0) return fail(res, 400, 'invalid_amount');

  const wallets = getWallets();
  if (!wallets[userId]) wallets[userId] = ensure(userId);
  wallets[userId].balance += amount;
  wallets[userId].updatedAt = now();
  saveWallets(wallets);

  addTx('deposit', { userId, amount });
  appendAudit('wallet_deposit', { userId, amount });

  return ok(res, { wallet: wallets[userId] });
};

exports.transfer = (req, res) => {
  const from = String(req.body.from || '').trim();
  const to = String(req.body.to || '').trim();
  const amount = num(req.body.amount, 0);

  if (!from || !to) return fail(res, 400, 'from_to_required');
  if (amount <= 0) return fail(res, 400, 'invalid_amount');
  if (req.user && req.user.userId !== from) return fail(res, 403, 'from_mismatch');

  const wallets = getWallets();
  if (!wallets[from]) wallets[from] = ensure(from);
  if (!wallets[to]) wallets[to] = ensure(to);

  if (wallets[from].balance < amount) return fail(res, 400, 'insufficient_balance');

  wallets[from].balance -= amount;
  wallets[to].balance += amount;
  wallets[from].updatedAt = now();
  wallets[to].updatedAt = now();
  saveWallets(wallets);

  addTx('transfer', { fromUser: from, toUser: to, amount });
  appendAudit('wallet_transfer', { fromUser: from, toUser: to, amount });

  return ok(res, { from: wallets[from], to: wallets[to] });
};

exports.platformSplit = (req, res) => {
  const creatorId = String(req.body.creatorId || '').trim();
  const gross = num(req.body.gross, 0);
  const cfg = getConfig();
  const platformPct = num(req.body.platformPct, cfg.platformFeePercent);

  if (!creatorId) return fail(res, 400, 'creatorId_required');
  if (gross <= 0) return fail(res, 400, 'invalid_gross');

  const wallets = getWallets();
  if (!wallets[creatorId]) wallets[creatorId] = ensure(creatorId);

  const fee = +(gross * (platformPct / 100)).toFixed(2);
  const net = +(gross - fee).toFixed(2);

  wallets[creatorId].pending += net;
  wallets[creatorId].lifetimeEarned += net;
  wallets[creatorId].platformFeesPaid += fee;
  wallets[creatorId].updatedAt = now();
  saveWallets(wallets);

  addTx('platform_split', { creatorId, gross, fee, net, platformPct });
  appendAudit('wallet_platform_split', { creatorId, gross, fee, net, platformPct });

  return ok(res, { gross, platformPct, fee, net, wallet: wallets[creatorId] });
};

exports.approvePayout = (req, res) => {
  const userId = String(req.body.userId || '').trim();
  const amount = num(req.body.amount, 0);
  if (!userId) return fail(res, 400, 'userId_required');
  if (amount <= 0) return fail(res, 400, 'invalid_amount');

  const wallets = getWallets();
  if (!wallets[userId]) wallets[userId] = ensure(userId);

  if (wallets[userId].pending < amount) {
    return fail(res, 400, 'insufficient_pending');
  }

  wallets[userId].pending -= amount;
  wallets[userId].balance += amount;
  wallets[userId].updatedAt = now();
  saveWallets(wallets);

  addTx('approve_payout', { userId, amount });
  appendAudit('wallet_approve_payout', { userId, amount });

  return ok(res, { wallet: wallets[userId] });
};

exports.getWallet = (req, res) => {
  const userId = String(req.params.userId || '').trim();
  if (!userId) return fail(res, 400, 'userId_required');

  const wallets = getWallets();
  if (!wallets[userId]) wallets[userId] = ensure(userId);
  saveWallets(wallets);

  return ok(res, { wallet: wallets[userId] });
};

exports.summary = (_req, res) => {
  const wallets = Object.values(getWallets());
  const totals = wallets.reduce((acc, w) => {
    acc.balance += num(w.balance);
    acc.credits += num(w.credits);
    acc.pending += num(w.pending);
    acc.lifetimeEarned += num(w.lifetimeEarned);
    acc.platformFeesPaid += num(w.platformFeesPaid);
    return acc;
  }, { balance: 0, credits: 0, pending: 0, lifetimeEarned: 0, platformFeesPaid: 0 });

  return ok(res, { count: wallets.length, totals });
};
