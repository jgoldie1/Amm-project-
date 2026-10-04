import type {RepairTicket} from './StreetVerseRepairTicketOrchestrator'

type MiddleverseRepairWorkItem={
 schema:'tryamm.middleverse.repair-work.v1'
 id:string
 ticketId:string
 lane:'developer'|'trainer'|'moderator'|'contact-center'|'business-operator'
 title:string
 skills:string[]
 minLevel:number
 remote:true
 languages:['any']
 accessibilitySupported:true
 risk:'routine'|'elevated'|'sensitive'|'critical'
 evidenceRequired:string[]
 supervisorRequired:boolean
 source:'streetverse-repair'
}

type State={
 items:MiddleverseRepairWorkItem[]
 activeTicketId:string|null
}

const STORAGE='tryamm.middleverse.repair-work.v1'
let installed=false

const emit=(name:string,detail:unknown)=>{
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))
}

function read():State{
 try{
  const v=JSON.parse(localStorage.getItem(STORAGE)||'null')
  return{items:Array.isArray(v?.items)?v.items.slice(-100):[],activeTicketId:v?.activeTicketId||null}
 }catch{return{items:[],activeTicketId:null}}
}
function save(state:State){
 try{localStorage.setItem(STORAGE,JSON.stringify({...state,items:state.items.slice(-100)}))}catch{}
 emit('tryamm:middleverse-repair-state',state)
}

function laneFor(ticket:RepairTicket):MiddleverseRepairWorkItem['lane']{
 if(ticket.problemClass==='ACCESSIBILITY_FRICTION')return'trainer'
 if(/moderation|trust|safety/i.test(ticket.subsystem))return'moderator'
 if(/customer|support|call|contact/i.test(ticket.subsystem))return'contact-center'
 if(/business|marketplace|commerce/i.test(ticket.subsystem))return'business-operator'
 return'developer'
}

function skillsFor(ticket:RepairTicket){
 const skills=new Set<string>(['incidents','qa','evidence'])
 if(['TYPECHECK','TEST','CI','CONFIG','BUILD','DEPLOYMENT','DEPENDENCY'].includes(ticket.repairLayer))skills.add('code-review')
 if(ticket.repairLayer==='TEST')skills.add('testing')
 if(ticket.problemClass==='ACCESSIBILITY_FRICTION')skills.add('accessibility')
 if(/asset|glb|model|texture|meshy/i.test(ticket.subsystem))skills.add('asset-qa')
 if(/mission|game|streetverse|world/i.test(ticket.subsystem)){skills.add('gameplay-qa');skills.add('streetverse')}
 if(/provider|network|api/i.test(ticket.subsystem)){skills.add('technical-support');skills.add('provider-triage')}
 return[...skills]
}

function makeItem(ticket:RepairTicket):MiddleverseRepairWorkItem{
 const supervisorRequired=ticket.risk!=='routine'||ticket.humanApprovalRequired
 return{
  schema:'tryamm.middleverse.repair-work.v1',
  id:`middleverse-${ticket.id}`,
  ticketId:ticket.id,
  lane:laneFor(ticket),
  title:`Repair + verify: ${ticket.title}`,
  skills:skillsFor(ticket),
  minLevel:ticket.risk==='critical'?5:ticket.risk==='sensitive'?4:ticket.risk==='elevated'?3:2,
  remote:true,
  languages:['any'],
  accessibilitySupported:true,
  risk:ticket.risk,
  evidenceRequired:[...new Set([
   ...ticket.requiredEvidence.map(String),
   'ticket-id',
   'before-after-proof',
   'sandbox-result',
   'review-notes',
  ])],
  supervisorRequired,
  source:'streetverse-repair',
 }
}

export function installStreetVerseMiddleverseRepairBridgeRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 let state=read()
 save(state)

 addEventListener('tryamm:repair-ticket-opened',(event:Event)=>{
  const d=(event as CustomEvent<{ticket?:RepairTicket}>).detail||{}
  const ticket=d.ticket
  if(!ticket)return
  const item=makeItem(ticket)
  if(!state.items.some(existing=>existing.ticketId===ticket.id)){
   state={items:[...state.items,item].slice(-100),activeTicketId:ticket.id}
   save(state)
  }
  emit('tryamm:job-match-request',{job:{
   id:item.id,
   title:item.title,
   lane:item.lane,
   skills:item.skills,
   minLevel:item.minLevel,
   languages:item.languages,
   remote:true,
   accessibilitySupported:true,
   evidenceRequired:item.evidenceRequired,
   supervisorRequired:item.supervisorRequired,
   source:item.source,
  }})
  emit('tryamm:ai-cafe-task',{
   workstream:'jobs',
   title:`Middleverse route repair ticket ${ticket.id} to a qualified ${item.lane} worker`,
   priority:ticket.severity==='critical'?'critical':'high',
   metadata:{ticketId:ticket.id,middleverseItemId:item.id,risk:item.risk,supervisorRequired:item.supervisorRequired},
  })
  emit('tryamm:middleverse-repair-work-created',{item,ticket})
 })

 addEventListener('tryamm:repair-ticket-verified',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  const item=state.items.find(x=>x.ticketId===d.ticketId)
  if(!item)return
  emit('tryamm:middleverse-remote-work-task-complete',{
   taskId:item.id,
   ticketId:item.ticketId,
   qualityDelta:2,
   reputation:2,
   evidence:d.evidence||{},
   supervisorRequired:item.supervisorRequired,
  })
 })

 addEventListener('tryamm:middleverse-repair-open',(event:Event)=>{
  const d=(event as CustomEvent<{ticketId?:string}>).detail||{}
  state={...state,activeTicketId:d.ticketId||state.activeTicketId}
  save(state)
  emit('tryamm:middleverse-open',{source:'repair-ticket',ticketId:state.activeTicketId})
 })

 addEventListener('tryamm:middleverse-repair-request-state',()=>save(state))

 emit('tryamm:middleverse-repair-bridge-ready',{
  repairWork:true,
  lanes:['developer','trainer','moderator','contact-center','business-operator'],
  workflow:'TICKET → SKILL MATCH → TRAINED WORKER/AI COPILOT → SANDBOX PROOF → SUPERVISOR IF REQUIRED → RELEASE GUARDIAN',
  privilegedActionsRemainGated:true,
 })
}
