/**
 * HoloCAD WebXR capability checks.
 * WebXR sessions require HTTPS (or localhost), a compatible device, and user approval.
 * This helper never claims ordinary camera access to be real AR.
 */
export type HoloCADXRMode='immersive-ar'|'immersive-vr'
export type HoloCADXRSupport={
 ar:boolean
 vr:boolean
 reason:string
}
export type HoloCADXRAPI={
 isSessionSupported:(mode:HoloCADXRMode)=>Promise<boolean>
 requestSession:(mode:HoloCADXRMode,options?:unknown)=>Promise<unknown>
}
export function getXRAPI(nav:Navigator):HoloCADXRAPI|null{
 const api=(nav as Navigator&{xr?:HoloCADXRAPI}).xr
 return api&&typeof api.isSessionSupported==='function'&&typeof api.requestSession==='function'?api:null
}
export async function checkHoloCADXRSupport(nav:Navigator,secureContext:boolean):Promise<HoloCADXRSupport>{
 if(!secureContext)return{ar:false,vr:false,reason:'AR/VR requires a secure HTTPS page or localhost.'}
 const xr=getXRAPI(nav)
 if(!xr)return{ar:false,vr:false,reason:'WebXR is not available in this browser/device; 3D teardown remains available.'}
 const [ar,vr]=await Promise.all([
  xr.isSessionSupported('immersive-ar').catch(()=>false),
  xr.isSessionSupported('immersive-vr').catch(()=>false)
 ])
 return{ar,vr,reason:ar||vr?'Supported modes shown below; headset/device permission is required.':'No immersive AR or VR sessions supported on this device.'}
}
