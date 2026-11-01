// Consent-first multi-view capture contract for the existing StreetVerse Character Factory.
// Photos stay on-device until the player explicitly authorizes a secure upload.
export type CaptureView='face-front'|'face-left'|'face-right'|'head-back'|'body-front'|'body-side'|'body-back';
export type CaptureRecord={view:CaptureView;blob:Blob;capturedAt:string};
export const REQUIRED_VIEWS:CaptureView[]=['face-front','face-left','face-right','head-back'];
export const OPTIONAL_VIEWS:CaptureView[]=['body-front','body-side','body-back'];
export type ScanConsent={ownerConfirmed:boolean;processingApproved:boolean;uploadApproved:boolean;voiceApproved:boolean};
export function captureChecklist(captures:CaptureRecord[]){
 const present=new Set(captures.map(x=>x.view));
 return {complete:REQUIRED_VIEWS.every(x=>present.has(x)),missing:REQUIRED_VIEWS.filter(x=>!present.has(x)),optionalMissing:OPTIONAL_VIEWS.filter(x=>!present.has(x))};
}
export function validateCapture(capture:CaptureRecord){
 if(![...REQUIRED_VIEWS,...OPTIONAL_VIEWS].includes(capture.view))throw new Error('unsupported view');
 if(!['image/jpeg','image/png','image/webp'].includes(capture.blob.type))throw new Error('unsupported image format');
 if(capture.blob.size<10000||capture.blob.size>12*1024*1024)throw new Error('image must be 10 KB to 12 MB');
 return capture;
}
export function authorizeCharacterReconstruction(captures:CaptureRecord[],consent:ScanConsent){
 if(!consent.ownerConfirmed||!consent.processingApproved)throw new Error('identity and processing consent required');
 if(!captureChecklist(captures).complete)throw new Error('front, both side profiles and rear head views required');
 captures.forEach(validateCapture);
 return {readyForLocalReview:true,uploadPermitted:consent.uploadApproved,voicePermitted:consent.voiceApproved};
}
// This module never claims to reconstruct a face or upload photos by itself.
// Production requires identity/consent enforcement, encrypted storage, deletion and a licensed 3D reconstruction service.
