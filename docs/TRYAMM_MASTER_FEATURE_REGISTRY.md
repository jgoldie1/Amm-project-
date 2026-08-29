# TryAMM Master Feature Registry

Status legend: VERIFIED = located in repository evidence; AUDIT = requires code-level verification; BUILD = planned/missing until verified; BLOCKED = requires external/legal/provider dependency.

## Platform foundation
- CORE-001 Identity/auth/roles — AUDIT
- CORE-002 Age lanes (teen/adult) — AUDIT
- CORE-003 Omniverse Passport — BUILD
- CORE-004 Notification system — AUDIT
- CORE-005 Analytics/event taxonomy — BUILD

## Creator Success
- CREATOR-001 Creator Progress Meter — BUILD
- CREATOR-002 Qualified Live Hours Engine — BUILD
- CREATOR-003 Protected Break Mode (bathroom/accessibility/medical/food/technical/emergency) — BUILD
- CREATOR-004 15h Active / 30h Pro / 40h+ Elite-review progression — BUILD
- CREATOR-005 Creator missions/goals/calendar/streaks — BUILD
- CREATOR-006 Creator profitability analytics — BUILD

## Discovery and growth
- DISCOVERY-001 New on TryAMM 30-day badge/window — BUILD
- DISCOVERY-002 Welcome Train — BUILD
- DISCOVERY-003 Rising/First Time Live/Local discovery — BUILD
- DISCOVERY-004 Qualified referral engine — BUILD
- DISCOVERY-005 Founding Season / Season Zero — BUILD
- GROWTH-001 Million User Engine funnel analytics — BUILD
- GROWTH-002 Experiment/A-B testing engine — BUILD

## Agencies and communities
- AGENCY-001 Agency accounts/dashboard — AUDIT
- AGENCY-002 Family/community groups — AUDIT
- AGENCY-003 Agency recruitment links/QR and attribution — BUILD
- AGENCY-004 Looking-for-an-agency matching — BUILD
- AGENCY-005 Agency quality/ranking system — BUILD

## AI Control Tower
- AI-001 HoloGPT assistant — AUDIT
- AI-002 HoloRouter model/provider routing — BUILD
- AI-003 Agent Manager/orchestration — BUILD
- AI-004 AI Cost Manager and margin governor — BUILD
- AI-005 HoloCFO platform economics — BUILD
- AI-006 GrowthOS business growth agents — BUILD
- AI-007 HoloMatch opportunity matching — BUILD
- AI-008 HoloVibe audience/conversation intelligence — BUILD
- AI-009 HoloGuardian youth safety layer — BUILD
- AI-010 HoloAccess accessibility assistant — BUILD
- AI-011 HoloLingo translation layer — BUILD
- AI-012 HoloGrow creator/agency coach — BUILD
- AI-013 HoloBuilder engineering orchestrator — BUILD
- AI-014 HoloOps incident commander — BUILD
- AI-015 HoloScale capacity/cost simulator — BUILD

## Translation
- LINGO-001 Preferred-language profile — BUILD
- LINGO-002 Chat/comment/DM translation — BUILD
- LINGO-003 Live captions + translated captions — BUILD
- LINGO-004 Marketplace/support translation — BUILD
- LINGO-005 Game/UI/dialogue localization hooks — BUILD
- LINGO-006 View Original/report translation/confidence — BUILD
- LINGO-007 Translation caching and cost routing — BUILD

## Accessibility
- ACCESS-001 Accessibility Setup/Profile — AUDIT
- ACCESS-002 One-hand/large-target/voice navigation — AUDIT
- ACCESS-003 Screen-reader/high-contrast/text scaling/reduced motion — AUDIT
- ACCESS-004 Captions/transcripts/visual alerts — AUDIT
- ACCESS-005 Text-to-speech/speech assistance — BUILD
- ACCESS-006 Simple/cognitive-access mode — AUDIT
- ACCESS-007 Adaptive Gaming Profile — BUILD
- ACCESS-008 Accessibility Creator testing program — BUILD
- ACCESS-009 Accessible community games/wellness — VERIFIED: data/accessible-community-games-wellness.json

