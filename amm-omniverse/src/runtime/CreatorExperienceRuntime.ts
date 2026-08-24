import { onQuantumBeat, type QuantumBeatEvent } from '../services/quantumBeat'

export type CreatorContext='streetverse'|'my-world'|'kingdom'|'after-dark'|'creator-studio'|'live'|'store'|'vehicle'
export type CreatorDestination='reel'|'omnibox'|'all-american-network'|'servants-of-christ-network'|'creator-profile'

export interface CreatorAttribution {
  creatorId?:string
  artistId?:string
  productIds:string[]
  locationIds:string[]
  missionId?:string
  world:string
  context:CreatorContext
  source:string
  createdAt:string
}

export interface CreatorExperienceState {
  context:CreatorContext
  recording:boolean
  editing:boolean
  publishing:boolean
  destinations:CreatorDestination[]
  attribution:CreatorAttribution
  beat?:Pick<QuantumBeatEvent,'beat'|'bar'|'phase'|'bpm'|'mode'|'driftMs'>
}

const EVENT='tryamm:creator-experience-state'
let installed=false
let state:CreatorExperienceState={
  context:'streetverse',
  recording:false,
  editing:false,
  publishing:false,
  destinations:['reel','omnibox','creator-profile'],
  attribution:{productIds:[],locationIds:[],world:'streetverse',context:'streetverse',source:'creator-runtime',createdAt:new Date().toISOString()},
}

function publish(){window.dispatchEvent(new CustomEvent(EVENT,{detail:structuredClone(state)}))}
function mergeAttribution(next:Partial<CreatorAttribution>){
  state={...state,attribution:{...state.attribution,...next,productIds:next.productIds??state.attribution.productIds,locationIds:next.locationIds??state.attribution.locationIds}}
}

export function installCreatorExperienceRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true

  const onOpen=(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const context=(d.context||d.source||'streetverse') as CreatorContext
    state={...state,context,editing:false,publishing:false,attribution:{...state.attribution,context,world:String(d.world||context),missionId:d.missionId||state.attribution.missionId,source:String(d.source||'media-studio'),createdAt:new Date().toISOString()}}
    publish()
  }
  const onCaptureStart=(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    state={...state,recording:true,editing:false,publishing:false}
    mergeAttribution({missionId:d.missionId,world:String(d.world||state.attribution.world),source:String(d.source||'capture')})
    publish()
  }
  const onCaptureStop=()=>{state={...state,recording:false,editing:true};publish()}
  const onTags=(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    mergeAttribution({creatorId:d.creatorId,artistId:d.artistId,productIds:Array.isArray(d.productIds)?d.productIds:undefined,locationIds:Array.isArray(d.locationIds)?d.locationIds:undefined,missionId:d.missionId})
    publish()
  }
  const onPublishQueued=(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    state={...state,recording:false,editing:false,publishing:true,destinations:Array.isArray(d.destinations)?d.destinations:state.destinations}
    mergeAttribution({source:String(d.source||'media-studio-publish')})
    window.dispatchEvent(new CustomEvent('tryamm:creator-attribution-ready',{detail:{draft:d,attribution:state.attribution,destinations:state.destinations}}))
    publish()
  }
  const onPublishDone=()=>{state={...state,publishing:false};publish()}
  const onCommerce=(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    window.dispatchEvent(new CustomEvent('tryamm:creator-commerce-attribution',{detail:{
      attribution:state.attribution,
      eventType:String(d.eventType||'commerce'),
      productId:d.productId||null,
      orderId:d.orderId||null,
      verified:Boolean(d.verified),
      amount:d.amount??null,
      occurredAt:new Date().toISOString(),
      requiresServerSettlement:true,
    }}))
  }

  window.addEventListener('tryamm:media-studio-open',onOpen)
  window.addEventListener('tryamm:creator-capture-start',onCaptureStart)
  window.addEventListener('tryamm:creator-capture-stop',onCaptureStop)
  window.addEventListener('tryamm:creator-tags-updated',onTags)
  window.addEventListener('tryamm:media-publish-queued',onPublishQueued)
  window.addEventListener('tryamm:media-cloud-saved',onPublishDone)
  window.addEventListener('tryamm:media-cloud-error',onPublishDone)
  window.addEventListener('tryamm:verified-commerce-event',onCommerce)

  onQuantumBeat(beat=>{
    state={...state,beat:{beat:beat.beat,bar:beat.bar,phase:beat.phase,bpm:beat.bpm,mode:beat.mode,driftMs:beat.driftMs}}
    window.dispatchEvent(new CustomEvent('tryamm:creator-beat-sync',{detail:{context:state.context,beat:state.beat}}))
  })

  ;(window as any).__tryammCreatorRuntime={
    getState:()=>structuredClone(state),
    setContext:(context:CreatorContext)=>{state={...state,context,attribution:{...state.attribution,context,world:context}};publish()},
    tag:(input:Partial<CreatorAttribution>)=>{mergeAttribution(input);publish()},
  }

  publish()
}
