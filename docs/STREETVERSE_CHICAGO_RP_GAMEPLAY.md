# StreetVerse Chicago RP Gameplay System

Status: EXPERIMENTAL / DRAFT PR #251
Release dependency: NO

## FiveM decision

StreetVerse Chicago does not require FiveM.

FiveM is a GTAV multiplayer modification framework. Using it would make GTA V, a compatible FiveM client and the Cfx ecosystem part of the runtime dependency.

StreetVerse is being built as its own web/mobile/3D experience. It can learn from RP patterns without inheriting GTA V/FiveM as a platform dependency.

Potential future use:
- optional research/prototyping only;
- compare RP economy/community patterns;
- never import proprietary GTA/FiveM assets into StreetVerse;
- never make FiveM required for StreetVerse users.

## RP mission grammar: A / B / C

Every major mission should offer three meaningful routes where practical:

A — ACTION
Driving, rescue, timed objective, sports, chase, performance, physical interaction.

B — BUILD / BUSINESS
Repair, negotiate, deliver, operate a business, organize a crew, support a neighborhood.

C — LEARN / TEST
Lesson, investigation, puzzle, certification, quiz, strategy or skill test.

The choice is not cosmetic. It can change:
- XP category;
- NPC bonds;
- business/reputation;
- next mission;
- dialogue;
- permanent discoveries;
- creator highlights.

## One-hand RP

The player should be able to complete the core RP loop with one hand.

Default controls:
- INTERACT;
- MISSION;
- PHONE;
- VEHICLE;
- EMOTE;
- CAMERA;
- A/B/C choice buttons.

Requirements:
- left/right placement toggle;
- 52px+ touch targets;
- hold-to-open action wheel target;
- auto-run target;
- camera recenter;
- nearest-interactable focus;
- optional voice-command hook;
- reduced motion;
- no essential two-button chord.

## In-game event structure

StreetVerse should not depend on a developer manually spawning every interesting moment.

At any time:
- 1 neighborhood micro-event can be active nearby;
- 1 city event can be active;
- a weekly major event can rotate;
- player businesses/creators can schedule approved events.

Recommended event families:
- Chicago Creator Night;
- Neighborhood Business Day;
- Transit Rush;
- Chicago Car Culture & Salvage Expo;
- Lakefront Community Festival;
- After Dark;
- OmniResilience Recovery Week;
- Chicago City Mystery;
- Chicago Sports Weekend;
- Faith & Community Day.

## Vehicle Salvage / “Chop Shop” gameplay

Keep the fun RP fantasy while isolating it from real-world wrongdoing.

In-world fantasy name:
StreetVerse Chop Shop / Salvage Garage.

Actual system:
Vehicle Salvage & Custom Garage.

Game vehicle sources:
- player-owned trade-ins;
- auction vehicles;
- abandoned fictional world vehicles;
- mission-tagged fictional salvage;
- insurance-salvage simulation.

Actions:
INSPECT → TOW → REPAIR → REBUILD → CUSTOMIZE → PART-OUT → PARTS MARKET → AUCTION / RESALE.

Possible roles:
- tow operator;
- mechanic;
- body/paint specialist;
- parts buyer;
- auction dealer;
- vehicle appraiser;
- creator/car-show host.

Do not model real VIN tampering, theft concealment or law-enforcement evasion methods.

## Permanent progression

StreetVerse needs memories that survive a session.

Persistent bond categories:
- resident;
- crew;
- family;
- business;
- mentor;
- creator;
- neighborhood.

Bond rewards:
- new dialogue;
- mission introductions;
- crew assistance;
- discounts;
- business connections;
- story scenes;
- safehouse/social spaces.

Permanent boosts should improve access and convenience, not become pay-to-win.

Examples:
- City Memory;
- Trusted Local;
- Creator Instinct;
- Wheelman;
- Merchant Network;
- Transit Master;
- Resilience Trained.

## Easter eggs

Use several depths:
1. easy visual references;
2. hidden dialogue/lore;
3. multi-step secret;
4. cross-layer Chicago secret;
5. long-term community puzzle.

Rewards:
- cosmetics;
- titles;
- lore cards;
- secret rooms;
- alternate dialogue;
- mission variants;
- vehicle liveries;
- creator props.

Best rule:
an Easter egg should reveal character/world history or unlock a memorable interaction—not merely give currency.

## Strong additional systems

### Reputation is multidimensional
Do not use a single good/bad meter.

Track:
- neighborhood trust;
- business reputation;
- creator reputation;
- driver reputation;
- service/community reputation;
- crew/family bonds.

### Consequences without hard-locking the player
Choices should alter future missions and relationships while still allowing recovery through new gameplay.

### Event-to-Reel loop
EVENT → DECISION → MISSION → CONSEQUENCE → HIGHLIGHT → REEL/LIVE → SOCIAL DISCOVERY → NEW PLAYER ENTERS EVENT/DISTRICT.

### Dynamic NPC invitations
NPC bonds can cause residents to call/message the player with new RP opportunities.

### Vertical-layer missions
A single mission can start on the L, move to street level, use the Pedway/subway, descend into Lower Wacker-inspired service roads and finish at the Riverwalk.

### RP without voice requirement
Players can roleplay through:
- quick dialogue;
- emote wheel;
- contextual responses;
- text;
- speech-to-text/text-to-speech hooks;
- A/B/C choices.

This is critical for accessibility and mobile play.
