import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const checkout = read('../api/commerce/checkout.js');
const assets = read('../api/commerce/assets.js');
const listings = read('../api/commerce/listings.js');
const refunds = read('../api/commerce/refunds.js');
const orders = read('../api/commerce/orders.js');
const entitlements = read('../api/commerce/entitlements.js');

assert.ok(checkout.includes("adminRest('commerce_listings'"), 'checkout must resolve listings server-side');
assert.ok(checkout.includes("status:'eq.published'"), 'checkout must accept published listings only');
assert.ok(checkout.includes("provenance_status:'eq.verified'"), 'checkout must recheck provenance');
assert.ok(checkout.includes("rights_status:'eq.verified'"), 'checkout must recheck rights');
assert.ok(checkout.includes("certification_status:'eq.verified'"), 'checkout must recheck certification');
assert.ok(checkout.includes('sellerBasisPoints:4000,platformBasisPoints:4000,reserveBasisPoints:2000'), 'asset split must be 40/40/20');
assert.ok(checkout.includes('Math.round(Number(listing.price)*100)'), 'price must be converted on the server');
for (const forbidden of ['req.body?.price','req.body?.amount','req.body?.unitAmount','req.body?.split','req.body?.sellerBasisPoints','req.body?.platformBasisPoints','req.body?.reserveBasisPoints']) {
  assert.ok(!checkout.includes(forbidden), 'checkout must not trust client money field: '+forbidden);
}
assert.ok(checkout.includes('metadata:x.metadata||{}'), 'order item must persist asset snapshot');
assert.ok(checkout.includes('reserve_cents:x.reserve'), 'checkout must persist reserve allocation');

for (const token of ["provenance_status:'pending'","rights_status:'pending'","certification_status:'pending'"]) {
  assert.ok(assets.includes(token), 'new assets must start pending: '+token);
}
assert.ok(assets.includes('TRYAMM_INTERNAL_COMPLIANCE_SECRET'), 'asset verification must require compliance secret');
assert.ok(assets.includes('timingSafeEqual'), 'internal secret comparison must be timing-safe');

assert.ok(listings.includes("status:'review'"), 'new asset listings must enter review');
assert.ok(listings.includes('verifiedAsset(asset)'), 'listing creation must require certification');
assert.ok(listings.includes('TRYAMM_INTERNAL_COMPLIANCE_SECRET'), 'publication must require compliance authorization');
assert.ok(listings.includes("status==='published'"), 'publication must recheck certification');

assert.ok(refunds.includes("reason:'refund_request'"), 'refunds must enter durable review');
assert.ok(refunds.includes('Money is not moved until the provider refund and reversal are verified server-side.'), 'refund endpoint must not claim settlement');
assert.ok(!refunds.includes('stripe.refunds.create') && !refunds.includes('refunds.create('), 'buyer refund route must not autonomously move provider money');

assert.ok(orders.includes('requireUser'), 'order history must require authentication');
assert.ok(entitlements.includes('requireUser'), 'entitlement history must require authentication');

console.log('Asset commerce convergence contract: PASS');
