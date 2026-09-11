'use strict';

function cents(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function ensure(store) {
  store.plateOrders ||= [];
  store.creatorLedger ||= [];
  store.events ||= [];
  store.users ||= [];
  store.chargebackCases ||= [];
  return store;
}

function applyDispute({ store, dispute, now = new Date().toISOString() }) {
  ensure(store);
  const disputeId = String(dispute?.id || '').trim();
  const paymentIntentId = String(dispute?.payment_intent || '').trim();
  if (!disputeId || !paymentIntentId) throw Object.assign(new Error('Verified dispute id and payment intent are required'), { status: 400 });
  const existing = store.chargebackCases.find(x => x.stripeDisputeId === disputeId);
  if (existing) {
    existing.stripeStatus = String(dispute.status || existing.stripeStatus);
    existing.updatedAt = now;
    return { applied: false, reason: 'ALREADY_APPLIED', chargebackCase: existing };
  }
  const order = store.plateOrders.find(x => x.stripePaymentIntentId === paymentIntentId);
  if (!order) return { applied: false, reason: 'NON_PLATE_PAYMENT', disputeId };
  const amountCents = cents(dispute.amount || order.amountCents);
  const seller = store.users.find(x => x.id === order.sellerId);
  const ledger = store.creatorLedger.find(x => x.plateOrderId === order.id && x.type === 'earning');
  const sellerExposureCents = Math.min(cents(order.sellerCents), amountCents);
  if (seller) {
    seller.payableBalanceCents = Math.max(0, cents(seller.payableBalanceCents) - sellerExposureCents);
    seller.chargebackHoldCents = cents(seller.chargebackHoldCents) + sellerExposureCents;
  }
  if (ledger) ledger.status = 'disputed';
  order.status = 'disputed';
  order.chargebackHoldCents = sellerExposureCents;
  order.disputedAt = now;
  order.stripeDisputeId = disputeId;
  const chargebackCase = {
    id: `cb_${disputeId}`,
    stripeDisputeId: disputeId,
    stripePaymentIntentId: paymentIntentId,
    plateOrderId: order.id,
    sellerId: order.sellerId,
    buyerId: order.buyerId,
    amountCents,
    sellerExposureCents,
    reason: String(dispute.reason || 'unknown'),
    stripeStatus: String(dispute.status || 'needs_response'),
    status: 'open',
    evidenceStatus: order.fulfillmentProof ? 'available' : 'needed',
    evidenceDueBy: dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toISOString() : null,
    createdAt: now,
    updatedAt: now
  };
  store.chargebackCases.push(chargebackCase);
  store.events.push({ id: `cb_evt_${disputeId}`, type: 'plate.chargeback.opened', source: 'stripe', stripeDisputeId: disputeId, plateOrderId: order.id, amountCents, createdAt: now });
  return { applied: true, chargebackCase, order };
}

function resolveDispute({ store, dispute, now = new Date().toISOString() }) {
  ensure(store);
  const disputeId = String(dispute?.id || '').trim();
  const chargebackCase = store.chargebackCases.find(x => x.stripeDisputeId === disputeId);
  if (!chargebackCase) return { applied: false, reason: 'CASE_NOT_FOUND' };
  if (['won','lost'].includes(chargebackCase.status)) return { applied: false, reason: 'ALREADY_RESOLVED', chargebackCase };
  const order = store.plateOrders.find(x => x.id === chargebackCase.plateOrderId);
  const seller = store.users.find(x => x.id === chargebackCase.sellerId);
  const ledger = store.creatorLedger.find(x => x.plateOrderId === chargebackCase.plateOrderId && x.type === 'earning');
  const won = String(dispute.status || '') === 'won';
  chargebackCase.stripeStatus = String(dispute.status || chargebackCase.stripeStatus);
  chargebackCase.status = won ? 'won' : 'lost';
  chargebackCase.resolvedAt = now;
  chargebackCase.updatedAt = now;
  if (seller) {
    seller.chargebackHoldCents = Math.max(0, cents(seller.chargebackHoldCents) - cents(chargebackCase.sellerExposureCents));
    if (won) seller.payableBalanceCents = cents(seller.payableBalanceCents) + cents(chargebackCase.sellerExposureCents);
  }
  if (order) {
    order.status = won ? 'paid' : 'chargeback_lost';
    order.chargebackHoldCents = 0;
    order.chargebackResolvedAt = now;
  }
  if (ledger) ledger.status = won ? 'payable' : 'chargeback_lost';
  store.events.push({ id: `cb_resolve_${disputeId}_${now}`, type: won ? 'plate.chargeback.won' : 'plate.chargeback.lost', source: 'stripe', stripeDisputeId: disputeId, plateOrderId: chargebackCase.plateOrderId, createdAt: now });
  return { applied: true, won, chargebackCase, order };
}

module.exports = function registerPlateChargebackRoutes({ app, auth, clean, getStore, saveStore }) {
  const stripeClient = () => process.env.STRIPE_SECRET_KEY ? new (require('stripe'))(process.env.STRIPE_SECRET_KEY) : null;

  app.post('/api/plate-orders/:orderId/fulfillment-proof', auth, async (req, res) => {
    const store = ensure(getStore());
    const order = store.plateOrders.find(x => x.id === req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Plate order not found' });
    if (order.sellerId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not permitted' });
    order.fulfillmentProof = {
      type: ['pickup','delivery'].includes(req.body.type) ? req.body.type : order.fulfillment,
      completedAt: req.body.completedAt || new Date().toISOString(),
      deliveryProvider: clean(req.body.deliveryProvider, 80),
      externalDeliveryId: clean(req.body.externalDeliveryId, 120),
      pickupCodeVerified: Boolean(req.body.pickupCodeVerified),
      customerConfirmation: Boolean(req.body.customerConfirmation),
      photoReference: clean(req.body.photoReference, 300),
      notes: clean(req.body.notes, 500)
    };
    order.fulfillmentStatus = 'completed';
    const chargebackCase = store.chargebackCases.find(x => x.plateOrderId === order.id && x.status === 'open');
    if (chargebackCase) {
      chargebackCase.evidenceStatus = 'available';
      chargebackCase.updatedAt = new Date().toISOString();
    }
    await saveStore();
    res.json({ orderId: order.id, fulfillmentProof: order.fulfillmentProof });
  });

  app.get('/api/admin/chargebacks', auth, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const store = ensure(getStore());
    res.json({ chargebacks: store.chargebackCases, openCount: store.chargebackCases.filter(x => x.status === 'open').length });
  });

  app.post('/api/plate-stripe/dispute-sync', auth, async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
      const stripe = stripeClient();
      if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });
      const disputeId = clean(req.body.disputeId, 120);
      if (!disputeId.startsWith('dp_')) return res.status(400).json({ error: 'Valid Stripe dispute id is required' });
      const dispute = await stripe.disputes.retrieve(disputeId);
      const result = ['won','lost'].includes(String(dispute.status || '')) ? resolveDispute({ store: getStore(), dispute }) : applyDispute({ store: getStore(), dispute });
      if (result.applied || result.reason === 'ALREADY_APPLIED') await saveStore();
      res.json({ ok: true, ...result });
    } catch (error) { next(error); }
  });

  app.post('/api/plate-stripe/dispute-webhook', async (req, res, next) => {
    try {
      const stripe = stripeClient();
      if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });
      const eventId = clean(req.body?.id, 120);
      if (!eventId.startsWith('evt_')) return res.status(400).json({ error: 'Stripe event id is required' });
      const event = await stripe.events.retrieve(eventId);
      const supported = ['charge.dispute.created','charge.dispute.updated','charge.dispute.closed'];
      if (!supported.includes(String(event.type || ''))) return res.json({ received: true, ignored: true, type: event.type });
      const disputeId = String(event.data?.object?.id || '').trim();
      if (!disputeId.startsWith('dp_')) return res.status(422).json({ error: 'Stripe dispute object missing' });
      const dispute = await stripe.disputes.retrieve(disputeId);
      let result;
      if (['won','lost'].includes(String(dispute.status || ''))) {
        result = resolveDispute({ store: getStore(), dispute });
      } else {
        result = applyDispute({ store: getStore(), dispute });
      }
      const store = ensure(getStore());
      const chargebackCase = store.chargebackCases.find(x => x.stripeDisputeId === disputeId);
      if (chargebackCase) {
        chargebackCase.lastStripeEventId = event.id;
        chargebackCase.lastStripeEventType = event.type;
        chargebackCase.updatedAt = new Date().toISOString();
      }
      if (result.applied || chargebackCase) await saveStore();
      res.json({ received: true, verified: true, type: event.type, ...result });
    } catch (error) { next(error); }
  });
};

module.exports.applyDispute = applyDispute;
module.exports.resolveDispute = resolveDispute;
