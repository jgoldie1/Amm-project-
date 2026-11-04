# Soul Ascension Awards + Metaverse Jam — Dance Archive & CC0 Source Receipt

Updated: 2026-11-04. Development-only; no production release, automatic payments, copyrighted commercial music or cleared footage claimed.

## Recovered project continuity
Soul Ascension Awards and Soul Ascension Metaverse Jam were previously designed as a next-generation music-and-dance celebration with a virtual dance line, main stage, fan dance zones, international performances, artist voting, holograms, accessibility, AR/VR, digital tickets and livestreaming under TRYAMM/StreetVerse/LIVE/All American Network. This pass adds a new dance-reference browser inside the existing StreetVerse RP carousel. It does **not** replace or claim to recover earlier complete application source that could not be located.

## Verified acquisitions: Free Quaternius CC0 Standard editions

1. **Universal Animation Library [Standard]**, downloaded from the creator's zero-dollar itch.io flow via a non-production GitHub Actions job.
   - Exact original ZIP: `Quaternius_Universal_Animation_Library_Standard.zip`
   - Byte size: **15,904,933**
   - SHA-256: `cc73fc4e495b82958207316596317a3f40b9fa38065bde1027937452da537724`
   - Contents: Unreal/Godot `UAL1_Standard.glb` (7,618,436 bytes), root-motion version `UAL1_Standard_RM.glb`, Unity FBX exports, license, readme.
   - Actual animations in each non-RM GLB: **43**, including **`Dance_Loop`** (and `Idle_Talking_Loop`, `Driving_Loop`, `Fixing_Kneeling`).
2. **Universal Animation Library 2 [Standard]**, downloaded from same publisher.
   - Exact original ZIP: `Quaternius_Universal_Animation_Library_2_Standard.zip`
   - Byte size: **18,735,003**
   - SHA-256: `4008ea208a604773a2b2177d965f0f5d3195498b5bf838c3f5785d68e95f2a68`
   - Contents: `UAL2_Standard.glb` (8,091,444 bytes), root-motion version, FBX, female mannequin GLB, license, readme.
   - Actual animations in non-RM `UAL2_Standard.glb`: **43**. No specific hip-hop or dance-genre motion is implied by these clip names.

Both original ZIPs passed nested ZIP integrity checks and GLB 2.0 animation-list inspection. SHA-256 checksums were compared against independent public inventory documentation. The zero-cost Standard downloads contain **86 source animation names across two packs**, not the full paid 120+/130+ catalog and not 86 different dances.

## Google Drive saved copies
Google Drive folder: https://drive.google.com/drive/folders/1zTy63AkvKJa9OKA8kuS6mqLW76n-T-7c

GitHub Actions artifacts were uploaded as nested archives: each Google Drive `...Archive_Bundle.zip` contains the **original Standard ZIP** and SHA-256 receipt. Unzip the bundle, then unzip the inner Quaternius ZIP to access the GLB files.

- Library 1: https://drive.google.com/file/d/1b9O_I4rUQ6tZtq-SrOiVsgaqcheSEDBS/view
- Library 2: https://drive.google.com/file/d/10Jp-f0eWgRO7ry14W9qKW2uat-cm20p7/view
- Acquisition GitHub Actions run: https://github.com/jgoldie1/Amm-project-/actions/runs/41879917623 (completed successfully).

## 1980s to present dance browser
- `src/data/SoulAscensionDanceArchive.ts`: **120 era-tagged dance-style reference cues**, 24 for each featured decade from the 1980s through 2020s. Era grouping indicates performance programming, not historical origin.
- `src/components/SoulAscensionDanceLine.tsx`: accessible full-screen searchable virtual dance line. Era filters; pagination; stage selection; generic BJ animated groove; Reel request.
- `src/components/StreetVerseRPActionSearch.tsx`: HOLO ACTIONS entry point.
- Source mannequin preview: `StreetVerseCC0MotionGallery`, optional initial clip `cc0-dance-loop`, **the actual CC0 `UAL1 Dance_Loop`**. On-demand GLB preview is distinct from BJ retarget.
- All 120 reference names **do not have an individually verified original 3D choreography**. Temporary BJ grooves are clearly labelled stand-ins until original/approved era-specific clips are built and retargeted.

## Next release gates
1. Validate correct 3D gesture playback in an instrumented Chromium browser and on the Chromebook/iPhone. All new code is still in a draft PR, not production.
2. Retarget selected licensed source motions to approved BJ/StreetVerse GLB skeletons with bone mapping, scale, root motion, contact and transitions; check actual animation bindings.
3. Make unique historical choreography via consented dancers or original choreography with culturally accurate consultation; capture/rig/QA each decade and world style.
4. Implement actual dance-line multiplayer/synchronized emote timing; verify music rights, stream rights, content permissions and moderation before public events.
5. Add AR/VR, voting, ticketing and fan live submission only after current gameplay/streaming foundations pass end-to-end tests.

**Shadow Box remains reserved for the dedicated future boxing game** and is excluded from this dance feature and current weapon loadouts.
