export const GRIDIRON_DUAL_MODE_FOUNDATION={
 releaseLane:'post-alpha',featureFlag:'gridironDualMode',
 modes:{
  regular:{id:'gridiron-kingdom',standardRules:true,transformations:false},
  legends:{id:'gridiron-legends',standardRules:true,transformations:true,originalFictionalBranding:true}
 },
 sharedEngine:['physics','networking','clock','downs','possession','scoring','officiating','coaching','replay','career'],
 archetypes:{
  bear:{traits:['power','break-tackle','run-stop']},
  panther:{traits:['speed','agility','pursuit']},
  eagle:{traits:['aerial','vision','catch-radius']},
  viking:{traits:['strength','blocking','short-yardage']}
 },
 transformation:{meter:true,serverAuthoritative:true,powerWindows:true,cooldowns:true,returnToBaseForm:true,noClientAbilityMinting:true},
 strategy:{coachTransformationPackages:true,counters:true,timeoutPlanning:true,substitutions:true},
 officiating:{abilityRulePack:true,transformationFouls:true,replayReview:true,serverAuthoritativeRulings:true},
 progression:{sharedPlayerIdentity:true,separateModeStats:true,careerHistory:true,seasons:true,tournaments:true,championships:true},
 creator:{eventReplay:true,holoDirector:true,automaticHighlights:true,reels:true},
 accessibility:{adaptiveOneHand:true,voice:true,touch:true,gamepad:true,keyboard:true,holoHandOptional:true},
 rights:{useOriginalFictionalTeamsByDefault:true,licensedThirdPartyBrandingOnly:true}
} as const
