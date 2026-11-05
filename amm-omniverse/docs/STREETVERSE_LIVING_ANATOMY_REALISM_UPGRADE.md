# StreetVerse Living Anatomy & Character Realism — Incremental Upgrade

Purpose: improve actual BJ Stubbs gameplay and cast realism without replacing existing 3D rigs or jeopardizing the first playable Circle Park mission.

## Committed in this iteration (development only)
- Reuse original fictional five-organ body state, the existing three-dimensional injury rig, and BJ's non-destructive skeleton inspector.
- Original organ integrity now produces pace restrictions, sprint restrictions, breathing effort, steadiness and collapse state.
- Full 3D Chicago mobile world consumes movement multipliers during real avatar locomotion and suppresses downed-player input and vehicle throttle. Rescues remain fictional, not multiplayer-authoritative.
- Existing StreetVerse SoundBank now plays throttled soft breathing or heartbeat based on fictional injury feedback, subject to the existing sound-off and audio-caption controls.
- The BJ HUD exposes adjusted walk speed, sprint availability, breathing effort and rescue recommendation.
- Bleeding is no longer inferred from every injury; it requires an explicitly flagged fictional injury event and resets on recovery.
- The anatomy inspector now draws capped joint markers and parent-child bone links from actual detected GLB skinning bones, with OFF, OVERLAY and EXPLODED reversible visual-only modes.
- Regression tests added for movement restrictions, audio throttling, original skeleton hierarchy and memory cleanup.

## Strong next-generation features, NOT yet implemented or certified
1. **GLB authenticity and retarget tests**: prove BJ's actual model loads, facial morphs and skin weights work; retarget walk, run, hit, downed, seated and recovery clips. Outcome: the player sees real BJ rather than a generic stand-in.
2. **Collision evidence and physical hit reactions**: compute verified environment/vehicle impact and safe non-graphic collision responses, avoid browser-event authority in multiplayer. Outcome: walls, vehicles, falls and collisions feel connected.
3. **Foot placement and procedural gait IK**: place feet on stairs, curbs, slopes and uneven streets, with limp/stance blends. Outcome: BJ stops sliding through pavement and stairs.
4. **Physics-based vehicle response**: suspension, traction, seatbelt, passengers, safe crash recovery and replay. Outcome: convincing driving without BeamNG-scale compute.
5. **NPC contextual assistance**: only spawned, nearby NPCs can witness an injury, call dispatch or help the player. Outcome: living Chicago social response and rescue gameplay.
6. **Actual clinic and rehabilitation loop**: animated stretcher/hospital transport, recovery time, legal medicine-free game treatment states and accessibility-aware choices. Outcome: injury changes the story and missions.
7. **Material-dependent audio**: separate footsteps on asphalt, concrete, wood, rain, stairs, vehicle cabin and weather with captions. Outcome: better immersion, without costly extra visual geometry.
8. **Family and friend 3D asset certification**: verify distinct authorized GLBs and animation maps; generic stand-ins stay visibly labeled. Outcome: actual recognizable characters rather than names on placeholders.
9. **Persistent and server-validated simulation**: save/load injury state, owner-protected game saves, anti-replay and authoritative multiplayer events. Outcome: continuity between sessions and resistance to reward fraud.
10. **Adaptive LOD and accessibility**: one-hand controls, selectable non-graphic injury effects, motion and sound settings, mobile/WebGL fallback, measured FPS budgets. Outcome: playable on Chromebook and older phones.
11. **Mission and Reel proof**: full Circle Park repair -> enter -> drive -> exit -> NPC talk -> reward -> record loop, regression-tested on two devices. Outcome: one finished marketable game experience.

## Release gate
- These features are on the protected development branch, NOT production.
- GitHub full CI, browser Playwright, GLB load and animation verification, physical device motion, and game-save tests must pass before certification.
- The organ model is deliberately a fictional game simulation, not anatomical science or medical advice.
- Avoid GPU-heavy tissue simulation and realistic gore as launch prerequisites; prioritize responsive animated gameplay.