'use strict';
const assert = require('assert');
const register = require('../nigeria-payments');

const routes = [];
const app = {
  get: (path, ...handlers) => routes.push({ method: 'GET', path, handlers }),
  post: (path, ...handlers) => routes.push({ method: 'POST', path, handlers })
};
const store = {};
const auth = (_req, _res, next) => next();
const admin = (_req, _res, next) => next();
register({
  app, auth, admin,
  clean: (value, max = 120) => String(value || '').trim().slice(0, max),
  id: prefix => `${prefix}_test`,
  getStore: () => store,
  saveStore: async () => {}
});

const required = [
  'GET /api/payments/nigeria/providers',
  'POST /api/payments/nigeria/intents',
  'GET /api/payments/nigeria/intents/:intentId',
  'POST /api/payments/nigeria/intents/:intentId/simulate-success',
  'POST /api/webhooks/paystack',
  'POST /api/webhooks/flutterwave',
  'POST /api/payouts/nigeria',
  'GET /api/admin/payments/nigeria/reconciliation'
];
const actual = new Set(routes.map(route => `${route.method} ${route.path}`));
for (const route of required) assert(actual.has(route), `Missing route: ${route}`);
for (const key of ['paymentIntents','webhookEvents','payouts','ledgerEntries','reconciliationCases']) {
  assert(Array.isArray(store[key]), `Missing store collection: ${key}`);
}
console.log('Nigeria payment service smoke test passed');
