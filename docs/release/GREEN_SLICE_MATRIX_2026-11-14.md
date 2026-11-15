# TRYAMM / StreetVerse Green Slice Matrix — 2026-11-14

Branch: `agent/green-slice-recovery-20261114`

Release law: **RECOVER → ADAPT → WIRE → MIGRATE → TEST → REPAIR → BENCHMARK → DEPLOY**

## Hard rule
No new major world or engine while the active completion slice is not GREEN.

## Current release blockers
| Item | Status | Evidence / next action |
|---|---|---|
| Clean recovery branch based on current main | GREEN | Branch was created from current `main`; current compare showed 0 commits behind after recovery work began. |
| Vercel public web | RED | Convergence probe returned HTTP 402 Payment Required. Provider/account resolution required. |
| StreetVerse public route | RED | Convergence probe returned HTTP 402 Payment Required. |
| Convergence API | RED | Convergence probe returned HTTP 402 Payment Required. |
| Render backend health | RED | Convergence probe returned HTTP 503 Service Unavailable. |
| Recovery-branch CI | YELLOW | No GitHub Actions runs exist yet for this branch; current-build CI evidence is missing. |
| Branch protection | YELLOW | Recovery branch is currently unprotected. |
| Security pattern audit | YELLOW | Initial code search found no `pull_request_target`, `curl | bash`, `wget | bash`, `permissions: write`, or obvious GitHub-install patterns on default-branch search, but full dependency/workflow review is still required. |

## District 01 proof gates
All gates below require evidence bound to the exact recovery-branch build/commit.

| Gate | Status | Required proof |
|---|---|---|
| glb_load | YELLOW | CI + runtime |
| district_render | YELLOW | runtime |
| player_spawn | YELLOW | runtime |
| authoritative_movement | YELLOW | CI + runtime |
| spaceos_buildings | YELLOW | runtime |
| building_acoustics | YELLOW | runtime |
| vehicle_acoustics | YELLOW | runtime |
| parks_woods_wildlife | YELLOW | runtime |
| character_intelligence | YELLOW | CI + runtime |
| race | YELLOW | runtime |
| arcade_pinball | YELLOW | runtime |
| escape_room | YELLOW | runtime |
| starverse_stage | YELLOW | runtime |
| world_pulse | YELLOW | CI + runtime |
| two_device_live | YELLOW | two authenticated device sessions |
| save_rejoin | YELLOW | runtime |
| commerce_sandbox_10usd | YELLOW | provider receipt/equivalent |
| panic_mode | YELLOW | CI + runtime before/after evidence |
| mobile_performance | YELLOW | physical-device metrics |
| xr_performance | YELLOW | physical XR metrics |
| black_poc_render_qa | YELLOW | runtime + reviewed visual evidence |
| quantum_cone_lens | YELLOW | runtime + reviewed visual evidence |
| open_wild | YELLOW | runtime |
| money_security_boundaries | YELLOW | CI + provider evidence |

## Completion definition
The slice becomes GREEN only when:
1. every required gate is PASS for the exact commit/build,
2. all RED deployment blockers are cleared,
3. current-build regression is green,
4. provider/device gates have real external evidence,
5. no manual or AI override is used to promote an unproven gate.
