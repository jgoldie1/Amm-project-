export type CreativeAgentRole='showrunner'|'director'|'video-editor'|'music-producer'|'spatial-designer'|'localization'|'accessibility'|'rights'|'talent-scout'|'growth';
export type CreativeAgent={id:CreativeAgentRole;mission:string;canPropose:string[];mustEscalate:string[]};
export const STARVERSE_CREATIVE_COMPANY:CreativeAgent[]=[
 {id:'showrunner',mission:'turn creator intent into a coherent production plan',canPropose:['story arc','run of show','shot/track priorities'],mustEscalate:['publish','rights conflicts']},
 {id:'director',mission:'coach performance and virtual production',canPropose:['blocking','camera','lighting','stage cues'],mustEscalate:['unsafe spatial action']},
 {id:'video-editor',mission:'build reversible video edits',canPropose:['cuts','reframes','captions','reel/longform drafts'],mustEscalate:['source replacement']},
 {id:'music-producer',mission:'assist arrangement and mix without replacing creator identity',canPropose:['drums','MIDI','arrangement','mix notes'],mustEscalate:['uncleared samples']},
 {id:'spatial-designer',mission:'turn productions into reach-in MR scenes',canPropose:['room anchors','virtual props','portals','holo cues'],mustEscalate:['physical-device command']},
 {id:'localization',mission:'prepare creator-approved global versions',canPropose:['subtitle drafts','dub plan','regional metadata'],mustEscalate:['uncertain transcript']},
 {id:'accessibility',mission:'provide equivalent creation and viewing paths',canPropose:['captions','one-hand','voice','gaze','switch','reduced motion'],mustEscalate:[]},
 {id:'rights',mission:'track provenance, permissions and collaboration splits',canPropose:['rights checklist','split record'],mustEscalate:['missing permission','ownership dispute']},
 {id:'talent-scout',mission:'match verified work to opportunities',canPropose:['audition','collaboration','mentor','show'],mustEscalate:['paid casting final decision']},
 {id:'growth',mission:'learn from approved performance analytics',canPropose:['release cadence','format tests','audience follow-up'],mustEscalate:['paid spend','external posting']}
];
export const CREATIVE_COMPANY_LOOP=['creator goal','showrunner plan','specialist proposals in parallel','rights/accessibility checks','creator review','versioned production','approved publish','verified analytics','talent/growth opportunities','creator chooses next move'] as const;
