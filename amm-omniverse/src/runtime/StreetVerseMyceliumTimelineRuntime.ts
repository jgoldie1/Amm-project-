/** StreetVerse Mycelium Timeline Runtime
 * Branching narrative projection of fictional missions only. No server inventory, payments,
 * shipments, real royalty receipts, or actual blockchain/settlement authority.
 */
export type MyceliumCheckpoint='accept'|'inspect'|'verify'|'load'|'deliver'|'receipt'
export type MyceliumBranch='storefront-community'|'musicverse-showcase'|'warehouse-training'
export type MyceliumTimelineEvent={id:string;missionId:string;checkpoint:MyceliumCheckpoint;stage:number;branch:'chicago:warehouse:demo';simulated:true}
export type MyceliumTimelineSnapshot={schema:1;missionId:string;events:MyceliumTimelineEvent[];branchChoices:MyceliumBranch[];completed:boolean;receipt?:string}
export const STREETVERSE_MYCELIUM_TIMELINE_KEY='tryamm.streetverse.mycelium-timeline.v1'
export const STREETVERSE_WAREHOUSE_SAVE_KEY='tryamm.warehouse.delivery.chapter.v1'
export const STREETVERSE_MYCELIUM_BRANCH_SAVE_KEY='tryamm.streetverse.mycelium-choice.v1'
export const STREETVERSE_WAREHOUSE_MISSION_ID='all-american-merch-route-001'
export const MYCELIUM_CHECKPOINTS:readonly MyceliumCheckpoint[]=['accept','inspect','verify','load','deliver','receipt']
export const MYCELIUM_BRANCHES:readonly MyceliumBranch[]=['storefront-community','musicverse-showcase','warehouse-training']

