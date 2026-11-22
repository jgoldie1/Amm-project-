# StreetVerse Chicago — Mission Game Design & Monetization v1
Status: Proposed rules and a browser prototype, not a shipped 3D game.

## Core gameplay
1. Enter StreetVerse Chicago; choose a district, character, and role.
2. Mission Director chooses a registered mission with a level, prerequisites, content warnings, reward rules and evidence of completion.
3. Player enters a mission in an accessible overlay that never obscures movement controls, or an optional 3D scene when integrated.
4. Player investigates, talks to NPCs, selects actions, and obtains non-sensitive fictional clues; incorrect choices teach and permit retries.
5. Complete the three stages in order; unlock the next mission/district/career track.
6. Award 75 XP and 50 fictional credits per mission *once* on the prototype. Ledger migration must be server-authoritative and idempotent.
7. Earn cosmetic items, access to new missions, narrative chapters and virtual businesses. No automatic real-currency or blockchain redemption.
8. Save mission checkpoints, pause/resume, export test report and support one-handed keyboard/touch/voice-accessible controls.
9. Collaborative/co-op and multiplayer progression require authoritative accounts, identity and moderation protections; do not trust localStorage.
10. All emergency, medical, criminal and speculative scenarios are fiction and do not replace real professional training.

## Nine original activity modes
- After Dark 007: nightlife and private-investigation roleplay; safety, consent, venue operations.
- Chicago Casefiles: independently written deduction mysteries; evidence, interviews, alternative explanations.
- StreetVerse District Tycoon: fictional dice movement, storefronts, job creation and simulated city-building.
- Shadow Division: original speculative extraterrestrial investigations and science-fiction travel.
- Chicago Fire & Rescue: fictional incident response, evacuation, restoration and community recovery.
- Chicago Undercover: ethical investigations, witness protection and civil-rights safeguards.
- Chicago University ER: fictional teaching-hospital roleplay; clinician escalation and patient privacy.
- Chicago 911 Dispatch: location verification, coordination and authorized callback simulation.
- Chicago Homicide Casefiles: non-graphic crime scenes, fair evidence review and exculpatory findings.

## Originality / clearance
Do not use names, character designs, dialogue, title treatment or visual assets from Clue, Monopoly GO, Men in Black, Chicago Fire, Chicago P.D., Chicago Med, Chicago Justice or any other protected show or game. Generic genres and mechanics are inspirations only. UIC and public agency names/emblems must not imply affiliation, employment, sponsorship or licensed training. Seek written authorization before any real artist likeness, music or performance is deployed.

## Game economy / fairness
- Free-to-play story progression; no real-world cash or cryptocurrency rewards for dice, raids, police missions or medical missions.
- Correct choices are repeat-safe and cannot grant infinite credits; board rolls only move a token and cannot be redeemed or wagered.
- Optional cosmetics, creator experiences and sponsored opt-in storefronts may be sold only with age-appropriate disclosures, consent and real payment processing.
- Use server-side entitlement checks and auditable ledgers before monetization.
- Founder-owned user-generated stores should not be mistaken for real property rights.

## Revenue planning (illustrative, not forecasts)
Monthly gross revenue = active monthly players * paying-user percentage * average monthly purchase + paid sponsorship placements * monthly sponsorship fee.
Low illustration: 1,000 players * 3% * $4.99 + 2 sponsors * $250 = $649.70.
Mid illustration: 10,000 players * 4% * $4.99 + 10 sponsors * $250 = $4,496.
High illustration: 50,000 players * 5% * $4.99 + 20 sponsors * $500 = $22,475.
No sales or sponsor agreements are verified. Gross excludes refunds, taxes, app/payment platform fees, hosting, moderation, licensing, creator revenue shares, marketing, staffing and insurance.
A launch with zero paying users and zero contracts earns $0.

## Release acceptance gates
- TypeScript build, lint, smoke and gameplay release gate.
- Mission schema uniqueness, prerequisites, rewards, persistence and repeat-abuse tests.
- Mobile Chromebook + iPhone one-handed controls and readable buttons; overlay does not hide joystick.
- Accessibility and no flashing/strobes without opt-in.
- Basic privacy and moderation tests; clinician/911 disclaimers and age-based safety policies.
- 3D character walking, animation, interaction, mission handoff and save/reload on two devices.
- Real verified deployment URL and a human-observed test report; preview failure is a release blocker.

## Priority
First, stabilize one full chapter: Circle Park -> NPC -> After Dark -> 911 dispatch -> ER/fire -> case solved -> fictional reward -> save/reload. Then replicate with reusable mission templates and introduce optional tycoon board and shadow narrative. Keep professional simulations distinct from real assistance.
