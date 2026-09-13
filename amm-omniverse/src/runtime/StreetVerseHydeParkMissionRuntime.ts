export const HYDE_PARK_AREA_NUMBER='41'
export const HYDE_PARK_MISSION_ID='district-01-mobile-safe'
export const HYDE_PARK_CHECKPOINTS=['studio','market','river','stage'] as const

type Checkpoint=typeof HYDE_PARK_CHECKPOINTS[number]
type MissionState={active:boolean;visited:Checkpoint[];completed:boolean;rewardClaimed:boolean}

const SAVE_KEY='tryamm.streetverse.hyde-park.mission.v1'
const TOKEN_KEYS=['tryamm_token','token']

function load():MissionState{
 try{return {...{active:false,visited:[],completed:false,rewardClaimed:false},...JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}}catch{return {active:false,visited:[],completed:false,rewardClaimed:false}}
}
function save(state:MissionState){localStorage.setItem(SAVE_KEY,JSON.stringify(state))}
function token(){for(const key of TOKEN_KEYS){const value=localStorage.getItem(key);if(value)return value}return ''}
function emit(name:string,detail:Record<string,unknown>={}){window.dispatchEvent(new CustomEvent(name,{detail:{...detail,communityAreaNumber:HYDE_PARK_AREA_NUMBER,communityArea:'Hyde Park'}}))}

export function installStreetVerseHydeParkMissionRuntime(){
 if(typeof window==='undefined')return()=>{}
 let state=load()
 const onSlice=(event:Event)=>{
  const detail=(event as CustomEvent).detail||{}
  if(String(detail.communityAreaNumber)!==HYDE_PARK_AREA_NUMBER)return
  state={...state,active:true}
  save(state)
  emit('tryamm:hyde-park-mission-ready',{missionId:HYDE_PARK_MISSION_ID,checkpoints:HYDE_PARK_CHECKPOINTS,status:state.completed?'COMPLETED':'BUILDING'})
 }
 const onCheckpoint=(event:Event)=>{
  if(!state.active||state.completed)return
  const checkpoint=String((event as CustomEvent).detail?.checkpoint||'') as Checkpoint
  if(!HYDE_PARK_CHECKPOINTS.includes(checkpoint)||state.visited.includes(checkpoint))return
  state={...state,visited:[...state.visited,checkpoint]}
  state.completed=HYDE_PARK_CHECKPOINTS.every(id=>state.visited.includes(id))
  save(state)
  emit('tryamm:hyde-park-mission-progress',{missionId:HYDE_PARK_MISSION_ID,checkpoint,visited:state.visited,progress:Math.round(state.visited.length/HYDE_PARK_CHECKPOINTS.length*100),completed:state.completed})
  if(state.completed)emit('tryamm:hyde-park-mission-complete',{missionId:HYDE_PARK_MISSION_ID,visited:state.visited,reward:{xp:200,holoCredits:500,cashCents:0},requiresServerClaim:true,reelHandoff:true})
 }
 const onClaim=async()=>{
  if(!state.completed||state.rewardClaimed)return
  const auth=token()
  if(!auth){emit('tryamm:hyde-park-reward-status',{ok:false,code:'SIGN_IN_REQUIRED'});return}
  try{
   const complete=await fetch('/api/get-paid-to-play/streetverse/complete',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth}`},body:JSON.stringify({missionId:HYDE_PARK_MISSION_ID,source:'streetverse-mobile-safe',visited:state.visited,total:HYDE_PARK_CHECKPOINTS.length,mobileSafeMode:false,htmlCity:false})})
   const completion=await complete.json()
   if(!complete.ok)throw new Error(completion.code||completion.error||'MISSION_COMPLETION_FAILED')
   const claim=await fetch('/api/get-paid-to-play/claim',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth}`},body:JSON.stringify({programId:'streetverse_first_drop',evidence:{missionRunId:completion.missionRun?.id||completion.run?.id||completion.id}})})
   const reward=await claim.json()
   if(!claim.ok)throw new Error(reward.code||reward.error||'REWARD_CLAIM_FAILED')
   state={...state,rewardClaimed:true};save(state)
   emit('tryamm:hyde-park-reward-status',{ok:true,reward,cashAwarded:false})
   emit('tryamm:streetverse-reel-handoff',{source:'hyde-park-first-drop',missionId:HYDE_PARK_MISSION_ID,communityAreaNumber:HYDE_PARK_AREA_NUMBER})
  }catch(error){emit('tryamm:hyde-park-reward-status',{ok:false,code:error instanceof Error?error.message:'REWARD_FAILED'})}
 }
 window.addEventListener('tryamm:streetverse-community-slice-ready',onSlice)
 window.addEventListener('tryamm:hyde-park-checkpoint',onCheckpoint)
 window.addEventListener('tryamm:hyde-park-claim-reward',onClaim)
 return()=>{window.removeEventListener('tryamm:streetverse-community-slice-ready',onSlice);window.removeEventListener('tryamm:hyde-park-checkpoint',onCheckpoint);window.removeEventListener('tryamm:hyde-park-claim-reward',onClaim)}
}
