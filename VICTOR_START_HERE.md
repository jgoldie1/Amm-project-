# Victor — Start Here

This repository branch is the real TryAMM engineering handoff. Do not rely on the separate ZIP as the source of truth.

## Repository

- Repository: `jgoldie1/Amm-project-`
- Branch: `agent/amm-intelligence-mvp`
- Pull request: `https://github.com/jgoldie1/Amm-project-/pull/3`
- Runtime: Node.js 20+

## First commands

```bash
git clone --branch agent/amm-intelligence-mvp --single-branch https://github.com/jgoldie1/Amm-project-.git
cd Amm-project-
npm install
npm run handoff:verify
npm run ci
npm start
```

Open these pages after the server starts:

- `/index.html` — Stubbs AI / HoloGPT
- `/platform.html` — creator and streaming platform
- `/workstation.html` — creator workstation and music tools
- `/immersive-marketplace.html` — marketplace and immersive shopping
- `/memory-control.html` — Googolplex Memory controls
- `/africa-commerce.html` — Aniyah and Africa commerce
- `/game-launcher.html` — all 11 Gameverse titles
- `/game-production.html` — game asset, animation, QA and production control
- `/yogihoo.html` — Yogihoo Arena vertical slice
- `/openworld.html` — StreetVerse open-world combat prototype
- `/holo-news.html` — news and weather surface
- `/growth-dashboard.html` — referrals, hashtags and campaigns
- `/seo-console.html` — SEO management

## What is already in this branch

### Frontend

Responsive HTML and JavaScript surfaces for HoloGPT, creator streaming, marketplace, memory, Africa commerce, music/workstation, news, SEO, growth, Yogihoo, StreetVerse, the universal game launcher and game-production control.

### Backend

Express services for HoloGPT routing, Claude/OpenAI-compatible AI, memory, payments, Stripe, LiveKit, Meshy, marketplace and commerce, Africa wallets, Aniyah cross-border, automation, Discord/Zapier, SEO, crawler/oracle, news/weather, NPC intelligence, open-world systems, game platform, Gameverse content and production management.

### Intelligence

- Stubbs AI / HoloGPT
- OpenAI-compatible provider path
- Claude
- Gemini and DeepSeek orchestration configuration
- User-controlled memory
- AI routing and fallback
- Generational and accessibility profiles
- NPC intelligence foundations
- Moderation, audit and budget-control architecture

### Database

Supabase migrations cover core accounts/content, memory, wallet and identity, Africa commerce, escrow/compliance, music/cross-border, growth, generational intelligence, SEO, crawler/oracle, media assets, production integrations, Zapier/Discord, HoloGPT workspace, shared games, inventory/leaderboards, progression and game-production tracking.

## External actions Victor still must perform

1. Add real deployment secrets from `.env.example`.
2. Apply every Supabase migration in filename order.
3. Install the actual Stubbs AI binary PNG/ICO assets under `public/brand/`.
4. Register Stripe, Paystack and Flutterwave webhooks.
5. Configure the production LiveKit project.
6. Configure OpenAI, Claude, Gemini, DeepSeek and Meshy accounts and spending limits.
7. Run staging payment, streaming, AI, marketplace and game acceptance tests.
8. Review the draft pull request and fix any failing CI check before merging.

## Important completion boundary

This is a substantial advanced-alpha codebase and production blueprint. It is not yet a finished commercial metaverse or eleven finished AAA games. Final original 3D models, animation files, voice recordings, regional real-time game servers, balance testing, legal approvals and platform certification remain production work.

## Documentation priority

Read in this order:

1. `VICTOR_START_HERE.md`
2. `docs/VICTOR_FINAL_HANDOFF_CHECKLIST.md`
3. `docs/VICTOR_GAMEVERSE_IMPLEMENTATION_HANDOFF.md`
4. `docs/VICTOR_GAMEVERSE_PRODUCTION_HANDOFF.md`
5. `docs/LIVE_PROVIDER_ACTIVATION.md`
6. `docs/MILESTONE_2_PRODUCTION_INTEGRATIONS.md`
7. `.env.example`
