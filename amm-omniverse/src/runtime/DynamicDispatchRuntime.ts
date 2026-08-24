export type DispatchPriority='routine'|'urgent'|'critical'
export type SquadRole='leader'|'medic'|'driver'|'navigator'|'communications'|'rescue'|'investigator'|'cyber'
export type DispatchCall={id:string;city:string;title:string;priority:DispatchPriority;branchId:string;weather?:string;timeOfDay?:string;roles:SquadRole[];vehicle:string;equipment:string[];missionType:string;clipOnMilestones:boolean;createdAt:number}
const KEY='tryamm_dynamic_dispatch_v1';let installed=false
const roleMap:Record<string,SquadRole[]>={
 'guardian-maritime':['leader','driver','communications','rescue'],
 'guardian-naval':['leader','navigator','communications','rescue'],
 'guardian-ground':['leader','medic','driver','communications'],
 'guardian-air':['leader','navigator','communications','rescue'],
 'guardian-investigations':['leader','investigator','communications'],
 'guardian-county':['leader','driver','communications','medic'],
 'guardian-fire-ems':['leader','medic','driver','rescue'],
 'guardian-emergency':['leader','communications','navigator','medic'],
 'guardian-cyber':['leader','cyber','investigator','communications'],
 'guardian-sar':['leader','navigator','medic','rescue'],
 'guardian-transit':['leader','driver','communications','medic'],
 'guardian-wildlife':['leader','navigator','rescue','communications'],
 'guardian-humanitarian':['leader','medic','communications','navigator']
}
const vehicleMap:Record<string,string>={
 'guardian-maritime':'Guardian Rescue Boat','guardian-naval':'Guardian Logistics Vessel','guardian-ground':'Guardian Relief SUV','guardian-air':'Guardian Rescue Aircraft','guardian-investigations':'Guardian Investigation Sedan','guardian-county':'Guardian Community SUV','guardian-fire-ems':'Guardian Rescue Truck','guardian-emergency':'Guardian Mobile Command Unit','guardian-cyber':'Guardian Cyber Response Van','guardian-sar':'Guardian Search & Rescue 4x4','guardian-transit':'Guardian Transit Response Unit','guardian-wildlife':'Guardian Ranger 4x4','guardian-humanitarian':'Guardian Aid Transport'
}
const equipmentMap:Record<string,string[]>={
 'guardian-maritime':['life rings','medical kit','radio','thermal blanket'],'guardian-air':['medical kit','radio','navigation tablet','rescue harness'],'guardian-fire-ems':['medical kit','evacuation gear','radio','protective equipment'],'guardian-cyber':['forensics laptop','secure evidence bag','MFA recovery kit','radio'],'guardian-sar':['medical kit','radio','search beacon','navigation tablet'],'guardian-investigations':['notebook','camera','evidence bags','radio']
}
function save(call:DispatchCall|null){try{call?localStorage.setItem(KEY,JSON.stringify(call)):localStorage.removeItem(KEY)}catch{};window.dispatchEvent(new CustomEvent('tryamm:dynamic-dispatch-state',{detail:{schema:'tryamm.dynamic.dispatch.v1',call}}))}
function priority(level:number,weather?:string):DispatchPriority{if((weather||'').includes('storm')||level>=12)return'critical';if(level>=5)return'urgent';return'routine'}
function make(branchId:string,city:string,level:number,weather?:string,timeOfDay?:string):DispatchCall{const branchLabel=branchId.replace('guardian-','').split('-').join(' ');return{id:`dispatch-${Date.now()}`,city,title:`${city} ${branchLabel} response`,priority:priority(level,weather),branchId,weather,timeOfDay,roles:roleMap[branchId]||['leader','driver','communications'],vehicle:vehicleMap[branchId]||'Guardian Response Vehicle',equipment:equipmentMap[branchId]||['medical kit','radio','navigation tablet'],missionType:'city-response',clipOnMilestones:true,createdAt:Date.now()}}
export function installDynamicDispatchRuntime(){if(installed||typeof window==='undefined')return;installed=true;let city='Chicago',level=1,weather='clear',timeOfDay='day';try{const old=JSON.parse(localStorage.getItem(KEY)||'null');if(old)queueMicrotask(()=>save(old))}catch{}
 window.addEventListener('tryamm:world-location-changed',(e:Event)=>{city=String((e as CustomEvent<any>).detail?.city||city)})
 window.addEventListener('tryamm:streetverse-unified-state',(e:Event)=>{level=Number((e as CustomEvent<any>).detail?.state?.level||level)})
 window.addEventListener('tryamm:streetverse-weather-state',(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};weather=String(d.weather||weather);timeOfDay=String(d.timeOfDay||timeOfDay)})
 window.addEventListener('tryamm:guardian-service-career-select',(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const call=make(String(d.branchId||'guardian-sar'),String(d.city||city),level,weather,timeOfDay);save(call);window.dispatchEvent(new CustomEvent('tryamm:dispatch-call-created',{detail:call}))})
 window.addEventListener('tryamm:career-objective-complete',(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};window.dispatchEvent(new CustomEvent('tryamm:creator-highlight-marker',{detail:{source:'streetverse-career',kind:'objective',objectiveId:d.id,at:Date.now()}}))})
 window.addEventListener('tryamm:career-boss-stage-complete',()=>window.dispatchEvent(new CustomEvent('tryamm:creator-highlight-marker',{detail:{source:'streetverse-career',kind:'boss-stage',at:Date.now()}})))
 window.addEventListener('tryamm:career-mission-verify',()=>window.dispatchEvent(new CustomEvent('tryamm:creator-highlight-marker',{detail:{source:'streetverse-career',kind:'mission-complete',at:Date.now(),autoReel:true}})))
}
