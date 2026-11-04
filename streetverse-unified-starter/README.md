# StreetVerse Unified Game — Safe Launch Baseline

This is a **separate development-only game**. It does not replace the existing StreetVerse, BJ v5, production deployments, or the `streetverse-chromebook-workbench` branch.

## Launch now
1. Download `index.html` from this directory.
2. Open it with Chrome on a Chromebook. No Node.js, cloud account, payment, or external library is required.
3. Move BJ (blue circle) with arrow keys, WASD, the on-screen buttons, or a standard gamepad.
4. Press **E** or **INTERACT** to collect the repair kit, repair the car, enter it, travel to the gold marker, exit, and talk to the NPC.
5. Progress is saved in localStorage when permitted; use RESET to restart.

## Quality gates
- This is a 2D **mission/control baseline**, not the verified BJ 3D model or a finished Chicago world.
- On-device Chrome test, GPU visual quality, and real gamepad verification remain pending.
- No paid services, API keys, accounts, or production resources used.

## Next integration (do not skip steps)
1. Confirm this mission works end-to-end on the actual Chromebook.
2. Recover owner-approved BJ GLB from Drive and connect with Three.js GLTFLoader; preserve 2D fallback.
3. Replace placeholder objects with original city assets, animation states, camera, collision and vehicle physics.
4. Add a tested fight/adventure/sports mode using common inputs and saves.
5. Only then test real multiplayer, recording, Jetson, Godot OpenXR and AR/VR, each behind separate feature flags.

This workbench is not authorized to create paid cloud resources or publish a production release.
