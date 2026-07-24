# TryAMM Production Wiring Checklist

## Shared platform gates
- [ ] Resolve PR #10 conflicts against main.
- [ ] Install `lib/production-security.js` before static/routes.
- [ ] Connect Supabase token verification to `lib/auth-rbac.js`.
- [ ] Require auth for all mutating user routes.
- [ ] Require RBAC for admin/moderation/finance/security routes.
- [ ] Authenticate Socket.IO handshake; derive user ID server-side, never from client payload.
- [ ] Run `20260724090000_production_identity_rbac.sql`.
- [ ] Replace in-memory profile/result/session/presence state with Postgres/Supabase repositories.
- [ ] Use idempotency keys for payments, rewards, referrals, results and payout-affecting events.
- [ ] Send structured audit events for privileged and money-moving actions.
- [ ] Add backup/restore test and documented RPO/RTO.

## Money and commerce
- [ ] Stripe/Jinn webhook signature verification.
- [ ] Paystack/Flutterwave webhook verification per launch country.
- [ ] Ledger postings balanced and immutable.
- [ ] Merchant, creator, driver, affiliate, tax, tip, reserve and TryAMM revenue classifications separate.
- [ ] Refund/chargeback reversals reconcile back to original ledger entries.
- [ ] Digital receipts use verified payment state only.
- [ ] Country launch gate controls tax, currency, payout, consumer protection and regulated features.

## Live/social/front scroll
- [ ] LiveKit token issuance server-side with authenticated user/room authorization.
- [ ] PK/panel roles enforced server-side.
- [ ] Protected bathroom/break state excludes paused minutes from quota accounting as configured.
- [ ] Creator 15/30/40-hour qualification derived from verified session events.
- [ ] Feed API uses normalized content contract and country/age/rights filters.
- [ ] Following, For You, Live, Shop Live, Business Live, Reels, Threads, News/TV, HoloMusic, Games and Local backed by real data.
- [ ] Holo Menu deep links validated and permission-aware.

## Business/Jinn/Black Business
- [ ] Business onboarding/KYB provider integration where required.
- [ ] Storefront/menu/order persistence.
- [ ] HoloCoupon validation server-authoritative.
- [ ] HoloPass earn/burn server-authoritative.
- [ ] Affiliate conversion attribution tied to verified orders/refund window.
- [ ] Black Business opt-in and verification claims stored with evidence level.
- [ ] Procurement/funding opportunities cite source and never guarantee eligibility/award.
- [ ] Jinn Money Center totals derived from ledger, never client-calculated.

## Stubbs AI
- [ ] Tenant isolation tests.
- [ ] Per-tenant knowledge/tool scopes.
- [ ] AI Cost Manager metering and hard budgets.
- [ ] Human approval for spend, payouts, material refunds, price changes, applications and contracts.
- [ ] Prompt-injection/tool-abuse tests.
- [ ] Provider fallback and outage behavior.

## Jacobie Cybersecurity
- [ ] MFA/passkeys for privileged roles.
- [ ] Step-up auth for payout destination/security changes.
- [ ] WAF/rate limiting at edge plus app-level limits.
- [ ] Secret manager; no production secrets in repo.
- [ ] Dependency/code/secret scanning in CI.
- [ ] Fraud rules for referrals, coupons, gifts, streams, votes and payouts.
- [ ] Incident response and breach-notification runbooks.
- [ ] Independent penetration test before major real-money scale.

## Media/music
- [ ] Storage/CDN signed upload/playback paths.
- [ ] Rights verification and territory windows.
- [ ] Royalty accounting and statements.
- [ ] HoloTV Originals ownership/license records.
- [ ] Third-party TV remains disabled until written rights are verified.
- [ ] OmniNews source provenance and corrections workflow.

## Legacy verticals
### Jacobie Real Estate
- [ ] Deal/project persistence, document permissions, contractor/vendor workflows.
- [ ] No broker/lender/escrow/title claims without licenses/partners.

### Aniyah Cross-Border
- [ ] Country payment/payout/shipping/customs/tax gates.
- [ ] Sanctions/fraud screening via approved providers where required.

### AM64
- [ ] Durable project/stem storage, waveform jobs, versioning and export.
- [ ] Licensed/original DSP and pitch-correction implementation.
- [ ] Rights-safe publishing handoff to HoloMusic.

### Isaiah StarVerse
- [ ] Audition/showcase persistence.
- [ ] Age lanes and guardian controls.
- [ ] Anti-bot voting and transparent judging rules.

### GameVerse / HoloTag
- [ ] Server-authoritative results/progression.
- [ ] One game passes performance, accessibility, multiplayer, anti-cheat and recovery gates.
- [ ] HoloTag phone-only mode verified before custom hardware dependency.
- [ ] Physical blaster requires product/RF/battery/optical safety validation before sale.

## Release definition
Do not label the platform production-ready until `npm run release:verify` passes in staging, critical external providers are connected with test/live separation, migration/rollback is rehearsed, monitoring/alerts are active, and the production readiness registry has no critical BUILD/BLOCKED items.
