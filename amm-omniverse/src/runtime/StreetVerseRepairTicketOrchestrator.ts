import {aiTicketAssist} from './AiTicketAssistant'
import {routeTicket,type TicketRisk} from './TicketAdminOperations'
import {createRepairCandidate,evaluateRepair,type HealthSignal,type RepairCandidate,type VerificationEvidence} from './SelfHealingRuntime'
import {canAutoRepair,isHighImpactSubsystem} from './SelfHealingGuard'
import {detectRepairLayer,normalizeErrorSignature,type RepairLayer} from './HoloGPTAutonomousRepairEngine'
import {classifyBuildProblem,type ProblemClass} from './HoloGPTBuildGuardian'

export type RepairTicketStatus='open'|'triaged'|'repairing'|'sandbox'|'verified'|'approval-required'|'resolved'|'blocked'
export type RepairTicketSource='health'|'sandbox'|'quantum-build'|'asset'|'mission'|'accessibility'|'deployment'|'manual'
export type RepairTicket={
 schema:'tryamm.streetverse.repair-ticket.v1'
 id:string
 signature:string
 source:RepairTicketSource
 subsystem:string
 title:string
 message:string
 severity:'info'|'warning'|'error'|'critical'
 risk:TicketRisk
 status:RepairTicketStatus
 repairLayer:RepairLayer
 problemClass:ProblemClass
 createdAt:string
 updatedAt:string
 occurrences:number
 signal:HealthSignal
 candidate:RepairCandidate
 assignedWorkstreams:string[]
 requiredEvidence:(keyof VerificationEvidence)[]
 evidence:Partial<VerificationEvidence>
 autoRepairAllowed:boolean
 humanApprovalRequired:boolean
 resolution?:string
}

type RepairState={
 tickets:RepairTicket[]
 activeTicketId:string|null
}

const STORAGE='tryamm.streetverse.repair-tickets.v1'
let installed=false

const emit=(name:string,detail:unknown)=>{
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))
}
const now=()=>new Date().toISOString()
const sevRank={info:0,warning:1,error:2,critical:3} as const

function readState():RepairState{
 try{
  const parsed=JSON.parse(localStorage.getItem(STORAGE)||'null')
  return{
   tickets:Array.isArray(parsed?.tickets)?parsed.tickets.slice(-100):[],
   activeTicketId:parsed?.activeTicketId||null,
  }
 }catch{return{tickets:[],activeTicketId:null}}
}
function publish(state:RepairState){
 try{localStorage.setItem(STORAGE,JSON.stringify({...state,tickets:state.tickets.slice(-100)}))}catch{}
 emit('tryamm:repair-ticket-state',state)
}

function riskFor(subsystem:string,severity:RepairTicket['severity']):TicketRisk{
 if(isHighImpactSubsystem(subsystem))return severity==='critical'?'critical':'sensitive'
 if(severity==='critical')return'elevated'
 return'routine'
}

function workstreamsFor(subsystem:string,layer:RepairLayer,problem:ProblemClass){
 const streams=new Set<string>(['repair','sandbox','release'])
 if(/asset|meshy|model|glb|texture|rig/i.test(subsystem))streams.add('assets')
 if(/streetverse|game|mission|world|collision|navigation/i.test(subsystem))streams.add('streetverse')
 if(/access|one-hand|mobile|screen-reader/i.test(subsystem)||problem==='ACCESSIBILITY_FRICTION')streams.add('quality')
 if(/payment|wallet|stripe|commerce|payout/i.test(subsystem))streams.add('payments')
 if(/provider|network|api/i.test(subsystem)||layer==='PROVIDER')streams.add('runtime')
 if(['TYPECHECK','TEST','CI','BUILD','DEPLOYMENT','CONFIG','DEPENDENCY'].includes(layer))streams.add('executive')
 return[...streams]
}

