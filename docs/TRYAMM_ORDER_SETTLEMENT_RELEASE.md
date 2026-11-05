# TRYAMM Website OS — Stripe Atomic Settlement Release Gate

Status: **STAGING DESIGN / NOT DEPLOYED**.

This extends the existing Holo Reel → approved campaign → consented lead → quote system. No real charge or delivery is activated.

## Implemented source
- lib/tryamm-order-settlement.js validates provider-retrieved Checkout session and event, requires a website-order kind and Stripe **test mode**, then calls an RPC behind an opt-in server feature flag.
- lib/payment-routes.js dispatches website-order webhook events to that adapter; other AI Café and creator events keep their existing handling.
- ops/website-os/tryamm-order-settlement-rpc.sql contains a service-role-only SQL transaction, order row lock, Stripe session/amount/currency checks, unique event receipt, and unique fulfillment outbox record.
- lib/tryamm-order-routes.js reports the disabled checkout and identity-acceptance states.
- test/tryamm-order-settlement-smoke.js checks fail-closed behavior, unrelated payments, malformed sessions and duplicate receipt responses.

## Required before enabling in a staging environment
1. Review the security and durability of website_brand_projects, tryamm_campaigns, tryamm_campaign_leads, tryamm_website_orders, payment event and outbox schemas. Create a separate staging database and backup.
2. Confirm customer identity through verified email or authentication—not merely a typed email in the inquiry form.
3. Implement customer quote acceptance with explicit price and terms and durable identity evidence.
4. Create the Checkout session server-side, idempotently link its Stripe ID to one accepted order before the customer can pay, and reject conflicting claims. Never use an arbitrary browser amount.
5. Configure restricted Stripe **test-mode** credentials and a separate test-mode webhook endpoint.
6. Test the actual database RPC against two concurrent events, Stripe event replay, wrong order, wrong amount, wrong currency, already-delivered order and partial provider failure.
7. Test provider callbacks and page redirects. Only a server-retrieved Stripe paid session plus successful atomic DB settlement advances an order to paid.
8. Test refunds, cancellations, disputes, failed payments, chargebacks, outbox retries and notification idempotency.
9. Verify owner and customer command-center scopes, invoice and delivery stage accessibility, contact consent, data deletion and support handoff.
10. Run mobile browser flow and backup/restore rehearsal. Confirm any existing business website/domain/email continues functioning.

## Environment
- TRYAMM_ORDERS_DURABLE_ENABLED: off until staging and RLS review.
- TRYAMM_ORDERS_STRIPE_SETTLEMENT_ENABLED: off until RPC staging test.
- No production/live-mode settlement path is enabled in this adapter.
- Supabase service-role key and Stripe secret stay exclusively on the server.

**Do not create Stripe checkout sessions for Website OS orders yet.** The identity-verified customer acceptance and atomic session-binding steps are required first.
