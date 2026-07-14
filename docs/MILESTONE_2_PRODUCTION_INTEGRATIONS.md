# TryAMM Milestone 2 — Production Integrations

## Objective
Activate and verify the existing Stripe, Paystack, Flutterwave, LiveKit, Anthropic Claude, and Meshy foundations. A provider is not considered complete merely because an API key is present. Completion requires signed callbacks, persistent records, error handling, security controls, and acceptance tests.

## 1. Stripe subscriptions and token packs

### Required work
- Create live and test products/prices for each published subscription tier and token pack.
- Connect authenticated TryAMM accounts to Stripe customer IDs.
- Create Checkout Sessions for subscriptions and one-time token-pack purchases.
- Attach user, referral, campaign, country, and product metadata.
- Use idempotency keys on every checkout-creation request.
- Add Stripe Billing Portal access for subscription upgrades, downgrades, cancellation, and payment-method management.
- Verify the raw signed webhook body with `STRIPE_WEBHOOK_SECRET`.
- Process at minimum: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_intent.succeeded`, `charge.refunded`, and dispute events.
- Post successful purchases to the wallet ledger only after signed webhook verification.
- Grant token packs once per provider reference.
- Activate, renew, suspend, and cancel subscriptions from verified provider state.
- Connect referral attribution and trial conversion to verified payment events.
- Add refund, dispute, and chargeback state handling.
- Add customer-facing success, cancellation, and portal-return behavior.

### Acceptance tests
- Test subscription starts, renews, fails, upgrades, downgrades, and cancels.
- Test token packs are credited exactly once.
- Replay the same webhook and confirm no duplicate ledger entry or entitlement.
- Test expired Checkout Sessions and abandoned checkouts.
- Confirm no raw card details are stored by TryAMM.

## 2. Paystack and Flutterwave checkouts and payouts

### Required work
- Configure test and live credentials separately.
- Support localized country/currency/channel routing.
- Nigeria: NGN card, bank, transfer, and USSD where provider-supported.
- Other supported markets: mobile money and local channels only where the selected provider currently supports them.
- Create provider payment references and persist pending payment intents.
- Verify Paystack HMAC signatures and Flutterwave webhook secrets against the raw request body.
- Verify transaction status with the provider before wallet credit or order fulfillment.
- Add idempotent webhook processing and duplicate-reference protection.
- Create and verify payout recipients or beneficiaries.
- Require completed KYC, AML/sanctions review, payout-account verification, and dual approval before payout release.
- Track payout queued, processing, successful, failed, reversed, and retried states.
- Connect checkouts to wallet, marketplace order, escrow, tax reserve, seller settlement, and referral attribution.
- Add daily reconciliation reports comparing provider transactions to TryAMM ledger entries.
- Add refunds, disputes, failed transfers, expired temporary accounts, and incomplete USSD handling.

### Acceptance tests
- Test successful and failed card, transfer, and USSD flows.
- Test duplicate webhooks and mismatched amounts/currencies.
- Test payout recipient creation and a sandbox payout.
- Confirm failed or unverified events do not credit wallets or release escrow.
- Confirm payout actions require protected administrative authorization and dual approval.

## 3. LiveKit WebRTC broadcasting

### Required work
- Connect `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`.
- Issue short-lived authenticated room tokens server-side only.
- Bind token identity to the signed-in Supabase user.
- Enforce host, co-host, guest, moderator, and viewer roles.
- Apply publish, subscribe, data, screen-share, and recording permissions by role.
- Validate room names and prevent arbitrary privilege escalation.
- Support camera, microphone, device selection, mute, reconnect, network-quality reporting, and leave-room cleanup.
- Support panel rooms, PK streaming, spectator rooms, and teen/adult safety separation.
- Add participant limits, publisher limits, moderation actions, and abuse reporting.
- Add recording/replay policy and consent controls before enabling egress.
- Add browser and mobile permission/error states.

### Acceptance tests
- Two real devices can join the same room with video and audio.
- Viewer tokens cannot publish.
- Moderator actions affect the correct participant.
- Reconnect works after temporary network loss.
- Invalid, expired, or altered tokens are rejected.

## 4. Anthropic Claude holographic AI helpers

### Required work
- Configure the API key only in server secrets.
- Use the selected approved Claude model through environment configuration.
- Connect Googolplex Memory and approved TryAMM knowledge retrieval.
- Apply Gen X-to-Gen Alpha communication preferences and accessibility settings.
- Add moderation, prompt-injection resistance, tool allowlists, redaction, and output evaluation.
- Add token, request, daily cost, and per-user rate limits.
- Log provider latency and failures without storing secrets.
- Preserve a local fallback when Claude is unavailable.
- Require explicit confirmation before payments, publishing, deletion, account changes, or legal filing actions.
- Show the user when the answer is AI-generated and when sources or memories were used.

### Acceptance tests
- Claude answers from approved knowledge and owner-scoped memory.
- One user cannot retrieve another user’s memory.
- Secrets and payment data are redacted.
- Unsafe tool actions require confirmation or are blocked.
- Cost/rate limits and fallback behavior work.

## 5. Meshy 3D holographic assets

### Required work
- Configure the Meshy API key in server secrets.
- Create authenticated text-to-3D jobs and persist job ownership.
- Poll or receive signed callbacks for job status.
- Store preview, refined model, texture, thumbnail, and download references.
- Import approved output into the reusable asset library.
- Record creator, prompt, source, license, version, commercial-use status, and originality review.
- Generate web/mobile LOD targets, collision requirements, compressed texture requirements, and engine-export manifests.
- Support assignment to avatars, products, NPCs, games, arenas, and virtual stores.
- Block failed, unreviewed, restricted, or unoptimized assets from production publication.

### Acceptance tests
- A signed-in user creates a job and can only read their own job.
- Completed output is persisted and visible in the asset library.
- Failed jobs expose a useful error and retry path.
- Unapproved assets cannot be publicly published.
- A sample GLB/GLTF asset loads in the Three.js viewer and passes the chosen mobile performance budget.

## Missing operational requirements that must be included

- Live Supabase migrations applied to staging and production.
- Separate test/staging/production credentials.
- Secret rotation and no credentials committed to GitHub.
- Provider dashboard webhook URLs configured.
- Central idempotency/event table and immutable audit records.
- Structured error logging, uptime monitoring, and alerting.
- Daily payment and payout reconciliation.
- Backup and rollback plan.
- Privacy, terms, refund, payout, token, creator, and acceptable-use policies.
- KYC/AML/sanctions provider onboarding where required.
- Accessibility and one-handed testing.
- Cross-browser and mobile-device testing.
- Load testing for chat, checkout, webhook, LiveKit-token, and asset-job endpoints.
- Security review before live money movement or public broadcasting.

## Client-provided credentials

The client supplies verified provider accounts and credentials through deployment secrets, never chat, source files, screenshots, or public GitHub issues:

- Stripe publishable key, secret key, webhook secret, products/prices, and portal configuration.
- Paystack public key, secret key, webhook configuration, settlement account, and transfer approval.
- Flutterwave public key, secret key, webhook secret, encryption key where required, settlement account, and transfer approval.
- LiveKit URL, API key, and API secret.
- Anthropic API key and approved model/budget.
- Meshy API key and optional callback secret.
- Supabase URL, anon key, service-role key, project reference, database password, and access token.

## Definition of done

Milestone 2 is accepted only when all agreed test cases pass in a staging deployment, signed webhooks update persistent Supabase records idempotently, real devices complete a LiveKit broadcast test, Claude and Meshy work through server-side credentials, customer portal and localized payment routes function, and the client receives an environment matrix plus a concise operations/runbook handoff.
