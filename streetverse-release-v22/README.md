# StreetVerse Chicago v22 — Private Beta Release Candidate

This branch is a review and integration checkpoint; the complete locally tested 92-file game package is provided separately in ChatGPT as StreetVerse_v22_Consolidated_Private_Beta.zip. **The game bundle is NOT yet committed to GitHub.** Do not deploy or merge this branch as if it contained the complete game.

## Verified locally
15 Node test scripts pass including HTTP route checks, saved-game source checks, player movement/control hooks, mod checks and asset serving. Visual Chromebook and iPhone playthroughs have **not** passed.

## First release targets
1. Verify Circle Park resident (E), vehicle entry (R), drive to Taylor Street, building entry (E), stairs/elevator, floor 3 utilities (E), 100 local XP.
2. On Chromebook and iPhone, record FPS, touch interaction problems, save/resume and screenshots.
3. Validate creator application email from a second device; until a private backend is built, applicants must click Send themselves.
4. Obtain a live HTTPS beta URL and **only then** rebuild/test public promotional QR.
5. Recruit five carefully screened modders after launch of a functioning preview.

## Security
No multiplayer, online accounts, real money, payouts or arbitrary third-party scripts in this prototype. Character model is a procedural BJ fallback; photo-based Meshy BJ has not been exported.

Do not upload applicant details or credentials to GitHub. Keep existing production deployments unchanged.
