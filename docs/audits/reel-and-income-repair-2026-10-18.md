# Reel repair and business-sales launch — October 18, 2026

## Changes prepared

- Held publication jobs can retry after moderation/rights approval; all existing approval, ownership, storage and trusted delivery checks still run.
- Invalid destinations are rejected before setting the job to processing.
- User database and storage clients accept VITE_SUPABASE_PUBLISHABLE_KEY, matching the supported frontend configuration.
- Navigating to another Reel clears the previous media, error and loading state rather than displaying stale media while a new request resolves.

Seven behavior/configuration tests and four existing media contracts pass. Full app/iPhone execution and live upload-to-publication are not certified by these tests. There is no transcoding worker added in this repair.

## Fresh production evidence

October 18 approximately 21:30 UTC: /api/media/health returned 503, dataApiStatus 402, reason supabase_402, signedUploads false, verifiedPlayback false. The status alone does not establish the account billing cause. /api/live/status returned configured false, readyForPublic false and missing URL/API key/API secret. /api/payments/status timed out; this is not evidence of successful or failed payment configuration. No charge, payout, environment change or deployment was performed.

## Free-site scope preserved

Owner requested free website creation for the named portfolio. Preserve setup-fee waivers for Beautyverse/La Teasia (Tae Monroe), Sculptify, Stubbs Mobility360, Pastor Kofi Ofori / Servants of Christ, Juel's separate credit-repair business, law, barbershop, loctician, nail tech, hairstylist/salon, Alton Stubbs security/concealed-carry and Eric Kirkland's record label. Names/ownership for generic service businesses still need completion. Do not silently assign a $499 setup charge. Optional AI/hosting/managed-service fees require a clearly described voluntary order; free website creation is not a promise of unlimited third-party operating costs. Pastor Kofi's replacement/migration and Juel's site remain separate. Beautyverse's independent payment account remains separate. This scope record does not itself deploy those sites or grant paid entitlements.

Mobility360's existing storefront lives under public/mobility360.html and associated learning/help pages. Retrieved Beautyverse preparation is a separate preview package, not a verified live storefront. Do not rebuild or overwrite either without its current source and ownership context.

## Middleverse customer-finder and closer model

Use the existing TryammQrScoutNetwork and MiddleVerse work-from-home roles as the foundation. Workers in supported countries can identify consenting prospects, prepare localized storefront demonstrations with AI, and refer prospects to a closer. AI helps with product information, drafts, translation and follow-up scheduling; it must not invent buyer consent, send unsolicited outreach automatically or claim a sale occurred.

Proposed workflow: business approves an offer and total commission pool -> registered agent receives referral ID/link/short code -> prospect consents to a lead record -> closer is assigned if needed -> customer voluntarily orders -> server verifies payment and attribution -> business fulfills -> refund/hold checks complete -> one commission pool is divided per agreed finder/closer terms -> supported payout provider pays eligible workers. No payment for raw scans, fake leads, self-referrals or agent recruitment. Agents need not buy an expensive plan to apply. Payout-country eligibility must be checked before presenting an earning opportunity as available.

Do not set a universal commission percentage here. Product/service margin and existing merchant terms control the available pool. Example only: a merchant authorizes a $10 total commission pool for a completed sale; $4 finder + $6 closer, not two independent $10 awards. For a $0 free website setup, setup commission is $0 unless a separate funded onboarding bounty is explicitly approved. Paid AI subscription referral commissions may be offered under separate disclosed terms. Refund/reversal handling, attribution disputes and duplicate event prevention require server tests before launch.

This is an implementation specification, not activated employment, commissions or cross-border payouts. Protect merchant proceeds and creator liabilities; they are not funds for TRYAMM to spend as profit.

## Self-support decision

Company self-support is not established. We have no reconciled current collected-revenue, provider-cost, fulfillment/support-cost and liability report; media and LIVE remain blocked in fresh public checks. Earlier storefront model (about 20 paying accounts at assumed mix/costs to cover modeled overhead) is a scenario, not actual break-even proof. Track cash collected, earned platform share, refunds, creator/merchant/agent obligations, infrastructure/AI, labor and fixed expenses separately. Free websites consume setup labor and do not create revenue until a separately purchased paid service is delivered.
