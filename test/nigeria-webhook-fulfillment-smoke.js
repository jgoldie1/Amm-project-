'use strict';
const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('nigeria-webhook-fulfillment.js','utf8');
const kernel = fs.readFileSync('platform-kernel.js','utf8');

for (const expected of [
  '/api/webhooks/paystack',
  '/api/webhooks/flutterwave',
  'appendLedgerOnce',
  'createEntitlement',
  'createReceipt',
  'pending-provider-settlement',
  '/api/payments/nigeria/receipts/:receiptId'
]) assert(source.includes(expected), `Missing ${expected}`);

assert(source.includes('store.webhookEvents.find'), 'Duplicate webhook protection missing');
assert(source.includes('providers.verify'), 'Provider reverification missing');
assert(source.includes("entry.reference === intent.id"), 'One-time ledger protection missing');
assert(kernel.indexOf("require('./nigeria-webhook-fulfillment')") < kernel.indexOf("require('./nigeria-payments')"), 'Webhook fulfillment must register before acknowledgement routes');
console.log('Nigeria webhook fulfillment smoke checks passed');
