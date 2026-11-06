'use strict';
// Explicitly separates fictional jobs, paid purchases, and XR presentation.
// This adapter creates intents only. Existing payment and reward services own settlement.
const GAME = 'STREETVERSE_GAME_CREDITS';
const REAL = 'USD';
function jobRewardIntent(jobReceipt) {
  if (!jobReceipt || jobReceipt.currency !== GAME || !Number.isSafeInteger(jobReceipt.amount) || jobReceipt.amount < 0 || !jobReceipt.jobId || !jobReceipt.playerId) throw Error('INVALID_GAME_JOB_RECEIPT');
  return Object.freeze({ kind: 'FICTIONAL_JOB_REWARD', ledger: 'streetverse-game', currency: GAME, amount: jobReceipt.amount, idempotencyKey: 'streetverse-job:' + jobReceipt.jobId, playerId: jobReceipt.playerId, redeemableForCash: false });
}
function purchaseIntent({ playerId, productId, priceCents, orderId }) {
  if (![playerId, productId, orderId].every(v => typeof v === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(v))) throw Error('INVALID_PURCHASE');
  if (!Number.isSafeInteger(priceCents) || priceCents <= 0) throw Error('INVALID_PRICE');
  return Object.freeze({ kind: 'REAL_MONEY_CHECKOUT_REQUEST', providerSettlementRequired: true, settlementStatus: 'NOT_PAID', currency: REAL, amountCents: priceCents, playerId, productId, orderId, idempotencyKey: 'checkout:' + orderId });
}
function xrPresentation({ immersiveAr = false, immersiveVr = false, supports3d = true } = {}) {
  return Object.freeze({ ar: Boolean(immersiveAr), vr: Boolean(immersiveVr), fallback3d: Boolean(supports3d), affectsWalletBalance: false });
}
module.exports = { jobRewardIntent, purchaseIntent, xrPresentation, GAME, REAL };