function createSignal(input:{
 source:RepairTicketSource
 subsystem:string
 kind:string
 severity:RepairTicket['severity']
 message:string
 metadata?:Record<string,unknown>
}):HealthSignal{
 return{
  id:`repair-signal-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
  subsystem:input.subsystem,
  kind:input.kind,
  severity:input.severity,
  message:input.message.slice(0,1000),
  occurredAt:Date.now(),
  metadata:{source:input.source,...(input.metadata||{})},
 }
}

function openTicket(state:RepairState,input:{
 source:RepairTicketSource
 subsystem:string
 kind:string
 severity:RepairTicket['severity']
 message:string
 metadata?:Record<string,unknown>
}){
 const signature=normalizeErrorSignature(`${input.subsystem} ${input.kind} ${input.message}`)
 const existing=state.tickets.find(t=>t.signature===signature&&!['resolved'].includes(t.status))
 if(existing){
  const updated:RepairTicket={...existing,occurrences:existing.occurrences+1,updatedAt:now(),severity:sevRank[input.severity]>sevRank[existing.severity]?input.severity:existing.severity}
  const next={...state,tickets:state.tickets.map(t=>t.id===updated.id?updated:t),activeTicketId:updated.id}
  publish(next);return next
 }
 const signal=createSignal(input)
 const candidate=createRepairCandidate(signal)
 const repairLayer=detectRepairLayer(input.message)
 const problemClass=classifyBuildProblem(input.message)
 const risk=riskFor(input.subsystem,input.severity)
 const decision=evaluateRepair(candidate,{})
 const route=routeTicket(risk,.92)
 const workstreams=workstreamsFor(input.subsystem,repairLayer,problemClass)
 const ticket:RepairTicket={
  schema:'tryamm.streetverse.repair-ticket.v1',
  id:`ticket-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
  signature,source:input.source,subsystem:input.subsystem,
  title:`${input.severity.toUpperCase()} • ${input.kind}`,
  message:input.message,severity:input.severity,risk,status:'triaged',
  repairLayer,problemClass,createdAt:now(),updatedAt:now(),occurrences:1,
  signal,candidate,assignedWorkstreams:workstreams,
  requiredEvidence:decision.requiredEvidence,evidence:{},
  autoRepairAllowed:canAutoRepair(input.subsystem,candidate.action),
  humanApprovalRequired:risk!=='routine'||candidate.riskScore>=80||!canAutoRepair(input.subsystem,candidate.action),
 }
 const next={tickets:[...state.tickets,ticket].slice(-100),activeTicketId:ticket.id}
 publish(next)

 const assistant=aiTicketAssist({ticketId:ticket.id,kind:input.kind,text:input.message})
 emit('tryamm:repair-ticket-opened',{ticket,route,assistant})
 if(ticket.humanApprovalRequired||ticket.risk!=='routine')workstreams.push('jobs')
 for(const workstream of [...new Set(workstreams)]){
  emit('tryamm:ai-cafe-task',{
   workstream,
   title:`Repair ${ticket.id}: ${ticket.title} — ${ticket.message.slice(0,180)}`,
   priority:ticket.severity==='critical'?'critical':ticket.severity==='error'?'high':'normal',
   metadata:{ticketId:ticket.id,repairLayer,problemClass,candidateAction:candidate.action},
  })
 }
 emit('tryamm:hologpt-repair-case',{
  ticketId:ticket.id,
  errorSignature:signature,
  layer:repairLayer,
  smallestRepair:true,
  checkpointRequired:true,
  candidate,
 })
 emit('tryamm:world-build-sandbox-run',{evidence:{}})
 return next
}

function updateTicket(state:RepairState,id:string,patch:Partial<RepairTicket>){
 const current=state.tickets.find(t=>t.id===id)
 if(!current)return state
 const nextTicket={...current,...patch,updatedAt:now()}
 const next={...state,tickets:state.tickets.map(t=>t.id===id?nextTicket:t),activeTicketId:id}
 publish(next);return next
}

