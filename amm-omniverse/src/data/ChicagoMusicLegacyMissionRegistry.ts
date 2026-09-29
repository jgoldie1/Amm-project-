export type ChicagoMusicLegacyArtist={
 id:string
 displayName:string
 legacyLabel:string
 missionLane:'RAPPER'|'SINGER'|'MUSIC LEGACY'
 contextPolicy:'original-mission-reference'
 productionRights:'name-reference-review-required'
 likenessAuthorized:false
 musicAuthorized:false
}

export const CHICAGO_MUSIC_LEGACY_ARTISTS:ChicagoMusicLegacyArtist[]=[
 {id:'twista',displayName:'Twista',legacyLabel:'Chicago Speed',missionLane:'RAPPER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'shawnna',displayName:'Shawnna',legacyLabel:'Still Here',missionLane:'RAPPER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'tink',displayName:'Tink',legacyLabel:'Chicago Melody',missionLane:'SINGER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'r-kelly',displayName:'R. Kelly',legacyLabel:'History & Lessons',missionLane:'MUSIC LEGACY',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'king-von',displayName:'King Von',legacyLabel:'Chicago Real',missionLane:'RAPPER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'lil-durk',displayName:'Lil Durk',legacyLabel:'Streets & Survival',missionLane:'RAPPER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'kanye-west',displayName:'Kanye West',legacyLabel:'Vision & Evolution',missionLane:'MUSIC LEGACY',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'da-brat',displayName:'Da Brat',legacyLabel:'The Original Queen',missionLane:'RAPPER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'crucial-conflict',displayName:'Crucial Conflict',legacyLabel:'Chicago Pioneers',missionLane:'RAPPER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'lupe-fiasco',displayName:'Lupe Fiasco',legacyLabel:'Lyrics & Knowledge',missionLane:'RAPPER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'juice-wrld',displayName:'Juice WRLD',legacyLabel:'Gone But Forever Here',missionLane:'MUSIC LEGACY',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'common',displayName:'Common',legacyLabel:'Conscious Chicago',missionLane:'RAPPER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
 {id:'g-herbo',displayName:'G Herbo',legacyLabel:'Next Generation',missionLane:'RAPPER',contextPolicy:'original-mission-reference',productionRights:'name-reference-review-required',likenessAuthorized:false,musicAuthorized:false},
]

export const chicagoMusicLegacyMissionId=(artistId:string)=>`chicago-music-legacy-${artistId}`

export function createChicagoMusicLegacySteps(artist:ChicagoMusicLegacyArtist){
 return [
  {speaker:'Bennie',text:`Chicago music history is active. Follow the route for ${artist.displayName}: ${artist.legacyLabel}.`,objective:'Reach the Chicago music legacy marker',x:28,z:-12},
  {speaker:'Music Legacy Guide',text:'Learn the lane, then build something original instead of copying a record, image or performance.',objective:'Visit the 64-Track Studio learning stop',x:-42,z:-30},
  {speaker:'Creator Guide',text:'Turn the inspiration into your own performance, interview, commentary, beat, verse or Reel.',objective:'Create an original StreetVerse music moment',x:20,z:28},
  {speaker:'Bennie',text:'Legacy route complete. Publish only original or cleared media.',objective:'Finish at the Creator Stage',x:38,z:38},
 ]
}

export const CHICAGO_MUSIC_LEGACY_POLICY={
 originalMissionWritingOnly:true,
 noArtistLikenessWithoutRights:true,
 noArtistMusicWithoutRights:true,
 noEndorsementClaim:true,
 historicalContextLane:true,
 creatorOutputMustBeOriginalOrCleared:true,
} as const
