import type {FabricationJob,TwelveDPrinterManifest} from './TwelveDPrinterBridge'

export interface PhysicalTwinInspection{
 jobId:string;designVersion:string;inspectionId:string;timestamp:string;
 dimensionalPass:boolean;materialVerified:boolean;visualPass:boolean;functionalPass?:boolean;
 deviations:string[];evidenceRefs:string[]
}
export interface FabricationReleaseEvidence{
 machineCalibrationCurrent:boolean;maintenanceCurrent:boolean;operatorAuthorized:boolean;
 materialLotTraceable:boolean;environmentSafe:boolean;simulationPassed:boolean;humanApproval:boolean;
 inspectionPlanPresent:boolean;rollbackOrSafeStopPlan:boolean
}

export function physicalReleaseGate(machine:TwelveDPrinterManifest,job:FabricationJob,e:FabricationReleaseEvidence){
 const reasons:string[]=[]
 if(!machine.emergencyStop)reasons.push('emergency-stop')
 if(!machine.enclosureInterlock)reasons.push('interlock')
 if(!e.machineCalibrationCurrent)reasons.push('calibration')
 if(!e.maintenanceCurrent)reasons.push('maintenance')
 if(!e.operatorAuthorized)reasons.push('operator-authorization')
 if(!e.materialLotTraceable)reasons.push('material-traceability')
 if(!e.environmentSafe)reasons.push('environment')
 if(!e.simulationPassed||!job.simulationEvidence)reasons.push('simulation')
 if(!e.humanApproval||!job.humanApproval)reasons.push('human-approval')
 if(!e.inspectionPlanPresent)reasons.push('inspection-plan')
 if(!e.rollbackOrSafeStopPlan)reasons.push('safe-stop-plan')
 return{released:reasons.length===0,reasons}
}

export function reconcilePhysicalTwin(i:PhysicalTwinInspection){
 const passed=i.dimensionalPass&&i.materialVerified&&i.visualPass&&(i.functionalPass??true)&&i.deviations.length===0
 return{jobId:i.jobId,designVersion:i.designVersion,status:passed?'verified-physical-twin':'quarantine-review',evidenceRefs:i.evidenceRefs,deviations:i.deviations}
}

export const DETRIMENTAL_RISK_CONTROLS={
 changeControl:['version every design','freeze approved manufacturing revision','require re-simulation after geometry/material/process changes'],
 machineHealth:['calibration schedule','preventive maintenance','tool-life tracking','sensor self-test','power-loss safe state'],
 quality:['first-article inspection','dimensional tolerances','material lot traceability','nonconformance quarantine','rework/scrap record'],
 cyber:['segmented controller network','signed manifests','allowlisted controller adapter','least privilege','audit log','no public raw motion endpoint'],
 operations:['authorized operator','preflight checklist','emergency stop drill','fire/extraction controls appropriate to process','safe pause/resume'],
 business:['job cost estimate','material/energy/time record','inventory reservation','customer approval where applicable','warranty/returns evidence'],
 continuity:['offline-safe controller','checkpoint/recovery','backup design history','disaster recovery','spare tooling/critical parts plan'],
 compliance:['machine/process-specific safety review','qualified engineering review for safety-critical parts','applicable product/material/environmental requirements before sale or deployment'],
} as const

export const DIGITAL_PHYSICAL_TWIN_LOOP=[
 'certified digital design','manufacturing revision lock','simulation','release gate','fabrication','machine-vision/metrology inspection',
 'physical-twin reconciliation','quarantine deviations','approved correction','update engineering history','only then release product/part',
] as const
