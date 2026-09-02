export type AfterDarkDeviceProvider='lovense'|'generic-haptic'

export type AfterDarkDeviceSession={
  provider:AfterDarkDeviceProvider
  ageVerified18Plus:boolean
  afterDarkOptIn:boolean
  intimateDeviceOptIn:boolean
  privateSession:boolean
  sessionId:string
}

type HapticCommand={strength:number;durationMs:number;pattern?:string}

const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

export function authorizeAfterDarkDeviceSession(input:AfterDarkDeviceSession){
  const allowed=Boolean(input.ageVerified18Plus&&input.afterDarkOptIn&&input.intimateDeviceOptIn&&input.privateSession)
  const result={
    allowed,
    provider:input.provider,
    sessionId:input.sessionId,
    rules:{
      adultsOnly:true,
      explicitOptIn:true,
      privateSessionOnly:true,
      defaultOff:true,
      stopAlwaysAvailable:true,
      noPublicTelemetry:true,
      noAdTargeting:true,
      noOrdinaryAnalytics:true,
      noBackgroundControl:true,
    },
  }
  emit('tryamm:after-dark:device-authorized',result)
  return result
}

export function requestAfterDarkDevicePairing(input:AfterDarkDeviceSession){
  const gate=authorizeAfterDarkDeviceSession(input)
  if(!gate.allowed){
    emit('tryamm:after-dark:device-pairing-denied',{provider:input.provider,sessionId:input.sessionId})
    return gate
  }
  emit('tryamm:after-dark:device-pairing-requested',{
    provider:input.provider,
    sessionId:input.sessionId,
    adapter:'provider-permission-broker',
    requiresExternalProviderAuthorization:true,
  })
  return gate
}

export function sendAfterDarkHaptic(input:AfterDarkDeviceSession,command:HapticCommand){
  const gate=authorizeAfterDarkDeviceSession(input)
  if(!gate.allowed)return {ok:false,reason:'consent-gate'}
  const strength=Math.max(0,Math.min(1,Number(command.strength)||0))
  const durationMs=Math.max(0,Math.min(30000,Math.round(Number(command.durationMs)||0)))
  emit('tryamm:after-dark:haptic-command',{
    provider:input.provider,
    sessionId:input.sessionId,
    strength,
    durationMs,
    pattern:command.pattern??'steady',
    privateOnly:true,
  })
  return {ok:true,strength,durationMs}
}

export function stopAfterDarkDevice(sessionId:string){
  emit('tryamm:after-dark:haptic-stop',{sessionId,reason:'user-stop'})
  return {ok:true}
}

export function installAfterDarkIntimateDeviceRuntime(){
  const w=window as typeof window & {
    __afterDarkPairDevice?:typeof requestAfterDarkDevicePairing
    __afterDarkHaptic?:typeof sendAfterDarkHaptic
    __afterDarkStopDevice?:typeof stopAfterDarkDevice
  }
  w.__afterDarkPairDevice=requestAfterDarkDevicePairing
  w.__afterDarkHaptic=sendAfterDarkHaptic
  w.__afterDarkStopDevice=stopAfterDarkDevice
  emit('tryamm:after-dark:device-runtime-ready',{
    providers:['lovense','generic-haptic'],
    mode:'permission-brokered',
    liveVendorCredentialsRequired:true,
  })
}
