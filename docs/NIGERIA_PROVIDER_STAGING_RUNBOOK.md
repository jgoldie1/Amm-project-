# Nigeria Provider Staging Runbook

## Staging architecture

The existing `tryamm.online` Vercel project is a Vite frontend. Do not register its frontend-only URL as a payment webhook until the Express backend routes are deployed publicly.

Deploy the Express service from this branch using `render.yaml` or another Node 20+ web service. Set `APP_URL` to the resulting HTTPS origin, for example:

`https://tryamm-api-staging.example.com`

## Required server secrets

Store these only in the hosting provider secret manager. Never commit them.

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY` (test key for staging)
- `PAYSTACK_WEBHOOK_SECRET` if separately provided by the account
- `FLUTTERWAVE_SECRET_KEY` (test key for staging)
- `FLUTTERWAVE_WEBHOOK_HASH` (random high-entropy value configured identically in Flutterwave and staging)
- `APP_URL`
- `ADMIN_EMAIL`

## Callback and webhook URLs

After the backend staging URL exists, configure:

- Paystack callback: `${APP_URL}/omniverse-v1.html`
- Paystack webhook: `${APP_URL}/api/webhooks/paystack`
- Flutterwave redirect: `${APP_URL}/omniverse-v1.html`
- Flutterwave webhook: `${APP_URL}/api/webhooks/flutterwave`

## Paystack staging steps

1. Complete Paystack business/test-account access.
2. Copy the test secret key from the authorized Paystack dashboard into the hosting secret manager.
3. Register the HTTPS webhook URL above.
4. Create an NGN intent through TryAMM.
5. Initialize the intent and open the returned hosted checkout URL.
6. Complete a small test transaction using Paystack-provided test credentials.
7. Confirm signed webhook receipt, provider reverification, one ledger posting, one entitlement, one receipt, and one pending settlement.

## Flutterwave staging steps

1. Complete Flutterwave test-account access.
2. Copy the test secret key into the hosting secret manager.
3. Generate a random webhook hash in the Flutterwave dashboard and store the identical value as `FLUTTERWAVE_WEBHOOK_HASH`.
4. Register the HTTPS webhook URL above.
5. Create and initialize a small NGN intent.
6. Complete the transaction using Flutterwave-provided test credentials.
7. Confirm signed webhook receipt, provider reverification, one ledger posting, one entitlement, one receipt, and one pending settlement.

## Supabase verification queries

After each provider test, verify rows exist in:

- `payment_intents`
- `webhook_events`
- `ledger_entries`
- `entitlements`
- `receipts`
- `settlements`
- `audit_events`

Expected uniqueness:

- one payment intent per idempotency key
- one fulfilled provider event per provider/event ID
- one entitlement per payment intent and type
- one receipt per payment intent
- one settlement per payment intent

## Settlement matching

Do not mark a payment fully reconciled merely because the customer payment succeeded. Compare the provider settlement/export record with:

- provider reference
- gross amount
- fees
- net amount
- currency
- settlement batch
- bank deposit reference

Move the settlement state only after the provider batch and bank deposit are matched.
