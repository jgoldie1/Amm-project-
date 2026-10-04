export type QuantumLensMode='micro'|'object'|'room'|'building'|'block'|'district'|'city'|'planet'|'space'
export type HoloLensMode='scan'|'cinema'|'navigation'|'business'|'mission'

export type QuantumLensState={
  quantumMode:QuantumLensMode
  holoMode:HoloLensMode
  scale:number
  targetId?:string
  district?:string
}

const SCALE_BANDS:readonly {max:number;mode:QuantumLensMode}[]=[
  {max:.02,mode:'micro'},
  {max:.15,mode:'object'},
  {max:.8,mode:'room'},
  {max:2,mode:'building'},
  {max:8,mode:'block'},
  {max:25,mode:'district'},
  {max:120,mode:'city'},
  {max:800,mode:'planet'},
  {max:Infinity,mode:'space'},
]

declare global{
  interface Window{
    __TRYAMM_QUANTUM_HOLO_LENS__?:{
      version:string
      state:QuantumLensState
      setScale:(scale:number)=>QuantumLensState
      setHoloMode:(mode:HoloLensMode)=>QuantumLensState
      scan:(detail:Record<string,unknown>)=>void
      captureCinema:(detail?:Record<string,unknown>)=>void
    }
  }
}

const bandFor=(scale:number)=>SCALE_BANDS.find(x=>scale<=x.max)?.mode||'space'

export function installQuantumHoloLensRuntime(){
  if(typeof window==='undefined')return()=>{}
  if(window.__TRYAMM_QUANTUM_HOLO_LENS__)return()=>{}

  const state:QuantumLensState={quantumMode:'district',holoMode:'navigation',scale:16}

  const publish=()=>{
    window.dispatchEvent(new CustomEvent('tryamm:quantum-lens-state',{detail:{...state}}))
    window.dispatchEvent(new CustomEvent('tryamm:performance-budget-request',{detail:{
      source:'quantum-holo-lens',
      quantumMode:state.quantumMode,
      scale:state.scale,
      request:{
        lod:state.quantumMode==='micro'||state.quantumMode==='object'?'ultra-near':
            state.quantumMode==='room'||state.quantumMode==='building'?'near':
            state.quantumMode==='block'||state.quantumMode==='district'?'mid':'far',
        streamHighDetail:['micro','object','room','building'].includes(state.quantumMode),
        streamWideArea:['district','city','planet','space'].includes(state.quantumMode),
      }
    }}))
    window.dispatchEvent(new CustomEvent('tryamm:omnifabric-job-request',{detail:{
      id:'lens-'+Date.now(),
      lane:'render',
      kind:'quantum-lens-lod-stream',
      priority:'interactive',
      payload:{quantumMode:state.quantumMode,scale:state.scale,targetId:state.targetId,district:state.district}
    }}))
  }

  const api={
    version:'1.0.0',
    state,
    setScale:(scale:number)=>{
      state.scale=Math.max(.001,Number(scale)||1)
      state.quantumMode=bandFor(state.scale)
      publish()
      return{...state}
    },
    setHoloMode:(mode:HoloLensMode)=>{
      state.holoMode=mode
      publish()
      return{...state}
    },
    scan:(detail:Record<string,unknown>)=>{
      window.dispatchEvent(new CustomEvent('tryamm:holo-scan-request',{detail:{
        ...detail,
        quantumMode:state.quantumMode,
        holoMode:state.holoMode,
        source:'quantum-holo-lens',
      }}))
    },
    captureCinema:(detail:Record<string,unknown>={})=>{
      window.dispatchEvent(new CustomEvent('tryamm:reel-capture-request',{detail:{
        ...detail,
        origin:'quantum-holo-lens',
        cameraMode:'holo-cinema',
        quantumMode:state.quantumMode,
        target:'omnibox',
      }}))
    }
  }

  window.__TRYAMM_QUANTUM_HOLO_LENS__=api
  publish()
  window.dispatchEvent(new CustomEvent('tryamm:quantum-holo-lens-ready',{detail:{
    version:'1.0.0',
    microMacro:true,
    holoScan:true,
    holoCinema:true,
    omnifabricLod:true,
    reels:true,
  }}))

  return()=>{delete window.__TRYAMM_QUANTUM_HOLO_LENS__}
}
