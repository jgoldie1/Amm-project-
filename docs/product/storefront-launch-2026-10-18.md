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

Business subscription and setup income is separate from LIVE gifts, merchant gross sales and customer funds. The owner intends 95% creator / 5% TRYAMM for the defined LIVE revenue base; the base and fee treatment must be stated and server-enforced before LIVE activation. A legacy `PricingConfig.ts` currently contains a 90/10 gift split. Trace actual payment consumers and reconcile legacy/UI/server values; changing a display constant alone does not prove payout correctness. This storefront analysis does not include the 5% LIVE share or claim actual payout enforcement.

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
