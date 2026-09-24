export const SPORTSVERSE_OFFICIATING_COACHING = {
 releaseLane:'post-alpha', featureFlag:'sportsverseOfficiatingCoaching',
 authority:{serverAuthoritativeClock:true,serverAuthoritativeScore:true,serverAuthoritativeRulings:true},
 officiatingModes:['ai','human','ai-assisted-human'],
 roles:['referee','assistant-referee','line-judge','table-official','scorekeeper','clock-operator','replay-official'],
 calls:['foul','penalty','out-of-bounds','violation','offside','card','possession','restart'],
 review:{instantReplay:true,humanFinalDecisionInAssistedMode:true,challengeWorkflow:true,auditRuling:true},
 coaching:{timeouts:true,substitutions:true,lineups:true,positions:true,playCalling:true,offenseDefenseAdjustments:true,teamCommunication:true,coachChallenges:true},
 matchControl:{gameClock:true,shotPlayClock:true,stopResume:true,periods:true,overtime:true,possession:true,restarts:true},
 aiFill:{players:true,coaches:true,officials:true},
 presentation:{whistleAndSignals:true,rulingOverlay:true,replayOverlay:true,commentaryMayDiscussCalls:true,commentaryCannotOverrideRuling:true},
 careers:['player','coach','referee','commentator','statistician','team-manager'],
 accessibility:{touch:true,voice:true,gamepad:true,keyboard:true,adaptiveOneHand:true,holoHand:true,noGestureRequired:true},
 sportRulePacks:{
  basketball:['personal-foul','travel','out-of-bounds','shot-clock','goaltending'],
  football:['penalty','down-distance','play-clock','possession'],
  soccer:['foul','offside','yellow-card','red-card'],
  hockey:['penalty','offside','icing'],
  volleyball:['net','line','rotation'],
  beach:['beach-volleyball','beach-soccer','beach-basketball'],
 }
} as const
