import {GAME_ENGINE_CELLS,type ForgeTarget} from '../ai/holoForgeGameEngine'

export type MonthlyGameTemplate='arcade'|'arena'|'racing'|'mission-pack'|'sports'|'story-adventure'|'holo-party'
export type MonthlyGameReleaseTarget='web'|'pwa'|'volcano-console'|'tv'|'desktop'|'mobile'|'xr'
export type MonthlyGameFactorySpec={
 id:string;title:string;template:MonthlyGameTemplate;theme:string;targetVerse:string;forgeTarget:ForgeTarget;
 releaseTargets:MonthlyGameReleaseTarget[];reuseExistingAssets:boolean;maxNewAssets:number;ratingLane:'family'|'teen'|'adult-separated';
}
export type MonthlyGameFactoryStage={id:string;label:string;automated:boolean;humanApproval:boolean;purpose:string}
export type MonthlyGameFactoryPlan={
 schema:'tryamm.monthly-game-factory.v1';spec:MonthlyGameFactorySpec;createdAt:string;factoryMode:'supervised-autonomous';
 stages:MonthlyGameFactoryStage[];releaseCadence:'monthly';volcanoPackage:true;selfBuildCoverage:string[];humanGates:string[];
}

const STAGES:MonthlyGameFactoryStage[]=[
 {id:'brief',label:'1. ABRACADABRA GAME BRIEF',automated:true,humanApproval:false,purpose:'Compile the title, audience, gameplay loop, verse rules and acceptance tests.'},
 {id:'reuse',label:'2. ASSET + CODE REUSE',automated:true,humanApproval:false,purpose:'Search TRYAMM, CC0 packs, prior games and shared systems before generating anything new.'},
 {id:'forge',label:'3. HOLO FORGE GAPS',automated:true,humanApproval:true,purpose:'Generate only missing characters, environments, VFX, audio or animations after rights review.'},
 {id:'gameplay',label:'4. GAMEPLAY COMPILER',automated:true,humanApproval:false,purpose:'Assemble movement, missions, scoring, enemies/NPCs, rewards, save state and controller mappings from templates.'},
 {id:'world',label:'5. WORLD + LEVEL ASSEMBLY',automated:true,humanApproval:false,purpose:'Compose levels, spawn points, navigation, cameras, lighting and device fallbacks.'},
 {id:'qa',label:'6. AUTONOMOUS QA',automated:true,humanApproval:false,purpose:'Run type, route, gameplay, performance, accessibility, controller and mobile smoke tests.'},
 {id:'ratings',label:'7. CONTENT + RIGHTS REVIEW',automated:true,humanApproval:true,purpose:'Verify age lane, licenses, likeness permissions, music rights and store disclosures.'},
 {id:'package',label:'8. VOLCANO PACKAGE',automated:true,humanApproval:false,purpose:'Produce one normalized game manifest for touch, gamepad, TV, desktop and XR-capable Volcano targets.'},
 {id:'commerce',label:'9. MONETIZATION GATE',automated:true,humanApproval:true,purpose:'Attach verified purchases, rewards, ads, tickets or subscriptions without client-authoritative money movement.'},
 {id:'release',label:'10. RELEASE CANDIDATE',automated:true,humanApproval:true,purpose:'Create signed/staged builds, evidence, rollback point and human release decision.'},
]

const slug=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'game'

export function buildMonthlyGameFactoryPlan(input:Partial<MonthlyGameFactorySpec>&Pick<MonthlyGameFactorySpec,'title'|'template'|'theme'>):MonthlyGameFactoryPlan{
 const spec:MonthlyGameFactorySpec={
  id:input.id||'game-'+slug(input.title),title:input.title,template:input.template,theme:input.theme,
  targetVerse:input.targetVerse||'gameverse',forgeTarget:input.forgeTarget||'mobile-safe',
  releaseTargets:input.releaseTargets?.length?input.releaseTargets:['web','pwa','volcano-console','mobile'],
  reuseExistingAssets:input.reuseExistingAssets!==false,maxNewAssets:Math.max(0,Math.min(40,input.maxNewAssets??12)),ratingLane:input.ratingLane||'family',
 }
 return{
  schema:'tryamm.monthly-game-factory.v1',spec,createdAt:new Date().toISOString(),factoryMode:'supervised-autonomous',stages:STAGES,releaseCadence:'monthly',volcanoPackage:true,
  selfBuildCoverage:[...GAME_ENGINE_CELLS.map(x=>x.label),'controller mappings','save/progression template','release evidence','rollback package'],
  humanGates:['rights/likeness approval','regulated or real-money activation','platform/store submission','final release approval'],
 }
}

export function installMonthlyGameFactoryRuntime(){
 if(typeof window==='undefined')return()=>{}
 const onRequest=(event:Event)=>{
  const input=(event as CustomEvent<Partial<MonthlyGameFactorySpec>&Pick<MonthlyGameFactorySpec,'title'|'template'|'theme'>>).detail
  if(!input?.title||!input?.template||!input?.theme)return
  const plan=buildMonthlyGameFactoryPlan(input)
  window.dispatchEvent(new CustomEvent('tryamm:monthly-game-factory-plan',{detail:plan}))
  window.dispatchEvent(new CustomEvent('tryamm:omnibox-save-request',{detail:{origin:'monthly-game-factory',contentId:plan.spec.id,kind:'game-factory-plan',payload:plan}}))
  window.dispatchEvent(new CustomEvent('tryamm:volcano-game-package-request',{detail:{gameId:plan.spec.id,title:plan.spec.title,targets:plan.spec.releaseTargets,template:plan.spec.template,source:'monthly-game-factory',humanReleaseApprovalRequired:true}}))
 }
 addEventListener('tryamm:monthly-game-factory-request',onRequest)
 window.dispatchEvent(new CustomEvent('tryamm:monthly-game-factory-ready',{detail:{version:'1.0.0',monthlyCadence:true,supervisedAutonomous:true,volcanoPackage:true,humanReleaseApprovalRequired:true}}))
 return()=>removeEventListener('tryamm:monthly-game-factory-request',onRequest)
}