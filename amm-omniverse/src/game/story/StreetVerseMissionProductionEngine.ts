export type MissionBeat = {
  id: string
  title: string
  shot: string
  gameplay: string
  npcLine: string
  playerChoice?: string[]
  worldMemoryWrite?: string
  assetTags: string[]
  accessibility: string[]
}

export type ProducedMission = {
  id: string
  title: string
  chapter: string
  location: string
  objective: string
  rightsMode: 'original-only'|'reference-only'|'player-authored'|'archive-backed'
  beats: MissionBeat[]
  success: string[]
  failSafe: string[]
  unlocks: string[]
}

const commonAccess=['captions','one-handed controls','reduced-motion alternative','screen-reader objective text']

export const STREETVERSE_PRODUCED_MISSIONS: ProducedMission[] = [
  {
    id:'prod-block-remembers',title:'The Block Remembers',chapter:'Chicago Origin',location:'Near West Side Memory District',objective:'Introduce movement, Stubbs AI and World Memory through an original neighborhood walk.',rightsMode:'player-authored',
    beats:[
      {id:'wake',title:'Morning on the Block',shot:'slow street-level push through brick, court, storefront and CTA ambience',gameplay:'walk to the first memory marker and select accessibility controls',npcLine:'Stubbs AI: This city does not start with a mission marker. It starts with memory.',playerChoice:['remember family','remember school','remember the neighborhood'],worldMemoryWrite:'origin memory preference',assetTags:['midwest-brick-kit','street-crowd-rig-a','holo-memory-ripple'],accessibility:commonAccess},
      {id:'court',title:'Court Echo',shot:'holographic past/present overlay at the basketball court',gameplay:'inspect three memory echoes without exposing private home information',npcLine:'Stubbs AI: Keep what is private private. Keep what matters remembered.',worldMemoryWrite:'privacy-safe childhood memory',assetTags:['basketball-court-kit','holo-depth-shader'],accessibility:commonAccess},
      {id:'return-point',title:'The First Promise',shot:'skyline opens in the distance',gameplay:'choose a future path marker',npcLine:'Stubbs AI: You can leave. The block will keep living. When you return, it will remember.',playerChoice:['school','music','sports','business','technology'],worldMemoryWrite:'first life-path choice',assetTags:['holo-wayfinder','scene-title-reveal'],accessibility:commonAccess},
    ],success:['origin saved','life-path unlocked'],failSafe:['never require private address','no mission loss for accessibility assists'],unlocks:['Everybody Knows Somebody','First Dollar']
  },
  {
    id:'prod-first-dollar',title:'First Dollar',chapter:'Chicago Origin',location:'Neighborhood Commerce',objective:'Complete a legitimate first-work mission and create a persistent employer/customer memory.',rightsMode:'original-only',
    beats:[
      {id:'offer',title:'Someone Needs Help',shot:'working storefront with pedestrian and customer traffic',gameplay:'choose delivery, stocking, creator help or service shift',npcLine:'Store Owner: I do not need a hero. I need somebody who shows up.',playerChoice:['delivery','store shift','creator promo','service help'],worldMemoryWrite:'first job selection',assetTags:['storefront-kit','customer-crowd-kit'],accessibility:commonAccess},
      {id:'work',title:'Do the Work',shot:'short task montage controlled by player',gameplay:'finish selected task with reliability and quality meters',npcLine:'Store Owner: People remember who keeps their word.',worldMemoryWrite:'reliability score',assetTags:['commerce-prop-kit','receipt-holo'],accessibility:commonAccess},
      {id:'receipt',title:'First Receipt',shot:'holographic receipt/ledger reveal',gameplay:'review fictional in-game earnings and reputation; no real-money promise',npcLine:'Stubbs AI: The important part is not the number. It is the record that you earned trust.',worldMemoryWrite:'first legitimate work memory',assetTags:['holo-ledger','lottie-success'],accessibility:commonAccess},
    ],success:['career history written','first reference unlocked'],failSafe:['no real-world deposit claim','no exploitative labor mechanics'],unlocks:['Business Claim','Marketplace Tutorial']
  },
  {
    id:'prod-hardball-memory',title:'The Day the Camera Caught the Block',chapter:'Chicago Film Memory',location:'Original Chicago Baseball Film-Set Memory',objective:'Recreate the emotional memory as an original interactive film-set scene while keeping protected movie assets rights-gated.',rightsMode:'player-authored',
    beats:[
      {id:'trucks',title:'Film Trucks Arrive',shot:'original production trucks and crew populate the block',gameplay:'learn set boundaries and find call-position markers',npcLine:'Eve: This is your memory layer. The production details are recreated, not copied.',worldMemoryWrite:'film-set arrival memory',assetTags:['film-set-prop-kit','baseball-field-kit'],accessibility:commonAccess},
      {id:'handoff',title:'The Handoff',shot:'medium player-focused camera with brother avatar behind',gameplay:'perform a generic prop handoff and select how the memory should be described',npcLine:'Eve: I will store what you say happened as player-authored memory until evidence supports more.',playerChoice:['family memory','neighborhood memory','film-work memory'],worldMemoryWrite:'player-authored handoff memory',assetTags:['film-prop-generic','family-holo-frame'],accessibility:commonAccess},
      {id:'field',title:'Baseball Becomes Cinema',shot:'wide baseball field to crane-style original game camera',gameplay:'assist camera blocking, extras and continuity',npcLine:'Crew Lead: Hit the mark, watch continuity, and help the scene move.',worldMemoryWrite:'production skill memory',assetTags:['baseball-field-kit','camera-rig-kit','crowd-rig'],accessibility:commonAccess},
      {id:'seen',title:'The World Sees the Block',shot:'sunset freeze into holographic World Memory',gameplay:'choose what this chapter means to the character',npcLine:'Stubbs AI: Being seen is one thing. Deciding what the world remembers is another.',worldMemoryWrite:'representation legacy memory',assetTags:['holo-memory-ripple','scene-title-reveal'],accessibility:commonAccess},
    ],success:['creator/film tutorial unlocked','family memory unlocked'],failSafe:['no copyrighted footage/audio','no unauthorized actor likeness','no gang instruction'],unlocks:['Hollywood Production Memory','Creator Career']
  },
  {
    id:'prod-soul-line',title:'The Line, the Camera, the Groove',chapter:'Hollywood Legacy',location:'Original 1990s-inspired Television Dance Stage',objective:'Perform an original dance-line experience with camera, rhythm, crowd and creator-replay scoring.',rightsMode:'reference-only',
    beats:[
      {id:'checkin',title:'Call Time',shot:'backstage-to-stage tracking shot',gameplay:'choose dancer, camera, floor-director or lighting role',npcLine:'Stage Host: Pick a role. Everybody on this floor makes the show happen.',playerChoice:['dancer','camera','floor director','lighting'],worldMemoryWrite:'television role choice',assetTags:['tv-stage-kit','backstage-kit'],accessibility:commonAccess},
      {id:'line',title:'The Line',shot:'reactive dolly and overhead original camera patterns',gameplay:'complete eight rounds of original choreography/freestyle with adaptive scoring',npcLine:'Eve: On beat is good. Original is better.',worldMemoryWrite:'dance performance score',assetTags:['dance-floor-reactive','holo-motion-trails','original-music-stem'],accessibility:['seated dance mode','upper-body scoring','visual beat lane','beat haptics','reduced-motion camera']},
      {id:'replay',title:'Creator Replay',shot:'player-selected edit from generated original camera angles',gameplay:'choose a rights-clean highlight and publish it to the fictional All American Network simulation',npcLine:'Stubbs AI: Your replay can become a new mission because the world remembers who watched it.',worldMemoryWrite:'creator replay history',assetTags:['creator-replay-ui','lottie-success'],accessibility:commonAccess},
    ],success:['dance rank saved','creator replay unlocked'],failSafe:['no archival Soul Train footage/music','no celebrity likeness without rights'],unlocks:['Hollywood Showcase','Creator Network']
  },
  {
    id:'prod-el-saturn-archive',title:'Build the Label Without the Gatekeepers',chapter:'El Saturn Immersive Library',location:'Holographic Archive + Business Lab',objective:'Research real archive metadata, separate evidence from interpretation, then create a rights-clean independent-label simulation.',rightsMode:'archive-backed',
    beats:[
      {id:'finding-aid',title:'Open the Finding Aid',shot:'library transforms into a holographic constellation of boxes, dates and document types',gameplay:'inspect archive metadata and tag each clue as fact, interpretation or family memory',npcLine:'Research Guide: A document tells you something. It does not tell you everything.',worldMemoryWrite:'archive research classification',assetTags:['immersive-library-kit','archive-constellation'],accessibility:commonAccess},
      {id:'distribution',title:'The Distribution Question',shot:'1950s-inspired rights-safe business lab morphs into modern creator dashboard',gameplay:'compare fictional distributor, mailing-list, direct-sale and storefront models',npcLine:'Stubbs AI: Independence is not magic. It is infrastructure, records, relationships and choices.',worldMemoryWrite:'independent distribution lesson',assetTags:['el-saturn-business-lab','holo-ledger'],accessibility:commonAccess},
      {id:'create',title:'Make Something New',shot:'recording room plus living-art wall',gameplay:'create an original simulated release, artwork and ownership/provenance record',npcLine:'Research Guide: Do not copy the artifact. Answer it with your own work.',worldMemoryWrite:'original archive response',assetTags:['recording-studio-kit','living-mural-kit','provenance-ui'],accessibility:commonAccess},
      {id:'mentor',title:'Pass the Infrastructure Forward',shot:'time shift reveals younger fictional creator learning the same system',gameplay:'mentor an NPC through ownership, splits, audience and storefront setup',npcLine:'Stubbs AI: Legacy begins when the system still helps somebody after you leave.',worldMemoryWrite:'next-generation mentorship',assetTags:['time-machine-holo','creator-storefront-kit'],accessibility:commonAccess},
    ],success:['creator cooperative unlocked','archive mission preserved'],failSafe:['archive metadata cited','copyrighted recordings/art remain rights-gated','family claims never auto-promoted to fact'],unlocks:['Twenty-Seven Pieces One Pulse','Build the Creator Cooperative']
  },
  {
    id:'prod-long-road-home',title:'1500 Miles Home',chapter:'Long Road Home',location:'Las Vegas to Chicago Memory Corridor',objective:'Turn the player-authored road memory into a consequence-driven travel chapter that rewards safe decisions, relationships and reflection.',rightsMode:'player-authored',
    beats:[
      {id:'leave-vegas',title:'Head East',shot:'night highway becomes dawn desert',gameplay:'prepare route, fuel, rest and vehicle condition',npcLine:'Eve: Getting home is the objective. Proving something to the road is not.',worldMemoryWrite:'travel preparation',assetTags:['interstate-kit','vehicle-interior-kit'],accessibility:commonAccess},
      {id:'incident',title:'Cracked Glass',shot:'impact memory represented abstractly; no glamorized crash camera',gameplay:'stop, inspect damage, choose repair/tow/lodging or safe alternate travel',npcLine:'Stubbs AI: A bad decision can become a lesson without becoming a reward.',playerChoice:['repair','tow','rest','alternate transport'],worldMemoryWrite:'vehicle safety consequence',assetTags:['vehicle-damage-kit','roadside-service-kit'],accessibility:commonAccess},
      {id:'crew',title:'Keep the Crew Together',shot:'quiet roadside conversation',gameplay:'resolve stress and choose how responsibility is shared',npcLine:'Travel Companion: We still have a long way home. We have to get there together.',worldMemoryWrite:'crew trust change',assetTags:['roadside-diner-kit','conversation-camera'],accessibility:commonAccess},
      {id:'skyline',title:'Chicago in the Distance',shot:'Chicago skyline appears after long interstate approach',gameplay:'trigger homecoming and compare departure/return biography',npcLine:'Stubbs AI: The city looks familiar. You are not the same person who left.',worldMemoryWrite:'Chicago homecoming',assetTags:['chicago-skyline-kit','holo-memory-ripple'],accessibility:commonAccess},
    ],success:['homecoming written','time-machine revisit unlocked'],failSafe:['unsafe driving never rewarded','fatigue creates stop/rest prompts','spiritual claims stay player-authored'],unlocks:['Drive That Road Again','Return Home']
  }
]

export function getProducedMission(id:string){return STREETVERSE_PRODUCED_MISSIONS.find(m=>m.id===id)}

export const MISSION_RUNTIME_CONTRACT = [
  'LOAD MISSION + RIGHTS MODE',
  'LOAD CHARACTER BIOGRAPHY + ACCESSIBILITY',
  'PRELOAD REUSED ASSETS + FALLBACKS',
  'RUN STORYBOARD BEAT',
  'WAIT FOR PLAYER OBJECTIVE/CHOICE',
  'WRITE LOCAL CHECKPOINT',
  'IF AUTHENTICATED WRITE SERVER MISSION STATE',
  'ADVANCE NPC/WORLD CONSEQUENCE',
  'WRITE WORLD MEMORY',
  'SAVE BIOGRAPHY SNAPSHOT',
  'GENERATE REPLAY/CREATOR OUTPUT WHEN ELIGIBLE',
  'UNLOCK NEXT MISSION',
  'REJOIN FROM SERVER ON NEXT DEVICE',
] as const
