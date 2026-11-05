# TRYAMM Customer Order Status — Staging Acceptance

Status: source committed and feature flags OFF. This is not a live deployed customer portal.

## Completed source
- Owner-controlled POST /api/website-os/orders/:id/send-tracking-link emails a read-only 24-hour private tracking link to the original lead address. No request-supplied destination is trusted.
- Customer POST /api/website-os/customer-tracking/lookup checks a SHA-256 token hash, expiry, revocation, original lead email and order existence. A customer cannot access seller-only endpoints or mutate order/payment state.
- GET /api/website-os/customer-tracking/health reports readiness without exposing secrets.
- public/tryamm-order-status.html uses a URL fragment rather than a query parameter, clears that fragment from browser history, shows no-store status, and never collects payment information.
- Existing owner command center now offers the tracking-link invitation action.

## Safeguards and outstanding checks
- The link has 256 bits of random entropy and expires after 24 hours; 5-minute per-order reissue cooldown.
- Mail provider acceptance is NOT proof of recipient inbox delivery.
- No Stripe return URL or local JavaScript state is proof of payment; verified_paid_at in the transactional database is the only receipt signal.
- No access to other customer's lead email, order IDs, quote internals or deployment operations.
- Install ops/website-os/tryamm-customer-order-status.sql only after backup and staging review. Apply RLS, revoke browser access and confirm service-role-only reads.
- Run Node test:customer-orders, browser mobile checks, expired/revoked token tests, rate limiting, brute-force protection and database tenant-isolation tests.
- Confirm a verified, customer-owned sender email domain and deliverability before enabling customer tracking.
- Enable TRYAMM_CUSTOMER_ORDER_STATUS_ENABLED=true only in the isolated staging project after acceptance tests.
- Customer cancellation, refunds, chargebacks, secure content previews and production support history are NOT implemented in this feature.

## Launch dependency
Get one verified order through customer quote acceptance -> Stripe test checkout -> exact, idempotent DB settlement -> buyer order status -> documented website handoff. No live charges until full workflow is certified.
