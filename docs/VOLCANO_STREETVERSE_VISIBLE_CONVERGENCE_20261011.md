# Volcano × StreetVerse visible convergence — implementation checklist

This branch preserves the existing Volcano Gaming, HoloLink, HoloBridge, HoloCast, HoloCube, HoloLab, World Builder and Construct Compiler foundations. Do not replace them or claim device features are functional without hardware testing.

## First acceptance journey
1. Launch StreetVerse on an ordinary iPhone without WebXR; the playable scene appears, and no HUD layer blocks touch controls.
2. Walk BJ through a visibly detailed Chicago street with sidewalks, lane markings, trees, traffic and accessible navigation.
3. Enter a vehicle and drive with stable steering, braking, camera and collision.
4. Connect an OS-paired gamepad on a compatible browser; calibrate, remap, disconnect and reconnect without losing the session.
5. Complete a local business mission; verify authoritative progression and persistent consequences.
6. Open the existing Volcano control deck; show honest per-device capability status. Never claim unsupported Bluetooth, TV casting or headset projection.
7. Where supported, hand off the display session using an explicit transport and show a reconnect path. XR uses capability detection and a conventional screen fallback.
8. Record a short reel and verify sharing while preserving consent, moderation and monetization gates.

## Existing test entry points
- `amm-omniverse/tests/streetverse-visible-loop-contract.mjs`
- `amm-omniverse/tests/streetverse-control-deck-contract.mjs`
- `amm-omniverse/tests/streetverse-webxr-contract.mjs`
- `amm-omniverse/tests/network-fast-xr-contract.mjs`
- `amm-omniverse/tests/living-world-recovery-contract.mjs`
- `amm-omniverse/tests/streetverse-mobile-birthday-repair.mjs`

## Release gate
Before merging: inspect current source paths, run lint and focused tests, fix failures, capture actual phone/desktop screenshots, verify the deployed build hash and real device functionality. A passing source contract alone is not proof of production visual quality. Do not merge solely on this checklist.
