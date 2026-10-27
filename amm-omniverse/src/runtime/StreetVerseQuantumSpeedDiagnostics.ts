/** Quantum Speed: bounded local frame-sampling adapter for GoogleX diagnostics.
 * No external provider requests, device profiling, or automatic upload.
 */
export type FrameResult={status:'measured'|'unavailable';fps:number|null;sampleCount:number}
export function summarizeFrameTimes(times:number[]):FrameResult{
 const gaps=times.slice(1).map((t,i)=>t-times[i]).filter(x=>Number.isFinite(x)&&x>0&&x<=1000)
 if(gaps.length<3)return{status:'unavailable',fps:null,sampleCount:gaps.length}
 const sorted=[...gaps].sort((a,b)=>a-b)
 const median=sorted[Math.floor(sorted.length/2)]
 return{status:'measured',fps:Math.round(Math.min(240,1000/median)),sampleCount:gaps.length}
}
export function sampleLocalFrameRate(frames=12):Promise<FrameResult>{
 if(typeof window==='undefined'||typeof requestAnimationFrame!=='function'||document.visibilityState!=='visible')return Promise.resolve({status:'unavailable',fps:null,sampleCount:0})
 return new Promise(resolve=>{
  const times:number[]=[]
  const cap=Math.max(5,Math.min(30,Math.trunc(frames)))
  const tick=(time:number)=>{times.push(time);if(times.length>=cap)resolve(summarizeFrameTimes(times));else requestAnimationFrame(tick)}
  requestAnimationFrame(tick)
 })
}
export const QUANTUM_SPEED_GAME_POLICY=Object.freeze({noCloudRequests:true,noAutomaticProfiling:true,noDeviceIdentity:true,renderBudgetProtected:true,localOnly:true})
