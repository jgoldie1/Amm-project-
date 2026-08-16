import { getAccessToken } from '../services/supabaseClient'
import type { HealthSignal, RepairCandidate, HealingDecision, VerificationEvidence } from './SelfHealingRuntime'

const SUPABASE_URL=(import.meta.env.VITE_SUPABASE_URL as string|undefined)?.replace(/\/$/,'')||''

export type HealingTelemetryPayload={
  signal:HealthSignal
  candidate?:RepairCandidate
  decision?:HealingDecision
  evidence?:Partial<VerificationEvidence>
  riskScore?:number
}

export async function persistHealingTelemetry(payload:HealingTelemetryPayload){
  if(!SUPABASE_URL) throw new Error('VITE_SUPABASE_URL is not configured')
  const token=await getAccessToken()
  if(!token) throw new Error('Authenticated session required for healing telemetry')
  const response=await fetch(`${SUPABASE_URL}/functions/v1/self-healing-telemetry`,{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
    body:JSON.stringify(payload),
  })
  const body=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body?.error||'Could not persist healing telemetry')
  return body as {ok:true;eventId:string;repairId?:string|null}
}

export async function persistHealingTelemetryBestEffort(payload:HealingTelemetryPayload){
  try{return await persistHealingTelemetry(payload)}catch(error){
    console.warn('Self-healing telemetry persistence unavailable',error)
    return null
  }
}
