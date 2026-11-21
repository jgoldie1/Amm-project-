export interface MusicVideoItem {schema:number;id:string;title:string;artist:string;genre?:string;description?:string;status:string;publiclyPlayable:boolean;rightsVerified:boolean;streamManifestUrl:string|null;captionsUrl:string|null;territories:string[];allowedFrom:number;allowedUntil:number;rightsChecks:Record<string,boolean>}
export interface ApprovedMusicVideo{id:string;title:string;artist:string;genre:string;description:string;streamManifestUrl:string;captionsUrl:string;rightsVerified:true}
export const PUBLIC_MUSIC_VIDEO_CATALOG:readonly MusicVideoItem[];
export const VIDEO_RIGHTS_REQUIREMENTS:readonly string[];
export const MUSIC_VIDEO_DISCOVERY_POLICY:Readonly<{model:string;artistOwnership:string;paidPlacement:string;verifiedViews:string;privacy:string;copyright:string;status:string}>;
export function createMusicVideoSubmissionDraft(input:{title?:string;artist?:string;description?:string;genre?:string}):Record<string,unknown>|null;
export function isMusicVideoPublishable(video:unknown,now?:number,territory?:string):boolean;
export function listApprovedMusicVideos(catalog?:readonly MusicVideoItem[],options?:{now?:number;territory?:string}):ApprovedMusicVideo[];
