'use strict'

function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}

function createProviderResilience({
  provider,
  fetchImpl=global.fetch,
  timeoutMs=15_000,
  maxConcurrent=8,
  failureThreshold=5,
  resetMs=30_000,
  maxRetries=1,
  now=()=>Date.now(),
}={}){
  if(!provider)throw new Error('PROVIDER_NAME_REQUIRED')
  if(typeof fetchImpl!=='function')throw new Error('FETCH_UNAVAILABLE')
  let inFlight=0
  let failures=0
  let openUntil=0

  function status(){
    return{provider,inFlight,failures,circuitOpen:openUntil>now(),openUntil,timeoutMs,maxConcurrent}
  }

  async function request(url,options={},policy={}){
    const ts=now()
    if(openUntil>ts){
      const error=Object.assign(new Error(`${provider.toUpperCase()}_CIRCUIT_OPEN`),{statusCode:503,provider,retryAfterMs:openUntil-ts})
      throw error
    }
    if(inFlight>=maxConcurrent){
      throw Object.assign(new Error(`${provider.toUpperCase()}_BULKHEAD_FULL`),{statusCode:503,provider})
    }

    const method=String(options.method||'GET').toUpperCase()
    const retrySafe=policy.retrySafe===true||['GET','HEAD','OPTIONS'].includes(method)
    const retries=retrySafe?Math.max(0,Number(policy.maxRetries??maxRetries)):0
    let attempt=0
    inFlight+=1
    try{
      while(true){
        const controller=new AbortController()
        const timer=setTimeout(()=>controller.abort(),Number(policy.timeoutMs||timeoutMs))
        timer.unref?.()
        try{
          const response=await fetchImpl(url,{...options,signal:controller.signal})
          clearTimeout(timer)
          if(response.ok){
            failures=0
            if(openUntil<=now())openUntil=0
            return response
          }
          const retryable=[408,425,429,500,502,503,504].includes(Number(response.status))
          if(retryable&&attempt<retries){
            attempt+=1
            await sleep(Math.min(1500,150*Math.pow(2,attempt)+Math.floor(Math.random()*120)))
            continue
          }
          failures+=1
          if(failures>=failureThreshold)openUntil=now()+resetMs
          return response
        }catch(error){
          clearTimeout(timer)
          const timeout=error?.name==='AbortError'
          if((timeout||error?.code==='ECONNRESET'||error?.code==='ETIMEDOUT')&&attempt<retries){
            attempt+=1
            await sleep(Math.min(1500,150*Math.pow(2,attempt)+Math.floor(Math.random()*120)))
            continue
          }
          failures+=1
          if(failures>=failureThreshold)openUntil=now()+resetMs
          if(timeout)throw Object.assign(new Error(`${provider.toUpperCase()}_TIMEOUT`),{statusCode:504,provider})
          throw error
        }
      }
    }finally{
      inFlight=Math.max(0,inFlight-1)
    }
  }

  return{fetch:request,status}
}

module.exports={createProviderResilience}
