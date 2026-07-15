# TryAMM Live Provider Activation

This runbook separates code-complete work from account-owner actions. Never commit secrets to GitHub or paste them into chat, issues, screenshots, or source files.

## 1. Deployment secrets

Configure these in the deployment provider's encrypted environment settings:

### Supabase
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Stripe
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CREATOR_PRICE_ID`
- `STRIPE_ELITE_PRICE_ID`
- `STRIPE_STUDIO_PRICE_ID`
- `STRIPE_TOKEN_PACK_PRICE_ID`
- `STRIPE_PORTAL_CONFIGURATION_ID`

### Paystack
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`

### Flutterwave
- `FLUTTERWAVE_PUBLIC_KEY`
- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_WEBHOOK_SECRET`
- `FLUTTERWAVE_ENCRYPTION_KEY`

### LiveKit
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_TOKEN_TTL`
- `LIVEKIT_MAX_PUBLISHERS`
- `LIVEKIT_MAX_PARTICIPANTS`

### Claude
- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL`
- `CLAUDE_MAX_TOKENS`
- `CLAUDE_DAILY_BUDGET_USD`

### Meshy
- `MESHY_API_KEY`
- `MESHY_WEBHOOK_SECRET`
- `MESHY_CALLBACK_URL`

### Administration
- `ADMIN_ACTION_KEY`
- `PUBLIC_APP_URL=https://tryamm.online`
- `ALLOWED_ORIGIN=https://tryamm.online`

## 2. Apply Supabase migrations

GitHub environment secrets required by `.github/workflows/supabase-migrate.yml`:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

Run the workflow manually from GitHub Actions. Confirm every migration through `202607140013_production_integrations.sql` appears in the Supabase migration history. Then verify row-level security is enabled on payment events, entitlements, Meshy jobs, wallets, identity, escrow, news, assets, crawler, memory, and growth tables.

## 3. Create Stripe products

Set `STRIPE_SECRET_KEY` locally or in a protected workflow and run:

```bash
node scripts/bootstrap-stripe-products.js
```

Copy the generated price IDs into deployment secrets. Do not rerun against live mode unless new products are intended.

## 4. Register production webhooks

Use these HTTPS endpoints:

- Stripe: `https://tryamm.online/api/payments/webhooks/stripe`
- Paystack: `https://tryamm.online/api/payments/webhooks/paystack`
- Flutterwave: `https://tryamm.online/api/payments/webhooks/flutterwave`

Subscribe Stripe to checkout, invoice, subscription, payment-intent, refund, and dispute events. Configure Paystack and Flutterwave for charge, transfer, refund, and reversal events supported by the approved account.

After registration, send provider test events and confirm:

1. Signature verification passes.
2. `integration_events` receives one row.
3. Replaying the event creates no duplicate entitlement or ledger entry.
4. Amount, currency, owner, and transaction reference match.

## 5. Provider account approval

Account-owner actions:

- Complete business and beneficial-owner verification.
- Add settlement bank accounts.
- Enable transfers or payouts.
- Complete KYC/AML questionnaires.
- Confirm supported countries and currencies.
- Set payout and fraud limits.
- Configure refund, dispute, and chargeback contacts.

The application cannot approve its own merchant or money-transfer permissions.

## 6. LiveKit production project

Create or select the production LiveKit Cloud project, add its URL/key/secret, and test:

- host publishes camera and microphone;
- viewer cannot publish;
- moderator can receive data but cannot publish media;
- reconnect works after network interruption;
- two separate physical devices can see and hear each other;
- expired and altered tokens fail.

## 7. Claude controls

In the Anthropic account:

- set a monthly budget and alert thresholds;
- use a production project/key dedicated to TryAMM;
- restrict key access to the server deployment;
- review model availability and pricing;
- confirm the deployed `CLAUDE_MODEL`;
- test redaction, memory retrieval, moderation, fallback, and action-confirmation behavior.

## 8. Meshy terms and production test

Review the account's current commercial-use and generated-output terms. Save the review date and approved use in the asset metadata. Test one original avatar end to end:

1. Create job.
2. Poll until complete.
3. Persist model URLs and thumbnail.
4. Import into the reusable asset library.
5. Record licensing and originality review.
6. Optimize GLB/GLTF for web/mobile.
7. Display it in the approved viewer.

## 9. Acceptance tests

Staging:

```bash
TRYAMM_API_URL=https://staging.example.com \
TEST_SUPABASE_ACCESS_TOKEN='temporary-test-token' \
node scripts/acceptance-test.js
```

Required manual tests:

- Stripe subscription purchase, renewal, failure, cancellation and portal.
- Stripe token pack credited once.
- Paystack sandbox checkout and verified event.
- Flutterwave sandbox checkout and verified event.
- Approved sandbox payout for each available provider.
- Duplicate webhook replay.
- Wrong amount/currency rejection.
- LiveKit two-device broadcast and role tests.
- Claude memory, accessibility, moderation, budget and fallback tests.
- Meshy successful, failed and retried jobs.

Do not enable live money movement until sandbox results, reconciliation, refund procedures, monitoring and provider approvals are documented.
