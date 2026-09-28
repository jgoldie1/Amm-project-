export type HoloMusicMode='concert'|'artist-pk'|'producer-battle'|'dj-battle'|'cypher'|'open-mic'|'dance-battle'|'listening-party'
export type HoloMusicVerse='MusicVerse'|'StreetVerse'|'StarVerse'|'HoloVerse'|'SportsVerse'|'FaithVerse'

export interface HoloMusicSession{
 id:string
 mode:HoloMusicMode
 originVerse:HoloMusicVerse
 stageId:string
 hostArtistId:string
 challengerArtistId?:string
 liveRoomId?:string
 trackIds:string[]
 status:'lobby'|'live'|'finished'
 startedAt:number
}

export const createHoloMusicSession=(input:Omit<HoloMusicSession,'id'|'status'|'startedAt'>):HoloMusicSession=>({
 ...input,
 id:`holo-music-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
 status:'lobby',
 startedAt:Date.now(),
})

export const HOLO_MUSIC_RULES={
 originalOrProperlyLicensedMusicOnly:true,
 artistRightsMetadataRequired:true,
 spectatorGiftsCannotAlterJudgedOutcome:true,
 rankedResultsRequireServerAuthority:true,
 valuableRewardsRequireServerValidation:true,
 replayCanFeedReelComposer:true,
 crossVerseStagesEnabled:true,
 liveBroadcastEnabled:true,
 pkArtistBattlesEnabled:true,
 faithVerseUsesNoncombatMusicShowcase:true,
 accessibilityCaptionsPlanned:true,
 lyricTranslationPlanned:true,
 moderationRequired:true,
 minorsNeedAgeAppropriateControls:true,
} as const

export const HOLO_MUSIC_STAGES=[
 {id:'street-cypher',verse:'StreetVerse',title:'StreetVerse Holo Cypher',modes:['cypher','open-mic','artist-pk'] as HoloMusicMode[]},
 {id:'musicverse-main',verse:'MusicVerse',title:'MusicVerse Main Stage',modes:['concert','producer-battle','dj-battle','listening-party'] as HoloMusicMode[]},
 {id:'starverse-showcase',verse:'StarVerse',title:'StarVerse Artist Showcase',modes:['concert','artist-pk','dance-battle'] as HoloMusicMode[]},
 {id:'holoverse-festival',verse:'HoloVerse',title:'HoloVerse Festival',modes:['concert','dj-battle','artist-pk','dance-battle'] as HoloMusicMode[]},
 {id:'sports-halftime',verse:'SportsVerse',title:'SportsVerse Halftime Stage',modes:['concert','dance-battle'] as HoloMusicMode[]},
 {id:'faith-music',verse:'FaithVerse',title:'FaithVerse Music & Praise Stage',modes:['concert','open-mic','listening-party'] as HoloMusicMode[]},
] as const

export const describeHoloMusicFlow=(s:HoloMusicSession)=>({
 entry:`${s.originVerse} → ${s.mode.toUpperCase()} → ${s.stageId}`,
 live:s.liveRoomId?`Broadcast through LIVE room ${s.liveRoomId}`:'LIVE room pending',
 finish:'Performance → rights-aware replay → Reel/clip → validated rewards → return to originating Verse',
})
