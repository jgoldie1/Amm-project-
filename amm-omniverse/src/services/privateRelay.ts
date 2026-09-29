import {Capacitor,registerPlugin} from '@capacitor/core'

export type PrivateRelayStatus={
  platform:'web'|'ios'|'android'
  available:boolean
  state:string
  nativeCertified:boolean
}

type NativeRelayPlugin={
  provisionIkev2(options:{gateway:string;identity:string;username:string;password:string}):Promise<{consentRequired:boolean;provisioned:boolean}>
  start():Promise<{started:boolean;session?:string}>
  stop():Promise<{stopped:boolean}>
  status():Promise<{state:string;provisioned:boolean}>
  deleteProfile():Promise<{deleted:boolean}>
}

const NativeRelay=registerPlugin<NativeRelayPlugin>('TryammPrivateRelay')

export async function getPrivateRelayStatus():Promise<PrivateRelayStatus>{
  const rawPlatform=Capacitor.getPlatform()
  const platform:PrivateRelayStatus['platform']=rawPlatform==='ios'||rawPlatform==='android'?rawPlatform:'web'
  if(!Capacitor.isNativePlatform())return{platform:'web',available:false,state:'HTTPS_ONLY',nativeCertified:false}
  if(!Capacitor.isPluginAvailable('TryammPrivateRelay'))return{platform,available:false,state:'NATIVE_PLUGIN_NOT_BUNDLED',nativeCertified:false}
  const result=await NativeRelay.status().catch(()=>({state:'UNAVAILABLE',provisioned:false}))
  return{platform,available:true,state:result.state,nativeCertified:false}
}

export async function provisionPrivateRelayIkev2(options:{gateway:string;identity:string;username:string;password:string}){
  if(!Capacitor.isNativePlatform()||!Capacitor.isPluginAvailable('TryammPrivateRelay'))throw new Error('PRIVATE_RELAY_NATIVE_PROFILE_REQUIRED')
  if(!options.gateway||!options.identity||!options.username||!options.password)throw new Error('PRIVATE_RELAY_CREDENTIALS_REQUIRED')
  return NativeRelay.provisionIkev2(options)
}

export async function startPrivateRelay(){
  if(!Capacitor.isPluginAvailable('TryammPrivateRelay'))throw new Error('PRIVATE_RELAY_NATIVE_PROFILE_REQUIRED')
  return NativeRelay.start()
}
export async function stopPrivateRelay(){
  if(!Capacitor.isPluginAvailable('TryammPrivateRelay'))throw new Error('PRIVATE_RELAY_NATIVE_PROFILE_REQUIRED')
  return NativeRelay.stop()
}