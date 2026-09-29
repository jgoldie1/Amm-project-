export type AdventureFamily='after-dark'|'spy'|'paranormal-investigation'|'justice-prison'|'detective'|'heist-defense'|'rescue'|'business'|'music'|'racing'|'global'
export interface ReusableMissionModule{
 id:string;family:AdventureFamily;acts:string[];requiredSystems:string[];ageLane:'12+'|'teen'|'adult';
 reusableAcrossCities:boolean;localizationSlots:string[];prohibited:string[];
}

export const REUSABLE_ADVENTURE_LIBRARY:ReusableMissionModule[]=[
 {id:'after-dark-night-shift',family:'after-dark',acts:['arrive','meet-contact','venue-event','choice','return'],requiredSystems:['night-cycle','music','businesses','cinematics'],ageLane:'adult',reusableAcrossCities:true,localizationSlots:['venue','music','district','characters'],prohibited:['minor-adult-mixing','illegal-service-marketplace']},
 {id:'agent-zero-seven-style',family:'spy',acts:['briefing','surveillance-puzzle','chase','infiltration-puzzle','extraction'],requiredSystems:['vehicles','stealth-gameplay','cinematics','gadgets'],ageLane:'teen',reusableAcrossCities:true,localizationSlots:['fictional-agency','district','villain','objective'],prohibited:['real operational espionage instruction','real security bypass']},
 {id:'black-suit-paranormal',family:'paranormal-investigation',acts:['anomaly','scan','interview','containment-puzzle','debrief'],requiredSystems:['scanner','npc-dialogue','effects','cinematics'],ageLane:'12+',reusableAcrossCities:true,localizationSlots:['anomaly','district','creature','agency'],prohibited:['real-person impersonation']},
 {id:'justice-inside',family:'justice-prison',acts:['intake','case-review','daily-life','hearing','reentry'],requiredSystems:['justice-sim','dialogue','career-system','education'],ageLane:'teen',reusableAcrossCities:true,localizationSlots:['fictional-facility','roles','programs'],prohibited:['escape instruction','contraband instruction','real facility security detail']},
 {id:'detective-case',family:'detective',acts:['case','evidence','interviews','deduction','resolution'],requiredSystems:['clue-graph','npc-dialogue','news'],ageLane:'teen',reusableAcrossCities:true,localizationSlots:['case','district','characters'],prohibited:['real unsolved victim exploitation without rights']},
 {id:'city-rescue',family:'rescue',acts:['dispatch','navigate','stabilize','coordinate','resolve'],requiredSystems:['traffic','npc-ai','career-system'],ageLane:'12+',reusableAcrossCities:true,localizationSlots:['incident','district','services'],prohibited:['dangerous real-world procedural instruction']},
]

export const MISSION_COMPOSER={
 rule:'Reuse gameplay grammar, not copyrighted characters, stories, dialogue, logos, agencies or distinctive protected expression.',
 compose:(modules:string[],cityId:string)=>({cityId,modules,seed:`${cityId}:${modules.join('+')}`,requiresCertification:true}),
}

export const ADVENTURE_EXPANSION_CANDIDATES=[
 'courtroom and reentry stories','emergency-response careers','archaeology/time-history adventures',
 'sports tournament stories','creator rise-to-stardom arcs','restaurant/hospitality adventures',
 'delivery/logistics challenges','cybersecurity defense puzzles','disaster-recovery/community rebuilding',
 'global treasure and cultural discovery','family legacy quests','business startup-to-expansion missions',
] as const
