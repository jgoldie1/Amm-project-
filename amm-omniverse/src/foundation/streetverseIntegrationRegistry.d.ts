export const TRYAMM_MISSION_EVENT: 'tryamm:mission-local-completed'
export const RECEIPT_SCHEMA: 'tryamm.mission.local.v1'
export type MissionMode='after-dark'|'mystery'|'districts'|'shadow'|'fire'|'undercover'|'er'|'dispatch'|'homicide'
export interface LocalMissionReceipt {
 readonly schema:'tryamm.mission.local.v1'
 readonly source:'mission-arcade-local'
 readonly mode:MissionMode
 readonly missionId:string
 readonly xp:75
 readonly credits:50
 readonly authoritative:false
 readonly completedAt:string
}
export function validateMissionReceipt(input:unknown):input is LocalMissionReceipt
export function makeLocalMissionReceipt(mode:MissionMode,missionId:string,at?:Date):LocalMissionReceipt
export interface BridgeEntry {readonly id:string;readonly name:string;readonly path:string;readonly scope:string;readonly acceptance:string}
export const BRIDGES:readonly BridgeEntry[]
export interface IntegrationReport {
 schema:string
 at:string
 status:string
 authoritativeLedgerConnected:false
 liveIntegrationVerified:false
 deviceAcceptanceVerified:false
 prototypeCapabilities:{missionModes:number;scriptedStages:number;localPersistenceAvailable:boolean;reportDownloadAvailable:boolean}
 systems:(BridgeEntry&{liveVerified:boolean})[]
 warnings:string[]
}
export function buildMissionIntegrationReport(options?:{now?:Date;hasLocalStorage?:boolean;hasDownload?:boolean}):IntegrationReport
