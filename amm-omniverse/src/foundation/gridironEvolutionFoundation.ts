export const GRIDIRON_EVOLUTION_FOUNDATION={
 releaseLane:'post-alpha',featureFlag:'gridironEvolution',
 progression:{earnThroughPlay:true,payToWin:false,skillTrees:true,loadouts:true,respecPolicy:'controlled',sharedCareerIdentity:true},
 draft:{transformationDraft:true,teamNeeds:true,archetypeFit:true,coachStrategy:true,rookieDevelopment:true},
 archetypeEvolution:{
  bear:['power-runner','goal-line-guardian','run-stopper'],
  panther:['speed-back','coverage-hunter','return-specialist'],
  eagle:['deep-threat','ball-hawk','field-vision'],
  viking:['power-blocker','short-yardage','front-seven-anchor']
 },
 balance:{serverAuthoritativeAbilities:true,cooldowns:true,powerBudget:true,competitiveNormalization:true,noPurchasedCompetitivePower:true},
 teamChemistry:{complementaryArchetypes:true,formationSynergy:true,coachPackages:true,counters:true},
 environment:{weatherEffects:true,stadiumConditions:true,fieldSurfaceRules:true,competitiveLimits:true},
 rivalries:{rivalryGames:true,cinematicEntrances:true,historyTracking:true,records:true},
 championshipPipeline:['tailgate','pregame','cinematic-entrance','game','halftime-show','fourth-quarter-transformation','trophy-celebration','event-replay','holo-director','highlight-reel'],
 careers:{seasons:true,tournaments:true,playoffs:true,championships:true,awards:true,records:true,scouting:true},
 accessibility:{adaptiveOneHand:true,voice:true,touch:true,gamepad:true,keyboard:true,holoHandOptional:true}
} as const
