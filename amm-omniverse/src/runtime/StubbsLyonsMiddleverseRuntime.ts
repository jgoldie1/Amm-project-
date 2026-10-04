export type TryammOperatingAgent='stubbs-ai'|'lyons-tech'|'middleverse-ai'
export type OperatingDomain='commerce'|'logistics'|'freight'|'workforce'|'streetverse'|'media'|'security'|'technology'
export type OperatingIntent={id:string;domain:OperatingDomain;action:string;priority:'routine'|'high'|'critical';payload?:Record<string,unknown>;requiresHumanApproval?:boolean}

export const TRYAMM_OPERATING_FABRIC={
 schema:'tryamm.stubbs-lyons-middleverse.v1',
 agents:{
  'stubbs-ai':{role:'executive-orchestrator',mission:'Turn founder/business intent into policy-gated work, plans, priorities and measurable handoffs.'},
  'lyons-tech':{role:'technology-logistics-platform',mission:'Provide the technical operating layer for data, routing, integrations, logistics, freight, automation and telemetry.'},
  'middleverse-ai':{role:'context-work-orchestrator',mission:'Preserve context and route work to the correct AI, worker, service, world or human review lane.'},
 },
 authority:{
  payments:'server/provider only',
  payouts:'server/provider only',
  freightBooking:'external carrier/broker/3PL confirmation required',
  purchaseOrders:'server-authoritative/human-policy gated',
  regulatedDecisions:'qualified human/provider where required',
 }
} as const

declare global{interface Window{__TRYAMM_OPERATING_FABRIC__?:{version:string;route:(intent:OperatingIntent)=>void}}}

export function installStubbsLyonsMiddleverseRuntime(){
 if(typeof window==='undefined')return()=>{}
 if(window.__TRYAMM_OPERATING_FABRIC__)return()=>{}
 const route=(intent:OperatingIntent)=>{
  const agent:intentAgent=selectAgent(intent)
  window.dispatchEvent(new CustomEvent('tryamm:operating-intent-routed',{detail:{schema:TRYAMM_OPERATING_FABRIC.schema,intent,agent,authority:TRYAMM_OPERATING_FABRIC.authority,at:Date.now()}}))
  if(intent.domain==='logistics'||intent.domain==='freight')window.dispatchEvent(new CustomEvent('tryamm:logistics-freight-intent',{detail:{...intent,agent}}))
  if(intent.domain==='workforce')window.dispatchEvent(new CustomEvent('tryamm:middleverse-remote-work-request',{detail:{...intent,agent}}))
 }
 window.__TRYAMM_OPERATING_FABRIC__={version:'1.0.0',route}
 window.dispatchEvent(new CustomEvent('tryamm:stubbs-lyons-middleverse-ready',{detail:{version:'1.0.0',fabric:TRYAMM_OPERATING_FABRIC}}))
 return()=>{delete window.__TRYAMM_OPERATING_FABRIC__}
}

type intentAgent=TryammOperatingAgent
function selectAgent(intent:OperatingIntent):TryammOperatingAgent{
 if(intent.domain==='technology'||intent.domain==='logistics'||intent.domain==='freight')return'lyons-tech'
 if(intent.domain==='workforce')return'middleverse-ai'
 return'stubbs-ai'
}