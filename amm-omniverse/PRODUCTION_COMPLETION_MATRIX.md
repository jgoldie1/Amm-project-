# TRYAMM Production Completion Matrix

Status: execution checklist for moving CODED/INTEGRATED/GATED features to LIVE.

## What is already in the repository
- React/Vite web app shell and PWA manifest.
- Capacitor Android/iOS dependencies and `capacitor.config.json`.
- Supabase migrations and RLS-enabled tables.
- production readiness registry, provider gateway, provider gates, smoke tests, security scan and health monitor.
- Holo Marketplace / Holo Delivery UI integrations, Trust Core, Money Engine domain model, Sustainability Engine, Business Launch, Domain/DNS, Quantum Zapier/Discord, JARVIS systems.

## Newly completed in this pass
- Server-authoritative persistence schema for Accessibility Passport.
- JARVIS scoped grants persistence.
- Consequential-action approval queue.
- Provider capability/evidence registry.
- Production feature-gate / kill-switch persistence.
- Account-scoped audit event persistence and RLS boundary.

Migration: `supabase/migrations/20260818191500_production_authority_core.sql`.

## Completion lanes

### 1. Server persistence + production auth/RLS
Current: CODED / migration-ready.
To finish:
1. Apply all Supabase migrations to the production project.
2. Verify Supabase Auth providers, redirect URLs, email/phone policies and MFA/passkey strategy.
3. Add server APIs/Edge Functions for privileged JARVIS grant/approval mutations.
4. Add RLS regression tests for owner/non-owner/anon/service-role cases.
5. Persist Holo Delivery orders/tracking, Marketplace orders/returns, Money Engine ledger and Company Twin signals using server-authoritative tables.
6. Enable database backups/PITR appropriate to the selected Supabase plan.

Gate to LIVE: all owner isolation tests pass; browser cannot alter privileged gates, provider evidence, money balances or canonical audit events.

### 2. End-to-end testing
Current: smoke/security/provider/readiness contract tests exist.
To finish:
- Add browser E2E coverage (Playwright or equivalent) for signup/login, Accessibility Passport, Marketplace browse/cart, Holo Delivery sandbox order/tracking, JARVIS approval request, reporting/blocking, and logout/session recovery.
- Add server integration tests for RLS, idempotency, webhook verification, payment reconciliation and delivery state transitions.
- Test mobile viewport, keyboard-only, screen reader semantics and reduced motion.
- Run load tests for LIVE/community/realtime paths before public scale.

Gate to LIVE: high-risk features require stored test evidence in provider gateway/evidence registry.

### 3. Payments / Jin Pay
Current: GATED; no real-money authority claimed.
Required external steps:
- select licensed payment processor/platform provider;
- production account approval and business verification;
- Connect/marketplace architecture if paying sellers/creators/couriers;
- KYC/KYB/AML responsibilities documented;
- production webhook secrets and signature validation;
- double-entry ledger + provider reconciliation;
- refunds/disputes/chargebacks/payout holds;
- tax/reporting obligations and payout support.

Gate: REAL_MONEY / REAL_PAYOUTS remain OFF until evidence, E2E tests, monitoring and rollback are stored.

### 4. Real delivery providers
Current: Holo Delivery UI/domain INTEGRATED; provider delivery is GATED.
Required:
- maps/geocoding provider;
- courier/delivery partner or first-party courier operations with appropriate insurance/background/compliance;
- masked communications;
- realtime location provider/channel;
- quote/dispatch API adapter;
- proof-of-delivery and dispute operations;
- food-delivery food-safety/merchant requirements;
- package declared-value/loss/damage policy.

Drone/robot remains separately GATED until approved operator and jurisdiction evidence exist.

### 5. App Store / Google Play
Current: Capacitor config/dependencies present; signed native packages not produced in repository.
Required:
- run `npm run check` successfully from a build environment;
- `npx cap add android` / `npx cap add ios` if native folders are not already generated;
- sync production build;
- configure icons/splash/privacy manifests/permissions;
- signed AAB/APK through Android Studio;
- signed iOS archive through Xcode on macOS;
- Google Play/App Store Connect listings, screenshots, privacy/data-safety declarations, age rating;
- submit and resolve review feedback.

Gate: `ios-android` becomes LIVE only after store approval evidence is stored.

### 6. Telehealth / Medicaid
Current: GATED.
Required:
- licensed/credentialed providers in each serviced jurisdiction;
- HIPAA-capable vendor architecture and BAAs where applicable;
- clinical escalation/emergency policies;
- payer/Medicaid enrollment and billing provider setup;
- coding/documentation/compliance/audit workflow;
- no billing unless the rendering/billing entity is properly enrolled and the service is covered/authorized.

TRYAMM may charge lawful platform/technology fees under reviewed contracts; it must not misrepresent itself as the licensed provider or enrolled billing entity unless it actually becomes one.

### 7. Tele-Law / Lawyer on Demand
Current: GATED.
Required:
- licensed attorneys by jurisdiction;
- conflicts checking;
- engagement/fee agreements;
- attorney-client confidentiality/security;
- state professional-conduct review including referral/fee-sharing/advertising rules;
- emergency/police-stop feature framed as fast connection to licensed counsel, not automated legal representation.

### 8. Tax / bookkeeping
Current: GATED.
Required:
- qualified preparers; PTIN where required for paid federal return preparation;
- engagement terms, data security and document retention;
- e-file/provider setup if offered;
- bookkeeping and tax services clearly separated by scope/credentials.

### 9. Insurance / realty / remote notarization
Current: GATED.
Required: licensed/commissioned professionals, state-by-state availability, compliant compensation/referral structure, disclosures and record retention.

### 10. Registrar / reseller integration
Current: Domain/DNS and Forever Domain Care CODED; registrar capability GATED.
Lowest-capital pathway:
- contract with an ICANN-accredited registrar or reseller/wholesale API provider instead of applying for ICANN registrar accreditation first;
- integrate domain search, purchase, contact verification, nameservers/DNS, renewals, transfers, redemption/expiry and pricing feeds;
- clearly disclose pass-through registry fees and Forever Domain reserve terms;
- keep customer transfer/export rights.

### 11. Music / media licensing
Current: Soul Ascension / Creator distribution legal gate.
Required:
- creator-upload rights attestations and takedown process;
- performance/mechanical/master/sync rights as applicable to each use;
- platform agreements with applicable rights organizations/distributors/providers;
- do not assume ASCAP/BMI/DistroKid or any other service covers every music use.

### 12. Final mobile packaging
Native packaging can be generated only in an environment with Android tooling and, for iOS, macOS/Xcode and developer signing credentials. Repository readiness is not the same as store approval.

## Launch sequence
Phase A — Web/PWA public beta: non-regulated, non-real-money experiences that pass `npm run check` and production regression tests.
Phase B — Auth/persistence: apply production migrations, RLS tests, JARVIS approvals, account persistence.
Phase C — Sandbox commerce: Marketplace/Holo Delivery/Jin Pay sandbox with no real payout claims.
Phase D — approved providers: payments, maps/delivery, LiveKit and registrar turned on only after evidence.
Phase E — stores: signed Android/iOS builds and reviews.
Phase F — regulated lanes: telehealth/Medicaid/legal/tax/insurance/realty/notary enabled jurisdiction by jurisdiction only after partner and compliance evidence.

## Definition of completion
A feature is LIVE only when code, integration, tests, production credentials/provider approval, monitoring, rollback and any applicable legal/regulatory evidence are all present. Anything missing stays TESTED or GATED.
