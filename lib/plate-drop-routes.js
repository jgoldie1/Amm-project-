'use strict';

const PLATE_PLATFORM_FEE_BPS = Math.max(0, Math.min(10000, Number(process.env.PLATE_PLATFORM_FEE_BPS || process.env.PLATFORM_FEE_BPS || 2500)));

function cents(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function applyPlatePayment({ store, session, now = new Date().toISOString() }) {
  const sessionId = String(session?.id || '').trim();
  if (!sessionId) throw Object.assign(new Error('Stripe Checkout session id is required'), { status: 400 });
  if (session.payment_status !== 'paid') return { applied: false, reason: 'NOT_PAID', sessionId };
  store.plateOrders ||= []; store.purchases ||= []; store.creatorLedger ||= []; store.events ||= []; store.users ||= [];
  const metadata = session.metadata || {};
  const orderId = String(metadata.plateOrderId || '').trim();
  const order = store.plateOrders.find(x => x.id === orderId);
  if (!order) throw Object.assign(new Error('Plate order not found'), { status: 422 });
  if (order.buyerId !== String(metadata.buyerId || '').trim() || order.sellerId !== String(metadata.sellerId || '').trim()) {
    throw Object.assign(new Error('Plate order Checkout metadata mismatch'), { status: 422 });
  }
  if (order.status === 'paid') return { applied: false, reason: 'ALREADY_APPLIED', order };
  const amountCents = cents(session.amount_total);
  if (amountCents !== cents(order.amountCents)) throw Object.assign(new Error('Plate order amount mismatch'), { status: 422 });
  const feeCents = Math.round(amountCents * PLATE_PLATFORM_FEE_BPS / 10000);
  const sellerCents = amountCents - feeCents;
  order.status = 'paid';
  order.paymentProof = 'stripe_server_verified';
  order.stripeCheckoutSessionId = sessionId;
  order.stripePaymentIntentId = session.payment_intent || null;
  order.platformFeeCents = feeCents;
  order.sellerCents = sellerCents;
  order.paidAt = now;
  const seller = store.users.find(x => x.id === order.sellerId);
  if (seller) seller.payableBalanceCents = cents(seller.payableBalanceCents) + sellerCents;
  const purchase = { id: `plate_${sessionId}`, kind: 'plate_drop', status: 'paid', paymentProof: 'stripe_server_verified', stripeCheckoutSessionId: sessionId, stripePaymentIntentId: session.payment_intent || null, buyerId: order.buyerId, creatorId: order.sellerId, plateOrderId: order.id, dropId: order.dropId, amountCents, platformFeeCents: feeCents, creatorCents: sellerCents, currency: String(session.currency || 'usd').toLowerCase(), paidAt: now, createdAt: now };
  store.purchases.push(purchase);
  store.creatorLedger.push({ id: `plate_ledger_${sessionId}`, creatorId: order.sellerId, purchaseId: purchase.id, type: 'earning', status: 'payable', grossCents: amountCents, platformFeeCents: feeCents, netCents: sellerCents, currency: purchase.currency, source: 'plate_drop', plateOrderId: order.id, dropId: order.dropId, stripeCheckoutSessionId: sessionId, createdAt: now });
  store.events.push({ id: `plate_money_${sessionId}`, type: 'plate.payment.verified', source: 'stripe', stripeCheckoutSessionId: sessionId, plateOrderId: order.id, purchaseId: purchase.id, createdAt: now });
  return { applied: true, order, purchase };
}

function releaseInventory(store, order) {
  if (!order || order.inventoryReleased) return;
  const drop = (store.plateDrops || []).find(x => x.id === order.dropId);
  if (drop) {
    drop.available = Math.min(drop.quantity, cents(drop.available) + cents(order.quantity));
    drop.reserved = Math.max(0, cents(drop.reserved) - cents(order.quantity));
    if (drop.status === 'sold_out' && drop.available > 0) drop.status = 'preorder';
  }
  order.inventoryReleased = true;
}

module.exports = function plateDropRoutes({ app, auth, clean, id, getStore, saveStore }) {
  const ensure = () => {
    const store = getStore();
    store.kitchenProfiles ||= []; store.kitchenShifts ||= []; store.plateDrops ||= []; store.plateOrders ||= [];
    store.purchases ||= []; store.creatorLedger ||= []; store.events ||= [];
    return store;
  };
  const own = (row, user) => row && (row.sellerId === user.id || user.role === 'admin');
  const stripeClient = () => process.env.STRIPE_SECRET_KEY ? new (require('stripe'))(process.env.STRIPE_SECRET_KEY) : null;

  app.get('/api/plate-drops', (_req, res) => {
    const store = ensure();
    res.json({ plateDrops: store.plateDrops.filter(x => ['preorder','open','sold_out'].includes(x.status)) });
  });

  app.post('/api/kitchen-profile', auth, async (req, res) => {
    const store = ensure();
    let profile = store.kitchenProfiles.find(x => x.sellerId === req.user.id);
    const next = { sellerId: req.user.id, businessName: clean(req.body.businessName, 100), kitchenName: clean(req.body.kitchenName, 120), kitchenAddress: clean(req.body.kitchenAddress, 200), licenseReference: clean(req.body.licenseReference, 100), sanitationCertificate: clean(req.body.sanitationCertificate, 100), insuranceReference: clean(req.body.insuranceReference, 100), complianceStatus: 'pending_review', updatedAt: new Date().toISOString() };
    if (!next.businessName || !next.kitchenName || !next.kitchenAddress) return res.status(400).json({ error: 'Business name, kitchen name and kitchen address are required' });
    if (profile) Object.assign(profile, next); else { profile = { id: id('kit'), ...next, createdAt: next.updatedAt }; store.kitchenProfiles.push(profile); }
    await saveStore(); res.status(201).json({ profile });
  });

  app.post('/api/admin/kitchen-profile/:profileId/review', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const store = ensure();
    const profile = store.kitchenProfiles.find(x => x.id === req.params.profileId);
    if (!profile) return res.status(404).json({ error: 'Kitchen profile not found' });
    const decision = clean(req.body.status, 30);
    if (!['approved','rejected','pending_review'].includes(decision)) return res.status(400).json({ error: 'Invalid compliance status' });
    profile.complianceStatus = decision; profile.reviewNote = clean(req.body.note, 500); profile.reviewedAt = new Date().toISOString(); profile.reviewedBy = req.user.id;
    await saveStore(); res.json({ profile });
  });

  app.post('/api/kitchen-shifts', auth, async (req, res) => {
    const store = ensure();
    const profile = store.kitchenProfiles.find(x => x.sellerId === req.user.id);
    if (!profile) return res.status(400).json({ error: 'Create a kitchen profile first' });
    if (profile.complianceStatus !== 'approved') return res.status(403).json({ error: 'Kitchen profile must be approved before scheduling production' });
    const startsAt = String(req.body.startsAt || '').trim(), endsAt = String(req.body.endsAt || '').trim();
    if (!startsAt || !endsAt || Number.isNaN(Date.parse(startsAt)) || Number.isNaN(Date.parse(endsAt)) || Date.parse(endsAt) <= Date.parse(startsAt)) return res.status(400).json({ error: 'Valid shift start and end are required' });
    const shift = { id: id('shift'), sellerId: req.user.id, kitchenProfileId: profile.id, startsAt, endsAt, status: 'scheduled', createdAt: new Date().toISOString() };
    store.kitchenShifts.push(shift); await saveStore(); res.status(201).json({ shift });
  });

  app.post('/api/plate-drops', auth, async (req, res) => {
    const store = ensure();
    const shift = store.kitchenShifts.find(x => x.id === clean(req.body.kitchenShiftId, 80));
    if (!own(shift, req.user)) return res.status(400).json({ error: 'A valid kitchen shift is required' });
    const profile = store.kitchenProfiles.find(x => x.id === shift.kitchenProfileId);
    if (!profile || profile.complianceStatus !== 'approved') return res.status(403).json({ error: 'Approved kitchen compliance is required' });
    const quantity = Math.max(1, Math.min(10000, Number(req.body.quantity || 1)));
    const priceCents = Math.max(100, Math.min(1000000, Number(req.body.priceCents || 0)));
    const fulfillment = Array.isArray(req.body.fulfillment) ? req.body.fulfillment.filter(x => ['pickup','delivery'].includes(x)) : ['pickup'];
    const drop = { id: id('drop'), sellerId: req.user.id, kitchenShiftId: shift.id, title: clean(req.body.title, 120), description: clean(req.body.description, 600), priceCents, quantity, reserved: 0, available: quantity, serviceStartsAt: req.body.serviceStartsAt || shift.startsAt, serviceEndsAt: req.body.serviceEndsAt || shift.endsAt, fulfillment: fulfillment.length ? fulfillment : ['pickup'], status: 'preorder', createdAt: new Date().toISOString() };
    if (!drop.title) return res.status(400).json({ error: 'Plate Drop title is required' });
    store.plateDrops.push(drop); await saveStore(); res.status(201).json({ plateDrop: drop });
  });

  app.post('/api/plate-drops/:dropId/reserve', auth, async (req, res) => {
    const store = ensure();
    const drop = store.plateDrops.find(x => x.id === req.params.dropId);
    if (!drop || !['preorder','open'].includes(drop.status)) return res.status(404).json({ error: 'Plate Drop unavailable' });
    const quantity = Math.max(1, Math.min(20, Number(req.body.quantity || 1)));
    if (quantity > drop.available) return res.status(409).json({ error: 'Not enough plates available', available: drop.available });
    const fulfillment = ['pickup','delivery'].includes(req.body.fulfillment) ? req.body.fulfillment : 'pickup';
    if (!drop.fulfillment.includes(fulfillment)) return res.status(400).json({ error: 'Selected fulfillment method is unavailable' });
    const order = { id: id('ord'), dropId: drop.id, buyerId: req.user.id, sellerId: drop.sellerId, quantity, amountCents: drop.priceCents * quantity, fulfillment, status: 'reserved_payment_pending', refundable: true, createdAt: new Date().toISOString() };
    drop.reserved += quantity; drop.available -= quantity; if (!drop.available) drop.status = 'sold_out'; store.plateOrders.push(order); await saveStore(); res.status(201).json({ order, plateDrop: drop });
  });

  app.post('/api/plate-orders/:orderId/checkout', auth, async (req, res, next) => {
    try {
      const store = ensure(); const order = store.plateOrders.find(x => x.id === req.params.orderId);
      if (!order) return res.status(404).json({ error: 'Plate order not found' });
      if (order.buyerId !== req.user.id) return res.status(403).json({ error: 'Order does not belong to this account' });
      if (order.status === 'paid') return res.status(409).json({ error: 'Order is already paid' });
      const drop = store.plateDrops.find(x => x.id === order.dropId); const stripe = stripeClient();
      if (!stripe) return res.status(503).json({ error: 'Stripe is not configured', code: 'STRIPE_NOT_CONFIGURED' });
      const checkout = await stripe.checkout.sessions.create({ mode: 'payment', customer_email: req.user.email, line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: order.amountCents, product_data: { name: `TRYAMM Plate Drop: ${drop?.title || 'Order'}` } } }], metadata: { kind: 'plate_drop', plateOrderId: order.id, buyerId: order.buyerId, sellerId: order.sellerId, dropId: order.dropId }, success_url: `${process.env.APP_URL || 'http://localhost:10000'}/?platePayment=success&session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${process.env.APP_URL || 'http://localhost:10000'}/?platePayment=cancelled&order=${order.id}` });
      order.stripeCheckoutSessionId = checkout.id; order.checkoutCreatedAt = new Date().toISOString(); await saveStore(); res.json({ url: checkout.url, sessionId: checkout.id, orderId: order.id });
    } catch (error) { next(error); }
  });

  app.post('/api/plate-orders/:orderId/verify-payment', auth, async (req, res, next) => {
    try {
      const store = ensure(); const order = store.plateOrders.find(x => x.id === req.params.orderId);
      if (!order) return res.status(404).json({ error: 'Plate order not found' });
      if (order.buyerId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Order does not belong to this account' });
      const stripe = stripeClient(); if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });
      const sessionId = clean(req.body.sessionId || order.stripeCheckoutSessionId, 200); const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (String(session.metadata?.plateOrderId || '') !== order.id) return res.status(422).json({ error: 'Checkout does not match plate order' });
      const result = applyPlatePayment({ store, session }); if (result.applied) await saveStore();
      res.status(result.reason === 'NOT_PAID' ? 202 : 200).json({ ok: true, ...result });
    } catch (error) { next(error); }
  });

  app.post('/api/plate-orders/:orderId/cancel', auth, async (req, res, next) => {
    try {
      const store = ensure(); const order = store.plateOrders.find(x => x.id === req.params.orderId);
      if (!order) return res.status(404).json({ error: 'Plate order not found' });
      if (order.buyerId !== req.user.id && order.sellerId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not permitted' });
      if (['cancelled','refunded'].includes(order.status)) return res.json({ order });
      if (order.status === 'paid') {
        const stripe = stripeClient(); if (!stripe || !order.stripePaymentIntentId) return res.status(503).json({ error: 'Paid order requires Stripe refund processing' });
        const refund = await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId, metadata: { plateOrderId: order.id } });
        order.status = 'refunded'; order.stripeRefundId = refund.id; order.refundedAt = new Date().toISOString();
        const ledger = store.creatorLedger.find(x => x.plateOrderId === order.id && x.type === 'earning'); if (ledger) ledger.status = 'refunded';
        const seller = (store.users || []).find(x => x.id === order.sellerId); if (seller) seller.payableBalanceCents = Math.max(0, cents(seller.payableBalanceCents) - cents(order.sellerCents));
      } else order.status = 'cancelled';
      releaseInventory(store, order); await saveStore(); res.json({ order });
    } catch (error) { next(error); }
  });

  app.get('/api/my/plate-business', auth, (req, res) => {
    const store = ensure();
    res.json({ profile: store.kitchenProfiles.find(x => x.sellerId === req.user.id) || null, shifts: store.kitchenShifts.filter(x => x.sellerId === req.user.id), drops: store.plateDrops.filter(x => x.sellerId === req.user.id), orders: store.plateOrders.filter(x => x.sellerId === req.user.id || x.buyerId === req.user.id), platformFeeBps: PLATE_PLATFORM_FEE_BPS });
  });
};

module.exports.applyPlatePayment = applyPlatePayment;
module.exports.releaseInventory = releaseInventory;
