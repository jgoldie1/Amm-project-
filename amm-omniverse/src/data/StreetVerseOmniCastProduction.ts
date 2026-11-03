import {MEET_THE_STUBBS_FAMILY_FRIENDS} from '../game/characters/meetTheStubbsFamilyFriends'
import {CHICAGO_MUSIC_LEGACY_ARTISTS,chicagoMusicLegacyMissionId} from './ChicagoMusicLegacyMissionRegistry'
import {getAllFirstWaveGlobalCharacterCast} from './StreetVerseGlobalCharacterRegistry'
import {genericVisualSlotForCharacter} from './StreetVerseFamilyCharacterProduction'
import {STREETVERSE_ORIGINAL_MUSIC_PERFORMERS} from './StreetVerseOriginalMusicCast'

export type OmniCastLane='family'|'music-legacy'|'guest-reference'|'original-performer'|'global'
export type OmniCastVisualState='owner-v15-priority'|'generic-stand-in'|'original-fictional'|'historical-reference-only'
export type OmniCastRights='owner-approved'|'reference-check-required'|'fictional-original'
export interface OmniCastProductionEntry{
 id:string
 displayName:string
 lane:OmniCastLane
 characterKey:string
 visualState:OmniCastVisualState
 visualSlot:string
 likenessRights:OmniCastRights
 musicRights:'original-or-cleared-only'
 performanceStatus:'placeholder'|'story-mission-only'|'source-bound'
 playableStandIn:boolean
 familySafe:boolean
 missionIds:string[]
 genreTags:string[]
 rightsNote:string
}
const FAMILY=MEET_THE_STUBBS_FAMILY_FRIENDS.map(character=>({
 id:'family:'+character.id,
 displayName:character.displayName,
 lane:'family' as const,
 characterKey:character.id,
 visualState:(character.id==='bj-stubbs'?'owner-v15-priority':'generic-stand-in') as OmniCastVisualState,
 visualSlot:character.id==='bj-stubbs'?'bj-v15-owner-approved-with-owned-v3-backup':genericVisualSlotForCharacter(character.id),
 likenessRights:(character.id==='bj-stubbs'?'owner-approved':'reference-check-required') as OmniCastRights,
 musicRights:'original-or-cleared-only' as const,
 performanceStatus:(character.id==='bj-stubbs'?'source-bound':'placeholder') as OmniCastProductionEntry['performanceStatus'],
 playableStandIn:true,
 familySafe:true,
 missionIds:[] as string[],
 genreTags:[] as string[],
 rightsNote:character.id==='bj-stubbs'?'Owner approved their own photo likeness. Verify V15 GLB rendering on device.':'Named passport and neutral original avatar are not evidence of permission to reproduce a real person.',
}))
const MUSIC_HISTORY=CHICAGO_MUSIC_LEGACY_ARTISTS.map(artist=>({
 id:'music:'+artist.id,
 displayName:artist.displayName,
 lane:'music-legacy' as const,
 characterKey:artist.id,
 visualState:'historical-reference-only' as const,
 visualSlot:'none-public-figure',
 likenessRights:'reference-check-required' as const,
 musicRights:'original-or-cleared-only' as const,
 performanceStatus:'story-mission-only' as const,
 playableStandIn:false,
 familySafe:true,
 missionIds:[chicagoMusicLegacyMissionId(artist.id)],
 genreTags:[artist.missionLane==='SINGER'?'R&B':'Hip-Hop'],
 rightsNote:'Historical/editorial music mission; no cloned face, commercial endorsement, sampled vocals, or existing recording unless separately licensed.',
}))
const GLOBAL=getAllFirstWaveGlobalCharacterCast().map(character=>({
 id:'global:'+character.id,
 displayName:character.displayName,
 lane:'global' as const,
 characterKey:character.id,
 visualState:'original-fictional' as const,
 visualSlot:character.visualSlot,
 likenessRights:'fictional-original' as const,
 musicRights:'original-or-cleared-only' as const,
 performanceStatus:'placeholder' as const,
 playableStandIn:true,
 familySafe:true,
 missionIds:[] as string[],
 genreTags:[] as string[],
 rightsNote:'Original fictional city character; regional language and cultural details require production review.',
}))
export const STREETVERSE_MUSIC_GENRES=["Hip-Hop","Boom Bap","Drill","Trap","Chicago Rap","Conscious Rap","R&B","Neo-Soul","Soul","Funk","Jazz","Space Jazz","Gospel","Blues","House","Chicago House","Deep House","EDM","Techno","Disco","Amapiano","Afrobeats","Afrobeat","Highlife","Reggae","Dancehall","Soca","Calypso","Latin Pop","Reggaeton","Salsa","Bachata","Cumbia","Country","Country Rap","Rock","Pop","Classical","Orchestral","Ambient","Spoken Word","Experimental","Afrofuturist","Film Score","Worship","Lo-Fi","Trap Soul","Melodic Trap","Latin Trap","Chicago Footwork","Juke","Jersey Club","Baltimore Club","Tech House","Soulful House","Acid House","Gospel House","Afro House","UK Garage","Grime","Drum & Bass","Dubstep","Synthwave","Phonk","Punk","Metal","Indie","Folk","Bluegrass","Bossa Nova","Samba","Flamenco","Merengue","Zouk","K-Pop","J-Pop","Bhangra","Bollywood","Gqom","Cinematic Hip-Hop","Disco House","Electro Swing","Breakbeat","Hardstyle","Trap Gospel"] as const
export const STREETVERSE_ORIGINAL_PERFORMERS=[
 {id:"chicago-cypher-mc",name:"Chicago Cypher MC",genre:"Hip-Hop"},
 {id:"south-side-rnb-vocalist",name:"South Side R&B Vocalist",genre:"R&B"},
 {id:"windy-city-drill-producer",name:"Windy City Drill Producer",genre:"Drill"},
 {id:"house-dj-01",name:"House DJ",genre:"Chicago House"},
 {id:"gospel-choir-director",name:"Gospel Choir Director",genre:"Gospel"},
 {id:"blues-guitarist",name:"Blues Guitarist",genre:"Blues"},
 {id:"jazz-saxophonist",name:"Jazz Saxophonist",genre:"Jazz"},
 {id:"funk-bassist",name:"Funk Bassist",genre:"Funk"},
 {id:"afrobeats-vocalist",name:"Afrobeats Vocalist",genre:"Afrobeats"},
 {id:"amapiano-dj",name:"Amapiano DJ",genre:"Amapiano"},
 {id:"reggaeton-mc",name:"Reggaeton MC",genre:"Reggaeton"},
 {id:"country-soul-vocalist",name:"Country Soul Vocalist",genre:"Country"},
] as const
export const STREETVERSE_GUEST_REFERENCES=["Looze Cannon","Sun Ra","Marshall Allen","Tems","Mello Buckzz","Dream Doll","Alton Abraham","Michael Jackson"] as const
// All 46 genre lanes are available now, while 26 new, distinct, fictional
// performer concepts join the 12 established in-world prototype performers.
// Names are original creative-expression identities, not real-artist replicas.
const GENRE_ALIASES:Record<string,string>={
 'hip-hop':'Hip-Hop','drill':'Drill','trap':'Trap','conscious-rap':'Conscious Rap',
 'rnb':'R&B','neo-soul':'Neo-Soul','gospel':'Gospel','jazz':'Jazz',
 'blues':'Blues','house':'House','techno':'Techno','edm':'EDM','funk':'Funk',
 'afrobeats':'Afrobeats','amapiano':'Amapiano','reggae':'Reggae',
 'latin':'Latin Pop','country':'Country','rock':'Rock','alternative':'Indie',
 'pop':'Pop','classical':'Classical','spoken-word':'Spoken Word',
 'soul':'Soul','dancehall':'Dancehall','punk':'Punk',
}
export const STREETVERSE_FEATURED_ORIGINAL_PERFORMERS=STREETVERSE_ORIGINAL_MUSIC_PERFORMERS.map(artist=>({
 id:artist.id,name:artist.displayName,
 genre:GENRE_ALIASES[artist.genre]||artist.genre,
 creativeBrief:artist.creativeBrief,visualSlot:artist.visualSlot,
}))
const representedGenres=new Set<string>([
 ...STREETVERSE_ORIGINAL_PERFORMERS.map(artist=>artist.genre),
 ...STREETVERSE_FEATURED_ORIGINAL_PERFORMERS.map(artist=>artist.genre),
])
const extraOriginalGenres=STREETVERSE_MUSIC_GENRES
 .filter(genre=>!representedGenres.has(genre))
 .map((genre,index)=>({
   id:'original-genre-'+genre.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
   name:'Fictional '+genre+' Stage Creator '+String(index+1).padStart(2,'0'),
   genre,
 }))
