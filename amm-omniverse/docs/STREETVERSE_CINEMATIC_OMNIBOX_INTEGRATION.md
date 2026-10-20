# StreetVerse / Omni Box / Holo Drama integration (2026-10-20)

## Defects addressed
- StreetVerseActionCarousel previously emitted a generic context action for MISSION and the core HUD dispatched an event without a guaranteed cinematic handler. The new StreetVerseCinematicMissions component mounts at the canonical route and provides a visible scripted selection, three local cutscene chapters and objective handoff.
- This provides fade-to-black 2D scene captions and scripted dialogue, not pre-rendered 3D cinema or acted voices. Rehearsal never credits XP, money, ownership or any server-authoritative rewards. The completion signal only means a local narrative draft was viewed.
- Action carousel, core gameplay dock and mobile shell now open the new cinematic selector.
- First Ride dispatches the existing first-journey start when its cinematic finishes.
- Omni Box episode studio is available on /omni-box: six editable five-minute script/shot blocks, 30-minute target, JSON/text download and local handoff.
- Holo Drama imports the Omni Box draft and now prevents metadata-only episode publication without an actual uploaded video. Paid unlock/subscriber/ad-supported publication remains blocked until provider and settlement are verified.

## Third-party technology decision
- Godot MIT engine: https://godotengine.org/license/
- MicropolisCore GPL-3.0 simulator: https://github.com/SimHacker/MicropolisCore
- In-repo React + Three.js continues as the production browser runtime. SimCity-style economics should be written as original code; do not import Micropolis GPL code into a commercial proprietary bundle without license review. GTA/SimCity proprietary content is not installed, fetched or bundled.
- Licensed models and textures need author/source/license tracking. Supabase HTTP 402 is an external media dependency; the story UI is local and independent of blocked GLB fetches.

## Release gates
1. TypeScript + gameplay source contracts pass, then physical iPhone cinematic UI.
2. Verify a real frame of BJ's GLB and Circle Park city world; this narrative UI is not proof of GTA-grade graphics.
3. Test the thirty-minute *plan* and handoff; separately verify actual video encoding, DRM/content rights, upload playback, checkout and server ledger before monetization.
4. Reconcile the stored release baseline and branches before staging or promoting Vercel aliases. No production changes from this patch.
