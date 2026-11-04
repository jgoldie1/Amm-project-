import {HOLOCAD_LIVING_PRESETS,type HoloCADSubject,type HoloCADLayer} from './livingSystemsPresets'

/**
 * Deterministic, in-browser *educational* troubleshooting only.
 * Integrity measures manually toggled teaching states, not real sensor data,
 * actual airworthiness, vehicle diagnostics, a person's health or safety.
 */
export type HoloCADTrainingFault={
 id:string;label:string;layer:HoloCADLayer
 kind:'disconnected'|'simulated-fault'|'disconnected-and-fault'
 explanation:string
}
export type HoloCADTrainingDiagnostic={
 subject:HoloCADSubject
 status:'illustrative-only'
 totalParts:number
 affectedParts:number
 exerciseIntegrityPercent:number
 subsystemGroups:Array<{layer:HoloCADLayer;partCount:number;affectedCount:number}>
 faults:HoloCADTrainingFault[]
 steps:string[]
}
export function diagnoseHoloCADTraining(
 subject:HoloCADSubject,
 detached:ReadonlySet<string>,
 damaged:ReadonlySet<string>
):HoloCADTrainingDiagnostic{
 const preset=HOLOCAD_LIVING_PRESETS[subject]
 if(!preset)throw Error('Unknown simulated subject')
 const faults:HoloCADTrainingFault[]=[]
 const groups=new Map<HoloCADLayer,{layer:HoloCADLayer;partCount:number;affectedCount:number}>()
 for(const part of preset.parts){
  const disconnected=detached.has(part.id),fault=damaged.has(part.id)
  const group=groups.get(part.layer)||{layer:part.layer,partCount:0,affectedCount:0}
  group.partCount++
  if(disconnected||fault){
   group.affectedCount++
   const kind=disconnected&&fault?'disconnected-and-fault':disconnected?'disconnected':'simulated-fault'
   faults.push({
    id:part.id,label:part.label,layer:part.layer,kind,
    explanation:disconnected&&fault
     ?'Part is moved out of the model and flagged with a training fault.'
     :disconnected
      ?'Part is separated in the teardown view.'
      :'Part was marked as faulty for this practice exercise.'
   })
  }
  groups.set(part.layer,group)
 }
 const n=preset.parts.length
 const steps=faults.length===0?['No manually marked issues. This does not certify a real system.']:
  faults.slice(0,8).map((f,i)=>
   String(i+1)+'. Review '+f.label+' ('+f.layer+'); '+(
    f.kind==='disconnected'?'reinstall the schematic component.':
    f.kind==='simulated-fault'?'clear its simulated fault marker after inspection.':
    'reinstall it and clear its simulated fault marker.'
   ))
 if(faults.length>8)steps.push('Review '+(faults.length-8)+' further marked items in the parts list.')
 return{
  subject,status:'illustrative-only',totalParts:n,affectedParts:faults.length,
  exerciseIntegrityPercent:n?Math.round((1-faults.length/n)*100):0,
  subsystemGroups:[...groups.values()],
  faults,steps
 }
}
