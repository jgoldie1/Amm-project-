/**
 * TRYAMM domain operations: a safe, provider-neutral draft workflow.
 * No registrar calls, payments, DNS writes or external storage occur here.
 * Consumers must supply a real registrar adapter and authenticated storage.
 */
export const DOMAIN_ACTIONS = Object.freeze({ REGISTER: 'register', TRANSFER: 'transfer' });
const NAME_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
export function normalizeDomain(input) {
  if (typeof input !== 'string') throw new TypeError('Domain must be text');
  const domain = input.trim().toLowerCase().replace(/\.$/, '');
  if (!NAME_PATTERN.test(domain)) throw new Error('Enter a valid internationalized domain in ASCII/Punycode form');
  return domain;
}
export function prepareDomainOrder({ action, domain, customerId, websiteId, idempotencyKey, transferAuthorizationConfirmed = false }) {
  if (!Object.values(DOMAIN_ACTIONS).includes(action)) throw new Error('Unsupported domain operation');
  const normalized = normalizeDomain(domain);
  for (const [key, value] of Object.entries({ customerId, websiteId, idempotencyKey })) {
    if (typeof value !== 'string' || !value.trim() || value.length > 256) throw new Error('Invalid ' + key);
  }
  if (action === DOMAIN_ACTIONS.TRANSFER && transferAuthorizationConfirmed !== true) {
    throw new Error('Domain transfer requires confirmation from the authorized domain holder');
  }
  return Object.freeze({
    action,
    domain: normalized,
    customerId: customerId.trim(),
    websiteId: websiteId.trim(),
    idempotencyKey: idempotencyKey.trim(),
    status: 'draft',
    requires: action === DOMAIN_ACTIONS.REGISTER
      ? ['authoritative-availability', 'current-price-and-renewal-price', 'registrant-consent', 'verified-payment', 'registrar-account', 'dns-and-tls']
      : ['domain-ownership-verification', 'unlock-domain', 'registrar-transfer-authorization', 'current-transfer-price', 'holder-consent', 'verified-payment-if-applicable', 'status-monitoring', 'dns-and-tls']
  });
}
/**
 * State-only transition. Caller must verify events server side, persist atomically,
 * enforce user/tenant ownership, and use unique idempotency keys in the database.
 */
const ALLOWED = Object.freeze({
  draft: ['quoted', 'cancelled'],
  quoted: ['authorized', 'cancelled'],
  authorized: ['submitted', 'cancelled'],
  submitted: ['pending', 'completed', 'failed'],
  pending: ['completed', 'failed'],
  failed: ['cancelled'],
  completed: [],
  cancelled: []
});
export function transitionDomainOrder(order, nextStatus) {
  if (!order || !Array.isArray(ALLOWED[order.status])) throw new Error('Unknown current status');
  if (!ALLOWED[order.status].includes(nextStatus)) throw new Error('Invalid domain operation transition');
  return Object.freeze({ ...order, status: nextStatus });
}
/** Do not store authorization/EPP codes in catalog records or client state. */
export function publicDomainOrder(order) {
  const { authorizationCode, transferCode, eppCode, paymentDetails, ...safe } = order;
  return safe;
}
