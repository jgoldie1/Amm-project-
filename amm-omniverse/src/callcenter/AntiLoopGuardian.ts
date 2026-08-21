export type CallSignal={intent:string;assistantText?:string;tool?:string;toolOk?:boolean;callerSentiment?:'calm'|'confused'|'frustrated'|'angry'|'distressed';silenceMs?:number;turn:number}
export type GuardianAction='continue'|'clarify-once'|'offer-choices'|'change-strategy'|'human-handoff'|'callback'|'safe-end'
export type GuardianDecision={action:GuardianAction;reason:string;mustOfferEscape:boolean;preserveContext:boolean}

export const HARD_ESCAPE_OPTIONS=['human agent','callback','text/chat','previous menu','start over','end call'] as const

const norm=(v='')=>v.toLowerCase().replace(/\s+/g,' ').trim()
export function detectLoop(history:CallSignal[]):GuardianDecision{
 const last=history.at(-1);if(!last)return{action:'continue',reason:'new conversation',mustOfferEscape:true,preserveContext:true}
 const intents=history.slice(-5).map(x=>norm(x.intent));const texts=history.slice(-5).map(x=>norm(x.assistantText));
 const repeatedIntent=intents.length>=3&&new Set(intents.slice(-3)).size===1
 const repeatedAnswer=texts.filter(Boolean).length>=3&&new Set(texts.filter(Boolean).slice(-3)).size===1
 const toolFailures=history.slice(-4).filter(x=>x.tool&&x.toolOk===false).length>=2
 const frustration=history.slice(-3).some(x=>x.callerSentiment==='frustrated'||x.callerSentiment==='angry')
 const longSilence=(last.silenceMs||0)>=12000
 if(last.callerSentiment==='distressed')return{action:'human-handoff',reason:'distress signal requires immediate escalation',mustOfferEscape:true,preserveContext:true}
 if(frustration&&(repeatedIntent||repeatedAnswer||toolFailures))return{action:'human-handoff',reason:'frustration plus repeated failure',mustOfferEscape:true,preserveContext:true}
 if(toolFailures)return{action:'change-strategy',reason:'same tool path failed repeatedly',mustOfferEscape:true,preserveContext:true}
 if(repeatedAnswer)return{action:'offer-choices',reason:'assistant answer repeated',mustOfferEscape:true,preserveContext:true}
 if(repeatedIntent)return{action:'change-strategy',reason:'caller intent repeated without resolution',mustOfferEscape:true,preserveContext:true}
 if(longSilence)return{action:'offer-choices',reason:'extended silence',mustOfferEscape:true,preserveContext:true}
 if(last.turn>=12)return{action:'offer-choices',reason:'long unresolved session',mustOfferEscape:true,preserveContext:true}
 return{action:'continue',reason:'no loop detected',mustOfferEscape:true,preserveContext:true}
}

export const CALL_CENTER_POLICY={
 maxClarifySameIntent:1,
 maxSameStrategyFailures:2,
 maxTurnsBeforeExplicitEscapeOffer:6,
 escalationContext:['caller goal','verified identity state','consents','steps already tried','tool results','open case/order/reference','requested language','accessibility preferences'],
 neverDo:['force caller to repeat known information','hide human escalation','pretend a tool succeeded','re-run the same failing action indefinitely','transfer without context','end a distressed call with a sales CTA'],
 recovery:['summarize what TRYAMM understood','state what failed in plain language','offer 2-3 concrete next choices','preserve transcript/context for handoff','create callback/task only with consent'],
} as const

export const CALL_CENTER_ROUTE='CALL → IDENTIFY INTENT → ROUTE VERTICAL → ATTEMPT RESOLUTION → LOOP GUARDIAN → CHANGE STRATEGY OR HUMAN/CALLBACK → PRESERVE CONTEXT → CONFIRM OUTCOME → CONSENT-AWARE FOLLOW-UP'
