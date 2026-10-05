import {searchStreetVerseRPActions} from '../data/streetVerseRPActionCatalog'
import {createEventDNA,compileEvent} from './HoloEventGenesisEngine'

type WishMode='emoji'|'text'|'sound'|'scene'
export type RPGeniiWish={query:string;mode?:WishMode;emoji?:string;targetId?:string;worldId?:string;loop?:boolean}
type SoundChoice={key:string;tags:string[]}

const SOUNDS:SoundChoice[]=[
 {key:'applause',tags:['applause','clap','cheer','celebrate','👏','🙌']},
 {key:'crowd_roar',tags:['crowd','roar','stadium','victory','win','🏆']},
 {key:'boo',tags:['boo','crowd boo','disapprove','👎']},
 {key:'church_bell',tags:['church','bell','faith','pray','prayer','🙏']},
 {key:'blessing',tags:['blessing','faith','prayer','🙏']},
 {key:'choir_hit',tags:['choir','church','gospel']},
 {key:'mic_check',tags:['mic','microphone','rap','sing','perform','🎤']},
 {key:'beat_drop',tags:['beat','music','drop','dance','party','💃','🕺']},
 {key:'vinyl_scratch',tags:['dj','scratch','turntable']},
 {key:'whistle',tags:['whistle','referee','sport']},
 {key:'score',tags:['score','basketball','touchdown','goal','🏀','🏈','⚽']},
 {key:'notification',tags:['notification','ding','alert']},
 {key:'success',tags:['success','complete','done','win']},
 {key:'error',tags:['error','fail','wrong']},
 {key:'door_open',tags:['door','open','enter']},
 {key:'engine_start',tags:['engine','car start','vehicle','🚗']},
 {key:'engine_rev',tags:['rev','engine rev','race','car']},
 {key:'tire_screech',tags:['tire','screech','drift','brake']},
 {key:'rain',tags:['rain','storm','weather','🌧️']},
 {key:'wind',tags:['wind','weather']},
 {key:'city_ambient',tags:['city','street','ambient']},
 {key:'crowd_ambient',tags:['crowd','people','party','ambient']},
 {key:'police_siren',tags:['police','siren','🚓']},
 {key:'ambulance_siren',tags:['ambulance','ems','medical','🚑']},
 {key:'firetruck_siren',tags:['firetruck','fire truck','firefighter','🚒']},
 {key:'radio_chirp',tags:['radio','dispatch','walkie talkie']},
]

