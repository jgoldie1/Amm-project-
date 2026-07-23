# OmniPay / TryAMM App Review Checklist

## Public reviewer URLs
- https://tryamm.online/omnipay
- https://tryamm.online/privacy
- https://tryamm.online/terms
- https://tryamm.online/refunds
- https://tryamm.online/support
- https://tryamm.online/account-deletion

## Required before submission
1. Confirm every public URL is deployed and returns HTTP 200 over HTTPS.
2. Add real support email/domain contact to app-store metadata and public support page.
3. Complete Privacy Policy legal review for actual data collection and regional requirements.
4. Complete Terms and Refund policy legal review for actual products and jurisdictions.
5. Implement in-app account deletion for account-creating apps and keep the public deletion URL available.
6. Configure Stripe with restricted API keys where possible, verified webhooks, idempotency, and environment separation.
7. Use Stripe Checkout Sessions for standard one-time purchases, Billing + Checkout for subscriptions, Accounts v2 for eligible marketplace/creator structures, and approved Terminal/Tap to Pay SDKs for card-present flows.
8. Verify Connect v2 capability state before payments/transfers; do not rely on deprecated v1 `charges_enabled`/`payouts_enabled` checks.
9. Keep OmniCredits closed-loop unless legal/compliance review explicitly approves broader functionality.
10. Separate app-store-billed digital goods from external-payment-eligible transactions according to current Apple/Google rules in each country/product category.
11. Complete Data Safety / App Privacy disclosures based on the real SDKs and production data flows—not architecture documents.
12. Provide reviewer credentials/demo flow if login is required.
13. Make payment/provider availability country-aware. Do not show unsupported methods merely because an adapter exists.
14. Test refunds, cancellations, failed payments, duplicate webhooks, chargebacks, payout failures, and account deletion end-to-end.
15. Add production monitoring, support escalation, fraud review, and reconciliation ownership.

## Regional routing intent
- US/eligible global: Stripe primary.
- Nigeria/Africa: Stripe where eligible, with licensed regional fallback adapters such as Flutterwave/Paystack where required.
- Brazil/Latin America: Stripe where eligible, including local methods where supported; approved regional fallback for missing rails.
- All regions: capability checks, KYC/KYB where required, FX/fee disclosure, tax/legal review, sanctions/fraud screening through appropriate providers.

## Do not claim until verified
- Do not claim OmniPay is a bank, licensed processor, money transmitter, or universal global payment network unless the applicable licenses and contracts are actually in place.
- Do not claim every country/payment method is supported until tested and enabled for the production account.
- Do not claim app-store approval before approval is received.

## Current technical truth
The repository contains the OmniPay/TapPay product architecture, regional routing foundation, public submission pages, CostOps/analytics foundations, and payment orchestration managers/routes. Real-money production readiness still requires live Stripe/provider configuration, durable ledger/reconciliation, authenticated user/merchant identity, deployed public policy URLs, tested webhooks, app-store-specific billing compliance, and end-to-end QA.
