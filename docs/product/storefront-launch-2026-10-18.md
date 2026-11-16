# TRYAMM storefront-first launch decision — October 18, 2026

## Decision and scope

Launch a small US storefront/AI pilot before StreetVerse. Customers must reach their business account, storefront and HoloGPT without loading the game. No game, LIVE, ad inventory or merchant merchandise revenue is needed in this model. This document prepares the offer and acceptance gates; it does not certify deployment or activate billing.

Source catalog on main: `amm-omniverse/src/game/economy/TryammBusinessPlans.ts` already defines Starter $29/month, Growth $49/month, Preview $499 one-time and Business Pass $149/month. The owner reiterated $29/$49/$499 on October 18. Preserve those billing periods. The $149 pass is a service level, not ownership of a USA or global territory. US-first is a proposed operational boundary; worldwide discovery is different from supported seller onboarding, payouts or guaranteed reach.

## Proposed storefront offer, contingent on passing acceptance tests

| Offer | Price | Bounded deliverable |
|---|---:|---|
| Free Listing | $0 | Basic business/contact listing and QR; no card required |
| Starter | $29/month | One self-managed template storefront, business profile/catalog, QR and basic analytics; capped text AI assistance |
| Growth | $49/month | Starter plus verified order/booking handoff, lead capture/follow-up tools and improved analytics; higher capped text AI allowance |
| Business Pass | $149/month | Growth plus monthly report and up to 60 minutes of routine managed updates per month; extra work quoted separately |
| Launch Package | $499 once | One template-based storefront, up to 20 supplied products/services, QR, contact/booking/payment-link setup, two revision rounds and handoff; ongoing plan billed separately and disclosed before purchase |

These are proposed launch scopes, not a statement that all inclusions are available. AI quotas must be set after measuring model, prompt and response costs. No unlimited AI, video generation, custom app, 3D twin, guaranteed sales, guaranteed search position or guaranteed leads. SMS, purchased ads, domains, special integrations and custom design are separately quoted/disclosed. Basic AI may pause at a disclosed allowance; never silently charge overages. A $499 package must not silently start a subscription. Existing free website gifts, including La Teasia, remain free; AI is a separate voluntary offer.

The value proposition is a maintained business storefront and useful AI assistance. A directory listing alone has unproven value without traffic. Start by showing functioning examples and measuring real inquiries; do not substitute network-size promises for results.

## Illustrative economics, not actual financial results

No customer count, conversion, retention, provider invoice or cost-per-AI-session was verified for this model. All non-payment cost figures below are explicit planning assumptions. Monthly US domestic-card subscriptions use 3.6% + $0.30: Payments 2.9% + $0.30 and Billing 0.7%, verified October 18 at https://stripe.com/pricing and https://stripe.com/billing/pricing. Actual account pricing, international/FX, tax tooling, Connect, disputes or additional services can change fees. Merchant product charges are outside this subscription-only model.

Service cost budgets per business/month: Starter $8 ($3 AI, $2 infrastructure, $3 support); Growth $14 ($5 AI, $3 infrastructure, $6 support); Pass $55 ($10 AI, $9 infrastructure, $36 labor). Labor valued at $30/hour: about 6 minutes Starter, 12 minutes Growth, and 72 minutes Pass including 60 minutes managed updates. These tight budgets require templates and self-service; exceeded labor must be measured, reduced or repriced.

Additional assumptions: 10% sales-agent commission on every subscription dollar (conservative model input, not a newly approved payout contract), 2% revenue provision for refunds/losses, $300 fixed monthly operating overhead and $200 monthly acquisition spending. The model excludes initial repair/build costs, income tax, financing, owner administrative salary and the cost of operating the wider app/game. Costs for any free users must fit the fixed budget or be added. Actual loss/refund accounting may differ from the simple reserve.

| Paying businesses | Mix Starter/Growth/Pass | Monthly recurring revenue | Modeled surplus after service, fees, commission, reserve, $300 overhead and $200 acquisition |
|---:|---|---:|---:|
| 10 | 5/4/1 | $490 | -$240.44 |
| 50 | 25/20/5 | $2,450 | $797.80 |
| 100 | 50/40/10 | $4,900 | $2,095.60 |
| 250 | 125/100/25 | $12,250 | $5,989.00 |

Average contribution before fixed costs is $25.956 per business/month at this mix. Operating break-even is approximately 20 paying businesses; rounding to exact 50/40/10 mix may require whole groups of 10. Covering $3,000 owner compensation plus $500 overhead/acquisition needs approximately 135 customers at this mix (140 for exact groups of 10). This does not recover development costs.

