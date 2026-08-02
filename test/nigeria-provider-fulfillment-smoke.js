'use strict';

const assert = require('assert');
const providers = require('../lib/africa-provider-clients');
const register = require('../nigeria-provider-fulfillment');

assert.strictEqual(typeof providers.initialize, 'function');
assert.strictEqual(typeof providers.verify, 'function');

const routes = [];
const app = {
  post(path, ...handlers) { routes.push({ method: 'POST', path, handlers }); }
};
const store = { paymentIntents: [], ledgerEntries: [] };
register({
  app,
  auth: (_req,_res,next)=>next(),
  admin: (_req,_res,next)=>next(),
  clean: (value,max=120)=>String(value||'').trim().slice(0,max),
  id: prefix=>`${prefix}_test`,
  getStore: ()=>store,
  saveStore: async()=>{},
  persistence: null
});

for (const path of [
  '/api/payments/nigeria/intents/:intentId/initialize',
  '/api/payments/nigeria/intents/:intentId/verify-provider',
  '/api/payments/nigeria/intents/:intentId/refund-request',
  '/api/admin/payments/nigeria/intents/:intentId/disputes'
]) {
  assert(routes.some(route => route.path === path), `Missing route ${path}`);
}

console.log('Nigeria provider fulfillment smoke checks passed');
