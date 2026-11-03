// StreetVerse original, fictional music performers. Genres are inspiration, not impersonation.
// Do not add unlicensed songs, celebrity faces, voice clones, or endorsement claims.
export type OriginalMusicLane='RAPPER'|'SINGER'|'MUSIC LEGACY'
export type StreetVerseOriginalMusicPerformer={
 id:string;displayName:string;genre:string;lane:OriginalMusicLane;creativeBrief:string;visualSlot:string
 fictional:true;likenessSource:'original-generated';musicSource:'original-or-cleared-only';status:'character-design-pending';ageLane:'adult'
}
export const STREETVERSE_ORIGINAL_MUSIC_PERFORMERS:readonly StreetVerseOriginalMusicPerformer[]=[
 {id:"original-hip-hop",displayName:"Kilo Verse",genre:"hip-hop",lane:"RAPPER",creativeBrief:"Boom-bap, storytelling and original bars",visualSlot:"sv-black-man-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-drill",displayName:"North Circuit",genre:"drill",lane:"RAPPER",creativeBrief:"Hard-edged Chicago energy with fully original lyrics",visualSlot:"sv-black-man-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-trap",displayName:"Jett South",genre:"trap",lane:"RAPPER",creativeBrief:"Modern trap production and city rollout",visualSlot:"sv-black-man-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-conscious-rap",displayName:"Lyric Meridian",genre:"conscious-rap",lane:"RAPPER",creativeBrief:"Conscious writing and community stories",visualSlot:"sv-black-woman-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-rnb",displayName:"Astra Vale",genre:"rnb",lane:"SINGER",creativeBrief:"Contemporary R&B hooks and vocal arrangement",visualSlot:"sv-black-woman-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-neo-soul",displayName:"Sienna Moon",genre:"neo-soul",lane:"SINGER",creativeBrief:"Warm jazz-inflected soul and live instruments",visualSlot:"sv-black-woman-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-gospel",displayName:"Aria Quay",genre:"gospel",lane:"SINGER",creativeBrief:"Original gospel and choir showcases",visualSlot:"sv-black-woman-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-jazz",displayName:"Orbit Nine",genre:"jazz",lane:"MUSIC LEGACY",creativeBrief:"Improvisation and Afrofuturist-inspired original music",visualSlot:"sv-black-man-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-blues",displayName:"Blue Rowan",genre:"blues",lane:"SINGER",creativeBrief:"Original blues guitar and Chicago roots storytelling",visualSlot:"sv-black-man-senior-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-house",displayName:"DJ Copperline",genre:"house",lane:"MUSIC LEGACY",creativeBrief:"Chicago house DJ culture and original dance tracks",visualSlot:"sv-black-man-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-techno",displayName:"Rhea Pulse",genre:"techno",lane:"MUSIC LEGACY",creativeBrief:"Original electronic rhythm sequencing",visualSlot:"sv-multiracial-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-edm",displayName:"Eon Bass",genre:"edm",lane:"MUSIC LEGACY",creativeBrief:"Electronic festival sets and original beats",visualSlot:"sv-black-man-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-funk",displayName:"Jupiter Keys",genre:"funk",lane:"MUSIC LEGACY",creativeBrief:"Original bass grooves and stage-band challenges",visualSlot:"sv-black-man-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-afrobeats",displayName:"Zaya Kora",genre:"afrobeats",lane:"SINGER",creativeBrief:"Original Afrobeats fusion and global collaborations",visualSlot:"sv-black-woman-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-amapiano",displayName:"Dawn Circuit",genre:"amapiano",lane:"MUSIC LEGACY",creativeBrief:"Original South African dance rhythms and production",visualSlot:"sv-black-woman-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-reggae",displayName:"Tidal Form",genre:"reggae",lane:"SINGER",creativeBrief:"Original reggae songwriting and live sets",visualSlot:"sv-black-man-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-latin",displayName:"Nala Seren",genre:"latin",lane:"SINGER",creativeBrief:"Original Latin pop and rhythm collaborations",visualSlot:"sv-latina-woman-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-country",displayName:"Delta Rain",genre:"country",lane:"SINGER",creativeBrief:"Original country songwriting and acoustic stage work",visualSlot:"sv-white-woman-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-rock",displayName:"Cobalt Drive",genre:"rock",lane:"SINGER",creativeBrief:"Original rock bands and live-guitar showcases",visualSlot:"sv-white-man-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-alternative",displayName:"Sable Echo",genre:"alternative",lane:"SINGER",creativeBrief:"Original alternative and independent performances",visualSlot:"sv-multiracial-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-pop",displayName:"Juno North",genre:"pop",lane:"SINGER",creativeBrief:"Original pop hooks and concert performance",visualSlot:"sv-white-woman-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-classical",displayName:"Luna Crest",genre:"classical",lane:"MUSIC LEGACY",creativeBrief:"Original classical arrangements and orchestra practice",visualSlot:"sv-east-asian-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-spoken-word",displayName:"Verse Harbor",genre:"spoken-word",lane:"RAPPER",creativeBrief:"Original poetry, spoken word and storytelling",visualSlot:"sv-black-woman-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-soul",displayName:"Mira Sol",genre:"soul",lane:"SINGER",creativeBrief:"Original soul ballads and vocal harmony",visualSlot:"sv-black-woman-adult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-dancehall",displayName:"Island Signal",genre:"dancehall",lane:"SINGER",creativeBrief:"Original dancehall performance and choreography",visualSlot:"sv-black-man-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
 {id:"original-punk",displayName:"Voltage Ivy",genre:"punk",lane:"SINGER",creativeBrief:"Original punk performance and garage-band missions",visualSlot:"sv-white-woman-youngadult-01",fictional:true,likenessSource:'original-generated',musicSource:'original-or-cleared-only',status:'character-design-pending',ageLane:'adult'},
] as const

export function createOriginalMusicMissionSteps(p:StreetVerseOriginalMusicPerformer){
 return [
  {speaker:'64-Track Studio Host',text:`${p.displayName} is developing an original ${p.genre} performance. Start with a properly owned or licensed beat and a creative brief.`,objective:'Open Aniyah 64-Track Studio',x:-42,z:-30},
  {speaker:p.displayName,text:`${p.creativeBrief}. Write an original section and record a clean performance.`,objective:'Create original bars, vocals, beats or choreography',x:10,z:-18},
  {speaker:'Rights Coordinator',text:'Confirm contributors, samples and permissions before publication. This fictional performer is not a celebrity clone.',objective:'Review original recording and credits',x:20,z:28},
  {speaker:'StreetVerse Stage Host',text:'Create your own showcase and capture a Reel. Release music only when all required rights are cleared.',objective:'Reach the creator performance stage',x:38,z:38},
 ]
}

export const STREETVERSE_ORIGINAL_MUSIC_POLICY={
 noRecognizableCelebrityClones:true,
 noImitatedVoiceWithoutPermission:true,
 noCopyrightedRecordingWithoutLicense:true,
 originalCharactersOnly:true,
 fictionalIdentityLabelRequired:true,
 liveMusicMustBeOriginalOrCleared:true,
 minorsExcludedFromAdultEntertainment:true,
} as const
