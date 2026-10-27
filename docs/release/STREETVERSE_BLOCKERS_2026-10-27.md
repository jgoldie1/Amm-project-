# StreetVerse stabilization — release blockers (2026-10-27)

**Do not merge into main or deploy until the following are resolved and verified.** Evidence from branch head `ccee667f2fc68859b63ac9a8bdef86197cd8326f`.

## P0: iPhone visual proof
- Failed workflows: `StreetVerse Master Finish Action` run 40523195619 and `StreetVerse BJ Family Mega Fix` run 40523195446.
- Failing step: iPhone visual fit/proof; `amm-omniverse/tests/e2e/streetverse-visual-evidence.spec.ts` test `Circle Park renders with one compact mobile control layer`.
- Playwright error: expected locator to be visible; element not found.
- Work: inspect captured trace/screenshot and exact failing locator; repair the corresponding rendered route/control; rerun same mobile viewport E2E without weakening assertions. Physical device check remains necessary.

## P0: Repeated HTTP 402 assets
- Multiple failures `Failed to load resource: the server responded with a status of 402` appear in iPhone test logs.
- Work: capture failing asset URL domains (redact signed query parameters); separate provider quota/billing issue from public native fallback; confirm fallback imagery loads without pretending vendor quota is repaired. Do not commit credentials or charge a provider without approval.

## P0: Production dependency security audit
- `StreetVerse Chicago Morning Mega Convergence` run 40523195681: `Jacobie Quantum Shield + supply-chain gate` failed at `npm audit --omit=dev --audit-level=high` with **2 high severity vulnerabilities**.
- Work: capture full audit package/advisory output, update only affected dependency ranges/lockfiles, verify lockfile consistency, rerun install, audit, typecheck, unit and visual tests. Avoid broad unreviewed `npm audit fix` replacements.
- Morning release gate failed as a downstream consequence.

## P1: Deployment and commerce
- Vercel GitHub commit status previously reported `Account is blocked`. Do not interpret GitHub Actions success as production availability.
- Real business ownership, customer intake delivery, server-confirmed checkout/payment, refund and separate business ledgers have no verified end-to-end production evidence in this audit.
- Before New America or Global store release, validate licensed content, player saves, mobile performance and platform distribution channels.

## Existing safeguards
- GoogleX Guardian read-only CI, release preservation, and many build/contract workflows passed for `ccee667f`.
- Latest additions include opt-in mobile diagnostics, FPS recommendations, Low Effects toggle and announced logistics handoff.
- Never reset saves, bypass payment confirmation, suppress failed tests, or merge PR #675 to main just to obtain a green badge.

## Repair order
1. Security audit exact packages and mobile failure trace.
2. Patch highest impact small reversible change; write red test and green regression.
3. Verify UI on a simulated iPhone and a physical device.
4. Confirm fallback works during HTTP 402 and expose actionable user message.
5. Resolve Vercel billing/account block and verify staged deployment.
6. Test one real game → business inquiry → correct business dashboard, then server-authoritative payment.
