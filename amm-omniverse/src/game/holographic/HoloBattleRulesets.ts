export type HoloRulesetId=
 |'streetverse-combat'
 |'holo-card'
 |'holo-creature'
 |'boxing'
 |'sportsverse'
 |'faithverse'
 |'holoverse-championship'

export type HoloCompetitionKind='combat'|'card'|'creature'|'sport'|'noncombat-challenge'|'mixed-championship'

export interface HoloBattleRuleset{
 id:HoloRulesetId
 title:string
 verse:string
 kind:HoloCompetitionKind
 minPlayers:number
 maxPlayers:number
 combat:boolean
 ranked:boolean
 companionAllowed:boolean
 description:string
 actions:string[]
}

export const HOLO_BATTLE_RULESETS:Record<HoloRulesetId,HoloBattleRuleset>={
 'streetverse-combat':{
  id:'streetverse-combat',title:'StreetVerse Holo Battle',verse:'StreetVerse',kind:'combat',
  minPlayers:1,maxPlayers:2,combat:true,ranked:true,companionAllowed:true,
  description:'Original fictional StreetVerse combat with blocks, dodges, counters and companion assists.',
  actions:['quick-strike','holo-burst','block','dodge','assist','retreat'],
 },
 'holo-card':{
  id:'holo-card',title:'Holo Card Battle',verse:'HoloVerse',kind:'card',
  minPlayers:1,maxPlayers:2,combat:false,ranked:true,companionAllowed:false,
  description:'Original collectible cards summon holographic units, effects and arena strategies.',
  actions:['draw','summon','activate','combine','defend','end-turn'],
 },
 'holo-creature':{
  id:'holo-creature',title:'Holo Creature Battle',verse:'HoloVerse',kind:'creature',
  minPlayers:1,maxPlayers:4,combat:true,ranked:true,companionAllowed:true,
  description:'Original TRYAMM creatures use fictional elemental and team-assist abilities.',
  actions:['ability','guard','assist','switch','item','retreat'],
 },
 boxing:{
  id:'boxing',title:'Holo Boxing',verse:'SportsVerse',kind:'sport',
  minPlayers:1,maxPlayers:2,combat:true,ranked:true,companionAllowed:false,
  description:'Sport boxing ruleset with rounds, stamina, guard, counters and decisions.',
  actions:['jab','cross','body','guard','slip','corner'],
 },
 sportsverse:{
  id:'sportsverse',title:'SportsVerse Arena',verse:'SportsVerse',kind:'sport',
  minPlayers:1,maxPlayers:20,combat:false,ranked:true,companionAllowed:false,
  description:'Shared competition entry point for original SportsVerse events and skills challenges.',
  actions:['play','pass','skill','team','timeout','finish'],
 },
 faithverse:{
  id:'faithverse',title:'FaithVerse Challenge Arena',verse:'FaithVerse',kind:'noncombat-challenge',
  minPlayers:1,maxPlayers:20,combat:false,ranked:false,companionAllowed:false,
  description:'Nonviolent scripture, history, wisdom, music, memory and service challenges.',
  actions:['answer','explore','remember','perform','serve','complete'],
 },
 'holoverse-championship':{
  id:'holoverse-championship',title:'HoloVerse Championship',verse:'HoloVerse',kind:'mixed-championship',
  minPlayers:1,maxPlayers:20,combat:false,ranked:true,companionAllowed:true,
  description:'Cross-Verse championship shell that delegates each round to its approved ruleset.',
  actions:['qualify','queue','spectate','compete','replay','advance'],
 },
}

export const getHoloRuleset=(id:HoloRulesetId)=>HOLO_BATTLE_RULESETS[id]

export const HOLO_BATTLE_PLATFORM_RULES={
 oneSharedArenaRuntime:true,
 originalTryammCharactersCardsCreatures:true,
 licensedThirdPartyContentOnlyWithPermission:true,
 faithVerseCombatDisabled:true,
 valuableRewardsRequireServerValidation:true,
 matchmakingRequiresServerAuthority:true,
 rankedResultsRequireServerAuthority:true,
 replayAndReelCapturePlanned:true,
 accessibilityProfilesPlanned:true,
 ageAppropriatePresentation:true,
} as const
