export type PerfRouteDecision={quality:'high'|'balanced'|'data-saver';assetStrategy:'origin'|'edge-cache';computeStrategy:'client'|'background-cloud';reason:string[]}
let installed=false
function decide(detail:any):PerfRouteDecision{
 const fps=Number(detail?.metrics?.fps??detail?.fps??60),rtt=Number(detail?.metrics?.rtt??detail?.rttMs??0),quality=String(detail?.quality||'balanced') as PerfRouteDecision['quality']
 const reasons:string[]=[]
 let assetStrategy:'origin'|'edge-cache'='origin',computeStrategy:'client'|'background-cloud'='client'
 if(rtt>140){assetStrategy='edge-cache';reasons.push(`network RTT ${Math.round(rtt)}ms: prefer cached/edge assets`)}
 if(fps<45){reasons.push(`FPS ${Math.round(fps)}: reduce render cost before adding cloud compute`)}
 if(fps>=45&&rtt<140&&quality!=='data-saver')reasons.push('client rendering healthy')
 if((detail?.longTaskMs??0)>250){computeStrategy='background-cloud';reasons.push('heavy non-render work: move eligible background jobs off main thread/client')}
 return {quality,assetStrategy,computeStrategy,reason:reasons.length?reasons:['within current performance budget']}
}
export function installStreetVersePerformanceRouter(){
 if(installed||typeof window==='undefined')return;installed=true
 window.addEventListener('tryamm:quantum-lag-buster',(event:Event)=>{
  const detail=(event as CustomEvent<any>).detail||{},decision=decide(detail)
  try{localStorage.setItem('tryamm_perf_route_v1',JSON.stringify({...decision,at:Date.now()}))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:performance-route',{detail:decision}))
 })
}
export function getLastStreetVersePerformanceRoute(){try{return JSON.parse(localStorage.getItem('tryamm_perf_route_v1')||'null')}catch{return null}}
