'use strict';

const PLATFORM_FEE_BPS = Math.max(0, Math.min(10000, Number(process.env.PLATFORM_FEE_BPS || 2500)));

function cents(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function paymentId(session) {
  return String(session?.id || '').trim();
}

function applyPaidCheckout({ store, session, eventId = null, now = new Date().toISOString() }) {
  const sessionId = paymentId(session);
  if (!sessionId) throw Object.assign(new Error('Stripe Checkout session id is required'), { status: 400 });
  if (session.payment_status !== 'paid') {
    return { applied: false, reason: 'NOT_PAID', sessionId, paymentStatus: session.payment_status || 'unknown' };
  }

  store.purchases = Array.isArray(store.purchases) ? store.purchases : [];
  store.creatorLedger = Array.isArray(store.creatorLedger) ? store.creatorLedger : [];
  store.events = Array.isArray(store.events) ? store.events : [];

  const existing = store.purchases.find(p => p.stripeCheckoutSessionId === sessionId && p.status === 'paid');
  if (existing) return { applied: false, reason: 'ALREADY_APPLIED', purchase: existing };

  const metadata = session.metadata || {};
  const buyerId = String(metadata.buyerId || '').trim();
  const creatorId = String(metadata.creatorId || '').trim();
  const roomId = String(metadata.roomId || '').trim();
  if (!buyerId || !creatorId || !roomId) {
    throw Object.assign(new Error('Stripe Checkout metadata is incomplete'), { status: 422 });
  }

  const room = (store.rooms || []).find(r => r.id === roomId);
  const creator = (store.users || []).find(u => u.id === creatorId);
  const buyer = (store.users || []).find(u => u.id === buyerId);
  if (!room || !creator || !buyer) {
    throw Object.assign(new Error('Checkout references an unknown TRYAMM user or room'), { status: 422 });
  }

  const amountCents = cents(session.amount_total);
  if (!amountCents) throw Object.assign(new Error('Paid Checkout session has no positive amount'), { status: 422 });

  const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_BPS / 10000);
  const creatorCents = amountCents - platformFeeCents;
  const purchase = {
    id: `stripe_${sessionId}`,
    kind: String(metadata.kind || 'ticket'),
    status: 'paid',
    paymentProof: 'stripe_server_verified',
    stripeCheckoutSessionId: sessionId,
    stripePaymentIntentId: session.payment_intent || null,
    stripeEventId: eventId || null,
    buyerId,
    creatorId,
    roomId,
    amountCents,
    platformFeeCents,
    creatorCents,
    currency: String(session.currency || 'usd').toLowerCase(),
    paidAt: now,
    createdAt: now
  };

  store.purchases.push(purchase);
  creator.payableBalanceCents = cents(creator.payableBalanceCents) + creatorCents;
  store.creatorLedger.push({
    id: `ledger_${sessionId}`,
    creatorId,
    purchaseId: purchase.id,
    type: 'earning',
    status: 'payable',
    grossCents: amountCents,
    platformFeeCents,
    netCents: creatorCents,
    currency: purchase.currency,
    source: purchase.kind,
    roomId,
    stripeCheckoutSessionId: sessionId,
    createdAt: now
  });
  store.events.push({
    id: `money_${sessionId}`,
    type: 'payment.verified',
    source: 'stripe',
    stripeEventId: eventId || null,
    stripeCheckoutSessionId: sessionId,
    purchaseId: purchase.id,
    createdAt: now
  });
  return { applied: true, purchase };
}

function earningsFor(store, creatorId) {
  const rows = (store.creatorLedger || []).filter(x => x.creatorId === creatorId);
  const earnedCents = rows.filter(x => x.type === 'earning').reduce((sum, x) => sum + cents(x.netCents), 0);
  const paidOutCents = rows.filter(x => x.type === 'payout' && x.status === 'paid').reduce((sum, x) => sum + cents(x.netCents), 0);
  const payableCents = Math.max(0, earnedCents - paidOutCents);
  return { rows, earnedCents, paidOutCents, payableCents };
}

module.exports = function registerPaymentRoutes({ app, auth, getStore, saveStore }) {
  function stripeClient() {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    const Stripe = require('stripe');
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async function retrieveTrustedSession(sessionId) {
    const stripe = stripeClient();
    if (!stripe) throw Object.assign(new Error('Stripe is not configured'), { status: 503, code: 'STRIPE_NOT_CONFIGURED' });
    return stripe.checkout.sessions.retrieve(String(sessionId || '').trim());
  }

  app.get('/api/payments/status', (_req, res) => {
    res.json({
      ok: true,
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      verification: 'server_retrieve',
      payoutMode: 'ledger_only',
      platformFeeBps: PLATFORM_FEE_BPS,
      livePayoutsEnabled: false
    });
  });

  // Browser-success fallback: TRYAMM asks Stripe directly whether the session is really paid.
  app.post('/api/payments/verify-checkout', auth, async (req, res, next) => {
    try {
      const session = await retrieveTrustedSession(req.body?.sessionId);
      if (String(session.metadata?.buyerId || '') !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Checkout does not belong to this account' });
      }
      const result = applyPaidCheckout({ store: getStore(), session });
      if (result.applied) await saveStore();
      res.status(result.reason === 'NOT_PAID' ? 202 : 200).json({ ok: true, ...result });
    } catch (error) { next(error); }
  });

  // Webhook transport is treated as an event hint. We re-fetch the event/session from Stripe
  // with the server secret, so parsed JSON from the internet is never trusted as payment proof.
  app.post('/api/stripe/webhook', async (req, res, next) => {
    try {
      const stripe = stripeClient();
      if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });
      const eventId = String(req.body?.id || '').trim();
      if (!eventId.startsWith('evt_')) return res.status(400).json({ error: 'Stripe event id is required' });
      const event = await stripe.events.retrieve(eventId);
      if (!event || event.id !== eventId) return res.status(400).json({ error: 'Stripe event verification failed' });
      if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
        return res.json({ received: true, ignored: true, type: event.type });
      }
      const sessionId = String(event.data?.object?.id || '').trim();
      const session = await retrieveTrustedSession(sessionId);
      const result = applyPaidCheckout({ store: getStore(), session, eventId: event.id });
      if (result.applied) await saveStore();
      res.json({ received: true, verified: true, ...result });
    } catch (error) { next(error); }
  });

  app.get('/api/creator/earnings', auth, async (req, res) => {
    const creatorId = req.user.id;
    const summary = earningsFor(getStore(), creatorId);
    res.json({
      ok: true,
      creatorId,
      currency: 'usd',
      ...summary,
      payoutStatus: 'ledger_only',
      notice: 'Live external payouts remain disabled until Stripe Connect onboarding and payout verification are completed.'
    });
  });
};

module.exports.applyPaidCheckout = applyPaidCheckout;
module.exports.earningsFor = earningsFor;