export const STREETVERSE_ORIGINAL_GENRE_LINEUP=[
 ...STREETVERSE_ORIGINAL_PERFORMERS,
 ...STREETVERSE_FEATURED_ORIGINAL_PERFORMERS,
 ...extraOriginalGenres,
]
const ORIGINAL=STREETVERSE_ORIGINAL_GENRE_LINEUP.map(character=>({
 id:'original:'+character.id,
 displayName:character.name,
 lane:'original-performer' as const,
 characterKey:character.id,
 visualState:'original-fictional' as const,
 visualSlot:'stylized-creator-neutral',
 likenessRights:'fictional-original' as const,
 musicRights:'original-or-cleared-only' as const,
 performanceStatus:'placeholder' as const,
 playableStandIn:true,
 familySafe:true,
 missionIds:[] as string[],
 genreTags:[character.genre] as string[],
 rightsNote:'Completely fictional stage persona. Create original tracks, performances and art rather than copying a recognizable performer.',
}))
const GUESTS=STREETVERSE_GUEST_REFERENCES.map((name,index)=>({
 id:'guest:'+String(index+1).padStart(2,'0'),
 displayName:name,
 lane:'guest-reference' as const,
 characterKey:'guest-reference-'+String(index+1).padStart(2,'0'),
 visualState:'historical-reference-only' as const,
 visualSlot:'none-public-figure',
 likenessRights:'reference-check-required' as const,
 musicRights:'original-or-cleared-only' as const,
 performanceStatus:'story-mission-only' as const,
 playableStandIn:false,
 familySafe:true,
 missionIds:[] as string[],
 genreTags:[] as string[],
 rightsNote:'Artist/legacy research reference only. A stylized original fictional performer is permitted instead; no unlicensed identifiable look-alike.',
}))
export const STREETVERSE_OMNI_CAST:OmniCastProductionEntry[]=[...FAMILY,...MUSIC_HISTORY,...GLOBAL,...ORIGINAL,...GUESTS]
export const STREETVERSE_OMNI_CAST_POLICY={
 batchRegisterAll:true,
 realPeopleHaveNoAutomaticLikenessPermission:true,
 bjOwnerApproved:true,
 fictionalGenreInspiredCharactersPermitted:true,
 commercialArtistMusicMustBeCleared:true,
 allGenresAreProductionLanesNotLicensedAudio:true,
 avatarsStreamByDistrictRatherThanAllAtOnce:true,
 childAndTeenRolesFamilySafe:true,
 noGenericCharacterMayClaimPhotoMatch:true,
} as const
export function getStreetVerseOriginalGenrePerformer(genre:string){
 return STREETVERSE_ORIGINAL_GENRE_LINEUP.find(artist=>artist.genre===genre)
}
export function getStreetVerseOmniCastSummary(){
 const counts={family:0,'music-legacy':0,'guest-reference':0,'original-performer':0,global:0}
 for(const actor of STREETVERSE_OMNI_CAST)counts[actor.lane]++
 return {total:STREETVERSE_OMNI_CAST.length,genres:STREETVERSE_MUSIC_GENRES.length,counts,playableStandIns:STREETVERSE_OMNI_CAST.filter(actor=>actor.playableStandIn).length,rightsGated:STREETVERSE_OMNI_CAST.filter(actor=>actor.likenessRights==='reference-check-required').length}
}
