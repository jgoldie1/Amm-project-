export const MIDDLEVERSE_AI_COPILOT={summarize:true,translate:true,classify:true,suggestReply:true,suggestKnowledgeArticle:true,detectDuplicate:true,flagSafety:true,routeBySkill:true,voiceDictation:true,readAloud:true,autoCloseSensitive:false,autonomousPayDecision:false,autonomousBan:false} as const
export type CopilotAction='draft'|'translate'|'summarize'|'route'|'escalate'
export function copilotAllowed(a:CopilotAction){return ['draft','translate','summarize','route','escalate'].includes(a)}
