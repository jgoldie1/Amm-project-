# TRYAMM Website OS — Buyer Website Review and Delivery Pilot

Status: protected development branch. No new public website, payment, domain, or database migration was deployed.

## End-to-end workflow
1. TRYAMM Holo Reel advertises a verified business service and links to an approved storefront.
2. Customer submits inquiry; owner reviews and sends a fixed quote.
3. Customer accepts quote via one-use verified-email link.
4. Stripe TEST session is bound to an accepted order; server verifies actual paid session.
5. Transactional database settlement marks the order paid; creator and AI Café ledgers remain separate.
6. Business prepares a tested HTTPS website preview through `/api/website-os/orders/:id/prepare-review`.
7. Server atomically changes status from paid-verified/building to review-ready and assigns a fresh unique review nonce. Existing review links for previous previews cannot approve a changed version.
8. Owner emails the original customer an expiring, private review link; the review link uses a URL fragment and the browser removes it from history.
9. Customer opens actual website in a new tab and either approves the exact preview or requests changes with a reason. The token is single use and the decision is recorded transactionally.
10. If changes requested, order returns to building and must be resubmitted with a new preview nonce.
11. If approved, owner provides verifiable handoff evidence and invokes final delivery. The SQL guard checks status, verified payment and buyer approval before marking delivered.
12. Owner and customer order trackers read durable database state; neither Stripe success redirects nor UI prompts can mark orders paid.

## Staging-only schema
- `ops/website-os/tryamm-website-delivery-review.sql`: adds review URL/nonce, customer approval data, private tokens and three service-only SQL functions.
- `lib/tryamm-website-delivery.js`: validation, ownership and delivery authorization.
- `lib/tryamm-website-delivery-routes.js`: owner and customer APIs.
- `public/tryamm-website-review.html`: accessible buyer review and change-request controls.
- `test/tryamm-website-delivery-smoke.js`: source contract smoke test.

## Critical release gates
- [ ] Review + back up the isolated staging database before SQL deployment.
- [ ] Verify auth, row locks, SQL function EXECUTE permissions, and RLS on all order/lead/token tables.
- [ ] Verify owner A cannot approve, invite or finalize owner B's order.
- [ ] Test review token expiry, replay, changed review nonce, mismatch of customer email, and simultaneous approval/change clicks.
- [ ] Test legitimate paid order, unpaid order, refunded order, change requested, buyer accepted, and owner finalization.
- [ ] Verify the actual preview is owned by the business and shows the correct customer's authorized assets. HTTPS alone is NOT proof of ownership or safe content.
- [ ] Implement content/media rights, accessibility, responsive mobile, performance, forms, QR, backup, security and approved product checkout checks before customer review invitations.
- [ ] Use verified transactional sender; verify delivery to inbox and customer contact consent.
- [ ] Add a durable notification outbox and replay protection for review emails; a five-minute query cooldown alone is not sufficient for production abuse prevention.
- [ ] Build customer support tickets, disputes/refunds, export, file delivery and verified domain transfer before production certification.
- [ ] Run full GitHub CI, Chrome/mobile end-to-end tests, and backup/restore rehearsal.

## Enablement
- `TRYAMM_DELIVERY_REVIEW_ENABLED=true` must remain off except in approved staging.
- `TRYAMM_ORDERS_DURABLE_ENABLED=true` requires verified staging database and service-role authorization.
- No production publishing, customer email or website delivery is performed by simply enabling the routes.
