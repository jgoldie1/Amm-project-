export type PocketDimensionZone='command-vault'|'broadcast-studio'|'holo-stage'|'app-store'|'business-lab'|'creator-studio'|'omnicash'|'archive'|'streetverse-portal'
export type DistributionTarget='pwa'|'ios-app-store'|'google-play'|'samsung-galaxy-store'|'internal-amm-app'

export interface PocketDimensionState{
  ownerMode:'founder'
  privateByDefault:boolean
  zones:PocketDimensionZone[]
  activeZone:PocketDimensionZone
  broadcastNetwork:{live:boolean;destinations:string[];recording:boolean}
  holoOverlay:{enabled:boolean;mode:'screen-spatial-overlay';hardwareValidated:boolean}
  appDistribution:{targets:DistributionTarget[];installablePwa:boolean;nativeSubmissionRequired:boolean}
  updatedAt:string
}

const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))
const now=()=>new Date().toISOString()

const state:PocketDimensionState={
  ownerMode:'founder',
  privateByDefault:true,
  zones:['command-vault','broadcast-studio','holo-stage','app-store','business-lab','creator-studio','omnicash','archive','streetverse-portal'],
  activeZone:'command-vault',
  broadcastNetwork:{live:false,destinations:['tryamm-live','all-american-network','ctv-fast','reels','pk','holo-fon'],recording:false},
  holoOverlay:{enabled:true,mode:'screen-spatial-overlay',hardwareValidated:false},
  appDistribution:{targets:['pwa','ios-app-store','google-play','samsung-galaxy-store','internal-amm-app'],installablePwa:true,nativeSubmissionRequired:true},
  updatedAt:now(),
}

export function getFounderPocketDimensionState(){return {...state,zones:[...state.zones],broadcastNetwork:{...state.broadcastNetwork,destinations:[...state.broadcastNetwork.destinations]},appDistribution:{...state.appDistribution,targets:[...state.appDistribution.targets]}}}

export function enterPocketDimension(zone:PocketDimensionZone='command-vault'){
  state.activeZone=zone;state.updatedAt=now()
  const snapshot=getFounderPocketDimensionState()
  emit('tryamm:pocket-dimension:entered',snapshot)
  emit('tryamm:benny:overlay-request',{context:'founder-pocket-dimension',zone,mode:'robot-holographic-overlay',privacyScope:'founder',createdAt:now()})
  return snapshot
}

export function setPocketDimensionZone(zone:PocketDimensionZone){state.activeZone=zone;state.updatedAt=now();const snapshot=getFounderPocketDimensionState();emit('tryamm:pocket-dimension:zone-changed',snapshot);return snapshot}

export function startFounderBroadcast(input:{title:string;destinations?:string[];record?:boolean}){
  state.broadcastNetwork={live:true,destinations:input.destinations?.length?input.destinations:[...state.broadcastNetwork.destinations],recording:input.record===true};state.updatedAt=now()
  const session={id:`broadcast-${Date.now()}`,title:input.title,destinations:[...state.broadcastNetwork.destinations],recording:state.broadcastNetwork.recording,createdAt:now(),requiresProviderAdapters:true,rightsAndConsentRequired:true}
  emit('tryamm:founder-broadcast:started',session)
  emit('tryamm:benny:broadcast-director',{session,role:'co-host-director',overlay:'robot-holographic-overlay'})
  return session
}

export function stopFounderBroadcast(){state.broadcastNetwork.live=false;state.broadcastNetwork.recording=false;state.updatedAt=now();const snapshot=getFounderPocketDimensionState();emit('tryamm:founder-broadcast:stopped',snapshot);return snapshot}

export function requestAppInstall(input:{appId:string;target:DistributionTarget}){
  const native=input.target==='ios-app-store'||input.target==='google-play'||input.target==='samsung-galaxy-store'
  const request={...input,createdAt:now(),mode:input.target==='pwa'?'add-to-home-screen':native?'official-store-distribution':'internal-amm-app',requiresStoreReview:native,requiresSignedNativeBuild:native,canSilentlyInstall:false}
  emit('tryamm:app-store:install-request',request)
  return request
}

let installed=false
export function installFounderPocketDimensionRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  const runtime=window as unknown as Record<string,unknown>
  runtime.__enterFounderPocketDimension=enterPocketDimension
  runtime.__setPocketDimensionZone=setPocketDimensionZone
  runtime.__getFounderPocketDimensionState=getFounderPocketDimensionState
  runtime.__startFounderBroadcast=startFounderBroadcast
  runtime.__stopFounderBroadcast=stopFounderBroadcast
  runtime.__requestAMMAppInstall=requestAppInstall
  window.addEventListener('tryamm:pocket-dimension:open',()=>enterPocketDimension())
  window.addEventListener('tryamm:all-american-app-store:open',()=>setPocketDimensionZone('app-store'))
  emit('tryamm:pocket-dimension:ready',{schema:'tryamm.founder-pocket-dimension.v1',state:getFounderPocketDimensionState(),capabilities:['private-founder-command-vault','live-broadcast-network','benny-robot-holographic-overlay','all-american-app-store','business-and-saas-control','creator-studio','omnicash-link','archive-and-ip-vault','streetverse-portal'],boundaries:{softwarePocketDimension:true,literalPhysicalDimension:false,holographicHardwareRequiresCompatibleDisplay:true,appStoresRequirePlatformApproval:true,noSilentAppInstallation:true}})
}
