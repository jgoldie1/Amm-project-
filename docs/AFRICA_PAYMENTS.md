# TryAMM Africa Payments and Business Layer

## Provider strategy

TryAMM supports a provider-neutral African payments layer. The initial providers are:

- Flutterwave
- Paystack (interpreted from the phrase “Stack Flow”)
- Mock mode for local development

The application must never expose secret keys in browser code. All payment initialization, verification, payouts, refunds and webhook processing occur on the server.

## Initial business use cases

1. Marketplace checkout
2. Creator subscriptions
3. Coins and digital gifts
4. Music, film, course and event purchases
5. Vendor settlements
6. Creator and agency payouts
7. Donations for approved faith and community programming
8. Advertising and promoted listings
9. Ticket sales for virtual and physical events
10. Cross-border commerce where the selected provider and local law permit it

## Payment methods

Provider and country availability varies. The platform architecture should support:

- Debit and credit cards
- Bank transfer
- USSD
- Mobile money
- Recurring payments where supported
- Dedicated or virtual accounts where supported
- Refunds and disputes
- Bank and mobile-money payouts

Never advertise a method in a country until the provider account confirms it is enabled.

## Provider routing

Use `AFRICA_PAYMENT_PROVIDER` for the default provider. A future payment router may select a provider by:

- Merchant country
- Customer country
- Currency
- Payment method
- Provider uptime
- Transaction cost
- Settlement speed
- Regulatory availability

Never retry a charge through another provider without the customer’s knowledge. Use idempotency and one internal order reference.

## Marketplace money flow

Recommended ledger sequence:

1. Create internal order in `pending` state.
2. Calculate subtotal, tax, delivery, discounts and platform fee.
3. Initialize provider checkout using a unique reference.
4. Redirect the customer to hosted checkout.
5. Receive and verify the webhook signature.
6. Verify the transaction with the provider API.
7. Match amount, currency, reference and merchant account.
8. Mark the order `paid` exactly once.
9. Credit seller and creator ledger balances.
10. Hold funds for the configured risk/refund period.
11. Queue an approved payout.
12. Reconcile provider settlement with the internal ledger.

A browser redirect is not proof of payment. Only a verified server-side event may mark an order paid.

## Creator and vendor onboarding

Before payouts, collect only the information required by the payment provider and applicable law:

- Legal or business name
- Country
- Address
- Email and phone
- Identity or business verification status
- Bank or mobile-money payout destination
- Tax information where required
- Content or product category
- Acceptance of marketplace and payout terms

Sensitive identity documents should be handled by an approved KYC provider or payment provider. Do not store unnecessary copies.

## African market launch sequence

Start with a controlled pilot instead of enabling all countries at once.

### Wave 1

- Nigeria
- Ghana
- Kenya
- South Africa

### Wave 2

- Uganda
- Tanzania
- Rwanda
- Zambia
- Côte d’Ivoire and other supported Francophone markets

The actual launch list must be confirmed against current provider coverage, licenses, currencies, settlement support, taxes and local counsel.

## Localization requirements

- Local currency display
- English, French, Arabic, Portuguese and selected African languages
- Low-bandwidth checkout
- Mobile-first layout
- Clear exchange-rate disclosure
- Local date, phone and address formats
- Customer support escalation by country
- Accessible voice and one-handed payment flows

## Security controls

- Hosted checkout by default
- Webhook signature verification
- Server-side transaction verification
- Idempotency keys
- Internal double-entry ledger
- Role-based payout approval
- Payout velocity and amount limits
- Fraud and device-risk signals
- Audit log for every money movement
- No secret keys in Git or browser code
- Separate test and live credentials
- Daily reconciliation

## Compliance controls

TryAMM is a marketplace and software platform, not automatically a bank, money transmitter or remittance provider. Before live operation:

- Confirm provider terms allow the use case.
- Complete merchant and marketplace onboarding.
- Review KYC, AML and sanctions obligations.
- Review consumer protection, refund and chargeback rules.
- Review tax, VAT, withholding and invoice requirements by country.
- Review data protection and cross-border data-transfer rules.
- Do not offer stored balances, lending, remittances or currency exchange without the required licensed partner and legal approval.

## API routes added

- `POST /api/payments/initialize`
- `POST /api/payments/payouts`
- `POST /api/payments/webhooks/flutterwave`
- `POST /api/payments/webhooks/paystack`

Payout requests require the temporary `x-admin-key` safeguard. Replace it with authenticated role-based approval before production.

## Required production database tables

- payment_customers
- merchant_accounts
- orders
- order_items
- payment_attempts
- payment_events
- refunds
- disputes
- ledger_accounts
- ledger_entries
- payout_destinations
- payout_requests
- settlements
- reconciliation_runs
- tax_records

JSON event storage is development-only and must be replaced with PostgreSQL before handling live money.

## Acceptance tests

- Mock checkout completes without provider keys.
- Invalid amounts are rejected.
- Missing customer email is rejected.
- Invalid webhook signatures receive HTTP 401.
- Duplicate webhook events do not duplicate ledger credits.
- Paid amount and currency must match the internal order.
- A failed payout does not reduce available balance twice.
- Browser code contains no secret key.
- Logs never print full bank, card or identity data.
