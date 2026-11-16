export type PremiereAsset='master-performance'|'reel-cuts'|'poster'|'captions'|'translations'|'stage-scene'|'camera-plan'|'lighting-cues'|'live-rundown'|'mr-experience';
export type PremiereJob={asset:PremiereAsset;owner:string;status:'planned'|'draft'|'approved'|'blocked';dependsOn:PremiereAsset[];};
export type PremierePlan={id:string;creatorId:string;title:string;goal:string;jobs:PremiereJob[];publishApproved:boolean;};

export const CREATE_ONCE_PREMIERE_TEMPLATE:PremiereJob[]=[
 {asset:'master-performance',owner:'showrunner',status:'planned',dependsOn:[]},
 {asset:'stage-scene',owner:'spatial-designer',status:'planned',dependsOn:['master-performance']},
 {asset:'camera-plan',owner:'director',status:'planned',dependsOn:['stage-scene']},
 {asset:'lighting-cues',owner:'director',status:'planned',dependsOn:['master-performance','stage-scene']},
 {asset:'captions',owner:'accessibility',status:'planned',dependsOn:['master-performance']},
 {asset:'translations',owner:'localization',status:'planned',dependsOn:['captions']},
 {asset:'reel-cuts',owner:'video-editor',status:'planned',dependsOn:['master-performance','captions']},
 {asset:'poster',owner:'growth',status:'planned',dependsOn:['master-performance']},
 {asset:'live-rundown',owner:'showrunner',status:'planned',dependsOn:['camera-plan','lighting-cues','captions']},
 {asset:'mr-experience',owner:'spatial-designer',status:'planned',dependsOn:['stage-scene','lighting-cues']}
];

export const PREMIERE_APPROVAL_GATES=[
 'creator approves master/performance identity','rights agent clears owned/licensed inputs',
 'creator reviews captions and translations','accessibility pass complete',
 'collaboration splits recorded before monetization','external distribution destinations explicitly selected',
 'LIVE/public publish requires final creator approval','physical twin commands remain separately permissioned'
] as const;

export function buildPremierePlan(creatorId:string,title:string,goal:string):PremierePlan{
 return {id:'premiere-'+Date.now(),creatorId,title,goal,jobs:CREATE_ONCE_PREMIERE_TEMPLATE.map(j=>({...j,dependsOn:[...j.dependsOn]})),publishApproved:false};
}
export function readyPremiereJobs(plan:PremierePlan){
 const approved=new Set(plan.jobs.filter(j=>j.status==='approved').map(j=>j.asset));
 return plan.jobs.filter(j=>j.status==='planned'&&j.dependsOn.every(d=>approved.has(d)));
}
