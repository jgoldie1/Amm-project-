# TRYAMM Holo + Volcano Platform Architecture

## Status
Architecture lock for implementation. This document does not claim unverified hardware, supplier licenses, production integrations, or deployed capabilities.

## Product family
- TRYAMM App — software entry point on existing devices.
- Holo Clip — spatial-display accessory concept for existing phones/tablets.
- Holo Fon — native TRYAMM mobile hardware concept.
- HoloCube One — flagship personal spatial portal.
- HoloCube Business — business, commerce and Digital Twin spatial terminal.
- Holo Dock — phone-powered spatial desktop/display bridge.
- Holo Glasses — AR/MR endpoint.
- Holo Wall — commercial spatial display endpoint.
- Holo Stage — venue, entertainment and live-event endpoint.
- Volcano — high-performance gaming, movie and spatial-entertainment runtime/system.

## Shared software foundation
All endpoints converge on TRYAMM HoloOS rather than becoming disconnected products.

HoloOS includes:
- HoloHome
- Benny Construct and dismissible holographic overlay
- StreetVerse integration
- HoloJourney intent-based navigation
- HoloBridge multi-display abstraction
- HoloLink wireless/peripheral abstraction
- Universal Create
- TRYAMM Passport
- Marketplace and commerce surfaces
- Digital Twin surfaces
- translation and captions
- authorized voice-localization hooks
- accessibility profiles
- Safe Home recovery

## Benny + StreetVerse
Benny is the female AI concierge and universal help/recovery layer. Benny can appear over HoloHome and supported StreetVerse surfaces without forcing the user out of the current experience.

Core actions:
HOME | BACK | SWITCH EXPERIENCE | TRANSLATE | CREATE | SHOP | MISSIONS | ACCESSIBILITY | HELP

Benny must remain optional/dismissible and never become the only navigation path.

## Navigation modes
### Holo
Spatial presentation plus supported gestures.

### Hybrid
Spatial presentation plus persistent visible controls.

### Classic
Conventional buttons/navigation with experimental gestures disabled.

### Accessibility
Large targets, screen-reader-compatible structure, captions/transcripts, reduced motion, high contrast where supported, voice alternatives, one-handed layouts and visible navigation.

## Four-way gesture language
- Swipe up: go deeper into the current experience.
- Swipe down: overview/home controls.
- Swipe left: discover next.
- Swipe right: personal/actions space.

Every gesture must have a visible equivalent. Payments, deletion, publishing, permissions, identity/security changes and other consequential actions require explicit confirmation rather than gesture-only execution.

## Safe Home
A lightweight recovery surface independent of advanced 3D/WebGL rendering:
RETURN HOME | RETRY | CLASSIC MODE | BENNY HELP

## HoloBridge
HoloBridge is the proposed device/output abstraction between TRYAMM content and supported displays.

TRYAMM content -> HoloBridge -> phone screen | TV | projector | spatial display | HoloCube | Holo Wall | AR/MR glasses | VR headset | venue display

Supplier-specific SDKs and proprietary display technology remain behind adapters and require valid licenses/agreements. TRYAMM must not copy protected supplier implementations.

## HoloLink
HoloLink is the proposed connectivity/peripheral abstraction. It may use standards such as Bluetooth/Bluetooth LE, Wi-Fi and platform-supported casting where appropriate.

Potential endpoints:
- game controllers
- Holo Fon
- HoloCube
- headphones/speakers
- compatible hearing devices
- accessibility switches
- microphones
- compatible glasses/wearables

HoloLink is a software management layer, not a claim that TRYAMM invented Bluetooth radio technology.

## Volcano
Volcano is the proposed gaming and spatial-entertainment layer.

One experience may render across multiple surfaces:
Volcano Runtime -> TV | projector | HoloCube | Holo Fon | AR | VR | MR | Holo Wall

Example StreetVerse session:
- TV/projector: primary city/world.
- Holo Fon: controller, camera and personal interface where supported.
- HoloCube: Benny, map, Digital Twins, products or mission information.
- AR/MR: contextual navigation and world overlays.
- VR: immersive view where a supported implementation exists.

## Movies and video
TRYAMM media should use progressive presentation tiers rather than requiring specialized hardware:
1. 2D movie/video.
2. Spatial/depth presentation on supported displays.
3. AR companion experience.
4. VR immersive experience.
5. MR room-aware experience.
6. HoloCube/Holo Wall companion presentation.
7. Holo Stage venue presentation.

Interactive product placement must remain clearly identifiable and must not interrupt playback without user action.

## Holo Audio Rooms
Design target for standards-based multi-device audio:
- selectable language tracks
- captions/transcripts
- accessibility audio
- compatible personal listening devices
- original-audio option

Availability depends on device, OS, Bluetooth/LE Audio support and content rights.

## Translation and authorized voice localization
Pipeline target:
speech -> transcription -> translation -> captions -> optional authorized synthetic/voice-preserving playback

Rules:
- preserve original audio where practical
- label AI-translated/synthetic voice
- require authorization for cloned/personal voice use
- provide neutral/licensed voice fallback
- do not use voice cloning for deceptive impersonation
- preserve original text/audio for consequential financial, legal, medical or safety information

## Spatial business and commerce
Digital Twin -> HoloBridge -> spatial preview -> user-controlled interaction -> Marketplace/checkout.

Experimental gestures and spatial rendering must not be the authoritative payment/security layer.

## Supplier strategy
TRYAMM owns its original application software, orchestration, brand, user experience and integrations. Hardware/display suppliers retain their own panels, optics, sensors, SDKs, patents and manufacturing IP.

Supplier access ladder:
PUBLIC CONCEPT -> NDA/NNN as appropriate -> EVALUATION -> LICENSE/SDK REVIEW -> RESTRICTED PROTOTYPE -> MANUFACTURING SPEC -> CERTIFICATION -> PRODUCTION

No supplier technology is represented as licensed or integrated until verified by an executed agreement and working implementation.

## Implementation order
### Release A — software foundation
1. HoloHome shell.
2. Benny overlay and Safe Home.
3. Classic/Hybrid/Holo/Accessibility modes.
4. four-way gestures plus visible controls.
5. StreetVerse integration.
6. HoloBridge interface with standard-screen fallback.
7. HoloLink interface with feature detection.

### Release B — TV and projection
1. responsive TV layout.
2. supported casting/external-display adapter.
3. Volcano second-screen/controller experience.
4. movie/game theater mode.

### Release C — spatial hardware prototypes
1. supplier evaluation adapters.
2. HoloCube/Holo Dock prototype.
3. spatial Digital Twin viewer.
4. Benny spatial presentation.

### Release D — AR/VR/MR
1. supported headset adapter.
2. StreetVerse spatial session.
3. translated/captioned presence layer.
4. accessibility validation.

### Release E — commercial hardware
Only after supplier agreement, certification, thermal/power testing, privacy/security review, accessibility QA and production validation.

## Release truth labels
Every capability shown in Founder Command Center and customer-facing material must be one of:
LIVE | READY | BUILDING | LOCKED | COMING SOON

Hardware concepts, unlicensed supplier integrations and unverified spatial projections must not be labeled LIVE.

## Core product principle
One TRYAMM experience, many surfaces. More capability underneath; less complexity in front of the user.
