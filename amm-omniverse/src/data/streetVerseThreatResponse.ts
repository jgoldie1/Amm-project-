export type StreetVerseThreatKind=
 |'gunfire'|'assault'|'robbery'|'vehicle-crash'|'fire'|'explosion'|'medical-emergency'|'disturbance'

export type StreetVerseThreatRole='civilian'|'security'|'police'|'medical'|'fire-rescue'

export type StreetVerseThreatAction=
 |'startle'|'freeze'|'seek-safety'|'flee'|'call-emergency'|'protect-dependent'
 |'direct-civilians'|'request-backup'|'render-first-aid'|'deescalate'|'observe-report'
 |'secure-scene'|'preserve-evidence'|'recover'

export type StreetVerseThreatEvent=Readonly<{
 id:string
 kind:StreetVerseThreatKind
 severity:number
 x?:number
 z?:number
 active:boolean
 visible?:boolean
 heard?:boolean
 source?:string
}>

export type StreetVerseThreatProfile=Readonly<{
 role:StreetVerseThreatRole
 courage:number
 training:number
 protectiveness:number
 medicalTraining:number
 deescalation:number
 evidenceAwareness:number
}>

export const BJ_STUBBS_THREAT_PROFILE:StreetVerseThreatProfile={
 role:'security',
 courage:.72,
 training:.76,
 protectiveness:.84,
 medicalTraining:.38,
 deescalation:.70,
 evidenceAwareness:.68,
}

export const DEFAULT_CIVILIAN_THREAT_PROFILE:StreetVerseThreatProfile={
 role:'civilian',
 courage:.38,
 training:.10,
 protectiveness:.50,
 medicalTraining:.10,
 deescalation:.20,
 evidenceAwareness:.20,
}

export const STREETVERSE_THREAT_RULES={
 civiliansDoNotAutoEngage:true,
 medicalAidAfterImmediateDanger:true,
 trainedCharactersPrioritizeCivilianSafety:true,
 defensiveForceRequiresMissionAuthorization:true,
 preserveEvidenceAfterThreat:true,
 noAutomaticPursuit:true,
} as const
