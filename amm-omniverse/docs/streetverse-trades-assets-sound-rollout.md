# StreetVerse trades + real-size asset automation (staging)

## Business experiences
- Plumbing: residential water/leak inspection RP, pipe props, water soundscapes, booking/referral for real business owners.
- Electrical: simulated lighting work and qualified-technician handoff, never real high-voltage instructions.
- HVAC, carpentry, painting, landscaping, maintenance and construction: job boards, level-based qualifications, service vehicles, uniforms, appropriate animations and task outcomes.
- One shared template can support a business NPC, storefront, appointments, job dispatch, inventory and optional commerce; verified real providers control their own bookings and payments. No real revenue or appointments implied by the game-only catalog.

## Asset import gates
1. Check ownership and commercial license before import.
2. GLB/glTF conversion; meters as canonical units, forward/up axis and origin alignment checked.
3. Use `suggestAssetFit` to inspect model dimensions; the proposed scale must be reviewed against authoritative architectural/vehicle dimensions before applying.
4. `applyReviewedAssetFit` only with explicit approval; never automatically resize Chicago building exteriors based on a generic target.
5. Set pivot, collisions, animation rig, interactive anchors, floor/navmesh and LOD; isolate physics assets from visual meshes.
6. Run separate mobile geometry/texture budgets, then screenshots and 30 FPS performance check. Keep legacy fallback.
7. Deliver only licensed, compressed audio clips, trigger contextually with distance attenuation, subtitles, global mute and volume controls. Current `TRADE_SOUNDS` are placeholders without files, so nothing new is audible.
8. Integrate the validated asset and audio registry into the authoritative world loader only after preview tests.

## First vertical slice
Village sink-service mission: enter fictional apartment, inspect a leaking sink, collect simulated repair equipment, interact, hear correctly licensed water effects, submit mission, record game-only XP. Then a Circle Park lighting mission with an authorized electrician NPC. Verify one-handed navigation, elevator/stairs where applicable and save/restore.

No new models, sound files or actual trade missions have been activated by these data-only staging changes. No production deployment.
