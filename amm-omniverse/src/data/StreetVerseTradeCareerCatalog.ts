/** Data-first, game-only service careers. No real trade instruction or diagnosis. */
export type TradeId='plumbing'|'electrical'|'hvac'|'carpentry'|'painting'|'maintenance'|'construction'|'landscaping'
export type TradeJob={id:string;trade:TradeId;label:string;setting:string;steps:readonly string[];soundCues:readonly string[];assetProfiles:readonly string[];requiresLicensedWorkInReality:boolean;rewardKind:'preview-xp-only'}
export const STREETVERSE_TRADE_JOBS:readonly TradeJob[]=[
 {id:'village-leaky-sink',trade:'plumbing',label:'Village Apartment: Leaky Sink',setting:'fictional apartment',steps:['accept','inspect','use-game-tool','verify','complete'],soundCues:['water-drip','valve-turn','water-flow','job-complete'],assetProfiles:['sink','pipe','wrench'],requiresLicensedWorkInReality:false,rewardKind:'preview-xp-only'},
 {id:'circle-park-lighting',trade:'electrical',label:'Circle Park: Lighting Service',setting:'fictional common area',steps:['accept','inspect','request-qualified-technician','verify','complete'],soundCues:['switch-click','electric-hum','toolbox','job-complete'],assetProfiles:['light-fixture','toolbox'],requiresLicensedWorkInReality:true,rewardKind:'preview-xp-only'},
 {id:'taylor-hvac',trade:'hvac',label:'Taylor Street: Climate Comfort',setting:'fictional storefront',steps:['accept','inspect','service-animation','verify','complete'],soundCues:['hvac-fan','vent-air','job-complete'],assetProfiles:['vent','hvac-unit'],requiresLicensedWorkInReality:true,rewardKind:'preview-xp-only'},
 {id:'west-side-renovation',trade:'carpentry',label:'West Side: Renovation',setting:'fictional house',steps:['accept','inspect','craft-animation','verify','complete'],soundCues:['hammer-tap','saw-ambience','job-complete'],assetProfiles:['cabinet','hammer'],requiresLicensedWorkInReality:false,rewardKind:'preview-xp-only'},
 {id:'village-landscaping',trade:'landscaping',label:'Village Courtyard Cleanup',setting:'fictional public courtyard',steps:['accept','inspect','garden-animation','verify','complete'],soundCues:['birds','rake','job-complete'],assetProfiles:['tree','shrub','rake'],requiresLicensedWorkInReality:false,rewardKind:'preview-xp-only'},
]
export const TRADE_SOUNDS:Record<string,{caption:string;assetPath:string;licensed:boolean}>={
 'water-drip':{caption:'Water dripping',assetPath:'',licensed:false},
 'valve-turn':{caption:'Valve turning',assetPath:'',licensed:false},
 'water-flow':{caption:'Water running',assetPath:'',licensed:false},
 'switch-click':{caption:'Switch clicking',assetPath:'',licensed:false},
 'electric-hum':{caption:'Electrical equipment hum',assetPath:'',licensed:false},
 'toolbox':{caption:'Toolbox opening',assetPath:'',licensed:false},
 'hvac-fan':{caption:'Ventilation fan',assetPath:'',licensed:false},
 'vent-air':{caption:'Air flowing',assetPath:'',licensed:false},
 'hammer-tap':{caption:'Hammer tapping',assetPath:'',licensed:false},
 'saw-ambience':{caption:'Workshop sounds',assetPath:'',licensed:false},
 'birds':{caption:'Birdsong',assetPath:'',licensed:false},
 'rake':{caption:'Raking leaves',assetPath:'',licensed:false},
 'job-complete':{caption:'Job complete',assetPath:'',licensed:false},
}
export function approvedSoundCue(id:string){const sound=TRADE_SOUNDS[id];return sound?.licensed&&sound.assetPath.startsWith('/streetverse/audio/')?sound:null}
export function jobsForTrade(trade:TradeId){return STREETVERSE_TRADE_JOBS.filter(job=>job.trade===trade)}
