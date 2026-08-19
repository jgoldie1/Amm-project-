# TRYAMM 100% Completion Contract

Status: LOCKED

## Definition
TRYAMM reaches 100% for the **core platform we directly control** only when the complete authenticated journey is reproducible, tested, evidenced, and deployable without redefining completion.

The authoritative sequence is:

SECURITY → PROVIDER GATES → PRODUCTION READINESS → BUSINESS JOURNEY → LIVE PERSISTENCE → TYPECHECK → SMOKE → BUILD → BROWSER E2E → DEPLOYMENT → AUTHENTICATED ACCEPTANCE EVIDENCE.

## Core authenticated journey
1. Real account login/session.
2. Passport save and reload.
3. Business creation and reload.
4. Marketplace order creation.
5. JARVIS approval/permission firewall.
6. Server-authoritative sandbox Money Engine record.
7. Realtime Holo Delivery state progression.
8. Business dashboard aggregation.
9. Persisted audit evidence with correlation IDs.
10. Full reload proving durable state.

## Persistence authority
- Browser/client may read owner-scoped state where permitted.
- Writes that affect money, privileged roles, security state, approvals, audit evidence, or authoritative order/delivery state go through authenticated server functions/services.
- Supabase RLS remains enabled and deny-by-default for cross-owner access.
- Client local storage is never authoritative for money, identity, role, approval, production feature gates, or audit evidence.

## Required code-controlled gates
- repository security/secret/dependency/antivirus checks complete successfully;
- provider-gate logic passes;
- production-readiness checks pass for code-controlled requirements;
- TypeScript passes;
- smoke tests pass;
- Vite production build passes;
- browser E2E passes for the mounted journey;
- Supabase migrations and RLS policies are reproducible from repository migrations;
- realtime order/delivery subscriptions are participant-scoped;
- sandbox financial mutations are idempotent and server-authoritative;
- audit evidence persists action name, actor, authorization basis, result, timestamp, and correlation ID;
- deployment/preview points at the intended `amm-omniverse` application and branch;
- rollback path is documented.

## External/provider gates that do NOT block core-code 100%
These remain separate status gates and may not be labeled LIVE without outside evidence:
- real Jin Pay/payment processing and payouts;
- card issuing / Tap to Pay / cross-border money movement;
- Medicaid or insurance billing;
- telehealth / telelaw / tax / insurance / realty / notarization professional execution;
- app-store approvals;
- drone/robot/autonomous-vehicle operations;
- regulated home/ghost-kitchen approvals;
- domain registrar/registry execution;
- external identity/KYB providers;
- licensed music/media rights.

For each such capability the allowed states are: CONCEPT → SPECIFIED → CODED → INTEGRATED → TESTED → GATED → LIVE.

## Release evidence package
A production acceptance packet should include:
- commit SHA and deployment URL;
- CI/security run IDs and conclusions;
- migration version/checksum;
- authenticated acceptance-test account ID or redacted evidence reference;
- resulting business/order/payment-sandbox/delivery/audit correlation IDs;
- screenshots/log references where appropriate;
- rollback instructions;
- provider-gate matrix.

## Stop conditions
Do not merge or call the core production-ready if:
- repository security/antivirus gate is cancelled or failing;
- main CI/build/typecheck is incomplete or failing;
- the deployment points at a stale or different project;
- browser E2E fails;
- RLS permits cross-user core reads/writes;
- money can be mutated directly from the browser;
- authoritative actions lack audit evidence.

## Final meaning of 100%
`CORE 100%` means the software-controlled authenticated TRYAMM core journey is reproducible from source, deployable, secure by the defined gates, and evidenced end-to-end.

It does **not** mean every externally regulated/provider-dependent feature is live. Those retain their own truthful provider readiness gates.
