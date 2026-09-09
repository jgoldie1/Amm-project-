# TRYAMM One-Week-Early Launch Review Gate

Status: LOCKED launch policy / review candidate process

## Goal
Create a review candidate seven days before the public launch target so the final week is used for testing, accessibility review, advertising preparation, customer onboarding, creator/business recruitment, and launch operations instead of uncontrolled feature expansion.

## Freeze rule
Once the review candidate is cut, new concepts do not enter the launch-critical path unless they fix a P0/P1 defect, security/privacy issue, accessibility blocker, payment/ledger defect, legal/rights issue, or deployment failure. New feature ideas remain in the post-launch backlog.

## Release gates
A launch candidate may be called READY only when all applicable gates pass:

1. Build/deploy: production deployment READY and rollback candidate available.
2. Core navigation: Home, StreetVerse/Open World, Marketplace, Music/Radio, Missions, accessibility and install/PWA entry points open without dead buttons.
3. StreetVerse: world leaves loading state; required launch geometry/assets render; player movement works; critical vehicle/NPC defects are triaged.
4. Mission loop: accept -> progress -> complete -> XP/reputation -> reward eligibility works without claiming unverified cash payout.
5. Creator loop: Reel capture/recording and publish path are tested on supported launch devices.
6. Commerce: pricing/CTA, Marketplace/business onboarding, checkout and server-side payment verification are tested; no payout is represented as payable until authoritative verification succeeds.
7. AI: HoloGPT/Benny runtime health is checked. AI-training control plane may ship as founder/admin infrastructure, but Soup GPU execution is labeled CONFIGURED only after a real worker health check and training smoke run.
8. Accessibility: keyboard/focus, readable labels, captions/transcript path, reduced-motion considerations and accessibility statement are reviewed.
9. Rights/safety: music/media licensing state, user-generated-content controls, age gates and moderation paths are reviewed.
10. Observability: production errors/logs checked and P0/P1 defects have owners/status.

## Review-week operating plan
- Day -7: cut review candidate; freeze launch-critical scope; publish internal review checklist.
- Day -6: mobile/device and accessibility review; StreetVerse/navigation smoke test.
- Day -5: creator, music/radio, Marketplace and business onboarding review.
- Day -4: payments/ledger/reward verification; AI/Benny/HoloGPT health review.
- Day -3: advertising assets, landing-page CTA, pricing, Black Business lane and launch-partner materials finalized.
- Day -2: regression test; production error review; rollback rehearsal; only blocker fixes.
- Day -1: final go/no-go review; schedule approved launch communications.
- Launch: monitor errors, payments, signups, world loading and creator publishing; rollback if release criteria fail.

## Advertising preparation
Prepare launch-safe campaigns around features that are actually VERIFIED/READY. Separate READY features from COMING SOON. Priority messages: TRYAMM Business Experience pricing, Black Business discovery/promotion, StreetVerse living-world experience, creator/music ecosystem, accessibility, and founder/business onboarding. Never advertise unverified cash earnings, unlicensed music, unavailable hardware, or conceptual AI/quantum capabilities as live.

## Launch status vocabulary
- VERIFIED: directly tested with evidence.
- LIVE: production-accessible and verified.
- READY: implemented and passed required gates, awaiting launch/promotion.
- BUILDING: implementation exists but one or more gates remain.
- LOCKED: architecture/policy approved; not necessarily implemented.
- COMING SOON: intentionally outside launch-critical scope.
