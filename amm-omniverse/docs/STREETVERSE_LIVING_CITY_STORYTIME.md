# StreetVerse Living City + Holographic Story Time — implementation blueprint
Status: development design; StoryEngine source committed, not wired to live gameplay.
## Player loop
Spawn -> create identity -> meet NPC/player -> accept job/scene -> choose actions -> earn simulated XP -> save consequences -> invite participants -> optional approved recording -> Reel/episode/aftershow -> return for next chapter.
No roleplay choice requires recording or a real-money purchase.
## Story Time
An episode is a sequence of optional role-based beats. A 30-minute traffic-stop example includes introductions (4m), encounter (6m), complication (6m), virtual business visit (5m), resolution (5m), recap (4m). Branch on choices rather than force a scripted outcome. Capture player choices and scene notes; never publish real voices, likenesses, names or location data without consent. A reel/episode/aftershow is only a proposed media package until clips, rights, review, upload and LIVE provider tests are complete.
## Holographic 3D
WebXR immersive VR/AR when supported, otherwise accessible WebGL 3D and 2D cards. Holographic-style shader/volumetric effects are visual presentation, not a claim of physical holographic projection. Keep performance budgets and fallback modes for mobile.
## Business integration
A virtual shop resolves to an approved TRYAMM business directory record with stable business ID, consented brand assets, opening details and a deep link to a real booking/storefront. Separate simulated XP/currency from real payment. Server-side Stripe confirmation and fulfillment are mandatory before claiming sales. Support partner attribution without leaking private data.
## Social systems
Player passport, character appearance, housing, jobs, civilian/EMS/police RP, families and crews, voice chat, moderated events, scene invitations and recurring stories. Require moderation, report/block controls, age-appropriate defaults and anti-harassment rules. No unmoderated recording.
## Cities
Chicago Circle Park pilot first; Detroit, San Diego, Tampa and university districts as independently loaded packs. Passport carries approved profile/progress, not unrestricted assets or financial balances. Per-city asset cache and regional sessions.
## Integration order
1. Validate BJ GLB, mobile movement and Circle Park mission.
2. Connect StoryEngine to a scene event bus and durable authorized save API.
3. Add consent UI, moderation and role selection.
4. Add approved business directory lookup and virtual storefront interaction.
5. Implement capture/edit/review and LIVE/All American Network handoff.
6. Add WebXR capability detection and accessible 2D fallback.
7. Add tested multiplayer, jobs, housing and city packs.
## Release gates
Regression, typecheck, build, real mobile device, security/privacy, media rights, load testing and verified production billing. No merge/deploy until passing. Avoid copying FiveM server assets, proprietary scripts or brand identity.
