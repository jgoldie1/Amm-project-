// Trusted API-to-Edge authorization. Role claims never come from user_metadata.
const BASE=()=>String(process.env.VITE_SUPABASE_URL||process.env.SUPABASE_URL||'').replace(/\/$/,'');
const PUBLIC_KEY=()=>String(process.env.VITE_SUPABASE_ANON_KEY||process.env.SUPABASE_PUBLISHABLE_KEY||'');

export async function requireAssetVaultOperator(req){
  const auth=String(req.headers.authorization||'');
  if(!auth.startsWith('Bearer '))throw Object.assign(new Error('login_required'),{status:401,code:'login_required'});
  if(!BASE()||!PUBLIC_KEY())throw Object.assign(new Error('vault_endpoint_not_configured'),{status:503,code:'vault_endpoint_not_configured'});
  const res=await fetch(BASE()+'/functions/v1/streetverse-character-vault',{
    method:'GET',cache:'no-store',signal:AbortSignal.timeout(10000),
    headers:{authorization:auth,apikey:PUBLIC_KEY()}
  });
  if(!res.ok)throw Object.assign(new Error('secure_founder_vault_unavailable_or_denied'),{
    status:res.status===401||res.status===403?res.status:503,code:res.status===403?'founder_access_not_granted':'secure_founder_vault_unavailable'
  });
  const data=await res.json().catch(()=>({}));
  if(!data.ok||!['founder','asset_admin'].includes(data.role))
    throw Object.assign(new Error('founder_access_not_granted'),{status:403,code:'founder_access_not_granted'});
  return {role:data.role,base:BASE(),publishableKey:PUBLIC_KEY(),authorization:auth};
}

export async function callCharacterVault(access,action){
  const res=await fetch(access.base+'/functions/v1/streetverse-character-vault',{
    method:'POST',cache:'no-store',signal:AbortSignal.timeout(25000),
    headers:{authorization:access.authorization,apikey:access.publishableKey,
      'content-type':'application/json'},body:JSON.stringify(action)
  });
  const body=await res.json().catch(()=>({}));
  if(!res.ok||!body.ok)throw Object.assign(new Error(body.error||'private_vault_action_failed'),{
    status:res.status===400||res.status===401||res.status===403||res.status===409?res.status:503,
    code:body.error||'private_vault_action_failed'
  });
  return body;
}
