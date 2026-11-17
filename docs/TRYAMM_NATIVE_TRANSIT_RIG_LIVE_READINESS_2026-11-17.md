# TRYAMM Native + Transit + Procedural Hand + LIVE readiness

## Recovered, existing production-code foundations
- **Cross-platform:** `amm-omniverse/capacitor.config.ts` already selects `TRYAMM` / `StreetVerse` app IDs and uses Vite's `dist`; app already pins `@capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/ios` 8.4.x versions and has `public/manifest.json` PWA. Do not introduce an additional Cordova application or second source tree.
- **Real Chicago L model:** `src/components/StreetVerseMobileWorld.tsx` includes `cityTransitTrain`, loads `mobile-native-train`, and updates its position from an existing train. `StreetVerseWestSideVisibleWorldRuntime.ts` builds the elevated rail, CTA bus shelters and visual districts. Draft PR #669 overlays fictional L stations; **not merged**, so don't describe that PR's new stations as deployed.
- **Transport:** `StreetVersePassengerTransportRuntime.ts` currently has shared seat/standing occupancy manifests for cars, trains, buses, planes and boats, from merged PR #534. This is an occupancy model, not verified in-world rail boarding or intercity travel.
- **BJ:** skinned GLB animation mixer exists in source; BJ V12 production rig and asset-file verification remain launch blockers. A Unity procedural rigging animation example cannot run in Three.js. We add only a nonmutating hand/arm bone discovery and reachable-target planner, not fake procedural limb animation.
- **LIVE:** an authenticated LiveKit token endpoint already exists, but older `api/live/status.js` equated credentials with public-ready. This PR requires explicit operator evidence for host+viewer, reconnect, moderation AND an AI agent worker; credentials alone never mean live streaming works.

## Native framework choice
**Use existing Capacitor + PWA first; Cordova compatibility only if an irreplaceable audited plugin is needed.**
Capacitor's documented `npx cap sync` copies the built Vite bundle to iOS/Android projects. A functioning browser Vite build does not prove a signed app package, App Store/Google Play review, permissions, mic/camera, screen capture, WebXR, iOS WebView, keyboard, GPU or LiveKit reconnect.
- Android: build/sign/test with Android SDK runner or native workstation; on-device GPU/permissions required.
- iOS: Xcode/macOS or authorized hosted Apple build; only test on a real iPhone for camera/mic/background behavior. iOS WebViews may not support desktop `getDisplayMedia` screen capture; use a vetted native capture plugin/service only if required, after privacy/recording consent review.
- Chromebook: keep PWA and safe low-GPU fallback; do not attempt to run large native packaging on a low-storage device.
- Unity: optional offline development/asset pipeline only. Retarget vetted GLB/FBX animations and bones for Three.js/browser delivery; don't make Unity a required runtime.

## New integration in this PR
- `StreetVerseTransitDirector.mjs`: Chicago L and global route preview commands with 7-leg one-push JSON audit, explicit `playableTransfer:false` / no tickets.
- `StreetVerseTransitQADock.tsx`: accessible one-hand route planner (Circle Park → West Side L → Roosevelt → Taylor/UIC → Detroit → Tampa → Memphis → Atlanta) mounted in 3D + safe StreetVerse. **No CTA live arrivals or real traffic telemetry.**
- `StreetVerseProceduralHandBridge.ts`: skinned-mesh and named arm-bone inspection; refuses IK authorization for unrigged BJ GLBs and records a nonmutating reachable target. No physical hand motion until authored animation/IK retargeting and real-device acceptance.
- `StreetVerseMobileWorld.tsx`: emits rigorous mounted-BJ skinned-arm audit on GLB load without overwriting animation.
- `TryammCrossPlatformRuntime.ts`: tests PWA, web, Capacitor iOS/Android, and Cordova shell detection without adding Cordova and never claims actual camera, LiveKit, or holographic hardware access.

## Next true release milestones
1. CI tests, TypeScript, Vite build on exact SHA; fix failures; do not merge without review.
2. Verify published BJ V15/BJ V12 skinned GLB bone names and clips; build two-bone IK/interactions (reach rail handle, open train door, sit, stand) *only after* real skin weights/clip tests.
3. Replace train visual preview with verified platform entrance, door animation, passenger boarding manifest binding, camera following, save/reload, disembark spawn, QA. No real CTA trademarks or schedule claims without review.
4. For global travel: only city previews until actual city scenes, collision, weather, player identity, authoritative game state and server-side Mycelium save events pass.
5. Complete authenticated LiveKit connected-agent deployment and two-device host/viewer test with explicit microphone/camera consent; do not expose secrets or live public streaming until moderated.
6. Assemble signed Capacitor Android and iOS builds in native CI, separately verifying background behavior, device graphics, storage, accessibility and app-store compliance.

## Revenue impact (not yet monetization)
Public transportation and game-ready city connections increase mission variety, city discovery, creator tours, hotel/theater bookings and possible future sponsor visibility. Real revenue requires working visitor retention, legitimate customer service, approved Stripe payments, approved legal terms and customer fulfillment. No in-game fare, gambling, payouts or SMS are activated by these development changes.
