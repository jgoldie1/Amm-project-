# TRYAMM Website OS: Test Checkout Pilot

Status: code committed on protected branch. NOT LIVE. No Stripe charge, DNS change, DB schema change or customer email sent.

## Existing flow
- Holo Reels storyboard -> approved campaign -> consented inquiry -> business owner's Website OS quote.
- Customer receives a private one-time quote acceptance link through configured transactional mail.
- Customer explicitly accepts itemized scope, price, delivery/revision/refund terms.
- Business owner may POST /api/website-os/orders/:id/test-checkout with confirm:true.
- The server revalidates order ownership, customer-accepted status, signed-in account, recorded inquiry email, USD amount, and server TEST Stripe key.
- A PostgreSQL row lock reserves one immutable Checkout attempt using public.tryamm_reserve_order_checkout.
- Stripe Checkout session is created with deterministic idempotency key tryamm-website-<attemptId>, and the exact returned TEST session ID is durably linked using public.tryamm_bind_order_checkout.
- The existing Stripe webhook performs server-side event retrieval and session retrieval and dispatches website-order events to a separate settlement RPC, which only marks paid for an exact linked session, paid amount, and currency.
- The fulfillment outbox records an event but **does not yet create or deliver a website**.

## Staging requirements in correct order
1. Verify a new isolated staging Supabase project; back up and review existing Website OS tables.
2. Apply and test scoped schemas: website-brand-projects, campaign funnel, website orders, acceptance, checkout reservation, settlement receipts and outbox. Do not apply directly to production without backup/approval.
3. Run database RLS/grant advisors and cross-business isolation tests. The service-only RPC cannot be callable by anon/authenticated roles.
4. Configure Stripe test-mode account, a verified HTTPS APP_URL and server-only Stripe secret. Never print the key or put it in a frontend variable.
5. Set TRYAMM_ORDERS_DURABLE_ENABLED=true only in staging after tests; verify order status starts quote-pending.
6. Verify the customer-owned transactional mail domain, server-only RESEND_API_KEY and TRYAMM_QUOTE_FROM_EMAIL before enabling TRYAMM_QUOTE_ACCEPTANCE_ENABLED=true.
7. Test single-use acceptance, expired link, changed price, two simultaneous clicks, unauthorized owner, and failed mail delivery.
8. Run SQL concurrency tests with two concurrent Checkout reservation calls: only one new attempt may be reserved.
9. Enable TRYAMM_CHECKOUT_TEST_ENABLED=true in staging only; create one Checkout through owner API after customer acceptance.
10. Simulate provider timeout after Checkout creation; verify the system blocks a second session and requires reconciliation.
11. Verify Stripe session binding before sending the Checkout URL to an authorized customer; do not infer payment from success_url.
12. Enable TRYAMM_ORDERS_STRIPE_SETTLEMENT_ENABLED=true only after atomic SQL reconciliation tests.
13. Complete test payment and verify one paid record, one unique event receipt and one fulfillment outbox item; replay webhooks and confirm no duplicates.
14. Verify failed/async payments, refunds and disputes. Add tested refund reconciliation before full commercial launch.
15. Implement customer-facing verified order access, support history, delivery acceptance, backups/restores, retention, analytics and an incident/rollback plan.

## Permanent safety rules
- The server adapter rejects Stripe live-mode webhook events and non-test Stripe API keys.
- A Checkout attempt is not automatically cleared after a timeout: provider may already have created the session.
- Only verified server-side sessions can settle orders; the frontend cannot submit payment proof.
- The quote acceptance email link stays private to the intended customer, never included in an owner API reply.
- A test Checkout URL returned to the owner API is for staged testing only; do not treat it as a production public purchase button.

## Commands
- npm run test:quote-acceptance
- npm run test:orders
- npm run test:checkout
- npm run test:order-settlement
- npm run syntax
- npm test

A full suite pass, mobile browser test and database concurrency drill are required before production certification.
