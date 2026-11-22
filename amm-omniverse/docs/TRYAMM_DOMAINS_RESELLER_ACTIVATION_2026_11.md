# TRYAMM Domains — domain reseller activation / DNS handoff plan

Date: November 8, 2026 · Owner-administration target: `theammonmiverse@gmail.com`.

**Status: PREPARATION ONLY. No domains were purchased, no registrar credentials were connected, no payment was taken, and no nameservers were changed in this work.**

## What already exists in the TRYAMM app

- `src/services/domainProvisioning.ts`: 12-stage workflow from domain search and quote to SSL, site-health verification and LIVE.
- `api/domains/provision.js`: authenticated registration preparation; registrar and payment gates; **not a completed real registrar adapter**.
- `src/components/AIWebsiteBusinessBuilder.tsx`: business-site and domain request interface.
- `api/commerce/checkout.js` / `api/commerce/stripe-webhook.js`: marketplace checkout and webhook infrastructure. This does **not yet** create a server-verified domain order or automatically fund a wholesale registrar.
- `api/domains/status.js`: read-only account readiness with no token disclosure, no purchases.
- `tests/domain-reseller-payment-safety.test.mjs`: prohibits browser-asserted payment verification and premature claims. Included in `npm run domain-provisioning:check` and app CI.

The existing `tryamm.online` and `www.tryamm.online` domains were verified on Vercel; authoritative nameservers have been listed as `annabel.ns.cloudflare.com` and `marty.ns.cloudflare.com`. This indicates Cloudflare currently manages their DNS. It does **not** prove Cloudflare is the domain's legal registrar, or establish authority over other customer domains. Earlier history used `dns1.registrar-servers.com`/`dns2.registrar-servers.com`, which are Namecheap DNS hosts, but historical nameservers alone do not prove present registrar ownership.

**Do not change DNS for `tryamm.online` as part of the reseller launch.** Vercel currently has an account-level 402 deployment restriction, separate from DNS or registrar registration.

## Reseller choices (official provider information, verify before paying)

- **OpenSRS / Tucows**: official reseller onboarding shows a **$95 one-time activation fee credited to the account** and no monthly account fee. Test environment available before registrations. Provider wholesale domain charges still require prepaid funding, and processing fees can apply. Useful for a first white-label storefront or an API integration. Official source: https://opensrs.com/join and https://opensrs.com/payment-terms and https://support.opensrs.com/support/solutions/articles/201000063408-opensrs-quickstart-guide .
- **Enom**: official onboarding describes a **$50 one-time reseller signup fee**, with reseller API access after account review; wholesale prices and other account funding are separate. Official source: https://support.enom.com/support/solutions/articles/201000065296-becoming-an-enom-reseller .
- **ResellerClub**: provides a domain reseller API and sandbox; confirm country-specific deposit, funding and current agreement before paying. Official source: https://www.resellerclub.com/developer-portal .
- **Cloudflare**: current DNS hosting for `tryamm.online`. Its Registrar API supports registration workflows, but a general-purpose registrar API is **not** evidence that TRYAMM has a wholesale reseller agreement or resale rights. Do not claim to sell domains through Cloudflare until contract terms explicitly permit it. Official source: https://developers.cloudflare.com/registrar/registrar-api/ .

**Recommendation for an inexpensive first pilot:** compare an OpenSRS test + Storefront route with Enom's entry reseller plan. OpenSRS offers prepaid credit rather than a new monthly hosting bill. Do not pay yet while old-email ownership recovery is pending.

## Before activating paid registrations

1. Confirm you can access the provider owner account using `theammonmiverse@gmail.com`; store passkeys/recovery codes securely. Never share password screenshots, raw codes, API secrets or registrar tokens with contractors or ChatGPT.
2. Verify the signed reseller/registrant agreements, registrar identification, renewal notices, customer terms, privacy handling and consent. Do not represent TRYAMM as ICANN-accredited unless actually accredited.
3. Use a genuine **test** API account. The provider must return real-time availability, premium pricing, currency, first-year vs renewal costs and taxes before customer consent.
4. Connect registrar credentials **server-side only**, limiting API key privileges and IP ranges where supported. Implement provider-specific `quote → contact → provision → verify registration → DNS → SSL` adapters and idempotent order IDs.
5. Build a separate **domain checkout order** linked to authenticated customer, exact domain, amount and quote expiry. Only a verified Stripe webhook / server order reconciliation may unlock a real registration attempt. The current browser `paymentVerified` field is deliberately ignored.
6. Maintain **separate** retail funds (Stripe receipts/refunds) and wholesale funds (registrar prepaid balance/charges). A paid customer checkout does not mean the wholesale registrar has sufficient credit.
7. Implement safe recovery for failed/pending registrations, duplicate clicks, retries and provider timeouts. Never make a second registration purchase solely because the first API response was delayed. Domain registration fees are often non-refundable.
8. Set customer DNS only after registrar order confirmation. Preserve existing customer MX, SPF, DKIM, DMARC and verification records. Wait for DNS, certificate and site health to pass before marking LIVE.
9. Add customer self-service for transfer auth codes, contact corrections, renewal consent, expiration reminders, auto-renew preference, DNS rollback and support escalation.
10. End-to-end verify on test domains before enabling live charging. Lock release behind CI and explicitly recorded owner approval for the first real registration.

## How to verify now (no payment)

```bash
cd amm-omniverse
npm run domain-provisioning:check
npm run typecheck
```

In the website builder, use **CHECK RESELLER CONNECTION** to get the authenticated read-only readiness report; **PREPARE DOMAIN (NO CHARGE)** only drafts a request. The provider connection is NOT live yet.

## Existing system ownership / migration

Keep the real TRYAMM repo, database, Cloudflare DNS zone and Vercel project unchanged while Google 2-step recovery and owner transfer are pending. Prefer updating owner/contact email and granting a second owner rather than destroying old projects. A new provider reseller account should use the accessible email, with a separate recovery admin and backup method.

## Legal guardrails

A reseller must comply with its sponsoring registrar's agreement and the applicable ICANN reseller obligations, including identity disclosure upon inquiry and required registrant agreements. See https://www.icann.org/en/contracted-parties/accredited-registrars/resources/agreements-and-policies .
