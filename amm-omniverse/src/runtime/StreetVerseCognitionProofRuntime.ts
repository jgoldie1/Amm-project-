type ProofStage='sense'|'decide'|'reserve'|'move'|'remember'

export type StreetVerseCognitionProofState=Readonly<{
 active:boolean
 status:'idle'|'running'|'passed'|'failed'
 npcId:string|null
 action:string|null
 nodeId:string|null
 nodeLabel:string|null
 startedAt:number|null
 completedAt:number|null
 stages:Readonly<Record<ProofStage,boolean>>
 receiptId:string|null
 message:string
 authority:'RUNTIME_EVIDENCE'
}>

const RECEIPT_KEY='tryamm:streetverse-cognition-proof:v1'
const emptyStages=():Record<ProofStage,boolean>=>({sense:false,decide:false,reserve:false,move:false,remember:false})
const clean=(value:unknown,max=96)=>String(value??'').replace(/[^a-zA-Z0-9:_ -]/g,'').slice(0,max)

export function installStreetVerseCognitionProofRuntime(){
 if(typeof window==='undefined')return{dispose:()=>{},getState:()=>null as StreetVerseCognitionProofState|null}

 let timer=0
 let state:StreetVerseCognitionProofState={
  active:false,status:'idle',npcId:null,action:null,nodeId:null,nodeLabel:null,
  startedAt:null,completedAt:null,stages:emptyStages(),receiptId:null,
  message:'Start AI Proof and move near a resident.',authority:'RUNTIME_EVIDENCE',
 }

 const publish=()=>window.dispatchEvent(new CustomEvent('tryamm:cognition-proof-state',{detail:state}))
 const setStage=(stage:ProofStage,message:string)=>{
  if(!state.active||state.stages[stage])return
  state={...state,stages:{...state.stages,[stage]:true},message}
  publish()
  maybePass()
 }
 const maybePass=()=>{
  if(!state.active)return
  const passed=Object.values(state.stages).every(Boolean)
  if(!passed)return
  const completedAt=performance.now()
  const receiptId=`cog-${Date.now().toString(36)}-${clean(state.npcId||'npc',24)}`
  state={...state,active:false,status:'passed',completedAt,receiptId,message:'GAMEPLAY PROOF PASSED • cognition loop locked in.'}
  if(timer)window.clearTimeout(timer)
  try{localStorage.setItem(RECEIPT_KEY,JSON.stringify({...state,savedAt:new Date().toISOString()}))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:cognition-gameplay-proof',{detail:{
   receiptId,
   npcId:state.npcId,
   action:state.action,
   nodeId:state.nodeId,
   nodeLabel:state.nodeLabel,
   durationMs:state.startedAt==null?null:Math.round(completedAt-state.startedAt),
   stages:state.stages,
   authority:state.authority,
   source:'streetverse-cognition-proof-v1',
  }}))
  publish()
 }

 const start=()=>{
  if(timer)window.clearTimeout(timer)
  state={
   active:true,status:'running',npcId:null,action:null,nodeId:null,nodeLabel:null,
   startedAt:performance.now(),completedAt:null,stages:emptyStages(),receiptId:null,
   message:'Walk toward a resident. StreetVerse will prove sense → decision → world use → memory.',
   authority:'RUNTIME_EVIDENCE',
  }
  publish()
  timer=window.setTimeout(()=>{
   if(!state.active)return
   state={...state,active:false,status:'failed',message:'Proof timed out. Move closer to a resident and run AI PROOF again.'}
   publish()
  },20000)
 }

 const onStart=()=>start()

 const onFeed=(event:Event)=>{
  if(!state.active)return
  const d=(event as CustomEvent<{npcId?:string;focus?:boolean;sense?:{seeHero?:boolean;hearHero?:boolean};memory?:{recent?:string[]}}>).detail||{}
  if(!d.npcId||!d.focus)return
  if(!state.npcId&&(d.sense?.seeHero||d.sense?.hearHero)){
   state={...state,npcId:clean(d.npcId),message:'SENSE proven • NPC detected the player.'}
   state={...state,stages:{...state.stages,sense:true}}
   publish()
  }
  if(state.npcId===d.npcId&&state.stages.move&&(d.memory?.recent||[]).some(item=>item.startsWith('used:'))){
   setStage('remember','REMEMBER proven • NPC stored what it used in the world.')
  }
 }

 const onDecision=(event:Event)=>{
  if(!state.active)return
  const d=(event as CustomEvent<{npcId?:string;action?:string}>).detail||{}
  if(!d.npcId||!d.action)return
  if(!state.npcId)return
  if(d.npcId!==state.npcId)return
  state={...state,action:clean(d.action,40)}
  setStage('decide',`DECIDE proven • ${clean(d.action,40)} selected from alternatives.`)
 }

 const onAssigned=(event:Event)=>{
  if(!state.active)return
  const d=(event as CustomEvent<{npcId?:string;nodeId?:string;nodeLabel?:string;action?:string}>).detail||{}
  if(!d.npcId||d.npcId!==state.npcId)return
  state={...state,nodeId:clean(d.nodeId),nodeLabel:clean(d.nodeLabel),action:clean(d.action||state.action)}
  setStage('reserve',`WORLD USE proven • ${clean(d.nodeLabel||d.nodeId)} reserved.`)
 }

 const onArrived=(event:Event)=>{
  if(!state.active)return
  const d=(event as CustomEvent<{npcId?:string;nodeId?:string}>).detail||{}
  if(!d.npcId||d.npcId!==state.npcId||!state.nodeId||d.nodeId!==state.nodeId)return
  setStage('move','MOVE proven • NPC physically reached the selected world object.')
 }

 const onMemory=(event:Event)=>{
  if(!state.active)return
  const d=(event as CustomEvent<{npcId?:string;event?:string}>).detail||{}
  if(!d.npcId||d.npcId!==state.npcId)return
  if(String(d.event||'').startsWith('used:'))setStage('remember','REMEMBER proven • the world interaction changed NPC memory.')
 }

 const onReset=()=>{
  if(timer)window.clearTimeout(timer)
  state={...state,active:false,status:'idle',npcId:null,action:null,nodeId:null,nodeLabel:null,startedAt:null,completedAt:null,stages:emptyStages(),receiptId:null,message:'AI Proof reset.'}
  publish()
 }

 window.addEventListener('tryamm:streetverse-cognition-proof-start',onStart)
 window.addEventListener('tryamm:npc-cognition-feed',onFeed)
 window.addEventListener('tryamm:streetverse-npc-cognition-action',onDecision)
 window.addEventListener('tryamm:npc-affordance-assigned',onAssigned)
 window.addEventListener('tryamm:npc-affordance-arrived',onArrived)
 window.addEventListener('tryamm:npc-cognition-memory-updated',onMemory)
 window.addEventListener('tryamm:streetverse-cognition-proof-reset',onReset)

 try{
  const previous=JSON.parse(localStorage.getItem(RECEIPT_KEY)||'null')
  if(previous?.status==='passed')state={...previous,active:false,authority:'RUNTIME_EVIDENCE'}
 }catch{}
 queueMicrotask(publish)

 return{
  getState:()=>state,
  dispose:()=>{
   if(timer)window.clearTimeout(timer)
   window.removeEventListener('tryamm:streetverse-cognition-proof-start',onStart)
   window.removeEventListener('tryamm:npc-cognition-feed',onFeed)
   window.removeEventListener('tryamm:streetverse-npc-cognition-action',onDecision)
   window.removeEventListener('tryamm:npc-affordance-assigned',onAssigned)
   window.removeEventListener('tryamm:npc-affordance-arrived',onArrived)
   window.removeEventListener('tryamm:npc-cognition-memory-updated',onMemory)
   window.removeEventListener('tryamm:streetverse-cognition-proof-reset',onReset)
  },
 }
}
