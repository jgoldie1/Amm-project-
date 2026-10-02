export type CharacterReferenceSourceType='self-submitted'|'subject-submitted'|'authorized-photo'|'licensed-reference'|'fictional-generated'
export type CharacterReferenceStatus='not-required-fictional'|'reference-needed'|'permission-needed'|'pending-review'|'verified-authorized'

export interface CharacterReferenceAuthorization{
 characterId:string
 displayName:string
 realPerson:boolean
 sourceType:CharacterReferenceSourceType
 referencePresent:boolean
 subjectPermissionAttested:boolean
 permissionEvidenceLabel?:string
 referenceEvidenceLabel?:string
 allowedUses:string[]
 status:CharacterReferenceStatus
 updatedAt:string
}

const KEY='tryamm.streetverse.character-reference-authorization.v1'

function readAll():Record<string,CharacterReferenceAuthorization>{
 if(typeof localStorage==='undefined')return{}
 try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}
}
function writeAll(records:Record<string,CharacterReferenceAuthorization>){
 if(typeof localStorage==='undefined')return
 try{localStorage.setItem(KEY,JSON.stringify(records))}catch{}
}

export function fictionalCharacterAuthorization(characterId:string,displayName:string):CharacterReferenceAuthorization{
 return{
  characterId,displayName,realPerson:false,sourceType:'fictional-generated',
  referencePresent:true,subjectPermissionAttested:true,
  allowedUses:['gameplay','missions','promotional screenshots'],
  status:'not-required-fictional',updatedAt:new Date().toISOString(),
 }
}

export function recordCharacterReferenceAuthorization(input:{
 characterId:string
 displayName:string
 sourceType:Exclude<CharacterReferenceSourceType,'fictional-generated'>
 referencePresent:boolean
 subjectPermissionAttested:boolean
 permissionEvidenceLabel?:string
 referenceEvidenceLabel?:string
 allowedUses?:string[]
}):CharacterReferenceAuthorization{
 const status:CharacterReferenceStatus=
  !input.referencePresent?'reference-needed':
  !input.subjectPermissionAttested?'permission-needed':
  'pending-review'
 const record:CharacterReferenceAuthorization={
  characterId:input.characterId,
  displayName:input.displayName,
  realPerson:true,
  sourceType:input.sourceType,
  referencePresent:input.referencePresent,
  subjectPermissionAttested:input.subjectPermissionAttested,
  permissionEvidenceLabel:input.permissionEvidenceLabel,
  referenceEvidenceLabel:input.referenceEvidenceLabel,
  allowedUses:input.allowedUses||['gameplay'],
  status,
  updatedAt:new Date().toISOString(),
 }
 const all=readAll();all[input.characterId]=record;writeAll(all)
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:character-reference-authorization',{detail:record}))
 return record
}

export function verifyCharacterReferenceAuthorization(characterId:string):CharacterReferenceAuthorization|undefined{
 const all=readAll(),current=all[characterId]
 if(!current||!current.realPerson||!current.referencePresent||!current.subjectPermissionAttested)return current
 const verified={...current,status:'verified-authorized' as const,updatedAt:new Date().toISOString()}
 all[characterId]=verified;writeAll(all)
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:character-reference-verified',{detail:verified}))
 return verified
}

export function getCharacterReferenceAuthorization(characterId:string){
 return readAll()[characterId]
}

export function clearCharacterReferenceAuthorization(characterId:string){
 const all=readAll()
 delete all[characterId]
 writeAll(all)
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:character-reference-cleared',{detail:{characterId}}))
}

export function canClaimPhotoMatched(characterId:string){
 return getCharacterReferenceAuthorization(characterId)?.status==='verified-authorized'
}

export const CHARACTER_REFERENCE_PROOF_REQUIREMENTS=[
 'A usable visual reference for the intended likeness (front/full-body preferred; additional angles improve accuracy).',
 'A permission record showing the person authorized use of their likeness, or a self-attestation when the character is the uploader themselves.',
 'The intended uses must be recorded (for example gameplay, missions, promotional screenshots, or marketing).',
 'The project may say PHOTO-MATCHED only after the authorization record reaches verified-authorized.',
] as const

export const CHARACTER_REFERENCE_POLICY={
 fictionalCharactersNeedNoLikenessPermission:true,
 genericRigNeverEqualsPhotoMatch:true,
 realPersonPhotoMatchNeedsReference:true,
 realPersonPhotoMatchNeedsPermission:true,
 userAttestationIsEvidenceNotAutomaticLegalVerification:true,
 verificationRequiredBeforePhotoMatchedClaim:true,
} as const