## Unified economy
- ECON-001 Creator Earnings (payable money) — AUDIT
- ECON-002 Coins (gifting/entertainment) — AUDIT
- ECON-003 HoloGPT Credits (AI consumption) — BUILD
- ECON-004 Beans (loyalty/community rewards) — BUILD
- ECON-005 XP (non-purchasable progression) — BUILD
- ECON-006 Universal Monetization Router — BUILD
- ECON-007 Revenue Waterfall — AUDIT
- ECON-008 Creator tier/sponsorship split rules — AUDIT
- ECON-009 AI reserve/provider treasury — BUILD
- ECON-010 HoloCredit internal credit accounting — BUILD

## Ledger / blockchain
- LEDGER-001 AMM Unified Value Ledger — BUILD
- LEDGER-002 Append-only/hash-chained audit proofs — BUILD
- LEDGER-003 Treasury subledgers/payables/reserves — BUILD
- LEDGER-004 Merkle/checkpoint aggregation — BUILD
- LEDGER-005 Optional future public-chain anchoring adapter — BUILD

## Developer ecosystem
- DEV-001 Developer profiles/accounts — BUILD
- DEV-002 Support Developer badge tiers — BUILD
- DEV-003 Founding Support Developer badge — BUILD
- DEV-004 HoloGPT Agent Marketplace — BUILD
- DEV-005 Submission/security/privacy/billing review pipeline — BUILD

## 11 Living Worlds
- GAME-001 Living Worlds Hub — AUDIT
- GAME-002 Concept/In Development/Playable statuses — BUILD
- GAME-003 Follow/Wishlist/Beta Signup — BUILD
- GAME-004 Build the 11 Worlds support campaign — BUILD
- GAME-005 Transparent development milestones/reporting — BUILD
- GAME-006 Founder/supporter packs — BLOCKED pending product/legal/payment review
- GAME-007 Community creative voting — BUILD

## Streaming/social
- STREAM-001 Live streaming core — AUDIT
- STREAM-002 PK/multi-guest rooms — AUDIT
- STREAM-003 Replay save/delete/retention — AUDIT
- STREAM-004 Gifts/PK booster — AUDIT
- STREAM-005 Community reward draw/gift drop — BLOCKED pending legal/product review

## Commerce
- COMMERCE-001 Marketplace/vendor portal — AUDIT
- COMMERCE-002 Creator stores — BUILD
- COMMERCE-003 Seller wallet/settlement/refunds — BUILD
- COMMERCE-004 Developer/agent sales — BUILD
- COMMERCE-005 Business services/tickets/subscriptions — AUDIT

## Scale/security/operations
- SCALE-001 CDN/object storage/caching strategy — AUDIT
- SCALE-002 Queues/event bus/background workers — AUDIT
- SCALE-003 Horizontal API scaling/rate limits — AUDIT
- SCALE-004 Observability/SLOs/incident workflow — BUILD
- SCALE-005 Load-test ladder: 1K/10K/100K/1M scenarios — BUILD
- SEC-001 Secret scanning and server-only credentials — AUDIT
- SEC-002 Financial idempotency/webhook verification — AUDIT
- SEC-003 RLS/authorization review — AUDIT
- SEC-004 Human approval for high-risk AI/financial actions — BUILD

## Engineering rules
1. Do not mark a feature complete because it exists in a conversation or specification.
2. VERIFIED requires repository evidence plus working integration/tests where applicable.
3. Do not rebuild working systems; reuse, extend, or refactor after audit.
4. Financial writes, tier eligibility, AI cost, and payouts are server-authoritative.
5. Creator Earnings, Coins, HoloCredits, Beans, and XP remain separate assets.
6. 40 qualified hours means Elite review eligibility, not automatic Elite status.
7. Protected breaks preserve session continuity without falsely counting inactive time as active qualified streaming.
8. Accessibility and language preferences are private by default.
9. Minors use stricter age-appropriate safety and interaction policies.
10. Development support is not represented as equity, investment return, or tax-deductible charity unless separately and legally structured.
11. Internal auditable ledger first; public blockchain integration is optional and later.
12. Every implementation change requires tests, security review proportional to risk, and staging verification before production.

## Immediate implementation order
1. Repository inventory + architecture audit.
2. Identity/roles/age-lane verification.
3. Streaming session model + Creator Progress + Protected Break Mode.
4. Unified value model + Revenue Waterfall audit.
5. HoloGPT Credits + HoloRouter + Cost Manager before broad AI trials.
6. HoloLingo + HoloAccess foundations.
7. New on TryAMM + referral/agency growth loops.
8. Living Worlds development hub/support workflow.
9. Unified ledger/internal audit proofs.
10. Load, security, accessibility and production-readiness testing.
