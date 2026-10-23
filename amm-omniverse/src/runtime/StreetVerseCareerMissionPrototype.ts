export type CareerId='agent-007'|'mib'|'law-enforcement'|'government'
export type CareerMission={career:CareerId;stage:0|1|2|3;updatedAt:string}
const KEY='tryamm.streetverse.career-mission.v1'
export const CAREER_MISSIONS:Record<CareerId,{title:string;steps:[string,string,string]}>={
 'agent-007':{title:'Chicago Undercover',steps:['Receive the briefing','Interview the contact','Review the evidence']},
 'mib':{title:'Anomaly Watch',steps:['Receive anomaly alert','Interview the witness','Log the anomaly']},
 'law-enforcement':{title:'Community Response',steps:['Receive dispatch','Speak with the resident','Complete the incident report']},
 'government':{title:'Neighborhood Services',steps:['Review a service request','Meet the community liaison','File the response']}
}
export function loadCareerMission():CareerMission|null{
 try{const raw=localStorage.getItem(KEY);if(!raw)return null;const v=JSON.parse(raw);if(!v||typeof v!=='object'||typeof v.career!=='string'||!Object.prototype.hasOwnProperty.call(CAREER_MISSIONS,v.career)||![0,1,2,3].includes(v.stage)||typeof v.updatedAt!=='string')return null;return v}catch{return null}
}
export function startCareerMission(career:CareerId):CareerMission{
 const mission:CareerMission={career,stage:0,updatedAt:new Date().toISOString()}
 try{localStorage.setItem(KEY,JSON.stringify(mission))}catch{}
 return mission
}
export function advanceCareerMission(mission:CareerMission):CareerMission{
 const next={...mission,stage:Math.min(3,mission.stage+1) as CareerMission['stage'],updatedAt:new Date().toISOString()}
 try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}
 return next
}
