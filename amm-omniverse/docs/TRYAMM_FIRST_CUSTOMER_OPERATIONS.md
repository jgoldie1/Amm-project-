# TRYAMM First-Customer Operations — Discover → Quote → Paid Delivery

This runbook applies to the **focused first-customer release** only. It does not make a promise about checkout readiness, ad inventory, AI autonomy or game-world deployment.

## 1. Verified entry

- Public-facing route when deployed: `/discover`, linked from the TRYAMM homepage.
- Customer offer prices currently shown: Website Preview **$499**, Website Experience **$1,250**, StreetVerse Digital Twin **$2,500**.
- Holo Reel creation, Holo Ads and product placements are **quote-only or proposal-only** until their inventory, rights and delivery can be verified.
- Inquiry form: name, email, business name, selected offer, project notes, explicit contact consent.
- The browser calls existing Supabase RPC `submit_business_os_lead` and only displays a receipt when a nonempty backend reference is returned. Customers can copy or download that receipt.
- No checkout, advertising sale, newsletter opt-in, customer email delivery or fulfillment is implied by an inquiry receipt.

## 2. Retrieve real inquiries (owner operation)

The connected Supabase project's **public.business_os_leads** table has RLS enabled and is **not publicly readable**. Use an authorized administrative session or connected Supabase tools; do not embed a service-role key or create a public SELECT policy.

Read-only operator query:

```sql
select id, created_at, name, email, business_name, plan_id, source, status, notes
from public.business_os_leads
where source = 'tryamm-connected-growth'
order by created_at desc
limit 25;
```

Do not post customer names, emails or project briefs publicly. Work only from genuine records (not smoke-test or rollback receipts).

## 3. Qualify first customer (manual human approval)

1. Check service choice, contact permission, customer/business name and any relevant product ownership or media permissions.
2. Send a personal response acknowledging the lead **reference** and proposing a scope call or a written deliverables checklist.
3. For the **$499 preview**, confirm: one mobile-friendly website preview, one promotional Reel, a QR link, approved imagery and a customer-owned contact CTA. Establish acceptance criteria and a delivery date in writing; do not imply the final 3D StreetVerse Digital Twin is already available.
4. If the lead requests StreetVerse, Holo Ads, OmniBox, product placements, TV, radio, HoloGPT or Jarvis, describe what the connected prototype can demonstrate and separately verify any real publishing, licensing, inventory, AI-provider or payment capability.
5. Do not promise external email notifications or automatic follow-up: the present lead intake stores a database record only. An authenticated operator inbox/notification backend is still a launch dependency.

## 4. Quote, payment and fulfillment separation

- The sales operator provides an itemized written scope and quote.
- **Only** an activated Stripe backend and provider-verified payment event may mark an order paid. No frontend click, draft event, ad impression or blockchain/demo balance counts.
- Obtain rights/consent for brand marks, music, photography, models, customer testimonials and product descriptions.
- Customer reviews and approves the website/Reel and final CTA.
- Record delivery evidence and any requested changes. Only then offer upsells.
- Holo Ads campaigns must be independently approved and server-verified; do not charge or claim views for the current draft-only proposals.

## 5. Release checklist

- [ ] Full CI green for the exact focused PR HEAD SHA, including root and Omniverse lanes, React render and compiled Vite HTTP route smoke.
- [ ] No unrelated StreetVerse game changes required by the focused PR.
- [ ] Confirm Vercel project billing/deployment status and preview availability **before** initiating a potentially billable build.
- [ ] Open the preview in desktop Chrome and a mobile-sized viewport; verify first paint, keyboard access, offer cards, proposal form, consent, error states and success receipt.
- [ ] Test a lead safely using an authorized test address, then delete or distinguish any test records; never market to a test email.
- [ ] Verify environment variables (publishable Supabase URL/key only in browser; **never** a service-role key).
- [ ] Add server-level spam/abuse protection (rate limiting or CAPTCHA with verification) and monitoring before paid advertising.
- [ ] Establish secure, authenticated internal lead review and follow-up notifications.
- [ ] Verify Stripe onboarding and server-side checkout before taking payments.
- [ ] Keep advanced AGI-5/Science AGI/AGI-C as research-only until operational evidence exists.

## 6. Three priority deliverables for the first sale

**A. Working visitor-to-lead flow** — public page, accessible mobile controls, validated inquiry, customer receipt.

**B. Human-verified lead response** — private operator access, reviewed scope, quote and explicit next step.

**C. Paid deliverable** — Stripe-verified checkout after banking is connected, approved website/Reel, acceptance receipt and customer handoff.

Focus on these rather than activating unverified 3D broadcasting, holographic billable inventory or scientific AGI claims.
