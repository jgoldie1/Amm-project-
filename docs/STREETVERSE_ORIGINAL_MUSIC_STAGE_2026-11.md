# StreetVerse Original Music Stage — November 3, 2026

Development branch: streetverse-chromebook-workbench. Do not merge into main until real Chromebook/mobile QA and build/typecheck.

## What is implemented
- All 46 named StreetVerse music genre lanes have unique fictional performer production slots (previous 12 original performers preserved).
- Meet the Stubbs family district retains the previously registered 39 family passports plus the global and historical artist reference catalog.
- The new in-game Original Music Stage is reachable through a button in Meet the Stubbs.
- The stage renders 8 stylized original 3D people at once for low-memory devices, with next/previous stages, WASD/arrows, a one-hand movement pad, the E/INTERACT button, and navigation cards for all 46 performers.
- The real BJ V15-first loader is used for the player on the music stage, with the owner-approved recovered v3 GLB as the already-existing fallback. Failure retains a procedural gameplay placeholder.
- Interactions generate original music scene events and can request the existing media-studio UI.
- Real artist references in ChicagoMusicLegacyMissionRegistry remain historical/editorial mission data, not cloned playable people; no existing recordings or voice clones shipped.

## What is not ready
- The stage has lightweight procedural fictional people, not individual MetaHuman/GLB facial likenesses.
- Stage actors do not perform songs or provide speech audio yet.
- Browser WebGL hardware rendering and the integration with the main production app have not been certified on the Chromebook, and no web deployment was made.
- Existing legal permissions for other real people's specific likenesses/recordings remain separate from the owner's BJ permission.
- Scene navigation and events need real UI acceptance tests.
- Cost of user-scale CDN and LIVE remains unmeasured.

## User testing
Open Meet the Stubbs in the development app once an authorized preview has been deployed, choose Original Music Stage, then use the movement pad to approach the performers. Choose a genre card to visit artists across six stage pages, press INTERACT/E to display the scene prompt, and try Open Creator Studio. If 3D fails, the genre cards should remain accessible. This code does not by itself publish an online link.

## Next gate
Run build/typecheck, existing roster contracts, ChromeOS/phone playback, BJ GLB visibility and gesture QA, music-studio event test and budget check. Keep production unchanged until approved.
