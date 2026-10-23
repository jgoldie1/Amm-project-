// StreetVerse XR Arcade: original game-mode discovery adapter.
// No copyrighted third-party characters, names, assets or game rules are imported.
export type XRArcadeMode='quantum-tag'|'omni-card-duel'|'faith-battle'|'gremlin-chaos'|'specter-response'|'tactical-arena'
export type XRArcadeEntry={id:XRArcadeMode;title:string;genre:string;existingModule?:string;status:'existing-component'|'design-only';access:'all-ages'|'age-gated';goal:string}
export const STREETVERSE_XR_ARCADE:readonly XRArcadeEntry[]=[
 {id:'quantum-tag',title:'Quantum Tag',genre:'timed spatial target challenge',existingModule:'QuantumTagArena',status:'existing-component',access:'all-ages',goal:'Tag shifting targets and earn fictional points'},
 {id:'omni-card-duel',title:'Omni Holographic Card Duel',genre:'original strategic card battle',existingModule:'CardBattleArena',status:'existing-component',access:'all-ages',goal:'Summon original cards and compete in turn-based arenas'},
 {id:'faith-battle',title:'FaithVerse Trials',genre:'nonviolent virtues and wisdom challenge',status:'design-only',access:'all-ages',goal:'Solve cooperative puzzles, make wise choices and restore balance'},
 {id:'gremlin-chaos',title:'Creature Chaos',genre:'original mischievous creature defense',status:'design-only',access:'all-ages',goal:'Protect a fictional neighborhood from playful creature swarms'},
 {id:'specter-response',title:'Specter Response',genre:'original paranormal investigation',status:'design-only',access:'all-ages',goal:'Identify fictional anomalies and safely contain their effects'},
 {id:'tactical-arena',title:'Omega Tactical Arena',genre:'fictional team objective competition',status:'design-only',access:'age-gated',goal:'Coordinate squads, defend zones and complete objectives'},
] as const
export const STREETVERSE_XR_ARCADE_RULES={
 originalCharactersAndVisualsOnly:true,
 checkpointReturn:'HoloArenaManager',
 controllerOptions:['touch','keyboard','gamepad','xr-when-certified'],
 vrCertificationPending:true,
 arWorldAnchoringPending:true,
 contentModerationRequired:true,
 simulatedRewardsOnly:true,
 rankedScoringServerAuthorityRequired:true,
 giftsCannotChangeRankedScores:true,
 noRealWorldWeaponsTraining:true,
 faithExperienceNoPayToPray:true,
} as const
export function getStreetVerseXRArcadeMode(id:string){return STREETVERSE_XR_ARCADE.find(m=>m.id===id)||null}
