'use strict';

const crypto = require('crypto');
const providers = require('./lib/africa-provider-clients');

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = function registerNigeriaWebhookFulfillment({ app, clean, id, getStore, saveStore, persistence }) {
  const store = getStore();
  for (const key of ['webhookEvents','paymentIntents','ledgerEntries','entitlements','receipts','settlementRecords']) {
    if (!Array.isArray(store[key])) store[key] = [];
  }

  async function appendLedgerOnce(intent) {
    if (store.ledgerEntries.some(entry => entry.reference === intent.id)) return false;
    const now = new Date().toISOString();
    const entries = [
      { id: id('led'), reference: intent.id, account: 'provider-settlement-receivable', direction: 'debit', amountMinor: intent.amountMinor, currency: intent.currency, createdAt: now },
      { id: id('led'), reference: intent.id, account: intent.purpose === 'holocredits' ? 'purchased-credit-liability' : 'customer-order-liability', direction: 'credit', amountMinor: intent.amountMinor, currency: intent.currency, createdAt: now }
    ];
    const debit = entries.filter(e => e.direction === 'debit').reduce((s,e) => s + e.amountMinor, 0);
    const credit = entries.filter(e => e.direction === 'credit').reduce((s,e) => s + e.amountMinor, 0);
    if (debit !== credit) throw new Error('Webhook ledger transaction is not balanced');
    store.ledgerEntries.push(...entries);
    if (persistence) await persistence.ledgerEntries(intent.id, entries);
    return true;
  }

  function createEntitlement(intent) {
    const existing = store.entitlements.find(item => item.paymentIntentId === intent.id);
    if (existing) return existing;
    const entitlement = {
      id: id('ent'), paymentIntentId: intent.id, userId: intent.userId,
      type: intent.purpose, status: 'active', amountMinor: intent.amountMinor,
      currency: intent.currency, createdAt: new Date().toISOString()
    };
    store.entitlements.push(entitlement);
    return entitlement;
  }

  function createReceipt(intent) {
    const existing = store.receipts.find(item => item.paymentIntentId === intent.id);
    if (existing) return existing;
    const receipt = {
      id: id('rcpt'), paymentIntentId: intent.id, userId: intent.userId,
      provider: intent.provider, providerReference: intent.providerReference,
      amountMinor: intent.amountMinor, currency: intent.currency,
      purpose: intent.purpose, issuedAt: new Date().toISOString()
    };
    store.receipts.push(receipt);
    return receipt;
  }

  async function fulfill(provider, payload, providerEventId) {
    const duplicate = store.webhookEvents.find(event => event.provider === provider && event.providerEventId === providerEventId && event.fulfilled);
    if (duplicate) return { duplicate: true, event: duplicate };

    const reference = provider === 'paystack'
      ? clean(payload?.data?.reference, 200)
      : clean(payload?.data?.tx_ref || payload?.tx_ref, 200);
    const transactionId = provider === 'flutterwave'
      ? clean(payload?.data?.id || payload?.id, 200)
      : reference;
    const intent = store.paymentIntents.find(item => item.id === reference || item.providerReference === reference);
    if (!intent) throw Object.assign(new Error('Payment intent not found for webhook'), { status: 404 });

    const verified = await providers.verify(provider, transactionId);
    const sameReference = !verified.reference || verified.reference === intent.id || verified.reference === intent.providerReference;
    const amountMatches = Number(verified.amountMinor) === Number(intent.amountMinor);
    const currencyMatches = String(verified.currency || '').toUpperCase() === intent.currency;
    const succeeded = ['success','successful','succeeded'].includes(String(verified.status || '').toLowerCase());
    if (!sameReference || !amountMatches || !currencyMatches || !succeeded) {
      intent.status = 'verification_failed';
      intent.updatedAt = new Date().toISOString();
      if (persistence) await persistence.paymentIntent(intent);
      throw Object.assign(new Error('Provider verification did not match payment intent'), { status: 409 });
    }

    const ledgerPosted = await appendLedgerOnce(intent);
    intent.status = 'succeeded';
    intent.providerReference = verified.reference || intent.providerReference || intent.id;
    intent.verifiedAt = new Date().toISOString();
    intent.updatedAt = intent.verifiedAt;
    const entitlement = createEntitlement(intent);
    const receipt = createReceipt(intent);
    const settlement = store.settlementRecords.find(item => item.paymentIntentId === intent.id) || {
      id: id('settle'), paymentIntentId: intent.id, provider,
      amountMinor: intent.amountMinor, currency: intent.currency,
      status: 'pending-provider-settlement', createdAt: new Date().toISOString()
    };
    if (!store.settlementRecords.includes(settlement)) store.settlementRecords.push(settlement);
    if (persistence) {
      await persistence.paymentIntent(intent);
      await persistence.audit({
        type: 'payment.webhook.fulfilled', targetType: 'payment_intent', targetId: intent.id,
        metadata: { provider, providerEventId, ledgerPosted, entitlementId: entitlement.id, receiptId: receipt.id }
      });
    }
    return { intent, entitlement, receipt, settlement, ledgerPosted, duplicate: false };
  }

  app.post('/api/webhooks/paystack', async (req, res, next) => {
    try {
      const raw = JSON.stringify(req.body || {});
      const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '').update(raw).digest('hex');
      const valid = Boolean(process.env.PAYSTACK_SECRET_KEY) && safeEqual(expected, req.headers['x-paystack-signature']);
      if (!valid) return res.status(401).json({ error: 'Invalid webhook signature' });
      const providerEventId = clean(req.body?.data?.reference || req.body?.event, 200);
      const result = await fulfill('paystack', req.body, providerEventId);
      const event = { id: id('wh'), provider: 'paystack', providerEventId, signatureValid: true, fulfilled: true, payload: req.body, createdAt: new Date().toISOString() };
      store.webhookEvents.push(event); await saveStore(); if (persistence) await persistence.webhook(event);
      res.json({ received: true, ...result });
    } catch (error) { next(error); }
  });

  app.post('/api/webhooks/flutterwave', async (req, res, next) => {
    try {
      const signature = req.headers['verif-hash'] || req.headers['flutterwave-signature'];
      const valid = Boolean(process.env.FLUTTERWAVE_WEBHOOK_HASH) && safeEqual(process.env.FLUTTERWAVE_WEBHOOK_HASH, signature);
      if (!valid) return res.status(401).json({ error: 'Invalid webhook signature' });
      const providerEventId = clean(req.body?.data?.id || req.body?.id, 200);
      const result = await fulfill('flutterwave', req.body, providerEventId);
      const event = { id: id('wh'), provider: 'flutterwave', providerEventId, signatureValid: true, fulfilled: true, payload: req.body, createdAt: new Date().toISOString() };
      store.webhookEvents.push(event); await saveStore(); if (persistence) await persistence.webhook(event);
      res.json({ received: true, ...result });
    } catch (error) { next(error); }
  });

  app.get('/api/payments/nigeria/receipts/:receiptId', (req, res) => {
    const receipt = store.receipts.find(item => item.id === req.params.receiptId);
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
    res.json({ receipt });
  });
};
