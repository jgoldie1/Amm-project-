const url=()=>process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'';
const publicKey=()=>process.env.VITE_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'';

export function userSupabaseReady(){return Boolean(url()&&publicKey())}

export function userAccessToken(req){
  const auth=String(req?.headers?.authorization||'');
  return auth.startsWith('Bearer ')?auth.slice(7).trim():'';
}

export async function userRest(req,path,{method='GET',body,query}={}){
  if(!userSupabaseReady())throw Object.assign(new Error('supabase_user_api_not_configured'),{status:503});
  const token=userAccessToken(req);
  if(!token)throw Object.assign(new Error('authentication_required'),{status:401});
  const u=new URL(`${url().replace(/\/$/,'')}/rest/v1/${path}`);
  if(query)for(const [k,v] of Object.entries(query))if(v!==undefined&&v!==null)u.searchParams.set(k,String(v));
  const res=await fetch(u,{method,headers:{apikey:publicKey(),authorization:`Bearer ${token}`,'content-type':'application/json',prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await res.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!res.ok){const err=new Error(data?.message||data?.error||`supabase_${res.status}`);err.status=res.status;throw err}
  return data;
}

export async function publicDataApiProbe(){
  if(!userSupabaseReady())return {ok:false,status:0,error:'supabase_public_config_missing'};
  try{
    const endpoint=`${url().replace(/\/$/,'')}/rest/v1/media_catalog?select=id&limit=1`;
    const res=await fetch(endpoint,{headers:{apikey:publicKey(),'cache-control':'no-cache'}});
    return {ok:res.ok,status:res.status,error:res.ok?null:`supabase_${res.status}`};
  }catch(error){
    return {ok:false,status:0,error:String(error?.message||error).slice(0,240)};
  }
}
