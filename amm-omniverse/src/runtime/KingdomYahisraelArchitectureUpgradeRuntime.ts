import {KINGDOM_YAHISRAEL_ARCHITECTURE_SLOTS} from '../data/KingdomYahisraelArchitectureSlots'

let installed=false
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

export function queueKingdomArchitectureUpgrade(){
 if(typeof window==='undefined')return
 for(const slot of KINGDOM_YAHISRAEL_ARCHITECTURE_SLOTS){
  const functionalRequirements=[
   {id:'preserve-anchor',label:'Preserve gameplay anchor',value:slot.id,source:'gameplay-requirement'},
   {id:'preserve-interior',label:'Preserve interior program',value:slot.interior.join(' | '),source:'gameplay-requirement'},
   {id:'accessible-entry',label:'Accessible traversable entry',value:true,source:'accessibility-requirement'},
   {id:'mobile-budget',label:'Mobile-web optimized GLB',value:true,source:'gameplay-requirement'},
  ]
  emit('tryamm:mind-over-matter-original-request',{
   targetId:'kingdom-yahisrael:'+slot.id,
   targetLabel:slot.district,
   kind:'building',
   reason:'manual-original-request',
   functionalRequirements,
  })
  emit('tryamm:holoforge-request',{
   kind:'building',
   prompt:'Create an original photoreal-ready Kingdom of Yahisrael building for '+slot.district+'. Preserve the listed gameplay interior program, clear accessible entrance, mobile-web performance, collision/navigation, original or licensed materials, and do not copy protected commercial-game architecture.',
   missionId:slot.mission,
   tags:['kingdom-yahisrael','photoreal-upgrade','original-architecture','mobile-web'],
   priority:'high',
   qualityTier:'premium',
   requirements:{filename:slot.filename,targetHeightMeters:slot.targetHeightMeters,interior:slot.interior,preserveGameplayAnchors:true,requiresHumanReview:true},
  })
 }
 emit('tryamm:kingdom-architecture-upgrade-queued',{count:KINGDOM_YAHISRAEL_ARCHITECTURE_SLOTS.length,productionMutation:false,humanReviewRequired:true})
}

export function installKingdomYahisraelArchitectureUpgradeRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 addEventListener('tryamm:kingdom-architecture-upgrade-request',queueKingdomArchitectureUpgrade as EventListener)
 emit('tryamm:kingdom-architecture-upgrade-ready',{slots:KINGDOM_YAHISRAEL_ARCHITECTURE_SLOTS.length,productionGlbsPresent:false,providerArtifactRequired:true})
}
