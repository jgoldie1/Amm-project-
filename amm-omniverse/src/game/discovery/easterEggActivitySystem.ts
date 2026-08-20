export type WorldId = 'streetverse'|'my_world'|'we_are_the_world'|'kingdom'|'starverse'|'holoverse'|'mars'
export type ActivityKind = 'sport'|'race'|'music'|'dance'|'karaoke'|'vocal_box'|'arcade'|'pinball'|'escape_room'|'pressure_gauntlet'|'creator_event'|'shopping'|'food'|'job'|'school'|'trade'|'exploration'|'mystery'|'time_travel'|'museum'|'faith'|'festival'|'nature'|'vehicle'|'building'|'social'|'photography'|'reel'|'xr'

export interface WorldActivity {
  id: string
  world: WorldId
  kind: ActivityKind
  title: string
  repeatable: boolean
  multiplayer: boolean
  worldPulseReactive: boolean
  passportXp: number
  masteryXp: number
  secretChance: number
  accessibilityEquivalentRequired: boolean
}

export interface EasterEgg {
  id: string
  worlds: WorldId[]
  hint: string
  discoveryRule: string
  reward: 'lore'|'cosmetic'|'secret_mission'|'portal'|'table'|'creator_collectible'|'world_modifier'
  canonical: boolean
}

export interface CheatDefinition {
  id: string
  label: string
  scope: 'single_player_sandbox'|'creator_test'|'developer_only'
  effect: string
  disablesPaidRewards: true
  disablesCompetitiveLeaderboards: true
  audited: true
}

// Cheats are intentionally excluded from ranked multiplayer, paid rewards and authoritative economy.
export const SAFE_CHEATS: CheatDefinition[] = [
  {id:'gravity-lite',label:'Low Gravity',scope:'single_player_sandbox',effect:'Reduce local sandbox gravity for exploration.',disablesPaidRewards:true,disablesCompetitiveLeaderboards:true,audited:true},
  {id:'holo-night',label:'Holo Night',scope:'single_player_sandbox',effect:'Force a cinematic holographic night presentation locally.',disablesPaidRewards:true,disablesCompetitiveLeaderboards:true,audited:true},
  {id:'vehicle-lab',label:'Vehicle Lab',scope:'creator_test',effect:'Spawn approved test vehicles in a private creator instance.',disablesPaidRewards:true,disablesCompetitiveLeaderboards:true,audited:true},
  {id:'world-pulse-lab',label:'World Pulse Lab',scope:'developer_only',effect:'Simulate weather/crowd/event states for QA.',disablesPaidRewards:true,disablesCompetitiveLeaderboards:true,audited:true},
  {id:'timeline-lab',label:'Timeline Lab',scope:'developer_only',effect:'Jump between approved timeline fixtures for QA.',disablesPaidRewards:true,disablesCompetitiveLeaderboards:true,audited:true},
]

