export type MediaKind='audio'|'video';
export const MEDIA_INTAKE_MAX_BYTES:Readonly<Record<MediaKind,number>>;
export const MEDIA_INTAKE_EXTENSIONS:Readonly<Record<MediaKind,readonly string[]>>;
export const REQUIRED_MEDIA_DECLARATIONS:readonly {id:string;label:string}[];
export interface MediaIntakeInspection {ok:boolean;kind:MediaKind;extension:string;size:number;issues:string[];rightsApproved:false;publishAuthorized:false;uploadAuthorized:false}
export function inspectMediaIntake(file:{name?:string;size?:number;type?:string;kind?:MediaKind}):MediaIntakeInspection;
export function verifyMediaSignature(bytes:Uint8Array|number[],kind:MediaKind,extension:string):boolean;
export interface MediaIntakeReceipt{schema:1;source:string;kind:MediaKind;filename:string;size:number;sha256:string;artist:string;title:string;declarations:string[];status:'AWAITING_HUMAN_RIGHTS_REVIEW';fileUploaded:false;assetStored:false;rightsVerified:false;publishAuthorized:false;distributionAuthorized:false;monetizationAuthorized:false;next:string[]}
export function createMediaIntakeReceipt(input:{name?:string;size?:number;kind?:MediaKind;sha256?:string;artist?:string;title?:string;declarations?:string[]}):MediaIntakeReceipt|null;
