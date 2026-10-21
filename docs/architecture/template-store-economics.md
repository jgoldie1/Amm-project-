# TRYAMM website-template store — beta pricing proposal

## Scope shipped in the beta source
Ten numbered industry presets share a responsive page generator. Buyers enter public business information and a JPG/PNG/WebP photo (2 MB maximum), preview a sandboxed HTML document, and download that document plus a JSON setup brief. Their inputs remain local to the page. There is no database submission, purchase, paid entitlement, automatic hosting installation, AI subscription activation, or working checkout in this deliverable. Labels explicitly disclose those limits. This is not ten distinct completed industry applications.

## Proposed offers
- DIY template: $49 once; one business, responsive page, editable content; domain and hosting separate.
- Assisted launch: $149 once; supplied content setup, one revision, domain connection; domain and hosting separate.
- Commerce setup: $299 once; up to ten supplied products, provider-verified checkout setup; domain, hosting, payment fees and ongoing support separate.
- AI Starter: $19/month proposed, 200 short text replies, one FAQ.
- AI Growth: $49/month proposed, 800 short text replies, FAQ and lead questions.
- No unlimited usage. No voice/video included. Limit tokens and context size; meter successful delivery and enforce a provider-cost ceiling before enabling billing. No automatic overages. Do not imply these controls are already deployed.
- Previously promised gifted websites remain free; do not retroactively charge recipients. Optional ongoing AI must be separately accepted.

## Illustrative contribution, not net profit
Assume standard domestic US Stripe card processing at 2.9% + $0.30 (stripe.com/pricing, checked 2026-10-19). Other methods, international cards, tax/Billing/Connect fees, disputes and refunds can differ.

$149 assisted sale - $4.62 processing - $35 labor allowance - $10 delivery/support allowance = $99.38 contribution, before acquisition, taxes, fixed overhead and extraordinary support.

$19 AI month - $0.85 processing - $4 AI cost allowance - $3 support allowance = $11.15 contribution. $49 AI month - $1.72 processing - $10 AI allowance - $7 support = $30.28. These are planning assumptions, not measured costs. Reply limits must be validated against actual model token cost; do not promise these margins.

## Activation gates
1. Choose a completed, supported template product and exact delivery/license/refund terms.
2. Store immutable product IDs and authoritative prices on the server. Browser estimates are not checkout authority.
3. Configure Stripe, verify signed webhooks and idempotency; create entitlement only after server confirmation.
4. Store buyer assets with tenant isolation, ownership and removal controls; never put customer secrets in exported files.
5. Provision a private site draft; show it to the buyer before publication. Validate domain ownership and DNS. Track deployment outcome and retry safely.
6. Meter AI server-side with per-tenant spend limits; charge/refund based on the defined delivery policy. Do not fund customer usage from another tenant's balance.
7. Full purchase-to-delivery test, failed-payment and refund tests, then a small paid pilot.

OmniCare is an information/contact preset, not telehealth, an EHR, prescription processing or a patient-data system. Professional and security presets do not supply licenses or certifications. An uploaded screenshot can guide design but does not prove rights to reuse another website's code or content.

Customer journey target: number -> package -> supplied content -> preview -> verified payment -> private draft deployment -> approve -> publish. The beta currently completes number -> package -> supplied content -> preview -> download.
