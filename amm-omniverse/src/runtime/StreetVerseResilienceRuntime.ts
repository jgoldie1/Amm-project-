export type RecoveryMode='normal'|'offline'|'safe-start'|'rollback-ready'
export type RecoverySnapshot={version:1;createdAt:number;reason:string;state:Record<string,unknown>}
export type ResilienceState={mode:RecoveryMode;online:boolean;crashCount:number;lastCrashAt?:number;lastKnownGoodSha?:string;recoveryPointAt?:number;blackout:boolean;safeStart:boolean}
const STATE_KEY='tryamm_resilience_state_v1'
const SNAPSHOT_KEY='tryamm_resilience_snapshot_v1'
const CRASH_WINDOW_MS=10*60*1000
const MAX_CRASHES_BEFORE_SAFE_START=3
let installed=false
function loadState():ResilienceState{try{return JSON.parse(localStorage.getItem(STATE_KEY)||'null')||{mode:navigator.onLine?'normal':'offline',online:navigator.onLine,crashCount:0,blackout:!navigator.onLine,safeStart:false}}catch{return{mode:navigator.onLine?'normal':'offline',online:navigator.onLine,crashCount:0,blackout:!navigator.onLine,safeStart:false}}}
function saveState(s:ResilienceState){try{localStorage.setItem(STATE_KEY,JSON.stringify(s))}catch{};window.dispatchEvent(new CustomEvent('tryamm:resilience-state',{detail:{schema:'tryamm.resilience.v1',state:s,protections:['crash-guard','blackout-mode','last-known-good','local-recovery','safe-start','rollback-ready','save-integrity','fail-closed-release-gate']}}))}
function capture(reason:string){const keys=['tryamm_streetverse_unified_v2','tryamm_guardian_mission_progress_v1','tryamm_career_extraction_v1','tryamm_dynamic_dispatch_v1','tryamm_middleverse_remote_work_v2','tryamm_global_travel_v1'];const state:Record<string,unknown>={};for(const k of keys){try{const v=localStorage.getItem(k);if(v)state[k]=JSON.parse(v)}catch{}}const snap:RecoverySnapshot={version:1,createdAt:Date.now(),reason,state};try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(snap))}catch{};return snap}
function restoreSnapshot(){try{const snap=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'null') as RecoverySnapshot|null;if(!snap)return false;Object.entries(snap.state||{}).forEach(([k,v])=>localStorage.setItem(k,JSON.stringify(v)));window.dispatchEvent(new CustomEvent('tryamm:recovery-restored',{detail:{createdAt:snap.createdAt,reason:snap.reason}}));return true}catch{return false}}
export function installStreetVerseResilienceRuntime(){if(installed||typeof window==='undefined')return;installed=true;let state=loadState();const now=Date.now();if(state.lastCrashAt&&now-state.lastCrashAt>CRASH_WINDOW_MS)state={...state,crashCount:0};capture('startup');saveState(state)
 const reportCrash=(reason:string,error?:unknown)=>{const now=Date.now(),within=state.lastCrashAt&&now-state.lastCrashAt<=CRASH_WINDOW_MS;const crashCount=(within?state.crashCount:0)+1;const safeStart=crashCount>=MAX_CRASHES_BEFORE_SAFE_START;capture(`pre-crash:${reason}`);state={...state,crashCount,lastCrashAt:now,safeStart,mode:safeStart?'safe-start':'rollback-ready'};saveState(state);window.dispatchEvent(new CustomEvent('tryamm:crash-guard',{detail:{reason,error:String((error as any)?.message||error||''),crashCount,safeStart}}))}
 window.addEventListener('error',e=>reportCrash('window-error',(e as ErrorEvent).error||e))
 window.addEventListener('unhandledrejection',e=>reportCrash('unhandled-rejection',(e as PromiseRejectionEvent).reason))
 window.addEventListener('offline',()=>{capture('network-blackout');state={...state,online:false,blackout:true,mode:'offline'};saveState(state);window.dispatchEvent(new CustomEvent('tryamm:blackout-mode',{detail:{enabled:true,readOnlyCloud:true,useLocalState:true}}))})
 window.addEventListener('online',()=>{state={...state,online:true,blackout:false,mode:state.safeStart?'safe-start':'normal'};saveState(state);window.dispatchEvent(new CustomEvent('tryamm:blackout-mode',{detail:{enabled:false,reconcile:true}}))})
 window.addEventListener('tryamm:release-verified',(e:Event)=>{const sha=String((e as CustomEvent<any>).detail?.commitSha||'');if(!sha)return;state={...state,lastKnownGoodSha:sha,recoveryPointAt:Date.now(),mode:state.safeStart?'safe-start':'normal'};capture(`last-known-good:${sha}`);saveState(state)})
 window.addEventListener('tryamm:resilience-create-checkpoint',()=>{const snap=capture('manual-checkpoint');state={...state,recoveryPointAt:snap.createdAt};saveState(state)})
 window.addEventListener('tryamm:resilience-restore-last-good',()=>{const ok=restoreSnapshot();window.dispatchEvent(new CustomEvent('tryamm:resilience-restore-result',{detail:{ok}}))})
 window.addEventListener('tryamm:resilience-exit-safe-start',()=>{state={...state,safeStart:false,crashCount:0,mode:navigator.onLine?'normal':'offline'};saveState(state)})
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')capture('page-hidden')})
 window.addEventListener('beforeunload',()=>capture('before-unload'))
}
