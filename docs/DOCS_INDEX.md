# TRYAMM Documentation Index

Status: CURRENT

This index defines which Markdown files are authoritative and which are historical snapshots.

## Tier 1 — Canonical instructions

- `README.md` — platform mission, core pillars and launch boundaries.
- `CLAUDE.md` — AI/developer implementation instructions.
- `SKILL.md` — execution order, engineering contracts and validation checklist.
- `OVERVIEW.md` — current workspace summary.
- `docs/TRYAMM_CANONICAL_ARCHITECTURE.md` — locked product architecture baseline.

If documents conflict, Tier 1 wins unless a newer explicitly approved architecture decision supersedes it.

## Tier 2 — Active architecture references

- `docs/ALGORITHM_STUDIO.md`
- `docs/UNIFIED_ACCOUNT_PASSPORT_WALLET.md`
- `docs/CREATOR_PROJECT_MODEL.md`
- `docs/MONEY_ENGINE_INTEGRATION.md`

## Tier 3 — Required docs to maintain as implementation grows

- `docs/LAUNCH_READINESS.md` — current readiness by feature and surface.
- `docs/FEATURE_FLAGS.md` — demo/internal/alpha/beta/public and regulated-feature switches.
- `docs/SECURITY_AND_TRUST.md` — auth, RLS, secrets, fraud, moderation, account recovery and incident controls.
- `docs/CREATOR_RIGHTS_DISTRIBUTION.md` — rights registry, splits, licensing and distribution states.
- `docs/SET_APART_MUSIC.md` — faith-music creator, streaming, chart and award model.
- `docs/AWARDS_GOVERNANCE.md` — voting, Academy judging, eligibility, anti-fraud and Hall of Fame.
- `docs/ACCESSIBILITY.md` — platform-wide accessibility contract.
- `docs/OBSERVABILITY_RUNBOOK.md` — production monitoring, incidents, backups and recovery.

These should be added/expanded alongside code rather than treated as speculative marketing documents.

## Historical / milestone documents

The following files contain useful history but are not current production truth unless their contents are revalidated against Tier 1 docs and code:

- `amm-omniverse/AMM_MASTER_COMPLETE.md`
- `amm-omniverse/AMM_MVP_COMPLETE.md`
- `amm-omniverse/MASTER_LAUNCH_DOCUMENT.md`
- `amm-omniverse/APP_STORE_GUIDE.md`
- `amm-omniverse/MOBILE_BUILD_GUIDE.md`
- `amm-omniverse/WHAT_YOU_OWN.md`
- `amm-omniverse/GOOGLE_DRIVE_BACKUP_MANIFEST.md`
- older Victor handoff/deployment milestone materials

Historical claims such as fixed streaming rates, guaranteed creator percentages, real-money readiness, live distribution APIs, wallet/card functionality, native store readiness or "fully complete" status must be treated as unverified until the underlying production system is tested and approved.

## Documentation rule

Every architecture-level feature should have:

1. product purpose,
2. data/security model,
3. states and failure paths,
4. permissions/eligibility,
5. sandbox vs production status,
6. validation checklist,
7. dependencies and external approvals.

No Markdown file may convert a mock, simulation, sandbox, planned integration or UI prototype into a production-ready claim merely by describing it as complete.
