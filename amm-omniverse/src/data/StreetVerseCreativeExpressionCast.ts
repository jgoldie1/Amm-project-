import {MEET_THE_STUBBS_FAMILY_FRIENDS} from '../game/characters/meetTheStubbsFamilyFriends'
import {CHICAGO_MUSIC_LEGACY_ARTISTS} from './ChicagoMusicLegacyMissionRegistry'
import {GENRE_PROFILES,type GenreProfile} from '../lib/music/universalImmersiveMusic'

/**
 * StreetVerse creative-expression cast pipeline.
 *
 * Every real person's exact appearance is a separate authorized asset decision.
 * The ORIGINAL stage characters below are fictional and deliberately distinct
 * from the historical performer references (which are informational, not avatars).
 * No copyrighted music, voice imitation or endorsement is included.
 */
export const STREETVERSE_CREATIVE_CAST_POLICY={
 originalStylizedAvatarsAllowed:true,
 noAutomaticCelebrityFaceClones:true,
 noCelebrityVoiceClones:true,
 noUnlicensedSongPlayback:true,
 noFalseArtistEndorsements:true,
 realPersonLikenessRequiresOwnAuthorization:true,
 familyYouthSafeByDefault:true,
 mobileSpawnBudget:12,
 stagePerformerNearBudget:8,
} as const

export type CreativePerformer={
 id:string
 displayName:string
 genre:string
 parentGenre:GenreProfile
 role:'fictional-original-stage-performer'
 appearance:'stylized-creative-expression'
 musicRights:'original-or-cleared-only'
 voiceRights:'original-or-cleared-only'
 status:'playable-stylized-slot'
}
const CORE_STAGE_NAMES=[
 'Temple Skylight','Velvet Frequency','Mic Atlas','Neon Bloom','Electric Union',
 'Orbit Notes Quartet','South Side Bluebird','Pulse City','Kora Skyline',
 'Piano Horizon','Island Voltage','Groove Syndicate','Prairie Avenue',
 'Sol del Barrio','Horizon Strings','Spotlight Ensemble','Cloud Loop',
] as const

const REGIONAL_STAGE_GENRES=[
 {genre:'Chicago house',parent:'house-techno-edm',name:'Lakefront House Collective'},
 {genre:'Chicago blues',parent:'blues',name:'Midnight Blue Stage'},
 {genre:'drill',parent:'hip-hop-trap',name:'Concrete Cipher'},
 {genre:'spoken word',parent:'rnb-soul',name:'City Story Poet'},
 {genre:'Afrofuturism',parent:'jazz',name:'Celestial Music Lab'},
 {genre:'Christian rap',parent:'hip-hop-trap',name:'Kingdom Mic'},
 {genre:'gospel R&B',parent:'rnb-soul',name:'Grace Frequency'},
 {genre:'worship',parent:'gospel',name:'Gathered Voices'},
 {genre:'Set Apart music',parent:'gospel',name:'Covenant Harmony'},
] as const

export const STREETVERSE_CREATIVE_GENRE_PERFORMERS:readonly CreativePerformer[]=[
 ...GENRE_PROFILES.map((genre,index)=>({
   id:'genre-'+genre,
   displayName:CORE_STAGE_NAMES[index],
   genre,
   parentGenre:genre,
   role:'fictional-original-stage-performer' as const,
   appearance:'stylized-creative-expression' as const,
   musicRights:'original-or-cleared-only' as const,
   voiceRights:'original-or-cleared-only' as const,
   status:'playable-stylized-slot' as const,
 })),
 ...REGIONAL_STAGE_GENRES.map(genre=>({
   id:'regional-'+genre.genre.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
   displayName:genre.name,
   genre:genre.genre,
   parentGenre:genre.parent as GenreProfile,
   role:'fictional-original-stage-performer' as const,
   appearance:'stylized-creative-expression' as const,
   musicRights:'original-or-cleared-only' as const,
   voiceRights:'original-or-cleared-only' as const,
   status:'playable-stylized-slot' as const,
 })),
]

export type CreativeProductionOrder={
 id:string
 displayName:string
 kind:'meet-the-stubbs'|'fictional-stage'|'historical-music-reference'
 firstPlayableVisual:'owner-authorized-existing'|'generic-stylized'|'not-an-avatar'
 facialLikeness:'owner-approved'|'requires-person-specific-review'|'not-applicable'
 music:'original-or-cleared-only'|'no-playback'
 stage:'pilot-passport'|'fictional-stage-ready'|'informational-reference'
}

export const STREETVERSE_CAST_PRODUCTION_ORDERS:readonly CreativeProductionOrder[]=[
 ...MEET_THE_STUBBS_FAMILY_FRIENDS.map(person=>({
  id:person.id,
  displayName:person.displayName,
  kind:'meet-the-stubbs' as const,
  firstPlayableVisual:person.id==='bj-stubbs'?'owner-authorized-existing' as const:'generic-stylized' as const,
  facialLikeness:person.id==='bj-stubbs'?'owner-approved' as const:'requires-person-specific-review' as const,
  music:'original-or-cleared-only' as const,
  stage:'pilot-passport' as const,
 })),
 ...STREETVERSE_CREATIVE_GENRE_PERFORMERS.map(person=>({
  id:person.id,
  displayName:person.displayName,
  kind:'fictional-stage' as const,
  firstPlayableVisual:'generic-stylized' as const,
  facialLikeness:'not-applicable' as const,
  music:'original-or-cleared-only' as const,
  stage:'fictional-stage-ready' as const,
 })),
 ...CHICAGO_MUSIC_LEGACY_ARTISTS.map(artist=>({
  id:'history-'+artist.id,
  displayName:artist.displayName,
  kind:'historical-music-reference' as const,
  firstPlayableVisual:'not-an-avatar' as const,
  facialLikeness:'requires-person-specific-review' as const,
  music:'no-playback' as const,
  stage:'informational-reference' as const,
 })),
]

export function getStreetVerseCastProductionSummary(){
 const orders=STREETVERSE_CAST_PRODUCTION_ORDERS
 return{
  total:orders.length,
  family:orders.filter(x=>x.kind==='meet-the-stubbs').length,
  originalGenreArtists:orders.filter(x=>x.kind==='fictional-stage').length,
  historicalArtistReferences:orders.filter(x=>x.kind==='historical-music-reference').length,
  approvedOwnedBJ:orders.filter(x=>x.facialLikeness==='owner-approved').length,
  externalArtistMusicAutomaticallyPlayable:0,
  live3DAssetVerifiedForEveryCharacter:false,
 }
}

export function getStreetVerseFictionalStageArtist(id:string){
 return STREETVERSE_CREATIVE_GENRE_PERFORMERS.find(x=>x.id===id)
}
