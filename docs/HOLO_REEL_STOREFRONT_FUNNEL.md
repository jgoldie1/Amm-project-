# TRYAMM Holo Reel → Website OS → AI Café Revenue Funnel

**Status:** staged development; the new funnel is disabled without a reviewed database migration and explicit enablement. No ad was posted, checkout opened, charge captured or external message sent.

## What has been connected in source
1. **Holo Reel creative:** /api/website-os/campaign/storyboard creates original, review-only 25-second campaign copy.
2. **Owner-owned Website OS project:** /api/website-os/funnel/campaigns creates a campaign only when the signed-in user owns the linked brand project. Campaign is draft by default.
3. **Owner approval gate:** /api/website-os/funnel/campaigns/:id/approve requires evidence for rights, claims, captions, accessibility, landing page, contact path, analytics consent, actual render QA, owner approval and publication authorization. The API does not post to social media.
4. **Customer storefront:** /tryamm-campaign-landing.html?campaign=<uuid> shows only approved campaign name/offer and asks for inquiry consent. Do not treat this as a deployed or purchased website.
5. **Consent-based inquiry:** /api/website-os/funnel/campaigns/:id/inquire saves a scoped lead in a private database only when TRYAMM_FUNNEL_PUBLIC_LEADS_ENABLED=true. Spam honeypot and per-instance throttle exist, but production requires durable distributed anti-abuse controls.
6. **Owner/customer command center:** /website-command-center.html can create campaign drafts and read campaign/lead status for the logged-in project owner. It does not display other customers' records.
7. **Metrics:** /api/website-os/funnel/campaigns/:id/report counts durable campaign inquiries. No view/click attribution or verified sale is inferred. Revenue conversion is **not** yet connected.

## Release flags
- TRYAMM_FUNNEL_DURABLE_ENABLED=true: enable only after applying ops/website-os/tryamm-campaign-funnel.sql to a backed-up staging database, with RLS and tenant isolation validated.
- TRYAMM_FUNNEL_PUBLIC_LEADS_ENABLED=true: enable only after anti-abuse, privacy policy, retention, consent and deletion workflows are tested.
- No automatic purchase, refund, ad publishing, domain transfer or blockchain anchoring is authorized by these flags.

## Required commercial integration
- Replace serverless local-JSON AI Café quote/order state with transactional private Supabase tables, preventing race conditions and lost records.
- Link each durable campaign lead to exactly one approved server-side quote, customer review, expiry and itemized deliverable/price.
- Require customer acceptance and Stripe test-mode Checkout with metadata referencing campaign, lead, quote and tenant.
- Verify Checkout events server-side by signature/provider retrieval and idempotent atomic database settlement.
- Reconcile succeeded/failed/returned payments, refunds and chargebacks; never grant fulfillment on success URL.
- Create fulfillment order and customer delivery status only after verified payment or an approved manual invoice.
- Add retention/deletion, anti-spam provider, IP limits, secure email notifications, webhook retry/outbox and monitoring.
- Verify first-party attribution with consent, event de-duplication and privacy-safe metrics (no fabricated page views or purchases).
- Confirm content and creator licensing, rights to fonts/music, safe captions, reduced motion and cross-platform posting terms.
- Run production mobile/E2E tests: Reel CTA → approved landing → inquiry → owner quote → customer acceptance → Stripe test checkout → verified webhook → customer order dashboard → delivered site → refund/support.
- Publish only reviewed work; keep current 30 sites and original 500-template catalog preserved.

## Anti-fraud test cases
- Unapproved campaigns return 404 from public campaign lookup and inquiry endpoint.
- Other tenants cannot create a campaign on someone else's project or read their reports.
- Submitted campaign with incomplete rights/claim evidence cannot be approved.
- Payment is never counted as verified based on an inquiry or front-end redirect.
- Disabled database/public-intake flags fail with 503 instead of accepting non-durable customer data.
