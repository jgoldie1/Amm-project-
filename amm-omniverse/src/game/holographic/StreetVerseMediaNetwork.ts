export type StreetVerseMediaScope='local'|'city'|'national'|'global'
export type StreetVerseMediaSurface='radio'|'tv'|'news'|'weather'|'reels'|'holo-live'|'vehicle-radio'|'business-audio'|'public-screen'

export interface StreetVerseMediaStation{
 id:string; name:string; scope:StreetVerseMediaScope; surfaces:StreetVerseMediaSurface[]
 live:boolean; replay:boolean; locationAware:boolean
}

export const STREETVERSE_MEDIA_NETWORK:StreetVerseMediaStation[]=[
 {id:'sv-radio-local',name:'StreetVerse Radio',scope:'local',surfaces:['radio','vehicle-radio','business-audio','holo-live'],live:true,replay:true,locationAware:true},
 {id:'sv-global',name:'StreetVerse Global',scope:'global',surfaces:['tv','news','weather','reels','holo-live','public-screen'],live:true,replay:true,locationAware:true},
]

export const STREETVERSE_MEDIA_BRIDGE={
 broadcastSources:['TRYAMM Local News','TRYAMM National News','TRYAMM Global News','TRYAMM Entertainment News','All American Network','Isaiah AI TV','MusicVerse','SportsVerse'],
 radioFormats:['local news','weather','traffic','music','creator shows','business spotlights','community alerts','sports updates','live event simulcast'],
 globalFormats:['world news','global weather','city-to-city live','culture','music','business','sports','creator showcases','travel'],
 distribution:['StreetVerse city world','vehicles','businesses','Holo FON','TRYAMM TV','Holo LIVE','Replay','Reels'],
} as const

export interface StreetVerseAdContext{
 scope:StreetVerseMediaScope
 city?:string
 surface:StreetVerseMediaSurface
 channelId:string
 programId?:string
}

export const STREETVERSE_MEDIA_RULES={
 locationContextMaySelectRelevantProgramming:true,
 preciseLocationNotRequiredForAdvertising:true,
 adsMustBeDisclosed:true,
 editorialNewsCannotBeBought:true,
 emergencyOrCommunityAlertsCannotBePaywalled:true,
 musicAndMediaRightsRequired:true,
 minorsRequireAgeAppropriateAds:true,
 impressionAndPaymentEventsServerVerified:true,
 audienceDataMinimized:true,
} as const
