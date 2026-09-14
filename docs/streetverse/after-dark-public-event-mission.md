# Omniverse After Dark — Public Event Investigation Mission

Status: mission design / implementation contract. This file does not assert that any real attendee committed or knew about criminal conduct.

## Safety and factuality rule

This mission may reference real people only as **publicly documented attendees of public celebrity/White Party events**. Attendance alone is not evidence of wrongdoing. Real attendees must never be assigned fictional crimes, secret knowledge, complicity, or guilt. Any investigative suspects, perpetrators, witnesses with invented knowledge, or criminal acts must use fictional characters.

## Public-attendee cameo registry

The following people can be represented only as neutral background/cameo NPCs when a particular appearance is supported by reliable public reporting or archival photography:

- Leonardo DiCaprio
- Paris Hilton
- Martha Stewart
- Beyoncé
- Jay-Z
- Jennifer Lopez
- Mariah Carey
- Kim Kardashian
- Sarah Jessica Parker
- Aretha Franklin
- Mary J. Blige
- LL Cool J
- Ashton Kutcher
- Demi Moore
- Lil' Kim
- Jonah Hill
- Russell Simmons
- Al Sharpton

Implementation requirement: attach a `sourceRef` and event/year metadata before enabling any named cameo. If the evidence cannot be verified, fall back to a fictional celebrity NPC.

```ts
export interface PublicEventCameo {
  id: string;
  displayName: string;
  eventLabel: string;
  eventYear?: number;
  sourceRef: string;
  role: "background_cameo";
  criminalInferenceAllowed: false;
  interactable: false;
}
```

## Mission: The White Night File

This is a dramatized Omniverse mission inspired by the public-facing phenomenon of elite celebrity parties. It is not a reconstruction of unverified private events.

### Player flow

```text
AFTER DARK AGE GATE
 -> BENNY BRIEFING
 -> PUBLIC RED-CARPET / PARTY ZONE
 -> OBSERVE CROWD + ENVIRONMENT
 -> RECEIVE ANONYMOUS FICTIONAL TIP
 -> FOLLOW FICTIONAL STAFF / SECURITY THREAD
 -> COLLECT FICTIONAL DIGITAL + PHYSICAL CLUES
 -> CHOOSE STEALTH / SOCIAL / INVESTIGATION PATH
 -> IDENTIFY FICTIONAL OFFENDER NETWORK
 -> PROTECT FICTIONAL VICTIM / WITNESS
 -> CALL FICTIONAL AUTHORITIES / EXTRACTION
 -> SERVER VALIDATES OBJECTIVES
 -> REPUTATION + XP + DISCOVERY REWARD
 -> WORLD MEMORY CONSEQUENCE
 -> REEL HIGHLIGHT
```

### Named cameo behavior

Named public attendees are scenery-level cameos only. They can arrive, walk a carpet, talk generically about music/fashion/networking, or leave the event. They cannot:

- provide incriminating evidence unless that statement is itself documented public fact;
- participate in invented illegal activity;
- be secretly followed as suspects;
- be depicted as knowing about an invented crime;
- receive guilt/reputation markers.

The playable investigation begins with fictional NPCs after the public-event layer.

## Fictional mission cast

- **Benny / Stubbs AI** — mission director.
- **Maya Cross** — fictional event coordinator and protected witness.
- **Darius Vale** — fictional entertainment executive and primary investigative target.
- **Cipher** — fictional anonymous source.
- **Orion Security** — fictional private-security faction.
- **Detective Lena Brooks** — fictional law-enforcement liaison.

## Evidence system

```ts
export type EvidenceClass =
  | "access_log"
  | "camera_fragment"
  | "financial_record"
  | "message"
  | "witness_statement"
  | "physical_clue";

export interface MissionEvidence {
  id: string;
  class: EvidenceClass;
  fictional: true;
  integrityHash: string;
  collectedAt: string;
  chainOfCustody: string[];
}
```

Evidence must be server-validated. Players cannot manufacture evidence against named real people.

## Branches

1. **Spy route** — surveillance puzzles, access codes, stealth traversal and extraction.
2. **Detective route** — interviews, timeline reconstruction and evidence correlation.
3. **Social route** — networking, persuasion and nonviolent access to restricted fictional areas.
4. **Rescue route** — protect a fictional witness and safely exit the venue.

Each branch converges on the fictional conspiracy rather than a real celebrity.

## Easter eggs

- A white invitation contains a cipher that opens a Benny spy-room mission.
- A DJ waveform hides coordinates to a secret Omniverse studio.
- Three camera timestamps reconstruct an alternate safe exit.
- Completing the mission without accusing an innocent NPC awards the **Evidence Before Accusation** badge.
- Preserving every evidence chain-of-custody entry unlocks a detective bonus mission.

## World consequences

Successful completion can increase investigator reputation, community trust and After Dark safety reputation. Reckless accusations reduce investigator reputation. The mission therefore rewards evidence-based decisions rather than celebrity rumor.

## Production gate

Before runtime activation:

1. Verify each real-person cameo against reliable public-event evidence.
2. Store citations/source metadata separately from gameplay state.
3. Keep real cameos non-suspect and non-criminal.
4. Run age-gate, moderation, defamation-risk and mission-reward tests.
5. Replace any unverifiable named cameo with a fictional NPC.
6. Certify mobile performance and Reel capture.

This structure lets After Dark feel populated by recognizable public-event culture while keeping the actual playable crime/investigation narrative fictional and evidence-driven.
