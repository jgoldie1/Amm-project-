export type AccessMode='full-3d'|'mobile-lite'|'low-bandwidth-pwa'|'sms-ussd'|'community-hub'|'assisted'
export type AccessCapability={id:string;mode:AccessMode;requiresOwnedDevice:boolean;continuousLocation:boolean;offline:boolean;features:string[]}

export const STREETVERSE_ACCESS_CAPABILITIES:AccessCapability[]=[
 {id:'full-3d',mode:'full-3d',requiresOwnedDevice:true,continuousLocation:false,offline:false,features:['3d','performance','live','reels','missions']},
 {id:'mobile-lite',mode:'mobile-lite',requiresOwnedDevice:true,continuousLocation:false,offline:true,features:['missions','business','jobs','creator','delayed-sync']},
 {id:'low-bandwidth',mode:'low-bandwidth-pwa',requiresOwnedDevice:true,continuousLocation:false,offline:true,features:['text-first','compressed-media','downloadable-missions','delayed-sync']},
 {id:'sms-ussd',mode:'sms-ussd',requiresOwnedDevice:true,continuousLocation:false,offline:false,features:['jobs','mission-notices','business-check-in','account-recovery']},
 {id:'community-hub',mode:'community-hub',requiresOwnedDevice:false,continuousLocation:false,offline:true,features:['passport','training','jobs','business-onboarding','creator-capture','device-lending']},
 {id:'assisted',mode:'assisted',requiresOwnedDevice:false,continuousLocation:false,offline:true,features:['large-targets','voice','switch','one-hand','captions','text-to-speech','guided-navigation']}
]

export function chooseAccessMode(input:{webgl?:boolean;bandwidthMbps?:number;ownedDevice?:boolean;assistance?:boolean}):AccessCapability{
 if(input.assistance)return STREETVERSE_ACCESS_CAPABILITIES.find(x=>x.id==='assisted')!
 if(input.ownedDevice===false)return STREETVERSE_ACCESS_CAPABILITIES.find(x=>x.id==='community-hub')!
 if((input.bandwidthMbps??99)<1)return STREETVERSE_ACCESS_CAPABILITIES.find(x=>x.id==='low-bandwidth')!
 if(input.webgl===false)return STREETVERSE_ACCESS_CAPABILITIES.find(x=>x.id==='mobile-lite')!
 return STREETVERSE_ACCESS_CAPABILITIES.find(x=>x.id==='full-3d')!
}

export function createIRLCheckIn(detail:{experienceId:string;method:'qr'|'nfc'|'code';city:string}){
 return {experienceId:detail.experienceId,method:detail.method,city:detail.city,continuousLocation:false,verified:false,serverVerificationRequired:true}
}
