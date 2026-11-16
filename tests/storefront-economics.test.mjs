import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthlyModel, launchPackageModel } from '../scripts/storefront-economics.mjs';
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.00001, `${actual} != ${expected}`);
test('100 businesses reconcile revenue, variable costs and operating surplus', () => {
  const x = monthlyModel({ starter: 50, growth: 40, businessPass: 10 });
  near(x.revenue, 4900); near(x.processing, 206.4); near(x.services, 1510);
  near(x.commissions, 490); near(x.lossReserve, 98); near(x.operatingSurplus, 2095.6);
  assert.equal(x.breakEvenCustomers, 20);
});
test('zero customers still incur overhead and marketing; break-even undefined', () => {
  const x = monthlyModel({}); near(x.operatingSurplus, -500); assert.equal(x.breakEvenCustomers, null);
});
test('doubling service costs reduces surplus and increases break-even', () => {
  const x = monthlyModel({ starter: 50, growth: 40, businessPass: 10 }, { serviceMultiplier: 2 });
  near(x.operatingSurplus, 585.6); assert.equal(x.breakEvenCustomers, 47);
});
test('setup sales are separate from monthly recurring revenue', () => {
  near(launchPackageModel().contribution, 224.349);
  near(launchPackageModel(300).contribution, 124.349);
});
test('invalid inputs cannot silently create a forecast', () => {
  for (const value of [{ starter: -1 }, { starter: 0.5 }, { other: 2 }]) assert.throws(() => monthlyModel(value));
  assert.throws(() => monthlyModel({}, { fixedCosts: NaN }));
  assert.throws(() => launchPackageModel(-1));
});
