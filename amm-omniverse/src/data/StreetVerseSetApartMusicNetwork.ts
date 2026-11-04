/**
 * Set Apart Music Network — original faith-inspired music inside MusicVerse.
 * Preserves Mythos Blender, 64-track arrangement and FaithVerse/House of HaMashiach routes.
 * Named original performers are fictional stage identities, NOT celebrity likeness/voice clones.
 * The album record below is a production brief, not evidence that audio files are mastered.
 */
export type SetApartLane='RAPPER'|'SINGER'|'MUSIC LEGACY'
export type SetApartPerformer={id:string;name:string;genre:string;lane:SetApartLane;fictional:true;rights:'original-or-cleared-only';visualState:'procedural-preview'}
export const SET_APART_MUSIC_GENRES=["Christian Rap","Gospel Rap","Set Apart Hip-Hop","Christian Boom Bap","Christian Drill","Kingdom Trap","Worship Trap","Testimony Trap","Worship House","Kingdom House","Praise Dance","Hebrew Worship","Messianic Worship","Psalms & Spoken Word","Set Apart Soul","Gospel R&B","Scripture Lo-Fi","Set Apart Jazz","Set Apart Reggae","Worship Choir","Cinematic Worship"] as const

export const SET_APART_ORIGINAL_PERFORMERS:readonly SetApartPerformer[]=[
 {id:"set-apart-christian-rap",name:"Kingdom Cipher",genre:"Christian Rap",lane:"RAPPER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-gospel-rap",name:"Testimony Flow",genre:"Gospel Rap",lane:"RAPPER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-set-apart-hip-hop",name:"Covenant Verse",genre:"Set Apart Hip-Hop",lane:"RAPPER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-christian-boom-bap",name:"Psalm Lines",genre:"Christian Boom Bap",lane:"RAPPER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-christian-drill",name:"Purpose North",genre:"Christian Drill",lane:"RAPPER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-kingdom-trap",name:"Faith Pulse",genre:"Kingdom Trap",lane:"RAPPER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-worship-trap",name:"Praise Circuit",genre:"Worship Trap",lane:"RAPPER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-testimony-trap",name:"Grace Echo",genre:"Testimony Trap",lane:"RAPPER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-worship-house",name:"DJ Selah",genre:"Worship House",lane:"MUSIC LEGACY",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-kingdom-house",name:"House of Light DJ",genre:"Kingdom House",lane:"MUSIC LEGACY",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-praise-dance",name:"Joy Frequency",genre:"Praise Dance",lane:"MUSIC LEGACY",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-hebrew-worship",name:"Oriah Song",genre:"Hebrew Worship",lane:"SINGER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-messianic-worship",name:"Living Word Choir",genre:"Messianic Worship",lane:"SINGER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-psalms-spoken-word",name:"Psalm Keeper",genre:"Psalms & Spoken Word",lane:"RAPPER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-set-apart-soul",name:"Miriam Soul",genre:"Set Apart Soul",lane:"SINGER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-gospel-r-b",name:"Hope Harmonies",genre:"Gospel R&B",lane:"SINGER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-scripture-lo-fi",name:"Quiet Scroll",genre:"Scripture Lo-Fi",lane:"MUSIC LEGACY",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-set-apart-jazz",name:"New Jerusalem Quartet",genre:"Set Apart Jazz",lane:"MUSIC LEGACY",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-set-apart-reggae",name:"River Praise",genre:"Set Apart Reggae",lane:"SINGER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-worship-choir",name:"House of Praise Choir",genre:"Worship Choir",lane:"SINGER",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
 {id:"set-apart-cinematic-worship",name:"The I AM Ensemble",genre:"Cinematic Worship",lane:"MUSIC LEGACY",fictional:true,rights:'original-or-cleared-only',visualState:'procedural-preview'},
] as const

export const MYTHOS_BLENDER_GENRE_PROFILES=['Gospel','Hip-Hop','Cinematic','Trap','Worship','R&B','Jazz','Classical'] as const
export const MYTHOS_SIGNATURE_BLENDS=['Kingdom Anthem','Street Testimony','Praise Wave','Legacy Record','Faith & Fire','Wisdom Session'] as const
export const SET_APART_64_TRACK_WORKFLOW={
 workstation:'64-Track Studio / Ableton programming',
 stages:['select musical key and tempo','write original lyrics and composition','specify chord progressions and slash-chord inversions','assign bass, guitar, horns, drums and 808 tracks','build verses, choruses, bridges and arrangement','record/produce the original track','mix and master','verify contributor and sample rights','export accessible captioned performance/Reel'],
 trackCapacity:64,
 arrangementFields:['keySignature','tempoBpm','chordSymbols','inversionsAndSlashChords','bass','guitar','horns','drums','808','structure','trackRouting','automation','effects','mixNotes','masterNotes'],
 verifiedAudioExports:false,
} as const
export const YAHUEAH_HA_MASCHIAH_ALBUM_BRIEF={
 title:'Yahueah Ha Maschia: The I AM',
 plannedSongs:18,
 knownTracks:[{title:'Before the Beginning',position:'opening'},{title:'THE I AM',position:'finale'}],
 recurringMotif:'Original four-note I AM motif',
 otherTrackNames:'pending source verification',
 audioFilesRecovered:false,
 rights:'Original compositions or cleared works only',
} as const
export const SET_APART_WORLD_CONNECTIONS={
 worlds:['MusicVerse','FaithVerse','House of HaMashiach','64-Track Studio','StarVerse','StreetVerse'],
 experiences:['original rap performance','choir rehearsal','original worship songwriting','music literacy','scripture study with original interpretation','virtual concert','Reel capture','optional LIVE handoff'],
 playerMaySkipReligion:true,
 minorsFamilySafe:true,
} as const
export function isSetApartGenre(genre:string){return (SET_APART_MUSIC_GENRES as readonly string[]).includes(genre)}
export function getSetApartOriginalPerformer(genre:string){return SET_APART_ORIGINAL_PERFORMERS.find(x=>x.genre===genre)}
export function setApartMissionSteps(genre:string,performerName:string){return [
 {speaker:'Aniyah 64-Track Studio',text:`${performerName} is making an original ${genre} session. Pick a key, tempo, chord voicings and a fresh composition.`,objective:'Visit the 64-Track Studio',x:-42,z:-30},
 {speaker:performerName,text:'Build original lyrics, chords and a full 64-track arrangement. Perform a new testimony, praise or creative message in your own voice.',objective:'Create an original set-apart performance',x:10,z:-18},
 {speaker:'FaithVerse Music Coordinator',text:'Review contributor permission, original master ownership, accessibility captions and any scripture quotation/source rights.',objective:'Complete faith music credits and rights review',x:20,z:28},
 {speaker:'MusicVerse Stage Host',text:'Finish the performance and capture a new StreetVerse Reel. FaithVerse/House of HaMashiach is an optional onward destination.',objective:'Perform at the original MusicVerse stage',x:38,z:38},
]}
export const SET_APART_MUSIC_POLICY={
 noUnlicensedMusic:true,noCelebrityFaceOrVoiceImpersonation:true,
 respectBeliefAndOptionalParticipation:true,
 originalOrClearedLyricsAndMasters:true,
 noClaimOfFinishedAlbumAudio:true,
 explicitUserOwnerAuthorizationForBJ:true,
} as const
