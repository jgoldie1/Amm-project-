# TRYAMM Domains — OpenSRS Horizon Sandbox Setup

Prepared November 8, 2026. **Read-only integration; no registration, debit, DNS change or ownership transfer has been made.**

## Verified minimum costs (official provider pages)

- OpenSRS activation is a **one-time USD $95 nonrefundable payment converted to reseller account credit**, no monthly or annual account subscription. The balance funds wholesale registrations. https://opensrs.com/join
- Credit card/PayPal deposits before December 1, 2026 have a 3% fee calculated on the final charged amount, **not** simply 3% of the requested credit: for a $95 credit deposit without tax, **$95/0.97 ≈ $97.94** if this deposit fee applies. On/after December 1, 2026, 4%: **$95/0.96 ≈ $98.96**. Eligible U.S./Canada ACH deposits have no OpenSRS processing fee. Actual signup checkout is authoritative. https://support.opensrs.com/support/solutions/articles/201000063426-understanding-the-processing-fee-for-deposits
- OpenSRS **Storefront** has $0 activation; needs account balance **above $10**, and charges **$0.75 per customer order** from your balance, in addition to wholesale domain cost. https://support.opensrs.com/support/solutions/articles/201000108428-faqs
- OpenSRS Storefront links to Stripe for customer checkout; standard U.S. domestic card pricing at Stripe is **2.9% + $0.30** per successful charge, with possible add-ons. Confirm actual connected Stripe account and fees before live orders. https://stripe.com/pricing
- Cloudflare DNS can be used for free (not equivalent to a domain registration or registrar reseller account). Vercel suspended hosting and any new Llama/GPU hosting are **not included** in these costs.

## The first paid step requires the owner

1. From the Gmail you control, **theammonmiverse@gmail.com**, open https://opensrs.com/join and create the business reseller account under TRYAMM LLC. Use only the official signup page.
2. Complete OpenSRS verification and review fee, accepted payment method and resale agreement before authorizing the $95 credit. No payment has been made by ChatGPT.
3. Activate OpenSRS Horizon (https://manage.test.opensrs.com/) with your official reseller credentials; provider docs state Horizon is available after activation. Test environment does not register real domains.
4. In OpenSRS Account Settings → API settings, obtain the API key using secure administrator account access. **Never paste credentials, 2FA codes or screenshots showing passwords into GitHub, ChatGPT or contractor messages.**
5. Set these **server-side**, using a secret manager in your API hosting environment, not in `VITE_`/browser variables:

```dotenv
TRYAMM_DOMAIN_RESELLER_ADMIN_EMAILS=theammonmiverse@gmail.com
TRYAMM_OPENSRS_HORIZON_ENABLED=true
TRYAMM_OPENSRS_HORIZON_USERNAME=<reseller-username-issued-by-OpenSRS>
TRYAMM_OPENSRS_HORIZON_API_KEY=<read-from-your-secure-OpenSRS-account>
```

Never commit real values. Leaving them empty keeps test access locked. This is **not** a live production registrar adapter.

## What the TRYAMM app can test

- Authenticated owner-only `POST /api/domains/horizon-check` with `{"domain":"example.com"}`, after the Horizon credentials are configured.
- `api/_lib/opensrs-horizon.js` signs OpenSRS XML using the legacy nested-MD5 mechanism required by OpenSRS, and only connects to the fixed TLS URL `https://horizon.opensrs.net:55443/`.
- Only `LOOKUP` and `GET_PRICE` requests are allowed. Returns `HORIZON_TEST_ONLY` availability and a *test* wholesale amount, never a guarantee of actual price/availability. No registration, change of nameservers, domain transfer, charge, renewal, or order is possible.
- Website builder: **PREPARE DOMAIN (NO CHARGE)**, **CHECK RESELLER CONNECTION**, **TEST DOMAIN IN OPENSRS HORIZON (NO CHARGE)**.
- Run: `cd amm-omniverse && npm run domain-provisioning:check && npm run typecheck && npm run build`. Test suite uses a fake HTTPS transport; a live Horizon test is *not* certified until credentials are entered and the owner triggers a real test lookup.

## Launch the first storefront faster than custom checkout

Instead of waiting for the custom registrar purchase adapter, use OpenSRS **Storefront** initially:

1. Sign in at https://manage.shopco.com/login after OpenSRS activation; link/confirm a **live** Stripe account under your control (the currently connected TRYAMM Stripe contexts may be test-only).
2. Keep the OpenSRS reseller account above the required $10 balance; set truthful markup, renewals and privacy price, branding, contact details and customer terms. Be aware of the $0.75/order fee plus wholesale and Stripe fees.
3. Use the Storefront test environment (Stripe sandbox) and complete simulated searches, checkouts, cancellation and renewal flows.
4. After successful end-to-end tests, activate the Storefront and link the official checkout page from TRYAMM's business builder. **Do not run both the OpenSRS Storefront checkout and TRYAMM custom Stripe checkout for the same domain order**, or customers could be charged twice.
5. Later implement live provider purchase API with a persistent domain-order state machine, a verified server-side payment webhook, idempotency, price/availability checks, audit logs and explicit owner approval.

## Protect existing TRYAMM domains

- Do not change `tryamm.online`, Cloudflare DNS, MX records, Vercel project or existing account ownership for a reseller signup.
- Vercel 402 and old Gmail two-step recovery are independent issues.
- One test-only adapter does **not** confer registrar accreditation, customer domain ownership, or actual registration capability.

Docs: https://domains.opensrs.guide/docs/quickstart and https://domains.opensrs.guide/docs/lookup-domain and https://domains.opensrs.guide/docs/get_price.