Sensitivity: double all service budgets and 100 businesses produce only $585.60 monthly surplus; break-even becomes about 47. At 5% monthly churn, 100 customers need five replacements monthly just to stay level. A $200 acquisition budget supports only $40 cash acquisition cost per replacement, excluding additional sales labor. A $100 acquisition cost takes about 3.85 contribution months to recover; no retention-based lifetime-value claim is justified yet. A 250-customer scenario is not a forecast and may require higher staffing and overhead.

The $499 setup package, assuming $200 delivery cost, 2.9% + $0.30 payment processing, 10% commission and 2% loss reserve, contributes about $224.35 before fixed costs/tax. At $300 delivery cost it contributes $124.35. Setup revenue is nonrecurring and must never be counted as MRR. Target template delivery within the $200 budget; do not sell an unlimited custom build for $499.

## Revenue separation

Business subscription and setup income is separate from LIVE gifts, merchant gross sales and customer funds. Correction October 18: the owner recalled the earlier LIVE split as 90% creator / 10% TRYAMM, matching the inspected `PricingConfig.ts` gifts configuration. Use 90/10 as the current planning basis; the previous 95/5 statement in this document is superseded. The revenue base, fee treatment and actual server payout consumers still require verification. A display/configuration constant does not prove payout enforcement. This storefront-only model excludes LIVE revenue entirely.

## Launch gates and evidence required

- [ ] Reconcile PRs #638/#639 and deployed source without losing existing work; retain rollback and [ship]-only cost controls. Do not deploy merely to publish this planning file.
- [ ] Expose a standalone business entry and dashboard that do not import/start StreetVerse, physics, avatar or LIVE services.
- [ ] Verify owner sign-up, login, recovery, business ownership and tenant isolation. Customers must not read or modify other businesses' leads/catalogs.
- [ ] Use the existing canonical prices consistently in customer UI and server checkout. Map only real environment-specific provider Price IDs; reject unsupported plans/currency/cadence and client-supplied prices.
- [ ] Verify payment webhooks/signatures, duplicate event handling, account binding, successful/failed payments, renewal, cancellation and refunds. Activate paid access from authoritative server events, never the return URL or local storage.
- [ ] Verify storefront create/edit/publish, QR destination, catalog persistence, contact/booking/order handoff and accurate analytics. Either test image upload/playback after the recorded upstream 402 is resolved, or explicitly exclude unavailable uploads from the pilot.
- [ ] Verify real HoloGPT responses against each business's approved information; enforce tenant access, usage budgets and rate limits. Do not promise actions unless the external action completes and is logged.
- [ ] Show exact inclusions, quotas, extra charges, recurring cadence, support scope and cancellation before checkout. Remove unverified unlimited-service or performance claims from the business journey.
- [ ] Complete customer portal billing and support flow on actual iPhone Safari. Record actual production build, timestamp and successful test evidence.
- [ ] Conduct an authorized small live payment/refund and verify service access and ledger reconciliation before onboarding paying pilot customers. No charge is authorized by this document alone.
- [ ] Onboard 5–10 businesses, measure support minutes, AI expense, publication success, collected recurring revenue, cancellations and inquiries. Expand only when contribution remains positive and customers receive promised service.

## Verification of this preparation

`node --test tests/storefront-economics.test.mjs` passed five arithmetic and input-validation tests. No production application, subscription configuration or provider credentials changed. Current implementation readiness remains gated by the above items. This model is a reproducible planning aid, not a replacement for accounting or a full app test.

Relevant evidence: https://github.com/jgoldie1/Amm-project-/pull/638 ; https://github.com/jgoldie1/Amm-project-/pull/639 ; `docs/audits/app-feature-wiring-2026-10-15.md`. October 15–16 service checks are historical, not fresh production certification.


## Wider non-game revenue portfolio — restored scope

The storefront model is a deliberately limited scenario, not a deletion or replacement of the broader TRYAMM business. The following ten categories organize recovered plans and source evidence; they are not a verified verbatim original list or ten operational income streams.

1. Business subscriptions: $29/$49/$149 monthly storefront/network services.
2. Setup and templates: $499 one-time bounded launch package and separately scoped template work.
3. HoloGPT / Stubbs AI: separately purchased AI subscriptions or usage, only where not already included in a business plan.
4. Omni Box creator production tools: proposed paid creation/render/export/storage allowances; separate pricing and complete delivery remain to be verified.
5. Holo Drama / Drama Box: paid episode unlocks, series access and subscriptions. Owner approved 70% creator / 30% TRYAMM on October 18, matching the inspected pricing configuration. Verify server settlement against this policy before sale.
6. LIVE / PK gifts: current planning and inspected configuration 90/10 creator/platform; actual settlement unverified.
7. HOLO ADS / sponsorships: advertisements and sponsored placements across Reels, Holoverse, TV and business discovery; delivery/measurement and contracts required.
8. Marketplace / creator commerce: commissions on fulfilled real transactions; inspected pricing configuration says 10% platform, not verified settlement.
9. Holo Music / creator media: rights-cleared paid media or service fees; no assumed earnings merely from counting streams. Rates and rights need reconciliation.
10. Ticketed digital events / Holo Theater: paid admission or replay access, conditional on access control, playback and settlement working.