export const FLAGSHIP_ACTIVITIES: WorldActivity[] = [
  {id:'sv-street-race',world:'streetverse',kind:'race',title:'Street Circuit',repeatable:true,multiplayer:true,worldPulseReactive:true,passportXp:120,masteryXp:40,secretChance:.08,accessibilityEquivalentRequired:true},
  {id:'sv-open-mic',world:'streetverse',kind:'music',title:'Open Mic & Karaoke',repeatable:true,multiplayer:true,worldPulseReactive:true,passportXp:80,masteryXp:25,secretChance:.12,accessibilityEquivalentRequired:true},
  {id:'sv-arcade',world:'streetverse',kind:'arcade',title:'Holo Arcade',repeatable:true,multiplayer:true,worldPulseReactive:true,passportXp:60,masteryXp:20,secretChance:.15,accessibilityEquivalentRequired:true},
  {id:'sv-night-mystery',world:'streetverse',kind:'mystery',title:'After Hours Mystery',repeatable:true,multiplayer:true,worldPulseReactive:true,passportXp:180,masteryXp:55,secretChance:.25,accessibilityEquivalentRequired:true},
  {id:'mw-build',world:'my_world',kind:'building',title:'Build Your World',repeatable:true,multiplayer:true,worldPulseReactive:false,passportXp:100,masteryXp:35,secretChance:.05,accessibilityEquivalentRequired:true},
  {id:'waw-festival',world:'we_are_the_world',kind:'festival',title:'Global Creator Festival',repeatable:true,multiplayer:true,worldPulseReactive:true,passportXp:140,masteryXp:45,secretChance:.10,accessibilityEquivalentRequired:true},
  {id:'kg-quest',world:'kingdom',kind:'exploration',title:'Kingdom Quest',repeatable:true,multiplayer:true,worldPulseReactive:true,passportXp:150,masteryXp:50,secretChance:.15,accessibilityEquivalentRequired:true},
  {id:'st-audition',world:'starverse',kind:'creator_event',title:'StarVerse Audition',repeatable:true,multiplayer:true,worldPulseReactive:true,passportXp:140,masteryXp:45,secretChance:.10,accessibilityEquivalentRequired:true},
  {id:'st-vocalbox',world:'starverse',kind:'vocal_box',title:'Vocal Box Studio Challenge',repeatable:true,multiplayer:true,worldPulseReactive:false,passportXp:100,masteryXp:35,secretChance:.12,accessibilityEquivalentRequired:true},
  {id:'hv-xr',world:'holoverse',kind:'xr',title:'Portal Lab',repeatable:true,multiplayer:true,worldPulseReactive:true,passportXp:160,masteryXp:50,secretChance:.20,accessibilityEquivalentRequired:true},
  {id:'mars-canyon',world:'mars',kind:'exploration',title:'Mars Canyon Expedition',repeatable:true,multiplayer:true,worldPulseReactive:true,passportXp:200,masteryXp:65,secretChance:.18,accessibilityEquivalentRequired:true},
  {id:'mars-time-echo',world:'mars',kind:'time_travel',title:'First Mars Echo',repeatable:true,multiplayer:true,worldPulseReactive:false,passportXp:220,masteryXp:70,secretChance:.30,accessibilityEquivalentRequired:true},
]

export const CROSS_WORLD_EASTER_EGGS: EasterEgg[] = [
  {id:'judah-echo',worlds:['streetverse','kingdom','holoverse'],hint:'A familiar symbol appears where three worlds overlap.',discoveryRule:'Discover the approved symbol in all three worlds in one Passport season.',reward:'secret_mission',canonical:true},
  {id:'midnight-machine',worlds:['streetverse','starverse'],hint:'Some arcade machines wake up after midnight.',discoveryRule:'Visit the Holo Arcade during the matching World Pulse event and complete the hidden input sequence.',reward:'table',canonical:true},
  {id:'mars-backstage',worlds:['mars','starverse'],hint:'The first Mars crew left an Echo for performers.',discoveryRule:'Recover the Canyon Echo then inspect the matching backstage prop.',reward:'portal',canonical:true},
  {id:'seven-worlds',worlds:['streetverse','my_world','we_are_the_world','kingdom','starverse','holoverse','mars'],hint:'Seven worlds. Seven echoes. One door.',discoveryRule:'Find one seasonal Echo in every flagship world.',reward:'world_modifier',canonical:true},
]

export interface CharacterDecisionTrace {
  characterId: string
  saw: string[]
  remembered: string[]
  felt: string[]
  wanted: string[]
  proposed: string
  reason: string
  confidence: number
  serverDecision: 'approved'|'rejected'|'fallback'
  changed: string[]
  revision: number
}

export const OPEN_WORLD_ACTIVITY_PRINCIPLES = [
  'something_interesting_within_30_seconds',
  'major_district_has_day_and_night_activity',
  'activities_react_to_world_pulse',
  'activities_feed_passport_and_world_mastery',
  'secrets_cross_link_worlds_instead_of_being_collectible_only',
  'creator_events_can_become_gameplay_after_rights_and_moderation',
  'cheats_never_touch_paid_rewards_ranked_results_or_real_money',
  'npc_mpc_world_citizen_decisions_remain_explainable',
  'sensory_clues_have_accessible_equivalents',
  'safe_exit_checkpoint_and_panic_mode_remain_available',
] as const
