# TRYAMM / StreetVerse Launch Engineering Tracker

This file is the branch-local launch clock and evidence ledger. It tracks engineering effort without pretending elapsed wall-clock time equals verified engineering hours.

## Clock
- Session clock started: 2026-09-28T16:52:00-05:00
- Branch: `feat/tryamm-world-tv-clean`
- Launch PR: #414 (keep draft until gates pass)
- Starting head for this session: `310e0bfb67f13f26f8285ffc1d9705d5273a123e`
- Starting deployment checks: Vercel amm-project SUCCESS; Vercel amm-omniverse SUCCESS
- Reconciliation risk: branch 166 commits ahead / 33 behind main at session start

## Engineering-hour rules
1. Record actual active engineering sessions only; do not convert calendar waiting into engineer-hours.
2. Every entry needs start/end timestamps, engineer/agent, scope, commit(s), verification evidence and blockers.
3. Estimates are labeled ESTIMATE until replaced by actual time.
4. Launch readiness is determined by gates, not accumulated hours.

## Active launch gates
| Gate | State | Evidence / next proof |
|---|---|---|
| Core StreetVerse playable loop | BUILDING | certify spawn → mission → repair → enter → drive → finish → verified reward |
| NPC social / dance runtime | BUILDING | event bridge exists; bind real animation clips + world update loop |
| Performance + motion catalog | BUILDING | shared registry foundation |
| IRL / low-tech access | BUILDING | opt-in access modes + hub/QR/SMS capability registry |
| Payments / entitlements / ledger | VERIFY | preserve existing server-authoritative chain; no client awards |
| Accessibility | VERIFY | touch/keyboard/voice/switch/one-hand/captions/low-tech evidence |
| Chicago certification | BUILDING | first production certification city |
| Lagos + Abuja reuse | PLANNED | reuse certified shared templates after Chicago |
| Global seven-wave certification | PLANNED | per-city compiler gates |
| Branch reconciliation | BLOCKED | branch is 33 commits behind main; reconcile/test before merge |
| App-store / launch certification | BLOCKED | requires green CI, release artifacts, policy/store evidence |

## Session log
| Start | End | Engineer/agent | Scope | Actual hours | Commits | Verification |
|---|---|---|---|---:|---|---|
| 2026-09-28 16:52 CDT | ACTIVE | ChatGPT engineering session | launch tracking + shared performance/IRL access foundation | ACTIVE | pending | current head checks green at start |

## Launch rule
Do not mark LIVE, PRODUCTION-COMPLETE, or RELEASED from architecture alone. Require executable evidence and passing gates.
