/** Single Chicago pilot evidence gate. Never derive readiness from a UI click. */
export type JourneyStep='world'|'discover'|'gallery'|'purchase'|'order'|'delivery'
export type EvidenceStatus='verified'|'blocked'|'pending'
export type JourneyEvidence={step:JourneyStep;status:EvidenceStatus;source:string|null;checkedAt:string|null;reference:string|null}
export const JOURNEY_STEPS:readonly JourneyStep[]=['world','discover','gallery','purchase','order','delivery']
export const STEP_LABELS:Record<JourneyStep,string>={
 world:'Chicago world entry',discover:'Approved farm or business',
 gallery:'Rights-cleared holographic exhibit',purchase:'Authorized purchase link',
 order:'Provider-confirmed order',delivery:'Authorized delivery tracking'
}
export type JourneyReadiness={passed:number;total:number;blocked:JourneyStep[];pending:JourneyStep[];canClaimComplete:boolean}
export function assessChicagoJourney(evidence:readonly JourneyEvidence[]):JourneyReadiness{
 const trusted=new Map<JourneyStep,JourneyEvidence>()
 for(const e of evidence){
  if(!JOURNEY_STEPS.includes(e.step))continue
  if(trusted.has(e.step))continue // duplicate statuses are not counted twice
  if(!['verified','blocked','pending'].includes(e.status))continue
  trusted.set(e.step,e)
 }
 const complete=(s:JourneyStep)=>{
  const e=trusted.get(s)
  return !!(e&&e.status==='verified'&&e.source?.trim()&&e.reference?.trim()&&
   e.checkedAt&&Number.isFinite(Date.parse(e.checkedAt)))
 }
 const blocked=JOURNEY_STEPS.filter(s=>trusted.get(s)?.status==='blocked')
 const pending=JOURNEY_STEPS.filter(s=>!complete(s)&&!blocked.includes(s))
 const passed=JOURNEY_STEPS.filter(complete).length
 return {passed,total:JOURNEY_STEPS.length,blocked,pending,canClaimComplete:passed===JOURNEY_STEPS.length}
}
export function emptyChicagoJourney():JourneyEvidence[]{
 return JOURNEY_STEPS.map(step=>({step,status:'pending',source:null,checkedAt:null,reference:null}))
}
