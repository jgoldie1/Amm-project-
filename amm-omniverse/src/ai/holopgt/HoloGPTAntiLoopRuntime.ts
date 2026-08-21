export type HoloTurn={user:string;assistant:string;intent?:string;tool?:string;toolOk?:boolean;timestamp?:string}
export type HoloLoopDecision={state:'ok'|'warn'|'change-strategy'|'escalate';reason:string;next:string[];preserveContext:boolean}
const n=(v='')=>v.toLowerCase().replace(/\s+/g,' ').trim()
const similarity=(a:string,b:string)=>{const A=new Set(n(a).split(' ').filter(Boolean)),B=new Set(n(b).split(' ').filter(Boolean));if(!A.size||!B.size)return 0;let same=0;for(const x of A)if(B.has(x))same++;return same/Math.max(A.size,B.size)}
export function evaluateHoloLoop(history:HoloTurn[]):HoloLoopDecision{
 const last=history[history.length-1];if(!last)return{state:'ok',reason:'new session',next:['answer task directly'],preserveContext:true}
 const recent=history.slice(-6)
 const repeatedIntent=recent.length>=3&&new Set(recent.slice(-3).map(x=>n(x.intent||x.user))).size===1
 const repeatedAnswer=recent.length>=3&&recent.slice(-3).every((x,i,a)=>i===0||similarity(x.assistant,a[i-1].assistant)>.82)
 const sameToolFails=recent.filter(x=>x.tool&&x.toolOk===false).length>=2
 const userLoopComplaint=/loop|repeat|same thing|annoying|keep saying|stuck/i.test(last.user)
 if(userLoopComplaint)return{state:'change-strategy',reason:'user reports repetition',next:['summarize completed state once','name only the missing delta','perform the next executable action','do not repeat prior roadmap'],preserveContext:true}
 if(sameToolFails)return{state:'escalate',reason:'tool path failed repeatedly',next:['stop retrying same tool path','use alternate implementation or surface exact blocker','preserve tool/error context'],preserveContext:true}
 if(repeatedAnswer||repeatedIntent)return{state:'change-strategy',reason:repeatedAnswer?'answer repetition':'intent unresolved',next:['state what changed since last turn','take one concrete action','offer at most 3 next branches only if needed'],preserveContext:true}
 return{state:'ok',reason:'no loop signal',next:['continue task'],preserveContext:true}
}

export const HOLOGPT_ANTI_LOOP_POLICY={
 maxSameClarification:1,
 maxSameToolFailure:2,
 maxRoadmapRepeat:1,
 rules:[
  'Do not restate a full architecture when the user asked to continue.',
  'Track completed, in-progress, blocked and next-action state separately.',
  'On loop complaint, acknowledge once and change strategy immediately.',
  'Never ask again for information already present in session/project state.',
  'When a tool fails twice for the same reason, stop blind retries and switch path.',
  'Prefer executable delta over another design summary.',
  'Preserve context during handoff/escalation so the user does not repeat themselves.',
 ],
 contextKeys:['current-branch','last-green-commit','completed-modules','failed-checks','open-provider-gates','user-requested-next-action'],
} as const
