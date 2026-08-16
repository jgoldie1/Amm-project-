export type MicroscopeMode='education'|'materials'|'biology-sim'|'forensics-fiction'|'manufacturing-qc'|'micro-world'|'ar-mr-overlay'
export type MicroscopeSource='simulated'|'camera'|'usb-microscope'|'lab-import'

export interface MicroscopeSample {
  id:string
  label:string
  source:MicroscopeSource
  safeForTeen:boolean
  scaleUm?:number
  metadata:Record<string,string|number|boolean>
}

export interface MicroscopeView {
  magnification:number
  focus:number
  contrast:number
  depthLayers:boolean
  annotations:boolean
  aiAssist:boolean
}

export interface Observation {
  sampleId:string
  labels:string[]
  confidence:number
  educationalNotes:string[]
  requiresExpertReview:boolean
}

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

export function configureMicroscopeView(magnification:number,deviceTier:'low'|'mid'|'high'|'xr'):MicroscopeView{
  return {
    magnification:clamp(magnification,1,2500),
    focus:0.5,
    contrast:0.6,
    depthLayers:['high','xr'].includes(deviceTier),
    annotations:true,
    aiAssist:true
  }
}

// AI labels are assistive/educational only. They are never a medical diagnosis or certified lab result.
export function validateObservation(o:Observation){
  return {
    ...o,
    confidence:clamp(o.confidence,0,1),
    requiresExpertReview:o.requiresExpertReview||o.confidence<0.9
  }
}

export const MICRO_WORLD_LEVELS=[
  {id:'micro-cell-city',title:'Cell City',mode:'biology-sim' as MicroscopeMode,teenSafe:true},
  {id:'micro-material-lab',title:'Material Lab',mode:'materials' as MicroscopeMode,teenSafe:true},
  {id:'micro-chip-world',title:'Chip World',mode:'manufacturing-qc' as MicroscopeMode,teenSafe:true},
  {id:'micro-crystal-caverns',title:'Crystal Caverns',mode:'micro-world' as MicroscopeMode,teenSafe:true},
  {id:'micro-mystery',title:'The Invisible Clue',mode:'forensics-fiction' as MicroscopeMode,teenSafe:true}
] as const

export const QUANTUM_MICROSCOPE_RUNTIME={
  requiredForGameplay:false,
  physicalHardwareRequired:false,
  softwareSimulationFirst:true,
  hardwareAdapters:['phone-camera','usb-microscope','future-certified-lab-device'],
  engines:['unreal','unity','godot','webxr'],
  integrations:['hologpt','quantum-cone-lens','teen-takeover','living-earth','living-space','spaceos-manufacturing','education','ar-vr-mr'],
  uses:['science-learning','materials-inspection','manufacturing-quality-control','fictional-investigation-missions','micro-scale-game-worlds','holographic-annotations'],
  guardrails:[
    'No medical diagnosis from game or consumer microscope imagery.',
    'No claim that simulated magnification reveals data not present in the source image.',
    'Certified laboratory workflows require validated hardware, calibration, methods, and qualified review.',
    'Teen Takeover only exposes age-appropriate samples and missions.'
  ]
} as const
