'use strict';

const providers = require('./lib/africa-provider-clients');

module.exports = function registerNigeriaProviderFulfillment({ app, auth, admin, clean, id, getStore, saveStore, persistence }) {
  const store = getStore();
  store.refunds = Array.isArray(store.refunds) ? store.refunds : [];
  store.disputes = Array.isArray(store.disputes) ? store.disputes : [];
  store.ledgerEntries = Array.isArray(store.ledgerEntries) ? store.ledgerEntries : [];

  function findIntent(intentId, user) {
    return store.paymentIntents.find(item => item.id === intentId && (item.userId === user.id || user.role === 'admin'));
  }

  async function appendLedger(reference, entries) {
    const debit = entries.filter(e => e.direction === 'debit').reduce((sum, e) => sum + Number(e.amountMinor), 0);
    const credit = entries.filter(e => e.direction === 'credit').reduce((sum, e) => sum + Number(e.amountMinor), 0);
    if (debit !== credit) throw new Error('Ledger transaction is not balanced');
    const recorded = entries.map(entry => ({ id: id('led'), reference, createdAt: new Date().toISOString(), ...entry }));
    store.ledgerEntries.push(...recorded);
    if (persistence) await persistence.ledgerEntries(reference, recorded);
    return recorded;
  }

  async function persistIntent(intent, actorUserId, eventType, metadata = {}) {
    intent.updatedAt = new Date().toISOString();
    await saveStore();
    const persisted = persistence ? await persistence.paymentIntent(intent) : { mode: 'local' };
    if (persistence) await persistence.audit({
      actorUserId,
      type: eventType,
      targetType: 'payment_intent',
      targetId: intent.id,
      metadata: { ...metadata, persistenceMode: persisted.mode }
    });
    return persisted;
  }

  app.post('/api/payments/nigeria/intents/:intentId/initialize', auth, async (req, res, next) => {
    try {
      const intent = findIntent(req.params.intentId, req.user);
      if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
      if (!['created','initialization_failed'].includes(intent.status)) return res.status(409).json({ error: `Intent cannot initialize from ${intent.status}` });
      const email = clean(req.user.email, 200);
      if (!email) return res.status(400).json({ error: 'Account email is required' });
      if (intent.provider === 'paystack' && !providers.paystackConfigured()) return res.status(503).json({ error: 'Paystack sandbox is not configured' });
      if (intent.provider === 'flutterwave' && !providers.flutterwaveConfigured()) return res.status(503).json({ error: 'Flutterwave sandbox is not configured' });
      const initialized = await providers.initialize(intent.provider, {
        reference: intent.id,
        amountMinor: intent.amountMinor,
        currency: intent.currency,
        email,
        purpose: intent.purpose,
        callbackUrl: `${process.env.APP_URL || 'http://localhost:10000'}/omniverse-v1.html?payment=${intent.id}`
      });
      intent.status = 'pending';
      intent.providerReference = initialized.reference || intent.id;
      intent.checkoutUrl = initialized.checkoutUrl || null;
      intent.accessCode = initialized.accessCode || null;
      const persisted = await persistIntent(intent, req.user.id, 'payment.provider.initialized', { provider: intent.provider });
      res.json({ intent, checkoutUrl: intent.checkoutUrl, persistence: persisted.mode });
    } catch (error) {
      const intent = store.paymentIntents.find(item => item.id === req.params.intentId);
      if (intent) {
        intent.status = 'initialization_failed';
        intent.lastError = error.message;
        await persistIntent(intent, req.user.id, 'payment.provider.initialization_failed', { error: error.message });
      }
      next(error);
    }
  });

  app.post('/api/payments/nigeria/intents/:intentId/verify-provider', auth, async (req, res, next) => {
    try {
      const intent = findIntent(req.params.intentId, req.user);
      if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
      if (intent.status === 'succeeded') return res.json({ intent, duplicate: true, ledgerPosted: false });
      const verificationId = clean(req.body.providerTransactionId || intent.providerReference || intent.id, 200);
      const verified = await providers.verify(intent.provider, verificationId);
      const sameReference = !verified.reference || verified.reference === intent.id || verified.reference === intent.providerReference;
      const amountMatches = Number(verified.amountMinor) === Number(intent.amountMinor);
      const currencyMatches = String(verified.currency || '').toUpperCase() === intent.currency;
      const succeeded = ['success','successful','succeeded'].includes(String(verified.status || '').toLowerCase());
      if (!sameReference || !amountMatches || !currencyMatches || !succeeded) {
        intent.status = 'verification_failed';
        const persisted = await persistIntent(intent, req.user.id, 'payment.provider.verification_failed', { sameReference, amountMatches, currencyMatches, providerStatus: verified.status });
        return res.status(409).json({ error: 'Provider verification did not match the payment intent', checks: { sameReference, amountMatches, currencyMatches, succeeded }, persistence: persisted.mode });
      }
      const alreadyPosted = store.ledgerEntries.some(entry => entry.reference === intent.id);
      if (!alreadyPosted) await appendLedger(intent.id, [
        { account: 'provider-settlement-receivable', direction: 'debit', amountMinor: intent.amountMinor, currency: intent.currency },
        { account: intent.purpose === 'holocredits' ? 'purchased-credit-liability' : 'customer-order-liability', direction: 'credit', amountMinor: intent.amountMinor, currency: intent.currency }
      ]);
      intent.status = 'succeeded';
      intent.providerReference = verified.reference || intent.providerReference;
      intent.verifiedAt = new Date().toISOString();
      const persisted = await persistIntent(intent, req.user.id, 'payment.provider.verified', { provider: intent.provider, ledgerPosted: !alreadyPosted });
      res.json({ intent, ledgerPosted: !alreadyPosted, persistence: persisted.mode });
    } catch (error) { next(error); }
  });

  app.post('/api/payments/nigeria/intents/:intentId/refund-request', auth, async (req, res) => {
    const intent = findIntent(req.params.intentId, req.user);
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    if (intent.status !== 'succeeded') return res.status(409).json({ error: 'Only succeeded payments can request a refund' });
    const duplicate = store.refunds.find(item => item.intentId === intent.id && ['requested','reviewing','approved','submitted'].includes(item.status));
    if (duplicate) return res.json({ refund: duplicate, duplicate: true });
    const refund = {
      id: id('refund'), intentId: intent.id, userId: req.user.id,
      amountMinor: intent.amountMinor, currency: intent.currency,
      reason: clean(req.body.reason, 500) || 'customer-request',
      status: 'requested', automaticSubmission: false, createdAt: new Date().toISOString()
    };
    store.refunds.push(refund);
    await saveStore();
    if (persistence) await persistence.audit({ actorUserId: req.user.id, type: 'refund.requested', targetType: 'payment_intent', targetId: intent.id, metadata: { refundId: refund.id, amountMinor: refund.amountMinor } });
    res.status(201).json({ refund, next: 'operations-review' });
  });

  app.post('/api/admin/payments/nigeria/intents/:intentId/disputes', auth, admin, async (req, res) => {
    const intent = store.paymentIntents.find(item => item.id === req.params.intentId);
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    const dispute = {
      id: id('dispute'), intentId: intent.id, provider: intent.provider,
      reason: clean(req.body.reason, 500) || 'provider-notice',
      status: 'manual_review', createdAt: new Date().toISOString()
    };
    store.disputes.push(dispute);
    intent.status = 'disputed';
    await persistIntent(intent, req.user.id, 'payment.dispute.opened', { disputeId: dispute.id, reason: dispute.reason });
    res.status(201).json({ dispute });
  });
};
