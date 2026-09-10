# TRYAMM Master Development Record

Last updated: 2026-09-10

## Purpose

This document is the permanent evidence ledger for TRYAMM / StreetVerse. It separates ideas and plans from code, commits, tests, deployments, and verified production behavior.

## Evidence Levels

1. IDEA — discussed or proposed.
2. DESIGNED — architecture/specification documented.
3. CODED — implementation found in source.
4. COMMITTED — implementation recorded in Git history.
5. TESTED — automated or manual test evidence exists for the specific behavior.
6. DEPLOYED — Vercel/hosting evidence shows a successful deployment containing the change.
7. VERIFIED LIVE — behavior has been exercised successfully in production.

No feature should be promoted to a higher level without evidence.

## Repository and Deployment Baseline

- GitHub repository: `jgoldie1/Amm-project-`
- Vercel project: `amm-omniverse`
- Connected Git repository: `jgoldie1/Amm-project-`
- Current audited production deployment on 2026-09-10: READY on `main`, commit `76aef876e939a2025c543678b09da5d54c515595`.
- A newer PR/branch deployment for PR #171 failed during dependency installation with `npm ERESOLVE`; this does not invalidate the current READY production deployment.

## Verified Git Commit Evidence

### StreetVerse runtime and recovery

- `123e900c40301c6e1da4207fa872fa6ee6619c6d` — recover StreetVerse mobile world and navigation.
- `88c857232160ea5dc107a895d2a9f9d7c47460a1` — recover StreetVerse render failures on older mobile Safari.
- `aedcf93078ceb9a725c175b4142134e350db2f7b` — connect home buttons, Reels, HoloGPT and workflows.

### StreetVerse journey QA

- `8817de60b47c8135de9dad56993b75ecc310e4c9` — StreetVerse end-to-end journey QA runtime.
- `74c80bf03d6846f6422ec81afdeea30e851c6eb3` — expose Reel lifecycle to gameplay QA.
- `e4a98fd0299a71558e8884153e68db74d9b581b4` — install journey QA and verified exit event.
- `d03fb045cfa63febd2296cfd63d70f8b7181fc72` — require complete player journey evidence loop.
- `97dfd135bbafa8820a78b87a03399d39ae496ff8` — run StreetVerse journey QA contract in smoke.
- `ae0e098a7c410450041ed821e53b10e511bc90eb` — report safe StreetVerse spawn to journey QA.
- `ec6918c8204fd0ca3c5b9bad992851f23762f7e1` — require safe-mode spawn evidence.

### Missions and Living Story

- `9684cce11139b1986d0028296cb13ce3bbfe6140` — Living Story missions and music empire catalog.
- `09f108ebf103b84180d3b8a6d70e408d27d2988a` — Living Story Mission Center UI.
- `30791f9f01cb66ddd2a66aa3f5115c8bb9732f23` — wire Mission Center into signed-in experience.

### StreetVerse business systems

- `c3f24f0a1f87e6cc40eac35261c8efa517d11711` — StreetVerse Daily Business Boost engine.
- `4ecac8eda382cca1ca3c36669679ee9436b9caee` — wire Daily Business Boost into StreetVerse.
- `536ef17037cf6521f87a52ac44d01bb596ea268d` — Daily Business Boost dashboard.
- `94bceece67e73ccf479ce90825094c5b914bfecb` — Daily Business Boost frontend logic.
- `c8b61ab6242f4f9763dd13c1962e95a7a43fcda1` — Daily Business Boost interface.
- `0b3e89d305c8689e1fd59852783b8845780c61eb` — StreetVerse Business District experience.
- `6e81507ff13d872f65cc1f2683d35b169d6ea963` — business spotlight missions and Scout invites.
- `4a9233d4db7ee32f73c854a3a6c954c983c498d4` — StreetVerse Business District interface.
- `2cb87615d1fed35251d4fb60c1c8a3c50bfb84f4` — link Business District from app shell.
- `c2e008cb6e54db09d2beef1f11c9f14271aaa86c` — validate Business District frontend.
- `24db9e7ad0d3c57ad591b44e7387999d22d8a23b` — TRYAMM business pricing and revenue funnel.

