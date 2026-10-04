export type ConsentScope='appearance'|'voice'|'appearance-and-voice'

export interface CharacterConsentRecord {
  consentId:string
  characterId:string
  participantName:string
  recordedAtIso:string
  statedDate:string
  statedTime:string
  statedCity:string
  scope:ConsentScope
  projectTitle:string
  recordingAssetId:string
  transcript:string
  permissionGranted:boolean
  revokedAtIso?:string
}

export const CHARACTER_CONSENT_PROMPT=(input:{participantName:string;city:string;date:string;time:string;projectTitle?:string})=>
  `My name is ${input.participantName}. Today is ${input.date}, the time is ${input.time}, and I am in ${input.city}. I give ${input.projectTitle||'TRYAMM StreetVerse'} permission to use my appearance and my voice for my character in the game. I understand this recording is kept as the permission record.`

export function validateCharacterConsent(record:CharacterConsentRecord){
  const missing:string[]=[]
  if(!record.participantName.trim())missing.push('participantName')
  if(!record.statedDate.trim())missing.push('statedDate')
  if(!record.statedTime.trim())missing.push('statedTime')
  if(!record.statedCity.trim())missing.push('statedCity')
  if(!record.recordingAssetId.trim())missing.push('recordingAssetId')
  if(!record.transcript.trim())missing.push('transcript')
  if(!record.permissionGranted)missing.push('permissionGranted')
  return {valid:missing.length===0,missing}
}

export function consentIsActive(record:CharacterConsentRecord){
  return validateCharacterConsent(record).valid&&!record.revokedAtIso
}

export interface HoloGPTConsentVault {
  saveConsentRecording(input:{recording:Blob;record:Omit<CharacterConsentRecord,'recordingAssetId'>}):Promise<CharacterConsentRecord>
  getConsent(consentId:string):Promise<CharacterConsentRecord|null>
  revokeConsent(consentId:string,revokedAtIso:string):Promise<CharacterConsentRecord>
}
