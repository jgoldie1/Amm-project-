export type CareerId='agent-007'|'mib'|'law-enforcement'|'government'|'cia'|'fbi'
export type CareerMission={career:CareerId;stage:0|1|2|3;updatedAt:string}
const KEY='tryamm.streetverse.career-mission.v1'
const CONFIRMATION_EVENTS=['tryamm:streetverse-career-briefing-confirmed','tryamm:streetverse-career-npc-interaction-confirmed','tryamm:streetverse-career-evidence-confirmed'] as const
export const CAREER_MISSIONS:Record<CareerId,{title:string;steps:[string,string,string]}>={
 'agent-007':{title:'Chicago Undercover',steps:['Receive the briefing','Interview the contact','Review the evidence']},
 'mib':{title:'Anomaly Watch',steps:['Receive anomaly alert','Interview the witness','Log the anomaly']},
 'law-enforcement':{title:'Community Response',steps:['Receive dispatch','Speak with the resident','Complete the incident report']},
 'government':{title:'Neighborhood Services',steps:['Review a service request','Meet the community liaison','File the response']},
 'cia':{title:'Operation Lakefront Cipher',steps:['Receive a fictional intelligence briefing','Question the undercover contact','Analyze the encrypted dossier']},
 'fbi':{title:'Chicago Federal Case',steps:['Receive a fictional federal case assignment','Interview a cooperating witness','Catalog the case evidence']}
}
export const CAREER_SCENES:Record<CareerId,{briefing:string;witness:string;evidence:string}>={
 'agent-007':{briefing:'A fictional handler assigns you to a lakefront surveillance case.',witness:'A dock worker recalls a blue van arriving before dawn.',evidence:'A time-stamped dock receipt confirms a delivery window.'},
 'mib':{briefing:'An unusual light was reported above the Chicago lakefront.',witness:'A witness describes a silent object moving across the sky.',evidence:'A weather log and blurry photograph require comparison.'},
 'law-enforcement':{briefing:'A resident requests help locating a missing community item.',witness:'A neighbor remembers the last known location.',evidence:'A dated community-center sign-in sheet narrows the search.'},
 'government':{briefing:'A neighborhood service request needs investigation.',witness:'A local liaison explains the accessibility concern.',evidence:'A maintenance report records the original complaint.'},
 'cia':{briefing:'A fictional analyst assigns Operation Lakefront Cipher.',witness:'An undercover contact describes an unusual coded message.',evidence:'A redacted dossier includes a timestamped transmission.'},
 'fbi':{briefing:'A fictional federal case team requests a Chicago interview.',witness:'A cooperating witness describes a suspicious delivery.',evidence:'An evidence log identifies the chain of custody for a package.'}
}
export function getCareerScene(career:CareerId,stage:CareerMission['stage']):string|null{
 const scene=CAREER_SCENES[career]
 return stage===0?scene.briefing:stage===1?scene.witness:stage===2?scene.evidence:null
}
export type InvestigationChoice='protect-witness'|'follow-lead'|'request-backup'
export const INVESTIGATION_CHOICES:Record<InvestigationChoice,{label:string;outcome:string}>={
 'protect-witness':{label:'Protect the witness',outcome:'The witness is safe, but the suspect has time to relocate.'},
 'follow-lead':{label:'Follow the lead',outcome:'A new lead emerges while the witness waits for assistance.'},
 'request-backup':{label:'Request backup',outcome:'A support team arrives, delaying the investigation but reducing risk.'}
}
const CHOICE_KEY='tryamm.streetverse.investigation-choice.v1'
export function saveInvestigationChoice(career:CareerId,choice:InvestigationChoice):void{
 try{localStorage.setItem(CHOICE_KEY,JSON.stringify({career,choice,updatedAt:new Date().toISOString()}))}catch{}
}
export function loadInvestigationChoice(career:CareerId):InvestigationChoice|null{
 try{
  const raw=localStorage.getItem(CHOICE_KEY);if(!raw)return null
  const saved=JSON.parse(raw)
  if(saved?.career!==career||typeof saved.choice!=='string'||!Object.prototype.hasOwnProperty.call(INVESTIGATION_CHOICES,saved.choice))return null
  return saved.choice as InvestigationChoice
 }catch{return null}
}
export function resolveInvestigationChoice(choice:InvestigationChoice):string{
 return INVESTIGATION_CHOICES[choice].outcome
}
export function loadCareerMission():CareerMission|null{
 try{const raw=localStorage.getItem(KEY);if(!raw)return null;const v=JSON.parse(raw);if(!v||typeof v!=='object'||typeof v.career!=='string'||!Object.prototype.hasOwnProperty.call(CAREER_MISSIONS,v.career)||![0,1,2,3].includes(v.stage)||typeof v.updatedAt!=='string')return null;return v}catch{return null}
}
export function advanceCareerMissionForEvent(mission:CareerMission,eventName:string):CareerMission{
 if(mission.stage>=3||eventName!==CONFIRMATION_EVENTS[mission.stage])return mission
 // Ignore stale events from a previous mission or another browser tab.
 const active=loadCareerMission()
 if(!active||active.career!==mission.career||active.stage!==mission.stage||active.updatedAt!==mission.updatedAt)return mission
 return advanceCareerMission(mission)
}
export function resetCareerMission():void{try{localStorage.removeItem(KEY);localStorage.removeItem(CHOICE_KEY)}catch{}}
export function startCareerMission(career:CareerId):CareerMission{
 const mission:CareerMission={career,stage:0,updatedAt:new Date().toISOString()}
 try{localStorage.setItem(KEY,JSON.stringify(mission));localStorage.removeItem(CHOICE_KEY)}catch{}
 return mission
}
export function getCareerMissionProgress(mission:CareerMission){
 return {title:CAREER_MISSIONS[mission.career].title,completed:mission.stage,total:3,finished:mission.stage===3,nextObjective:mission.stage===3?null:CAREER_MISSIONS[mission.career].steps[mission.stage]}
}
export function advanceCareerMission(mission:CareerMission):CareerMission{
 const active=loadCareerMission()
 if(!active||active.career!==mission.career||active.stage!==mission.stage||active.updatedAt!==mission.updatedAt||mission.stage>=3)return mission
 const next={...mission,stage:(mission.stage+1) as CareerMission['stage'],updatedAt:new Date().toISOString()}
 try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}
 return next
}
