# TRYAMM Fulfillment + Holo Delivery: restricted pilot

## Current scope
- `server/tryamm-fulfillment-pilot.mjs` is a **local-only, in-memory prototype**. It is not deployed, production hardened or connected to Stripe, Amazon, TikTok, any warehouse, or any carrier.
- `StreetVerseWarehouseOperationsHUD` displays restricted server records. The warehouse partner portal is a **separate demo** and does not grant real authorization.
- `StreetVerseMobileWorld` includes a Holo Delivery van using the existing driving controller. Realistic loading, NPC handoff and proof-of-delivery gameplay are pending.
- **No real shipments can be released**; there is no release endpoint. There is no operational staff-approval endpoint. Agreement and identity references are placeholders pending human due diligence.

## Local development (Node 24)
```bash
cd amm-omniverse
export TRYAMM_OPS_TOKEN='replace-with-a-random-secret-at-least-32-chars'
export TRYAMM_PAYMENT_WEBHOOK_SECRET='replace-with-provider-specific-test-secret'
export TRYAMM_CARRIER_WEBHOOK_SECRET='replace-with-provider-specific-test-secret'
node server/tryamm-fulfillment-pilot.mjs
node --test tests/streetverse-fulfillment-server.test.mjs
node --test tests/streetverse-holo-delivery-behavior.mjs
node tests/streetverse-fulfillment-integration-contract.mjs
npm run typecheck
```
Never put real secrets in Vite client environment variables, source control, screenshots, or the demo HUD. The prototype's local token input is only for temporary testing.

## First real partner / seller / shipment acceptance gate
1. Sign an agreement with one warehouse, verify the legal entity, coverage, rates, insurance and fulfillment SLAs.
2. Verify one seller's business identity, ownership, return policy and product compliance.
3. Implement authenticated staff roles, server sessions, encrypted durable database, audit log, idempotency, request replay protection, rate limiting and scoped seller/partner permissions.
4. Integrate a real payment processor's official webhook signature and event lifecycle. A generic HMAC header in the prototype is **not** a substitute for a provider-specific signature format.
5. Integrate a carrier or approved 3PL's official API, bind tracking to the correct shipment and confirm delivery using carrier-originated events and independent evidence.
6. Run one authorized small test order end to end, reconcile payment, warehouse pick/pack, tracking, delivery and any return.
7. Only then consider a narrowly scoped, audited production shipment release API.

## Regression gate
The GitHub Actions release gate includes server security checks, last-mile state-machine behavior, source integration contracts and TypeScript checking. The workflow must pass before any deployment claim. A green workflow alone does not certify production security or actual shipment delivery.
