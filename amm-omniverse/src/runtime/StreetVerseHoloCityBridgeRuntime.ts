import type {StreetVerseCitySimulationState,StreetVerseDistrictId} from './StreetVerseCitySimulationRuntime'

type QuantumLensState={
  quantumMode?:string
  holoMode?:string
  scale?:number
  district?:string
  targetId?:string
}

type HoloCitySnapshot={
  city:{
    population:number
    jobs:number
    businesses:number
    traffic:number
    landValue:number
    happiness:number
    treasury:number
    netFlow:number
  }
  hotspots:Array<{
    id:StreetVerseDistrictId
    label:string
    traffic:number
    safety:number
    fireCoverage:number
    health:number
    education:number
    landValue:number
    housingDemand:number
    businessDemand:number
    severity:number
  }>
}

function snapshot(state:StreetVerseCitySimulationState):HoloCitySnapshot{
  return {
    city:{
      population:state.population,
      jobs:state.jobs,
      businesses:state.businesses,
      traffic:state.traffic,
      landValue:state.landValue,
      happiness:state.happiness,
      treasury:state.treasury,
      netFlow:state.netFlow,
    },
    hotspots:Object.values(state.districts).map(d=>({
      id:d.id,
      label:d.label,
      traffic:d.traffic,
      safety:d.safety,
      fireCoverage:d.fireCoverage,
      health:d.health,
      education:d.education,
      landValue:d.landValue,
      housingDemand:d.housingDemand,
      businessDemand:d.businessDemand,
      severity:Math.max(d.traffic,1-d.safety,1-d.fireCoverage,1-d.health,1-d.power),
    })).sort((a,b)=>b.severity-a.severity),
  }
}

export function installStreetVerseHoloCityBridge(){
  if(typeof window==='undefined')return()=>{}
  let city:StreetVerseCitySimulationState|null=null
  let lens:QuantumLensState={quantumMode:'district',holoMode:'navigation',scale:16}

  const publish=(reason:string)=>{
    if(!city)return
    const data=snapshot(city)
    const focus=String(lens.district||lens.targetId||'').toLowerCase()
    const selected=data.hotspots.find(h=>focus.includes(h.id)||focus.includes(h.label.toLowerCase()))||data.hotspots[0]
    const detail={
      reason,
      source:'streetverse-holo-city-bridge',
      holographic:true,
      webxrReady:Boolean((navigator as Navigator&{xr?:unknown}).xr),
      quantumMode:lens.quantumMode||'district',
      holoMode:lens.holoMode||'navigation',
      scale:Number(lens.scale||16),
      selectedDistrict:selected,
      ...data,
    }
    window.dispatchEvent(new CustomEvent('tryamm:holo-city-state',{detail}))
    window.dispatchEvent(new CustomEvent('tryamm:omnifabric-job-request',{detail:{
      id:'holo-city-'+Date.now(),
      lane:'render',
      kind:'holo-city-digital-twin',
      priority:'interactive',
      payload:detail,
    }}))
  }

  const onCity=(event:Event)=>{
    city=(event as CustomEvent<StreetVerseCitySimulationState>).detail||null
    publish('city-update')
  }
  const onLens=(event:Event)=>{
    lens=(event as CustomEvent<QuantumLensState>).detail||lens
    publish('lens-update')
  }
  const onScan=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const kind=String(d.kind||d.type||d.target||'').toLowerCase()
    if(kind&&!(kind.includes('city')||kind.includes('district')||kind.includes('street')||kind.includes('business')))return
    publish('holo-scan')
  }
  const onOpen=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    if(d.district)lens={...lens,district:String(d.district)}
    publish('holo-open')
  }

  addEventListener('tryamm:city-simulation-state',onCity)
  addEventListener('tryamm:quantum-lens-state',onLens)
  addEventListener('tryamm:holo-scan-request',onScan)
  addEventListener('tryamm:holo-city-open',onOpen)

  window.dispatchEvent(new CustomEvent('tryamm:holo-city-bridge-ready',{detail:{
    version:'1.0.0',
    cityDigitalTwin:true,
    webxrBridge:true,
    quantumLensBridge:true,
    omnifabricRenderBridge:true,
  }}))

  return()=>{
    removeEventListener('tryamm:city-simulation-state',onCity)
    removeEventListener('tryamm:quantum-lens-state',onLens)
    removeEventListener('tryamm:holo-scan-request',onScan)
    removeEventListener('tryamm:holo-city-open',onOpen)
  }
}
