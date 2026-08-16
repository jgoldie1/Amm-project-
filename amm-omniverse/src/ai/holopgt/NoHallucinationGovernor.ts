export type ClaimClass='retrieved-fact'|'model-knowledge'|'user-provided'|'estimate'|'simulation'|'creative'|'unknown'
export type EvidenceSource='web'|'file'|'database'|'tool'|'user'|'sensor'|'model'

export interface EvidenceRef {
  id:string
  source:EvidenceSource
  uri?:string
  timestamp?:string
  freshnessMs?:number
  reliability:number
  supports:string[]
}

export interface Claim {
  id:string
  text:string
  class:ClaimClass
  evidenceIds:string[]
  confidence:number
  timeSensitive:boolean
  actionable:boolean
}

export interface VerificationResult {
  claimId:string
  status:'verified'|'partially-verified'|'unsupported'|'contradicted'|'unknown'
  confidence:number
  reasons:string[]
  evidenceIds:string[]
}

export interface GovernorDecision {
  allow:boolean
  mode:'answer'|'answer-with-caveat'|'retrieve-more'|'ask-user'|'refuse-action'|'unknown'
  claimResults:VerificationResult[]
  missingEvidence:string[]
  contradictions:string[]
}

const clamp=(n:number)=>Math.max(0,Math.min(1,n))

export function verifyClaim(claim:Claim,evidence:EvidenceRef[]):VerificationResult{
  const refs=evidence.filter(e=>claim.evidenceIds.includes(e.id))
  if(claim.class==='creative'||claim.class==='simulation') return {claimId:claim.id,status:'verified',confidence:1,reasons:['Non-factual content is explicitly labeled as creative or simulated.'],evidenceIds:[]}
  if(claim.class==='unknown') return {claimId:claim.id,status:'unknown',confidence:0,reasons:['Claim is explicitly unknown.'],evidenceIds:[]}
  if(claim.class==='user-provided') return {claimId:claim.id,status:'partially-verified',confidence:clamp(claim.confidence),reasons:['Grounded in user-provided information; independent verification may still be required.'],evidenceIds:refs.map(r=>r.id)}
  if(refs.length===0) return {claimId:claim.id,status:'unsupported',confidence:0,reasons:['No evidence attached.'],evidenceIds:[]}
  const avg=refs.reduce((s,r)=>s+clamp(r.reliability),0)/refs.length
  const stale=claim.timeSensitive&&refs.every(r=>r.freshnessMs!==undefined&&r.freshnessMs>24*60*60*1000)
  if(stale) return {claimId:claim.id,status:'partially-verified',confidence:Math.min(avg,0.55),reasons:['Evidence may be stale for a time-sensitive claim.'],evidenceIds:refs.map(r=>r.id)}
  return {claimId:claim.id,status:avg>=0.8?'verified':'partially-verified',confidence:avg,reasons:[avg>=0.8?'Evidence threshold met.':'Evidence exists but confidence is below the strong-verification threshold.'],evidenceIds:refs.map(r=>r.id)}
}

export function evaluateResponse(claims:Claim[],evidence:EvidenceRef[]):GovernorDecision{
  const claimResults=claims.map(c=>verifyClaim(c,evidence))
  const unsupported=claimResults.filter(r=>['unsupported','unknown'].includes(r.status))
  const contradicted=claimResults.filter(r=>r.status==='contradicted')
  const riskyUnsupported=unsupported.filter(r=>claims.find(c=>c.id===r.claimId)?.actionable)
  if(contradicted.length) return {allow:false,mode:'retrieve-more',claimResults,missingEvidence:unsupported.map(r=>r.claimId),contradictions:contradicted.map(r=>r.claimId)}
  if(riskyUnsupported.length) return {allow:false,mode:'refuse-action',claimResults,missingEvidence:riskyUnsupported.map(r=>r.claimId),contradictions:[]}
  if(unsupported.length) return {allow:true,mode:'answer-with-caveat',claimResults,missingEvidence:unsupported.map(r=>r.claimId),contradictions:[]}
  return {allow:true,mode:'answer',claimResults,missingEvidence:[],contradictions:[]}
}

export const HOLOGPT_EVIDENCE_POLICY={
  goal:'Minimize unsupported factual claims and make uncertainty explicit.',
  promise:'No AI system can guarantee literal zero hallucinations; HoloGPT must instead verify, cite, retrieve, abstain, or label uncertainty.',
  rules:[
    'Time-sensitive facts require fresh retrieval before confident answers.',
    'Claims used to trigger consequential actions require supporting evidence or explicit user authorization.',
    'Conflicting sources trigger reconciliation instead of silent selection.',
    'Estimates, simulations, creative content, and user-provided facts must be labeled distinctly from verified external facts.',
    'Unknown is a valid answer state.',
    'Do not invent citations, files, tool results, prices, dates, people, locations, capabilities, or completed work.',
    'After tool execution, verify the returned result before stating the action succeeded.'
  ],
  executionGate:{money:true,delete:true,publish:true,legal:true,medical:true,security:true,accountChange:true},
  integrations:['HoloGPT','QuantumLLM','HoloSearch','StubbsAI','LyonsTechAI','CopySmartNPC','LivingWorlds','ScaleNexus','HoloTrust']
} as const
