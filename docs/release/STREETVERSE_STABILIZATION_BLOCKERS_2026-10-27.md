# StreetVerse Stabilization — Verified Release Blockers (2026-10-27)
Status: release-blocking evidence. Current known commit `ccee667f` of PR #675. Do NOT mark production-ready based on passing general CI.

## P0: iPhone-sized visual proof fails
- Workflow runs: [Master Finish](https://github.com/jgoldie1/Amm-project-/actions/runs/40523195619) and [BJ Family Mega Fix](https://github.com/jgoldie1/Amm-project-/actions/runs/40523195446).
- Both fail in `amm-omniverse/tests/e2e/streetverse-visual-evidence.spec.ts`, line 124, at `await expect(bjView).toBeVisible()`. The query is `page.getByRole('menuitem',{name:/BJ V12 VIEW/})` after opening the StreetVerse quick navigation menu.
- The test finds earlier elements and reaches the BJ View expectation; avoid weakening/removing this assertion.
- Fix approach: use saved Playwright trace and `error-context.md` to determine whether the BJ menu entry is absent, renamed, covered or rendered in an alternate control surface. Inspect actual menu producer; repair its accessibility name/visibility if expected, or update test only when a deliberately changed product contract is verified.
- Evidence required: iPhone-sized screenshot with menu open and BJ View accessible, successful click, screenshot of character view, one-hand control non-overlap. Physical iPhone evidence still separate from simulated mobile Chromium.

## P0: vulnerable production dependencies
- Workflow: [StreetVerse Chicago Morning Mega Convergence](https://github.com/jgoldie1/Amm-project-/actions/runs/40523195681), job 'Jacobie Quantum Shield + supply-chain gate'.
- Audit flags `undici` in 7.0.0–7.30.0 and `zod` below 4.6.6 with published advisories. These findings cannot be ignored just because frontend build/lint passes.
- Fix approach: inspect `amm-omniverse/package.json` and lockfile origin for direct/transitive dependencies. Upgrade to patched compatible versions, regenerate the correct lockfile, run `npm ci`, `npm audit --omit=dev`, production tests, and security workflow before claiming the issue resolved. Do not blindly force dependency overrides.

## P0: deployment blocked
- GitHub status on PR #676 last observed: Vercel deployment status 'Account is blocked'. Even mergeable branches cannot prove production deployment until account problem is resolved. No paid plan change or unauthorized payment.

## P1: essential business/product proof
- StreetVerse: Circle Park → Taylor mission with joystick, car enter/drive/exit, NPC, save/reload; real iPhone evidence.
- Business: JOBS handoff → logistics intake → verified correct owner receipt (no cross-business leaks) → separate test checkout with server-confirmed payment, no fake order success.
- GoogleX: read-only Guardian workflow passed on ccee667f, but Memory Graph and checkpoint objects are not connected to live authenticated save storage.
- StreetVerse Global / New America / HoloVerse: stage later; do not treat component presence as deployed international travel, licensed song playback or functioning VR device integration.

## Release decision
HOLD PR #675 as draft until P0 evidence clears. No production merge, no claim of launch-readiness; preserve branch/checkpoint and re-run relevant CI.
