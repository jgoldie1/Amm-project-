import { authorizeAgentAction, type AgentGrant } from '../security/trustCore';

export type CompanyAgentRole = 'chief_of_staff'|'strategy'|'engineering'|'marketing'|'sales'|'support'|'operations'|'finance'|'hr'|'procurement'|'grants'|'creator'|'delivery'|'security';
export type GoalStatus = 'proposed'|'approved'|'active'|'blocked'|'completed'|'cancelled';
export type TaskRisk = 'low'|'medium'|'high'|'regulated';

export type CompanyGoal = { id:string; title:string; metric?:string; target?:number; status:GoalStatus; priority:number; ownerAgent?:CompanyAgentRole; dueAt?:string };
export type CompanySignal = { id:string; kind:'customer'|'sales'|'inventory'|'delivery'|'security'|'finance'|'hr'|'grant'|'market'|'product'; summary:string; severity:'info'|'attention'|'critical'; observedAt:string; evidenceRefs:string[] };
export type AdaptiveTask = { id:string; companyId:string; role:CompanyAgentRole; title:string; action:string; risk:TaskRisk; status:'queued'|'working'|'awaiting_approval'|'done'|'failed'; evidenceRefs:string[]; createdAt:string };

export type CompanyMemory = {
  companyId:string;
  mission:string;
  policies:string[];
  approvedFacts:Record<string,string>;
  goals:CompanyGoal[];
  lessons:{ observation:string; change:string; evidenceRefs:string[]; recordedAt:string }[];
};

export function planAdaptiveWork(memory:CompanyMemory, signals:CompanySignal[]):AdaptiveTask[] {
  return signals
    .filter(s => s.severity !== 'info')
    .map((s, i) => ({
      id:`task-${s.id}-${i}`, companyId:memory.companyId,
      role: s.kind === 'security' ? 'security' : s.kind === 'delivery' ? 'delivery' : s.kind === 'hr' ? 'hr' : s.kind === 'grant' ? 'grants' : s.kind === 'inventory' ? 'procurement' : s.kind === 'finance' ? 'finance' : 'operations',
      title:`Respond to ${s.kind} signal`, action:s.summary,
      risk: s.severity === 'critical' ? 'high' : 'medium', status:'queued', evidenceRefs:s.evidenceRefs,
      createdAt:new Date().toISOString(),
    }));
}

export function gateCompanyAgentTask(task:AdaptiveTask, grant:AgentGrant) {
  const decision = authorizeAgentAction(grant, task.action);
  if (task.risk === 'high' || task.risk === 'regulated') {
    return { ...decision, requiresHumanApproval:true, reason:`${decision.reason} High-impact business task requires approval.` };
  }
  return decision;
}

export type AdaptationProposal = {
  id:string; companyId:string; observation:string; proposedChange:string;
  expectedMetric?:string; evidenceRefs:string[]; reversible:boolean;
  status:'proposed'|'approved'|'rejected'|'experiment'|'adopted'|'rolled_back';
};

export function proposeAdaptation(companyId:string, observation:string, proposedChange:string, evidenceRefs:string[]=[]):AdaptationProposal {
  return { id:`adapt-${Date.now()}`, companyId, observation, proposedChange, evidenceRefs, reversible:true, status:'proposed' };
}

// Adaptive does not mean unrestricted self-modification. Changes are proposed, measured,
// approved according to risk, evaluated, and rolled back when evidence worsens outcomes.
