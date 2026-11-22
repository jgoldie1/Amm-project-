export const CREATOR_HANDOFF_KEY:string
export const CREATOR_HANDOFF_EVENT:string
export const CREATOR_PACKET_SCHEMA:string
export const REEL_CAPTURE_METADATA_KEY:string
export const LAST_MISSION_STORY_KEY:string
export interface LocalMissionStory{schema:string;missionId:string;mode:string;capturedAt:string;authoritative:false}
export function storeLastMissionStory(storage:Pick<Storage,'setItem'>,receipt:{schema:string;missionId:string;mode:string;completedAt:string;authoritative:boolean}):LocalMissionStory
export function readLastMissionStory(storage:Pick<Storage,'getItem'>|null|undefined):LocalMissionStory|null
export interface ReelCaptureMetadata {schema:string;fileName:string;mimeType:string;durationMs:number;capturedAt:string;mediaAttached:false;publishAuthorized:false}
export function storeReelCaptureMetadata(storage:Pick<Storage,'setItem'>,input:{fileName:string;mimeType:string;durationMs:number},at?:Date):ReelCaptureMetadata
export function readReelCaptureMetadata(storage:Pick<Storage,'getItem'>|null|undefined):ReelCaptureMetadata|null
export interface CreatorChannel {id:string;title:string;path:string;purpose:string}
export const CREATOR_CHANNELS:readonly CreatorChannel[]
export interface CreatorPacket {
 schema:string;id:string;source:string;createdAt:string;kind:string;title:string;description:string;templateId:string;businessName:string;missionId:string;worldPath:string
 reel:{status:string;fileName:string;mimeType:string;durationMs:number;mediaAttached:false}
 destinations:string[]
 clearance:{artistPermission:false;musicRights:false;participantConsent:false;locationRights:false;privacyReview:false;humanEditorialReview:false}
 status:'local-draft';publishAuthorized:false;immersiveReady:false;monetizationReady:false
}
export function createCreatorPacket(input?:{kind?:string;title?:string;description?:string;templateId?:string;businessName?:string;missionId?:string;worldPath?:string;fileName?:string;mimeType?:string;durationMs?:number},now?:Date):CreatorPacket
export function validCreatorPacket(p:unknown):p is CreatorPacket
export function saveCreatorPacket(storage:Pick<Storage,'setItem'>,packet:CreatorPacket):CreatorPacket
export function readCreatorPacket(storage:Pick<Storage,'getItem'>|null|undefined):CreatorPacket|null
export function creatorReleaseGates(p:unknown):{canPublish:false;canEnterVR:false;canSell:false;needs:string[];packetValid:boolean}
