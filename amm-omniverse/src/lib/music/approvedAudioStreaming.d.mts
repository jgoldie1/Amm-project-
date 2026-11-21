export interface ApprovedAudioTrack {schema:number;id:string;title:string;artist:string;album?:string;genre?:string;status:string;publiclyPlayable:boolean;rightsVerified:boolean;streamUrl:string|null;territories:string[];allowedFrom:number;allowedUntil:number;rightsChecks:Record<string,boolean>}
export interface AudioListeningEntry{id:string;title:string;artist:string;album:string;genre:string;streamUrl:string;rightsVerified:true}
export const PUBLIC_APPROVED_AUDIO_CATALOG:readonly ApprovedAudioTrack[];
export const AUDIO_RELEASE_REQUIREMENTS:readonly string[];
export function createAudioReviewDraft(input:{title?:string;artist?:string;genre?:string;album?:string}):Record<string,unknown>|null;
export function isAudioStreamApproved(a:unknown,now?:number,territory?:string):boolean;
export function approvedAudioTracks(catalog?:readonly ApprovedAudioTrack[],options?:{now?:number;territory?:string;query?:string;genre?:string}):AudioListeningEntry[];
