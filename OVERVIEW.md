# TRYAMM Workspace Overview

> **Canonical status:** This file is a current workspace summary. Architecture-level decisions are governed by `README.md`, `CLAUDE.md`, `SKILL.md`, and `docs/TRYAMM_CANONICAL_ARCHITECTURE.md`.
>
> Older files named `*_COMPLETE.md`, `MASTER_*`, or milestone handoff documents are historical snapshots unless explicitly marked current. Do not use them to claim production readiness.

## Workspace structure

- `amm-omniverse/` — primary TRYAMM web/PWA/mobile-wrapper application serving the core platform experience.
- `isaiah-starverse/` — companion talent-discovery / StarVerse work.
- `amm-card-arena/` — card-game / holographic arena work.
- `docs/` — canonical cross-platform product and engineering architecture.

## Canonical TRYAMM experience

**HOME | PLAY | LIVE | CREATE | NEXUS**

Lifecycle:

**JOIN → DISCOVER → LEARN → CREATE → OWN → PUBLISH → PLAY/WATCH/LISTEN → BUILD COMMUNITY → EARN → GET PAID → ACHIEVE → GET RECOGNIZED → BUILD LEGACY.**

## Core platform pillars

### Discovery and algorithms
TRYAMM uses a federation of specialized algorithms rather than one universal feed. Algorithm Studio allows users to create, save, share and remix ranking profiles through sliders, rules or natural language. Custom algorithms cannot bypass safety, age, copyright, fraud or legal eligibility controls.

### Unified identity
One account spans Profile, PLAY, LIVE, Creator Studio, Academy, Marketplace, Awards, All American Passport and All American Wallet.

### Creator Project model
A Creator Project is the aggregate root for connected songs, Reels, films, anime, games, podcasts, LIVE events, AR/VR/MR/holographic experiences, merchandise and Omni Boxes. Rights and split agreements are versioned and shared rather than duplicated per feature.

### Money Engine
The Money Engine is sandbox-first double-entry accounting. It separates TRYAMM revenue from creator/rightsholder liabilities, prizes, tax, refund reserves, sponsor-restricted money, charity, Kenosha Legacy, ministry allocations, fees, reserves and settlement cash. UI balances do not create or authorize real payouts by themselves.

### Wallet and Passport
All American Wallet is the user-facing financial interface over Money Engine states. All American Passport is a TRYAMM membership/achievement/reputation credential. It is not a government passport or driver's license. Regulated identity, card issuing and tap-to-pay require approved partners and corresponding compliance gates.

### Creator economy
Academy → Studio → Rights → Publish/Distribution → Reels/Music/Movies/Games/LIVE/Immersive → Commerce → Money Engine → Wallet/Payout → Charts/Certifications → Awards → Hall of Fame/Legacy.

### Faith, Set Apart Music and service
Set Apart Music supports faith-centered music including Yahuah-centered music/rap, gospel, worship, testimony and spoken word. Faith/service awards remain distinct from popularity-only metrics. The Kenosha Stubbs Legacy Award is a living-honor/service award rooted in compassion, family, community and licensed social-work service.

## Current technical direction

- Frontend: React + Vite + TypeScript.
- State: Zustand and Supabase-backed persistent state where implemented.
- Database/Auth: Supabase PostgreSQL + Auth + RLS.
- Payments: Stripe sandbox during integration; Connect/payment features remain gated until end-to-end controls pass.
- Streaming: LiveKit-related work remains subject to production validation and deployment configuration.
- Mobile: PWA plus Capacitor wrappers; store readiness is separate from web readiness.

## Development commands

Primary app:

```bash
cd amm-omniverse
npm install
npm run dev
```

Run the repository's validation scripts before calling a change complete. Production readiness requires more than a successful local build.

## Launch states

**DEMO → INTERNAL → ALPHA → BETA → PUBLIC**

Independent feature flags must govern:

- REAL MONEY
- REAL PAYOUTS
- PRIZE COMPETITIONS
- EXTERNAL DISTRIBUTION
- REGULATED IDENTITY
- CARD / TAP-TO-PAY

A simulated, sandboxed, mocked, UI-only or undeployed capability must never be documented as production-ready.

## Documentation order

1. `README.md`
2. `CLAUDE.md`
3. `SKILL.md`
4. `docs/TRYAMM_CANONICAL_ARCHITECTURE.md`
5. `docs/DOCS_INDEX.md`
6. Feature-specific docs in `docs/`
7. Historical milestone files only for background/context
