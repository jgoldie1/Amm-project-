export type TryammGraphicsBackend='webgpu'|'webgl2'|'webgl1'|'none'
export type TryammGraphicsTier='ultra'|'high'|'balanced'|'safe'

export type TryammGraphicsProfile={
  backend:TryammGraphicsBackend
  tier:TryammGraphicsTier
  webgpuAvailable:boolean
  webgl2Available:boolean
  hardwareConcurrency:number
  deviceMemoryGB:number|null
  reducedMotion:boolean
  reason:string[]
}

declare global{
  interface Window{
    __TRYAMM_GRAPHICS_PROFILE__?:TryammGraphicsProfile
  }
}

function hasWebGL2(){
  try{
    const canvas=document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2',{powerPreference:'high-performance'}))
  }catch{return false}
}

function hasWebGL1(){
  try{
    const canvas=document.createElement('canvas')
    return Boolean(canvas.getContext('webgl',{powerPreference:'high-performance'}))
  }catch{return false}
}

export async function detectTryammGraphicsProfile():Promise<TryammGraphicsProfile>{
  const nav=navigator as Navigator & {gpu?:unknown;deviceMemory?:number}
  const webgpuAvailable=Boolean(nav.gpu)
  const webgl2Available=hasWebGL2()
  const webgl1Available=hasWebGL1()
  const cores=Math.max(1,Number(nav.hardwareConcurrency||2))
  const memory=Number.isFinite(nav.deviceMemory)?Number(nav.deviceMemory):null
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false
  const reason:string[]=[]

  let backend:TryammGraphicsBackend=
    webgpuAvailable?'webgpu':
    webgl2Available?'webgl2':
    webgl1Available?'webgl1':'none'

  let tier:TryammGraphicsTier='balanced'
  if(backend==='webgpu'&&cores>=8&&(memory===null||memory>=8))tier='ultra'
  else if((backend==='webgpu'||backend==='webgl2')&&cores>=6&&(memory===null||memory>=4))tier='high'
  else if(backend==='webgl1'||cores<=2||(memory!==null&&memory<=2))tier='safe'

  if(!webgpuAvailable)reason.push('WebGPU unavailable; using WebGL fallback')
  if(!webgl2Available)reason.push('WebGL2 unavailable')
  if(reducedMotion){
    reason.push('Reduced-motion preference enabled')
    if(tier==='ultra'||tier==='high')tier='balanced'
  }
  if(memory!==null&&memory<=2)reason.push('Low-memory device profile')
  if(cores<=2)reason.push('Low CPU concurrency profile')

  return{backend,tier,webgpuAvailable,webgl2Available,hardwareConcurrency:cores,deviceMemoryGB:memory,reducedMotion,reason}
}

export async function installTryammGraphicsAccelerationRuntime(){
  if(typeof window==='undefined')return()=>{}
  const profile=await detectTryammGraphicsProfile()
  window.__TRYAMM_GRAPHICS_PROFILE__=Object.freeze(profile)

  document.documentElement.dataset.tryammGraphicsBackend=profile.backend
  document.documentElement.dataset.tryammGraphicsTier=profile.tier

  window.dispatchEvent(new CustomEvent('tryamm:graphics-profile-ready',{detail:profile}))
  window.dispatchEvent(new CustomEvent('tryamm:performance-budget-request',{detail:{
    source:'graphics-acceleration-runtime',
    backend:profile.backend,
    tier:profile.tier,
    recommendations:{
      ultra:{pixelRatio:2,traffic:'high',pedestrians:'high',shadows:'high'},
      high:{pixelRatio:1.5,traffic:'high',pedestrians:'medium',shadows:'medium'},
      balanced:{pixelRatio:1.25,traffic:'medium',pedestrians:'medium',shadows:'low'},
      safe:{pixelRatio:1,traffic:'low',pedestrians:'low',shadows:'off'},
    }[profile.tier]
  }}))

  return()=>{
    delete window.__TRYAMM_GRAPHICS_PROFILE__
    delete document.documentElement.dataset.tryammGraphicsBackend
    delete document.documentElement.dataset.tryammGraphicsTier
  }
}
