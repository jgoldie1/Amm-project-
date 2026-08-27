export type OracleCloudStatus={configured:boolean,region:string|null,aiEndpoint:string|null,objectStorageEndpoint:string|null,mode:'disabled'|'standby'|'active'}

const read=(name:string)=>{
  const env=(import.meta as any).env||{}
  return String(env[name]||'').trim()
}

export function getOracleCloudStatus():OracleCloudStatus{
  const region=read('VITE_OCI_REGION')||null
  const aiEndpoint=read('VITE_OCI_AI_ENDPOINT')||null
  const objectStorageEndpoint=read('VITE_OCI_OBJECT_STORAGE_ENDPOINT')||null
  const configured=Boolean(region&&(aiEndpoint||objectStorageEndpoint))
  return {configured,region,aiEndpoint,objectStorageEndpoint,mode:configured?'standby':'disabled'}
}

export async function routeOracleTask(input:{kind:'ai'|'asset'|'simulation'|'agent';payload:unknown}){
  const status=getOracleCloudStatus()
  if(!status.configured)return {ok:false,provider:'oracle-cloud',degraded:true,message:'Oracle Cloud adapter is installed but OCI credentials/endpoints are not configured.'}
  return {ok:true,provider:'oracle-cloud',degraded:true,mode:'standby',kind:input.kind,message:'Oracle Cloud is registered as an optional second-cloud route. Production execution remains gated until server-side OCI credentials and endpoints are configured.'}
}
