# TryAMM Production Readiness Master

## Truth rule
A feature is production-ready only when code, persistence, authentication/authorization, provider integration, security, observability, legal/rights dependencies, accessibility and staging tests are complete for the launch market. Product concepts and UI shells do not count as production-ready.

## Shared production foundation required by every vertical
1. Supabase/Postgres persistence with migrations, RLS and backups.
2. Real authentication, MFA/passkeys for privileged roles and tenant isolation.
3. Durable append-only ledger with idempotency and reconciliation.
4. Jinn/PayRouter provider adapters and signed webhook verification.
5. Revenue Waterfall policies with effective dates and auditable splits.
6. Jacobie Security controls: WAF/rate limiting, secrets management, audit logs, anomaly/fraud detection, incident response and recovery tests.
7. Stubbs AI tenant isolation, scoped tools, metering and AI Cost Manager.
8. HoloLingo/localization and country launch gates.
9. HoloAccess accessibility baseline and QA.
10. Central observability: logs, metrics, errors, uptime, alerts and rollback.
11. Privacy, consumer-protection, tax, rights/licensing and regulated-vertical review by launch country.
12. Automated CI, staging smoke, end-to-end and load/security tests.

## Vertical wiring map

### Unified Front Scroll / Social
Required: durable posts/feed storage, follows, comments/reactions, ranking events, moderation, age lanes, media CDN, real APIs, infinite scroll, abuse/rate controls, analytics.
Status: FOUNDATION/PARTIAL until staging proves full loop.

### Creator Live / Shop Live / Business Live
Required: LiveKit real credentials, room/token service, session persistence, moderation, replay storage, qualified-hours tracking, protected breaks, gifts/monetization, fraud controls, payout reconciliation.
Status: PARTIAL; provider staging required.

### Jinn / Business Money Center
Required: real processor adapters, merchant onboarding/KYB where required, signed webhooks, tax responsibility configuration, ledger/reconciliation, refunds/chargebacks, receipts, payouts, invoices, role permissions.
Status: FOUNDATION/PARTIAL; money movement blocked until provider staging and compliance verification.

### Business-in-a-Box / Restaurants / Black Business Growth Ecosystem
Required: real merchant auth, storefront/menu persistence, inventory/orders, HoloMenu, HoloCoupons, HoloPass, reservations, affiliate attribution, ads, directory verification, procurement/funding sources, real dashboards.
Status: FOUNDATION/PARTIAL.

### Stubbs AI Builder
Required: multi-tenant configuration store, knowledge ingestion, model router, cost metering, scoped tool permissions, approval workflows, audit logs, safety evaluations, per-tenant secrets and billing.
Status: PRODUCT FOUNDATION; not production until tenant isolation and tool-action tests pass.

### Jacobie Cybersecurity
Required: deployed controls, not just documents: MFA/passkeys, WAF/rate limits, secret vault, SAST/dependency scans, fraud/anomaly rules, security logging/SIEM path, backup/restore drills, incident runbooks and independent security testing.
Status: ARCHITECTURE/PARTIAL.

### HoloTV / OmniNews / HoloBroadcast
Required: content storage/CDN, rights metadata, territory controls, scheduling/playout, ads, captions/accessibility, news source provenance, creator submissions, moderation and licensed third-party content agreements.
Status: PARTIAL; original/owned content can launch before third-party TV when gates pass.

### HoloMusic / AM64 Studio
Required: audio storage/transcoding, 64-track project persistence, real-time/offline render pipeline, rights ownership/split metadata, royalty accounting, anti-fraud streams, vocal coaching DSP/model validation, pitch-correction DSP, collaboration/version control and publishing workflow.
Status: DESIGN/FOUNDATION; AM64 production audio engine still required.

### Isaiah StarVerse / Anyone Can Be a Star
Required: profile/audition persistence, media moderation, competition/voting fraud controls, age safety, judging rules, HoloStage/live integration, prizes/terms, AM64/HoloMusic integration and opportunity workflows.
Status: DESIGN/FOUNDATION.

### Jacobie Real Estate / House Flipping
Required: property/deal database, permissions, document storage, contractor/vendor workflows, budgeting, property data providers where licensed, Holo tours, e-sign/provider integrations where used, jurisdiction-specific brokerage/lending/escrow boundaries.
Status: DESIGN/FOUNDATION.

### Aniyah Cross-Border
Required: country matrix, product eligibility, duties/customs/shipping integrations, local payment/payout providers, FX disclosures, tax/VAT/GST configuration, sanctions/compliance checks where applicable, returns/refunds and localization.
Status: DESIGN/FOUNDATION; country-by-country activation only.

### RideShare / Delivery
Required: driver/courier onboarding, licensing/insurance checks, maps/routing, dispatch, background/safety providers where required, fare engine, driver earnings formula, tips, tax/fee rules, support/safety, real-time location privacy and local operating approval.
Status: FOUNDATION; not public-production ready.

### GameVerse / 11 Living Worlds / HoloTag
Required: actual engine runtimes, original assets/IP review, authoritative servers, persistence, anti-cheat, matchmaking, accessibility, performance QA, device certification and one end-to-end production game before scaling to eleven. HoloTag hardware additionally requires safe hardware prototyping/certification/manufacturing.
Status: one browser prototype path only; 0 games should be called fully production-certified until gates pass.

### Africa / Global Platform
Required: global app access can be broader than monetized capability. Each country must have a launch gate for payment, payout, tax, privacy, consumer protection, regulated services, content/music/TV rights, localization, support and fraud controls.
Status: GLOBAL ARCHITECTURE; monetized activation country-by-country.

## Immediate release sequence
1. Stabilize one codebase/branch and resolve PR #10 merge conflicts.
2. Wire shared production-security middleware into server before routes; add centralized error/not-found handlers after routes.
3. Connect Supabase staging and apply reviewed migrations/RLS.
4. Replace unauthenticated mutating APIs with user auth/RBAC; protect sockets with authenticated sessions/tokens.
5. Connect LiveKit staging and prove creator live -> break -> qualified hours.
6. Connect Stripe test mode (and selected country provider) -> signed webhook -> Revenue Waterfall -> durable ledger -> payout balances.
7. Wire Unified Front Scroll to real database/provider sources.
8. Complete Business-in-a-Box/Jinn vertical slice with digital receipts and reconciliation.
9. Wire Stubbs AI to real tenant data with strict tool scopes and cost budgets.
10. Complete one production-quality GameVerse title vertical slice.
11. Run accessibility, security, load, backup/restore and rollback tests.
12. Only then mark release-gate items VERIFIED and prepare public production deployment.

## External blockers that code cannot complete automatically
- payment/KYB merchant approval and processor credentials
- LiveKit/provider credentials
- app-store accounts/review and billing policies
- third-party TV/music/content licenses
- country-specific tax/legal registrations and professional review
- rideshare/delivery licensing, insurance and safety-provider agreements
- phone/1-800/business address/email provider accounts
- hardware safety/RF/battery/toy certification and manufacturing
- independent penetration test/security review

## Definition of done
`npm run release:verify` passes with real staging/production configuration; staging smoke passes; critical end-to-end tests pass; no critical/high unresolved security findings; reconciliation balances; restore/rollback is tested; external launch approvals are documented; status registry is truthfully VERIFIED only for completed systems.
