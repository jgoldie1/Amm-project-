import type{TryammVerse,VersePassport}from'./ConnectedVersePassportRuntime'
export interface WorldCell{id:string;verse:TryammVerse;x:number;z:number;radius:number;lod:0|1|2;interiors:string[];missionIds:string[];portalIds:string[]}
export interface StreamDecision{load:string[];keep:string[];unload:string[];activeInteriors:string[];npcBudget:number;vehicleBudget:number}
export const CHICAGO_STREAM_CELLS:WorldCell[]=[
 {id:'circle-park',verse:'streetverse',x:-42,z:55,radius:72,lod:0,interiors:['circle-park-home','community-room'],missionIds:['iphone-first-journey'],portalIds:['holo-to-street','street-to-faith']},
 {id:'roosevelt',verse:'streetverse',x:0,z:18,radius:76,lod:0,interiors:['roosevelt-shop','clinic'],missionIds:['roosevelt-checkpoint'],portalIds:[]},
 {id:'taylor',verse:'streetverse',x:38,z:-18,radius:82,lod:1,interiors:['taylor-cafe','64-track-annex'],missionIds:['taylor-checkpoint'],portalIds:[]},
 {id:'pilsen',verse:'streetverse',x:74,z:-58,radius:88,lod:1,interiors:['pilsen-market','pilsen-arts'],missionIds:['pilsen-checkpoint'],portalIds:[]},
]
export const planWorldStreaming=(cells:WorldCell[],x:number,z:number,loaded:string[]=[],mobile=true):StreamDecision=>{
 const ranked=cells.map(c=>({c,d:Math.hypot(c.x-x,c.z-z)})).sort((a,b)=>a.d-b.d),near=ranked.filter(v=>v.d<=v.c.radius*1.25).map(v=>v.c.id),prefetch=ranked.filter(v=>v.d<=v.c.radius*2.1).slice(0,mobile?3:5).map(v=>v.c.id),keep=[...new Set([...near,...prefetch])],unload=loaded.filter(id=>!keep.includes(id)),activeInteriors=ranked.filter(v=>v.d<22).flatMap(v=>v.c.interiors)
 return{load:keep.filter(id=>!loaded.includes(id)),keep,unload,activeInteriors,npcBudget:mobile?28:80,vehicleBudget:mobile?20:60}
}
export const streamingPassportHint=(passport:VersePassport)=>({verse:passport.currentVerse,partySize:passport.party.length,oneHand:passport.accessibility.oneHandMode,reducedMotion:passport.accessibility.reducedMotion})
