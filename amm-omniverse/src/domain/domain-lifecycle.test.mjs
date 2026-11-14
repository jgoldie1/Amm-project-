import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDomain, prepareDomainOrder, transitionDomainOrder, publicDomainOrder } from './domain-lifecycle.mjs';

test('canonical domain names and invalid names', () => {
  assert.equal(normalizeDomain('  My-Site.COM. '), 'my-site.com');
  for (const bad of ['http://site.com', 'site', 'a..com', '-name.com', 'name.com/path', '']) {
    assert.throws(() => normalizeDomain(bad));
  }
});
test('registration is draft only and needs payment and registrar', () => {
  const draft = prepareDomainOrder({ action: 'register', domain: 'tryamm-demo.com', customerId: 'customer-1', websiteId: 'site-1', idempotencyKey: 'order-1' });
  assert.equal(draft.status, 'draft');
  assert.ok(draft.requires.includes('verified-payment'));
  assert.ok(draft.requires.includes('registrar-account'));
  assert.throws(() => transitionDomainOrder(draft, 'completed'));
  assert.equal(transitionDomainOrder(draft, 'quoted').status, 'quoted');
});
test('transfers require confirmed domain-holder authorization', () => {
  const fields = { action: 'transfer', domain: 'already-owned.org', customerId: 'customer-1', websiteId: 'site-1', idempotencyKey: 'transfer-1' };
  assert.throws(() => prepareDomainOrder(fields), /authorized domain holder/);
  const draft = prepareDomainOrder({ ...fields, transferAuthorizationConfirmed: true });
  assert.ok(draft.requires.includes('registrar-transfer-authorization'));
});
test('only legal state transitions and safe public fields', () => {
  const order = prepareDomainOrder({ action: 'register', domain: 'example.net', customerId: 'c', websiteId: 'w', idempotencyKey: 'k' });
  const quoted = transitionDomainOrder(order, 'quoted');
  const authorized = transitionDomainOrder(quoted, 'authorized');
  assert.equal(transitionDomainOrder(authorized, 'submitted').status, 'submitted');
  assert.throws(() => transitionDomainOrder(authorized, 'completed'));
  assert.equal(publicDomainOrder({ ...order, eppCode: 'SECRET', authorizationCode: 'HIDDEN' }).eppCode, undefined);
});
