'use strict';

const assert = require('assert');
const { applyPlatePayment, releaseInventory } = require('../lib/plate-drop-routes');

const store = {
  users: [
    { id: 'buyer_1', displayName: 'Buyer' },
    { id: 'seller_1', displayName: 'Seller', payableBalanceCents: 0 }
  ],
  plateDrops: [{ id: 'drop_1', quantity: 10, reserved: 2, available: 8, status: 'preorder' }],
  plateOrders: [{ id: 'ord_1', dropId: 'drop_1', buyerId: 'buyer_1', sellerId: 'seller_1', quantity: 2, amountCents: 4000, status: 'reserved_payment_pending' }],
  purchases: [], creatorLedger: [], events: []
};

const unpaid = applyPlatePayment({ store, session: { id: 'cs_unpaid', payment_status: 'unpaid', metadata: { plateOrderId: 'ord_1', buyerId: 'buyer_1', sellerId: 'seller_1' } } });
assert.strictEqual(unpaid.applied, false);
assert.strictEqual(store.creatorLedger.length, 0);

const paidSession = {
  id: 'cs_plate_1', payment_status: 'paid', payment_intent: 'pi_plate_1', amount_total: 4000, currency: 'usd',
  metadata: { kind: 'plate_drop', plateOrderId: 'ord_1', buyerId: 'buyer_1', sellerId: 'seller_1', dropId: 'drop_1' }
};
const paid = applyPlatePayment({ store, session: paidSession, now: '2026-09-11T15:00:00.000Z' });
assert.strictEqual(paid.applied, true);
assert.strictEqual(store.plateOrders[0].status, 'paid');
assert.strictEqual(store.plateOrders[0].paymentProof, 'stripe_server_verified');
assert.strictEqual(store.plateOrders[0].platformFeeCents, 1000);
assert.strictEqual(store.plateOrders[0].sellerCents, 3000);
assert.strictEqual(store.users[1].payableBalanceCents, 3000);
assert.strictEqual(store.purchases.length, 1);
assert.strictEqual(store.creatorLedger.length, 1);

const duplicate = applyPlatePayment({ store, session: paidSession });
assert.strictEqual(duplicate.applied, false);
assert.strictEqual(duplicate.reason, 'ALREADY_APPLIED');
assert.strictEqual(store.users[1].payableBalanceCents, 3000);
assert.strictEqual(store.creatorLedger.length, 1);

releaseInventory(store, store.plateOrders[0]);
assert.strictEqual(store.plateDrops[0].available, 10);
assert.strictEqual(store.plateDrops[0].reserved, 0);
releaseInventory(store, store.plateOrders[0]);
assert.strictEqual(store.plateDrops[0].available, 10, 'inventory release must be idempotent');

console.log('TRYAMM Plate Drop payment and inventory smoke passed');