### Holo Music / Omniverse Radio / Set Apart Music

- `afee131c570cabb148e37e7274cf5fff99523f35` — Holo Music Omniverse Radio backend.
- `f499929001b0971b4993af983093df5ac1184fdc` — Set Apart Music radio vertical.
- `54f08863c793e00834a58d28935f72521d6cc52b` — register Omniverse Radio and Set Apart Music.
- `3eccacee742993a4f29787246643e89e7b66e0f0` — Set Apart Music discovery lane.
- `c66e658fd2b0197bc8180cfad6c8c775fabab881` — Set Apart Music filters and station presets.
- `4ca52a8e0c110ba4ecbb4bd6b19a9c913a052e86` — Omniverse Radio syntax checks.

### Holo hardware/platform abstraction

- `f5582aa3902643d4b3f6049ea0d39852ff0c0575` — standards-first HoloBridge capability layer.
- `710495614943578c9974949bd8d0825b739b03d8` — safe HoloLink peripheral abstraction.
- `0272cfe05e7b01d57772ce2d891810519d643036` — Holo Volcano multi-display platform architecture.

### Stubbs AI training infrastructure

- `64263e956b58c72152033f515bb78a51adc87f0b` — Stubbs AI training control plane.
- `56f8b8dd0e6a843c5242463e34ee5532b76b51d3` — training control-plane smoke checks.
- `566319d2f2fb0bea3339be6048c066649bfbe2fb` — register Stubbs AI training routes.
- `9454c6c5bded4e83758c41670c284d0432fa10e5` — include training checks in release gate.
- `5825d0742bb14402ddae2c48836c55831f54e0d8` — executable Soup trainer worker service.
- `72f88e48477e773570500821d0381b681284e91b` — connect AI training control plane to Soup worker.
- `6fb48d288052a186f97e662bfeca5835905c6dba` — Soup trainer worker configuration.

## Architecture Inventory Requiring Ongoing Evidence Review

The following systems are part of the TRYAMM master architecture and should be audited independently: StreetVerse open world; Chicago 77 community-area buildout; buildings/interiors/property ownership; NPC population; traffic/vehicles/transit; missions; creator Reels; LIVE/PK; Marketplace/vendor systems; delivery/rideshare; HoloGPT; Holo FON; Holo Ads; Holo Music; Omniverse Radio; Set Apart Music; Middleverse Jobs; AI call center; Business Directory; Business Passport; Digital Twin; Scout Network; Global Business Registry; Business Server Package; Agent Earnings Ledger; Business Earnings Center; Command Nexus; CTV/OTT/FAST; telecom; ledgers/payments; Get Paid to Play; HoloBridge/HoloLink; accessibility and translation; creator movie tools; product-placement systems; All American App Store; Omni Care 360; Omni Cash; fabrication/12D Printer concept; and other documented TRYAMM worlds and services.

Each system must carry its own evidence level rather than inheriting a platform-wide status.

## Chicago 77 Rule

Chicago StreetVerse is implemented in part, but an individual Chicago community area is not counted COMPLETE until it has evidence for its boundary, streets, playable world geometry, buildings, businesses/landmarks, NPCs, vehicles/transit, missions/interactions, and production test.

Current certification status at this audit point: **0/77 individually VERIFIED COMPLETE**. This means certification is incomplete; it does not mean that zero Chicago/StreetVerse systems have been implemented.

See `docs/CHICAGO_77_COMMUNITY_AREA_TRACKER.md`.

## Current Deployment Risk

The newest audited PR #171 branch deployment failed at `npm install --include=dev --no-audit --no-fund` with `ERESOLVE unable to resolve dependency tree`. The build log showed TypeScript resolution as `typescript@undefined` while `typescript-eslint@8.68.0` requires TypeScript `>=4.8.4 <6.1.0`. This branch should remain unpromoted until dependency installation succeeds and regression tests pass.

## Record-Keeping Policy

For every future feature/change record:

- date
- system
- feature/change
- repository path
- commit SHA
- test evidence
- deployment ID
- production URL/path
- status level
- known defects/blockers
- owner/next action

This file is the master index. Detailed subsystem trackers may live in separate documents and should link back here.