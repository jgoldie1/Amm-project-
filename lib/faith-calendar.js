'use strict';

const clean=(v,m=300)=>String(v??'').trim().slice(0,m);
const DAY_MS=86400000;

function normalizePrefs(input={}){
  return {
    sabbathMethod:['friday-sunset-to-saturday-sunset','saturday-civil-day','custom'].includes(input.sabbathMethod)?input.sabbathMethod:'friday-sunset-to-saturday-sunset',
    customSabbathStart:clean(input.customSabbathStart,40)||null,
    customSabbathEnd:clean(input.customSabbathEnd,40)||null,
    newMoonMethod:['astronomical-conjunction','first-visible-crescent','community-declared'].includes(input.newMoonMethod)?input.newMoonMethod:'community-declared',
    timezone:clean(input.timezone,80)||'America/Chicago',
    latitude:Number.isFinite(Number(input.latitude))?Number(input.latitude):null,
    longitude:Number.isFinite(Number(input.longitude))?Number(input.longitude):null,
    reflectMode:input.reflectMode!==false,
    pauseCommerce:input.pauseCommerce===true,
    quietNotifications:input.quietNotifications!==false,
    showStudyPrompts:input.showStudyPrompts!==false,
    communityId:clean(input.communityId,160)||null
  };
}

function nextWeeklySabbath(now=new Date(),prefs={}){
  const p=normalizePrefs(prefs),d=new Date(now);
  const day=d.getUTCDay();
  if(p.sabbathMethod==='saturday-civil-day'){
    const days=(6-day+7)%7;
    const start=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+days,0,0,0));
    const end=new Date(start.getTime()+DAY_MS);
    return {start:start.toISOString(),end:end.toISOString(),method:p.sabbathMethod,approximate:true};
  }
  // Sunset requires geospatial astronomy. Until an astronomy provider is connected,
  // use an explicit configurable placeholder boundary and mark it approximate.
  const days=(5-day+7)%7;
  const start=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+days,18,0,0));
  const end=new Date(start.getTime()+DAY_MS);
  return {start:start.toISOString(),end:end.toISOString(),method:p.sabbathMethod,approximate:true,requiresAstronomyProvider:true};
}

function moonEvent(input={}){
  if(!clean(input.startsAt,60))throw new Error('startsAt_required');
  return {
    id:clean(input.id,160)||`moon_${Date.now()}`,
    startsAt:new Date(input.startsAt).toISOString(),
    endsAt:input.endsAt?new Date(input.endsAt).toISOString():null,
    method:['astronomical-conjunction','first-visible-crescent','community-declared'].includes(input.method)?input.method:'community-declared',
    declaredBy:clean(input.declaredBy,160)||null,
    source:clean(input.source,1000)||null,
    verified:input.verified===true,
    notes:clean(input.notes,1000)||null
  };
}

function observanceState({now=new Date(),sabbath,newMoon,prefs={}}={}){
  const p=normalizePrefs(prefs),t=new Date(now).getTime();
  const inWindow=e=>e&&new Date(e.start||e.startsAt).getTime()<=t&&(!e.end&&!e.endsAt?true:new Date(e.end||e.endsAt).getTime()>t);
  const sabbathActive=inWindow(sabbath),newMoonActive=inWindow(newMoon);
  return {
    sabbathActive,
    newMoonActive,
    reflectModeActive:p.reflectMode&&(sabbathActive||newMoonActive),
    ui:{reduceCommercialPrompts:p.reflectMode&&(sabbathActive||newMoonActive),quietNotifications:p.quietNotifications&&(sabbathActive||newMoonActive),showStudyPrompts:p.showStudyPrompts&&(sabbathActive||newMoonActive),commercePauseRequested:p.pauseCommerce&&(sabbathActive||newMoonActive)},
    note:'Observance preferences are user/community configurable. Calendar methods may differ among communities.'
  };
}

function studyCard(input={}){
  return {title:clean(input.title,200)||'Sabbath Study',theme:clean(input.theme,200)||'Rest, study and community',references:Array.isArray(input.references)?input.references.map(x=>clean(x,200)).filter(Boolean).slice(0,20):[],summary:clean(input.summary,2000)||null,canon:clean(input.canon,120)||'user-selected'};
}

module.exports={normalizePrefs,nextWeeklySabbath,moonEvent,observanceState,studyCard};
