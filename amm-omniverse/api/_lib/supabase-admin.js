const url=()=>process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'';
const key=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||'';
export function adminReady(){return Boolean(url()&&key())}
export async function adminRest(path,{method='GET',body,query}={}){
  if(!adminReady())throw new Error('supabase_admin_not_configured');
  const u=new URL(`${url().replace(/\/$/,'')}/rest/v1/${path}`);
  if(query)for(const [k,v] of Object.entries(query))if(v!==undefined&&v!==null)u.searchParams.set(k,String(v));
  const res=await fetch(u,{method,headers:{apikey:key(),authorization:`Bearer ${key()}`,'content-type':'application/json',prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await res.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!res.ok){const err=new Error(data?.message||data?.error||`supabase_${res.status}`);err.status=res.status;throw err}
  return data;
}
export function json(res,status,payload){res.setHeader('Cache-Control','no-store');return res.status(status).json(payload)}
