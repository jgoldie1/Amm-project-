'use strict';

const control=require('../config/velocity-control-plane.json');

function statusRank(status){return ({LIVE:0,READY:1,BUILDING:2,LOCKED:3,'COMING SOON':4})[status]??99;}

function getCapability(id){return control.capabilities.find(item=>item.id===id)||null;}

function productionFreeze({productionHealthy=true,releaseBlocked=false}={}){
  if(!productionHealthy&&control.freezeRules.freezeNewFeaturesWhenProductionRed)return true;
  if(releaseBlocked&&control.freezeRules.freezeExperimentsWhenReleaseBlocked)return true;
  return false;
}

function prioritizeWork(items=[],state={}){
  const freeze=productionFreeze(state);
  return [...items]
    .filter(item=>!freeze||item.kind==='security'||item.kind==='rollback'||item.productionCritical===true)
    .sort((a,b)=>{
      const critical=Number(Boolean(b.productionCritical))-Number(Boolean(a.productionCritical));
      if(critical)return critical;
      const capabilityA=getCapability(a.capabilityId)||{};
      const capabilityB=getCapability(b.capabilityId)||{};
      const status=statusRank(capabilityB.status)-statusRank(capabilityA.status);
      if(status)return status;
      return (a.priority??capabilityA.priority??999)-(b.priority??capabilityB.priority??999);
    });
}

function canStartWork(active=[],candidate={}){
  const bucket=candidate.productionCritical?'productionCritical':candidate.kind==='experiment'?'experiment':'feature';
  const count=active.filter(item=>(item.productionCritical?'productionCritical':item.kind==='experiment'?'experiment':'feature')===bucket).length;
  const limit=control.wipLimits[bucket];
  return {allowed:count<limit,bucket,active:count,limit};
}

function nextCriticalPath(completed=[]){
  const done=new Set(completed);
  return control.criticalPath.find(step=>!done.has(step))||null;
}

function velocitySummary(){
  const statusCounts={};
  for(const item of control.capabilities)statusCounts[item.status]=(statusCounts[item.status]||0)+1;
  return {mode:control.mode,wipLimits:{...control.wipLimits},statusCounts,priorityOrder:[...control.priorityOrder],criticalPath:[...control.criticalPath]};
}

module.exports={control,getCapability,productionFreeze,prioritizeWork,canStartWork,nextCriticalPath,velocitySummary};