export function installStreetVerseRepairTicketOrchestrator(){
 if(installed||typeof window==='undefined')return
 installed=true
 let state=readState()
 publish(state)

 const incident=(input:Parameters<typeof openTicket>[1])=>{state=openTicket(state,input)}

 addEventListener('tryamm:production-health-signal',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  incident({source:'health',subsystem:String(d.subsystem||'runtime'),kind:String(d.kind||'health-signal'),severity:d.severity||'warning',message:String(d.message||'Production health signal'),metadata:d.metadata})
 })
 addEventListener('tryamm:world-build-sandbox-result',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(d.publishable)return
  const missing=Array.isArray(d.missingEvidence)?d.missingEvidence.join(', '):'unknown evidence'
  incident({source:'sandbox',subsystem:'streetverse-world-sandbox',kind:'sandbox-certification-failed',severity:'error',message:`Sandbox blocked ${d.target?.label||'world build'}; missing evidence: ${missing}`,metadata:{planId:d.planId,missingEvidence:d.missingEvidence}})
 })
 addEventListener('tryamm:quantum-world-builder-task-update',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(d.state!=='failed')return
  incident({source:'quantum-build',subsystem:'quantum-world-builder',kind:'build-task-failed',severity:'error',message:`Quantum build task failed: ${d.taskId||'unknown task'}`,metadata:d})
 })
 addEventListener('tryamm:streetverse-asset-fallback',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  incident({source:'asset',subsystem:'streetverse-assets',kind:'asset-fallback',severity:'warning',message:`Asset ${d.id||'unknown'} fell back: ${d.reason||'unknown reason'}`,metadata:d})
 })
 addEventListener('tryamm:streetverse-asset-blocked',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  incident({source:'asset',subsystem:'streetverse-assets',kind:'asset-rights-blocked',severity:'warning',message:`Asset ${d.id||'unknown'} blocked by rights gate: ${(d.reasons||[]).join(', ')}`,metadata:d})
 })
 addEventListener('tryamm:streetverse-mission-failed',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  incident({source:'mission',subsystem:'streetverse-missions',kind:'mission-failure',severity:'error',message:String(d.message||`Mission failed: ${d.missionId||'unknown'}`),metadata:d})
 })
 addEventListener('tryamm:accessibility-regression',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  incident({source:'accessibility',subsystem:'streetverse-accessibility',kind:'accessibility-regression',severity:'error',message:String(d.message||'Accessibility regression detected'),metadata:d})
 })
 addEventListener('tryamm:deployment-regression',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  incident({source:'deployment',subsystem:'deployment',kind:'deployment-regression',severity:'critical',message:String(d.message||'Deployment regression detected'),metadata:d})
 })

 addEventListener('tryamm:repair-ticket-evidence',(event:Event)=>{
  const d=(event as CustomEvent<{ticketId?:string;evidence?:Partial<VerificationEvidence>}>).detail||{}
  if(!d.ticketId||!d.evidence)return
  const ticket=state.tickets.find(t=>t.id===d.ticketId);if(!ticket)return
  const evidence={...ticket.evidence,...d.evidence}
  const decision=evaluateRepair(ticket.candidate,evidence)
  const status:RepairTicketStatus=!decision.allowed?'sandbox':decision.autoExecute?'verified':'approval-required'
  state=updateTicket(state,ticket.id,{evidence,requiredEvidence:decision.requiredEvidence,status,humanApprovalRequired:!decision.autoExecute})
  if(decision.allowed){
   emit('tryamm:repair-ticket-verified',{ticketId:ticket.id,decision,evidence})
   emit('tryamm:ai-cafe-task',{workstream:'release',title:`Release Guardian verify repair ticket ${ticket.id}`,priority:'critical',metadata:{ticketId:ticket.id}})
  }
 })

 addEventListener('tryamm:repair-ticket-resolve',(event:Event)=>{
  const d=(event as CustomEvent<{ticketId?:string;resolution?:string;approved?:boolean}>).detail||{}
  if(!d.ticketId)return
  const ticket=state.tickets.find(t=>t.id===d.ticketId);if(!ticket)return
  if(ticket.humanApprovalRequired&&d.approved!==true){
   state=updateTicket(state,ticket.id,{status:'approval-required'})
   return
  }
  state=updateTicket(state,ticket.id,{status:'resolved',resolution:d.resolution||'Verified repair completed.'})
  emit('tryamm:repair-ticket-resolved',{ticketId:ticket.id,resolution:d.resolution})
 })

 addEventListener('tryamm:repair-sweep',()=>{
  emit('tryamm:ai-cafe-sprint',{})
  emit('tryamm:asset-executive-sprint',{})
  emit('tryamm:construct:scan',{})
  emit('tryamm:world-build-sandbox-run',{evidence:{}})
  emit('tryamm:repair-sweep-started',{openTickets:state.tickets.filter(t=>t.status!=='resolved').length})
 })

 addEventListener('tryamm:repair-ticket-request-state',()=>publish(state))
 emit('tryamm:repair-ticket-orchestrator-ready',{
  ticketing:true,selfHealing:true,autonomousRepair:true,buildGuardian:true,aiCafe:true,releaseGuardian:true,
  rule:'Detect → ticket → triage → smallest repair → sandbox → evidence → approval if required → release verify → resolve.',
  productionMutation:false,
 })
}
