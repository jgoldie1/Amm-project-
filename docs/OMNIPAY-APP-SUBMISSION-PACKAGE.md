# OmniPay by TryAMM — App Submission Package

## Product identity
- Name: OmniPay by TryAMM
- Public URL: https://tryamm.online/omnipay
- Parent platform: TryAMM
- Category: payments / commerce enablement within the TryAMM ecosystem
- Positioning: one payment experience for checkout, subscriptions, creator commerce, marketplace purchases, OmniCredits, TapPay and eligible regional methods through regulated providers.

## App-review description
OmniPay is TryAMM's original payment orchestration and commerce experience. It connects eligible users, creators, businesses and marketplace transactions to licensed payment providers such as Stripe and approved regional partners. OmniPay does not represent itself as a bank, card network, money transmitter or payment processor unless applicable licenses are actually held.

## Core user flows
1. User selects a TryAMM product, service, subscription, creator item or eligible marketplace purchase.
2. OmniPay determines country, currency, product type and eligible payment methods.
3. TryAMM routes the transaction to an approved regulated payment provider.
4. Customer authorizes payment using the provider-hosted/tokenized flow.
5. Signed provider webhook confirms final payment state.
6. TryAMM records transaction, entitlement, receipt, fees, creator/platform allocation and analytics.
7. Refunds/disputes/payouts follow the applicable provider and platform workflow.

## Stripe-first architecture
- Checkout Sessions for one-time checkout.
- Stripe Billing + Checkout for subscriptions.
- Accounts v2 for eligible Connect marketplace/creator accounts.
- Capability status checks before payments/transfers.
- Signed webhooks as source of truth.
- Dynamic payment methods rather than hard-coding consumer payment-method types.
- Apple Pay / Google Pay where enabled and eligible.
- Tap to Pay / Terminal through approved Stripe SDKs on supported devices/markets.

## Regional routing
### United States and eligible global markets
Primary provider: Stripe where eligible.

### Nigeria and Africa
Use country/currency/capability routing. Prefer Stripe when the exact account and payment capability is supported; otherwise route through approved regional providers such as Flutterwave or Paystack where appropriate and legally available.

### South America / Latin America
Use Stripe where supported plus regional provider adapters. Local methods such as Pix in Brazil must only be shown when supported by the connected provider/account, currency and customer context.

## OmniCredits
OmniCredits are closed-loop TryAMM platform credits for eligible digital services. They should not be described as bank deposits, cash, investments, cryptocurrency, guaranteed stored value or withdrawable money unless a separately reviewed legal structure supports that claim.

## Required public pages before submission
- OmniPay product page: `/omnipay`
- Privacy Policy
- Terms of Service
- Refund/Cancellation Policy
- Support/Contact page
- Account deletion instructions if user accounts are supported
- Data safety disclosure matching actual collection and SDK behavior
- Region/country availability statement

## Review notes for app stores
- Payment methods and regional capabilities vary by provider and eligibility.
- Sensitive payment data should be handled by tokenized/provider-hosted components.
- Do not embed or expose secret API keys in mobile/web clients.
- Use HTTPS everywhere.
- All money-moving webhooks must be signature-verified and idempotent.
- Show digital-goods purchase mechanisms in compliance with the applicable app-store rules for the platform and product type; do not assume external checkout is permitted for every in-app digital purchase category.

## Required production gates
- Stripe production account and approved capabilities.
- Restricted server-side API keys where feasible; secrets only in secure environment storage.
- Checkout/Billing implementation.
- Connect onboarding/capability checks where marketplace payouts are enabled.
- Webhook signature validation and idempotency.
- Durable payments ledger and reconciliation.
- Refund/dispute workflow.
- Tax/VAT/GST strategy and registrations before enabling automated tax collection.
- KYC/KYB and sanctions/fraud controls through appropriate providers.
- Privacy/security review.
- App-store policy review for every purchase surface.
- End-to-end sandbox and live-mode acceptance tests before launch.

## Victor handoff
Treat this page/package as the public and review-facing layer. Do not claim OmniPay is live in a country or supports a payment method until the real provider integration passes capability, compliance and end-to-end transaction tests for that market.
