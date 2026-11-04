# StreetVerse / TRYAMM LIVE — cost-first launch and growth plan
Date: 2026-11-03
Status: PLANNING ONLY. No billing accounts opened; no service migrations or production deployments.

## Design constraints
- Chromebook has 32 GB total storage and cannot run local Linux or VS Code.
- Edit through connected ChatGPT + GitHub, keep original assets in Google Drive, use browser tools and cloud tests.
- Development branch: `streetverse-chromebook-workbench` in `jgoldie1/Amm-project-`.
- Vercel and Render payment restrictions were reported previously; avoid new paid subscriptions until a practical revenue source is proven.
- Preserve `main`, production deployments, private assets and existing payment logic.

## Start with the lowest-cost stack
| Layer | Initial choice | Cost and limits | Activation note |
| --- | --- | --- | --- |
| Static browser game | Cloudflare Pages | Free tier; unlimited static asset requests, up to 500 builds/month; dynamic Pages Functions count toward Workers quota | Requires new site configuration; confirm legal/account eligibility and successful build |
| GLB + textures + audio delivery | Cloudflare R2 Standard | 10 GB-month free, free egress; requests metered. Overage $0.015/GB-month (plus operations) | R2 subscription/checkout may require a billing method. Avoid activation if no spending authority |
| Original asset archive | Existing Google Drive | Use existing allocation; don't serve large public game downloads via Drive | Recheck asset rights and verified hash manifests |
| Player profiles + save slots | Existing Supabase project if available, otherwise free project only as warranted | Free: 500 MB database, 1 GB file storage, 50k MAU, bandwidth limits | Existing Supabase media 402 issue must be resolved or bypassed safely; never imply service is restored |
| Source + CI | GitHub | Already connected; scope cloud jobs for tests | Use separate workbench branch, don't run costly full build on every commit |
| Web payments | Stripe, once verified | Standard US domestic cards 2.9% + $0.30 per successful transaction, no standard monthly fee | User has not completed bank/payment setup. All purchases must be server verified before granting entitlements |

## Stream stages
1. **Before recurring revenue**: TikTok / YouTube native live streams under each platform's eligibility and content policies. StreetVerse links visitors to approved streams or permissible embeds. No illicit rebroadcasting or downloading others' streams.
2. **Small interactive tryout**: LiveKit Cloud Build plan at $0 has 5,000 WebRTC participant-minutes, 50 GB downstream, 60 shared minutes of transcode, and 100 concurrent connections. Do a two-device pilot before depending on it; record no more than needed.
3. **Paid branded broadcasts**: Cloudflare Stream stores $5/1,000 minutes (prepaid) and delivers $1/1,000 viewer-minutes (metered). Example 100 simultaneous 60-minute viewers = 6,000 delivered minutes ≈ $6 delivery + $5 prepaid storage allotment before taxes; four such shows ≈ $24 delivery + $5 storage if within 1,000 minutes stored. Guard against autoplay/repeats.

## Monetization roadmap
- One-time $4.99 cosmetic outfit (no pay-to-win); $9.99 vehicle cosmetic/style pack. Pricing is proposed and untested.
- Sell a $29/month basic virtual business listing with a usable directory page even before full in-game foot traffic. Offer demonstrated reach, not guaranteed impressions.
- Later $9.99/mo supporter pass only when there is persistent value; don't charge before delivery can be met.
- Sell real web-design/digital-twin services and creator promotion using existing TRYAMM packages. Keep accounting and creator 70/30 payout calculations separate from provider fees/refunds.
- Avoid selling blockchain tokens, staking, cash-out currencies, chance-based loot boxes, or in-game casinos during the pilot. Use non-withdrawable, non-transferable game cosmetics/earned XP only.

## Example revenue reality check
- 100 active players x 5% buyers x $4.99 cosmetic = $24.95 gross.
- Stripe standard domestic card fee estimate: 5 x ($4.99 * .029 + $0.30) ≈ $2.22; ≈ $22.73 remaining before hosting, taxes, refunds, creator fees, chargebacks.
- One $29 monthly listing produces $29 gross before fees/service delivery; business subscriptions may be more realistic than assuming a high in-game conversion rate.
- Prove one paid sale and actual usage before buying a $50/month realtime streaming tier.

## Precautions
- Cloudflare Pages is appropriate for a public commercial storefront; GitHub Pages is NOT authorized as a free e-commerce / SaaS host under its limits policy.
- R2 activation involves subscription checkout and potentially a billing method even if within free allocation.
- Client/browser checkout success is NOT proof of payment. Verify server-side Stripe webhook/payment intent and idempotently grant entitlements, prevent double claims, maintain refunds and audit trails.
- App Store / Google Play native digital purchases are governed by app store billing rules and regional exceptions; do not port web Stripe checkout unchanged into native apps. Start with a mobile-accessible browser game.
- Restrict uploads; lifecycle/delete recordings after a stated retention period; protect private media with authentication/signed URLs; keep audit trail and backups separate.
- Cap live concurrency and duration; limit generated video and asset sizes; use lower-poly GLB, texture compression, lazy-load maps, cached read-only assets, and on-demand NPC simulation.
- Monitor expense every week. Avoid surprise charges with explicit spend alerts/limits where supported, and stop optional workloads at thresholds.
- Don't assume a public static web server can run a permanent authoritative multiplayer world. Add a paid real-time backend only when needed.

## First release acceptance criteria
1. Working browser-first Circle Park vertical slice and one-hand controls, tested on Chromebook and iPhone.
2. Validated BJ model loader or labeled placeholder, one vehicle, NPC, Taylor Street mission, mission completion persisted.
3. Link out to a legitimate owned live social stream; live preview never stores whole recording by default.
4. Store page with mocked products; test-mode payment verification then real-mode after merchant onboarding.
5. Usage dashboard: active users, average loaded asset MB, storage used, monthly viewer-minutes, successful net receipts, refunds and creator obligations.
6. Only scale services from measured revenue/traffic and an approved monthly spending ceiling.

## Official rate/policy sources consulted
- https://developers.cloudflare.com/pages/functions/pricing/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/get-started/
- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://livekit.com/pricing
- https://developers.cloudflare.com/stream/pricing/
- https://stripe.com/pricing
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://developer.apple.com/app-store/review/guidelines/
- https://support.google.com/googleplay/android-developer/answer/9858738?hl=en
