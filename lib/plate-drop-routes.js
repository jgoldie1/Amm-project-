'use strict';

module.exports = function plateDropRoutes({ app, auth, clean, id, getStore, saveStore }) {
  const ensure = () => {
    const store = getStore();
    store.kitchenProfiles ||= [];
    store.kitchenShifts ||= [];
    store.plateDrops ||= [];
    store.plateOrders ||= [];
    return store;
  };
  const own = (row, user) => row && (row.sellerId === user.id || user.role === 'admin');

  app.get('/api/plate-drops', (_req, res) => {
    const store = ensure();
    res.json({ plateDrops: store.plateDrops.filter(x => ['preorder','open','sold_out'].includes(x.status)) });
  });

  app.post('/api/kitchen-profile', auth, async (req, res) => {
    const store = ensure();
    let profile = store.kitchenProfiles.find(x => x.sellerId === req.user.id);
    const next = {
      sellerId: req.user.id,
      businessName: clean(req.body.businessName, 100),
      kitchenName: clean(req.body.kitchenName, 120),
      kitchenAddress: clean(req.body.kitchenAddress, 200),
      licenseReference: clean(req.body.licenseReference, 100),
      sanitationCertificate: clean(req.body.sanitationCertificate, 100),
      insuranceReference: clean(req.body.insuranceReference, 100),
      complianceStatus: 'pending_review',
      updatedAt: new Date().toISOString()
    };
    if (profile) Object.assign(profile, next); else { profile = { id: id('kit'), ...next, createdAt: next.updatedAt }; store.kitchenProfiles.push(profile); }
    await saveStore(); res.status(201).json({ profile });
  });

  app.post('/api/kitchen-shifts', auth, async (req, res) => {
    const store = ensure();
    const profile = store.kitchenProfiles.find(x => x.sellerId === req.user.id);
    if (!profile) return res.status(400).json({ error: 'Create a kitchen profile first' });
    const shift = { id: id('shift'), sellerId: req.user.id, kitchenProfileId: profile.id, startsAt: req.body.startsAt, endsAt: req.body.endsAt, status: 'scheduled', createdAt: new Date().toISOString() };
    if (!shift.startsAt || !shift.endsAt) return res.status(400).json({ error: 'Shift start and end are required' });
    store.kitchenShifts.push(shift); await saveStore(); res.status(201).json({ shift });
  });

  app.post('/api/plate-drops', auth, async (req, res) => {
    const store = ensure();
    const shift = store.kitchenShifts.find(x => x.id === clean(req.body.kitchenShiftId, 80));
    if (!own(shift, req.user)) return res.status(400).json({ error: 'A valid kitchen shift is required' });
    const quantity = Math.max(1, Math.min(10000, Number(req.body.quantity || 1)));
    const priceCents = Math.max(100, Math.min(1000000, Number(req.body.priceCents || 0)));
    const drop = { id: id('drop'), sellerId: req.user.id, kitchenShiftId: shift.id, title: clean(req.body.title, 120), description: clean(req.body.description, 600), priceCents, quantity, reserved: 0, available: quantity, serviceStartsAt: req.body.serviceStartsAt || shift.startsAt, serviceEndsAt: req.body.serviceEndsAt || shift.endsAt, fulfillment: Array.isArray(req.body.fulfillment) ? req.body.fulfillment.filter(x => ['pickup','delivery'].includes(x)) : ['pickup'], status: 'preorder', createdAt: new Date().toISOString() };
    if (!drop.title) return res.status(400).json({ error: 'Plate Drop title is required' });
    store.plateDrops.push(drop); await saveStore(); res.status(201).json({ plateDrop: drop });
  });

  app.post('/api/plate-drops/:dropId/reserve', auth, async (req, res) => {
    const store = ensure();
    const drop = store.plateDrops.find(x => x.id === req.params.dropId);
    if (!drop || !['preorder','open'].includes(drop.status)) return res.status(404).json({ error: 'Plate Drop unavailable' });
    const quantity = Math.max(1, Math.min(20, Number(req.body.quantity || 1)));
    if (quantity > drop.available) return res.status(409).json({ error: 'Not enough plates available', available: drop.available });
    const order = { id: id('ord'), dropId: drop.id, buyerId: req.user.id, sellerId: drop.sellerId, quantity, amountCents: drop.priceCents * quantity, fulfillment: ['pickup','delivery'].includes(req.body.fulfillment) ? req.body.fulfillment : 'pickup', status: 'reserved_payment_pending', refundable: true, createdAt: new Date().toISOString() };
    drop.reserved += quantity; drop.available -= quantity; if (!drop.available) drop.status = 'sold_out'; store.plateOrders.push(order); await saveStore(); res.status(201).json({ order, plateDrop: drop });
  });

  app.get('/api/my/plate-business', auth, (req, res) => {
    const store = ensure();
    res.json({ profile: store.kitchenProfiles.find(x => x.sellerId === req.user.id) || null, shifts: store.kitchenShifts.filter(x => x.sellerId === req.user.id), drops: store.plateDrops.filter(x => x.sellerId === req.user.id), orders: store.plateOrders.filter(x => x.sellerId === req.user.id || x.buyerId === req.user.id) });
  });
};
