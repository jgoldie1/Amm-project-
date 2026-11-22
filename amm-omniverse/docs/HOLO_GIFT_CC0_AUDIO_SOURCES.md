# TRYAMM LIVE Holographic Gift Audio — CC0 Source Register

## Current implementation
- The existing 47 HoloGiftEngine gift IDs are mapped in `src/game/gifts/HoloGiftAudio.ts` to a small set of 18 reusable source sounds.
- The sound engine uses browser Audio playback on gesture-triggered gift previews and subscribed LIVE gift events. Playback can be blocked by mobile autoplay restrictions or network failures; these must be verified on real phones.
- The active source is an internet-hosted mirror rather than committed files. Before public launch, download/verify each selected OGG and self-host via `public/tryamm-assets/audio/gifts/` to eliminate external availability dependence. This repository has not yet self-hosted those binaries.
- User SFX switch silences active sounds. Volume defaults to 28%. No licensed songs or unauthorized audio clips included.
- Gift prices are proposed only; audio playback does not imply a paid gift or recorded payout.

## Rights and provenance
- Kenney asset packs: [Sci-Fi Sounds](https://kenney.nl/assets/sci-fi-sounds), [Impact Sounds](https://kenney.nl/assets/impact-sounds), [Interface Sounds](https://kenney.nl/assets/interface-sounds), [UI Audio](https://kenney.nl/assets/ui-audio), [RPG Audio](https://kenney.nl/assets/rpg-audio), [Music Jingles](https://kenney.nl/assets/music-jingles).
- Pack license declared by Kenney: Creative Commons Zero (CC0 1.0).
- [Source index and copies](https://github.com/Mcamento8/open-game-sfx-index), repository `audio/<pack>/<filename>.ogg`. Community index attribution/source claims should be rechecked against the underlying Kenney zip before distribution.
- The use of the community raw GitHub URLs is a preview integration, **not a guaranteed production content delivery network**.

## Outstanding specialty recordings (not claimed complete)
- Galaxy Whale: authentic whale vocalization and custom cosmic soundtrack need cleared, verified source files and mixing. NOAA has public domain material, but not selected or integrated into this build.
- Judah Lion: replace current sci-fi portal whoosh with a verified CC0 lion roar file (e.g. [SFXMint lion options](https://sfxmint.com/sets/animal-calls)); independently confirm file and license.
- Shofar: replace current sci-fi whoosh with an authenticated shofar sample. A candidate credited to Sauron974 appears as CC0 [Small Shofar](https://soundspool.com/sounds/small-shofar); the actual clip has not been imported.
- Copyrighted TikTok/BIGO/artist music clips: do not include unless the platform has the proper sound recording and composition licenses for livestream/interactive gift use.
- VR spatial positioning, stream participant audio synchronization, multi-device playback, dynamic loudness, reduced-motion/sensory preference support, and offline service-worker caching still need acceptance tests.

## Required acceptance tests
1. Run `node tests/holo-gift-cc0-audio-contract.mjs`.
2. From a real authenticated phone, tap gift preview with sound enabled; hear assigned CC0 effect.
3. Toggle SFX off and confirm instant silence.
4. Open same LIVE room as viewer and confirm event/timing without duplicated sound.
5. Simulate no internet/audio blocked and verify visuals and controls still work.
6. Verify host/viewer privacy, moderation and age gating before public broadcast.
