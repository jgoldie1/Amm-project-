/**
 * PK Living Worlds: local-first story rehearsal and cross-verse event contract.
 * This is deliberately NOT a server scoreboard, matchmaking service, wage offer,
 * platform OAuth connector or settlement ledger.
 */
export type PKWorld='streetverse'|'holoverse'|'musicverse'
export type PKChoice='performance'|'build'|'rescue'
export type PKChapter={
 chapter:number
 choice:PKChoice
 title:string
 consequence:string
}
export type PKStoryDraft={
 schema:'tryamm.pk-living-worlds.preview.v1'
 id:string
 status:'preview'
 world:PKWorld
 name:string
 teams:[string,string]
 chapters:PKChapter[]
 lastUpdated:string
}
export const PK_STORY_KEY='tryamm.pk-living-worlds.preview.v1'
export const PK_WORLDS=[
 {id:'streetverse',label:'StreetVerse City Clash',subtitle:'Chicago vs. Lagos • urban mission and creator showcase'},
 {id:'holoverse',label:'Holoverse Reality Shift',subtitle:'Holographic arena • story choices reshape the stage'},
 {id:'musicverse',label:'MusicVerse Creator Clash',subtitle:'Live music • performance and collaboration'},
] as const
export const PK_CHOICES=[
 {id:'performance',label:'Unlock a performance',description:'Both teams perform a short music, comedy or talent round.'},
 {id:'build',label:'Build the stage',description:'Teams collaborate or compete to design the next arena.'},
 {id:'rescue',label:'Community mission',description:'Teams solve a fictional nonviolent rescue or service challenge.'},
] as const
const consequences:Record<PKWorld,Record<PKChoice,{title:string;consequence:string}>>={
 streetverse:{
  performance:{title:'Chicago × Lagos Block Concert',consequence:'The next chapter features a community concert stage.'},
  build:{title:'Neighborhood Build-Off',consequence:'The next chapter focuses on designing an accessible city venue.'},
  rescue:{title:'Neighborhood Help Mission',consequence:'The next chapter follows a fictional community-support mission.'},
 },
 holoverse:{
  performance:{title:'Holographic Talent Portal',consequence:'The next chapter previews a spatial performance arena.'},
  build:{title:'Reality Shift Stage',consequence:'The next chapter previews a creator-built holographic set.'},
  rescue:{title:'Holo Guardian Mission',consequence:'The next chapter previews a nonviolent rescue story.'},
 },
 musicverse:{
  performance:{title:'64-Track Stage',consequence:'The next chapter previews a collaborative concert production.'},
  build:{title:'Music Studio Design-Off',consequence:'The next chapter previews construction of a digital production studio.'},
  rescue:{title:'Community Music Benefit',consequence:'The next chapter previews a volunteer-oriented creative event.'},
 },
}
const WORLD_IDS=PK_WORLDS.map(w=>w.id) as readonly string[]
export function createPKStoryDraft(world:PKWorld='streetverse'):PKStoryDraft{
 return {
  schema:'tryamm.pk-living-worlds.preview.v1',
  id:'pk-preview-'+(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)),
  status:'preview',world,name:'PK Living Worlds: '+PK_WORLDS.find(w=>w.id===world)?.label,
  teams:['Team Chicago','Team Lagos'],chapters:[],lastUpdated:new Date().toISOString(),
 }
}
export function choosePKStoryChapter(draft:PKStoryDraft,choice:PKChoice):PKStoryDraft{
 if(!PK_CHOICES.some(x=>x.id===choice))return draft
 if(draft.chapters.length>=3)return draft
 const next=consequences[draft.world][choice]
 return {...draft,chapters:[...draft.chapters,{chapter:draft.chapters.length+1,choice,title:next.title,consequence:next.consequence}],lastUpdated:new Date().toISOString()}
}
export function readPKStoryDraft():PKStoryDraft|null{
 if(typeof window==='undefined')return null
 try{
  const raw=window.localStorage.getItem(PK_STORY_KEY)
  if(!raw||raw.length>10000)return null
  const value=JSON.parse(raw) as Partial<PKStoryDraft>
  if(value.schema!=='tryamm.pk-living-worlds.preview.v1'||value.status!=='preview'||!WORLD_IDS.includes(String(value.world)))return null
  if(!Array.isArray(value.chapters)||value.chapters.length>3||value.chapters.some(x=>!PK_CHOICES.some(c=>c.id===x.choice)))return null
  return {schema:'tryamm.pk-living-worlds.preview.v1',id:String(value.id||'preview').slice(0,100),status:'preview',world:value.world as PKWorld,name:String(value.name||'PK Living Worlds').slice(0,160),
   teams:['Team Chicago','Team Lagos'],chapters:value.chapters.map((ch,i)=>({chapter:i+1,choice:ch.choice,title:consequences[value.world as PKWorld][ch.choice].title,consequence:consequences[value.world as PKWorld][ch.choice].consequence})),lastUpdated:String(value.lastUpdated||'')}
 }catch{return null}
}
export function writePKStoryDraft(draft:PKStoryDraft){
 if(typeof window==='undefined')return
 try{window.localStorage.setItem(PK_STORY_KEY,JSON.stringify(draft))}catch{}
 window.dispatchEvent(new CustomEvent('tryamm:pk-story-preview-state',{detail:draft}))
}
/** Suggested production work only. Never posts a job or creates payable earnings. */
export function pkMiddleverseProductionBrief(draft:PKStoryDraft){
 return{
  schema:'tryamm.middleverse.pk-production-brief.v1',
  id:'brief:'+draft.id,storyId:draft.id,title:draft.chapters.at(-1)?.title||draft.name,
  world:draft.world,source:'pk-living-worlds',status:'DRAFT' as const,
  roles:[
   {lane:'creator',task:'Script, direct and edit a short-form highlight',skills:['editing','reels','publishing']},
   {lane:'moderator',task:'Moderate the creator challenge',skills:['moderation','community-safety']},
   {lane:'trainer',task:'Provide accessible captions and optional translation review',skills:['accessibility','training']},
  ],
  verifiedWork:false,customerFunded:false,payable:false,requiresCreatorConsent:true,
 }
}
/** Visual effect request only. No authoritative StreetVerse scene mutation. */
export function pkHoloverseScenePreview(draft:PKStoryDraft){
 return {schema:'tryamm.holoverse.pk-stage-preview.v1',storyId:draft.id,world:draft.world,
  title:draft.chapters.at(-1)?.title||draft.name,scene: draft.chapters.at(-1)?.choice||'opening',
  source:'pk-living-worlds',previewOnly:true,rightsReviewRequired:true,worldMutationAuthorized:false}
}
