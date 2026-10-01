export type WorkRole='ticket-agent'|'youth-stream-admin'|'moderator'|'creator-support'|'business-onboarding'|'ai-call-center'|'qa-tester'
export type WorkState='available'|'assigned'|'working'|'needs-help'|'review'|'completed'|'cancelled'
export type WorkItem={id:string;role:WorkRole;state:WorkState;priority:1|2|3|4|5;assigneeId?:string;createdAt:number;dueAt?:number;skills:string[];youthLane?:boolean}
export const MIDDLEVERSE_WORKFLOW={singleInbox:true,skillRouting:true,availabilityRouting:true,priorityRouting:true,oneHandUi:true,voiceAssist:true,captions:true,translation:true,aiTriage:true,humanEscalation:true,shiftHandoff:true,qaSampling:true,auditTrail:true,serverTimekeeping:true,noClientSelfReportedPay:true,noAiFinalSensitiveDecision:true} as const
export function eligible(w:WorkItem,worker:{roles:WorkRole[];skills:string[];adult:boolean}){if(w.youthLane&&!worker.adult)return false;return worker.roles.includes(w.role)&&w.skills.every(s=>worker.skills.includes(s))}
export function nextState(s:WorkState):WorkState{return s==='available'?'assigned':s==='assigned'?'working':s==='working'?'review':s==='review'?'completed':s}
