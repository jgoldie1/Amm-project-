export type ARCapability={webXR:boolean;immersiveAR:boolean;camera:boolean;orientation:boolean}
export type ARSessionState={supported:boolean;active:boolean;mode:'screen'|'ar';reason?:string}
export async function detectARCapabilities():Promise<ARCapability>{
 const nav:any=navigator
 let immersiveAR=false
 try{immersiveAR=Boolean(nav.xr&&await nav.xr.isSessionSupported?.('immersive-ar'))}catch{}
 return {webXR:Boolean(nav.xr),immersiveAR,camera:Boolean(navigator.mediaDevices?.getUserMedia),orientation:'DeviceOrientationEvent'in window}
}
export async function startARHarness():Promise<ARSessionState>{
 const nav:any=navigator
 const caps=await detectARCapabilities()
 if(!caps.immersiveAR||!nav.xr)return {supported:false,active:false,mode:'screen',reason:'Immersive AR unavailable; using screen-based XR fallback.'}
 try{
  const session=await nav.xr.requestSession('immersive-ar',{requiredFeatures:['local-floor'],optionalFeatures:['hit-test','dom-overlay']})
  window.dispatchEvent(new CustomEvent('tryamm:ar-session',{detail:{active:true,mode:'ar',session}}))
  session.addEventListener('end',()=>window.dispatchEvent(new CustomEvent('tryamm:ar-session',{detail:{active:false,mode:'screen'}})),{once:true})
  return {supported:true,active:true,mode:'ar'}
 }catch(e:any){return {supported:true,active:false,mode:'screen',reason:e?.message||'AR session could not start.'}}
}
