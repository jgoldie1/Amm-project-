export type DeploymentEvidence={key:string;label:string;value:string;state:'verified'|'reported'|'missing'}

export function getDeploymentEvidence():DeploymentEvidence[]{
 const env=import.meta.env as Record<string,string|boolean|undefined>
 const sha=String(env.VITE_GIT_SHA||env.VERCEL_GIT_COMMIT_SHA||'').trim()
 const deployment=String(env.VITE_DEPLOYMENT_URL||env.VERCEL_URL||'').trim()
 const api=String(env.VITE_API_URL||'').trim()
 const supabase=String(env.VITE_SUPABASE_URL||'').trim()
 return [
  {key:'sha',label:'Build commit',value:sha||'not injected',state:sha?'reported':'missing'},
  {key:'deployment',label:'Deployment URL',value:deployment||((typeof location!=='undefined'&&location.host)||'not available'),state:deployment?'reported':'missing'},
  {key:'api',label:'API endpoint',value:api||'not configured',state:api?'reported':'missing'},
  {key:'supabase',label:'Persistence endpoint',value:supabase?'configured':'not configured',state:supabase?'reported':'missing'},
 ]
}

export function deploymentEvidenceReady(rows=getDeploymentEvidence()){
 return rows.every(r=>r.state!=='missing')
}
