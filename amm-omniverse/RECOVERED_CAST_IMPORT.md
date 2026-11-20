# Recovered 3D Cast — publish assets before claiming success

Source: `StreetVerse_3_Characters_Play.html` (20 MB self-contained playable source). The owner-provided GLB binaries are extracted in the companion archive `StreetVerse_3_Character_GLBS_Extracted.zip`.

Put these exact binary files under `amm-omniverse/public/tryamm-assets/recovered-characters/` before deploying:
- `BJ_STUBBS_V15_MOTION_ENHANCED.glb` (6,220,868 bytes; 1 skin; 9 animations; 6 images)
- `Jacobie_Greenville_Recovered.glb` (7,860,680 bytes; 1 skin; 12 animations; 3 images)
- `LaTeasia_RIGGED_DIAGNOSTIC.glb` (871,880 bytes; 1 skin; 7 animations; **no images or morph targets**)

The app now uses BJ's recovered GLB as its first loading candidate when on the same origin, while retaining the previous CDN and native fallbacks. The two companion characters are mounted in the Chicago scene by `mountRecoveredStreetVerseCast` and emit truthful `tryamm:streetverse-recovered-character-status` events. No generic NPC is mislabeled as the recovered cast.

Run the verification script:
`node scripts/verify-recovered-cast-assets.mjs`

**Release gate:** The scripts must confirm all three binary files are present with matching SHA256 hashes. Source-only GitHub Actions passing does not certify runtime characters, likeness, final texture quality or controls. LaTeasia remains a diagnostic rig and needs corrected texture/materials and body morph targets. Do not call that a completed likeness. The recovered BJ GLB currently contains a black T-shirt material; the black suit/purple shirt outfit has not been verified in this particular extracted binary.
