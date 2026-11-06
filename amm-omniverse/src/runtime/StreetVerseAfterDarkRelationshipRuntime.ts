/** Adult-only, non-explicit roleplay interactions. Never used for minor characters. */
export type AfterDarkPartnerPose='dance'|'embrace'|'seated-together'|'partner-yoga'|'romantic-photo'
export interface AfterDarkParticipant {id:string;ageVerifiedAdult:boolean;consents:boolean}
export function canBeginAfterDarkPose(a:AfterDarkParticipant,b:AfterDarkParticipant,pose:AfterDarkPartnerPose):boolean{
  const allowed:AfterDarkPartnerPose[]=['dance','embrace','seated-together','partner-yoga','romantic-photo']
  return a.id!==b.id&&a.ageVerifiedAdult&&b.ageVerifiedAdult&&a.consents&&b.consents&&allowed.includes(pose)
}
export function createAfterDarkPoseSession(a:AfterDarkParticipant,b:AfterDarkParticipant,pose:AfterDarkPartnerPose){
  if(!canBeginAfterDarkPose(a,b,pose))return null
  return {pose,participants:[a.id,b.id],cameraMode:'non-explicit',canExitImmediately:true,fadeToBlackAvailable:true}
}