Holoverse is a hub for multiple services, and Omni Box is the creation, storage and distribution workflow. Reels carry content, ads and commerce. Do not count the same subscription, advertisement, token purchase/redemption or sale again merely because it travels across those surfaces. All American Network and Isaiah AI TV can distribute monetized content, but audience/advertising revenue is not yet verified. Holo delivery/menu/rides, jobs and telecom remain additional services outside this ten-category grouping.

Source inspection October 18: `UnifiedHoloverseHub.tsx` has service navigation; author-written LIVE/BETA labels are not production certification. `HoloDramaHub.tsx` has episode upload/database and earnings-read code, but its episode cards render no player and their Like/Comment/Share/Gift buttons have no handlers. Its monetization selector alone is not working paid access. Omni Box SQL migrations exist in main, which does not establish that production migrations, storage, export or settlement are deployed. These findings describe the inspected files, not every alternate route in the application.


## Expanded portfolio audit — October 18, 2026, owner follow-up

Owner approves Drama 70% creator / 30% TRYAMM. LIVE remains 90/10 planning basis. Do not apply either split globally to unrelated family businesses. No real-money transfer, securities/forex trade or collection is authorized merely by this inventory request.

### Source-backed recovery

The backend file `amm-omniverse/amm-backend/lib/revenue-catalog.js` defines 23 category keys, each with several monetization mechanisms. It is an inventory, not proof of 23 earning businesses. Its categories are: live_streaming; short_video_media; holodrama_tv; starverse; music_audio; gaming_quantumverse; marketplace; quantum_sourcing; logistics_delivery; holo_advertising; ai_cafe; education; workforce_call_center; omnicare_360; omnishield_360; omni_protect; app_store; creator_tools; kingdoms_press; omni_exchange; holo_exchange; crypto_stock_simulation; api_platform.

The separate `TryammRevenueActivationPlan.ts` has ten activation categories: business plans, production, Holo Ads, marketplace/delivery, creator media, broadcast, scout acquisition, AI business services, rights/distribution, and StreetVerse City API. Scout compensation is a TRYAMM acquisition cost rather than new external revenue; merchant sales and transfer principal are not TRYAMM income. Source phase labels such as now or sellable-foundation are authored intent, not release certifications.