export function emptyMyceliumTimeline():MyceliumTimelineSnapshot{
 return {schema:1,missionId:STREETVERSE_WAREHOUSE_MISSION_ID,events:[],branchChoices:[],completed:false}
}
function safeTimeline(input:unknown):MyceliumTimelineSnapshot{
 if(!input||typeof input!=='object')return emptyMyceliumTimeline()
 const x=input as Partial<MyceliumTimelineSnapshot>
 if(x.schema!==1||x.missionId!==STREETVERSE_WAREHOUSE_MISSION_ID||!Array.isArray(x.events)||!Array.isArray(x.branchChoices))return emptyMyceliumTimeline()
 if(x.events.length>MYCELIUM_CHECKPOINTS.length||x.events.some((e,i)=>!e||e.id!==`mycelium:warehouse:${STREETVERSE_WAREHOUSE_MISSION_ID}:${MYCELIUM_CHECKPOINTS[i]}`||e.checkpoint!==MYCELIUM_CHECKPOINTS[i]||e.stage!==i+1||e.missionId!==STREETVERSE_WAREHOUSE_MISSION_ID||e.simulated!==true))return emptyMyceliumTimeline()
 if(x.branchChoices.some(b=>!MYCELIUM_BRANCHES.includes(b)))return emptyMyceliumTimeline()
 const completed=x.events.length===MYCELIUM_CHECKPOINTS.length
 return {schema:1,missionId:STREETVERSE_WAREHOUSE_MISSION_ID,events:x.events,branchChoices:[...new Set(x.branchChoices)],completed,receipt:completed?'DEMO-CHICAGO-WAREHOUSE-001':undefined}
}
export function applyMyceliumProjection(state:MyceliumTimelineSnapshot,raw:unknown):MyceliumTimelineSnapshot{
 const current=safeTimeline(state)
 if(!raw||typeof raw!=='object')return current
 const d=raw as Record<string,unknown>,checkpoint=d.checkpoint
 if(d.missionId!==STREETVERSE_WAREHOUSE_MISSION_ID||d.authoritative!==false||d.realMoney!==false||d.affectsInventory!==false||d.createsBlockchainAnchor!==false||d.timeline!=='fictional')return current
 const next=MYCELIUM_CHECKPOINTS[current.events.length]
 if(checkpoint!==next)return current // rejects duplicate, out-of-order, and fabricated completions
 const stage=current.events.length+1
 if(d.stage!==stage||d.eventId!==`mycelium:warehouse:${STREETVERSE_WAREHOUSE_MISSION_ID}:${checkpoint}`)return current
 const event:MyceliumTimelineEvent={id:d.eventId,missionId:STREETVERSE_WAREHOUSE_MISSION_ID,checkpoint:checkpoint as MyceliumCheckpoint,stage,branch:'chicago:warehouse:demo',simulated:true}
 return {...current,events:[...current.events,event],completed:stage===MYCELIUM_CHECKPOINTS.length,receipt:stage===MYCELIUM_CHECKPOINTS.length?'DEMO-CHICAGO-WAREHOUSE-001':undefined}
}
export function chooseMyceliumBranch(state:MyceliumTimelineSnapshot,branch:MyceliumBranch):MyceliumTimelineSnapshot{
 const current=safeTimeline(state)
 if(!current.completed||!MYCELIUM_BRANCHES.includes(branch)||current.branchChoices.includes(branch))return current
 return {...current,branchChoices:[...current.branchChoices,branch]}
}
export function syncMyceliumFromWarehouseSave(state:MyceliumTimelineSnapshot,raw:string|null):MyceliumTimelineSnapshot{
 let x:unknown
 try{x=JSON.parse(raw||'null')}catch{return safeTimeline(state)}
 if(!x||typeof x!=='object')return safeTimeline(state)
 const s=x as Record<string,unknown>
 if(s.schema!==1||s.missionId!==STREETVERSE_WAREHOUSE_MISSION_ID||!Array.isArray(s.history)||!Number.isInteger(s.stage)||s.stage!==s.history.length||s.history.length>MYCELIUM_CHECKPOINTS.length)return safeTimeline(state)
 if(s.history.some((v,i)=>v!==MYCELIUM_CHECKPOINTS[i])||s.completed!==(s.stage===MYCELIUM_CHECKPOINTS.length))return safeTimeline(state)
 let next=emptyMyceliumTimeline()
 for(const [i,checkpoint] of s.history.entries()){
  next=applyMyceliumProjection(next,{missionId:STREETVERSE_WAREHOUSE_MISSION_ID,checkpoint,stage:i+1,eventId:`mycelium:warehouse:${STREETVERSE_WAREHOUSE_MISSION_ID}:${checkpoint}`,authoritative:false,realMoney:false,affectsInventory:false,createsBlockchainAnchor:false,timeline:'fictional'})
 }
 // A replay with an empty save intentionally resets the fictional branch.
 if(next.completed&&safeTimeline(state).completed)next.branchChoices=[...safeTimeline(state).branchChoices]
 return next
}
export function installStreetVerseMyceliumTimelineRuntime(){
 if(typeof window==='undefined')return()=>{}
 const w=window as typeof window&{__TRYAMM_MYCELIUM_TIMELINE__?:{getState:()=>MyceliumTimelineSnapshot;chooseBranch:(branch:MyceliumBranch)=>MyceliumTimelineSnapshot;sync:()=>void}}
 if(w.__TRYAMM_MYCELIUM_TIMELINE__)return()=>{}
 const read=(key:string)=>{try{return localStorage.getItem(key)}catch{return null}}
 const persist=(state:MyceliumTimelineSnapshot)=>{try{localStorage.setItem(STREETVERSE_MYCELIUM_TIMELINE_KEY,JSON.stringify(state))}catch{}}
 let state=safeTimeline((()=>{try{return JSON.parse(read(STREETVERSE_MYCELIUM_TIMELINE_KEY)||'null')}catch{return null}})())
 const broadcast=()=>window.dispatchEvent(new CustomEvent('tryamm:mycelium-timeline-updated',{detail:{...state,source:'streetverse-mycelium-timeline',authoritative:false,realMoney:false}}))
 const sync=()=>{let next=syncMyceliumFromWarehouseSave(state,read(STREETVERSE_WAREHOUSE_SAVE_KEY));const savedChoice=read(STREETVERSE_MYCELIUM_BRANCH_SAVE_KEY);if(savedChoice&&MYCELIUM_BRANCHES.includes(savedChoice as MyceliumBranch))next=chooseMyceliumBranch(next,savedChoice as MyceliumBranch);if(JSON.stringify(next)!==JSON.stringify(state)){state=next;persist(state);broadcast()}}
 const onProjection=(event:Event)=>{const next=applyMyceliumProjection(state,(event as CustomEvent).detail);if(next.events.length===state.events.length)return;state=next;persist(state);broadcast()}
 const onStorage=(event:StorageEvent)=>{if(event.key===STREETVERSE_WAREHOUSE_SAVE_KEY||event.key===STREETVERSE_MYCELIUM_BRANCH_SAVE_KEY)sync()}
 const chooseBranch=(branch:MyceliumBranch)=>{const next=chooseMyceliumBranch(state,branch);if(next.branchChoices.length!==state.branchChoices.length){state=next;try{localStorage.setItem(STREETVERSE_MYCELIUM_BRANCH_SAVE_KEY,branch)}catch{}persist(state);broadcast()}return state}
 const onChoose=(e:Event)=>{const b=(e as CustomEvent<{branch?:MyceliumBranch}>).detail?.branch;if(b)chooseBranch(b)}
 window.addEventListener('tryamm:mycelium-mission-projection',onProjection)
 window.addEventListener('storage',onStorage)
 window.addEventListener('tryamm:mycelium-choose-branch',onChoose)
 w.__TRYAMM_MYCELIUM_TIMELINE__={getState:()=>safeTimeline(state),chooseBranch,sync}
 sync()
 return()=>{window.removeEventListener('tryamm:mycelium-mission-projection',onProjection);window.removeEventListener('storage',onStorage);window.removeEventListener('tryamm:mycelium-choose-branch',onChoose);delete w.__TRYAMM_MYCELIUM_TIMELINE__}
}
