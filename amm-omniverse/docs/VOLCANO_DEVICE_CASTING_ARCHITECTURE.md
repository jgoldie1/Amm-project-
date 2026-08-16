# Volcano Device, Casting, and Controller Architecture

## Purpose
Volcano is the TryAMM/GameVerse gaming and entertainment hardware/software platform. It must interoperate with TryAMM web/mobile, Omni Box, HoloTV, HoloXR, Living Worlds, GameVerse, OTT media, and the shared Omni identity/backend.

## Recovered baseline
- Volcano game/creator launcher: historical web prototype complete; desktop packaged beta still required.
- Phone-as-controller and casting: historical prototype complete; authenticated beta and latency/accessibility validation still required.
- Bluetooth controller support and TV-casting preparation were demonstrated in Advanced Alpha.
- Dedicated television Cast receiver, real-time multiplayer/matchmaking, and production identity/persistence remain production requirements.
- Quantum Beat is the deterministic timing/sensory layer intended to synchronize Volcano, phones, televisions, Holo displays, and XR headsets.

## Device roles
### Volcano Console / Game System
- GameVerse launcher
- Living Worlds launcher
- OTT/Isaiah AI TV/HoloDrama viewer
- Omni Box mode
- local and cloud-save sync
- multiplayer session bootstrap
- controller pairing
- accessibility profiles
- creator mode
- Holo/AR/VR bridge

### TV / Monitor / Projector
- Acts as a receiver/display target.
- May receive video/audio from phone, computer, or Volcano over supported casting protocols.
- For interactive gaming, use low-latency receiver/session protocols rather than treating ordinary Bluetooth as a video transport.

### Phone / Tablet
- App/controller mode
- touch controls
- motion/gyro controls where supported
- microphone/voice input
- camera/AR input
- second-screen inventory/chat/map
- cast source

### Computer
- cast source
- game client
- creator workstation
- browser/PWA client
- streaming/podcast studio
- remote admin/operations console

## Casting transport
Use an adapter layer so each platform can support the best available method:
- Google Cast compatible receiver/sender
- AirPlay-compatible path where available/licensed
- HDMI/USB-C direct display
- WebRTC low-latency session streaming
- browser second-screen handoff
- future native TV platform receivers

Bluetooth is for controllers, audio peripherals, remote buttons, sensors, and nearby device discovery/control. It is not the primary technology for high-quality TV video casting.

## Controller architecture
Support one normalized `OmniInput` contract:
- Bluetooth gamepads
- USB gamepads
- keyboard/mouse
- phone-as-controller
- touch
- voice
- adaptive switches
- one-handed layouts
- motion controls
- future HoloRemote

Normalize actions such as move, look, primary, secondary, jump, block, menu, interact, map, talk, accessibility action, and haptic feedback.

## Cross-device session flow
1. User signs in with Omni ID.
2. Device is registered and trusted.
3. User selects a game/show/world.
4. Platform discovers eligible screens/controllers.
5. User chooses Play Here, Cast, Move Session, or Second Screen.
6. Backend issues short-lived session/room credentials.
7. State is synchronized through the authoritative multiplayer/session backend.
8. Quantum Beat schedules synchronized audio/visual/haptic cues where supported.
9. Progress, purchases, entitlements, accessibility settings, and saves follow the user.

## Volcano product modes
- Volcano Game Mode
- Volcano OTT Mode
- Volcano Holo Mode
- Volcano Creator Mode
- Volcano Party/Game Show Mode
- Volcano Accessibility Mode
- Volcano Travel/Portable Mode
- Volcano Recovery/Safe Mode

## Production gates
- authenticated device pairing
- latency measurement
- reconnect/session handoff
- controller mapping persistence
- multiplayer authority and anti-cheat boundaries
- parental/age controls
- entitlement enforcement
- accessibility QA
- crash recovery
- signed desktop/console distribution
- secure update channel
- telemetry/privacy controls
- TV receiver validation

## Commercial effect
Volcano turns the software catalog into an owned device ecosystem. The same user can watch OTT content, play GameVerse, enter Living Worlds, use Holo Deck, join LIVE/Showcase events, shop, and use HoloGPT without maintaining separate accounts or saves. A shared device/input/casting layer also reduces engineering duplication across individual games and TV experiences.
