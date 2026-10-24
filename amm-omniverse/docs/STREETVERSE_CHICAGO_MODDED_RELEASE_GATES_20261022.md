# StreetVerse Chicago Modded — release blockers and acceptance gates
**Status:** Integration worklist only; this document does not activate mods, gameplay, or production. Branch isolated from main.

## Release-critical / potentially detrimental
1. **Regression and recovery:** pin known-good production SHA; take DB/storage and asset manifest backups; staging deploy only; rollback trigger on failed boot, 3D canvas blank, auth loss, crash spike, 402 or runaway costs. Do not disable billing/402 controls; fix their underlying entitlement/cost conditions.
2. **Playable entry:** verify SIGN IN → PASSPORT → STREETVERSE → Chicago spawn; route Circle Park → Roosevelt → Taylor → UIC → West Side; visible 3D geometry, collision, world streaming, camera clearance, one-handed mobile joystick, accessible fallback.
3. **Asset provenance:** audit #650/#651 and other branches for real GLB files, rights, LOD, collision meshes, animation rigs, size budgets, CDN access, cache invalidation and licensing. Never use copyrighted GTA/SimCity assets or code without rights; create original mechanics/art.
4. **Mods:** registry schema {id,version,sha256,assetManifest,dependencies,compatibility,license,author,enabled,rollbackVersion}; allowlisted signed manifests only; no arbitrary scripts, remote executable code or untrusted user uploads; server-authoritative enablement and rollback. Feature flags for district, vehicle, character, mission packs. Mod manager must reflect installed runtime assets, not just plans.
5. **Characters:** BJ likeness requires authorized source asset, usable rig, animation states, appropriate performance; safe NPC spawn, crowds and character diversity. Verify assets in deployed runtime.
6. **Vehicles:** walk → enter → drive → exit; steering, brakes, collision, traffic AI, mobile controls, seat states, physics bounds; safe reset on disconnect.
7. **RP/RPG:** original Chicago missions, quests, dialogue, player choice, XP, inventory, businesses, jobs, civic/justice de-escalation; server-authoritative persistence and age-appropriate moderation. Test save/reload and anti-cheat.
8. **CrossVerse:** travel ticket single use; Tampa/Chicago transfer only to ready world, atomic ledger state, no duplicate rewards, return on failure.
9. **Money/security:** never award real currency on client event; verified payments and webhooks, ledger reconciliation, idempotency, rate limits, permissions, PII protection, minors safeguards, abuse reporting, and refund paths. Separate fictional game currency from withdrawable earnings.
10. **Live/reels:** permissioned stream keys server-side, creator consent, storage/transcoding quotas, upload moderation, stop-all and deletion flows. Disable unimplemented UI actions or clearly mark unavailable.
11. **Accessibility/performance:** one-hand controls, scalable UI, captions, screen-reader labels, low-motion option, battery/memory budget, slow network fallback; test phone, tablet, desktop.
12. **Ops and cost:** monitor 3D errors, API failures, build time, CDN/asset egress, live video spend; set spend caps and alerts. Account billing warning requires owner/provider resolution before relying on new paid services.

## Existing work to reconcile (audit individually, do not blindly merge)
- PR #651 World Builder GLB placement; #650 asset proof and cinematics
- PR #609 Chicago/BJ convergence; #608 visual proof
- PR #639 production 3D recovery; #632 mobile 3D-first fallback
- PR #634 West Side travel and one-hand controls
- PR #613 mobile HUD and #612/#610 camera collision
- PR #649 cinematic missions; #543 global World Builder
Record per-PR: merged? superseded? changed files? tests? asset URLs? compatible with current main? conflict? owner review?

## Staging test script
- Fresh guest/account sign-in; enter Chicago on iPhone-size viewport; 3D visible in < reasonable device budget; movement/joystick/rotate; no overlays block controls.
- Spawn and travel all districts; assets load without 404 or GLB decode errors; terrain and traffic collision.
- Avatar enter vehicle, drive, exit; persist inventory/XP; reconnect.
- Enable/disable one approved mod; verify visual change, version, rollback and crash-safe fallback.
- CrossVerse request to unavailable world fails safely; to available world preserves balances exactly once.
- Check live/reels/payment features do not misrepresent placeholders; moderation and permission checks.
- Capture screenshots, console/network logs, CI artifacts, deployment URL, commit SHA, actual device evidence.
- Promote to production only after CI + human visual approval; monitor and roll back if thresholds breached.

## Order
P0 boot/auth/mobile controls/assets/cost guardrails → P1 Chicago route + avatar + vehicle → P2 missions and mod manager → P3 multiplayer/crossverse/streaming/monetization.
