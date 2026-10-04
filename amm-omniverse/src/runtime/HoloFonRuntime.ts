import {OMNIVAULT_100_ARCHITECTURE,omniVaultCanRun,type OmniVaultWorkload} from '../data/OmniVault100Architecture'
export type HoloFonMode='hologram'|'call'|'camera'|'gallery'|'map'|'missions'|'messages'|'wallet'|'creator'|'cast'|'accessibility'
export type HoloFonCall={id:string;peerId:string;kind:'voice'|'video'|'holo';status:'ringing'|'connected'|'ended';startedAt:number}
export type HoloFonPhoto={id:string;capturedAt:number;source:'game-camera'|'selfie'|'world';consented:boolean;localUrl?:string}

export const HOLOFON_CAPABILITIES={
 holographicDisplay:true,
 inGameVoiceCalls:true,
 inGameVideoCalls:true,
 holoCalls:true,
 gameCamera:true,
 selfies:true,
 photoGallery:true,
 missionNavigation:true,
 worldMap:true,
 messages:true,
 creatorControls:true,
 omniLive:true,
 holoCast:true,
 accessibilityControls:true,
 oneHandMode:true,
 captions:true,
 translation:true,
 gameplayContinuesDuringCall:true,
 controllerInputIsolatedFromCalls:true,
 cameraAndMicRequireConsent:true,
 noAutomaticPhotoUpload:true,
 regionalCoreBackbone:true,
 omniVault100:true,
 edgeAggregation:true,
 quantumMemorySync:true,
 hologptRegionalRouting:true,
 middleverseRegionalRouting:true
} as const

export function openHoloFon(mode:HoloFonMode='hologram'){
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:holofon-open',{detail:{mode,keepGameplayActive:true}}))
 return {mode,keepGameplayActive:true}
}
export function startHoloFonCall(peerId:string,kind:HoloFonCall['kind']='voice'):HoloFonCall{
 return{id:crypto.randomUUID(),peerId,kind,status:'ringing',startedAt:Date.now()}
}
export function captureHoloFonPhoto(source:HoloFonPhoto['source'],consented:boolean):HoloFonPhoto{
 if(!consented)throw new Error('camera-consent-required')
 return{id:crypto.randomUUID(),capturedAt:Date.now(),source,consented}
}


export const HOLOFON_INFRASTRUCTURE={
 hierarchy:OMNIVAULT_100_ARCHITECTURE.hierarchy,
 regionalCore:OMNIVAULT_100_ARCHITECTURE,
 edgeFirst:true,
 cloudFallback:true,
 physicalCarrierAuthority:false,
} as const

export function routeHoloFonWorkload(workload:OmniVaultWorkload){
 const supported=omniVaultCanRun(workload)
 return{
  workload,
  supported,
  preferredLayer:supported?'omnivault-100':'approved-cloud',
  fallbackLayer:'approved-cloud',
  status:OMNIVAULT_100_ARCHITECTURE.status,
  physicalCapacityVerified:false,
 }
}

export function getHoloFonInfrastructureState(){
 return{
  capabilities:HOLOFON_CAPABILITIES,
  infrastructure:HOLOFON_INFRASTRUCTURE,
  regionalCoreStatus:OMNIVAULT_100_ARCHITECTURE.status,
  storageDesignHours:OMNIVAULT_100_ARCHITECTURE.resilience.storageDesignHours,
  truthBoundary:OMNIVAULT_100_ARCHITECTURE.truthBoundary,
 }
}
