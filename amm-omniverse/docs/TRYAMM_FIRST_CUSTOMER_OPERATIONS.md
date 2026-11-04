# TRYAMM first-customer launch: owner-operated workflow

**System boundary:** The public `/discover` page can propose website packages, Holo Reels, Holo Ads and StreetVerse product placements, and can submit a lead to `public.submit_business_os_lead` when the deployed Vite Supabase connection is configured. The existing server function returns a UUID. It is **not** a booking, paid invoice, reserved ad impression, fulfilled Reel, or commissioned 3D asset.

**Hosting gate (2026-11-04):** the connected Vercel `amm-omniverse` project returned `402 resource_creation_blocked` with an account suspension. Do not assume the development branch is publicly available. No deployment or preview-environment mutation was completed. The branch CI release gate can pass while Vercel hosting is blocked.

## Roles and the first paying-customer flow

1. **Discover:** show the `/discover` page with explicit draft status for advanced creator and AI services. Invite the customer to choose a package. Do not present AGI 5, Science AGI or AGI-C as deployed autonomous systems.
2. **Capture:** the customer opts in to a one-time contact and submits their name, business name, email and requested package. Their only authoritative acknowledgment is a returned UUID from the Supabase RPC. The customer may save/copy that reference from the page.
3. **Owner queue:** review the private `public.business_os_leads` table using the authenticated Supabase project dashboard SQL Editor / Table Editor. **Never embed an admin/service-role key in a website, laptop HTML, client bundle, or public repository.** There is no public SELECT policy on the lead table. No customer PII is to appear in public page analytics.
4. **Qualify:** confirm business website, goals, geographic audience, delivery assets and budget. Agree to written scope and terms; ensure advertiser and music/likeness rights.
5. **Quote:** the published *offer* figures are $499 Website Preview (one Reel + QR), $1,250 Experience (three Reels), and $2,500 Digital Twin proposal (five Reels). Holo Ads, Holo Reel standalone and product placement require custom quotes. Price is not an accepted order until written agreement.
6. **Payment (NOT LIVE from this page):** obtain customer's approval and use server-authoritative Stripe only after operator and account readiness verification. Never take payment details in a text inquiry. No demo wallet transfers, fake receipts or claimed automatic advertising earnings.
7. **Produce:** build the landing page first, then the Reel and QR; for digital twins and holographic placements, verify real approved GLB assets, rights, placement safety and destination before promise or publication. HoloGPT/Jarvis may assist with bounded workflows but cannot sign contracts.
8. **Review:** customer approves content, service delivery and promotional claims. All sponsored promotions must be legibly disclosed as advertising; do not imply paid media is organic programming.
9. **Deliver and verify:** give the customer a working link, Reel file, QR proof and deliverables checklist. Invoicing/fulfillment and actual ad impressions must be reconciled against provider/server records.
10. **Follow-up:** send personalized updates manually from an authorized business inbox, avoiding repetitive solicitations. Keep source lead details private.

## Owner-only queue query (Supabase SQL Editor)

Run this **only as an authorized owner/operator in Supabase**. It is never executed from the anonymous website.

```sql
select id, created_at, business_name, name, email, plan_id, status, source, notes
from public.business_os_leads
where status in ('new', 'contacted', 'qualified')
order by created_at desc
limit 50;
```

When a lead has actually been contacted, the owner may deliberately record that state in the dashboard. Example with a **real** lead ID only:

```sql
-- Run as a privileged operator, after making contact; substitute your real UUID.
update public.business_os_leads
set status='contacted'
where id = '<verified-uuid>'::uuid and status='new'
returning id, status;
```

The allowed status values are `new`, `contacted`, `qualified`, `won` and `lost`. Mark `won` only after a genuine signed order and verified settlement, not when a quote or ad draft is created.

## Short customer follow-up text

**Subject:** TRYAMM service inquiry — [reference]

"Thanks for requesting [selected service] from TRYAMM LLC. Your inquiry reference is [reference]. We can review your website or creator goals, available assets, approved product/media rights and estimated scope. This inquiry does not constitute a purchase or active advertisement. Please reply with your preferred consultation time and any public website or brand links you'd like us to review."

## Launch acceptance gates

- [x] Supabase RPC `submit_business_os_lead` exists, with corrected lowercase email validation.
- [x] Anonymous RPC insert was executed in an explicit transaction and rolled back; no test rows remained.
- [x] Public lead table has RLS enabled and no public SELECT policies.
- [x] GitHub Omniverse CI and `/discover` compiled HTTP smoke were green on the tested development commit.
- [ ] Vercel account restored, or a separately approved equivalent hosting provider selected.
- [ ] Preview environment has `VITE_SUPABASE_URL` and **publishable** Supabase client key (not a service-role secret).
- [ ] Real browser-tested form submission on a non-production preview, with authorized read-only queue confirmation; remove any test data.
- [ ] CAPTCHA / bot challenge and server-side abuse/rate controls assessed before broad public launch.
- [ ] An authorized operator assigned to check leads and contact customers.
- [ ] Payment credentials, server-confirmed checkout and reconciliation tested before claiming ability to accept paid orders.
- [ ] One genuine paying customer receives the agreed website, Reel/QR and receipt.

**Status definitions:** CI green means the committed build passed software tests. "Ready for a paying customer" requires the additional gates above; "live" requires a deploy and public browser verification.
