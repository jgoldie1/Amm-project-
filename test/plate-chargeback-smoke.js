'use strict';

const assert = require('assert');
const { applyDispute, resolveDispute } = require('../lib/plate-chargeback-routes');

const baseStore = () => ({
  users: [
    { id: 'buyer_1' },
    { id: 'seller_1', payableBalanceCents: 3000, chargebackHoldCents: 0 }
  ],
  plateOrders: [{
    id: 'ord_1', buyerId: 'buyer_1', sellerId: 'seller_1', amountCents: 4000,
    sellerCents: 3000, stripePaymentIntentId: 'pi_1', status: 'paid'
  }],
  creatorLedger: [{ id: 'led_1', plateOrderId: 'ord_1', creatorId: 'seller_1', type: 'earning', status: 'payable', netCents: 3000 }],
  events: [],
  chargebackCases: []
});

{
  const store = baseStore();
  const opened = applyDispute({ store, dispute: { id: 'dp_1', payment_intent: 'pi_1', amount: 4000, reason: 'fraudulent', status: 'needs_response' }, now: '2026-09-11T16:00:00.000Z' });
  assert.strictEqual(opened.applied, true);
  assert.strictEqual(store.plateOrders[0].status, 'disputed');
  assert.strictEqual(store.users[1].payableBalanceCents, 0);
  assert.strictEqual(store.users[1].chargebackHoldCents, 3000);
  assert.strictEqual(store.creatorLedger[0].status, 'disputed');
  const duplicate = applyDispute({ store, dispute: { id: 'dp_1', payment_intent: 'pi_1', amount: 4000 } });
  assert.strictEqual(duplicate.applied, false);
  assert.strictEqual(duplicate.reason, 'ALREADY_APPLIED');

  const won = resolveDispute({ store, dispute: { id: 'dp_1', status: 'won' }, now: '2026-09-12T16:00:00.000Z' });
  assert.strictEqual(won.applied, true);
  assert.strictEqual(won.won, true);
  assert.strictEqual(store.users[1].payableBalanceCents, 3000);
  assert.strictEqual(store.users[1].chargebackHoldCents, 0);
  assert.strictEqual(store.plateOrders[0].status, 'paid');
  assert.strictEqual(store.creatorLedger[0].status, 'payable');
}

{
  const store = baseStore();
  applyDispute({ store, dispute: { id: 'dp_2', payment_intent: 'pi_1', amount: 4000, reason: 'product_not_received', status: 'needs_response' } });
  const lost = resolveDispute({ store, dispute: { id: 'dp_2', status: 'lost' } });
  assert.strictEqual(lost.applied, true);
  assert.strictEqual(lost.won, false);
  assert.strictEqual(store.users[1].payableBalanceCents, 0);
  assert.strictEqual(store.users[1].chargebackHoldCents, 0);
  assert.strictEqual(store.plateOrders[0].status, 'chargeback_lost');
  assert.strictEqual(store.creatorLedger[0].status, 'chargeback_lost');
}

console.log('TRYAMM Plate Drop chargeback protection smoke passed');
