export type ConstructKind='vehicle'|'building'|'npc'|'mission'|'ability'|'verse';
export type ConstructSchema={kind:ConstructKind;required:string[];runtime:string[];validation:string[]};
export const CONSTRUCT_SCHEMAS:ConstructSchema[]=[
 {kind:'vehicle',required:['body','wheels','seat','colliders'],runtime:['drive physics','damage','audio','AI driving','traffic hooks'],validation:['wheel contact','seat entry','collision sweep','mobile budget']},
 {kind:'building',required:['exterior','floors','entrances','rooms','colliders'],runtime:['doors','lighting','navigation','fire/emergency anchors','business/mission anchors'],validation:['reachable entrance','floor navigation','safe spawn','mobile LOD']},
 {kind:'npc',required:['body','rig','identity','role'],runtime:['animation','voice','memory','schedule','relationships','goals','navigation'],validation:['rating permissions','spawn budget','navigation test','fallback behavior']},
 {kind:'mission',required:['objective','location','success','failure'],runtime:['NPC roles','world events','rewards','consequences'],validation:['reachable objectives','reward authority','rating gate','rollback']},
 {kind:'ability',required:['trigger','target','physics','permissions'],runtime:['VFX','audio','cooldown','AI response','replication'],validation:['server authority','collision safety','accessibility alternate','verse rating']},
 {kind:'verse',required:['entry','laws','rating','exit'],runtime:['world state','economy policy','ability policy','NPC policy','portal routing'],validation:['safe entry/exit','identity persistence','age gate when required','failure recovery']},
];
export const WORLD_FORGER_PIPELINE=[
 'natural-language intent','select schema','generate draft','validate required components','compile runtime hooks',
 'simulate/playtest','repair failures','moderation and IP gate','performance budget','publish version','telemetry','rollback'
] as const;
export const AGENT_MODES={
 plan:['decompose feature','select schemas','estimate dependencies','produce acceptance tests'],
 ask:['explain asset','explain blueprint/event graph','trace runtime','diagnose first failing contract'],
 agent:['create/edit assets','compile','playtest','repair','verify acceptance']
} as const;
