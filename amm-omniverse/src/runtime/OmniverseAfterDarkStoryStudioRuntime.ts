import {AFTER_DARK_RP_POLICY,AFTER_DARK_SCENE_TEMPLATES,classifyAfterDarkIntent} from '../data/OmniverseAfterDarkRP'
import {createEventDNA,compileEvent} from './HoloEventGenesisEngine'

export type AfterDarkStoryRequest={
 prompt:string;ageVerified:boolean;consentAccepted:boolean;privateSession?:boolean;
 participants?:string[];createReel?:boolean;createTvEpisode?:boolean;cityId?:string
}
export type AfterDarkStoryDraft={
 id:string;rating:'18+ MATURE / NON-EXPLICIT';prompt:string;intents:string[];templateId:string;
 safeguards:typeof AFTER_DARK_RP_POLICY;sceneBeats:string[];cameraPlan:string[];audioPlan:string[];
 reel?:{title:string;durationTargetSec:number;cutPlan:string[]};
 tvEpisode?:{seriesLane:'Omniverse After Dark';episodeTitle:string;targetMinutes:number;acts:string[][];cliffhanger:string};
}

function choreographyFor(intents:string[]){
 const actions:string[]=[]
 if(intents.includes('nightlife')||intents.includes('couple-dance'))actions.push('street-dance')
 if(intents.includes('embrace')||intents.includes('reconcile'))actions.push('hug')
 if(intents.includes('relationship-drama'))actions.push('argue')
 if(intents.includes('kiss'))actions.push('after-dark-kiss')
 if(intents.includes('flirt')||intents.includes('attraction'))actions.push('after-dark-flirt')
 if(!actions.length)actions.push('creator-pose')
 return actions
}
const STORAGE='tryamm.omniverse.after-dark.story-memory.v1'
let installed=false
function remember(draft:AfterDarkStoryDraft){try{const old=JSON.parse(localStorage.getItem(STORAGE)||'[]');localStorage.setItem(STORAGE,JSON.stringify([...(Array.isArray(old)?old:[]),draft].slice(-100)))}catch{}}
export function compileAfterDarkStory(request:AfterDarkStoryRequest):AfterDarkStoryDraft{
 if(!request.ageVerified)throw new Error('after-dark-age-assurance-required')
 if(!request.consentAccepted)throw new Error('after-dark-consent-required')
 const intents=classifyAfterDarkIntent(request.prompt)
 const template=AFTER_DARK_SCENE_TEMPLATES.find(t=>t.intents.some(i=>intents.includes(i)))||AFTER_DARK_SCENE_TEMPLATES[5]
 const base={
  id:'ad-story-'+Date.now(),rating:'18+ MATURE / NON-EXPLICIT' as const,prompt:request.prompt,intents,templateId:template.id,
  safeguards:AFTER_DARK_RP_POLICY,sceneBeats:[...template.beats],
  cameraPlan:['establishing shot','two-shot or group framing','reaction close-up','movement/coverage shot','fade-to-black on sexual intimacy','aftermath/next-scene coverage'],
  audioPlan:['licensed/original music only','nightlife/city ambience as appropriate','dialogue priority','non-graphic mature ambience only'],
 }
 const reel=request.createReel?{title:'After Dark • '+template.label,durationTargetSec:60,cutPlan:['hook','character beat','chemistry/conflict','reaction','fade/transition','tag']} : undefined
 const tvEpisode=request.createTvEpisode?{seriesLane:'Omniverse After Dark' as const,episodeTitle:template.label+' • '+new Date().toLocaleDateString(),targetMinutes:24,acts:[template.beats.slice(0,2),template.beats.slice(2,4),template.beats.slice(4)],cliffhanger:'End on a character choice, reveal, relationship turn, or next-episode hook.'}:undefined
 return{...base,reel,tvEpisode}
}
export function installOmniverseAfterDarkStoryStudioRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true
 const onRequest=(event:Event)=>{
  const req=(event as CustomEvent<AfterDarkStoryRequest>).detail
  if(!req?.prompt)return
  try{
   const draft=compileAfterDarkStory(req);remember(draft)
   const choreography=choreographyFor(draft.intents)
   choreography.forEach((actionId,index)=>{
    setTimeout(()=>{
     if(actionId==='after-dark-kiss'||actionId==='after-dark-flirt'){
      window.dispatchEvent(new CustomEvent('tryamm:mind-over-matter-original-request',{detail:{targetId:'after-dark-'+actionId,targetLabel:'Omniverse After Dark '+actionId,kind:'animation',reason:'manual-original-request',functionalRequirements:[{id:'adult-safe',label:'Mature but non-explicit consenting adult choreography',value:true,source:'gameplay-requirement'}]}}))
     }else{
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-rp-action-play',{detail:{actionId,label:actionId,loop:false,source:'omniverse-after-dark-story'}}))
     }
    },index*1100)
   })
   const dna=createEventDNA({worldId:'omniverse-after-dark',timelineId:'after-dark-story',branchId:draft.templateId,occurredAt:new Date().toISOString(),title:draft.tvEpisode?.episodeTitle||draft.reel?.title||'After Dark RP Scene',summary:draft.prompt,actors:req.participants||['local-player'],entities:[],decisions:['adult-lane-selected','age-assured','consent-accepted','mature-non-explicit-story'],consequences:[],tags:['after-dark','mature-non-explicit',...draft.intents],source:'SIMULATION',gate:{rights:'REVIEW',safety:'CLEAR',age:'ADULT',provenance:'PARTIAL',money:'VIRTUAL_ONLY'}})
   const outputs=compileEvent(dna,['GAME','LIVE','REEL','CREATOR_JOB'])
   if(req.privateSession)window.dispatchEvent(new CustomEvent('tryamm:after-dark-private-intimacy-audio',{detail:{ageVerified:true,privateSession:true,consented:true}}))
   window.dispatchEvent(new CustomEvent('tryamm:after-dark-gif-search-request',{detail:{query:draft.prompt,providerGated:true,contentMode:'mature-non-explicit',explicitPornography:false,source:'after-dark-story-studio'}}))
   if(draft.reel)window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'after-dark-story-studio',draft,eventId:dna.eventId,rating:draft.rating}}))
   if(draft.tvEpisode)window.dispatchEvent(new CustomEvent('tryamm:after-dark-tv-episode-draft',{detail:{draft,eventId:dna.eventId,outputs}}))
   window.dispatchEvent(new CustomEvent('tryamm:after-dark-story-draft',{detail:{draft,eventId:dna.eventId,outputs}}))
  }catch(error){window.dispatchEvent(new CustomEvent('tryamm:after-dark-story-blocked',{detail:{error:error instanceof Error?error.message:String(error)}}))}
 }
 addEventListener('tryamm:after-dark-story-request',onRequest)
 window.dispatchEvent(new CustomEvent('tryamm:after-dark-story-studio-ready',{detail:{separateLane:true,matureNonExplicit:true,reels:true,tvEpisodes:true,fadeToBlack:true}}))
 return()=>{removeEventListener('tryamm:after-dark-story-request',onRequest);installed=false}
}