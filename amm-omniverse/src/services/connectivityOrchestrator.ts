import type { Market, Provider } from './tryammConnect'

export type ConnectivityNeed='voice'|'data'|'esim'|'wifi'|'fixed-wireless'|'satellite'
export type NetworkRecommendation={provider:Provider;score:number;reasons:string[];automatic:boolean}

const LOW_RISK=new Set<ConnectivityNeed>(['data','wifi','fixed-wireless'])

function supports(provider:Provider,need:ConnectivityNeed){
 const caps=provider.capabilities.map(x=>x.toLowerCase())
 if(need==='fixed-wireless') return caps.some(x=>x.includes('fixed')||x.includes('fwa'))
 if(need==='satellite') return caps.some(x=>x.includes('satellite')||x.includes('ntn'))
 return caps.some(x=>x.includes(need))
}

export function recommendConnectivity(providers:Provider[],market:Market|undefined,need:ConnectivityNeed):NetworkRecommendation[]{
 return providers.map(provider=>{
  let score=0;const reasons:string[]=[]
  if(provider.integration_status==='connected'){score+=50;reasons.push('provider integration verified')}
  else if(provider.integration_status==='candidate'){score+=10;reasons.push('candidate only — activation remains gated')}
  if(supports(provider,need)){score+=30;reasons.push(`supports ${need}`)}
  if(market&&provider.service_regions.some(r=>r==='global'||r===market.market_code)){score+=15;reasons.push('market coverage matches')}
  if(need==='wifi'&&!provider.regulated){score+=8;reasons.push('lower-regulatory-risk access path')}
  if(need==='satellite'){score-=5;reasons.push('satellite reserved for fallback/approved use')}
  const automatic=LOW_RISK.has(need)&&provider.integration_status==='connected'&&supports(provider,need)
  return {provider,score,reasons,automatic}
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score)
}

export function marketAllows(market:Market|undefined,need:ConnectivityNeed){
 if(!market)return false
 if(need==='voice')return market.mobile_voice
 if(need==='data')return market.mobile_data
 if(need==='esim')return market.esim
 if(need==='wifi')return market.wifi
 if(need==='fixed-wireless')return market.fixed_wireless
 return market.satellite_ntn
}

export function safeFailoverPolicy(need:ConnectivityNeed){
 return {
  automatic:LOW_RISK.has(need),
  order: need==='satellite'?['satellite']:['wifi','fixed-wireless','data','satellite'],
  guardrail:LOW_RISK.has(need)
   ?'Automatic failover may switch only between already-approved connectivity paths.'
   :'Manual/provider approval required before changing regulated voice, eSIM, number, roaming or satellite service.'
 }
}
