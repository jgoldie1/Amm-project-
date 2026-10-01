export type QueueMetric={open:number;oldestMinutes:number;availableWorkers:number}
export function queueHealth(m:QueueMetric){if(m.open===0)return'clear';if(m.availableWorkers===0||m.oldestMinutes>60)return'critical';if(m.oldestMinutes>30||m.open>m.availableWorkers*5)return'busy';return'healthy'}
export const SUPERVISOR_DESK={liveQueue:true,unassigned:true,escalations:true,workerAvailability:true,shiftHandoff:true,qaReview:true,slaAlerts:true,trainingFlags:true} as const