const STORAGE='tryamm.googolplex.rp-genii.v1'
let installed=false
const normalize=(s:string)=>s.toLowerCase().trim().replace(/\s+/g,' ')
function soundMatches(query:string){
 const q=normalize(query)
 return SOUNDS.filter(s=>s.tags.some(t=>q.includes(normalize(t))||normalize(t).includes(q))).slice(0,4)
}
function inferredKinds(q:string){
 const kinds=new Set<'animation'|'audio'|'prop'|'character'|'mission-object'|'ui'>()
 if(/dance|walk|run|wave|hug|pray|pose|gesture|action|move|fight|sit|stand|animation/i.test(q))kinds.add('animation')
 if(/sound|sfx|audio|noise|music|bell|siren|applause|crowd|rain|wind|voice/i.test(q))kinds.add('audio')
 if(/chair|ball|mic|microphone|phone|tool|wrench|prop|object|table|cup/i.test(q))kinds.add('prop')
 if(/character|person|npc|bj|player|human/i.test(q))kinds.add('character')
 if(/mission|job|task|objective/i.test(q))kinds.add('mission-object')
 if(/bar|menu|hud|button|ui/i.test(q))kinds.add('ui')
 if(!kinds.size){kinds.add('animation');kinds.add('audio')}
 return [...kinds]
}
function remember(receipt:unknown){
 try{
  const old=JSON.parse(localStorage.getItem(STORAGE)||'[]')
  const list=Array.isArray(old)?old:[]
  localStorage.setItem(STORAGE,JSON.stringify([...list,receipt].slice(-100)))
 }catch{}
}
export function compileRPGeniiWish(wish:RPGeniiWish){
 const query=[wish.emoji||'',wish.query||''].filter(Boolean).join(' ').trim()
 const actions=searchStreetVerseRPActions(query).slice(0,5)
 const sounds=soundMatches(query)
 const missingKinds=inferredKinds(query).filter(kind=>{
  if(kind==='animation'&&actions.length)return false
  if(kind==='audio'&&sounds.length)return false
  return true
 })
 return{query,actions,sounds,missingKinds}
}
export function installStreetVerseAbracadabraGeniiRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true
 const onWish=(event:Event)=>{
  const wish=(event as CustomEvent<RPGeniiWish>).detail||{query:''}
  const plan=compileRPGeniiWish(wish)
  const primary=plan.actions[0]
  if(primary)window.dispatchEvent(new CustomEvent('tryamm:streetverse-rp-action-play',{detail:{actionId:primary.id,label:primary.label,animationClip:primary.animationClip,gifQuery:primary.gifQuery,loop:Boolean(wish.loop&&primary.loopable),durationMs:primary.durationMs,source:'abracadabra-genii'}}))
  for(const sound of plan.sounds)window.dispatchEvent(new CustomEvent('tryamm:streetverse-sound-preview',{detail:{key:sound.key,source:'abracadabra-genii'}}))
  for(const kind of plan.missingKinds){
   window.dispatchEvent(new CustomEvent('tryamm:mind-over-matter-original-request',{detail:{
    targetId:'rp-genii-'+Date.now()+'-'+kind,targetLabel:'RP Genii: '+plan.query,kind,reason:'manual-original-request',
    functionalRequirements:[{id:'rp-intent',label:'Preserve RP intent',value:plan.query,source:'gameplay-requirement'}]
   }}))
   const holoKind=kind==='animation'?'character':kind==='mission-object'?'mission':kind
   window.dispatchEvent(new CustomEvent('tryamm:holoforge-request',{detail:{kind:holoKind,prompt:plan.query,tags:['rp','abracadabra-genii',kind],priority:'normal'}}))
  }
  const eventDNA=createEventDNA({
   worldId:wish.worldId||'streetverse',timelineId:'rp-live',branchId:'player-intent',occurredAt:new Date().toISOString(),
   title:'RP Genii • '+plan.query.slice(0,70),summary:plan.query,actors:[wish.targetId||'local-player'],entities:[],decisions:['player-authored-rp-intent'],
   consequences:[],tags:['rp','abracadabra-genii',wish.mode||'text'],source:'SIMULATION',
   gate:{rights:plan.missingKinds.length?'REVIEW':'CLEAR',safety:'CLEAR',age:'GENERAL',provenance:plan.missingKinds.length?'PARTIAL':'VERIFIED',money:'VIRTUAL_ONLY'}
  })
  const outputs=compileEvent(eventDNA,['GAME','MISSION','LIVE','REEL','CREATOR_JOB'])
  const receipt={id:'rpwish-'+Date.now(),createdAt:new Date().toISOString(),wish,plan:{query:plan.query,actionIds:plan.actions.map(a=>a.id),soundKeys:plan.sounds.map(s=>s.key),missingKinds:plan.missingKinds},eventId:eventDNA.eventId,outputs}
  remember(receipt)
  window.dispatchEvent(new CustomEvent('tryamm:rp-genii-result',{detail:receipt}))
 }
 addEventListener('tryamm:rp-genii-request',onWish)
 window.dispatchEvent(new CustomEvent('tryamm:rp-genii-ready',{detail:{emoji:true,text:true,sound:true,scene:true,mindOverMatter:true,holoForge:true,eventGenesis:true,googolplexMemory:true}}))
 return()=>{removeEventListener('tryamm:rp-genii-request',onWish);installed=false}
}