| Business or surface | Revenue mechanisms recovered | Evidence and missing proof |
|---|---|---|
| All American Network, radio, Free TV / FAST / CTV / OTT | ads, sponsorships, premium programming, PPV, licensing/syndication, channel services | Canonical media architecture exists; rights-cleared playable programming, verified audience/ad delivery and settlement not verified here. Free TV remains free. |
| Isaiah AI TV | sponsored shows, premium programs, merch, licensing, live showcases | Canonical channel/studio lane and code exist; production scheduling, playback, youth permissions and earnings journey need validation. |
| StarVerse / Anyone Can Be a Star (owner also calls it Who Wants to Be a Star) | showcases, tickets, fan memberships/gifts, talent bookings, sponsor campaigns, merchandise | Canonical talent pathway exists; do not promise stardom or charge for an unimplemented opportunity. No verified commercial event found. |
| Holo Drama, Reels, Movie Studio and Holo Theater | episode/series access, PPV, premieres, rentals, sponsors, product placement | Drama 70/30 approved; other media contracts remain separate. Playback, entitlement and settlement need completion. |
| Omni Box / creator tools | DAW/video/AI tools, rendering, storage, exports | Catalog and migrations exist; end-to-end delivery remains unverified. |
| Aniyah 64-Track Studio | access passes, AI and engineer sessions, remote recording, mix/master, soundtrack services | Six explicit priced offers and 85/15 seller/TRYAMM configuration; actual purchase, fulfilled audio project/export and seller transfer unverified. |
| Aniyah Pay / Omni Cash / fintech orchestration | disclosed platform/service fees and business payment tools | `aniyahPay.ts` always builds sandbox quotes; real-money submission disabled in game client. Provider routing names do not prove active integrations. Live exchange quotes, provider approval and settlement required. |
| Jacobie Vision cybersecurity | authorized assessments, security QA, training, supervised managed services | Center, defensive libraries and tests exist. UI training eligibility is not a signed client contract or completed paid security service. |
| Jacobie real estate / home flipping | analysis tools/services, property media, project support; separate realized sale/rental income from actual property operations | Flip Lab calculator exists; workstream buttons display messages. No acquisition, ownership, sale, rent collection or client billing verified. |
| Forex / trading | proposed tools, education and separately authorized investment activity | Located crypto/stock simulation revenue category, but no identifiable forex execution file in the filename search. Actual forex implementation remains unresolved; investment gains are not recurring operating revenue and losses are possible. |
| Quantum sourcing / global supply chain | sourcing, inspection, procurement management, supplier plans, private-label margin | Supplier-vetting and landed-cost code exists. Actual suppliers, orders, inspections, fulfillment and settlement remain to be verified. |
| Lyons Tech logistics / Holo delivery | dispatch, freight, delivery, warehousing, fulfillment, fleet software | Product catalog exists; provider execution and completed customer jobs unverified. |
| StreetVerse Global business network / City API | listings, business passes, production, measurable sponsorship inventory, enterprise API/licensing | Can develop a non-game business layer; no global territory ownership or guaranteed worldwide customer traffic implied. City API is explicitly scale-phase. |
| Middleverse AI workforce / contact center | BPO contracts, per-seat/per-call plans, training, managed support | Catalog and runtime files exist; telephony/provider workflows, staffing and paid contracts need verification. |
| Business Server / Holo FON / AI services | hosting, integrations, support, usage and service subscriptions | Product catalog exists; fulfillment, quotas and actual operating margin unverified. |
| Academies / CampusVerse / education | courses, tuition, employer training, learning tools | Education category exists; accreditation/certification outcomes are not established by this inventory. |
| All American App Store | app commissions, developer services, promoted placements, enterprise distribution | Revenue catalog entry; developer onboarding, distribution, checkout and settlement not verified. |
| Kingdoms Press | books, audiobooks, publishing services, licensing, memberships/events | Revenue catalog entry; rights-cleared catalog and fulfillment not verified. |
| OmniCare 360, OmniShield 360, Omni Protect | subscriptions, partner services/referrals, business seats/API, approved protection-provider arrangements | Revenue catalog entries; actual providers, service permissions and commercial terms unverified. |
| AI Cafe | food/beverage, events, delivery, merchandise, franchise licensing | Revenue catalog entry; no operational cafe or franchise agreement verified. |
| Holo Labs / fabrication / print network | design/production services, fabrication margin, operator commissions, licensing | Separate El Saturn catalog explicitly marks robotic fabrication, 12D R&D and distributed print as pilots. |
| Servants of Christ network | previously proposed voluntary support and separately specified media/services | Prior network work recovered; donations/restricted ministry funds must not be represented as unrestricted TRYAMM profit. |

### Aniyah Studio price details recovered from main

- 30-day studio pass: $14.99, explicitly not auto-renewing.
- AI Producer Session: $9.99.
- Engineer Mode Session: $14.99.
- Remote Recording Session: $25.
- Mix + Master Service: $49.
- Reel / TV / Movie Soundtrack Package: $99.

Configuration allocates 85% to the studio and 15% to TRYAMM, subject to verified payment, fulfillment, reconciliation and seller eligibility. These are configured offers, not evidence of sales. Preserve Aniyah's proceeds separately from TRYAMM's share. Do not change this split when implementing Drama's 70/30.

### Revenue recognition and launch priorities

One external transaction has one authoritative reference, gross amount, refunds, processor/provider costs, creator/merchant share and platform share. A show on Isaiah TV distributed by AAN, clipped to Reels and stored in Omni Box is not four separate receipts. Separate subscriptions can be counted only if separately purchased and fulfilled. Deposits, stored balances, remittance principal, trading balances, financing and restricted funds are not platform revenue.

Maintain storefront/AI pilot as first verified payment-to-service journey. In parallel scope the next sellable deliverables: bounded Aniyah audio services and authorized Jacobie assessments after capability/fulfillment checks. Next enable media upload, playback, rights, paid unlocks and ledger settlement for Drama/TV/StarVerse. Cross-border money movement, real property operations, forex execution and physical fabrication stay separate provider/operational projects. No combined profit forecast is defensible until volumes, costs, obligations and paid delivery are measured by stream.

Read directly in this audit: `revenue-catalog.js`, `TryammRevenueActivationPlan.ts`, `ElSaturnBusinessRevenueCatalog.ts`, `Aniyah64TrackBusiness.ts`, `aniyahPay.ts`, `JacobieVisionCenter.tsx`, `JacobieFlipLab.tsx`, `QuantumSourceSupplyChain.ts` and `docs/ALL_AMERICAN_NETWORK_STARVERSE_MEDIA_VISION_2026.md`. No new live transaction or deployment test was performed during this inventory update.
