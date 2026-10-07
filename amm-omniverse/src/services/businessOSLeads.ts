import {getSupabaseClient} from './supabaseClient'

export type BusinessOSLeadInput={
  name:string
  email:string
  businessName:string
  plan:string
  notes?:string
  source?:string
}

export async function submitBusinessOSLead(input:BusinessOSLeadInput){
  const sb=getSupabaseClient()
  if(!sb)throw new Error('Sales lead service is not configured.')
  const {data,error}=await sb.rpc('submit_business_os_lead',{
    p_name:input.name,
    p_email:input.email,
    p_business_name:input.businessName,
    p_plan:input.plan,
    p_notes:input.notes||null,
    p_source:input.source||'business-os',
  })
  if(error)throw error
  return String(data||'')
}
