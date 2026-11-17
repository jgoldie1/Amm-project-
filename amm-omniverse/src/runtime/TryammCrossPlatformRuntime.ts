/**
 * Browser, PWA and Capacitor/Cordova runtime detector.
 * Do not infer native device permission merely because a wrapper is present.
 * No dependency on Cordova, plugin APIs, secret keys, or active media capture.
 */
export type NativeShell='browser'|'pwa'|'capacitor-android'|'capacitor-ios'|'cordova-android'|'cordova-ios'|'native-unknown'
export type RuntimeCapabilities={shell:NativeShell;native:boolean;pwa:boolean;webgl:boolean;webxr:boolean;cameraRequestPossible:boolean;screenCaptureRequestPossible:boolean;canExportBlob:boolean;requiresPermissionForCapture:true;nativeStreamingVerified:false;hologramHardwareVerified:false}
type Environment={displayModeStandalone?:boolean;capacitor?:{isNativePlatform?:()=>boolean;getPlatform?:()=>string};cordova?:{platformId?:string};userAgent?:string;hasWebGL?:boolean;hasXR?:boolean;hasMediaDevices?:boolean;hasMediaRecorder?:boolean;hasBlobUrl?:boolean}
export function inspectTryammCrossPlatformRuntime(input:Environment={}):RuntimeCapabilities{
 const c=input.capacitor,cordova=input.cordova,cap=Boolean(c?.isNativePlatform?.()),platform=cap?String(c?.getPlatform?.()||''):String(cordova?.platformId||'')
 const native=cap||Boolean(cordova)
 const shell:NativeShell=cap?(platform==='ios'?'capacitor-ios':platform==='android'?'capacitor-android':'native-unknown'):
   cordova?(platform==='ios'?'cordova-ios':platform==='android'?'cordova-android':'native-unknown'):
   input.displayModeStandalone?'pwa':'browser'
 return {shell,native,pwa:!native&&Boolean(input.displayModeStandalone),webgl:Boolean(input.hasWebGL),webxr:Boolean(input.hasXR),
   cameraRequestPossible:Boolean(input.hasMediaDevices),screenCaptureRequestPossible:Boolean(input.hasMediaDevices&&input.hasMediaRecorder),
   canExportBlob:Boolean(input.hasBlobUrl),requiresPermissionForCapture:true,nativeStreamingVerified:false,hologramHardwareVerified:false}
}
export function detectTryammCrossPlatformRuntime():RuntimeCapabilities{
 if(typeof window==='undefined')return inspectTryammCrossPlatformRuntime()
 const w=window as Window & {Capacitor?:Environment['capacitor'];cordova?:Environment['cordova']}
 let hasWebGL=false
 try{const canvas=document.createElement('canvas');hasWebGL=Boolean(canvas.getContext('webgl2')||canvas.getContext('webgl'))}catch{}
 return inspectTryammCrossPlatformRuntime({
  displayModeStandalone:window.matchMedia?.('(display-mode: standalone)').matches,
  capacitor:w.Capacitor,cordova:w.cordova,userAgent:navigator.userAgent,hasWebGL,
  hasXR:typeof navigator!=='undefined'&&'xr'in navigator,
  hasMediaDevices:Boolean(navigator.mediaDevices?.getUserMedia),
  hasMediaRecorder:typeof MediaRecorder!=='undefined',
  hasBlobUrl:typeof URL.createObjectURL==='function',
 })
}
