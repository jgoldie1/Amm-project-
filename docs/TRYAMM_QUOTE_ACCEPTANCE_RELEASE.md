# TRYAMM Secure Customer Quote Acceptance — Staging Gate

**Implemented on protected integration branch, disabled by default.** Does not charge a card, start checkout, or publish a website.

## Workflow
1. A business owner creates a quote from their own campaign lead and approves the quote's scope, price, support and refund terms.
2. The authenticated business owner chooses **Email private quote for customer acceptance** in Website OS command center.
3. Server checks owned order, approved status, stored lead email, a verified transactional sender and a five-minute resend cooldown.
4. A random 256-bit single-use link is stored only as its SHA-256 hash, with a 30-minute expiry and fingerprint of the exact package, price, deliverables and terms. The link is sent to the inquiry email via a server-only Resend API call. The owner never receives the link in the API response.
5. The customer opens an accessible, no-referrer quote page, reviews price and terms, checks explicit consent and submits acceptance.
6. Server-side PostgreSQL row locks and a service-only RPC validate token expiry, non-reuse, quote status and unchanged terms fingerprint, then atomically record acceptance.
7. Status is **customer-accepted**, **not paid**. Stripe checkout must still be created and bound idempotently in a separate reviewed flow.

## Production blockers
- [ ] Deploy backed-up schema to a separate staging Supabase database and verify that the pgcrypto digest extension is installed under the expected schema.
- [ ] Confirm ownership and DNS verification of the transactional sender domain.
- [ ] Configure server-only RESEND_API_KEY, TRYAMM_QUOTE_FROM_EMAIL, APP_URL HTTPS.
- [ ] Confirm PRIVACY and inquiry consent handling, recipient unsubscribe or appropriate transactional mail basis.
- [ ] Run expired/used/tampered-token, replay, changed-price, simultaneous-click and repeated-invite tests against PostgreSQL.
- [ ] Validate cross-tenant order access and BOLA protection with different business accounts.
- [ ] Test legitimate delivery to the intended customer's inbox, bounce/retry and no token exposure in analytics or server logs.
- [ ] Implement customer receipt and support workflow, account recovery, signed Stripe test-mode payment and verified delivery.
- [ ] Set TRYAMM_ORDERS_DURABLE_ENABLED=true and TRYAMM_QUOTE_ACCEPTANCE_ENABLED=true only after all required staging tests.
- [ ] Do not enable live Stripe charges. Existing storefronts, 30-site inventory and WordPress templates must remain unchanged.

## Endpoint inventory
- POST /api/website-os/orders/:id/request-acceptance — authenticated quote owner only; does not reveal secret.
- GET /api/website-os/quote/:token — valid one-time token; read-only scope/terms preview.
- POST /api/website-os/quote/:token/accept — explicitly consented, single-use database operation.
- GET /api/website-os/orders/acceptance/status — currently disabled unless stage environment configured.
