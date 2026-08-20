export type StreetVerseCharacterId =
  | 'bj'
  | 'al'
  | 'deon'
  | 'asia'
  | 'shawndell'
  | 'kenosha'
  | 'raymond_j';

export interface StreetVerseCharacter {
  id: StreetVerseCharacterId;
  displayName: string;
  role: string;
  archetype: string;
  homeZone: string;
  missionHooks: string[];
  relationshipTags: string[];
  playableLater: boolean;
}

export const STREETVERSE_CORE_CAST: StreetVerseCharacter[] = [
  {id:'bj',displayName:'BJ',role:'Street Hustler / Connector',archetype:'resourceful_networker',homeZone:'creator_market',missionHooks:['first_hustle','delivery_run','street_race_intro','creator_market_favor'],relationshipTags:['streetverse_core'],playableLater:true},
  {id:'al',displayName:'Al',role:'Builder / Property & Systems',archetype:'builder_operator',homeZone:'district_business_hub',missionHooks:['fix_the_block','spaceos_buildout','storefront_setup','district_job'],relationshipTags:['streetverse_core'],playableLater:true},
  {id:'deon',displayName:'Deon',role:'Competitor / Sports & Esports',archetype:'competitive_athlete',homeZone:'sports_hub',missionHooks:['race_rivalry','esports_qualifier','training_challenge','team_recruitment'],relationshipTags:['streetverse_core'],playableLater:true},
  {id:'asia',displayName:'Asia',role:'Trendsetter / Beauty & Fashion',archetype:'creator_tastemaker',homeZone:'holo_beauty_fashion',missionHooks:['holo_shop_launch','fashion_drop','creator_skin_collab','live_style_event'],relationshipTags:['streetverse_core'],playableLater:true},
  {id:'shawndell',displayName:'Shawndell',role:'Strategist / Operations',archetype:'strategist_operator',homeZone:'command_nexus',missionHooks:['district_strategy','supply_chain_fix','team_planning','guardian_response'],relationshipTags:['streetverse_core'],playableLater:true},
  {id:'kenosha',displayName:'Kenosha',role:'Family Matriarch / Community Anchor',archetype:'community_matriarch',homeZone:'yahavah_grocery',missionHooks:['meet_kenosha','community_meal','grocery_launch','family_legacy'],relationshipTags:['stubbs_family','community_anchor'],playableLater:false},
  {id:'raymond_j',displayName:'Raymond J',role:'Uncle / Family Advisor',archetype:'family_advisor',homeZone:'all_american_store',missionHooks:['meet_raymond_j','storefront_opening','legacy_advice','district_security_intro'],relationshipTags:['stubbs_family','legacy_advisor'],playableLater:false},
];

export interface MissionBeat {
  id: string;
  title: string;
  leadCharacterId: StreetVerseCharacterId;
  objective: string;
  unlocks: string[];
}

export const MEET_THE_STUBBS_MISSION_CHAIN: MissionBeat[] = [
  {id:'meet-the-stubbs-01',title:'Meet the Stubbs: Welcome to the Block',leadCharacterId:'kenosha',objective:'Visit the family/community hub, meet Kenosha, and learn how the district businesses and community systems connect.',unlocks:['yahavah_grocery_tour','family_legacy_codex']},
  {id:'meet-the-stubbs-02',title:'Meet the Stubbs: Raymond J at the Store',leadCharacterId:'raymond_j',objective:'Meet Raymond J at the All American Store and complete a storefront operations walkthrough.',unlocks:['all_american_store_jobs','legacy_advisor_contact']},
  {id:'meet-the-stubbs-03',title:'Meet the Stubbs: The Crew',leadCharacterId:'shawndell',objective:'Meet BJ, Al, Deon, Asia, and Shawndell and choose one of four starter lanes: business, competition, creator, or community.',unlocks:['starter_lane_business','starter_lane_competition','starter_lane_creator','starter_lane_community']},
  {id:'meet-the-stubbs-04',title:'Meet the Stubbs: Build the District',leadCharacterId:'al',objective:'Complete one mission with each core character so the player learns driving, stores, fashion, competition, jobs, LIVE, and safety systems.',unlocks:['district_story_arc_01','core_cast_relationships']},
];

export const CORE_CAST_MISSION_RULES = [
  'characters_use_world_citizen_or_deterministic_fallback_behavior_only',
  'story_relationships_do_not grant money_or_paid_rewards_without_authoritative_eligibility',
  'mission_state_persists_through canonical_player_state_and_world_saves',
  'all_new_character_content_must_reuse_existing_district_systems_until_active_slice_is_green',
  'new_characters_can_be_added_later_without changing_core_ids_or_saved_mission_state',
] as const;
