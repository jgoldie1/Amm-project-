'use strict';

const assert = require('assert');
const { applyPaidCheckout, earningsFor } = require('../lib/payment-routes');

const store = {
  users: [
    { id: 'buyer_1', displayName: 'Buyer' },
    { id: 'creator_1', displayName: 'Creator', payableBalanceCents: 0 }
  ],
  rooms: [{ id: 'room_1', hostId: 'creator_1' }],
  purchases: [],
  creatorLedger: [],
  events: []
};

const unpaid = applyPaidCheckout({
  store,
  session: {
    id: 'cs_unpaid',
    payment_status: 'unpaid',
    amount_total: 1000,
    currency: 'usd',
    metadata: { buyerId: 'buyer_1', creatorId: 'creator_1', roomId: 'room_1' }
  }
});
assert.strictEqual(unpaid.applied, false);
assert.strictEqual(store.creatorLedger.length, 0, 'unpaid checkout must never create earnings');

const paidSession = {
  id: 'cs_paid_1',
  payment_status: 'paid',
  payment_intent: 'pi_1',
  amount_total: 1000,
  currency: 'usd',
  metadata: { buyerId: 'buyer_1', creatorId: 'creator_1', roomId: 'room_1', kind: 'ticket' }
};
const paid = applyPaidCheckout({ store, session: paidSession, eventId: 'evt_1', now: '2026-08-23T03:00:00.000Z' });
assert.strictEqual(paid.applied, true);
assert.strictEqual(paid.purchase.status, 'paid');
assert.strictEqual(paid.purchase.paymentProof, 'stripe_server_verified');
assert.strictEqual(paid.purchase.amountCents, 1000);
assert.strictEqual(paid.purchase.platformFeeCents, 250);
assert.strictEqual(paid.purchase.creatorCents, 750);
assert.strictEqual(store.users[1].payableBalanceCents, 750);
assert.strictEqual(store.creatorLedger.length, 1);

const duplicate = applyPaidCheckout({ store, session: paidSession, eventId: 'evt_1' });
assert.strictEqual(duplicate.applied, false);
assert.strictEqual(duplicate.reason, 'ALREADY_APPLIED');
assert.strictEqual(store.users[1].payableBalanceCents, 750, 'duplicate webhook must not double-credit creator');
assert.strictEqual(store.creatorLedger.length, 1, 'duplicate webhook must not duplicate ledger');

const earnings = earningsFor(store, 'creator_1');
assert.strictEqual(earnings.earnedCents, 750);
assert.strictEqual(earnings.payableCents, 750);
assert.strictEqual(earnings.paidOutCents, 0);

console.log('TRYAMM verified payment and creator ledger smoke passed');
