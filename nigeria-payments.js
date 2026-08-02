'use strict';
const crypto = require('crypto');

const PROVIDERS = {
  paystack: {
    id: 'paystack', currency: 'NGN', methods: ['card','bank','transfer','ussd'],
    configured: () => Boolean(process.env.PAYSTACK_SECRET_KEY),
    secret: () => process.env.PAYSTACK_SECRET_KEY || ''
  },
  flutterwave: {
    id: 'flutterwave', currency: 'NGN', methods: ['card','bank-transfer','virtual-account','ussd'],
    configured: () => Boolean(process.env.FLUTTERWAVE_SECRET_KEY),
    secret: () => process.env.FLUTTERWAVE_SECRET_KEY || ''
  }
};

function cents(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = function registerNigeriaPayments({ app, auth, admin, clean, id, getStore, saveStore, persistence }) {
  const store = getStore();
  for (const key of ['paymentIntents','webhookEvents','payouts','ledgerEntries','reconciliationCases']) {
    if (!Array.isArray(store[key])) store[key] = [];
  }

  function providerSummary() {
    return Object.values(PROVIDERS).map(provider => ({
      id: provider.id, country: 'NG', currency: provider.currency, methods: provider.methods,
      configured: provider.configured(),
      state: provider.configured() ? 'sandbox-configured' : 'sandbox-unconfigured',
      productionEnabled: false
    }));
  }

  function selectProvider(requested) {
    if (requested && PROVIDERS[requested]) return PROVIDERS[requested];
    return Object.values(PROVIDERS).find(provider => provider.configured()) || PROVIDERS.paystack;
  }

  async function appendLedger(reference, entries) {
    const debit = entries.filter(entry => entry.direction === 'debit').reduce((sum, entry) => sum + entry.amountMinor, 0);
    const credit = entries.filter(entry => entry.direction === 'credit').reduce((sum, entry) => sum + entry.amountMinor, 0);
    if (debit !== credit) throw new Error('Ledger transaction is not balanced');
    const recorded = entries.map(entry => ({
      id: id('led'), reference, createdAt: new Date().toISOString(), ...entry
    }));
    store.ledgerEntries.push(...recorded);
    if (persistence) await persistence.ledgerEntries(reference, recorded);
    return recorded;
  }

  app.get('/api/payments/nigeria/providers', (_req, res) => {
    res.json({ country: 'NG', currency: 'NGN', providers: providerSummary(), productionEnabled: false });
  });

  app.post('/api/payments/nigeria/intents', auth, async (req, res) => {
    const amountMinor = cents(req.body.amountMinor);
    const currency = clean(req.body.currency, 10).toUpperCase() || 'NGN';
    const purpose = clean(req.body.purpose, 60);
    if (currency !== 'NGN') return res.status(400).json({ error: 'Nigeria payment intents currently require NGN' });
    if (amountMinor < 100) return res.status(400).json({ error: 'Amount must be at least 100 kobo' });
    if (!['holocredits','subscription','marketplace','ticket','advertising'].includes(purpose)) {
      return res.status(400).json({ error: 'Unsupported payment purpose' });
    }
    const provider = selectProvider(clean(req.body.provider, 30).toLowerCase());
    const intent = {
      id: id('ngpay'), userId: req.user.id, provider: provider.id, amountMinor, currency, purpose,
      status: 'created', idempotencyKey: clean(req.headers['idempotency-key'], 120) || id('idem'),
      providerReference: null, production: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    const duplicate = store.paymentIntents.find(item => item.idempotencyKey === intent.idempotencyKey);
    if (duplicate) return res.json({ intent: duplicate, duplicate: true });
    store.paymentIntents.push(intent);
    await saveStore();
    const persisted = persistence ? await persistence.paymentIntent(intent) : { mode: 'local' };
    if (persistence) await persistence.audit({
      actorUserId: req.user.id,
      type: 'payment.intent.created', targetType: 'payment_intent', targetId: intent.id,
      metadata: { provider: intent.provider, amountMinor, currency, purpose, persistenceMode: persisted.mode }
    });
    res.status(201).json({
      intent,
      persistence: persisted.mode,
      next: provider.configured() ? 'initialize-with-provider-sandbox' : 'configure-provider-secret'
    });
  });

  app.get('/api/payments/nigeria/intents/:intentId', auth, (req, res) => {
    const intent = store.paymentIntents.find(item => item.id === req.params.intentId && (item.userId === req.user.id || req.user.role === 'admin'));
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    res.json({ intent });
  });

  app.post('/api/payments/nigeria/intents/:intentId/simulate-success', auth, async (req, res) => {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Simulation is disabled in production' });
    const intent = store.paymentIntents.find(item => item.id === req.params.intentId && item.userId === req.user.id);
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    if (intent.status === 'succeeded') return res.json({ intent, duplicate: true });
    intent.status = 'succeeded';
    intent.providerReference = `sandbox_${intent.provider}_${crypto.randomUUID()}`;
    intent.updatedAt = new Date().toISOString();
    await appendLedger(intent.id, [
      { account: 'provider-settlement-receivable', direction: 'debit', amountMinor: intent.amountMinor, currency: intent.currency },
      { account: intent.purpose === 'holocredits' ? 'purchased-credit-liability' : 'customer-order-liability', direction: 'credit', amountMinor: intent.amountMinor, currency: intent.currency }
    ]);
    await saveStore();
    const persisted = persistence ? await persistence.paymentIntent(intent) : { mode: 'local' };
    if (persistence) await persistence.audit({
      actorUserId: req.user.id,
      type: 'payment.intent.succeeded.simulated', targetType: 'payment_intent', targetId: intent.id,
      metadata: { providerReference: intent.providerReference, persistenceMode: persisted.mode }
    });
    res.json({ intent, ledgerPosted: true, simulation: true, persistence: persisted.mode });
  });

  app.post('/api/webhooks/paystack', async (req, res) => {
    const raw = JSON.stringify(req.body || {});
    const expected = crypto.createHmac('sha512', PROVIDERS.paystack.secret()).update(raw).digest('hex');
    const signature = req.headers['x-paystack-signature'];
    const valid = PROVIDERS.paystack.configured() && safeEqual(expected, signature);
    const event = {
      id: id('wh'), provider: 'paystack', signatureValid: valid,
      providerEventId: clean(req.body?.data?.reference || req.body?.event, 160) || null,
      payload: req.body, createdAt: new Date().toISOString()
    };
    store.webhookEvents.push(event);
    await saveStore();
    if (persistence) await persistence.webhook(event);
    if (!valid) return res.status(401).json({ error: 'Invalid webhook signature' });
    res.json({ received: true });
  });

  app.post('/api/webhooks/flutterwave', async (req, res) => {
    const signature = req.headers['verif-hash'] || req.headers['flutterwave-signature'];
    const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH || '';
    const valid = Boolean(expected) && safeEqual(expected, signature);
    const event = {
      id: id('wh'), provider: 'flutterwave', signatureValid: valid,
      providerEventId: clean(req.body?.id || req.body?.data?.id, 160) || null,
      payload: req.body, createdAt: new Date().toISOString()
    };
    store.webhookEvents.push(event);
    await saveStore();
    if (persistence) await persistence.webhook(event);
    if (!valid) return res.status(401).json({ error: 'Invalid webhook signature' });
    res.json({ received: true });
  });

  app.post('/api/payouts/nigeria', auth, async (req, res) => {
    const amountMinor = cents(req.body.amountMinor);
    if (!req.user.isCreator && req.user.role !== 'admin') return res.status(403).json({ error: 'Creator account required' });
    if (amountMinor < 10000) return res.status(400).json({ error: 'Minimum payout is 100 NGN' });
    const idempotencyKey = clean(req.headers['idempotency-key'], 120);
    if (!idempotencyKey) return res.status(400).json({ error: 'Idempotency-Key header is required' });
    const duplicate = store.payouts.find(item => item.idempotencyKey === idempotencyKey);
    if (duplicate) return res.json({ payout: duplicate, duplicate: true });
    const available = Math.max(0, Number(req.user.balanceCents || 0));
    if (amountMinor > available) return res.status(400).json({ error: 'Insufficient available creator earnings' });
    const provider = selectProvider(clean(req.body.provider, 30).toLowerCase());
    const payout = {
      id: id('ngout'), userId: req.user.id, provider: provider.id, amountMinor,
      currency: 'NGN', status: 'eligibility_review', idempotencyKey,
      production: false, createdAt: new Date().toISOString()
    };
    store.payouts.push(payout);
    await saveStore();
    const persisted = persistence ? await persistence.payout(payout) : { mode: 'local' };
    if (persistence) await persistence.audit({
      actorUserId: req.user.id,
      type: 'payout.requested', targetType: 'payout', targetId: payout.id,
      metadata: { provider: payout.provider, amountMinor, persistenceMode: persisted.mode }
    });
    res.status(201).json({ payout, persistence: persisted.mode, next: 'recipient-validation-and-provider-submission' });
  });

  app.get('/api/admin/payments/nigeria/reconciliation', auth, admin, (_req, res) => {
    const successful = store.paymentIntents.filter(item => item.status === 'succeeded');
    const ledgerReferences = new Set(store.ledgerEntries.map(entry => entry.reference));
    const missingLedger = successful.filter(item => !ledgerReferences.has(item.id));
    res.json({
      country: 'NG', generatedAt: new Date().toISOString(),
      paymentIntents: store.paymentIntents.length,
      payouts: store.payouts.length,
      webhookEvents: store.webhookEvents.length,
      ledgerEntries: store.ledgerEntries.length,
      missingLedger: missingLedger.map(item => item.id),
      persistence: persistence?.configured() ? 'supabase-with-local-fallback' : 'local-development',
      status: missingLedger.length ? 'review-required' : 'balanced-for-recorded-sandbox-events'
    });
  });
};
