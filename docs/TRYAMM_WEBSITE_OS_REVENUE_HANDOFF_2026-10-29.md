# TRYAMM Website OS — WordPress.com / WordPress.org alternative and revenue handoff
Date: 2026-10-29
Status: DEVELOPMENT SPECIFICATION — no production deployment or verified payment.

## Product identity
TRYAMM Website OS is an independent business website builder, template marketplace, accessibility-first site service and optional maintenance offering. It is **not** WordPress.com, and will not clone or imply affiliation with its protected services, branding, designs, hosting account systems or proprietary code. WordPress.org open-source software is a different project: reuse, if elected, must follow applicable open-source licenses, notices, attribution and security policies.

## Revenue offers previously scoped
- Preview: $499 one-time — QR and one reel, as approved in the TRYAMM offer.
- Experience: $1,250 one-time — landing page and three reels.
- Digital Twin: $2,500 one-time — landing page, five reels and a StreetVerse experience only when specifically tested/contracted; never promise unimplemented StreetVerse features.
- Business Pass: $149/month — proposed ongoing service. Activate only when scope, billing, cancellation and customer consent are set.
- Directory: Free / $29 / $49 monthly as separately approved.
- Website Shield: proposed $29/$79 monthly tiers and custom emergency recovery; do not sell backup/restoration guarantees until restore drills work.

## Minimum sellable workflow (priority order)
1. Product landing page shows *approved* prices, delivery boundaries and limitations (never fake completion).
2. Accessible one-handed intake form records customer contact, business name, requested service, site content rights and consent; owner receives and can retrieve inquiries.
3. Deliver a dated, reviewable preview and get customer approval before taking the site live.
4. Payment: use business-controlled Stripe server-side Checkout or verified manual invoice. Never trust client-supplied price or grant access from a success URL alone. Keep payout accounts separated by business.
5. Fulfillment record tracks requested deliverables, approvals, secure account handoff, backup and rollback.
6. After payment webhook signature and idempotency verification, mark paid and deliver appropriate license; never assume payment from frontend UI alone.
7. Confirm one real buyer can complete inquiry → payment → accepted delivery → refund/support contact before repeating across 30 sites and the 111-template catalog.

## Operational separation
- TRYAMM LLC: customer contracts, sales, operations and customer support.
- Stubbs AI: central approved template catalog, licensing and partner referrals.
- Each client: independent dashboard, content, data rights, hosting and payment destination.
- StreetVerse, NuMerica, FaithVerse, LIVE: optional destination modules, not dependencies for selling a standard website.
- OmniFabric: experimental internal scheduler; no guaranteed NVIDIA equivalence or performance marketing.

## Protection and release gates
- Preserve current sites and prior PRs; develop on isolated branch. No mass replacement.
- Backup/restore verification and rollback rehearsal precede changes to customer sites.
- Server-side input validation, tenant access controls and rate limiting.
- Accessibility: one-hand interaction, keyboard operability, clear headings, visible focus and readable forms.
- No Stripe activation, credentials, subscription creation, domain cutover, customer mail, or production deployment is performed by this specification.
- Test: build succeeds; preview navigates; lead reaches owner; no errors or leaks; purchase and licensed delivery verified in test mode; domain-safe rollout after approval.

## Milestone plan
A. One $499 website sale and manual/verified handoff.
B. One FaithVerse free reading and notes journey.
C. One StreetVerse Chicago BJ/Taylor Street mission.
D. LIVE real host/viewer test with authorized credentials.
E. Scale to 30 client sites; template marketplace distribution; NuMerica and global worlds when revenue and tests support.

## Current blockers to verify, not assume fixed
Vercel billing pause, Stripe bank/payout setup, Supabase storage restrictions, LiveKit credentials, failing StreetVerse browser tests, and true customer-delivery trace. 
