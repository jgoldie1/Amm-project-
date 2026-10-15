export async function factoryRequest(url:string,options:RequestInit={},dependencies:{getToken:()=>Promise<string|null>;fetch:typeof fetch;timeoutMs?:number}){
  const token=await dependencies.getToken()
  if(!token)throw new Error('Sign in to use the founder asset factory.')
  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),dependencies.timeoutMs??45000)
  try{
    const response=await dependencies.fetch(url,{...options,headers:{'content-type':'application/json',...options.headers,authorization:`Bearer ${token}`},signal:controller.signal,cache:'no-store'})
    const payload=await response.json().catch(()=>null)
    if(response.status===401)throw new Error('Your session expired. Sign in again; your saved jobs are preserved.')
    if(response.status===403)throw new Error('This account does not have founder or asset-admin access. No generation was started.')
    if(!response.ok)throw new Error(payload?.message||payload?.error||`Factory request failed (${response.status})`)
    if(!payload||typeof payload!=='object')throw new Error('The factory returned an invalid response. Refresh to check saved jobs before retrying.')
    return payload
  }catch(error){
    if(controller.signal.aborted)throw new Error('The request timed out. Refresh saved jobs before starting again; a provider job may already exist.')
    throw error
  }finally{clearTimeout(timer)}
}

export function singleFlight<T extends unknown[],R>(work:(...args:T)=>Promise<R>){
  let pending:Promise<R>|null=null
  return (...args:T):Promise<R>=>{
    if(pending)return pending
    pending=Promise.resolve().then(()=>work(...args)).finally(()=>{pending=null})
    return pending
  }
}
