import type {HoloRulesetId} from './HoloBattleRulesets'

export type CrossVerseLiveMode='live'|'pk'|'tournament'|'watch-party'
export type CrossVerseSide='host'|'challenger'|'spectator'

export interface CrossVerseLiveSession{
 id:string
 ruleset:HoloRulesetId
 mode:CrossVerseLiveMode
 verse:string
 arenaId:string
 hostId:string
 challengerId?:string
 liveRoomId?:string
 startedAt:number
 status:'lobby'|'live'|'finished'
}

export interface CrossVerseScore{
 host:number
 challenger:number
 round:number
}

export const createCrossVerseLiveSession=(input:Omit<CrossVerseLiveSession,'id'|'startedAt'|'status'>):CrossVerseLiveSession=>({
 ...input,id:`crossverse-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
 startedAt:Date.now(),status:'lobby',
})

export const canUsePK=(ruleset:HoloRulesetId)=>ruleset!=='faithverse'

export const CROSSVERSE_LIVE_PK_RULES={
 oneArenaOneLiveRoom:true,
 liveCanBroadcastAnyRuleset:true,
 pkUsesHostVsChallenger:true,
 faithVerseUsesChallengeNotCombatPK:true,
 spectatorsCannotMutateBattleState:true,
 giftsCannotDirectlyChangeRankedOutcome:true,
 rankedScoreRequiresServerAuthority:true,
 valuableRewardsRequireServerValidation:true,
 replayCanFeedReelComposer:true,
 tournamentCanAdvanceAcrossVerses:true,
 accessibilityCaptionsPlanned:true,
 translationPlanned:true,
 moderationRequired:true,
 minorsNeedAgeAppropriateControls:true,
} as const

export const describeCrossVerseFlow=(s:CrossVerseLiveSession)=>({
 lobby:`${s.verse} → ${s.ruleset} → ${s.mode.toUpperCase()} lobby`,
 broadcast:s.liveRoomId?`LIVE room ${s.liveRoomId} follows arena ${s.arenaId}`:'LIVE room pending',
 returnPath:'Arena result → validated score/reward → replay/Reel → return to originating Verse',
})
