export type FabricationJobState='draft'|'simulated'|'review-required'|'approved'|'queued'|'running'|'paused'|'complete'|'rejected'
export type FabricationCapability='additive'|'multi-material'|'laser-process'|'robot-arm'|'machine-vision'|'scan'|'tool-change'|'assembly'|'finishing'|'extraction-filtration'

export interface TwelveDPrinterManifest{
 machineId:string;capabilities:FabricationCapability[];controllerVersion:string;emergencyStop:boolean;enclosureInterlock:boolean;telemetry:boolean
}
export interface FabricationJob{
 id:string;assetPassportId:string;sourceModel:string;materialProfile:string;state:FabricationJobState;
 simulationEvidence?:string;humanApproval?:string;estimatedMinutes?:number
}

export const TWELVE_D_PUBLIC_BOUNDARY={
  publicSurface:'sanitized integration contract only',
  confidentialRAndDInPublicRepo:false,
  privateVaultApi:'/api/rnd/12d-vault',
  privateVaultPublicManifest:false,
  publicReleaseEndpoint:false,
  physicalMachineCommandsFromBrowser:false,
  note:'Confidential 12D experiments, process notes, controller research and unpublished design details belong in the founder/admin private R&D vault, not the public Git repository.',
} as const

export const TWELVE_D_PRINTER_BRIDGE={
 name:'TRYAMM 12D Fabrication Bridge',
 purpose:'Connect certified TRYAMM digital assets and engineering designs to a future advanced robotic fabrication cell.',
 upstream:['Asset Forge','Asset Passport','AI Studio','StreetVerse/Omniverse digital twins','Apex/Foundry engineering review'],
 stages:['design','manufacturability-check','material-profile','toolpath-plan','digital simulation','safety review','human approval','machine queue','fabricate','machine-vision inspection','finish/assemble','quality evidence','asset/product record'],
 rule:'No AI-generated design goes directly from prompt to physical motion. Public source contains only the sanitized interface; confidential R&D remains in the private vault until an explicit future publication decision.',
}

export function canQueueFabrication(machine:TwelveDPrinterManifest,job:FabricationJob){
 const reasons:string[]=[]
 if(!machine.emergencyStop)reasons.push('missing-emergency-stop')
 if(!machine.enclosureInterlock)reasons.push('missing-interlock')
 if(!job.assetPassportId)reasons.push('missing-asset-passport')
 if(!job.simulationEvidence)reasons.push('missing-simulation')
 if(!job.humanApproval)reasons.push('missing-human-approval')
 return{allowed:reasons.length===0,reasons}
}

export const FABRICATION_EVENT_BUS=[
 'fabrication.job.drafted','fabrication.simulation.passed','fabrication.review.requested','fabrication.job.approved',
 'fabrication.job.queued','fabrication.job.started','fabrication.job.paused','fabrication.job.completed','fabrication.inspection.failed',
] as const

export const FABRICATION_SECURITY={
 network:'Machine controller lives on a segmented/local fabrication network; public app traffic never sends raw actuator commands.',
 commandBoundary:'TRYAMM sends signed job manifests to an approved controller adapter, not arbitrary G-code/robot motion from user prompts.',
 physicalSafety:'Emergency stop, interlocks, extraction/filtration and machine-specific safety procedures remain authoritative.',
 review:'Human approval required before physical fabrication. Regulated/safety-critical products require appropriate qualified engineering and compliance review.',
 provenance:'Every physical job traces back to a versioned design and Asset Passport with materials, approvals and inspection evidence.',
}

export const FUTURE_12D_CAPABILITIES=[
 'multi-material additive fabrication','robotic reach for complex geometry','laser processing where the machine is designed and certified for it',
 'automated scanning and machine vision','tool changing','assembly/finishing','closed-loop inspection','extraction/filtration',
] as const
