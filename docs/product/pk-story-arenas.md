# TRYAMM PK Story Arenas — proposed product direction

Status: design proposal, not implemented or released. 2026-10-15.

## Position

Turn a creator battle into an episodic, audience-directed live show whose results
advance a shared StreetVerse season. The audience chooses story branches and
prompts; creators supply the performance; trusted match servers own the clock,
ballots, score and result. Mobile users can participate with one hand.

This is a differentiation hypothesis, not a verified first-in-market claim.
TikTok already documents solo/team LIVE matches with gifts and likes contributing
to scores. BIGO already documents solo and team PK. Neither team battles, virtual
gifts, AI hosting nor visual effects alone establishes novelty.

Sources checked:
- https://support.tiktok.com/en/live-gifts-wallet/tiktok-live/live-match
- https://blog.bigo.tv/faq/bigo-live-pk/

## A concrete pilot: Chicago x Lagos — Build the Next Stage

Two adult creators perform three 90-second rounds with short transitions.
1. INTRO: introduce their crew through a song, comedy bit or spoken-word piece.
2. AUDIENCE CHOICE: authenticated viewers choose one of two pre-approved prompts.
   A vote shapes the next performance; it does not purchase the result.
3. COLLABORATION: opposing creators create a joint finale. A collective audience
   goal unlocks a shared digital stage decoration for both communities.

A host publishes the rules and judge rubric before the show. A panel scores
originality, execution and response to the prompt. Ties remain ties or use a
published judged encore; gifts never decide the ranked outcome. Free audience
choice awards remain separate from judged results and purchase volume.

The same match can play as a simple video stage on older phones, with optional
StreetVerse surroundings on capable devices. Holographic refers to rendered
visual presentation, not a physical hologram.

## What makes the combination worth testing

- Episodic consequence: outcomes unlock the next chapter, creator venue or
  community showcase, rather than disappearing when the timer ends.
- Audience roles: choose prompts, provide moderated clues, or support a shared
  goal through free participation. Server rate limits and deduplication apply.
- Rivalry plus collaboration: competitive rounds culminate in a joint finale,
  encouraging both audiences to return rather than punishing a losing creator.
- Accessible participation: large left-hand controls, captions, reduced motion,
  tap alternatives to gesture/speed tasks, no mandatory headset.
- Episode-to-reel path: participant-approved capture with source, round and
  result metadata; editorial review before publishing and storefront handoff.
- Portable creator identity: season progress and verified results follow the
  creator across supported TRYAMM worlds.

## Revenue to validate

Sponsor-funded episodes, optional cosmetic gifts, voluntary memberships and
creator merchandise. Separate payment receipts from competitive score. Do not
promise viewer income, automatic cash prizes or sponsor funds before they exist.
No paid entry or wagering in this pilot. Refunds, moderation, rights and verified
server settlement remain part of the commerce implementation.

## Build on existing work

- LiveCenter: existing PK mode, LiveKit room, camera/mic, effects and gift hooks.
- CrossVerseLivePK: existing session/score types and rules separating gifts from
  ranked outcomes; current declarations do not implement an authoritative server.
- HoloBattleRulesets: existing championship rounds and approved ruleset delegation.
- HoloLivePkLottieOverlay: presentation for session and result events.

Do not create another competing room/global launcher. Extend one canonical room
session and event contract, with authenticated server authorization and durable
match state. A browser event must never award a real rank, cash or entitlement.

## Delivery sequence and acceptance

1. Restore production LIVE configuration and test two actual devices: host,
   challenger, viewer, reconnect, microphone interruption, leaving and moderation.
2. Implement invite/accept, match lifecycle, server clock, role permissions,
   deduplicated ballots, published rubric and result finalization. Disconnects
   pause or forfeit only under published rules; reconnect restores server state.
3. Add one episode format and one audience prompt choice. Test older iPhone
   rendering and one-handed operation before adding 3D effects.
4. Add approved replay clipping and one optional cosmetic effect, then a capped
   sponsor pilot. Measure video participant-minutes and provider costs per show.
5. Add persistent season progression only after authoritative results and replay
   recovery have been verified.

Measure viewer retention through round two, return attendance for the next
chapter, free participation, creator repeat-hosting, moderation incidents,
connection recovery and cost per viewer-minute. Compare against ordinary PK on
TRYAMM before claiming that the format improves retention or revenue.

Open blockers observed today: production LiveKit configuration absent; HoloGPT
provider configuration absent; creator media reports Supabase HTTP 402; the checked
payment route reports Stripe unconfigured. These prevent a complete live pilot.
